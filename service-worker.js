const CACHE_NAME = "edgelift-static-v3";
const APP_ASSETS = [
  "./",
  "./index.html",
  "./workouts.html",
  "./cyberpsycho.html",
  "./nutrition.html",
  "./reset-password.html",
  "./styles.css?v=7",
  "./script.js?v=7",
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
  /\/reset-password\.js(\?.*)?$/,
  /\/supabase-config\.js(\?.*)?$/
];

function shouldUseNetworkFirst(request) {
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return false;
  }
  return NETWORK_FIRST_PATTERNS.some((pattern) => pattern.test(url.pathname + url.search));
}

function pageFallback(pathname) {
  if (pathname.endsWith("/workouts.html")) return "./workouts.html";
  if (pathname.endsWith("/cyberpsycho.html")) return "./cyberpsycho.html";
  if (pathname.endsWith("/nutrition.html")) return "./nutrition.html";
  if (pathname.endsWith("/reset-password.html")) return "./reset-password.html";
  return "./index.html";
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

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) {
    event.respondWith(fetch(event.request));
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(async () => {
          const cachedPage = await caches.match(event.request);
          if (cachedPage) {
            return cachedPage;
          }
          return caches.match(pageFallback(requestUrl.pathname));
        })
    );
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
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match(pageFallback(requestUrl.pathname))))
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
      }).catch(() => caches.match(pageFallback(requestUrl.pathname)));
    })
  );
});
