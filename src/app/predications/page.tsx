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
} from "lucide-react";
import { PublicLayout } from "@/components/layouts/public-layout";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data
const allSermons = [
  {
    id: 1,
    title: "La Puissance de la Prière Persistante",
    preacher: "Berger Lesty Paka",
    category: "Foi",
    series: "Vaincre par la prière",
    date: "11 Août 2025",
    duration: "42 min",
    views: 1247,
    thumbnail: null,
    verse: "Luc 18:1-8",
  },
  {
    id: 2,
    title: "Marcher par la Foi et non par la Vue",
    preacher: " Berger Lesty Paka",
    category: "Confiance",
    series: "La vie de foi",
    date: "4 Août 2025",
    duration: "38 min",
    views: 982,
    thumbnail: null,
    verse: "2 Corinthiens 5:7",
  },
  {
    id: 3,
    title: "L'Amour qui Transforme",
    preacher: "Frère Armèle",
    category: "Amour",
    series: "Fruits de l'Esprit",
    date: "28 Juillet 2025",
    duration: "45 min",
    views: 1563,
    thumbnail: null,
    verse: "1 Jean 4:7-12",
  },
  {
    id: 4,
    title: "Trouver le Repos en Dieu",
    preacher: "Berger Lesty paka",
    category: "Paix",
    series: "Le repos de l'âme",
    date: "21 Juût 2025",
    duration: "40 min",
    views: 876,
    thumbnail: null,
    verse: "Matthieu 11:28-30",
  },
  {
    id: 5,
    title: "La Joie comme Force",
    preacher: "Invité: David Chen",
    category: "Joie",
    series: null,
    date: "14 Juillet 2025",
    duration: "35 min",
    views: 1102,
    thumbnail: null,
    verse: "Néhémie 8:10",
  },
  {
    id: 6,
    title: "Vivre dans l'Espérance",
    preacher: "Frère prince",
    category: "Espérance",
    series: "Les vertus chrétiennes",
    date: "7 Juillet 2025",
    duration: "43 min",
    views: 934,
    thumbnail: null,
    verse: "Romains 15:13",
  },
  {
    id: 7,
    title: "L'Importance de la Communauté",
    preacher: "Berger Lesty Paka",
    category: "Communauté",
    series: "Ensemble pour avancer",
    date: "30 Juin 2025",
    duration: "47 min",
    views: 1456,
    thumbnail: null,
    verse: "Hébreux 10:24-25",
  },
  {
    id: 8,
    title: "La Sagesse d'En Haut",
    preacher: "Papa Celestin",
    category: "Sagesse",
    series: "Marcher dans la sagesse",
    date: "23 Juin 2025",
    duration: "39 min",
    views: 789,
    thumbnail: null,
    verse: "Jacques 3:17-18",
  },
  {
    id: 9,
    title: "Le Courage d'être Fidèle",
    preacher: "Frère prince",
    category: "Fidélité",
    series: "Héros de la foi",
    date: "16 Juin 2025",
    duration: "41 min",
    views: 1023,
    thumbnail: null,
    verse: "Daniel 3:16-18",
  },
];

const categories = ["Tous", "Foi", "Confiance", "Amour", "Paix", "Joie", "Espérance", "Communauté", "Sagesse", "Fidélité"];
const seriesList = ["Toutes", "Vaincre par la prière", "La vie de foi", "Fruits de l'Esprit", "Le repos de l'âme", "Les vertus chrétiennes", "Ensemble pour avancer", "Marcher dans la sagesse", "Héros de la foi"];

// Category colors
const categoryColors: Record<string, string> = {
  "Foi": "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400",
  "Confiance": "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  "Amour": "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400",
  "Paix": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  "Joie": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  "Espérance": "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-400",
  "Communauté": "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
  "Sagesse": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400",
  "Fidélité": "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400",
};

