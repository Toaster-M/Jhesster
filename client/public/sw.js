/**
 * Jhesster Chess — Service Worker
 *
 * Strategy:
 *  - Precache the app shell and Stockfish on install
 *  - Cache-first for all same-origin GET requests
 *  - Network-first for /api/** so backend calls never return stale data
 *  - Serve cached index.html for navigation requests (SPA offline support)
 */

const CACHE  = 'jhesster-v1';
const STATIC = [
  '/',
  '/manifest.json',
  '/icon.svg',
  '/favicon.svg',
  '/stockfish.js',
  '/stockfish.wasm',
];

// ── Install: precache known static files ──────────────────────────────────────
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => {
      // addAll fails if any request fails; stockfish.wasm is large so we
      // cache individually and ignore individual failures.
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

  // Only handle same-origin GET requests
  if (request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;

  // Network-first for API routes — never serve stale API data
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(networkFirst(request));
    return;
  }

  // For HTML navigation requests (SPA routes) — serve cached index.html offline
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request).catch(() => caches.match('/'))
    );
    return;
  }

  // Cache-first for everything else (JS, CSS, images, WASM)
  e.respondWith(cacheFirst(request));
});

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
    // Asset not cached and network unavailable — return a minimal offline response
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
