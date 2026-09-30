import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SESSION_CONFIG } from "@/lib/auth";
import { getSessionUser, hasAdminAccess } from "@/lib/session";

const monthLabel = new Intl.DateTimeFormat("fr-FR", { month: "short" });
const dateLabel = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request.cookies.get(SESSION_CONFIG.cookieName)?.value);
    if (!user) return NextResponse.json({ message: "Authentification requise." }, { status: 401 });
    if (!hasAdminAccess(user.role)) return NextResponse.json({ message: "Accès administrateur requis." }, { status: 403 });
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const [totalMembers, activeMembers, recentMembers, events, prayers, donations, membersForGrowth, recentDonations, recentPrayers, recentRegistrations, recentSermons] = await Promise.all([
      db.memberProfile.count(),
      db.memberProfile.count({ where: { status: "ACTIVE" } }),
      db.memberProfile.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { user: { select: { email: true } }, department: { select: { name: true } } } }),
      db.event.findMany({ where: { date: { gte: now }, status: "PUBLISHED" }, take: 5, orderBy: { date: "asc" }, include: { _count: { select: { registrations: true } } } }),
      db.prayerRequest.count({ where: { isAnswered: false } }),
      db.donation.findMany({ where: { status: "COMPLETED", paymentDate: { gte: startOfPreviousMonth } }, include: { category: { select: { name: true } } } }),
      db.memberProfile.findMany({ where: { createdAt: { gte: twelveMonthsAgo } }, select: { createdAt: true } }),
      db.donation.findMany({ where: { status: "COMPLETED" }, take: 5, orderBy: { paymentDate: "desc" }, include: { user: { select: { name: true } } } }),
      db.prayerRequest.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { user: { select: { name: true } } } }),
      db.eventRegistration.findMany({ take: 5, orderBy: { registeredAt: "desc" }, include: { user: { select: { name: true } }, event: { select: { title: true } } } }),
      db.sermon.findMany({ take: 5, orderBy: { createdAt: "desc" }, select: { title: true, createdAt: true, preacher: { select: { name: true } } } }),
    ]);

    const currentDonations = donations.filter((donation) => donation.paymentDate >= startOfMonth);
    const previousDonations = donations.filter((donation) => donation.paymentDate < startOfMonth);
    const currentTotal = currentDonations.reduce((sum, donation) => sum + donation.amount, 0);
    const previousTotal = previousDonations.reduce((sum, donation) => sum + donation.amount, 0);
    const donationChange = previousTotal ? Math.round(((currentTotal - previousTotal) / previousTotal) * 100) : 0;
    const categoryTotals = new Map<string, number>();
    currentDonations.forEach((donation) => categoryTotals.set(donation.category.name, (categoryTotals.get(donation.category.name) ?? 0) + donation.amount));

    const monthlyGrowth = Array.from({ length: 12 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - 11 + index, 1);
      const next = new Date(date.getFullYear(), date.getMonth() + 1, 1);
      const newMembers = membersForGrowth.filter(({ createdAt }) => createdAt >= date && createdAt < next).length;
      const count = membersForGrowth.filter(({ createdAt }) => createdAt < next).length;
      return { month: monthLabel.format(date), count, newMembers };
    });
    const firstPeriod = monthlyGrowth.slice(0, 6).reduce((sum, item) => sum + item.newMembers, 0);
    const lastPeriod = monthlyGrowth.slice(6).reduce((sum, item) => sum + item.newMembers, 0);
    const growthRate = firstPeriod ? Math.round(((lastPeriod - firstPeriod) / firstPeriod) * 100) : lastPeriod ? 100 : 0;

    const activities = [
      ...recentDonations.map((item) => ({ id: `donation-${item.id}`, type: "donation", description: `Don de ${Math.round(item.amount).toLocaleString("fr-FR")} FCFA enregistré`, timestamp: item.paymentDate.toISOString(), user: item.user.name ?? "Membre" })),
      ...recentPrayers.map((item) => ({ id: `prayer-${item.id}`, type: "prayer_request", description: `Nouvelle demande de prière : ${item.title}`, timestamp: item.createdAt.toISOString(), user: item.user.name ?? "Membre" })),
      ...recentRegistrations.map((item) => ({ id: `registration-${item.id}`, type: "event_registration", description: `Inscription à l'événement « ${item.event.title} »`, timestamp: item.registeredAt.toISOString(), user: item.user.name ?? "Membre" })),
      ...recentSermons.map((item) => ({ id: `sermon-${item.title}-${item.createdAt.toISOString()}`, type: "sermon_upload", description: `Prédication ajoutée : ${item.title}`, timestamp: item.createdAt.toISOString(), user: item.preacher.name ?? "" })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);

    return NextResponse.json({
      adminUser: { name: user.name ?? "Administration", email: user.email, avatar: user.avatar, role: user.role },
      adminStatCards: [
        { label: "Membres", value: totalMembers.toLocaleString("fr-FR"), change: growthRate, changeLabel: "sur les 6 derniers mois", icon: "users", color: "violet" },
        { label: "Membres actifs", value: activeMembers.toLocaleString("fr-FR"), change: totalMembers ? Math.round((activeMembers / totalMembers) * 100) : 0, changeLabel: "du total", icon: "user-plus", color: "emerald" },
        { label: "Dons ce mois", value: `${Math.round(currentTotal).toLocaleString("fr-FR")} FCFA`, change: donationChange, changeLabel: "vs mois dernier", icon: "credit-card", color: "gold" },
        { label: "Événements à venir", value: events.length.toString(), change: 0, changeLabel: "publiés", icon: "calendar-days", color: "blue" },
        { label: "Prières en attente", value: prayers.toLocaleString("fr-FR"), change: 0, changeLabel: "non exaucées", icon: "heart", color: "rose" },
        { label: "Activités récentes", value: activities.length.toString(), change: 0, changeLabel: "dernières actions", icon: "activity", color: "teal" },
      ],
      memberStats: { monthlyGrowth, growthRate },
      donationStats: { percentageChange: donationChange, breakdown: [...categoryTotals.entries()].map(([category, amount]) => ({ category, amount, percentage: currentTotal ? Math.round((amount / currentTotal) * 100) : 0 })) },
      recentMembers: recentMembers.map((member) => ({ id: member.id, name: `${member.firstName} ${member.lastName}`, email: member.user.email, joinDate: dateLabel.format(member.membershipDate ?? member.createdAt), department: member.department?.name ?? "Non assigné", status: member.status.toLowerCase() })),
      upcomingEvents: events.map((event) => ({ id: event.id, title: event.title, location: event.location ?? "Lieu à définir", date: dateLabel.format(event.date), registrations: event._count.registrations, maxRegistrations: event.maxParticipants ?? Math.max(event._count.registrations, 1), status: "upcoming" })),
      activityFeed: activities,
    });
  } catch (error) {
    console.error("Admin dashboard data error", error);
    return NextResponse.json({ message: "Impossible de charger le tableau de bord." }, { status: 500 });
  }
}
