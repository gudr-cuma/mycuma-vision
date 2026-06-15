#!/bin/sh
# entrypoint.sh — démarrage du conteneur `app`
#   1. applique les migrations D1 sur la base LOCALE
#   2. seed un admin si la base est vide
#   3. lance le runtime Cloudflare local (frontend + Functions + D1 + KV)
set -e

PERSIST="${PERSIST_TO:-/data/state}"
DB="${D1_DATABASE:-financiel-vision-db}"
PORT="${PORT:-8788}"

export CI=true
export WRANGLER_SEND_METRICS=false

echo "▶ Application des migrations D1 (local) dans ${PERSIST} …"
wrangler d1 migrations apply "$DB" --local --persist-to "$PERSIST"

echo "▶ Vérification / création de l'admin local …"
node scripts/seed-local.mjs

echo "▶ Démarrage du serveur Cloudflare local sur le port ${PORT} …"
exec wrangler pages dev ./dist \
  --ip 0.0.0.0 \
  --port "$PORT" \
  --persist-to "$PERSIST"
