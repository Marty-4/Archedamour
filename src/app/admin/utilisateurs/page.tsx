import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTable } from "@/components/admin/admin-table";
import { requireAdmin, type AdminRow } from "@/lib/admin";
import { db } from "@/lib/db";

export default async function UtilisateursPage() {
  const user = await requireAdmin();
  const [items, count] = await Promise.all([
    db.user.findMany({ take: 50, orderBy: { createdAt: "desc" } }),
    db.user.count(),
  ]);

  const rows: AdminRow[] = items.map((item) => ({
    id: item.id,
    primary: item.name ?? "Sans nom",
    secondary: item.email,
    detail: item.role,
    status: item.status,
    date: item.createdAt,
  }));

  return (
    <DashboardLayout variant="admin" user={user}>
      <div className="space-y-6">
        <AdminPageHeader title="Utilisateurs" description="Comptes et rôles d'accès à la plateforme." />
        <AdminTable title="Utilisateurs" count={count} countLabel="utilisateurs" rows={rows} />
      </div>
    </DashboardLayout>
  );
}