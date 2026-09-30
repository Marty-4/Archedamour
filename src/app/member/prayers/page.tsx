'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from '@/lib/no-motion';
import {
  Heart,
  Plus,
  Search,
  Filter,
  X,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Lock,
  Users,
  MessageSquare,
  Pencil,
  Trash2,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Types
type PrayerCategory = 'Famille' | 'Santé' | 'Travail' | 'Études' | 'Finances' | 'Vie Spirituelle' | 'Autre';
type PrayerVisibility = 'Privée' | 'Pastorale' | 'Communautaire';
type PrayerStatus = 'En attente' | 'Exaucée';

interface MyPrayerRequest {
  id: string;
  title: string;
  description: string;
  category: PrayerCategory;
  visibility: PrayerVisibility;
  status: PrayerStatus;
  prayerCount: number;
  createdAt: string;
}

interface CommunityPrayerRequest {
  id: string;
  authorName: string;
  authorInitials: string;
  isAnonymous: boolean;
  title: string;
  description: string;
  category: PrayerCategory;
  date: string;
  prayerCount: number;
  hasPrayed: boolean;
}

// Mock data for my prayers
const initialMyPrayers: MyPrayerRequest[] = [
  {
    id: 'pry_001',
    title: 'Guérison pour ma mère',
    description: 'Ma mère est hospitalisée pour une opération cardiaque. Je demande la prière pour une intervention réussie et un rétablissement rapide.',
    category: 'Santé',
    visibility: 'Communautaire',
    status: 'En attente',
    prayerCount: 24,
    createdAt: '15 Décembre 2024',
  },
  {
    id: 'pry_002',
    title: 'Orientation professionnelle',
    description: 'Je suis à un tournant dans ma carrière et je cherche la direction de Dieu pour les prochaines étapes.',
    category: 'Travail',
    visibility: 'Pastorale',
    status: 'En attente',
    prayerCount: 12,
    createdAt: '10 Décembre 2024',
  },
  {
    id: 'pry_003',
    title: 'Réconciliation familiale',
    description: 'Prière pour la restauration de relations tendues au sein de ma famille. Que l\'amour du Christ règne.',
    category: 'Famille',
    visibility: 'Privée',
    status: 'Exaucée',
    prayerCount: 45,
    createdAt: '1er Décembre 2024',
  },
  {
    id: 'pry_004',
    title: 'Préparation aux examens',
    description: 'Mes enfants passent leurs examens finaux ce mois. Prière pour la concentration, la paix et la réussite.',
    category: 'Études',
    visibility: 'Communautaire',
    status: 'En attente',
    prayerCount: 18,
    createdAt: '5 Décembre 2024',
  },
];

// Mock data for community prayers
const initialCommunityPrayers: CommunityPrayerRequest[] = [
  {
    id: 'com_001',
    authorName: 'Frère Patrice M.',
    authorInitials: 'PM',
    isAnonymous: false,
    title: 'Guérison après opération',
    description: 'Je sors d\'une chirurgie délicate et j\'ai besoin de prières pour mon rétablissement complet. Merci d\'avance !',
    category: 'Santé',
    date: 'Il y a 2 heures',
    prayerCount: 32,
    hasPrayed: false,
  },
  {
    id: 'com_002',
    authorName: 'Anonyme',
    authorInitials: 'A',
    isAnonymous: true,
    title: 'Difficultés conjugales',
    description: 'Mon mariage traverse une tempête. Je demande la prière pour la sagesse, la patience et la restauration de notre union.',
    category: 'Famille',
    date: 'Il y a 5 heures',
    prayerCount: 48,
    hasPrayed: true,
  },
  {
    id: 'com_003',
    authorName: 'Sœur Esther T.',
    authorInitials: 'ET',
    isAnonymous: false,
    title: 'Action de grâce - Nouvel emploi !',
    description: 'Gloire à Dieu ! Après 8 mois de recherche, j\'ai enfin trouvé un emploi qui correspond à mes compétences. Que le Seigneur soit béni !',
    category: 'Travail',
    date: 'Hier',
    prayerCount: 56,
    hasPrayed: false,
  },
  {
    id: 'com_004',
    authorName: 'Frère Christian M.',
    authorInitials: 'CM',
    isAnonymous: false,
    title: 'Examens finaux',
    description: 'Je passe mes examens de licence cette semaine. J\'ai besoin de prières pour la concentration et la paix intérieure.',
    category: 'Études',
    date: 'Hier',
    prayerCount: 21,
    hasPrayed: false,
  },
  {
    id: 'com_005',
    authorName: 'Anonyme',
    authorInitials: 'A',
    isAnonymous: true,
    title: 'Burden financier',
    description: 'Je fais face à des difficultés financières importantes. Je demande la prière pour la provision divine et des ouvertures.',
    category: 'Finances',
    date: 'Il y a 2 jours',
    prayerCount: 38,
    hasPrayed: false,
  },
  {
    id: 'com_006',
    authorName: 'Sœur Grace M.',
    authorInitials: 'GM',
    isAnonymous: false,
    title: 'Croissance spirituelle',
    description: 'Je désire approfondir ma relation avec Dieu et comprendre mieux Sa Parole. Prière pour soif spirituelle et discernement.',
    category: 'Vie Spirituelle',
    date: 'Il y a 3 jours',
    prayerCount: 29,
    hasPrayed: true,
  },
];

const categories: PrayerCategory[] = ['Famille', 'Santé', 'Travail', 'Études', 'Finances', 'Vie Spirituelle', 'Autre'];

const categoryColors: Record<PrayerCategory, string> = {
  'Famille': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  'Santé': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'Travail': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Études': 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  'Finances': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'Vie Spirituelle': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'Autre': 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
};

const visibilityConfig: Record<PrayerVisibility, { icon: React.ElementType; color: string; description: string }> = {
  'Privée': { icon: Lock, color: 'bg-gray-100 text-gray-600', description: 'Visible seulement par moi' },
  'Pastorale': { icon: Eye, color: 'bg-blue-100 text-blue-600', description: 'Visible par lepasteur' },
  'Communautaire': { icon: Users, color: 'bg-green-100 text-green-600', description: 'Visible par les membres' },
};

export default function PrayersPage() {
  const [activeTab, setActiveTab] = useState<'my-prayers' | 'community'>('my-prayers');
  const [myPrayers, setMyPrayers] = useState<MyPrayerRequest[]>(initialMyPrayers);
  const [communityPrayers, setCommunityPrayers] = useState<CommunityPrayerRequest[]>(initialCommunityPrayers);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('Tous');
  const [editingPrayer, setEditingPrayer] = useState<MyPrayerRequest | null>(null);

  // New prayer form state
  const [newPrayer, setNewPrayer] = useState({
    title: '',
    description: '',
    category: 'Santé' as PrayerCategory,
    visibility: 'Communautaire' as PrayerVisibility,
  });

  // Filter community prayers
  const filteredCommunityPrayers = useMemo(() => {
    return communityPrayers.filter((prayer) => {
      const matchesSearch =
        searchQuery === '' ||
        prayer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prayer.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = categoryFilter === 'Tous' || prayer.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [communityPrayers, searchQuery, categoryFilter]);

  // Handle creating new prayer
  const handleCreatePrayer = () => {
    if (!newPrayer.title.trim() || !newPrayer.description.trim()) return;

    const prayer: MyPrayerRequest = {
      id: `pry_${Date.now()}`,
      title: newPrayer.title,
      description: newPrayer.description,
      category: newPrayer.category,
      visibility: newPrayer.visibility,
      status: 'En attente',
      prayerCount: 1,
      createdAt: "Aujourd'hui",
    };

    setMyPrayers([prayer, ...myPrayers]);
    setNewPrayer({ title: '', description: '', category: 'Santé', visibility: 'Communautaire' });
    setIsCreateModalOpen(false);
  };

  // Handle praying for someone
  const handlePrayFor = (prayerId: string) => {
    setCommunityPrayers((prev) =>
      prev.map((p) =>
        p.id === prayerId
          ? { ...p, prayerCount: p.prayerCount + 1, hasPrayed: true }
          : p
      )
    );
  };

  // Handle marking as answered
  const handleMarkAsAnswered = (prayerId: string) => {
    setMyPrayers((prev) =>
      prev.map((p) =>
        p.id === prayerId ? { ...p, status: 'Exaucée' as PrayerStatus } : p
      )
    );
  };

  // Handle deleting prayer
  const handleDeletePrayer = (prayerId: string) => {
    setMyPrayers((prev) => prev.filter((p) => p.id !== prayerId));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Demandes de Prière"
          description="Partagez vos besoins de prière et soutenez votre communauté dans la foi."
        />

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="my-prayers" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Mes Prières
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Communauté
            </TabsTrigger>
          </TabsList>

          {/* My Prayers Tab */}
          <TabsContent value="my-prayers" className="mt-6 space-y-6">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                {myPrayers.length} demande{myPrayers.length > 1 ? 's' : ''} de prière
              </p>
              
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button className="gradient-spiritual text-white hover:opacity-90 rounded-lg">
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvelle demande
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      Nouvelle Demande de Prière
                    </DialogTitle>
                    <DialogDescription>
                      Partagez votre besoin avec la communauté ou gardez-le privé.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    {/* Title */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Titre *</label>
                      <Input
                        placeholder="Résumez votre demande en quelques mots"
                        value={newPrayer.title}
                        onChange={(e) => setNewPrayer({ ...newPrayer, title: e.target.value })}
                        className="rounded-lg"
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Description *</label>
                      <Textarea
                        placeholder="Décrivez votre besoin de prière en détail..."
                        value={newPrayer.description}
                        onChange={(e) => setNewPrayer({ ...newPrayer, description: e.target.value })}
                        rows={4}
                        className="rounded-lg resize-none"
                        maxLength={500}
                      />
                      <p className="text-xs text-muted-foreground text-right">
                        {newPrayer.description.length}/500 caractères
                      </p>
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Catégorie</label>
                      <Select
                        value={newPrayer.category}
                        onValueChange={(v) => setNewPrayer({ ...newPrayer, category: v as PrayerCategory })}
                      >
                        <SelectTrigger className="rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Visibility */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Visibilité</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {(Object.keys(visibilityConfig) as PrayerVisibility[]).map((vis) => {
                          const config = visibilityConfig[vis];
                          const Icon = config.icon;
                          return (
                            <button
                              key={vis}
                              type="button"
                              onClick={() => setNewPrayer({ ...newPrayer, visibility: vis })}
                              className={`p-3 rounded-lg border text-left transition-all ${
                                newPrayer.visibility === vis
                                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                  : 'border-border hover:border-primary/50'
                              }`}
                            >
                              <Icon className={`w-4 h-4 mb-1 ${newPrayer.visibility === vis ? 'text-primary' : 'text-muted-foreground'}`} />
                              <p className="font-medium text-sm">{vis}</p>
                              <p className="text-xs text-muted-foreground">{config.description}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} className="rounded-lg">
                      Annuler
                    </Button>
                    <Button
                      onClick={handleCreatePrayer}
                      disabled={!newPrayer.title.trim() || !newPrayer.description.trim()}
                      className="gradient-spiritual text-white hover:opacity-90 rounded-lg"
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Publier la demande
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* My Prayers List */}
            {myPrayers.length > 0 ? (
              <div className="space-y-4">
                {myPrayers.map((prayer, index) => (
                  <motion.div
                    key={prayer.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-5">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          {/* Main content */}
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start gap-3">
                              <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${categoryColors[prayer.category]}`}>
                                {prayer.category}
                              </div>
                              
                              <Badge
                                variant={prayer.status === 'Exaucée' ? 'default' : 'secondary'}
                                className={prayer.status === 'Exaucée' 
                                  ? 'bg-emerald-100 text-emerald-700 border-0' 
                                  : 'bg-amber-100 text-amber-700'
                                }
                              >
                                {prayer.status === 'Exaucée' ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Exaucée
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-3 h-3 mr-1" />
                                    En attente
                                  </>
                                )}
                              </Badge>
                            </div>

                            <h3 className="font-semibold text-lg text-foreground">{prayer.title}</h3>
                            <p className="text-muted-foreground text-sm line-clamp-2">{prayer.description}</p>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1.5">
                                {(() => {
                                  const Icon = visibilityConfig[prayer.visibility].icon;
                                  return <Icon className="w-4 h-4" />;
                                })()}
                                {prayer.visibility}
                              </span>
                              <span>Créée le {prayer.createdAt}</span>
                              <span className="flex items-center gap-1 text-primary font-medium">
                                <Heart className="w-4 h-4 fill-primary" />
                                {prayer.prayerCount} personne{prayer.prayerCount > 1 ? 's' : ''} prient
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex sm:flex-col gap-2 shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            {prayer.status === 'En attente' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-emerald-600 hover:text-emerald-700"
                                onClick={() => handleMarkAsAnswered(prayer.id)}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => handleDeletePrayer(prayer.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* Empty State */
              <Card className="border-dashed">
                <CardContent className="py-16 text-center">
                  <Heart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="font-serif text-xl font-semibold mb-2">Aucune demande de prière</h3>
                  <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                    Vous n&apos;avez pas encore partagé de demande de prière. Commencez en créant votre première demande.
                  </p>
                  <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="gradient-spiritual text-white hover:opacity-90 rounded-lg"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Créer une demande
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Community Tab */}
          <TabsContent value="community" className="mt-6 space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une demande..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-lg"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-muted flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[180px] rounded-lg">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tous">Toutes catégories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Results count */}
            <p className="text-sm text-muted-foreground">
              {filteredCommunityPrayers.length} demande{filteredCommunityPrayers.length > 1 ? 's' : ''} trouvée{filteredCommunityPrayers.length > 1 ? 's' : ''}
            </p>

            {/* Community Prayers Grid */}
            {filteredCommunityPrayers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCommunityPrayers.map((prayer, index) => (
                  <motion.div
                    key={prayer.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                      <CardContent className="p-5 space-y-4">
                        {/* Author and Category */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className={
                                prayer.isAnonymous 
                                  ? 'bg-muted text-muted-foreground text-xs' 
                                  : 'gradient-spiritual text-white text-xs'
                              }>
                                {prayer.isAnonymous ? '?' : prayer.authorInitials}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium text-foreground">
                              {prayer.isAnonymous ? 'Anonyme' : prayer.authorName}
                            </span>
                          </div>
                          <Badge variant="secondary" className={`text-xs ${categoryColors[prayer.category]}`}>
                            {prayer.category}
                          </Badge>
                        </div>

                        {/* Title and Description */}
                        <div>
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {prayer.title}
                          </h3>
                          <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
                            {prayer.description}
                          </p>
                        </div>

                        {/* Date */}
                        <p className="text-xs text-muted-foreground">{prayer.date}</p>

                        {/* Prayer button */}
                        <Button
                          variant={prayer.hasPrayed ? 'secondary' : 'default'}
                          className={`w-full rounded-lg ${
                            prayer.hasPrayed 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' 
                              : 'gradient-spiritual text-white hover:opacity-90'
                          }`}
                          onClick={() => handlePrayFor(prayer.id)}
                          disabled={prayer.hasPrayed}
                        >
                          <AnimatePresence mode="wait">
                            {prayer.hasPrayed ? (
                              <motion.span
                                key="prayed"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="flex items-center"
                              >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Je prie déjà
                              </motion.span>
                            ) : (
                              <motion.span
                                key="pray"
                                exit={{ scale: 0 }}
                                className="flex items-center"
                              >
                                <Heart className="w-4 h-4 mr-2" />
                                Je prie pour toi
                              </motion.span>
                            )}
                          </AnimatePresence>
                          <span className="ml-auto flex items-center gap-1 text-sm opacity-80">
                            <Heart className="w-3 h-3 fill-current" />
                            {prayer.prayerCount}
                          </span>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* Empty State */
              <Card className="border-dashed">
                <CardContent className="py-16 text-center">
                  <Search className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="font-serif text-xl font-semibold mb-2">Aucune demande trouvée</h3>
                  <p className="text-muted-foreground mb-6">
                    Essayez de modifier vos critères de recherche.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setCategoryFilter('Tous');
                    }}
                    className="rounded-lg"
                  >
                    Réinitialiser les filtres
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
