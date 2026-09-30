# Architecture Technique - Arche d'Amour

Ce document décrit l'architecture technique de la plateforme **Arche d'Amour**.

## 📋 Table des Matières

- [🏗 Vue d'Ensemble](#-vue-densemble)
- [🌐 Architecture Frontend](#-architecture-frontend)
- [🖥 Architecture Backend](#-architecture-backend)
- [🗄 Base de Données](#-base-de-données)
- [🔌 Services Externes](#-services-externes)
- [🔄 Flux de Données](#-flux-de-données)
- [🔐 Architecture de Sécurité](#-architecture-de-sécurité)
- [📦 Structure des Fichiers](#-structure-des-fichiers)

---

## 🏗 Vue d'Ensemble

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Browser)                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                    Next.js Application (App Router)                  │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐  │  │
│  │  │   Pages     │  │   Components │  │      React Query Cache       │  │  │
│  │  │  (SSR/SSG)  │  │   (shadcn)   │  │   (TanStack Query)          │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────────┘  │  │
│  │                                                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐│  │
│  │  │                        Socket.IO Client                            ││  │
│  │  │  (Connexion à ws://localhost:3001 ou wss://domain.com)            ││  │
│  │  └─────────────────────────────────────────────────────────────────┘│  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                        Service Worker (PWA)                           │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SERVEUR NEXT.JS (Port 3000)                         │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                      Middleware (Security Headers)                    │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                         API Routes (/api/*)                            │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐  │  │
│  │  │   Auth      │  │   Admin     │  │      Autres Endpoints        │  │  │
│  │  │  /auth/*    │  │  /admin/*   │  │      /groupes, /member, etc.  │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                      Pages Server Components                          │  │
│  │  (SSR pour /admin, /member, etc.)                                     │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
              ┌───────────────────────┼───────────────────┐
              ▼                       ▼                   ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│   PostgreSQL    │   │   Socket.IO      │   │    Storage      │
│   (Supabase)    │   │   Server         │   │   (Supabase)    │
│                 │   │   (Port 3001)    │   │                 │
│  - Prisma ORM   │   │  - Reverb        │   │  - Uploads      │
│  - Users        │   │  - Notifications │   │  - Images       │
│  - Sessions     │   │  - Live Chat     │   │  - Videos       │
│  - Groups       │   │  - Live Stream   │   │                 │
│  - Posts        │   │  - Group Chat    │   │                 │
│  - ...          │   └─────────────────┘   └─────────────────┘
└─────────────────┘
```

---

## 🌐 Architecture Frontend

### Framework
- **Next.js 16.1.1** avec App Router
- **TypeScript** pour le typage statique
- **Bun** comme runtime (alternative à Node.js)

### UI Components
- **Tailwind CSS v4** pour le styling
- **shadcn/ui** pour les composants accessibles
- **Radix UI** comme base pour les composants
- **Framer Motion** pour les animations
- **Lucide React** pour les icônes

### Gestion d'État
- **Zustand** pour le state management global
- **React Query (TanStack Query)** pour le cache et la synchronisation des données
- **Context API** pour le thème et l'authentification

### Fonctionnalités Clés
- **PWA** (Progressive Web App) avec Service Worker
- **Dark Mode** avec next-themes
- **Internationalisation** avec next-intl (prêt pour le multilingue)
- **Formulaires** avec React Hook Form + Zod

### Structure des Pages

```
src/app/
├── (public)/          # Pages publiques (accès sans authentification)
│   ├── page.tsx      # Page d'accueil
│   ├── login/
│   ├── register/
│   ├── about/
│   └── ...
├── (auth)/           # Pages nécessitant authentification
│   ├── member/
│   │   └── page.tsx  # Dashboard membre
│   └── admin/
│       └── page.tsx  # Dashboard admin
├── api/              # API Routes
│   ├── auth/
│   ├── admin/
│   └── ...
└── layout.tsx        # Layout principal
```

---

## 🖥 Architecture Backend

### Serveur Next.js
- **API Routes** pour toutes les requêtes HTTP
- **Middleware** pour la protection des routes et les headers de sécurité
- **Server Components** pour le rendu côté serveur
- **Static Generation** pour les pages publiques

### Endpoints API Principaux

#### Authentification (`/api/auth/*`)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/login` | Connexion avec email/mot de passe |
| POST | `/register` | Inscription d'un nouvel utilisateur |
| POST | `/logout` | Déconnexion |
| GET | `/me` | Récupérer l'utilisateur actuel |
| POST | `/refresh` | Rafraîchir le token de session |
| POST | `/forgot-password` | Demander une réinitialisation |
| POST | `/reset-password` | Réinitialiser le mot de passe |
| POST | `/validate-token` | Valider un token de session |

#### Administration (`/api/admin/*`)
- Gestion des utilisateurs
- Gestion des rôles et permissions
- Configuration de l'église
- Statistiques

#### Groupes (`/api/groupes/*`)
- CRUD des groupes
- Gestion des membres
- Messages de groupe

#### Contenu (`/api/*`)
- Sermons
- Événements
- Posts et commentaires
- Demandes de prière

### Middleware
- **Vérification des sessions** pour `/admin/*` et `/member/*`
- **Headers de sécurité** (CSP, X-Frame-Options, etc.)
- **Rate Limiting** sur les endpoints sensibles

---

## 🗄 Base de Données

### Provider
- **PostgreSQL** via **Supabase**
- **Prisma ORM** pour l'accès à la base

### Schéma Principal

#### Modèles Utilisateurs
- **User** : Utilisateurs (email, password hash, rôle, statut)
- **Session** : Sessions actives (token, userId, expiration)
- **MemberProfile** : Profil détaillé des membres

#### Modèles Église
- **Church** : Église (nom, adresse, logo, etc.)
- **Department** : Départements (jeunesse, louange, etc.)
- **Group** : Groupes de vie
- **GroupMember** : Membres des groupes
- **GroupMessage** : Messages des groupes

#### Modèles Contenu
- **Service** : Cultes et événements religieux
- **Sermon** : Prédications (vidéo, audio, PDF, texte)
- **SermonSeries** / **SermonCategory** : Organisation
- **Event** : Événements spéciaux
- **EventRegistration** : Inscriptions aux événements
- **Post** : Publications (témoignages, demandes de prière)
- **Comment** : Commentaires
- **Like** : Réactions

#### Modèles Finances
- **Donation** : Dons des membres
- **DonationCategory** : Catégories de dons

#### Modèles Communauté
- **PrayerRequest** : Demandes de prière
- **PrayerInteraction** : Interactions avec les demandes

#### Modèles Live
- **LiveStream** : Streams en direct

#### Modèles Éducation
- **Course** / **CourseModule** / **Lesson** : Cours en ligne
- **Enrollment** : Inscriptions aux cours

#### Modèles Sacrements
- **Baptism** : Baptêmes
- **Marriage** : Mariages
- **Conversion** : Suivi des conversions
- **PastoralFollowUp** : Suivi pastoral

#### Modèles Bible
- **BibleBook** / **BibleVerse** : Versets bibliques
- **DailyVerse** : Verset du jour

#### Modèles Notifications
- **Notification** : Notifications utilisateur

### Relations
- **1:N** : Un utilisateur a plusieurs sessions, posts, commentaires, etc.
- **N:M** : Groupes ↔ Utilisateurs (via GroupMember)
- **Polymorphiques** : Le modèle Report peut cibler User, Post ou Comment

### Index
- Index optimisés sur les champs fréquemment interrogés (userId, churchId, date, etc.)

---

## 🔌 Services Externes

### 1. Service WebSocket (Reverb)
- **Technologie** : Socket.IO v4.8.4
- **Port** : 3001
- **Fonctionnalités** :
  - Notifications en temps réel
  - Chat de groupe
  - Live streaming (diffusion, chat, réactions)
  - Présence des utilisateurs
  - Indicateurs de frappe

#### Canaux WebSocket
| Canal | Description | Événements |
|-------|-------------|------------|
| `notifications` | Alertes en temps réel | `subscribe`, `read` |
| `live:*` | Diffusion en direct | `join`, `leave`, `message`, `reaction`, `signal` |
| `group:*` | Chat de groupe | `join`, `leave`, `message` |
| `prayers` | Demandes de prière | `subscribe`, `pray-for-me` |
| `admin` | Contrôle admin | `subscribe`, `notification`, `live:status` |

### 2. Supabase
- **Base de données PostgreSQL** managée
- **Authentification** (optionnelle, non utilisée actuellement)
- **Storage** pour les uploads de fichiers
- **Realtime** pour les subscriptions (non utilisé, remplacé par Socket.IO)

### 3. Upstash Redis
- **Rate Limiting** distribué
- **Cache** pour les requêtes fréquentes (optionnel)

### 4. Sentry (Optionnel)
- **Monitoring des erreurs** en production
- **Performance Monitoring**
- **Release Tracking**

---

## 🔄 Flux de Données

### Flux d'Authentification

```
┌─────────┐     POST /api/auth/login      ┌─────────────┐
│ Client  │ ───────────────────────────► │   Server    │
│         │   {email, password}           │             │
└─────────┘                               └──────┬──────┘
                                           │
                                           ▼
                                    ┌─────────────┐
                                    │  Validate   │
                                    │  Credentials│
                                    └──────┬──────┘
                                           │
                                           ▼
                                    ┌─────────────┐
                                    │ Generate    │
                                    │ Session     │
                                    │ Token       │
                                    └──────┬──────┘
                                           │
                                           ▼
                                    ┌─────────────┐
                                    │  Store      │
                                    │  Session in │
                                    │  Database   │
                                    └──────┬──────┘
                                           │
                                           ▼
┌─────────┐     {success, user} +        ┌─────────────┐
│ Client  │ ◄─────────────────────────── │   Server    │
│         │   Set-Cookie: session_token   │             │
└─────────┘                               └─────────────┘
```

### Flux de Chat de Groupe

```
┌─────────┐                              ┌─────────────┐
│ Client  │                              │   Server    │
│         │                              │             │
└────┬────┘                              └──────┬──────┘
     │                                           │
     │ 1. Connect to WebSocket                   │
     │ ───────────────────────────────────────► │
     │   (with session token)                    │
     │                                           │
     │ 2. Validate token via API                 │
     │ ◄─────────────────────────────────────── │
     │                                           │
     │ 3. Join group room                        │
     │ ───────────────────────────────────────► │
     │   {groupId: "abc123"}                     │
     │                                           │
     │ 4. Verify group membership                │
     │ ◄─────────────────────────────────────── │
     │   (via /api/groupes/:id/members/:userId)  │
     │                                           │
     │ 5. Send message                           │
     │ ───────────────────────────────────────► │
     │   {groupId, message}                      │
     │                                           │
     │ 6. Broadcast to group                     │
     │ ◄─────────────────────────────────────── │
     │   (to all members in room)                │
     │                                           │
     ▼                                           ▼
```

### Flux de Live Streaming

```
┌─────────┐                              ┌─────────────┐
│ Client  │                              │   Server    │
│ (Streamer)                              │             │
└────┬────┘                              └──────┬──────┘
     │                                           │
     │ 1. Start live stream                     │
     │ ───────────────────────────────────────► │
     │   (via admin panel)                      │
     │                                           │
     │ 2. Join live room                        │
     │ ◄─────────────────────────────────────── │
     │   {streamId: "live123"}                  │
     │                                           │
     │ 3. Send video/audio                      │
     │ ───────────────────────────────────────► │
     │   (via WebRTC or RTMP)                   │
     │                                           │
     │ 4. Broadcast to viewers                  │
     │ ◄─────────────────────────────────────── │
     │   (to all in live:streamId room)          │
     │                                           │
┌────┴────┐                              ┌──────┴──────┐
│ Viewers │                              │   Server    │
│         │                              │             │
└────┬────┘                              └──────┬──────┘
     │                                           │
     │ 5. Join live room                        │
     │ ───────────────────────────────────────► │
     │   {streamId: "live123"}                  │
     │                                           │
     │ 6. Receive stream                         │
     │ ◄─────────────────────────────────────── │
     │   (video/audio data)                     │
     │                                           │
     │ 7. Send chat message                      │
     │ ───────────────────────────────────────► │
     │   {streamId, message}                     │
     │                                           │
     │ 8. Broadcast chat message                 │
     │ ◄─────────────────────────────────────── │
     │   (to all in live:streamId room)          │
```

---

## 🔐 Architecture de Sécurité

### Couches de Sécurité

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT                                  │
├─────────────────────────────────────────────────────────────┤
│  ✓ HTTPS (TLS 1.3)                                           │
│  ✓ Cookies Secure + HttpOnly + SameSite=Strict              │
│  ✓ CSP (Content Security Policy)                             │
│  ✓ X-Frame-Options: DENY                                     │
│  ✓ X-Content-Type-Options: nosniff                           │
│  ✓ X-XSS-Protection: 1; mode=block                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      MIDDLEWARE                               │
├─────────────────────────────────────────────────────────────┤
│  ✓ Vérification du cookie de session                         │
│  ✓ Rate Limiting (10 req/10min sur /api/auth/login)         │
│  ✓ Headers de sécurité ajoutés à toutes les réponses        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND                                  │
├─────────────────────────────────────────────────────────────┤
│  ✓ Validation des inputs avec Zod                            │
│  ✓ Hachage des mots de passe avec Argon2                     │
│  ✓ Lockout après 5 tentatives échouées (15 min)             │
│  ✓ Vérification de l'email (optionnelle)                     │
│  ✓ Logging structuré avec Pino                              │
│  ✓ Tokens de session stockés en base de données              │
│  ✓ Refresh tokens pour les sessions longues                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      BASE DE DONNÉES                          │
├─────────────────────────────────────────────────────────────┤
│  ✓ PostgreSQL avec Prisma ORM                               │
│  ✓ Soft delete sur les modèles sensibles                     │
│  ✓ Index optimisés pour les requêtes fréquentes             │
│  ✓ Backups automatiques (à configurer)                       │
└─────────────────────────────────────────────────────────────┘
```

### Flux d'Authentification Sécurisé

```
1. Client envoie email + password (HTTPS)
   ↓
2. Serveur valide les inputs avec Zod
   ↓
3. Serveur vérifie le rate limiting (10 req/10min)
   ↓
4. Serveur cherche l'utilisateur en base
   ↓
5. Serveur vérifie le mot de passe avec Argon2
   ↓
6. Serveur vérifie le statut de l'utilisateur (ACTIVE, non locked)
   ↓
7. Serveur vérifie emailVerified (si activé)
   ↓
8. Serveur génère un token de session aléatoire
   ↓
9. Serveur stocke le token en base avec expiration (7 jours)
   ↓
10. Serveur génère/rafraîchit le refresh token (30 jours)
    ↓
11. Serveur retourne la réponse avec :
    - Cookie HTTP-only, Secure, SameSite=Strict (session token)
    - Cookie HTTP-only, Secure, SameSite=Strict (refresh token)
    - Données utilisateur (sans mot de passe)
    ↓
12. Client stocke les cookies (inaccessibles via JavaScript)
    ↓
13. Pour chaque requête suivante :
    - Client envoie le cookie de session
    - Middleware vérifie la présence du cookie
    - API valide le token en base (via /api/auth/me)
    - Si valide, autorise l'accès
    - Si invalide, retourne 401
```

### Protection contre les Attaques

| Attaque | Protection | Implémentation |
|---------|------------|----------------|
| XSS | Cookies HttpOnly, CSP | ✅ |
| CSRF | SameSite=Strict, CSRF tokens | ✅ (SameSite) |
| SQL Injection | Prisma ORM (pas de raw queries) | ✅ |
| Brute Force | Rate Limiting + Lockout | ✅ |
| Session Hijacking | Tokens aléatoires, HTTPS | ✅ |
| Clickjacking | X-Frame-Options: DENY | ✅ |
| MIME Sniffing | X-Content-Type-Options: nosniff | ✅ |
| Email Enumeration | Message générique pour email invalide | ✅ |

---

## 📦 Structure des Fichiers

```
arche-damour/
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD avec GitHub Actions
├── .vscode/
├── public/                    # Assets statiques
│   ├── icons/                 # Favicons et icônes
│   ├── manifest.json          # Manifest PWA
│   └── ...
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (public)/          # Pages publiques
│   │   ├── (auth)/            # Pages authentifiées
│   │   ├── api/               # API Routes
│   │   │   ├── auth/          # Authentification
│   │   │   ├── admin/         # Administration
│   │   │   ├── groupes/       # Groupes
│   │   │   └── ...
│   │   ├── layout.tsx         # Layout principal
│   │   ├── page.tsx           # Page d'accueil
│   │   └── globals.css        # Styles globaux
│   ├── components/            # Composants React
│   │   ├── layouts/           # Layouts
│   │   ├── ui/                # Composants shadcn
│   │   └── ...
│   ├── hooks/                 # Hooks React
│   ├── lib/                   # Utilitaires
│   │   ├── auth.ts            # Authentification
│   │   ├── db.ts              # Client Prisma
│   │   ├── logger.ts          # Logging (Pino)
│   │   ├── rate-limit.ts      # Rate Limiting
│   │   ├── validations.ts     # Schémas Zod
│   │   ├── pagination.ts      # Pagination
│   │   ├── api.ts             # Client API
│   │   └── sentry.ts           # Sentry
│   ├── providers/             # Providers React
│   │   └── query-provider.tsx # React Query
│   ├── stores/                # Zustand stores
│   └── types/                 # Types TypeScript
├── prisma/
│   ├── schema.prisma          # Schéma de la base
│   └── migrations/            # Migrations
├── mini-services/
│   └── reverb-service/        # Service WebSocket
│       ├── index.ts           # Serveur Socket.IO
│       └── package.json
├── scripts/                   # Scripts utilitaires
├── .env.local                 # Variables d'environnement
├── .gitignore
├── Caddyfile                  # Configuration Caddy
├── next.config.ts             # Configuration Next.js
├── tailwind.config.ts         # Configuration Tailwind
├── tsconfig.json              # Configuration TypeScript
├── package.json               # Dépendances
├── bun.lock                   # Lockfile Bun
├── README.md                  # Documentation
└── docs/                      # Documentation technique
    └── ARCHITECTURE.md         # Ce fichier
```

---

## 📞 Contact

Pour toute question concernant l'architecture, veuillez contacter l'équipe de développement ou ouvrir une issue sur GitHub.

---

**© 2024 Arche d'Amour. Tous droits réservés.**
