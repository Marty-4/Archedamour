import { PrismaClient, Prisma } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createDbClient> | undefined
  keepaliveTimer: ReturnType<typeof setInterval> | undefined
}

/**
 * Sécurité de connexion : si DATABASE_URL n'est pas une chaîne PostgreSQL
 * valide (ex : URL https du projet Supabase collée par erreur, SQLite résiduel,
 * variable absente), on bascule automatiquement sur DATABASE_URL_SUPABASE
 * (qui contient la vraie chaîne de connexion, via le pooler IPv4 si besoin).
 * Rend l'application robuste quel que soit le lanceur (bun run dev, npm run dev,
 * docker, etc.) — sans jamais lire ni écrire le fichier .env.
 */
function resolveDatabaseUrl(): string | undefined {
  const current = process.env.DATABASE_URL
  const isPg =
    !!current &&
    (current.startsWith('postgresql://') || current.startsWith('postgres://'))
  if (isPg) return current

  const fallback = process.env.DATABASE_URL_SUPABASE
  if (!fallback) {
    if (current) {
      // DATABASE_URL existe mais est invalide : on la retire pour que l'erreur
      // Prisma soit claire (URL invalide) plutôt qu'un mauvais protocole.
      console.warn(
        '[db] DATABASE_URL invalide (postgresql:// attendu) et DATABASE_URL_SUPABASE absente.',
      )
      return undefined
    }
    return undefined
  }

  const url = new URL(fallback)
  if (url.hostname.startsWith('db.')) {
    // Connexion directe Supabase (IPv6-only) → bascule vers le pooler IPv4.
    const ref = url.hostname.replace(/^db\./, '').replace(/\.supabase\.co$/, '')
    const pooler = `postgresql://postgres.${ref}:${url.password}@aws-1-eu-west-1.pooler.supabase.com:5432${url.pathname}`
    console.log(
      '[db] DATABASE_URL invalide → bascule automatique vers DATABASE_URL_SUPABASE (pooler IPv4).',
    )
    return pooler
  }

  console.log(
    '[db] DATABASE_URL invalide → bascule automatique vers DATABASE_URL_SUPABASE.',
  )
  return fallback
}

const resolvedUrl = resolveDatabaseUrl()
if (resolvedUrl) process.env.DATABASE_URL = resolvedUrl

/**
 * Le réseau local vers le pooler Supabase est intermittent (erreurs P1001 /
 * P1002 « Can't reach database server » sur les connexions froides).
 * Cette extension retente automatiquement chaque requête jusqu'à 3 fois.
 */
const retryExtension = Prisma.defineExtension((client) =>
  client.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          const MAX_RETRIES = 3;
          let lastError: unknown;

          for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
              return await query(args);
            } catch (error) {
              lastError = error;
              const message = error instanceof Error ? error.message : '';
              const retryable =
                message.includes("Can't reach database server") ||
                message.includes('P1001') ||
                message.includes('P1002') ||
                message.includes('Timed out fetching');

              if (!retryable || attempt === MAX_RETRIES - 1) throw error;
              await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
            }
          }

          throw lastError;
        },
      },
    },
  }),
)

function createDbClient() {
  return new PrismaClient({
    log: ['query'],
  }).$extends(retryExtension)
}

export const db = globalForPrisma.prisma ?? createDbClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

/**
 * Keepalive : maintient le pool de connexions chaud vers le pooler Supabase
 * (les reconnexions froides échouent parfois sur ce réseau avec P1001).
 */
if (!globalForPrisma.keepaliveTimer) {
  globalForPrisma.keepaliveTimer = setInterval(() => {
    db.$queryRaw`SELECT 1`.catch(() => {
      // Échec silencieux : la prochaine requête rétablira la connexion.
    })
  }, 45_000)

  // Ne bloque pas la fermeture du process.
  if (typeof globalForPrisma.keepaliveTimer.unref === 'function') {
    globalForPrisma.keepaliveTimer.unref()
  }
}
