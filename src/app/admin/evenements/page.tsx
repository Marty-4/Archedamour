import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTable } from "@/components/admin/admin-table";
import { AdminPageActions } from "@/components/admin/admin-page-actions";
import { AdminCrudCell } from "@/components/admin/admin-crud-cell";
import type { FormField } from "@/components/admin/admin-form-dialog";
import { requireAdmin, type AdminRow } from "@/lib/admin";
import { db } from "@/lib/db";
import { getChurchId } from "@/lib/church";

const EVENT_STATUSES = [
  { value: "DRAFT", label: "Brouillon" },
  { value: "PUBLISHED", label: "Publié" },
  { value: "CANCELLED", label: "Annulé" },
  { value: "COMPLETED", label: "Terminé" },
];

export default async function EvenementsPage() {
  const user = await requireAdmin();
  const churchId = await getChurchId();

  const [items, count] = await Promise.all([
    db.event.findMany({
      where: churchId ? { churchId } : undefined,
      take: 50,
      orderBy: { date: "desc" },
      include: { _count: { select: { registrations: true } } },
    }),
    db.event.count({ where: churchId ? { churchId } : undefined }),
  ]);

  const rows: AdminRow[] = items.map((item) => ({
    id: item.id,
    primary: item.title,
    secondary: item.location ?? "Lieu à définir",
    detail: `${item._count.registrations}${item.maxParticipants ? ` / ${item.maxParticipants}` : ""} inscrits`,
    status: item.status,
    date: item.date,
    raw: {
      title: item.title,
      description: item.description ?? "",
      location: item.location ?? "",
      date: item.date ? item.date.toISOString().slice(0, 10) : "",
      maxParticipants: item.maxParticipants ? String(item.maxParticipants) : "",
      status: item.status,
      image: item.image ?? "",
    },
  }));

  const fields = [
    { name: "title", label: "Titre", type: "text", required: true, placeholder: "Titre de l'événement" },
    { name: "description", label: "Description", type: "textarea", placeholder: "Description de l'événement" },
    { name: "location", label: "Lieu", type: "text", placeholder: "Lieu de l'événement" },
    { name: "date", label: "Date", type: "date", required: true },
    { name: "maxParticipants", label: "Participants max", type: "number", placeholder: "Limite de participants" },
    {
      name: "status",
      label: "Statut",
      type: "select",
      required: true,
      options: EVENT_STATUSES,
      defaultValue: "DRAFT",
    },
    { name: "image", label: "Image", type: "image", placeholder: "https://... ou téléversez une image" },
  ] satisfies FormField[];

  return (
    <DashboardLayout variant="admin" user={user}>
      <div className="space-y-6">
        <AdminPageHeader title="Événements" description="Événements publiés et inscriptions." />
        <AdminPageActions
          endpoint="/api/admin/evenements"
          title="Événement"
          description="Créez un nouvel événement"
          fields={fields}
        />
        <AdminTable
          title="Événements"
          count={count}
          countLabel="événements"
          rows={rows}
          actions={(row) => (
            <AdminCrudCell row={row} endpoint="/api/admin/evenements" title="Événement" fields={fields} />
          )}
        />
      </div>
    </DashboardLayout>
  );
}