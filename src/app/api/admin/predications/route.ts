import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi, apiError, apiSuccess, getDefaultChurchId } from "@/lib/admin-api";

// GET /api/admin/predications - Liste des prédications
export async function GET() {
  const user = await requireAdminApi();
  if (!user) return apiError("Non autorisé", 401);

  const items = await db.sermon.findMany({
    orderBy: { date: "desc" },
    include: { preacher: true, recordedBy: { select: { id: true, name: true } } },
  });
  return apiSuccess(items);
}

// POST /api/admin/predications - Créer une prédication
export async function POST(request: NextRequest) {
  const user = await requireAdminApi();
  if (!user) return apiError("Non autorisé", 401);

  try {
    const body = await request.json();
    const { title, description, preacherId, date, categoryId, seriesId, verse, thumbnail, videoUrl, audioUrl, documentUrl, duration, type, downloadsAllowed } = body;

    if (!title || !preacherId || !date) {
      return apiError("Titre, prédicateur et date sont requis");
    }

    const churchId = await getDefaultChurchId();
    if (!churchId) return apiError("Aucune église configurée", 500);

    const item = await db.sermon.create({
      data: {
        churchId,
        title,
        description,
        preacherId,
        date: new Date(date),
        categoryId,
        seriesId,
        verse,
        thumbnail,
        videoUrl,
        audioUrl,
        documentUrl,
        duration: duration ? Number(duration) : null,
        type: type ?? "TEXT",
        downloadsAllowed: downloadsAllowed ?? true,
        // « Enregistré avec le micro » par l'admin connecté (flag envoyé par
        // le formulaire quand le composant MicroRecorder a produit l'audio).
        recordedById:
          body.recorded === "true" && audioUrl ? user.id : null,
      },
    });

    // Notification « nouvelle prédication audio » à tous les membres actifs
    // de l'église (badge + cloche de l'app).
    if (item.audioUrl) {
      try {
        const members = await db.user.findMany({
          where: { status: "ACTIVE" },
          select: { id: true },
        });
        await db.notification.createMany({
          data: members.map((member) => ({
            userId: member.id,
            churchId,
            type: "NEW_SERMON" as const,
            title: "Nouvelle prédication audio",
            message: `« ${item.title} » est maintenant disponible en écoute.`,
            actionUrl: "/member/predications",
          })),
        });
      } catch {
        // La notification ne doit jamais bloquer la publication.
      }
    }

    return apiSuccess(item, 201);
  } catch (error) {
    return apiError("Erreur lors de la création de la prédication", 500);
  }
}

// PUT /api/admin/predications - Mettre à jour une prédication
export async function PUT(request: NextRequest) {
  const user = await requireAdminApi();
  if (!user) return apiError("Non autorisé", 401);

  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) return apiError("ID requis");

    // Le formulaire envoie les booléens sous forme de chaînes ("true"/"false").
    const downloadsAllowed =
      data.downloadsAllowed === undefined
        ? undefined
        : data.downloadsAllowed === "true" || data.downloadsAllowed === true;

    const item = await db.sermon.update({
      where: { id },
      data: {
        ...data,
        ...(downloadsAllowed !== undefined ? { downloadsAllowed } : {}),
        ...(data.date ? { date: new Date(data.date) } : {}),
        ...(data.duration ? { duration: Number(data.duration) } : {}),
      },
    });
    return apiSuccess(item);
  } catch (error) {
    return apiError("Erreur lors de la mise à jour de la prédication", 500);
  }
}

// DELETE /api/admin/predications - Supprimer une prédication
export async function DELETE(request: NextRequest) {
  const user = await requireAdminApi();
  if (!user) return apiError("Non autorisé", 401);

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return apiError("ID requis");

    await db.sermon.delete({ where: { id } });
    return apiSuccess({ deleted: true });
  } catch (error) {
    return apiError("Erreur lors de la suppression de la prédication", 500);
  }
}