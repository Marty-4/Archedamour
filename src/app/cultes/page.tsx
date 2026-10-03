"use client";

import React from "react";
import Link from "next/link";
import { motion } from '@/lib/no-motion';
import {
  Clock,
  MapPin,
  Users,
  Music,
  Baby,
  Coffee,
  Calendar,
  ArrowRight,
  ChevronRight,
  Heart,
  BookOpen,
  Sparkles,
  Sun,
  Moon,
  Star,
  Info,
} from "lucide-react";
import { PublicLayout } from "@/components/layouts/public-layout";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

// Service types
const serviceTypes = [
  {
    icon: Sun,
    title: "Culte Matinal",
    description: "Un moment de célébration dynamique avec louange contemporaine et prédication inspirante.",
    time: "Dimanche 10h00 - 11h30",
    features: ["Louange moderne", "Prédication", "Programme enfants"],
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Moon,
    title: "Culte du Soir",
    description: "Une atmosphère plus intime et contemplative pour finir la semaine dans la présence de Dieu.",
    time: "Dimanche 14h30 - 16h00",
    features: ["Adoration profonde", "Étude biblique", "Communion mensuelle"],
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: Star,
    title: "Prière du Matin",
    description: "Rejoignez-nous chaque matin pour un temps de prière communautaire.",
    time: "Mercredi 06h30 - 07h30",
    features: ["Intercession", "Louange", "Partage"],
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Heart,
    title: "Rencontre Jeunes",
    description: "Un espace dédié aux adolescents et jeunes adultes pour grandir ensemble.",
    date: "Vendredi",
    time: "19h00 - 21h00",
    features: ["Enseignement adapté", "Activités", "Fellowship"],
    color: "from-emerald-500 to-green-500",
  },
];

// Weekly schedule
const weeklySchedule = [
  { day: "Dimanche", services: [
    { name: "Culte Matinal", time: "10h00", location: "Salle Principale" },
    { name: "École du Dimanche", time: "10h15", location: "Salle Enfants" },
    { name: "Culte du Soir", time: "14h30", location: "Salle Principale" },
  ]},
  { day: "Lundi", services: [] },
  { day: "Mardi", services: [
    { name: "Groupe de Vie - Paris Centre", time: "19h00", location: "Chez Marie D." },
    { name: "Groupe de Jeunes Professionnels", time: "19h30", location: "Café Église" },
  ]},
  { day: "Mercredi", services: [
    { name: "Prière du Matin", time: "06h30", location: "Chapelle" },
    { name: "Étude Biblique Femmes", time: "10h00", location: "Salle B" },
    { name: "Club Enfants (6-12 ans)", time: "16h30", location: "Salle Enfants" },
  ]},
  { day: "Jeudi", services: [
    { name: "Groupe de Vie - Montmartre", time: "19h00", location: "Chez Pierre M." },
    { name: "Chorale & Musique", time: "20h00", location: "Salle Musique" },
  ]},
  { day: "Vendredi", services: [
    { name: "Rencontre Jeunes", time: "19h00", location: "Salle Jeunes" },
    { name: "Groupe de Vie - Bastille", time: "19h30", location: "Chez Sophie L." },
  ]},
  { day: "Samedi", services: [
    { name: "Atelier Mariage", time: "10h00", location: "Salle A (1er samedi)" },
    { name: "Service Communautaire", time: "14h00", location: "Variable (3ème samedi)" },
  ]},
];

// Locations
const locations = [
  {
    name: "Temple Principal",
    address: "Quartier Songolo, Pointe-Noire, République du Congo",
    capacity: "500 places",
    features: ["Salle principale", "Salle des enfants", "Cafétéria", "Parking souterrain"],
    isMain: true,
  },
  {
    name: "Centre Communautaire",
    address: "Quartier Songolo, Pointe-Noire, République du Congo",
    capacity: "150 places",
    features: ["Salles polyvalentes", "Espace jeunes", "Jardin"],
    isMain: false,
  },
  {
    name: "Antenne Sud",
    address: "78 Boulevard Victor Hugo, 92100 Boulogne",
    capacity: "80 places",
    features: ["Salle chaleureuse", "Espace jeux enfants"],
    isMain: false,
  },
];

// What to expect items
const whatToExpect = [
  {
    icon: Clock,
    title: "Durée environ 1h30",
    description: "Nos cultes durent en moyenne 1h30 avec un programme équilibré.",
  },
  {
    icon: Coffee,
    title: "Café d'accueil",
    description: "Arrivez un peu plus tôt pour partager un café et faire des rencontres.",
  },
  {
    icon: Music,
    title: "Louange moderne",
    description: "Un mélange de chants contemporains et cantiques traditionnels.",
  },
  {
    icon: BookOpen,
    title: "Prédication biblique",
    description: "Des enseignements pratiques basés sur la Parole de Dieu.",
  },
  {
    icon: Baby,
    title: "Programme enfants",
    description: "Des activités adaptées pour les enfants de tous âges.",
  },
  {
    icon: Heart,
    title: "Ambiance accueillante",
    description: "Pas besoin d'être habillé formellement, venez comme vous êtes !",
  },
];

