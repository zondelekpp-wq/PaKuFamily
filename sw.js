/* PaKu launcher (PaKu family hub) – offline cache. Touches only its own cache and its own folder. */
const VERSION = 'pakufamily-v3';
const FILES = ['./', './index.html', './family.js', './family.json', './install.js', './manifest.webmanifest',
  './icon.svg', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png', './qr.svg',
  './qr-paku.svg', './qr-grounding.svg', './qr-steps.svg', './qr-honicorn.svg', './qr-word.svg', './qr-buddy.svg'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => Promise.all(FILES.map(f => c.add(new Request(f, { cache: 'reload' })).catch(() => { })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('pakufamily-') && k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || !r.url.startsWith(self.registration.scope)) return;
  e.respondWith((async () => {
    const c = await caches.open(VERSION);
    try {
      const res = await fetch(r, { cache: 'no-cache' });
      if (res.ok) c.put(r.mode === 'navigate' ? './index.html' : r, res.clone());
      return res;
    } catch (err) {
      return (await c.match(r, { ignoreSearch: true })) || (r.mode === 'navigate' ? await c.match('./index.html') : undefined) || Response.error();
    }
  })());
});
