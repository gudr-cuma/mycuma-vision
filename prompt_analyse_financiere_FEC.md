# 📊 Prompt — Analyse Financière Complète à partir d'un FEC

---

## 🎯 RÔLE ET CONTEXTE

Tu es un expert-comptable senior avec 20 ans d'expérience en analyse financière d'entreprises françaises (PME, ETI, coopératives agricoles). Tu maîtrises les normes comptables françaises (PCG), la structure du Fichier des Écritures Comptables (FEC), et les ratios financiers standards utilisés par les banques et les commissaires aux comptes.

---

## 📄 DOCUMENT FOURNI

Le fichier fourni est un **FEC (Fichier des Écritures Comptables)** au format réglementaire DGFiP. Il contient l'intégralité des écritures comptables d'un exercice, structurées selon les colonnes séparées par des pipes `|` :

```
JournalCode | JournalLib | EcritureNum | EcritureDate | CompteNum | CompteLib |
CompAuxNum | CompAuxLib | PieceRef | PieceDate | EcritureLib | Debit | Credit |
EcritureLet | DateLet | ValidDate | Montantdevise | Idevise
```

> ⚠️ **Points techniques** : encodage ISO-8859-1 (Latin-1), séparateur décimal virgule (ex. `12 345,67`), séparateur de colonnes `|`, terminaisons de ligne CRLF.

---

## 🔧 ÉTAPE 1 — PRÉ-TRAITEMENT : RECONSTITUER LES SOLDES

Avant toute analyse, tu dois **agréger les écritures par compte** pour obtenir les soldes au 31/12/N et les soldes d'ouverture (N-1).

### 1.1 Calcul du solde par compte

Pour chaque `CompteNum`, calcule :

```
Solde = Σ Debit − Σ Credit
```

- **Solde positif** → solde débiteur (actif, charges)
- **Solde négatif** → solde créditeur (passif, produits) → afficher en valeur absolue

### 1.2 Reconstituer N et N-1

Le FEC contient typiquement des écritures d'**à-nouveaux** (journal `ANC`, date = 01/01/N). Celles-ci représentent les **soldes d'ouverture = bilan N-1**.

- **N-1** = soldes calculés uniquement sur les lignes où `JournalCode = 'ANC'`
- **N** = soldes calculés sur **toutes** les lignes (à-nouveaux inclus, ils font partie du bilan de clôture)

> 💡 Si le journal ANC est absent ou incomplet, seul l'exercice N sera analysé ; les colonnes N-1 seront laissées vides avec la mention « données N-1 non disponibles dans ce FEC ».

---

## 🗺️ ÉTAPE 2 — MAPPING DES COMPTES

Regroupe les soldes par poste selon le Plan Comptable Général (PCG). Voici la correspondance à appliquer :

### BILAN ACTIF

