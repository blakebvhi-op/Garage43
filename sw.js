// Garage 43 — service worker: offline shell cache + web push.
// index.html / sw.js / manifest are NETWORK-FIRST so pushes show up immediately;
// fonts, icons and the Supabase JS bundle are cache-first (they're versioned).
const CACHE = 'g43-v4';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request; const u = new URL(req.url);
  if (req.method !== 'GET') return;
  if (u.hostname.endsWith('supabase.co')) return;                // never cache data

  const isShell = req.mode === 'navigate' || (u.origin === location.origin && /\.(html|webmanifest)$|\/sw\.js$|\/$/.test(u.pathname));
  if (isShell) {
    // network-first, fall back to cache when offline
    e.respondWith(fetch(req).then(res => { if (res.ok) caches.open(CACHE).then(c => c.put(req, res.clone())); return res; })
      .catch(() => caches.match(req).then(hit => hit || caches.match('./index.html'))));
    return;
  }
  const cacheable = u.origin === location.origin || ['fonts.googleapis.com','fonts.gstatic.com','cdn.jsdelivr.net','tessdata.projectnaptha.com'].includes(u.hostname);
  if (!cacheable) return;
  // cache-first for static assets
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => { if (res.ok) caches.open(CACHE).then(c => c.put(req, res.clone())); return res; })));
});

self.addEventListener('push', e => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch (_) { d = { body: e.data && e.data.text() }; }
  e.waitUntil(self.registration.showNotification(d.title || 'Garage 43', { body: d.body || '', icon: './icon-192.png', badge: './icon-192.png', tag: d.tag || 'g43', renotify: true, data: { url: d.url || './' } }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(ws => { for (const w of ws) if ('focus' in w) return w.focus(); return self.clients.openWindow((e.notification.data && e.notification.data.url) || './'); }));
});
