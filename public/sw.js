const CACHE_NAME = 'late-nola-static-v1'
const PRECACHE_URLS = [
  '/offline.html',
  '/favicon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-512.png',
  '/apple-touch-icon.png',
  '/manifest.webmanifest',
]

const STATIC_EXTENSIONS = [
  '.css',
  '.js',
  '.mjs',
  '.svg',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.woff',
  '.woff2',
]

function isSameOrigin(url) {
  return url.origin === self.location.origin
}

function isStaticAsset(url) {
  return isSameOrigin(url)
    && (url.pathname.startsWith('/assets/') || STATIC_EXTENSIONS.some(ext => url.pathname.endsWith(ext)))
}

function isCacheableRequest(request) {
  if (request.method !== 'GET') return false
  if (request.headers.has('authorization')) return false
  if (request.headers.has('x-client-info')) return false
  return isStaticAsset(new URL(request.url))
}

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  if (!isSameOrigin(url) || request.method !== 'GET') return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match('/offline.html')),
    )
    return
  }

  if (!isCacheableRequest(request)) return

  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse

      return fetch(request).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') return response
        const responseClone = response.clone()
        caches.open(CACHE_NAME).then(cache => cache.put(request, responseClone))
        return response
      })
    }),
  )
})
