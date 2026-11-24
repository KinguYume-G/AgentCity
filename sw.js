/* Offline cache is scoped to this application, not other GitHub Pages projects. */
const CACHE="agentcity-global-v07";
const ASSETS=["./","./index.html","./src/engine.js?v=07","./src/app.js?v=07","./src/renderer3d.js?v=07","./src/styles.css?v=07","./src/offline.js?v=07","./vendor/three.module.min.js","./manifest.webmanifest","./icon.svg"];
self.addEventListener("install",event=>{event.waitUntil((async()=>{const cache=await caches.open(CACHE);await cache.addAll(ASSETS.map(p=>new Request(new URL(p,self.registration.scope),{cache:"reload"})));await self.skipWaiting()})())});
self.addEventListener("activate",event=>{event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith("agentcity-global-")&&key!==CACHE)await caches.delete(key);await self.clients.claim()})())});
self.addEventListener("fetch",event=>{
 const req=event.request,url=new URL(req.url),scope=new URL(self.registration.scope);
 if(req.method!=="GET"||url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;
 if(req.mode==="navigate"){event.respondWith((async()=>{try{const fresh=await fetch(req);if(!fresh.ok)throw Error("Navigation failed");return fresh}catch(_){return await caches.match(new URL("./index.html",scope).href)||Response.error()}})());return}
 event.respondWith((async()=>{const cache=await caches.open(CACHE),hit=await cache.match(req);if(hit)return hit;try{const response=await fetch(req);if(response.ok&&response.type==="basic")await cache.put(req,response.clone());return response}catch(_){return Response.error()}})());
});
