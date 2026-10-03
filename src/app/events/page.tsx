"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from '@/lib/no-motion';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
  Filter,
  Grid3X3,
  List,
  Search,
  X,
  CalendarDays,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  UserPlus,
} from "lucide-react";
import { PublicLayout } from "@/components/layouts/public-layout";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ============================================
// TYPES
// ============================================

interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // ISO format
  endDate?: string;
  time: string;
  endTime?: string;
  location: string;
  address?: string;
  category: string;
  organizer: {
    name: string;
    role: string;
    avatar?: null | string;
    initials: string;
  };
  maxSpots?: number;
  registeredCount: number;
  isUpcoming: boolean;
  status: "open" | "full" | "cancelled" | "ended";
  image?: string;
}

// ============================================
// MOCK DATA
// ============================================

const allEvents: Event[] = [
  {
    id: "evt_001",
    title: "Retraite de Fin d'Année",
    description:
      "Trois jours de jeûne, prière et enseignement pour clôturer l'année dans la présence de Dieu. Au programme : enseignements bibliques, temps de prière intense, adoration collective et moments de fellowship.",
    date: "2024-12-28",
    endDate: "2024-12-30",
    time: "08:00",
    endTime: "17:00",
    location: "Centre de Retraite Kinshasa",
    address: "Boulevard Lumumba, Kinshasa",
    category: "Retraite",
    organizer: {
      name: "Pasteur Lesty Paka",
      role: "Pasteur Principal",
      initials: "JL",
    },
    maxSpots: 200,
    registeredCount: 124,
    isUpcoming: true,
    status: "open",
  },
  {
    id: "evt_002",
    title: "Soirée des Enfants - Noël Spécial",
    description:
      "Célébration spéciale avec nos enfants pour Noël : chants, sketches bibliques, partage de cadeaux et goûter. Un moment inoubliable pour les petits!",
    date: "2024-12-24",
    time: "15:00",
    endTime: "18:00",
    location: "Salle Polyvalente",
    address: "Avenue des Églises, Kinshasa",
    category: "Enfants",
    organizer: {
      name: "Sœur Grace Mutombo",
      role: "Responsable Enfants",
      initials: "GM",
    },
    maxSpots: 150,
    registeredCount: 85,
    isUpcoming: true,
    status: "open",
  },
  {
    id: "evt_003",
    title: "Atelier pour Couples - Communication",
    description:
      "Renforcement des mariages selon les principes bibliques. Thème : Communiquer dans l'amour. Atelier pratique avec exercices en couple.",
    date: "2025-01-14",
    time: "09:00",
    endTime: "16:00",
    location: "Salle de Conférence",
    address: "Rue de la Paix, Kinshasa",
    category: "Couples",
    organizer: {
      name: "Frère François Mukendi",
      role: "Responsable Couples",
      initials: "FM",
    },
    maxSpots: 60,
    registeredCount: 45,
    isUpcoming: true,
    status: "open",
  },
  {
    id: "evt_004",
    title: "Camp des Jeunes 2025",
    description:
      "Une semaine de fellowship, sport et croissance spirituelle pour les jeunes de 15-25 ans. Theme cette année : 'Lever et Briller' (Ésaïe 60:1).",
    date: "2025-02-10",
    endDate: "2025-02-16",
    time: "Toute la journée",
    location: "Domaine N'Sele",
    address: "Route de Matadi, N'Sele",
    category: "Jeunesse",
    organizer: {
      name: "Équipe Jeunesse",
      role: "Département Jeunesse",
      initials: "EJ",
    },
    maxSpots: 250,
    registeredCount: 189,
    isUpcoming: true,
    status: "open",
  },
  {
    id: "evt_005",
    title: "Séminaire de Leadership",
    description:
      "Formation intensive sur le leadership chrétien selon le modèle de Jésus. Ouvert à tous les responsables de département et aspirants leaders.",
    date: "2025-01-20",
    endDate: "2025-01-21",
    time: "08:30",
    endTime: "17:30",
    location: "Temple Principal - Salle B",
    address: "Boulevard Lumumba, Kinshasa",
    category: "Formation",
    organizer: {
      name: "Pasteur Armèle",
      role: "Pasteur Second",
      initials: "A",
    },
    maxSpots: 80,
    registeredCount: 80,
    isUpcoming: true,
    status: "full",
  },
  {
    id: "evt_006",
    title: "Journée de Prière et Jeûn",
    description:
      "Une journée consacrée à la prière collective et au jeûn pour l'église, la nation et nos familles. Programme détaillé disponible à l'accueil.",
    date: "2025-01-05",
    time: "06:00",
    endTime: "18:00",
    location: "Temple Principal",
    address: "Boulevard Lumumba, Kinshasa",
    category: "Prière",
    organizer: {
      name: "Équipe d'Intercession",
      role: "Département Prière",
      initials: "EI",
    },
    registeredCount: 0,
    isUpcoming: true,
    status: "open",
  },
  // Past events
  {
    id: "evt_007",
    title: "Célébration de Thanksgiving",
    description:
      "Soirée d'action de grâce pour les bénédictions de l'année. Témoignages, louange et partage.",
    date: "2024-11-30",
    time: "17:00",
    endTime: "21:00",
    location: "Salle Polyvalente",
    category: "Célébration",
    organizer: {
      name: "Comité des Fêtes",
      role: "Organisation",
      initials: "CF",
    },
    maxSpots: 300,
    registeredCount: 267,
    isUpcoming: false,
    status: "ended",
  },
  {
    id: "evt_008",
    title: "Conférence Femmes - Identité en Christ",
    description:
      "Conférence annuelle pour les femmes sur leur identité en Christ. Conférencière invitée : Dr. Marie-Claire Nsenga.",
    date: "2024-11-15",
    endDate: "2024-11-16",
    time: "09:00",
    endTime: "17:00",
    location: "Centre des Congrès",
    category: "Femmes",
    organizer: {
      name: "Sœur Grace Mutombo",
      role: "Responsable Femmes",
      initials: "GM",
    },
    maxSpots: 400,
    registeredCount: 356,
    isUpcoming: false,
    status: "ended",
  },
  {
    id: "evt_009",
    title: "Tournoi Sportif Inter-Églises",
    description:
      "Tournoi de football et basketball avec les églises sœurs. Esprit sportif et fellowship!",
    date: "2024-10-20",
    time: "08:00",
    endTime: "18:00",
    location: "Stade Municipal",
    category: "Sport",
    organizer: {
      name: "Département Sports",
      role: "Loisirs",
      initials: "DS",
    },
    maxSpots: 200,
    registeredCount: 178,
    isUpcoming: false,
    status: "ended",
  },
];

