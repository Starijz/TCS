const CACHE_NAME = 'team-color-sorter-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/components/AssignmentStep.tsx',
  '/components/NameInputStep.tsx',
  '/contexts/LanguageContext.tsx',
  '/translations.ts',
  '/constants.ts',
  '/types.ts',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/html-to-image/1.11.11/html-to-image.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // We use addAll, but ignore errors for CDN scripts which might fail due to opaque responses
        const promises = URLS_TO_CACHE.map(url => {
            return fetch(url, { mode: 'no-cors' }).then(response => {
                if (response.status === 200) {
                    return cache.put(url, response);
                }
                return Promise.resolve();
            }).catch(() => {
                // Also cache local files this way
                return cache.add(url).catch(err => console.warn(`Failed to cache ${url}`, err));
            });
        });
        return Promise.all(promises);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request because it's a stream and can only be consumed once
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              // For CDN scripts, we get opaque responses. We can't cache them this way.
              // They are handled during the install phase.
              return response;
            }

            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
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
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});