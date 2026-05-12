/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { precache, matchPrecache, cleanupOutdatedCaches } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision: string | null } | string>
}

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(clientsClaim()))
cleanupOutdatedCaches()

// VitePWA injects the asset manifest here at build time
precache(self.__WB_MANIFEST)

// Inject COOP/COEP headers on every response so the browser enables cross-origin
// isolation — required for SharedArrayBuffer, which Stockfish WASM depends on.
// GitHub Pages can't set HTTP headers, so the service worker does it instead.
self.addEventListener('fetch', (event) => {
  if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin') return

  event.respondWith(
    (async () => {
      try {
        // Serve from precache when available, otherwise hit the network
        const cached = await matchPrecache(event.request)
        const response = cached ?? (await fetch(event.request))

        const headers = new Headers(response.headers)
        headers.set('Cross-Origin-Opener-Policy', 'same-origin')
        headers.set('Cross-Origin-Embedder-Policy', 'require-corp')

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        })
      } catch {
        return fetch(event.request)
      }
    })()
  )
})