const categories = [
  "Toutes",
  "Retraite",
  "Enfants",
  "Couples",
  "Jeunesse",
  "Formation",
  "Prière",
  "Célébration",
  "Femmes",
  "Sport",
];

const locations = ["Tous", "Temple Principal", "Salle Polyvalente", "Extérieur"];

const statusFilters = ["À venir", "Passés"];

// Status config
const statusConfig: Record<
  Event["status"],
  { label: string; icon: typeof CheckCircle; color: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  open: {
    label: "Ouvert",
    icon: CheckCircle,
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    variant: "default",
  },
  full: {
    label: "Complet",
    icon: AlertCircle,
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    variant: "secondary",
  },
  cancelled: {
    label: "Annulé",
    icon: XCircle,
    color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border-red-200 dark:border-red-800",
    variant: "destructive",
  },
  ended: {
    label: "Terminé",
    icon: CalendarDays,
    color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700",
    variant: "outline",
  },
};

// Category colors
const categoryColors: Record<string, string> = {
  Retraite: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400",
  Enfants: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-400",
  Couples: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400",
  Jeunesse: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-400",
  Formation: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  Prière: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400",
  Célébration: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  Femmes: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/40 dark:text-fuchsia-400",
  Sport: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
};

// Format date helpers
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

function getDayAndMonth(dateStr: string): { day: string; month: string } {
  const date = new Date(dateStr);
  return {
    day: date.getDate().toString(),
    month: date.toLocaleDateString("fr-FR", { month: "short" }).toUpperCase(),
  };
}

