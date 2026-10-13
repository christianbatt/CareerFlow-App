// Service Worker for CareerFlow AI - Complete Offline & Standalone Desktop PWA
const CACHE_NAME = 'careerflow-cache-v2';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Pre-caching some assets failed:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // 2. API Routes: Network-only with graceful offline fallback response
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({
            error: 'Il server è temporaneamente in standby o la rete è disconnessa. I tuoi dati locali sono al sicuro.',
            offline: true
          }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json; charset=utf-8' }
          }
        );
      })
    );
    return;
  }

  // 3. Navigation requests (Opening the PWA app window / start_url)
  const isNavigation =
    event.request.mode === 'navigate' ||
    (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'));

  if (isNavigation) {
    event.respondWith(
      (async () => {
        try {
          // Attempt network fetch with a 2500ms timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2500);

          const networkResponse = await fetch(event.request, { signal: controller.signal });
          clearTimeout(timeoutId);

          if (networkResponse && networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put('/', networkResponse.clone());
            cache.put('/index.html', networkResponse.clone());
            return networkResponse;
          }
        } catch {
          // Network failed, timed out, or container sleeping
        }

        // Return cached App Shell
        const cachedIndex = (await caches.match('/index.html')) || (await caches.match('/'));
        if (cachedIndex) {
          return cachedIndex;
        }

        // Fallback network attempt
        return fetch(event.request);
      })()
    );
    return;
  }

  // 4. Static Assets (Scripts, styles, images, fonts, icons) -> Stale While Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.ok && networkResponse.type === 'basic') {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Network failed; cachedResponse will be used if available
        });

      return cachedResponse || fetchPromise;
    })
  );
});
