"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-12 px-4",
        className
      )}
    >
      {/* Icon */}
      {Icon && (
        <div className="mb-6 relative">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
            <Icon className="w-10 h-10 text-muted-foreground/60" />
          </div>
          {/* Decorative ring */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-muted-foreground/20 animate-pulse" />
        </div>
      )}

      {/* Content */}
      <h3 className="font-serif text-xl font-semibold text-foreground mb-2 max-w-md">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
          {description}
        </p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {action && (
            action.href ? (
              <a href={action.href}>
                <Button
                  onClick={action.onClick}
                  className="gradient-spiritual text-white hover:opacity-90 transition-opacity"
                >
                  {action.label}
                </Button>
              </a>
            ) : (
              <Button
                onClick={action.onClick}
                className="gradient-spiritual text-white hover:opacity-90 transition-opacity"
              >
                {action.label}
              </Button>
            )
          )}

          {secondaryAction &&
            (secondaryAction.href ? (
              <a href={secondaryAction.href}>
                <Button variant="outline" onClick={secondaryAction.onClick}>
                  {secondaryAction.label}
                </Button>
              </a>
            ) : (
              <Button variant="outline" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            ))}
        </div>
      )}
    </div>
  );
}

// Pre-configured empty states for common use cases
interface EmptyStateConfig {
  [key: string]: {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
  };
}

// Import icons for pre-configured states
import {
  Users,
  CalendarDays,
  FolderOpen,
  MessageSquare,
  Search,
  Inbox,
  FileText,
  Heart,
} from "lucide-react";

export const emptyStates = {
  members: {
    icon: Users,
    title: "Aucun membre trouvé",
    description:
      "Commencez par ajouter des membres à votre église pour gérer votre communauté.",
    actionLabel: "Ajouter un membre",
    actionHref: "/dashboard/membres/nouveau",
  },
  events: {
    icon: CalendarDays,
    title: "Aucun événement prévu",
    description:
      "Créez un événement pour rassembler votre communauté et partager vos activités.",
    actionLabel: "Créer un événement",
    actionHref: "/dashboard/evenements/nouveau",
  },
  groups: {
    icon: FolderOpen,
    title: "Aucun groupe de vie",
    description:
      "Les groupes de vie permettent aux membres de se connecter plus profondément.",
    actionLabel: "Créer un groupe",
    actionHref: "/dashboard/groupes/nouveau",
  },
  messages: {
    icon: MessageSquare,
    title: "Pas de messages",
    description:
      "Votre boîte de réception est vide. Les notifications apparaîtront ici.",
  },
  search: {
    icon: Search,
    title: "Aucun résultat",
    description:
      "Nous n&apos;avons trouvé aucun résultat pour votre recherche. Essayez avec d'autres termes.",
  },
  donations: {
    icon: Heart,
    title: "Aucun don enregistré",
    description:
      "Les dons effectués par les membres apparaîtront ici pour le suivi.",
    actionLabel: "Voir les options de don",
    actionHref: "/dashboard/dons",
  },
  sermons: {
    icon: FileText,
    title: "Aucune prédication",
    description:
      "Les prédications récentes seront affichées ici pour que chacun puisse les écouter.",
    actionLabel: "Ajouter une prédication",
    actionHref: "/dashboard/predications/nouvelle",
  },
  notifications: {
    icon: Inbox,
    title: "Tout est à jour !",
    description:
      "Vous n'avez pas de nouvelles notifications pour le moment.",
  },
} as const;

type EmptyStateKey = keyof typeof emptyStates;

interface QuickEmptyStateProps extends Omit<EmptyStateProps, "icon" | "title" | "description" | "action"> {
  type: EmptyStateKey;
  customAction?: EmptyStateProps["action"];
  customSecondaryAction?: EmptyStateProps["secondaryAction"];
}

export function QuickEmptyState({
  type,
  customAction,
  customSecondaryAction,
  ...props
}: QuickEmptyStateProps) {
  const config = emptyStates[type];

  // Get action config - check if actionLabel exists on config
  const hasAction = "actionLabel" in config && !!config.actionLabel;
  
  return (
    <EmptyState
      icon={config.icon}
      title={config.title}
      description={config.description}
      action={
        customAction || hasAction
          ? {
              label: customAction?.label || (hasAction ? (config as any).actionLabel : ""),
              href: customAction?.href || (hasAction ? (config as any).actionHref : undefined),
              onClick: customAction?.onClick,
            }
          : undefined
      }
      secondaryAction={customSecondaryAction}
      {...props}
    />
  );
}
