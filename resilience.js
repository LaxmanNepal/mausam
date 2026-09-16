(()=>{'use strict';
const nativeFetch=window.fetch.bind(window);
const WEATHER='api.open-meteo.com/v1/forecast';
const AQ='air-quality-api.open-meteo.com/v1/air-quality';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function isApi(url,host){try{return new URL(url,location.href).hostname===host||url.includes(host)}catch{return url.includes(host)}}
async function request(input,init={}){
 const url=typeof input==='string'?input:input.url;
 const isWeather=isApi(url,WEATHER), isAQ=isApi(url,AQ);
 const attempts=isWeather?3:isAQ?2:1;
 let last;
 for(let i=0;i<attempts;i++){
  const ctrl=new AbortController();
  const timer=setTimeout(()=>ctrl.abort(),isWeather?12000:9000);
  try{
   const res=await nativeFetch(input,{...init,signal:ctrl.signal,cache:'no-store'});
   clearTimeout(timer);
   if(res.ok)return res;
   last=new Error('HTTP '+res.status);
  }catch(e){clearTimeout(timer);last=e}
  if(i<attempts-1)await sleep(700*(i+1));
 }
 if(isAQ){
  const fallback={hourly:{time:[new Date().toISOString()],pm2_5:[null],pm10:[null],european_aqi:[null]}};
  return new Response(JSON.stringify(fallback),{status:200,headers:{'Content-Type':'application/json'}});
 }
 throw last||new Error('नेटवर्क अनुरोध असफल');
}
window.fetch=request;
})();