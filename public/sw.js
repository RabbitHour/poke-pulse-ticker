const CACHE_NAME='poke-pulse-public-v2';
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE_NAME).then(c=>c.add('/index.html')));self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('poke-pulse-')&&k!==CACHE_NAME).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 // Never store authenticated API responses, account data, or market JSON in shared caches.
 if(request.method!=='GET'||url.origin!==self.location.origin||request.headers.has('authorization')||url.pathname.startsWith('/data/'))return;
 if(request.mode==='navigate'){
  event.respondWith(fetch(request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE_NAME).then(c=>c.put('/index.html',copy));}return response;}).catch(()=>caches.match('/index.html')));return;
 }
 if(!/^\/assets\//.test(url.pathname)&&!url.pathname.match(/\.(png|jpg|webp|svg|woff2?)$/))return;
 event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE_NAME).then(c=>c.put(request,copy));}return response;})));
});
