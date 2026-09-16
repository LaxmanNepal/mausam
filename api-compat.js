(()=>{'use strict';
/* API compatibility layer for Open-Meteo/Nominatim. */
const nativeFetch=window.fetch.bind(window);
const jsonResponse=data=>new Response(JSON.stringify(data),{status:200,headers:{'Content-Type':'application/json'}});
const hourKey=s=>String(s||'').slice(0,13);
window.fetch=async function(input,init){
  const raw=typeof input==='string'?input:(input&&input.url)||'';
  if(!raw)return nativeFetch(input,init);
  try{
    const u=new URL(raw,location.href);
    if(u.hostname==='api.open-meteo.com'&&u.pathname==='/v1/forecast'){
      const current=(u.searchParams.get('current')||'').split(',').filter(Boolean);
      const hourly=(u.searchParams.get('hourly')||'').split(',').filter(Boolean);
      const moved=current.filter(v=>v==='visibility'||v==='dew_point_2m');
      const safeCurrent=current.filter(v=>v!=='visibility'&&v!=='dew_point_2m');
      moved.forEach(v=>{if(!hourly.includes(v))hourly.push(v)});
      u.searchParams.set('current',safeCurrent.join(','));
      u.searchParams.set('hourly',hourly.join(','));
      u.searchParams.set('timezone','auto');
      const r=await nativeFetch(u.toString(),init);
      if(!r.ok)return r;
      const data=await r.json();
      if(data.current&&data.hourly&&Array.isArray(data.hourly.time)){
        const key=hourKey(data.current.time);
        let i=data.hourly.time.findIndex(t=>hourKey(t)===key);
        if(i<0)i=0;
        ['visibility','dew_point_2m'].forEach(v=>{
          if(Array.isArray(data.hourly[v]))data.current[v]=data.hourly[v][i];
        });
      }
      return jsonResponse(data);
    }
    if(u.hostname==='air-quality-api.open-meteo.com'){
      u.searchParams.set('timezone','auto');
      try{return await nativeFetch(u.toString(),init)}catch(e){
        const now=new Date();
        const t=new Date(now.getTime()-now.getTimezoneOffset()*60000).toISOString().slice(0,13)+':00';
        return jsonResponse({hourly:{time:[t],pm2_5:[null],pm10:[null],european_aqi:[null]}});
      }
    }
    if(u.hostname==='nominatim.openstreetmap.org'&&u.pathname==='/search'){
      const original=u.searchParams.get('q')||'';
      const r=await nativeFetch(u.toString(),init);
      if(!r.ok)return r;
      const data=await r.clone().json();
      if(Array.isArray(data)&&data.length)return r;
      if(/,\s*Nepal\s*$/i.test(original)){
        const fallback=new URL(u.toString());
        fallback.searchParams.set('q',original.replace(/,\s*Nepal\s*$/i,''));
        const fr=await nativeFetch(fallback.toString(),init);
        if(fr.ok)return fr;
      }
      return r;
    }
  }catch(e){console.warn('Mausam API compatibility fallback:',e)}
  return nativeFetch(input,init);
};
})();
