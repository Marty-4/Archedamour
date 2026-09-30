import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Configuration Supabase Storage (variables serveur uniquement) :
 *   SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   SUPABASE_STORAGE_BUCKET (défaut : "media")
 *
 * Tant que les variables ne sont pas définies, les uploads sont stockés
 * localement dans public/uploads (pratique en développement).
 */

const SUPABASE_URL =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
export const SUPABASE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "media";

export function isSupabaseStorageConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

let adminClient: SupabaseClient | null = null;

/** Client admin (service role) — à n'utiliser que côté serveur. */
export function getSupabaseAdmin() {
  if (!isSupabaseStorageConfigured()) return null;
  if (!adminClient) {
    adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return adminClient;
}

export const ALLOWED_UPLOAD_FOLDERS = [
  "avatars",
  "live-thumbnails",
  "general",
  "church",
  "sermon-audio",
] as const;

export type UploadFolder = (typeof ALLOWED_UPLOAD_FOLDERS)[number];

export function sanitizeUploadFolder(
  value: string | null | undefined,
): UploadFolder {
  return (ALLOWED_UPLOAD_FOLDERS as readonly string[]).includes(value ?? "")
    ? (value as UploadFolder)
    : "general";
}

const IMAGE_MIME_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function imageExtensionForMimeType(mimeType: string) {
  return IMAGE_MIME_TYPES[mimeType] ?? null;
}

const AUDIO_MIME_TYPES: Record<string, string> = {
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/mp4": "m4a",
  "audio/x-m4a": "m4a",
  "audio/aac": "aac",
  "audio/ogg": "ogg",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/webm": "webm",
};

export function audioExtensionForMimeType(mimeType: string) {
  return AUDIO_MIME_TYPES[mimeType] ?? null;
}

/** Envoi d'un fichier audio vers Supabase Storage (sans transformation). */
export async function uploadAudioToSupabase(
  buffer: Buffer,
  extension: string,
  mimeType: string,
): Promise<string> {
  const client = getSupabaseAdmin();
  if (!client) {
    throw new Error("Supabase Storage n'est pas configuré");
  }

  const fileName = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const storagePath = `sermon-audio/${fileName}`;

  const { error } = await client.storage
    .from(SUPABASE_BUCKET)
    .upload(storagePath, buffer, {
      contentType: mimeType,
      cacheControl: "31536000",
      upsert: false,
    });

  if (error) {
    throw new Error(`Échec de l'envoi vers Supabase Storage : ${error.message}`);
  }

  const { data } = client.storage.from(SUPABASE_BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

/** Redimensionne et compresse l'image (WebP) avant l'envoi. */
export async function optimizeImage(
  buffer: Buffer,
  folder: UploadFolder,
): Promise<{ buffer: Buffer; extension: string }> {
  const maxDimension = folder === "avatars" ? 512 : 1600;

  try {
    const sharp = (await import("sharp")).default;
    const optimized = await sharp(buffer)
      .rotate()
      .resize({
        width: maxDimension,
        height: maxDimension,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toBuffer();

    return { buffer: optimized, extension: "webp" };
  } catch {
    // sharp indisponible ou image non traitable : on envoie l'original.
    return { buffer, extension: "bin" };
  }
}

export async function uploadImageToSupabase(
  buffer: Buffer,
  folder: UploadFolder,
  extension: string,
): Promise<string> {
  const client = getSupabaseAdmin();
  if (!client) {
    throw new Error("Supabase Storage n'est pas configuré");
  }

  const fileName = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const storagePath = `${folder}/${fileName}`;

  const { error } = await client.storage
    .from(SUPABASE_BUCKET)
    .upload(storagePath, buffer, {
      contentType:
        extension === "jpg"
          ? "image/jpeg"
          : `image/${extension === "bin" ? "jpeg" : extension}`,
      cacheControl: "31536000",
      upsert: false,
    });

  if (error) {
    throw new Error(`Échec de l'envoi vers Supabase Storage : ${error.message}`);
  }

  const { data } = client.storage.from(SUPABASE_BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}
