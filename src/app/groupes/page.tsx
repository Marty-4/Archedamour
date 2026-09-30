"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from '@/lib/no-motion';
import {
  Search,
  Users,
  MapPin,
  Clock,
  Filter,
  ChevronRight,
  Heart,
  BookOpen,
  Coffee,
  Baby,
  GraduationCap,
  Briefcase,
  Home,
  X,
} from "lucide-react";
import { PublicLayout } from "@/components/layouts/public-layout";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Types
interface Group {
  id: number;
  name: string;
  description: string;
  leader: {
    name: string;
    avatar: null | string;
    initials: string;
  };
  meetingDay: string;
  meetingTime: string;
  location: string;
  category: string;
  memberCount: number;
  maxMembers?: number;
  isOnline: boolean;
  tags: string[];
}

// Mock groups data
const allGroups: Group[] = [
  {
    id: 1,
    name: "Groupe Paris Centre",
    description: "Un groupe chaleureux au cœur de Paris pour étudier la Parole et partager ensemble. Ouvert à tous, quel que soit votre âge ou votre parcours de foi.",
    leader: { name: "Marie-Claire D.", avatar: null, initials: "MCD" },
    meetingDay: "Mardi",
    meetingTime: "19h00 - 21h00",
    location: "Chez Marie-Claire, 3ème arrondissement",
    category: "Mixte",
    memberCount: 12,
    maxMembers: 15,
    isOnline: false,
    tags: ["Étude biblique", "Prière", "Fellowship"],
  },
  {
    id: 2,
    name: "Jeunes Professionnels",
    description: "Un espace pour les 25-35 ans qui veulent grandir dans leur foi tout en naviguant le monde professionnel. Thèmes : équilibre vie pro/perso, relations, vocation.",
    leader: { name: "Thomas B.", avatar: null, initials: "TB" },
    meetingDay: "Mardi",
    meetingTime: "19h30 - 21h30",
    location: "Café Église, Le Marais",
    category: "Jeunes adultes",
    memberCount: 18,
    maxMembers: 20,
    isOnline: false,
    tags: ["Carrière", "Relations", "Vocation"],
  },
  {
    id: 3,
    name: "Femmes de Foi",
    description: "Un groupe de femmes partageant leurs expériences et grandissant ensemble dans leur marche avec Dieu. Soutien mutuel et prière.",
    leader: { name: "Sophie L.", avatar: null, initials: "SL" },
    meetingDay: "Mercredi",
    meetingTime: "10h00 - 12h00",
    location: "Salle B, Temple Principal",
    category: "Femmes",
    memberCount: 15,
    maxMembers: 16,
    isOnline: false,
    tags: ["Soutien", "Prière", "Partage"],
  },
  {
    id: 4,
    name: "Groupe Montmartre",
    description: "Une communauté familiale dans le 18ème. Idéal pour les familles avec enfants, mais tout le monde est le bienvenu !",
    leader: { name: "Pierre M.", avatar: null, initials: "PM" },
    meetingDay: "Jeudi",
    meetingTime: "19h00 - 21h00",
    location: "Chez Pierre & Isabelle, Montmartre",
    category: "Familles",
    memberCount: 10,
    maxMembers: 14,
    isOnline: false,
    tags: ["Familles", "Enfants", "Repas partagé"],
  },
  {
    id: 5,
    name: "Étudiants Connect",
    description: "Pour les étudiants qui cherchent une communauté pendant leurs études. Discussions sur la foi, les études, l'avenir.",
    leader: { name: "Emma R.", avatar: null, initials: "ER" },
    meetingDay: "Vendredi",
    meetingTime: "18h30 - 20h30",
    location: "Campus Universitaire (en ligne alterné)",
    category: "Étudiants",
    memberCount: 22,
    maxMembers: 30,
    isOnline: true,
    tags: ["Études", "Avenir", "Amitié"],
  },
  {
    id: 6,
    name: "Groupe Bastille",
    description: "Un groupe dynamique dans l'est parisien. Focus sur l'évangélisation et le témoignage au quotidien.",
    leader: { name: "François D.", avatar: null, initials: "FD" },
    meetingDay: "Vendredi",
    meetingTime: "19h30 - 21h30",
    location: "Chez François, Bastille",
    category: "Mixte",
    memberCount: 8,
    maxMembers: 12,
    isOnline: false,
    tags: ["Évangélisation", "Témoignage", "Mission"],
  },
  {
    id: 7,
    name: "Couples Forts",
    description: "Pour les couples mariés ou en route vers le mariage. Renforcer la relation conjugale à la lumière de la Parole.",
    leader: { name: "Jean & Claire P.", avatar: null, initials: "JCP" },
    meetingDay: "Samedi",
    meetingTime: "17h00 - 19h00",
    location: "Salle A, Temple Principal",
    category: "Couples",
    memberCount: 6,
    maxMembers: 8,
    isOnline: false,
    tags: ["Mariage", "Communication", "Parentalité"],
  },
  {
    id: 8,
    name: "Groupe en Ligne International",
    description: "Pour ceux qui ne peuvent pas se déplacer physiquement. Rejoignez-nous depuis n'importe où dans le monde !",
    leader: { name: "David C.", avatar: null, initials: "DC" },
    meetingDay: "Dimanche",
    meetingTime: "18h00 - 19h30",
    location: "Zoom / Google Meet",
    category: "International",
    memberCount: 25,
    isOnline: true,
    tags: ["En ligne", "Multiculturel", "Anglais/Français"],
  },
];

