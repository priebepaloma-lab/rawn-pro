// public/service-worker.js — RAWN PRO PWA ⚡
// Versão: 1.0.0

const CACHE_NAME = "rawnpro-cache-v1";
const ASSETS = [
  "/",                // página inicial
  "/favicon-64.png",  // ícone pequeno
  "/icon-512.png",    // ícone principal
  "/manifest.json",   // manifesto PWA
  "/assets/logo.png", // logotipo principal
  "/splash-dark.png", // splash escuro
  "/splash-light.png" // splash claro
];

// Instalação do service worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Ativação — limpa caches antigos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

// Intercepta requisições e serve do cache
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(event.request).then((response) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
      );
    })
  );
});
