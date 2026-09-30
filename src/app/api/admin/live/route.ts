import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi, apiError, apiSuccess, getDefaultChurchId } from "@/lib/admin-api";

// GET /api/admin/live - Liste des diffusions
export async function GET() {
  const user = await requireAdminApi();
  if (!user) return apiError("Non autorisé", 401);

  const items = await db.liveStream.findMany({
    orderBy: { scheduledStart: "desc" },
  });
  return apiSuccess(items);
}

// POST /api/admin/live - Créer une diffusion
export async function POST(request: NextRequest) {
  const user = await requireAdminApi();
  if (!user) return apiError("Non autorisé", 401);

  try {
    const body = await request.json();
    const { title, description, thumbnail, platform, mediaType, streamKey, streamUrl, status, scheduledStart, scheduledEnd, actualStart } = body;

    if (!title) {
      return apiError("Titre requis");
    }

    const churchId = await getDefaultChurchId();
    if (!churchId) return apiError("Aucune église configurée", 500);

    const item = await db.liveStream.create({
      data: {
        churchId,
        title,
        description,
        thumbnail,
        platform: platform ?? "INTERNAL",
        mediaType: mediaType ?? "VIDEO",
        streamKey,
        streamUrl,
        status: status ?? "SCHEDULED",
        scheduledStart: scheduledStart ? new Date(scheduledStart) : null,
        scheduledEnd: scheduledEnd ? new Date(scheduledEnd) : null,
        actualStart: actualStart ? new Date(actualStart) : null,
      },
    });

    // Direct lancé immédiatement → notification DB à tous les membres actifs
    // (badge/cloche) ; le toast temps réel part via WS (admin:live:status).
    if (item.status === "LIVE") {
      try {
        const members = await db.user.findMany({
          where: { status: "ACTIVE" },
          select: { id: true },
        });
        await db.notification.createMany({
          data: members.map((member) => ({
            userId: member.id,
            churchId,
            type: "LIVE_STARTED" as const,
            title: "🔴 Un direct est en cours",
            message: `« ${item.title} » est en direct maintenant.`,
            actionUrl: "/member/live",
          })),
        });
      } catch {
        // Jamais bloquant pour le lancement du direct.
      }
    }

    return apiSuccess(item, 201);
  } catch (error) {
    return apiError("Erreur lors de la création de la diffusion", 500);
  }
}

// PUT /api/admin/live - Mettre à jour une diffusion
export async function PUT(request: NextRequest) {
  const user = await requireAdminApi();
  if (!user) return apiError("Non autorisé", 401);

  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) return apiError("ID requis");

    const item = await db.liveStream.update({
      where: { id },
      data: {
        ...data,
        ...(data.scheduledStart ? { scheduledStart: new Date(data.scheduledStart) } : {}),
        ...(data.scheduledEnd ? { scheduledEnd: new Date(data.scheduledEnd) } : {}),
        ...(data.actualStart ? { actualStart: new Date(data.actualStart) } : {}),
        ...(data.actualEnd ? { actualEnd: new Date(data.actualEnd) } : {}),
      },
    });
    return apiSuccess(item);
  } catch (error) {
    return apiError("Erreur lors de la mise à jour de la diffusion", 500);
  }
}

// DELETE /api/admin/live - Supprimer une diffusion
export async function DELETE(request: NextRequest) {
  const user = await requireAdminApi();
  if (!user) return apiError("Non autorisé", 401);

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return apiError("ID requis");

    await db.liveStream.delete({ where: { id } });
    return apiSuccess({ deleted: true });
  } catch (error) {
    return apiError("Erreur lors de la suppression de la diffusion", 500);
  }
}