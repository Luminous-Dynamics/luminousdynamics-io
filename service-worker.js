/**
 * Service Worker for Luminous Dynamics Developer Portal
 * Provides offline functionality, caching strategies, and PWA support
 */

const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `luminous-dynamics-${CACHE_VERSION}`;
const OFFLINE_PAGE = '/offline.html';

// Files to precache for offline access
const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/offline.html',
    '/404.html',
    '/status.html',

    // Documentation pages
    '/docs/',
    '/docs/index.html',
    '/docs/getting-started.html',
    '/docs/api-reference.html',
    '/docs/sdks.html',
    '/docs/best-practices.html',

    // Community pages (Phase 5I)
    '/faq.html',
    '/roadmap.html',
    '/community.html',
    '/changelog.html',
    '/security.html',
    '/contributing.html',
    '/code-of-conduct.html',
    '/examples.html',

    // Core stylesheets
    '/styles/themes.css',
    '/styles/main.css',
    '/styles/docs.css',
    '/styles/toast.css',
    '/styles/print.css',

    // Core JavaScript
    '/js/theme.js',
    '/js/main.js',
    '/js/toast.js',
    '/js/keyboard-shortcuts.js',
    '/js/structured-data.js',

    // Essential assets
    '/favicon.svg',
    '/manifest.json',
    '/humans.txt'
];

// Routes that should bypass cache and always fetch from network
const NETWORK_ONLY_ROUTES = [
    '/api/',
    '/auth/',
    '/status.html' // Always get fresh status
];

// Cache expiration times (in seconds)
const CACHE_EXPIRATION = {
    html: 24 * 60 * 60, // 24 hours
    css: 7 * 24 * 60 * 60, // 7 days
    js: 7 * 24 * 60 * 60, // 7 days
    images: 30 * 24 * 60 * 60, // 30 days
    fonts: 30 * 24 * 60 * 60 // 30 days
};

/**
 * Installation event - precache essential files
 */
self.addEventListener('install', (event) => {
    console.log(`[SW] Installing version ${CACHE_VERSION}...`);

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Precaching essential files');
                return cache.addAll(PRECACHE_URLS);
            })
            .then(() => {
                console.log(`[SW] Version ${CACHE_VERSION} installed successfully`);
                // Take control immediately instead of waiting
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[SW] Precaching failed:', error);
            })
    );
});

/**
 * Activation event - clean up old caches
 */
self.addEventListener('activate', (event) => {
    console.log(`[SW] Activating version ${CACHE_VERSION}...`);

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((cacheName) => {
                            // Delete old versions of our cache
                            return cacheName.startsWith('luminous-dynamics-') &&
                                   cacheName !== CACHE_NAME;
                        })
                        .map((cacheName) => {
                            console.log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => {
                console.log(`[SW] Version ${CACHE_VERSION} activated`);
                // Take control of all pages immediately
                return self.clients.claim();
            })
    );
});

/**
 * Fetch event - implement caching strategies
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        return;
    }

    // Network-only routes
    if (NETWORK_ONLY_ROUTES.some(route => url.pathname.startsWith(route))) {
        event.respondWith(fetch(request));
        return;
    }

    // Determine strategy based on request type
    const strategy = getStrategy(request);

    switch (strategy) {
        case 'network-first':
            event.respondWith(networkFirst(request));
            break;
        case 'cache-first':
            event.respondWith(cacheFirst(request));
            break;
        case 'stale-while-revalidate':
        default:
            event.respondWith(staleWhileRevalidate(request));
            break;
    }
});

/**
 * Determine caching strategy based on request
 */
function getStrategy(request) {
    const url = new URL(request.url);

    // HTML pages: Stale-while-revalidate (show cached, update in background)
    if (request.headers.get('Accept')?.includes('text/html')) {
        return 'stale-while-revalidate';
    }

    // CSS and JS: Cache-first (rarely change)
    if (url.pathname.match(/\.(css|js)$/)) {
        return 'cache-first';
    }

    // Images and fonts: Cache-first (static assets)
    if (url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot)$/)) {
        return 'cache-first';
    }

    // API calls and dynamic content: Network-first
    return 'network-first';
}

/**
 * Stale-While-Revalidate Strategy
 * Returns cached response immediately, then updates cache in background
 */
