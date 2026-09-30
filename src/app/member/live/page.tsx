import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CalendarDays, Clock3, Eye, PlayCircle, Radio, Video } from "lucide-react";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LivePlayer } from "@/components/member/live-player";
import { AudioCallRoom } from "@/components/member/audio-call-room";
import { LiveChat } from "@/components/member/live-chat";

import { db } from "@/lib/db";
import { SESSION_CONFIG } from "@/lib/auth";
import { getSessionUser } from "@/lib/session";
import { resolveChurchIdForUser } from "@/lib/church";

export const dynamic = "force-dynamic";

const platformLabels: Record<string, string> = {
  INTERNAL: "Dans l'application",
  YOUTUBE: "YouTube",
  FACEBOOK: "Facebook",
  RTMP: "RTMP",
  OTHER: "Autre",
};


export default async function MemberLivePage() {
  const sessionUser = await getSessionUser(
    (await cookies()).get(SESSION_CONFIG.cookieName)?.value,
  );

  if (!sessionUser) {
    redirect("/login");
  }

  const user = sessionUser;

  // Fallback : un membre sans profil rattaché voit quand même les contenus
  // de l'église par défaut (sinon « Aucune diffusion » même en direct).
  const churchId = await resolveChurchIdForUser(user.id);

  const streams = churchId
    ? await db.liveStream.findMany({
        where: { churchId },
        orderBy: [{ status: "asc" }, { scheduledStart: "desc" }],
        take: 50,
      })
    : [];

  const liveStreams = streams.filter((stream) => stream.status === "LIVE");
  const upcomingStreams = streams.filter((stream) => stream.status === "SCHEDULED");
  const pastStreams = streams.filter(
    (stream) => stream.status === "ENDED" || stream.status === "CANCELLED",
  );

  const formatDateTime = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "full",
    timeStyle: "short",
  });
  const formatDate = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
  });

  const featured = liveStreams[0];
  const otherLive = liveStreams.slice(1);

  return (
    <DashboardLayout
      variant="member"
      user={{
        name: user.name,
        email: user.email,
        image: user.avatar,
        role: user.role,
      }}
    >
      <div className="space-y-8">
        {/* HEADER */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Radio className="h-6 w-6" />
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Espace membre</p>
              <h1 className="font-serif text-3xl font-bold tracking-tight">Live</h1>
              <p className="mt-1 text-muted-foreground">
                Suivez les cultes et événements en direct, où que vous soyez.
              </p>
            </div>
          </div>

          <Badge variant="outline" className="w-fit rounded-full px-4 py-2">
            {liveStreams.length > 0
              ? `${liveStreams.length} direct${liveStreams.length > 1 ? "s" : ""} en cours`
              : "Aucun direct en cours"}
          </Badge>
        </div>

        {/* DIRECT PRINCIPAL — grand lecteur + chat temps réel */}
        {featured ? (
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">
                <span className="h-2 w-2 animate-pulse rounded-full bg-white" /> EN DIRECT
              </span>
              <h2 className="font-serif text-xl font-semibold">{featured.title}</h2>
            </div>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-4">
                <div className="overflow-hidden rounded-3xl border border-red-500/30 shadow-xl">
                  {featured.platform === "INTERNAL" ? (
                    <LivePlayer
                      streamId={featured.id}
                      mediaType={featured.mediaType}
                      title={featured.title}
                      startedAt={featured.actualStart ?? featured.scheduledStart}
                    />
                  ) : (
                    <div className="relative aspect-video bg-gradient-to-br from-violet-600/20 via-primary/10 to-transparent">
                      {featured.thumbnail ? (
                        <img
                          src={featured.thumbnail}
                          alt={featured.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Radio className="h-14 w-14 animate-pulse text-red-500" />
                        </div>
                      )}
                      <span className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-white" /> EN DIRECT
                      </span>
                      {featured.viewerCount > 0 && (
                        <Badge className="absolute right-3 top-3 gap-1 border-0 bg-black/70 px-2 py-1 text-white">
                          <Eye className="h-3 w-3" />
                          {featured.viewerCount.toLocaleString("fr-FR")}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {featured.description && (
                  <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                    {featured.description}
                  </p>
                )}

                {/* Direct AUDIO = appel à deux sens : tout le monde peut
                    parler, l'animateur voit tous les participants. */}
                {featured.mediaType === "AUDIO" && (
                  <AudioCallRoom streamId={featured.id} displayName={user.name ?? undefined} />
                )}

                <div className="flex flex-wrap items-center gap-3">
                  {featured.streamUrl && featured.platform !== "INTERNAL" && (
                    <Button asChild className="rounded-xl">
                      <a href={featured.streamUrl} target="_blank" rel="noreferrer">
                        <PlayCircle className="mr-2 h-4 w-4" />
                        Regarder sur {platformLabels[featured.platform] ?? "la plateforme"}
                      </a>
                    </Button>
                  )}
                  <span className="text-sm text-muted-foreground">
                    {platformLabels[featured.platform] ?? featured.platform} ·{" "}
                    {featured.mediaType === "AUDIO" ? "Audio" : "Vidéo"}
                  </span>
                </div>
              </div>

              {/* Chat temps réel du direct */}
              <LiveChat
                streamId={featured.id}
                currentUserId={user.id}
                currentUserName={user.name ?? undefined}
              />
            </div>
          </section>
        ) : (
          <EmptyLive
            icon={<Radio className="h-6 w-6" />}
            title="Aucune diffusion en cours"
            description="Revenez pendant les horaires de culte pour suivre le direct depuis votre espace membre."
          />
        )}

        {/* AUTRES DIRECTS */}
        {otherLive.length > 0 && (
          <Section icon={<Radio className="h-5 w-5 text-red-500" />} title="Autres directs en cours">
            <div className="grid gap-5 md:grid-cols-2">
              {otherLive.map((stream) => (
                <StreamCard key={stream.id} stream={stream} highlight formatDateTime={formatDateTime} />
              ))}
            </div>
          </Section>
        )}

        {/* PROCHAINS DIRECTS */}
        <Section icon={<CalendarDays className="h-5 w-5 text-primary" />} title="Prochaines diffusions">
          {upcomingStreams.length ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {upcomingStreams.map((stream) => (
                <StreamCard key={stream.id} stream={stream} formatDateTime={formatDateTime} />
              ))}
            </div>
          ) : (
            <EmptyLive
              icon={<CalendarDays className="h-6 w-6" />}
              title="Aucune diffusion planifiée"
              description="Les prochains directs apparaîtront ici dès leur programmation."
            />
          )}
        </Section>

        {/* REPLAYS */}
        {pastStreams.length > 0 && (
          <Section icon={<Video className="h-5 w-5 text-muted-foreground" />} title="Diffusions précédentes">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {pastStreams.map((stream) => (
                <StreamCard key={stream.id} stream={stream} formatDateTime={formatDate} compact />
              ))}
            </div>
          </Section>
        )}
      </div>
    </DashboardLayout>
  );
}

/* ============================================================
 * SECTIONS & CARDS
 * ============================================================ */

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="flex items-center gap-3 font-serif text-xl font-semibold">
        {icon}
        {title}
      </h2>
      {children}
    </section>
  );
}

function StreamCard({
  stream,
  highlight = false,
  compact = false,
  formatDateTime,
}: {
  stream: {
    id: string;
    title: string;
    description: string | null;
    thumbnail: string | null;
    platform: string;
    streamUrl: string | null;
    mediaType: string;
    status: string;
    scheduledStart: Date | null;
    viewerCount: number;
  };
  highlight?: boolean;
  compact?: boolean;
  formatDateTime: Intl.DateTimeFormat;
}) {
  const isLive = stream.status === "LIVE";

  return (
    <Card
      className={`overflow-hidden rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        highlight ? "border-red-500/40 ring-1 ring-red-500/20" : ""
      }`}
    >
      <div className="relative aspect-video bg-gradient-to-br from-violet-600/20 via-primary/10 to-transparent">
        {stream.thumbnail ? (
          <img
            src={stream.thumbnail}
            alt={stream.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Radio
              className={`h-12 w-12 ${isLive ? "animate-pulse text-red-500" : "text-primary/60"}`}
            />
          </div>
        )}

        {isLive && (
          <Badge className="absolute left-3 top-3 border-0 bg-red-600 px-3 py-1 text-white">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-white" />
            EN DIRECT
          </Badge>
        )}

        {stream.status === "SCHEDULED" && (
          <Badge variant="secondary" className="absolute left-3 top-3 px-3 py-1">
            Bientôt
          </Badge>
        )}

        {isLive && stream.viewerCount > 0 && (
          <Badge className="absolute right-3 top-3 gap-1 border-0 bg-black/70 px-2 py-1 text-white">
            <Eye className="h-3 w-3" />
            {stream.viewerCount.toLocaleString("fr-FR")}
          </Badge>
        )}
      </div>

      <CardContent className={compact ? "space-y-3 p-5" : "space-y-4 p-6"}>
        <div>
          <h3 className="line-clamp-1 text-lg font-semibold">{stream.title}</h3>

          {stream.description && !compact && (
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
              {stream.description}
            </p>
          )}
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          {stream.scheduledStart && (
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-primary" />
              <span>{formatDateTime.format(stream.scheduledStart)}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Video className="h-4 w-4 text-primary" />
            <span>
              {stream.platform === "INTERNAL"
                ? `Dans l'application · ${stream.mediaType === "AUDIO" ? "Audio" : "Vidéo"}`
                : platformLabels[stream.platform] ?? stream.platform}
            </span>
          </div>
        </div>

        {stream.streamUrl && stream.platform !== "INTERNAL" && (
          <Button asChild className="w-full rounded-xl" variant={isLive ? "default" : "outline"}>
            <a href={stream.streamUrl} target="_blank" rel="noreferrer">
              <PlayCircle className="mr-2 h-4 w-4" />
              {isLive ? "Rejoindre le direct" : "Ouvrir la diffusion"}
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyLive({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="rounded-3xl border-dashed">
      <CardContent className="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {icon}
        </div>

        <h3 className="mt-5 text-xl font-semibold">{title}</h3>

        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>

        <Button asChild variant="outline" className="mt-5 rounded-xl">
          <a href="/live" target="_blank" rel="noreferrer">
            Voir la page Live publique
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
