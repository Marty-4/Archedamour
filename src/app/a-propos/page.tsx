"use client";

import React from "react";
import Link from "next/link";
import { motion } from '@/lib/no-motion';
import {
  Heart,
  Users,
  HandHeart,
  Music,
  Target,
  Eye,
  ArrowRight,
  Quote,
  Star,
  Calendar,
  MapPin,
  BookOpen,
} from "lucide-react";
import { PublicLayout } from "@/components/layouts/public-layout";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.1 },
  },
};

// Values data
const values = [
  {
    icon: Heart,
    title: "Amour",
    description:
      "L'amour est le fondement de tout ce que nous faisons. Nous croyons en un amour inconditionnel qui accueille chacun tel qu'il est.",
    color: "from-rose-500 to-pink-600",
    bgColor: "bg-rose-50 dark:bg-rose-950/30",
  },
  {
    icon: Star,
    title: "Foi",
    description:
      "Nous vivons par la foi, nous croyons en la puissance de Dieu et en Sa Parole qui transforme les vies au quotidien.",
    color: "from-violet-500 to-purple-600",
    bgColor: "bg-violet-50 dark:bg-violet-950/30",
  },
  {
    icon: Users,
    title: "Communauté",
    description:
      "Nous sommes une famille où chaque personne compte. Ensemble, grandissons dans la foi et soutenons-nous mutuellement.",
    color: "from-blue-500 to-cyan-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    icon: HandHeart,
    title: "Service",
    description:
      "Servir les autres comme le Christ nous a servis. Nous mettons nos talents au service de Dieu et du prochain.",
    color: "from-emerald-500 to-green-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  {
    icon: Music,
    title: "Adoration",
    description:
      "L'adoration est au cœur de notre relation avec Dieu. Nous célébrons Sa grandeur avec joie et ferveur.",
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
  },
];

// Leadership team
const leadership = [
  {
    name: "Pasteur Marc Dupont",
    role: "Pasteur Principal",
    bio: "Plus de 20 ans de ministère pastoral. Passionné par l'enseignement biblique et le développement des leaders.",
    avatar: null,
    initials: "MD",
    email: "m.dupont@archedamour.app",
  },
  {
    name: "Pasteur Sophie Martin",
    role: "Pasteure Associée - Femmes & Familles",
    bio: "Dédicacée à accompagner les femmes et les familles dans leur marche spirituelle.",
    avatar: null,
    initials: "SM",
    email: "s.martin@archedamour.app",
  },
  {
    name: "Jean-Pierre Laurent",
    role: "Responsable Louange & Adoration",
    bio: "Musicien et compositeur, il dirige notre ministère de louange avec passion et excellence.",
    avatar: null,
    initials: "JL",
    email: "jp.laurent@archedamour.app",
  },
  {
    name: "Marie-Claire Dubois",
    role: "Directrice des Groupes de Vie",
    bio: "Son cœur est pour la connexion communautaire et la croissance spirituelle à travers les petits groupes.",
    avatar: null,
    initials: "MC",
    email: "mc.dubois@archedamour.app",
  },
];

// Timeline milestones
const timeline = [
  { year: "2005", event: "Fondation de Arche d'Amour avec 15 membres fondateurs" },
  { year: "2010", event: "Inauguration du temple actuel" },
  { year: "2015", event: "Lancement des groupes de vie (25 groupes)" },
  { year: "2018", event: "Début des diffusions en direct" },
  { year: "2021", event: "Lancement de la plateforme digitale" },
  { year: "2024", event: "1250+ membres et 35 groupes de vie actifs" },
];

// Statement of faith points
const statementOfFaith = [
  {
    title: "La Bible",
    text: "Nous croyons que la Bible est la Parole inspirée de Dieu, sans erreur dans ses manuscrits originaux, et l'autorité suprême en matière de foi et de conduite.",
  },
  {
    title: "Dieu",
    text: "Nous croyons en un seul Dieu éternellement existant en trois personnes : le Père, le Fils et le Saint-Esprit.",
  },
  {
    title: "Jésus-Christ",
    text: "Nous croyons que Jésus-Christ est Dieu fait chair, pleinement Dieu et pleinement homme, conçu du Saint-Esprit, né de la Vierge Marie.",
  },
  {
    title: "Le Salut",
    text: "Nous croyons que le salut est par la grâce seule, par la foi seule, en Christ seul. C'est un don gratuit de Dieu.",
  },
  {
    title: "Le Saint-Esprit",
    text: "Nous croyons que le Saint-Esprit habite chaque croyant, le scelle pour le jour de la rédemption et le rend capable d'une vie sainte.",
  },
  {
    title: "L'Église",
    text: "Nous croyons que l'Église est le corps spirituel de Christ, composée de tous les vrais croyants, appelée à adorer, servir et témoigner.",
  },
];

