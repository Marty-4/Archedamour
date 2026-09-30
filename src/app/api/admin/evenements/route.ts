import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi, apiError, apiSuccess, getDefaultChurchId } from "@/lib/admin-api";

// GET /api/admin/evenements - Liste des événements
export async function GET() {
  const user = await requireAdminApi();
  if (!user) return apiError("Non autorisé", 401);

  const items = await db.event.findMany({
    orderBy: { date: "desc" },
    include: { _count: { select: { registrations: true } } },
  });
  return apiSuccess(items);
}

// POST /api/admin/evenements - Créer un événement
export async function POST(request: NextRequest) {
  const user = await requireAdminApi();
  if (!user) return apiError("Non autorisé", 401);

  try {
    const body = await request.json();
    const { title, description, image, date, startTime, endTime, location, organizerId, maxParticipants, status, registrationDeadline } = body;

    if (!title || !date) {
      return apiError("Titre et date sont requis");
    }

    const churchId = await getDefaultChurchId();
    if (!churchId) return apiError("Aucune église configurée", 500);

    const item = await db.event.create({
      data: {
        churchId,
        title,
        description,
        image,
        date: new Date(date),
        startTime: new Date(startTime ?? date),
        endTime: new Date(endTime ?? date),
        location,
        organizerId,
        maxParticipants: maxParticipants ? Number(maxParticipants) : null,
        status: status ?? "DRAFT",
        registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
      },
    });
    return apiSuccess(item, 201);
  } catch (error) {
    return apiError("Erreur lors de la création de l'événement", 500);
  }
}

// PUT /api/admin/evenements - Mettre à jour un événement
export async function PUT(request: NextRequest) {
  const user = await requireAdminApi();
  if (!user) return apiError("Non autorisé", 401);

  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) return apiError("ID requis");

    const item = await db.event.update({
      where: { id },
      data: {
        ...data,
        ...(data.date ? { date: new Date(data.date) } : {}),
        ...(data.startTime ? { startTime: new Date(data.startTime) } : {}),
        ...(data.endTime ? { endTime: new Date(data.endTime) } : {}),
        ...(data.registrationDeadline ? { registrationDeadline: new Date(data.registrationDeadline) } : {}),
        ...(data.maxParticipants ? { maxParticipants: Number(data.maxParticipants) } : {}),
      },
    });
    return apiSuccess(item);
  } catch (error) {
    return apiError("Erreur lors de la mise à jour de l'événement", 500);
  }
}

// DELETE /api/admin/evenements - Supprimer un événement
export async function DELETE(request: NextRequest) {
  const user = await requireAdminApi();
  if (!user) return apiError("Non autorisé", 401);

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return apiError("ID requis");

    await db.event.delete({ where: { id } });
    return apiSuccess({ deleted: true });
  } catch (error) {
    return apiError("Erreur lors de la suppression de l'événement", 500);
  }
}