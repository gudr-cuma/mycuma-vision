# syntax=docker/dockerfile:1

# ─── Étape 1 : build du frontend (Vite → dist/) ──────────────────────────────
FROM node:22-slim AS build
WORKDIR /app

# Dépendances (couche cachée tant que package*.json ne change pas)
COPY package.json package-lock.json ./
RUN npm ci

# Code + build
COPY . .
RUN npm run build

# ─── Étape 2 : runtime Cloudflare local (wrangler / miniflare) ───────────────
# Image Debian (glibc) volontaire : le binaire workerd embarqué par wrangler
# ne fournit pas de build musl/alpine fiable.
FROM node:22-slim AS runtime
WORKDIR /app

# Wrangler installé globalement (le runtime n'a pas besoin des deps de l'app)
RUN npm install -g wrangler@4

# Artefacts nécessaires à l'exécution
COPY --from=build /app/dist ./dist
COPY functions ./functions
COPY migrations ./migrations
COPY scripts ./scripts
COPY wrangler.toml ./wrangler.toml
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# La base D1 locale + le KV local vivent ici (monté en volume Docker)
ENV PERSIST_TO=/data/state \
    D1_DATABASE=financiel-vision-db \
    PORT=8788 \
    CI=true \
    WRANGLER_SEND_METRICS=false
VOLUME ["/data/state"]

EXPOSE 8788
ENTRYPOINT ["./entrypoint.sh"]
