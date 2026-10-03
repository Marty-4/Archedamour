"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ImageFieldInput } from "@/components/admin/image-field-input";
import { AudioFieldInput } from "@/components/admin/audio-field-input";
import { MicroRecorder } from "@/components/admin/micro-recorder";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

export type FormField = {
  name: string;
  label: string;
  type?:
    | "text"
    | "textarea"
    | "number"
    | "date"
    | "datetime-local"
    | "select"
    | "url"
    | "image"
    | "audio"
    | "recorder";
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  defaultValue?: string;
};

type AdminFormDialogProps = {
  endpoint: string;
  title: string;
  description?: string;
  fields: FormField[];
  item?: Record<string, unknown> | null;
  triggerLabel?: string;
  triggerVariant?: "default" | "outline" | "secondary" | "ghost" | "destructive";
  onSuccess?: () => void;
};

function toInputValue(value: unknown): string {
  if (value == null) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 16);
  if (typeof value === "object") return "";
  return String(value);
}

export function AdminFormDialog({
  endpoint,
  title,
  description,
  fields,
  item = null,
  triggerLabel,
  triggerVariant = "default",
  onSuccess,
}: AdminFormDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const field of fields) {
      initial[field.name] = item ? toInputValue(item[field.name]) : (field.defaultValue ?? "");
    }
    return initial;
  });

  const isEdit = Boolean(item);

  // Champ durée lié au recorder (s'il existe dans ce formulaire) + marqueur
  // « enregistré avec le micro de l'appareil » (l'API l'utilise pour poser
  // recordedById sur l'admin connecté).
  const durationFieldName =
    fields.find((f) => f.name === "duration")?.name ?? "__none__";
  const hasRecorder = fields.some((f) => f.type === "recorder");

  function handleChange(name: string, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: Record<string, unknown> = { ...values };
      if (hasRecorder) {
        // Retire le champ technique du recorder du payload.
        delete payload.recorderSlot;
        payload.recorded = values.recorderSlot ? "true" : "false";
      }
      if (isEdit && item?.id) payload.id = item.id;

      const res = await fetch(endpoint, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Erreur lors de l'enregistrement");
      }

      toast.success(isEdit ? "Modifié avec succès" : "Créé avec succès");
      setOpen(false);
      router.refresh();
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!item?.id) return;
    if (!confirm("Voulez-vous vraiment supprimer cet élément ?")) return;

    setLoading(true);
    try {
      const res = await fetch(`${endpoint}?id=${item.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Erreur lors de la suppression");
      }
      toast.success("Supprimé avec succès");
      setOpen(false);
      router.refresh();
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} size="sm">
          {isEdit ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {triggerLabel ?? (isEdit ? "Modifier" : "Ajouter")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92dvh] overflow-y-auto p-4 sm:max-w-lg sm:p-6">
        <DialogHeader>
          <DialogTitle>{isEdit ? `Modifier : ${title}` : `Ajouter : ${title}`}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>
                {field.label}
                {field.required && <span className="text-destructive"> *</span>}
              </Label>
              {field.type === "image" ? (
                <ImageFieldInput
                  id={field.name}
                  value={values[field.name] ?? ""}
                  onChange={(v) => handleChange(field.name, v)}
                  folder={field.name === "thumbnail" ? "live-thumbnails" : "general"}
                  placeholder={field.placeholder}
                />
              ) : field.type === "audio" ? (
                <AudioFieldInput
                  id={field.name}
                  value={values[field.name] ?? ""}
                  onChange={(v) => handleChange(field.name, v)}
                  placeholder={field.placeholder}
                />
              ) : field.type === "recorder" ? (
                <div className="space-y-2">
                  <MicroRecorder
                    uploading={false}
                    onSave={(url, seconds) => {
                      // Le recorder remplit le champ audio cible (field.name peut
                      // être audioUrl) ET le slot technique qui marque « enregistré ».
                      if (field.name !== "recorderSlot") handleChange(field.name, url);
                      handleChange("recorderSlot", url);
                      // La durée (minutes, arrondie au-dessus) accompagne l'audio.
                      if (durationFieldName !== "__none__") {
                        handleChange(durationFieldName, String(Math.max(1, Math.ceil(seconds / 60))));
                      }
                    }}
                  />
                  {values[field.name] && (
                    <p className="text-xs text-emerald-600">
                      ✓ Enregistrement prêt — il sera joint à la prédication à la création.
                    </p>
                  )}
                </div>
              ) : field.type === "textarea" ? (
                <Textarea
                  id={field.name}
                  placeholder={field.placeholder}
                  value={values[field.name] ?? ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  required={field.required}
                  rows={3}
                />
              ) : field.type === "select" ? (
                <Select value={values[field.name] ?? ""} onValueChange={(v) => handleChange(field.name, v)}>
                  <SelectTrigger>
                    <SelectValue placeholder={field.placeholder ?? "Sélectionner..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={field.name}
                  type={field.type ?? "text"}
                  placeholder={field.placeholder}
                  value={values[field.name] ?? ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  required={field.required}
                />
              )}
            </div>
          ))}
          <DialogFooter className="sticky bottom-0 gap-2 border-t bg-background pt-3 sm:justify-between">
            {isEdit && (
              <Button type="button" variant="destructive" size="sm" onClick={handleDelete} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Supprimer
              </Button>
            )}
            <div className="flex w-full gap-2 sm:w-auto">
              <Button type="button" variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={() => setOpen(false)} disabled={loading}>
                Annuler
              </Button>
              <Button type="submit" size="sm" className="flex-1 sm:flex-none" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isEdit ? "Enregistrer" : "Créer"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}