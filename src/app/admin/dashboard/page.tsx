"use client";

import React, { useEffect, useState } from "react";
import { motion } from '@/lib/no-motion';
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  UserPlus,
  CreditCard,
  CalendarDays,
  Heart,
  Activity,
  TrendingUp,
  TrendingDown,
  Bell,
  Search,
  Download,
  Filter,
  ArrowRight,
  Clock,
  Calendar,
  Mic,
  Gift,
  UserCheck,
  AlertCircle,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { LiveStartedToast } from "@/components/shared/live-started-toast";

// Recharts imports
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
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

// Color palette for charts
const CHART_COLORS = {
  violet: "#7c3aed",
  gold: "#d97706",
  emerald: "#059669",
  rose: "#dc2626",
  blue: "#2563eb",
  teal: "#0d9488",
  gray: "#6b7280",
};

// Icon mapping for stat cards
const iconMap: Record<string, React.ElementType> = {
  users: Users,
  "user-plus": UserPlus,
  "credit-card": CreditCard,
  "calendar-days": CalendarDays,
  heart: Heart,
  activity: Activity,
};

// Color mapping for stat cards
const colorMap: Record<string, string> = {
  violet: "from-violet-500 to-violet-600",
  emerald: "from-emerald-500 to-emerald-600",
  gold: "from-amber-500 to-amber-600",
  blue: "from-blue-500 to-blue-600",
  rose: "from-rose-500 to-rose-600",
  teal: "from-teal-500 to-teal-600",
};

const bgColorMap: Record<string, string> = {
  violet: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  gold: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  rose: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  teal: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
};

