import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTable } from "@/components/admin/admin-table";
import { requireStaffFor, formatLabel, type AdminRow } from "@/lib/admin";
import { db } from "@/lib/db";

export default async function RapportsPage() {
  const user = await requireStaffFor("rapports");

  const [items, count] = await Promise.all([
    db.conversion.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: { assignedTo: true, _count: { select: { followUps: true } } },
    }),
    db.conversion.count(),
  ]);

  const rows: AdminRow[] = items.map((item) => ({
    id: item.id,
    primary: `${item.firstName} ${item.lastName}`,
    secondary: item.assignedTo?.name ?? "Non assigné",
    detail: `${item._count.followUps} suivis`,
    status: formatLabel(item.status),
    date: item.conversionDate ?? item.createdAt,
  }));

  return (
    <DashboardLayout variant="admin" user={user}>
      <div className="space-y-6">
        <AdminPageHeader title="Rapports" description="Indicateurs clés issus des données de l'église." />
        <AdminTable title="Conversions" count={count} countLabel="conversions" rows={rows} />
      </div>
    </DashboardLayout>
  );
}