"use client";

import { useRef, useState } from "react";
import { AudioLines, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Champ audio réutilisable dans les formulaires admin :
 * - téléversement d'un fichier (MP3/M4A/AAC/OGG/WAV, 50 Mo max) vers
 *   /api/admin/upload?folder=sermon-audio (Storage Supabase ou local en dev)
 * - ou saisie manuelle d'une URL
 * Affiche un lecteur de pré-écoute quand une URL est définie.
 */
export function AudioFieldInput({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("folder", "sermon-audio");

      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(payload?.error ?? payload?.message ?? "Échec du téléversement");
      }
      onChange(payload.data?.url ?? payload.url ?? "");
    } catch (error) {
      import("sonner").then(({ toast }) =>
        toast.error("Téléversement impossible", {
          description: error instanceof Error ? error.message : undefined,
        }),
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          id={id}
          type="url"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder ?? "https://… ou téléversez un fichier audio"}
        />
        <input
          ref={inputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleFile(file);
            event.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <AudioLines className="mr-2 h-4 w-4" />}
          Téléverser
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")} aria-label="Retirer l'audio">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {value && (
         
        <audio controls preload="metadata" src={value} className="w-full" />
      )}
    </div>
  );
}
