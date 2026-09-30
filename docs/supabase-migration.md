# Migration Supabase — Arche d'Amour

## ✅ Migration TERMINÉE

- Schéma PostgreSQL créé sur Supabase (`prisma db push`) — projet
  `wcrvagbqhluvhoasexjn`, région **eu-west-1 (Irlande)**
- Données importées : 30 lignes (église, 4 users, 2 profils, 3 diffusions Live, sessions)
- Storage actif : bucket `media` public, uploads vérifiés de bout en bout
- Login vérifié sur la base Supabase (`test.admin@archedamour.app`)
- Pages admin + membre vérifiées en navigateur sur les données Supabase

### Point crucial de connexion

- La connexion directe `db.<ref>.supabase.co:5432` est **IPv6-only** (échec
  sur réseau sans IPv6)
- Les nouveaux projets utilisent le préfixe pooler **`aws-1-`** (et non `aws-0-`)
- Chaîne fonctionnelle : `postgresql://postgres.<ref>:[MDP]@aws-1-eu-west-1.pooler.supabase.com:5432/postgres`
- Le serveur se lance avec `bun run dev:supabase` (écrase DATABASE_URL en
  mémoire depuis DATABASE_URL_SUPABASE, bascule auto vers le pooler IPv4,
  sans jamais lire .env)

## Étape 1 — Créer le projet Supabase (~5 min)

1. Aller sur **https://supabase.com** → **Sign in** (compte gratuit)
2. **New project** :
   - Name : `arche-damour`
   - Database Password : choisir un mot de passe fort et **le noter**
   - Region : `West EU (London)` ou la plus proche (Cameroun → Europe)
3. Attendre la fin du provisionnement (~2 min)

## Étape 2 — Récupérer les identifiants

Dans le dashboard Supabase :

**A. Chaîne de connexion base de données** (Project Settings → Database → Connection string → URI) :
- Prendre la chaîne **"Connection pooling"** (port 6543, recommandé pour Next.js)
- Remplacer `[YOUR-PASSWORD]` par le mot de passe de l'étape 1
- Exemple : `postgresql://postgres.abcdefgh:MOT_DE_PASSE@aws-0-eu-west-3.pooler.supabase.com:6543/postgres`

**B. Clés API** (Project Settings → API) :
- `Project URL` → `SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL`
- `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY` (⚠ secret, jamais côté client)

**C. Créer le bucket de stockage** (Storage → New bucket) :
- Name : `media`
- **Public bucket** : ✅ coché (les images doivent être servies publiquement)

## Étape 3 — Renseigner le fichier .env

Décommenter et compléter en fin de `.env` :

```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_STORAGE_BUCKET=media
DATABASE_URL=postgresql://postgres.abcdefgh:MOT_DE_PASSE@aws-0-eu-west-3.pooler.supabase.com:6543/postgres
```

Puis dire à l'agent : « les identifiants Supabase sont dans .env, termine la migration ».

## Ce que l'agent exécutera ensuite (automatique)

1. `prisma/schema.prisma` : `provider = "postgresql"` (déjà en attente d'un sed)
2. `bunx prisma generate` puis `bunx prisma db push`
3. `bun scripts/import-supabase.ts` (import des 30 lignes exportées)
4. Vérification : login, pages Live, upload d'image (bascule auto vers Supabase Storage dès que les clés sont présentes)
5. Création des buckets/policies Storage si nécessaire

## Notes techniques

- Le helper `src/lib/supabase-storage.ts` bascule **automatiquement** entre stockage local (`public/uploads`, dev) et Supabase Storage selon la présence des variables d'environnement — aucun changement de code nécessaire à la bascule.
- L'export `data.json` contient des hash de mots de passe : il est ignoré par git (`.gitignore`).
- La chaîne "Session pooler" (port 5432) fonctionne aussi si le pooler 6543 pose problème (Prisma fonctionne mieux en transaction mode sur 6543 ; ajouter `?pgbouncer=true&connection_limit=1` en cas d'erreur "prepared statement").
