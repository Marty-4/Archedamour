'use client';

import React, { useState } from 'react';
import { motion } from '@/lib/no-motion';
import {
  Heart,
  CreditCard,
  Smartphone,
  Landmark,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Calendar,
  Repeat,
  Shield,
  Lock,
  ArrowRight,
  ChevronDown,
  Info,
} from 'lucide-react';
import { PublicLayout } from '@/components/layouts/public-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Types
type DonationCategory = 'Dîme' | 'Offrande' | 'Don' | 'Mission' | 'Construction' | 'Projet' | 'Autre';
type PaymentMethod = 'card' | 'mtn' | 'orange' | 'bank_transfer';
type Frequency = 'unique' | 'monthly';

interface PresetAmount {
  value: number;
  label: string;
  popular?: boolean;
}

// Preset amounts in FCFA
const presetAmounts: PresetAmount[] = [
  { value: 5000, label: '5 000 FCFA' },
  { value: 10000, label: '10 000 FCFA', popular: true },
  { value: 25000, label: '25 000 FCFA' },
  { value: 50000, label: '50 000 FCFA', popular: true },
  { value: 100000, label: '100 000 FCFA' },
];

const donationCategories: { value: DonationCategory; label: string; description: string; icon: React.ElementType }[] = [
  { value: 'Dîme', label: 'Dîme', description: '10% de vos revenus selon Malachie 3:10', icon: Sparkles },
  { value: 'Offrande', label: 'Offrande', description: 'Don volontaire pendant le culte', icon: Heart },
  { value: 'Don', label: 'Don', description: 'Contribution libre pour l\'église', icon: GiftIcon },
  { value: 'Mission', label: 'Mission', description: 'Soutien aux œuvres missionnaires', icon: GlobeIcon },
  { value: 'Construction', label: 'Construction', description: 'Projet de construction du temple', icon: BuildingIcon },
  { value: 'Projet', label: 'Projet spécial', description: 'Projets spécifiques de l\'église', icon: StarIcon },
  { value: 'Autre', label: 'Autre', description: 'Autre type de contribution', icon: MoreIcon },
];

const paymentMethods: { id: PaymentMethod; label: string; icon: React.ElementType; description: string }[] = [
  { id: 'card', label: 'Carte bancaire', icon: CreditCard, description: 'Visa, Mastercard' },
  { id: 'mtn', label: 'Mobile Money - MTN', icon: Smartphone, description: 'MTN Mobile Money (CM)' },
  { id: 'orange', label: 'Mobile Money - Orange', icon: Smartphone, description: 'Orange Money (CI)' },
  { id: 'bank_transfer', label: 'Virement bancaire', icon: Landmark, description: 'Virement direct' },
];

// Custom icons
function GiftIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect width="20" height="5" x="2" y="7" />
      <line x1="12" x2="12" y1="22" y2="7" />
      <path d="m12 7-3.312-3.312a2.975 2.975 0 1 1 4.209-4.209L12 2l-.897-.897a2.975 2.975 0 1 1 4.209 4.209L12 7Z" />
      <path d="M6.705 7H2v5h4.705" />
    </svg>
  );
}

function GlobeIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" x2="22" y1="12" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function BuildingIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  );
}

function StarIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function MoreIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  );
}

