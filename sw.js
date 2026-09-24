const CACHE='mausam-v41';
const CORE_ASSETS=[
  './','./index.html','./style.css','./cities.css','./datetime.css',
  './app.js','./weather-cache.js','./api-compat.js','./nepali-clock.js',
  './cities.js','./enhancements.js','./resilience.js','./districts.js',
  './intelligence.js','./national.js','./features.js','./nepal.js',
  './homepage-alerts.js','./homepage-order.js','./dhm-status.js','./travel.js','./mountain.js','./farmer.js',
  './hydrology-data.js','./alert-engine.js','./notifications.js','./alert-monitor.js',
  './alert-history.js','./notification-center.js','./data-health.js',
  './alert-center.css','./alerts.css','./alerts.js','./alert-page.html',
  './manifest.json'
];
const OPTIONAL_ASSETS=[
  './alerts/','./alerts/index.html','./alerts/history/','./alerts/history/index.html',
  './notifications/','./notifications/index.html',
  './weather-alert/','./weather-alert/index.html','./rivers-alert/','./rivers-alert/index.html',
  './flood-alert/','./flood-alert/index.html','./lightning-alert/','./lightning-alert/index.html',
  './light-alert/','./light-alert/index.html','./landslide-alert/','./landslide-alert/index.html',
  './heat-alert/','./heat-alert/index.html','./air-alert/','./air-alert/index.html',
  './wind-alert/','./wind-alert/index.html','./rain-alert/','./rain-alert/index.html',
  './uv-alert/','./uv-alert/index.html',
  './barsha/','./barsha/index.html','./nadiharu/','./nadiharu/index.html',
  './ahileko-mausam/','./ahileko-mausam/index.html',
  './alert-map/','./alert-map/index.html',
  './city/','./city/index.html',
  './jilla/','./jilla/index.html','./jilla/weather.html',
  './hetauda/','./hetauda/index.html','./kathmandu/','./kathmandu/index.html',
  './pokhara/','./pokhara/index.html','./biratnagar/','./biratnagar/index.html',
  './bharatpur/','./bharatpur/index.html','./lalitpur/','./lalitpur/index.html',
  './bhaktapur/','./bhaktapur/index.html'
];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(async cache=>{await Promise.allSettled(CORE_ASSETS.map(u=>cache.add(u)));await Promise.allSettled(OPTIONAL_ASSETS.map(u=>cache.add(u)));}).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;const request=event.request,url=new URL(request.url),sameOrigin=url.origin===self.location.origin;
if(request.mode==='navigate'){event.respondWith(fetch(request).then(response=>{if(sameOrigin&&response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put(request,copy)).catch(()=>{})}return response}).catch(()=>caches.match(request).then(c=>c||caches.match('./index.html'))));return}
if(sameOrigin){event.respondWith(caches.match(request).then(cached=>{const network=fetch(request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put(request,copy)).catch(()=>{})}return response}).catch(()=>cached);return cached||network}))}});
