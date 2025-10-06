// This is a basic service worker to make the app installable.
self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
});

self.addEventListener('fetch', (event) => {
  // We are not adding any offline caching for now.
  // This is just to make the app installable.
  event.respondWith(fetch(event.request));
});
