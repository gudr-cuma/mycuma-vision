# PRB — Financiel Vision

## Outil d'analyse financière à partir d'un fichier FEC

**Version :** 3.0 — Finale  
**Date :** 31 mars 2026  
**Auteur :** Guillaume (CAP Consulting)  
**Statut :** Validé — prêt pour estimation et développement  
**Référence produit existant :** https://rfroment85.github.io/FinancialVision/

---

## Table des matières

1. Résumé exécutif
2. Personas & parcours utilisateur
3. Cartographie des écrans et navigation
4. Spécifications IHM (par écran)
5. Charte graphique & Design System
6. Spécifications techniques
7. Découpage par équipe & tâches
8. Critères d'acceptation & tests
9. Plan de livraison & roadmap
10. Annexes

---

## 1. Résumé exécutif

### 1.1 Objectif du projet

Développer une application web mono-page (SPA) permettant à un utilisateur de déposer **un fichier FEC** (Fichier des Écritures Comptables, norme fiscale française — format CSV/TXT uniquement) et d'obtenir instantanément un tableau de bord financier complet comprenant :

- Les Soldes Intermédiaires de Gestion (SIG) selon le **Plan Comptable des coopératives agricoles (CUMA)**
- Des analyses mensuelles (graphiques barres, cumulés, tableaux)
- Une vue trésorerie (courbe de solde quotidien, top encaissements/décaissements)
- Une répartition des charges par nature (donut + détail)
- Un bilan simplifié (actif/passif) avec ratios bilanciels clés
- Un drill-down à 3 niveaux : ligne SIG → comptes contribuant → écritures du compte

**Traitement 100% client-side** — aucune donnée n'est envoyée sur un serveur. Le FEC est parsé et traité intégralement dans le navigateur de l'utilisateur.

### 1.2 Contexte utilisateur et valeur métier

Les dirigeants de coopératives agricoles (CUMA), leurs fédérations et experts-comptables ont besoin de transformer rapidement un export FEC brut (obligation fiscale) en analyses financières lisibles. Financiel Vision propose une solution zéro-installation, zéro-stockage, avec un résultat professionnel en quelques secondes.

### 1.3 Portée (in-scope / out-of-scope)

