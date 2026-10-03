/**
 * Arche d'Amour Mock Data
 * Realistic French church data for dashboards
 */

// ============================================
// USER PROFILES
// ============================================

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: 'MEMBER' | 'ADMIN' | 'PASTOR';
  phone: string;
  joinDate: string;
  department: string;
  group: string;
}

export const currentUser: UserProfile = {
  id: "usr_001",
  name: "Marie-Claire Moké",
  email: "marie.moke@archedamour.app",
  avatar: null,
  role: "MEMBER",
  phone: "+243 81 234 5678",
  joinDate: "2023-03-15",
  department: "Louange",
  group: "Groupe Maison Lemba"
};

export const adminUser: UserProfile = {
  ...currentUser,
  id: "adm_001",
  name: "Pasteur Lesty Paka",
  email: "Lestypaka@archedamour.app",
  role: "ADMIN",
  department: "Direction",
  group: "Conseil d'Administration"
};

// ============================================
// DAILY VERSE
// ============================================

export const dailyVerse = {
  reference: "Jérémie 29:11",
  text: "Car je connais les projets que j'ai formés sur vous, dit l'Éternel, projets de paix et non de malheur, afin de vous donner un avenir et de l'espérance.",
  reflection: "Aujourd'hui, souviens-toi que Dieu a un plan parfait pour ta vie."
};

// ============================================
// SERVICES (CULTES)
// ============================================

export interface Service {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  preacher: string;
  type: 'dimanche' | 'mercredi' | 'vendredi' | 'special';
  isLive?: boolean;
  isNext?: boolean;
}

export const upcomingServices: Service[] = [
  {
    id: "srv_001",
    title: "Culte de Dimanche - Célébration",
    date: "Dimanche 22 Décembre",
    time: "07:00 - 10:00",
    location: "Temple Principal",
    preacher: "Pasteur Lesty Paka",
    type: "dimanche",
    isLive: true,
    isNext: true
  },
  {
    id: "srv_002",
    title: "Culte de Dimanche - Soirée de Louange",
    date: "Dimanche 22 Décembre",
    time: "11:00 - 13:00",
    location: "Salle des Jeunes",
    preacher: "Frère Emmanuel Nsengi",
    type: "dimanche"
  },
  {
    id: "srv_003",
    title: "Étude Biblique du Mercredi",
    date: "Mercredi 25 Décembre",
    time: "18:00 - 20:00",
    location: "Salle de Réunion A",
    preacher: "Sœur Grace Mutombo",
    type: "mercredi"
  },
  {
    id: "srv_004",
    title: "Prière de Fin de Semaine",
    date: "Vendredi 27 Décembre",
    time: "17:30 - 19:30",
    location: "Temple Principal",
    preacher: "Équipe de Prière",
    type: "vendredi"
  },
  {
    id: "srv_005",
    title: "Veillée de Nouvel An",
    date: "Mardi 31 Décembre",
    time: "22:00 - 01:00",
    location: "Temple Principal",
    preacher: "Pasteur Lesty Paka",
    type: "special"
  }
];

// ============================================
// SERMONS (PRÉDICATIONS)
// ============================================

export interface Sermon {
  id: string;
  title: string;
  preacher: string;
  date: string;
  thumbnail: string;
  duration: string;
  category: string;
  plays: number;
}

export const recentSermons: Sermon[] = [
  {
    id: "ser_001",
    title: "La Paix qui Surpasse Toute Intelligence",
    preacher: "Pasteur Lesty Paka",
    date: "15 Décembre 2024",
    thumbnail: "/api/placeholder/300/180",
    duration: "45:32",
    category: "Paix & Consolation",
    plays: 342
  },
  {
    id: "ser_002",
    title: "Marcher par la Foi et non par la Vue",
    preacher: "Pasteur Armèle",
    date: "08 Décembre 2024",
    thumbnail: "/api/placeholder/300/180",
    duration: "38:15",
    category: "Foi & Confiance",
    plays: 289
  },
  {
    id: "ser_003",
    title: "L'Amour qui Transforme",
    preacher: "Sœur Grace Mutombo",
    date: "01 Décembre 2024",
    thumbnail: "/api/placeholder/300/180",
    duration: "42:08",
    category: "Amour & Relations",
    plays: 256
  }
];

