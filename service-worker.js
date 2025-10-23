const CACHE_NAME = 'team-color-sorter-v5';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/index.js',
  '/manifest.json',
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
  );
});

self.addEventListener('fetch', event => {
  // We only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Strategy: Cache, falling back to network
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Not in cache, fetch from network
        return fetch(event.request).then(
          networkResponse => {
            // Check if we received a valid response.
            // We don't cache opaque responses (e.g. from no-cors requests to CDNs)
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        );
      })
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
    })
  );
});