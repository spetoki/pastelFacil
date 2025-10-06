// Service worker file
self.addEventListener('fetch', event => {
  // We are not caching anything in this simple service worker
  // This file is just to make the app installable
  event.respondWith(fetch(event.request));
});
