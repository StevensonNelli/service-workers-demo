// install is the first event. It only happens once
self.addEventListener("install", function (event) {
  console.log("install event", event);
  event.waitUntil(
    caches.open("v1").then(function (cache) {
      return cache.addAll([
        // list of all static assets that the service worker needs to cache
      ]);
    })
  );
});

// take control of non-controlled pages to listen to fetch events even if the page is not loaded through the service worker
self.addEventListener("activate", () => self.clients.claim());

// Add fetch event and interrupt HTTPS calls
self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      // caches.match() always resolves
      // but in case of success response will have value
      if (response !== undefined) {
        return response;
      } else {
        return fetch(event.request)
          .then(function (response) {
            console.log("fetch event");
            // response may be used only once
            // we need to save clone to put one copy in cache
            // and serve second one
            let responseClone = response.clone();

            caches.open("v1").then(function (cache) {
              console.log("event.request", event.request);
              cache.put(event.request, responseClone);
            });
            return response;
          })
          .catch(function (error) {
            console.error(error);
          });
      }
    })
  );
});
