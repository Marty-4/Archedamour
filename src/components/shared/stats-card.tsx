"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

// Stats card variants
type StatsCardVariant = "default" | "violet" | "gold" | "teal" | "coral" | "emerald";

// Variant color configurations
const variantStyles: Record<StatsCardVariant, string> = {
  default: "bg-card border-border",
  violet:
    "bg-gradient-to-br from-violet-500/10 to-purple-600/5 border-violet-200/50 dark:border-violet-800/30",
  gold:
    "bg-gradient-to-br from-amber-500/10 to-yellow-600/5 border-amber-200/50 dark:border-amber-800/30",
  teal:
    "bg-gradient-to-br from-teal-500/10 to-cyan-600/5 border-teal-200/50 dark:border-teal-800/30",
  coral:
    "bg-gradient-to-br from-rose-500/10 to-orange-600/5 border-rose-200/50 dark:border-rose-800/30",
  emerald:
    "bg-gradient-to-br from-emerald-500/10 to-green-600/5 border-emerald-200/50 dark:border-emerald-800/30",
};

const iconBgStyles: Record<StatsCardVariant, string> = {
  default: "bg-muted text-muted-foreground",
  violet: "bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400",
  gold: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400",
  teal: "bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400",
  coral: "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400",
  emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",
};

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label?: string;
  };
  variant?: StatsCardVariant;
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant = "default",
  className,
}: StatsCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) return <TrendingUp className="h-3.5 w-3.5" />;
    if (trend.value < 0) return <TrendingDown className="h-3.5 w-3.5" />;
    return <Minus className="h-3.5 w-3.5" />;
  };

  const getTrendColor = () => {
    if (!trend) return "";
    if (trend.value > 0) return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30";
    if (trend.value < 0) return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30";
    return "text-muted-foreground bg-muted";
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:shadow-md",
        variantStyles[variant],
        className
      )}
    >
      {/* Background decoration */}
      {variant !== "default" && (
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-current opacity-5 blur-2xl" />
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 flex-1 min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight truncate">
            {value}
          </p>

          {/* Trend indicator */}
          {trend && (
            <div className="flex items-center gap-1.5 mt-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                  getTrendColor()
                )}
              >
                {getTrendIcon()}
                <span>{Math.abs(trend.value)}%</span>
              </span>
              {trend.label && (
                <span className="text-xs text-muted-foreground">
                  {trend.label}
                </span>
              )}
            </div>
          )}

          {/* Description */}
          {description && (
            <p className="text-sm text-muted-foreground mt-2">{description}</p>
          )}
        </div>

        {/* Icon */}
        {Icon && (
          <div
            className={cn(
              "flex items-center justify-center w-12 h-12 rounded-xl shrink-0 transition-transform duration-300 group-hover:scale-110",
              iconBgStyles[variant]
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </div>
  );
}

// Stats grid component for displaying multiple cards
interface StatsGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function StatsGrid({
  children,
  columns = 4,
  className,
}: StatsGridProps) {
  const columnClasses = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", columnClasses[columns], className)}>
      {children}
    </div>
  );
}
