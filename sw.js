const CACHE_NAME = 'tecsycom-tracking-v1';
const URLS_TO_CACHE = [
  '/tecsycom/tracking.html',
  '/tecsycom/manifest.json'
];

// Instalar y cachear archivos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting();
});

// Activar y limpiar caches viejos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Responder con cache cuando está offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

// Background sync — mantener GPS activo
self.addEventListener('sync', event => {
  if (event.tag === 'gps-sync') {
    event.waitUntil(syncGPS());
  }
});

async function syncGPS() {
  // Notificar a todos los clientes para que envíen posición
  const clients = await self.clients.matchAll();
  clients.forEach(client => client.postMessage({ type: 'REQUEST_GPS' }));
}
