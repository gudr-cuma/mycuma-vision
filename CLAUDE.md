# Prompt Claude Code — Développement Financiel Vision

## Contexte

Tu vas développer **Financiel Vision**, une application web React d'analyse financière à partir de fichiers FEC (Fichier des Écritures Comptables). L'application est **100% client-side** — aucun serveur back-end, aucune base de données. Le FEC est parsé et analysé entièrement dans le navigateur.

Le PRB complet est disponible dans le fichier `PRB_Financiel_Vision_v3.md` à la racine du projet. **Lis-le intégralement avant de commencer.** Un FEC d'exemple est fourni dans `data/381304559DONNEESCOMPTABLES20241231.csv` (3316 écritures, encodage ISO-8859-15, séparateur pipe `|`).

Le produit de référence est visible ici : https://rfroment85.github.io/FinancialVision/
Notre version diffère sur plusieurs points clés (voir PRB §1.3) : un seul fichier FEC (pas de N-1), mode clair uniquement, PCG CUMA.

---

## Stack technique (confirmée)

- **React 18+** avec Vite
- **Zustand** pour le state management
- **Recharts** pour tous les graphiques (barres, courbes, donut/pie)
- **PapaParse** pour le parsing CSV (avec Web Worker)
- **Tailwind CSS** pour le styling (mode clair uniquement)
- **date-fns** pour la manipulation des dates
- **react-window** pour la virtualisation des longues listes
- **Vitest + React Testing Library** pour les tests unitaires
- Police : **Inter** (Google Fonts ou self-hosted)

---

## Charte graphique (mode clair)

```
Couleurs principales :
  --color-blue-pastel: #B1DCE2    (fonds cards, hover, sélections)
  --color-green-primary: #31B700  (valeurs positives, barres graphiques)
  --color-orange-accent: #FF8200  (CTA, montants drill-down, accent)

Couleurs secondaires :
  --color-green-lime: #93C90E     (série graphique alternative)
  --color-green-forest: #00965E   (3e série graphique, icônes)

Pastels dérivés :
  --color-blue-light: #E3F2F5     (fond de page, sections)
  --color-green-light: #E8F5E0    (lignes de total SIG)
  --color-orange-light: #FFF3E0   (fond alertes, badges)
  --color-lime-light: #F0F7D4     (fond alternatif)

Neutres :
  --color-bg: #FFFFFF
  --color-bg-secondary: #F8FAFB
  --color-border: #E2E8F0
  --color-text: #1A202C
  --color-text-secondary: #718096
  --color-red-error: #E53935      (négatifs, erreurs)

⚠️ Accessibilité : #31B700 a un ratio de 3.8:1 sur blanc → utiliser #268E00
   pour tout TEXTE vert sur fond blanc. #31B700 OK pour graphiques et texte ≥18px bold.
```

---

## Architecture du projet

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

---

## Plan d'implémentation (à suivre dans l'ordre)

### Phase 1 — Fondations (faire en premier)

**1.1 Setup projet**
```bash
npm create vite@latest financiel-vision -- --template react
cd financiel-vision
npm install zustand recharts papaparse date-fns react-window
npm install -D tailwindcss postcss autoprefixer vitest @testing-library/react @testing-library/jest-dom jsdom
npx tailwindcss init -p
```

Configurer Tailwind avec les couleurs de la charte dans `tailwind.config.js` :
```js
theme: {
  extend: {
    colors: {
      'fv-blue': { DEFAULT: '#B1DCE2', light: '#E3F2F5' },
      'fv-green': { DEFAULT: '#31B700', dark: '#268E00', light: '#E8F5E0' },
      'fv-orange': { DEFAULT: '#FF8200', dark: '#E57300', light: '#FFF3E0' },
      'fv-lime': { DEFAULT: '#93C90E', light: '#F0F7D4' },
      'fv-forest': '#00965E',
      'fv-red': '#E53935',
      'fv-text': { DEFAULT: '#1A202C', secondary: '#718096' },
      'fv-bg': { DEFAULT: '#FFFFFF', secondary: '#F8FAFB' },
      'fv-border': '#E2E8F0',
    }
  }
}
```

**1.2 Module `engine/parseFec.js`** — le cœur du parsing

