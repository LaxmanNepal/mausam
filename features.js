(()=>{'use strict';
const $=id=>document.getElementById(id);
let last={lat:null,lon:null,name:'स्थान',data:null,tz:'Asia/Kathmandu'};
let fahrenheit=false;
const n=v=>Number.isFinite(Number(v))?Number(v):null;
const temp=v=>{const x=n(v);if(x===null)return'—';return fahrenheit?((x*9/5)+32).toFixed(0)+'°F':x.toFixed(0)+'°C'};
const time=(s,tz)=>{try{return new Intl.DateTimeFormat('ne-NP',{timeZone:tz||'Asia/Kathmandu',hour:'numeric',minute:'2-digit',hour12:true}).format(new Date(s))}catch{return'—'}};
function set(id,v){const e=$(id);if(e)e.textContent=v}
function alertInfo(){
 const c=last.data?.current||{},d=last.data?.daily||{},h=last.data?.hourly||{};
 const code=n(c.weather_code),rain=n(d.precipitation_probability_max?.[0])||0,wind=n(c.wind_speed_10m)||0,uv=n(d.uv_index_max?.[0])||0,aq=n(window.__mausamAQI);
 const flags=[];
 if(code>=95)flags.push('⛈️ मेघगर्जन');
 if(rain>=70)flags.push('☔ वर्षा');
 if(wind>=50)flags.push('💨 तेज हावा');
 if(uv>=8)flags.push('☀️ उच्च UV');
 if(aq>=100)flags.push('😷 AQI');
 set('alertTitle',flags.length?'⚠️ आज ध्यान दिनुपर्ने मौसम':'✅ ठूलो जोखिम संकेत छैन');
 set('alertText',flags.length?flags.join(' · ')+' — यो एपको डेटा-आधारित संकेत हो, आधिकारिक चेतावनी होइन।':'हालको पूर्वानुमानमा उच्च-जोखिम threshold भेटिएन।');
 const box=$('weatherAlert'); if(box)box.classList.toggle('weather-alert-active',!!flags.length);
}
function render(){
 const c=last.data?.current||{},d=last.data?.daily||{},h=last.data?.hourly||{},tz=last.tz;
 set('unitBadge',fahrenheit?'°F':'°C');set('temp',temp(c.temperature_2m));set('feels',temp(c.apparent_temperature));
 set('high',temp(d.temperature_2m_max?.[0]));set('low',temp(d.temperature_2m_min?.[0]));set('dTemp',temp(c.temperature_2m));set('dew',temp(h.dew_point_2m?.[0]));
 const p=n(d.precipitation_probability_max?.[0]),wind=n(c.wind_speed_10m),uv=n(d.uv_index_max?.[0]);
 set('rainRisk',p===null?'—':p+'%');set('rainRiskText',p===null?'वर्षा डाटा उपलब्ध छैन':p>=70?'आज वर्षाको उच्च सम्भावना छ।':p>=40?'वर्षाको सम्भावना मध्यम छ।':'वर्षाको सम्भावना कम छ।');
 set('windInsight',wind===null?'—':Math.round(wind)+' km/h');set('windInsightText',wind===null?'हावाको डाटा उपलब्ध छैन':wind>=35?'बलियो हावा हुन सक्छ; बाहिरी गतिविधिमा ध्यान दिनुहोस्।':'हावा सामान्य दायरामा छ।');
 set('uvInsight',uv===null?'—':uv.toFixed(0));set('uvInsightText',uv===null?'UV डाटा उपलब्ध छैन':uv>=8?'घाम कडा हुन सक्छ; सुरक्षा अपनाउनुहोस्।':uv>=6?'दिउँसो घाममा सावधानी उपयोगी हुन्छ।':'UV तुलनात्मक रूपमा कम छ।');
 const times=h.time||[],probs=h.precipitation_probability||[],temps=h.temperature_2m||[];let best=-1,bestScore=Infinity,now=Date.now();
 for(let i=0;i<Math.min(times.length,24);i++){const t=new Date(times[i]).getTime();if(!Number.isFinite(t)||t<now)continue;const rain=n(probs[i])??100,tt=n(temps[i])??25,score=rain*2+Math.abs(tt-24);if(score<bestScore){bestScore=score;best=i}}
 set('bestTime',best>=0?time(times[best],tz):'—');set('bestTimeText',best>=0?'वर्षा '+(n(probs[best])??'—')+'% · तापक्रम '+temp(temps[best]):'घण्टे डाटा उपलब्ध छैन');set('insightLabel',best>=0?'आजको विश्लेषण':'डाटा पर्खँदै');
 alertInfo();
}
function syncAQ(){const e=$('aqi');if(e){const v=n(e.textContent);if(v!==null)window.__mausamAQI=v;alertInfo()}}
async function refresh(){if(last.lat==null||last.lon==null){alert('पहिले कुनै स्थान छान्नुहोस्।');return}const b=$('refreshWeather');if(b){b.disabled=true;b.classList.add('loading')}try{if(window.load)await window.load(last.lat,last.lon,last.name)}finally{if(b){b.disabled=false;b.classList.remove('loading')}}}
function share(){if(last.lat==null)return;const url=location.origin+location.pathname+'?lat='+encodeURIComponent(last.lat)+'&lon='+encodeURIComponent(last.lon)+'&name='+encodeURIComponent(last.name),title='मौसम — '+last.name,text='🌦️ '+last.name+' को आजको मौसम हेर्नुहोस्';if(navigator.share)navigator.share({title,text,url}).catch(()=>{});else if(navigator.clipboard)navigator.clipboard.writeText(url).then(()=>alert('मौसमको लिङ्क कपी भयो।')).catch(()=>{})}
function favorite(){if(last.lat==null)return;let a=[];try{a=JSON.parse(localStorage.getItem('mausam_cities')||'[]')}catch{}const exists=a.some(x=>Math.abs(+x.lat-last.lat)<.00001&&Math.abs(+x.lon-last.lon)<.00001);if(!exists)a.unshift({lat:last.lat,lon:last.lon,name:last.name,usedAt:Date.now()});localStorage.setItem('mausam_cities',JSON.stringify(a.slice(0,8)));localStorage.setItem('mausam_last',JSON.stringify({lat:last.lat,lon:last.lon,name:last.name}));set('favoriteWeather',exists?'♥ सुरक्षित छ':'♥ सुरक्षित गरियो');if(window.renderSavedCities)window.renderSavedCities()}
function bind(){
 $('unitToggle')?.addEventListener('click',()=>{fahrenheit=!fahrenheit;render()});
 $('refreshWeather')?.addEventListener('click',refresh);$('shareWeather')?.addEventListener('click',share);$('favoriteWeather')?.addEventListener('click',favorite);
 window.addEventListener('mausam-weather-loaded',e=>{const x=e.detail||{};last={lat:+x.lat,lon:+x.lon,name:x.name||'स्थान',data:x.data||null,tz:x.data?.timezone||'Asia/Kathmandu'};try{localStorage.setItem('mausam_weather_snapshot_v1',JSON.stringify({at:Date.now(),data:last.data,lat:last.lat,lon:last.lon,name:last.name}))}catch{}render()});
 setTimeout(()=>{try{const x=JSON.parse(localStorage.getItem('mausam_weather_snapshot_v1')||'null');if(x?.data){last={lat:+x.lat,lon:+x.lon,name:x.name||'स्थान',data:x.data,tz:x.data.timezone||'Asia/Kathmandu'}}}catch{}render()},900);
 const observer=new MutationObserver(syncAQ);const aq=$('aqi');if(aq)observer.observe(aq,{childList:true,characterData:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();