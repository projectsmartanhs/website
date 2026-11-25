/* Home page landing: photo hero, key numbers, and a live weather and hazard card for Alcantara, Romblon.
   Weather comes from Open-Meteo (free, no key). It is an indicative summary, not an official PAGASA advisory. */
(function(){
"use strict";
const page=document.getElementById("page-dashboard"),content=document.querySelector(".main-area .page-content");
if(!page||!content)return;
const LAT=12.2578,LON=122.0542; /* Alcantara National High School (from Google Maps) */
const el=document.createElement("section");el.id="homeLanding";
el.innerHTML=`
<div class="home-hero">
  <div class="hero-photo" id="heroPhoto"></div>
  <div class="home-hero-in">
    <span class="home-pill"><i></i>DepEd Region IV-B MIMAROPA · Division of Romblon</span>
    <h2>ALCANTARA<em>NATIONAL HIGH SCHOOL</em></h2>
    <p>Nurturing Minds, Cultivating Character, Empowering Romblomanon Youth. An institution shaping empowered, productive, and values-driven Romblomanon learners since 1968.</p>
  </div>
  <div class="hero-admin"><label class="hero-adm-btn">Change photo<input type="file" id="heroFile" accept="image/*" hidden></label><button type="button" class="hero-adm-btn" id="heroReset">Use default</button></div>
</div>
<div class="home-wx"><div class="wx" id="wx"><p class="wx-load">Loading weather for Alcantara…</p></div></div>`;
content.parentNode.insertBefore(el,content);
/* the tagline is click-to-edit for admins, saved with the other editable texts */
const tag=el.querySelector(".home-hero-in p");
if(tag&&typeof TE!=="undefined"&&typeof texts!=="undefined"){
  const o={el:tag,key:"home|tagline",orig:tag.textContent.trim()};
  TE.push(o);
  if(texts[o.key]!==undefined)tag.textContent=texts[o.key];
  tag.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();tag.blur()}});
  tag.addEventListener("blur",()=>{if(!isAdmin)return;const t=tag.textContent.trim();if(t!==(texts[o.key]??o.orig)){texts[o.key]=t;persist()}});
  if(isAdmin){tag.setAttribute("contenteditable","true");tag.classList.add("adm-edit")}
}
const sync=()=>{el.hidden=!page.classList.contains("active")};
new MutationObserver(sync).observe(page,{attributes:true,attributeFilter:["class"]});sync();
/* hero buttons reuse the app's own page links */
el.addEventListener("click",e=>{const b=e.target.closest("[data-home]");if(!b)return;
  const t=document.querySelector('[data-go="'+b.dataset.home+'"]');if(t)t.click()});

/* footer: the school address opens the location on Google Maps (done after the editable texts are registered) */
const addr=document.querySelector(".site-footer .foot-contact li span");
if(addr&&!addr.querySelector("a")){
  const a=document.createElement("a");a.className="foot-addr";a.target="_blank";a.rel="noopener";
  a.href="https://www.google.com/maps/place/Alcantara+National+High+School/@12.2578906,122.0517105,17.12z/data=!4m6!3m5!1s0x33a4e1ca7c804367:0x8fb541cb60a7b911!8m2!3d12.2578004!4d122.0541852!16s%2Fg%2F11pz53kzd3";a.title="Open in Google Maps";
  while(addr.firstChild)a.appendChild(addr.firstChild);addr.appendChild(a);
  a.addEventListener("click",e=>{if(typeof isAdmin!=="undefined"&&isAdmin)e.preventDefault()}); /* admins click to edit, not to open */
}

/* ---- weather and hazard card ---- */
const wx=document.getElementById("wx");
const ICON=c=>c===0?["☀️","Clear"]:c===1?["🌤️","Mostly clear"]:c===2?["⛅","Partly cloudy"]:c===3?["☁️","Overcast"]:c<=48?["🌫️","Foggy"]:c<=57?["🌦️","Drizzle"]:c<=67?["🌧️","Rain"]:c<=82?["🌧️","Rain showers"]:["⛈️","Thunderstorm"];
const LV=["Low","Moderate","High"],CL=["lo","mo","hi"];
const lvl=(v,a,b)=>v<a?0:v<b?1:2;
const ACT=["No major hazards expected. Continue normal activities and keep an eye on PAGASA advisories.",
  "Stay alert. Secure loose outdoor items and keep monitoring PAGASA advisories.",
  "Take precautions. Follow DepEd and local officials' announcements on class suspensions."];
