// Utilidad para notificaciones nativas en pantalla bloqueada mediante Service Worker
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('Este dispositivo no soporta notificaciones de sistema.');
    return 'denied';
  }

  const permission = await Notification.requestPermission();
  return permission;
}

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

export async function scheduleRestNotification(options: {
  delaySeconds: number;
  exerciseName?: string;
  nextSetNumber?: number;
}) {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return;
  }

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg.active) {
        reg.active.postMessage({
          type: 'SCHEDULE_REST_ALERT',
          delaySeconds: options.delaySeconds,
          exerciseName: options.exerciseName,
          nextSetNumber: options.nextSetNumber,
        });
        return;
      }
    }

    // Fallback: Si el SW aún no está activo, usar setTimeout directo si sigue abierto
    setTimeout(() => {
      new Notification('⚡ ¡Tiempo de descanso terminado!', {
        body: options.exerciseName
          ? `Es hora de la Serie #${options.nextSetNumber || ''} de ${options.exerciseName}.`
          : 'Tu descanso ha finalizado. Regresa a tu entrenamiento.',
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
      });
    }, options.delaySeconds * 1000);
  } catch (err) {
    console.warn('No se pudo programar la notificación de descanso:', err);
  }
}

export function sendImmediateTestNotification() {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return;
  }

  try {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification('⚡ MetrikGym: Alerta de Prueba', {
          body: '¡Excelente! Las notificaciones en pantalla bloqueada están funcionando al 100%.',
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
        } as any);
      });
    } else {
      new Notification('⚡ MetrikGym: Alerta de Prueba', {
        body: '¡Excelente! Las notificaciones están activadas correctamente.',
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
      });
    }
  } catch (err) {
    console.warn('Error al disparar notificación de prueba:', err);
  }
}
