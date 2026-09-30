/**
 * Export des données SQLite vers scripts/supabase-export/data.json
 * Usage : bun scripts/export-sqlite.ts
 */
import { writeFileSync, mkdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

const sqlite = new PrismaClient();

// Ordre d'export : parents avant enfants (pratique pour l'import).
const MODELS = [
  "church",
  "user",
  "session",
  "department",
  "group",
  "groupMember",
  "memberProfile",
  "service",
  "event",
  "eventRegistration",
  "sermonSeries",
  "sermonCategory",
  "sermon",
  "bibleBook",
  "bibleVerse",
  "dailyVerse",
  "prayerRequest",
  "prayerInteraction",
  "donationCategory",
  "donation",
  "conversion",
  "pastoralFollowUp",
  "baptism",
  "marriage",
  "liveStream",
  "post",
  "comment",
  "like",
  "report",
  "course",
  "courseModule",
  "lesson",
  "enrollment",
  "notification",
] as const;

type Json = string | number | boolean | null | Json[] | { [k: string]: Json };

function serialize(value: unknown): Json {
  if (value instanceof Date) return value.toISOString();
  if (value === null) return null;
  if (Array.isArray(value)) return value.map(serialize);
  if (typeof value === "object") {
    const out: { [k: string]: Json } = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = serialize(v);
    }
    return out;
  }
  if (typeof value === "number" || typeof value === "string" || typeof value === "boolean") {
    return value;
  }
  return null;
}

async function main() {
  console.log("Export SQLite en cours...");

  const data: Record<string, unknown[]> = {};
  let total = 0;

  for (const model of MODELS) {
    const delegate = (sqlite as unknown as Record<string, { findMany: () => Promise<unknown[]> }>)[model];
    if (!delegate) {
      console.warn(`⚠ Modèle ignoré : ${model}`);
      continue;
    }
    const rows = await delegate.findMany();
    data[model] = rows.map(serialize);
    total += rows.length;
    console.log(`  ${model}: ${rows.length} ligne(s)`);
  }

  const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "supabase-export");
  mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, "data.json");
  writeFileSync(outFile, JSON.stringify(data, null, 2));

  console.log(`\n✅ ${total} lignes exportées vers ${outFile}`);
}

main()
  .catch((error) => {
    console.error("❌ Export échoué :", error);
    process.exit(1);
  })
  .finally(() => sqlite.$disconnect());