// ============================================
// ADMIN STATS CARDS COMPONENT
// ============================================
function AdminStatsCards({ stats }: { stats: any[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {stats.map((stat, index) => {
        const Icon = iconMap[stat.icon] || Activity;
        const isPositive = stat.change >= 0;

        return (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.08 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300 border-border/50 group">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${bgColorMap[stat.color]}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                    isPositive 
                      ? 'text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30' 
                      : 'text-rose-700 bg-rose-100 dark:text-rose-400 dark:bg-rose-900/30'
                  }`}>
                    {isPositive ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {Math.abs(stat.change)}%
                  </div>
                </div>
                <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                <p className="text-[10px] text-muted-foreground/70 mt-0.5">{stat.changeLabel}</p>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

// ============================================
// MEMBERSHIP GROWTH CHART COMPONENT
// ============================================
function MembershipGrowthChart({ memberStats }: { memberStats: any }) {
  const data = memberStats.monthlyGrowth.map((item: any) => ({
    month: item.month,
    membres: item.count,
    nouveaux: item.newMembers,
  }));

  return (
    <motion.div variants={itemVariants}>
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Croissance des Membres
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Évolution sur les 12 derniers mois
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-xs">
              +{memberStats.growthRate}% cette année
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMembres" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.violet} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={CHART_COLORS.violet} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorNouveaux" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.gold} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={CHART_COLORS.gold} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }} 
                  className="text-muted-foreground"
                  axisLine={{ stroke: 'var(--border)' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }} 
                  className="text-muted-foreground"
                  axisLine={{ stroke: 'var(--border)' }}
                  tickLine={false}
                />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: 'var(--foreground)', fontWeight: 600 }}
                />
                <Area
                  type="monotone"
                  dataKey="membres"
                  name="Total Membres"
                  stroke={CHART_COLORS.violet}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorMembres)"
                />
                <Area
                  type="monotone"
                  dataKey="nouveaux"
                  name="Nouveaux Membres"
                  stroke={CHART_COLORS.gold}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorNouveaux)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================
// DONATIONS PIE CHART COMPONENT
// ============================================
function DonationsPieChart({ donationStats }: { donationStats: any }) {
  const data = donationStats.breakdown.map(item => ({
    name: item.category,
    value: item.amount,
    percentage: item.percentage,
  }));

  return (
    <motion.div variants={itemVariants}>
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Gift className="h-5 w-5 text-amber-500" />
                Dons par Catégorie
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Répartition des dons ce mois-ci
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
              +{donationStats.percentageChange}% vs mois dernier
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={
                        [CHART_COLORS.violet, CHART_COLORS.gold, CHART_COLORS.emerald, CHART_COLORS.rose, CHART_COLORS.gray][index]
                      }
                      stroke="none"
                    />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [
                    `${new Intl.NumberFormat('fr-FR').format(value)} FCFA`,
                    'Montant'
                  ]}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => <span className="text-xs">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend with amounts */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            {data.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <span 
                  className="w-3 h-3 rounded-full shrink-0" 
                  style={{ 
                    backgroundColor: [CHART_COLORS.violet, CHART_COLORS.gold, CHART_COLORS.emerald, CHART_COLORS.rose, CHART_COLORS.gray][index]
                  }}
                />
                <span className="text-muted-foreground truncate">{item.name}</span>
                <span className="font-medium ml-auto">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================
// RECENT MEMBERS TABLE COMPONENT
// ============================================
function RecentMembersTable({ recentMembers }: { recentMembers: any[] }) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 text-[10px]">Actif</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-[10px]">En attente</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="text-[10px]">Inactif</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">{status}</Badge>;
    }
  };

  return (
    <motion.div variants={itemVariants}>
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-emerald-500" />
              Membres Récents
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/membres" className="text-xs">
                Voir tout <ChevronRight className="h-3 w-3 ml-1 inline" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-medium">Membre</TableHead>
                <TableHead className="text-xs font-medium hidden md:table-cell">Email</TableHead>
                <TableHead className="text-xs font-medium">Inscription</TableHead>
                <TableHead className="text-xs font-medium hidden lg:table-cell">Département</TableHead>
                <TableHead className="text-xs font-medium">Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentMembers.map((member) => (
                <TableRow key={member.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">{member.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                    {member.email}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {member.joinDate}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Badge variant="outline" className="text-[10px]">{member.department}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(member.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================
// UPCOMING EVENTS TABLE COMPONENT
// ============================================
function UpcomingEventsTable({ upcomingEvents }: { upcomingEvents: any[] }) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge variant="default" className="bg-blue-500 hover:bg-blue-600 text-[10px]">À venir</Badge>;
      case 'ongoing':
        return <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 text-[10px]">En cours</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="text-[10px]">Terminé</Badge>;
      case 'cancelled':
        return <Badge variant="destructive" className="text-[10px]">Annulé</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">{status}</Badge>;
    }
  };

  return (
    <motion.div variants={itemVariants}>
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-blue-500" />
              Événements à Venir
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/evenements" className="text-xs">
                Voir tout <ChevronRight className="h-3 w-3 ml-1 inline" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-medium">Événement</TableHead>
                <TableHead className="text-xs font-medium hidden sm:table-cell">Date</TableHead>
                <TableHead className="text-xs font-medium hidden md:table-cell">Inscriptions</TableHead>
                <TableHead className="text-xs font-medium">Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcomingEvents.slice(0, 5).map((event) => (
                <TableRow key={event.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm truncate max-w-[180px]">{event.title}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[180px]">{event.location}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground hidden sm:table-cell whitespace-nowrap">
                    {event.date}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${(event.registrations / event.maxRegistrations) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {event.registrations}/{event.maxRegistrations}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(event.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================
// ACTIVITY FEED COMPONENT
// ============================================
function ActivityFeed({ activityFeed }: { activityFeed: any[] }) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'member_join':
        return <UserPlus className="h-4 w-4 text-emerald-500" />;
      case 'donation':
        return <Gift className="h-4 w-4 text-amber-500" />;
      case 'prayer_request':
        return <Heart className="h-4 w-4 text-rose-500" />;
      case 'event_registration':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'sermon_upload':
        return <Mic className="h-4 w-4 text-violet-500" />;
      case 'group_created':
        return <Users className="h-4 w-4 text-teal-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <motion.div variants={itemVariants}>
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Activité Récente
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-xs">
              Voir tout <ChevronRight className="h-3 w-3 ml-1 inline" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
            {activityFeed.map((activity, index) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="mt-0.5 p-2 rounded-lg bg-muted shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0 pb-4 border-b border-border/50 last:border-0 last:pb-0">
                  <p className="text-sm">{activity.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                    {activity.user && (
                      <>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs font-medium text-primary">{activity.user}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================
// MAIN ADMIN DASHBOARD PAGE
// ============================================
const emptyDashboard = {
  adminUser: { name: "Administration", email: "", avatar: null, role: "ADMIN" }, adminStatCards: [],
  memberStats: { monthlyGrowth: [], growthRate: 0 }, donationStats: { breakdown: [], percentageChange: 0 },
  recentMembers: [], upcomingEvents: [], activityFeed: [],
};

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<any>(emptyDashboard);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((response) => {
        if (response.status === 401) { router.replace("/login"); return Promise.reject(new Error("Session expirée")); }
        if (response.status === 403) { router.replace("/member/dashboard"); return Promise.reject(new Error("Accès refusé")); }
        return response.ok ? response.json() : Promise.reject(new Error("Dashboard indisponible"));
      })
      .then(setDashboard)
      .catch(() => {
        // Erreur déjà reflétée par l'UI (état vide) — pas de bruit en console.
      })
      .finally(() => setLoading(false));
  }, [router]);

  const { adminUser, adminStatCards, memberStats, donationStats, recentMembers, upcomingEvents, activityFeed } = dashboard;
  const firstName = adminUser.name.split(' ')[0];

  return (
    <DashboardLayout user={adminUser} variant="admin">
      <LiveStartedToast target="/admin/live-studio" />
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 ring-2 ring-amber-500/30">
              <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white text-lg font-semibold">
                {firstName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold font-serif">
                  Bonjour, {firstName}!
                </h1>
                <Badge className="bg-amber-500 hover:bg-amber-600 text-[10px]">
                  Admin
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {loading ? "Chargement des données…" : "Panneau d’administration"} • {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filtrer</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Exporter</span>
            </Button>
          </div>
        </motion.div>

        {/* Statistics Overview */}
        <AdminStatsCards stats={adminStatCards} />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MembershipGrowthChart memberStats={memberStats} />
          <DonationsPieChart donationStats={donationStats} />
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentMembersTable recentMembers={recentMembers} />
          <UpcomingEventsTable upcomingEvents={upcomingEvents} />
        </div>

        {/* Activity Feed */}
        <ActivityFeed activityFeed={activityFeed} />
      </motion.div>
    </DashboardLayout>
  );
}
