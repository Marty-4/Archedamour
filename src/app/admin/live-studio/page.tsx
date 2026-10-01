import Link from "next/link";
import { ExternalLink, Video } from "lucide-react";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTable } from "@/components/admin/admin-table";
import { AdminPageActions } from "@/components/admin/admin-page-actions";
import { AdminCrudCell } from "@/components/admin/admin-crud-cell";
import type { FormField } from "@/components/admin/admin-form-dialog";
import { requireAdmin, formatDateTime, type AdminRow, type AdminBadge } from "@/lib/admin";
import { db } from "@/lib/db";
import { LiveStudioControls } from "@/components/admin/live-studio-controls";
import { AudioCallHostPanel } from "@/components/admin/audio-call-host-panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const STREAM_STATUSES = [
  { value: "SCHEDULED", label: "Programmée" },
  { value: "LIVE", label: "En direct" },
  { value: "ENDED", label: "Terminée" },
  { value: "CANCELLED", label: "Annulée" },
];

const PLATFORMS = [
  { value: "INTERNAL", label: "Dans l'application" },
  { value: "YOUTUBE", label: "YouTube" },
  { value: "FACEBOOK", label: "Facebook" },
  { value: "RTMP", label: "RTMP" },
  { value: "OTHER", label: "Autre" },
];

const platformLabels: Record<string, string> = {
  INTERNAL: "Dans l'application",
  YOUTUBE: "YouTube",
  FACEBOOK: "Facebook",
  RTMP: "RTMP",
  OTHER: "Autre",
};

function statusBadge(row: AdminRow): AdminBadge {
  return {
    label: row.status === "LIVE" ? "En direct" : row.status === "SCHEDULED" ? "Programmée" : row.status === "ENDED" ? "Terminée" : "Annulée",
    variant: row.status === "LIVE" ? "error" : row.status === "SCHEDULED" ? "info" : row.status === "ENDED" ? "completed" : "cancelled",
  };
}

export default async function LiveStudioPage() {
  const user = await requireAdmin();

  const [items, count] = await Promise.all([
    db.liveStream.findMany({
      take: 50,
      orderBy: [{ status: "asc" }, { scheduledStart: "desc" }],
    }),
    db.liveStream.count(),
  ]);

  const liveNow = items.filter((item) => item.status === "LIVE");
  const scheduled = items.filter((item) => item.status === "SCHEDULED");
  const ended = items.filter(
    (item) => item.status === "ENDED" || item.status === "CANCELLED",
  );

  const rows: AdminRow[] = [...liveNow, ...scheduled, ...ended].map((item) => {
    const mediaType = (item as { mediaType?: "VIDEO" | "AUDIO" }).mediaType ?? "VIDEO";
    return {
      id: item.id,
      primary: item.title,
      secondary: platformLabels[item.platform] ?? item.platform,
      detail:
        item.platform === "INTERNAL"
          ? mediaType === "AUDIO" ? "Audio · " : "Vidéo · "
          : item.streamUrl
            ? "Lien externe"
          : "Lien manquant",
      status: item.status,
      date: item.scheduledStart ?? item.createdAt,
      raw: {
        title: item.title,
        description: item.description ?? "",
        thumbnail: item.thumbnail ?? "",
        platform: item.platform,
        streamKey: item.streamKey ?? "",
        streamUrl: item.streamUrl ?? "",
        mediaType,
        status: item.status,
        scheduledStart: item.scheduledStart ? item.scheduledStart.toISOString().slice(0, 10) : "",
        scheduledEnd: item.scheduledEnd ? item.scheduledEnd.toISOString().slice(0, 10) : "",
      },
    };
  });

  const fields = [
    { name: "title", label: "Titre", type: "text", required: true, placeholder: "Titre de la diffusion" },
    { name: "description", label: "Description", type: "textarea", placeholder: "Description de la diffusion" },
    { name: "thumbnail", label: "Miniature", type: "image", placeholder: "https://... ou téléversez une image" },
    { name: "platform", label: "Mode de diffusion", type: "select", options: PLATFORMS, defaultValue: "INTERNAL" },
    { name: "streamUrl", label: "URL du direct (pour YouTube/Facebook/autre)", type: "url", placeholder: "https://youtube.com/live/..." },
    { name: "mediaType", label: "Type de direct (interne)", type: "select", options: [{ value: "VIDEO", label: "Vidéo et audio" }, { value: "AUDIO", label: "Audio uniquement" }], defaultValue: "VIDEO" },
    { name: "status", label: "Statut", type: "select", options: STREAM_STATUSES, defaultValue: "SCHEDULED" },
    { name: "scheduledStart", label: "Début programmé", type: "date" },
    { name: "scheduledEnd", label: "Fin programmée", type: "date" },
  ] satisfies FormField[];

  return (
    <DashboardLayout variant="admin" user={user}>
      <div className="space-y-6">
        <AdminPageHeader title="Live Studio" description="Diffusions en direct programmées et passées." />

        <LiveStudioControls userId={user.id} />

        {/* Appel audio : panneau animateur (participants temps réel) */}
        {liveNow.some((item) => item.mediaType === "AUDIO") && (
          <AudioCallHostPanel streamId={liveNow.find((item) => item.mediaType === "AUDIO")!.id} />
        )}

        {/* Diffusions externes */}
        <div className="rounded-2xl border border-sky-500/30 bg-sky-500/[0.04] p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600">
                <Video className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Diffuser via YouTube, Facebook ou un lien externe</p>
                <p className="text-sm text-muted-foreground">
                  Ajoutez une diffusion avec l&apos;URL du direct : elle apparaîtra dans l&apos;espace Live des membres.
                </p>
              </div>
            </div>
            <Badge variant="outline" className="w-fit shrink-0">
              {scheduled.length + liveNow.length} active{(scheduled.length + liveNow.length) > 1 ? "s" : ""}
            </Badge>
          </div>
        </div>

        <AdminPageActions
          endpoint="/api/admin/live"
          title="Diffusion"
          description="Programmez une nouvelle diffusion en direct (interne ou externe)"
          fields={fields}
        />

        <AdminTable
          title="Live Studio"
          count={count}
          countLabel="diffusions"
          rows={rows}
          statusBadge={statusBadge}
          emptyMessage="Aucune diffusion pour le moment. Lancez un direct ou programmez-en une."
          actions={(row) => (
            <div className="flex items-center justify-end gap-2">
              {typeof row.raw?.streamUrl === "string" && row.raw.streamUrl && (
                <Button asChild variant="ghost" size="sm">
                  <a href={row.raw.streamUrl} target="_blank" rel="noreferrer" aria-label="Ouvrir le lien du direct">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
              <AdminCrudCell row={row} endpoint="/api/admin/live" title="Diffusion" fields={fields} />
            </div>
          )}
        />

        <p className="text-center text-sm text-muted-foreground">
          Les membres voient les diffusions sur la page{" "}
          <Link href="/member/live" className="font-medium text-primary underline underline-offset-4">
            Live de l&apos;espace membre
          </Link>
          .
        </p>
      </div>
    </DashboardLayout>
  );
}