C'est le module le plus critique. Il doit :
- Détecter l'encodage (UTF-8, ISO-8859-15, Windows-1252) — utiliser TextDecoder avec différents encodages
- Détecter le séparateur (`|` ou `\t`) en analysant la 1ère ligne
- Valider le header FEC (18 colonnes exactes dans l'ordre : JournalCode, JournalLib, EcritureNum, EcritureDate, CompteNum, CompteLib, CompAuxNum, CompAuxLib, PieceRef, PieceDate, EcritureLib, Debit, Credit, EcritureLet, DateLet, ValidDate, Montantdevise, Idevise)
- Parser les montants au format français : virgule décimale, espaces à supprimer → `parseFloat(str.trim().replace(/\s/g, '').replace(',', '.'))`
- Parser les dates format `YYYYMMDD` → Date
- Tourner dans un **Web Worker** (PapaParse supporte `worker: true`)
- Renvoyer un objet `ParsedFEC` complet (voir PRB §6.2)

Voici la structure du FEC d'exemple :
```
JournalCode|JournalLib|EcritureNum|EcritureDate|CompteNum|CompteLib|CompAuxNum|CompAuxLib|PieceRef|PieceDate|EcritureLib|Debit|Credit|EcritureLet|DateLet|ValidDate|Montantdevise|Idevise
ANC|A nouveaux pour cloture|2758|20240101|51211000|Banque Crédit Agricole...|||15335|20240101|A.N. au 01/01/2024|31004,01|0,00|||20250124|31004,01|
```

**Règle critique : un seul fichier accepté.** Si l'utilisateur dépose plus d'un fichier → erreur bloquante.

**1.3 Module `engine/exerciceUtils.js`** — gestion des exercices (y compris décalés)

- Extraire le SIREN et la date de clôture depuis le nom de fichier (pattern : `{SIREN}DONNEESCOMPTABLES{YYYYMMDD}.csv`)
- Déduire la date de début d'exercice : date la plus ancienne parmi les écritures du journal "ANC", ou (date clôture − 12 mois + 1 jour) par défaut
- Construire le tableau des mois de l'exercice dans l'ordre : ex. si exercice avril→mars, `exerciceMonths = [4,5,6,7,8,9,10,11,12,1,2,3]`
- Fournir une fonction `getMonthLabel(monthNumber)` qui renvoie le nom du mois en français
- Fournir une fonction `getExerciceLabel(start, end)` qui renvoie "Exercice 2024" ou "Exercice avril 2024 — mars 2025"

**1.4 Tests unitaires du parsing**

Écrire des tests avec Vitest qui chargent le FEC d'exemple et vérifient :
- Nombre de lignes parsées = 3316
- Encodage détecté = ISO-8859-15
- Séparateur détecté = `|`
- SIREN extrait = 381304559
- Premier compte = 51211000 (Banque CA)
- Montant correctement parsé : "31004,01" → 31004.01

---

### Phase 2 — Moteur de calcul SIG

**2.1 Module `engine/computeSig.js`**

Calcule tous les postes du SIG selon le **PCG Coopératives Agricoles (CUMA)**. Voici le mapping complet comptes → postes :

```javascript
const SIG_MAPPING = [
  {
    id: 'chiffre_affaires',
    label: 'Chiffre d\'affaires',
    prefix: null,
    isTotal: false,
    // Produits classe 7 : crédit - débit
    accounts: [
      { range: '701', sign: 1 },
      { range: '702', sign: 1 },
      { range: '703', sign: 1 },
      { range: '704', sign: 1 },
      { range: '705', sign: 1 },
      { range: '706', sign: 1 },  // Travaux agricoles (spécifique CUMA)
      { range: '707', sign: 1 },
      { range: '708', sign: 1 },
      // Exclure 709* (rabais, remises)
    ],
    type: 'product'  // crédit - débit
  },
  {
    id: 'production_stockee',
    label: 'Prod. stockée / déstockage',
    prefix: '+',
    isTotal: false,
    accounts: [{ range: '713', sign: 1 }],
    type: 'product'
  },
  {
    id: 'subventions_exploitation',
    label: 'Subventions d\'exploitation',
    prefix: '+',
    isTotal: false,
    accounts: [{ range: '74', sign: 1 }],  // Inclut 745* spécifique CUMA
    type: 'product'
  },
  {
    id: 'achats_consommes',
    label: 'Achats consommés nets',
    prefix: '−',
    isTotal: false,
    accounts: [
      { range: '601', sign: 1 },
      { range: '602', sign: 1 },
      { range: '603', sign: 1 },  // Variation stocks
      { range: '604', sign: 1 },
      { range: '605', sign: 1 },
      { range: '606', sign: 1 },
      { range: '607', sign: 1 },
    ],
    type: 'charge'  // débit - crédit
  },
  {
    id: 'marge_brute',
    label: 'Marge brute',
    prefix: '=',
    isTotal: true,
    computed: ['chiffre_affaires', '+production_stockee', '+subventions_exploitation', '-achats_consommes']
  },
  {
    id: 'services_exterieurs',
    label: 'Services extérieurs',
    prefix: '−',
    isTotal: false,
    accounts: [
      { range: '61', sign: 1 },
      { range: '62', sign: 1 },
      // ⚠️ EXCLURE 621* (intérimaire → classé en personnel)
    ],
    excludeRanges: ['621'],
    type: 'charge'
  },
  {
    id: 'valeur_ajoutee',
    label: 'Valeur Ajoutée',
    prefix: '=',
    isTotal: true,
    computed: ['marge_brute', '-services_exterieurs']
  },
  {
    id: 'charges_personnel',
    label: 'Charges de personnel',
    prefix: '−',
    isTotal: false,
    accounts: [
      { range: '64', sign: 1 },
      { range: '621', sign: 1 },  // ⚠️ Intérimaire classé ici pour les CUMA
    ],
    type: 'charge'
  },
  {
    id: 'impots_taxes',
    label: 'Impôts & taxes (exploit.)',
    prefix: '−',
    isTotal: false,
    accounts: [{ range: '63', sign: 1 }],
    type: 'charge'
  },
  {
    id: 'ebe',
    label: 'EBE (Excédent Brut d\'Exploitation)',
    prefix: '=',
    isTotal: true,
    computed: ['valeur_ajoutee', '-charges_personnel', '-impots_taxes']
  },
  {
    id: 'dotations',
    label: 'Dotations amortissements',
    prefix: '−',
    isTotal: false,
    accounts: [{ range: '681', sign: 1 }, { range: '686', sign: 1 }],
    type: 'charge'
  },
  {
    id: 'reprises',
    label: 'Reprises',
    prefix: '+',
    isTotal: false,
    accounts: [{ range: '781', sign: 1 }, { range: '786', sign: 1 }],
    type: 'product'
  },
  {
    id: 'autres_produits_gestion',
    label: 'Autres produits gestion',
    prefix: '+',
    isTotal: false,
    accounts: [{ range: '75', sign: 1 }],
    type: 'product'
  },
  {
    id: 'autres_charges_gestion',
    label: 'Autres charges gestion',
    prefix: '−',
    isTotal: false,
    accounts: [{ range: '65', sign: 1 }],
    type: 'charge'
  },
  {
    id: 'resultat_exploitation',
    label: 'Résultat d\'Exploitation',
    prefix: '=',
    isTotal: true,
    computed: ['ebe', '-dotations', '+reprises', '+autres_produits_gestion', '-autres_charges_gestion']
  },
  {
    id: 'produits_financiers',
    label: 'Produits financiers',
    prefix: '+',
    isTotal: false,
    accounts: [{ range: '76', sign: 1 }],
    type: 'product'
  },
  {
    id: 'charges_financieres',
    label: 'Charges financières',
    prefix: '−',
    isTotal: false,
    accounts: [{ range: '66', sign: 1 }],
    type: 'charge'
  },
  {
    id: 'resultat_financier',
    label: 'Résultat financier',
    prefix: '=',
    isTotal: true,
    computed: ['+produits_financiers', '-charges_financieres']
  },
  {
    id: 'resultat_courant',
    label: 'Résultat courant avant IS',
    prefix: '=',
    isTotal: true,
    computed: ['resultat_exploitation', '+resultat_financier']
  },
  {
    id: 'produits_exceptionnels',
    label: 'Produits exceptionnels',
    prefix: '+',
    isTotal: false,
    accounts: [{ range: '77', sign: 1 }],
    type: 'product'
  },
  {
    id: 'charges_exceptionnelles',
    label: 'Charges exceptionnelles',
    prefix: '−',
    isTotal: false,
    accounts: [{ range: '67', sign: 1 }],
    type: 'charge'
  },
  {
    id: 'resultat_exceptionnel',
    label: 'Résultat exceptionnel',
    prefix: '=',
    isTotal: true,
    computed: ['+produits_exceptionnels', '-charges_exceptionnelles']
  },
  {
    id: 'is_participation',
    label: 'IS & participation',
    prefix: '−',
    isTotal: false,
    accounts: [{ range: '69', sign: 1 }],
    type: 'charge'
  },
  {
    id: 'resultat_net',
    label: 'RÉSULTAT NET',
    prefix: '=',
    isTotal: true,
    computed: ['resultat_courant', '+resultat_exceptionnel', '-is_participation']
  }
];
```

**Règle critique pour le calcul :**
- Produits (classe 7) : montant = Σ(crédit) − Σ(débit) → positif = produit
- Charges (classe 6) : montant = Σ(débit) − Σ(crédit) → positif = charge
- **EXCLURE les écritures du journal "ANC"** (à-nouveau) du calcul SIG — elles ne concernent que le bilan
- Un compte "commence par" une range si `compteNum.startsWith(range)`
- Pour les `excludeRanges`, exclure le compte si `compteNum.startsWith(excludeRange)`
- Les postes `computed` sont calculés en chaîne : le signe (+/-) devant l'id indique l'opération

**2.2 Module `engine/drillDown.js`**

Pour un poste SIG donné, retourner :
- La liste des comptes qui y contribuent (avec nb écritures, total, solde)
- Pour un compte donné, la liste des écritures triées par date avec un solde running cumulé

**2.3 Module `engine/formatUtils.js`**

```javascript
// Formatage montant en € : "18 750 €" ou "482 k€"
function formatAmount(amount, forceKilo = false) { ... }
// Formatage % : "33,0%"
function formatPercent(value) { ... }
// Formatage date : "10/01/2024"
function formatDate(date) { ... }
```

Utiliser `Intl.NumberFormat('fr-FR', ...)` pour le formatage.

**2.4 Tests SIG**

Charger le FEC d'exemple et vérifier que les totaux SIG sont cohérents (la somme des sous-lignes = lignes de total). Vérifier que les écritures ANC sont exclues.

---

### Phase 3 — Store et UI principale

**3.1 Store Zustand (`store/useStore.js`)**

```javascript
const useStore = create((set, get) => ({
  // État
  view: 'upload',           // 'upload' | 'dashboard'
  parsedFec: null,           // ParsedFEC
  sigData: null,             // Résultat computeSig
  monthlyData: null,         // Données mensuelles
  treasuryData: null,        // Données trésorerie
  chargesData: null,         // Données charges
  bilanData: null,           // Données bilan
  activeTab: 'sig',          // 'sig' | 'monthly' | 'treasury' | 'charges' | 'balance'
  activeSubTab: 'mensuel',   // 'mensuel' | 'cumule' | 'tableau'
  detailPanel: null,         // { type, id, data } ou null
  isLoading: false,
  error: null,
  parseWarnings: [],

  // Actions
  loadFec: async (file) => { ... },
  loadDemo: async () => { ... },
  setActiveTab: (tab) => set({ activeTab: tab, detailPanel: null }),
  openDetail: (type, id) => { ... },
  closeDetail: () => set({ detailPanel: null }),
  reset: () => set({ view: 'upload', parsedFec: null, ... }),
}));
```

**3.2 Composants layout**

Implémenter dans cet ordre : App.jsx → UploadPage → AppHeader → KpiBar → TabNav → SigTable → DetailPanel

**3.3 Page Upload (E-01)**

- Dropzone avec drag & drop
- Validation : 1 seul fichier, extension .csv/.txt, header FEC valide
- Barre de progression pendant le parsing
- Bouton "⚡ Charger les données de démonstration"
- Message RGPD : "🔒 Vos données restent dans votre navigateur"

**3.4 Dashboard SIG (E-02)**

- Header : logo + nom du fichier FEC + période exercice
- 4 KPI cards avec Sparkline (12 mois)
- Tableau SIG (colonnes : Libellé, Montant, % CA, chevron >)
- Clic ligne → ouvre DetailPanel

---

### Phase 4 — Onglets analyses

**4.1 Analyses mensuelles (E-04, E-05, E-06)**

Module `engine/computeSig.js` doit aussi produire les données mensuelles (`MonthlyData[]`). Les mois sont ordonnés selon l'exercice (voir `exerciceUtils.js`).

- Sous-onglet Mensuel : 6 graphiques Recharts (BarChart / LineChart / AreaChart) en grille 2×3
- Sous-onglet Cumulé : LineChart avec 2 séries (CA cumulé, EBE cumulé)
- Sous-onglet Tableau : table HTML avec colonnes CA, Marge brute, %Marge, EBE, %EBE/CA, REX, %REX/CA, Rés. Net

**4.2 Trésorerie (E-07)**

Module `engine/computeTreasury.js` :
- Comptes de trésorerie = 51* + 53*
- Solde d'ouverture = écritures ANC sur ces comptes (débit − crédit)
- Solde quotidien = solde veille + (débits − crédits du jour sur comptes 51*/53*)
  - ⚠️ Débit sur compte 51* = entrée d'argent (encaissement)
  - ⚠️ Crédit sur compte 51* = sortie d'argent (décaissement)
- Top 10 encaissements = 10 plus gros débits individuels sur 51*
- Top 10 décaissements = 10 plus gros crédits individuels sur 51*

UI : 6 KPI cards + courbe Recharts (AreaChart) + toggle période + 2 colonnes top 10

**4.3 Structure charges (E-08)**

Module `engine/computeCharges.js` :

Catégories :
```javascript
const CHARGE_CATEGORIES = [
  { id: 'personnel', label: 'Personnel', ranges: ['64', '621'], color: '#FF8200' },
  { id: 'services_ext', label: 'Services ext.', ranges: ['61', '62'], excludeRanges: ['621'], color: '#31B700' },
  { id: 'dotations', label: 'Dotations', ranges: ['68'], color: '#00965E' },
  { id: 'achats', label: 'Achats', ranges: ['60'], excludeRanges: ['603'], color: '#93C90E' },
  { id: 'financieres', label: 'Financières', ranges: ['66'], color: '#B1DCE2' },
  { id: 'impots_taxes', label: 'Impôts & taxes', ranges: ['63'], color: '#E53935' },
];
```

UI : PieChart Recharts (donut avec `innerRadius`) + liste détail + BarChart mensuel au clic

**4.4 Bilan simplifié (E-09)**

Module `engine/computeBilan.js` :

⚠️ **Spécificité CUMA — Compte 453* (Adhérents tvx & cessions)** :
- Calculer le solde net global de tous les comptes commençant par 453
- Si solde débiteur → classer en Actif circulant ("Créances adhérents nettes")
- Si solde créditeur → classer en Passif dettes ("Dettes adhérents")
- Le drill-down montre le détail par compte auxiliaire (adhérent individuel)

Ratios bilanciels :
```javascript
const ratios = {
  fondsRoulement: (capitauxPropres + dettesMLT) - actifImmobilise,
  bfr: (stocks + creances) - dettesCT,  // hors trésorerie
  autonomieFinanciere: (capitauxPropres / totalPassif) * 100,
  liquiditeGenerale: actifCirculant / dettesCT,
};
```

Seuils indicatifs (indicateur vert/orange/rouge) :
- Autonomie financière : > 50% vert, 30-50% orange, < 30% rouge
- Liquidité générale : > 1.5 vert, 1-1.5 orange, < 1 rouge

**Avertissement bilan déséquilibré** : si Total Actif ≠ Total Passif, afficher un bandeau orange "⚠️ Attention : écart de {montant} € entre l'actif et le passif".

---

### Phase 5 — Polish et finalisation

- Responsive (tablette : KPIs 2×2, mobile : empilé)
- Accessibilité : aria-labels, navigation clavier, focus visible
- Virtualisation react-window sur les listes d'écritures > 500 lignes
- Préparer le FEC de démo (anonymiser le fichier fourni : remplacer les noms d'adhérents et ajuster le SIREN)
- Tests E2E basiques avec Vitest

---

## Règles de développement

1. **Toujours commencer par le module `engine/` avant le composant UI correspondant.** La logique métier doit être testable indépendamment de React.
2. **Écrire les tests en même temps que le code.** Chaque module engine doit avoir son fichier de test.
3. **Le FEC d'exemple dans `data/` est la source de vérité.** Tous les calculs doivent être vérifiés contre ce fichier.
4. **Ne pas hardcoder les mois Janvier-Décembre.** Utiliser `exerciceUtils` pour gérer les exercices décalés.
5. **Formatage français partout** : séparateur milliers = espace, décimale = virgule, dates = JJ/MM/AAAA.
6. **Pas de localStorage, pas de sessionStorage** — tout vit en mémoire (store Zustand).
7. **Le 621* est en charges de personnel, PAS en services extérieurs.** C'est une décision métier CUMA validée.
8. **Les écritures ANC (à-nouveau) sont exclues du SIG** mais incluses dans le bilan et la trésorerie.
