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
  ArrowRight,
  Share2,
  Heart,
  Download,
  CheckCircle,
  User,
  Mail,
  Phone,
  ChevronRight,
  ExternalLink,
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

// Mock event data
const eventData: Record<string, {
  id: number;
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
  program?: { time: string; title: string; description?: string }[];
  attendees?: { name: string; avatar: null | string; initials: string; joinedAt: string }[];
}> = {
  "1": {
    id: 1,
    title: "Retrait Spirituel d'Été",
    description: "Un week-end de retraite spirituelle pour se ressourcer et approfondir sa relation avec Dieu.",
    longDescription: `Rejoignez-nous pour un week-end de retraite spirituelle inoubliable au cœur de la forêt de Fontainebleau. Ce moment privilégié vous permettra de :

• Vous éloigner du tumulte quotidien pour vous recentrer sur l'essentiel
• Profiter d'enseignements inspirants sur le thème 'Le Repos de l'Âme'
• Participer à des temps de prière et d'adoration en communauté
• Rencontrer d'autres membres de l'église dans une atmosphère conviviale
• Profiter des espaces naturels pour la réflexion personnelle

Le centre de retraite offre des chambres confortables, des repas préparés sur place et de beaux espaces de promenade. C'est l'occasion idéale pour vous ressourcer avant la rentrée !`,
    date: "2025-08-24",
    endDate: "2025-08-25",
    time: "09h00",
    endTime: "17h00",
    location: "Centre de Retraite, Fontainebleau",
    address: "Route de Fontainebleau, 77300 Fontainebleau",
    category: "Retraite",
    organizer: {
      name: "Pasteur Marc Dupont",
      role: "Pasteur Principal",
      avatar: null,
      initials: "MD",
    },
    maxSpots: 50,
    registeredCount: 38,
    isUpcoming: true,
    program: [
      { time: "09h00", title: "Accueil & Café", description: "Installation dans les chambres" },
      { time: "10h30", title: "Première session : Le repos promis", description: "Enseignement + discussion" },
      { time: "12h30", title: "Déjeuner", description: "Repas partagé" },
      { time: "14h30", title: "Temps de prière en petits groupes", description: "" },
      { time: "16h00", title: "Temps libre / Promenade", description: "" },
      { time: "18h00", title: "Dîner", description: "" },
      { time: "20h00", title: "Veillée d'adoration", description: "Louange et partage" },
    ],
    attendees: [
      { name: "Marie Claire D.", avatar: null, initials: "MC", joinedAt: "15 Juil 2025" },
      { name: "Pierre M.", avatar: null, initials: "PM", joinedAt: "18 Juil 2025" },
      { name: "Sophie L.", avatar: null, initials: "SL", joinedAt: "20 Juil 2025" },
      { name: "Thomas B.", avatar: null, initials: "TB", joinedAt: "22 Juil 2025" },
      { name: "Isabelle R.", avatar: null, initials: "IR", joinedAt: "25 Juil 2025" },
      { name: "François D.", avatar: null, initials: "FD", joinedAt: "28 Juil 2025" },
    ],
  },
};

