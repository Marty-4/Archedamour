/**
 * Restaure le mot de passe d'un compte de test (aucun secret affiché).
 * Usage : bun scripts/restore-test-password.ts <email> <nouveau-mdp>
 */
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth";

const [email, password] = process.argv.slice(2);
if (!email || !password) {
  console.error("Usage: bun scripts/restore-test-password.ts <email> <mdp>");
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
const hash = await hashPassword(password);
await prisma.user.update({ where: { email: email.toLowerCase() }, data: { password: hash } });
console.log(`Mot de passe mis à jour pour ${email}`);
await prisma.$disconnect();
