"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  Clock,
  Calendar,
  Users,
  Share2,
  Heart,
  Download,
  BookOpen,
  ChevronRight,
  ArrowLeft,
  Facebook,
  Twitter,
  Mail,
  Link2,
  Mic,
  User,
  ListPlus,
  Volume2,
  FileText,
} from "lucide-react";
import { PublicLayout } from "@/components/layouts/public-layout";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ============================================
// TYPES
// ============================================

interface SermonDetail {
  id: string;
  title: string;
  description: string;
  preacher: {
    name: string;
    role: string;
    bio: string;
    avatar: null | string;
    initials: string;
  };
  category: string;
  series?: {
    name: string;
    count: number;
    description: string;
  };
  date: string;
  duration: string;
  views: number;
  type: "video" | "audio" | "pdf";
  verse: string;
  verseText: string;
  notes: string[];
  downloadUrl?: string;
}

interface RelatedSermon {
  id: string;
  title: string;
  preacher: string;
  category: string;
  date: string;
  duration: string;
}

// ============================================
// MOCK DATA
// ============================================

const sermonData: Record<string, SermonDetail> = {
  ser_001: {
    id: "ser_001",
    title: "La Paix qui Surpasse Toute Intelligence",
    description: `Dans cet enseignement profond, nous explorons la paix divine que Jésus nous offre - une paix qui dépasse toute compréhension humaine. Cette paix n'est pas simplement l'absence de trouble, mais une présence rassurante de Dieu au milieu des tempêtes de la vie.

Nous découvrirons ensemble :
• La nature véritable de la paix de Dieu
• Comment cette paix diffère de la paix du monde
• Les obstacles qui nous empêchent de recevoir cette paix
• Les pratiques bibliques pour cultiver la paix intérieure
• Comment maintenir sa paix dans les moments difficiles

Cette prédication vous encouragera à vous approprier cette promesse merveilleuse et à vivre dans une paix constante, quelle que soit votre situation.`,
    preacher: {
      name: "Pasteur Jean-Marc Lumbu",
      role: "Pasteur Principal",
      bio: "Plus de 20 ans de ministère pastoral. Passionné par l'enseignement biblique et le développement des leaders. Auteur de plusieurs livres sur la vie chrétienne.",
      avatar: null,
      initials: "JL",
    },
    category: "Paix & Consolation",
    series: {
      name: "Le Repos de l'Âme",
      count: 6,
      description: "Une série sur le repos spirituel et la paix intérieure que Dieu offre à Ses enfants.",
    },
    date: "15 Décembre 2024",
    duration: "45:32",
    views: 342,
    type: "video",
    verse: "Philippiens 4:7",
    verseText:
      "Et la paix de Dieu, qui surpasse toute intelligence, gardera vos cœurs et vos pensées en Jésus-Christ.",
    notes: [
      "La paix de Dieu est un don, pas quelque chose qu'on doit mériter",
      "Cette paix garde nos cœurs ET nos pensées - elle est complète",
      "Elle 'surpasse toute intelligence' - on ne peut pas toujours l'expliquer",
      "La paix est liée à notre position 'en Jésus-Christ'",
      "L'anxiété et la prière sont directement connectées (v.6-7)",
    ],
  },
  ser_002: {
    id: "ser_002",
    title: "Marcher par la Foi et non par la Vue",
    description: `La foi est le fondement de notre relation avec Dieu. Dans ce message inspirant, nous apprenons comment vivre une vie de confiance totale en Dieu, même lorsque nos circonstances semblent contraires.

Points clés abordés :
• Comprendre la nature biblique de la foi
• La différence entre la foi et l'optimisme
• Comment développer une foi plus forte au quotidien
• Les exemples de grands hommes et femmes de foi
• Surmonter les doutes et les peurs par la foi`,
    preacher: {
      name: "Pasteur Emmanuel Kamba",
      role: "Pasteur Associé",
      bio: "Spécialiste de l'enseignement sur la foi et la vie de victoire. Plus de 15 ans d'expérience dans le ministère.",
      avatar: null,
      initials: "EK",
    },
    category: "Foi & Confiance",
    series: {
      name: "La Vie de Foi",
      count: 8,
      description: "Explorer les principes bibliques pour vivre une vie de foi victorieuse.",
    },
    date: "8 Décembre 2024",
    duration: "38:15",
    views: 289,
    type: "video",
    verse: "2 Corinthiens 5:7",
    verseText:
      "Car nous marchons par la foi et non par la vue.",
    notes: [
      "La foi voit ce que les yeux ne peuvent pas voir",
      "Marcher par la foi nécessite une décision quotidienne",
      "La foi n'est pas aveugle - elle voit au-delà du visible",
      "Dieu honore ceux qui Lui font confiance complètement",
    ],
  },
  ser_003: {
    id: "ser_003",
    title: "L'Amour qui Transforme",
    description: `L'amour de Dieu est la force la plus transformative de l'univers. Ce message explore comment l'amour divin peut changer nos vies, nos relations et notre impact sur le monde autour de nous.

Nous examinerons :
• Les caractéristiques de l'amour divin (1 Corinthiens 13)
• Comment recevoir pleinement l'amour de Dieu
• Comment aimer comme Dieu aime
• Le pouvoir transformateur de l'amour dans le mariage et la famille
• L'amour comme témoignage puissant`,
    preacher: {
      name: "Sœur Grace Mutombo",
      role: "Responsable Femmes",
      bio: "Passionnée par l'enseignement aux femmes et le développement des familles. Conférencière et auteure.",
      avatar: null,
      initials: "GM",
    },
    category: "Amour & Relations",
    series: {
      name: "Fruits de l'Esprit",
      count: 9,
      description: "Une exploration approfondie des neuf fruits de l'Esprit mentionnés en Galates 5.",
    },
    date: "1 Décembre 2024",
    duration: "42:08",
    views: 256,
    type: "audio",
    verse: "1 Jean 4:7-12",
    verseText:
      "Bien-aimés, aimons-nous les uns les autres; car l'amour est de Dieu, et quiconque aime est né de Dieu et connaît Dieu.",
    notes: [
      "L'amour n'est pas juste un sentiment - c'est une décision et une action",
      "Nous ne pouvons pas aimer véritablement sans connaître Dieu d'abord",
      "L'amour est la preuve que nous connaissons Dieu",
      "Dieu a démontré Son amour en envoyant Son Fils",
      "Si Dieu nous a tant aimés, nous devons aussi nous aimer les uns les autres",
    ],
  },
};

