var CACHE_NAME = "qai-cache";
var urlsToCache = ["/"];

// Install a service worker
self.addEventListener("install", (event) => {
  console.log("installing...");
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      console.log("Opened cache");
      caches.delete(CACHE_NAME);
      return cache.addAll(urlsToCache);
    })
  );
});

// Cache and return requests
self.addEventListener("fetch", (event) => {
  // Check if this is a request for an image
  const cachables = ["image", "font", "style", "script"];
  if (
    cachables.includes(event.request.destination) &&
    event.request.url.startsWith("http")
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        // Go to the cache first
        return cache.match(event.request.url).then((cachedResponse) => {
          // Return a cached response if we have one
          if (cachedResponse) {
            return cachedResponse;
          }

          // Otherwise, hit the network
          return fetch(event.request).then((fetchedResponse) => {
            // Add the network response to the cache for later visits
            cache.put(event.request, fetchedResponse.clone());

            // Return the network response
            return fetchedResponse;
          });
        });
      })
    );
  } else {
    return;
  }
});

// Update a service worker
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});
