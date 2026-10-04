// © 2026 Конспект (pogost). Все права защищены.
const VERSION = 'konspekt-v3';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];
self.addEventListener('install', (e) => {
e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
e.waitUntil(
caches.keys()
.then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
.then(() => self.clients.claim())
);
});
self.addEventListener('fetch', (e) => {
const req = e.request;
if (req.method !== 'GET') return;
const url = new URL(req.url);
const sameOrigin = url.origin === self.location.origin;
const cdn = url.hostname === 'cdn.jsdelivr.net' || url.hostname === 'tessdata.projectnaptha.com';
if (!sameOrigin && !cdn) return;
if (sameOrigin && req.mode === 'navigate') {
e.respondWith(
fetch(req).then((res) => {
const copy = res.clone();
caches.open(VERSION).then((c) => c.put('./index.html', copy));
return res;
}).catch(() => caches.match('./index.html'))
);
return;
}
e.respondWith(
caches.match(req).then((hit) => hit || fetch(req).then((res) => {
if (res.ok) {
const copy = res.clone();
caches.open(VERSION).then((c) => c.put(req, copy));
}
return res;
}))
);
});