const relatedSermonsMap: Record<string, RelatedSermon[]> = {
  ser_001: [
    {
      id: "ser_002",
      title: "Marcher par la Foi et non par la Vue",
      preacher: "Pasteur Emmanuel Kamba",
      category: "Foi & Confiance",
      date: "8 Décembre 2024",
      duration: "38:15",
    },
    {
      id: "ser_003",
      title: "L'Amour qui Transforme",
      preacher: "Sœur Grace Mutombo",
      category: "Amour & Relations",
      date: "1 Décembre 2024",
      duration: "42:08",
    },
    {
      id: "ser_004",
      title: "La Puissance de la Prière Persistante",
      preacher: "Pasteur Jean-Marc Lumbu",
      category: "Prière & Intercession",
      date: "24 Novembre 2024",
      duration: "52:45",
    },
  ],
  ser_002: [
    {
      id: "ser_001",
      title: "La Paix qui Surpasse Toute Intelligence",
      preacher: "Pasteur Jean-Marc Lumbu",
      category: "Paix & Consolation",
      date: "15 Décembre 2024",
      duration: "45:32",
    },
    {
      id: "ser_006",
      title: "La Joie comme Force",
      preacher: "Pasteur Emmanuel Kamba",
      category: "Joie & Actions de Grâce",
      date: "10 Novembre 2024",
      duration: "41:55",
    },
    {
      id: "ser_011",
      title: "La Grâce Suffisante",
      preacher: "Pasteur Emmanuel Kamba",
      category: "Grâce & Rédemption",
      date: "6 Octobre 2024",
      duration: "37:50",
    },
  ],
  ser_003: [
    {
      id: "ser_001",
      title: "La Paix qui Surpasse Toute Intelligence",
      preacher: "Pasteur Jean-Marc Lumbu",
      category: "Paix & Consolation",
      date: "15 Décembre 2024",
      duration: "45:32",
    },
    {
      id: "ser_007",
      title: "Vivre dans l'Espérance Éternelle",
      preacher: "Sœur Grace Mutombo",
      category: "Espérance & Avenir",
      date: "3 Novembre 2024",
      duration: "44:12",
    },
    {
      id: "ser_010",
      title: "Le Courage d'être Fidèle",
      preacher: "Sœur Grace Mutombo",
      category: "Fidélité & Persévérance",
      date: "13 Octobre 2024",
      duration: "43:45",
    },
  ],
};

