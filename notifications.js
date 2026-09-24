(()=>{'use strict';
const KEY='mausam_alert_state_v1',read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}},write=x=>{try{localStorage.setItem(KEY,JSON.stringify(x))}catch{}};
async function enable(){if(!('Notification'in window))throw Error('यो browser मा notification उपलब्ध छैन।');const p=await Notification.requestPermission();if(p!=='granted')throw Error('Notification अनुमति दिइएन।');const s=read();write({...s,push:true,enabledAt:Date.now()});if(navigator.serviceWorker?.ready)await navigator.serviceWorker.ready;return true}
function disable(){const s=read();write({...s,push:false})}
function get(){return read()}
function test(){if(Notification.permission==='granted')navigator.serviceWorker?.ready.then(r=>r.showNotification('🌦️ मौसम notification test',{body:'मौसमका महत्वपूर्ण alert यहाँ देखिनेछन्।',tag:'mausam-test'}))}
window.MausamNotifications={enable,disable,get,test};
})();