// Calendar helper
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Toutes");
  const [selectedLocation, setSelectedLocation] = useState("Tous");
  const [selectedStatus, setSelectedStatus] = useState("À venir");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [showFilters, setShowFilters] = useState(false);
  
  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Filter events
  const filteredEvents = useMemo(() => {
    return allEvents.filter((event) => {
      const matchesSearch =
        searchQuery === "" ||
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "Toutes" || event.category === selectedCategory;

      const matchesLocation =
        selectedLocation === "Tous" || event.location.includes(selectedLocation);

      const matchesStatus =
        selectedStatus === "À venir" ? event.isUpcoming : !event.isUpcoming;

      // If a date is selected in calendar view, filter by that date
      const matchesDate =
        !selectedDate ||
        new Date(event.date).toDateString() === selectedDate.toDateString();

      return matchesSearch && matchesCategory && matchesLocation && matchesStatus && matchesDate;
    });
  }, [searchQuery, selectedCategory, selectedLocation, selectedStatus, selectedDate]);

  // Get events for calendar
  const getEventsForDate = (date: Date) => {
    return allEvents.filter(
      (e) => new Date(e.date).toDateString() === date.toDateString()
    );
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days: (number | null)[] = [];

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const upcomingEvents = filteredEvents.filter((e) => e.isUpcoming);
  const pastEvents = filteredEvents.filter((e) => !e.isUpcoming);

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-violet-800 py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <PageHeader
              title="Événements"
              description="Découvrez et participez aux activités de notre communauté. Retrouvez tous les événements à venir."
              breadcrumbs={[{ label: "Événements" }]}
              className="text-slate-900 dark:text-white [&_h1]:text-slate-900 dark:[&_h1]:text-white [&_p]:text-slate-700 dark:[&_p]:text-white/80 [&_li]:text-slate-700 dark:[&_li]:text-white/60 [&_a]:text-slate-900 dark:[&_a]:text-white hover:[&_a]:text-sky-400"
            />

            {/* Stats */}
            <div className="flex flex-wrap gap-8 mt-8 pt-8 border-t border-white/20">
              <div>
                <p className="text-3xl font-bold text-white">
                  {allEvents.filter((e) => e.isUpcoming).length}
                </p>
                <p className="text-sm text-white/70">Événements à venir</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">
                  {categories.length - 1}
                </p>
                <p className="text-sm text-white/70">Catégories</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">
                  {allEvents.reduce((acc, e) => acc + e.registeredCount, 0)}
                </p>
                <p className="text-sm text-white/70">Participants totaux</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="currentColor"
              className="text-background"
            />
          </svg>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-6 border-b border-border sticky top-16 lg:top-20 bg-background/95 backdrop-blur-sm z-30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4">
            {/* Search bar */}
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher un événement..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-12 h-12 rounded-xl"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Controls row */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="rounded-lg"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtres
                {(selectedCategory !== "Toutes" ||
                  selectedLocation !== "Tous") && (
                  <Badge variant="secondary" className="ml-2 bg-primary text-primary-foreground">
                    {[selectedCategory !== "Toutes", selectedLocation !== "Tous"].filter(Boolean).length}
                  </Badge>
                )}
              </Button>

              <span className="text-sm text-muted-foreground hidden sm:block">
                {filteredEvents.length} événement{filteredEvents.length > 1 ? "s" : ""} trouvé{filteredEvents.length > 1 ? "s" : ""}
              </span>

              {/* View toggle */}
              <div className="flex items-center border rounded-lg p-1">
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-md px-3"
                >
                  <List className="w-4 h-4 mr-1" />
                  Liste
                </Button>
                <Button
                  variant={viewMode === "calendar" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("calendar")}
                  className="rounded-md px-3"
                >
                  <CalendarIcon className="w-4 h-4 mr-1" />
                  Calendrier
                </Button>
              </div>
            </div>

            {/* Expanded filters */}
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 space-y-4">
                  {/* Status filter */}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Période
                    </p>
                    <div className="flex gap-2">
                      {statusFilters.map((status) => (
                        <Button
                          key={status}
                          variant={selectedStatus === status ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedStatus(status)}
                          className={`rounded-lg ${
                            selectedStatus === status
                              ? "gradient-spiritual text-white border-0"
                              : ""
                          }`}
                        >
                          {status}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Categories and Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        Catégorie
                      </p>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="rounded-lg">
                          <SelectValue placeholder="Catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        Lieu
                      </p>
                      <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                        <SelectTrigger className="rounded-lg">
                          <SelectValue placeholder="Lieu" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((loc) => (
                            <SelectItem key={loc} value={loc}>
                              {loc}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Content Area */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            {viewMode === "list" ? (
              /* List View */
              <motion.div
                key="list-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Upcoming events section */}
                {upcomingEvents.length > 0 && (
                  <div className="mb-12">
                    <h2 className="font-serif text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                      <CalendarDays className="w-5 h-5 text-primary" />
                      Événements à venir
                    </h2>
                    <div className="space-y-4">
                      {upcomingEvents.map((event, index) => (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05, duration: 0.4 }}
                        >
                          <Link href={`/events/${event.id}`}>
                            <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border-border/50">
                              <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6">
                                {/* Date badge */}
                                <div className="shrink-0">
                                  <div className="w-16 h-16 sm:w-20 sm:h-20 gradient-spiritual rounded-xl flex flex-col items-center justify-center text-white shadow-lg">
                                    <span className="text-xl sm:text-2xl font-bold leading-none">
                                      {getDayAndMonth(event.date).day}
                                    </span>
                                    <span className="text-xs uppercase mt-0.5 opacity-90">
                                      {getDayAndMonth(event.date).month}
                                    </span>
                                  </div>
                                </div>

                                {/* Image or gradient placeholder */}
                                <div className="hidden md:block w-48 h-32 shrink-0 bg-gradient-to-br from-violet-500/20 via-purple-500/20 to-violet-600/20 rounded-xl overflow-hidden relative">
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <CalendarIcon className="w-12 h-12 text-primary/20" />
                                  </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 py-1">
                                  <div className="flex items-start justify-between gap-2 mb-2">
                                    <h3 className="font-semibold text-lg text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                                      {event.title}
                                    </h3>
                                    <Badge
                                      className={`shrink-0 ${statusConfig[event.status]?.color}`}
                                    >
                                      {React.createElement(statusConfig[event.status]?.icon || CheckCircle, { className: "w-3 h-3 mr-1" })}
                                      {statusConfig[event.status]?.label}
                                    </Badge>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mb-3">
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-4 h-4" />
                                      {event.time}
                                      {event.endTime && ` - ${event.endTime}`}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-4 h-4" />
                                      {event.location}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <UserPlus className="w-4 h-4" />
                                      {event.organizer.name}
                                    </span>
                                  </div>

                                  {/* Registration info */}
                                  {event.maxSpots && (
                                    <div className="flex items-center gap-4">
                                      <div className="flex items-center gap-2 text-sm">
                                        <Users className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-foreground font-medium">
                                          {event.registeredCount}
                                        </span>
                                        <span className="text-muted-foreground">/ {event.maxSpots}</span>
                                        <span className="text-muted-foreground">places</span>
                                      </div>
                                      
                                      {/* Progress bar */}
                                      <div className="flex-1 max-w-[150px] h-2 bg-muted rounded-full overflow-hidden">
                                        <div
                                          className={`h-full rounded-full transition-all ${
                                            event.registeredCount >= event.maxSpots
                                              ? "bg-amber-500"
                                              : event.registeredCount / event.maxSpots > 0.7
                                              ? "bg-primary"
                                              : "bg-emerald-500"
                                          }`}
                                          style={{
                                            width: `${Math.min(100, (event.registeredCount / event.maxSpots) * 100)}%`,
                                          }}
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {/* Category badge */}
                                  <div className="mt-3">
                                    <Badge
                                      variant="outline"
                                      className={`${
                                        categoryColors[event.category] || ""
                                      }`}
                                    >
                                      {event.category}
                                    </Badge>
                                  </div>
                                </div>

                                {/* Action button */}
                                <div className="shrink-0 self-center">
                                  <Button
                                    className={`rounded-lg ${
                                      event.status === "full"
                                        ? "opacity-50 cursor-not-allowed"
                                        : "gradient-spiritual text-white hover:opacity-90"
                                    }`}
                                    disabled={event.status === "full"}
                                    size="sm"
                                  >
                                    {event.status === "full" ? "Complet" : "S'inscrire"}
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Past events section */}
                {pastEvents.length > 0 && (
                  <div>
                    <h2 className="font-serif text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                      <CalendarDays className="w-5 h-5 text-muted-foreground" />
                      Événements passés
                    </h2>
                    <div className="space-y-4">
                      {pastEvents.map((event, index) => (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05, duration: 0.4 }}
                        >
                          <Link href={`/events/${event.id}`}>
                            <Card className="group overflow-hidden hover:shadow-md transition-all duration-300 border-border/50 opacity-75 hover:opacity-100">
                              <CardContent className="p-4 flex gap-4">
                                {/* Date badge */}
                                <div className="shrink-0">
                                  <div className="w-14 h-14 bg-muted rounded-lg flex flex-col items-center justify-center">
                                    <span className="text-base font-bold text-muted-foreground leading-none">
                                      {getDayAndMonth(event.date).day}
                                    </span>
                                    <span className="text-[10px] uppercase text-muted-foreground mt-0.5">
                                      {getDayAndMonth(event.date).month}
                                    </span>
                                  </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 py-1">
                                  <div className="flex items-start justify-between gap-2 mb-1">
                                    <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                                      {event.title}
                                    </h3>
                                    <Badge variant="outline" className="shrink-0 text-xs">
                                      Terminé
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground line-clamp-1">
                                    {formatDate(event.date)} • {event.location}
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {filteredEvents.length === 0 && (
                  <EmptyState
                    icon={CalendarDays}
                    title="Aucun événement trouvé"
                    description={
                      selectedStatus === "À venir"
                        ? "Aucun événement à venir ne correspond à vos critères. Revenez bientôt pour découvrir nos prochaines activités!"
                        : "Aucun événement passé ne correspond à votre recherche."
                    }
                    action={{
                      label: "Réinitialiser les filtres",
                      onClick: () => {
                        setSearchQuery("");
                        setSelectedCategory("Toutes");
                        setSelectedLocation("Tous");
                        setSelectedStatus("À venir");
                      },
                    }}
                    className="py-20"
                  />
                )}
              </motion.div>
            ) : (
              /* Calendar View */
              <motion.div
                key="calendar-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card>
                  <CardContent className="p-6">
                    {/* Calendar header */}
                    <div className="flex items-center justify-between mb-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentDate(
                            new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
                          )
                        }
                        className="rounded-lg"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <h3 className="font-serif text-xl font-semibold text-foreground">
                        {currentDate.toLocaleDateString("fr-FR", {
                          month: "long",
                          year: "numeric",
                        })}
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentDate(
                            new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
                          )
                        }
                        className="rounded-lg"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Day headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"].map((day) => (
                        <div
                          key={day}
                          className="text-center text-sm font-medium text-muted-foreground py-2"
                        >
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {calendarDays.map((day, index) => {
                        if (day === null) {
                          return <div key={`empty-${index}`} className="aspect-square" />;
                        }

                        const date = new Date(
                          currentDate.getFullYear(),
                          currentDate.getMonth(),
                          day
                        );
                        const eventsForDay = getEventsForDate(date);
                        const isSelected =
                          selectedDate?.toDateString() === date.toDateString();
                        const isToday = new Date().toDateString() === date.toDateString();
                        const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

                        return (
                          <button
                            key={day}
                            onClick={() =>
                              setSelectedDate(isSelected ? null : date)
                            }
                            className={`aspect-square p-1 rounded-lg text-sm relative transition-colors ${
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : isToday
                                ? "bg-primary/10 text-primary font-semibold"
                                : isPast
                                ? "text-muted-foreground/50"
                                : "hover:bg-muted text-foreground"
                            }`}
                          >
                            <span>{day}</span>
                            {eventsForDay.length > 0 && (
                              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                                {eventsForDay.slice(0, 3).map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      isSelected ? "bg-white" : "bg-primary"
                                    }`}
                                  />
                                ))}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Selected date events */}
                    {selectedDate && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        className="mt-6 pt-6 border-t border-border"
                      >
                        <h4 className="font-medium text-foreground mb-3">
                          Événements du{" "}
                          {selectedDate.toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </h4>
                        <div className="space-y-2">
                          {getEventsForDate(selectedDate).length > 0 ? (
                            getEventsForDate(selectedDate).map((event) => (
                              <Link key={event.id} href={`/events/${event.id}`}>
                                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                                  <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">
                                      {event.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {event.time}
                                    </p>
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className="text-xs shrink-0"
                                  >
                                    {event.category}
                                  </Badge>
                                </div>
                              </Link>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              Aucun événement ce jour-ci
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>

                {/* Legend */}
                <div className="mt-4 flex items-center justify-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span>Événement prévu</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary/50" />
                    <span>Aujourd&apos;hui</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </PublicLayout>
  );
}
