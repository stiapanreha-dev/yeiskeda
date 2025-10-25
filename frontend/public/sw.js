// Service Worker для PWA "Спаси Еду!"
// Версия: 1.0.0

const CACHE_VERSION = 'spasi-edu-v1';
const CACHE_NAME = `${CACHE_VERSION}-static`;
const DATA_CACHE_NAME = `${CACHE_VERSION}-data`;
const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 дней

// Файлы для кеширования при установке
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/logo.png'
];

// Установка Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...', CACHE_VERSION);

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_CACHE_URLS);
    }).then(() => {
      // Активировать новый SW сразу
      return self.skipWaiting();
    })
  );
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...', CACHE_VERSION);

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Удаляем старые кеши
          if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Берём контроль над всеми клиентами
      return self.clients.claim();
    })
  );
});

// Обработка запросов
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Пропускаем chrome-extension и другие протоколы
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // API запросы - Network First (всегда пытаемся получить свежие данные)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Изображения продуктов - Stale While Revalidate
  if (url.pathname.startsWith('/uploads/')) {
    event.respondWith(staleWhileRevalidateStrategy(request));
    return;
  }

  // Yandex Maps API - Network First (карты должны быть свежими)
  if (url.hostname.includes('yandex') || url.hostname.includes('api-maps')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Статические файлы (JS, CSS, шрифты) - Cache First
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font' ||
    url.pathname.match(/\.(js|css|woff|woff2|ttf|eot)$/)
  ) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // HTML страницы - Network First
  if (request.destination === 'document' || request.mode === 'navigate') {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Остальное - Network First
  event.respondWith(networkFirstStrategy(request));
});

// Стратегия: Cache First (сначала кеш, потом сеть)
async function cacheFirstStrategy(request) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);

    if (cached) {
      // Возвращаем из кеша
      return cached;
    }

    // Если нет в кеше - запрашиваем из сети
    const response = await fetch(request);

    // Кешируем только успешные GET запросы
    if (response.ok && request.method === 'GET') {
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error('[SW] Cache First failed:', error);

    // Если сеть недоступна - пытаемся вернуть из кеша
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    // Возвращаем offline страницу для навигации
    if (request.mode === 'navigate') {
      return caches.match('/');
    }

    throw error;
  }
}

// Стратегия: Network First (сначала сеть, потом кеш)
async function networkFirstStrategy(request) {
  try {
    const response = await fetch(request);

    // Кешируем успешные GET запросы
    if (response.ok && request.method === 'GET') {
      const cache = await caches.open(DATA_CACHE_NAME);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);

    // Если сеть недоступна - возвращаем из кеша
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    // Для навигации возвращаем главную страницу
    if (request.mode === 'navigate') {
      const indexCache = await caches.match('/');
      if (indexCache) {
        return indexCache;
      }
    }

    throw error;
  }
}

// Стратегия: Stale While Revalidate (показываем кеш, обновляем фоном)
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(DATA_CACHE_NAME);
  const cached = await cache.match(request);

  // Запрос в сеть (не ждём результата)
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => {
    // Игнорируем ошибки сети
  });

  // Возвращаем кеш сразу, если есть
  if (cached) {
    return cached;
  }

  // Если кеша нет - ждём сеть
  return fetchPromise;
}

// Очистка старого кеша (вызывается периодически)
async function cleanupCache() {
  const caches_list = await caches.keys();

  for (const cacheName of caches_list) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();

    for (const request of requests) {
      const response = await cache.match(request);
      const date = new Date(response.headers.get('date'));
      const age = Date.now() - date.getTime();

      // Удаляем файлы старше 7 дней
      if (age > MAX_CACHE_AGE) {
        console.log('[SW] Deleting old cache entry:', request.url);
        await cache.delete(request);
      }
    }
  }
}

// Периодическая очистка кеша
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEANUP_CACHE') {
    cleanupCache();
  }

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[SW] Service Worker loaded:', CACHE_VERSION);
