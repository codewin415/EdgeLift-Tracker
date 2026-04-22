const CACHE_NAME = "edgelift-static-v2";
const APP_ASSETS = [
  "./",
  "./index.html",
  "./workouts.html",
  "./cyberpsycho.html",
  "./nutrition.html",
  "./reset-password.html",
  "./styles.css?v=6",
  "./script.js?v=6",
  "./reset-password.js",
  "./supabase-config.js",
  "./app.webmanifest"
];

const NETWORK_FIRST_PATTERNS = [
  /\/$/,
  /\/index\.html$/,
  /\/workouts\.html$/,
  /\/cyberpsycho\.html$/,
  /\/nutrition\.html$/,
  /\/reset-password\.html$/,
  /\/styles\.css(\?.*)?$/,
  /\/script\.js(\?.*)?$/,
  /\/reset-password\.js(\?.*)?$/
];

function shouldUseNetworkFirst(request) {
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return false;
  }
  return NETWORK_FIRST_PATTERNS.some((pattern) => pattern.test(url.pathname + url.search));
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  if (shouldUseNetworkFirst(event.request)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match("./index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }
      return fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      }).catch(() => caches.match("./index.html"));
    })
  );
});
