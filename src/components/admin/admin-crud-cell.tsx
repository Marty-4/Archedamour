"use client";

import { AdminFormDialog, type FormField } from "@/components/admin/admin-form-dialog";
import type { AdminRow } from "@/lib/admin";

type AdminCrudCellProps = {
  row: AdminRow;
  endpoint: string;
  title: string;
  fields: FormField[];
};

export function AdminCrudCell({ row, endpoint, title, fields }: AdminCrudCellProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      <AdminFormDialog
        endpoint={endpoint}
        title={title}
        fields={fields}
        item={row.raw ?? { id: row.id }}
        triggerVariant="outline"
        triggerLabel=""
      />
    </div>
  );
}