// ============================================
// EVENTS
// ============================================

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  registrations: number;
  maxRegistrations: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  image?: string;
}

export const upcomingEvents: Event[] = [
  {
    id: "evt_001",
    title: "Retraite de Fin d'Année",
    description: "Trois jours de jeûne, prière et enseignement pour clôturer l'année dans la présence de Dieu.",
    date: "28-30 Décembre 2024",
    time: "08:00 - 17:00",
    location: "Centre de Retraite Kinshasa",
    category: "Retraite",
    registrations: 124,
    maxRegistrations: 200,
    status: "upcoming"
  },
  {
    id: "evt_002",
    title: "Soirée des Enfants - Noël",
    description: "Célébration spéciale avec nos enfants : chants, sketches et partage de cadeaux.",
    date: "24 Décembre 2024",
    time: "15:00 - 18:00",
    location: "Salle Polyvalente",
    category: "Enfants",
    registrations: 85,
    maxRegistrations: 150,
    status: "upcoming"
  },
  {
    id: "evt_003",
    title: "Atelier pour Couples",
    description: "Renforcement des mariages selon les principes bibliques.",
    date: "14 Janvier 2025",
    time: "09:00 - 16:00",
    location: "Salle de Conférence",
    category: "Couples",
    registrations: 45,
    maxRegistrations: 60,
    status: "upcoming"
  },
  {
    id: "evt_004",
    title: "Camp des Jeunes 2025",
    description: "Une semaine de fellowship, sport et croissance spirituelle pour les jeunes de 15-25 ans.",
    date: "10-16 Février 2025",
    time: "Toute la journée",
    location: "Domaine N'Sele",
    category: "Jeunesse",
    registrations: 189,
    maxRegistrations: 250,
    status: "upcoming"
  }
];

// ============================================
// PRAYER REQUESTS
// ============================================

export interface PrayerRequest {
  id: string;
  author: string;
  avatar?: string;
  content: string;
  date: string;
  prayersCount: number;
  isAnonymous: boolean;
  category: 'santé' | 'familial' | 'professionnel' | 'spirituel' | 'autre';
}

export const prayerRequests: PrayerRequest[] = [
  {
    id: "pry_001",
    author: "Frère Patrice Mbemba",
    content: "Prières pour ma mère qui est hospitalisée. Les médecins parlent d'une opération délicate. Nous croyons en la guérison divine.",
    date: "Il y a 2 heures",
    prayersCount: 24,
    isAnonymous: false,
    category: "santé"
  },
  {
    id: "pry_002",
    author: "Anonyme",
    content: "Je demande la prière pour mon mariage qui traverse une période difficile. Que Dieu restaure notre union.",
    date: "Il y a 5 heures",
    prayersCount: 31,
    isAnonymous: true,
    category: "familial"
  },
  {
    id: "pry_003",
    author: "Sœur Esther Tshibuabua",
    content: "Action de grâce ! J'ai trouvé un emploi après 8 mois de recherche. Gloire à Dieu !",
    date: "Hier",
    prayersCount: 45,
    isAnonymous: false,
    category: "professionnel"
  },
  {
    id: "pry_004",
    author: "Frère Christian Malonga",
    content: "Priez pour mes études. Je passe mes examens finaux cette semaine. J'ai besoin de concentration et de paix.",
    date: "Hier",
    prayersCount: 18,
    isAnonymous: false,
    category: "spirituel"
  }
];

// ============================================
// GROUPS
// ============================================

export interface Group {
  id: string;
  name: string;
  leader: string;
  membersCount: number;
  meetingDay: string;
  meetingTime: string;
  meetingLocation: string;
  description: string;
  isMember: boolean;
}

export const myGroup: Group = {
  id: "grp_001",
  name: "Groupe Maison Lemba",
  leader: "Diacre François Mukendi",
  membersCount: 18,
  meetingDay: "Jeudi",
  meetingTime: "18:30 - 20:00",
  meetingLocation: "Maison de Sœur Angèle - Quartier Lemba",
  description: "Un groupe familial pour étudier la Parole, prier ensemble et grandir dans la foi.",
  isMember: true
};

// ============================================
// DONATIONS
// ============================================

export interface DonationStats {
  totalThisMonth: number;
  totalLastMonth: number;
  percentageChange: number;
  currency: string;
  breakdown: DonationBreakdown[];
}

