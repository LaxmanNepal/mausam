(()=>{'use strict';
const KEY='mausam_weather_snapshot_v1',API_HOST='api.open-meteo.com';
const $=id=>document.getElementById(id);
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}};
const write=x=>{try{localStorage.setItem(KEY,JSON.stringify(x))}catch{}};
const ageText=ms=>{const m=Math.max(0,Math.floor(ms/60000));if(m<1)return'अहिले नै';if(m<60)return`${m} मिनेट अघि`;const h=Math.floor(m/60);return`${h} घण्टा अघि`};
function setStatus(text,mode='cached'){const e=$('cacheStatus');if(e){e.textContent=text;e.dataset.mode=mode}}
function showCached(){const x=read();if(!x||!x.data)return false;try{const d=x.data,c=d.current||{},code=c.weather_code,w=({0:['सफा आकाश','☀️'],1:['मुख्यतया सफा','🌤️'],2:['आंशिक बादल','⛅'],3:['बादल लागेको','☁️'],45:['कुहिरो','🌫️'],51:['हल्का झरी','🌦️'],61:['हल्का वर्षा','🌦️'],63:['मध्यम वर्षा','🌧️'],65:['भारी वर्षा','🌧️'],80:['छिटपुट वर्षा','🌦️'],95:['मेघगर्जन','⛈️']}[code]||['परिवर्तनशील','🌤️']);const s=(id,v)=>{const e=$(id);if(e)e.textContent=v};s('place',x.name||'स्थान');s('temp',c.temperature_2m==null?'—':Math.round(c.temperature_2m)+'°');s('condition',w[0]);s('weatherIcon',w[1]);s('updated',`◷ सुरक्षित डाटा · ${ageText(Date.now()-(x.savedAt||Date.now()))}`);const app=$('app');if(app)app.classList.remove('hidden');setStatus(`◷ अन्तिम अपडेट ${ageText(Date.now()-(x.savedAt||Date.now()))}`,'cached');return true}catch{return false}}
const nativeFetch=window.fetch.bind(window);
window.fetch=async function(input,init){const raw=typeof input==='string'?input:(input&&input.url)||'';const r=await nativeFetch(input,init);try{const u=new URL(raw,location.href);if(u.hostname===API_HOST&&u.pathname==='/v1/forecast'&&r.ok){const clone=r.clone();clone.json().then(data=>{let last=null;try{last=JSON.parse(localStorage.getItem('mausam_last')||'null')}catch{};if(last&&data&&data.current){write({lat:last.lat,lon:last.lon,name:last.name||'स्थान',data,savedAt:Date.now()});setStatus('🟢 Live · भर्खरै अपडेट','live')}}).catch(()=>{})}}catch{}return r};
window.weatherCache={read,write,showCached,setStatus,ageText};
window.addEventListener('online',()=>setStatus('🟢 अनलाइन · मौसम अपडेट हुँदैछ','live'));
window.addEventListener('offline',()=>setStatus('🟠 अफलाइन · सुरक्षित मौसम देखाउँदै','offline'));
function boot(){let last=null;try{last=JSON.parse(localStorage.getItem('mausam_last')||'null')}catch{}if(last)showCached()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else setTimeout(boot,0);
})();