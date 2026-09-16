(()=>{'use strict';
/* Resilient API layer: keeps the UI alive when an optional API fails. */
const nativeFetch=window.fetch.bind(window);
const jsonResponse=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}});
const hourKey=s=>String(s||'').slice(0,13);
const emptyAQI=()=>{const now=new Date();const t=new Date(now.getTime()-now.getTimezoneOffset()*60000).toISOString().slice(0,13)+':00';return {hourly:{time:[t],pm2_5:[null],pm10:[null],european_aqi:[null]}}};
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
      let r=await nativeFetch(u.toString(),init);
      if(!r.ok){
        /* Retry with a deliberately minimal known-good request. */
        const retry=new URL(u.toString());
        retry.searchParams.set('current','temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m');
        retry.searchParams.set('hourly','temperature_2m,apparent_temperature,precipitation_probability,precipitation,rain,weather_code,cloud_cover,wind_speed_10m,uv_index,visibility,dew_point_2m');
        r=await nativeFetch(retry.toString(),init);
      }
      if(!r.ok)return r;
      const data=await r.json();
      if(data.current&&data.hourly&&Array.isArray(data.hourly.time)){
        const key=hourKey(data.current.time);
        let i=data.hourly.time.findIndex(t=>hourKey(t)===key);
        if(i<0)i=0;
        ['visibility','dew_point_2m'].forEach(v=>{if(Array.isArray(data.hourly[v]))data.current[v]=data.hourly[v][i]});
      }
      return jsonResponse(data);
    }
    if(u.hostname==='air-quality-api.open-meteo.com'){
      u.searchParams.set('timezone','auto');
      try{
        let r=await nativeFetch(u.toString(),init);
        if(r.ok)return r;
        const retry=new URL(u.toString());
        retry.searchParams.delete('european_aqi');
        retry.searchParams.set('hourly','pm2_5,pm10');
        r=await nativeFetch(retry.toString(),init);
        return r.ok?r:jsonResponse(emptyAQI());
      }catch(e){return jsonResponse(emptyAQI())}
    }
    if(u.hostname==='nominatim.openstreetmap.org'&&u.pathname==='/search'){
      const original=u.searchParams.get('q')||'';
      let r=await nativeFetch(u.toString(),init);
      if(r.ok){
        const data=await r.clone().json().catch(()=>[]);
        if(Array.isArray(data)&&data.length)return r;
      }
      if(/,\s*Nepal\s*$/i.test(original)){
        const fallback=new URL(u.toString());
        fallback.searchParams.set('q',original.replace(/,\s*Nepal\s*$/i,''));
        r=await nativeFetch(fallback.toString(),init);
        if(r.ok)return r;
      }
      return jsonResponse([],200);
    }
  }catch(e){console.warn('Mausam API compatibility fallback:',e)}
  return nativeFetch(input,init);
};
})();
