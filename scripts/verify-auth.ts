/**
 * Vérification base : compte les utilisateurs (aucun secret affiché).
 * Usage : bun scripts/verify-auth.ts
 */
import { PrismaClient } from "@prisma/client";

const direct = process.env.DATABASE_URL_SUPABASE ?? "";
if (!direct.startsWith("postgres")) {
  console.error("DATABASE_URL_SUPABASE absente");
  process.exit(1);
}
const url = new URL(direct);
if (url.hostname.startsWith("db.")) {
  const ref = url.hostname.replace(/^db\./, "").replace(/\.supabase\.co$/, "");
  process.env.DATABASE_URL = `postgresql://postgres.${ref}:${url.password}@aws-1-eu-west-1.pooler.supabase.com:5432${url.pathname}`;
} else {
  process.env.DATABASE_URL = direct;
}

const prisma = new PrismaClient();
const count = await prisma.user.count();
console.log(`NB_USERS=${count}`);
await prisma.$disconnect();
