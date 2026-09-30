/**
 * Liste les contraintes de la table `reports` (et `group_messages`) dans la base
 * Supabase — noms publics uniquement, aucun secret.
 * Usage : bun scripts/inspect-constraints.ts
 */
import { PrismaClient } from "@prisma/client";

const direct = process.env.DATABASE_URL_SUPABASE ?? "";
if (!direct.startsWith("postgres")) {
  console.error("DATABASE_URL_SUPABASE absente");
  process.exit(1);
}
const url = new URL(direct);
let dbUrl = direct;
if (url.hostname.startsWith("db.")) {
  const ref = url.hostname.replace(/^db\./, "").replace(/\.supabase\.co$/, "");
  dbUrl = `postgresql://postgres.${ref}:${url.password}@aws-1-eu-west-1.pooler.supabase.com:5432${url.pathname}`;
}
process.env.DATABASE_URL = dbUrl;

const prisma = new PrismaClient();

const fks = await prisma.$queryRaw<{ conname: string; confrelid: string }[]>`
  SELECT conname, confrelid::regclass::text AS confrelid
  FROM pg_constraint
  WHERE conrelid = 'reports'::regclass AND contype = 'f'
  ORDER BY conname`;
console.log("Contraintes FK de la table reports :");
for (const fk of fks) console.log(" -", fk.conname, "→", fk.confrelid);

await prisma.$disconnect();
