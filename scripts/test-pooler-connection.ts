/**
 * Teste la connexion Prisma au pooler Supabase (IPv4) en réécrivant
 * DATABASE_URL_SUPABASE en mémoire (le mot de passe n'est jamais affiché).
 * Usage : bun scripts/test-pooler-connection.ts
 */
import { PrismaClient } from "@prisma/client";

const direct = process.env.DATABASE_URL_SUPABASE ?? "";
let ref = "";
let password = "";
try {
  const url = new URL(direct);
  ref = url.hostname.replace(/^db\./, "").replace(/\.supabase\.co$/, "");
  password = url.password;
  if (!ref || !password) throw new Error("URL incomplète");
} catch (e) {
  console.error("DATABASE_URL_SUPABASE invalide :", (e as Error).message);
  process.exit(1);
}

const regions = [
  "eu-west-3",
  "eu-central-1",
  "eu-west-1",
  "eu-west-2",
  "us-east-1",
  "us-east-2",
  "us-west-1",
  "sa-east-1",
  "ap-southeast-1",
  "ap-southeast-2",
  "ap-northeast-1",
  "ap-northeast-2",
  "ap-south-1",
  "ca-central-1",
];

function buildUrl(region: string, port: number) {
  return `postgresql://postgres.${ref}:${password}@aws-0-${region}.pooler.supabase.com:${port}/postgres`;
}

async function tryUrl(label: string, url: string): Promise<boolean> {
  const client = new PrismaClient({
    datasources: { db: { url } },
    log: ["error"],
  });
  try {
    const res = (await client.$queryRaw`SELECT version() as v`) as { v: string }[];
    console.log(`✅ ${label} : connecté`);
    console.log(`   ${res[0]?.v?.slice(0, 60)}...`);
    return true;
  } catch (e) {
    console.log(`❌ ${label} : ${(e as Error).message.slice(0, 120)}`);
    return false;
  } finally {
    await client.$disconnect().catch(() => {});
  }
}

async function main() {
  for (const region of regions) {
    for (const port of [5432, 6543]) {
      const ok = await tryUrl(`aws-0-${region}:${port}`, buildUrl(region, port));
      if (ok) {
        console.log(
          `\n🎉 Chaîne fonctionnelle (mot de passe à réutiliser tel quel) :\n` +
            `postgresql://postgres.${ref}:[MOT_DE_PASSE]@aws-0-${region}.pooler.supabase.com:${port}/postgres`,
        );
        process.exit(0);
      }
    }
  }
  console.error("\nAucune connexion possible via les poolers testés.");
  process.exit(1);
}

main();
