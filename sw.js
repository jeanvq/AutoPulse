// AutoPulse Service Worker
const CACHE = 'autopulse-v4';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './images/NEW.png',
  './images/SEDAN.png',
  './images/HATCH.png',
  './images/SUV.png',
  './images/VAN.png',
  './images/TRUCK.png'
];

// Install: cache only static assets (NO styles.css, NO app.js)
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate: remove old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first para JS y CSS, cache-first para el resto
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;

  if (e.request.url.includes('.js') || 
      e.request.url.includes('.css') || 
      e.request.url.includes('.php')) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, copy));
        }
        return response;
      });
    }).catch(() => caches.match('./index.html'))
  );
});