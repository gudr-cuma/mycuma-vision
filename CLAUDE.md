# myCuma Vision (Financiel Vision) — Guide projet

Application web d'analyse financière à partir de fichiers **FEC** (Fichier des Écritures
Comptables), ciblée **PCG CUMA**. L'analyse FEC (parsing, SIG, trésorerie, charges, bilan)
se fait **côté navigateur** ; une **couche serveur Cloudflare** gère l'authentification, les
utilisateurs/permissions et la configuration du bilan paramétrable.

> ⚠️ **Le projet a évolué.** La toute première version visait du « 100 % client-side, sans
> back-end ni base de données ». **Ce n'est plus le cas** : il existe désormais une API
> (Cloudflare Pages Functions), une base **D1**, du **KV**, de l'auth par sessions et un
> panneau admin. Les données **FEC analysées** restent en mémoire navigateur (Zustand, pas de
> localStorage), mais les données applicatives (comptes, sessions, config bilan) vivent en
> base D1.

## Stack technique réelle

**Frontend**
- **React 19** + **Vite 8**
- **Zustand** (state), **Recharts** (graphes), **PapaParse** (CSV/Web Worker), **date-fns**,
  **react-window** (virtualisation), **TipTap** (éditeur riche), **xlsx / pdfmake / pdf-lib /
  pptxgenjs** (exports)
- **Tailwind CSS** (mode clair uniquement) — voir [docs/charte-graphique.md](docs/charte-graphique.md)
- Police **Inter**
- Tests : **Vitest + React Testing Library** (`src/__tests__/`)

**Backend (Cloudflare Pages)**
- **Pages Functions** dans `functions/api/*` (login, logout, me, change-password, admin/users,
  bilan-config) — middleware d'auth global sur `/api/*`
- **D1** (SQLite managé), binding `DB` — schéma dans `migrations/`
- **KV**, binding `RATE_LIMIT_KV` (rate-limiting login)
- Mots de passe **PBKDF2-SHA256** (`functions/_lib/password.js`)
- Config bindings/vars : [wrangler.toml](wrangler.toml)

**Déploiement** : git → **Cloudflare Pages** (build auto `npm run build` → `dist/`).

## Lancer en local

- **Front seul (Vite)** : `npm run dev`
- **Stack complète en Docker** (front + API + vraie base D1 + KV + admin seedé) :
  `docker compose up --build` → http://localhost:8788 — voir **[docs/DOCKER.md](docs/DOCKER.md)**

## Documentation détaillée

- 📐 [docs/architecture-cible.md](docs/architecture-cible.md) — arborescence de conception + couche serveur réelle
- 📊 [docs/roadmap.md](docs/roadmap.md) — plan d'implémentation **et** spécifications métier de référence
  (mapping **SIG PCG CUMA**, parsing FEC, trésorerie, charges, bilan, ratios)
- 🎨 [docs/charte-graphique.md](docs/charte-graphique.md) — couleurs + tokens Tailwind
- 🐳 [docs/DOCKER.md](docs/DOCKER.md) — montage Docker local + pistes d'auto-hébergement
- 📄 `PRB_Financiel_Vision_v3.md` — spécifications produit complètes
- FEC d'exemple : `data/381304559DONNEESCOMPTABLES20241231.csv` (3316 écritures, ISO-8859-15, séparateur `|`)

## Règles de développement

1. **Toujours commencer par le module `engine/`** avant le composant UI correspondant. La
   logique métier doit être testable indépendamment de React.
2. **Écrire les tests en même temps que le code.** Chaque module engine a son fichier de test.
3. **Le FEC d'exemple dans `data/` est la source de vérité.** Vérifier tous les calculs contre lui.
4. **Ne pas hardcoder Janvier–Décembre.** Utiliser `exerciceUtils` (exercices décalés).
5. **Formatage français partout** : milliers = espace, décimale = virgule, dates = JJ/MM/AAAA.
6. **Données FEC analysées en mémoire uniquement** (Zustand) — pas de localStorage/sessionStorage
   pour le contenu FEC. (L'auth et la config persistent côté serveur D1, c'est normal.)
7. **Le 621\* est en charges de personnel, PAS en services extérieurs** (décision métier CUMA).
8. **Les écritures ANC (à-nouveau) sont exclues du SIG**, mais incluses dans le bilan et la trésorerie.

## Règles métier critiques (rappel)

- **SIG** : produits classe 7 = Σcrédit − Σdébit ; charges classe 6 = Σdébit − Σcrédit ;
  exclure le journal **ANC** du SIG. Mapping complet → [docs/roadmap.md](docs/roadmap.md#phase-2--moteur-de-calcul-sig).
- **Trésorerie** : comptes 51*/53* ; débit sur 51* = encaissement, crédit = décaissement.
- **Bilan CUMA 453\*** : solde net global ; débiteur → Actif (créances adhérents),
  créditeur → Passif (dettes adhérents).
