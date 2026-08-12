'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Church, 
  Users,
  LayoutDashboard,
  Shield,
  ArrowRight,
  Sparkles,
  Heart,
  CalendarDays,
  BookOpen,
  CalendarClock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function HomePage() {
  const [activePreview, setActivePreview] = useState<'member' | 'admin'>('member');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-violet-50/30 to-amber-50/20 dark:from-background dark:via-violet-950/10 dark:to-amber-950/5">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-2xl gradient-spiritual flex items-center justify-center shadow-lg glow-violet">
              <Church className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold">
              Church<span className="text-primary">Connect</span>
            </h1>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
            Tableaux de Bord Démo
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Découvrez les interfaces de gestion pour les membres et administrateurs de l&apos;église.
            Cliquez sur un dashboard ci-dessous pour l&apos;explorer.
          </p>
        </motion.div>

        {/* Dashboard Preview Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Member Dashboard Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="group hover:shadow-xl transition-all duration-500 overflow-hidden border-border/50 h-full">
              <CardHeader className="pb-4 relative overflow-hidden">
                <div className="absolute inset-0 gradient-subtle-violet opacity-50" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 rounded-xl bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400">
                      <Users className="h-6 w-6" />
                    </div>
                    <Badge variant="secondary" className="bg-violet-100 text-violet-700 hover:bg-violet-100">
                      Membre
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">Dashboard Membre</CardTitle>
                  <CardDescription className="mt-2">
                    Interface personnalisée pour les membres de la communauté avec accès aux cultes, prières, événements et plus encore.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="space-y-3 mb-6">
                  {[
                    { icon: CalendarClock, label: "Prochains cultes et événements", color: "text-violet-600" },
                    { icon: BookOpen, label: "Dernières prédications", color: "text-blue-600" },
                    { icon: Heart, label: "Prière communautaire", color: "text-rose-600" },
                    { icon: Users, label: "Mon groupe maison", color: "text-emerald-600" }
                  ].map((feature) => (
                    <div key={feature.label} className="flex items-center gap-3 text-sm">
                      <feature.icon className={`h-4 w-4 ${feature.color}`} />
                      <span className="text-muted-foreground">{feature.label}</span>
                    </div>
                  ))}
                </div>
                
                <Link href="/member/dashboard">
                  <Button className="w-full group-hover:bg-primary/90 transition-colors" size="lg">
                    Voir le Dashboard Membre
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Admin Dashboard Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="group hover:shadow-xl transition-all duration-500 overflow-hidden border-border/50 h-full">
              <CardHeader className="pb-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50/80 to-orange-50/60 dark:from-amber-950/20 dark:to-orange-950/10" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
                      <Shield className="h-6 w-6" />
                    </div>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                      Admin
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">Dashboard Admin</CardTitle>
                  <CardDescription className="mt-2">
                    Panneau d&apos;administration complet avec statistiques, graphiques, gestion des membres et rapports.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="space-y-3 mb-6">
                  {[
                    { icon: LayoutDashboard, label: "Statistiques en temps réel", color: "text-amber-600" },
                    { icon: Sparkles, label: "Graphiques analytiques", color: "text-emerald-600" },
                    { icon: CalendarDays, label: "Gestion des événements", color: "text-blue-600" },
                    { icon: Users, label: "Gestion des membres", color: "text-violet-600" }
                  ].map((feature) => (
                    <div key={feature.label} className="flex items-center gap-3 text-sm">
                      <feature.icon className={`h-4 w-4 ${feature.color}`} />
                      <span className="text-muted-foreground">{feature.label}</span>
                    </div>
                  ))}
                </div>
                
                <Link href="/admin/dashboard">
                  <Button variant="outline" className="w-full border-amber-200 hover:border-amber-300 hover:bg-amber-50 dark:border-amber-800 dark:hover:bg-amber-950/20" size="lg">
                    Voir le Dashboard Admin
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Features Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-20"
        >
          <h3 className="text-xl font-semibold text-center mb-8">Fonctionnalités Clés</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { icon: Heart, title: "Prières", desc: "Communauté de prière" },
              { icon: CalendarDays, title: "Événements", desc: "Gestion complète" },
              { icon: BookOpen, title: "Prédications", desc: "Bibliothèque audio" },
              { icon: Users, title: "Groupes", desc: "Groupes maison" }
            ].map((item) => (
              <Card key={item.title} className="text-center p-4 hover:shadow-md transition-shadow">
                <item.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h4 className="font-medium text-sm">{item.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>
      
      {/* Footer */}
      <footer className="border-t border-border mt-20 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 ChurchConnect • Tableaux de bord démo</p>
        </div>
      </footer>
    </div>
  );
}
