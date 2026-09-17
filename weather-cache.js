(()=>{'use strict';
const KEY='mausam_weather_snapshot_v1';
const $=id=>document.getElementById(id);
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}};
const write=x=>{try{localStorage.setItem(KEY,JSON.stringify(x))}catch{}};
const ageText=ms=>{const m=Math.max(0,Math.floor(ms/60000));if(m<1)return'अहिले नै';if(m<60)return`${m} मिनेट अघि`;const h=Math.floor(m/60);return`${h} घण्टा अघि`};
function setStatus(text,mode='cached'){const e=$('cacheStatus');if(e){e.textContent=text;e.dataset.mode=mode}}
function showCached(){const x=read();if(!x||!x.data)return false;try{if(window.putCurrentSnapshot)window.putCurrentSnapshot(x.data,x.name);else{const d=x.data,c=d.current||{},w=({0:['सफा आकाश','☀️'],1:['मुख्यतया सफा','🌤️'],2:['आंशिक बादल','⛅'],3:['बादल लागेको','☁️']}[c.weather_code]||['परिवर्तनशील','🌤️']);const s=(id,v)=>{const e=$(id);if(e)e.textContent=v};s('place',x.name||'स्थान');s('temp',c.temperature_2m==null?'—':Math.round(c.temperature_2m)+'°');s('condition',w[0]);s('weatherIcon',w[1]);const app=$('app');if(app)app.classList.remove('hidden');}
setStatus(`◷ अन्तिम अपडेट ${ageText(Date.now()-(x.savedAt||Date.now()))}`,'cached');return true}catch{return false}}
window.weatherCache={read,write,showCached,setStatus,ageText};
window.addEventListener('online',()=>setStatus('🟢 अनलाइन · मौसम अपडेट हुँदैछ','live'));
window.addEventListener('offline',()=>setStatus('🟠 अफलाइन · सुरक्षित मौसम देखाउँदै','offline'));
function boot(){const last=(()=>{try{return JSON.parse(localStorage.getItem('mausam_last')||'null')}catch{return null}})();if(last)showCached()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else setTimeout(boot,0);
})();