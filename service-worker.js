self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('chooser-cache').then((cache) => {
      return cache.addAll(['./', './index.html', './script.js', './manifest.json']);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});