export default function AboutPage() {
  return (
    <PublicLayout>
      {/* Page Header with Hero */}
      <section className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-violet-800 py-20 lg:py-28 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <PageHeader
              title="À Propos de Arche d'Amour"
              description="Découvrez notre histoire, notre mission et les valeurs qui guident notre communauté depuis plus de 19 ans."
              breadcrumbs={[{ label: "À propos" }]}
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

      {/* Mission & Vision */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Mission */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="h-full border-0 shadow-lg bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/20">
                <CardContent className="p-8 lg:p-10">
                  <div className="w-14 h-14 rounded-2xl gradient-spiritual flex items-center justify-center mb-6">
                    <Target className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="font-serif text-2xl lg:text-3xl font-bold text-foreground mb-4">
                    Notre Mission
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    Transformer des vies par la puissance de l'Évangile en créant une communauté 
                    accueillante où chaque personne peut rencontrer Dieu, grandir dans la foi 
                    et découvrir son appel unique.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Vision */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="h-full border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20">
                <CardContent className="p-8 lg:p-10">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-6">
                    <Eye className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="font-serif text-2xl lg:text-3xl font-bold text-foreground mb-4">
                    Notre Vision
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    Être une église vivante et pertinente qui rayonne l'amour du Christ 
                    dans toute la région parisienne, formant des disciples engagés 
                    qui impactent positivement leur entourage.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 lg:mb-16"
          >
            <Badge variant="secondary" className="mb-4 px-4 py-1.5">
              Nos Valeurs Fondamentales
            </Badge>
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Ce Qui Nous Anime
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Ces valeurs guident chacune de nos décisions et actions en tant que communauté de foi.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card className={`h-full group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${value.bgColor}`}>
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${value.color} flex items-center justify-center mx-auto mb-5 shadow-md`}>
                      <value.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-serif text-xl font-semibold text-foreground mb-3">
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* History Timeline */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 lg:mb-16"
          >
            <Badge variant="secondary" className="mb-4 px-4 py-1.5">
              Notre Histoire
            </Badge>
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Un Parcours de Foi
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              De nos humbles débuts à aujourd'hui, voici les moments clés qui ont façonné notre communauté.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent md:-translate-x-0.5" />

              {timeline.map((item, index) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className={`relative flex items-start gap-6 mb-8 last:mb-0 ${
                    index % 2 === 0 ? "md:flex-row-reverse" : ""
                  }`}
                >
                  {/* Content */}
                  <div className={`flex-1 ml-12 md:ml-0 ${index % 2 === 0 ? "md:text-right" : ""}`}>
                    <Card className="inline-block p-4 hover:shadow-md transition-shadow">
                      <Badge variant="outline" className="mb-2 font-mono text-primary border-primary/30">
                        {item.year}
                      </Badge>
                      <p className="text-foreground">{item.event}</p>
                    </Card>
                  </div>

                  {/* Dot */}
                  <div className="absolute left-4 md:left-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background -translate-x-1/2 z-10" />

                  {/* Spacer for alternating layout */}
                  <div className="hidden md:block flex-1" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 lg:mb-16"
          >
            <Badge variant="secondary" className="mb-4 px-4 py-1.5">
              Équipe Pastorale
            </Badge>
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Nos Leaders
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Des personnes dévouées qui servent avec passion et humilité.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {leadership.map((leader, index) => (
              <motion.div
                key={leader.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card className="group h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-center">
                  <CardContent className="p-6">
                    <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 ring-primary/10">
                      <AvatarImage src={leader.avatar || undefined} />
                      <AvatarFallback className="gradient-spiritual text-white text-xl font-semibold">
                        {leader.initials}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold text-lg text-foreground mb-1">
                      {leader.name}
                    </h3>
                    <Badge variant="secondary" className="mb-3 bg-primary/10 text-primary">
                      {leader.role}
                    </Badge>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                      {leader.bio}
                    </p>
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                      <MapPin className="w-4 h-4 mr-1" />
                      Contacter
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Statement of Faith */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 lg:mb-16"
          >
            <Badge variant="secondary" className="mb-4 px-4 py-1.5">
              <BookOpen className="w-4 h-4 mr-1" />
              Déclaration de Foi
            </Badge>
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Ce Que Nous Croyons
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Les fondements bibliques qui définissent notre foi et notre pratique chrétienne.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {statementOfFaith.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08, duration: 0.5 }}
                >
                  <Card className="h-full hover:shadow-md transition-shadow p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl gradient-spiritual flex items-center justify-center shrink-0">
                        <span className="text-white font-bold text-sm">{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-foreground mb-2">
                          {item.title}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {item.text}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
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
            <Quote className="w-16 h-16 text-white/30 mx-auto mb-6" />
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Rejoignez Notre Aventure
            </h2>
            <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              Que vous soyez nouveau dans la foi ou un chrétien aguerri, il y a une place pour vous 
              dans notre famille. Venez faire partie de cette belle histoire.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                asChild
                className="bg-white text-violet-700 hover:bg-white/90 font-semibold px-8 h-14 text-base rounded-xl shadow-lg"
              >
                <Link href="/contact">
                  Prendre contact
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-white/40 text-white hover:bg-white/10 font-semibold px-8 h-14 text-base rounded-xl"
              >
                <Link href="/cultes">
                  <Calendar className="mr-2 w-5 h-5" />
                  Venir à un culte
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}
