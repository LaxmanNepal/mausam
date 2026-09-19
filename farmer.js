(()=>{'use strict';
const SNAP='mausam_weather_snapshot_v1';
const crops={
  general:{name:'सामान्य बाली',rain:60,heat:34},
  rice:{name:'धान',rain:70,heat:34},
  maize:{name:'मकै',rain:60,heat:33},
  wheat:{name:'गहुँ',rain:55,heat:30},
  vegetable:{name:'तरकारी',rain:55,heat:32},
  fruit:{name:'फलफूल',rain:50,heat:33}
};
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function get(){try{return JSON.parse(localStorage.getItem(SNAP)||'null')}catch{return null}}
function data(){const s=get();return s?.data?s:null}
function nowIndex(times){if(!Array.isArray(times)||!times.length)return 0;const n=Date.now();const i=times.findIndex(x=>new Date(x).getTime()>=n);return i<0?times.length-1:i}
function weatherText(c){return ({0:'सफा',1:'मुख्यतया सफा',2:'आंशिक बादल',3:'बादल',45:'कुहिरो',48:'कुहिरो',51:'हल्का झरी',53:'झरी',55:'घना झरी',61:'हल्का वर्षा',63:'वर्षा',65:'भारी वर्षा',71:'हिमपात',73:'हिमपात',75:'भारी हिमपात',80:'छिटपुट वर्षा',81:'वर्षा',82:'तीव्र वर्षा',95:'मेघगर्जन',96:'असिना',99:'असिना'}[c]||'परिवर्तनशील')}
function values(){const s=data();if(!s)return null;const d=s.data||{},c=d.current||{},h=d.hourly||{},di=d.daily||{},i=nowIndex(h.time);const rain=Number(di.precipitation_probability_max?.[0]??h.precipitation_probability?.[i]??0);const precip=Number(di.precipitation_sum?.[0]??0);const temp=Number(c.temperature_2m);const hum=Number(c.relative_humidity_2m);const wind=Number(c.wind_speed_10m);const uv=Number(di.uv_index_max?.[0]??h.uv_index?.[i]??0);const next=h.precipitation_probability||[];const rain48=Math.max(...next.slice(i,i+48).map(Number),rain);return {s,d,c,h,di,i,rain,precip,temp,hum,wind,uv,rain48}}
function status(kind,v,crop){const {rain,temp,wind,hum}=v;let good=false,warn=false;
if(kind==='plant')good=rain>=25&&rain<=80,warn=rain<15||rain>85;
if(kind==='irrigate')good=rain<30,warn=rain>=60;
if(kind==='dry')good=rain<25&&wind<35,warn=rain>=40||wind>=45;
if(kind==='spray')good=rain<20&&wind<20,warn=rain>=30||wind>=25;
if(kind==='livestock')good=temp>=10&&temp<32&&wind<35,warn=temp>=35||wind>=45;
if(crop.key==='wheat'&&kind==='plant')good=rain>=15&&rain<=55,warn=rain>70;
if(good)return['अनुकूल','good'];if(warn)return['टार्नुहोस्','bad'];return['सावधानी','warn']}
function card(icon,title,kind,v,crop,detail){const [label,cls]=status(kind,v,crop);return '<article class="farmer-card"><div class="farmer-card-head"><span>'+icon+'</span><div><b>'+title+'</b><small>'+detail+'</small></div><strong class="farmer-'+cls+'">'+label+'</strong></div><p>'+({plant:'माटोको चिस्यान र स्थानीय खेत अवस्थासँग मिलाएर निर्णय गर्नुहोस्।',irrigate:'वर्षा पूर्वानुमान कम हुँदा मात्र आवश्यकताअनुसार सिंचाइ विचार गर्नुहोस्।',dry:'कटानीपछिको सुकाउने काममा वर्षा र हावाको अवस्था हेर्नुहोस्।',spray:'वर्षा र तेज हावाले स्प्रे प्रभाव घटाउन सक्छ; लेबल निर्देशन पालना गर्नुहोस्।',livestock:'छायाँ, सफा पानी र हावाबाट सुरक्षित ठाउँको व्यवस्था गर्नुहोस्।'}[kind])+'</p></article>'}
function advice(v,crop){if(v.rain>=70)return'☔ आज/छिट्टै वर्षाको सम्भावना उच्च छ — स्प्रे र बाहिर सुकाउने काममा सावधानी।';if(v.wind>=35)return'💨 हावा तेज हुन सक्छ — स्प्रे तथा हल्का सामग्री बाहिर राख्ने काममा सावधानी।';if(v.temp>=35)return'🌡️ गर्मी धेरै हुन सक्छ — पशुपालनमा पानी र छायाँमा विशेष ध्यान दिनुहोस्।';if(v.rain<20&&v.temp>=15&&v.temp<34)return'💧 वर्षा सम्भावना कम छ — खेतको अवस्था हेरेर सिंचाइ आवश्यक छ कि छैन जाँच्नुहोस्।';return'🌱 आजको निर्णय स्थानीय माटो, बालीको अवस्था र वास्तविक खेत निरीक्षणसँग मिलाउनुहोस्।'}
function render(v){const host=$('farmerWeather');if(!host||!v)return;if(!$('farmerCrop'))return;const crop=crops[$('farmerCrop').value]||crops.general;host.innerHTML='<div class="section-head"><div><h2>🌾 किसान मोड</h2><p class="muted">मौसमका आधारमा दैनिक खेती गतिविधिका संकेत।</p></div><span class="pill">'+esc(crop.name)+'</span></div><div class="farmer-summary"><div><span>📍 स्थान</span><b>'+esc(v.s.name||'चयन गरिएको स्थान')+'</b></div><div><span>🌡️ तापक्रम</span><b>'+v.temp.toFixed(1)+'°C</b></div><div><span>☔ वर्षा सम्भावना</span><b>'+v.rain+'%</b></div><div><span>💧 आर्द्रता</span><b>'+v.hum+'%</b></div><div><span>💨 हावा</span><b>'+v.wind.toFixed(1)+' km/h</b></div><div><span>☀️ UV</span><b>'+v.uv.toFixed(1)+'</b></div></div><div class="farmer-advice"><b>आजको किसान सल्लाह</b><p>'+advice(v,crop)+'</p></div><div class="farmer-controls"><label>🌾 बाली <select id="farmerCrop"><option value="general">सामान्य बाली</option><option value="rice">धान</option><option value="maize">मकै</option><option value="wheat">गहुँ</option><option value="vegetable">तरकारी</option><option value="fruit">फलफूल</option></select></label></div><div class="farmer-grid">'+card('🌱','रोपाइँ / बिउ रोप्ने','plant',v,crop,'वर्षा संकेत हेरेर')+card('💧','सिंचाइ','irrigate',v,crop,'वर्षा सम्भावना अनुसार')+card('🌾','बाली सुकाउने','dry',v,crop,'घाम/वर्षा/हावा')+card('🧴','स्प्रे / औषधि छर्कने','spray',v,crop,'वर्षा र हावा हेरेर')+card('🐄','पशुपालन','livestock',v,crop,'गर्मी/हावा हेरेर')+'</div><p class="farmer-note">ℹ️ यो Open-Meteo मौसम डाटामा आधारित सामान्य संकेत मात्र हो; बाली रोग, मल/औषधि मात्रा, सिंचाइ मात्रा वा सरकारी कृषि सल्लाहको विकल्प होइन।</p>';
$('farmerCrop').value=Object.keys(crops).includes(crop.key)?crop.key:'general';$('farmerCrop').addEventListener('change',()=>render(values()))}
function mount(){if($('farmerWeather'))return;const anchor=$('mountainWeather')||$('travelWeather')||$('app');if(!anchor)return;const sec=document.createElement('section');sec.id='farmerWeather';sec.className='card farmer-weather';anchor.parentNode.insertBefore(sec,anchor.nextSibling);const v=values();if(v)render(v);else sec.innerHTML='<div class="farmer-empty">🌾 मौसम स्थान छानेपछि किसान मोड उपलब्ध हुनेछ।</div>'}
function refresh(){const v=values();if(v)render(v)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
window.addEventListener('mausam-weather-loaded',()=>{mount();refresh()});
window.addEventListener('storage',refresh);
})();