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
const live = await prisma.liveStream.findFirst({ where: { status: "LIVE" } });
console.log(JSON.stringify({ id: live?.id, title: live?.title, platform: live?.platform, actualStart: live?.actualStart }, null, 2));
await prisma.$disconnect();
