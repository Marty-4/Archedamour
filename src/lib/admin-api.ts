import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_CONFIG } from "@/lib/auth";
import { getSessionUser, hasAdminAccess, hasStaffAccess } from "@/lib/session";
import { db } from "@/lib/db";

/** Vérifie que l'utilisateur est admin pour les API routes. Retourne l'utilisateur ou null. */
export async function requireAdminApi() {
  const user = await getSessionUser((await cookies()).get(SESSION_CONFIG.cookieName)?.value);
  if (!user || !hasAdminAccess(user.role)) return null;
  return user;
}

/** Vérifie que l'utilisateur est membre du personnel (admin ou staff). Retourne l'utilisateur ou null. */
export async function requireStaffApi() {
  const user = await getSessionUser((await cookies()).get(SESSION_CONFIG.cookieName)?.value);
  if (!user || !hasStaffAccess(user.role)) return null;
  return user;
}

/** Réponse JSON d'erreur standardisée */
export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/** Réponse JSON de succès standardisée */
export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

/**
 * Identité de l'église — délégué au singleton mono-église (src/lib/church.ts).
 * (Ancienne définition dupliquée : ne pas recréer ici.)
 */
export { getChurchId as getDefaultChurchId, requireChurchId, resolveChurchIdForUser, ensureUserBelongsToChurch } from "@/lib/church";