export default function GivePage() {
  const [selectedAmount, setSelectedAmount] = useState<number>(10000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [frequency, setFrequency] = useState<Frequency>('unique');
  const [category, setCategory] = useState<DonationCategory>('Dîme');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Get actual amount (custom or preset)
  const getActualAmount = (): number => {
    if (customAmount) {
      const parsed = parseInt(customAmount.replace(/\s/g, ''), 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    return selectedAmount;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  const handleDonate = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    setIsCompleted(true);
  };

  const handleReset = () => {
    setIsCompleted(false);
    setSelectedAmount(10000);
    setCustomAmount('');
    setFrequency('unique');
    setCategory('Dîme');
    setPaymentMethod('card');
  };

  return (
    <PublicLayout>
      {/* Hero Section */}
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
            className="max-w-3xl"
          >
            <PageHeader
              title="Soutenir l'Œuvre de Dieu"
              description="Vos dons permettent à notre église de poursuivre sa mission et de porter l'Évangile aux quatre coins du monde."
              breadcrumbs={[{ label: "Donner" }]}
              className="text-slate-900 dark:text-white [&_h1]:text-slate-900 dark:[&_h1]:text-white [&_p]:text-slate-700 dark:[&_p]:text-white/80 [&_li]:text-slate-700 dark:[&_li]:text-white/60 [&_a]:text-slate-900 dark:[&_a]:text-white hover:[&_a]:text-sky-400"
            />

            {/* Bible verse */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
            >
              <blockquote className="text-lg text-white/90 italic text-center leading-relaxed">
                &ldquo;Celui qui sème peu moissonnera aussi peu, et celui qui sème abondamment 
                moissonnera aussi abondamment.&rdquo;
              </blockquote>
              <cite className="block text-center text-white/70 mt-3 not-italic">
                — 2 Corinthiens 9:6
              </cite>
            </motion.div>
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

      {/* Demo Notice Banner */}
      <section className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-start gap-3 max-w-3xl mx-auto">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-200">
                Mode Démonstration
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                Cette page est une démonstration. Aucun paiement réel ne sera effectué. 
                Ne saisissez pas vos véritables informations bancaires.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Donation Form */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/20 pb-6">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Heart className="w-5 h-5 text-primary" />
                      Faire un Don
                    </CardTitle>
                    <CardDescription>
                      Choisissez le montant, la fréquence et la catégorie de votre don.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-6 space-y-8">
                    {isCompleted ? (
                      /* Success State */
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-12 space-y-6"
                      >
                        <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
                          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                        </div>
                        
                        <div>
                          <h3 className="font-serif text-2xl font-bold text-foreground mb-2">
                            Merci pour votre générosité !
                          </h3>
                          <p className="text-muted-foreground">
                            Votre don de <span className="font-semibold text-primary">{formatCurrency(getActualAmount())}</span> a été enregistré avec succès.
                            Que Dieu vous bénisse abondamment !
                          </p>
                        </div>

                        <div className="p-4 bg-muted/50 rounded-xl text-sm text-left space-y-2 max-w-xs mx-auto">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Montant</span>
                            <span className="font-medium">{formatCurrency(getActualAmount())}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Fréquence</span>
                            <span className="font-medium">{frequency === 'monthly' ? 'Mensuel' : 'Unique'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Catégorie</span>
                            <span className="font-medium">{category}</span>
                          </div>
                        </div>

                        <Button onClick={handleReset} variant="outline" className="rounded-xl">
                          Faire un autre don
                        </Button>
                      </motion.div>
                    ) : (
                      /* Form */
                      <>
                        {/* Amount Selection */}
                        <div className="space-y-4">
                          <label className="text-base font-semibold flex items-center gap-2">
                            Montant du don
                          </label>

                          {/* Preset amounts */}
                          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                            {presetAmounts.map((preset) => (
                              <button
                                key={preset.value}
                                type="button"
                                onClick={() => {
                                  setSelectedAmount(preset.value);
                                  setCustomAmount('');
                                }}
                                className={`relative p-3 rounded-xl border-2 font-semibold transition-all ${
                                  selectedAmount === preset.value && !customAmount
                                    ? 'border-primary bg-primary/5 shadow-md'
                                    : 'border-border hover:border-primary/50'
                                }`}
                              >
                                {preset.popular && (
                                  <Badge className="absolute -top-2 -right-2 text-[10px] px-1.5 py-0 bg-amber-400 text-amber-900">
                                    Populaire
                                  </Badge>
                                )}
                                <span className="text-sm">{preset.label}</span>
                              </button>
                            ))}
                          </div>

                          {/* Custom amount */}
                          <div className="relative">
                            <Input
                              type="text"
                              placeholder="Montant personnalisé (ex: 15000)"
                              value={customAmount}
                              onChange={(e) => {
                                setCustomAmount(e.target.value);
                                if (e.target.value) setSelectedAmount(0);
                              }}
                              className="pl-4 pr-16 h-12 text-lg rounded-xl"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                              FCFA
                            </span>
                          </div>
                        </div>

                        <Separator />

                        {/* Frequency Selection */}
                        <div className="space-y-3">
                          <label className="text-base font-semibold flex items-center gap-2">
                            Fréquence
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => setFrequency('unique')}
                              className={`p-4 rounded-xl border-2 text-left transition-all ${
                                frequency === 'unique'
                                  ? 'border-primary bg-primary/5 shadow-md'
                                  : 'border-border hover:border-primary/50'
                              }`}
                            >
                              <Calendar className="w-5 h-5 mb-2 text-primary" />
                              <p className="font-semibold">Don unique</p>
                              <p className="text-xs text-muted-foreground mt-1">Une seule fois</p>
                            </button>
                            <button
                              type="button"
                              onClick={() => setFrequency('monthly')}
                              className={`p-4 rounded-xl border-2 text-left transition-all ${
                                frequency === 'monthly'
                                  ? 'border-primary bg-primary/5 shadow-md'
                                  : 'border-border hover:border-primary/50'
                              }`}
                            >
                              <Repeat className="w-5 h-5 mb-2 text-primary" />
                              <p className="font-semibold">Don mensuel</p>
                              <p className="text-xs text-muted-foreground mt-1">Chaque mois automatiquement</p>
                            </button>
                          </div>
                        </div>

                        <Separator />

                        {/* Category Selection */}
                        <div className="space-y-3">
                          <label className="text-base font-semibold flex items-center gap-2">
                            Catégorie du don
                          </label>
                          <Select value={category} onValueChange={(v) => setCategory(v as DonationCategory)}>
                            <SelectTrigger className="h-12 rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {donationCategories.map((cat) => (
                                <SelectItem key={cat.value} value={cat.value}>
                                  <div className="flex items-center gap-2">
                                    <cat.icon className="w-4 h-4" />
                                    <span>{cat.label}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          {donationCategories.find((c) => c.value === category) && (
                            <p className="text-sm text-muted-foreground pl-1">
                              {donationCategories.find((c) => c.value === category)?.description}
                            </p>
                          )}
                        </div>

                        <Separator />

                        {/* Payment Method */}
                        <div className="space-y-3">
                          <label className="text-base font-semibold flex items-center gap-2">
                            Mode de paiement
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {paymentMethods.map((method) => {
                              const Icon = method.icon;
                              return (
                                <button
                                  key={method.id}
                                  type="button"
                                  onClick={() => setPaymentMethod(method.id)}
                                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                                    paymentMethod === method.id
                                      ? 'border-primary bg-primary/5 shadow-md'
                                      : 'border-border hover:border-primary/50'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                      paymentMethod === method.id ? 'gradient-spiritual text-white' : 'bg-muted text-muted-foreground'
                                    }`}>
                                      <Icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                      <p className="font-semibold text-sm">{method.label}</p>
                                      <p className="text-xs text-muted-foreground">{method.description}</p>
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <Separator />

                        {/* Submit Button */}
                        <Button
                          size="lg"
                          onClick={handleDonate}
                          disabled={getActualAmount() <= 0 || isProcessing}
                          className={`w-full h-14 text-base rounded-xl ${
                            isProcessing ? 'opacity-70' : 'gradient-spiritual text-white hover:opacity-90'
                          }`}
                        >
                          {isProcessing ? (
                            <>
                              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                              Traitement en cours...
                            </>
                          ) : (
                            <>
                              <Heart className="mr-2 w-5 h-5" />
                              Doner {formatCurrency(getActualAmount())}
                              {frequency === 'monthly' && '/mois'}
                            </>
                          )}
                        </Button>

                        {/* Security note */}
                        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2">
                          <span className="flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            Paiement sécurisé
                          </span>
                          <span className="flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            Données protégées
                          </span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Impact Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-gradient-to-br from-violet-600 to-purple-700 text-white border-0">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="font-serif text-xl font-bold">Impact de Vos Dons</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
                        <Sparkles className="w-5 h-5 shrink-0" />
                        <span className="text-sm">Soutien des missions locales</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
                        <BuildingIcon className="w-5 h-5 shrink-0" />
                        <span className="text-sm">Entretien du temple</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
                        <GlobeIcon className="w-5 h-5 shrink-0" />
                        <span className="text-sm">Projets humanitaires</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
                        <GiftIcon className="w-5 h-5 shrink-0" />
                        <span className="text-sm">Aide aux plus démunis</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Biblical Giving Principles */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
              >
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Info className="w-5 h-5 text-primary" />
                      Principes Bibliques
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-4">
                    <div className="space-y-3 text-sm">
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="font-medium text-foreground mb-1">La Dîme</p>
                        <p className="text-muted-foreground">
                          &ldquo;Apportez à la maison du trésor toutes les dîmes...&rdquo; — Malachie 3:10
                        </p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="font-medium text-foreground mb-1">L'Offrande Volontaire</p>
                        <p className="text-muted-foreground">
                          &ldquo;Que chacun donne comme il l'a résolu dans son cœur...&rdquo; — 2 Corinthiens 9:7
                        </p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="font-medium text-foreground mb-1">Avec Joie</p>
                        <p className="text-muted-foreground">
                          &ldquo;Dieu aime celui qui donne avec joie.&rdquo; — 2 Corinthiens 9:7b
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Contact for Questions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="border-dashed">
                  <CardContent className="p-5 text-center">
                    <p className="text-sm text-muted-foreground mb-3">
                      Une question sur les dons ?
                    </p>
                    <Button variant="outline" size="sm" className="rounded-lg w-full">
                      Contacter le trésorier
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
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
