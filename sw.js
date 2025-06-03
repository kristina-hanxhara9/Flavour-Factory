// Service Worker for Bakery Scanner PWA
const CACHE_NAME = 'bakery-scanner-v1.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/ml-engine.js',
    '/camera-handler.js',
    '/bulk-trainer.js',
    '/analytics.js',
    '/manifest.json',
    // External CDNs
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js',
    'https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@latest/dist/mobilenet.min.js',
    'https://cdn.jsdelivr.net/npm/chart.js@latest/dist/chart.umd.min.js'
];

// Install event - cache assets
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching app shell');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('Service Worker: All resources cached');
                return self.skipWaiting();
            })
            .catch(err => {
                console.error('Service Worker: Cache failed', err);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Claiming clients');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Skip chrome extension requests
    if (event.request.url.includes('chrome-extension://')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    console.log('Service Worker: Serving from cache', event.request.url);
                    return response;
                }
                
                // Clone the request
                const fetchRequest = event.request.clone();
                
                return fetch(fetchRequest)
                    .then(response => {
                        // Check if valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clone the response
                        const responseToCache = response.clone();
                        
                        // Cache the fetched response for future
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                // Only cache same-origin and CORS-enabled resources
                                if (event.request.url.startsWith(self.location.origin) || 
                                    event.request.url.includes('cdn.jsdelivr.net') ||
                                    event.request.url.includes('fonts.googleapis.com')) {
                                    cache.put(event.request, responseToCache);
                                }
                            });
                        
                        return response;
                    })
                    .catch(err => {
                        console.error('Service Worker: Fetch failed', err);
                        
                        // Offline fallback for HTML pages
                        if (event.request.destination === 'document') {
                            return caches.match('/index.html');
                        }
                        
                        // Return offline page or placeholder
                        return new Response('Offline - Content not available', {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: new Headers({
                                'Content-Type': 'text/plain'
                            })
                        });
                    });
            })
    );
});

// Background sync for offline actions
self.addEventListener('sync', event => {
    console.log('Service Worker: Sync event', event.tag);
    
    if (event.tag === 'sync-sales') {
        event.waitUntil(syncSalesData());
    }
});

// Push notifications
self.addEventListener('push', event => {
    console.log('Service Worker: Push event');
    
    const options = {
        body: event.data ? event.data.text() : 'Njoftim i ri nga Skaneri i Furrës',
        icon: '/assets/icon-192x192.png',
        badge: '/assets/icon-72x72.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Hap aplikacionin',
                icon: '/assets/icon-72x72.png'
            },
            {
                action: 'close',
                title: 'Mbyll',
                icon: '/assets/icon-72x72.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Skaneri i Furrës', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
    console.log('Service Worker: Notification click');
    
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Message handler for client communication
self.addEventListener('message', event => {
    console.log('Service Worker: Message received', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
            })
        );
    }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', event => {
    if (event.tag === 'update-products') {
        event.waitUntil(updateProductData());
    }
});

// Helper functions
async function syncSalesData() {
    try {
        // Get sales data from IndexedDB
        const db = await openDatabase('BakerySales');
        const unsyncedSales = await getUnsyncedSales(db);
        
        if (unsyncedSales.length > 0) {
            // Sync with server (when online)
            console.log('Syncing', unsyncedSales.length, 'sales records');
            // In real app, would POST to server
        }
    } catch (error) {
        console.error('Sync failed:', error);
    }
}

async function updateProductData() {
    try {
        console.log('Checking for product updates...');
        // In real app, would check server for updates
    } catch (error) {
        console.error('Update check failed:', error);
    }
}

function openDatabase(name) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(name, 1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function getUnsyncedSales(db) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['sales'], 'readonly');
        const store = transaction.objectStore('sales');
        const request = store.getAll();
        
        request.onsuccess = () => {
            const sales = request.result.filter(sale => !sale.synced);
            resolve(sales);
        };
        request.onerror = () => reject(request.error);
    });
}

// Cache versioning and update notification
self.addEventListener('message', event => {
    if (event.data.action === 'UPDATE_FOUND') {
        // Notify all clients about the update
        self.clients.matchAll().then(clients => {
            clients.forEach(client => {
                client.postMessage({
                    type: 'UPDATE_AVAILABLE',
                    version: CACHE_NAME
                });
            });
        });
    }
});