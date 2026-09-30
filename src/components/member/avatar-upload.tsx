"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Overlay d'upload sur l'avatar du profil membre.
 * Parent : <div class="relative"><Avatar.../><AvatarUpload/></div>
 */
export function AvatarUpload({ hasAvatar }: { hasAvatar: boolean }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File | undefined) {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/member/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message ?? "Échec de l'envoi de la photo");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function removeAvatar() {
    setUploading(true);
    setError(null);

    try {
      const res = await fetch("/api/member/avatar", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? "Échec de la suppression");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => upload(e.target.files?.[0])}
      />

      <div className="absolute inset-0 flex items-end justify-center gap-2 rounded-full bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity hover:opacity-100 focus-within:opacity-100">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="mb-2 h-8 gap-1.5 rounded-full px-3"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          aria-label="Changer la photo de profil"
        >
          {uploading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Camera className="h-3.5 w-3.5" />
          )}
          <span className="text-xs">Changer</span>
        </Button>

        {hasAvatar && (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="mb-2 h-8 gap-1.5 rounded-full px-3"
            disabled={uploading}
            onClick={removeAvatar}
            aria-label="Supprimer la photo de profil"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {error && (
        <p className="absolute left-1/2 top-full z-10 mt-1 w-max max-w-[220px] -translate-x-1/2 rounded-lg bg-red-50 px-3 py-1.5 text-xs text-red-600">
          {error}
        </p>
      )}
    </>
  );
}