export default function ServicesPage() {
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
              title="Nos Cultes"
              description="Découvrez nos différents moments de rassemblement et trouvez celui qui vous convient."
              breadcrumbs={[{ label: "Cultes" }]}
              className="text-slate-900 dark:text-white [&_h1]:text-slate-900 dark:[&_h1]:text-white [&_p]:text-slate-700 dark:[&_p]:text-white/80 [&_li]:text-slate-700 dark:[&_li]:text-white/60 [&_a]:text-slate-900 dark:[&_a]:text-white hover:[&_a]:text-sky-400"
              actions={
                <Button size="lg" asChild className="bg-white text-violet-700 hover:bg-white/90 rounded-xl shadow-lg hidden sm:flex">
                  <Link href="/live">
                    <Sparkles className="mr-2 w-5 h-5" />
                    Regarder en direct
                  </Link>
                </Button>
              }
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

      {/* Service Types */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <Badge variant="secondary" className="mb-4 px-4 py-1.5">
              Nos Rassemblements
            </Badge>
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Types de Cultes
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Chaque rassemblement a sa propre atmosphère pour répondre à différents besoins spirituels.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {serviceTypes.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card className="group h-full hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <CardContent className="p-6 lg:p-8">
                    <div className="flex items-start gap-5">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center shrink-0 shadow-md`}>
                        <service.icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {service.title}
                        </h3>
                        <p className="text-muted-foreground mb-4 leading-relaxed">
                          {service.description}
                        </p>
                        
                        <div className={`flex items-center gap-2 mb-4 ${service.date ? 'flex-col sm:flex-row' : ''}`}>
                          {service.date && (
                            <Badge variant="outline" className="w-fit">
                              <Calendar className="w-3 h-3 mr-1" />
                              {service.date}
                            </Badge>
                          )}
                          <Badge variant="secondary" className="bg-primary/10 text-primary">
                            <Clock className="w-3 h-3 mr-1" />
                            {service.time}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {service.features.map((feature) => (
                            <Badge key={feature} variant="outline" className="text-xs">
                              <ChevronRight className="w-3 h-3 mr-1" />
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Weekly Schedule */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <Badge variant="secondary" className="mb-4 px-4 py-1.5">
              <Calendar className="w-4 h-4 mr-1" />
              Programme Hebdomadaire
            </Badge>
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Notre Semaine Type
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Retrouvez tous nos rendez-vous tout au long de la semaine.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-4">
            {weeklySchedule.map((day, index) => (
              <motion.div
                key={day.day}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
              >
                <Card className={`${day.services.length === 0 ? 'opacity-50' : ''}`}>
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Day */}
                      <div className="sm:w-32 shrink-0">
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                          {day.day}
                          {(day.day === "Dimanche") && (
                            <Badge variant="default" className="gradient-spiritual text-white border-0 text-xs">Principal</Badge>
                          )}
                        </h3>
                      </div>

                      {/* Services list */}
                      <div className="flex-1">
                        {day.services.length > 0 ? (
                          <div className="space-y-2">
                            {day.services.map((service) => (
                              <div
                                key={service.name}
                                className="flex flex-wrap items-center gap-x-4 gap-y-1 p-3 rounded-lg bg-background border border-border hover:border-primary/30 transition-colors"
                              >
                                <span className="font-medium text-foreground">{service.name}</span>
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  {service.time}
                                </span>
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5" />
                                  {service.location}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground italic py-2">
                            Pas de programmation prévue
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Locations */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <Badge variant="secondary" className="mb-4 px-4 py-1.5">
              <MapPin className="w-4 h-4 mr-1" />
              Lieux de Culte
            </Badge>
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Où Nous Trouver
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Nous avons plusieurs lieux de rassemblement pour vous accueillir au plus proche.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {locations.map((location, index) => (
              <motion.div
                key={location.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card className={`h-full hover:shadow-lg transition-all duration-300 ${location.isMain ? 'ring-2 ring-primary' : ''}`}>
                  <CardContent className="p-6">
                    {location.isMain && (
                      <Badge className="mb-4 gradient-spiritual text-white border-0">
                        <Star className="w-3 h-3 mr-1" />
                        Site principal
                      </Badge>
                    )}
                    
                    {/* Map placeholder */}
                    <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-xl mb-4 flex items-center justify-center">
                      <MapPin className="w-12 h-12 text-muted-foreground/30" />
                    </div>

                    <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                      {location.name}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-3 flex items-start gap-2">
                      <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                      {location.address}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Capacité : <span className="font-medium text-foreground">{location.capacity}</span>
                    </p>

                    <Separator className="my-4" />

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Équipements
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {location.features.map((feature) => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button variant="outline" size="sm" className="w-full mt-4 rounded-lg">
                      Itinéraire
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <Badge variant="secondary" className="mb-4 px-4 py-1.5">
              <Info className="w-4 h-4 mr-1" />
              Première Visite ?
            </Badge>
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Qu'Attendre
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              C'est votre première fois ? Voici ce qui vous attend lors d'un culte.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whatToExpect.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
              >
                <Card className="h-full text-center p-6 hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 rounded-2xl gradient-spiritual flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {item.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-700" />
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl" />
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <Users className="w-16 h-16 text-white/30 mx-auto mb-6" />
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              On Vous Attend !
            </h2>
            <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              Que vous soyez seul, en famille ou entre amis, vous serez accueilli 
              comme de la famille. Venez faire l'expérience d'un culte avec nous !
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                asChild
                className="bg-white text-violet-700 hover:bg-white/90 font-semibold px-8 h-14 text-base rounded-xl shadow-lg"
              >
                <Link href="/contact">
                  Planifier ma visite
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-white/40 text-white hover:bg-white/10 font-semibold px-8 h-14 text-base rounded-xl"
              >
                <Link href="/live">
                  Voir le culte en ligne
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}
