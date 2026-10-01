'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from '@/lib/no-motion';
import { 
  Church, 
  Play, 
  Calendar, 
  Users, 
  Heart,
  BookOpen,
  Gift,
  ChevronRight,
  Clock,
  MapPin,
  Radio,
  Star,
  ArrowRight,
  Menu,
  X,
  Sun,
  Moon,
  Search,
  Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useTheme } from 'next-themes';
import { PublicLayout } from '@/components/layouts/public-layout';

// Mock data for demonstration - Arche d'Amour
const mockChurch = {
  name: "Arche d'Amour",
  tagline: "L'amour qui accueille, la foi qui élève",
  description: "Une communauté chrétienne où chacun trouve sa place. Ensemble, nous construisons des vies sur le fondement de l'amour et de la grâce.",
  address: "123 Avenue de la Paix, Kinshasa, RDC",
  phone: "+243 81 234 5678",
  email: "contact@archedamour.cd",
  serviceTimes: {
    sunday: "07:00 - 10:00 | 11:00 - 13:00",
    wednesday: "18:00 - 20:00",
    friday: "17:30 - 19:30"
  }
};

const mockNextService = {
  title: "Culte du Dimanche",
  date: "Dimanche 22 Décembre 2024",
  time: "07:00",
  location: "Temple Principal",
  preacher: "Pasteur Jean-Marc Lumbu",
  isLive: true
};

const mockDailyVerse = {
  verse: "Car je connais les projets que j'ai formés sur vous, dit l'Éternel, projets de paix et non de malheur, afin de vous donner un avenir et de l'espérance.",
  reference: "Jérémie 29:11",
  reflection: "Dieu a un plan parfait pour chacun de nous. Même dans les moments difficiles, nous pouvons nous appuyer sur Sa promesse d'un avenir rempli d'espérance."
};

const mockSermons = [
  {
    id: "1",
    title: "La Puissance de la Prière Persistante",
    preacher: "Pasteur Jean-Marc Lumbu",
    category: "Foi",
    date: "15 Déc 2024",
    duration: "45 min",
    views: 234
  },
  {
    id: "2", 
    title: "Marcher par la Foi et non par la Vue",
    preacher: "Dr. Marie Nseke",
    category: "Vie Chrétienne",
    date: "08 Déc 2024",
    duration: "52 min",
    views: 189
  },
  {
    id: "3",
    title: "L'Amour qui Transforme",
    preacher: "Évangéliste Paul Kamba",
    category: "Amour",
    date: "01 Déc 2024",
    duration: "38 min",
    views: 312
  }
];

const mockEvents = [
  {
    id: "1",
    title: "Veillée de Fin d'Année",
    date: "31 Déc 2024",
    time: "22:00 - 01:00",
    location: "Temple Principal",
    type: "Spécial"
  },
  {
    id: "2",
    title: "Conférence des Jeunes 2025",
    date: "15-18 Jan 2025",
    time: "09:00 - 17:00",
    location: "Centre Conférences",
    type: "Conférence"
  },
  {
    id: "3",
    title: "Séminaire de Couple",
    date: "14 Fév 2025",
    time: "08:00 - 16:00",
    location: "Salle Pasteur",
    type: "Atelier"
  }
];

