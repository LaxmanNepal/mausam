const CACHE='mausam-v35';
const CORE_ASSETS=[
  './',
  './index.html',
  './style.css',
  './cities.css',
  './datetime.css',
  './app.js',
  './weather-cache.js',
  './api-compat.js',
  './nepali-clock.js',
  './cities.js',
  './enhancements.js',
  './resilience.js',
  './districts.js',
  './intelligence.js',
  './national.js',
  './features.js',
  './travel.js',
  './mountain.js',
  './farmer.js',
  './map.js',
  './map.html',
  './manifest.json'
];
const OPTIONAL_ASSETS=[
  './alerts/',
  './alerts/index.html',
  './alert-page.html',
  './alerts.css',
  './alerts.js',
  './weather-alert/',
  './weather-alert/index.html',
  './rivers-alert/',
  './rivers-alert/index.html',
  './flood-alert/',
  './flood-alert/index.html',
  './lightning-alert/',
  './lightning-alert/index.html',
  './light-alert/',
  './light-alert/index.html',
  './landslide-alert/',
  './landslide-alert/index.html',
  './heat-alert/',
  './heat-alert/index.html',
  './air-alert/',
  './air-alert/index.html',
  './wind-alert/',
  './wind-alert/index.html',
  './rain-alert/',
  './rain-alert/index.html',
  './uv-alert/',
  './uv-alert/index.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(async cache => {
        await Promise.allSettled(CORE_ASSETS.map(url => cache.add(url)));
        await Promise.allSettled(OPTIONAL_ASSETS.map(url => cache.add(url)));
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const request = event.request;
  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;

  // HTML navigations: network-first so deployments become visible immediately.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (sameOrigin && response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then(cache => cache.put(request, copy)).catch(() => {});
          }
          return response;
        })
        .catch(() => caches.match(request).then(cached => cached || caches.match('./index.html')))
    );
    return;
  }

  // Local static assets: stale-while-revalidate.
  if (sameOrigin) {
    event.respondWith(
      caches.match(request).then(cached => {
        const network = fetch(request)
          .then(response => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(CACHE).then(cache => cache.put(request, copy)).catch(() => {});
            }
            return response;
          })
          .catch(() => cached);

        return cached || network;
      })
    );
  }
});