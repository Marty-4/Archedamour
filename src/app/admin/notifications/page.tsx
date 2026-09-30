import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTable } from "@/components/admin/admin-table";
import { AdminPageActions } from "@/components/admin/admin-page-actions";
import { AdminCrudCell } from "@/components/admin/admin-crud-cell";
import type { FormField } from "@/components/admin/admin-form-dialog";
import { requireStaffFor, type AdminRow, type AdminBadge } from "@/lib/admin";
import { db } from "@/lib/db";

const NOTIFICATION_TYPES = [
  { value: "NEW_SERVICE", label: "Nouveau culte" },
  { value: "NEW_EVENT", label: "Nouvel événement" },
  { value: "NEW_SERMON", label: "Nouvelle prédication" },
  { value: "LIVE_STARTED", label: "Direct commencé" },
  { value: "REMINDER", label: "Rappel" },
  { value: "PRAYER_UPDATE", label: "Mise à jour de prière" },
  { value: "ANNOUNCEMENT", label: "Annonce" },
];

const READ_OPTIONS = [
  { value: "true", label: "Lue" },
  { value: "false", label: "Non lue" },
];

export default async function NotificationsPage() {
  const user = await requireStaffFor("notifications");

  const [items, count, users] = await Promise.all([
    db.notification.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    }),
    db.notification.count(),
    db.user.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const userOptions = users.map((u) => ({
    value: u.id,
    label: u.name ?? "Utilisateur sans nom",
  }));

  const statusBadge = (row: AdminRow): AdminBadge => ({
    label: row.status === "READ" ? "Lue" : "Non lue",
    variant: row.status === "READ" ? "success" : "pending",
  });

  const rows: AdminRow[] = items.map((item) => ({
    id: item.id,
    primary: item.title,
    secondary: item.user.name ?? "Utilisateur",
    detail: item.type,
    status: item.isRead ? "READ" : "UNREAD",
    date: item.createdAt,
    raw: {
      userId: item.userId,
      type: item.type,
      title: item.title,
      message: item.message,
      actionUrl: item.actionUrl ?? "",
      isRead: item.isRead ? "true" : "false",
    },
  }));

  const fields = [
    { name: "userId", label: "Destinataire", type: "select", required: true, options: userOptions },
    { name: "type", label: "Type", type: "select", required: true, options: NOTIFICATION_TYPES, defaultValue: "ANNOUNCEMENT" },
    { name: "title", label: "Titre", type: "text", required: true, placeholder: "Titre de la notification" },
    { name: "message", label: "Message", type: "textarea", required: true, placeholder: "Contenu de la notification" },
    { name: "actionUrl", label: "URL d'action", type: "url", placeholder: "https://..." },
    { name: "isRead", label: "État", type: "select", options: READ_OPTIONS, defaultValue: "false" },
  ] satisfies FormField[];

  return (
    <DashboardLayout variant="admin" user={user}>
      <div className="space-y-6">
        <AdminPageHeader title="Notifications" description="Notifications envoyées aux membres." />
        <AdminPageActions
          endpoint="/api/admin/notifications"
          title="Notification"
          description="Envoyez une nouvelle notification"
          fields={fields}
        />
        <AdminTable
          title="Notifications"
          count={count}
          countLabel="notifications"
          rows={rows}
          statusBadge={statusBadge}
          actions={(row) => (
            <AdminCrudCell row={row} endpoint="/api/admin/notifications" title="Notification" fields={fields} />
          )}
        />
      </div>
    </DashboardLayout>
  );
}