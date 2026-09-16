(()=>{'use strict';
const nativeFetch=window.fetch.bind(window);
const WEATHER_HOST='api.open-meteo.com';
const AQ_HOST='air-quality-api.open-meteo.com';
const CACHE_PREFIX='mausam-api-cache-v3:';
const FRESH=15*60*1000;
const STALE=24*60*60*1000;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function host(url){try{return new URL(url,location.href).hostname}catch{return ''}}
function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(36)}
function key(url){return CACHE_PREFIX+hash(url)}
function read(url,allowStale){try{const raw=localStorage.getItem(key(url));if(!raw)return null;const item=JSON.parse(raw);const age=Date.now()-item.at;const limit=allowStale?STALE:FRESH;if(age<0||age>limit)return null;return new Response(JSON.stringify(item.data),{status:200,headers:{'Content-Type':'application/json','X-Mausam-Cache':allowStale?'STALE':'HIT'}})}catch{return null}}
function write(url,data){try{localStorage.setItem(key(url),JSON.stringify({at:Date.now(),data}))}catch{}}
async function live(url,input,init,isWeather,isAQ){
 const attempts=isWeather?3:2;let last;
 for(let i=0;i<attempts;i++){
  const ctrl=new AbortController();
  let timer=setTimeout(()=>ctrl.abort(),isWeather?12000:9000);
  try{
   const res=await nativeFetch(input,{...init,signal:ctrl.signal,cache:'no-store'});
   clearTimeout(timer);
   if(res.ok){
    const copy=res.clone();
    copy.json().then(data=>write(url,data)).catch(()=>{});
    return res;
   }
   last=new Error('HTTP '+res.status);
  }catch(e){clearTimeout(timer);last=e}
  if(i<attempts-1)await sleep(650*(i+1));
 }
 throw last||new Error('नेटवर्क अनुरोध असफल');
}
async function request(input,init={}){
 const url=typeof input==='string'?input:input.url;
 const h=host(url),isWeather=h===WEATHER_HOST,isAQ=h===AQ_HOST;
 if(!isWeather&&!isAQ)return nativeFetch(input,init);
 const scan=url.includes('mausam_scan=1');
 if(!scan){const cached=read(url,false);if(cached){window.dispatchEvent(new CustomEvent('mausam-api-status',{detail:{type:'cache',url}}));return cached}}
 try{
  const res=await live(url,input,init,isWeather,isAQ);
  window.dispatchEvent(new CustomEvent('mausam-api-status',{detail:{type:'live',url}}));
  return res;
 }catch(error){
  if(!scan){const stale=read(url,true);if(stale){window.dispatchEvent(new CustomEvent('mausam-api-status',{detail:{type:'stale',url}}));return stale}}
  if(isAQ){return new Response(JSON.stringify({hourly:{time:[new Date().toISOString()],pm2_5:[null],pm10:[null],european_aqi:[null]}}),{status:200,headers:{'Content-Type':'application/json','X-Mausam-Cache':'FALLBACK'}})}
  throw error;
 }
}
window.fetch=request;
})();