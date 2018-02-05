// Update this whenever cached files change
const cache = "v1"

const cacheFiles = [
  "/",
  "/index.html",
  "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.css",
  "https://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.js",
  "https://unpkg.com/dexie@latest/dist/dexie.js",
  "/app.js",
  "/sw.js",
]

self.addEventListener("install", event => {
  console.log("[ServiceWorker] Installed")

  event.waitUntil(
    caches.open(cache)
      .then(cache => {
        console.log("[ServiceWorker] Caching files")
        cache.addAll(cacheFiles)
      })
  )
})

self.addEventListener("fetch", event => {
  console.log("fetch", event.request.url)
  if (event.request.url.match(/api\/contacts/)) {
    if (navigator.onLine) {
      console.log("post as normal")
    } else {
      console.log("save to indexed db")
    }
  } else {
    console.log("[ServiceWorker] Fetching from " + (navigator.onLine ? "network" : "cache"), event.request.url)

    event.respondWith(
      navigator.onLine ?
        fetch(event.request) :
        caches.match(event.request).then(function (response) {
          return response
        })
    )
  }
})

// Remove old caches
self.addEventListener("activate", function (event) {
  console.log("[ServiceWorker] Activate")
  event.waitUntil(
    caches.keys()
      .then(keys => {
        // Run in parallel
        Promise.all(
          keys.map(key => {
            if (key !== cache) {
              console.log("[ServiceWorker] Removing old cache", key)
              return caches.delete(key)
            }
          })
        )
      })
  )
})
