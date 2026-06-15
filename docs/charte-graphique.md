# Charte graphique — myCuma Vision (mode clair uniquement)

> Extrait du `CLAUDE.md` d'origine. Référence couleurs + tokens Tailwind.

## Palette

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

## Tokens Tailwind (`tailwind.config.js`)

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

Police : **Inter** (Google Fonts ou self-hosted).
