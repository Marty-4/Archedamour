import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SESSION_CONFIG } from "@/lib/auth";
import { getSessionUser } from "@/lib/session";

const dateLabel = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" });
const timeLabel = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" });

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request.cookies.get(SESSION_CONFIG.cookieName)?.value);
    if (!user) return NextResponse.json({ message: "Authentification requise." }, { status: 401 });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const profile = await db.memberProfile.findUnique({ where: { userId: user.id }, include: { group: { include: { leader: true, _count: { select: { members: true } } } } } });
    const churchId = profile?.churchId;
    const [services, sermons, prayers, events, announcements, unreadNotifications, donations, dailyVerse, liveStreams] = await Promise.all([
      churchId ? db.service.findMany({ where: { churchId, date: { gte: now }, status: { in: ["SCHEDULED", "ONGOING"] } }, take: 3, orderBy: { date: "asc" }, include: { preacher: true } }) : [],
      churchId ? db.sermon.findMany({ where: { churchId }, take: 3, orderBy: { date: "desc" }, include: { preacher: true, category: true } }) : [],
      churchId ? db.prayerRequest.findMany({ where: { churchId, visibility: "COMMUNITY", isAnswered: false }, take: 5, orderBy: { createdAt: "desc" }, include: { user: true } }) : [],
      churchId ? db.event.findMany({ where: { churchId, date: { gte: now }, status: "PUBLISHED" }, take: 2, orderBy: { date: "asc" }, include: { _count: { select: { registrations: true } } } }) : [],
      churchId ? db.post.findMany({ where: { churchId, type: "ANNOUNCEMENT", visibility: { in: ["PUBLIC", "MEMBERS"] } }, take: 3, orderBy: { createdAt: "desc" }, include: { user: true } }) : [],
      db.notification.count({ where: { userId: user.id, isRead: false } }),
      db.donation.aggregate({ where: { userId: user.id, status: "COMPLETED", paymentDate: { gte: startOfMonth } }, _sum: { amount: true } }),
      db.dailyVerse.findUnique({ where: { date: now.toISOString().slice(0, 10) }, include: { verse: { include: { book: true } } } }),
      churchId ? db.liveStream.findMany({ where: { churchId, status: "LIVE" }, orderBy: { actualStart: "desc" }, take: 3 }) : [],
    ]);
    const nextService = services[0];
    const prayerCount = prayers.reduce((sum, item) => sum + item.prayerCount, 0);

    return NextResponse.json({
      currentUser: { name: user.name ?? "Membre", email: user.email, image: user.avatar, role: user.role },
      dailyVerse: dailyVerse ? { reference: `${dailyVerse.verse.book.name} ${dailyVerse.verse.chapter}:${dailyVerse.verse.verse}` } : { reference: "La parole de Dieu nous éclaire chaque jour." },
      quickStats: [
        { label: "Prochain culte", value: nextService ? dateLabel.format(nextService.date) : "Aucun culte", subvalue: nextService ? `${timeLabel.format(nextService.startTime)} · ${nextService.location ?? "Lieu à définir"}` : "", icon: "service" },
        { label: "Événements à venir", value: events.length.toString(), subvalue: events.length ? `${events.filter((event) => event.date < new Date(now.getTime() + 7 * 86400000)).length} cette semaine` : "Aucun événement programmé", icon: "event" },
        { label: "Prières communautaires", value: prayers.length.toString(), subvalue: `${prayerCount} prières`, icon: "prayer" },
        { label: "Mes dons ce mois", value: `${Math.round(donations._sum.amount ?? 0).toLocaleString("fr-FR")} FCFA`, subvalue: "Dons validés ce mois-ci", icon: "donation" },
      ],
      upcomingServices: services.map((item, index) => ({ id: item.id, title: item.title, time: `${timeLabel.format(item.startTime)} - ${timeLabel.format(item.endTime)}`, date: dateLabel.format(item.date), location: item.location ?? "Lieu à définir", preacher: item.preacher?.name ?? "Prédicateur non renseigné", isNext: index === 0, isLive: item.status === "ONGOING" })),
      recentSermons: sermons.map((item) => ({ id: item.id, title: item.title, category: item.category?.name ?? "Prédication", duration: item.duration ? `${item.duration} min` : "—", preacher: item.preacher.name ?? "Prédicateur", date: dateLabel.format(item.date), plays: "" })),
      prayerRequests: prayers.map((item) => ({ id: item.id, isAnonymous: item.visibility === "PRIVATE", author: item.visibility === "PRIVATE" ? "Anonyme" : item.user.name ?? "Membre", category: item.category, content: item.description ?? item.title, prayersCount: item.prayerCount, date: dateLabel.format(item.createdAt) })),
      myGroup: profile?.group ? { name: profile.group.name, description: profile.group.description ?? "", leader: profile.group.leader?.name ?? "Responsable non renseigné", meetingDay: profile.group.meetingDay ?? "Jour à définir", meetingTime: profile.group.meetingTime ?? "", meetingLocation: profile.group.location ?? "Lieu à définir", membersCount: profile.group._count.members } : null,
      upcomingEvents: events.map((item) => ({ id: item.id, title: item.title, date: dateLabel.format(item.date), category: "Événement", registrations: item._count.registrations, maxRegistrations: item.maxParticipants ?? item._count.registrations })),
      announcements: announcements.map((item) => ({ id: item.id, title: item.content.slice(0, 55), content: item.content, priority: item.isPinned ? "high" : "normal", date: dateLabel.format(item.createdAt), author: item.user.name ?? "Administration" })),
      unreadNotifications,
      liveStreams: liveStreams.map((stream) => ({ id: stream.id, title: stream.title, mediaType: stream.mediaType })),
    });
  } catch (error) {
    console.error("Member dashboard data error", error);
    return NextResponse.json({ message: "Impossible de charger le tableau de bord." }, { status: 500 });
  }
}
