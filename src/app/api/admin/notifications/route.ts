import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi, apiError, apiSuccess } from "@/lib/admin-api";

// GET /api/admin/notifications - Liste des notifications
export async function GET() {
  const user = await requireAdminApi();
  if (!user) return apiError("Non autorisé", 401);

  const items = await db.notification.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });
  return apiSuccess(items);
}

// POST /api/admin/notifications - Créer une notification
export async function POST(request: NextRequest) {
  const user = await requireAdminApi();
  if (!user) return apiError("Non autorisé", 401);

  try {
    const body = await request.json();
    const { userId, type, title, message, data, actionUrl } = body;

    if (!userId || !type || !title || !message) {
      return apiError("Utilisateur, type, titre et message sont requis");
    }

    const item = await db.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data: data ? JSON.stringify(data) : null,
        actionUrl,
      },
    });
    return apiSuccess(item, 201);
  } catch (error) {
    return apiError("Erreur lors de la création de la notification", 500);
  }
}

// PUT /api/admin/notifications - Mettre à jour une notification
export async function PUT(request: NextRequest) {
  const user = await requireAdminApi();
  if (!user) return apiError("Non autorisé", 401);

  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) return apiError("ID requis");

    const item = await db.notification.update({
      where: { id },
      data: {
        ...data,
        ...(data.data ? { data: JSON.stringify(data.data) } : {}),
      },
    });
    return apiSuccess(item);
  } catch (error) {
    return apiError("Erreur lors de la mise à jour de la notification", 500);
  }
}

// DELETE /api/admin/notifications - Supprimer une notification
export async function DELETE(request: NextRequest) {
  const user = await requireAdminApi();
  if (!user) return apiError("Non autorisé", 401);

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return apiError("ID requis");

    await db.notification.delete({ where: { id } });
    return apiSuccess({ deleted: true });
  } catch (error) {
    return apiError("Erreur lors de la suppression de la notification", 500);
  }
}