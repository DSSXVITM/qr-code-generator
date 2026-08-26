/* QRVolt service worker — cache-first for true offline use */
var CACHE = "qrvolt-v1";
var ASSETS = [
  "./",
  "./index.html",
  "./about.html",
  "./guide.html",
  "./privacy.html",
  "./terms.html",
  "./contact.html",
  "./blog.html",
  "./wifi.html",
  "./logo.html",
  "./vcard.html",
  "./updates.html",
  "./manifest.webmanifest"
];

self.addEventListener("install", function(e){
  e.waitUntil(
    Promise.all(ASSETS.map(function(u){
      return caches.open(CACHE).then(function(c){ return c.add(u).catch(function(){}); });
    })).then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function(e){
  if(e.request.method !== "GET") return;
  var url = new URL(e.request.url);
  if(url.origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(function(hit){
      var net = fetch(e.request).then(function(res){
        if(res && res.ok){
          var cl = res.clone();
          caches.open(CACHE).then(function(c){ c.put(e.request, cl); });
        }
        return res;
      }).catch(function(){ return hit || Response.error(); });
      return hit || net;
    })
  );
});