const URL_="https://api.open-meteo.com/v1/forecast?latitude="+LAT+"&longitude="+LON+
  "&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m"+
  "&hourly=precipitation,wind_gusts_10m,apparent_temperature"+
  "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=5&timezone=Asia%2FManila";
async function load(){
  try{
    const r=await fetch(URL_);if(!r.ok)throw new Error("bad response");
    const d=await r.json(),c=d.current,h=d.hourly,dy=d.daily;
    let i=h.time.findIndex(t=>t>=c.time.slice(0,13)+":00");if(i<0)i=0;
    const mx=a=>Math.max(...a.slice(i,i+24));
    const rain=mx(h.precipitation),gust=mx(h.wind_gusts_10m),heat=mx(h.apparent_temperature);
    const L=[lvl(rain,7.5,15),lvl(gust,40,62),lvl(heat,33,42)],all=Math.max(...L),[ic,desc]=ICON(c.weather_code);
    const row=(icon,name,val,l)=>`<div class="wx-row"><span class="wx-ri">${icon}</span><div><b>${name}</b><small>${val}</small></div><em class="${CL[l]}">${LV[l]}</em></div>`;
    const days=dy.time.map((t,k)=>{const [x]=ICON(dy.weather_code[k]);
      const n=k===0?"Today":new Date(t+"T12:00:00").toLocaleDateString("en-US",{weekday:"short"});
      return `<div class="wx-day"><span>${n}</span><i>${x}</i><b>${Math.round(dy.temperature_2m_max[k])}° <s>/ ${Math.round(dy.temperature_2m_min[k])}°</s></b><small>💧 ${dy.precipitation_probability_max[k]}%</small></div>`}).join("");
    wx.innerHTML=`
<div class="wx-top"><div><small>📍 WEATHER AND HAZARD WATCH · ALCANTARA, ROMBLON</small><h3>Next 24 hours · Alcantara National High School</h3></div><span class="wx-risk ${CL[all]}">Overall risk: ${LV[all]}</span></div>
<div class="wx-main">
  <div class="wx-now"><small>RIGHT NOW</small><div class="wx-temp"><i>${ic}</i><b>${Math.round(c.temperature_2m)}<sup>°C</sup></b></div><p>${desc}</p>
    <div class="wx-mini"><span>Feels ${Math.round(c.apparent_temperature)}°</span><span>💧 ${Math.round(c.relative_humidity_2m)}%</span><span>${Math.round(c.wind_speed_10m)} km/h</span></div></div>
  <div class="wx-haz"><small>HAZARD SUMMARY</small>
    ${row("🌧️","Heavy rainfall","Up to "+rain.toFixed(1)+" mm/hr",L[0])}
    ${row("💨","Strong winds","Gusts up to "+Math.round(gust)+" km/h",L[1])}
    ${row("🌡️","Heat (feels like)","Up to "+Math.round(heat)+"°C",L[2])}
    <div class="wx-act"><small>RECOMMENDED ACTION</small><p>${ACT[all]}</p></div></div>
</div>
<div class="wx-out"><small>5-DAY OUTLOOK</small><div class="wx-days">${days}</div></div>
<div class="wx-links"><a href="https://panahon.gov.ph" target="_blank" rel="noopener">PAGASA PANaHON ↗</a><a href="https://www.pagasa.dost.gov.ph" target="_blank" rel="noopener">PAGASA forecast ↗</a></div>
<p class="wx-note">Indicative summary based on Open-Meteo forecast data, using PAGASA-style rainfall, wind, and heat bands. It is not an official advisory. Warnings, class suspensions, and resumptions are announced by PAGASA, DepEd, and local officials. Updated ${new Date().toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"})}.</p>`;
  }catch(err){
    wx.innerHTML='<p class="wx-load">Weather is not available right now. Please check <a href="https://panahon.gov.ph" target="_blank" rel="noopener">PAGASA PANaHON</a> for official updates.</p>';
  }
}
load();setInterval(load,30*60*1000);
})();
