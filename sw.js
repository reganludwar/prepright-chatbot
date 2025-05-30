// sw.js
//Service Worker for Offline

const CACHE_NAME = 'prepright-cache-v1';
const ASSETS = [
  '/', '/index.html', '/main.js', '/style.css', '/manifest.json',
  '/icons/icon-192.png', '/icons/icon-512.png'
];

// On install, cache all files
self.addEventListener('install', evt => {
  evt.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

// On activate, remove old caches
self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
});

// On fetch, respond with cache first, fallback to network
self.addEventListener('fetch', evt => {
  evt.respondWith(caches.match(evt.request).then(cached => cached || fetch(evt.request)));
});