"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowLeft, CalendarDays, Loader2, Save } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { createService } from "./actions";

// Formulaire client de création de culte. La page (page.tsx, code serveur)
// s'occupe de l'authentification admin et du chargement des prédicateurs.
export function CreateServiceFormSection({ preachers }: { preachers: Preacher[] }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/cultes"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border bg-background transition-colors hover:bg-muted"
          aria-label="Retour aux cultes"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <AdminPageHeader
          title="Créer un culte"
          description="Planifiez un nouveau culte ou rassemblement."
        />
      </div>

      <CreateServiceForm preachers={preachers} />
    </div>
  );
}

const initialState = {
  error: undefined,
  success: false,
};

const serviceTypes = [
  {
    value: "SUNDAY_SERVICE",
    label: "Culte du dimanche",
  },
  {
    value: "WEEKDAY_PRAYER",
    label: "Prière en semaine",
  },
  {
    value: "BIBLE_STUDY",
    label: "Étude biblique",
  },
  {
    value: "VIGIL",
    label: "Veillée",
  },
  {
    value: "CONFERENCE",
    label: "Conférence",
  },
  {
    value: "SEMINAR",
    label: "Séminaire",
  },
  {
    value: "RETREAT",
    label: "Retraite",
  },
  {
    value: "OTHER",
    label: "Autre",
  },
] as const;

const serviceStatuses = [
  {
    value: "SCHEDULED",
    label: "Planifié",
  },
  {
    value: "ONGOING",
    label: "En cours",
  },
  {
    value: "COMPLETED",
    label: "Terminé",
  },
  {
    value: "CANCELLED",
    label: "Annulé",
  },
] as const;

type Preacher = {
  id: string;
  name: string | null;
  role: string;
};

function CreateServiceForm({
  preachers,
}: {
  preachers: Preacher[];
}) {
  const [state, formAction, isPending] = useActionState(
    createService,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-6">
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <CalendarDays className="h-5 w-5 text-primary" />
          </div>

          <div>
            <h2 className="font-semibold">Informations du culte</h2>
            <p className="text-sm text-muted-foreground">
              Renseignez les informations principales.
            </p>
          </div>
        </div>

        {state?.error && (
          <div
            className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            role="alert"
          >
            {state.error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-medium"
            >
              Titre du culte *
            </label>

            <input
              id="title"
              name="title"
              required
              placeholder="Ex. Culte dominical du dimanche"
              className="h-11 w-full rounded-xl border bg-background px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>

          <div>
            <label
              htmlFor="type"
              className="mb-2 block text-sm font-medium"
            >
              Type de culte *
            </label>

            <select
              id="type"
              name="type"
              defaultValue="SUNDAY_SERVICE"
              required
              className="h-11 w-full rounded-xl border bg-background px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            >
              {serviceTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="status"
              className="mb-2 block text-sm font-medium"
            >
              Statut *
            </label>

            <select
              id="status"
              name="status"
              defaultValue="SCHEDULED"
              required
              className="h-11 w-full rounded-xl border bg-background px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            >
              {serviceStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="date"
              className="mb-2 block text-sm font-medium"
            >
              Date *
            </label>

            <input
              id="date"
              name="date"
              type="date"
              required
              className="h-11 w-full rounded-xl border bg-background px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>

          <div>
            <label
              htmlFor="preacherId"
              className="mb-2 block text-sm font-medium"
            >
              Prédicateur
            </label>

            <select
              id="preacherId"
              name="preacherId"
              defaultValue=""
              className="h-11 w-full rounded-xl border bg-background px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            >
              <option value="">Aucun prédicateur</option>

              {preachers.map((preacher) => (
                <option key={preacher.id} value={preacher.id}>
                  {preacher.name || "Utilisateur sans nom"} — {preacher.role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="startTime"
              className="mb-2 block text-sm font-medium"
            >
              Heure de début *
            </label>

            <input
              id="startTime"
              name="startTime"
              type="time"
              required
              className="h-11 w-full rounded-xl border bg-background px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>

          <div>
            <label
              htmlFor="endTime"
              className="mb-2 block text-sm font-medium"
            >
              Heure de fin *
            </label>

            <input
              id="endTime"
              name="endTime"
              type="time"
              required
              className="h-11 w-full rounded-xl border bg-background px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="location"
              className="mb-2 block text-sm font-medium"
            >
              Lieu
            </label>

            <input
              id="location"
              name="location"
              placeholder="Ex. Temple principal"
              className="h-11 w-full rounded-xl border bg-background px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium"
            >
              Description
            </label>

            <textarea
              id="description"
              name="description"
              rows={5}
              placeholder="Présentez brièvement le culte, son thème ou son objectif..."
              className="w-full resize-y rounded-xl border bg-background px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="image"
              className="mb-2 block text-sm font-medium"
            >
              URL de l'image
            </label>

            <input
              id="image"
              name="image"
              type="url"
              placeholder="https://..."
              className="h-11 w-full rounded-xl border bg-background px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="liveUrl"
              className="mb-2 block text-sm font-medium"
            >
              URL du direct
            </label>

            <input
              id="liveUrl"
              name="liveUrl"
              type="url"
              placeholder="https://youtube.com/..."
              className="h-11 w-full rounded-xl border bg-background px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Link
          href="/admin/cultes"
          className="inline-flex h-11 items-center justify-center rounded-xl border px-5 text-sm font-medium transition-colors hover:bg-muted"
        >
          Annuler
        </Link>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Création...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Créer le culte
            </>
          )}
        </button>
      </div>
    </form>
  );
}

