/**
 * Lance Next.js avec DATABASE_URL pointant vers Supabase, sans jamais
 * lire ni modifier le fichier .env :
 * - bun charge .env automatiquement (DATABASE_URL = SQLite)
 * - ce script écrase la variable EN MÉMOIRE depuis DATABASE_URL_SUPABASE
 * - Next.js hérite de l'environnement du processus (la vraie env gagne
 *   toujours sur les fichiers .env)
 *
 * Usage : bun scripts/dev-supabase.ts [args next dev...]
 * (via package.json : bun run dev:supabase)
 */
import { spawn } from "child_process";

const direct = process.env.DATABASE_URL_SUPABASE ?? "";

if (!direct.startsWith("postgresql://") && !direct.startsWith("postgres://")) {
  console.error(
    "❌ DATABASE_URL_SUPABASE absente ou invalide (postgresql:// attendu).",
  );
  process.exit(1);
}

const url = new URL(direct);

let pgUrl = direct;
if (url.hostname.startsWith("db.")) {
  // Connexion directe (IPv6) → bascule vers le pooler IPv4 du projet
  const ref = url.hostname.replace(/^db\./, "").replace(/\.supabase\.co$/, "");
  pgUrl = `postgresql://postgres.${ref}:${url.password}@aws-1-eu-west-1.pooler.supabase.com:5432${url.pathname}`;
  console.log("→ Connexion directe détectée, bascule vers le pooler IPv4 (aws-1-eu-west-1)");
}

process.env.DATABASE_URL = pgUrl;
console.log("→ DATABASE_URL : pooler Supabase (aws-1-eu-west-1, session mode)");

const [cmd = "bunx", ...args] = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["bunx", "next", "dev", "-p", "3000"];

const child = spawn(cmd, args, {
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code) => process.exit(code ?? 0));
