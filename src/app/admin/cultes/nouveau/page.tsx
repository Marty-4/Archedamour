import { CreateServiceFormSection } from "./create-service-form";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

export default async function NouveauCultePage() {
  const user = await requireAdmin();

  const preachers = await db.user.findMany({
    where: {
      role: {
        in: ["SUPER_ADMIN", "PASTOR", "ADMIN"],
      },
      status: "ACTIVE",
    },
    select: {
      id: true,
      name: true,
      role: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <DashboardLayout variant="admin" user={user}>
      <CreateServiceFormSection preachers={preachers} />
    </DashboardLayout>
  );
}
