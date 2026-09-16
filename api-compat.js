(()=>{'use strict';
/* Stable Open-Meteo adapter: request hourly+daily only, then build current conditions locally. */
const nativeFetch=window.fetch.bind(window);
const jsonResponse=data=>new Response(JSON.stringify(data),{status:200,headers:{'Content-Type':'application/json'}});
const hourKey=s=>String(s||'').slice(0,13);
const emptyAQI=()=>({hourly:{time:['2000-01-01T00:00'],pm2_5:[null],pm10:[null],european_aqi:[null]}});
const currentFromHourly=(data)=>{
  if(!data||!data.hourly||!Array.isArray(data.hourly.time)||!data.hourly.time.length)return data;
  const offset=Number(data.utc_offset_seconds||0);
  const localNow=new Date(Date.now()+offset*1000);
  const key=localNow.toISOString().slice(0,13);
  let i=data.hourly.time.findIndex(t=>hourKey(t)===key);
  if(i<0)i=0;
  const h=data.hourly;
  const pick=v=>Array.isArray(h[v])?h[v][i]:null;
  data.current={time:h.time[i],temperature_2m:pick('temperature_2m'),relative_humidity_2m:pick('relative_humidity_2m'),apparent_temperature:pick('apparent_temperature'),is_day:pick('is_day'),precipitation:pick('precipitation'),rain:pick('rain'),weather_code:pick('weather_code'),cloud_cover:pick('cloud_cover'),pressure_msl:pick('pressure_msl'),surface_pressure:pick('surface_pressure'),wind_speed_10m:pick('wind_speed_10m'),wind_direction_10m:pick('wind_direction_10m'),visibility:pick('visibility'),dew_point_2m:pick('dew_point_2m')};
  return data;
};
window.fetch=async function(input,init){
  const raw=typeof input==='string'?input:(input&&input.url)||'';
  if(!raw)return nativeFetch(input,init);
  try{
    const u=new URL(raw,location.href);
    if(u.hostname==='api.open-meteo.com'&&u.pathname==='/v1/forecast'){
      const retry=new URL(u.toString());
      retry.searchParams.delete('current');
      retry.searchParams.set('timezone','auto');
      retry.searchParams.set('hourly','temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,visibility,dew_point_2m,is_day,precipitation_probability,uv_index');
      retry.searchParams.set('daily','weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,precipitation_sum,rain_sum,precipitation_probability_max,wind_speed_10m_max,uv_index_max,sunrise,sunset');
      let r=await nativeFetch(retry.toString(),init);
      if(!r.ok){
        const minimal=new URL(retry.toString());
        minimal.searchParams.set('hourly','temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,visibility,dew_point_2m,is_day');
        minimal.searchParams.set('daily','weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset');
        r=await nativeFetch(minimal.toString(),init);
      }
      if(!r.ok)throw Error('Open-Meteo HTTP '+r.status);
      return jsonResponse(currentFromHourly(await r.json()));
    }
    if(u.hostname==='air-quality-api.open-meteo.com'){
      u.searchParams.set('timezone','auto');
      try{
        let r=await nativeFetch(u.toString(),init);
        if(r.ok)return r;
        const retry=new URL(u.toString());retry.searchParams.set('hourly','pm2_5,pm10');
        r=await nativeFetch(retry.toString(),init);return r.ok?r:jsonResponse(emptyAQI());
      }catch(e){return jsonResponse(emptyAQI())}
    }
    if(u.hostname==='nominatim.openstreetmap.org'&&u.pathname==='/search'){
      const original=u.searchParams.get('q')||'';
      let r=await nativeFetch(u.toString(),init);
      if(r.ok){const data=await r.clone().json().catch(()=>[]);if(Array.isArray(data)&&data.length)return r}
      if(/,\s*Nepal\s*$/i.test(original)){
        const fallback=new URL(u.toString());fallback.searchParams.set('q',original.replace(/,\s*Nepal\s*$/i,''));r=await nativeFetch(fallback.toString(),init);if(r.ok)return r;
      }
      return jsonResponse([],200);
    }
  }catch(e){console.warn('Mausam API adapter:',e)}
  return nativeFetch(input,init);
};
})();
