"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  CalendarClock,
  CreditCard,
  FolderOpen,
  MessageSquare as MicIcon,
  BarChart3,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Home,
  HelpCircle,
  UserCircle,
  Church,
  Music,
  BookOpen,
  HandHeart,
  Heart,
  UserPlus,
  Shield,
  Video,
  FileText,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Member navigation items
const memberNavItems = [
  {
    label: "Tableau de bord",
    href: "/member/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Mon Profil",
    href: "/member/profile",
    icon: UserCircle,
  },
  {
    label: "Cultes",
    href: "/member/cultes",
    icon: CalendarClock,
  },
  {
    label: "Prédications",
    href: "/member/predications",
    icon: MicIcon,
  },
  {
    label: "Événements",
    href: "/member/evenements",
    icon: CalendarDays,
  },
  {
    label: "Prières",
    href: "/member/prieres",
    icon: Heart,
  },
  {
    label: "Dons",
    href: "/member/dons",
    icon: CreditCard,
  },
  {
    label: "Groupes",
    href: "/member/groupes",
    icon: FolderOpen,
  },
];

const memberSecondaryNavItems = [
  {
    label: "Communauté",
    href: "/member/communaute",
    icon: UsersRound,
  },
  {
    label: "Bibliothèque",
    href: "/member/bibliotheque",
    icon: BookOpen,
  },
  {
    label: "Louange",
    href: "/member/louange",
    icon: Music,
  },
];

// Admin navigation items
const adminNavItems = [
  {
    label: "Tableau de bord",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Membres",
    href: "/admin/membres",
    icon: Users,
    badge: "1.2K",
  },
  {
    label: "Utilisateurs",
    href: "/admin/utilisateurs",
    icon: UserPlus,
  },
  {
    label: "Cultes",
    href: "/admin/cultes",
    icon: CalendarClock,
  },
  {
    label: "Événements",
    href: "/admin/evenements",
    icon: CalendarDays,
  },
  {
    label: "Prédications",
    href: "/admin/predications",
    icon: MicIcon,
  },
  {
    label: "Prières",
    href: "/admin/prieres",
    icon: Heart,
  },
  {
    label: "Dons",
    href: "/admin/dons",
    icon: CreditCard,
  },
  {
    label: "Groupes",
    href: "/admin/groupes",
    icon: FolderOpen,
  },
];

const adminSecondaryNavItems = [
  {
    label: "Départements",
    href: "/admin/departements",
    icon: HandHeart,
  },
  {
    label: "Live Studio",
    href: "/admin/live-studio",
    icon: Video,
  },
  {
    label: "Notifications",
    href: "/admin/notifications",
    icon: Bell,
    badge: "5",
  },
  {
    label: "Rapports",
    href: "/admin/rapports",
    icon: BarChart3,
  },
  {
    label: "Paramètres",
    href: "/admin/parametres",
    icon: Settings,
  },
];

const bottomNavItems = [
  {
    label: "Aide",
    href: "#",
    icon: HelpCircle,
  },
  {
    label: "Déconnexion",
    href: "/login",
    icon: LogOut,
  },
];

// Mobile bottom navigation items - Member
const memberMobileNavItems = [
  {
    label: "Accueil",
    href: "/member/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Profil",
    href: "/member/profile",
    icon: UserCircle,
  },
  {
    label: "Prières",
    href: "/member/prieres",
    icon: Heart,
  },
  {
    label: "Dons",
    href: "/member/dons",
    icon: CreditCard,
  },
  {
    label: "Plus",
    href: "#",
    icon: Menu,
  },
];

// Mobile bottom navigation items - Admin
const adminMobileNavItems = [
  {
    label: "Accueil",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Membres",
    href: "/admin/membres",
    icon: Users,
  },
  {
    label: "Événements",
    href: "/admin/evenements",
    icon: CalendarDays,
  },
  {
    label: "Rapports",
    href: "/admin/rapports",
    icon: BarChart3,
  },
  {
    label: "Plus",
    href: "#",
    icon: Menu,
  },
];

// Props for sidebar content
interface SidebarContentProps {
  variant: 'member' | 'admin';
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
  pathname: string;
  sidebarCollapsed: boolean;
  isMobile: boolean;
  onMobileClose: () => void;
  onToggleCollapse: () => void;
}

