const CACHE = 'eps-co-v5';
const FILES = [
  'eleve.html',
  'prof.html',
  'sw.js',
  'manifest-eleve.json',
  'manifest-prof.json',
  'data.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // data.json : network-first pour toujours récupérer les données à jour
  if (url.pathname.endsWith('data.json')) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }
  // Reste : cache-first
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).catch(() => null)));
});
