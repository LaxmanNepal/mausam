(()=>{'use strict';
const W='https://api.open-meteo.com/v1/forecast',AQ='https://air-quality-api.open-meteo.com/v1/air-quality',G='https://nominatim.openstreetmap.org/search';
const $=id=>document.getElementById(id), N=v=>v==null?'—':Number(v).toLocaleString('ne-NP',{maximumFractionDigits:1}), fmt=v=>new Intl.NumberFormat('ne-NP').format(v), dayNames=['आइतबार','सोमबार','मंगलबार','बुधबार','बिहीबार','शुक्रबार','शनिबार'], monthNames=['बैशाख','जेठ','असार','साउन','भदौ','असोज','कात्तिक','मंसिर','पुस','माघ','फागुन','चैत'];
// Accuracy patch: preserve API decimals instead of rounding every weather value.
})();