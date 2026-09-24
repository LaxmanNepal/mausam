(()=>{'use strict';
const P=()=>window.NEPAL_WEATHER_POINTS||[];
const ALERTS=[
 ['🌦️','मौसम अलर्ट','समग्र मौसम संकेत','weather-alert/'],
 ['🌊','नदी अलर्ट','River discharge','rivers-alert/'],
 ['🌊','बाढी अलर्ट','Flood signal','flood-alert/'],
 ['⚡','चट्याङ अलर्ट','Convective potential','lightning-alert/'],
 ['⚡','Lightning Alert','Alternate route','light-alert/'],
 ['⛰️','पहिरो अलर्ट','Rain-trigger signal','landslide-alert/'],
 ['☔','भारी वर्षा','Rain probability','rain-alert/'],
 ['💨','हावा अलर्ट','Wind & gust','wind-alert/'],
 ['🌡️','गर्मी अलर्ट','Heat signal','heat-alert/'],
 ['😷','वायु गुणस्तर','AQI / PM2.5','air-alert/'],
 ['☀️','UV अलर्ट','UV index','uv-alert/']
];
const $=id=>document.getElementById(id),nf=v=>Number.isFinite(Number(v))?new Intl.NumberFormat('ne-NP',{maximumFractionDigits:0}).format(Math.round(Number(v))):'—';
function insert(){
 if($('allNepalAlerts'))return;
 const s=document.createElement('section');s.id='allNepalAlerts';s.className='card homepage-alerts';
 s.innerHTML='<div class="section-head"><div><h2>🚨 नेपालका सबै Live Alert</h2><p class="muted">सबै alert pages एउटै ठाउँबाट खोल्नुहोस्। तलको राष्ट्रिय डाटाबाट जिल्ला अनुसार संकेत पनि हेर्नुहोस्।</p></div><span id="alertLiveBadge" class="pill">डाटा लोड हुँदैछ</span></div><div id="officialAlertStrip" class="official-alert-strip"><div class="official-alert-title"><b>🏛️ DHM Official Live Monitoring</b><span id="officialAlertSource" class="pill">जाँच हुँदैछ…</span></div><div id="officialAlertMetrics" class="official-alert-metrics"><div><small>नदी चेतावनी</small><b>—</b></div><div><small>नदी खतरा</small><b>—</b></div><div><small>वर्षा threshold</small><b>—</b></div><div><small>अधिकतम २४h</small><b>—</b></div></div><p id="officialAlertMeta" class="muted">DHM official monitoring data loading…</p></div><div class="active-alert-panel"><div class="active-alert-head"><b>🔴 अहिले सक्रिय संकेत</b><span id="activeAlertMeta" class="muted">जाँच हुँदैछ…</span></div><div id="activeAlertTabs" class="active-alert-tabs"><button class="active" data-layer="all">सबै</button><button data-layer="official">🏛️ DHM Official</button><button data-layer="model">🧠 Model</button></div><div id="activeAlertGrid" class="active-alert-grid"><div class="national-alert-empty">सक्रिय संकेत सङ्कलन हुँदैछ…</div></div></div><div class="alert-page-grid">'+ALERTS.map(a=>'<a class="alert-page-card" href="'+a[3]+'"><span>'+a[0]+'</span><div><b>'+a[1]+'</b><small>'+a[2]+'</small></div><strong>→</strong></a>').join('')+'</div><div class="national-alert-controls"><div class="alert-control-head"><b>🇳🇵 जिल्ला Live Alert</b><span id="districtAlertMeta" class="muted">स्क्यान हुँदैछ…</span></div><div class="alert-slider-row"><label for="riskSlider">न्यूनतम जोखिम <output id="riskValue">०</output></label><input id="riskSlider" type="range" min="0" max="100" value="0" step="5"><label for="countSlider">जिल्ला <output id="countValue">७७</output></label><input id="countSlider" type="range" min="10" max="77" value="77" step="1"></div><div class="alert-filter-row"><label>प्रदेश <select id="alertProvince"><option value="all">सबै प्रदेश</option></select></label><span id="alertProvinceMeta" class="muted">७७ जिल्ला</span></div><div class="alert-sort-row"><button data-sort="risk" class="active">⚠️ जोखिम</button><button data-sort="rain">☔ वर्षा</button><button data-sort="wind">💨 हावा</button><button data-sort="temp">🌡️ तापक्रम</button><button data-sort="name">🔤 जिल्ला</button></div><div id="districtAlertGrid" class="district-alert-grid"><div class="national-alert-empty">७७ जिल्लाको live डाटा सङ्कलन हुँदैछ…</div></div><p class="national-alert-note">ℹ️ जिल्ला मौसम संकेत Open-Meteo पूर्वानुमानमा आधारित छन्। यी सरकारी चेतावनी होइनन्। आधिकारिक नदी/वर्षा अवस्थाका लागि DHM Watch स्रोत प्रयोग गरिएको छ।</p></div>';
 $('districtExplorer')?.insertAdjacentElement('afterend',s);
 document.querySelectorAll('[data-sort]').forEach(b=>b.onclick=()=>{sort=b.dataset.sort;document.querySelectorAll('[data-sort]').forEach(x=>x.classList.toggle('active',x===b));render()}); const ps=$('alertProvince'); Object.keys(window.NEPAL_DISTRICTS_BY_PROVINCE||{}).forEach(p=>{const o=document.createElement('option');o.value=p;o.textContent=p;ps.appendChild(o)}); ps.onchange=()=>{province=ps.value;render()};
 $('riskSlider').oninput=()=>{ $('riskValue').textContent=nf($('riskSlider').value);render() };
 $('countSlider').oninput=()=>{ $('countValue').textContent=nf($('countSlider').value);render() }; document.querySelectorAll('#activeAlertTabs button').forEach(b=>b.onclick=()=>{layer=b.dataset.layer;document.querySelectorAll('#activeAlertTabs button').forEach(x=>x.classList.toggle('active',x===b));renderActive()});
}
let rows=[],sort='risk',province='all',layer='all',officialHits=[];
function risk(x){let r=0;if((x.rain??0)>=90)r+=45;else if((x.rain??0)>=70)r+=30;else if((x.rain??0)>=50)r+=15;if((x.gust??0)>=60)r+=30;else if((x.gust??0)>=45)r+=18;if((x.temp??0)>=40)r+=25;else if((x.temp??0)>=35)r+=15;if(x.riverDanger)r+=50;else if(x.riverWarning)r+=30;return Math.min(100,r)}
function level(r){return r>=70?'critical':r>=45?'warning':r>=20?'advisory':'normal'}
function renderActive(){const g=$('activeAlertGrid');if(!g)return;let a=rows.filter(x=>layer==='model'?x.risk>=20:layer==='official'?x.officialActive:(x.risk>=20||x.officialActive));a.sort((x,y)=>(y.risk||0)-(x.risk||0));a=a.slice(0,12);if(!a.length){g.innerHTML='<div class="national-alert-empty">अहिले सक्रिय संकेत भेटिएन।</div>'}else{g.innerHTML=a.map(x=>{const icon=x.riverDanger||x.rainOfficial?'🔴':'🟠';const src=x.riverDanger?'नदी खतरा':x.riverWarning?'नदी चेतावनी':x.rainOfficial?'DHM वर्षा threshold':'मौसम model';return '<button class="active-alert-card" data-name="'+x.name+'"><b>'+icon+' '+x.name+'</b><span>'+src+'</span><small>जोखिम '+nf(x.risk)+' · वर्षा '+nf(x.rain)+'% · हावा '+nf(x.gust)+' km/h</small></button>'}).join('');g.querySelectorAll('[data-name]').forEach(b=>b.onclick=()=>location.href='jilla/weather.html?name='+encodeURIComponent(b.dataset.name));}const m=$('activeAlertMeta');if(m)m.textContent=a.length+' सक्रिय संकेत · '+(layer==='official'?'DHM Official':layer==='model'?'Open-Meteo Model':'Official + Model');}
function render(){renderActive();
 const g=$('districtAlertGrid');if(!g)return;
 const min=Number($('riskSlider').value),count=Number($('countSlider').value);
 let allowed=province==='all'?null:(window.NEPAL_DISTRICTS_BY_PROVINCE?.[province]||[]); let a=rows.filter(x=>x.risk>=min&&(!allowed||allowed.includes(x.name)));
 const cmp={risk:(a,b)=>b.risk-a.risk,rain:(a,b)=>(b.rain??-1)-(a.rain??-1),wind:(a,b)=>(b.gust??-1)-(a.gust??-1),temp:(a,b)=>(b.temp??-999)-(a.temp??-999),name:(a,b)=>a.name.localeCompare(b.name,'ne')};
 a.sort(cmp[sort]||cmp.risk);a=a.slice(0,count);
 if(!a.length){g.innerHTML='<div class="national-alert-empty">यो जोखिम सीमा अनुसार जिल्ला भेटिएन। slider घटाउनुहोस्।</div>';return}
 g.innerHTML=a.map(x=>{const l=level(x.risk),river=x.riverDanger?'🌊 नदी खतरा':x.riverWarning?'🌊 नदी चेतावनी':'';return '<button class="district-alert-card '+l+'" data-name="'+x.name+'"><div class="district-alert-top"><b>'+x.name+'</b><span>'+({critical:'🔴',warning:'🟠',advisory:'🟡',normal:'🟢'}[l])+' '+nf(x.risk)+'</span></div><div class="district-alert-data"><span>🌧️ '+nf(x.rain)+'%</span><span>💨 '+nf(x.gust)+' km/h</span><span>🌡️ '+nf(x.temp)+'°C</span></div><small>'+river+(river?' · ':'')+({critical:'गम्भीर संकेत',warning:'चेतावनी संकेत',advisory:'सावधानी',normal:'सामान्य'}[l])+'</small></button>'}).join('');
 g.querySelectorAll('[data-name]').forEach(b=>b.onclick=()=>location.href='jilla/weather.html?name='+encodeURIComponent(b.dataset.name));
 $('districtAlertMeta').textContent=rows.length+' जिल्ला · '+a.length+' देखाइँदै · '+new Date().toLocaleTimeString('ne-NP',{hour:'numeric',minute:'2-digit'});
}
async function scan(){
 const points=P(); if(!points.length){$('alertLiveBadge').textContent='डाटा उपलब्ध छैन';return}
 try{
  const groups=[];for(let i=0;i<points.length;i+=15)groups.push(points.slice(i,i+15));rows=[];
  for(const group of groups){const u=new URL('https://api.open-meteo.com/v1/forecast');u.search=new URLSearchParams({latitude:group.map(p=>p[1]).join(','),longitude:group.map(p=>p[2]).join(','),timezone:'Asia/Kathmandu',forecast_days:'1',current:'temperature_2m,wind_gusts_10m,wind_speed_10m',daily:'precipitation_probability_max'});const j=await(await fetch(u)).json(),a=Array.isArray(j)?j:[j];group.forEach((p,i)=>{const w=a[i]||{},x={name:p[0],lat:p[1],lon:p[2],temp:w.current?.temperature_2m,rain:w.daily?.precipitation_probability_max?.[0],gust:w.current?.wind_gusts_10m};x.risk=risk(x);rows.push(x)});render();await new Promise(r=>setTimeout(r,100))}
  let h={};try{h=await window.HydrologyData?.national?.()||{}}catch{}
  const riverStations=h.riverStations||[], rainfallStations=h.rainfallStations||[];
  const key=n=>String(n||'').trim().toLocaleLowerCase('ne').replace(/[\s\-_/]+/g,'');
  const match=(r,n)=>{const k=key(n);return [r.district,r.station,r.basin].some(v=>{const q=key(v);return q&&((q.includes(k)||k.includes(q)))})};
  rows=rows.map(x=>{const rs=riverStations.filter(r=>match(r,x.name));const rains=rainfallStations.filter(r=>match(r,x.name));const rainOfficial=rains.some(r=>Object.entries(th).some(([k,t])=>Number.isFinite(r[k])&&r[k]>=t));x.riverDanger=rs.some(r=>r.status==='danger');x.riverWarning=!x.riverDanger&&rs.some(r=>r.status==='warning');x.rainOfficial=rainOfficial;x.officialActive=x.riverDanger||x.riverWarning||rainOfficial;x.risk=risk(x);return x});
  const th=window.HydrologyData?.THRESHOLDS||{},hits=rainfallStations.filter(r=>Object.entries(th).some(([k,t])=>Number.isFinite(r[k])&&r[k]>=t));
  const max24=rainfallStations.map(r=>r.twentyFourHour).filter(Number.isFinite).reduce((m,v)=>Math.max(m,v),-Infinity);
  const strip=$('officialAlertMetrics');if(strip)strip.innerHTML='<div><small>नदी चेतावनी</small><b>'+nf(h.riverWarningCount||0)+'</b></div><div><small>नदी खतरा</small><b>'+nf(h.riverDangerCount||0)+'</b></div><div><small>वर्षा threshold</small><b>'+nf(hits.length)+'</b></div><div><small>अधिकतम २४h</small><b>'+(Number.isFinite(max24)?nf(max24)+' mm':'—')+'</b></div>';
  const src=$('officialAlertSource');if(src)src.textContent=h.sourceStatus==='LIVE'?'🟢 LIVE':h.sourceStatus==='PROXY'?'🟠 PROXY':'⚪ UNAVAILABLE';
  const meta=$('officialAlertMeta');if(meta)meta.textContent='DHM official monitoring · '+(h.checkedAt?new Date(h.checkedAt).toLocaleString('en-GB',{timeZone:'Asia/Kathmandu'}):'समय उपलब्ध छैन')+' · Thresholds 60/80/100/120/140 mm (1h/3h/6h/12h/24h)';
  render();
  $('alertLiveBadge').textContent='🟢 Live · '+rows.length+'/77'; $('alertProvinceMeta').textContent=(province==='all'?'७७ जिल्ला':province+' · '+(window.NEPAL_DISTRICTS_BY_PROVINCE?.[province]?.length||0)+' जिल्ला');try{localStorage.setItem('mausam_home_alerts_v1',JSON.stringify({at:Date.now(),rows}))}catch{}
 }catch(e){$('alertLiveBadge').textContent='⚠️ पुनः प्रयास आवश्यक'}
}
function boot(){insert();try{const c=JSON.parse(localStorage.getItem('mausam_home_alerts_v1')||'null');if(c?.rows?.length){rows=c.rows;render()}}catch{}scan();setInterval(scan,15*60*1000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();