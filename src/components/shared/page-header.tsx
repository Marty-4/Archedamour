"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

// Breadcrumb item type
interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
  children,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6 lg:mb-8",
        className
      )}
    >
      <div className="space-y-2 flex-1 min-w-0">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="flex items-center text-sm">
            <ol className="flex items-center flex-wrap gap-1.5">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Home className="h-3.5 w-3.5" />
                  <span className="sr-only">Accueil</span>
                </Link>
              </li>
              {breadcrumbs.map((item, index) => (
                <li key={index} className="flex items-center gap-1.5">
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="text-muted-foreground hover:text-foreground transition-colors truncate max-w-[150px]"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-foreground font-medium truncate max-w-[200px]">
                      {item.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Title and description */}
        <div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-muted-foreground text-sm sm:text-base max-w-2xl leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Additional content below title */}
        {children}
      </div>

      {/* Action buttons */}
      {actions && (
        <div className="flex items-center gap-2 shrink-0 sm:mt-0">
          {actions}
        </div>
      )}
    </div>
  );
}
