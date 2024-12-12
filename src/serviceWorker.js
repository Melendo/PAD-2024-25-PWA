const cacheName = "book-app-cache";
const appShellFiles = [
    "/",
    "/App.jsx",
    "/App.css",
    "main.jsx",
    "index.css",
    "/public/fondo.jpg",
    "/public/icon-192x192.png",
    "/public/icon-512x512.png"
];

// Instalar el service worker
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("Cache abierto");
            return cache.addAll(appShellFiles);
        })
    );
});

// Servir archivos cache cuando está offline
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

// Activar service worker y limpiar caches antiguas
self.addEventListener("activate", (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            )
        })
    );
});