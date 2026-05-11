/**
 * Jhesster Chess — Service Worker
 *
 * - Precaches app shell and Stockfish on install
 * - Injects COOP/COEP headers on every response so SharedArrayBuffer is
 *   available for the Stockfish WASM engine (required on GitHub Pages)
 * - Cache-first for static assets, network-first for /api/**
 * - Serves cached index.html for offline SPA navigation
 */

const CACHE  = 'jhesster-v2';
const STATIC = [
  './',
  './manifest.json',
  './icon.svg',
  './favicon.svg',
  './stockfish.js',
  './stockfish.wasm',
];

// ── Install: precache known static files ──────────────────────────────────────
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => {
      return Promise.allSettled(
        STATIC.map((url) => cache.add(url).catch(() => {})),
      );
    }).then(() => self.skipWaiting())
  );
});

// ── Activate: delete stale caches ────────────────────────────────────────────
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith('/api/')) {
    e.respondWith(networkFirst(request).then(withCoiHeaders));
    return;
  }

  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request)
        .then(withCoiHeaders)
        .catch(() => caches.match('./').then((r) => r ? withCoiHeaders(r) : undefined))
    );
    return;
  }

  e.respondWith(cacheFirst(request).then(withCoiHeaders));
});

// Wraps a response with COOP/COEP headers so SharedArrayBuffer is available.
// Skips opaque (cross-origin no-cors) responses whose body cannot be read.
function withCoiHeaders(response) {
  if (!response || response.type === 'opaque') return response;
  const headers = new Headers(response.headers);
  headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('', { status: 503, statusText: 'Offline' });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached ?? new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
