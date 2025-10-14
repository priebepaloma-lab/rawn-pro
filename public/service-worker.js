// public/service-worker.js — RAWN PRO PWA ⚡ (v3) seguro para streaming
// Estratégias:
// - NUNCA interceptar /api/* nem requisições não-GET (evita quebrar streaming)
// - Navegação (HTML): Network-first com fallback ao cache
// - Assets estáticos: Cache-first com atualização em segundo plano

const CACHE_VERSION = "v4";
const RUNTIME_CACHE = `rawnpro-runtime-${CACHE_VERSION}`;
const STATIC_CACHE = `rawnpro-static-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  "/",                 // shell
  "/manifest.json",
  "/favicon-64.png",
  "/icon-512.png",
  "/assets/logo.png",
];

// Instalação — pré-cache estático essencial
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Ativação — limpa caches antigos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => ![STATIC_CACHE, RUNTIME_CACHE].includes(k))
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch — políticas de cache sem interceptar APIs/POST
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 1) NÃO intercepta nada que não seja GET
  if (req.method !== "GET") return;

  // 2) NÃO intercepta API/dinâmicos (ex.: /api/chat)
  if (url.pathname.startsWith("/api/")) return;

  // 3) Navegações (HTML): network-first com fallback cache
  if (req.mode === "navigate" || (req.headers.get("accept") || "").includes("text/html")) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const resClone = res.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(req, resClone));
          return res;
        })
        .catch(() => caches.match(req).then((c) => c || caches.match("/")))
    );
    return;
  }

  // 4) Assets estáticos: cache-first
  const isStatic =
    /\.(?:css|js|png|jpg|jpeg|gif|webp|svg|ico|woff2?|ttf|otf)$/.test(url.pathname);

  if (isStatic) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const fetchPromise = fetch(req)
          .then((res) => {
            // Só cacheia respostas 200/opaques úteis
            if (res && (res.ok || res.type === "opaque")) {
              const clone = res.clone();
              caches.open(RUNTIME_CACHE).then((cache) => cache.put(req, clone));
            }
            return res;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // 5) Demais GET: network-first com fallback cache
  event.respondWith(
    fetch(req)
      .then((res) => {
        const clone = res.clone();
        caches.open(RUNTIME_CACHE).then((cache) => cache.put(req, clone));
        return res;
      })
      .catch(() => caches.match(req))
  );
});
