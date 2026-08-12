"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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
  ArrowRight,
} from "lucide-react";
import { PublicLayout } from "@/components/layouts/public-layout";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

// Types
interface Event {
  id: number;
  title: string;
  description: string;
  date: string; // ISO format
  endDate?: string;
  time: string;
  endTime?: string;
  location: string;
  category: string;
  image?: string;
  maxSpots?: number;
  registeredCount: number;
  isUpcoming: boolean;
}

// Mock events data
const allEvents: Event[] = [
  {
    id: 1,
    title: "Retrait Spirituel d'Été",
    description: "Un week-end de retraite spirituelle pour se ressourcer et approfondir sa relation avec Dieu. Au programme : enseignements, temps de prière, adoration et fellowship.",
    date: "2025-08-24",
    endDate: "2025-08-25",
    time: "09h00",
    endTime: "17h00",
    location: "Centre de Retraite, Fontainebleau",
    category: "Retraite",
    maxSpots: 50,
    registeredCount: 38,
    isUpcoming: true,
  },
  {
    id: 2,
    title: "Soirée Louange & Adoration",
    description: "Une soirée spéciale dédiée à l'adoration avec notre équipe de louange. Venez avec un cœur ouvert pour célébrer la grandeur de notre Dieu.",
    date: "2025-08-30",
    time: "19h00",
    endTime: "21h00",
    location: "Temple Principal - Salle de Célébration",
    category: "Louange",
    isUpcoming: true,
  },
  {
    id: 3,
    title: "Rencontre Jeunes - Back to School",
    description: "Un événement spécial pour les jeunes (15-25 ans) pour bien démarrer la nouvelle année scolaire. Thème : 'Marcher dans ta vocation'.",
    date: "2025-09-07",
    time: "14h00",
    endTime: "18h00",
    location: "Salle des Jeunes",
    category: "Jeunesse",
    maxSpots: 40,
    registeredCount: 15,
    isUpcoming: true,
  },
  {
    id: 4,
    title: "Séminaire sur le Mariage",
    description: "Un atelier pour les couples mariés ou en route vers le mariage. Thèmes : communication, gestion des conflits, intimité spirituelle.",
    date: "2025-09-14",
    time: "10h00",
    endTime: "16h30",
    location: "Salle A - Temple Principal",
    category: "Atelier",
    maxSpots: 25,
    registeredCount: 18,
    isUpcoming: true,
  },
  {
    id: 5,
    title: "Journée Portes Ouvertes",
    description: "Venez découvrir ChurchConnect ! Visite du temple, présentation des ministères, rencontre avec l'équipe pastorale. Tout le monde est bienvenu.",
    date: "2025-09-21",
    time: "11h00",
    endTime: "16h00",
    location: "Temple Principal",
    category: "Événement",
    isUpcoming: true,
  },
  {
    id: 6,
    title: "Conférence : La Foi au Quotidien",
    description: "Notre conférence annuelle avec plusieurs intervenants sur le thème de vivre sa foi au quotidien dans un monde sécularisé.",
    date: "2025-10-05",
    time: "09h30",
    endTime: "17h00",
    location: "Temple Principal - Salle de Célébration",
    category: "Conférence",
    maxSpots: 200,
    registeredCount: 87,
    isUpcoming: true,
  },
  // Past events
  {
    id: 7,
    title: "Camp d'Été Jeunes 2025",
    description: "Une semaine inoubliable pour nos jeunes avec sports, enseignements et moments de qualité.",
    date: "2025-07-07",
    endDate: "2025-07-12",
    time: "10h00",
    location: "Centre de Vacances, Bretagne",
    category: "Camp",
    maxSpots: 60,
    registeredCount: 58,
    isUpcoming: false,
  },
  {
    id: 8,
    title: "Culte de Pâques",
    description: "Notre célébration spéciale de Pâques avec baptêmes et communion.",
    date: "2025-04-20",
    time: "10h00",
    location: "Temple Principal",
    category: "Culte",
    isUpcoming: false,
  },
];

const categories = ["Tous", "Retraite", "Louange", "Jeunesse", "Atelier", "Événement", "Conférence", "Camp", "Culte"];

// Category colors
const categoryColors: Record<string, string> = {
  "Retraite": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  "Louange": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  "Jeunesse": "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  "Atelier": "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400",
  "Événement": "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-400",
  "Conférence": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400",
  "Camp": "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400",
  "Culte": "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400",
};

