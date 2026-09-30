import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi, apiError, apiSuccess, getDefaultChurchId } from "@/lib/admin-api";

// GET /api/admin/membres - Liste des membres
export async function GET() {
  const user = await requireAdminApi();
  if (!user) return apiError("Non autorisé", 401);

  const items = await db.memberProfile.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true, department: true },
  });
  return apiSuccess(items);
}

// POST /api/admin/membres - Créer un membre
export async function POST(request: NextRequest) {
  const user = await requireAdminApi();
  if (!user) return apiError("Non autorisé", 401);

  try {
    const body = await request.json();
    const { userId, firstName, lastName, phone, birthDate, gender, address, city, membershipDate, baptismDate, maritalStatus, departmentId, groupId, bio, notes, status } = body;

    if (!userId || !firstName || !lastName) {
      return apiError("Utilisateur, prénom et nom sont requis");
    }

    const churchId = await getDefaultChurchId();
    if (!churchId) return apiError("Aucune église configurée", 500);

    const item = await db.memberProfile.create({
      data: {
        userId,
        churchId,
        firstName,
        lastName,
        phone,
        birthDate: birthDate ? new Date(birthDate) : null,
        gender,
        address,
        city,
        membershipDate: membershipDate ? new Date(membershipDate) : null,
        baptismDate: baptismDate ? new Date(baptismDate) : null,
        maritalStatus,
        departmentId,
        groupId,
        bio,
        notes,
        status: status ?? "ACTIVE",
      },
    });
    return apiSuccess(item, 201);
  } catch (error) {
    return apiError("Erreur lors de la création du membre", 500);
  }
}

// PUT /api/admin/membres - Mettre à jour un membre
export async function PUT(request: NextRequest) {
  const user = await requireAdminApi();
  if (!user) return apiError("Non autorisé", 401);

  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) return apiError("ID requis");

    const item = await db.memberProfile.update({
      where: { id },
      data: {
        ...data,
        ...(data.birthDate ? { birthDate: new Date(data.birthDate) } : {}),
        ...(data.membershipDate ? { membershipDate: new Date(data.membershipDate) } : {}),
        ...(data.baptismDate ? { baptismDate: new Date(data.baptismDate) } : {}),
      },
    });
    return apiSuccess(item);
  } catch (error) {
    return apiError("Erreur lors de la mise à jour du membre", 500);
  }
}

// DELETE /api/admin/membres - Supprimer un membre
export async function DELETE(request: NextRequest) {
  const user = await requireAdminApi();
  if (!user) return apiError("Non autorisé", 401);

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return apiError("ID requis");

    await db.memberProfile.delete({ where: { id } });
    return apiSuccess({ deleted: true });
  } catch (error) {
    return apiError("Erreur lors de la suppression du membre", 500);
  }
}