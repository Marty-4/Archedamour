"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Champ image réutilisable dans les formulaires admin :
 * - upload de fichier (Stockage Supabase, ou local en dev)
 * - ou saisie manuelle d'une URL
 */
export function ImageFieldInput({
  id,
  value,
  onChange,
  folder = "general",
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  folder?: string;
  placeholder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(file: File | undefined) {
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error ?? "Échec de l'envoi de l'image");
      }

      onChange(data.url);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Échec de l'envoi");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Input
          id={id}
          type="url"
          placeholder={placeholder ?? "https://... ou téléversez une image"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files?.[0])}
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImagePlus className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">Téléverser</span>
        </Button>

        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0"
            onClick={() => onChange("")}
            aria-label="Retirer l'image"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {value && (
        <img
          src={value}
          alt="Aperçu"
          className="h-20 w-32 rounded-lg border object-cover"
        />
      )}
    </div>
  );
}
