(()=>{'use strict';
const $=id=>document.getElementById(id);
const key='mausam_cities';
const read=()=>{try{return JSON.parse(localStorage.getItem(key)||'[]').filter(x=>x&&Number.isFinite(+x.lat)&&Number.isFinite(+x.lon))}catch{return[]}};
const write=a=>{try{localStorage.setItem(key,JSON.stringify(a.slice(0,8)));}catch{}};
const fmt=n=>n==null||Number.isNaN(+n)?'—':Math.round(+n).toLocaleString('ne-NP');
const icon=c=>({0:'☀️',1:'🌤️',2:'⛅',3:'☁️',45:'🌫️',48:'🌫️',51:'🌦️',53:'🌦️',55:'🌧️',61:'🌦️',63:'🌧️',65:'🌧️',71:'🌨️',73:'🌨️',75:'❄️',80:'🌦️',81:'🌧️',82:'⛈️',95:'⛈️',96:'⛈️',99:'⛈️'}[c]||'🌤️');
function render(){const host=$('myCities');if(!host)return;const a=read();if(!a.length){host.classList.add('hidden');return}host.classList.remove('hidden');host.innerHTML=`<div class="section-head"><div><h2>💾 मेरा शहरहरू</h2><p class="muted">सुरक्षित स्थानहरू · छिटो स्विच गर्नुहोस्</p></div><span class="pill">${a.length}/8</span></div><div class="my-cities-grid">${a.map((x,i)=>`<article class="city-mini ${i===0?'active':''}" draggable="true" data-i="${i}"><button class="city-open" data-open="${i}"><span class="city-icon">${x.icon||'🌤️'}</span><span><b>${x.name||'स्थान'}</b><small>${x.cachedTemp!=null?fmt(x.cachedTemp)+'°C':'मौसम अपडेट हुँदैछ'}</small></span></button><div class="city-mini-meta"><span>${x.cachedCondition||'—'}</span><button class="city-delete" data-delete="${i}" aria-label="स्थान हटाउनुहोस्">×</button></div><small class="city-local-time" data-time="${i}">स्थानीय समय —</small></article>`).join('')}</div>`;
host.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>{const x=read()[+b.dataset.open];if(x&&window.load)window.load(x.lat,x.lon,x.name)});
host.querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>{const a=read();a.splice(+b.dataset.delete,1);write(a);render()});
let drag=null;host.querySelectorAll('.city-mini').forEach(card=>{card.ondragstart=()=>drag=+card.dataset.i;card.ondragover=e=>e.preventDefault();card.ondrop=()=>{const a=read(),item=a.splice(drag,1)[0];a.splice(+card.dataset.i,0,item);write(a);render()}});updateTimes()}
function updateTimes(){const a=read();document.querySelectorAll('[data-time]').forEach(e=>{const x=a[+e.dataset.time];if(!x)return;try{e.textContent=new Intl.DateTimeFormat('ne-NP',{timeZone:x.timezone||'Asia/Kathmandu',hour:'numeric',minute:'2-digit',second:'2-digit',hour12:true}).format(new Date())}catch{}})}
window.updateMyCity=patch=>{const a=read(),lat=+patch.lat,lon=+patch.lon,i=a.findIndex(x=>Math.abs(+x.lat-lat)<.00001&&Math.abs(+x.lon-lon)<.00001);if(i<0)return; a[i]={...a[i],...patch,usedAt:Date.now()};a.unshift(a.splice(i,1)[0]);write(a);render()};
window.renderMyCities=render;render();setInterval(updateTimes,1000);
})();
