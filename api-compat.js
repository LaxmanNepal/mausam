(()=>{'use strict';
/* API compatibility layer: keeps the existing UI working with current Open-Meteo/Nominatim behaviour. */
const nativeFetch=window.fetch.bind(window);
const jsonResponse=(data,base)=>new Response(JSON.stringify(data),{status:200,headers:{'Content-Type':'application/json',...(base?{'X-Mausam-Source':'compat'}:{})}});
const hourKey=s=>String(s||'').slice(0,13);
window.fetch=async function(input,init){
  const raw=typeof input==='string'?input:(input&&input.url)||'';
  if(!raw)return nativeFetch(input,init);
  try{
    const u=new URL(raw,location.href);
    if(u.hostname==='api.open-meteo.com'&&u.pathname==='/v1/forecast'){
      const current=(u.searchParams.get('current')||'').split(',').filter(Boolean);
      const hourly=(u.searchParams.get('hourly')||'').split(',').filter(Boolean);
      if(current.includes('visibility')){
        u.searchParams.set('current',current.filter(v=>v!=='visibility').join(','));
        if(!hourly.includes('visibility'))hourly.push('visibility');
        u.searchParams.set('hourly',hourly.join(','));
      }
      u.searchParams.set('timezone','auto');
      const r=await nativeFetch(u.toString(),init);
      if(!r.ok)return r;
      const data=await r.json();
      if(data.current&&data.hourly&&Array.isArray(data.hourly.time)&&Array.isArray(data.hourly.visibility)){
        const key=hourKey(data.current.time);
        let i=data.hourly.time.findIndex(t=>hourKey(t)===key);
        if(i<0)i=0;
        data.current.visibility=data.hourly.visibility[i];
      }
      return jsonResponse(data,r);
    }
    if(u.hostname==='air-quality-api.open-meteo.com'){
      u.searchParams.set('timezone','auto');
      return nativeFetch(u.toString(),init);
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
  }catch(e){
    console.warn('Mausam API compatibility fallback:',e);
  }
  return nativeFetch(input,init);
};
})();
