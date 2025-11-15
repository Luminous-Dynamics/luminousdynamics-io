/**
 * Service Worker for Luminous Dynamics Developer Portal
 * Provides offline functionality and caching
 */

const CACHE_VERSION = 'v2.0.0';
const CACHE_NAME = `luminous-dynamics-${CACHE_VERSION}`;
const RUNTIME_CACHE = `luminous-dynamics-runtime-${CACHE_VERSION}`;
const API_CACHE = `luminous-dynamics-api-${CACHE_VERSION}`;

// Cache expiration times (in seconds)
const CACHE_MAX_AGE = {
    STATIC: 60 * 60 * 24 * 30, // 30 days
    RUNTIME: 60 * 60 * 24 * 7, // 7 days
    API: 60 * 5 // 5 minutes
};

// Assets to cache immediately
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/status.html',
    '/docs/getting-started.html',
    '/docs/api-reference.html',
    '/docs/sdks.html',
    '/docs/best-practices.html',
    '/styles/main.css',
    '/styles/themes.css',
    '/styles/syntax.css',
    '/styles/toast.css',
    '/styles/animations.css',
    '/styles/docs.css',
    '/styles/status-dashboard.css',
    '/styles/print.css',
    '/js/main.js',
    '/js/theme.js',
    '/js/toast.js',
    '/js/animations.js',
    '/js/docs-navigation.js',
    '/js/status-dashboard.js',
    '/favicon.svg',
    '/404.html',
    '/offline.html',
    '/data/status-data.json'
];

// Cache strategies
const CACHE_STRATEGIES = {
    // Cache first, fallback to network
    CACHE_FIRST: 'cache-first',
    // Network first, fallback to cache
    NETWORK_FIRST: 'network-first',
    // Network only
    NETWORK_ONLY: 'network-only',
    // Stale while revalidate
    STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

/**
 * Install event - cache essential assets
 */
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Precaching assets');
                return cache.addAll(PRECACHE_ASSETS);
            })
            .then(() => {
                console.log('[Service Worker] Installed successfully');
                // Activate immediately
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[Service Worker] Precaching failed:', error);
            })
    );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((cacheName) => {
                            // Delete old caches
                            return cacheName.startsWith('luminous-dynamics-') &&
                                   cacheName !== CACHE_NAME &&
                                   cacheName !== RUNTIME_CACHE &&
                                   cacheName !== API_CACHE;
                        })
                        .map((cacheName) => {
                            console.log('[Service Worker] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => {
                console.log('[Service Worker] Activated successfully');
                // Take control of all clients
                return self.clients.claim();
            })
    );
});

/**
 * Fetch event - serve from cache or network
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        // For CDN assets, use network with cache fallback
        if (url.hostname.includes('cdnjs.cloudflare.com')) {
            event.respondWith(networkFirstStrategy(request));
        }
        return;
    }

    // Choose strategy based on request type
    const strategy = getStrategy(request);

    switch (strategy) {
        case CACHE_STRATEGIES.CACHE_FIRST:
            event.respondWith(cacheFirstStrategy(request));
            break;
        case CACHE_STRATEGIES.NETWORK_FIRST:
            event.respondWith(networkFirstStrategy(request));
            break;
        case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
            event.respondWith(staleWhileRevalidateStrategy(request));
            break;
        default:
            // Default to network first
            event.respondWith(networkFirstStrategy(request));
    }
});

/**
 * Determine caching strategy for request
 * @param {Request} request - Fetch request
 * @returns {string} Strategy name
 */
function getStrategy(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Static assets (CSS, JS, images, fonts) - cache first
    if (path.match(/\.(css|js|svg|png|jpg|jpeg|gif|webp|woff2?|ttf|eot)$/)) {
        return CACHE_STRATEGIES.CACHE_FIRST;
    }

    // JSON data files - stale while revalidate
    if (path.endsWith('.json') && path.startsWith('/data/')) {
        return CACHE_STRATEGIES.STALE_WHILE_REVALIDATE;
    }

    // HTML pages - network first with cache fallback
    if (path.endsWith('.html') || path === '/') {
        return CACHE_STRATEGIES.NETWORK_FIRST;
    }

    // API calls - stale while revalidate (short cache time)
    if (path.startsWith('/api/')) {
        return CACHE_STRATEGIES.STALE_WHILE_REVALIDATE;
    }

    // Default - network first
    return CACHE_STRATEGIES.NETWORK_FIRST;
}

/**
 * Cache first strategy
 * @param {Request} request - Fetch request
 * @returns {Promise<Response>}
 */
