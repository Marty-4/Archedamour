import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTable } from "@/components/admin/admin-table";
import { requireStaffFor, type AdminRow } from "@/lib/admin";
import { db } from "@/lib/db";

export default async function MembresPage() {
  const user = await requireStaffFor("membres");

  const [items, count] = await Promise.all([
    db.memberProfile.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: { user: true, department: true },
    }),
    db.memberProfile.count(),
  ]);

  const rows: AdminRow[] = items.map((item) => ({
    id: item.id,
    primary: `${item.firstName} ${item.lastName}`,
    secondary: item.user.email,
    detail: item.department?.name ?? "Non assigné",
    status: item.status,
    date: item.membershipDate ?? item.createdAt,
  }));

  return (
    <DashboardLayout variant="admin" user={user}>
      <div className="space-y-6">
        <AdminPageHeader title="Membres" description="Annuaire et suivi des membres de l'église." />
        <AdminTable title="Membres" count={count} countLabel="membres" rows={rows} />
      </div>
    </DashboardLayout>
  );
}