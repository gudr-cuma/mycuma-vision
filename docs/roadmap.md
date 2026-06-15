# Plan d'implémentation & spécifications métier (référence)

> Extrait du `CLAUDE.md` d'origine. Le plan ci-dessous a **largement été réalisé** ;
> il reste la **référence des règles métier** (mapping SIG PCG CUMA, catégories de
> charges, calculs de trésorerie et de bilan). Le détail couleurs Tailwind a été
> déplacé dans [charte-graphique.md](charte-graphique.md).

## Phase 1 — Fondations

### 1.2 Module `engine/parseFec.js` — le cœur du parsing

Il doit :
- Détecter l'encodage (UTF-8, ISO-8859-15, Windows-1252) — via TextDecoder avec différents encodages
- Détecter le séparateur (`|` ou `\t`) en analysant la 1ère ligne
- Valider le header FEC (18 colonnes exactes dans l'ordre : JournalCode, JournalLib, EcritureNum, EcritureDate, CompteNum, CompteLib, CompAuxNum, CompAuxLib, PieceRef, PieceDate, EcritureLib, Debit, Credit, EcritureLet, DateLet, ValidDate, Montantdevise, Idevise)
- Parser les montants au format français : `parseFloat(str.trim().replace(/\s/g, '').replace(',', '.'))`
- Parser les dates format `YYYYMMDD` → Date
- Tourner dans un **Web Worker** (PapaParse supporte `worker: true`)
- Renvoyer un objet `ParsedFEC` complet (voir PRB §6.2)

Structure du FEC d'exemple :
```
JournalCode|JournalLib|EcritureNum|EcritureDate|CompteNum|CompteLib|CompAuxNum|CompAuxLib|PieceRef|PieceDate|EcritureLib|Debit|Credit|EcritureLet|DateLet|ValidDate|Montantdevise|Idevise
ANC|A nouveaux pour cloture|2758|20240101|51211000|Banque Crédit Agricole...|||15335|20240101|A.N. au 01/01/2024|31004,01|0,00|||20250124|31004,01|
```

**Règle critique : un seul fichier accepté.** Plus d'un fichier déposé → erreur bloquante.

### 1.3 Module `engine/exerciceUtils.js` — gestion des exercices (y compris décalés)

- Extraire le SIREN et la date de clôture depuis le nom de fichier (pattern : `{SIREN}DONNEESCOMPTABLES{YYYYMMDD}.csv`)
- Déduire la date de début d'exercice : date la plus ancienne parmi les écritures du journal "ANC", ou (date clôture − 12 mois + 1 jour) par défaut
- Construire le tableau des mois de l'exercice dans l'ordre : ex. exercice avril→mars, `exerciceMonths = [4,5,6,7,8,9,10,11,12,1,2,3]`
- `getMonthLabel(monthNumber)` → nom du mois en français
- `getExerciceLabel(start, end)` → "Exercice 2024" ou "Exercice avril 2024 — mars 2025"

### 1.4 Tests unitaires du parsing
Charger le FEC d'exemple et vérifier : 3316 lignes, encodage ISO-8859-15, séparateur `|`, SIREN 381304559, premier compte 51211000 (Banque CA), "31004,01" → 31004.01.

---

## Phase 2 — Moteur de calcul SIG

### 2.1 Module `engine/computeSig.js`

Calcule tous les postes du SIG selon le **PCG Coopératives Agricoles (CUMA)**. Mapping complet comptes → postes :

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

### 2.2 Module `engine/drillDown.js`
Pour un poste SIG donné, retourner :
- La liste des comptes qui y contribuent (nb écritures, total, solde)
- Pour un compte donné, la liste des écritures triées par date avec un solde running cumulé

### 2.3 Module `engine/formatUtils.js`
```javascript
function formatAmount(amount, forceKilo = false) { ... } // "18 750 €" ou "482 k€"
function formatPercent(value) { ... }                    // "33,0%"
function formatDate(date) { ... }                        // "10/01/2024"
```
Utiliser `Intl.NumberFormat('fr-FR', ...)`.

### 2.4 Tests SIG
Vérifier que les totaux SIG sont cohérents (somme des sous-lignes = lignes de total) et que les écritures ANC sont exclues.

---

## Phase 3 — Store et UI principale

### 3.1 Store Zustand (`store/useStore.js`)
```javascript
const useStore = create((set, get) => ({
  view: 'upload',           // 'upload' | 'dashboard'
  parsedFec: null,           // ParsedFEC
  sigData: null,             // Résultat computeSig
  monthlyData: null,
  treasuryData: null,
  chargesData: null,
  bilanData: null,
  activeTab: 'sig',          // 'sig' | 'monthly' | 'treasury' | 'charges' | 'balance'
  activeSubTab: 'mensuel',   // 'mensuel' | 'cumule' | 'tableau'
  detailPanel: null,
  isLoading: false,
  error: null,
  parseWarnings: [],
  loadFec: async (file) => { ... },
  loadDemo: async () => { ... },
  setActiveTab: (tab) => set({ activeTab: tab, detailPanel: null }),
  openDetail: (type, id) => { ... },
  closeDetail: () => set({ detailPanel: null }),
  reset: () => set({ view: 'upload', parsedFec: null, ... }),
}));
```

### 3.2 Composants layout
Ordre : App.jsx → UploadPage → AppHeader → KpiBar → TabNav → SigTable → DetailPanel

### 3.3 Page Upload (E-01)
Dropzone drag & drop ; validation (1 fichier, .csv/.txt, header FEC valide) ; barre de progression ; bouton "⚡ Charger les données de démonstration" ; message RGPD "🔒 Vos données restent dans votre navigateur".

### 3.4 Dashboard SIG (E-02)
Header (logo + nom fichier + période) ; 4 KPI cards avec Sparkline (12 mois) ; tableau SIG (Libellé, Montant, % CA, chevron) ; clic ligne → DetailPanel.

---

## Phase 4 — Onglets analyses

### 4.1 Analyses mensuelles (E-04, E-05, E-06)
`computeSig.js` produit aussi `MonthlyData[]`, mois ordonnés selon l'exercice (`exerciceUtils.js`).
- Mensuel : 6 graphiques Recharts (Bar/Line/Area) en grille 2×3
- Cumulé : LineChart 2 séries (CA cumulé, EBE cumulé)
- Tableau : CA, Marge brute, %Marge, EBE, %EBE/CA, REX, %REX/CA, Rés. Net

### 4.2 Trésorerie (E-07) — `engine/computeTreasury.js`
- Comptes de trésorerie = 51* + 53*
- Solde d'ouverture = écritures ANC sur ces comptes (débit − crédit)
- Solde quotidien = solde veille + (débits − crédits du jour sur 51*/53*)
  - ⚠️ Débit sur 51* = encaissement ; Crédit sur 51* = décaissement
- Top 10 encaissements = 10 plus gros débits individuels sur 51*
- Top 10 décaissements = 10 plus gros crédits individuels sur 51*

UI : 6 KPI cards + AreaChart + toggle période + 2 colonnes top 10.

### 4.3 Structure charges (E-08) — `engine/computeCharges.js`
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
UI : PieChart donut (`innerRadius`) + liste détail + BarChart mensuel au clic.

### 4.4 Bilan simplifié (E-09) — `engine/computeBilan.js`

⚠️ **Spécificité CUMA — Compte 453\* (Adhérents tvx & cessions)** :
- Solde net global de tous les comptes commençant par 453
- Solde débiteur → Actif circulant ("Créances adhérents nettes")
- Solde créditeur → Passif dettes ("Dettes adhérents")
- Drill-down par compte auxiliaire (adhérent individuel)

Ratios bilanciels :
```javascript
const ratios = {
  fondsRoulement: (capitauxPropres + dettesMLT) - actifImmobilise,
  bfr: (stocks + creances) - dettesCT,  // hors trésorerie
  autonomieFinanciere: (capitauxPropres / totalPassif) * 100,
  liquiditeGenerale: actifCirculant / dettesCT,
};
```
Seuils (vert/orange/rouge) :
- Autonomie financière : > 50% vert, 30-50% orange, < 30% rouge
- Liquidité générale : > 1.5 vert, 1-1.5 orange, < 1 rouge

**Avertissement bilan déséquilibré** : si Total Actif ≠ Total Passif → bandeau orange "⚠️ Attention : écart de {montant} € entre l'actif et le passif".

---

## Phase 5 — Polish et finalisation
- Responsive (tablette : KPIs 2×2, mobile : empilé)
- Accessibilité : aria-labels, navigation clavier, focus visible
- Virtualisation react-window sur les listes d'écritures > 500 lignes
- FEC de démo anonymisé (noms d'adhérents remplacés, SIREN ajusté)
- Tests E2E basiques avec Vitest
