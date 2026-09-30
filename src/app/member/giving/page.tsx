'use client';

import React, { useState } from 'react';
import { motion } from '@/lib/no-motion';
import {
  Heart,
  Download,
  TrendingUp,
  Calendar,
  CreditCard,
  Smartphone,
  Landmark,
  FileText,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Types
type DonationCategory = 'Dîme' | 'Offrande' | 'Don' | 'Mission' | 'Construction' | 'Projet' | 'Autre';
type PaymentMethod = 'Carte bancaire' | 'MTN Mobile Money' | 'Orange Money' | 'Virement';
type DonationStatus = 'Complété' | 'En attente' | 'Échoué';

interface DonationRecord {
  id: string;
  date: string;
  category: DonationCategory;
  amount: number;
  method: PaymentMethod;
  status: DonationStatus;
  reference: string;
}

interface MonthlyData {
  month: string;
  amount: number;
  count: number;
}

// Mock data
const donationHistory: DonationRecord[] = [
  {
    id: 'don_001',
    date: '15 Décembre 2024',
    category: 'Dîme',
    amount: 150000,
    method: 'Carte bancaire',
    status: 'Complété',
    reference: 'DON-2024-1215-001',
  },
  {
    id: 'don_002',
    date: '10 Décembre 2024',
    category: 'Offrande',
    amount: 25000,
    method: 'Orange Money',
    status: 'Complété',
    reference: 'DON-2024-1210-002',
  },
  {
    id: 'don_003',
    date: '1 Décembre 2024',
    category: 'Dîme',
    amount: 150000,
    method: 'Virement',
    status: 'Complété',
    reference: 'DON-2024-1201-003',
  },
  {
    id: 'don_004',
    date: '25 Novembre 2024',
    category: 'Mission',
    amount: 50000,
    method: 'MTN Mobile Money',
    status: 'Complété',
    reference: 'DON-2024-1125-004',
  },
  {
    id: 'don_005',
    date: '15 Novembre 2024',
    category: 'Dîme',
    amount: 150000,
    method: 'Carte bancaire',
    status: 'Complété',
    reference: 'DON-2024-1115-005',
  },
  {
    id: 'don_006',
    date: '10 Novembre 2024',
    category: 'Construction',
    amount: 100000,
    method: 'Virement',
    status: 'En attente',
    reference: 'DON-2024-1110-006',
  },
  {
    id: 'don_007',
    date: '1 Novembre 2024',
    category: 'Dîme',
    amount: 150000,
    method: 'Carte bancaire',
    status: 'Complété',
    reference: 'DON-2024-1101-007',
  },
  {
    id: 'don_008',
    date: '28 Octobre 2024',
    category: 'Offrande',
    amount: 20000,
    method: 'Orange Money',
    status: 'Échoué',
    reference: 'DON-2024-1028-008',
  },
  {
    id: 'don_009',
    date: '15 Octobre 2024',
    category: 'Dîme',
    amount: 140000,
    method: 'Carte bancaire',
    status: 'Complété',
    reference: 'DON-2024-1015-009',
  },
  {
    id: 'don_010',
    date: '1 Octobre 2024',
    category: 'Dîme',
    amount: 140000,
    method: 'Virement',
    status: 'Complété',
    reference: 'DON-2024-1001-010',
  },
];

const monthlyData: MonthlyData[] = [
  { month: 'Juin', amount: 175000, count: 2 },
  { month: 'Juil.', amount: 175000, count: 2 },
  { month: 'Août', amount: 165000, count: 2 },
  { month: 'Sept.', amount: 190000, count: 3 },
  { month: 'Oct.', amount: 310000, count: 3 },
  { month: 'Nov.', amount: 420000, count: 4 },
  { month: 'Déc.', amount: 325000, count: 3 },
];

const categoryColors: Record<DonationCategory, string> = {
  'Dîme': 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  'Offrande': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'Don': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'Mission': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Construction': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  'Projet': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  'Autre': 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
};

const statusConfig: Record<DonationStatus, { icon: React.ElementType; color: string; bgColor: string }> = {
  'Complété': { icon: CheckCircle2, color: 'text-emerald-600', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30' },
  'En attente': { icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-900/30' },
  'Échoué': { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30' },
};

const methodIcons: Record<PaymentMethod, React.ElementType> = {
  'Carte bancaire': CreditCard,
  'MTN Mobile Money': Smartphone,
  'Orange Money': Smartphone,
  'Virement': Landmark,
};

export default function MemberGivingPage() {
  const [statusFilter, setStatusFilter] = useState<string>('Tous');
  const [categoryFilter, setCategoryFilter] = useState<string>('Tous');

  // Calculate stats
  const totalThisMonth = donationHistory
    .filter((d) => d.date.includes('Décembre'))
    .filter((d) => d.status === 'Complété')
    .reduce((sum, d) => sum + d.amount, 0);

  const totalAllTime = donationHistory
    .filter((d) => d.status === 'Complété')
    .reduce((sum, d) => sum + d.amount, 0);

  const donationCount = donationHistory.filter((d) => d.status === 'Complété').length;

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR') + ' FCFA'.replace('NaN', new Intl.NumberFormat('fr-FR').format(amount));
  };

  const filteredDonations = donationHistory.filter((d) => {
    const matchesStatus = statusFilter === 'Tous' || d.status === statusFilter;
    const matchesCategory = categoryFilter === 'Tous' || d.category === categoryFilter;
    return matchesStatus && matchesCategory;
  });

  // Simple bar chart component
  const maxAmount = Math.max(...monthlyData.map((m) => m.amount));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Mes Dons"
          description="Suivez votre historique de dons et gérez vos contributions."
          actions={
            <Button variant="outline" className="rounded-lg">
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
          }
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Total This Month */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl gradient-spiritual flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    +12%
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">Ce mois-ci</p>
                <p className="font-serif text-2xl font-bold text-foreground">
                  {new Intl.NumberFormat('fr-FR').format(totalThisMonth)} FCFA
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Total All Time */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Actif
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">Total donné</p>
                <p className="font-serif text-2xl font-bold text-foreground">
                  {new Intl.NumberFormat('fr-FR').format(totalAllTime)} FCFA
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Number of Donations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="overflow-hidden sm:col-span-2 lg:col-span-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1">Nombre de dons</p>
                <p className="font-serif text-2xl font-bold text-foreground">
                  {donationCount} dons
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Monthly Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-primary" />
                Tendances Mensuelles
              </CardTitle>
              <CardDescription>
                Évolution de vos dons sur les 7 derniers mois
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end gap-3 px-4">
                {monthlyData.map((data, index) => (
                  <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                    <div className="relative w-full flex items-end justify-center" style={{ height: '180px' }}>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(data.amount / maxAmount) * 100}%` }}
                        transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                        className={`w-full max-w-[50px] rounded-t-lg gradient-spiritual relative group cursor-pointer`}
                        style={{ minHeight: '8px' }}
                      >
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                          <div className="bg-background border shadow-lg rounded-lg p-2 whitespace-nowrap">
                            <p className="font-semibold">{new Intl.NumberFormat('fr-FR').format(data.amount)} FCFA</p>
                            <p className="text-xs text-muted-foreground">{data.count} dons</p>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">{data.month}</span>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm gradient-spiritual" />
                  <span className="text-xs text-muted-foreground">Montant des dons (FCFA)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Donation History Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="w-5 h-5 text-primary" />
                    Historique des Dons
                  </CardTitle>
                  <CardDescription>
                    {filteredDonations.length} enregistrement{filteredDonations.length > 1 ? 's' : ''} trouvé{filteredDonations.length > 1 ? 's' : ''}
                  </CardDescription>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px] rounded-lg">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tous">Tous</SelectItem>
                      <SelectItem value="Complété">Complétés</SelectItem>
                      <SelectItem value="En attente">En attente</SelectItem>
                      <SelectItem value="Échoué">Échoués</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[140px] rounded-lg">
                      <SelectValue placeholder="Catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tous">Toutes</SelectItem>
                      <SelectItem value="Dîme">Dîme</SelectItem>
                      <SelectItem value="Offrande">Offrande</SelectItem>
                      <SelectItem value="Don">Don</SelectItem>
                      <SelectItem value="Mission">Mission</SelectItem>
                      <SelectItem value="Construction">Construction</SelectItem>
                      <SelectItem value="Projet">Projet</SelectItem>
                      <SelectItem value="Autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-6 px-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Méthode</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Reçu</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDonations.length > 0 ? (
                      filteredDonations.map((donation) => {
                        const StatusIcon = statusConfig[donation.status].icon;
                        const MethodIcon = methodIcons[donation.method];
                        
                        return (
                          <TableRow key={donation.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium text-foreground">{donation.date}</p>
                                <p className="text-xs text-muted-foreground">{donation.reference}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className={`${categoryColors[donation.category]}`}>
                                {donation.category}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <p className="font-semibold text-foreground">
                                {new Intl.NumberFormat('fr-FR').format(donation.amount)} FCFA
                              </p>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <MethodIcon className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">{donation.method}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="secondary" 
                                className={`${statusConfig[donation.status].bgColor} ${statusConfig[donation.status].color}`}
                              >
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {donation.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {donation.status === 'Complété' ? (
                                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                                  <Download className="w-4 h-4" />
                                  <span className="sr-only">Télécharger le reçu</span>
                                </Button>
                              ) : (
                                <span className="text-muted-foreground text-sm">—</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                          <p className="text-muted-foreground">Aucun don trouvé pour ces filtres.</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="border-dashed bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/10">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <h3 className="font-semibold text-foreground mb-1">Faire un nouveau don</h3>
                <p className="text-sm text-muted-foreground">
                  Soutenir l&apos;œuvre de Dieu avec un don supplémentaire.
                </p>
              </div>
              <Button asChild className="gradient-spiritual text-white hover:opacity-90 rounded-lg whitespace-nowrap">
                <a href="/give">
                  <Heart className="w-4 h-4 mr-2" />
                  Faire un don
                  <ExternalLink className="ml-2 w-4 h-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
