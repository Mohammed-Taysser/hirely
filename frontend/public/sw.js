// Service Worker for Push Notifications

const CACHE_NAME = 'hirely-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(self.clients.claim());
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  let notificationData = {
    title: 'Hirely Notification',
    body: 'You have a new notification',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: {},
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        ...notificationData,
        ...data,
      };
    } catch (e) {
      notificationData.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      data: notificationData.data,
      vibrate: [200, 100, 200],
      actions: [
        { action: 'view', title: 'View' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    })
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.notification.tag);
  event.notification.close();

  const data = event.notification.data || {};
  let targetUrl = '/';

  // Route based on notification type
  switch (data.type) {
    case 'points-expiry':
      targetUrl = '/my-points';
      break;
    case 'referral-conversion':
      targetUrl = '/referrals';
      break;
    case 'milestone':
      targetUrl = '/my-points';
      break;
    default:
      targetUrl = '/dashboard';
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Background sync event (for offline support)
self.addEventListener('sync', (event) => {
  console.log('Background sync:', event.tag);
  
  if (event.tag === 'sync-notifications') {
    event.waitUntil(
      // Handle background sync for notifications
      Promise.resolve()
    );
  }
});
