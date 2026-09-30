/**
 * API publique du live — GET /api/live
 * Renvoie les diffusions de l'église par défaut, sans authentification :
 * la page /live doit être accessible à tous (invités compris).
 * Aucune donnée sensible : titre, description, miniatures, statuts.
 */
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getChurchId } from "@/lib/church";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const churchId = await getChurchId();
    if (!churchId) {
      return NextResponse.json({ live: [], upcoming: [], past: [] });
    }

    const streams = await db.liveStream.findMany({
      where: { churchId },
      orderBy: [{ status: "asc" }, { scheduledStart: "desc" }],
      take: 50,
      select: {
        id: true,
        title: true,
        description: true,
        thumbnail: true,
        platform: true,
        streamUrl: true,
        mediaType: true,
        status: true,
        scheduledStart: true,
        viewerCount: true,
      },
    });

    return NextResponse.json({ streams });
  } catch (error) {
    console.error("[api/live] Erreur :", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Impossible de charger les diffusions" },
      { status: 500 },
    );
  }
}
