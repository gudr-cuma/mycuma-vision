/**
 * seed-local.mjs — Crée un compte admin dans la base D1 LOCALE si elle est vide.
 *
 * Réutilise hashPassword() de functions/_lib/password.js (même format
 * "pbkdf2:sha256:..." que la prod). Idempotent : ne fait rien si la table
 * `users` contient déjà au moins une ligne.
 *
 * Variables d'environnement :
 *   D1_DATABASE        nom de la base D1 (défaut: financiel-vision-db)
 *   PERSIST_TO         dossier de persistance wrangler (défaut: .wrangler/state)
 *   WRANGLER_BIN       binaire wrangler (défaut: wrangler)
 *   SEED_ADMIN_EMAIL   email admin (défaut: admin@local)
 *   SEED_ADMIN_PASSWORD mot de passe ; si vide → généré aléatoirement et affiché
 */
import { execFileSync } from 'node:child_process';
import { hashPassword } from '../functions/_lib/password.js';

const DB       = process.env.D1_DATABASE || 'financiel-vision-db';
const PERSIST  = process.env.PERSIST_TO || '.wrangler/state';
const WRANGLER = process.env.WRANGLER_BIN || 'wrangler';

/** Exécute une commande SQL via `wrangler d1 execute --local`. */
function d1(sql, { json = false } = {}) {
  const args = [
    'd1', 'execute', DB,
    '--local',
    '--persist-to', PERSIST,
    ...(json ? ['--json'] : []),
    '--command', sql,
  ];
  return execFileSync(WRANGLER, args, {
    encoding: 'utf8',
    stdio: json ? ['ignore', 'pipe', 'inherit'] : ['ignore', 'inherit', 'inherit'],
    env: { ...process.env, CI: 'true', WRANGLER_SEND_METRICS: 'false' },
  });
}

// ── 1. La base a-t-elle déjà des utilisateurs ? ──────────────────────────────
let count = 0;
try {
  const out = d1('SELECT COUNT(*) AS n FROM users', { json: true });
  const parsed = JSON.parse(out);
  const arr = Array.isArray(parsed) ? parsed : [parsed];
  count = arr[0]?.results?.[0]?.n ?? 0;
} catch (err) {
  console.error('[seed] Impossible de lire la table users :', err.message);
  console.error('[seed] Les migrations ont-elles bien été appliquées avant le seed ?');
  process.exit(1);
}

if (count > 0) {
  console.log(`[seed] La table users contient déjà ${count} ligne(s) — aucun seed.`);
  process.exit(0);
}

// ── 2. Créer l'admin ─────────────────────────────────────────────────────────
// NB : l'email DOIT avoir un TLD (ex. ...local.test) — le serveur valide le
// format `x@y.z` au login et rejette un email sans point après le @.
const email = (process.env.SEED_ADMIN_EMAIL || 'admin@local.test').trim().toLowerCase();
const password =
  process.env.SEED_ADMIN_PASSWORD && process.env.SEED_ADMIN_PASSWORD.length > 0
    ? process.env.SEED_ADMIN_PASSWORD
    : `${Math.random().toString(36).slice(2, 10)}-${Math.random().toString(36).slice(2, 6)}`;

const hash = await hashPassword(password);
const id   = crypto.randomUUID();
const name = 'Admin local';

// L'email/hash ne contiennent jamais de quote simple (base64 + email) → INSERT sûr.
d1(
  `INSERT INTO users (id, email, name, role, is_active, password_hash) ` +
  `VALUES ('${id}', '${email}', '${name}', 'admin', 1, '${hash}')`
);

console.log('════════════════════════════════════════════════════════');
console.log('  [seed] Compte admin local créé');
console.log(`  email    : ${email}`);
console.log(`  password : ${password}`);
console.log('  (modifiable via SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD)');
console.log('════════════════════════════════════════════════════════');