const categoryGradient: Record<string, string> = {
  "Retraite": "from-emerald-500 to-teal-600",
  "Louange": "from-amber-500 to-orange-500",
  "Jeunesse": "from-blue-500 to-cyan-500",
  "Atelier": "from-violet-500 to-purple-600",
  "Événement": "from-pink-500 to-rose-500",
  "Conférence": "from-indigo-500 to-purple-600",
  "Camp": "from-teal-500 to-green-500",
  "Culte": "from-rose-500 to-red-500",
};

// Helper functions
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatShortDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
};

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [filterType, setFilterType] = useState<"upcoming" | "past" | "all">("upcoming");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 7)); // August 2025

  // Filter events
  const filteredEvents = useMemo(() => {
    return allEvents.filter((event) => {
      const matchesSearch =
        searchQuery === "" ||
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "Tous" || event.category === selectedCategory;

      const matchesFilter =
        filterType === "all" ||
        (filterType === "upcoming" && event.isUpcoming) ||
        (filterType === "past" && !event.isUpcoming);

      return matchesSearch && matchesCategory && matchesFilter;
    });
  }, [searchQuery, selectedCategory, filterType]);

  // Get days for calendar
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days: (number | null)[] = [];
    
    // Adjust for Monday start
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
    
    // Empty cells before first day
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(null);
    }
    
    // Days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const hasEventOnDay = (day: number) => {
    if (!day) return null;
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return allEvents.find(
      (e) =>
        e.date === dateStr ||
        (e.endDate && e.date <= dateStr && e.endDate >= dateStr)
    );
  };

  const navigateMonth = (direction: number) => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1)
    );
  };

  const daysInMonth = getDaysInMonth(currentMonth);

  return (
    <PublicLayout>
      {/* Page Header */}
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
              description="Découvrez nos prochains rassemblements, retraites et activités communautaires."
              breadcrumbs={[{ label: "Événements" }]}
              className="text-white [&_h1]:text-white [&_p]:text-white/80 [&_li]:text-white/60 [&_a]:text-white hover:[&_a]:text-white"
            />
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

      {/* Calendar Section */}
      <section className="py-12 border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-6">
                {/* Calendar header */}
                <div className="flex items-center justify-between mb-6">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigateMonth(-1)}
                    aria-label="Mois précédent"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  
                  <h3 className="font-serif text-xl font-semibold capitalize">
                    {currentMonth.toLocaleDateString("fr-FR", {
                      month: "long",
                      year: "numeric",
                    })}
                  </h3>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigateMonth(1)}
                    aria-label="Mois suivant"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
                    <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {daysInMonth.map((day, index) => {
                    const event = hasEventOnDay(day || 0);
                    const isToday = day === new Date().getDate() &&
                      currentMonth.getMonth() === new Date().getMonth() &&
                      currentMonth.getFullYear() === new Date().getFullYear();

                    return (
                      <button
                        key={index}
                        disabled={!day}
                        className={`aspect-square p-1 rounded-lg text-sm transition-colors ${
                          !day
                            ? "invisible"
                            : `hover:bg-accent ${isToday ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}`
                        }`}
                        onClick={() => day && console.log(`Selected day: ${day}`)}
                      >
                        <span className={`${isToday ? "font-bold" : ""}`}>{day}</span>
                        {event && (
                          <span className="block w-1.5 h-1.5 rounded-full bg-primary mx-auto mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Filters & Search */}
      <section className="py-8 bg-muted/30 sticky top-16 lg:top-20 z-30 backdrop-blur-sm">
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
                className="pl-12 pr-4 h-12 rounded-xl"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {/* Type filter tabs */}
                <Tabs
                  value={filterType}
                  onValueChange={(v) => setFilterType(v as typeof filterType)}
                >
                  <TabsList className="rounded-lg">
                    <TabsTrigger value="upcoming" className="rounded-md px-4">
                      À venir
                    </TabsTrigger>
                    <TabsTrigger value="past" className="rounded-md px-4">
                      Passés
                    </TabsTrigger>
                    <TabsTrigger value="all" className="rounded-md px-4">
                      Tous
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <Separator orientation="vertical" className="h-8 hidden sm:block" />

                {/* Category pills */}
                <div className="hidden md:flex flex-wrap gap-2">
                  {categories.slice(0, 5).map((cat) => (
                    <Button
                      key={cat}
                      variant={selectedCategory === cat ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(cat)}
                      className={`rounded-full text-xs ${
                        selectedCategory === cat
                          ? "gradient-spiritual text-white border-0"
                          : ""
                      }`}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground hidden sm:block">
                  {filteredEvents.length} événement{filteredEvents.length > 1 ? "s" : ""}
                </span>

                <div className="hidden sm:flex items-center border rounded-lg p-1">
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-md px-3"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-md px-3"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Events List */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {filteredEvents.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                  >
                    <Link href={`/evenements/${event.id}`}>
                      <Card className="group overflow-hidden h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        {/* Event image placeholder */}
                        <div className={`aspect-[16/9] bg-gradient-to-br ${categoryGradient[event.category] || 'from-gray-500 to-gray-600'} relative overflow-hidden`}>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <CalendarIcon className="w-16 h-16 text-white/30" />
                          </div>

                          {!event.isUpcoming && (
                            <Badge className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white border-0">
                              Terminé
                            </Badge>
                          )}

                          {/* Date badge */}
                          <div className="absolute bottom-3 left-3 bg-white rounded-lg p-2 text-center shadow-md">
                            <p className="text-xs font-medium text-muted-foreground uppercase">
                              {new Date(event.date).toLocaleDateString("fr-FR", { month: "short" })}
                            </p>
                            <p className="text-xl font-bold text-foreground leading-none">
                              {new Date(event.date).getDate()}
                            </p>
                          </div>

                          <Badge 
                            className={`absolute top-3 right-3 ${categoryColors[event.category] || ''} border-0`}
                          >
                            {event.category}
                          </Badge>
                        </div>

                        <CardContent className="p-5">
                          <h3 className="font-semibold text-lg text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                            {event.title}
                          </h3>
                          
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                            {event.description}
                          </p>

                          <div className="space-y-2 text-sm text-muted-foreground mb-4">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-primary shrink-0" />
                              {event.time}
                              {event.endTime && ` - ${event.endTime}`}
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-primary shrink-0" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          </div>

                          {event.maxSpots && event.isUpcoming && (
                            <div className="pt-3 border-t border-border">
                              <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-muted-foreground">Places</span>
                                <span className="font-medium text-foreground">
                                  {event.maxSpots - event.registeredCount} restantes
                                </span>
                              </div>
                              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full gradient-spiritual rounded-full transition-all"
                                  style={{
                                    width: `${(event.registeredCount / event.maxSpots) * 100}%`,
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* List view */
              <div className="space-y-4 max-w-4xl mx-auto">
                {filteredEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                  >
                    <Link href={`/evenements/${event.id}`}>
                      <Card className="group overflow-hidden hover:shadow-md transition-all duration-300">
                        <CardContent className="p-4 flex gap-4">
                          {/* Date column */}
                          <div className="w-20 shrink-0 text-center bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-3 flex flex-col items-center justify-center">
                            <p className="text-xs font-medium text-muted-foreground uppercase">
                              {new Date(event.date).toLocaleDateString("fr-FR", { month: "short" })}
                            </p>
                            <p className="text-2xl font-bold text-foreground leading-none">
                              {new Date(event.date).getDate()}
                            </p>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 py-1">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                                {event.title}
                              </h3>
                              <div className="flex items-center gap-2 shrink-0">
                                {!event.isUpcoming && (
                                  <Badge variant="secondary" className="text-xs">Terminé</Badge>
                                )}
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${categoryColors[event.category] || ''}`}
                                >
                                  {event.category}
                                </Badge>
                              </div>
                            </div>

                            <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                              {event.description}
                            </p>

                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {event.time}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {event.location}
                              </span>
                              {event.maxSpots && event.isUpcoming && (
                                <span className="flex items-center gap-1">
                                  <Users className="w-3.5 h-3.5" />
                                  {event.maxSpots - event.registeredCount} places
                                </span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )
          ) : (
            /* Empty state */
            <div className="text-center py-16">
              <CalendarIcon className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                Aucun événement trouvé
              </h3>
              <p className="text-muted-foreground mb-6">
                Essayez de modifier vos critères de recherche ou de filtres.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("Tous");
                  setFilterType("upcoming");
                }}
                className="rounded-xl"
              >
                Réinitialiser les filtres
              </Button>
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