// Related events
const relatedEvents = [
  {
    id: 2,
    title: "Soirée Louange & Adoration",
    date: "30 Août 2025",
    time: "19h00 - 21h00",
    location: "Temple Principal",
    category: "Louange",
  },
  {
    id: 6,
    title: "Conférence : La Foi au Quotidien",
    date: "5 Octobre 2025",
    time: "09h30 - 17h00",
    location: "Temple Principal",
    category: "Conférence",
  },
];

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.id as string;
  const [isRegistered, setIsRegistered] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });

  // Get event data (with fallback)
  const event = eventData[eventId] || eventData["1"];

  if (!event) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-serif text-2xl font-bold mb-4">Événement non trouvé</h1>
          <p className="text-muted-foreground mb-6">Cet événement n'existe pas ou a été supprimé.</p>
          <Button asChild>
            <Link href="/evenements">Retour aux événements</Link>
          </Button>
        </div>
      </PublicLayout>
    );
  }

  const spotsRemaining = event.maxSpots ? event.maxSpots - event.registeredCount : null;

  const handleRegister = () => {
    if (!isRegistered) {
      setShowRegistrationForm(true);
    }
  };

  const handleSubmitRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate registration
    setIsRegistered(true);
    setShowRegistrationForm(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <PublicLayout>
      {/* Header */}
      <section className="bg-muted/30 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <PageHeader
              title={event.title}
              breadcrumbs={[
                { label: "Événements", href: "/evenements" },
                { label: event.title },
              ]}
              actions={
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="rounded-lg">
                    <Share2 className="w-4 h-4 mr-1" />
                    Partager
                  </Button>
                  <Button variant="ghost" size="sm" asChild className="rounded-lg">
                    <Link href="/evenements">
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Retour
                    </Link>
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
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Banner Image */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                <Card className="overflow-hidden">
                  <div className={`aspect-[21/9] bg-gradient-to-br ${
                    event.category === "Retraite" ? "from-emerald-500 to-teal-600" :
                    event.category === "Louange" ? "from-amber-500 to-orange-500" :
                    "from-violet-500 to-purple-600"
                  } relative flex items-center justify-center`}>
                    <Calendar className="w-24 h-24 text-white/20" />
                    
                    {!event.isUpcoming && (
                      <Badge className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white border-0 px-3 py-1">
                        Événement terminé
                      </Badge>
                    )}
                    
                    <Badge 
                      className={`absolute top-4 right-4 ${
                        event.category === "Retraite" ? "bg-emerald-100 text-emerald-700" :
                        event.category === "Louange" ? "bg-amber-100 text-amber-700" :
                        "bg-violet-100 text-violet-700"
                      } border-0`}
                    >
                      {event.category}
                    </Badge>

                    {/* Date overlay */}
                    <div className="absolute bottom-4 left-4 flex gap-3">
                      <div className="bg-white rounded-lg p-3 shadow-md text-center min-w-[80px]">
                        <p className="text-xs font-medium text-muted-foreground uppercase">
                          {new Date(event.date).toLocaleDateString("fr-FR", { month: "short" })}
                        </p>
                        <p className="text-2xl font-bold text-foreground leading-none">
                          {new Date(event.date).getDate()}
                        </p>
                      </div>
                      {event.endDate && (
                        <div className="flex items-center text-white">
                          <span className="text-sm">→</span>
                          <div class="bg-white rounded-lg p-3 shadow-md text-center min-w-[80px] ml-1">
                            <p className="text-xs font-medium text-muted-foreground uppercase">
                              {new Date(event.endDate).toLocaleDateString("fr-FR", { month: "short" })}
                            </p>
                            <p className="text-2xl font-bold text-foreground leading-none">
                              {new Date(event.endDate).getDate()}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Card>
                  <CardContent className="p-6 lg:p-8">
                    <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
                      À Propos de cet Événement
                    </h2>
                    <div className="prose prose-gray dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-line">
                      {event.longDescription}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Program */}
              {event.program && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.5 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        Programme
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                      <div className="space-y-4">
                        {event.program.map((item, index) => (
                          <div key={index} className="flex gap-4 group">
                            <div className="w-20 shrink-0 text-right">
                              <span className="text-sm font-medium text-primary">{item.time}</span>
                            </div>
                            <div className="relative pb-4 pl-6 border-l-2 border-border last:border-l-0 last:pb-0">
                              <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-primary" />
                              <div>
                                <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                                  {item.title}
                                </p>
                                {item.description && (
                                  <p className="text-sm text-muted-foreground mt-0.5">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Location Map Placeholder */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      Lieu
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <div className="aspect-[16/9] bg-gradient-to-br from-muted to-muted/50 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
                      <MapPin className="w-16 h-16 text-muted-foreground/30" />
                      
                      {/* Simulated map pin */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
                        <div className="w-10 h-10 rounded-full gradient-spiritual flex items-center justify-center shadow-lg">
                          <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <div className="w-3 h-3 rotate-45 bg-primary absolute -bottom-1 left-1/2 -translate-x-1/2" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="font-semibold text-foreground">{event.location}</p>
                      <p className="text-muted-foreground flex items-start gap-2">
                        <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                        {event.address}
                      </p>
                      <Button variant="outline" size="sm" className="mt-2 rounded-lg">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Ouvrir dans Google Maps
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Event Details Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
              >
                <Card className="sticky top-24">
                  <CardContent className="p-6">
                    {/* Quick info */}
                    <div className="space-y-4 mb-6">
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Date</p>
                          <p className="font-medium text-foreground">{formatDate(event.date)}</p>
                          {event.endDate && (
                            <p className="text-sm text-muted-foreground">
                              jusqu'au {formatDate(event.endDate)}
                            </p>
                          )}
                        </div>
                      </div>

                      <Separator />

                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Horaire</p>
                          <p className="font-medium text-foreground">
                            {event.time}{event.endTime ? ` - ${event.endTime}` : ""}
                          </p>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Lieu</p>
                          <p className="font-medium text-foreground">{event.location}</p>
                        </div>
                      </div>

                      {spotsRemaining !== null && (
                        <>
                          <Separator />
                          <div className="flex items-start gap-3">
                            <Users className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm text-muted-foreground">Places disponibles</p>
                              <p className="font-medium text-foreground">
                                {spotsRemaining} place{spotsRemaining > 1 ? "s" : ""} restante{spotsRemaining > 1 ? "s" : ""}
                              </p>
                              <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-2">
                                <div
                                  className="h-full gradient-spiritual rounded-full"
                                  style={{
                                    width: `${(event.registeredCount / event.maxSpots!) * 100}%`,
                                  }}
                                />
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {event.registeredCount}/{event.maxSpots} inscrits
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Registration button or status */}
                    {isRegistered ? (
                      <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-4 text-center">
                        <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                        <p className="font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
                          Vous êtes inscrit !
                        </p>
                        <p className="text-sm text-emerald-600 dark:text-emerald-400/70">
                          Un email de confirmation vous a été envoyé.
                        </p>
                      </div>
                    ) : showRegistrationForm ? (
                      /* Registration form */
                      <form onSubmit={handleSubmitRegistration} className="space-y-4">
                        <h3 className="font-semibold text-foreground mb-3">
                          Formulaire d'inscription
                        </h3>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-foreground mb-1 block">
                              Nom complet *
                            </label>
                            <Input
                              type="text"
                              required
                              value={formData.name}
                              onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                              }
                              placeholder="Votre nom"
                              className="rounded-lg"
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-foreground mb-1 block">
                              Email *
                            </label>
                            <Input
                              type="email"
                              required
                              value={formData.email}
                              onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                              }
                              placeholder="votre@email.com"
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
                              placeholder="06 12 34 56 78"
                              className="rounded-lg"
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-foreground mb-1 block">
                              Notes (optionnel)
                            </label>
                            <Textarea
                              value={formData.notes}
                              onChange={(e) =>
                                setFormData({ ...formData, notes: e.target.value })
                              }
                              placeholder="Allergies alimentaires, besoins spéciaux..."
                              rows={3}
                              className="rounded-lg resize-none"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            type="submit"
                            className="flex-1 gradient-spiritual text-white hover:opacity-90 rounded-lg"
                          >
                            Confirmer l'inscription
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowRegistrationForm(false)}
                            className="rounded-lg"
                          >
                            Annuler
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <Button
                        size="lg"
                        onClick={handleRegister}
                        disabled={!event.isUpcoming}
                        className={`w-full rounded-xl ${!event.isUpcoming ? "opacity-50 cursor-not-allowed" : "gradient-spiritual text-white hover:opacity-90"}`}
                      >
                        {event.isUpcoming ? (
                          <>
                            S'inscrire maintenant
                            <ChevronRight className="ml-2 w-5 h-5" />
                          </>
                        ) : (
                          "Inscriptions closes"
                        )}
                      </Button>
                    )}

                    {!event.isUpcoming && (
                      <p className="text-sm text-muted-foreground text-center mt-3">
                        Cet événement est terminé.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Organizer */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-4">Organisateur</h3>
                    
                    <div className="flex items-center gap-4">
                      <Avatar className="w-14 h-14 ring-4 ring-primary/10">
                        <AvatarImage src={event.organizer.avatar || undefined} />
                        <AvatarFallback className="gradient-spiritual text-white font-semibold">
                          {event.organizer.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-foreground">{event.organizer.name}</p>
                        <p className="text-sm text-muted-foreground">{event.organizer.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Attendees preview */}
              {event.attendees && event.attendees.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45, duration: 0.5 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-foreground">
                          Participants ({event.registeredCount})
                        </h3>
                        {event.registeredCount > 6 && (
                          <Button variant="ghost" size="sm" className="text-primary">
                            Voir tout
                          </Button>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        {event.attendees.slice(0, 5).map((attendee, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <Avatar className="w-9 h-9">
                              <AvatarImage src={attendee.avatar || undefined} />
                              <AvatarFallback className="bg-muted text-xs">
                                {attendee.initials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {attendee.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Inscrit le {attendee.joinedAt}
                              </p>
                            </div>
                          </div>
                        ))}
                        
                        {event.registeredCount > 5 && (
                          <p className="text-sm text-muted-foreground text-center pt-2">
                            +{event.registeredCount - 5} autre{event.registeredCount - 5 > 1 ? "s" : ""} participant{event.registeredCount - 5 > 1 ? "s" : ""}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Related Events */}
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
                Autres Événements
              </h2>
              <Button variant="ghost" asChild className="text-primary">
                <Link href="/evenements">
                  Voir tout
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {relatedEvents.map((relatedEvent, index) => (
                <motion.div
                  key={relatedEvent.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                >
                  <Link href={`/evenements/${relatedEvent.id}`}>
                    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
                      <CardContent className="p-5 flex gap-4">
                        <div className="w-20 shrink-0 text-center bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-3 flex flex-col items-center justify-center">
                          <p className="text-xs font-medium text-muted-foreground uppercase">
                            {relatedEvent.date.split(" ")[0]}
                          </p>
                          <p className="text-xl font-bold text-foreground leading-none">
                            {relatedEvent.date.split(" ")[1]}
                          </p>
                        </div>
                        <div className="flex-1 min-w-0 py-1">
                          <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors mb-1">
                            {relatedEvent.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-1">
                            {relatedEvent.time}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {relatedEvent.location}
                          </p>
                        </div>
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
