"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "@/lib/no-motion";
import {
  Calendar,
  Clock,
  Eye,
  History,
  Play,
  PlayCircle,
  Radio,
  Users,
  Video,
} from "lucide-react";

import { PublicLayout } from "@/components/layouts/public-layout";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LivePlayer } from "@/components/member/live-player";

interface LiveStreamItem {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  platform: string;
  streamUrl: string | null;
  mediaType: string;
  status: string;
  scheduledStart: string | null;
  actualStart: string | null;
  viewerCount: number;
}

const platformLabels: Record<string, string> = {
  INTERNAL: "Dans l'application",
  YOUTUBE: "YouTube",
  FACEBOOK: "Facebook",
  RTMP: "RTMP",
  OTHER: "Autre",
};

const dateTimeFmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeStyle: "short" });

type MediaType = "VIDEO" | "AUDIO";

/**
 * Page Live PUBLIQUE — accessible sans connexion.
 * Renvoie les vraies diffusions via GET /api/live (aucune donnée sensible) :
 * direct en cours en grand lecteur, prochaines diffusions, replays.
 */
export default function PublicLivePage() {
  const [streams, setStreams] = useState<LiveStreamItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/live", { cache: "no-store" });
        if (!res.ok) throw new Error("Impossible de charger les diffusions");
        const json = await res.json();
        if (!cancelled) setStreams(Array.isArray(json.streams) ? json.streams : []);
      } catch {
        if (!cancelled) setError("Impossible de charger les diffusions pour le moment.");
      }
    }

    load();
    // Rafraîchit toutes les 30 s (statut LIVE/SCHEDULED/ENDED).
    const interval = setInterval(load, 30_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const live = useMemo(() => (streams ?? []).filter((s) => s.status === "LIVE"), [streams]);
  const upcoming = useMemo(() => (streams ?? []).filter((s) => s.status === "SCHEDULED"), [streams]);
  const past = useMemo(
    () => (streams ?? []).filter((s) => s.status === "ENDED" || s.status === "CANCELLED"),
    [streams],
  );
  const featured = live[0];
  const otherLive = live.slice(1);

  return (
    <PublicLayout>
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-violet-800 py-14 lg:py-18">
        <div className="absolute inset-0">
          <div className="absolute right-20 top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-10 left-10 h-96 w-96 rounded-full bg-red-400/20 blur-3xl" />
        </div>

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 30 }} transition={{ duration: 0.8 }}>
            <PageHeader
              title="Diffusion en Direct"
              description="Participez à nos cultes et événements en direct, où que vous soyez — sans compte."
              breadcrumbs={[{ label: "Live" }]}
              className="text-slate-900 dark:text-white [&_h1]:text-slate-900 dark:[&_h1]:text-white [&_p]:text-slate-700 dark:[&_p]:text-white/80 [&_li]:text-slate-700 dark:[&_li]:text-white/60 [&_a]:text-slate-900 dark:[&_a]:text-white hover:[&_a]:text-sky-400"
            />
          </motion.div>
        </div>

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

      <section className="py-10">
        <div className="container mx-auto space-y-10 px-4 sm:px-6 lg:px-8">
          {streams === null && !error && (
            <div className="flex justify-center py-16">
              <Radio className="h-10 w-10 animate-pulse text-primary" />
              <span className="sr-only">Chargement des diffusions…</span>
            </div>
          )}

          {error && (
            <Card className="border-dashed">
              <CardContent className="flex min-h-[200px] flex-col items-center justify-center gap-4 px-6 text-center">
                <Radio className="h-10 w-10 text-muted-foreground/60" />
                <p className="text-sm text-muted-foreground">{error}</p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Réessayer
                </Button>
              </CardContent>
            </Card>
          )}

          {streams !== null && !error && (
            <>
              {featured ? (
                <section className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-white" /> EN DIRECT
                    </span>
                    <h2 className="font-serif text-xl font-semibold">{featured.title}</h2>
                  </div>

                  <div className="overflow-hidden rounded-3xl border border-red-500/30 shadow-xl">
                    {featured.platform === "INTERNAL" ? (
                      <LivePlayer
                        streamId={featured.id}
                        mediaType={(featured.mediaType as MediaType) ?? "VIDEO"}
                        title={featured.title}
                        startedAt={featured.actualStart}
                      />
                    ) : featured.streamUrl ? (
                      <a
                        href={featured.streamUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="group relative block aspect-video bg-gradient-to-br from-violet-600/20 via-primary/10 to-transparent"
                      >
                        {featured.thumbnail ? (
                           
                          <img src={featured.thumbnail} alt={featured.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <PlayCircle className="h-16 w-16 animate-pulse text-red-500 transition group-hover:scale-110" />
                          </div>
                        )}
                        <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow-lg">
                          Regarder sur {platformLabels[featured.platform] ?? "la plateforme"}
                        </span>
                      </a>
                    ) : (
                      <div className="flex aspect-video items-center justify-center">
                        <Radio className="h-14 w-14 animate-pulse text-red-500" />
                      </div>
                    )}
                  </div>

                  {featured.description && (
                    <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{featured.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Video className="h-4 w-4 text-primary" />
                      {platformLabels[featured.platform] ?? featured.platform}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-primary" />
                      {featured.mediaType === "AUDIO" ? "Audio" : "Vidéo"}
                    </span>
                    {featured.viewerCount > 0 && (
                      <span className="flex items-center gap-1.5">
                        <Eye className="h-4 w-4 text-primary" />
                        {featured.viewerCount.toLocaleString("fr-FR")} spectateurs
                      </span>
                    )}
                  </div>
                </section>
              ) : (
                <Card className="border-dashed border-2">
                  <CardContent className="flex min-h-[240px] flex-col items-center justify-center px-6 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                      <Video className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                    <h2 className="mt-5 font-serif text-2xl font-bold">Aucune diffusion en cours</h2>
                    <p className="mt-2 max-w-md text-sm text-muted-foreground">
                      Il n&apos;y a actuellement aucun direct. Les prochains cultes en direct apparaîtront ici —
                      aucune inscription nécessaire pour les suivre.
                    </p>
                  </CardContent>
                </Card>
              )}

              {otherLive.length > 0 && (
                <StreamsSection icon={<Radio className="h-5 w-5 text-red-500" />} title="Autres directs en cours">
                  {otherLive.map((s) => (
                    <StreamCard key={s.id} stream={s} highlight />
                  ))}
                </StreamsSection>
              )}

              <StreamsSection icon={<Calendar className="h-5 w-5 text-primary" />} title="Prochaines diffusions">
                {upcoming.length ? (
                  upcoming.map((s) => <StreamCard key={s.id} stream={s} />)
                ) : (
                  <p className="text-sm text-muted-foreground">Aucune diffusion planifiée pour le moment.</p>
                )}
              </StreamsSection>

              {past.length > 0 && (
                <StreamsSection icon={<History className="h-5 w-5 text-muted-foreground" />} title="Diffusions précédentes">
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {past.map((s) => (
                      <StreamCard key={s.id} stream={s} compact />
                    ))}
                  </div>
                </StreamsSection>
              )}

              <div className="pt-2 text-center">
                <Button asChild variant="outline" className="rounded-xl">
                  <Link href="/login">Se connecter pour le chat et les notifications</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}

function StreamsSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
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

function StreamCard({ stream, highlight = false, compact = false }: { stream: LiveStreamItem; highlight?: boolean; compact?: boolean }) {
  const isLive = stream.status === "LIVE";

  return (
    <Card
      className={`overflow-hidden rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        highlight ? "border-red-500/40 ring-1 ring-red-500/20" : ""
      }`}
    >
      <div className="relative aspect-video bg-gradient-to-br from-violet-600/20 via-primary/10 to-transparent">
        {stream.thumbnail ? (
           
          <img src={stream.thumbnail} alt={stream.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Play className={`h-12 w-12 ${isLive ? "animate-pulse text-red-500" : "text-primary/60"}`} />
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
      </div>

      <CardContent className={compact ? "space-y-2 p-4" : "space-y-3 p-5"}>
        <h3 className="line-clamp-1 font-semibold">{stream.title}</h3>
        {stream.description && !compact && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{stream.description}</p>
        )}
        {stream.scheduledStart && !isLive && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 text-primary" />
            {dateTimeFmt.format(new Date(stream.scheduledStart))}
          </p>
        )}
        {stream.platform !== "INTERNAL" && stream.streamUrl && (
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
