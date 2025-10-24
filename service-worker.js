const CACHE_NAME = 'team-color-sorter-v11'; // Incremented version
const URLS_TO_CACHE = [
  './',
  './index.html',
  './index.js',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://icons.iconarchive.com/icons/google/noto-emoji-activities/48/12800-ice-hockey-icon.png',
  'https://icons.iconarchive.com/icons/google/noto-emoji-activities/96/12800-ice-hockey-icon.png',
  'https://icons.iconarchive.com/icons/google/noto-emoji-activities/256/12800-ice-hockey-icon.png',
  'https://icons.iconarchive.com/icons/google/noto-emoji-activities/512/12800-ice-hockey-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Use reload to bypass browser cache for fresh assets during installation
        const requests = URLS_TO_CACHE.map(url => new Request(url, { cache: 'reload' }));
        return cache.addAll(requests).catch(err => {
          console.warn('Failed to cache some initial resources:', err);
        });
      })
      .then(() => self.skipWaiting()) // Force the waiting service worker to become the active service worker.
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of all open pages
  );
});

self.addEventListener('fetch', event => {
  // We only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Strategy: Network falling back to cache.
  // This ensures that online users always get the freshest content.
  // The cache is only used when the network request fails (e.g. offline).
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // We got a response from the network.
        // Let's cache it for offline use, but only if it's a valid, successful response.
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME)
          .then(cache => {
            // We only cache responses with a 200 status code.
            if (networkResponse.status === 200) {
              cache.put(event.request, responseToCache);
            }
          });
        return networkResponse;
      })
      .catch(error => {
        // Network request failed, probably because the user is offline.
        // Try to serve the response from the cache.
        console.warn('Network request failed. Serving from cache for:', event.request.url);
        return caches.match(event.request);
      })
  );
});