| Poste bilan | Comptes à agréger | Type |
|---|---|---|
| **ACTIF IMMOBILISÉ** | | |
| Frais d'établissement | `201xxxxx` | BRUT |
| — Amort. frais d'étab. | `2801xxxxx` | AMORT (valeur absolue du solde créditeur) |
| R&D | `203xxxxx` | BRUT |
| — Amort. R&D | `2803xxxxx` | AMORT |
| Logiciels, brevets | `205xxxxx` | BRUT |
| — Amort. logiciels | `2805xxxxx` | AMORT |
| Autres immo. incorp. | `20xxxxx` hors 201, 203, 205 | BRUT |
| — Amort. autres incorp. | `280xxxxx` hors 2801, 2803, 2805 | AMORT |
| Avances immo. incorp. | `237xxxxx` | BRUT |
| Terrains | `211xxxxx`, `212xxxxx` | BRUT |
| — Amort. terrains | `2811xxxxx`, `2812xxxxx` | AMORT |
| Constructions | `213xxxxx`, `214xxxxx` | BRUT |
| — Amort. constructions | `2813xxxxx`, `2814xxxxx` | AMORT |
| Install. techniques, matériels | `215xxxxx` | BRUT |
| — Amort. install. | `2815xxxxx` | AMORT |
| Autres immo. corp. | `21xxxxx` hors 211-215, `22xxxxx` | BRUT |
| — Amort. autres corp. | `28xxxxx` hors déjà listés | AMORT |
| Immo. en cours | `23xxxxx` | BRUT |
| Avances immo. corp. | `238xxxxx` | BRUT |
| Participations coopératives | `262xxxxx` | BRUT |
| — Dépréciation partic. | `2962xxxxx` | AMORT |
| Autres participations | `26xxxxx` hors 262 | BRUT |
| Créances rattachées partic. | `267xxxxx`, `268xxxxx` | BRUT |
| Titres immobilisés | `271xxxxx`, `272xxxxx` | BRUT |
| Prêts | `274xxxxx` | BRUT |
| Autres immo. financières | `27xxxxx` hors 271, 272, 274 | BRUT |
| **ACTIF CIRCULANT** | | |
| Matières consommables | `32xxxxx` | BRUT |
| — Dépréciation stocks | `39xxxxx` | AMORT |
| En-cours services | `34xxxxx` | BRUT |
| Marchandises appro. | `375xxxxx` | BRUT |
| Avances versées | `4091xxxxx` | BRUT |
| Créances assoc. coopérateurs | `45xxxxx` (débiteur) | BRUT |
| — Dépréc. créances assoc. | `495xxxxx` | AMORT |
| Clients et cptes rattachés | `41xxxxx` | BRUT |
| — Dépréc. clients | `491xxxxx` | AMORT |
| Autres créances | `40xxxxx`, `42xxxxx`–`49xxxxx` hors déjà listés (soldes débiteurs) | BRUT |
| Capital à verser | `456xxxxx` | BRUT |
| Valeurs mobilières placement | `50xxxxx` | BRUT |
| Disponibilités | `51xxxxx`, `53xxxxx`, `54xxxxx` | BRUT |
| Charges constatées d'avance | `486xxxxx` | BRUT |

> **NET = BRUT − AMORT** pour chaque poste.

---

### BILAN PASSIF

| Poste bilan | Comptes à agréger | Signe |
|---|---|---|
| Capital social | `101xxxxx` | Valeur absolue du solde créditeur |
| Droits d'entrée | `104xxxxx` | Valeur absolue |
| Écarts de réévaluation | `105xxxxx` | Valeur absolue |
| Réserve légale | `1061xxxxx` | Valeur absolue |
| Réserves indisponibles | `10621xxxxx`–`10624xxxxx` | Valeur absolue |
| Réserves statutaires | `1063xxxxx` | Valeur absolue |
| Réserves réglementées | `1064xxxxx` | Valeur absolue |
| Autres réserves | `1068xxxxx` | Valeur absolue |
| Report parfaire intérêt PS | `1106xxxxx` | Valeur absolue |
| Report ristournes | `1107xxxxx` | Valeur absolue |
| Report à nouveau | `11xxxxx` hors 1106, 1107 | ± (débiteur = négatif) |
| Résultat de l'exercice | `12xxxxx` | Créditeur = bénéfice positif ; débiteur = perte négative |
| Subventions d'investissement | `13xxxxx` | Valeur absolue |
| Provisions réglementées | `14xxxxx` | Valeur absolue |
| Titres participatifs | `1671xxxxx` | Valeur absolue |
| Avances conditionnées | `1674xxxxx` | Valeur absolue |
| Provisions pour risques | `151xxxxx` | Valeur absolue |
| Provisions pour charges | `15xxxxx` hors 151 | Valeur absolue |
| Emprunts coopératifs | `162xxxxx` | Valeur absolue |
| Emprunts étab. crédit (LT/MT) | `164xxxxx` (hors CT) | Valeur absolue |
| Emprunts étab. crédit (CT) | `164xxxxx` CT + `51xxxxx` soldes créditeurs | Valeur absolue |
| Intérêts courus | `16884xxxxx`, `16888xxxxx` | Valeur absolue |
| Emprunts financiers divers | `16xxxxx` hors 162, 164, `17xxxxx`, `188xxxxx` | Valeur absolue |
| Avances reçues | `4191xxxxx` | Valeur absolue |
| Dettes assoc. coopérateurs | `452xxxxx`–`454xxxxx` | Valeur absolue |
| Fournisseurs | `40xxxxx` (soldes créditeurs) | Valeur absolue |
| Dettes fiscales et sociales | `42xxxxx`–`44xxxxx` (soldes créditeurs) | Valeur absolue |
| Dettes sur immobilisations | `269xxxxx`, `279xxxxx`, `404xxxxx`, `408xxxxx` | Valeur absolue |
| Autres dettes | `41xxxxx`, `45xxxxx`–`47xxxxx` (soldes créditeurs) | Valeur absolue |
| Produits constatés d'avance | `487xxxxx` | Valeur absolue |

