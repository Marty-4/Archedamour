# Changelog - Arche d'Amour

Toutes les modifications notables apportées à ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère à [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Non publié]

### ✅ Améliorations de Sécurité (Priorité Critique)

#### Authentification
- **SEC-001** : Suppression des **demo users** du code source (login/route.ts) - Élimine le risque de comptes hardcodés avec mots de passe en clair
- **SEC-002** : Amélioration du **middleware** pour vérifier la présence du cookie de session
- **SEC-007** : Activation de `secure: true` pour **tous les cookies** (même en développement)
- **SEC-008** : Changement de `sameSite` de `'lax'` à `'strict'` pour une meilleure protection CSRF
- **SEC-015** : Implémentation du **lockout après 5 tentatives échouées** (15 minutes)
- **SEC-016** : Ajout de la **vérification d'email** (bloque la connexion si email non vérifié)

#### Protection des API
- **SEC-005** : Ajout du **rate limiting** sur `/api/auth/login` (10 requêtes/10 minutes)
- **SEC-003** : Sécurisation du **WebSocket** avec validation du token via l'API Next.js
- **SEC-010** : Vérification des **permissions dans le chat de groupe** (vérifie l'appartenance au groupe)

#### Hachage des Mots de Passe
- **SEC-012** : Migration vers **Argon2** pour le hachage des mots de passe (avec fallback sur PBKDF2)
  - Configuration : argon2id, 64MB memory, 3 iterations
  - Compatible avec les anciens hash PBKDF2

#### Logging et Monitoring
- **API-005** : Ajout du **logging structuré** avec Pino
  - Niveaux de log : debug (dev), info (prod)
  - Redaction des champs sensibles (password, token, email)
  - Logging des tentatives de connexion (réussies/échouées)

#### Headers de Sécurité
- **SEC-021** : Ajout des **headers de sécurité HTTP** dans le middleware
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - X-XSS-Protection: 1; mode=block
  - Referrer-Policy: strict-origin-when-cross-origin
  - Permissions-Policy: geolocation=(), microphone=(), camera=()
- **SEC-022** : Implémentation de la **Content Security Policy (CSP)**

#### Gestion des Sessions
- **SEC-011** : Implémentation du système de **refresh token**
  - Token de session : 7 jours
  - Refresh token : 30 jours
  - Rafraîchissement automatique des sessions
- Nettoyage automatique des **sessions expirées**

### ✅ Nouvelles Fonctionnalités

#### Authentification
- **FUNC-001** : Ajout du **flux de réinitialisation de mot de passe**
  - Endpoint `/api/auth/forgot-password` : Génère un token de réinitialisation
  - Endpoint `/api/auth/reset-password` : Réinitialise le mot de passe avec le token
  - Tokens de réinitialisation valides pour 1 heure
  - Protection contre l'énumération d'emails

#### Validation
- **API-003** : Ajout de la **validation des inputs avec Zod**
  - Schémas pour : login, register, forgot-password, reset-password
  - Schémas pour : posts, comments, groups, users
  - Schémas de pagination
  - Fonctions utilitaires `validateBody` et `validateQuery`

#### Pagination
- **DB-002** : Implémentation de la **pagination**
  - Utilitaire `parsePaginationParams` pour parser les paramètres URL
  - Utilitaire `createPaginationMeta` pour créer les métadonnées de pagination
  - Utilitaire `getPrismaPagination` pour les requêtes Prisma
  - Limite maximale : 100 items par page

#### Gestion des Erreurs
- **FE-001** : Ajout de la **gestion des erreurs API côté frontend**
  - Classe `ApiClientError` pour les erreurs typées
  - Fonction `parseApiError` pour parser les réponses d'erreur
  - Fonction `defaultErrorHandler` pour afficher les toasts d'erreur
  - Client API centralisé avec gestion des erreurs intégrée

### ✅ Améliorations Techniques

#### Cache et Performance
- **FE-003** : Ajout de **React Query (TanStack Query)** pour le cache
  - Provider `QueryProvider` pour l'application
  - Configuration par défaut : staleTime = 1 minute, gcTime = 10 minutes
  - Devtools intégrés en développement

#### Base de Données
- **DB-001** : Ajout du **soft delete** sur le modèle User
  - Champs ajoutés : `failedAttempts`, `lockoutUntil`
  - Champs ajoutés : `resetToken`, `resetTokenExpiresAt`
  - Champs ajoutés : `refreshToken`, `refreshTokenExpiresAt`

#### WebSocket
- **SEC-003** : Vérification du **token de session** dans le middleware WebSocket
  - Appel à `/api/auth/validate-token` pour valider le token
  - Rejet de la connexion si le token est invalide ou expiré
- **SEC-010** : Vérification des **permissions de groupe** avant d'autoriser l'accès

#### DevOps
- **DEV-001** : Configuration de **GitHub Actions** pour le CI/CD
  - Workflow : test → build → deploy (production/staging)
  - Exécution de ESLint et TypeScript check
  - Build de l'application Next.js
  - Déploiement sur Vercel (exemple)
- **DEV-002** : Ajout de **Sentry** pour le monitoring
  - Initialisation conditionnelle (production uniquement)
  - Capture des erreurs et messages
  - Suivi des transactions
  - Configuration du user context
- **DEV-009** : Ajout de la **documentation**
  - README.md complet avec instructions d'installation
  - ARCHITECTURE.md avec diagrammes et explications

#### Configuration
- Mise à jour du **.gitignore** pour exclure :
  - Fichiers `.env*`
  - Fichiers de certificats (`.pem`, `.key`, `.crt`)
  - Fichiers de base de données (`.db`, `.sqlite`)
  - Fichiers temporaires
  - Dossier `.freebuff/`
- Mise à jour du **package.json** avec nouvelles dépendances :
  - `argon2` : Hachage des mots de passe
  - `pino` + `pino-pretty` : Logging structuré
  - `@upstash/ratelimit` + `@upstash/redis` : Rate limiting distribué
  - `@types/node` + `@types/pino` : Types TypeScript

### ✅ Améliorations du Code

#### Authentification
- Refactorisation complète de `login/route.ts` avec :
  - Suppression des demo users
  - Ajout du rate limiting
  - Ajout du lockout
  - Ajout du logging
  - Vérification de l'email
  - Génération du refresh token
- Refactorisation de `register/route.ts` avec :
  - Ajout du rate limiting
  - Validation avec Zod
  - Vérification des termes d'utilisation
  - Génération du refresh token
- Refactorisation de `logout/route.ts` avec :
  - Logging structuré
  - Cookies sécurisés
- Refactorisation de `me/route.ts` avec :
  - Vérification du lockout
  - Logging structuré
  - Cookies sécurisés

#### WebSocket
- Modification de `reverb-service/index.ts` avec :
  - Vérification du token via l'API Next.js
  - Vérification des permissions de groupe
  - Logging amélioré
  - Gestion des erreurs

#### Middleware
- Ajout des **headers de sécurité** à toutes les réponses
- Vérification du cookie de session pour les routes protégées

#### Utilitaires
- Création de `lib/rate-limit.ts` : Rate limiting avec Upstash Redis
- Création de `lib/logger.ts` : Logging structuré avec Pino
- Création de `lib/validations.ts` : Schémas Zod pour la validation
- Création de `lib/pagination.ts` : Utilitaires de pagination
- Création de `lib/api.ts` : Client API avec gestion des erreurs
- Création de `lib/sentry.ts` : Configuration de Sentry
- Création de `providers/query-provider.tsx` : Provider React Query

### 📋 Modèles de Base de Données Modifiés

#### User (prisma/schema.prisma)
```prisma
model User {
  // ... champs existants ...
  failedAttempts Int @default(0)
  lockoutUntil DateTime?
  resetToken String?
  resetTokenExpiresAt DateTime?
  refreshToken String?
  refreshTokenExpiresAt DateTime?
}
```

### 📁 Nouveaux Fichiers Créés

#### API Routes
- `/src/app/api/auth/validate-token/route.ts` : Validation des tokens de session
- `/src/app/api/auth/refresh/route.ts` : Rafraîchissement des tokens
- `/src/app/api/auth/forgot-password/route.ts` : Demande de réinitialisation
- `/src/app/api/auth/reset-password/route.ts` : Réinitialisation du mot de passe
- `/src/app/api/groupes/[groupId]/members/[userId]/route.ts` : Vérification d'appartenance

#### Lib
- `/src/lib/rate-limit.ts` : Rate limiting
- `/src/lib/logger.ts` : Logging structuré
- `/src/lib/validations.ts` : Schémas Zod
- `/src/lib/pagination.ts` : Utilitaires de pagination
- `/src/lib/api.ts` : Client API
- `/src/lib/sentry.ts` : Configuration Sentry

#### Providers
- `/src/providers/query-provider.tsx` : Provider React Query

#### Documentation
- `/README.md` : Documentation complète
- `/docs/ARCHITECTURE.md` : Architecture technique
- `/CHANGELOG.md` : Ce fichier

#### CI/CD
- `/.github/workflows/deploy.yml` : Workflow GitHub Actions

---

## [0.2.1] - 2024-XX-XX

### Ajouté
- Version initiale du projet avec Next.js, Tailwind CSS, et Prisma

---

[Non publié]: https://github.com/votre-organisation/arche-damour/compare/v0.2.1...HEAD
[0.2.1]: https://github.com/votre-organisation/arche-damour/releases/tag/v0.2.1
