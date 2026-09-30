"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from '@/lib/no-motion';
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
  ArrowRight,
  Facebook,
  Twitter,
  Mail,
  Link2,
  Mic,
  User,
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

// Mock sermon data (in real app, this would come from API)
const sermonData: Record<string, {
  id: number;
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
  };
  date: string;
  duration: string;
  views: number;
  verse: string;
  verseText: string;
  notes: string[];
}> = {
  "1": {
    id: 1,
    title: "La Puissance de la Prière Persistante",
    description: `Dans cet enseignement puissant, nous explorons comment Jésus nous enseigne l'importance de la persévérance dans la prière à travers la parabole du juge inique. Découvrez pourquoi Dieu nous invite à prier sans nous décourager et comment notre fidélité dans la prière peut transformer nos vies et celles de notre entourage.

Nous examinerons les clés bibliques pour une vie de prière efficace :
- La posture du cœur dans la prière
- L'importance de la constance
- Comment faire face au silence apparent de Dieu
- Les fruits d'une vie de prière persistante`,
    preacher: {
      name: "Berger Lesty paka",
      role: "Pasteur Principal",
      bio: "Plus de 20 ans de ministère pastoral. Passionné par l'enseignement biblique et le développement des leaders.",
      avatar: null,
      initials: "MD",
    },
    category: "Foi",
    series: {
      name: "Vaincre par la prière",
      count: 5,
    },
    date: "11 Août 2025",
    duration: "42 min",
    views: 1247,
    verse: "Luc 18:1-8",
    verseText: "Jésus leur adressa une parabole, pour montrer qu'ils doivent toujours prier, et ne point se relâcher.",
    notes: [
      "La prière n'est pas seulement une demande, c'est une relation",
      "La persévérance dans la prière change notre cœur avant de changer nos circonstances",
      "Dieu n'est pas comme le juge iniqu - Il est un Père qui aime Ses enfants",
      "Le moment de la réponse appartient à Dieu, mais la prière nous appartient",
    ],
  },
};

// Related sermons
const relatedSermons = [
  {
    id: 2,
    title: "Marcher par la Foi et non par la Vue",
    preacher: "Frère armèle", 
    category: "Confiance",
    date: "4 Août 2025",
    duration: "38 min",
  },
  {
    id: 3,
    title: "L'Amour qui Transforme",
    preacher: "Berger Lesty Paka",
    category: "Amour",
    date: "28 Juillet 2025",
    duration: "45 min",
  },
  {
    id: 4,
    title: "Trouver le Repos en Dieu",
    preacher: "Berger Lesty Paka",
    category: "Paix",
    date: "21 Juillet 2025",
    duration: "40 min",
  },
];

export default function SermonDetailPage() {
  const params = useParams();
  const sermonId = params.id as string;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Get sermon data (with fallback)
  const sermon = sermonData[sermonId] || sermonData["1"];

  if (!sermon) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-serif text-2xl font-bold mb-4">Prédication non trouvée</h1>
          <p className="text-muted-foreground mb-6">Cette prédication n'existe pas ou a été supprimée.</p>
          <Button asChild>
            <Link href="/predications">Retour aux prédications</Link>
          </Button>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      {/* Breadcrumb & Header */}
      <section className="bg-muted/30 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <PageHeader
              title={sermon.title}
              breadcrumbs={[
                { label: "Prédications", href: "/predications" },
                { label: sermon.title },
              ]}
              actions={
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsLiked(!isLiked)}
                    className={`rounded-lg ${isLiked ? 'text-red-500 border-red-200 bg-red-50' : ''}`}
                  >
                    <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                    {isLiked ? "Aimé" : "J'aime"}
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

                  <Button variant="outline" size="sm" className="rounded-lg">
                    <Download className="w-4 h-4 mr-1" />
                    Télécharger
                  </Button>
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
                <Card className="overflow-hidden">
                  {/* Video placeholder */}
                  <div className="aspect-video bg-gradient-to-br from-violet-900 via-purple-800 to-violet-900 relative flex items-center justify-center cursor-pointer group"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {!isPlaying ? (
                      <>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Mic className="w-24 h-24 text-white/10" />
                        </div>
                        <div className="relative z-10 w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                          <Play className="w-8 h-8 text-violet-600 ml-1" />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
                        <span className="absolute bottom-4 left-4 text-white font-medium">
                          {sermon.duration}
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                          <div className="text-center text-white">
                            <Pause className="w-16 h-16 mx-auto mb-3 opacity-80" />
                            <p className="text-sm opacity-60">Lecture en cours...</p>
                            <p className="text-xs opacity-40 mt-1">(Mode démonstration)</p>
                          </div>
                        </div>
                        {/* Progress bar simulation */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                          <div className="h-full w-1/3 gradient-spiritual rounded-r-full" />
                        </div>
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

                    {/* Verse reference */}
                    <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 mb-6 border border-primary/10">
                      <div className="flex items-start gap-3">
                        <BookOpen className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-primary mb-1">{sermon.verse}</p>
                          <p className="text-foreground italic leading-relaxed">
                            "{sermon.verseText}"
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
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar - 1/3 */}
            <div className="space-y-6">
              {/* Preacher Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-4">Le Prédicateur</h3>
                    
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="w-16 h-16 ring-4 ring-primary/10">
                        <AvatarImage src={sermon.preacher.avatar || undefined} />
                        <AvatarFallback className="gradient-spiritual text-white text-lg font-semibold">
                          {sermon.preacher.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-foreground">{sermon.preacher.name}</p>
                        <p className="text-sm text-muted-foreground">{sermon.preacher.role}</p>
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

              {/* Series Info */}
              {sermon.series && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35, duration: 0.5 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-foreground mb-4">Cette Série</h3>
                      
                      <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4 mb-4 border border-primary/10">
                        <p className="font-medium text-primary">{sermon.series.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {sermon.series.count} messages dans cette série
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

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, durée: 0.5 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-4">Actions Rapides</h3>
                    
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start rounded-lg">
                        <Download className="w-4 h-4 mr-2" />
                        Télécharger l'audio (MP3)
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start rounded-lg">
                        <Download className="w-4 h-4 mr-2" />
                        Télécharger les notes (PDF)
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start rounded-lg">
                        <Share2 className="w-4 h-4 mr-2" />
                        Partager sur les réseaux
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Sermons */}
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
                <Link href="/predications">
                  Voir tout
                  <ArrowRight className="ml-2 w-4 h-4" />
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
                  <Link href={`/predications/${item.id}`}>
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

                        <Badge className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white border-0">
                          {item.category}
                        </Badge>
                        
                        <Badge className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white border-0">
                          <Clock className="w-3 h-3 mr-1" />
                          {item.duration}
                        </Badge>
                      </div>

                      <CardContent className="p-4">
                        <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors mb-2">
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">{item.preacher}</p>
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
