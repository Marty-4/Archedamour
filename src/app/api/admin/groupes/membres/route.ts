import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdminApi, apiError, apiSuccess } from "@/lib/admin-api";

// GET /api/admin/groupes/membres?groupId=... - Membres d'un groupe
export async function GET(request: NextRequest) {
  const user = await requireAdminApi();
  if (!user) return apiError("Non autorisé", 401);

  const groupId = new URL(request.url).searchParams.get("groupId");
  if (!groupId) return apiError("groupId requis");

  const group = await db.group.findUnique({
    where: { id: groupId },
    select: { id: true, name: true },
  });
  if (!group) return apiError("Groupe introuvable", 404);

  const members = await db.groupMember.findMany({
    where: { groupId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          status: true,
          memberProfile: { select: { firstName: true, lastName: true, phone: true } },
        },
      },
    },
    orderBy: [{ role: "asc" }, { joinedAt: "desc" }],
  });

  return apiSuccess({
    group,
    members: members.map((m) => ({
      id: m.id,
      role: m.role,
      joinedAt: m.joinedAt,
      user: {
        id: m.user.id,
        name: m.user.memberProfile
          ? `${m.user.memberProfile.firstName} ${m.user.memberProfile.lastName}`.trim()
          : m.user.name,
        email: m.user.email,
        avatar: m.user.avatar,
        status: m.user.status,
        phone: m.user.memberProfile?.phone ?? null,
      },
    })),
  });
}

const addMemberSchema = z.object({
  groupId: z.string().min(1),
  userId: z.string().min(1),
  role: z.enum(["LEADER", "MEMBER"]).default("MEMBER"),
});

// POST /api/admin/groupes/membres - Ajouter un membre au groupe
export async function POST(request: NextRequest) {
  const user = await requireAdminApi();
  if (!user) return apiError("Non autorisé", 401);

  try {
    const body = await request.json().catch(() => null);
    const parsed = addMemberSchema.safeParse(body);
    if (!parsed.success) return apiError("Données invalides");

    const { groupId, userId, role } = parsed.data;

    const [group, targetUser] = await Promise.all([
      db.group.findUnique({ where: { id: groupId }, select: { id: true, maxSize: true, _count: { select: { members: true } } } }),
      db.user.findUnique({ where: { id: userId }, select: { id: true, status: true } }),
    ]);

    if (!group) return apiError("Groupe introuvable", 404);
    if (!targetUser) return apiError("Utilisateur introuvable", 404);
    if (group.maxSize && group._count.members >= group.maxSize) {
      return apiError("Le groupe est complet (taille maximale atteinte)");
    }

    const member = await db.groupMember.upsert({
      where: { groupId_userId: { groupId, userId } },
      update: { role },
      create: { groupId, userId, role },
    });

    // Si la personne devient LEADER, on la définit aussi comme responsable du groupe.
    if (role === "LEADER") {
      await db.group.update({ where: { id: groupId }, data: { leaderId: userId } });
    }

    return apiSuccess(member, 201);
  } catch (error) {
    console.error("Add group member error", error);
    return apiError("Erreur lors de l'ajout du membre", 500);
  }
}

// DELETE /api/admin/groupes/membres?memberId=... - Retirer un membre du groupe
export async function DELETE(request: NextRequest) {
  const user = await requireAdminApi();
  if (!user) return apiError("Non autorisé", 401);

  try {
    const memberId = new URL(request.url).searchParams.get("memberId");
    if (!memberId) return apiError("memberId requis");

    const member = await db.groupMember.findUnique({
      where: { id: memberId },
      select: { id: true, groupId: true, userId: true, role: true },
    });
    if (!member) return apiError("Membre introuvable", 404);

    await db.groupMember.delete({ where: { id: memberId } });

    // Si on retire le responsable, on retire la référence du groupe.
    if (member.role === "LEADER") {
      await db.group.update({ where: { id: member.groupId }, data: { leaderId: null } });
    }

    return apiSuccess({ deleted: true });
  } catch (error) {
    console.error("Remove group member error", error);
    return apiError("Erreur lors du retrait du membre", 500);
  }
}