const categories = ["Tous", "Mixte", "Jeunes adultes", "Femmes", "Familles", "Étudiants", "Couples", "International"];
const days = ["Tous", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

// Category icons
const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "Mixte": Users,
  "Jeunes adultes": Briefcase,
  "Femmes": Heart,
  "Familles": Home,
  "Étudiants": GraduationCap,
  "Couples": Heart,
  "International": Coffee,
};

// Category colors
const categoryColors: Record<string, string> = {
  "Mixte": "from-violet-500 to-purple-600",
  "Jeunes adultes": "from-blue-500 to-cyan-600",
  "Femmes": "from-rose-500 to-pink-600",
  "Familles": "from-emerald-500 to-green-600",
  "Étudiants": "from-amber-500 to-orange-500",
  "Couples": "from-red-500 to-rose-600",
  "International": "from-indigo-500 to-purple-600",
};

export default function GroupsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [selectedDay, setSelectedDay] = useState("Tous");
  const [showFilters, setShowFilters] = useState(false);

  // Filter groups
  const filteredGroups = useMemo(() => {
    return allGroups.filter((group) => {
      const matchesSearch =
        searchQuery === "" ||
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "Tous" || group.category === selectedCategory;

      const matchesDay =
        selectedDay === "Tous" || group.meetingDay === selectedDay;

      return matchesSearch && matchesCategory && matchesDay;
    });
  }, [searchQuery, selectedCategory, selectedDay]);

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
              title="Groupes de Vie"
              description="Rejoignez un petit groupe pour grandir dans votre foi, créer des liens profonds et vivre la communauté authentique."
              breadcrumbs={[{ label: "Groupes" }]}
              className="text-slate-900 dark:text-white [&_h1]:text-slate-900 dark:[&_h1]:text-white [&_p]:text-slate-700 dark:[&_p]:text-white/80 [&_li]:text-slate-700 dark:[&_li]:text-white/60 [&_a]:text-slate-900 dark:[&_a]:text-white hover:[&_a]:text-sky-400"
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

      {/* Stats Banner */}
      <section className="py-8 bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4">
              <p className="font-serif text-2xl lg:text-3xl font-bold text-primary">35</p>
              <p className="text-sm text-muted-foreground">Groupes actifs</p>
            </div>
            <div className="p-4">
              <p className="font-serif text-2xl lg:text-3xl font-bold text-primary">420+</p>
              <p className="text-sm text-muted-foreground">Participants</p>
            </div>
            <div className="p-4">
              <p className="font-serif text-2xl lg:text-3xl font-bold text-primary">7</p>
              <p className="text-sm text-muted-foreground">Jours de réunion</p>
            </div>
            <div className="p-4">
              <p className="font-serif text-2xl lg:text-3xl font-bold text-primary">8</p>
              <p className="text-sm text-muted-foreground">Catégories</p>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 sticky top-16 lg:top-20 bg-background z-30 border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4">
            {/* Search bar */}
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher un groupe..."
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
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="rounded-lg"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filtres
                  {(selectedCategory !== "Tous" || selectedDay !== "Tous") && (
                    <Badge variant="secondary" className="ml-2 bg-primary text-primary-foreground">
                      {[selectedCategory !== "Tous", selectedDay !== "Tous"].filter(Boolean).length}
                    </Badge>
                  )}
                </Button>

                <span className="text-sm text-muted-foreground hidden sm:block">
                  {filteredGroups.length} groupe{filteredGroups.length > 1 ? "s" : ""}
                </span>
              </div>

              {/* Quick day filter on desktop */}
              <div className="hidden md:flex items-center gap-2 overflow-x-auto pb-1">
                {days.map((day) => (
                  <Button
                    key={day}
                    variant={selectedDay === day ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedDay(day)}
                    className={`rounded-full whitespace-nowrap ${
                      selectedDay === day ? "gradient-spiritual text-white border-0" : ""
                    }`}
                  >
                    {day}
                  </Button>
                ))}
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
                  {/* Categories */}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Catégorie</p>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <Button
                          key={category}
                          variant={selectedCategory === category ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedCategory(category)}
                          className={`rounded-full ${
                            selectedCategory === category
                              ? "gradient-spiritual text-white border-0"
                              : ""
                          }`}
                        >
                          {category}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Day filter for mobile */}
                  <div className="md:hidden">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Jour</p>
                    <Select value={selectedDay} onValueChange={setSelectedDay}>
                      <SelectTrigger className="rounded-lg">
                        <SelectValue placeholder="Choisir un jour" />
                      </SelectTrigger>
                      <SelectContent>
                        {days.map((day) => (
                          <SelectItem key={day} value={day}>{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Groups Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {filteredGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map((group, index) => {
                const CategoryIcon = categoryIcons[group.category] || Users;
                
                return (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                  >
                    <Card className="group h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                      {/* Header with gradient */}
                      <div className={`h-24 bg-gradient-to-br ${categoryColors[group.category]} relative`}>
                        <div className="absolute inset-0 flex items-center justify-center opacity-20">
                          <CategoryIcon className="w-16 h-16 text-white" />
                        </div>
                        
                        <Badge 
                          className={`absolute top-3 right-3 bg-white/20 backdrop-blur-sm text-white border-0`}
                        >
                          {group.category}
                        </Badge>

                        {group.isOnline && (
                          <Badge className="absolute top-3 left-3 bg-cyan-500 text-white border-0">
                            En ligne
                          </Badge>
                        )}

                        {/* Member count badge */}
                        <div className="absolute bottom-3 left-3 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1.5 text-white text-sm">
                          <Users className="w-4 h-4" />
                          {group.memberCount}{group.maxMembers ? `/${group.maxMembers}` : "+"}
                        </div>
                      </div>

                      <CardContent className="p-5">
                        <h3 className="font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                          {group.name}
                        </h3>
                        
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                          {group.description}
                        </p>

                        {/* Leader info */}
                        <div className="flex items-center gap-3 mb-4 p-3 bg-muted/50 rounded-lg">
                          <Avatar className="w-9 h-9">
                            <AvatarImage src={group.leader.avatar || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                              {group.leader.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {group.leader.name}
                            </p>
                            <p className="text-xs text-muted-foreground">Responsable</p>
                          </div>
                        </div>

                        {/* Meeting info */}
                        <div className="space-y-2 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary shrink-0" />
                            <span>{group.meetingDay} • {group.meetingTime}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary shrink-0" />
                            <span className="truncate">{group.location}</span>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {group.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        {/* Action button */}
                        <Button
                          className={`w-full rounded-lg ${
                            group.maxMembers && group.memberCount >= group.maxMembers
                              ? "opacity-50 cursor-not-allowed"
                              : "gradient-spiritual text-white hover:opacity-90"
                          }`}
                          disabled={!!(group.maxMembers && group.memberCount >= group.maxMembers)}
                        >
                          {group.maxMembers && group.memberCount >= group.maxMembers
                            ? "Groupe complet"
                            : "Demander à rejoindre"
                          }
                          <ChevronRight className="ml-2 w-4 h-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* Empty state */
            <div className="text-center py-16">
              <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                Aucun groupe trouvé
              </h3>
              <p className="text-muted-foreground mb-6">
                Essayez de modifier vos critères de recherche ou de filtres.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("Tous");
                  setSelectedDay("Tous");
                }}
                className="rounded-xl"
              >
                Réinitialiser les filtres
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Start a Group CTA */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto text-center"
          >
            <BookOpen className="w-16 h-16 text-primary/30 mx-auto mb-6" />
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Vous Ne Trouvez Pas Votre Groupe ?
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Nous serions ravis de vous aider à trouver le groupe parfait pour vous, 
              ou même à en démarrer un nouveau ! Contactez notre équipe des groupes de vie.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="gradient-spiritual text-white hover:opacity-90 rounded-xl">
                <Link href="/contact">
                  Nous contacter
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-xl">
                <Link href="/cultes">
                  Voir nos cultes
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}
