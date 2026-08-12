'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Calendar, 
  PlayCircle, 
  Users, 
  BookOpen,
  Heart,
  ChevronUp,
  Menu,
  X,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Main navigation items for bottom nav
const mainNavItems = [
  {
    label: 'Accueil',
    href: '/',
    icon: Home,
    activeIcon: Home,
  },
  {
    label: 'Cultes',
    href: '/services',
    icon: Calendar,
    activeIcon: Calendar,
  },
  {
    label: 'Live',
    href: '/live',
    icon: PlayCircle,
    activeIcon: PlayCircle,
    isSpecial: true, // Highlighted button
  },
  {
    label: 'Groupes',
    href: '/groups',
    icon: Users,
    activeIcon: Users,
  },
  {
    label: 'Plus',
    href: '/more',
    icon: ChevronUp,
    activeIcon: ChevronUp,
  },
];

// Additional items shown in "Plus" menu
const moreItems = [
  { label: 'Prédications', href: '/sermons', icon: BookOpen },
  { label: 'Événements', href: '/events', icon: Calendar },
  { label: 'Prières', href: '/member/prayers', icon: Heart },
  { label: 'Donner', href: '/give', icon: Heart },
  { label: 'À propos', href: '/about', icon: Users },
];

interface BottomNavProps {
  className?: string;
}

export function BottomNav({ className }: BottomNavProps) {
  const pathname = usePathname();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll detection (optional enhancement)
  if (typeof window !== 'undefined') {
    // Could add scroll listener here for hide-on-scroll behavior
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 md:hidden",
          "bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl",
          "border-t border-slate-200/80 dark:border-slate-700/50",
          "px-2 pb-[env(safe-area-inset-bottom)]",
          className
        )}
        style={{
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.05)'
        }}
      >
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {mainNavItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            
            // Special center button (Live)
            if (item.isSpecial) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex flex-col items-center justify-center w-16 h-14 -mt-4"
                >
                  <div className={cn(
                    "absolute -top-2 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300",
                    "bg-gradient-to-br from-sky-500 to-blue-600 dark:from-sky-400 dark:to-blue-500",
                    "shadow-lg shadow-sky-500/30 dark:shadow-sky-400/20",
                    active && "scale-105 ring-4 ring-sky-100 dark:ring-sky-900/30"
                  )}>
                    {active && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    )}
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className={cn(
                    "text-[10px] mt-1 font-medium transition-colors",
                    active ? "text-sky-600 dark:text-sky-400" : "text-slate-500 dark:text-slate-400"
                  )}>
                    {item.label}
                  </span>
                </Link>
              );
            }
            
            // Regular nav items
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center justify-center w-14 py-1"
              >
                <div className={cn(
                  "relative p-1.5 rounded-xl transition-all duration-200",
                  active && "bg-sky-50 dark:bg-sky-950/30"
                )}>
                  <Icon className={cn(
                    "w-5 h-5 transition-all duration-200",
                    active 
                      ? "text-sky-600 dark:text-sky-400 stroke-[2.5]" 
                      : "text-slate-400 dark:text-slate-500"
                  )} />
                  {/* Active indicator dot */}
                  {active && (
                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-sky-600 dark:bg-sky-400" />
                  )}
                </div>
                <span className={cn(
                  "text-[10px] mt-0.5 font-medium transition-colors",
                  active ? "text-sky-600 dark:text-sky-400" : "text-slate-500 dark:text-slate-400"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* More Menu Overlay */}
        {showMoreMenu && (
          <div className="absolute bottom-full left-0 right-0 pb-2 px-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200/60 dark:border-slate-700/50 p-3 space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
                Plus d'options
              </p>
              {moreItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMoreMenu(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-900/30 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Desktop Top Navigation Bar */}
      <nav className={cn(
        "hidden md:flex fixed top-0 left-0 right-0 z-50 h-16",
        "bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl",
        "border-b border-slate-200/60 dark:border-slate-800/60"
      )}>
        <div className="max-w-7xl mx-auto w-full px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-md shadow-sky-500/25 group-hover:shadow-lg transition-shadow">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="font-bold text-lg text-slate-800 dark:text-white">
              Arche d<span className="text-sky-500">'</span>Amour
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden lg:flex items-center gap-1">
            {[
              { label: 'Accueil', href: '/' },
              { label: 'Cultes', href: '/services' },
              { label: 'Prédications', href: '/sermons' },
              { label: 'Événements', href: '/events' },
              { label: 'Live', href: '/live' },
              { label: 'Groupes', href: '/groups' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive(link.href)
                    ? "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-sky-600">
              <Search className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" className="text-slate-600 hidden sm:flex">
              Connexion
            </Button>
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-md shadow-sky-500/25"
            >
              Rejoindre
            </Button>
          </div>
        </div>
      </nav>
    </>
  );
}

// Hook to add bottom padding to content on mobile
export function useBottomNavPadding() {
  return 'pb-20 md:pb-0';
}
