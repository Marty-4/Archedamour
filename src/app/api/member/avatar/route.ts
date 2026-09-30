import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { db } from "@/lib/db";
import { SESSION_CONFIG } from "@/lib/auth";
import { getSessionUser } from "@/lib/session";
import {
  imageExtensionForMimeType,
  isSupabaseStorageConfigured,
  optimizeImage,
  uploadImageToSupabase,
} from "@/lib/supabase-storage";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo

// POST /api/member/avatar (multipart/form-data : file)
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(
      request.cookies.get(SESSION_CONFIG.cookieName)?.value,
    );

    if (!user) {
      return NextResponse.json(
        { message: "Authentification requise." },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: "Aucune image reçue." },
        { status: 400 },
      );
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { message: "Seules les images sont acceptées." },
        { status: 422 },
      );
    }

    const originalExtension = imageExtensionForMimeType(file.type);
    if (!originalExtension) {
      return NextResponse.json(
        { message: "Format non supporté (JPG, PNG, WebP ou GIF)." },
        { status: 422 },
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: "Image trop lourde (5 Mo maximum)." },
        { status: 422 },
      );
    }

    const rawBuffer = Buffer.from(await file.arrayBuffer());
    const { buffer, extension } =
      originalExtension === "gif"
        ? { buffer: rawBuffer, extension: "gif" as const }
        : await optimizeImage(rawBuffer, "avatars");

    let avatarUrl: string;

    if (isSupabaseStorageConfigured()) {
      avatarUrl = await uploadImageToSupabase(buffer, "avatars", extension);
    } else {
      // Repli local (développement sans Supabase)
      const fileName = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
      const dir = path.join(process.cwd(), "public", "uploads", "avatars");
      await mkdir(dir, { recursive: true });
      await writeFile(path.join(dir, fileName), new Uint8Array(buffer));
      avatarUrl = `/uploads/avatars/${fileName}`;
    }

    const updated = await db.user.update({
      where: { id: user.id },
      data: { avatar: avatarUrl },
      select: { avatar: true },
    });

    return NextResponse.json({
      message: "Photo de profil mise à jour.",
      avatar: updated.avatar,
    });
  } catch (error) {
    console.error("Member avatar upload error", error);
    return NextResponse.json(
      { message: "Impossible de mettre à jour la photo de profil." },
      { status: 500 },
    );
  }
}

// DELETE /api/member/avatar - Supprime la photo de profil
export async function DELETE(request: NextRequest) {
  try {
    const user = await getSessionUser(
      request.cookies.get(SESSION_CONFIG.cookieName)?.value,
    );

    if (!user) {
      return NextResponse.json(
        { message: "Authentification requise." },
        { status: 401 },
      );
    }

    await db.user.update({
      where: { id: user.id },
      data: { avatar: null },
    });

    return NextResponse.json({ message: "Photo de profil supprimée." });
  } catch (error) {
    console.error("Member avatar delete error", error);
    return NextResponse.json(
      { message: "Impossible de supprimer la photo de profil." },
      { status: 500 },
    );
  }
}
