(()=>{'use strict';
const API='https://www.usemiti.com/api/today';
const NP=['आइतबार','सोमबार','मंगलबार','बुधबार','बिहीबार','शुक्रबार','शनिबार'];
const MN=['बैशाख','जेठ','असार','साउन','भदौ','असोज','कार्तिक','मंसिर','पुस','माघ','फागुन','चैत'];
const el=id=>document.getElementById(id);
const nep=n=>String(n??'').replace(/\d/g,d=>'०१२३४५६७८९'[d]);
let serverToday=null,serverFetched=0;
function kathmanduNow(){return new Date(new Date().toLocaleString('en-US',{timeZone:'Asia/Kathmandu'}))}
function clock(){const d=kathmanduNow();const time=new Intl.DateTimeFormat('ne-NP',{timeZone:'Asia/Kathmandu',hour:'numeric',minute:'2-digit',second:'2-digit',hour12:true}).format(new Date());const ad=new Intl.DateTimeFormat('ne-NP',{timeZone:'Asia/Kathmandu',year:'numeric',month:'long',day:'numeric'}).format(new Date());let bs=serverToday;if(bs&&Math.floor((Date.now()-serverFetched)/86400000)>0)bs=null;const dateText=bs?`${nep(bs.day)} ${bs.monthName||bs.month_name_ne||''} ${nep(bs.year)}`:fallback(d);const dayText=bs?(bs.weekday_ne||bs.weekdayNepali||NP[d.getDay()]):NP[d.getDay()];if(el('npDate'))el('npDate').textContent=`${dateText}, ${dayText}`;if(el('adDate'))el('adDate').textContent=ad;if(el('npTime'))el('npTime').textContent=time;if(el('npTimeSub'))el('npTimeSub').textContent='नेपाल समय · Asia/Kathmandu';if(el('liveClock'))el('liveClock').textContent=`🇳🇵 ${time}`}
function fallback(d){const ad=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));if(d.getFullYear()===2026){const starts=[new Date('2026-04-14T00:00:00Z'),new Date('2026-05-15T00:00:00Z'),new Date('2026-06-15T00:00:00Z'),new Date('2026-07-17T00:00:00Z'),new Date('2026-08-17T00:00:00Z'),new Date('2026-09-17T00:00:00Z'),new Date('2026-10-18T00:00:00Z'),new Date('2026-11-17T00:00:00Z'),new Date('2026-12-16T00:00:00Z')];let m=starts.findLastIndex(x=>ad>=x);if(m>=0)return `${nep(2083)} ${MN[m]} ${nep(Math.floor((ad-starts[m])/86400000)+1)}`}return new Intl.DateTimeFormat('ne-NP',{timeZone:'Asia/Kathmandu',year:'numeric',month:'long',day:'numeric'}).format(new Date())}
async function sync(){try{const r=await fetch(API,{cache:'no-store'});if(!r.ok)throw Error('calendar');const x=await r.json();const b=x.bs||x.today?.bs||x.data?.bs||x;const year=Number(b.bsYear??b.year),month=Number(b.bsMonth??b.month),day=Number(b.bsDate??b.day);if(year&&month&&day){serverToday={year,month,day,monthName:b.monthName_ne||b.month_name_ne||b.monthName||MN[month-1],weekday_ne:b.weekday_ne||b.weekdayNepali};serverFetched=Date.now()}}catch{}clock()}
sync();clock();setInterval(clock,1000);setInterval(sync,3600000);
})();