export default function SermonsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [selectedSeries, setSelectedSeries] = useState("Toutes");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Filter sermons
  const filteredSermons = useMemo(() => {
    return allSermons.filter((sermon) => {
      const matchesSearch =
        searchQuery === "" ||
        sermon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sermon.preacher.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory =
        selectedCategory === "Tous" || sermon.category === selectedCategory;
      
      const matchesSeries =
        selectedSeries === "Toutes" || sermon.series === selectedSeries;

      return matchesSearch && matchesCategory && matchesSeries;
    });
  }, [searchQuery, selectedCategory, selectedSeries]);

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
              title="Nos Prédications"
              description="Retrouvez tous nos enseignements pour nourrir votre vie spirituelle au quotidien."
              breadcrumbs={[{ label: "Prédications" }]}
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

      {/* Search and Filters */}
      <section className="py-8 border-b border-border sticky top-16 lg:top-20 bg-background/95 backdrop-blur-sm z-30">
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
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="rounded-lg"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filtres
                {(selectedCategory !== "Tous" || selectedSeries !== "Toutes") && (
                  <Badge variant="secondary" className="ml-2 bg-primary text-primary-foreground">
                    {[selectedCategory !== "Tous", selectedSeries !== "Toutes"].filter(Boolean).length}
                  </Badge>
                )}
              </Button>

              <span className="text-sm text-muted-foreground hidden sm:block">
                {filteredSermons.length} prédication{filteredSermons.length > 1 ? "s" : ""} trouvée{filteredSermons.length > 1 ? "s" : ""}
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

                  {/* Series */}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Série</p>
                    <div className="flex flex-wrap gap-2">
                      {seriesList.map((series) => (
                        <Button
                          key={series}
                          variant={selectedSeries === series ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedSeries(series)}
                          className={`rounded-full ${
                            selectedSeries === series
                              ? "gradient-spiritual text-white border-0"
                              : ""
                          }`}
                        >
                          {series}
                        </Button>
                      ))}
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
          {filteredSermons.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSermons.map((sermon, index) => (
                  <motion.div
                    key={sermon.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                  >
                    <Link href={`/predications/${sermon.id}`}>
                      <Card className="group overflow-hidden h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        {/* Thumbnail */}
                        <div className="aspect-video bg-gradient-to-br from-violet-500 to-purple-600 relative overflow-hidden">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Mic className="w-16 h-16 text-white/30" />
                          </div>
                          
                          {/* Play button overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-lg">
                              <Play className="w-6 h-6 text-violet-600 ml-1" />
                            </div>
                          </div>

                          {/* Duration badge */}
                          <Badge className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white border-0">
                            <Clock className="w-3 h-3 mr-1" />
                            {sermon.duration}
                          </Badge>

                          {/* Category badge */}
                          <Badge 
                            className={`absolute top-3 left-3 ${categoryColors[sermon.category] || 'bg-gray-100 text-gray-700'} border-0`}
                          >
                            {sermon.category}
                          </Badge>
                        </div>

                        <CardContent className="p-5">
                          <h3 className="font-semibold text-lg text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                            {sermon.title}
                          </h3>
                          
                          {sermon.series && (
                            <p className="text-xs text-primary font-medium mb-2">
                              {sermon.series}
                            </p>
                          )}

                          <p className="text-muted-foreground text-sm mb-3">
                            {sermon.preacher}
                          </p>

                          <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {sermon.date}
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
                {filteredSermons.map((sermon, index) => (
                  <motion.div
                    key={sermon.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                  >
                    <Link href={`/predications/${sermon.id}`}>
                      <Card className="group overflow-hidden hover:shadow-md transition-all duration-300">
                        <CardContent className="p-4 flex gap-4">
                          {/* Thumbnail */}
                          <div className="w-32 h-24 sm:w-40 sm:h-28 shrink-0 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg relative overflow-hidden flex items-center justify-center">
                            <Mic className="w-10 h-10 text-white/30" />
                            
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300">
                                <Play className="w-4 h-4 text-violet-600 ml-0.5" />
                              </div>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 py-1">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                                {sermon.title}
                              </h3>
                              <Badge 
                                variant="outline" 
                                className={`shrink-0 ${categoryColors[sermon.category] || ''}`}
                              >
                                {sermon.category}
                              </Badge>
                            </div>
                            
                            {sermon.series && (
                              <p className="text-xs text-primary font-medium mb-1 truncate">
                                {sermon.series}
                              </p>
                            )}

                            <p className="text-sm text-muted-foreground mb-2">
                              {sermon.preacher}
                            </p>

                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {sermon.date}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {sermon.duration}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" />
                                {sermon.views.toLocaleString()}
                              </span>
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
              <Mic className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                Aucune prédication trouvée
              </h3>
              <p className="text-muted-foreground mb-6">
                Essayez de modifier vos critères de recherche ou de filtres.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("Tous");
                  setSelectedSeries("Toutes");
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
