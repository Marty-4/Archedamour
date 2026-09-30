/**
 * Exécute une commande avec DATABASE_URL pointant vers Supabase
 * (pris depuis DATABASE_URL_SUPABASE chargé par bun — le fichier .env
 * n'est jamais lu ni affiché par ce script).
 *
 * Usage : bun scripts/with-supabase-env.ts <commande...>
 * Exemple : bun scripts/with-supabase-env.ts bunx prisma db push
 */
import { spawnSync } from "child_process";

const supabaseUrl = process.env.DATABASE_URL_SUPABASE;

if (!supabaseUrl || !(supabaseUrl.startsWith("postgresql://") || supabaseUrl.startsWith("postgres://"))) {
  console.error(
    "❌ DATABASE_URL_SUPABASE absente ou invalide (elle doit commencer par postgresql://).",
  );
  process.exit(1);
}

// Connexion directe (db.<ref>.supabase.co, IPv6-only) → bascule vers le
// pooler IPv4 du projet (aws-1-eu-west-1, session mode).
const url = new URL(supabaseUrl);
if (url.hostname.startsWith("db.")) {
  const ref = url.hostname.replace(/^db\./, "").replace(/\.supabase\.co$/, "");
  process.env.DATABASE_URL = `postgresql://postgres.${ref}:${url.password}@aws-1-eu-west-1.pooler.supabase.com:5432${url.pathname}`;
} else {
  process.env.DATABASE_URL = supabaseUrl;
}

const [cmd, ...args] = process.argv.slice(2);
if (!cmd) {
  console.error("Usage : bun scripts/with-supabase-env.ts <commande...>");
  process.exit(1);
}

const result = spawnSync(cmd, args, {
  stdio: "inherit",
  env: process.env,
});

process.exit(result.status ?? 1);
