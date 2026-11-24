// Offline support. The shell is cached on install and served stale-while-revalidate (a visit
// online refreshes what a later visit offline will see). data/index.json is network-first: it names
// the data build, and every other data file is asked for under that build (?b=…, js/data.js), so a
// new build is fetched afresh, and the copies of an older one are dropped as the new ones arrive.
// Raise VERSION after changing any file under js/ or css/.
const VERSION = 'v16';
const CACHE = 'ashtanga-' + VERSION;
const SHELL = ['./', 'index.html', 'css/app.css', 'js/app.js', 'js/util.js', 'js/data.js', 'js/icons.js',
  'js/ashtanga.js', 'js/panchanga-sankalpa.js', 'js/festivals.js', 'js/view-panchanga.js', 'js/view-ashtanga.js',
  'js/view-sankalpa.js', 'js/view-festivals.js', 'js/view-about.js', 'js/view-ashtangam.js', 'manifest.webmanifest',
  'icons/icon.svg', 'icons/icon-192.png', 'fonts/NotoSerifDevanagari-Regular.woff2'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k.startsWith('ashtanga-') && k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

const fresh = (req) => fetch(req, { cache: 'no-cache' });

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  const path = url.pathname;
  e.respondWith(caches.open(CACHE).then(async (cache) => {
    // The index: the network's, if it answers.
    if (path.endsWith('/data/index.json')) {
      try {
        const res = await fresh(e.request);
        if (res.ok) { cache.put(e.request, res.clone()); return res; }
      } catch { /* offline */ }
      return (await cache.match(e.request, { ignoreSearch: true })) || Response.error();
    }
    // A data file of a build: kept as it is; a new build's copy replaces the old one's.
    if (path.includes('/data/')) {
      const hit = await cache.match(e.request);
      if (hit) return hit;
      try {
        const res = await fetch(e.request);
        if (res.ok) {
          for (const old of await cache.keys()) {
            const u = new URL(old.url);
            if (u.pathname === path && u.search !== url.search) cache.delete(old);
          }
          cache.put(e.request, res.clone());
        }
        return res;
      } catch {
        // Offline with no copy of this build: any earlier build's copy.
        return (await cache.match(e.request, { ignoreSearch: true })) || Response.error();
      }
    }
    // The shell: the cached copy, refreshed for next time.
    const hit = await cache.match(e.request, { ignoreSearch: true });
    const update = fresh(e.request).then((res) => {
      if (res.ok) cache.put(e.request, res.clone());
      return res;
    }).catch(() => hit || Response.error());
    return hit || update;
  }));
});
