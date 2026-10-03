"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from '@/lib/no-motion';
import {
  Search,
  SlidersHorizontal,
  Play,
  Clock,
  Calendar,
  Users,
  Filter,
  Grid3X3,
  List,
  X,
  Mic,
  BookOpen,
  Video,
  FileAudio,
  FileText,
  ChevronDown,
  BookMarked,
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

interface Sermon {
  id: string;
  title: string;
  preacher: string;
  date: string;
  duration: string;
  category: string;
  series?: string;
  views: number;
  type: "video" | "audio" | "pdf";
  verse?: string;
}

// ============================================
// MOCK DATA
// ============================================

const allSermons: Sermon[] = [
  {
    id: "ser_001",
    title: "La Paix qui Surpasse Toute Intelligence",
    preacher: "Pasteur Lesty Paka",
    date: "2024-12-15",
    duration: "45:32",
    category: "Paix & Consolation",
    series: "Le Repos de l'Âme",
    views: 342,
    type: "video",
    verse: "Philippiens 4:7",
  },
  {
    id: "ser_002",
    title: "Marcher par la Foi et non par la Vue",
    preacher: "Pasteur Armèle",
    date: "2024-12-08",
    duration: "38:15",
    category: "Foi & Confiance",
    series: "La Vie de Foi",
    views: 289,
    type: "video",
    verse: "2 Corinthiens 5:7",
  },
  {
    id: "ser_003",
    title: "L'Amour qui Transforme",
    preacher: "Sœur Grace Mutombo",
    date: "2024-12-01",
    duration: "42:08",
    category: "Amour & Relations",
    series: "Fruits de l'Esprit",
    views: 256,
    type: "audio",
    verse: "1 Jean 4:7-12",
  },
  {
    id: "ser_004",
    title: "La Puissance de la Prière Persistante",
    preacher: "Pasteur Lesty Paka",
    date: "2024-11-24",
    duration: "52:45",
    category: "Prière & Intercession",
    series: "Vaincre par la Prière",
    views: 512,
    type: "video",
    verse: "Luc 18:1-8",
  },
  {
    id: "ser_005",
    title: "Trouver sa Place dans le Corps du Christ",
    preacher: "Frère François Mukendi",
    date: "2024-11-17",
    duration: "36:20",
    category: "Ministère & Service",
    views: 198,
    type: "audio",
    verse: "1 Corinthiens 12:12-27",
  },
  {
    id: "ser_006",
    title: "La Joie comme Force",
    preacher: "Pasteur Armèle",
    date: "2024-11-10",
    duration: "41:55",
    category: "Joie & Actions de Grâce",
    views: 321,
    type: "video",
    verse: "Néhémie 8:10",
  },
  {
    id: "ser_007",
    title: "Vivre dans l'Espérance Éternelle",
    preacher: "Sœur Grace Mutombo",
    date: "2024-11-03",
    duration: "44:12",
    category: "Espérance & Avenir",
    series: "Les Vertus Chrétiennes",
    views: 267,
    type: "pdf",
    verse: "Romains 15:13",
  },
  {
    id: "ser_008",
    title: "L'Importance de la Communauté",
    preacher: "Pasteur Lesty Paka",
    date: "2024-10-27",
    duration: "48:30",
    category: "Communauté & Fraternité",
    series: "Ensemble pour Avancer",
    views: 445,
    type: "video",
    verse: "Hébreux 10:24-25",
  },
  {
    id: "ser_009",
    title: "La Sagesse d'En Haut",
    preacher: "Frère François Mukendi",
    date: "2024-10-20",
    duration: "39:18",
    category: "Sagesse & Discernement",
    series: "Marcher dans la Sagesse",
    views: 178,
    type: "audio",
    verse: "Jacques 3:17-18",
  },
  {
    id: "ser_010",
    title: "Le Courage d'être Fidèle",
    preacher: "Sœur Grace Mutombo",
    date: "2024-10-13",
    duration: "43:45",
    category: "Fidélité & Persévérance",
    series: "Héros de la Foi",
    views: 234,
    type: "video",
    verse: "Daniel 3:16-18",
  },
  {
    id: "ser_011",
    title: "La Grace Suffisante",
    preacher: "Pasteur Armèle",
    date: "2024-10-06",
    duration: "37:50",
    category: "Grâce & Rédemption",
    views: 289,
    type: "audio",
    verse: "2 Corinthiens 12:9",
  },
  {
    id: "ser_012",
    title: "Guérison et Restauration",
    preacher: "Pasteur Lesty Paka",
    date: "2024-09-29",
    duration: "55:22",
    category: "Guérison & Délivrance",
    views: 567,
    type: "video",
    verse: "Jérémie 30:17",
  },
];

const categories = [
  "Toutes",
  "Paix & Consolation",
  "Foi & Confiance",
  "Amour & Relations",
  "Prière & Intercession",
  "Ministère & Service",
  "Joie & Actions de Grâce",
  "Espérance & Avenir",
  "Communauté & Fraternité",
  "Sagesse & Discernement",
  "Fidélité & Persévérance",
  "Grâce & Rédemption",
  "Guérison & Délivrance",
];

const seriesList = [
  "Toutes les séries",
  "Le Repos de l'Âme",
  "La Vie de Foi",
  "Fruits de l'Esprit",
  "Vaincre par la Prière",
  "Les Vertus Chrétiennes",
  "Ensemble pour Avancer",
  "Marcher dans la Sagesse",
  "Héros de la Foi",
];

const types = ["Tous", "Vidéo", "Audio", "PDF"];

// Category colors
const categoryColors: Record<string, string> = {
  "Paix & Consolation": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  "Foi & Confiance": "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400",
  "Amour & Relations": "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400",
  "Prière & Intercession": "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  "Ministère & Service": "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
  "Joie & Actions de Grâce": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  "Espérance & Avenir": "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-400",
  "Communauté & Fraternité": "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400",
  "Sagesse & Discernement": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400",
  "Fidélité & Persévérance": "bg-lime-100 text-lime-700 dark:bg-lime-900/40 dark:text-lime-400",
  "Grâce & Rédemption": "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-400",
  "Guérison & Délivrance": "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
};

// Type icons and colors
const typeConfig: Record<string, { icon: typeof Video; color: string; label: string }> = {
  video: { icon: Video, color: "text-blue-600 bg-blue-100", label: "Vidéo" },
  audio: { icon: FileAudio, color: "text-purple-600 bg-purple-100", label: "Audio" },
  pdf: { icon: FileText, color: "text-red-600 bg-red-100", label: "PDF" },
};

// Format date
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function SermonsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Toutes");
  const [selectedSeries, setSelectedSeries] = useState("Toutes les séries");
  const [selectedType, setSelectedType] = useState("Tous");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter sermons
  const filteredSermons = useMemo(() => {
    return allSermons.filter((sermon) => {
      const matchesSearch =
        searchQuery === "" ||
        sermon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sermon.preacher.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "Toutes" || sermon.category === selectedCategory;

      const matchesSeries =
        selectedSeries === "Toutes les séries" || sermon.series === selectedSeries;

      const matchesType =
        selectedType === "Tous" ||
        (selectedType === "Vidéo" && sermon.type === "video") ||
        (selectedType === "Audio" && sermon.type === "audio") ||
        (selectedType === "PDF" && sermon.type === "pdf");

      return matchesSearch && matchesCategory && matchesSeries && matchesType;
    });
  }, [searchQuery, selectedCategory, selectedSeries, selectedType]);

  // Pagination
  const totalPages = Math.ceil(filteredSermons.length / itemsPerPage);
  const paginatedSermons = filteredSermons.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-violet-800 py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <PageHeader
              title="Prédications"
              description="Retrouvez tous nos enseignements bibliques pour nourrir votre vie spirituelle au quotidien."
              breadcrumbs={[{ label: "Prédications" }]}
              className="text-slate-900 dark:text-white [&_h1]:text-slate-900 dark:[&_h1]:text-white [&_p]:text-slate-700 dark:[&_p]:text-white/80 [&_li]:text-slate-700 dark:[&_li]:text-white/60 [&_a]:text-slate-900 dark:[&_a]:text-white hover:[&_a]:text-sky-400"
              actions={
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex border-white/30 text-white hover:bg-white/10 rounded-lg"
                >
                  <BookMarked className="w-4 h-4 mr-2" />
                  Ma Playlist
                </Button>
              }
            />

            {/* Stats */}
            <div className="flex flex-wrap gap-8 mt-8 pt-8 border-t border-white/20">
              <div>
                <p className="text-3xl font-bold text-white">{allSermons.length}</p>
                <p className="text-sm text-white/70">Prédications</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">
                  {categories.length - 1}
                </p>
                <p className="text-sm text-white/70">Catégories</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{seriesList.length - 1}</p>
                <p className="text-sm text-white/70">Séries</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">
                  {allSermons.reduce((acc, s) => acc + s.views, 0).toLocaleString()}
                </p>
                <p className="text-sm text-white/70">Écoutes totales</p>
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
                placeholder="Rechercher une prédication..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-12 h-12 rounded-xl border-muted-300 focus:border-primary"
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

            {/* Filter controls */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="rounded-lg"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filtres
                {(selectedCategory !== "Toutes" ||
                  selectedSeries !== "Toutes les séries" ||
                  selectedType !== "Tous") && (
                  <Badge variant="secondary" className="ml-2 bg-primary text-primary-foreground">
                    {[
                      selectedCategory !== "Toutes",
                      selectedSeries !== "Toutes les séries",
                      selectedType !== "Tous",
                    ].filter(Boolean).length}
                  </Badge>
                )}
              </Button>

              <span className="text-sm text-muted-foreground hidden sm:block">
                {filteredSermons.length} prédication
                {filteredSermons.length > 1 ? "s" : ""} trouvée
                {filteredSermons.length > 1 ? "s" : ""}
              </span>

              <div className="flex items-center border rounded-lg p-1">
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
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Catégorie
                    </p>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                      {categories.map((category) => (
                        <Button
                          key={category}
                          variant={
                            selectedCategory === category ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setSelectedCategory(category)}
                          className={`rounded-full text-xs ${
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

                  {/* Series and Type row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        Série
                      </p>
                      <Select
                        value={selectedSeries}
                        onValueChange={setSelectedSeries}
                      >
                        <SelectTrigger className="rounded-lg">
                          <SelectValue placeholder="Sélectionner une série" />
                        </SelectTrigger>
                        <SelectContent>
                          {seriesList.map((series) => (
                            <SelectItem key={series} value={series}>
                              {series}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        Type
                      </p>
                      <div className="flex gap-2">
                        {types.map((type) => (
                          <Button
                            key={type}
                            variant={selectedType === type ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedType(type)}
                            className={`rounded-lg flex-1 ${
                              selectedType === type
                                ? "gradient-spiritual text-white border-0"
                                : ""
                            }`}
                          >
                            {type === "Vidéo" && (
                              <Video className="w-4 h-4 mr-1" />
                            )}
                            {type === "Audio" && (
                              <FileAudio className="w-4 h-4 mr-1" />
                            )}
                            {type === "PDF" && (
                              <FileText className="w-4 h-4 mr-1" />
                            )}
                            {type}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Sermons List */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {paginatedSermons.length > 0 ? (
            <>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedSermons.map((sermon, index) => (
                    <motion.div
                      key={sermon.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.4 }}
                    >
                      <Link href={`/sermons/${sermon.id}`}>
                        <Card className="group overflow-hidden h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50">
                          {/* Thumbnail */}
                          <div className="aspect-video bg-gradient-to-br from-violet-500 via-purple-600 to-violet-700 relative overflow-hidden">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Mic className="w-16 h-16 text-white/20" />
                            </div>

                            {/* Play button overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                              <div className="w-14 h-14 rounded-full bg-white/95 flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-xl">
                                <Play className="w-6 h-6 text-violet-600 ml-1" />
                              </div>
                            </div>

                            {/* Duration badge */}
                            <Badge className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white border-0 text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              {sermon.duration}
                            </Badge>

                            {/* Category badge */}
                            <Badge
                              className={`absolute top-3 left-3 text-xs border-0 ${
                                categoryColors[sermon.category] ||
                                "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {sermon.category.split(" ")[0]}
                            </Badge>

                            {/* Type indicator */}
                            <div
                              className={`absolute bottom-3 left-3 w-7 h-7 rounded-full flex items-center justify-center ${
                                typeConfig[sermon.type]?.color || "bg-gray-100"
                              }`}
                            >
                              {React.createElement(
                                typeConfig[sermon.type]?.icon || Video,
                                { className: "w-3.5 h-3.5" }
                              )}
                            </div>
                          </div>

                          <CardContent className="p-5">
                            <h3 className="font-semibold text-base text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                              {sermon.title}
                            </h3>

                            {sermon.series && (
                              <p className="text-xs text-primary font-medium mb-2 flex items-center gap-1">
                                <BookOpen className="w-3 h-3" />
                                {sermon.series}
                              </p>
                            )}

                            <p className="text-sm text-muted-foreground mb-3">
                              {sermon.preacher}
                            </p>

                            <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/50">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatDate(sermon.date)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" />
                                {sermon.views.toLocaleString()}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                /* List view */
                <div className="space-y-4 max-w-4xl mx-auto">
                  {paginatedSermons.map((sermon, index) => (
                    <motion.div
                      key={sermon.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.4 }}
                    >
                      <Link href={`/sermons/${sermon.id}`}>
                        <Card className="group overflow-hidden hover:shadow-md transition-all duration-300 border-border/50">
                          <CardContent className="p-4 flex gap-4">
                            {/* Thumbnail */}
                            <div className="w-36 h-24 sm:w-44 sm:h-28 shrink-0 bg-gradient-to-br from-violet-500 via-purple-600 to-violet-700 rounded-lg relative overflow-hidden flex items-center justify-center">
                              <Mic className="w-10 h-10 text-white/20" />

                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300">
                                  <Play className="w-4 h-4 text-violet-600 ml-0.5" />
                                </div>
                              </div>

                              {/* Duration */}
                              <Badge className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white border-0 text-xs px-1.5 py-0">
                                {sermon.duration}
                              </Badge>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 py-1">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                                  {sermon.title}
                                </h3>
                                <Badge
                                  variant="outline"
                                  className={`shrink-0 text-xs ${
                                    categoryColors[sermon.category] || ""
                                  }`}
                                >
                                  {sermon.category.split(" ")[0]}
                                </Badge>
                              </div>

                              {sermon.series && (
                                <p className="text-xs text-primary font-medium mb-1 truncate flex items-center gap-1">
                                  <BookOpen className="w-3 h-3" />
                                  {sermon.series}
                                </p>
                              )}

                              <p className="text-sm text-muted-foreground mb-2">
                                {sermon.preacher}
                              </p>

                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {formatDate(sermon.date)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  {sermon.duration}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="w-3.5 h-3.5" />
                                  {sermon.views.toLocaleString()}
                                </span>
                                <span
                                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs ${
                                    typeConfig[sermon.type]?.color || ""
                                  }`}
                                >
                                  {React.createElement(
                                    typeConfig[sermon.type]?.icon || Video,
                                    { className: "w-3 h-3" }
                                  )}
                                  {typeConfig[sermon.type]?.label}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-12 pt-8 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="rounded-lg"
                  >
                    Précédent
                  </Button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className={`w-9 h-9 rounded-lg p-0 ${
                            currentPage === page
                              ? "gradient-spiritual text-white border-0"
                              : ""
                          }`}
                        >
                          {page}
                        </Button>
                      )
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="rounded-lg"
                  >
                    Suivant
                  </Button>
                </div>
              )}

              {/* Load more alternative */}
              {totalPages > 1 && currentPage < totalPages && (
                <div className="text-center mt-6">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="rounded-xl"
                  >
                    Charger plus de prédications
                    <ChevronDown className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            /* Empty state */
            <EmptyState
              icon={Mic}
              title="Aucune prédication trouvée"
              description="Aucune prédication ne correspond à vos critères de recherche. Essayez d'autres filtres ou revenez plus tard."
              action={{
                label: "Réinitialiser les filtres",
                onClick: () => {
                  setSearchQuery("");
                  setSelectedCategory("Toutes");
                  setSelectedSeries("Toutes les séries");
                  setSelectedType("Tous");
                },
              }}
              secondaryAction={{
                label: "Voir toutes les prédications",
                href: "/sermons",
              }}
              className="py-20"
            />
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
