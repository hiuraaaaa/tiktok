const CACHE = 'ttdown-v1';
const ASSETS = [
  '/','/index.html','/manifest.json',
  '/icon-192.png','/icon-512.png'
];
self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
});
self.addEventListener('fetch', e=>{
  const url = new URL(e.request.url);
  // API -> network first
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));
    return;
  }
  // Assets -> cache first
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
