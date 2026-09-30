import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { requireAdmin, CHURCH_INFO } from "@/lib/admin";
import { db } from "@/lib/db";

export default async function ParametresPage() {
  const user = await requireAdmin();

  // Statistiques globales de l'église unique
  const [members, services, events, sermons, donations] = await Promise.all([
    db.memberProfile.count(),
    db.service.count(),
    db.event.count(),
    db.sermon.count(),
    db.donation.aggregate({ _sum: { amount: true } }),
  ]);

  const stats: Array<{ label: string; value: string }> = [
    { label: "Membres", value: members.toLocaleString("fr-FR") },
    { label: "Cultes", value: services.toLocaleString("fr-FR") },
    { label: "Événements", value: events.toLocaleString("fr-FR") },
    { label: "Prédications", value: sermons.toLocaleString("fr-FR") },
    { label: "Total dons", value: `${(donations._sum.amount ?? 0).toLocaleString("fr-FR")} XAF` },
  ];

  return (
    <DashboardLayout variant="admin" user={user}>
      <div className="space-y-6">
        <AdminPageHeader title="Paramètres" description="Informations de l'église enregistrées dans la base." />

        <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <h2 className="text-lg font-semibold">{CHURCH_INFO.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{CHURCH_INFO.description}</p>

          <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-lg bg-muted/50 p-4">
                <dt className="text-sm text-muted-foreground">{stat.label}</dt>
                <dd className="mt-1 text-lg font-medium">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </DashboardLayout>
  );
}