async function cacheFirstStrategy(request) {
    try {
        // Try cache first (check both precache and runtime)
        let cachedResponse = await caches.match(request);

        // Check if cache is expired
        if (cachedResponse) {
            const cacheTime = cachedResponse.headers.get('sw-cache-time');
            if (cacheTime && isCacheExpired(cacheTime, CACHE_MAX_AGE.STATIC)) {
                console.log('[Service Worker] Cache expired for:', request.url);
                cachedResponse = null;
            } else {
                return cachedResponse;
            }
        }

        // Fallback to network
        const networkResponse = await fetch(request);

        // Cache successful responses in runtime cache
        if (networkResponse && networkResponse.status === 200) {
            const responseToCache = addCacheTimestamp(networkResponse.clone());
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, responseToCache);
        }

        return networkResponse;
    } catch (error) {
        console.error('[Service Worker] Cache first strategy failed:', error);

        // Try cache again as fallback
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        return getOfflinePage();
    }
}

/**
 * Network first strategy
 * @param {Request} request - Fetch request
 * @returns {Promise<Response>}
 */
async function networkFirstStrategy(request) {
    try {
        // Try network first
        const networkResponse = await fetch(request);

        // Cache successful responses
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        // Fallback to cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // If no cache, return offline page
        console.error('[Service Worker] Network first strategy failed:', error);
        return getOfflinePage();
    }
}

/**
 * Stale while revalidate strategy
 * @param {Request} request - Fetch request
 * @returns {Promise<Response>}
 */
async function staleWhileRevalidateStrategy(request) {
    const cache = await caches.open(CACHE_NAME);

    // Return cached version immediately
    const cachedResponse = await cache.match(request);

    // Update cache in background
    const networkPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    }).catch((error) => {
        console.error('[Service Worker] Background update failed:', error);
    });

    // Return cached response or wait for network
    return cachedResponse || networkPromise || getOfflinePage();
}

/**
 * Check if cache is expired
 * @param {string} cacheTimeHeader - Cache timestamp from header
 * @param {number} maxAge - Maximum age in seconds
 * @returns {boolean} True if expired
 */
function isCacheExpired(cacheTimeHeader, maxAge) {
    try {
        const cacheTime = parseInt(cacheTimeHeader, 10);
        const now = Date.now();
        const age = (now - cacheTime) / 1000; // Convert to seconds
        return age > maxAge;
    } catch (error) {
        // If we can't parse the time, consider it expired
        return true;
    }
}

/**
 * Add cache timestamp to response
 * @param {Response} response - Response to add timestamp to
 * @returns {Response} Response with timestamp header
 */
function addCacheTimestamp(response) {
    const headers = new Headers(response.headers);
    headers.append('sw-cache-time', Date.now().toString());

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: headers
    });
}

/**
 * Get offline page
 * @returns {Promise<Response>}
 */
async function getOfflinePage() {
    const cache = await caches.open(CACHE_NAME);
    const offlinePage = await cache.match('/offline.html');
    return offlinePage || new Response('Offline - Please check your connection', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers({
            'Content-Type': 'text/plain'
        })
    });
}

/**
 * Message event - handle commands from page
 */
self.addEventListener('message', (event) => {
    const { data } = event;

    switch (data.type) {
        case 'SKIP_WAITING':
            // Skip waiting and activate immediately
            self.skipWaiting();
            break;

        case 'CLAIM_CLIENTS':
            // Take control of all clients
            self.clients.claim();
            break;

        case 'CACHE_URLS':
            // Cache specific URLs
            if (data.urls && Array.isArray(data.urls)) {
                caches.open(CACHE_NAME).then((cache) => {
                    cache.addAll(data.urls);
                });
            }
            break;

        case 'CLEAR_CACHE':
            // Clear specific cache
            if (data.cacheName) {
                caches.delete(data.cacheName);
            }
            break;

        default:
            console.log('[Service Worker] Unknown message type:', data.type);
    }
});

/**
 * Sync event - background sync (future enhancement)
 */
self.addEventListener('sync', (event) => {
    console.log('[Service Worker] Sync event:', event.tag);

    if (event.tag === 'sync-data') {
        event.waitUntil(syncData());
    }
});

/**
 * Sync data with server (future enhancement)
 */
async function syncData() {
    try {
        // Implement sync logic here
        console.log('[Service Worker] Syncing data...');
    } catch (error) {
        console.error('[Service Worker] Sync failed:', error);
    }
}

/**
 * Push event - push notifications (future enhancement)
 */
self.addEventListener('push', (event) => {
    if (!event.data) return;

    const data = event.data.json();

    const options = {
        body: data.body || 'New update available',
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        vibrate: [200, 100, 200],
        data: data.data || {},
        actions: data.actions || []
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'Luminous Dynamics', options)
    );
});

/**
 * Notification click event
 */
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        clients.openWindow(event.notification.data.url || '/')
    );
});

console.log('[Service Worker] Loaded successfully');
