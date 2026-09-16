(()=>{'use strict';
const API='https://www.usemiti.com/api/today';
const NP=['आइतबार','सोमबार','मंगलबार','बुधबार','बिहीबार','शुक्रबार','शनिबार'];
const MN=['बैशाख','जेठ','असार','साउन','भदौ','असोज','कार्तिक','मंसिर','पुस','माघ','फागुन','चैत'];
const el=id=>document.getElementById(id),nep=n=>String(n??'').replace(/\d/g,d=>'०१२३४५६७८९'[d]);
let bs=null,bsStamp=0;
function kt(){return new Date(new Date().toLocaleString('en-US',{timeZone:'Asia/Kathmandu'}))}
function adParts(){return new Intl.DateTimeFormat('ne-NP',{timeZone:'Asia/Kathmandu',year:'numeric',month:'long',day:'numeric'}).format(new Date())}
function timeText(){return new Intl.DateTimeFormat('ne-NP',{timeZone:'Asia/Kathmandu',hour:'numeric',minute:'2-digit',second:'2-digit',hour12:true}).format(new Date())}
function paint(){const d=kt(),t=timeText();let date='';let wd=NP[d.getDay()];if(bs){date=`${nep(bs.day)} ${bs.monthName} ${nep(bs.year)}`;wd=bs.weekday||wd}else date=fallback(d);if(el('npDate'))el('npDate').textContent=`${date}, ${wd}`;if(el('adDate'))el('adDate').textContent=`ई.सं. ${adParts()}`;if(el('npTime'))el('npTime').textContent=t;if(el('npTimeSub'))el('npTimeSub').textContent='नेपाल समय · Asia/Kathmandu';if(el('liveClock'))el('liveClock').textContent=`🇳🇵 ${t} · ${date}`}
function fallback(d){const y=d.getFullYear(),m=d.getMonth(),day=d.getDate();if(y===2026){const starts=[['बैशाख',14,1],['जेठ',15,2],['असार',15,3],['साउन',17,4],['भदौ',17,5],['असोज',17,6],['कार्तिक',18,7],['मंसिर',17,8],['पुस',16,9]];const cur=new Date(y,m,day);for(let i=starts.length-1;i>=0;i--){const [name,dd]=starts[i],sm=i+3;const start=new Date(y,sm,dd);if(cur>=start)return `${nep(2083)} ${name} ${nep(Math.floor((cur-start)/86400000)+1)}`}}return 'नेपाली मिति उपलब्ध हुँदैछ…'}
function cache(){try{const x=JSON.parse(localStorage.getItem('mausam_bs_today')||'null');return x&&x.year&&x.day?x:null}catch{return null}}
async function sync(){try{const r=await fetch(API,{cache:'no-store'});if(!r.ok)throw Error();const x=await r.json(),b=x.bs||x.today?.bs||x.data?.bs||x;const year=Number(b.bsYear??b.year),month=Number(b.bsMonth??b.month),day=Number(b.bsDate??b.day);if(year&&month&&day){bs={year,month,day,monthName:b.monthName_ne||b.month_name_ne||b.monthName||MN[month-1],weekday:b.weekday_ne||b.weekdayNepali||null};bsStamp=Date.now();localStorage.setItem('mausam_bs_today',JSON.stringify(bs))}}catch{if(!bs)bs=cache()}paint()}
bs=cache();paint();sync();setInterval(paint,1000);setInterval(sync,3600000);
})();
