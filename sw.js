const CACHE_NAME = 'travel-dash-v3'; // ← バージョンを上げて更新を検知させる
const ASSETS = [
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // GASとの通信はService Workerを経由させない
  if (e.request.url.includes('script.google.com')) {
    return;
  }

  const isAppShell = e.request.mode === 'navigate' ||
                      e.request.url.endsWith('/index.html') ||
                      e.request.url.endsWith('/');

  if (isAppShell) {
    // アプリ本体（index.html）はネットワーク優先：
    // 常に最新版を取りに行き、オフライン時だけキャッシュにフォールバックする
    e.respondWith(
      fetch(e.request)
        .then((networkResponse) => {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
          return networkResponse;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // それ以外の静的ファイルはキャッシュ優先（従来通り）
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});