/* Vet Clinical Toolbox 5.0 — offline-first service worker
 * Product version stays 5.0; internal cache revision may change without changing the product version.
 */
const CACHE='vet-clinical-toolbox-5.0-r08';
const CORE=[
 './','./index.html','./clinical_enhancements_5.0.js','./clinical_rules_engine_5.0.js','./clinical_enhancements_5.0_clinical_addon.js','./manifest.json',
 './data/drugs.json','./data/clinical_drug_additions_5.0.json','./data/clinical_rules_5.0.json','./data/vet_biologics_5.0.json','./data/vet_drug_catalog_5.0.json','./data/lab_analyzers_5.0.json','./drugs.schema.v5.0.json','./sources.v5.0.json'
];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('vet-clinical-toolbox-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url);
 if(url.origin!==location.origin||req.method!=='GET')return;
 if(url.pathname.endsWith('.json')){
  event.respondWith(caches.match(req).then(hit=>{const net=fetch(req).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(req,cp))}return res}).catch(()=>hit);return hit||net}));
  return;
 }
 event.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(req,cp))}return res}).catch(()=>caches.match('./index.html'))));
});
