import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTable } from "@/components/admin/admin-table";
import { AdminPageActions } from "@/components/admin/admin-page-actions";
import { AdminCrudCell } from "@/components/admin/admin-crud-cell";
import type { FormField } from "@/components/admin/admin-form-dialog";
import { requireStaffFor, type AdminRow, type AdminBadge } from "@/lib/admin";
import { db } from "@/lib/db";

const PRAYER_CATEGORIES = [
  { value: "FAMILY", label: "Famille" },
  { value: "HEALTH", label: "Santé" },
  { value: "WORK", label: "Travail" },
  { value: "STUDIES", label: "Études" },
  { value: "FINANCES", label: "Finances" },
  { value: "SPIRITUAL", label: "Spirituel" },
  { value: "OTHER", label: "Autre" },
];

const PRAYER_VISIBILITIES = [
  { value: "PRIVATE", label: "Privée" },
  { value: "PASTORAL", label: "Pastorale" },
  { value: "COMMUNITY", label: "Communauté" },
];

const ANSWERED_OPTIONS = [
  { value: "true", label: "Oui, exaucée" },
  { value: "false", label: "Non, en attente" },
];

export default async function PrieresPage() {
  const user = await requireStaffFor("prieres");

  const [items, count, members] = await Promise.all([
    db.prayerRequest.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    }),
    db.prayerRequest.count(),
    db.user.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const memberOptions = members.map((m) => ({
    value: m.id,
    label: m.name ?? "Utilisateur sans nom",
  }));

  const statusBadge = (row: AdminRow): AdminBadge => ({
    label: row.status === "EXAUCÉE" ? "Exaucée" : "En attente",
    variant: row.status === "EXAUCÉE" ? "success" : "pending",
  });

  const rows: AdminRow[] = items.map((item) => ({
    id: item.id,
    primary: item.title,
    secondary: item.user.name ?? "Membre",
    detail: `${item.category} · ${item.prayerCount} prières`,
    status: item.isAnswered ? "EXAUCÉE" : "EN ATTENTE",
    date: item.createdAt,
    raw: {
      userId: item.userId,
      title: item.title,
      description: item.description ?? "",
      category: item.category,
      visibility: item.visibility,
      isAnswered: item.isAnswered ? "true" : "false",
    },
  }));

  const fields = [
    { name: "userId", label: "Membre", type: "select", required: true, options: memberOptions },
    { name: "title", label: "Titre", type: "text", required: true, placeholder: "Titre de la demande" },
    { name: "description", label: "Description", type: "textarea", placeholder: "Détail de la demande" },
    { name: "category", label: "Catégorie", type: "select", required: true, options: PRAYER_CATEGORIES, defaultValue: "OTHER" },
    { name: "visibility", label: "Visibilité", type: "select", required: true, options: PRAYER_VISIBILITIES, defaultValue: "COMMUNITY" },
    { name: "isAnswered", label: "État", type: "select", options: ANSWERED_OPTIONS, defaultValue: "false" },
  ] satisfies FormField[];

  return (
    <DashboardLayout variant="admin" user={user}>
      <div className="space-y-6">
        <AdminPageHeader title="Prières" description="Demandes de prière de la communauté." />
        <AdminPageActions
          endpoint="/api/admin/prieres"
          title="Demande de prière"
          description="Enregistrez une nouvelle demande de prière"
          fields={fields}
        />
        <AdminTable
          title="Prières"
          count={count}
          countLabel="demandes"
          rows={rows}
          statusBadge={statusBadge}
          actions={(row) => (
            <AdminCrudCell row={row} endpoint="/api/admin/prieres" title="Demande de prière" fields={fields} />
          )}
        />
      </div>
    </DashboardLayout>
  );
}