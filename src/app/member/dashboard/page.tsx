"use client";

import React, { useEffect, useState } from "react";
import { motion } from '@/lib/no-motion';
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  CalendarDays,
  Heart,
  CreditCard,
  Bell,
  Play,
  Clock,
  MapPin,
  Users,
  Gift,
  HandHeart,
  ChevronRight,
  BookOpen,
  Sparkles,
  MessageCircle,
  Music,
  PartyPopper,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { LiveStartedToast } from "@/components/shared/live-started-toast";
import { DashboardSkeleton } from "@/components/shared/loading-skeleton";
import { LiveDashboardAlert } from "@/components/member/live-dashboard-alert";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

// Get current date in French
const getCurrentDate = () => {
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  const date = new Date().toLocaleDateString('fr-FR', options);
  return date.charAt(0).toUpperCase() + date.slice(1);
};

// Quick Stats Component
function QuickStats({ stats }: { stats: any[] }) {
  const icons = [CalendarClock, CalendarDays, Heart, CreditCard];
  const colors = ["bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400", "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400", "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"];

  if (!stats.length) {
    return (
      <Card className="border-dashed border-border/80 bg-muted/20">
        <CardContent className="p-6 text-sm text-muted-foreground">
          Aucune statistique disponible pour le moment.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = icons[index] ?? CalendarClock;
        return (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow duration-300 border-border/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-lg font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.subvalue}</p>
                  </div>
                  <div className={`p-2.5 rounded-xl ${colors[index]}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

// Upcoming Services Component
function UpcomingServices({ upcomingServices }: { upcomingServices: any[] }) {
  if (!upcomingServices.length) {
    return (
      <motion.div variants={itemVariants}>
        <Card className="border-dashed border-border/80 bg-muted/20">
          <CardContent className="p-6 text-sm text-muted-foreground">
            Aucun culte prévu pour le moment. Revenez bientôt pour voir les prochains rendez-vous.
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div variants={itemVariants}>
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary" />
              Prochains Cultes
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/member/cultes" className="text-xs">
                Voir tout <ChevronRight className="h-3 w-3 ml-1 inline" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingServices.slice(0, 3).map((service, index) => (
            <div key={service.id}>
              <div className={`flex items-start gap-4 p-3 rounded-xl transition-colors hover:bg-muted/50 ${index === 0 ? 'bg-gradient-to-r from-violet-50 to-transparent dark:from-violet-950/20' : ''}`}>
                <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 ${service.isNext ? 'gradient-spiritual text-white' : 'bg-muted'}`}>
                  <Clock className="h-4 w-4" />
                  <span className="text-[10px] font-semibold mt-0.5">
                    {service.time.split(' - ')[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate">{service.title}</h4>
                    {service.isLive && (
                      <Badge variant="default" className="bg-red-500 hover:bg-red-600 text-[10px] px-1.5 py-0 h-5">
                        LIVE
                      </Badge>
                    )}
                    {service.isNext && (
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[10px] px-1.5 py-0 h-5">
                        PROCHAIN
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {service.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {service.location}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Par {service.preacher}</p>
                </div>
                <Button size="sm" variant={service.isNext ? "default" : "outline"} className="shrink-0 text-xs h-8">
                  {service.isNext ? "Rejoindre" : "Rappel"}
                </Button>
              </div>
              {index < upcomingServices.slice(0, 3).length - 1 && <Separator className="my-2" />}
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Latest Sermons Component
function LatestSermons({ recentSermons }: { recentSermons: any[] }) {
  if (!recentSermons.length) {
    return (
      <motion.div variants={itemVariants}>
        <Card className="border-dashed border-border/80 bg-muted/20">
          <CardContent className="p-6 text-sm text-muted-foreground">
            Aucune prédication récente pour le moment.
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div variants={itemVariants}>
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Dernières Prédications
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/member/predications" className="text-xs">
                Voir tout <ChevronRight className="h-3 w-3 ml-1 inline" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {recentSermons.map((sermon) => (
              <div key={sermon.id} className="group cursor-pointer">
                <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-violet-100 to-amber-50 dark:from-violet-950/40 dark:to-amber-950/20 aspect-video mb-3">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Music className="h-12 w-12 text-violet-300/50 dark:text-violet-600/30" />
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      whileHover={{ scale: 1, opacity: 1 }}
                      className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Play className="h-5 w-5 text-primary ml-0.5" fill="currentColor" />
                    </motion.div>
                  </div>
                  <Badge variant="secondary" className="absolute top-2 left-2 text-[10px]">
                    {sermon.category}
                  </Badge>
                  <span className="absolute bottom-2 right-2 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">
                    {sermon.duration}
                  </span>
                </div>
                <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                  {sermon.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">{sermon.preacher}</p>
                <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                  <span>{sermon.date}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Play className="h-3 w-3" /> {sermon.plays}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Prayer Requests Feed Component
function PrayerRequestsFeed({ prayerRequests }: { prayerRequests: any[] }) {
  const [prayedFor, setPrayedFor] = useState<string[]>([]);

  const handlePray = (id: string) => {
    if (!prayedFor.includes(id)) {
      setPrayedFor([...prayedFor, id]);
    }
  };

  if (!prayerRequests.length) {
    return (
      <motion.div variants={itemVariants}>
        <Card className="border-dashed border-border/80 bg-muted/20">
          <CardContent className="p-6 text-sm text-muted-foreground">
            Aucune demande de prière n’a été publiée pour le moment.
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div variants={itemVariants}>
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-500" />
              Prières de la Communauté
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/member/prieres" className="text-xs">
                Voir tout <ChevronRight className="h-3 w-3 ml-1 inline" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {prayerRequests.map((request) => (
            <div key={request.id} className="group p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex items-start gap-3">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className={
                    request.isAnonymous 
                      ? "bg-gray-100 text-gray-500 text-xs" 
                      : "bg-primary/10 text-primary text-xs"
                  }>
                    {request.isAnonymous ? "?" : request.author.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {request.isAnonymous ? "Anonyme" : request.author}
                    </span>
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {request.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {request.content}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Heart className="h-3 w-3" /> {request.prayersCount + (prayedFor.includes(request.id) ? 1 : 0)} prières • {request.date}
                    </span>
                    <Button
                      size="sm"
                      variant={prayedFor.includes(request.id) ? "secondary" : "outline"}
                      className={`text-xs h-7 ${prayedFor.includes(request.id) ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : ''}`}
                      onClick={() => handlePray(request.id)}
                    >
                      {prayedFor.includes(request.id) ? (
                        <>✓ Prié</>
                      ) : (
                        <>
                          <Heart className="h-3 w-3 mr-1" /> Je prie pour toi
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// My Groups Component
function MyGroupsCard({ myGroup }: { myGroup: any }) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Mon Groupe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {myGroup ? <>
            <div className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-amber-50 dark:from-violet-950/20 dark:to-amber-950/10">
              <h4 className="font-semibold text-sm mb-1">{myGroup.name}</h4>
              <p className="text-xs text-muted-foreground mb-3">{myGroup.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Responsable:</span>
                  <span className="font-medium">{myGroup.leader}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Réunion:</span>
                  <span className="font-medium">{myGroup.meetingDay} • {myGroup.meetingTime}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground truncate">{myGroup.meetingLocation}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[...Array(4)].map((_, i) => (
                      <Avatar key={i} className="h-7 w-7 border-2 border-background">
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                          {String.fromCharCode(65 + i)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    <div className="h-7 w-7 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                      <span className="text-[10px] font-medium text-muted-foreground">+{myGroup.membersCount - 4}</span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{myGroup.membersCount} membres</span>
                </div>
              </div>
            </div>
            
            <Button variant="outline" className="w-full" size="sm" asChild>
              <Link href="/member/groupes">Voir mon groupe</Link>
            </Button>
            </> : <p className="py-6 text-center text-sm text-muted-foreground">Vous n&apos;êtes rattaché à aucun groupe pour le moment.</p>}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Quick Actions Component
function QuickActions() {
  const actions = [
    { label: "Donner", icon: Gift, href: "/member/dons", color: "bg-amber-100 text-amber-700 hover:bg-amber-200" },
    { label: "Prier", icon: Heart, href: "/member/prieres", color: "bg-rose-100 text-rose-700 hover:bg-rose-200" },
    { label: "Événements", icon: PartyPopper, href: "/member/evenements", color: "bg-violet-100 text-violet-700 hover:bg-violet-200" },
    { label: "Louange", icon: Music, href: "/member/louange", color: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" },
  ];

  return (
    <motion.div variants={itemVariants}>
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Actions Rapides
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.label} href={action.href}>
                  <Button
                    variant="outline"
                    className={`w-full h-auto py-3 flex-col gap-2 ${action.color} border-0`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{action.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Upcoming Events Mini Component
function UpcomingEventsMini({ upcomingEvents }: { upcomingEvents: any[] }) {
  if (!upcomingEvents.length) {
    return (
      <motion.div variants={itemVariants}>
        <Card className="border-dashed border-border/80 bg-muted/20">
          <CardContent className="p-6 text-sm text-muted-foreground">
            Aucun événement à venir pour le moment.
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div variants={itemVariants}>
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-amber-500" />
              Événements
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/member/evenements" className="text-xs">
                Tout voir <ChevronRight className="h-3 w-3 ml-1 inline" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingEvents.slice(0, 2).map((event) => (
            <div key={event.id} className="p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                  <PartyPopper className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{event.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{event.date}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant="outline" className="text-[10px]">{event.category}</Badge>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" /> {event.registrations}/{event.maxRegistrations}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Announcements Component
function AnnouncementsCard({ announcements }: { announcements: any[] }) {
  if (!announcements.length) {
    return (
      <motion.div variants={itemVariants}>
        <Card className="border-dashed border-border/80 bg-muted/20">
          <CardContent className="p-6 text-sm text-muted-foreground">
            Aucune annonce à afficher pour le moment.
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div variants={itemVariants}>
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-500" />
            Annonces
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {announcements.map((announcement) => (
            <div key={announcement.id} className={`p-3 rounded-xl ${
              announcement.priority === 'high' 
                ? 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30' 
                : 'bg-muted/30'
            }`}>
              <div className="flex items-start gap-2">
                {announcement.priority === 'high' && (
                  <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-1.5" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{announcement.title}</h4>
                    {announcement.priority === 'high' && (
                      <Badge className="bg-red-500 hover:bg-red-600 text-[10px] px-1.5 py-0 h-4">
                        Important
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{announcement.content}</p>
                  <p className="text-[10px] text-muted-foreground mt-1.5">{announcement.date} • {announcement.author}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Main Member Dashboard Component
const emptyDashboard = { currentUser: { name: "Membre", email: "", image: null, role: "MEMBER" }, dailyVerse: { reference: "" }, quickStats: [], upcomingServices: [], recentSermons: [], prayerRequests: [], myGroup: null, upcomingEvents: [], announcements: [], unreadNotifications: 0 };

export default function MemberDashboardPage() {
  const [dashboard, setDashboard] = useState<any>(emptyDashboard);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/member/dashboard")
      .then((response) => {
        if (response.status === 401) { router.replace("/login"); return Promise.reject(new Error("Session expirée")); }
        return response.ok ? response.json() : Promise.reject(new Error("Dashboard indisponible"));
      })
      .then(setDashboard)
      .catch(() => {
        // Erreur déjà reflétée par l'UI (état vide) — pas de bruit en console.
      })
      .finally(() => setLoading(false));
  }, [router]);

  const { currentUser, dailyVerse, quickStats, upcomingServices, recentSermons, prayerRequests, myGroup, upcomingEvents, announcements, unreadNotifications, liveStreams } = dashboard;
  const firstName = (currentUser.name || "Membre").split(' ')[0];

  if (loading) {
    return (
      <DashboardLayout user={currentUser} variant="member">
        <LiveStartedToast target="/member/live" />
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={currentUser} variant="member">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <LiveDashboardAlert initialStreams={liveStreams ?? []} />
        {/* Header Section */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 ring-2 ring-primary/20">
              <AvatarImage src={currentUser.image ?? undefined} alt={currentUser.name || "Membre"} />
              <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-lg font-semibold">
                {firstName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold font-serif">
                Salut, {firstName}! 👋
              </h1>
              <p className="text-sm text-muted-foreground">{getCurrentDate()}</p>
            </div>
          </div>
          
          {/* Verse of the day mini card & notification */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-violet-50 to-amber-50 dark:from-violet-950/20 dark:to-amber-950/10 max-w-md">
              <Sparkles className="h-5 w-5 text-amber-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-violet-700 dark:text-violet-400">Verset du jour</p>
                <p className="text-xs text-muted-foreground truncate italic">{dailyVerse.reference}</p>
              </div>
            </div>
            
            <Button variant="outline" size="icon" className="relative h-11 w-11 rounded-xl">
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full" />
              )}
            </Button>
          </div>
        </motion.div>

        {/* Quick Stats Cards */}
        <QuickStats stats={quickStats} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            <UpcomingServices upcomingServices={upcomingServices} />
            <LatestSermons recentSermons={recentSermons} />
            <PrayerRequestsFeed prayerRequests={prayerRequests} />
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            <MyGroupsCard myGroup={myGroup} />
            <QuickActions />
            <UpcomingEventsMini upcomingEvents={upcomingEvents} />
            <AnnouncementsCard announcements={announcements} />
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
