import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi, apiError, apiSuccess, getDefaultChurchId } from "@/lib/admin-api";

// GET /api/admin/groupes - Liste des groupes
export async function GET() {
  const user = await requireAdminApi();
  if (!user) return apiError("Non autorisé", 401);

  const items = await db.group.findMany({
    orderBy: { createdAt: "desc" },
    include: { leader: true, _count: { select: { members: true } } },
  });
  return apiSuccess(items);
}

// POST /api/admin/groupes - Créer un groupe
export async function POST(request: NextRequest) {
  const user = await requireAdminApi();
  if (!user) return apiError("Non autorisé", 401);

  try {
    const body = await request.json();
    const { name, description, leaderId, meetingDay, meetingTime, location, maxSize, status } = body;

    if (!name) return apiError("Nom requis");

    const churchId = await getDefaultChurchId();
    if (!churchId) return apiError("Aucune église configurée", 500);

    const item = await db.group.create({
      data: {
        churchId,
        name,
        description,
        leaderId,
        meetingDay,
        meetingTime,
        location,
        maxSize: maxSize ? Number(maxSize) : null,
        status: status ?? "ACTIVE",
      },
    });
    return apiSuccess(item, 201);
  } catch (error) {
    return apiError("Erreur lors de la création du groupe", 500);
  }
}

// PUT /api/admin/groupes - Mettre à jour un groupe
export async function PUT(request: NextRequest) {
  const user = await requireAdminApi();
  if (!user) return apiError("Non autorisé", 401);

  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) return apiError("ID requis");

    const item = await db.group.update({
      where: { id },
      data: {
        ...data,
        ...(data.maxSize ? { maxSize: Number(data.maxSize) } : {}),
      },
    });
    return apiSuccess(item);
  } catch (error) {
    return apiError("Erreur lors de la mise à jour du groupe", 500);
  }
}

// DELETE /api/admin/groupes - Supprimer un groupe
export async function DELETE(request: NextRequest) {
  const user = await requireAdminApi();
  if (!user) return apiError("Non autorisé", 401);

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return apiError("ID requis");

    await db.group.delete({ where: { id } });
    return apiSuccess({ deleted: true });
  } catch (error) {
    return apiError("Erreur lors de la suppression du groupe", 500);
  }
}