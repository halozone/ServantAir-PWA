// ServantAir PWA - Service Worker
// Version 1.0.0

const CACHE_VERSION = 'servantair-v1.0.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const DATA_CACHE = `${CACHE_VERSION}-data`;

// Files to cache immediately on install
const STATIC_FILES = [
    '/',
    '/dashboard.html',
    '/calendar/index.html',
    '/aircraft.html',
    '/profile.html',
    '/membership.html',
    '/messages.html',
    '/payments.html',
    '/settings.html',
    '/load-navigation.js',
    '/calendar/assets/css/main.css',
    '/calendar/assets/css/components.css',
    '/calendar/assets/css/calendar.css',
    '/calendar/assets/css/filtering.css',
    '/calendar/assets/css/bookings.css',
    '/calendar/assets/css/responsive.css',
    '/calendar/assets/js/utilities.js',
    '/calendar/assets/js/state.js',
    '/calendar/assets/js/complete.js',
    '/offline.html'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
    console.log('[ServiceWorker] Installing...');
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            console.log('[ServiceWorker] Caching static files');
            return cache.addAll(STATIC_FILES.map(url => new Request(url, {cache: 'reload'})));
        }).then(() => {
            console.log('[ServiceWorker] Installation complete, skipping waiting');
            return self.skipWaiting();
        }).catch((error) => {
            console.error('[ServiceWorker] Installation failed:', error);
        })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[ServiceWorker] Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== STATIC_CACHE &&
                        cacheName !== DYNAMIC_CACHE &&
                        cacheName !== DATA_CACHE) {
                        console.log('[ServiceWorker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[ServiceWorker] Activation complete, claiming clients');
            return self.clients.claim();
        })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        return;
    }

    // API requests - Network first, cache fallback
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Clone response and cache it
                    const responseClone = response.clone();
                    caches.open(DATA_CACHE).then((cache) => {
                        cache.put(request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    // If network fails, try cache
                    return caches.match(request);
                })
        );
        return;
    }

    // Static files - Cache first, network fallback
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            // Not in cache, fetch from network
            return fetch(request).then((response) => {
                // Don't cache non-successful responses
                if (!response || response.status !== 200 || response.type === 'error') {
                    return response;
                }

                // Clone and cache the response
                const responseClone = response.clone();
                caches.open(DYNAMIC_CACHE).then((cache) => {
                    cache.put(request, responseClone);
                });

                return response;
            }).catch(() => {
                // Network failed, show offline page
                if (request.destination === 'document') {
                    return caches.match('/offline.html');
                }
            });
        })
    );
});

// Background Sync - Queue failed requests
self.addEventListener('sync', (event) => {
    console.log('[ServiceWorker] Background sync event:', event.tag);

    if (event.tag === 'sync-bookings') {
        event.waitUntil(syncBookings());
    }

    if (event.tag === 'sync-notifications') {
        event.waitUntil(checkNotifications());
    }
});

// Push Notification event
self.addEventListener('push', (event) => {
    console.log('[ServiceWorker] Push notification received');

    let data = {};
    if (event.data) {
        data = event.data.json();
    }

    const title = data.title || 'ServantAir Notification';
    const options = {
        body: data.body || 'You have a new notification',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        vibrate: [200, 100, 200],
        data: {
            url: data.url || '/dashboard.html',
            dateOfArrival: Date.now(),
            primaryKey: data.id || 1
        },
        actions: [
            {
                action: 'view',
                title: 'View',
                icon: '/icons/view-icon.png'
            },
            {
                action: 'dismiss',
                title: 'Dismiss',
                icon: '/icons/dismiss-icon.png'
            }
        ],
        requireInteraction: data.requireInteraction || false,
        silent: false,
        tag: data.tag || 'general'
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    console.log('[ServiceWorker] Notification clicked');

    event.notification.close();

    if (event.action === 'view') {
        const urlToOpen = event.notification.data.url;
        event.waitUntil(
            clients.matchAll({ type: 'window', includeUncontrolled: true })
                .then((clientList) => {
                    // Check if there's already a window open
                    for (let i = 0; i < clientList.length; i++) {
                        const client = clientList[i];
                        if (client.url === urlToOpen && 'focus' in client) {
                            return client.focus();
                        }
                    }
                    // Open new window if none exists
                    if (clients.openWindow) {
                        return clients.openWindow(urlToOpen);
                    }
                })
        );
    }
});

// Helper function to sync bookings
async function syncBookings() {
    console.log('[ServiceWorker] Syncing bookings...');

    // Get pending bookings from IndexedDB
    const db = await openDB();
    const pendingBookings = await db.getAll('pending-bookings');

    for (const booking of pendingBookings) {
        try {
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(booking)
            });

            if (response.ok) {
                // Remove from pending queue
                await db.delete('pending-bookings', booking.id);
                console.log('[ServiceWorker] Booking synced:', booking.id);
            }
        } catch (error) {
            console.error('[ServiceWorker] Failed to sync booking:', error);
        }
    }
}

// Helper function to check for notifications
async function checkNotifications() {
    console.log('[ServiceWorker] Checking for notifications...');

    try {
        const response = await fetch('/api/notifications/pending');
        const notifications = await response.json();

        for (const notification of notifications) {
            await self.registration.showNotification(notification.title, {
                body: notification.body,
                icon: '/icons/icon-192x192.png',
                data: notification.data
            });
        }
    } catch (error) {
        console.error('[ServiceWorker] Failed to check notifications:', error);
    }
}

// Helper function to open IndexedDB
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('servantair-db', 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('pending-bookings')) {
                db.createObjectStore('pending-bookings', { keyPath: 'id', autoIncrement: true });
            }
        };
    });
}

// Periodic Background Sync (experimental)
self.addEventListener('periodicsync', (event) => {
    console.log('[ServiceWorker] Periodic sync event:', event.tag);

    if (event.tag === 'check-currency') {
        event.waitUntil(checkPilotCurrency());
    }

    if (event.tag === 'check-maintenance') {
        event.waitUntil(checkAircraftMaintenance());
    }
});

// Helper function to check pilot currency
async function checkPilotCurrency() {
    console.log('[ServiceWorker] Checking pilot currency...');
    // This would fetch from API and show notifications for expiring currency
}

// Helper function to check aircraft maintenance
async function checkAircraftMaintenance() {
    console.log('[ServiceWorker] Checking aircraft maintenance...');
    // This would fetch from API and show notifications for upcoming maintenance
}

// Message event - handle messages from clients
self.addEventListener('message', (event) => {
    console.log('[ServiceWorker] Message received:', event.data);

    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data.type === 'CACHE_URLS') {
        caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.addAll(event.data.urls);
        });
    }

    if (event.data.type === 'CLEAR_CACHE') {
        caches.delete(DYNAMIC_CACHE);
        caches.delete(DATA_CACHE);
    }
});

console.log('[ServiceWorker] Script loaded');