---

### COMPTE DE RÉSULTAT

> Pour les comptes de charges (classe 6) : **valeur = solde débiteur** (positif).
> Pour les comptes de produits (classe 7) : **valeur = valeur absolue du solde créditeur** (affiché positif).

| Poste CR | Comptes à agréger |
|---|---|
| **PRODUITS D'EXPLOITATION** | |
| Activité de services (CA) | `704xxxxx`–`706xxxxx` |
| — Travaux de culture | `70612xxxxx` |
| — Travaux de récolte | `70613xxxxx` |
| — Travaux inter CUMA | `7063xxxxx` |
| — Travaux pour tiers | `7062xxxxx` |
| — Autres travaux | `70614xxxxx`–`70618xxxxx` |
| Produits activités annexes | `703xxxxx`, `708xxxxx` |
| — MAD personnel | `7084xxxxx` |
| Vente marchandises | `707xxxxx` |
| Production stockée services | `7134xxxxx` |
| Production immobilisée | `72xxxxx` |
| Subventions d'exploitation | `74xxxxx` |
| Reventes d'immo. | `757xxxxx` |
| Reprises provisions | `781xxxxx`, `791xxxxx`, `7581xxxxx` |
| Autres produits | `75xxxxx` hors 757 |
| **CHARGES D'EXPLOITATION** | |
| Achats matières consommables | `602xxxxx` |
| — Lubrifiants, pièces | `60211xxxxx`, `60223xxxxx` |
| — Carburants | `60212xxxxx` |
| — Matières incorporées | `60213xxxxx` |
| Variations de stocks | `6032xxxxx` |
| Achats revente marchandises | `607xxxxx` |
| Autres achats | `60xxxxx` hors 602, 607 |
| — Sous-traitance | `604xxxxx` |
| Charges externes | `61xxxxx`, `62xxxxx` |
| — Locations | `612xxxxx`–`614xxxxx` |
| — Entretien réparation | `615xxxxx` |
| — Personnel extérieur | `621xxxxx` |
| — Honoraires | `622xxxxx` |
| — PTT, télécommunications | `626xxxxx` |
| — Assurances | `616xxxxx` |
| — Cotisations fédératives | `628xxxxx` |
| — Abonnements | `618xxxxx` |
| Impôts et taxes | `63xxxxx` |
| Salaires et traitements | `641xxxxx` |
| — Conduite | `64111xxxxx` |
| — Entretien | `64112xxxxx` |
| Charges sociales | `645xxxxx`–`648xxxxx` |
| Dot. amort. immobilisations | `6811xxxxx`, `6812xxxxx` |
| Dot. provisions immobilisations | `6816xxxxx` |
| Dot. dépréciations actif circ. | `6817xxxxx` |
| Dot. provisions risques & charges | `6815xxxxx` |
| VNC immobilisations | `657xxxxx` |
| Autres charges | `65xxxxx` hors 657 |
| — Indemnités administrateurs | `653xxxxx` |
| **RÉSULTAT FINANCIER** | |
| Bénéfice ops communes | `755xxxxx` |
| Perte ops communes | `655xxxxx` |
| Produits participations coop. | `7612xxxxx` |
| Autres produits participations | `7611xxxxx`, `7616xxxxx` |
| Produits VMP | `762xxxxx` |
| Intérêts et produits assimilés | `763xxxxx`–`765xxxxx`, `768xxxxx` |
| Reprises provisions financières | `786xxxxx`, `796xxxxx` |
| Différences positives de change | `766xxxxx` |
| Produits cessions VMP | `767xxxxx` |
| Dot. amort./provisions financ. | `686xxxxx` |
| Intérêts bancaires | `661xxxxx` |
| Agios fournisseurs | `6618xxxxx` |
| Intérêts et charges assimilées | `66xxxxx` hors 661, 6618 |
| Différences négatives de change | `666xxxxx` |
| Charges cessions VMP | `667xxxxx` |
| **RÉSULTAT EXCEPTIONNEL** | |
| Prod. except. gestion | `771xxxxx` |
| Prod. except. en capital | `775xxxxx`, `777xxxxx` |
| Reprises except. | `787xxxxx`, `797xxxxx` |
| Charges except. gestion | `671xxxxx` |
| Charges except. en capital | `675xxxxx` |
| Dot. except. | `687xxxxx` |
| **ÉLÉMENTS FINAUX** | |
| Participation salariés | `69xxxxx` (participation) |
| Impôts sur les sociétés | `695xxxxx`, `696xxxxx` |

