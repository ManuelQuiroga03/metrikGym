// Service Worker de MetrikGym para soporte offline y notificaciones en pantalla bloqueada
const CACHE_NAME = 'metrikgym-v1';

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

// Manejo de evento Push nativo (cuando llega por push del servidor)
self.addEventListener('push', (event) => {
  let data = {
    title: '⚡ ¡Tiempo de descanso terminado!',
    body: 'Tu tiempo de recuperación ha finalizado. Regresa a tu entrenamiento.',
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: 'rest-timer-alert',
    renotify: true,
    requireInteraction: true,
    silent: false,
    vibrate: [300, 150, 300, 150, 400],
    actions: [
      { action: 'open', title: 'Abrir MetrikGym' }
    ],
    data: {
      url: '/'
    }
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Manejo de mensajes desde la app (ej. programar notificación de descanso en segundo plano)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_REST_ALERT') {
    const { delaySeconds, exerciseName, nextSetNumber } = event.data;
    
    // Programar la alerta nativa en segundo plano
    setTimeout(() => {
      const title = '⚡ ¡Tiempo de descanso terminado!';
      const body = exerciseName 
        ? `Es momento de realizar la Serie #${nextSetNumber || ''} de ${exerciseName}. ¡A darle!`
        : 'Tu tiempo de recuperación ha finalizado. Regresa a tu entrenamiento.';

      self.registration.showNotification(title, {
        body,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        tag: 'rest-timer-alert',
        renotify: true,
        requireInteraction: true,
        silent: false,
        vibrate: [300, 150, 300, 150, 400],
        actions: [
          { action: 'open', title: 'Abrir MetrikGym' }
        ],
        data: {
          url: '/'
        }
      });
    }, (delaySeconds || 1) * 1000);
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
