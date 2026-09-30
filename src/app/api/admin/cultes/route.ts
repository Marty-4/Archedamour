import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi, apiError, apiSuccess, getDefaultChurchId } from "@/lib/admin-api";

// GET /api/admin/cultes - Liste des cultes
export async function GET() {
  const user = await requireAdminApi();
  if (!user) return apiError("Non autorisé", 401);

  const items = await db.service.findMany({
    orderBy: { date: "desc" },
    include: { preacher: true },
  });
  return apiSuccess(items);
}

// POST /api/admin/cultes - Créer un culte
export async function POST(request: NextRequest) {
  const user = await requireAdminApi();
  if (!user) return apiError("Non autorisé", 401);

  try {
    const body = await request.json();
    const { title, description, type, date, startTime, endTime, location, preacherId, status, liveUrl } = body;

    if (!title || !type || !date) {
      return apiError("Titre, type et date sont requis");
    }

    const churchId = await getDefaultChurchId();
    if (!churchId) return apiError("Aucune église configurée", 500);

    const item = await db.service.create({
      data: {
        churchId,
        title,
        description,
        type,
        date: new Date(date),
        startTime: new Date(startTime ?? date),
        endTime: new Date(endTime ?? date),
        location,
        preacherId,
        status: status ?? "SCHEDULED",
        liveUrl,
      },
    });
    return apiSuccess(item, 201);
  } catch (error) {
    return apiError("Erreur lors de la création du culte", 500);
  }
}

// PUT /api/admin/cultes - Mettre à jour un culte
export async function PUT(request: NextRequest) {
  const user = await requireAdminApi();
  if (!user) return apiError("Non autorisé", 401);

  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) return apiError("ID requis");

    const item = await db.service.update({
      where: { id },
      data: {
        ...data,
        ...(data.date ? { date: new Date(data.date) } : {}),
        ...(data.startTime ? { startTime: new Date(data.startTime) } : {}),
        ...(data.endTime ? { endTime: new Date(data.endTime) } : {}),
      },
    });
    return apiSuccess(item);
  } catch (error) {
    return apiError("Erreur lors de la mise à jour du culte", 500);
  }
}

// DELETE /api/admin/cultes - Supprimer un culte
export async function DELETE(request: NextRequest) {
  const user = await requireAdminApi();
  if (!user) return apiError("Non autorisé", 401);

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return apiError("ID requis");

    await db.service.delete({ where: { id } });
    return apiSuccess({ deleted: true });
  } catch (error) {
    return apiError("Erreur lors de la suppression du culte", 500);
  }
}