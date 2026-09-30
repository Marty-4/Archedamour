/**
 * Crée (si absents) des comptes de test pour chaque rôle, dans le groupe/département idoine.
 * Usage : bun scripts/seed-roles.ts
 */
import { PrismaClient } from "@prisma/client";
import { pbkdf2Sync, randomBytes } from "crypto";

function hashPassword(password: string): string {
  const iterations = 310_000;
  const salt = randomBytes(16);
  const derivedKey = pbkdf2Sync(password, salt, iterations, 32, "sha256");
  return `pbkdf2$sha256$${iterations}$${salt.toString("hex")}$${derivedKey.toString("hex")}`;
}

function resolveDatabaseUrl(): string {
  const current = process.env.DATABASE_URL ?? "";
  if (current.startsWith("postgresql://") || current.startsWith("postgres://")) return current;
  const direct = process.env.DATABASE_URL_SUPABASE ?? "";
  if (direct.startsWith("postgresql://")) {
    const url = new URL(direct);
    const ref = url.hostname.replace(/^db\./, "").replace(/\.supabase\.co$/, "");
    return `postgresql://postgres.${ref}:${url.password}@aws-1-eu-west-1.pooler.supabase.com:5432${url.pathname}`;
  }
  throw new Error("Aucune URL PostgreSQL");
}

const db = new PrismaClient({ datasources: { db: { url: resolveDatabaseUrl() } }, log: ["error"] });

const PASSWORD = "test1234";

const ACCOUNTS = [
  { email: "superadmin@test.arche", name: "Super Admin", role: "SUPER_ADMIN" },
  { email: "pasteur@test.arche", name: "Pasteur Principal", role: "PASTOR" },
  { email: "tresorier@test.arche", name: "Trésorier", role: "TREASURER" },
  { email: "responsable@test.arche", name: "Responsable Département", role: "DEPARTMENT_HEAD" },
  { email: "moderateur@test.arche", name: "Modérateur", role: "MODERATOR" },
  { email: "membre@test.arche", name: "Membre Simple", role: "MEMBER" },
] as const;

async function main() {
  const church = await db.church.findFirst();
  if (!church) throw new Error("Aucune église en base");

  for (const account of ACCOUNTS) {
    const user = await db.user.upsert({
      where: { email: account.email },
      update: {},
      create: {
        email: account.email,
        name: account.name,
        password: hashPassword(PASSWORD),
        role: account.role,
        status: "ACTIVE",
        emailVerified: true,
      },
    });

    await db.memberProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        churchId: church.id,
        firstName: account.name.split(" ")[0],
        lastName: account.name.split(" ").slice(1).join(" ") || account.role,
      },
    });

    console.log(`✅ ${account.role.padEnd(16)} ${account.email} / ${PASSWORD}`);
  }

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(() => db.$disconnect());
