import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi, apiError, apiSuccess, getDefaultChurchId } from "@/lib/admin-api";

// GET /api/admin/prieres - Liste des demandes de prière
export async function GET() {
  const user = await requireAdminApi();
  if (!user) return apiError("Non autorisé", 401);

  const items = await db.prayerRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });
  return apiSuccess(items);
}

// POST /api/admin/prieres - Créer une demande de prière
export async function POST(request: NextRequest) {
  const user = await requireAdminApi();
  if (!user) return apiError("Non autorisé", 401);

  try {
    const body = await request.json();
    const { userId, title, description, category, visibility, isAnswered, answeredAt } = body;

    if (!userId || !title) {
      return apiError("Utilisateur et titre sont requis");
    }

    const churchId = await getDefaultChurchId();
    if (!churchId) return apiError("Aucune église configurée", 500);

    const item = await db.prayerRequest.create({
      data: {
        userId,
        churchId,
        title,
        description: description ?? null,
        category: category ?? "OTHER",
        visibility: visibility ?? "COMMUNITY",
        isAnswered: isAnswered ?? false,
        answeredAt: answeredAt ? new Date(answeredAt) : null,
      },
    });
    return apiSuccess(item, 201);
  } catch (error) {
    return apiError("Erreur lors de la création de la demande de prière", 500);
  }
}

// PUT /api/admin/prieres - Mettre à jour une demande de prière
export async function PUT(request: NextRequest) {
  const user = await requireAdminApi();
  if (!user) return apiError("Non autorisé", 401);

  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) return apiError("ID requis");

    // Le formulaire envoie les booléens sous forme de chaînes ("true"/"false").
    const isAnswered =
      data.isAnswered === undefined ? undefined : data.isAnswered === "true" || data.isAnswered === true;

    const item = await db.prayerRequest.update({
      where: { id },
      data: {
        ...data,
        ...(isAnswered !== undefined ? { isAnswered } : {}),
        ...(data.answeredAt ? { answeredAt: new Date(data.answeredAt) } : {}),
        ...(isAnswered !== undefined ? { answeredAt: isAnswered ? new Date() : null } : {}),
      },
    });
    return apiSuccess(item);
  } catch (error) {
    return apiError("Erreur lors de la mise à jour de la demande de prière", 500);
  }
}

// DELETE /api/admin/prieres - Supprimer une demande de prière
export async function DELETE(request: NextRequest) {
  const user = await requireAdminApi();
  if (!user) return apiError("Non autorisé", 401);

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return apiError("ID requis");

    await db.prayerRequest.delete({ where: { id } });
    return apiSuccess({ deleted: true });
  } catch (error) {
    return apiError("Erreur lors de la suppression de la demande de prière", 500);
  }
}