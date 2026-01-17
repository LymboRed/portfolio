const CACHE_NAME = 'lymbo-os-v2.0.49-force'; // Incremented version
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './assets/profile.jpeg',
    './assets/madlib_trailer.mp4',
    './i18n/en.json',
    './i18n/fr.json',
    './i18n/ru.json',
    'https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&display=swap',
    'https://unpkg.com/aos@2.3.1/dist/aos.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css'
];

// Install Service Worker
self.addEventListener('install', (event) => {
    self.skipWaiting(); // Force installation of the new worker immediately
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

// Activate & Cleanup old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        }).then(() => self.clients.claim()) // Take control of all pages immediately
    );
});

// Fetching strategy: Stale-While-Revalidate
// Serve from cache, but update in background
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                // Only cache successful responses from our own domain
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            }).catch(() => {
                // Fallback to offline if fetch fails and no cache
            });

            return cachedResponse || fetchPromise;
        })
    );
});
