# myCuma-Vision en Docker (local)

Ce montage permet de lancer **l'application complète en local** (page + API + une vraie base de
données persistante), sur un **port fixe**, sans rien changer au déploiement public sur Cloudflare.

## En une phrase : comment ça marche ?

L'app n'utilise pas un serveur classique + PostgreSQL. Elle tourne sur **Cloudflare** :
le frontend, l'API (« Functions ») et la base **D1** (un SQLite managé) sont fusionnés dans un
**même runtime**. On dockerise donc l'outil officiel Cloudflare (`wrangler`) qui rejoue ce runtime
**à l'identique en local**. Résultat : **parité 100 %** avec la prod, et une vraie base locale
persistante qu'on peut inspecter.

> ℹ️ C'est pourquoi il y a **2 conteneurs et pas 3** (pas de conteneur PostgreSQL séparé) :
> Cloudflare ne sépare pas « page / API / base » comme l'autre projet. Voir la section
> *Aller plus loin* pour les options d'évolution.

| Conteneur   | Rôle                                              | URL                     |
|-------------|---------------------------------------------------|-------------------------|
| `app`       | Page + API (Functions) + base D1 + KV (rate-limit)| http://localhost:8788   |
| `db-viewer` | Interface web pour **voir la base** (façon pgAdmin)| http://localhost:8780   |

---

## Prérequis

- **Docker Desktop** installé et démarré (Windows / Mac / Linux).
- Rien d'autre : Node, wrangler, etc. sont gérés **dans** les conteneurs.

## Démarrage

```bash
docker compose up --build
```

Au **premier** démarrage, le conteneur `app` :
1. applique les migrations (`migrations/`) sur la base D1 locale,
2. crée un **compte admin** (la base démarre vide) et **affiche ses identifiants dans les logs** :

```
════════════════════════════════════════════════════════
  [seed] Compte admin local créé
  email    : admin@local.test
  password : 8f3kd9a1-zb7q
════════════════════════════════════════════════════════
```

Puis ouvrez **http://localhost:8788** et connectez-vous avec ces identifiants.

> Pour fixer vous-même le mot de passe admin, créez un fichier `.env` à la racine :
> ```
> SEED_ADMIN_EMAIL=moi@local.test
> SEED_ADMIN_PASSWORD=MonMotDePasse!2026
> ```
> (`.env` est gitignoré.)

## Voir la base de données

Ouvrez **http://localhost:8780** : l'interface `sqlite-web` liste les tables (`users`, `sessions`,
`permissions`, `bilan_config`…) et permet de parcourir leur contenu en lecture seule.

## Commandes utiles

```bash
docker compose up --build      # (re)construire et démarrer
docker compose up -d           # démarrer en arrière-plan
docker compose logs -f app     # suivre les logs de l'app (ex. retrouver le mot de passe admin)
docker compose down            # arrêter (la base est conservée)
docker compose down -v         # arrêter ET supprimer la base locale (reset complet)
```

La base vit dans le **volume Docker `d1data`** : elle **persiste** entre les redémarrages et n'est
supprimée que par `down -v`.

---

## Ce qui n'est PAS impacté

Le déploiement public reste **inchangé** : Cloudflare Pages build toujours `npm run build` → `dist`
depuis git, et **ignore** `Dockerfile` / `docker-compose.yml`. Le code (`functions/`, `src/`,
`migrations/`) et `wrangler.toml` ne sont pas modifiés par ce montage.

---

## Aller plus loin : héberger sur votre propre serveur Docker

L'image `app` est **autonome** : elle tourne telle quelle sur un serveur Docker maison (le runtime
Cloudflare local + le volume de base D1). Points à connaître avant un usage au-delà du test :

- **HTTPS obligatoire hors localhost.** Le cookie de session a l'attribut `Secure`. Les navigateurs
  l'acceptent sur `http://localhost`, mais **le refusent en HTTP simple sur une autre adresse** →
  la connexion échouerait. Sur un serveur, placez l'app **derrière un reverse proxy HTTPS**
  (Caddy, Traefik, Nginx + Let's Encrypt).
- **Sauvegardes.** La base est le fichier SQLite dans le volume `d1data` → prévoyez une sauvegarde
  régulière de ce volume.
- **Serveur de dev.** `wrangler pages dev` est un serveur de **développement** : parfait pour du
  local et de l'interne, mais pas durci pour de la prod exposée. Pour durcir, on pourra plus tard
  passer au runtime **workerd** (open-source de Cloudflare).
- **Bascule PostgreSQL complète** (le vrai schéma « 3 conteneurs » de l'autre projet) : ce serait un
  **chantier séparé** — réécrire l'API (`functions/api/*`) sur Node, remplacer D1 par PostgreSQL et
  le KV par Redis, et porter les migrations. À envisager seulement si l'on quitte définitivement
  Cloudflare.

---

## Dépannage

- **« Address already in use » sur 8788 ou 8780** : un autre programme occupe le port. Changez le
  mapping dans `docker-compose.yml` (ex. `"9788:8788"`).
- **`db-viewer` reste sur « pas encore créée »** : c'est normal tant que `app` n'a pas fini son
  premier démarrage (migrations). Il s'ouvre automatiquement ensuite.
- **Repartir de zéro** : `docker compose down -v` puis `docker compose up --build`.
