"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// Card skeleton loader
interface CardSkeletonProps {
  count?: number;
  showAvatar?: boolean;
  showImage?: boolean;
  lines?: number;
  className?: string;
}

export function CardSkeleton({
  count = 1,
  showAvatar = false,
  showImage = false,
  lines = 3,
  className,
}: CardSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border bg-card p-6 space-y-4"
        >
          {/* Image placeholder */}
          {showImage && (
            <Skeleton className="h-40 w-full rounded-xl" />
          )}

          {/* Header with optional avatar */}
          <div
            className={cn(
              "flex items-start gap-3",
              showAvatar ? "" : "justify-between"
            )}
          >
            {showAvatar && (
              <div className="space-y-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[120px]" />
                  <Skeleton className="h-3 w-[80px]" />
                </div>
              </div>
            )}
            {!showAvatar && (
              <>
                <Skeleton className="h-5 w-[200px]" />
                <Skeleton className="h-8 w-[80px] rounded-full" />
              </>
            )}
          </div>

          {/* Content lines */}
          <div className="space-y-2">
            {Array.from({ length: lines }).map((_, j) => (
              <Skeleton
                key={j}
                className={cn(
                  "h-4",
                  j === lines - 1 ? "w-3/4" : "w-full"
                )}
              />
            ))}
          </div>

          {/* Footer actions */}
          <div className="flex items-center gap-2 pt-2">
            <Skeleton className="h-9 w-24 rounded-lg" />
            <Skeleton className="h-9 w-20 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Stats card skeleton loader
interface StatsCardSkeletonProps {
  count?: number;
  className?: string;
}

export function StatsCardSkeleton({ count = 4, className }: StatsCardSkeletonProps) {
  return (
    <div className={cn("grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border bg-card p-6 space-y-3">
          <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-28" />
            </div>
            <Skeleton className="h-12 w-12 rounded-xl" />
          </div>
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}

// Table skeleton loader
interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  className?: string;
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  showHeader = true,
  className,
}: TableSkeletonProps) {
  return (
    <div className={cn("rounded-2xl border bg-card overflow-hidden", className)}>
      {/* Optional header section */}
      {showHeader && (
        <div className="p-6 pb-0 space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-7 w-48" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-[250px] rounded-lg" />
              <Skeleton className="h-10 w-10 rounded-lg" />
            </div>
          </div>
        </div>
      )}

      {/* Table header */}
      <div className="px-6 pt-6">
        <div className="flex items-center gap-4 pb-4 border-b">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      </div>

      {/* Table rows */}
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex items-center gap-4 px-6 py-4">
            {/* Avatar column (first) */}
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />

            {/* Data columns */}
            {Array.from({ length: columns - 1 }).map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                className={cn(
                  "h-4 flex-1",
                  colIndex === columns - 2 && "w-2/3"
                )}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Pagination footer */}
      <div className="p-4 border-t flex justify-between items-center">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// List skeleton loader
interface ListSkeletonProps {
  count?: number;
  showAvatar?: boolean;
  showSecondary?: boolean;
  className?: string;
}

export function ListSkeleton({
  count = 5,
  showAvatar = true,
  showSecondary = true,
  className,
}: ListSkeletonProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 rounded-xl border bg-card"
        >
          {showAvatar && (
            <Skeleton className="h-12 w-12 rounded-full shrink-0" />
          )}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-[180px]" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            {showSecondary && (
              <Skeleton className="h-4 w-[280px]" />
            )}
          </div>
          <Skeleton className="h-8 w-8 rounded-md shrink-0" />
        </div>
      ))}
    </div>
  );
}

// Page header skeleton
export function PageHeaderSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4 mb-6 lg:mb-8", className)}>
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-28" />
      </div>

      {/* Title and description */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Skeleton className="h-10 w-32 rounded-lg" />
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>
    </div>
  );
}

// Dashboard overview skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <PageHeaderSkeleton />

      {/* Stats cards */}
      <StatsCardSkeleton count={4} />

      {/* Two column layout */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Chart area */}
        <div className="lg:col-span-4 rounded-2xl border bg-card p-6 space-y-4">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-[300px] w-full rounded-xl" />
        </div>

        {/* Activity feed */}
        <div className="lg:col-span-3 rounded-2xl border bg-card p-6 space-y-4">
          <Skeleton className="h-6 w-28" />
          <ListSkeleton count={4} showSecondary={false} />
        </div>
      </div>

      {/* Recent table */}
      <TableSkeleton rows={5} columns={5} />
    </div>
  );
}

// Profile/Detail page skeleton
export function ProfileSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Profile header */}
      <div className="rounded-2xl border bg-card overflow-hidden">
        {/* Cover image */}
        <Skeleton className="h-32 sm:h-48 w-full" />

        {/* Avatar and info */}
        <div className="p-6 sm:p-8 -mt-12 sm:-mt-16 relative">
          <Skeleton className="h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-card" />
          <div className="mt-4 space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Content tabs */}
      <div className="space-y-4">
        <div className="flex gap-4 border-b pb-4">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-20" />
        </div>

        {/* Tab content */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border p-4 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-32" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
