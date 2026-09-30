"use client";

import React, { useState } from "react";
import { motion } from '@/lib/no-motion';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle,
  Facebook,
  Instagram,
  Youtube,
  MessageCircle,
  User,
  Building2,
} from "lucide-react";
import { PublicLayout } from "@/components/layouts/public-layout";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

// Contact info
const contactInfo = [
  {
    icon: MapPin,
    title: "Adresse",
    lines: ["123 Rue du Temple", "75001 Paris, France"],
    action: "Itinéraire",
  },
  {
    icon: Phone,
    title: "Téléphone",
    lines: ["+33 1 23 45 67 89"],
    action: "Appeler",
  },
  {
    icon: Mail,
    title: "Email",
    lines: ["contact@archedamour.app"],
    action: "Envoyer un email",
  },
];

const officeHours = [
  { day: "Lundi - Vendredi", hours: "09h00 - 18h00" },
  { day: "Samedi", hours: "10h00 - 14h00" },
  { day: "Dimanche", hours: "09h00 - 15h00 (jours de culte)" },
];

const socialLinks = [
  { icon: Facebook, name: "Facebook", href: "#", followers: "12.5K" },
  { icon: Instagram, name: "Instagram", href: "#", followers: "8.2K" },
  { icon: Youtube, name: "YouTube", href: "#", followers: "5.1K" },
];

