import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTable } from "@/components/admin/admin-table";
import { AdminPageActions } from "@/components/admin/admin-page-actions";
import { AdminCrudCell } from "@/components/admin/admin-crud-cell";
import type { FormField } from "@/components/admin/admin-form-dialog";
import { requireStaffFor, formatMoney, type AdminRow, type AdminBadge } from "@/lib/admin";
import { db } from "@/lib/db";
import { getChurchId } from "@/lib/church";

const CURRENCY_OPTIONS = [
  { value: "XAF", label: "Franc CFA (XAF)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "USD", label: "Dollar US (USD)" },
];

const PAYMENT_METHODS = [
  { value: "CASH", label: "Espèces" },
  { value: "MOBILE_MONEY", label: "Mobile Money" },
  { value: "BANK_TRANSFER", label: "Virement bancaire" },
  { value: "CARD", label: "Carte bancaire" },
];

const DONATION_STATUSES = [
  { value: "PENDING", label: "En attente" },
  { value: "COMPLETED", label: "Terminé" },
  { value: "FAILED", label: "Échoué" },
  { value: "CANCELLED", label: "Annulé" },
];

export default async function DonsPage() {
  const user = await requireStaffFor("dons");
  const churchId = await getChurchId();

  const [items, count, users, categories] = await Promise.all([
    db.donation.findMany({
      where: churchId ? { churchId } : undefined,
      take: 50,
      orderBy: { paymentDate: "desc" },
      include: { user: true, category: true },
    }),
    db.donation.count({ where: churchId ? { churchId } : undefined }),
    db.user.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.donationCategory.findMany({ where: churchId ? { churchId } : undefined, orderBy: { name: "asc" } }),
  ]);

  const userOptions = users.map((u) => ({
    value: u.id,
    label: u.name ?? "Utilisateur sans nom",
  }));

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const statusBadge = (row: AdminRow): AdminBadge => ({
    label: row.status === "COMPLETED" ? "Terminé" : row.status === "PENDING" ? "En attente" : "Échoué",
    variant: row.status === "COMPLETED" ? "success" : "pending",
  });

  const rows: AdminRow[] = items.map((item) => ({
    id: item.id,
    primary: formatMoney(item.amount, item.currency),
    secondary: item.user.name ?? "Donateur",
    detail: item.category?.name ?? "Catégorie inconnue",
    status: item.status,
    date: item.paymentDate,
    raw: {
      userId: item.userId,
      categoryId: item.categoryId,
      amount: String(item.amount),
      currency: item.currency,
      method: item.method ?? "CASH",
      reference: item.reference ?? "",
      status: item.status,
      notes: item.notes ?? "",
      paymentDate: item.paymentDate ? item.paymentDate.toISOString().slice(0, 10) : "",
    },
  }));

  const fields = [
    { name: "userId", label: "Membre", type: "select", required: true, options: userOptions },
    { name: "categoryId", label: "Catégorie de don", type: "select", required: true, options: categoryOptions },
    { name: "amount", label: "Montant", type: "number", required: true, placeholder: "Montant du don" },
    { name: "currency", label: "Devise", type: "select", options: CURRENCY_OPTIONS, defaultValue: "XAF" },
    { name: "method", label: "Méthode", type: "select", options: PAYMENT_METHODS, defaultValue: "CASH" },
    { name: "reference", label: "Référence", type: "text", placeholder: "Référence de transaction" },
    { name: "status", label: "Statut", type: "select", options: DONATION_STATUSES, defaultValue: "PENDING" },
    { name: "notes", label: "Notes", type: "textarea", placeholder: "Notes internes" },
    { name: "paymentDate", label: "Date de paiement", type: "date", required: true },
  ] satisfies FormField[];

  return (
    <DashboardLayout variant="admin" user={user}>
      <div className="space-y-6">
        <AdminPageHeader title="Dons" description="Historique des dons et contributions." />
        <AdminPageActions
          endpoint="/api/admin/dons"
          title="Don"
          description="Enregistrez un nouveau don"
          fields={fields}
        />
        <AdminTable
          title="Dons"
          count={count}
          countLabel="dons"
          rows={rows}
          statusBadge={statusBadge}
          actions={(row) => (
            <AdminCrudCell row={row} endpoint="/api/admin/dons" title="Don" fields={fields} />
          )}
        />
      </div>
    </DashboardLayout>
  );
}