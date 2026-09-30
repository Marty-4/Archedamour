import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatBadge } from "@/components/shared/stat-badge";
import { formatDate, formatLabel, type AdminBadge, type AdminRow } from "@/lib/admin";

const statusToVariant: Record<string, AdminBadge["variant"]> = {
  ACTIVE: "active",
  ACTIF: "active",
  COMPLETED: "completed",
  TERMINÉ: "completed",
  PUBLISHED: "completed",
  PENDING: "pending",
  SCHEDULED: "pending",
  EN_ATTENTE: "pending",
  INACTIVE: "inactive",
  SUSPENDED: "error",
  CANCELLED: "cancelled",
  ANNULÉ: "cancelled",
  DRAFT: "default",
  FAILED: "error",
};

function StatusCell({ status }: { status?: string | null }) {
  if (!status) return <span className="text-muted-foreground">—</span>;
  return <StatBadge status={statusToVariant[status] ?? "default"} label={formatLabel(status)} />;
}

type AdminTableProps = {
  title: string;
  count?: number;
  countLabel?: string;
  description?: string;
  rows: AdminRow[];
  columns?: { key: string; header: string; render: (row: AdminRow) => ReactNode }[];
  statusBadge?: (row: AdminRow) => AdminBadge | null;
  actions?: (row: AdminRow) => ReactNode;
  emptyMessage?: string;
};

export function AdminTable({
  title,
  count,
  countLabel,
  description,
  rows,
  columns = [],
  statusBadge,
  actions,
  emptyMessage = "Aucune donnée disponible.",
}: AdminTableProps) {
  const displayCount = count ?? rows.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {displayCount.toLocaleString("fr-FR")} {countLabel}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Élément</TableHead>
              <TableHead className="hidden md:table-cell">Information</TableHead>
              <TableHead className="hidden lg:table-cell">Détail</TableHead>
              {columns.map((column) => (
                <TableHead key={column.key}>{column.header}</TableHead>
              ))}
              <TableHead className="hidden lg:table-cell">Date</TableHead>
              <TableHead>Statut</TableHead>
              {actions && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((row) => {
                const badge = statusBadge?.(row) ?? {
                  label: formatLabel(row.status),
                  variant: statusToVariant[row.status ?? ""] ?? "default",
                };

                return (
                  <TableRow key={row.id}>
                    <TableCell>
                      <p className="font-medium">{row.primary}</p>
                      <p className="text-xs text-muted-foreground md:hidden">{row.secondary ?? ""}</p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{row.secondary ?? "—"}</TableCell>
                    <TableCell className="hidden lg:table-cell">{row.detail ?? "—"}</TableCell>
                    {columns.map((column) => (
                      <TableCell key={column.key}>{column.render(row)}</TableCell>
                    ))}
                    <TableCell className="hidden lg:table-cell">{row.date ? formatDate.format(row.date) : "—"}</TableCell>
                    <TableCell>
                      <StatBadge status={badge.variant} label={badge.label} />
                    </TableCell>
                    {actions && <TableCell className="text-right">{actions(row)}</TableCell>}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5 + columns.length} className="py-10 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}