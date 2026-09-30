import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTable } from "@/components/admin/admin-table";
import { AdminPageActions } from "@/components/admin/admin-page-actions";
import { AdminCrudCell } from "@/components/admin/admin-crud-cell";
import type { FormField } from "@/components/admin/admin-form-dialog";
import { requireAdmin, type AdminRow } from "@/lib/admin";
import { db } from "@/lib/db";

const SERMON_TYPES = [
  { value: "VIDEO", label: "Vidéo" },
  { value: "AUDIO", label: "Audio" },
  { value: "PDF", label: "PDF" },
  { value: "TEXT", label: "Texte" },
];

export default async function PredicationsPage() {
  const user = await requireAdmin();

  const [items, count, preachers] = await Promise.all([
    db.sermon.findMany({
      take: 50,
      orderBy: { date: "desc" },
      include: { preacher: true },
    }),
    db.sermon.count(),
    db.user.findMany({
      where: {
        role: { in: ["SUPER_ADMIN", "PASTOR", "ADMIN"] },
        status: "ACTIVE",
      },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const preacherOptions = preachers.map((p) => ({
    value: p.id,
    label: p.name ?? "Utilisateur sans nom",
  }));

  // L'admin connecté est proposé comme prédicateur par défaut.
  const selfOption = preachers.find((p) => p.id === user.id);

  const rows: AdminRow[] = items.map((item) => ({
    id: item.id,
    primary: item.title,
    secondary: item.preacher.name ?? "Prédicateur non renseigné",
    detail: item.type,
    date: item.date,
    raw: {
      title: item.title,
      description: item.description ?? "",
      preacherId: item.preacherId,
      date: item.date ? item.date.toISOString().slice(0, 10) : "",
      verse: item.verse ?? "",
      thumbnail: item.thumbnail ?? "",
      videoUrl: item.videoUrl ?? "",
      audioUrl: item.audioUrl ?? "",
      documentUrl: item.documentUrl ?? "",
      duration: item.duration ? String(item.duration) : "",
      type: item.type,
      downloadsAllowed: item.downloadsAllowed ? "true" : "false",
    },
  }));

  const fields = [
    { name: "title", label: "Titre", type: "text", required: true, placeholder: "Titre de la prédication" },
    { name: "description", label: "Description", type: "textarea", placeholder: "Description de la prédication" },
    {
      name: "preacherId",
      label: "Prédicateur",
      type: "select",
      required: true,
      options: preacherOptions,
    },
    { name: "date", label: "Date", type: "date", required: true },
    { name: "verse", label: "Référence biblique", type: "text", placeholder: "Jean 3:16" },
    { name: "thumbnail", label: "Miniature", type: "image", placeholder: "https://... ou téléversez une image" },
    { name: "videoUrl", label: "Vidéo URL", type: "url", placeholder: "https://..." },
    { name: "audioUrl", label: "Audio (téléversez un fichier ou collez une URL)", type: "audio" },
    { name: "recorderSlot", label: "… ou enregistrez directement avec votre micro", type: "recorder" },
    { name: "documentUrl", label: "Document URL", type: "url", placeholder: "https://..." },
    { name: "duration", label: "Durée (minutes)", type: "number", placeholder: "45" },
    { name: "type", label: "Type", type: "select", required: true, options: SERMON_TYPES, defaultValue: "TEXT" },
    {
      name: "downloadsAllowed",
      label: "Téléchargement autorisé",
      type: "select",
      options: [
        { value: "true", label: "Oui" },
        { value: "false", label: "Non" },
      ],
      defaultValue: "true",
    },
  ] satisfies FormField[];

  return (
    <DashboardLayout variant="admin" user={user}>
      <div className="space-y-6">
        <AdminPageHeader title="Prédications" description="Bibliothèque des prédications publiées." />
        <AdminPageActions
          endpoint="/api/admin/predications"
          title="Prédication"
          description="Publiez une nouvelle prédication"
          fields={fields}
        />
        <AdminTable
          title="Prédications"
          count={count}
          countLabel="prédications"
          rows={rows}
          actions={(row) => (
            <AdminCrudCell row={row} endpoint="/api/admin/predications" title="Prédication" fields={fields} />
          )}
        />
      </div>
    </DashboardLayout>
  );
}