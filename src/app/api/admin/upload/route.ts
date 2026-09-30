import { NextRequest } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { apiError, apiSuccess, requireAdminApi } from "@/lib/admin-api";
import {
  audioExtensionForMimeType,
  imageExtensionForMimeType,
  isSupabaseStorageConfigured,
  optimizeImage,
  sanitizeUploadFolder,
  uploadAudioToSupabase,
  uploadImageToSupabase,
} from "@/lib/supabase-storage";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo (images)
const MAX_AUDIO_SIZE = 50 * 1024 * 1024; // 50 Mo (prédications audio)

// POST /api/admin/upload? (multipart/form-data : file, folder)
export async function POST(request: NextRequest) {
  const user = await requireAdminApi();
  if (!user) return apiError("Non autorisé", 401);

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const folder = sanitizeUploadFolder(formData.get("folder")?.toString());

    if (!(file instanceof File)) {
      return apiError("Fichier manquant");
    }

    // Branche AUDIO : prédications enregistrées (folder=sermon-audio).
    if (file.type.startsWith("audio/")) {
      if (formData.get("folder")?.toString() !== "sermon-audio") {
        return apiError("Précisez le dossier sermon-audio pour un fichier audio");
      }
      const extension = audioExtensionForMimeType(file.type);
      if (!extension) {
        return apiError("Format audio non supporté (MP3, M4A, AAC, OGG, WAV ou WebM)");
      }
      if (file.size > MAX_AUDIO_SIZE) {
        return apiError("Fichier audio trop lourd (50 Mo maximum)");
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      if (isSupabaseStorageConfigured()) {
        const url = await uploadAudioToSupabase(buffer, extension, file.type);
        return apiSuccess({ url, storage: "supabase" }, 201);
      }

      // Repli local (développement sans Supabase).
      const fileName = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
      const dir = path.join(process.cwd(), "public", "uploads", "sermon-audio");
      await mkdir(dir, { recursive: true });
      await writeFile(path.join(dir, fileName), new Uint8Array(buffer));
      return apiSuccess({ url: `/uploads/sermon-audio/${fileName}`, storage: "local" }, 201);
    }

    if (!file.type.startsWith("image/")) {
      return apiError("Seules les images ou fichiers audio sont acceptés");
    }

    const originalExtension = imageExtensionForMimeType(file.type);
    if (!originalExtension) {
      return apiError("Format d'image non supporté (JPG, PNG, WebP ou GIF)");
    }
    if (file.size > MAX_FILE_SIZE) {
      return apiError("Image trop lourde (5 Mo maximum)");
    }

    const rawBuffer = Buffer.from(await file.arrayBuffer());

    // Optimisation (redimensionnement + WebP) sauf pour les GIF animés.
    const { buffer, extension } =
      originalExtension === "gif"
        ? { buffer: rawBuffer, extension: "gif" }
        : await optimizeImage(rawBuffer, folder);

    if (isSupabaseStorageConfigured()) {
      const url = await uploadImageToSupabase(buffer, folder, extension);
      return apiSuccess({ url, storage: "supabase" }, 201);
    }

    // Repli local (développement sans Supabase) : public/uploads
    const fileName = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
    const dir = path.join(process.cwd(), "public", "uploads", folder);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, fileName), new Uint8Array(buffer));

    return apiSuccess(
      { url: `/uploads/${folder}/${fileName}`, storage: "local" },
      201,
    );
  } catch (error) {
    console.error("Admin upload error", error);
    return apiError(
      error instanceof Error ? error.message : "Erreur lors de l'envoi",
      500,
    );
  }
}
