self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install');
});
self.addEventListener('fetch', (e) => {
  // ここでキャッシュ戦略などを書きますが、まずは空でもアプリ化条件は満たします
});