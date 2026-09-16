(()=>{'use strict';
const $=id=>document.getElementById(id);
const nepaliDigits=s=>String(s).replace(/\d/g,d=>'०१२३४५६७८९'[d]);
function clock(){const el=$('liveClock');if(!el)return;const now=new Date();el.textContent=now.toLocaleTimeString('ne-NP',{hour:'numeric',minute:'2-digit',second:'2-digit',hour12:true})}
function network(){const el=$('networkStatus');if(!el)return;el.textContent=navigator.onLine?'🟢 अनलाइन':'🔴 अफलाइन';el.className=navigator.onLine?'online':'offline'}
function install(){let promptEvent=null;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();promptEvent=e;const b=$('installBtn');if(b)b.hidden=false});const b=$('installBtn');if(b)b.onclick=async()=>{if(!promptEvent)return;promptEvent.prompt();await promptEvent.userChoice;promptEvent=null;b.hidden=true}}
function top(){const b=$('topBtn');if(!b)return;window.addEventListener('scroll',()=>b.classList.toggle('show',scrollY>500),{passive:true});b.onclick=()=>scrollTo({top:0,behavior:'smooth'})}
function boot(){clock();setInterval(clock,1000);network();addEventListener('online',network);addEventListener('offline',network);install();top();
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)clock()});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();