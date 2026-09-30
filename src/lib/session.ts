import { Role, UserStatus } from "@prisma/client";
import { db } from "@/lib/db";

/** Rôles avec accès complet à l'administration. */
export const ADMIN_ROLES: Role[] = ["SUPER_ADMIN", "PASTOR", "ADMIN"];

/** Rôles staff (accès partiel à l'espace d'administration). */
export const STAFF_ROLES: Role[] = ["TREASURER", "DEPARTMENT_HEAD", "MODERATOR"];

/** Un membre du personnel (admin complet ou staff partiel). */
export function hasStaffAccess(role: Role) {
  return ADMIN_ROLES.includes(role) || STAFF_ROLES.includes(role);
}

/** Accès complet à l'administration. */
export function hasAdminAccess(role: Role) {
  return ADMIN_ROLES.includes(role);
}

export async function getSessionUser(token?: string | null) {
  if (!token) return null;
  const session = await db.session.findUnique({ where: { token }, include: { user: true } });
  if (!session || session.expiresAt <= new Date() || session.user.status !== UserStatus.ACTIVE) return null;
  return session.user;
}
