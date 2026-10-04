/*
 * 尋光之旅 — 離線支援
 * 有網絡時先取最新檔案（3 秒內無回應便用快取），所以更新圖片或設定後重新開啟即可看到。
 * 新增檔案時，請一併加進 FILES，並把 CACHE 版本號加一。
 */
const CACHE = 'xgzl-v2';
const FILES = [
  './',
  'index.html',
  'css/style.css',
  'js/config.js',
  'js/core.js',
  'js/app.js',
  'manifest.webmanifest',
  'fonts/serif-600.woff2',
  'fonts/serif-900.woff2',
  'icons/icon-180.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'assets/bg-home.svg',
  'assets/bg-level1.svg',
  'assets/bg-level2.svg',
  'assets/bg-level3.svg',
  'assets/board.svg',
  'assets/exit.svg',
  'assets/lamb.svg',
  'assets/tree.svg',
  'assets/log.svg',
  'assets/palm.svg',
  'assets/cart.svg',
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(value => { clearTimeout(timer); resolve(value); }, err => { clearTimeout(timer); reject(err); });
  });
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await withTimeout(fetch(request), 3000);
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  } catch (err) {
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    if (request.mode === 'navigate') {
      const page = await cache.match('index.html');
      if (page) return page;
    }
    throw err;
  }
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin === self.location.origin) event.respondWith(networkFirst(request));
});
