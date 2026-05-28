// Custom service worker additions — merged by next-pwa
// Handles push notifications and background sync

self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'OpportunityIQ', {
      body: data.body || 'You have new job opportunities waiting!',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: data.tag || 'oiq-notification',
      renotify: true,
      data: { url: data.url || '/dashboard' },
      actions: [
        { action: 'view', title: 'View Now' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  const url = event.notification.data?.url || '/dashboard';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

// Background sync for offline job saves
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-bookmarks') {
    event.waitUntil(syncBookmarks());
  }
});

async function syncBookmarks() {
  try {
    const cache = await caches.open('oiq-offline-queue');
    const requests = await cache.keys();
    for (const request of requests) {
      try {
        await fetch(request);
        await cache.delete(request);
      } catch (e) {
        // Will retry on next sync
      }
    }
  } catch (e) {
    console.log('Background sync failed:', e);
  }
}
