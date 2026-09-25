const CACHE_NAME = "devins-house-v36";
// Pre-cache only lightweight app shell for instantaneous page launch (< 500KB)
const CORE_APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",
  "./app_icon.jpg",
  "./icon-512.png",
  "./entrance_layout_plan.svg"
];

// Install Event: Fast pre-caching of app shell only
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Devin's House SW] Caching ultra-fast core app shell");
      return cache.addAll(CORE_APP_SHELL);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Clean up old caches immediately and claim clients
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[Devin's House SW] Removing old cache", key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Network-First for HTML/JS/CSS (auto-refresh online), Cache-First for static media
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  // Ignore non-http/https requests (e.g., chrome-extension://, moz-extension://, blob:, data:)
  if (!url.protocol.startsWith("http")) return;

  const isCode = url.pathname.endsWith(".html") || 
                 url.pathname.endsWith(".js") || 
                 url.pathname.endsWith(".css") || 
                 url.pathname.endsWith("/") ||
                 event.request.mode === "navigate";

  if (isCode) {
    // Network-First: fetch latest code when online, seamlessly fall back to cache when offline
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => cache.put(event.request, responseClone))
              .catch(() => {});
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match("./index.html")))
    );
  } else {
    // Cache-First for images & heavy assets for instantaneous load
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then((cache) => cache.put(event.request, responseToCache))
            .catch(() => {});
          return networkResponse;
        });
      })
    );
  }
});
