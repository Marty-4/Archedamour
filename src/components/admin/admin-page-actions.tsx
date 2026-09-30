"use client";

import { AdminFormDialog, type FormField } from "@/components/admin/admin-form-dialog";

type AdminPageActionsProps = {
  endpoint: string;
  title: string;
  description?: string;
  fields: FormField[];
};

export function AdminPageActions({ endpoint, title, description, fields }: AdminPageActionsProps) {
  return (
    <div className="flex justify-end">
      <AdminFormDialog
        endpoint={endpoint}
        title={title}
        description={description}
        fields={fields}
        triggerLabel="Ajouter"
      />
    </div>
  );
}