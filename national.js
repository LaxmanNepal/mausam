(()=>{'use strict';
const nf=v=>v==null||!Number.isFinite(Number(v))?'—':new Intl.NumberFormat('ne-NP',{maximumFractionDigits:1}).format(Number(v));
const $=id=>document.getElementById(id);
function insert(){
  if($('nationalPulse')||!$('districtExplorer'))return;
  const s=document.createElement('section');s.id='nationalPulse';s.className='card national-pulse';
  s.innerHTML='<div class="section-head"><div><h2>🇳🇵 नेपालको मौसम अवस्था</h2><p class="muted">७७ जिल्ला केन्द्र आसपासको मौसम डाटाको राष्ट्रिय सारांश</p></div><span class="pill" id="nationalAge">डाटा पर्खँदै</span></div><div id="nationalGrid" class="national-grid"></div><p class="national-note">ℹ️ Open-Meteo आधारित अनुमान हो; सरकारी मौसम चेतावनी होइन। जिल्ला केन्द्र आसपासको अवस्थाले पूरै जिल्लाको अवस्था प्रतिनिधित्व नगर्न सक्छ।</p>';
  $('districtExplorer').insertAdjacentElement('afterend',s);
}
function selectPlace(name){const input=$('search');if(!input)return;input.value=name;input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',bubbles:true}));window.scrollTo({top:0,behavior:'smooth'});}
function card(icon,label,value,meta,place){return place?`<button class="national-card" data-place="${place}"><span>${icon}</span><div><small>${label}</small><strong>${value}</strong><p>${meta}</p></div></button>`:`<article class="national-card"><span>${icon}</span><div><small>${label}</small><strong>${value}</strong><p>${meta}</p></div></article>`;}
function render(){
  insert();const grid=$('nationalGrid');if(!grid)return;
  let saved=null;try{saved=JSON.parse(localStorage.getItem('mausam_intel')||'null')}catch{}
  const d=(saved?.data||[]).filter(Boolean);if(!d.length){grid.innerHTML='<div class="national-empty">७७ जिल्लाको स्क्यान पूरा भएपछि राष्ट्रिय सारांश यहाँ देखिन्छ।</div>';if($('nationalAge'))$('nationalAge').textContent='स्क्यान पर्खँदै';return;}
  const temps=d.map(x=>Number(x.temp)).filter(Number.isFinite);const avg=temps.length?temps.reduce((a,b)=>a+b,0)/temps.length:null;
  const withTemp=d.filter(x=>Number.isFinite(Number(x.temp)));const hot=withTemp.slice().sort((a,b)=>b.temp-a.temp)[0];const cold=withTemp.slice().sort((a,b)=>a.temp-b.temp)[0];
  const rain=d.filter(x=>Number(x.rain)>=60).length,uv=d.filter(x=>Number(x.uv)>=7).length,aqi=d.filter(x=>Number(x.aqi)>=100).length,wind=d.filter(x=>Number(x.wind)>=35).length;
  grid.innerHTML=card('🌡️','राष्ट्रिय औसत तापक्रम',`${nf(avg)}°C`,`${nf(d.length)} जिल्ला स्क्यान`) + card('🔥','सबैभन्दा तातो',hot?`${nf(hot.temp)}°C`:'—',hot?.name||'डाटा उपलब्ध छैन',hot?.name) + card('🧊','सबैभन्दा चिसो',cold?`${nf(cold.temp)}°C`:'—',cold?.name||'डाटा उपलब्ध छैन',cold?.name) + card('🌧️','वर्षा सावधानी',`${nf(rain)} जिल्ला`,'वर्षा सम्भावना ≥ ६०%') + card('☀️','उच्च UV',`${nf(uv)} जिल्ला`,'UV सूचक ≥ ७') + card('🫧','AQI सावधानी',`${nf(aqi)} जिल्ला`,'युरोपेली AQI ≥ १००') + card('💨','बलियो हावा',`${nf(wind)} जिल्ला`,'हावाको गति ≥ ३५ km/h');
  grid.querySelectorAll('[data-place]').forEach(b=>b.addEventListener('click',()=>selectPlace(b.dataset.place)));
  if($('nationalAge')){const t=saved.at?new Date(saved.at).toLocaleTimeString('ne-NP',{hour:'numeric',minute:'2-digit'}):'अज्ञात';$('nationalAge').textContent=`${nf(d.length)} जिल्ला · ${t}`;}
}
function boot(){insert();render();setInterval(render,3000);window.addEventListener('storage',render);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