const mockStats = [
  { label: "Membres Actifs", value: 1248, icon: Users, color: "text-sky-600 bg-sky-50 dark:text-sky-400 dark:bg-sky-950/40" },
  { label: "Prédications", value: 256, icon: BookOpen, color: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/40" },
  { label: "Événements", value: 48, icon: Calendar, color: "text-cyan-600 bg-cyan-50 dark:text-cyan-400 dark:bg-cyan-950/40" },
  { label: "Groupes", value: 24, icon: Heart, color: "text-teal-600 bg-teal-50 dark:text-teal-400 dark:bg-teal-950/40" }
];

const mockTestimonials = [
  {
    id: "1",
    name: "François M.",
    role: "Membre depuis 2019",
    content: "Cette église a transformé ma vie. J'ai trouvé une vraie famille et ma foi a grandi énormément.",
    avatar: "FM"
  },
  {
    id: "2",
    name: "Sarah K.",
    role: "Membre depuis 2021",
    content: "Les enseignements sont puissants et la communauté est si accueillante. Je recommande vivement !",
    avatar: "SK"
  },
  {
    id: "3",
    name: "Marc T.",
    role: "Responsable Groupe",
    content: "En tant que responsable de groupe de maison, je vois comment Dieu change des vies chaque semaine.",
    avatar: "MT"
  }
];

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08
    }
  }
};

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Use requestAnimationFrame to avoid synchronous setState in effect
    requestAnimationFrame(() => {
      setMounted(true);
    });
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <PublicLayout className="bg-sky-50 dark:bg-slate-950">
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
        
        {/* Decorative elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-sky-200/30 dark:bg-sky-800/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-100/40 dark:bg-blue-900/10 rounded-full blur-3xl" />
        
        {/* Cloud-like shapes */}
        <div className="absolute top-32 left-20 w-48 h-24 bg-white/60 dark:bg-slate-800/30 rounded-full blur-xl" />
        <div className="absolute top-48 right-32 w-64 h-32 bg-white/40 dark:bg-slate-700/20 rounded-full blur-xl" />

        <div className="relative z-10 container mx-auto px-4 pt-8 pb-16 md:pt-20 md:pb-28">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="max-w-4xl mx-auto text-center"
          >
            {/* Logo/Badge */}
            <motion.div variants={fadeInUp} className="mb-6">
              <Badge 
                variant="secondary" 
                className="px-4 py-2 text-sm bg-white/80 dark:bg-slate-800/80 backdrop-blur border-sky-200/60 dark:border-sky-800/40 text-sky-700 dark:text-sky-300 shadow-sm"
              >
                <Star className="w-4 h-4 mr-2 text-sky-500" />
                Bienvenue chez {mockChurch.name}
              </Badge>
            </motion.div>

            {/* Main Title */}
            <motion.h1 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
              style={{ color: '#0f172a' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {mockChurch.tagline}
              <span className="block mt-2 bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
                ensemble.
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p 
              className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              {mockChurch.description}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
            >
              <Link href="/register">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white px-8 h-14 text-base font-semibold shadow-lg shadow-sky-500/25 hover:shadow-xl hover:shadow-sky-500/30 transition-all"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Rejoindre l'église
                </Button>
              </Link>
              <Link href="/live">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full sm:w-auto border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-950/30 h-14 text-base font-medium"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Assister au culte
                </Button>
              </Link>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div 
              className="mt-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <div className="animate-bounce inline-block">
                <ChevronRight className="w-6 h-6 text-slate-400 rotate-90" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Live Now Banner */}
      {mockNextService.isLive && (
        <section className="relative bg-gradient-to-r from-sky-500 to-blue-600 text-white">
          <div className="container mx-auto px-4 py-3.5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </span>
                <span className="font-semibold">EN DIRECT</span>
                <span className="hidden sm:inline opacity-90">•</span>
                <span className="opacity-90">{mockNextService.title}</span>
              </div>
              <Link href="/live">
                <Button variant="secondary" size="sm" className="bg-white text-sky-600 hover:bg-gray-100 font-medium shadow-sm">
                  <Play className="w-4 h-4 mr-2" />
                  Regarder maintenant
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Next Service Section */}
      <section className="py-16 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-4xl mx-auto"
          >
            <motion.div variants={fadeInUp} className="text-center mb-10">
              <Badge variant="secondary" className="mb-4 bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 border-sky-200/60 dark:border-sky-800/40">
                <Calendar className="w-4 h-4 mr-1" />
                Prochain Culte
              </Badge>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="overflow-hidden border-0 shadow-xl bg-white dark:bg-slate-800">
                <CardContent className="p-6 md:p-10">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                      <h3 className="text-2xl md:text-3xl font-bold mb-5 text-slate-900 dark:text-white">
                        {mockNextService.title}
                      </h3>
                      <div className="space-y-3 text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-sky-900/30 flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                          </div>
                          <span>{mockNextService.date}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-sky-900/30 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                          </div>
                          <span>À partir de {mockNextService.time}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-sky-900/30 flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                          </div>
                          <span>{mockNextService.location}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-sky-900/30 flex items-center justify-center">
                            <Users className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                          </div>
                          <span>Par {mockNextService.preacher}</span>
                        </div>
                      </div>
                      <div className="mt-8 flex flex-wrap gap-3">
                        <Button className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-md shadow-sky-500/25">
                          <Play className="w-4 h-4 mr-2" />
                          Rejoindre en direct
                        </Button>
                        <Button variant="outline" className="border-slate-200 dark:border-slate-700">
                          Ajouter au calendrier
                        </Button>
                      </div>
                    </div>
                    <div className="hidden md:flex justify-center">
                      <div className="w-56 h-56 rounded-2xl bg-gradient-to-br from-sky-100 to-blue-100 dark:from-sky-900/30 dark:to-blue-900/30 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%230ea5e9%22%20fill-opacity%3D%220.08%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
                        <div className="text-center relative z-10">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-sky-500/30">
                            <Play className="w-8 h-8 text-white ml-0.5" />
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Cliquez pour regarder</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Daily Verse Section */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.div variants={fadeInUp} className="mb-8">
              <Badge variant="secondary" className="mb-4 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/40">
                <BookOpen className="w-4 h-4 mr-1" />
                Verset du Jour
              </Badge>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-sky-50/80 to-blue-50/80 dark:from-sky-950/20 dark:to-blue-950/20">
                <CardContent className="p-8 md:p-12">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-100 to-blue-100 dark:from-sky-900/40 dark:to-blue-900/40 flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="w-7 h-7 text-sky-600 dark:text-sky-400" />
                  </div>
                  <blockquote className="text-xl md:text-2xl font-serif text-slate-800 dark:text-white leading-relaxed mb-6 italic">
                    &ldquo;{mockDailyVerse.verse}&rdquo;
                  </blockquote>
                  <cite className="text-sky-600 dark:text-sky-400 font-semibold not-italic text-base">
                    — {mockDailyVerse.reference}
                  </cite>
                  <p className="mt-6 text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
                    {mockDailyVerse.reflection}
                  </p>
                  <div className="mt-8 flex justify-center gap-3">
                    <Button variant="outline" size="sm" className="border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300">
                      Partager
                    </Button>
                    <Button variant="ghost" size="sm" className="text-sky-600 dark:text-sky-400">
                      Recevoir chaque jour
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-slate-50/70 dark:bg-slate-800/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">
                Notre Communauté en Chiffres
              </h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
                Ensemble, nous construisons une communauté forte et unie dans la foi.
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
              {mockStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="text-center p-5 md:p-6 border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-slate-800 group">
                    <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-1">
                      {stat.value.toLocaleString("fr-FR")}
                    </div>
                    <div className="text-xs md:text-sm text-slate-500 dark:text-slate-400">{stat.label}</div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Latest Sermons Section */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="flex flex-col md:flex-row md:items-end justify-between mb-10">
              <div>
                <Badge variant="secondary" className="mb-4 bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
                  <BookOpen className="w-4 h-4 mr-1" />
                  Dernières Prédications
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                  Enseignements Récents
                </h2>
              </div>
              <Link href="/sermons" className="mt-4 md:mt-0">
                <Button variant="ghost" className="text-sky-600 dark:text-sky-400 hover:text-sky-700">
                  Voir toutes
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </motion.div>

            <motion.div variants={fadeInUp} className="grid md:grid-cols-3 gap-6">
              {mockSermons.map((sermon) => (
                <Link key={sermon.id} href={`/sermons/${sermon.id}`}>
                  <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 h-full bg-white dark:bg-slate-800">
                    {/* Thumbnail */}
                    <div className="aspect-video bg-gradient-to-br from-sky-100 via-blue-50 to-sky-200 dark:from-sky-900/40 dark:via-slate-800 dark:to-sky-900/40 relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm group-hover:bg-sky-500 dark:group-hover:bg-sky-600 transition-all duration-300 flex items-center justify-center group-hover:scale-110 transform transition-all">
                          <Play className="w-6 h-6 text-slate-600 dark:text-slate-300 group-hover:text-white ml-0.5" />
                        </div>
                      </div>
                      <Badge className="absolute top-3 left-3 bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 shadow-sm">
                        {sermon.category}
                      </Badge>
                      <span className="absolute bottom-3 right-3 text-xs text-slate-600 dark:text-slate-400 bg-white/90 dark:bg-slate-800/90 px-2 py-1 rounded-md shadow-sm">
                        {sermon.duration}
                      </span>
                    </div>
                    <CardContent className="p-5">
                      <h3 className="font-semibold text-base mb-2 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-2 text-slate-900 dark:text-white">
                        {sermon.title}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{sermon.preacher}</p>
                      <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                        <span>{sermon.date}</span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {sermon.views}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="py-16 bg-slate-50/70 dark:bg-slate-800/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="flex flex-col md:flex-row md:items-end justify-between mb-10">
              <div>
                <Badge variant="secondary" className="mb-4 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                  <Calendar className="w-4 h-4 mr-1" />
                  Événements à Venir
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                  Ne Manquez Rien
                </h2>
              </div>
              <Link href="/events" className="mt-4 md:mt-0">
                <Button variant="ghost" className="text-sky-600 dark:text-sky-400">
                  Tous les événements
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </motion.div>

            <motion.div variants={fadeInUp} className="grid md:grid-cols-3 gap-6">
              {mockEvents.map((event) => (
                <Link key={event.id} href={`/events/${event.id}`}>
                  <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 h-full bg-white dark:bg-slate-800">
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <Badge 
                          variant="secondary" 
                          className={
                            event.type === 'Spécial' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' :
                            event.type === 'Conférence' ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300' :
                            'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                          }
                        >
                          {event.type}
                        </Badge>
                        <Gift className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                      </div>
                      <h3 className="font-bold text-lg mb-3 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors text-slate-900 dark:text-white">
                        {event.title}
                      </h3>
                      <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-sky-500" />
                          {event.date}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-sky-500" />
                          {event.time}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-sky-500" />
                          {event.location}
                        </div>
                      </div>
                      <Button variant="ghost" className="w-full mt-5 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/30 font-medium">
                        S&apos;inscrire
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </Card>
                </Link>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="text-center mb-12">
              <Badge variant="secondary" className="mb-4 bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
                <Star className="w-4 h-4 mr-1" />
                Témoignages
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                Ce Que Disent Nos Membres
              </h2>
            </motion.div>

            <motion.div variants={fadeInUp} className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {mockTestimonials.map((testimonial) => (
                <Card key={testimonial.id} className="bg-slate-50/80 dark:bg-slate-800/50 border-0 shadow-sm">
                  <CardContent className="p-6">
                    <Star className="w-8 h-8 text-amber-400 mb-4 fill-amber-400" />
                    <p className="text-slate-600 dark:text-slate-300 mb-5 text-sm leading-relaxed italic">
                      &ldquo;{testimonial.content}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <Avatar className="bg-gradient-to-br from-sky-400 to-blue-500 h-10 w-10">
                        <AvatarFallback className="text-white text-xs font-medium">
                          {testimonial.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm text-slate-900 dark:text-white">{testimonial.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-sky-500 via-blue-600 to-blue-700 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-10 right-10 w-56 h-56 bg-white/5 rounded-full blur-2xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="max-w-2xl mx-auto text-center text-white">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Rejoignez Notre Famille
              </h2>
              <p className="text-lg text-white/85 mb-10 max-w-lg mx-auto leading-relaxed">
                Que vous soyez nouveau dans la foi ou que vous cherchiez une communauté d&apos;accueil, il y a une place pour vous ici.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button size="lg" className="bg-white text-sky-600 hover:bg-gray-100 px-8 h-14 text-base font-semibold shadow-lg">
                    Devenir Membre
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 h-14 text-base font-medium">
                    Nous Contacter
                  </Button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer removed — `PublicLayout` supplies a shared footer. */}
    </PublicLayout>
  );
}
