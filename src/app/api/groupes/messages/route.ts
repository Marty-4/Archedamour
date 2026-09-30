import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { SESSION_CONFIG } from "@/lib/auth";
import { getSessionUser } from "@/lib/session";

/** Récupère l'utilisateur et vérifie son appartenance au groupe. */
async function getGroupContext(request: NextRequest, groupId: string) {
  const user = await getSessionUser(
    request.cookies.get(SESSION_CONFIG.cookieName)?.value,
  );
  if (!user) return { error: "Authentification requise.", status: 401 as const };

  const membership = await db.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: user.id } },
    select: { id: true },
  });

  if (!membership) {
    // Les admins complets peuvent lire tous les groupes.
    const isAdmin = ["SUPER_ADMIN", "PASTOR", "ADMIN"].includes(user.role);
    if (!isAdmin) return { error: "Vous n'êtes pas membre de ce groupe.", status: 403 as const };
  }

  return { user };
}

// GET /api/groupes/messages?groupId=...&before=... (20 derniers messages)
export async function GET(request: NextRequest) {
  const groupId = new URL(request.url).searchParams.get("groupId");
  if (!groupId) {
    return NextResponse.json({ message: "groupId requis." }, { status: 400 });
  }

  const context = await getGroupContext(request, groupId);
  if ("error" in context) {
    return NextResponse.json({ message: context.error }, { status: context.status });
  }

  const beforeParam = new URL(request.url).searchParams.get("before");
  const before = beforeParam ? new Date(beforeParam) : null;

  const messages = await db.groupMessage.findMany({
    where: { groupId, ...(before && !Number.isNaN(before.getTime()) ? { createdAt: { lt: before } } : {}) },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
          memberProfile: { select: { firstName: true, lastName: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({
    messages: messages.reverse().map((m) => ({
      id: m.id,
      content: m.content,
      createdAt: m.createdAt,
      userId: m.userId,
      author:
        m.user.memberProfile
          ? `${m.user.memberProfile.firstName} ${m.user.memberProfile.lastName}`.trim()
          : m.user.name ?? "Membre",
      avatar: m.user.avatar,
      isMine: m.userId === context.user!.id,
    })),
  });
}

const sendSchema = z.object({
  groupId: z.string().min(1),
  content: z.string().trim().min(1, "Message vide").max(2000, "Message trop long (2000 max)"),
});

// POST /api/groupes/messages - Envoyer un message dans le groupe
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = sendSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Message invalide." },
      { status: 422 },
    );
  }

  const context = await getGroupContext(request, parsed.data.groupId);
  if ("error" in context) {
    return NextResponse.json({ message: context.error }, { status: context.status });
  }

  const message = await db.groupMessage.create({
    data: {
      groupId: parsed.data.groupId,
      userId: context.user!.id,
      content: parsed.data.content,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
          memberProfile: { select: { firstName: true, lastName: true } },
        },
      },
    },
  });

  return NextResponse.json(
    {
      message: {
        id: message.id,
        content: message.content,
        createdAt: message.createdAt,
        userId: message.userId,
        author:
          message.user.memberProfile
            ? `${message.user.memberProfile.firstName} ${message.user.memberProfile.lastName}`.trim()
            : message.user.name ?? "Membre",
        avatar: message.user.avatar,
        isMine: true,
      },
    },
    { status: 201 },
  );
}
