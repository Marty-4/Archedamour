import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTable } from "@/components/admin/admin-table";
import { AdminPageActions } from "@/components/admin/admin-page-actions";
import { AdminCrudCell } from "@/components/admin/admin-crud-cell";
import { GroupMembersManager } from "@/components/admin/group-members-manager";
import type { FormField } from "@/components/admin/admin-form-dialog";
import { requireStaffFor, type AdminRow, type AdminBadge } from "@/lib/admin";
import { db } from "@/lib/db";

const GROUP_STATUSES = [
  { value: "ACTIVE", label: "Actif" },
  { value: "INACTIVE", label: "Inactif" },
  { value: "ARCHIVED", label: "Archivé" },
];

const DAYS = [
  { value: "LUNDI", label: "Lundi" },
  { value: "MARDI", label: "Mardi" },
  { value: "MERCREDI", label: "Mercredi" },
  { value: "JEUDI", label: "Jeudi" },
  { value: "VENDREDI", label: "Vendredi" },
  { value: "SAMEDI", label: "Samedi" },
  { value: "DIMANCHE", label: "Dimanche" },
];

export default async function GroupesPage() {
  const user = await requireStaffFor("groupes");

  const [items, count, leaders] = await Promise.all([
    db.group.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: { leader: true, _count: { select: { members: true } } },
    }),
    db.group.count(),
    db.user.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
  ]);

  // « Nom — email » : la barre de recherche du dialogue filtre sur les deux.
  const leaderOptions = leaders.map((l) => ({
    value: l.id,
    label: l.name ? `${l.name} — ${l.email}` : l.email,
  }));

  const statusBadge = (row: AdminRow): AdminBadge => ({
    label: row.status === "ACTIVE" ? "Actif" : row.status === "ARCHIVED" ? "Archivé" : "Inactif",
    variant: row.status === "ACTIVE" ? "success" : "warning",
  });

  const rows: AdminRow[] = items.map((item) => ({
    id: item.id,
    primary: item.name,
    secondary: item.leader?.name ?? "Responsable non renseigné",
    detail: `${item._count.members} membre${item._count.members > 1 ? "s" : ""}`,
    status: item.status,
    date: item.createdAt,
    raw: {
      name: item.name,
      description: item.description ?? "",
      leaderId: item.leaderId ?? "",
      meetingDay: item.meetingDay ?? "",
      meetingTime: item.meetingTime ?? "",
      location: item.location ?? "",
      maxSize: item.maxSize ? String(item.maxSize) : "",
      status: item.status,
    },
  }));

  const fields = [
    { name: "name", label: "Nom du groupe", type: "text", required: true, placeholder: "Nom du groupe" },
    { name: "description", label: "Description", type: "textarea", placeholder: "Description du groupe" },
    { name: "leaderId", label: "Responsable", type: "select", options: leaderOptions },
    { name: "meetingDay", label: "Jour de réunion", type: "select", options: DAYS },
    { name: "meetingTime", label: "Heure de réunion", type: "text", placeholder: "18:00" },
    { name: "location", label: "Lieu", type: "text", placeholder: "Lieu de rencontre" },
    { name: "maxSize", label: "Taille maximale", type: "number", placeholder: "Nombre max de membres" },
    { name: "status", label: "Statut", type: "select", options: GROUP_STATUSES, defaultValue: "ACTIVE" },
  ] satisfies FormField[];

  return (
    <DashboardLayout variant="admin" user={user}>
      <div className="space-y-6">
        <AdminPageHeader title="Groupes" description="Groupes de maison et leurs membres." />
        <AdminPageActions
          endpoint="/api/admin/groupes"
          title="Groupe"
          description="Créez un nouveau groupe de maison"
          fields={fields}
        />
        <AdminTable
          title="Groupes"
          count={count}
          countLabel="groupes"
          rows={rows}
          statusBadge={statusBadge}
          actions={(row) => (
            <div className="flex items-center justify-end gap-2">
              <GroupMembersManager
                groupId={row.id}
                groupName={row.primary}
                candidates={leaderOptions}
              />
              <AdminCrudCell row={row} endpoint="/api/admin/groupes" title="Groupe" fields={fields} />
            </div>
          )}
        />
      </div>
    </DashboardLayout>
  );
}