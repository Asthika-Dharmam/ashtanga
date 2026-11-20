// Offline support. The shell is cached on install; data files as they are read (and prefetched,
// js/data.js). Served stale-while-revalidate, so a visit online refreshes what a later visit offline
// will see. Raise VERSION after changing any file under js/ or css/.
const VERSION = 'v3';
const CACHE = 'ashtanga-' + VERSION;
const SHELL = ['./', 'index.html', 'css/app.css', 'js/app.js', 'js/util.js', 'js/data.js', 'js/icons.js',
  'js/ashtanga.js', 'js/sankalpa.js', 'js/festivals.js', 'js/view-panchanga.js', 'js/view-ashtanga.js',
  'js/view-sankalpa.js', 'js/view-festivals.js', 'js/view-about.js', 'manifest.webmanifest',
  'icons/icon.svg', 'icons/icon-192.png', 'data/index.json', 'fonts/NotoSerifDevanagari-Regular.woff2'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k.startsWith('ashtanga-') && k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async (cache) => {
    const hit = await cache.match(e.request, { ignoreSearch: true });
    const fresh = fetch(e.request).then((res) => {
      if (res.ok) cache.put(e.request, res.clone());
      return res;
    }).catch(() => hit || Response.error());
    return hit || fresh;
  }));
});
