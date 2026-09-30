import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi, apiError, apiSuccess, getDefaultChurchId } from "@/lib/admin-api";

// GET /api/admin/departements - Liste des départements
export async function GET() {
  const user = await requireAdminApi();
  if (!user) return apiError("Non autorisé", 401);

  const items = await db.department.findMany({
    orderBy: { order: "asc" },
    include: { head: true, _count: { select: { members: true } } },
  });
  return apiSuccess(items);
}

// POST /api/admin/departements - Créer un département
export async function POST(request: NextRequest) {
  const user = await requireAdminApi();
  if (!user) return apiError("Non autorisé", 401);

  try {
    const body = await request.json();
    const { name, description, color, headId, status, order } = body;

    if (!name) return apiError("Nom requis");

    const churchId = await getDefaultChurchId();
    if (!churchId) return apiError("Aucune église configurée", 500);

    const item = await db.department.create({
      data: {
        churchId,
        name,
        description,
        color,
        headId,
        status: status ?? "ACTIVE",
        order: order ? Number(order) : 0,
      },
    });
    return apiSuccess(item, 201);
  } catch (error) {
    return apiError("Erreur lors de la création du département", 500);
  }
}

// PUT /api/admin/departements - Mettre à jour un département
export async function PUT(request: NextRequest) {
  const user = await requireAdminApi();
  if (!user) return apiError("Non autorisé", 401);

  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) return apiError("ID requis");

    const item = await db.department.update({
      where: { id },
      data: {
        ...data,
        ...(data.order ? { order: Number(data.order) } : {}),
      },
    });
    return apiSuccess(item);
  } catch (error) {
    return apiError("Erreur lors de la mise à jour du département", 500);
  }
}

// DELETE /api/admin/departements - Supprimer un département
export async function DELETE(request: NextRequest) {
  const user = await requireAdminApi();
  if (!user) return apiError("Non autorisé", 401);

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return apiError("ID requis");

    await db.department.delete({ where: { id } });
    return apiSuccess({ deleted: true });
  } catch (error) {
    return apiError("Erreur lors de la suppression du département", 500);
  }
}