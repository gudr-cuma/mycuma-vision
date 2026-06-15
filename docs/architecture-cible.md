# Architecture — arborescence cible d'origine

> ⚠️ Ceci est l'arborescence **planifiée à l'origine** (extrait du `CLAUDE.md` initial).
> L'implémentation réelle a depuis **largement évolué** : ajout d'une couche serveur
> (`functions/` Cloudflare Pages Functions, `migrations/` D1), de l'authentification
> (`components/auth`, `components/admin`), et de nombreux domaines supplémentaires
> (`bilanCR`, `bilanParam`, `dossier`, `diaporama`, `analytique`, `comparaison`,
> `export`, `analyseur`…). Considérer ce schéma comme une **référence de conception**,
> pas comme l'état courant du dépôt.

```
financiel-vision/
├── public/
│   └── demo/
│       └── demo_fec.csv              # FEC anonymisé pour la démo
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css                     # Tailwind + CSS variables
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppHeader.jsx         # Logo + nom fichier + exercice
│   │   │   ├── KpiBar.jsx            # 4 cards KPI
│   │   │   ├── KpiCard.jsx           # Card individuelle (montant + sparkline)
│   │   │   ├── TabNav.jsx            # Onglets principaux (5)
│   │   │   └── SubTabNav.jsx         # Sous-onglets (Mensuel/Cumulé/Tableau)
│   │   │
│   │   ├── upload/
│   │   │   ├── UploadPage.jsx        # Page d'accueil avec dropzone
│   │   │   ├── Dropzone.jsx          # Zone drag & drop
│   │   │   └── ProgressBar.jsx       # Barre de progression parsing
│   │   │
│   │   ├── sig/
│   │   │   ├── SigTable.jsx          # Tableau SIG complet
│   │   │   ├── SigRow.jsx            # Ligne SIG (total ou sous-ligne)
│   │   │   ├── DetailPanel.jsx       # Panel slide-in droit
│   │   │   ├── AccountList.jsx       # Liste comptes contribuant
│   │   │   ├── AccountCard.jsx       # Card d'un compte
│   │   │   ├── EntryTable.jsx        # Tableau écritures
│   │   │   └── EntryFilter.jsx       # Filtre texte écritures
│   │   │
│   │   ├── monthly/
│   │   │   ├── MonthlyCharts.jsx     # Grille 2×3 graphiques barres
│   │   │   ├── CumulativeChart.jsx   # Courbes cumulées CA + EBE
│   │   │   └── MonthlyDataTable.jsx  # Tableau mensuel
│   │   │
│   │   ├── treasury/
│   │   │   ├── TreasuryKpis.jsx      # 6 cards trésorerie
│   │   │   ├── TreasuryCurve.jsx     # Courbe solde quotidien
│   │   │   ├── PeriodToggle.jsx      # Toggle Année/T1/T2/S1/S2
│   │   │   └── TopMovements.jsx      # Top 10 encaissements/décaissements
│   │   │
│   │   ├── charges/
│   │   │   ├── ChargesDonut.jsx      # Donut répartition
│   │   │   ├── ChargesDetailList.jsx # Liste détail par nature
│   │   │   └── ChargesMonthlyChart.jsx # Barres mensuel par catégorie
│   │   │
│   │   ├── balance/
│   │   │   ├── BalanceOverview.jsx   # Indicateur équilibre + barres
│   │   │   ├── AssetSection.jsx      # Détail actif
│   │   │   ├── LiabilitySection.jsx  # Détail passif
│   │   │   ├── BalanceRow.jsx        # Ligne poste bilan
│   │   │   └── RatioCards.jsx        # 4 cards ratios bilanciels
│   │   │
│   │   └── shared/
│   │       ├── Sparkline.jsx         # Mini graphique KPI
│   │       ├── Tooltip.jsx           # Infobulle
│   │       ├── Badge.jsx             # Badge code compte
│   │       └── ErrorBanner.jsx       # Bannière erreur/warning
│   │
│   ├── engine/                        # Logique métier pure (aucun React)
│   │   ├── parseFec.js               # Parsing CSV + validation + Web Worker
│   │   ├── parseFec.worker.js        # Web Worker dédié au parsing
│   │   ├── computeSig.js             # Calcul SIG PCG CUMA
│   │   ├── computeTreasury.js        # Solde quotidien + KPIs tréso + top 10
│   │   ├── computeCharges.js         # Répartition charges par catégorie
│   │   ├── computeBilan.js           # Bilan simplifié + ratios
│   │   ├── drillDown.js              # Extraction comptes/écritures par poste
│   │   ├── exerciceUtils.js          # Détection période, exercices décalés
│   │   └── formatUtils.js            # Formatage montants, dates, %
│   │
│   ├── store/
│   │   └── useStore.js               # Store Zustand central
│   │
│   └── __tests__/
│       ├── parseFec.test.js
│       ├── computeSig.test.js
│       ├── computeTreasury.test.js
│       ├── computeBilan.test.js
│       └── exerciceUtils.test.js
│
├── data/
│   └── 381304559DONNEESCOMPTABLES20241231.csv  # FEC exemple
│
├── PRB_Financiel_Vision_v3.md         # Spécifications complètes
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── vitest.config.js
```

## Couche serveur ajoutée depuis (résumé du réel)

```
functions/                 # Cloudflare Pages Functions (API)
├── _lib/                   # db (D1), password (PBKDF2), session, ratelimit, validate, responses
└── api/
    ├── _middleware.js      # Auth sur toutes les routes /api/* (sauf login)
    ├── auth/               # login, logout, me, change-password
    ├── admin/users/        # CRUD users + permissions + sessions (rôle admin)
    └── bilan-config/       # configuration du bilan paramétrable
migrations/                 # Schéma SQL D1 (users, sessions, permissions, bilan_config…)
wrangler.toml               # Bindings D1 + KV + vars, build output Pages
```
