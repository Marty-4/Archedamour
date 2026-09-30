"use client";

import React from "react";
import Image from "next/image";
import { MainNav } from "@/components/navigation/main-nav";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Instagram,
  Youtube,
  Heart,
  ArrowRight,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

// Footer links configuration
const footerLinks = {
  navigation: [
    { label: "Accueil", href: "/" },
    { label: "À propos", href: "/a-propos" },
    { label: "Cultes", href: "/cultes" },
    { label: "Prédications", href: "/predications" },
    { label: "Événements", href: "/evenements" },
    { label: "Live", href: "/live" },
  ],
  ressources: [
    { label: "Groupes de vie", href: "/groupes" },
    { label: "Ministères", href: "/ministeres" },
    { label: "Bibliothèque", href: "/bibliotheque" },
    { label: "Témoignages", href: "/temoignages" },
    { label: "FAQ", href: "/faq" },
  ],
  legal: [
    { label: "Mentions légales", href: "/mentions-legales" },
    { label: "Politique de confidentialité", href: "/confidentialite" },
    { label: "CGU", href: "/cgu" },
    { label: "Cookies", href: "/cookies" },
  ],
};

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Youtube, href: "#", label: "YouTube" },
];

interface PublicLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function PublicLayout({ children, className }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-sky-50 dark:bg-slate-950">
      {/* Header / Navigation */}
      <MainNav />

      {/* Main content area - with top padding for fixed header */}
      <main className={`flex-1 pt-16 lg:pt-20 bg-sky-50 dark:bg-slate-950 ${className ?? ""}`}>
        <div>{children}</div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border">
        {/* Newsletter section */}
        <div className="border-b border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <div className="max-w-2xl mx-auto text-center space-y-4">
              <h3 className="font-serif text-2xl lg:text-3xl font-semibold">
                Restez connecté
              </h3>
              <p className="text-muted-foreground">
                Recevez nos dernières nouvelles, événements et inspirations
                directement dans votre boîte mail.
              </p>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              >
                <Input
                  type="email"
                  placeholder="Votre adresse email"
                  className="flex-1 h-11 rounded-xl"
                />
                <Button
                  type="submit"
                  className="h-11 rounded-xl gradient-spiritual text-white hover:opacity-90 transition-opacity"
                >
                  S&apos;abonner
                  <Send className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Main footer content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Brand column */}
            <div className="lg:col-span-2 space-y-4">
              <Link href="/" className="flex items-center gap-3 group">
                <Image
                  src="/icons/LogoArche.jpg"
                  alt="Arche d'Amour"
                  width={40}
                  height={40}
                  className="rounded-xl shadow-md object-cover"
                />
                <span className="font-serif text-xl font-semibold">
                  Arche d'<span className="text-primary">Amour</span>
                </span>
              </Link>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
                Une communauté vivante, passionnée par l&apos;amour de Dieu et
                dédiée à transformer des vies par la puissance de l&apos;Évangile.
              </p>

              {/* Contact info */}
              <div className="space-y-2 text-sm">
                <a
                  href="#"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <span>123 Rue du Temple, 75001 Paris</span>
                </a>
                <a
                  href="tel:+33123456789"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Phone className="h-4 w-4 text-primary shrink-0" />
                  <span>+33 1 23 45 67 89</span>
                </a>
                <a
                  href="mailto:contact@archedamour.app"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Mail className="h-4 w-4 text-primary shrink-0" />
                  <span>contact@archedamour.app</span>
                </a>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 text-primary shrink-0" />
                  <span>Culte : Dimanche 10h &amp; 14h30</span>
                </div>
              </div>

              {/* Social links */}
              <div className="flex items-center gap-3 pt-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                  >
                    <social.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Navigation columns */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm uppercase tracking-wider">
                Navigation
              </h4>
              <ul className="space-y-2.5">
                {footerLinks.navigation.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-sm uppercase tracking-wider">
                Ressources
              </h4>
              <ul className="space-y-2.5">
                {footerLinks.ressources.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-sm uppercase tracking-wider">
                Légal
              </h4>
              <ul className="space-y-2.5">
                {footerLinks.legal.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                © {new Date().getFullYear()} Arche d'Amour. Fait avec
                <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                pour la gloire de Dieu.
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <Link
                  href="/mentions-legales"
                  className="hover:text-foreground transition-colors"
                >
                  Mentions légales
                </Link>
                <Separator orientation="vertical" className="h-3" />
                <Link
                  href="/confidentialite"
                  className="hover:text-foreground transition-colors"
                >
                  Confidentialité
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
