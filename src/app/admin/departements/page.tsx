import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTable } from "@/components/admin/admin-table";
import { AdminPageActions } from "@/components/admin/admin-page-actions";
import { AdminCrudCell } from "@/components/admin/admin-crud-cell";
import type { FormField } from "@/components/admin/admin-form-dialog";
import { requireStaffFor, type AdminRow, type AdminBadge } from "@/lib/admin";
import { db } from "@/lib/db";

const DEPARTMENT_STATUSES = [
  { value: "ACTIVE", label: "Actif" },
  { value: "INACTIVE", label: "Inactif" },
];

export default async function DepartementsPage() {
  const user = await requireStaffFor("departements");

  const [items, count, heads] = await Promise.all([
    db.department.findMany({
      take: 50,
      orderBy: { order: "asc" },
      include: { head: true, _count: { select: { members: true } } },
    }),
    db.department.count(),
    db.user.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const headOptions = heads.map((h) => ({
    value: h.id,
    label: h.name ?? "Utilisateur sans nom",
  }));

  const statusBadge = (row: AdminRow): AdminBadge => ({
    label: row.status === "ACTIVE" ? "Actif" : "Inactif",
    variant: row.status === "ACTIVE" ? "success" : "warning",
  });

  const rows: AdminRow[] = items.map((item) => ({
    id: item.id,
    primary: item.name,
    secondary: item.head?.name ?? "Responsable non renseigné",
    detail: `${item._count.members} membre${item._count.members > 1 ? "s" : ""}`,
    status: item.status,
    date: item.createdAt,
    raw: {
      name: item.name,
      description: item.description ?? "",
      color: item.color ?? "",
      headId: item.headId ?? "",
      status: item.status,
      order: String(item.order),
    },
  }));

  const fields = [
    { name: "name", label: "Nom du département", type: "text", required: true, placeholder: "Nom du département" },
    { name: "description", label: "Description", type: "textarea", placeholder: "Description du département" },
    { name: "color", label: "Couleur", type: "text", placeholder: "#6366f1" },
    { name: "headId", label: "Responsable", type: "select", options: headOptions },
    { name: "status", label: "Statut", type: "select", options: DEPARTMENT_STATUSES, defaultValue: "ACTIVE" },
    { name: "order", label: "Ordre d'affichage", type: "number", placeholder: "0" },
  ] satisfies FormField[];

  return (
    <DashboardLayout variant="admin" user={user}>
      <div className="space-y-6">
        <AdminPageHeader title="Départements" description="Ministères et départements de l'église." />
        <AdminPageActions
          endpoint="/api/admin/departements"
          title="Département"
          description="Créez un nouveau département"
          fields={fields}
        />
        <AdminTable
          title="Départements"
          count={count}
          countLabel="départements"
          rows={rows}
          statusBadge={statusBadge}
          actions={(row) => (
            <AdminCrudCell row={row} endpoint="/api/admin/departements" title="Département" fields={fields} />
          )}
        />
      </div>
    </DashboardLayout>
  );
}