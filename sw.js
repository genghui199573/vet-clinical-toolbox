const CACHE="vet-clinical-toolbox-5.0";
const CORE=[
 "./","./index.html","./clinical_enhancements_5.0.js","./manifest.json",
 "./data/drugs.json","./data/clinical_drug_additions_5.0.json",
 "./data/vet_biologics_5.0.json","./data/vet_drug_catalog_5.0.json",
 "./data/lab_analyzers_5.0.json"
];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{
 const u=new URL(e.request.url);
 if(u.origin!==location.origin)return;
 e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{
   const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r;
 }).catch(()=>caches.match("./index.html"))));
});
