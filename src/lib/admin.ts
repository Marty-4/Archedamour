import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import type { Role } from "@prisma/client";
import type { LucideIcon } from "lucide-react";
import { SESSION_CONFIG } from "@/lib/auth";
import { getSessionUser, hasAdminAccess, hasStaffAccess, ADMIN_ROLES } from "@/lib/session";
import type { StatusVariant } from "@/components/shared/stat-badge";

/** Formatteur de date partagé pour l'admin */
export const formatDate = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" });
export const formatDateTime = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" });

/** Lisible : EXAUCEE -> Exaucée, NON_LUE -> Non lue, etc. */
/** Traductions françaises des valeurs d'énumérations affichées dans les tables admin. */
const LABELS_FR: Record<string, string> = {
  // Statuts génériques
  SCHEDULED: "Planifié",
  ONGOING: "En cours",
  COMPLETED: "Terminé",
  CANCELLED: "Annulé",
  ACTIVE: "Actif",
  INACTIVE: "Inactif",
  SUSPENDED: "Suspendu",
  PENDING: "En attente",
  PUBLISHED: "Publié",
  DRAFT: "Brouillon",
  FAILED: "Échoué",
  ARCHIVED: "Archivé",
  TRANSFERRED: "Transféré",
  WITHDRAWN: "Retiré",
  // Direct / Live
  LIVE: "En direct",
  ENDED: "Terminé",
  INTERNAL: "Dans l'application",
  // Cultes
  SUNDAY_SERVICE: "Culte du dimanche",
  WEEKDAY_PRAYER: "Prière en semaine",
  BIBLE_STUDY: "Étude biblique",
  VIGIL: "Veillée",
  CONFERENCE: "Conférence",
  SEMINAR: "Séminaire",
  RETREAT: "Retraite",
  // Divers
  OTHER: "Autre",
  VIDEO: "Vidéo",
  AUDIO: "Audio",
  MALE: "Homme",
  FEMALE: "Femme",
  SINGLE: "Célibataire",
  MARRIED: "Marié(e)",
};

export function formatLabel(value?: string | null) {
  if (!value) return "—";
  if (LABELS_FR[value]) return LABELS_FR[value];
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/^./, (char) => char.toUpperCase());
}

/** Monnaie formattée en fr-FR */
export function formatMoney(amount: number, currency = "XAF") {
  return `${Math.round(amount).toLocaleString("fr-FR")} ${currency}`;
}

/** Type de ligne générique pour les tableaux admin */
export type AdminRow = {
  id: string;
  primary: string;
  secondary?: string | null;
  detail?: string | null;
  date?: Date | null;
  status?: string | null;
  /** Données brutes de l'enregistrement (pour les formulaires CRUD) */
  raw?: Record<string, unknown>;
};

export type AdminBadge = { label: string; variant: StatusVariant };

/** Sécurité : force l'authentification admin, redirige sinon. Retourne l'utilisateur. */
export async function requireAdmin() {
  const user = await getSessionUser((await cookies()).get(SESSION_CONFIG.cookieName)?.value);
  if (!user) redirect("/login");
  if (!hasAdminAccess(user.role)) redirect("/member/dashboard");
  return user;
}

/** Sécurité : authentifie tout membre du personnel (admin complet ou staff). */
export async function requireStaff() {
  const user = await getSessionUser((await cookies()).get(SESSION_CONFIG.cookieName)?.value);
  if (!user) redirect("/login");
  if (!hasStaffAccess(user.role)) redirect("/member/dashboard");
  return user;
}

/** Pages admin accessibles aux rôles staff (les admins complets voient tout). */
const STAFF_PAGES: Record<string, Role[]> = {
  membres: ["DEPARTMENT_HEAD", "MODERATOR"],
  groupes: ["DEPARTMENT_HEAD"],
  departements: ["DEPARTMENT_HEAD"],
  dons: ["TREASURER"],
  prieres: ["MODERATOR", "DEPARTMENT_HEAD"],
  notifications: ["MODERATOR"],
  rapports: ["TREASURER", "DEPARTMENT_HEAD", "MODERATOR"],
};

/** Le rôle peut-il voir cette page admin ? */
export function canAccessAdminPage(role: Role, page: string) {
  if (hasAdminAccess(role)) return true;
  return STAFF_PAGES[page]?.includes(role) ?? false;
}

/** Sécurité par page : staff limité à STAFF_PAGES, admins complets partout. */
export async function requireStaffFor(page: string) {
  const user = await getSessionUser((await cookies()).get(SESSION_CONFIG.cookieName)?.value);
  if (!user) redirect("/login");
  if (!canAccessAdminPage(user.role, page)) redirect("/member/dashboard");
  return user;
}

/** Pages admin autorisées pour un rôle donné (pour filtrer la navigation). */
export function allowedAdminPages(role: Role): string[] | "all" {
  if (ADMIN_ROLES.includes(role)) return "all";
  return Object.entries(STAFF_PAGES)
    .filter(([, roles]) => roles.includes(role))
    .map(([page]) => page);
}

/** Informations de l'église unique (Arche d'Amour) */
export const CHURCH_INFO = {
  name: "Arche d'Amour",
  description: "Église évangélique",
};

export type AdminNavItem = {
  label: string;
  description: string;
  icon?: LucideIcon;
};

export const ADMIN_PAGES: Record<string, AdminNavItem> = {
  membres: { label: "Membres", description: "Annuaire et suivi des membres de l'église." },
  utilisateurs: { label: "Utilisateurs", description: "Comptes et rôles d'accès à la plateforme." },
  cultes: { label: "Cultes", description: "Planification des cultes et rassemblements." },
  evenements: { label: "Événements", description: "Événements publiés et inscriptions." },
  predications: { label: "Prédications", description: "Bibliothèque des prédications publiées." },
  prieres: { label: "Prières", description: "Demandes de prière de la communauté." },
  dons: { label: "Dons", description: "Historique des dons et contributions." },
  groupes: { label: "Groupes", description: "Groupes de maison et leurs membres." },
  departements: { label: "Départements", description: "Ministères et départements de l'église." },
  "live-studio": { label: "Live Studio", description: "Diffusions en direct programmées et passées." },
  notifications: { label: "Notifications", description: "Notifications envoyées aux membres." },
  rapports: { label: "Rapports", description: "Indicateurs clés issus des données de l'église." },
  parametres: { label: "Paramètres", description: "Informations de l'église enregistrées dans la base." },
};