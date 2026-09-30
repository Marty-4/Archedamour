import Link from "next/link";
import { Plus } from "lucide-react";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTable } from "@/components/admin/admin-table";
import { requireAdmin, formatLabel, type AdminRow } from "@/lib/admin";
import { db } from "@/lib/db";
import { getChurchId } from "@/lib/church";

export default async function CultesPage() {
  const user = await requireAdmin();
  const churchId = await getChurchId();

  const [services, count] = await Promise.all([
    db.service.findMany({
      where: churchId ? { churchId } : undefined,
      take: 50,
      orderBy: [
        { date: "desc" },
        { startTime: "desc" },
      ],
      include: {
        preacher: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    db.service.count(),
  ]);

  const rows: AdminRow[] = services.map((service) => ({
    id: service.id,
    primary: service.title,
    secondary: service.location ?? "Lieu non défini",
    detail:
      service.preacher?.name ??
      formatLabel(service.type),
    status: service.status,
    date: service.date,
  }));

  return (
    <DashboardLayout variant="admin" user={user}>
      <div className="space-y-6">
        <AdminPageHeader
          title="Cultes"
          description="Consultez et gérez les cultes de l'église."
        />

        <div className="flex justify-end">
          <Link
            href="/admin/cultes/nouveau"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Créer un culte
          </Link>
        </div>

        <AdminTable
          title="Liste des cultes"
          count={count}
          countLabel="cultes"
          rows={rows}
        />
      </div>
    </DashboardLayout>
  );
}