const departments = [
  { value: "general", label: "Question générale" },
  { value: "pastoral", label: "Conseil pastoral" },
  { value: "events", label: "Événements" },
  { value: "groups", label: "Groupes de vie" },
  { value: "giving", label: "Dons et finances" },
  { value: "tech", label: "Support technique" },
  { value: "volunteer", label: "Bénévolat" },
  { value: "other", label: "Autre" },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    subject: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleChange = (
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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
              title="Contactez-Nous"
              description="Une question, une demande ou simplement envie d'échanger ? Nous serions ravis de vous entendre."
              breadcrumbs={[{ label: "Contact" }]}
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

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Contact Form - 2 columns on large screens */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <MessageCircle className="w-5 h-5 text-primary" />
                      Envoyez-nous un Message
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    {isSubmitted ? (
                      /* Success state */
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-12"
                      >
                        <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-4" />
                        <h3 className="font-serif text-2xl font-semibold text-foreground mb-2">
                          Message Envoyé !
                        </h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                          Merci pour votre message ! Notre équipe vous répondra dans les plus brefs délais 
                          (généralement sous 24-48 heures ouvrées).
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsSubmitted(false);
                            setFormData({
                              firstName: "",
                              lastName: "",
                              email: "",
                              phone: "",
                              department: "",
                              subject: "",
                              message: "",
                            });
                          }}
                          className="rounded-xl"
                        >
                          Envoyer un autre message
                        </Button>
                      </motion.div>
                    ) : (
                      /* Form */
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-foreground mb-1.5 block">
                              Prénom *
                            </label>
                            <Input
                              type="text"
                              required
                              value={formData.firstName}
                              onChange={(e) => handleChange("firstName", e.target.value)}
                              placeholder="Votre prénom"
                              className="rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-foreground mb-1.5 block">
                              Nom *
                            </label>
                            <Input
                              type="text"
                              required
                              value={formData.lastName}
                              onChange={(e) => handleChange("lastName", e.target.value)}
                              placeholder="Votre nom"
                              className="rounded-lg"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-foreground mb-1.5 block">
                              Email *
                            </label>
                            <Input
                              type="email"
                              required
                              value={formData.email}
                              onChange={(e) => handleChange("email", e.target.value)}
                              placeholder="votre@email.com"
                              className="rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-foreground mb-1.5 block">
                              Téléphone
                            </label>
                            <Input
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => handleChange("phone", e.target.value)}
                              placeholder="06 12 34 56 78"
                              className="rounded-lg"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-foreground mb-1.5 block">
                            Département concerné *
                          </label>
                          <Select
                            value={formData.department}
                            onValueChange={(value) => handleChange("department", value)}
                            required
                          >
                            <SelectTrigger className="rounded-lg">
                              <SelectValue placeholder="Sélectionnez un département" />
                            </SelectTrigger>
                            <SelectContent>
                              {departments.map((dept) => (
                                <SelectItem key={dept.value} value={dept.value}>
                                  {dept.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-foreground mb-1.5 block">
                            Sujet *
                          </label>
                          <Input
                            type="text"
                            required
                            value={formData.subject}
                            onChange={(e) => handleChange("subject", e.target.value)}
                            placeholder="Sujet de votre message"
                            className="rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-foreground mb-1.5 block">
                            Message *
                          </label>
                          <Textarea
                            required
                            value={formData.message}
                            onChange={(e) => handleChange("message", e.target.value)}
                            placeholder="Décrivez votre demande en détail..."
                            rows={6}
                            className="rounded-lg resize-none"
                            maxLength={1000}
                          />
                          <p className="text-xs text-muted-foreground mt-1 text-right">
                            {formData.message.length}/1000 caractères
                          </p>
                        </div>

                        <Button
                          type="submit"
                          size="lg"
                          disabled={isSubmitting}
                          className={`w-full sm:w-auto rounded-xl ${
                            isSubmitting ? "opacity-70" : "gradient-spiritual text-white hover:opacity-90"
                          }`}
                        >
                          {isSubmitting ? (
                            <>
                              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                              Envoi en cours...
                            </>
                          ) : (
                            <>
                              <Send className="mr-2 w-5 h-5" />
                              Envoyer le message
                            </>
                          )}
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Info Cards */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="space-y-4"
              >
                {contactInfo.map((info, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl gradient-spiritual flex items-center justify-center shrink-0">
                        <info.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground mb-1">{info.title}</h3>
                        {info.lines.map((line, i) => (
                          <p key={i} className="text-sm text-muted-foreground">{line}</p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>

              {/* Office Hours */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Clock className="w-5 h-5 text-primary" />
                      Horaires de Bureau
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {officeHours.map((schedule, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center py-2 border-b border-border last:border-0"
                        >
                          <span className="font-medium text-sm text-foreground">{schedule.day}</span>
                          <span className="text-sm text-muted-foreground">{schedule.hours}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-4 italic">
                      * Pour les urgences pastorales, veuillez appeler directement le numéro ci-dessus.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Social Media */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Suivez-Nous</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {socialLinks.map((social) => (
                        <a
                          key={social.name}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <social.icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                              {social.name}
                            </p>
                            <p className="text-xs text-muted-foreground">{social.followers} abonnés</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-serif text-2xl lg:text-3xl font-bold text-foreground mb-8 text-center">
              Nous Trouver
            </h2>

            <Card className="overflow-hidden max-w-4xl mx-auto">
              {/* Map placeholder */}
              <div className="aspect-[16/9] bg-gradient-to-br from-muted to-muted/50 relative flex items-center justify-center">
                <div className="absolute inset-0">
                  {/* Grid pattern to simulate map */}
                  <div className="absolute inset-0" style={{
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                  }} />
                  
                  {/* Some "roads" */}
                  <div className="absolute top-1/3 left-0 right-0 h-8 bg-gray-300/30" />
                  <div className="absolute top-0 bottom-0 left-1/3 w-6 bg-gray-300/30" />
                  <div className="absolute top-2/3 left-1/4 right-1/4 h-4 bg-gray-300/30" />
                </div>

                <MapPin className="w-16 h-16 text-primary/50" />

                {/* Location pin */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full gradient-spiritual flex items-center justify-center shadow-lg animate-pulse">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div className="w-4 h-4 rotate-45 bg-primary absolute -bottom-1 left-1/2 -translate-x-1/2" />
                    
                    {/* Pulse effect */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-2 border-primary/30 animate-ping" />
                  </div>
                </div>

                {/* Address overlay */}
                <div className="absolute bottom-4 left-4 right-4 bg-background/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-foreground">Arche d'Amour - Temple Principal</h3>
                      <p className="text-sm text-muted-foreground">123 Rue du Temple, 75001 Paris</p>
                    </div>
                    <Button size="sm" variant="outline" className="shrink-0 rounded-lg">
                      <MapPin className="w-4 h-4 mr-1" />
                      Google Maps
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Quick Links / FAQ Teaser */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="font-serif text-2xl lg:text-3xl font-bold text-foreground mb-4">
              Questions Fréquentes ?
            </h2>
            <p className="text-muted-foreground mb-8">
              Avant de nous contacter, consultez notre FAQ qui répond aux questions les plus courantes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" variant="outline" asChild className="rounded-xl">
                <a href="/faq">
                  Consulter la FAQ
                </a>
              </Button>
              <Button size="lg" asChild className="gradient-spiritual text-white hover:opacity-90 rounded-xl">
                <a href="/cultes">
                  Venir à un culte
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}
