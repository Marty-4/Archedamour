/**
 * Diagnostic mot de passe : vérifie le hash stocké pour un email donné
 * avec les VRAIES fonctions de src/lib/auth.ts. N'affiche jamais le hash
 * complet ni aucun secret (seulement des verdicts).
 * Usage : bun scripts/verify-password.ts <email> <mot-de-passe-1> <mot-de-passe-2>
 */
import { PrismaClient } from "@prisma/client";
import { verifyPassword } from "../src/lib/auth";

const [email, ...passwords] = process.argv.slice(2);
if (!email || passwords.length === 0) {
  console.error("Usage: bun scripts/verify-password.ts <email> <mdp1> [mdp2]");
  process.exit(1);
}

const direct = process.env.DATABASE_URL_SUPABASE ?? "";
if (!direct.startsWith("postgres")) {
  console.error("DATABASE_URL_SUPABASE absente");
  process.exit(1);
}
const url = new URL(direct);
if (url.hostname.startsWith("db.")) {
  const ref = url.hostname.replace(/^db\./, "").replace(/\.supabase\.co$/, "");
  process.env.DATABASE_URL = `postgresql://postgres.${ref}:${url.password}@aws-1-eu-west-1.pooler.supabase.com:5432${url.pathname}`;
}

const prisma = new PrismaClient();
const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
if (!user) {
  console.log("UTILISATEUR INTROUVABLE");
  process.exit(0);
}

const algo = user.password.startsWith("pbkdf2$")
  ? `pbkdf2 (${user.password.split("$")[2]} itérations)`
  : `format inconnu: ${user.password.slice(0, 12)}…`;
console.log(`Hash stocké : ${algo}`);

for (const pw of passwords) {
  const ok = await verifyPassword(pw, user.password);
  console.log(`Mot de passe "${pw.slice(0, 3)}…" (${pw.length} car.) : ${ok ? "VALIDE ✅" : "invalide ❌"}`);
}

await prisma.$disconnect();
