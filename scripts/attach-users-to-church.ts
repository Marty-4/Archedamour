/**
 * Rattache à l'église Arche d'Amour tous les utilisateurs actifs qui n'ont
 * pas de MemberProfile (ou un profil pointant ailleurs). Idempotent.
 * Usage : bun scripts/attach-users-to-church.ts
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
}

const prisma = new PrismaClient();

// L'église (mono-église : première créée, création si base vierge).
let church = await prisma.church.findFirst({ orderBy: { createdAt: "asc" } });
if (!church) {
  church = await prisma.church.create({ data: { name: "Arche d'Amour" } });
  console.log("Église créée :", church.name);
}
console.log("Église de référence :", church.name, `(${church.id})`);

// Utilisateurs actifs sans profil ou avec un profil pointant ailleurs.
const users = await prisma.user.findMany({
  where: { status: "ACTIVE" },
  select: { id: true, name: true, memberProfile: { select: { id: true, churchId: true } } },
});

let created = 0;
let updated = 0;

for (const user of users) {
  const profile = user.memberProfile;
  if (!profile) {
    const parts = user.name?.trim().split(/\s+/) ?? [];
    await prisma.memberProfile.create({
      data: {
        userId: user.id,
        churchId: church.id,
        firstName: parts[0] ?? "Membre",
        lastName: parts.slice(1).join(" ") || "À compléter",
      },
    });
    created++;
    console.log(`+ profil créé pour ${user.name ?? user.id}`);
  } else if (profile.churchId !== church.id) {
    await prisma.memberProfile.update({ where: { id: profile.id }, data: { churchId: church.id } });
    updated++;
    console.log(`~ profil corrigé pour ${user.name ?? user.id}`);
  }
}

console.log(`\nTerminé : ${created} profil(s) créé(s), ${updated} corrigé(s), ${users.length} utilisateur(s) examiné(s).`);
await prisma.$disconnect();