export interface DonationBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export const donationStats: DonationStats = {
  totalThisMonth: 3480000,
  totalLastMonth: 2950000,
  percentageChange: 18,
  currency: "FCFA",
  breakdown: [
    { category: "Dîme", amount: 1450000, percentage: 41.7, color: "#7c3aed" },
    { category: "Offrandes", amount: 870000, percentage: 25, color: "#d97706" },
    { category: "Missions", amount: 520000, percentage: 15, color: "#059669" },
    { category: "Projets", amount: 430000, percentage: 12.3, color: "#dc2626" },
    { category: "Autres", amount: 210000, percentage: 6, color: "#6b7280" }
  ]
};

// ============================================
// MEMBER STATISTICS
// ============================================

export interface MemberStats {
  totalMembers: number;
  newThisMonth: number;
  activeMembers: number;
  growthRate: number;
  monthlyGrowth: MonthlyGrowth[];
}

export interface MonthlyGrowth {
  month: string;
  count: number;
  newMembers: number;
}

export const memberStats: MemberStats = {
  totalMembers: 1248,
  newThisMonth: 48,
  activeMembers: 724,
  growthRate: 12,
  monthlyGrowth: [
    { month: "Jan", count: 1080, newMembers: 35 },
    { month: "Fév", count: 1102, newMembers: 28 },
    { month: "Mar", count: 1125, newMembers: 32 },
    { month: "Avr", count: 1148, newMembers: 29 },
    { month: "Mai", count: 1165, newMembers: 22 },
    { month: "Jun", count: 1182, newMembers: 26 },
    { month: "Jul", count: 1195, newMembers: 20 },
    { month: "Aoû", count: 1201, newMembers: 12 },
    { month: "Sep", count: 1218, newMembers: 28 },
    { month: "Oct", count: 1230, newMembers: 18 },
    { month: "Nov", count: 1236, newMembers: 12 },
    { month: "Déc", count: 1248, newMembers: 48 }
  ]
};

// ============================================
// RECENT MEMBERS
// ============================================

export interface RecentMember {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  department: string;
  status: 'active' | 'pending' | 'inactive';
  avatar?: string;
}

export const recentMembers: RecentMember[] = [
  { id: "mbr_001", name: "Jean-Pierre Kasongo", email: "jp.kasongo@email.com", joinDate: "18 Déc 2024", department: "Accueil", status: "active" },
  { id: "mbr_002", name: "Sophie Ngalula", email: "sophie.n@email.com", joinDate: "17 Déc 2024", department: "Enfants", status: "active" },
  { id: "mbr_003", name: "Marc Ilunga", email: "marc.ilunga@email.com", joinDate: "16 Déc 2024", department: "Louange", status: "pending" },
  { id: "mbr_004", name: "Patricia Kabinda", email: "p.kabinda@email.com", joinDate: "15 Déc 2024", department: "Médias", status: "active" },
  { id: "mbr_005", name: "Emmanuel Tshisekedi", email: "e.tshisekedi@email.com", joinDate: "14 Déc 2024", department: "Intercession", status: "active" }
];

// ============================================
// ANNOUNCEMENTS
// ============================================

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  priority: 'high' | 'normal' | 'low';
  author: string;
}

export const announcements: Announcement[] = [
  {
    id: "ann_001",
    title: "Horaires Spéciaux de Noël",
    content: "Le culte du 25 décembre débutera à 06h00 au lieu de 07h00. Venez nombreux célébrer la naissance de notre Seigneur!",
    date: "Aujourd'hui",
    priority: "high",
    author: "Secrétariat"
  },
  {
    id: "ann_002",
    title: "Inscription Camp des Jeunes",
    content: "Les inscriptions pour le camp des jeunes sont ouvertes jusqu'au 5 janvier. Frais de participation: 50,000 FCFA.",
    date: "Hier",
    priority: "normal",
    author: "Département Jeunesse"
  },
  {
    id: "ann_003",
    title: "Réunion Bénévoles",
    content: "Tous les bénévoles sont conviqués à une réunion de coordination samedi prochain à 09h00.",
    date: "Il y a 2 jours",
    priority: "low",
    author: "Coordination"
  }
];

