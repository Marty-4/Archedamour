# Run doc — Arche d'Amour (Next.js 16 + Prisma/SQLite)

## 1. Reproduire les artefacts non commités

Depuis un checkout frais (le dépôt principal est ce même dossier) :

1. **Copier `.env` depuis le checkout principal** (racine du projet).
   Il contient notamment `DATABASE_URL` pointant vers `file:./db/custom.db`.
2. **Base de données** : le fichier `prisma/db/custom.db` est versionné dans le
   dépôt ; aucune migration n'est nécessaire. Si besoin de repartir de zéro :
   ```bash
   bun run db:push        # crée le schéma
   bunx prisma/seed.ts    # (bun prisma/seed.ts) peuple la base de démo
   ```
3. **Installer les dépendances** avec bun (lockfile `bun.lock`) :
   ```bash
   bun install
   bunx prisma generate
   ```

## 2. Lancer le serveur de dev

Port par défaut : **3000** (`package.json` : `dev` → `next dev -p 3000`).

```bash
bunx next dev -p 3000
```

Production (build standalone) :
```bash
bun run build
bun run start
```

### Détachement (preview Freebuff, Linux)

Le wrapper `bun run dev` (qui pipe dans `tee`) est réap par le runner de
commandes ; utiliser directement `next dev` sous `setsid` :

```bash
{ setsid nohup bunx next dev -p 3000 > ".freebuff/preview.log" 2>&1 < /dev/null & echo "pid=$!"; disown; }
```

Puis vérifier après ~5 s que le pid répond toujours (`ps -p <pid>`) et que
http://localhost:3000 renvoie 200.

## 3. Vérifications utiles

- `bunx tsc --noEmit` — typecheck (doit sortir vide)
- `bun run lint` — eslint (1 warning préexistant sur `register/page.tsx`)
- Comptes de démo (seed) : `pasteur@churchconnect.com` / `password123`,
  `admin@amour.com` / `admin123`, `membre@churchconnect.com` / `membre123`.
  ⚠️ La base `db/custom.db` actuelle ne contient PAS ces comptes ; elle
  contient 3 utilisateurs réels (`geraldyngouono@gmail.com`,
  `ngouonomarty@mail.com` ADMIN, `chance@gmail.com`) — utiliser l'un
d'eux (mot de passe connu de l'église) ou relancer le seed si besoin.
- L'auth de démo (`pasteur@archedamour.com` etc. dans l'API login) n'est
  active que si `ALLOW_DEMO_AUTH=true` dans `.env`.
- Si aucune église (`Church`) n'existe en base, les pages membres affichent
  « Profil incomplet » : créer l'église (l'app auto-crée ensuite les
  `MemberProfile` à la première visite de `/member/[section]`).
- Compte de test créé pour la vérification navigateur :
  `test.admin@archedamour.app` / `test1234` (role ADMIN + MemberProfile).

## 4. Supabase (migration TERMINÉE)

- Base de données : **Supabase PostgreSQL** (projet `wcrvagbqhluvhoasexjn`,
  région eu-west-1 / Irlande, t3.nano). Schéma créé via `prisma db push`,
  données importées (30 lignes : église, 4 users, 2 profils, 3 diffusions).
- **Connexion** : la connexion directe `db.<ref>.supabase.co` est IPv6-only
  (échec depuis ce réseau) et le préfixe pooler des nouveaux projets est
  **aws-1-** (pas aws-0-) → utiliser
  `aws-1-eu-west-1.pooler.supabase.com:5432` (session mode).
- **Lancer le serveur dev sur Supabase** (sans toucher à .env) :
  ```bash
  setsid nohup bun scripts/dev-supabase.ts bunx next dev -p 3000 \
    > .freebuff/preview-supabase.log 2>&1 < /dev/null &
  ```
  Le script écrase DATABASE_URL en mémoire depuis DATABASE_URL_SUPABASE et
  bascule automatiquement vers le pooler IPv4. Log : `.freebuff/preview-supabase.log`.
