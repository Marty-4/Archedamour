import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi, apiError, apiSuccess, getDefaultChurchId } from "@/lib/admin-api";

// GET /api/admin/dons - Liste des dons
export async function GET() {
  const user = await requireAdminApi();
  if (!user) return apiError("Non autorisé", 401);

  const items = await db.donation.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });
  return apiSuccess(items);
}

// POST /api/admin/dons - Créer un don
export async function POST(request: NextRequest) {
  const user = await requireAdminApi();
  if (!user) return apiError("Non autorisé", 401);

  try {
    const body = await request.json();
    const { userId, amount, currency, method, categoryId, status, notes, paymentDate } = body;

    if (!userId || !amount || !categoryId) {
      return apiError("Utilisateur, catégorie et montant sont requis");
    }

    const churchId = await getDefaultChurchId();
    if (!churchId) return apiError("Aucune église configurée", 500);

    // Vérifie que la catégorie existe bien pour éviter une erreur Prisma P2003.
    const category = await db.donationCategory.findFirst({
      where: { id: categoryId, churchId },
      select: { id: true },
    });
    if (!category) return apiError("Catégorie de don introuvable", 400);

    const item = await db.donation.create({
      data: {
        userId,
        churchId,
        categoryId,
        amount: Number(amount),
        currency: currency ?? "XAF",
        method: method ?? "cash",
        status: status ?? "COMPLETED",
        notes: notes ?? null,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      },
    });
    return apiSuccess(item, 201);
  } catch (error) {
    return apiError("Erreur lors de la création du don", 500);
  }
}

// PUT /api/admin/dons - Mettre à jour un don
export async function PUT(request: NextRequest) {
  const user = await requireAdminApi();
  if (!user) return apiError("Non autorisé", 401);

  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) return apiError("ID requis");

    const item = await db.donation.update({
      where: { id },
      data: {
        ...data,
        ...(data.amount ? { amount: Number(data.amount) } : {}),
        ...(data.paymentDate ? { paymentDate: new Date(data.paymentDate) } : {}),
      },
    });
    return apiSuccess(item);
  } catch (error) {
    return apiError("Erreur lors de la mise à jour du don", 500);
  }
}

// DELETE /api/admin/dons - Supprimer un don
export async function DELETE(request: NextRequest) {
  const user = await requireAdminApi();
  if (!user) return apiError("Non autorisé", 401);

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return apiError("ID requis");

    await db.donation.delete({ where: { id } });
    return apiSuccess({ deleted: true });
  } catch (error) {
    return apiError("Erreur lors de la suppression du don", 500);
  }
}