---

## 🔍 ÉTAPE 3 — MISSION D'ANALYSE

Une fois les soldes agrégés et les postes reconstitués, réalise une **analyse financière complète, structurée et professionnelle**. Ton analyse doit être **accessible à un dirigeant non-comptable** tout en restant **rigoureuse et chiffrée**. Pour chaque indicateur, fournis la valeur brute, l'évolution N vs N-1 en valeur absolue et en pourcentage, puis une interprétation claire.

> Si les données N-1 ne sont pas disponibles dans le FEC, signale-le et adapte l'analyse en conséquence (analyse sur exercice N uniquement, sans comparaison).

---

## 📋 PLAN D'ANALYSE

### 1. 📌 SYNTHÈSE EXÉCUTIVE (5 à 10 lignes)
- Présentation rapide de l'entreprise (secteur présumé, taille, structure juridique détectée)
- Verdict global sur la santé financière : saine / fragile / en difficulté
- Les 3 points forts majeurs
- Les 3 points de vigilance ou risques principaux
- Recommandations prioritaires

---

### 2. 💰 ANALYSE DU COMPTE DE RÉSULTAT

#### 2.1 Chiffre d'affaires (CA)
- Montant N et N-1, évolution absolue et relative
- Interprétation : croissance organique ? Tassement ? Rupture ?
- Mise en perspective sectorielle si possible

#### 2.2 Résultat d'exploitation (REX)
- Montant et évolution
- Taux de marge d'exploitation = REX / CA × 100
- Interprétation : l'activité est-elle rentable en elle-même ?

#### 2.3 Excédent Brut d'Exploitation (EBE / EBITDA)
- Calcul : Résultat d'exploitation + Dotations aux amortissements et provisions
- EBE N et N-1, évolution
- Taux d'EBE = EBE / CA × 100
- Interprétation : capacité à générer du cash avant investissements et fiscalité

#### 2.4 Résultat net
- Montant N et N-1, évolution
- Taux de marge nette = Résultat net / CA × 100
- Analyse de l'écart entre résultat d'exploitation et résultat net

#### 2.5 Charges et structure des coûts
- Répartition des principales charges (achats, personnel, externes, financières)
- Evolution des postes significatifs
- Identification de toute dérive ou poste anormal

---

### 3. 🏛️ ANALYSE DU BILAN

#### 3.1 Capital social
- Montant et nature (fixe ou variable)
- Evolution entre N et N-1
- Interprétation

#### 3.2 Capitaux propres
- Montant N et N-1, évolution
- Ratio capitaux propres / total bilan × 100 (autonomie financière)
- Alerte si capitaux propres < 0 ou < la moitié du capital social