- `bun run dev` (Next seul) utiliserait toujours le SQLite de `.env`.
- Scripts utiles :
  - `bun scripts/with-supabase-env.ts <cmd>` — exécute une commande (prisma...)
    sur la base Supabase (reconstruit l'URL pooler en mémoire)
  - `bun scripts/export-sqlite.ts` / `bun scripts/import-supabase.ts` — migration
  - `bun scripts/ensure-storage-bucket.ts` — vérifie/crée le bucket Storage `media`
- **Storage** : bucket `media` (public, 5 Mo max, images) ; uploads vers
  `https://wcrvagbqhluvhoasexjn.supabase.co/storage/v1/object/public/media/...`.
  Fallback local `public/uploads` uniquement si les clés Supabase sont absentes.
- Uploads : API `/api/admin/upload` (admin) et `/api/member/avatar` (membre).
- Correctif schéma : le model `Report` a 3 relations sur `targetId` → noms de
  contraintes distincts (`map:`) requis en PostgreSQL (inutile en SQLite).
- Le compte de test `test.admin@archedamour.app` / `test1234` fonctionne sur
  Supabase (login vérifié).

## 5. Rôles, groupes & temps réel

- **Comptes de test par rôle** (créés via `bun scripts/seed-roles.ts`, mdp
  `test1234`) : `superadmin@test.arche` (SUPER_ADMIN), `pasteur@test.arche`
  (PASTOR), `tresorier@test.arche` (TREASURER), `responsable@test.arche`
  (DEPARTMENT_HEAD), `moderateur@test.arche` (MODERATOR),
  `membre@test.arche` (MEMBER).
- **Rôles staff** : TREASURER (dons, rapports), DEPARTMENT_HEAD (membres,
  groupes, départements, prières, rapports), MODERATOR (membres, prières,
  notifications, rapports). Pages : `requireStaffFor(page)` dans
  `src/lib/admin.ts` (STAFF_PAGES) ; APIs admin restent `requireAdminApi`
  (les staff n'y accèdent pas, choix conservateur).
- **Nav filtrée par rôle** : dashboard-layout.tsx filtre desktop + mobile
  (les admins complets voient tout). Le lien mobile fictif "Plus" (href `#`)
  est exclu par le rendu, pas par le filtre.
- **Groupes** : gestion des membres via dialogue (icône 👥 dans la table
  admin groupes) → API `/api/admin/groupes/membres` (GET/POST/DELETE).
  Ajout d'un LEADER = définit leaderId du groupe.
- **Chat de groupe** : page `/member/groupes-chat` (nav membre "Discussion") ;
  API `/api/groupes/messages` (GET 20 derniers, POST persiste) ; modèle
  `GroupMessage` ; hook `useGroupChat` ; composant `group-chat.tsx`.
  Flux d'envoi : POST API (persistance) puis diffusion WS room `group:<id>`.
- **WebSocket** : service `mini-services/reverb-service` sur port 3001,
  lancement `bun run dev:ws` (ou setsid nohup bun mini-services/reverb-...).
  ⚠️ `process.env.PORT` vaut "0" dans l'env → le service force 3001 si PORT
  n'est pas un nombre > 0. Log : `.freebuff/ws-service.log`.
- **Résilience DB** : `src/lib/db.ts` contient une extension Prisma de retry
  (3 tentatives sur P1001/P1002) + keepalive 45s — le réseau local vers le
  pooler Supabase est intermittent.
- **Live — corrections 2026-09-29** :
  - Bouton « Arrêter le live » désormais toujours présent : LiveStudioControls
    détecte tout direct LIVE en base (même créé via le formulaire ou une autre
    session) via GET /api/admin/live, et propose l'encart rouge d'arrêt.
  - Lecteur membre (`live-player.tsx`) : vrais contrôles (lecture, son —
    démarré muet pour l'autoplay, plein écran avec fallback webkit + sync
    via fullscreenchange). Page publique /live : plein écran branché.
  - Chat temps réel du direct : composant `live-chat.tsx` (room `live:<id>`),
    intégré à droite du lecteur sur /member/live ; emojis rapides ; auto-scroll.
  - Service WS : handler `live:ping` ajouté (badge qualité réseau du Studio).
  - ⚠️ Plein écran non testable dans l'iframe de la preview (nécessite
    `allowfullscreen`) : fonctionne dans un vrai onglet navigateur.

## 6. Stabilité auth & app (2026-09-30)

- **`src/lib/db.ts`** : `resolveDatabaseUrl()` bascule automatiquement sur
  `DATABASE_URL_SUPABASE` (pooler IPv4 si connexion directe) quand DATABASE_URL
  n'est pas une chaîne `postgresql://` — l'app démarre donc avec n'importe quel
  lanceur, même si le .env contient une mauvaise valeur (ex : URL https).
- **Schema Prisma** : provider corrigé en `postgresql` (casse/espace parasites)
  + noms de contraintes FK distincts sur `Report` (régression refixée).
- **Crash « No QueryClient set » (500 sur toutes les pages)** : causé par le
  `require()` CJS de `@tanstack/react-query-devtools` dans
  `src/providers/query-provider.tsx` → seconde instance react-query sous
  Turbopack. Devtools retirés (provider simplifié) → pages 200 OK.
- **Auth** : register créait les comptes avec `emailVerified: false` alors
  qu'aucun flux de vérification email n'existe (ni service d'envoi, ni route
  /verify-email) → tout nouvel inscrit était bloqué à jamais. Fix :
  `emailVerified: true` à la création (TODO dans le code pour la vraie
  vérification email). Register → login immédiat vérifié de bout en bout
  (cookies de session émis, users persistés dans Supabase).
- **Next 16** : route `src/app/api/groupes/[groupId]/members/[userId]/route.ts`
  migrée vers `params: Promise` (ancienne signature cassait le typecheck).
- **Lint** : `require()` remplacé par `import()` dynamique dans
  `src/lib/sentry.ts`.
- Lancement de référence (sous setsid, survit au redémarrage de Freebuff) :
  ```bash
  setsid nohup bun scripts/dev-supabase.ts bunx next dev -p 3000 \
    > .freebuff/preview-88c4bcc0-85a8-4e33-a44b-2ed16b479de2.log 2>&1 < /dev/null &
  setsid nohup bun mini-services/reverb-service/index.ts \
    > .freebuff/ws-service.log 2>&1 < /dev/null &
  ```

## 7. Accès réseau local (2026-09-30)

- **App** : `http://192.168.1.165:3000` (depuis tout appareil du même Wi-Fi/LAN)
- **WebSocket** : port 3001, utilisé automatiquement par le client
  (`window.location.hostname:3001` dans `src/lib/websocket.ts`), CORS du
  service déjà ouvert aux IP privées (192.168.x / 10.x / 172.16-31.x).
- `next.config.ts` : `allowedDevOrigins: ["192.168.1.165"]` pour autoriser
  l'origine LAN en dev. ⚠️ Si l'IP change (DHCP), mettre à jour cette ligne.
- Vérifié : page 200 via IP LAN, handshake socket.io OK (`sid` émis).

## 8. Récupération de mot de passe (2026-09-30)

- Pages UI créées : `/forgot-password` (demande, état succès, lien direct en
  dev car l'API renvoie le token en NODE_ENV=development) et `/reset-password`
  (token en query, jauge de force 4 segments, confirmation, écran « lien
  invalide » si token absent). Middleware : ces routes restent publiques.
- APIs existantes (inchangées) : POST /api/auth/forgot-password (token 1 h,
  réponse identique que l'email existe ou non) et POST /api/auth/reset-password
  (force 8+lettre+chiffre, invalide le token après usage, débloque le compte).
- **Faille critique corrigée** : dans la route login, `verifyPassword(...)`
  était appelé **sans `await`** → Promise toujours truthy → **tout mot de passe
  était accepté**. Corrigé : `await verifyPassword(...)` (commenté dans le
  code). Vérifié après fix : mot de passe faux → 401, ancien → 401, bon → OK.
- Outils : `bun scripts/verify-password.ts <email> <mdp...>` (diagnostic),
  `bun scripts/restore-test-password.ts <email> <mdp>` (reset comptes de test).
- ⚠️ À faire en prod : brancher un vrai envoi d'email (Resend/SMTP) dans
  forgot-password et retirer `resetToken` de la réponse en production
  (déjà conditionné à NODE_ENV=development).

## 9. Boucle de login sur le LAN (2026-09-30)

- Symptôme : depuis un appareil du réseau (http://192.168.1.165:3000), la
  connexion réussissait puis le middleware renvoyait vers /login.
- Cause : cookies de session émis avec `Secure: true` en dur — les navigateurs
  JETTENT un cookie Secure reçu sur HTTP simple (localhost excepté, traité
  comme sécurisé → le PC marchait).
- Fix : `shouldUseSecureCookies(request)` dans `src/lib/auth.ts` — flag
  `Secure` posé seulement si la requête est réellement en HTTPS
  (x-forwarded-proto ou protocole de l'URL). Appliqué aux cookies session +
  refresh de login, logout, me, refresh. SameSite=strict conservé (SEC-008).
- Vérifié : login via IP LAN → Set-Cookie sans Secure → /member/dashboard
  200 (middleware) → /api/auth/me authentifié. En production HTTPS, le flag
  Secure sera automatiquement posé.

## 10. Live public (2026-09-30)

- **Page /live publique refondue** : la démo fictive (données en dur) est
  remplacée par les VRAIES diffusions via la nouvelle API publique
  GET /api/live (sans auth) — direct en grand lecteur (WebRTC si INTERNAL,
  bouton externe sinon), prochains directs, replays. Auto-refresh 30 s.
- **Membres sans église** : les vrais comptes (geraldyngouono@…,
  gloire@…, ngouonomarty@…) n'avaient aucun MemberProfile rattaché →
  « Aucune diffusion » même en direct. Fix : `resolveChurchIdForUser()`
  (src/lib/church.ts) retombe sur l'église par défaut ; appliqué à
  /member/live.
- **WS ouvert aux invités** : le middleware d'auth du service
  (mini-services/reverb-service) classe les connexions sans token (ou à
  cookie vide) comme GUEST — la page /live reçoit le direct sans compte.
  Chat live et rooms personnelles restent réservés aux connectés.
  Client : useWebSocket n'envoie plus d'auth vide (invité = rôle GUEST).

## 11. Lecteur live : reconnexion au flux (2026-09-30)

- Symptômes corrigés : « Connexion au direct… » indéfiniment (pas d'image/son)
  quand on rejoint un direct déjà démarré, et lecteur mort après
  quitter/rafraîchir la page.
- Causes :
  1. Le spectateur ne demandait JAMAIS le flux : il attendait un `live:signal`
     spontané. Or `live:peer-joined` n'est envoyé qu'aux présents AVANT lui.
     L'admin ne renouvelle ses offers pour personne d'autre.
  2. Après un refresh, l'ancien socket mourait (reconnect par socket.io vers un
     nouvel id) et le hook gardait le peer fermé → écran figé.
- Fix :
  - Service WS : `live:hello` (id) → liste `viewers` de la room
    `live:<id>` + re-émission de `live:peer-joined` (role admin) vers le
    demandeur ; `peer-joined` émis avec `io.to(roomName)` (aussi à soi).
  - Lecteur (live-player.tsx) : émet `live:hello` à l'arrivée (et à chaque
    reconnexion socket) ; traite tous les `live:peer-joined` (role ADMIN) ;
    peer fermé sur reconnect ; `onicecandidate` attaché AVANT toute
    négociation ; bouton « Réessayer » ; badge « En attente du flux… ».
  - Studio admin : renégociation ICE en cas d'erreur (destroy + recréation du
    peer au prochain peer-joined).
- Test réel : socket A (admin, création des peers) + socket B (spectateur) →
  handshake complété (`candidate` reçu côté admin), 2 peers côté émetteur.
- ⚠️ Production : prévoir TURN (coturn/Cloudflare TURN) si spectateurs derrière
  NAT strict — STUN seul peut échouer dans ce cas.

## 12. Direct : durée/spectateurs, reprise caméra, notifications + prédications audio (2026-09-30)

- **Durée + spectateurs côté spectateur** : LivePlayer affiche désormais le
  chronomètre (depuis actualStart, prop startedAt) et le compteur de
  spectateurs reçu par WS (live:viewers:update) — pages membre ET publique.
- **Studio admin — retour sur la page** : si un direct est en cours depuis CE
  navigateur mais que la capture a été stoppée (changement de page), un bouton
  « Reprendre la caméra (direct en cours) » récupère getUserMedia et
  rattache les tracks aux peers existants via replaceTrack (pas de coupure
  pour les spectateurs déjà connectés).
- **Notification « direct lancé » à tous** :
  - temps réel : le studio émet déjà admin:live:status → le service diffuse
    un nouvel événement `live:started` à TOUS les clients ; composant
    `LiveStartedToast` (monté sur les dashboards admin + membre) affiche un
    toast cliquable « Rejoindre » (12 s).
  - persistant : l'API admin live crée une Notification LIVE_STARTED pour
    chaque utilisateur ACTIVE au POST d'un direct (badge/cloche).
- **Recherche de membres (groupes admin)** : le dialogue de gestion des
  membres a une barre de recherche (nom ou email, insensible à la casse)
  qui filtre la liste des candidats ; le label des candidats inclut
  désormais « Nom — email ».
- **Prédications audio** :
  - Storage : dossier `sermon-audio` (audio/*, 50 Mo max, sans
    transformation) ; uploadImageToSupabase reste pour les images.
  - API /api/admin/upload accepte maintenant les fichiers audio.
  - FormField type "audio" + composant AudioFieldInput (téléversement ou
    URL, pré-écoute) ; champ appliqué à audioUrl dans la page admin
    prédications (le pasteur peut téléverser son enregistrement).
  - Côté membre : lecteur <audio> intégré dans la carte prédication +
    lien de téléchargement si downloadsAllowed.
  - Publication avec audioUrl → notification NEW_SERMON à tous les membres
    actifs (actionUrl /member/predications).
- Tests réels : upload WAV 32 Ko → URL publique Supabase (HTTP 200) ;
  création prédication audio → 12 notifications créées ; nettoyage fait.

## 13. Appel audio à deux sens (2026-09-30)

- Le direct AUDIO devient une **conférence mesh à deux sens** : chaque
  participant (membre, invité connecté) publie son micro et entend tous les
  autres ; l'animateur (admin/pasteur) voit tout le monde.
- Service WS (nouveaux events) :
  - `live:call:join` {streamId, displayName} → rejoint le catalogue d'appel ;
    renvoie `live:call:participants` (les AUTRES) et notifie la room
    (`live:call:participant-joined` + `live:call:participants:update`).
  - `live:call:mic` {streamId, micOn} → `live:call:mic-update` (état micro).
  - `live:call:leave` / déconnexion → `live:call:participant-left`.
  - `live:signal` enrichi (senderName/senderRole) et relayage ciblé inchangé.
- Règle anti-glare mesh : LE NOUVEAU ARRIVANT offre vers sa liste initiale ;
  les présents ne font que répondre. Le participant et l'animateur suivent
  tous deux cette règle (chacun offre vers ceux qui étaient là avant lui).
- Composants :
  - `AudioCallRoom` (membre/public) : bouton Rejoindre (getUserMedia audio
    echoCancellation/noiseSuppression), peers par participant avec <audio>
    dédié, mute, indicateur « vous parlez », quitter ; rejoint
    automatiquement quand mediaType=AUDIO sur /member/live.
  - `AudioCallHostPanel` (studio admin) : liste temps réel des participants
    (nom + état micro), monté sur /admin/live-studio pour un direct AUDIO.
- Test signalisation (scripts/test-audio-call.ts) : 4/4 ✅ (liste, arrivée,
  relayage offer ciblé, départ).
- ⚠️ Production : mesh OK jusqu'à ~10-20 participants simultanés ; au-delà,
  prévoir un SFU (mediasoup/LiveKit) — et un TURN pour NAT stricts.

## 14. Enregistrement de prédication au micro in-app (2026-09-30)

- **MicroRecorder** (src/components/admin/micro-recorder.tsx) : MediaRecorder
  (audio/webm opus ou mp4), chronomètre animé, **visualisation waveform**
  (28 barres pilotées par le niveau réel du micro via AnalyserNode),
  pause/reprise (chunks 1 s), annulation, ré-écoute avant publication,
  refonte (« Refaire »). Publication → upload /api/admin/upload
  (folder=sermon-audio) puis callback onSave(audioUrl, durée en secondes).
- Formulaire admin prédications : nouveau FormField type "recorder"
  (slot technique recorderSlot, retiré du payload) qui remplit audioUrl +
  duration (minutes, arrondi au-dessus) et envoie `recorded: "true"`.
- API prédications : `recordedById = user.id` au POST quand recorded=true
  (relation Sermon.recordedBy, onDelete: SetNull, relation inverse
  User.sermonsRecorded). GET inclut recordedBy (id, name).
- Page membre prédications : ligne « Enregistré par {name} » (icône micro)
  sous le prédicateur pour les prédications avec audio + recordedBy.
- db push appliqué (colonne recordedById sur sermons) + client régénéré.
- Test réel : POST avec recorded=true → recordedById posé, recordedBy.name
  résolu, « Enregistré par Test Admin » rendu dans /member/predications.
  ⚠️ Après un `prisma generate`, redémarrer next dev (le client packagé
  n'est pas rechargé à chaud) — sinon 500 sur les nouveaux champs.

## 15. Audit responsive mobile — formulaires et tableaux (2026-10-02)

Contexte : l'app est en production sur https://archedamour.vercel.app (Supabase
Postgres persistant). Audit mobile 390×844 de toutes les pages + formulaires.

Corrections :
- **Tableaux admin** (AdminTable) : la cellule `whitespace-nowrap` globale
  forçait un débordement horizontal (397 px dans 308 px) et coupait la colonne
  Actions hors écran. La cellule principale passe en `whitespace-normal` +
  `break-words` (`max-w-0`), Actions/Statut en nowrap ; padding carte réduit
  sur mobile (`px-3 py-4 sm:px-6 sm:py-6`). Vérifié : overflow 0 partout,
  boutons Actions visibles sur 390 px.
- **Dialogues** (ui/dialog.tsx) : hauteur max `calc(100dvh - 2rem)` (au lieu de
  rien → débordement quand le clavier mobile s'ouvre), `overflow-y-auto`,
  padding `p-4 sm:p-6` par défaut.
- **AdminFormDialog** : `max-h-[92dvh]`, footer **sticky** en bas du dialogue
  (border-t + bg) → les boutons Annuler/Enregistrer/Supprimer restent
  visibles pendant tout le scroll du formulaire ; boutons pleine largeur sur
  mobile (`flex-1 sm:flex-none`).
- **GroupMembersManager** et dialog des **groupes publics** (`/groups`) :
  alignés sur le même schéma (dvh + padding responsive).

Vérifié en navigateur (390 px) : login, register, forgot-password (max-w-md,
OK), dashboards admin/membre, nav bas + tiroir « Plus », tableaux
(membres/dons/rapports/groupes : overflow 0), dialogues prédications (footer
pinned), groupes (recherche OK), live public/membre, contact (7 inputs, tous
≥ 16 px → pas de zoom iOS). Aucun débordement horizontal détecté.

Notes :
- Le crash « Application error »/Turbopack stale sur /member/dashboard était
  un artefact de dev (HMR corrompu après redémarrages) — `rm -rf .next` +
  redémarrage = résolu. Ne pas confondre avec un bug de code.
- Compte de test admin réinitialisé : test.admin@archedamour.app /
  Audit2026! (à supprimer un jour de la prod).