// ============================================
// ACTIVITY FEED
// ============================================

export interface ActivityItem {
  id: string;
  type: 'member_join' | 'donation' | 'prayer_request' | 'event_registration' | 'sermon_upload' | 'group_created';
  description: string;
  timestamp: string;
  icon: string;
  user?: string;
}

export const activityFeed: ActivityItem[] = [
  {
    id: "act_001",
    type: "member_join",
    description: "Nouveau membre inscrit: Sophie Ngalula",
    timestamp: "Il y a 30 minutes",
    icon: "user-plus",
    user: "Sophie N."
  },
  {
    id: "act_002",
    type: "donation",
    description: "Don reçu de 50,000 FCFA - Dîme",
    timestamp: "Il y a 1 heure",
    icon: "heart",
    user: "Marc I."
  },
  {
    id: "act_003",
    type: "prayer_request",
    description: "Nouvelle demande de prière publiée",
    timestamp: "Il y a 2 heures",
    icon: "pray"
  },
  {
    id: "act_004",
    type: "event_registration",
    description: "Inscription à la Retraite de Fin d'Année (+3)",
    timestamp: "Il y a 3 heures",
    icon: "calendar"
  },
  {
    id: "act_005",
    type: "sermon_upload",
    description: "Nouvelle prédication disponible: 'La Paix qui Surpasse'",
    timestamp: "Hier",
    icon: "mic"
  },
  {
    id: "act_006",
    type: "donation",
    description: "Don reçu de 200,000 FCFA - Projet Église",
    timestamp: "Hier",
    icon: "heart",
    user: "Anonyme"
  },
  {
    id: "act_007",
    type: "member_join",
    description: "Nouveau membre inscrit: Emmanuel Tshisekedi",
    timestamp: "Il y a 2 jours",
    icon: "user-plus",
    user: "Emmanuel T."
  }
];

// ============================================
// NOTIFICATIONS
// ============================================

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'reminder';
  read: boolean;
  date: string;
  link?: string;
}

export const notifications: Notification[] = [
  {
    id: "not_001",
    title: "Rappel Culte",
    message: "Le culte de demain commence à 07h00 au Temple Principal.",
    type: "reminder",
    read: false,
    date: "Il y a 10 minutes",
    link: "/cultes"
  },
  {
    id: "not_002",
    title: "Nouvelle Prédication",
    message: "La dernière prédication du Pasteur Lumbu est maintenant disponible.",
    type: "info",
    read: false,
    date: "Il y a 1 heure",
    link: "/predications"
  },
  {
    id: "not_003",
    title: "Demande de Prière",
    message: "Quelqu'un a besoin de vos prières. Rejoignez la communauté!",
    type: "info",
    read: true,
    date: "Il y a 3 heures",
    link: "/prieres"
  },
  {
    id: "not_004",
    title: "Événement Bientôt",
    message: "La Retraite de Fin d'Année commence dans 6 jours. Inscrivez-vous!",
    type: "reminder",
    read: true,
    date: "Hier",
    link: "/evenements"
  }
];

// ============================================
// ADMIN STATS CARDS DATA
// ============================================

export interface AdminStatCard {
  label: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: string;
  color: string;
}

export const adminStatCards: AdminStatCard[] = [
  {
    label: "Total Membres",
    value: "1,248",
    change: 12,
    changeLabel: "vs mois dernier",
    icon: "users",
    color: "violet"
  },
  {
    label: "Nouveaux ce mois",
    value: "48",
    change: 5,
    changeLabel: "vs mois dernier",
    icon: "user-plus",
    color: "emerald"
  },
  {
    label: "Dons du mois",
    value: "3,480,000 FCFA",
    change: 18,
    changeLabel: "vs mois dernier",
    icon: "credit-card",
    color: "gold"
  },
  {
    label: "Événements actifs",
    value: "12",
    change: 3,
    changeLabel: "ce mois-ci",
    icon: "calendar-days",
    color: "blue"
  },
  {
    label: "Demandes de prière",
    value: "86",
    change: -8,
    changeLabel: "vs semaine dernière",
    icon: "heart",
    color: "rose"
  },
  {
    label: "Participation active",
    value: "724",
    change: 4,
    changeLabel: "ce mois-ci",
    icon: "activity",
    color: "teal"
  }
];
