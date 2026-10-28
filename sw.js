const CACHE = 'gym-bro-transformation-purple-v32';
const FILES = ['./', './index.html', './manifest.webmanifest','./icons/icon-180.png','./icons/icon-192.png','./icons/icon-512.png','./icons/gb-logo.svg'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('gym-bro-transformation-') && key !== CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const req=event.request;
  if(req.method!=='GET' || new URL(req.url).origin!==self.location.origin) return;
  // Prefer the newest HTML when online, with cached fallback when offline.
  if (req.mode==='navigate') {
    event.respondWith(fetch(req).then(response=>{
      if(response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put(req,copy));}
      return response;
    }).catch(()=>caches.match(req).then(cached=>cached || caches.match('./index.html'))));
    return;
  }
  // Cache-first for icons and other static assets.
  event.respondWith(caches.match(req).then(cached => cached || fetch(req).then(response => {
    if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(req,copy));}
    return response;
  })));
});