async function staleWhileRevalidate(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);

    const fetchPromise = fetch(request)
        .then((networkResponse) => {
            // Update cache in background
            if (networkResponse && networkResponse.status === 200) {
                cache.put(request, networkResponse.clone());
            }
            return networkResponse;
        })
        .catch(() => {
            // Network failed, return cached response or offline page
            return cachedResponse || caches.match(OFFLINE_PAGE);
        });

    // Return cached response immediately if available, otherwise wait for network
    return cachedResponse || fetchPromise;
}

/**
 * Network-First Strategy
 * Try network first, fall back to cache on failure
 */
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);

        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.log('[SW] Network request failed, trying cache:', request.url);

        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // If it's an HTML page and we have no cache, show offline page
        if (request.headers.get('Accept')?.includes('text/html')) {
            return caches.match(OFFLINE_PAGE);
        }

        throw error;
    }
}

/**
 * Cache-First Strategy
 * Return cached response if available, otherwise fetch from network
 */
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
        // Check if cache is expired
        const cacheTime = await getCacheTime(request);
        const maxAge = getMaxAge(request);

        if (cacheTime && maxAge && (Date.now() - cacheTime > maxAge * 1000)) {
            // Cache expired, fetch fresh copy
            return fetchAndCache(request);
        }

        return cachedResponse;
    }

    return fetchAndCache(request);
}

/**
 * Fetch from network and cache the response
 */
async function fetchAndCache(request) {
    try {
        const networkResponse = await fetch(request);

        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());

            // Store cache time
            await setCacheTime(request);
        }

        return networkResponse;
    } catch (error) {
        console.error('[SW] Fetch failed:', error);

        // Try to return offline page for HTML requests
        if (request.headers.get('Accept')?.includes('text/html')) {
            return caches.match(OFFLINE_PAGE);
        }

        throw error;
    }
}

/**
 * Get max age for cached resource based on file type
 */
function getMaxAge(request) {
    const url = new URL(request.url);

    if (url.pathname.match(/\.html$/)) return CACHE_EXPIRATION.html;
    if (url.pathname.match(/\.css$/)) return CACHE_EXPIRATION.css;
    if (url.pathname.match(/\.js$/)) return CACHE_EXPIRATION.js;
    if (url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp)$/)) return CACHE_EXPIRATION.images;
    if (url.pathname.match(/\.(woff|woff2|ttf|eot)$/)) return CACHE_EXPIRATION.fonts;

    return CACHE_EXPIRATION.html; // Default
}

/**
 * Store cache timestamp for a request
 */
async function setCacheTime(request) {
    const cacheTimeName = `${CACHE_NAME}-times`;
    const cache = await caches.open(cacheTimeName);
    const timestamp = Date.now();

    const response = new Response(JSON.stringify({ timestamp }));
    await cache.put(request, response);
}

/**
 * Get cache timestamp for a request
 */
async function getCacheTime(request) {
    try {
        const cacheTimeName = `${CACHE_NAME}-times`;
        const cache = await caches.open(cacheTimeName);
        const response = await cache.match(request);

        if (response) {
            const data = await response.json();
            return data.timestamp;
        }
    } catch (error) {
        // No timestamp found
    }

    return null;
}

/**
 * Handle background sync for offline analytics (future enhancement)
 */
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-analytics') {
        event.waitUntil(syncAnalytics());
    }
});

/**
 * Sync queued analytics events (placeholder)
 */
async function syncAnalytics() {
    console.log('[SW] Syncing queued analytics events');
    // Future: Send queued analytics events when back online
}

/**
 * Handle push notifications (future enhancement)
 */
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();

        event.waitUntil(
            self.registration.showNotification(data.title, {
                body: data.body,
                icon: '/icon-192.png',
                badge: '/favicon.svg',
                tag: data.tag || 'default',
                data: data.data
            })
        );
    }
});

/**
 * Handle notification clicks
 */
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        clients.openWindow(event.notification.data?.url || '/')
    );
});

/**
 * Log service worker messages
 */
self.addEventListener('message', (event) => {
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_VERSION });
    }

    if (event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => caches.delete(cacheName))
                );
            })
        );
    }
});

console.log(`[SW] Service Worker ${CACHE_VERSION} loaded`);
