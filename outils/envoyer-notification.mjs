// Envoie la notification « Ouvre ta case !! 🎁 » aux téléphones abonnés.
// Lancé par .github/workflows/notification.yml (chaque matin à 10h, le 25 à 20h).
// Secrets GitHub nécessaires : VAPID_PRIVATE_KEY et ABONNEMENTS.
import webpush from 'web-push';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const ctx = { window: {} };
vm.runInNewContext(readFileSync(new URL('../js/config.js', import.meta.url), 'utf8'), ctx);
const C = ctx.window.CONFIG;

const prive = (process.env.VAPID_PRIVATE_KEY || '').trim();
const brut = (process.env.ABONNEMENTS || '').trim();
if (!prive) throw new Error('Secret VAPID_PRIVATE_KEY manquant');
if (!brut) throw new Error('Secret ABONNEMENTS manquant (le code copié depuis l\'app)');

// accepte un code, une liste [code, code] ou plusieurs codes collés les uns après les autres
let abonnements;
try { abonnements = JSON.parse(brut); } catch { abonnements = JSON.parse(`[${brut.replace(/}\s*,?\s*{"endpoint"/g, '},{"endpoint"')}]`); }
if (!Array.isArray(abonnements)) abonnements = [abonnements];

webpush.setVapidDetails('https://diiriix.github.io/calendrier/', C.vapidPublic, prive);

const message = (process.env.MESSAGE || '').trim() || C.notification.texte;
const charge = JSON.stringify({ title: C.notification.titre, body: message, url: './' });

let ok = 0;
for (const [i, sub] of abonnements.entries()) {
  try {
    const r = await webpush.sendNotification(sub, charge, { TTL: 6 * 3600, urgency: 'high' });
    console.log(`Téléphone ${i + 1} : envoyé (${r.statusCode})`);
    ok++;
  } catch (e) {
    console.log(`Téléphone ${i + 1} : échec (${e.statusCode || ''}) ${e.body || e.message}`);
    if (e.statusCode === 404 || e.statusCode === 410) console.log('  → ce code n\'est plus valable : réactive les notifications dans l\'app et remplace le code.');
  }
}
console.log(`« ${message} » envoyé à ${ok}/${abonnements.length} téléphone(s).`);
if (!ok) process.exit(1);
