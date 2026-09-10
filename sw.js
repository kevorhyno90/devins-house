const CACHE_NAME = "devins-house-v3";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",
  "./app_icon.jpg",
  "./icon-512.png",
  "./house_kangaroo_cutaway.jpg",
  "./house_kangaroo_exterior.jpg",
  "./house_master_wardrobe.jpg",
  "./house_kitchen_full.jpg",
  "./house_slab_kitchen.jpg",
  "./house_8x5_compact.jpg",
  "./house_8x5_custom.jpg",
  "./house_kids_lower.jpg",
  "./house_3d_exterior.jpg",
  "./house_3d_interior.jpg",
  "./smart_architectural_layout.jpg",
  "./hidden_roof_integrated_beds.jpg",
  "./exact_40sqm_dimensions.jpg",
  "./master_wardrobe_lighting_render.jpg",
  "./masonry_pillars_mezzanine.jpg",
  "./four_pillar_metal_timber.jpg",
  "./interior_staircase_mezzanine.jpg",
  "./compact_20sqm_private_kids.jpg",
  "./seating_suite_complete_cutaway.jpg",
  "./metal_timber_master_cutaway.jpg",
  "./timber_slab_construction_guide.jpg"
];

// Install Event: Pre-cache all core assets and images
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Devin's House SW] Caching app shell and offline assets");
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Clean up old caches
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

// Fetch Event: Cache First, Network Fallback
self.addEventListener("fetch", (event) => {
  // Ignore non-GET or cross-origin calls (e.g. google fonts/apis)
  if (event.request.method !== "GET") return;

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
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        // Offline fallback for navigations
        if (event.request.mode === "navigate") {
          return caches.match("./index.html");
        }
      });
    })
  );
});
