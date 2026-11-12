/**
 * Boim Progressive Web App Service Worker
 * Version: 1.0.0
 */

const CACHE_NAME = 'boim-static-v1';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg',
];

// 1. Install Event: 정적 리소스 사전 캐싱
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

// 2. Activate Event: 구버전 캐시 정리 및 클라이언트 즉시 제어
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              return caches.delete(name);
            }
            return null;
          }),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// 3. Fetch Event: 캐싱 전략 분기
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Chrome extensions 등 비HTTP(S) 요청 무시
  if (!event.request.url.startsWith('http')) {
    return;
  }

  // 백엔드 API 요청 (/api/): Network-First 전략
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // 오프라인 상태일 때 표준 응답 포맷
        return new Response(
          JSON.stringify({
            success: false,
            error: {
              code: 'OFFLINE_MODE',
              message: '현재 네트워크에 연결되어 있지 않습니다. (오프라인 모드)',
            },
          }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
          },
        );
      }),
    );
    return;
  }

  // 정적 리소스 (HTML, JS, CSS, 이미지 등): Stale-While-Revalidate 전략
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === 'basic'
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // 네트워크 실패 시 HTML 네비게이션 요청이면 index.html 반환
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return null;
        });

      return cachedResponse || fetchPromise;
    }),
  );
});