| In-scope (MVP) | Out-of-scope (v2+) |
|---|---|
| Upload d'**un seul** fichier FEC (.csv/.txt, séparateur pipe ou tab) | Upload de plusieurs fichiers (comparatif N-1) |
| Parsing et validation du format FEC 18 colonnes | Upload de fichiers Excel / PDF / XML FEC (XSD) |
| Calcul des SIG selon le **PCG coopératives agricoles (CUMA)** | Stockage en base de données |
| 5 onglets d'analyse : SIG, Analyses mensuelles, Trésorerie, Structure charges, Bilan simplifié | Authentification / comptes utilisateurs |
| Drill-down 3 niveaux (SIG → comptes → écritures) | Export PDF / Excel des analyses |
| Données de démonstration pré-chargées (FEC `381304559...20241231.csv` anonymisé) | Comparatif N vs N-1 |
| **Mode clair** (thème unique) | Mode sombre |
| Aucune limite de taille de fichier (support de dizaines de milliers de lignes) | Multi-devises |
| Support des **exercices décalés** (non calés sur l'année civile) | Intégration API comptable |
| Affichage du **nom du fichier FEC** (pas de nom d'entreprise) | Lookup SIREN via API INSEE |

> **Changement majeur vs. le produit de référence :** le produit existant supporte 2 fichiers (N/N-1). Notre version MVP ne gère qu'un seul fichier. En conséquence, **toutes les colonnes et KPIs comparatifs N-1 sont supprimés ou remplacés par des données exercice unique**. La comparaison N-1 est réservée à une version ultérieure.

---

## 2. Personas & parcours utilisateur

### 2.1 Personas

| Persona | Description | Objectif principal | Fréquence |
|---|---|---|---|
| **Pierre, Président de CUMA** | 55 ans, agriculteur, préside une CUMA de 40 adhérents. Reçoit le FEC de son comptable. Veut comprendre la santé financière de la coopérative. | Voir les KPIs clés (CA, EBE, résultat net, trésorerie) de façon visuelle | Trimestriel |
| **Sophie, Comptable de fédération** | 38 ans, gère la comptabilité de 15 CUMA dans sa fédération. Doit produire rapidement des analyses pour les AG. | Drill-down rapide, identifier les dérives de charges, analyse de trésorerie | Mensuel |
| **Marc, Expert-comptable** | 48 ans, cabinet rural. Accompagne des CUMA et a besoin d'un outil visuel pour ses rendez-vous clients. | Présentation claire des SIG et du bilan lors des rendez-vous | Hebdomadaire |

### 2.2 User Stories

| ID | User Story | Priorité |
|---|---|---|
| US-01 | En tant qu'utilisateur, je veux déposer **un** fichier FEC sur la page d'accueil, afin d'obtenir une analyse financière automatique. | MVP |
| US-01b | En tant qu'utilisateur, si je dépose plus d'un fichier, je veux voir un message d'erreur clair m'indiquant que seul un fichier est accepté. | MVP |
| US-02 | En tant qu'utilisateur, je veux voir les KPIs clés (CA, EBE, Résultat Net, Trésorerie) en haut de page, afin d'avoir une vue synthétique immédiate. | MVP |
| US-03 | En tant qu'utilisateur, je veux consulter le tableau des SIG avec montants et % CA, afin de comprendre la formation du résultat. | MVP |
| US-04 | En tant qu'utilisateur, je veux cliquer sur une ligne du SIG pour voir les comptes contribuant (panel latéral droit), afin de comprendre la composition d'un poste. | MVP |
| US-05 | En tant qu'utilisateur, je veux cliquer sur un compte dans le panel de détail pour voir les écritures individuelles (date, libellé, débit, crédit, solde), afin de remonter à la pièce comptable. | MVP |
| US-06 | En tant qu'utilisateur, je veux voir les analyses mensuelles sous forme de graphiques (barres mensuelles, courbe cumulée) et de tableau de données, afin de suivre l'évolution mois par mois. | MVP |
| US-07 | En tant qu'utilisateur, je veux visualiser la courbe de trésorerie quotidienne avec les tops encaissements et décaissements, afin de piloter le BFR de la CUMA. | MVP |
| US-08 | En tant qu'utilisateur, je veux voir la répartition des charges par nature (donut + liste détaillée), afin d'identifier les postes de coûts principaux. | MVP |
| US-09 | En tant qu'utilisateur, je veux consulter un bilan simplifié (actif/passif) avec ratios bilanciels, afin de juger la solidité financière de la coopérative. | MVP |
| US-10 | En tant qu'utilisateur, je veux charger des données de démonstration (FEC anonymisé) en un clic, afin de découvrir l'outil sans avoir de FEC sous la main. | MVP |
| US-11 | En tant qu'utilisateur, je veux filtrer les écritures dans le panel de détail, afin de retrouver rapidement une pièce spécifique. | MVP |
| US-12 | En tant qu'utilisateur, je veux basculer la période de trésorerie entre Année, T1, T2, S1, S2, afin de zoomer sur une période. | v1 |

---

## 3. Cartographie des écrans et navigation

### 3.1 Liste des écrans identifiés

| Réf. écran | Nom | Page PDF de réf. | Description |
|---|---|---|---|
| **E-01** | Page d'accueil / Upload | Page 1 (haut) | Zone de dépôt FEC (drag & drop), bouton démo |
| **E-02** | Dashboard — SIG | Pages 1-2 | KPIs + tableau SIG (exercice unique, sans N-1) |
| **E-03** | Panel détail SIG | Pages 2-3 | Panel latéral droit : comptes contribuant → écritures |
| **E-04** | Analyses mensuelles — Mensuel | Page 4 (haut) | Graphiques barres mensuels (exercice unique) |
| **E-05** | Analyses mensuelles — Cumulé | Page 4 (bas) | Courbe cumulée CA et EBE (exercice unique) |
| **E-06** | Analyses mensuelles — Tableau | Page 5 (haut) | Tableau mensuel de données |
| **E-07** | Trésorerie | Pages 5-6 | KPIs trésorerie + courbe quotidienne + top 10 |
| **E-08** | Structure des charges | Pages 6-7-8 | Donut répartition + détail par nature + graphique mensuel |
| **E-09** | Bilan simplifié | Pages 8-9 | Barre actif/passif + détail + ratios |
| **E-10** | Panel détail bilan | Page 10 | Même pattern que E-03 |

### 3.2 Diagramme de navigation

```
E-01 (Upload)
  │
  ├── [Déposer 1 FEC] ou [Charger démo]
  │
  ▼
E-02 (Dashboard SIG) ──── onglets ────┬── E-04/E-05/E-06 (Analyses mensuelles)
  │                                    ├── E-07 (Trésorerie)
  │                                    ├── E-08 (Structure charges)
  │                                    └── E-09 (Bilan simplifié)
  │
  ├── [Clic ligne SIG] ──► E-03 (Panel détail, slide-in droit)
  │     └── [Clic compte] ──► E-03 (écritures du compte, même panel)
  │
  ├── [Clic catégorie charges] ──► E-08 détail (graphique mensuel)
  │     └── [Clic élément détail] ──► Panel tableau mensuel
  │
  └── [Clic poste bilan] ──► E-10 (Panel détail bilan)
        └── [Clic compte] ──► E-10 (écritures, même pattern)
```

### 3.3 Navigation globale

- **Header fixe** : logo "Financiel Vision" (gauche), **nom du fichier FEC** + exercice (droite), bouton "Recharger démo" (si mode démo)
- **Barre KPIs** : 4 cards (CA, EBE, Résultat Net, Trésorerie) avec mini sparklines — **sans variation N-1** (exercice unique)
- **Barre d'onglets** : Soldes Intermédiaires de Gestion | Analyses mensuelles | 📊 Trésorerie | Structure charges | Bilan simplifié
- **Sous-onglets** (Analyses mensuelles) : Mensuel | Cumulé | Tableau
- **Panel détail** : slide-in par la droite, fermable par ×, multi-niveaux

---

## 4. Spécifications IHM (par écran)

### 4.1 E-01 — Page d'accueil / Upload

**Réf. screenshots :** Page 1 (haut)

**Description fonctionnelle :**  
Écran d'atterrissage. Zone de drag & drop pour **un seul** fichier FEC, et bouton d'accès aux données de démonstration.

**Composants UI :**

| Composant | Type | États | Détail |
|---|---|---|---|
| Titre | `<h1>` | — | "Analyse financière FEC" |
| Sous-titre | `<p>` | — | "Déposez votre fichier FEC pour obtenir vos SIG, analyses mensuelles et drill-down jusqu'aux écritures." |
| Zone de dépôt | Dropzone | idle, hover/dragover, loading, error | Icône dossier, texte "Déposez votre fichier FEC ici", sous-texte "Glissez-déposez **un fichier** ou cliquez pour sélectionner" |
| Formats acceptés | Label | — | "Formats : .csv ou .txt — Séparateur : tabulation ou pipe (\|)" |
| Note RGPD | Label | — | "🔒 Vos données restent dans votre navigateur et ne sont jamais envoyées sur nos serveurs." |
| Bouton démo | `<button>` | normal, hover, loading | "⚡ Charger les données de démonstration" — style CTA accent (`#FF8200`) |

**Validations :**

| Règle | Message d'erreur |
|---|---|
| Plus d'un fichier déposé | "Un seul fichier FEC est accepté. Veuillez déposer un unique fichier." |
| Extension .csv ou .txt uniquement | "Format non supporté. Veuillez déposer un fichier .csv ou .txt." |
| Fichier vide | "Le fichier est vide." |
| Header FEC invalide (18 colonnes absentes) | "Le fichier ne semble pas être un FEC valide. Vérifiez que la première ligne contient les 18 colonnes réglementaires (JournalCode, JournalLib, …)." |
| Encodage non reconnu | "Encodage non reconnu. Le FEC doit être en ASCII, ISO 8859-15, Windows-1252 ou UTF-8." |

**Comportement :**  
- Le parsing démarre immédiatement après le drop.
- Barre de progression visible si fichier volumineux (> 1 Mo / > 10 000 lignes).
- Transition vers E-02 après parsing réussi.
- Le FEC est parsé dans un **Web Worker** pour ne pas bloquer l'UI.

### 4.2 E-02 — Dashboard SIG

**Réf. screenshots :** Pages 1 (bas) et 2 (haut)

**Description fonctionnelle :**  
Vue principale après chargement. Affiche le nom du fichier, les 4 KPIs synthétiques, la barre d'onglets, et le tableau des SIG.

> **Adaptation exercice unique :** les colonnes N-1 et Évolution du produit de référence sont supprimées. Le tableau SIG affiche uniquement les données de l'exercice chargé.

#### 4.2.1 Header

| Composant | Détail |
|---|---|
| Logo | "Financiel Vision" — police sans-serif, couleur `#31B700` |
| Nom fichier | Nom complet du fichier FEC déposé, ex. "381304559DONNEESCOMPTABLES20241231.csv" |
| Exercice | Période déduite, ex. "Exercice 2024" (année civile) ou "Exercice avril 2024 — mars 2025" (exercice décalé) |
| Bouton "Recharger démo" | Visible **uniquement** en mode démo. Réinitialise avec les données anonymisées. |

#### 4.2.2 Barre KPIs (4 cards)

Chaque card affiche :

| Élément | Description |
|---|---|
| Label | ex. "CHIFFRE D'AFFAIRES" |
| Icône | Petite icône thématique (barres, flèche, etc.) |
| Montant | ex. "482 k€" — formaté en k€ si ≥ 1 000 €, sinon en € |
| Sparkline | Mini graphique barres ou courbe (12 points = 12 mois) |
| Sous-info | ex. pour EBE : "33,0% du CA" (ratio) |

Les 4 KPIs :

1. **Chiffre d'affaires** — Somme des comptes 706* à 708* (produits CUMA : travaux, prestations)
2. **EBE** — Excédent Brut d'Exploitation (cascade SIG)
3. **Résultat Net** — Dernière ligne du SIG
4. **Trésorerie** — Solde des comptes 51x au dernier jour de l'exercice

> **Pas de variation N-1** dans cette version (exercice unique).

#### 4.2.3 Barre d'onglets

5 onglets sous forme de tabs. L'onglet actif est souligné en `#FF8200` (accent).

1. Soldes Intermédiaires de Gestion (actif par défaut)
2. Analyses mensuelles
3. 📊 Trésorerie
4. Structure charges
5. Bilan simplifié

#### 4.2.4 Tableau des SIG (exercice unique)

**Colonnes :**

| Colonne | Largeur estimée | Description |
|---|---|---|
| Libellé | ~55% | Nom du poste SIG, avec indentation pour les sous-lignes (préfixe + ou −) |
| Montant | ~20% | Montant exercice, formaté avec séparateur milliers |
| % CA | ~15% | Pourcentage du chiffre d'affaires |
| Chevron | ~10% | `>` indiquant le drill-down possible |

**Lignes du SIG — mapping PCG Coopératives Agricoles (CUMA) :**

```
Chiffre d'affaires
  + Prod. stockée / déstockage
  + Subventions d'exploitation
  − Achats consommés nets
= Marge brute
  − Services extérieurs
= Valeur Ajoutée
  − Charges de personnel
  − Impôts & taxes (exploit.)
= EBE (Excédent Brut d'Exploitation)
  − Dotations amortissements
  + Reprises
  + Autres produits gestion
  − Autres charges gestion
= Résultat d'Exploitation
  + Produits financiers
  − Charges financières
= Résultat financier
= Résultat courant avant IS
  + Produits exceptionnels
  − Charges exceptionnelles
= Résultat exceptionnel
  − IS & participation
= RÉSULTAT NET
```

**Interactions :**

- **Hover ligne** : fond légèrement surligné en `#B1DCE2` (couleur principale pastel)
- **Clic ligne** : ouvre le panel détail E-03 à droite
- Les lignes de total (Marge brute, VA, EBE, Rex, etc.) sont en **gras**, fond légèrement distinct
- Les sous-lignes sont préfixées par `+` ou `−` et indentées de 24px
- Le résultat net est sur fond accent léger
- Indicateur en bas : "💡 Cliquer sur une ligne pour afficher le détail des comptes et écritures"

### 4.3 E-03 — Panel détail SIG

**Réf. screenshots :** Pages 2 (milieu, bas) et 3

**Description fonctionnelle :**  
Panel glissant depuis la droite (~450px de large), overlay semi-transparent sur le contenu principal. Deux niveaux de drill-down.

#### Niveau 1 : Comptes contribuant

| Composant | Détail |
|---|---|
| Titre | "Détail → − Achats consommés nets" |
| Montant total | ex. "18 750 €" en gros, couleur `#FF8200` |
| Bouton fermer | × en haut à droite |
| Section | "COMPTES CONTRIBUANT (N)" — N = nombre de comptes |
| Liste comptes | Card par compte : code (badge monospace ex. `606010`), libellé ("Achats non stockés"), nb écritures ("12 éc."), montant ("19 k€"), chevron `▼` pour déplier |

#### Niveau 2 : Écritures d'un compte

Visible après clic sur un compte. S'affiche sous la card du compte ou remplace le contenu du panel.

| Composant | Détail |
|---|---|
| Titre section | "Écritures — 606010" + nombre de lignes |
| Filtre | Input texte "Filtrer..." en haut à droite |
| Tableau écritures | 5 colonnes : Date, Libellé (gras), Débit, Crédit, Solde (cumulé running) |

**Règle du solde running :** cumul séquentiel par date du (débit − crédit) pour les comptes de charge (classe 6), ou (crédit − débit) pour les comptes de produit (classe 7). Affiché en k€ avec signe, rouge si négatif.

**Filtre :** recherche dans les colonnes Libellé (EcritureLib) et Référence pièce (PieceRef). Insensible à la casse et aux accents.

### 4.4 E-04 — Analyses mensuelles (Mensuel)

**Réf. screenshots :** Page 4 (haut)

**Description fonctionnelle :**  
6 graphiques en grille 2×3. **Exercice unique** — pas de barres groupées N/N-1, mais des barres simples par mois avec courbe de tendance optionnelle.

| Position | Titre | Type | Données |
|---|---|---|---|
| Haut-gauche | CA mensuel | Barres | CA par mois (12 barres) |
| Haut-droite | EBE mensuel | Courbe + aire | EBE par mois |
| Milieu-gauche | Résultat d'exploitation mensuel | Barres (vert si > 0, rouge si < 0) | REX mensuel |
| Milieu-droite | % EBE/CA mensuel | Courbe | Ratio EBE/CA par mois |
| Bas-gauche | CA / Masse salariale | Barres | Ratio mensuel |
| Bas-droite | Taux de marge brute | Barres | MB/CA mensuel |

**Couleurs graphiques :** barres en `#31B700` (vert principal), courbes en `#FF8200` (accent), barres négatives en rouge (`#E53935`).

**Sous-onglets :** `[Mensuel]` `[Cumulé]` `[Tableau]`

### 4.5 E-05 — Analyses mensuelles (Cumulé)

**Réf. screenshots :** Page 4 (bas)

**Description fonctionnelle :**  
Graphique en courbes montrant la trajectoire cumulée sur l'exercice. **Exercice unique** — 2 séries seulement (pas de N-1).

| Série | Couleur | Style |
|---|---|---|
| CA cumulé | `#31B700` | Ligne pleine |
| EBE cumulé | `#FF8200` | Ligne pleine |

Légende en bas du graphique. Axe X : mois de l'exercice (dans l'ordre chronologique, adapté aux exercices décalés). Axe Y : montant cumulé en k€.

### 4.6 E-06 — Analyses mensuelles (Tableau)

**Réf. screenshots :** Page 5 (haut)

**Description fonctionnelle :**  
Tableau mensuel détaillé. 12 lignes (mois de l'exercice, dans l'ordre) + 1 ligne TOTAL en gras. Si l'exercice est décalé (ex. avril → mars), les mois s'affichent dans l'ordre de l'exercice (Avril, Mai, …, Mars).

**Colonnes :**

| Colonne | Description |
|---|---|
| Mois | Les 12 mois de l'exercice, dans l'ordre chronologique de l'exercice (pas nécessairement Janvier à Décembre) |
| CA | Chiffre d'affaires mensuel |
| Marge brute | Montant |
| % Marge | Marge brute / CA × 100 |
| EBE | Montant |
| % EBE/CA | Ratio |
| REX | Résultat d'exploitation |
| % REX/CA | Ratio |
| Rés. Net | Résultat net mensuel |

> **Adaptation exercice unique :** pas de colonne "VA N-1" ni "Évol.". Les colonnes sont toutes relatives à l'exercice chargé.

### 4.7 E-07 — Trésorerie

**Réf. screenshots :** Pages 5 (bas) et 6

#### 4.7.1 Barre KPIs Trésorerie (6 cards)

| KPI | Description | Couleur card |
|---|---|---|
| Solde de trésorerie | Solde des comptes 51x au dernier jour | `#B1DCE2` fond |
| Total encaissé | Σ crédits sur comptes 51x | Vert `#31B700` |
| Total minimum | Solde minimum atteint | Neutre |
| Solde maximum | Solde maximum atteint | Neutre |
| Total encaissements | Σ entrées globales | Vert |
| Total décaissements | Σ sorties globales | Orange `#FF8200` |

#### 4.7.2 Graphique courbe de trésorerie

- **Type** : courbe linéaire avec aire sous la courbe
- **Axe X** : jours de l'exercice (du 1er au dernier jour, adapté aux exercices décalés)
- **Axe Y** : solde en k€
- **Séries** : Solde quotidien (couleur `#31B700`), Moyenne mobile (pointillé gris)
- **Info-bulle** au survol : date + solde + entrées/sorties du jour + détail dernière écriture
- **Filtre période** : toggle `[Année]` `[T1]` `[T2]` `[S1]` `[S2]`
- Sous-info en haut : "124 jours · amplitude XX k€ — XXX k€"

#### 4.7.3 Top 10 Encaissements / Décaissements

2 colonnes côte à côte :

| Colonne gauche | Colonne droite |
|---|---|
| "↑ TOP 10 ENCAISSEMENTS" (vert `#31B700`) | "↓ TOP 10 DÉCAISSEMENTS" (orange `#FF8200`) |
| 10 items : date (JJ/MM/AAAA), libellé (source : EcritureLib, 2 lignes max), montant en k€ | Idem |

Données triées par montant absolu décroissant sur les comptes de trésorerie (51x). L'écriture de contrepartie est affichée.

### 4.8 E-08 — Structure des charges

**Réf. screenshots :** Pages 6 (bas), 7, 8 (haut)

#### 4.8.1 Layout principal (2 colonnes)

| Gauche (~50%) | Droite (~50%) |
|---|---|
| **Donut chart** — "Répartition des charges — Survoler pour le montant · Cliquer pour l'analyse" | **Liste "Détail par nature"** — Chaque ligne : pastille couleur, libellé catégorie, % du total, montant, barre de proportion |

**Catégories de charges (PCG CUMA) :**

| Catégorie | Comptes PCG | Couleur attribuée |
|---|---|---|
| Personnel | 64* + 621* | `#FF8200` (orange accent) |
| Services ext. | 61* + 62* (hors 621*) | `#31B700` (vert principal) |
| Dotations | 68* | `#00965E` (vert secondaire) |
| Achats | 60* (hors variation stocks 603*) | `#93C90E` (vert citron) |
| Financières | 66* | `#B1DCE2` (bleu pastel) |
| Impôts & taxes | 63* | `#E53935` (rouge, hors charte — signalétique) |

> **[HYPOTHÈSE]** Les comptes 65* (Autres charges de gestion courante) pourraient former une 7e catégorie si leur montant est significatif. À valider.

#### 4.8.2 Détail par catégorie (après clic)

- Le clic sur un segment du donut ou sur une ligne du détail affiche :
  1. **Mise en surbrillance** du segment dans le donut
  2. **Graphique barres mensuel** sous le donut : barres mensuelles (12 mois) de la catégorie sélectionnée
  3. Sous-onglets du graphique : `[Mensuel]` `[Cumulé]`
- Depuis le widget de droite, un clic sur la barre de proportion d'une catégorie ouvre un **tableau mensuel** (panel/modal) :
  - Colonnes : Mois, Montant N, % du total
  - Bouton × pour fermer

### 4.9 E-09 — Bilan simplifié

**Réf. screenshots :** Pages 8 (bas) et 9

#### 4.9.1 Vue synthétique (haut)

| Composant | Détail |
|---|---|
| Indicateur d'équilibre | "✅ Bilan équilibré" si Total Actif = Total Passif. **"⚠️ Attention : écart de X € entre l'actif et le passif"** si écart (bandeau orange, non bloquant). |
| Totaux | "TOTAL ACTIF : 365 k€" / "TOTAL PASSIF : 365 k€" |
| Barre horizontale Actif | 2 segments : Immobilisé (%) + Circulant (%) |
| Barre horizontale Passif | 2 segments : Capitaux propres (%) + Dettes (%) |
| Labels | "ACTIF — CE QUE L'ENTREPRISE POSSÈDE" / "PASSIF — COMMENT C'EST FINANCÉ" |

**Couleurs barres :**
- Actif immobilisé : `#00965E` / Actif circulant : `#31B700`
- Capitaux propres : `#FF8200` / Dettes : `#E53935`

#### 4.9.2 Détail Actif (gauche) et Passif (droite)

**Actif :**

| Section | Sous-postes |
|---|---|
| **Actif immobilisé** (card avec badge montant) | Immob. incorporelles & financières, Immob. corporelles brutes, Immob. financières (autres) → Sous-total Immobilisé |
| **Actif circulant** (card avec badge montant) | Stocks & en-cours, **Créances adhérents nettes** (compte 453*), Créances d'exploitation, Créances fiscales & État, Autres créances & comptes courants, Régularisations actif, **Disponibilités & VMP** → Sous-total Circulant |

> **Spécificité CUMA :** les comptes 453* (Adhérents travaux & cessions) remplacent les "Créances clients" (411*) classiques dans le bilan. Voir mapping §6.4.

**Passif :**

| Section | Sous-postes |
|---|---|
| **Capitaux propres** (card) | **Capital social (parts sociales)** (101* à 104*), Primes & réserves légales, Autres réserves & report, Résultat de l'exercice, Subventions d'investissement → Sous-total Capitaux propres |
| **Dettes** (card) | Emprunts & dettes financières (16*), **Dettes adhérents** (si solde créditeur 453*), Dettes sociales, Dettes fiscales, Autres dettes, Régularisations passif → Sous-total Dettes |

Chaque ligne affiche : montant, chevron `>` (drill-down).

> **Adaptation exercice unique :** pas de colonne N-1, pas d'évolution %.

#### 4.9.3 Ratios bilanciels clés

4 cards en bas de page :

| Ratio | Formule | Description |
|---|---|---|
| **Fonds de Roulement** | (Capitaux propres + Dettes MLT) − Actif immobilisé | Marge de sécurité financière |
| **Besoin en FR (BFR)** | (Stocks + Créances) − Dettes CT (hors trésorerie) | Besoin de financement du cycle d'exploitation |
| **Autonomie financière** | Capitaux propres / Total passif × 100 | Indépendance vis-à-vis des créanciers |
| **Liquidité générale** | Actif circulant / Dettes CT | Capacité à honorer les dettes à court terme |

Chaque card affiche : nom du ratio, valeur calculée (en k€ ou %), formule en petit texte, et un indicateur visuel (vert si sain, orange si attention, rouge si critique).

> **[HYPOTHÈSE]** Seuils indicatifs : Autonomie > 50% = vert, 30-50% = orange, < 30% = rouge. Liquidité > 1.5 = vert, 1-1.5 = orange, < 1 = rouge. À valider pour le contexte CUMA.

### 4.10 E-10 — Panel détail Bilan

**Réf. screenshots :** Page 10

Même pattern que E-03 : panel latéral droit avec drill-down en 2 niveaux (comptes contribuant → écritures). Structure et comportement identiques.

---

## 5. Charte graphique & Design System

### 5.1 Mode clair — Palette de couleurs

**Couleurs principales :**

| Nom | Hex | Usage |
|---|---|---|
| Bleu pastel | `#B1DCE2` | Fonds de cards KPI, hover, sélections légères |
| Vert principal | `#31B700` | Valeurs positives, barres graphiques, CTA secondaires |
| Orange accent | `#FF8200` | CTA principal, montants en drill-down, accent visuel |

**Couleurs secondaires :**

| Nom | Hex | Usage |
|---|---|---|
| Vert citron | `#93C90E` | Graphiques (série alternative), badges |
| Vert forêt | `#00965E` | Graphiques (3e série), icônes |

**Couleurs dérivées (pastels) :**

| Nom | Hex | Usage |
|---|---|---|
| Bleu très clair | `#E3F2F5` | Fond de page, fond des sections |
| Vert très clair | `#E8F5E0` | Fond des lignes de total SIG, alertes positives |
| Orange très clair | `#FFF3E0` | Fond des alertes, fond du bouton démo |
| Vert citron clair | `#F0F7D4` | Fond alternatif de lignes |

**Couleurs neutres :**

| Nom | Hex | Usage |
|---|---|---|
| Fond principal | `#FFFFFF` | Background page |
| Fond secondaire | `#F8FAFB` | Fond des cards, panels |
| Bordure | `#E2E8F0` | Séparation des éléments |
| Texte principal | `#1A202C` | Corps de texte |
| Texte secondaire | `#718096` | Labels, sous-titres |
| Rouge erreur | `#E53935` | Montants négatifs, erreurs, barres négatives |

### 5.2 Typographie

| Élément | Police | Taille | Poids | Couleur |
|---|---|---|---|---|
| Titre page (H1) | Inter / system-ui | 28px | 700 (Bold) | `#1A202C` |
| Titre section (H2) | Inter | 20px | 600 (SemiBold) | `#1A202C` |
| Titre card (H3) | Inter | 14px | 600 | `#718096` (uppercase, lettre-spacing 0.5px) |
| Montant KPI | Inter | 36px | 700 | `#1A202C` |
| Montant tableau | Inter | 14px | 500 | `#1A202C` (rouge `#E53935` si négatif) |
| Libellé SIG (total) | Inter | 14px | 700 | `#1A202C` |
| Libellé SIG (sous-ligne) | Inter | 14px | 400 | `#4A5568` |
| Code compte (badge) | JetBrains Mono / monospace | 13px | 500 | `#FF8200` fond `#FFF3E0` |
| Texte courant | Inter | 14px | 400 | `#4A5568` |
| Petit texte | Inter | 12px | 400 | `#718096` |

### 5.3 Espacements & Layout

| Élément | Valeur |
|---|---|
| Padding page | 24px latéral, 16px vertical |
| Gap entre cards KPI | 16px |
| Padding card | 20px |
| Border-radius cards | 12px |
| Shadow cards | `0 1px 3px rgba(0,0,0,0.08)` |
| Largeur max contenu | 1280px (centré) |
| Largeur panel détail | 480px |
| Overlay panel | `rgba(0,0,0,0.15)` |
| Transition panel | `transform 300ms ease-in-out` |

### 5.4 Composants UI — Spécifications de style

**Bouton CTA principal (ex. "Charger démo") :**
- Fond : `#FF8200`, texte blanc, border-radius 8px, padding 12px 24px
- Hover : `#E57300` (plus foncé), shadow augmentée
- Focus : outline `#31B700` 2px offset 2px

**Onglet actif :**
- Texte `#1A202C` bold, bordure basse 3px `#FF8200`

**Onglet inactif :**
- Texte `#718096`, sans bordure basse, hover: texte `#4A5568`

**Ligne tableau hover :**
- Fond `#E3F2F5` (bleu très clair)

**Badge code compte :**
- Fond `#FFF3E0`, texte `#FF8200`, border-radius 4px, padding 2px 8px, font monospace

**Donut chart :**
- Trou central 60%, segments avec les couleurs des catégories (§4.8.1)
- Survol : segment agrandi de 5px, tooltip avec montant et %

**Info-bulle graphique :**
- Fond blanc, shadow `0 2px 8px rgba(0,0,0,0.12)`, border-radius 8px, padding 12px
- Titre en gras, sous-détail en `#718096`

### 5.5 Responsive

| Breakpoint | Comportement |
|---|---|
| **Desktop ≥ 1280px** | Layout complet optimisé |
| **Tablette 768-1279px** | KPIs en 2×2 au lieu de 4×1, graphiques en 1 colonne, panel détail pleine largeur |
| **Mobile < 768px** | Lecture seule, KPIs empilés, onglets scrollables horizontalement, panel détail pleine page |

### 5.6 Accessibilité (WCAG 2.1 AA)

| Exigence | Détail |
|---|---|
| Contraste | Ratio minimum 4.5:1 texte normal, 3:1 texte large. Vérifier les combinaisons : `#31B700` sur blanc = 3.8:1 ⚠️ → utiliser `#268E00` pour le texte sur fond blanc |
| Navigation clavier | Tab entre éléments interactifs. Enter pour drill-down. Escape pour fermer panel. Flèches dans les onglets. |
| Lecteur d'écran | `aria-label` sur KPIs, `role="table"` sur tableaux, `aria-expanded` sur drill-down, `aria-selected` sur onglets |
| Graphiques | Texte `alt` décrivant la tendance. Données toujours accessibles via le tableau (onglet Tableau) |
| Mouvements | `prefers-reduced-motion` pour désactiver les animations |
| Focus visible | Outline `#31B700` 2px sur tous les éléments focusables |

> **⚠️ Point d'attention contraste :** le vert `#31B700` a un ratio de 3.8:1 sur fond blanc, insuffisant pour du texte normal (4.5:1 requis). Pour tout texte vert sur fond blanc, utiliser `#268E00` (ratio 5.0:1). Le vert `#31B700` reste utilisable pour les éléments graphiques (barres, icônes) et le texte large (≥ 18px bold).

---

## 6. Spécifications techniques

### 6.1 Architecture

```
┌─────────────────────────────────────────────┐
│  NAVIGATEUR (Client-side uniquement)        │
│                                             │
│  ┌──────────┐    ┌──────────────────────┐   │
│  │  Upload   │───►│  Parser FEC         │   │
│  │  (drag&   │    │  (Web Worker)       │   │
│  │   drop)   │    │  validation +       │   │
│  │  1 fichier│    │  normalisation      │   │
│  └──────────┘    └─────────┬────────────┘   │
│                            │                │
│                  ┌─────────▼────────────┐   │
│                  │  Moteur de calcul    │   │
│                  │  SIG CUMA, tréso,    │   │
│                  │  bilan, ratios       │   │
│                  └─────────┬────────────┘   │
│                            │                │
│                  ┌─────────▼────────────┐   │
│                  │  Store / State       │   │
│                  │  (Zustand)           │   │
│                  └─────────┬────────────┘   │
│                            │                │
│                  ┌─────────▼────────────┐   │
│                  │  Composants UI       │   │
│                  │  (React 18+)         │   │
│                  └──────────────────────┘   │
│                                             │
│  Hébergement : interne (build statique)     │
└─────────────────────────────────────────────┘
```

**Stack technique suggérée :**

| Couche | Technologie | Justification |
|---|---|---|
| Framework UI | **React 18+** | Validé — écosystème mature, Recharts natif |
| State management | Zustand | Léger, adapté au traitement local |
| Graphiques | Recharts | Natif React, barres, courbes, donut |
| Parsing CSV | PapaParse | Robuste, supporte les encodages, streaming, Web Worker natif |
| Formatage | `Intl.NumberFormat` | Natif, locale `fr-FR` |
| Style | Tailwind CSS | Cohérent, rapide à itérer |
| Build | Vite | Rapide, ESM natif |
| Déploiement | Hébergement interne | Build statique, déploiement sur infrastructure interne |

### 6.2 Modèle de données (en mémoire)

#### 6.2.1 Structure brute (après parsing)

```typescript
interface FECEntry {
  journalCode: string;       // "VE", "AC", "BA", etc.
  journalLib: string;        // "Ventes", "Achats", etc.
  ecritureNum: string;       // Numéro séquentiel
  ecritureDate: Date;        // YYYYMMDD → Date
  compteNum: string;         // "70612040", "60211030", etc.
  compteLib: string;         // Libellé du compte
  compAuxNum: string | null; // Compte auxiliaire (adhérents CUMA)
  compAuxLib: string | null; // Libellé auxiliaire
  pieceRef: string;          // Référence pièce justificative
  pieceDate: Date;           // Date pièce
  ecritureLib: string;       // Libellé écriture
  debit: number;             // Montant débit (0 si vide)
  credit: number;            // Montant crédit (0 si vide)
  ecritureLet: string | null;
  dateLet: Date | null;
  validDate: Date;
  montantDevise: number | null;
  idevise: string | null;
}

interface ParsedFEC {
  siren: string;             // Extrait du nom de fichier
  exerciceEnd: Date;         // Date clôture (du nom de fichier)
  exerciceStart: Date;       // Date début exercice (détectée)
  exerciceMonths: number[];  // Mois dans l'ordre de l'exercice, ex. [4,5,6,7,8,9,10,11,12,1,2,3] pour avril-mars
  isOffsetExercice: boolean; // true si exercice décalé (ne commence pas en janvier)
  entries: FECEntry[];       // Toutes les écritures
  fileName: string;          // Nom original du fichier
  stats: {
    totalLines: number;
    skippedLines: number;     // Lignes ignorées (parsing error)
    encoding: string;         // ISO-8859-15, UTF-8, etc.
    separator: '|' | '\t';
  };
}
```

#### 6.2.2 Structures calculées

```typescript
interface SIGLine {
  id: string;                // ex. "chiffre_affaires", "marge_brute"
  label: string;
  prefix: '+' | '-' | '=' | null;
  isTotal: boolean;
  amount: number;            // Montant exercice
  percentCa: number;         // % du CA
  accountRanges: string[];   // ex. ["706*","707*","708*"]
}

interface AccountDetail {
  compteNum: string;
  compteLib: string;
  nbEcritures: number;
  totalDebit: number;
  totalCredit: number;
  solde: number;
}

interface MonthlyData {
  month: number;             // 1-12
  ca: number;
  margeBrute: number;
  valeurAjoutee: number;
  ebe: number;
  rex: number;
  resultatNet: number;
  percentMarge: number;
  percentEbeCa: number;
  percentRexCa: number;
}

interface TreasuryDay {
  date: Date;
  solde: number;             // Solde cumulé des comptes 51x
  entriesCount: number;
  totalEntrees: number;      // Crédits du jour
  totalSorties: number;      // Débits du jour
}

interface BilanPost {
  id: string;
  label: string;
  amount: number;
  children: BilanPost[];
  accountRanges: string[];
}

interface BilanRatio {
  name: string;
  value: number;
  unit: 'eur' | 'percent' | 'ratio';
  formula: string;
  status: 'green' | 'orange' | 'red';
}
```

### 6.3 Logique métier — Calcul des SIG (PCG CUMA)

**Règle de base :** Le montant de chaque poste est calculé en sommant les soldes des comptes correspondants. Pour les produits (classe 7) : crédit − débit. Pour les charges (classe 6) : débit − crédit.

**Important — écritures d'à-nouveau :** Les écritures du journal "ANC" (A Nouveaux) concernent les soldes d'ouverture des comptes de bilan (classes 1 à 5). Elles **ne doivent pas** être incluses dans le calcul du SIG (qui ne concerne que les comptes de gestion classes 6 et 7). Cependant, elles sont nécessaires pour le calcul du bilan et de la trésorerie.

**Mapping comptes → postes SIG (PCG CUMA) :**

| Poste SIG | Comptes inclus | Signe | Notes CUMA |
|---|---|---|---|
| Chiffre d'affaires | 701* à 708* (hors 709*) | + (crédit − débit) | Inclut 706* (travaux agricoles), 708* (prestations diverses) |
| Production stockée | 713* | + | Variation de stocks de produits finis |
| Subventions d'exploitation | 74* + 745* | + | 745* "Subventions complétant recettes" (spécifique CUMA) |
| Achats consommés nets | 601* à 607* + 603* (var. stocks) | − (débit − crédit) | Inclut 602* (carburants, lubrifiants), 606* (fournitures) |
| **= Marge brute** | Calculé | | |
| Services extérieurs | 61* + 62* (hors 621*) | − | 613* (locations), 615* (entretien matériel), 622* (frais comptables) |
| **= Valeur Ajoutée** | Calculé | | |
| Charges de personnel | 64* + **621*** | − | 621* (personnel intérimaire) classé en charges de personnel pour les CUMA |
| Impôts & taxes | 63* | − | |
| **= EBE** | Calculé | | |
| Dotations amortissements | 681* + 686* | − | Amortissements matériel agricole |
| Reprises | 781* + 786* | + | |
| Autres produits de gestion | 75* | + | 758* "Autres produits divers" |
| Autres charges de gestion | 65* | − | |
| **= Résultat d'Exploitation** | Calculé | | |
| Produits financiers | 76* | + | 761* (revenus titres participation), 764* (revenus VMP) |
| Charges financières | 66* | − | |
| **= Résultat financier** | Calculé | | |
| **= Résultat courant avant IS** | Calculé | | |
| Produits exceptionnels | 77* | + | 775* (cessions matériel), 777* (quote-part subventions) |
| Charges exceptionnelles | 67* | − | |
| **= Résultat exceptionnel** | Calculé | | |
| IS & participation | 695* + 69* | − | |
| **= RÉSULTAT NET** | Calculé | | |

### 6.4 Logique métier — Bilan simplifié (PCG CUMA)

**Règle de base :** Le bilan est calculé à partir des soldes des comptes de classes 1 à 5 **incluant les écritures d'à-nouveau** (journal ANC). Le solde d'un compte = Σ(débit) − Σ(crédit). Un solde débiteur = actif, un solde créditeur = passif (avec les inversions habituelles pour les classes 1 et 2).

**Mapping comptes → postes bilan (spécificités CUMA) :**

| Poste bilan | Comptes | Notes CUMA |
|---|---|---|
| **ACTIF IMMOBILISÉ** | | |
| Immob. incorporelles & financières | 20* + 26* + 27* (nets des amort. 28*) | 262* (titres de participation dans d'autres CUMA), 271*/272* (prêts) |
| Immob. corporelles brutes | 21* + 22* + 23* | Matériel agricole, aménagements |
| Immob. financières (autres) | 25* | |
| **ACTIF CIRCULANT** | | |
| Stocks & en-cours | 3* | 321* (lubrifiants), 322* (carburants), 323* (matières consommables) |
| **Créances adhérents nettes** | **453*** (solde débiteur) | ⚠️ Spécifique CUMA : remplace les "créances clients 411*". Le compte 45310000 "Adhérents tvx & cessions" est central |
| Créances d'exploitation | 409* + 418* | |
| Créances fiscales & État | 44* (soldes débiteurs : 4456*, 445*) | 44562100 (TVA déductible), 44566020 |
| Autres créances & comptes courants | 46* + 47* (soldes débiteurs) | |
| Régularisations actif | 486* + 487* (si débiteur) | |
| **Disponibilités & VMP** | 50* + 51* + 53* | 51211000 (CA), 51221000 (CMO) — banques de la CUMA |
| **PASSIF — CAPITAUX PROPRES** | | |
| **Capital social (parts sociales)** | **101* + 102* + 103* + 104*** | ⚠️ Spécifique CUMA : capital = parts sociales des adhérents (1012*, 1013*, 106*) |
| Primes & réserves légales | 1051* | |
| Autres réserves & report | 106* + 11* | 10610000, 10620000, 10623000, 10680000 |
| Résultat de l'exercice | 12* | |
| Subventions d'investissement | 13* | 131*, 139* (quote-part virée au résultat) |
| **PASSIF — DETTES** | | |
| Emprunts & dettes financières | 16* | 16411*, 16413*, 16884* |
| **Dettes adhérents** | **453*** (solde créditeur) | ⚠️ Spécifique CUMA : si le solde global du 453* est créditeur, il apparaît en dettes |
| Dettes fournisseurs | 40* | 40100000, 40400000, 40810000 |
| Dettes sociales | 42* + 43* | |
| Dettes fiscales | 44* (soldes créditeurs) | 44100000, 44550000 |
| Autres dettes | 45* (hors 453) + 46* + 47* (créditeurs) | |
| Régularisations passif | 486* + 487* (si créditeur) | |

> **Point critique CUMA — Compte 453* (Adhérents) :** Ce compte peut avoir un solde net débiteur (créances) OU créditeur (dettes). L'application doit calculer le solde net et le classer en actif (si débiteur) ou passif (si créditeur). De plus, au niveau individuel (compte auxiliaire), certains adhérents peuvent être débiteurs et d'autres créditeurs. Pour le bilan simplifié, on utilise le solde net global. Le drill-down montrera le détail par adhérent.

### 6.5 Logique métier — Trésorerie

- **Comptes de trésorerie** : 51* + 53* (banques + caisse)
- **Solde d'ouverture** : issu des écritures d'à-nouveau (journal "ANC") sur les comptes 51*
- **Solde quotidien** : pour chaque jour de l'exercice, solde = solde d'ouverture + Σ(débits − crédits) de toutes les écritures 51* jusqu'au jour J (un débit sur un compte 51* = entrée d'argent)
- **Top 10** : les 10 mouvements individuels les plus importants en valeur absolue. Encaissements = débits sur 51*, Décaissements = crédits sur 51*

### 6.6 Parsing du FEC

**Algorithme :**

1. **Détection encodage** : tester UTF-8 BOM, puis UTF-8 valide, puis ISO-8859-15 par défaut. Support Windows-1252.
2. **Détection séparateur** : analyser la 1ère ligne — compter les `|` et les `\t`, choisir celui qui donne exactement 18 colonnes.
3. **Validation header** : vérifier la présence exacte des 18 noms de champs réglementaires : `JournalCode|JournalLib|EcritureNum|EcritureDate|CompteNum|CompteLib|CompAuxNum|CompAuxLib|PieceRef|PieceDate|EcritureLib|Debit|Credit|EcritureLet|DateLet|ValidDate|Montantdevise|Idevise`
4. **Parsing ligne par ligne** (dans un Web Worker) :
   - Dates : `YYYYMMDD` → `Date` — le FEC utilise aussi `DD/MM/YYYY` dans certains logiciels → supporter les deux
   - Montants : virgule décimale, pas de séparateur milliers, espaces à trimmer → `parseFloat(str.replace(/\s/g, '').replace(',', '.'))`
   - Chaînes : trim des espaces de début et fin
5. **Extraction métadonnées** : SIREN et date de clôture depuis le nom de fichier (pattern `{SIREN}DONNEESCOMPTABLES{YYYYMMDD}`)
6. **Détection de la période d'exercice** : l'exercice peut être décalé (ex. avril → mars). L'application détermine la période en analysant :
   - La date de clôture extraite du nom de fichier = date de fin d'exercice
   - La date de début d'exercice = date la plus ancienne des écritures d'à-nouveau (journal "ANC") + 1 jour, ou (date de clôture − 12 mois + 1 jour) par défaut
   - Les mois de l'exercice sont numérotés séquentiellement depuis le mois de début (ex. exercice avril-mars → mois 1 = avril, mois 12 = mars)
   - Cette numérotation impacte tous les graphiques et tableaux mensuels

**Gestion des erreurs :**

| Erreur | Comportement |
|---|---|
| Ligne avec nb colonnes ≠ 18 | Ignorer + incrémenter compteur `skippedLines` |
| Montant non parseable | Traiter comme 0.00 + warning |
| Date invalide | Ignorer la ligne + warning |
| Plus de 1 fichier déposé | **Erreur bloquante** : "Un seul fichier FEC est accepté." |

**Performance — gros fichiers :**

- Le parsing s'exécute dans un **Web Worker** dédié pour ne pas bloquer l'UI
- PapaParse en mode `worker: true` et `step` callback pour le streaming
- Progress bar mise à jour via `postMessage` tous les 1000 lignes
- Pas de limite de taille imposée

### 6.7 Sécurité

| Aspect | Mesure |
|---|---|
| Données utilisateur | Jamais envoyées au serveur (100% client-side, hébergement statique interne) |
| XSS | Sanitisation des libellés FEC avant rendu DOM (échappement HTML natif React/Svelte) |
| CSP | Content-Security-Policy stricte sur le déploiement |
| Injection CSV | Le parsing ne doit pas interpréter les formules (`=`, `@`, `+CMD`) — PapaParse ne les exécute pas |

### 6.8 Performance

| Critère | Budget |
|---|---|
| Parsing FEC < 10 000 lignes | < 500 ms |
| Parsing FEC 10 000 – 50 000 lignes | < 2 s (avec progress bar) |
| Parsing FEC 50 000 – 100 000 lignes | < 5 s (avec progress bar) |
| Calcul SIG + ratios + bilan | < 200 ms après parsing |
| Rendu initial du dashboard | < 1 s après calcul |
| Transition entre onglets | < 100 ms |
| Ouverture panel détail | < 200 ms (animation incluse) |

**Optimisations :**

- Web Worker pour le parsing (obligatoire)
- Virtualisation des listes d'écritures si > 500 lignes (react-window)
- Mémoisation des calculs par onglet (useMemo / Zustand selectors)
- Données de trésorerie : pré-calculer le tableau de soldes quotidiens une seule fois, filtrer ensuite par période

---

## 7. Découpage par équipe & tâches

### 7.1 Designer (UX/UI)

| # | Tâche | Priorité | Est. (j) |
|---|---|---|---|
| D-01 | Design system mode clair : palette (§5.1), typo, espacements, shadows, composants de base | MVP | 2 |
| D-02 | Maquette — E-01 Page d'accueil / Upload (desktop + tablette + mobile) | MVP | 1 |
| D-03 | Maquette — E-02 Dashboard SIG (exercice unique) + barre KPIs | MVP | 1.5 |
| D-04 | Maquette — E-03 Panel détail (2 niveaux) | MVP | 1 |
| D-05 | Maquette — E-04/E-05/E-06 Analyses mensuelles (3 sous-onglets) | MVP | 1.5 |
| D-06 | Maquette — E-07 Trésorerie | MVP | 1 |
| D-07 | Maquette — E-08 Structure charges | MVP | 1 |
| D-08 | Maquette — E-09/E-10 Bilan simplifié + détail | MVP | 1.5 |
| D-09 | États d'erreur, empty states, loading states, progress bar | MVP | 1 |
| D-10 | Maquettes responsive (tablette + mobile) | v1 | 2 |

**Total designer : ~13.5 jours**

### 7.2 Front-end

| # | Tâche | Dépendances | Priorité | Est. (j) |
|---|---|---|---|---|
| F-01 | Setup projet (Vite + React 18 + Zustand + Tailwind + config couleurs) | D-01 | MVP | 1 |
| F-02 | Composant Dropzone (upload 1 FEC, drag & drop, validation fichier unique) | D-02 | MVP | 1.5 |
| F-03 | Intégration PapaParse + Web Worker + progress bar | — | MVP | 2 |
| F-04 | Layout principal (header avec nom fichier, barre KPIs, onglets, routing) | D-03 | MVP | 2 |
| F-05 | Composant KPI Card (montant, sparkline 12 mois, sous-info) | D-03 | MVP | 1 |
| F-06 | Tableau SIG (exercice unique : libellé, montant, %CA, chevron) | D-03, B-01 | MVP | 2 |
| F-07 | Panel détail slide-in (niv.1 comptes + niv.2 écritures + filtre) | D-04 | MVP | 3 |
| F-08 | Onglet Analyses mensuelles — 6 graphiques barres | D-05, B-02 | MVP | 2.5 |
| F-09 | Onglet Analyses mensuelles — Cumulé (courbes) | D-05, B-02 | MVP | 1 |
| F-10 | Onglet Analyses mensuelles — Tableau | D-05, B-02 | MVP | 1 |
| F-11 | Onglet Trésorerie (KPIs + courbe quotidienne + top 10) | D-06, B-03 | MVP | 3 |
| F-12 | Onglet Structure charges (donut + détail + graphique mensuel) | D-07, B-04 | MVP | 2.5 |
| F-13 | Onglet Bilan simplifié (barres + détail actif/passif + ratios) | D-08, B-05 | MVP | 3 |
| F-14 | Info-bulles graphiques + interactions donut | — | MVP | 1 |
| F-15 | Données démo (FEC anonymisé embarqué dans le bundle) | B-01 | MVP | 0.5 |
| F-16 | Responsive tablette + mobile | D-10 | v1 | 2.5 |
| F-17 | Accessibilité (aria, clavier, contraste ajusté) | — | v1 | 2 |
| F-18 | Tests unitaires composants (Vitest + React Testing Library) | — | MVP | 2.5 |
| F-19 | Tests E2E (Playwright) — parcours complet upload → navigation → drill-down | — | v1 | 2 |

**Total front-end : ~33.5 jours**

### 7.3 Logique métier (bibliothèque JS)

| # | Tâche | Priorité | Est. (j) |
|---|---|---|---|
| B-01 | Module `parseFEC` : parsing CSV, validation, normalisation, détection encodage/séparateur, extraction SIREN | MVP | 2.5 |
| B-02 | Module `computeSIG` : calcul SIG PCG CUMA + données mensuelles | MVP | 3 |
| B-03 | Module `computeTreasury` : solde quotidien, KPIs trésorerie, top 10 | MVP | 2 |
| B-04 | Module `computeCharges` : répartition par catégorie, données mensuelles | MVP | 1 |
| B-05 | Module `computeBilan` : classification actif/passif CUMA (gestion 453*), ratios | MVP | 2 |
| B-06 | Module `drillDown` : extraction comptes et écritures par poste, solde running | MVP | 1 |
| B-07 | Module `utils` : formatage montants (`Intl.NumberFormat`), dates, calcul %, seuils ratios | MVP | 1 |
| B-08 | Tests unitaires logique métier (>90% coverage, comparaison avec résultats attendus) | MVP | 3 |
| B-09 | Jeu de données de test (FEC CUMA forgé + résultats Excel connus) | MVP | 1 |
| B-10 | Anonymisation du FEC de démo (`381304559DONNEESCOMPTABLES20241231.csv` : remplacer SIREN, noms adhérents, montants ajustés) | MVP | 0.5 |
| B-11 | Gestion des exercices décalés dans tous les modules de calcul (mois ordonnés par exercice) | MVP | 1.5 |

**Total logique métier : ~19 jours**

### 7.4 QA

| # | Tâche | Priorité | Est. (j) |
|---|---|---|---|
| Q-01 | Rédaction plan de test (basé sur §8) | MVP | 1.5 |
| Q-02 | Tests fonctionnels — parcours principal (upload → SIG → drill-down) | MVP | 2 |
| Q-03 | Tests de non-régression calculs SIG (comparaison avec résultats du produit de référence) | MVP | 2 |
| Q-04 | Tests avec FEC CUMA variés (différentes fédérations, tailles, logiciels comptables) | MVP | 3 |
| Q-05 | Tests performance (fichiers 10k, 50k, 100k lignes) | v1 | 1 |
| Q-06 | Tests accessibilité (Axe, Lighthouse) | v1 | 1 |
| Q-07 | Tests cross-browser (Chrome, Firefox, Safari, Edge) | v1 | 1 |

**Total QA : ~11.5 jours**

### 7.5 DevOps

| # | Tâche | Priorité | Est. (j) |
|---|---|---|---|
| O-01 | CI/CD (GitHub Actions : lint + test + build) | MVP | 1 |
| O-02 | Configuration hébergement interne (build statique, serveur web) | MVP | 0.5 |
| O-03 | Monitoring basique (erreurs JS, analytics d'usage) | v1 | 0.5 |

**Total DevOps : ~2 jours**

---

## 8. Critères d'acceptation & tests

### 8.1 US-01 / US-01b — Upload FEC (fichier unique)

| # | Critère |
|---|---|
| CA-01 | Déposer 1 fichier .csv séparateur pipe avec header FEC valide → parsing + dashboard affiché |
| CA-02 | Déposer 1 fichier .txt séparateur tab avec header FEC valide → parsing + dashboard affiché |
| CA-03 | Déposer **2 fichiers** → message d'erreur "Un seul fichier FEC est accepté." — aucun parsing |
| CA-04 | Déposer un fichier sans les 18 colonnes FEC → message d'erreur explicite |
| CA-05 | Déposer un fichier .xlsx → message "format non supporté" |
| CA-06 | Déposer un fichier vide → message "le fichier est vide" |
| CA-07 | Cliquer "Charger les données de démonstration" → dashboard avec données anonymisées |
| CA-08 | Le nom du fichier FEC est affiché dans le header du dashboard |

### 8.2 US-02 — KPIs synthétiques

| # | Critère |
|---|---|
| CA-09 | Les 4 KPIs affichent CA, EBE, Résultat Net, Trésorerie en k€ arrondi |
| CA-10 | Chaque KPI affiche un sparkline de 12 points (mois) |
| CA-11 | L'EBE affiche le ratio % CA en sous-info |
| CA-12 | Aucune variation N-1 n'est affichée (exercice unique) |

### 8.3 US-03 — Tableau SIG

| # | Critère |
|---|---|
| CA-13 | Le tableau affiche toutes les lignes du SIG dans l'ordre défini (§6.3) |
| CA-14 | Les lignes de total sont en gras |
| CA-15 | Le % CA = montant / CA × 100, arrondi à 1 décimale |
| CA-16 | La somme des sous-lignes correspond exactement aux lignes de total (à l'euro près) |
| CA-17 | Les comptes 453* CUMA sont correctement classés dans les postes SIG |
| CA-17b | Les comptes 621* (intérimaire) sont inclus dans "Charges de personnel" et exclus de "Services extérieurs" |

### 8.4 US-04/US-05 — Drill-down

| # | Critère |
|---|---|
| CA-18 | Clic sur une ligne SIG → panel avec liste des comptes contribuant |
| CA-19 | Nombre d'écritures et montant par compte sont exacts |
| CA-20 | Clic sur un compte → écritures individuelles avec solde running correct |
| CA-21 | Le filtre texte fonctionne sur libellé et référence pièce, insensible casse/accents |
| CA-22 | Le bouton × ferme le panel |
| CA-23 | Escape ferme le panel |

### 8.5 US-07 — Trésorerie

| # | Critère |
|---|---|
| CA-24 | Le solde de trésorerie final correspond au solde des comptes 51* + 53* au dernier jour |
| CA-25 | La courbe affiche un point par jour avec écriture sur les comptes de trésorerie |
| CA-26 | Le top 10 encaissements et décaissements sont triés par montant absolu décroissant |
| CA-27 | Les infobulles sur la courbe affichent date + solde + mouvement du jour |

### 8.6 US-09 — Bilan

| # | Critère |
|---|---|
| CA-28 | Total Actif = Total Passif (bilan équilibré) → indicateur vert "✅ Bilan équilibré" |
| CA-29 | Si Total Actif ≠ Total Passif → bandeau orange "⚠️ Attention : écart de X €" |
| CA-30 | Les comptes 453* CUMA sont classés en actif (si solde débiteur) ou passif (si solde créditeur) |
| CA-31 | Les 4 ratios sont calculés correctement et affichent un indicateur de seuil |

### 8.7 Exercice décalé

| # | Critère |
|---|---|
| CA-32 | Un FEC avec exercice avril 2024 → mars 2025 est parsé correctement |
| CA-33 | Les graphiques mensuels affichent les mois dans l'ordre de l'exercice (Avril, Mai, …, Mars) |
| CA-34 | Le header affiche "Exercice avril 2024 — mars 2025" |
| CA-35 | Le filtre trésorerie T1/T2 correspond aux trimestres de l'exercice, pas calendaires |

### 8.8 Scénarios d'erreur

| Scénario | Résultat attendu |
|---|---|
| FEC avec lignes corrompues | Lignes ignorées, warning affiché (ex. "12 lignes ignorées sur 3316") |
| FEC avec uniquement des écritures d'à-nouveau | SIG à 0, bilan renseigné, pas de crash |
| FEC avec un seul mois d'écritures | Graphiques mensuels : 11 mois vides, 1 mois renseigné |
| FEC > 100 000 lignes | Progress bar, pas de gel navigateur (Web Worker) |
| FEC encodé en EBCDIC | Message "encodage non supporté" |
| FEC avec montants au format anglo-saxon (point décimal) | **[QUESTION]** Détection automatique ou refus ? Le standard exige la virgule. |
| Fichier non-FEC (ex. relevé bancaire CSV) | Message "ne semble pas être un FEC valide" |

---

## 9. Plan de livraison & roadmap

### 9.1 Découpage en sprints

| Sprint | Durée | Contenu | Livrable |
|---|---|---|---|
| **Sprint 0** | 1 semaine | Design system mode clair, setup projet, parsing FEC + Web Worker, jeu de test, FEC démo anonymisé | Upload fonctionnel + parser testé |
| **Sprint 1** | 2 semaines | SIG complet PCG CUMA + drill-down 2 niveaux + KPIs + header | Dashboard SIG utilisable avec FEC réel |
| **Sprint 2** | 2 semaines | Analyses mensuelles (3 sous-onglets) + Structure charges (donut + détail) | 2 onglets fonctionnels |
| **Sprint 3** | 2 semaines | Trésorerie + Bilan simplifié CUMA + ratios + panel détail bilan | Tous les onglets |
| **Sprint 4** | 1 semaine | Polish, responsive, accessibilité, tests E2E, déploiement interne | MVP déployé |

**Total MVP : ~8 semaines** (estimation pour 1 dev full-stack senior + 1 designer mi-temps)

### 9.2 Roadmap v2+ (post-MVP)

| Fonctionnalité | Priorité estimée |
|---|---|
| Comparatif N-1 (upload 2 fichiers) + colonnes évolution | Haute |
| Export PDF des analyses | Moyenne |
| Export Excel du tableau de données | Moyenne |
| Mode sombre | Basse |
| Mapping PCG configurable (BIC standard, BNC, associations) | Moyenne |
| Support FEC XML (format XSD fiscal) | Basse |
| Lookup SIREN via API INSEE pour afficher la raison sociale | Basse |
| Saisie manuelle de retraitements (ex. reclassement de comptes) | Basse |

### 9.3 Risques et mitigations

| Risque | Impact | Prob. | Mitigation |
|---|---|---|---|
| Mapping PCG CUMA incomplet (comptes non prévus dans le mapping) | Élevé | Haute | Tester avec 10+ FEC CUMA réels de différentes fédérations dès Sprint 0. Prévoir une catégorie "Autres" catch-all. |
| Variabilité des FEC entre logiciels comptables (myCuma, Cegid, Sage, etc.) | Moyen | Haute | Parsing robuste avec tolérance aux variations mineures (espaces, formats de date alternatifs) |
| Performance sur très gros FEC (> 50k lignes) | Moyen | Moyenne | Web Worker obligatoire + virtualisation des listes (react-window) |
| Gestion du compte 453* (adhérents) : classification actif/passif | Élevé | Moyenne | Logique claire : solde net global → si débiteur = actif, si créditeur = passif. Documenter et tester. |
| Exercices décalés : détection incorrecte de la période | Moyen | Moyenne | Se baser sur la date de clôture du nom de fichier + date min des écritures ANC. Tester avec des FEC à clôture en juin, septembre, mars. |
| Accessibilité des graphiques | Faible | Haute | Prévoir le tableau alternatif (onglet Tableau) pour chaque vue graphique |
| Contraste du vert `#31B700` insuffisant pour le texte | Faible | Certaine | Utiliser `#268E00` pour tout texte vert sur fond blanc (voir §5.6) |

---

## 10. Annexes

### 10.1 Registre des décisions

| # | Décision | Justification | Date |
|---|---|---|---|
| DEC-01 | Architecture 100% client-side, aucune API serveur | Simplicité, confidentialité des données, hébergement statique | 31/03/2026 |
| DEC-02 | PCG Coopératives agricoles (CUMA) comme plan comptable de référence | Cible utilisateur principale : réseau CUMA | 31/03/2026 |
| DEC-03 | Nom du fichier FEC affiché dans le header (pas de raison sociale) | Pas d'appel API externe, simplicité | 31/03/2026 |
| DEC-04 | Mode clair uniquement | Demande client, charte graphique fournie | 31/03/2026 |
| DEC-05 | Pas d'export PDF/Excel | Hors périmètre MVP, roadmap v2 | 31/03/2026 |
| DEC-06 | Pas de limite de taille FEC | Web Worker + virtualisation pour les gros fichiers | 31/03/2026 |
| DEC-07 | Format FEC CSV/TXT uniquement (pas de XML XSD) | Couverture 99% des cas, XML en roadmap v2 | 31/03/2026 |
| DEC-08 | Un seul fichier FEC par analyse (pas de comparatif N-1) | Simplification MVP, comparatif N-1 en roadmap v2 | 31/03/2026 |
| DEC-09 | FEC de démonstration = fichier `381304559...20241231.csv` anonymisé | Données réelles représentatives | 31/03/2026 |
| DEC-10 | Compte 621* (intérimaire) rattaché aux charges de personnel (pas services ext.) | Pratique comptable CUMA confirmée | 31/03/2026 |
| DEC-11 | Support des exercices décalés (non calés sur l'année civile) | CUMA avec exercices en septembre, mars, etc. | 31/03/2026 |
| DEC-12 | Avertissement affiché si bilan déséquilibré (Total Actif ≠ Total Passif) | Signal d'erreur utile, non bloquant | 31/03/2026 |
| DEC-13 | Framework front-end : React 18+ | Écosystème mature, Recharts natif, compétences disponibles | 31/03/2026 |
| DEC-14 | Hébergement interne (pas de GitHub Pages ni domaine custom) | Infrastructure client existante | 31/03/2026 |

### 10.2 Hypothèses restantes (à valider)

| # | Hypothèse | Impact si fausse |
|---|---|---|
| H-01 | Les comptes 65* (Autres charges gestion courante) ne forment pas une catégorie distincte dans le donut des charges | Catégorie manquante si montant significatif |
| H-02 | Les seuils des ratios bilanciels (vert/orange/rouge) suivent les standards PME : Autonomie > 50%, Liquidité > 1.5 | Seuils CUMA potentiellement différents |
| H-03 | Le filtre période en trésorerie (T1, T2, S1, S2) se base sur les trimestres de l'exercice (pas nécessairement calendaires) | Si exercice décalé, T1 = 3 premiers mois de l'exercice |

> **Hypothèses résolues depuis la v2 :** 621* confirmé en charges de personnel, exercices décalés supportés, React confirmé, hébergement interne, FEC de démo = fichier fourni anonymisé, avertissement bilan déséquilibré confirmé.

### 10.3 Questions ouvertes restantes

| # | Question | Priorité |
|---|---|---|
| QR-01 | Les comptes 65* doivent-ils former une catégorie distincte dans le donut des charges, ou sont-ils agrégés dans "Autres" ? | 🟡 Important |
| QR-02 | Quels seuils précis appliquer aux ratios bilanciels pour le contexte CUMA ? (ex. une CUMA a structurellement plus de dettes matériel qu'une PME classique) | 🟡 Important |
| QR-03 | Le filtre période trésorerie (T1/T2/S1/S2) doit-il suivre les trimestres de l'exercice ou les trimestres calendaires ? | 🟢 Mineur |
| QR-04 | Faut-il un mécanisme de détection automatique du format de date (YYYYMMDD vs DD/MM/YYYY) ou peut-on rejeter les FEC non conformes au standard YYYYMMDD ? | 🟢 Mineur |

> **Questions résolues depuis la v2 :** 621* → charges de personnel ✅, exercices décalés → supportés ✅, avertissement bilan → oui ✅, framework → React ✅, hébergement → interne ✅, FEC démo → fichier fourni anonymisé ✅

### 10.4 Structure du FEC de référence

| Caractéristique | Valeur |
|---|---|
| Fichier | `381304559DONNEESCOMPTABLES20241231.csv` |
| Nombre de lignes | 3 316 écritures |
| Encodage | ISO-8859-15 |
| Séparateur | Pipe `\|` |
| SIREN | 381304559 |
| Date de clôture | 31/12/2024 |
| Comptes distincts | 118 |
| Journaux | ANC (13 codes au total : ANC, AC, BA, BA1, C9, CA, EXT, OD, ODA, ODY, VE, VE2, VKS) |
| Classes de comptes | 1 (capitaux, 86 écr.), 2 (immobilisations, 17), 3 (stocks, 14), 4 (tiers, ~680), 5 (trésorerie, ~1290), 6 (charges, ~450), 7 (produits, ~430), 8 (spéciaux) |
| Spécificités CUMA | Compte 453* (Adhérents tvx & cessions) = 404 écritures, 745* (Subventions), 262* (titres participation CUMA) |

### 10.5 Dépendances externes

| Librairie | Version suggérée | Usage | Licence |
|---|---|---|---|
| React | ^18.3 | Framework UI | MIT |
| Zustand | ^4.5 | State management | MIT |
| PapaParse | ^5.4 | Parsing CSV (encodage, streaming, Web Worker) | MIT |
| Recharts | ^2.12 | Graphiques (barres, courbes, donut) — natif React | MIT |
| Tailwind CSS | ^3.4 | Utilitaires CSS mode clair | MIT |
| Inter (police) | Variable | Typographie | OFL |
| date-fns | ^3.6 | Manipulation dates (gestion exercices décalés) | MIT |
| react-window | ^1.8 | Virtualisation des listes longues d'écritures | MIT |

### 10.6 Nommage des composants

```
// Pages
<UploadPage />
<DashboardPage />

// Layout
<AppHeader />           — Logo + nom fichier + exercice
<KpiBar />              — Conteneur des 4 KPIs
<KpiCard />             — Card individuelle
<TabNav />              — Barre d'onglets principale
<SubTabNav />           — Sous-onglets (Mensuel/Cumulé/Tableau)

// SIG
<SigTable />            — Tableau principal
<SigRow />              — Ligne (total ou sous-ligne)
<DetailPanel />         — Panel slide-in droit
<AccountList />         — Liste des comptes contribuant
<AccountCard />         — Card d'un compte
<EntryTable />          — Tableau des écritures
<EntryRow />            — Ligne d'écriture
<EntryFilter />         — Input de filtre

// Analyses mensuelles
<MonthlyCharts />       — Grille 2×3 de graphiques
<BarChart />            — Graphique barres réutilisable
<LineChart />           — Graphique courbe réutilisable
<CumulativeChart />     — Courbes cumulées CA + EBE
<MonthlyDataTable />    — Tableau mensuel

// Trésorerie
<TreasuryKpis />        — 6 cards trésorerie
<TreasuryCurve />       — Courbe quotidienne
<PeriodToggle />        — Toggle Année/T1/T2/S1/S2
<TopMovements />        — Layout 2 colonnes top 10
<TopMovementItem />     — Item individuel (date + libellé + montant)

// Structure charges
<ChargesDonut />        — Donut chart
<ChargesDetailList />   — Liste détail par nature
<ChargesDetailRow />    — Ligne catégorie
<ChargesMonthlySub />   — Graphique mensuel par catégorie
<ChargesMonthlyTable /> — Tableau mensuel (modal/panel)

// Bilan
<BalanceOverview />     — Indicateur équilibre + barres
<BalanceBar />          — Barre horizontale segmentée
<AssetSection />        — Détail actif (immobilisé + circulant)
<LiabilitySection />    — Détail passif (capitaux propres + dettes)
<BalanceRow />          — Ligne de poste bilan
<RatioCards />          — Conteneur des 4 ratios
<RatioCard />           — Card ratio individuelle

// Partagés
<Sparkline />           — Mini graphique dans les KPIs
<Tooltip />             — Infobulle graphique
<ProgressBar />         — Barre de progression parsing
<ErrorBanner />         — Bannière d'erreur/warning
<Badge />               — Badge code compte (monospace)
```

### 10.7 Événements d'analytics suggérés

| Événement | Propriétés |
|---|---|
| `fec_uploaded` | `{ total_lines, encoding, separator, exercice_year, parse_time_ms }` |
| `fec_parse_error` | `{ error_type, file_name }` |
| `demo_loaded` | `{}` |
| `tab_switched` | `{ tab_name }` |
| `sig_drilldown` | `{ sig_line_id, level: "accounts" \| "entries" }` |
| `treasury_period_changed` | `{ period }` |
| `charges_category_clicked` | `{ category }` |
| `bilan_drilldown` | `{ post_id }` |
| `filter_used` | `{ context: "entries", query_length }` |

### 10.8 Exemple de données JSON — Réponse du moteur SIG

```json
{
  "fileName": "381304559DONNEESCOMPTABLES20241231.csv",
  "exercice": 2024,
  "sig": [
    {
      "id": "chiffre_affaires",
      "label": "Chiffre d'affaires",
      "prefix": null,
      "isTotal": false,
      "amount": 482000,
      "percentCa": 100.0,
      "accountRanges": ["706*", "707*", "708*"]
    },
    {
      "id": "production_stockee",
      "label": "Prod. stockée / déstockage",
      "prefix": "+",
      "isTotal": false,
      "amount": 0,
      "percentCa": 0.0,
      "accountRanges": ["713*"]
    }
  ],
  "kpis": {
    "ca": 482000,
    "ebe": 159000,
    "resultatNet": 117000,
    "tresorerie": 274000,
    "ebeRatioCa": 33.0
  }
}
```

---

*Fin du PRB — Financiel Vision v3.0 Finale*  
*Toutes les questions ouvertes initiales (Q-01 à Q-10) et secondaires (QR-01 à QR-06) ont été résolues.*  
*Il reste 3 hypothèses mineures et 4 questions de détail à trancher en cours de développement.*
