/* Service worker : fonctionnement hors ligne + notifications */
const CACHE = 'avent-v5';
const FICHIERS = [
  './', './index.html', './css/style.css', './js/config.js', './js/dessins.js', './js/app.js', './js/scene.js', './js/decor-data.js',
  './img/decor.svg', './img/avant.svg',
  './manifest.webmanifest', './icons/logo.svg', './icons/icon-192.png', './icons/icon-512.png', './icons/badge-96.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FICHIERS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((cles) => Promise.all(cles.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Réseau d'abord (pour recevoir les mises à jour), cache si hors ligne
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const garder = url.origin === location.origin || url.host.endsWith('fonts.googleapis.com') || url.host.endsWith('fonts.gstatic.com');
  if (!garder) return;
  // fichiers du site : on redemande toujours au serveur la dernière version (no-cache)
  const charger = url.origin === location.origin
    ? fetch(e.request.url, { cache: 'no-cache', credentials: 'same-origin' }).then((r) => (r.redirected ? fetch(e.request) : r))
    : fetch(e.request);
  e.respondWith(
    charger
      .then((rep) => {
        const copie = rep.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copie));
        return rep;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});

// Notification « Ouvre ta case !! 🎁 » envoyée chaque matin
self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { body: e.data && e.data.text() }; }
  e.waitUntil(self.registration.showNotification(d.title || "Calendrier de l'Avent", {
    body: d.body || 'Ouvre ta case !! 🎁',
    icon: 'icons/icon-192.png',
    badge: 'icons/badge-96.png',
    tag: 'avent',
    renotify: true,
    data: { url: './' }
  }));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((fenetres) => {
      for (const f of fenetres) if ('focus' in f) return f.focus();
      return self.clients.openWindow('./');
    })
  );
});
