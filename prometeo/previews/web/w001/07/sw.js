/* MARGEN: isolated, no-network-dependency offline shell */
const CACHE = "margen-w001-07-v1";
const SHELL = ["./", "./index.html"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith("margen-w001-07-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  if(event.request.method !== "GET" || event.request.mode !== "navigate") return;
  const url = new URL(event.request.url);
  if(url.origin !== self.location.origin || !url.pathname.startsWith(self.registration.scope.replace(url.origin,""))) return;
  event.respondWith(fetch(event.request).then(response => {
    if(response.ok){const copy = response.clone();caches.open(CACHE).then(cache => cache.put("./index.html", copy)).catch(() => {});}
    return response;
  }).catch(() => caches.match("./index.html")));
});