#### 3.3 Endettement financier
- Dettes financières LT + CT
- Taux d'endettement = Dettes financières / Capitaux propres × 100
- Capacité de remboursement = Dettes financières / EBE (norme : < 3 ans)

#### 3.4 Fonds de Roulement (FR)
- FR = Capitaux permanents − Actif immobilisé net
- Montant N et N-1, évolution
- FR / CA × 100

#### 3.5 Besoin en Fonds de Roulement (BFR)
- BFR = (Stocks + Créances clients) − Dettes fournisseurs
- Montant N et N-1, BFR en jours de CA

#### 3.6 Trésorerie nette
- Trésorerie nette = FR − BFR
- Montant N et N-1

---

### 4. 📦 ANALYSE CLIENTS & FOURNISSEURS

#### 4.1 Créances clients
- Montant brut N et N-1
- DRC = Créances clients / CA TTC × 365
- Evolution et risques identifiés

#### 4.2 Dettes fournisseurs
- Montant N et N-1
- DRF = Dettes fournisseurs / Achats TTC × 365
- Rapport DRC / DRF

---

### 5. ⚠️ ZONES À RISQUE & POINTS DE VIGILANCE

Classés par niveau de gravité :
- 🔴 Critique
- 🟠 Important
- 🟡 À surveiller

---

### 6. ✅ POINTS FORTS

---

### 7. 📊 TABLEAU DE BORD RÉCAPITULATIF

| Indicateur | N | N-1 | Évolution | Appréciation |
|---|---|---|---|---|
| Chiffre d'affaires | | | | |
| EBE | | | | |
| Taux d'EBE (%) | | | | |
| Résultat net | | | | |
| Taux de marge nette (%) | | | | |
| Capitaux propres | | | | |
| Autonomie financière (%) | | | | |
| Taux d'endettement (%) | | | | |
| Capacité de remboursement (années) | | | | |
| Fonds de roulement | | | | |
| FR / CA (%) | | | | |
| BFR (jours de CA) | | | | |
| Trésorerie nette | | | | |
| DRC (jours) | | | | |
| DRF (jours) | | | | |

Légende : 🟢 Satisfaisant | 🟡 À surveiller | 🔴 Préoccupant

---

### 8. 💡 RECOMMANDATIONS

5 recommandations concrètes et actionnables, classées par priorité, avec pour chacune :
- Le problème ou l'opportunité identifié
- L'action recommandée
- L'impact attendu

---

## 📐 CONTRAINTES DE FORME

- Langue : français professionnel
- Ton : expert mais accessible, pédagogique
- Chiffres : arrondis à l'euro ou au millier selon l'échelle, signe € et séparateurs de milliers
- Évolutions : toujours en valeur absolue **ET** en pourcentage
- Structure : respecte scrupuleusement le plan ci-dessus
- Longueur : analyse complète et détaillée, sans surcharge inutile

---

## ⚙️ NOTE TECHNIQUE — GESTION DES CAS PARTICULIERS

- **Comptes 8xxxxxx** (comptes d'engagement, hors bilan) : à exclure des calculs du bilan
- **TVA collectée et déductible** (comptes 445xxx) : inclus dans les dettes/créances fiscales, ne pas les confondre avec du CA ou des charges
- **Compte 456xxx (Capital appelé non versé)** : à déduire du capital social au passif ET à inscrire en créance à l'actif (traitement symétrique)
- **Comptes de provisions pour dépréciation** (49xxx, 39xxx, 29xxx) : toujours soustraire du poste brut correspondant pour obtenir le NET
- **Soldes mixtes** : certains comptes peuvent présenter un solde inverse à leur nature (ex. un fournisseur débiteur = avance versée) ; les reclasser à l'actif si débiteur, au passif si créditeur
- **Absence de compte** : si un compte de la table de mapping est absent du FEC, sa valeur est 0 (ne pas générer d'erreur)

---

*Commence par l'Étape 1 (calcul des soldes), puis l'Étape 2 (mapping), puis déroule l'analyse section par section à partir de l'Étape 3.*
