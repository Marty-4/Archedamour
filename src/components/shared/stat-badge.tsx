"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// Status badge variants
export type StatusVariant =
  | "active"
  | "inactive"
  | "pending"
  | "cancelled"
  | "completed"
  | "archived"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "default";

// Status configuration
const statusConfig: Record<
  StatusVariant,
  { label: string; className: string; dotClass: string }
> = {
  active: {
    label: "Actif",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
    dotClass: "bg-emerald-500",
  },
  inactive: {
    label: "Inactif",
    className:
      "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800/40 dark:text-gray-400 dark:border-gray-700",
    dotClass: "bg-gray-500",
  },
  pending: {
    label: "En attente",
    className:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
    dotClass: "bg-amber-500",
  },
  cancelled: {
    label: "Annulé",
    className:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
    dotClass: "bg-red-500",
  },
  completed: {
    label: "Terminé",
    className:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
    dotClass: "bg-blue-500",
  },
  archived: {
    label: "Archivé",
    className:
      "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700",
    dotClass: "bg-slate-400",
  },
  success: {
    label: "Succès",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
    dotClass: "bg-emerald-500",
  },
  warning: {
    label: "Attention",
    className:
      "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800",
    dotClass: "bg-orange-500",
  },
  error: {
    label: "Erreur",
    className:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
    dotClass: "bg-red-500",
  },
  info: {
    label: "Info",
    className:
      "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800",
    dotClass: "bg-violet-500",
  },
  default: {
    label: "",
    className:
      "bg-secondary text-secondary-foreground border-border",
    dotClass: "bg-muted-foreground",
  },
};

interface StatBadgeProps extends Omit<React.ComponentProps<typeof Badge>, "variant" | "children"> {
  status?: StatusVariant;
  label?: string;
  showDot?: boolean;
  size?: "sm" | "md" | "lg";
}

export function StatBadge({
  status = "default",
  label,
  showDot = true,
  size = "md",
  className,
  ...props
}: StatBadgeProps) {
  const config = statusConfig[status];
  const displayLabel = label || config.label;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  const dotSizes = {
    sm: "h-1.5 w-1.5",
    md: "h-2 w-2",
    lg: "h-2.5 w-2.5",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1.5 font-medium select-none transition-colors",
        config.className,
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {showDot && (
        <span
          className={cn("rounded-full shrink-0", config.dotClass, dotSizes[size])}
        />
      )}
      {displayLabel}
    </Badge>
  );
}

// Pre-configured status badges for common use cases

// Membership status
export function MembershipStatusBadge({
  status,
  ...props
}: Omit<StatBadgeProps, "status"> & { status: "active" | "inactive" | "pending" }) {
  return <StatBadge status={status} {...props} />;
}

// Event status
export function EventStatusBadge({
  status,
  ...props
}: Omit<StatBadgeProps, "status"> & {
  status: "pending" | "active" | "completed" | "cancelled" | "archived";
}) {
  return <StatBadge status={status} {...props} />;
}

// Payment/Donation status
export function PaymentStatusBadge({
  status,
  ...props
}: Omit<StatBadgeProps, "status"> & {
  status: "pending" | "success" | "error" | "cancelled";
}) {
  return <StatBadge status={status} {...props} />;
}

// Attendance status
export function AttendanceStatusBadge({
  status,
  ...props
}: Omit<StatBadgeProps, "status"> & {
  status: "present" | "absent" | "excused" | "late";
}) {
  const attendanceMap = {
    present: "success" as const,
    absent: "error" as const,
    excused: "warning" as const,
    late: "warning" as const,
  };

  const labels = {
    present: "Présent",
    absent: "Absent",
    excusé: "Excusé",
    late: "En retard",
  };

  return (
    <StatBadge
      status={attendanceMap[status]}
      label={labels[status]}
      {...props}
    />
  );
}

// Group membership role
export function RoleBadge({ role }: { role: "admin" | "leader" | "member" }) {
  const roleConfig = {
    admin: {
      status: "error" as StatusVariant,
      label: "Administrateur",
    },
    leader: {
      status: "info" as StatusVariant,
      label: "Responsable",
    },
    member: {
      status: "default" as StatusVariant,
      label: "Membre",
    },
  };

  return (
    <StatBadge
      status={roleConfig[role].status}
      label={roleConfig[role].label}
    />
  );
}