// Sidebar Content Component (defined outside to avoid creating during render)
function SidebarContent({
  variant,
  user,
  pathname,
  sidebarCollapsed,
  isMobile,
  onMobileClose,
  onToggleCollapse,
}: SidebarContentProps) {
  // Select nav items based on variant
  const mainNavItems = variant === 'admin' ? adminNavItems : memberNavItems;
  const secondaryNavItems = variant === 'admin' ? adminSecondaryNavItems : memberSecondaryNavItems;

  const isActive = (href: string) => {
    if (href === "/member/dashboard" || href === "/admin/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo / Brand */}
      <div
        className={cn(
          "flex items-center h-16 px-4 border-b border-border shrink-0",
          sidebarCollapsed && !isMobile ? "justify-center" : "justify-between"
        )}
      >
        {!sidebarCollapsed || isMobile ? (
          <Link href={variant === 'admin' ? '/admin/dashboard' : '/member/dashboard'} className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl gradient-spiritual flex items-center justify-center shadow-md shrink-0">
              <Church className="h-5 w-5 text-white" />
            </div>
            <AnimatePresence>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-serif text-lg font-semibold whitespace-nowrap"
              >
                Church<span className="text-primary">Connect</span>
              </motion.span>
            </AnimatePresence>
            {variant === 'admin' && (
              <Badge variant="secondary" className="ml-2 text-xs bg-amber-100 text-amber-700 hover:bg-amber-100">
                Admin
              </Badge>
            )}
          </Link>
        ) : (
          <Link href={variant === 'admin' ? '/admin/dashboard' : '/member/dashboard'}>
            <div className="w-9 h-9 rounded-xl gradient-spiritual flex items-center justify-center shadow-md">
              <Church className="h-5 w-5 text-white" />
            </div>
          </Link>
        )}

        {/* Close button for mobile */}
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMobileClose}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        )}

        {/* Collapse toggle - desktop only */}
        {!isMobile && (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleCollapse}
                  className={cn(
                    "hidden lg:flex transition-all duration-300",
                    sidebarCollapsed && "rotate-180"
                  )}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {sidebarCollapsed ? "Étendre" : "Réduire"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {/* Main navigation */}
        <div className="space-y-1">
          {(sidebarCollapsed && !isMobile) ? null : (
            <p
              className={cn(
                "px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
                sidebarCollapsed && !isMobile && "hidden"
              )}
            >
              Principal
            </p>
          )}
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <TooltipProvider key={item.href} delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      onClick={() => isMobile && onMobileClose()}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                        sidebarCollapsed && !isMobile && "justify-center px-2"
                      )}
                    >
                      {active && (
                        <motion.div
                          layoutId={`activeSidebar-${variant}`}
                          className="absolute inset-0 bg-primary/10 rounded-xl"
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 30,
                          }}
                        />
                      )}
                      <Icon className="relative z-10 h-5 w-5 shrink-0" />
                      <AnimatePresence>
                        {(!sidebarCollapsed || isMobile) && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            className="relative z-10 whitespace-nowrap overflow-hidden"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {item.badge && (!sidebarCollapsed || isMobile) && (
                        <Badge
                          variant="secondary"
                          className="relative z-10 ml-auto text-xs"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </TooltipTrigger>
                  {sidebarCollapsed && !isMobile && (
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>

        {/* Secondary navigation */}
        <div className="space-y-1">
          {(sidebarCollapsed && !isMobile) ? null : (
            <p
              className={cn(
                "px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
                sidebarCollapsed && !isMobile && "hidden"
              )}
            >
              {variant === 'admin' ? 'Administration' : 'Contenu'}
            </p>
          )}
          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <TooltipProvider key={item.href} delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      onClick={() => isMobile && onMobileClose()}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                        sidebarCollapsed && !isMobile && "justify-center px-2"
                      )}
                    >
                      <Icon className="relative z-10 h-5 w-5 shrink-0" />
                      <AnimatePresence>
                        {(!sidebarCollapsed || isMobile) && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            className="relative z-10 whitespace-nowrap overflow-hidden"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {item.badge && (!sidebarCollapsed || isMobile) && (
                        <Badge
                          variant="secondary"
                          className="relative z-10 ml-auto text-xs bg-rose-100 text-rose-600 hover:bg-rose-100"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </TooltipTrigger>
                  {sidebarCollapsed && !isMobile && (
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>

        {/* Bottom navigation */}
        <div className="space-y-1 pt-4 border-t border-border mt-auto">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;

            return (
              <TooltipProvider key={item.href} delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      onClick={() => isMobile && onMobileClose()}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-accent/50",
                        sidebarCollapsed && !isMobile && "justify-center px-2"
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <AnimatePresence>
                        {(!sidebarCollapsed || isMobile) && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            className="whitespace-nowrap overflow-hidden"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Link>
                  </TooltipTrigger>
                  {sidebarCollapsed && !isMobile && (
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </nav>

      {/* User section */}
      <div
        className={cn(
          "shrink-0 p-3 border-t border-border",
          sidebarCollapsed && !isMobile && "flex justify-center"
        )}
      >
        <div
          className={cn(
            "flex items-center gap-3",
            sidebarCollapsed && !isMobile && "justify-center"
          )}
        >
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarImage src={user?.image ?? undefined} alt={user?.name || ""} />
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <AnimatePresence>
            {(!sidebarCollapsed || isMobile) && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden"
              >
                <p className="text-sm font-medium truncate">
                  {user?.name || "Utilisateur"}
                </p>
                <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                  {variant === 'admin' && <Shield className="w-3 h-3 text-amber-500" />}
                  {user?.email || "user@churchconnect.app"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Main Layout Interface
interface DashboardLayoutProps {
  children: React.ReactNode;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
  variant?: 'member' | 'admin';
}

// Main Dashboard Layout Component
export function DashboardLayout({ children, user, variant = 'member' }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Select mobile nav items based on variant
  const mobileNavItems = variant === 'admin' ? adminMobileNavItems : memberMobileNavItems;

  const isActive = (href: string) => {
    if (href === "/member/dashboard" || href === "/admin/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  // Handlers for sidebar content
  const handleMobileClose = () => setMobileSidebarOpen(false);
  const handleToggleCollapse = () => setSidebarCollapsed(!sidebarCollapsed);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:block fixed top-0 left-0 bottom-0 z-40 bg-card border-r border-border transition-all duration-300",
          sidebarCollapsed ? "w-[72px]" : "w-[260px]"
        )}
      >
        <SidebarContent
          variant={variant}
          user={user}
          pathname={pathname}
          sidebarCollapsed={sidebarCollapsed}
          isMobile={false}
          onMobileClose={handleMobileClose}
          onToggleCollapse={handleToggleCollapse}
        />
      </aside>

      {/* Main content wrapper */}
      <div
        className={cn(
          "transition-all duration-300",
          sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-[260px]"
        )}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            {/* Left side */}
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              {/* Search bar */}
              <div className="hidden sm:flex items-center relative max-w-md">
                <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  className="pl-10 w-full sm:w-[280px] lg:w-[360px] rounded-xl"
                />
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative"
                    >
                      <Bell className="h-5 w-5" />
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Notifications</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* User avatar dropdown trigger */}
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hidden sm:flex"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.image ?? undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {user?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Mon compte</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6 pb-20 lg:pb-6">{children}</main>

        {/* Mobile bottom navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border safe-area-pb">
          <div className="flex items-center justify-around h-16">
            {mobileNavItems.slice(0, -1).map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 w-16 h-full relative transition-colors",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId={`activeMobileNav-${variant}`}
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-b-full bg-primary"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                  <Icon className="h-5 w-5" />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              );
            })}
            {/* More button */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="flex flex-col items-center justify-center gap-1 w-16 h-full text-muted-foreground"
            >
              <Menu className="h-5 w-5" />
              <span className="text-[10px] font-medium">Plus</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />

            {/* Slide-out sidebar */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] max-w-[85vw] bg-card border-r border-border z-50 lg:hidden"
            >
              <SidebarContent
                variant={variant}
                user={user}
                pathname={pathname}
                sidebarCollapsed={false}
                isMobile={true}
                onMobileClose={handleMobileClose}
                onToggleCollapse={handleToggleCollapse}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
