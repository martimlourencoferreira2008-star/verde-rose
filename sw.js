const C = 'vr-v7';
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll([
  './', 'index.html', 'config.js', 'icon.svg',
  'images/arranjo-peonias.jpg', 'images/arranjo-pastel.jpg',
  'images/arranjo-silvestre.jpg', 'images/arranjo-rustico.jpg',
  'images/arranjo-zen.jpg', 'images/arranjo-orquideas.jpg',
  'images/posts/arranjo-peonias.jpg', 'images/posts/arranjo-silvestre.jpg',
  'images/posts/arranjo-pastel.jpg'
]))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || e.request.url.includes('/.netlify/')) return;
  e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); return r; })
    .catch(() => caches.match(e.request).then(m => m || caches.match('index.html'))));
});
