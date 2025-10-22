const CACHE_NAME = 'viveiro-andura-cache-v1';
const urlsToCache = [
  '/',
  '/login',
  '/manifest.json',
  '/favicon.ico',
  // Adicione aqui outros assets estáticos que você queira cachear
  // Ex: '/styles/globals.css', '/icons/icon-192x192.png'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Ativação do Service Worker e limpeza de caches antigos
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});


// Intercepta as requisições de rede
self.addEventListener('fetch', (event) => {
    // Apenas para requisições GET
    if (event.request.method !== 'GET') {
        return;
    }

    // Estratégia: Network falling back to cache
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Se a resposta da rede for bem-sucedida, clonamos e armazenamos no cache
                if (response && response.status === 200) {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                }
                return response;
            })
            .catch(() => {
                // Se a rede falhar, tentamos pegar do cache
                return caches.match(event.request);
            })
    );
});
