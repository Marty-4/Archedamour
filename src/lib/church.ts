import { db } from "@/lib/db";

/**
 * ARCHE D'AMOUR — application mono-église.
 *
 * TOUTE donnée de l'app (cultes, événements, dons, groupes, prières,
 * prédications, lives, départements, profils membres…) appartient à UNE seule
 * église. Ce module est LA source unique de son identité :
 *
 * - `getChurchId()` : l'ID de l'église (création à la volée si absente, pour
 *   qu'une installation vierge soit immédiatement fonctionnelle) ;
 * - `requireChurchId()` : variante stricte pour les écritures (erreur claire
 *   si l'église n'existe pas et ne peut pas être créée) ;
 * - `resolveChurchIdForUser()` : l'église d'un utilisateur — son profil s'il
 *   existe, sinon l'église de l'application (jamais null si elle existe).
 *
 * NB : autrefois la référence était éclatée (findFirst dupliqué dans chaque
 * API, fallback dispersé) — ne pas recréer ces doublons : importez ce module.
 */

/** Nom de l'unique église gérée par l'application. */
export const CHURCH_NAME = "Arche d'Amour";

let cachedChurchId: string | null = null;

/**
 * ID de l'église Arche d'Amour (mémoïsé par process).
 * Crée l'église si la base est vierge, afin que l'app ne soit jamais bloquée.
 */
export async function getChurchId(): Promise<string | null> {
  if (cachedChurchId) return cachedChurchId;

  const existing = await db.church.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (existing) {
    cachedChurchId = existing.id;
    return cachedChurchId;
  }

  // Installation vierge : création automatique de l'église.
  const created = await db.church.create({
    data: { name: CHURCH_NAME },
    select: { id: true },
  });
  cachedChurchId = created.id;
  return cachedChurchId;
}

/** Variante stricte pour les écritures : lève si l'église est indisponible. */
export async function requireChurchId(): Promise<string> {
  const id = await getChurchId();
  if (!id) {
    throw new Error("L'église Arche d'Amour n'est pas configurée dans la base.");
  }
  return id;
}

/** Église d'un utilisateur : profil s'il existe, sinon l'église de l'app. */
export async function resolveChurchIdForUser(userId: string): Promise<string | null> {
  const profile = await db.memberProfile.findUnique({
    where: { userId },
    select: { churchId: true },
  });
  return profile?.churchId ?? (await getChurchId());
}

/** Rattache (idempotent) un utilisateur à l'église via son MemberProfile. */
export async function ensureUserBelongsToChurch(userId: string): Promise<void> {
  const churchId = await getChurchId();
  if (!churchId) return;

  const profile = await db.memberProfile.findUnique({
    where: { userId },
    select: { id: true, churchId: true },
  });

  if (!profile) {
    // Profil minimal : le membre complète ses infos plus tard.
    const user = await db.user.findUnique({ where: { id: userId }, select: { name: true } });
    const nameParts = user?.name?.trim().split(/\s+/) ?? [];
    await db.memberProfile.create({
      data: {
        userId,
        churchId,
        firstName: nameParts[0] ?? "Membre",
        lastName: nameParts.slice(1).join(" ") || "À compléter",
      },
    });
    return;
  }

  if (profile.churchId !== churchId) {
    await db.memberProfile.update({ where: { id: profile.id }, data: { churchId } });
  }
}
