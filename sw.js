/* 유럽 신혼여행 2026 — 오프라인 캐시 v4 */
var CACHE = "honeymoon-v11r31";
var ASSETS = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./apple-touch-icon.png"];
self.addEventListener("install", function (e) {
  /* 폰 HTTP 캐시(10분)를 건너뛰고 서버에서 새로 받기. index.html에 이 CACHE 이름이 없으면(옛 판) 설치 실패 → 다음 실행 때 재시도.
     전엔 캐시에 남은 옛 index.html을 새 이름으로 담아 옛 판에 멈출 수 있었음 */
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return Promise.all(ASSETS.map(function (u) {
      return fetch(new Request(u, { cache: "reload" })).then(function (res) {
        if (!res.ok) throw new Error(u + " " + res.status);
        if (u !== "./" && u !== "./index.html") return c.put(u, res);
        return res.clone().text().then(function (t) {
          if (t.indexOf(CACHE) < 0) throw new Error("stale " + u);
          return c.put(u, res);
        });
      });
    }));
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(function (r) {
      if (r) return r;
      return fetch(e.request).then(function (res) {
        var cp = res.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, cp); });
        return res;
      }).catch(function () { return caches.match("./index.html"); });
    })
  );
});