const allCategories = [
  "Paix & Consolation",
  "Foi & Confiance",
  "Amour & Relations",
  "Prière & Intercession",
  "Ministère & Service",
  "Joie & Actions de Grâce",
  "Espérance & Avenir",
  "Communauté & Fraternité",
];

export default function SermonDetailPage() {
  const params = useParams();
  const sermonId = params.id as string;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isInPlaylist, setIsInPlaylist] = useState(false);

  // Get sermon data (with fallback to first sermon)
  const sermon = sermonData[sermonId] || sermonData["ser_001"];
  const relatedSermons =
    relatedSermonsMap[sermonId] || relatedSermonsMap["ser_001"];

  if (!sermon) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <Mic className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h1 className="font-serif text-2xl font-bold mb-4">
            Prédication non trouvée
          </h1>
          <p className="text-muted-foreground mb-6">
            Cette prédication n&apos;existe pas ou a été supprimée.
          </p>
          <Button asChild>
            <Link href="/sermons">Retour aux prédications</Link>
          </Button>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      {/* Breadcrumb & Header */}
      <section className="bg-muted/30 py-8 border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Back button */}
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <Link href="/sermons">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour aux prédications
              </Link>
            </Button>

            <PageHeader
              title={sermon.title}
              breadcrumbs={[
                { label: "Prédications", href: "/sermons" },
                { label: sermon.title },
              ]}
              actions={
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsLiked(!isLiked)}
                    className={`rounded-lg ${
                      isLiked
                        ? "text-red-500 border-red-200 bg-red-50 dark:bg-red-950/20"
                        : ""
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 mr-1 ${isLiked ? "fill-current" : ""}`}
                    />
                    {isLiked ? "Aimé" : "J'aime"}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsInPlaylist(!isInPlaylist)}
                    className={`rounded-lg ${
                      isInPlaylist
                        ? "text-primary border-primary bg-primary/5"
                        : ""
                    }`}
                  >
                    <ListPlus
                      className={`w-4 h-4 mr-1 ${isInPlaylist ? "fill-current" : ""}`}
                    />
                    {isInPlaylist ? "Ajoutée" : "Playlist"}
                  </Button>

                  <DropdownMenu open={showShareMenu} onOpenChange={setShowShareMenu}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="rounded-lg">
                        <Share2 className="w-4 h-4 mr-1" />
                        Partager
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem className="cursor-pointer">
                        <Facebook className="w-4 h-4 mr-2 text-blue-600" />
                        Facebook
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                        <Twitter className="w-4 h-4 mr-2 text-sky-500" />
                        Twitter / X
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                        <Mail className="w-4 h-4 mr-2 text-gray-600" />
                        Email
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                        <Link2 className="w-4 h-4 mr-2" />
                        Copier le lien
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {(sermon.type === "audio" || sermon.type === "video") && (
                    <Button variant="outline" size="sm" className="rounded-lg">
                      <Download className="w-4 h-4 mr-1" />
                      Télécharger
                    </Button>
                  )}
                </div>
              }
            />
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Main content - 2/3 */}
            <div className="lg:col-span-2 space-y-8">
              {/* Video/Audio Player */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                <Card className="overflow-hidden shadow-lg">
                  {/* Player placeholder */}
                  <div
                    className={`aspect-video bg-gradient-to-br ${
                      sermon.type === "pdf"
                        ? "from-stone-500 via-stone-600 to-stone-700"
                        : "from-violet-900 via-purple-800 to-violet-900"
                    } relative flex items-center justify-center cursor-pointer group`}
                    onClick={() =>
                      sermon.type !== "pdf" && setIsPlaying(!isPlaying)
                    }
                  >
                    {!isPlaying ? (
                      <>
                        <div className="absolute inset-0 flex items-center justify-center">
                          {sermon.type === "pdf" ? (
                            <FileText className="w-24 h-24 text-white/20" />
                          ) : (
                            <Mic className="w-24 h-24 text-white/10" />
                          )}
                        </div>

                        {sermon.type !== "pdf" ? (
                          <div className="relative z-10 w-20 h-20 rounded-full bg-white/95 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                            <Play className="w-8 h-8 text-violet-600 ml-1" />
                          </div>
                        ) : (
                          <div className="relative z-10 w-20 h-20 rounded-full bg-white/95 flex items-center justify-center shadow-xl">
                            <Download className="w-8 h-8 text-stone-600" />
                          </div>
                        )}

                        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />

                        {/* Type badge */}
                        <Badge className="absolute top-4 left-4 bg-black/40 backdrop-blur-sm text-white border-0">
                          {sermon.type === "video" && (
                            <>
                              <Play className="w-3 h-3 mr-1" /> Vidéo
                            </>
                          )}
                          {sermon.type === "audio" && (
                            <>
                              <Volume2 className="w-3 h-3 mr-1" /> Audio
                            </>
                          )}
                          {sermon.type === "pdf" && (
                            <>
                              <FileText className="w-3 h-3 mr-1" /> Document PDF
                            </>
                          )}
                        </Badge>

                        <span className="absolute bottom-4 left-4 text-white font-medium text-sm">
                          {sermon.duration}
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                          <div className="text-center text-white">
                            <Pause className="w-16 h-16 mx-auto mb-3 opacity-80" />
                            <p className="text-sm opacity-60">Lecture en cours...</p>
                            <p className="text-xs opacity-40 mt-1">
                              (Mode démonstration)
                            </p>
                          </div>
                        </div>
                        {/* Progress bar simulation */}
                        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20">
                          <div className="h-full w-1/3 gradient-spiritual rounded-r-full transition-all duration-1000" />
                        </div>
                        <span className="absolute bottom-4 right-4 text-white/80 text-xs">
                          15:24 / {sermon.duration}
                        </span>
                      </>
                    )}
                  </div>
                </Card>
              </motion.div>

              {/* Sermon Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Card>
                  <CardContent className="p-6 lg:p-8">
                    {/* Meta info */}
                    <div className="flex flex-wrap items-center gap-3 mb-6 pb-6 border-b border-border">
                      <Badge className="gradient-spiritual text-white border-0">
                        {sermon.category}
                      </Badge>
                      {sermon.series && (
                        <Badge variant="outline">
                          <BookOpen className="w-3 h-3 mr-1" />
                          Série : {sermon.series.name}
                        </Badge>
                      )}
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {sermon.date}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {sermon.duration}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        {sermon.views.toLocaleString()} vues
                      </span>
                    </div>

                    {/* Preacher info */}
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                      <Avatar className="w-14 h-14 ring-4 ring-primary/10">
                        <AvatarImage src={sermon.preacher.avatar || undefined} />
                        <AvatarFallback className="gradient-spiritual text-white font-semibold">
                          {sermon.preacher.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-foreground">
                          {sermon.preacher.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {sermon.preacher.role}
                        </p>
                      </div>
                    </div>

                    {/* Verse reference */}
                    <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 mb-6 border border-primary/10">
                      <div className="flex items-start gap-3">
                        <BookOpen className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-primary mb-1">
                            {sermon.verse}
                          </p>
                          <p className="text-foreground italic leading-relaxed">
                            &ldquo;{sermon.verseText}&rdquo;
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="prose prose-gray dark:prose-invert max-w-none">
                      <h3 className="font-serif text-xl font-semibold text-foreground mb-4">
                        Résumé
                      </h3>
                      <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {sermon.description}
                      </div>
                    </div>

                    {/* Key points / Notes */}
                    {sermon.notes && sermon.notes.length > 0 && (
                      <div className="mt-8 pt-6 border-t border-border">
                        <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
                          Points Clés
                        </h3>
                        <ul className="space-y-3">
                          {sermon.notes.map((note, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <ChevronRight className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                              <span className="text-muted-foreground">{note}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Action buttons at bottom */}
                    <div className="mt-8 pt-6 border-t border-border">
                      <div className="flex flex-wrap gap-3">
                        <Button
                          variant={isLiked ? "default" : "outline"}
                          size="sm"
                          onClick={() => setIsLiked(!isLiked)}
                          className={`rounded-lg ${
                            isLiked ? "gradient-spiritual text-white border-0" : ""
                          }`}
                        >
                          <Heart
                            className={`w-4 h-4 mr-2 ${isLiked ? "fill-current" : ""}`}
                          />
                          {isLiked ? "Aimé" : "Ajouter aux favoris"}
                        </Button>
                        <Button
                          variant={isInPlaylist ? "default" : "outline"}
                          size="sm"
                          onClick={() => setIsInPlaylist(!isInPlaylist)}
                          className={`rounded-lg ${
                            isInPlaylist
                              ? "gradient-spiritual text-white border-0"
                              : ""
                          }`}
                        >
                          <ListPlus
                            className={`w-4 h-4 mr-2 ${isInPlaylist ? "fill-current" : ""}`}
                          />
                          {isInPlaylist ? "Dans ma playlist" : "Ajouter à playlist"}
                        </Button>
                        <Button variant="outline" size="sm" className="rounded-lg">
                          <Share2 className="w-4 h-4 mr-2" />
                          Partager
                        </Button>
                        {(sermon.type === "audio" || sermon.type === "video") && (
                          <Button variant="outline" size="sm" className="rounded-lg">
                            <Download className="w-4 h-4 mr-2" />
                            Télécharger ({sermon.type.toUpperCase()})
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar - 1/3 */}
            <div className="space-y-6">
              {/* Preacher Info Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-4">
                      Le Prédicateur
                    </h3>

                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="w-16 h-16 ring-4 ring-primary/10">
                        <AvatarImage src={sermon.preacher.avatar || undefined} />
                        <AvatarFallback className="gradient-spiritual text-white text-lg font-semibold">
                          {sermon.preacher.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-foreground">
                          {sermon.preacher.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {sermon.preacher.role}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      {sermon.preacher.bio}
                    </p>

                    <Button variant="outline" size="sm" className="w-full rounded-lg">
                      <User className="w-4 h-4 mr-2" />
                      Voir le profil
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Series Info Card */}
              {sermon.series && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35, duration: 0.5 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-foreground mb-4">
                        Cette Série
                      </h3>

                      <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4 mb-4 border border-primary/10">
                        <p className="font-medium text-primary">
                          {sermon.series.name}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {sermon.series.count} messages dans cette série
                        </p>
                        <p className="text-xs text-muted-foreground mt-2 italic">
                          {sermon.series.description}
                        </p>
                      </div>

                      <Button variant="outline" size="sm" className="w-full rounded-lg">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Voir toute la série
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Categories List */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-4">
                      Catégories
                    </h3>
                    <div className="space-y-2">
                      {allCategories.map((cat) => (
                        <Link
                          key={cat}
                          href={`/sermons?category=${encodeURIComponent(cat)}`}
                          className="block"
                        >
                          <div
                            className={`flex items-center justify-between p-2 rounded-lg transition-colors hover:bg-muted ${
                              cat === sermon.category
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-muted-foreground"
                            }`}
                          >
                            <span className="text-sm">{cat}</span>
                            {cat === sermon.category && (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45, duration: 0.5 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-4">
                      Actions Rapides
                    </h3>

                    <div className="space-y-2">
                      {(sermon.type === "audio" || sermon.type === "video") && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start rounded-lg"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Télécharger ({sermon.type.toUpperCase()})
                        </Button>
                      )}
                      {sermon.type === "pdf" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start rounded-lg"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Télécharger le PDF
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start rounded-lg"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Partager sur les réseaux
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start rounded-lg"
                      >
                        <ListPlus className="w-4 h-4 mr-2" />
                        Ajouter à une playlist
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Sermons Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-serif text-2xl font-bold text-foreground">
                Prédications Similaires
              </h2>
              <Button variant="ghost" asChild className="text-primary">
                <Link href="/sermons">
                  Voir tout
                  <ChevronRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedSermons.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                >
                  <Link href={`/sermons/${item.id}`}>
                    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
                      <div className="aspect-video bg-gradient-to-br from-violet-500 to-purple-600 relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Mic className="w-12 h-12 text-white/30" />
                        </div>

                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300">
                            <Play className="w-5 h-5 text-violet-600 ml-0.5" />
                          </div>
                        </div>

                        <Badge className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white border-0 text-xs">
                          {item.category.split(" ")[0]}
                        </Badge>

                        <Badge className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white border-0 text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {item.duration}
                        </Badge>
                      </div>

                      <CardContent className="p-4">
                        <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors mb-2">
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {item.preacher}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {item.date}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}
