/**
 * Import des données exportées (scripts/supabase-export/data.json) vers Supabase (PostgreSQL).
 * Usage : bun scripts/import-supabase.ts
 *
 * Nécessite :
 *   - prisma/schema.prisma passé en provider "postgresql" + prisma generate
 *   - DATABASE_URL pointant vers Supabase (chaîne "Connection pooling" recommandée)
 *   - prisma db push exécuté
 */
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

/**
 * URL de connexion : priorité à DATABASE_URL si elle est déjà PostgreSQL,
 * sinon reconstruction depuis DATABASE_URL_SUPABASE via le pooler IPv4
 * (aws-1-eu-west-1, session mode) — le mot de passe n'est jamais affiché.
 */
function resolveDatabaseUrl(): string {
  const current = process.env.DATABASE_URL ?? "";
  if (current.startsWith("postgresql://") || current.startsWith("postgres://")) {
    return current;
  }

  const direct = process.env.DATABASE_URL_SUPABASE ?? "";
  if (direct.startsWith("postgresql://") || direct.startsWith("postgres://")) {
    const url = new URL(direct);
    if (url.hostname.startsWith("db.")) {
      const ref = url.hostname.replace(/^db\./, "").replace(/\.supabase\.co$/, "");
      return `postgresql://postgres.${ref}:${url.password}@aws-1-eu-west-1.pooler.supabase.com:5432${url.pathname}`;
    }
    return direct;
  }

  throw new Error("Aucune URL PostgreSQL disponible (DATABASE_URL ou DATABASE_URL_SUPABASE)");
}

const pg = new PrismaClient({
  datasources: { db: { url: resolveDatabaseUrl() } },
  log: ["error"],
});

type Json = string | number | boolean | null | Json[] | { [k: string]: Json };

type Row = Record<string, unknown> & { id: string };

function parseRow(model: string, row: Row): Row {
  const parsed: Row = { ...row };

  // Dates ISO -> Date
  const dateFields = [
    "createdAt", "updatedAt", "expiresAt", "foundedAt", "birthDate",
    "membershipDate", "baptismDate", "date", "startTime", "endTime",
    "registrationDeadline", "paymentDate", "conversionDate", "followUpDate",
    "requestDate", "scheduledDate", "scheduledStart", "scheduledEnd",
    "actualStart", "actualEnd", "answeredAt", "readAt", "completedAt",
    "enrolledAt", "joinedAt", "registeredAt",
  ];
  for (const field of dateFields) {
    if (typeof parsed[field] === "string") {
      parsed[field] = new Date(parsed[field] as string);
    }
  }

  // Champs JSON stockés en texte
  if (model === "marriage" && typeof parsed.documents === "string") {
    // déjà une string, ok
  }

  return parsed;
}

// Ordre d'import : parents avant enfants.
const MODELS = [
  "church",
  "user",
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

// Sessions en dernier (jetons de démo — rien d'indispensable)
const OPTIONAL_MODELS = ["session"] as const;

async function main() {
  const dataFile = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "supabase-export",
    "data.json",
  );
  const data = JSON.parse(readFileSync(dataFile, "utf8")) as Record<string, Row[]>;

  console.log("Import vers Supabase en cours...");

  for (const model of [...MODELS, ...OPTIONAL_MODELS]) {
    const rows = data[model];
    if (!rows || rows.length === 0) {
      console.log(`  ${model}: 0 ligne, ignoré`);
      continue;
    }

    const delegate = (pg as unknown as Record<string, { createMany: (args: { data: Row[]; skipDuplicates?: boolean }) => Promise<{ count: number }> }>)[model];
    if (!delegate) {
      console.warn(`  ⚠ Modèle introuvable côté client généré : ${model}`);
      continue;
    }

    try {
      const result = await delegate.createMany({
        data: rows.map((row) => parseRow(model, row)),
        skipDuplicates: true,
      });
      console.log(`  ${model}: ${result.count}/${rows.length} importé(s)`);
    } catch (error) {
      console.error(`  ❌ ${model} : échec de l'import`, error);
      throw error;
    }
  }

  console.log("\n✅ Import terminé.");
}

main()
  .catch((error) => {
    console.error("❌ Import échoué :", error);
    process.exit(1);
  })
  .finally(() => pg.$disconnect());
