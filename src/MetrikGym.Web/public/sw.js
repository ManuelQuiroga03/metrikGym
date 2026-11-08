// Service Worker de MetrikGym para soporte offline y notificaciones en pantalla bloqueada
const CACHE_NAME = 'metrikgym-v3';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Listener de Fetch para cumplir el criterio de instalación PWA de Google Chrome
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

// Timer activo en Service Worker para evitar congelamiento de descansos
let restAlertTimerId = null;

// Manejo de mensajes desde la app (programar alerta de descanso en segundo plano)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_REST_ALERT') {
    const { delaySeconds, exerciseName, nextSetNumber } = event.data;
    
    if (restAlertTimerId) {
      clearTimeout(restAlertTimerId);
      restAlertTimerId = null;
    }

    const delayMs = Math.max(1, (delaySeconds || 1) * 1000);
    
    // Programar la alerta nativa en segundo plano
    restAlertTimerId = setTimeout(() => {
      const title = '⚡ ¡Descanso Terminado!';
      const body = exerciseName 
        ? `Es momento de realizar la Serie #${nextSetNumber || ''} de ${exerciseName}. ¡A darle!`
        : 'Tu tiempo de recuperación ha finalizado. Regresa a tu entrenamiento.';

      self.registration.showNotification(title, {
        body,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: 'rest-timer-alert',
        renotify: true,
        requireInteraction: true,
        silent: false,
        vibrate: [500, 250, 500, 250, 800, 300, 1000],
        timestamp: Date.now(),
        actions: [
          { action: 'open', title: 'Abrir MetrikGym' }
        ],
        data: {
          url: '/'
        }
      });
      restAlertTimerId = null;
    }, delayMs);
  } else if (event.data && event.data.type === 'CANCEL_REST_ALERT') {
    if (restAlertTimerId) {
      clearTimeout(restAlertTimerId);
      restAlertTimerId = null;
    }
  }
});

// Al pulsar sobre la notificación en la pantalla de bloqueo
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});
