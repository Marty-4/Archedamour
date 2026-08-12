"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
  Share2,
  Heart,
  CheckCircle,
  User,
  Mail,
  Phone,
  MessageSquare,
  ChevronRight,
  ExternalLink,
  Facebook,
  Twitter,
  Link2,
  CalendarDays,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { PublicLayout } from "@/components/layouts/public-layout";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ============================================
// TYPES
// ============================================

interface EventDetail {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  date: string;
  endDate?: string;
  time: string;
  endTime?: string;
  location: string;
  address: string;
  category: string;
  organizer: {
    name: string;
    role: string;
    avatar: null | string;
    initials: string;
  };
  maxSpots?: number;
  registeredCount: number;
  isUpcoming: boolean;
  status: "open" | "full" | "cancelled" | "ended";
  program?: { time: string; title: string; description?: string }[];
  attendees?: { name: string; avatar: null | string; initials: string; joinedAt: string }[];
}

// ============================================
// MOCK DATA
// ============================================

const eventData: Record<string, EventDetail> = {
  evt_001: {
    id: "evt_001",
    title: "Retraite de Fin d'Année",
    description:
      "Trois jours de jeûne, prière et enseignement pour clôturer l'année dans la présence de Dieu.",
    longDescription: `Rejoignez-nous pour ce moment intense de retraite spirituelle qui marquera la fin de cette année bénie. Cette retraite est une occasion unique de :

• Se retirer du tumulte quotidien pour se concentrer sur Dieu
• Recevoir des enseignements puissants pour l'année qui vient
• Prier ensemble pour nos familles, notre église et notre nation
• Renouveler notre engagement envers le Seigneur
• Tisser des liens plus profonds avec nos frères et sœurs

**Ce qui vous attend :**

📖 **Enseignements bibliques** - Des messages inspirés par le Saint-Esprit pour préparer votre cœur à recevoir les bénédictions de la nouvelle année.

🙏 **Sessions de prière** - Des temps de prière collective et personnelle dans une atmosphère de ferveur.

🎵 **Louange et adoration** - Des moments de worship intenses pour exalter le nom du Seigneur.

👥 **Fellowship** - Des temps de partage et de communion autour des repas.

**Informations pratiques :**

L'hébergement et les repas sont inclus dans la participation. Apportez votre Bible, un carnet de notes et des vêtements confortables. Les chambres sont attribuées par ordre d'inscription.

Nous attendons votre présence avec impatience!`,
    date: "2024-12-28",
    endDate: "2024-12-30",
    time: "08:00",
    endTime: "17:00",
    location: "Centre de Retraite Kinshasa",
    address: "Boulevard Lumumba, Quartier Gombe, Kinshasa",
    category: "Retraite",
    organizer: {
      name: "Pasteur Jean-Marc Lumbu",
      role: "Pasteur Principal",
      avatar: null,
      initials: "JL",
    },
    maxSpots: 200,
    registeredCount: 124,
    isUpcoming: true,
    status: "open",
    program: [
      { time: "07:00", title: "Accueil et installation" },
      { time: "08:00", title: "Petit-déjeuner" },
      { time: "09:00", title: "Session de louange" },
      { time: "10:00", title: "1er enseignement : La fidélité de Dieu à travers les générations" },
      { time: "12:00", title: "Déjeuner" },
      { time: "14:00", title: "Ateliers par groupes" },
      { time: "16:00", title: "Temps de prière personnelle" },
      { time: "17:30", title: "Repas du soir" },
      { time: "19:30", title: "Veillée de prière" },
      { time: "21:30", title: "Repos" },
    ],
    attendees: [
      { name: "Marie-Claire Moké", avatar: null, initials: "MM", joinedAt: "15 Déc 2024" },
      { name: "Patrice Mbemba", avatar: null, initials: "PM", joinedAt: "10 Déc 2024" },
      { name: "Esther Tshibuabua", avatar: null, initials: "ET", joinedAt: "8 Déc 2024" },
      { name: "Jean-Pierre Kasongo", avatar: null, initials: "JK", joinedAt: "5 Déc 2024" },
      { name: "Sophie Ngalula", avatar: null, initials: "SN", joinedAt: "1 Déc 2024" },
    ],
  },
  evt_002: {
    id: "evt_002",
    title: "Soirée des Enfants - Noël Spécial",
    description:
      "Célébration spéciale avec nos enfants pour Noël : chants, sketches bibliques, partage de cadeaux et goûter.",
    longDescription: `Une soirée magique dédiée à nos petits trésors! Cette année, nous célébrons Noël avec un programme exceptionnel conçu pour émerveiller les cœurs de nos enfants.

**Programme de la soirée :**

🎄 **Arrivée et accueil** (15h00) - Chaque enfant recevra son badge spécial "Aventurier de Noël"

🎵 **Chorale des enfants** - Nos petits chanteront les plus beaux cantiques de Noël

🎭 **Sketches bibliques** - L'histoire de Noël racontée de manière interactive et amusante

🎁 **Distribution des cadeaux** - Chaque enfant recevra un cadeau (apporté par les parents ou offert par l'église)

🧁 **Goûter festif** - Gâteaux, jus de fruits et friandises pour tous!

**Pour les parents :**
- Âge concerné : 3-12 ans
- Inscription obligatoire avant le 20 décembre
- Apporter un cadeau étiqueté au nom de votre enfant (budget suggéré : 10,000-25,000 FCFA)
- Les parents sont invités à participer aux dernières 30 minutes (17h30-18h00)

Cette soirée sera un moment inoubliable pour vos enfants!`,
    date: "2024-12-24",
    time: "15:00",
    endTime: "18:00",
    location: "Salle Polyvalente",
    address: "Avenue des Églises, Commune de Limete, Kinshasa",
    category: "Enfants",
    organizer: {
      name: "Sœur Grace Mutombo",
      role: "Responsable Enfants",
      avatar: null,
      initials: "GM",
    },
    maxSpots: 150,
    registeredCount: 85,
    isUpcoming: true,
    status: "open",
    program: [
      { time: "15:00", title: "Accueil et jeux d'intégration" },
      { time: "15:30", title: "Chorale de Noël" },
      { time: "16:00", title: "Sketch : La Nativité" },
      { time: "16:45", title: "Distribution des cadeaux" },
      { time: "17:15", title: "Goûter festif" },
      { time: "17:30", title: "Partage avec les parents" },
    ],
    attendees: [
      { name: "Famille Kabinda", avatar: null, initials: "FK", joinedAt: "18 Déc 2024" },
      { name: "Famille Ilunga", avatar: null, initials: "FI", joinedAt: "15 Déc 2024" },
      { name: "Famille Nsengi", avatar: null, initials: "FN", joinedAt: "10 Déc 2024" },
    ],
  },
  evt_003: {
    id: "evt_003",
    title: "Atelier pour Couples - Communication",
    description:
      "Renforcement des mariages selon les principes bibliques. Thème : Communiquer dans l'amour.",
    longDescription: `Un atelier pratique et interactif destiné aux couples mariés qui désirent renforcer leur communication selon les principes bibliques.

**Thème principal : Communiquer dans l'amour**

La communication est le sang de toute relation. Dans cet atelier, nous explorerons comment :
- Écouter activement comme Jésus nous écoute
- Exprimer ses besoins sans accuser
- Gérer les conflits de manière constructive
- Bâtir l'intimité par le dialogue
- Prier ensemble comme couple

**Format de l'atelier :**
- Enseignements bibliques courts
- Exercices pratiques en couple
- Temps de discussion en petit groupe
- Partage et témoignages
- Engagement personnel

**Matériel fourni :**
- Cahier de travail pour chaque participant
- Outils pratiques à utiliser à la maison
- Liste de ressources recommandées

**Important :** Cet atelier est réservé aux couples mariés. Merci de vous inscrire ensemble.`,
    date: "2025-01-14",
    time: "09:00",
    endTime: "16:00",
    location: "Salle de Conférence",
    address: "Rue de la Paix, Quartier Matonge, Kinshasa",
    category: "Couples",
    organizer: {
      name: "Frère François Mukendi",
      role: "Responsable Couples",
      avatar: null,
      initials: "FM",
    },
    maxSpots: 60,
    registeredCount: 45,
    isUpcoming: true,
    status: "open",
    program: [
      { time: "09:00", title: "Accueil et café" },
      { time: "09:30", title: "Session 1 : Les fondements de la communication biblique" },
      { time: "11:00", title: "Pause" },
      { time: "11:15", title: "Exercice pratique 1" },
      { time: "12:30", title: "Déjeuner (fourni)" },
      { time: "13:30", title: "Session 2 : Gérer les conflits" },
      { time: "15:00", title: "Pause" },
      { time: "15:15", title: "Exercice pratique 2 + Engagements" },
      { time: "16:00", title: "Clôture et prière" },
    ],
    attendees: [
      { name: "Couple Dupont", avatar: null, initials: "CD", joinedAt: "20 Déc 2024" },
      { name: "Couple Martin", avatar: null, initials: "CM", joinedAt: "18 Déc 2024" },
      { name: "Couple Laurent", avatar: null, initials: "CL", joinedAt: "15 Déc 2024" },
      { name: "Couple Kamba", avatar: null, initials: "CK", joinedAt: "10 Déc 2024" },
    ],
  },
};

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.id as string;
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    attendees: "1",
    specialNeeds: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Get event data (with fallback)
  const event = eventData[eventId] || eventData["evt_001"];

  if (!event) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <CalendarDays className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h1 className="font-serif text-2xl font-bold mb-4">
            Événement non trouvé
          </h1>
          <p className="text-muted-foreground mb-6">
            Cet événement n&apos;existe pas ou a été supprimé.
          </p>
          <Button asChild>
            <Link href="/events">Retour aux événements</Link>
          </Button>
        </div>
      </PublicLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const spotsRemaining = event.maxSpots
    ? event.maxSpots - event.registeredCount
    : null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const statusConfig = {
    open: {
      label: "Inscriptions ouvertes",
      icon: CheckCircle,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800",
    },
    full: {
      label: "Complet",
      icon: AlertCircle,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
    },
    cancelled: {
      label: "Annulé",
      icon: XCircle,
      color: "text-red-600 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800",
    },
    ended: {
      label: "Terminé",
      icon: CalendarDays,
      color: "text-gray-600 bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-700",
    },
  };

  const currentStatus = statusConfig[event.status];

  return (
    <PublicLayout>
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-violet-800 overflow-hidden">
        <div className="absolute inset-0">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="relative py-16 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Back button */}
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="mb-6 -ml-2 text-white/80 hover:text-white hover:bg-white/10"
              >
                <Link href="/events">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour aux événements
                </Link>
              </Button>

              {/* Status badge */}
              <Badge
                className={`mb-4 ${currentStatus.color} border`}
              >
                {React.createElement(currentStatus.icon, { className: "w-3 h-3 mr-1" })}
                {currentStatus.label}
              </Badge>

              {/* Title */}
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 max-w-3xl leading-tight">
                {event.title}
              </h1>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-4 text-white/80">
                <span className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {formatDate(event.date)}
                  {event.endDate && ` - ${formatDate(event.endDate)}`}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  {event.time}
                  {event.endTime && ` - ${event.endTime}`}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  {event.location}
                </span>
              </div>

              {/* Category badge */}
              <div className="mt-4">
                <Badge
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  {event.category}
                </Badge>
              </div>
            </motion.div>
          </div>
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

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Left column - Main content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                <Card>
                  <CardContent className="p-6 lg:p-8">
                    <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
                      À propos de cet événement
                    </h2>
                    <div className="prose prose-gray dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-line">
                      {event.longDescription || event.description}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Program */}
              {event.program && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-serif flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        Programme
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {event.program.map((item, index) => (
                          <div key={index} className="flex gap-4">
                            <div className="shrink-0 w-16 text-sm font-medium text-primary">
                              {item.time}
                            </div>
                            <div className="flex-1 pb-4 border-b border-border/50 last:border-0 last:pb-0">
                              <p className="text-foreground font-medium">{item.title}</p>
                              {item.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Attendees list */}
              {event.attendees && event.attendees.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-serif flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Users className="w-5 h-5 text-primary" />
                          Participants ({event.registeredCount}
                          {event.maxSpots ? `/${event.maxSpots}` : ""})
                        </span>
                        <Button variant="ghost" size="sm" className="text-muted-foreground">
                          Voir tout
                          <ChevronRight className="ml-1 w-4 h-4" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {event.attendees.map((attendee, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between py-2"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={attendee.avatar || undefined} />
                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                                  {attendee.initials}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm text-foreground">
                                  {attendee.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Inscrit le {attendee.joinedAt}
                                </p>
                              </div>
                            </div>
                            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                          </div>
                        ))}
                      </div>

                      {event.registeredCount > (event.attendees?.length || 0) && (
                        <p className="text-sm text-muted-foreground mt-4 pt-4 border-t border-border text-center">
                          Et {event.registeredCount - (event.attendees?.length || 0)} autre(s) participant(s)...
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Right column - Sidebar */}
            <div className="space-y-6">
              {/* Quick info card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Card className="sticky top-24">
                  <CardContent className="p-6 space-y-6">
                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant={isLiked ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIsLiked(!isLiked)}
                        className={`flex-1 rounded-lg ${
                          isLiked ? "gradient-spiritual text-white border-0" : ""
                        }`}
                      >
                        <Heart
                          className={`w-4 h-4 mr-1 ${isLiked ? "fill-current" : ""}`}
                        />
                        {isLiked ? "Suivi" : "Suivre"}
                      </Button>
                      <DropdownMenu open={showShareMenu} onOpenChange={setShowShareMenu}>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="rounded-lg">
                            <Share2 className="w-4 h-4" />
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
                    </div>

                    {/* Info grid */}
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Date</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(event.date)}
                            {event.endDate && ` - ${formatDate(event.endDate)}`}
                          </p>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Horaire</p>
                          <p className="text-sm text-muted-foreground">
                            {event.time}
                            {event.endTime ? ` - ${event.endTime}` : ""}
                          </p>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Lieu</p>
                          <p className="text-sm text-muted-foreground">{event.location}</p>
                          <p className="text-xs text-muted-foreground">{event.address}</p>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex items-start gap-3">
                        <User className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Organisateur</p>
                          <p className="text-sm text-muted-foreground">{event.organizer.name}</p>
                          <p className="text-xs text-muted-foreground">{event.organizer.role}</p>
                        </div>
                      </div>

                      {event.maxSpots && (
                        <>
                          <Separator />
                          <div className="flex items-start gap-3">
                            <Users className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-foreground">Capacité</p>
                              <p className="text-sm text-muted-foreground">
                                {event.registeredCount} / {event.maxSpots} places
                              </p>
                              {/* Progress bar */}
                              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    event.status === "full"
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
                              {spotsRemaining !== null && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {spotsRemaining > 0
                                    ? `${spotsRemaining} place${spotsRemaining > 1 ? "s" : ""} disponible${spotsRemaining > 1 ? "s" : ""}`
                                    : "Complet"}
                                </p>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Registration form or status message */}
                    {event.isUpcoming && event.status !== "cancelled" ? (
                      <div className="pt-4 border-t border-border">
                        {isSubmitted ? (
                          /* Success state */
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-6"
                          >
                            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                              <CheckCircle className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h3 className="font-semibold text-foreground mb-2">
                              Inscription confirmée!
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              Vous recevrez un email de confirmation avec tous les détails.
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setIsSubmitted(false)}
                              className="rounded-lg"
                            >
                              Modifier mon inscription
                            </Button>
                          </motion.div>
                        ) : (
                          /* Form */
                          <form onSubmit={handleSubmit} className="space-y-4">
                            <h3 className="font-semibold text-foreground">
                              {event.status === "full"
                                ? "Liste d'attente"
                                : "S'inscrire à cet événement"}
                            </h3>

                            <div className="space-y-3">
                              <div>
                                <label className="text-sm font-medium text-foreground mb-1 block">
                                  Nom complet *
                                </label>
                                <Input
                                  value={formData.name}
                                  onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                  }
                                  placeholder="Votre nom complet"
                                  required
                                  className="rounded-lg"
                                />
                              </div>

                              <div>
                                <label className="text-sm font-medium text-foreground mb-1 block">
                                  Email *
                                </label>
                                <Input
                                  type="email"
                                  value={formData.email}
                                  onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                  }
                                  placeholder="votre@email.com"
                                  required
                                  className="rounded-lg"
                                />
                              </div>

                              <div>
                                <label className="text-sm font-medium text-foreground mb-1 block">
                                  Téléphone
                                </label>
                                <Input
                                  type="tel"
                                  value={formData.phone}
                                  onChange={(e) =>
                                    setFormData({ ...formData, phone: e.target.value })
                                  }
                                  placeholder="+243 XXX XXX XXXX"
                                  className="rounded-lg"
                                />
                              </div>

                              <div>
                                <label className="text-sm font-medium text-foreground mb-1 block">
                                  Nombre de participants
                                </label>
                                <Select
                                  value={formData.attendees}
                                  onValueChange={(value) =>
                                    setFormData({ ...formData, attendees: value })
                                  }
                                >
                                  <SelectTrigger className="rounded-lg">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {[1, 2, 3, 4, 5].map((num) => (
                                      <SelectItem key={num} value={num.toString()}>
                                        {num} {num > 1 ? "personnes" : "personne"}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <label className="text-sm font-medium text-foreground mb-1 block">
                                  Besoins particuliers
                                </label>
                                <Textarea
                                  value={formData.specialNeeds}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      specialNeeds: e.target.value,
                                    })
                                  }
                                  placeholder="Allergies alimentaires, besoins d'accessibilité, etc."
                                  rows={3}
                                  className="rounded-lg resize-none"
                                />
                              </div>
                            </div>

                            <Button
                              type="submit"
                              disabled={
                                isSubmitting ||
                                (event.status === "full" && false)
                              }
                              className={`w-full rounded-lg ${
                                event.status === "full"
                                  ? ""
                                  : "gradient-spiritual text-white hover:opacity-90"
                              }`}
                            >
                              {isSubmitting ? (
                                <>
                                  <span className="animate-spin mr-2">⏳</span>
                                  Envoi en cours...
                                </>
                              ) : event.status === "full" ? (
                                "Rejoindre la liste d'attente"
                              ) : (
                                "Confirmer mon inscription"
                              )}
                            </Button>

                            <p className="text-xs text-muted-foreground text-center">
                              En vous inscrivant, vous acceptez nos conditions d'utilisation.
                            </p>
                          </form>
                        )}
                      </div>
                    ) : (
                      /* Event ended or cancelled */
                      <div className="pt-4 border-t border-border text-center py-4">
                        {React.createElement(
                          statusConfig[event.status].icon,
                          {
                            className: `w-12 h-12 mx-auto mb-3 ${
                              event.status === "cancelled"
                                ? "text-red-500"
                                : "text-muted-foreground"
                            }`,
                          }
                        )}
                        <p className="font-medium text-foreground">
                          {statusConfig[event.status].label}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {event.status === "cancelled"
                            ? "Cet événement a été annulé."
                            : "Cet événement est terminé."}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Map placeholder */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        Localisation
                      </h3>
                      <Button variant="ghost" size="sm" className="text-xs text-primary h-8">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Itinéraire
                      </Button>
                    </div>
                    <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDAgTCAyMCAwIEwgMjAgMjAgTCAwIDIwIFoiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgwLDAsMCwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
                      
                      <div className="relative z-10 text-center">
                        <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
                        <p className="text-sm font-medium text-foreground">
                          {event.location}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {event.address}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Organizer card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-4 text-sm">
                      Organisé par
                    </h3>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12 ring-2 ring-primary/10">
                        <AvatarImage src={event.organizer.avatar || undefined} />
                        <AvatarFallback className="gradient-spiritual text-white font-medium">
                          {event.organizer.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">
                          {event.organizer.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {event.organizer.role}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
