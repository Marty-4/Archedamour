# Arche d'Amour - Plateforme de Gestion d'Église

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16.1.1-000000.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4.svg)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.11.1-2D3748.svg)](https://www.prisma.io/)

**Arche d'Amour** est une plateforme numérique complète pour la gestion de votre église. Elle offre des fonctionnalités pour gérer les membres, les événements, les dons, les groupes de vie, les cultes en direct, et bien plus encore.

## 📋 Table des Matières

- [🚀 Démarrage Rapide](#-démarrage-rapide)
- [🛠 Prérequis](#-prérequis)
- [📦 Installation](#-installation)
- [🏗 Configuration](#-configuration)
- [🚀 Scripts Disponibles](#-scripts-disponibles)
- [🏛 Architecture](#-architecture)
- [🔐 Sécurité](#-sécurité)
- [📚 Documentation API](#-documentation-api)
- [🤝 Contribution](#-contribution)
- [📜 Licence](#-licence)

---

## 🚀 Démarrage Rapide

### Développement Local

```bash
# Cloner le dépôt
git clone https://github.com/votre-organisation/arche-damour.git
cd arche-damour

# Installer les dépendances avec Bun
bun install

# Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos configurations

# Générer le client Prisma
bun run db:generate

# Appliquer les migrations de la base de données
bun run db:push

# Démarrer le serveur de développement
bun run dev

# Dans un autre terminal, démarrer le service WebSocket
bun run dev:ws
```

Votre application sera disponible à [http://localhost:3000](http://localhost:3000)
Le service WebSocket sera disponible à [ws://localhost:3001](ws://localhost:3001)

---

## 🛠 Prérequis

- [Bun](https://bun.sh/) (v1.3.0 ou supérieur) - Runtime JavaScript
- [Node.js](https://nodejs.org/) (v18.0.0 ou supérieur) - Optionnel, pour certains outils
- [PostgreSQL](https://www.postgresql.org/) - Base de données (via Supabase recommandé)
- [Git](https://git-scm.com/) - Contrôle de version

---

## 📦 Installation

### 1. Installer Bun

```bash
# Sur macOS/Linux
curl -fsSL https://bun.sh/install | bash

# Sur Windows (via WSL ou PowerShell)
powershell -c "irm bun.sh/install.ps1|iex"
```

### 2. Cloner le dépôt

```bash
git clone https://github.com/votre-organisation/arche-damour.git
cd arche-damour
```

### 3. Installer les dépendances

```bash
bun install
```

### 4. Configurer la base de données

Créer un fichier `.env.local` à la racine du projet :

```env
# Base de données (Supabase)
DATABASE_URL=postgresql://user:password@localhost:5432/archedamour?schema=public

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development

# Sécurité
# Clé secrète pour les sessions (générer avec: openssl rand -base64 32)
SESSION_SECRET=votre_cle_secrete_ici

# Upstash Redis (pour le rate limiting)
UPSTASH_REDIS_REST_URL=https://votre-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=votre_token_upstash

# Sentry (optionnel, pour le monitoring)
SENTRY_DSN=votre_dsn_sentry

# NextAuth (optionnel, si vous utilisez NextAuth)
NEXTAUTH_SECRET=votre_secret_nextauth
NEXTAUTH_URL=http://localhost:3000

# WebSocket
NEXTJS_API_URL=http://localhost:3000
```

### 5. Configurer la base de données

```bash
# Générer le client Prisma
bun run db:generate

# Appliquer les migrations
bun run db:push
```

---

## 🏗 Configuration

### Configuration de la Base de Données

Le projet utilise **Prisma** comme ORM avec **PostgreSQL** (via Supabase).

1. **Supabase** (recommandé) :
   - Créer un projet sur [Supabase](https://supabase.com/)
   - Récupérer l'URL de la base de données
   - Configurer `DATABASE_URL` dans `.env.local`

2. **PostgreSQL local** :
   - Installer PostgreSQL localement
   - Créer une base de données `archedamour`
   - Configurer `DATABASE_URL`

### Configuration de l'Authentification

Le système d'authentification utilise :
- **Sessions basées sur des tokens** stockés en base de données
- **Cookies HTTP-only** pour la sécurité
- **Hachage des mots de passe** avec Argon2 (fallback sur PBKDF2)
- **Lockout après 5 tentatives échouées** (15 minutes)

Pour activer la vérification d'email, configurez un service d'email comme SendGrid ou utilisez Supabase Auth.

### Configuration du WebSocket

Le service WebSocket (Reverb) écoute sur le port **3001** et fournit :
- Notifications en temps réel
- Chat de groupe
- Live streaming
- Présence des utilisateurs

---

## 🚀 Scripts Disponibles

| Script | Description |
|--------|-------------|
| `bun run dev` | Démarre le serveur Next.js en mode développement |
| `bun run dev:ws` | Démarre le service WebSocket (Reverb) |
| `bun run dev:supabase` | Démarre le script de développement Supabase |
| `bun run dev:https` | Démarre Next.js avec HTTPS local |
| `bun run build` | Construit l'application pour la production |
| `bun run start` | Démarre le serveur en mode production |
| `bun run lint` | Exécute ESLint pour vérifier le code |
| `bun run db:push` | Applique les changements du schéma à la base |
| `bun run db:generate` | Génère le client Prisma |
| `bun run db:migrate` | Crée et applique les migrations |
| `bun run db:reset` | Réinitialise la base de données |

---

## 🏛 Architecture

### Structure du Projet

```
arche-damour/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── auth/          # Authentification
│   │   │   ├── admin/         # Endpoints Admin
│   │   │   └── ...
│   │   ├── admin/             # Pages Admin
│   │   ├── member/            # Pages Membre
│   │   └── ...
│   ├── components/             # Composants React
│   ├── lib/                   # Utilitaires et configurations
│   │   ├── auth.ts            # Authentification
│   │   ├── db.ts              # Client Prisma
│   │   ├── logger.ts          # Logging (Pino)
│   │   ├── rate-limit.ts      # Rate Limiting
│   │   ├── validations.ts     # Schémas Zod
│   │   └── ...
│   ├── hooks/                 # Hooks React
│   ├── stores/                # Zustand stores
│   └── types/                 # Types TypeScript
├── prisma/
│   ├── schema.prisma          # Schéma de la base de données
│   └── migrations/            # Migrations
├── mini-services/
│   └── reverb-service/        # Service WebSocket (Socket.IO)
├── public/                   # Assets statiques
├── .github/workflows/        # CI/CD (GitHub Actions)
└── package.json              # Dépendances
```

### Stack Technique

| Catégorie | Technologie | Version |
|-----------|-------------|---------|
| **Framework** | Next.js | 16.1.1 |
| **Langage** | TypeScript | 5.0 |
| **CSS** | Tailwind CSS | 4.0 |
| **UI** | shadcn/ui + Radix UI | - |
| **Base de données** | PostgreSQL + Prisma | 6.11.1 |
| **Authentification** | Custom (Sessions + Cookies) | - |
| **Runtime** | Bun | 1.3.0+ |
| **WebSocket** | Socket.IO | 4.8.4 |
| **Gestion d'état** | Zustand + React Query | - |
| **Validation** | Zod | 4.0.2 |
| **Logging** | Pino | 9.4.0 |
| **Rate Limiting** | Upstash Redis | 2.0.2 |
| **Monitoring** | Sentry (optionnel) | - |

---

## 🔐 Sécurité

### Mesures de Sécurité Implémentées

✅ **Authentification Sécurisée**
- Hachage des mots de passe avec **Argon2** (fallback sur PBKDF2)
- **Cookies HTTP-only** pour prévenir les attaques XSS
- **Cookies Secure** (toujours activé, même en développement)
- **SameSite=Strict** pour prévenir les attaques CSRF
- **Lockout après 5 tentatives échouées** (15 minutes)

✅ **Protection des API**
- **Rate Limiting** sur les endpoints sensibles (10 requêtes/10 minutes)
- **Validation des inputs** avec Zod
- **Logging structuré** avec Pino
- **Headers de sécurité HTTP** (CSP, X-Frame-Options, etc.)

✅ **Protection des Sessions**
- **Tokens de session** stockés en base de données
- **Expiration des sessions** (7 jours)
- **Cleanup automatique** des sessions expirées
- **Refresh tokens** pour une expérience utilisateur améliorée

✅ **Protection du WebSocket**
- **Vérification des tokens** via l'API Next.js
- **Vérification des permissions** pour le chat de groupe
- **CORS restreint** aux origines autorisées

✅ **Protection des Données**
- **Soft delete** sur les modèles sensibles
- **Chiffrement des données sensibles** (à implémenter)
- **Backups automatiques** (à configurer)

### Bonnes Pratiques de Sécurité

1. **Ne jamais commiter** les fichiers `.env`
2. **Utiliser des mots de passe forts** pour tous les comptes
3. **Activer la vérification d'email** en production
4. **Configurer HTTPS** en production
5. **Mettre à jour régulièrement** les dépendances
6. **Scanner les vulnérabilités** avec `bun audit`

---

## 📚 Documentation API

### Endpoints d'Authentification

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/login` | Connexion |
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/logout` | Déconnexion |
| GET | `/api/auth/me` | Récupérer l'utilisateur actuel |
| POST | `/api/auth/refresh` | Rafraîchir le token de session |
| POST | `/api/auth/forgot-password` | Demander une réinitialisation |
| POST | `/api/auth/reset-password` | Réinitialiser le mot de passe |
| POST | `/api/auth/validate-token` | Valider un token de session |

### Endpoints de Groupes

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/groupes` | Lister les groupes |
| POST | `/api/groupes` | Créer un groupe |
| GET | `/api/groupes/:id` | Récupérer un groupe |
| PUT | `/api/groupes/:id` | Mettre à jour un groupe |
| DELETE | `/api/groupes/:id` | Supprimer un groupe |
| GET | `/api/groupes/:groupId/members` | Lister les membres d'un groupe |
| POST | `/api/groupes/:groupId/members` | Ajouter un membre |
| DELETE | `/api/groupes/:groupId/members/:userId` | Retirer un membre |
| GET | `/api/groupes/:groupId/members/:userId` | Vérifier l'appartenance |

### Exemple de Requête

```javascript
// Connexion
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'utilisateur@example.com',
    password: 'motdepasse123',
  }),
});

const data = await response.json();
console.log(data); // { success: true, user: {...}, message: 'Connexion réussie' }
```

---

## 🤝 Contribution

### Comment Contribuer

1. **Forker** le dépôt
2. **Créer une branche** (`git checkout -b feature/ma-fonctionnalité`)
3. **Commiter** vos changements (`git commit -m 'Ajout de ma fonctionnalité'`)
4. **Pousser** vers la branche (`git push origin feature/ma-fonctionnalité`)
5. **Ouvrir une Pull Request**

### Règles de Contribution

- Respecter le **style de code** existant
- Ajouter des **tests** pour les nouvelles fonctionnalités
- **Documenter** les changements importants
- **Valider** les inputs avec Zod
- **Logger** les actions importantes
- **Sécuriser** les endpoints sensibles

---

## 📜 Licence

Ce projet est sous licence **MIT**. Voir le fichier [LICENCE](LICENCE) pour plus de détails.

---

## 🙏 Remerciements

- [Next.js](https://nextjs.org/) - Framework React
- [Tailwind CSS](https://tailwindcss.com/) - CSS Utility-First
- [Prisma](https://www.prisma.io/) - ORM pour la base de données
- [Socket.IO](https://socket.io/) - Communication temps réel
- [shadcn/ui](https://ui.shadcn.com/) - Composants UI
- [Bun](https://bun.sh/) - Runtime JavaScript

---

## 📞 Support

Pour toute question ou problème, veuillez ouvrir une **Issue** sur GitHub ou contacter l'équipe de développement.

---

**© 2024 Arche d'Amour. Tous droits réservés.**
