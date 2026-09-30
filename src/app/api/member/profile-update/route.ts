import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { SESSION_CONFIG } from "@/lib/auth";
import { getSessionUser } from "@/lib/session";

/**
 * Champs modifiables par le membre lui-même.
 * Les champs gérés par l'administration (statut, département, groupe,
 * dates d'adhésion / baptême) ne sont volontairement pas exposés ici.
 */
const profileUpdateSchema = z.object({
  firstName: z.string().trim().min(1, "Le prénom est requis.").max(100),
  lastName: z.string().trim().min(1, "Le nom est requis.").max(100),
  phone: z.string().trim().max(30).optional().nullable(),
  city: z.string().trim().max(120).optional().nullable(),
  address: z.string().trim().max(255).optional().nullable(),
  maritalStatus: z
    .enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED", "SEPARATED"])
    .optional()
    .nullable(),
  bio: z.string().trim().max(2000).optional().nullable(),
});

// PATCH /api/member/profile-update - Mise à jour du profil membre courant
export async function PATCH(request: NextRequest) {
  try {
    const user = await getSessionUser(
      request.cookies.get(SESSION_CONFIG.cookieName)?.value,
    );

    if (!user) {
      return NextResponse.json(
        { message: "Authentification requise." },
        { status: 401 },
      );
    }

    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { message: "Requête invalide." },
        { status: 400 },
      );
    }

    const parsed = profileUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Certaines informations sont invalides.",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 422 },
      );
    }

    const data = parsed.data;

    const memberProfile = await db.memberProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!memberProfile) {
      return NextResponse.json(
        { message: "Profil membre introuvable." },
        { status: 404 },
      );
    }

    const updated = await db.memberProfile.update({
      where: { id: memberProfile.id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone === "" ? null : data.phone ?? null,
        city: data.city === "" ? null : data.city ?? null,
        address: data.address === "" ? null : data.address ?? null,
        maritalStatus: data.maritalStatus ?? null,
        bio: data.bio === "" ? null : data.bio ?? null,
      },
    });

    return NextResponse.json({
      message: "Profil mis à jour avec succès.",
      profile: {
        firstName: updated.firstName,
        lastName: updated.lastName,
        phone: updated.phone,
        city: updated.city,
        address: updated.address,
        maritalStatus: updated.maritalStatus,
        bio: updated.bio,
      },
    });
  } catch (error) {
    console.error("Member profile update error", error);
    return NextResponse.json(
      { message: "Impossible de mettre à jour le profil." },
      { status: 500 },
    );
  }
}
