/* Search Portal: searches every module, record, table row, calendar activity, report, and page.
   The index is rebuilt each time the search opens, so admin edits are always included. */
(function(){
"use strict";
const q$=s=>document.querySelector(s);
const E=v=>String(v==null?"":v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const S=v=>v==null?"":String(v);

/* Each source: how to reach its data, its page title, and the route used by goTo().
   Wrapped in try/catch below, so one missing or broken module never breaks the search. */
const SOURCES=[
  {mod:"Smart Teacher",   route:"teacher:",     def:()=>TDEF, data:()=>tchData, title:k=>TDEF[k].title,   st:()=>tst,  inp:"tuiQ"},
  {mod:"Smart Instruction",route:"instruction:",def:()=>IDEF, data:()=>insData, title:k=>IDEF[k].title,   st:()=>ist,  inp:"iuiQ"},
  {mod:"Smart Project",   route:"project:",     def:()=>PDEF, data:()=>prjData, title:k=>PDEF[k].title,   st:()=>pst,  inp:"puiQ"},
  {mod:"Smart Resource",  route:"resource:",    def:()=>RDEF, data:()=>resData, title:k=>RDEF[k].title,   st:()=>rst,  inp:"ruiQ"},
  {mod:"Smart Decision",  route:"decision:",    def:()=>DDEF, data:()=>decData, title:k=>dmeta(k)[0],     st:()=>dst,  inp:"duiQ"},
  {mod:"Smart Admin",     route:"adm:",         def:()=>AMDEF,data:()=>amData,  title:k=>ammeta(k)[0],    st:()=>amst, inp:"amQ"},
  {mod:"Smart Learner",   route:"lrn:",         def:()=>LMDEF,data:()=>lmData,  title:k=>lmmeta(k)[0],    st:()=>lmst, inp:"lmQ"}
];
const SECTION={main:"Records",aux:"Supporting table",refs:"References",check:"Checklist",tiles:"Summary",decide:"Decision areas",roles:"Roles and access",notices:"Notices and documents"};

function buildIndex(){
  const items=[];
  const add=(mod,page,title,body,route,extra)=>{
    title=S(title).trim();if(!title)return;
    body=S(body).trim();
    items.push(Object.assign({mod,page,title,body,route,hay:(title+" "+body+" "+page+" "+mod).toLowerCase(),tl:title.toLowerCase()},extra||{}));
  };

  /* 1. Pages */
  const PAGES=[["Home","Dashboard, school indicators, and the SMART modules at a glance.","dashboard"],
    ["Reports and documents","Prepare school performance, learner, personnel, and project reports.","reports"],
    ["Settings","Demo settings for this preview.","settings"],
    ["Data Privacy & AI Safeguards","Privacy notices, roles and access, and AI safeguards.","privacy"]];
  PAGES.forEach(p=>add("Portal","Page",p[0],p[1],p[2]));

  /* 2. Report cards on the Reports page */
  try{document.querySelectorAll("#page-reports .report-card").forEach(c=>{
    const h=c.querySelector("h3"),p=c.querySelector("p");
    if(h)add("Reports","Report",h.textContent,p?p.textContent:"","reports");
  })}catch(e){}

  /* 3. Module landing pages: description, summary tiles, sample records, feature list */
  try{Object.keys(modules).forEach(k=>{
    const m=modules[k],name=m.title.split(" ").map(w=>w[0]+w.slice(1).toLowerCase()).join(" ");
    add(name,"Module",name,m.description+" "+(m.summary||[]).map(x=>x[0]+" "+x[1]).join(" "),k);
    (m.records||[]).forEach(r=>add(name,"Module record",r[0],[r[1],r[2],r[3]].join(" · "),k));
    try{(features[k]||[]).forEach(f=>add(name,f[1]?"Feature":"Feature (planned)",f[0],"",k))}catch(e){}
  })}catch(e){}

  /* 4. Every interface table in every module */
  SOURCES.forEach(src=>{
    try{
      const def=src.def(),data=src.data();
      Object.keys(def).forEach(k=>{
        const pageTitle=src.title(k),d=data[k];
        add(src.mod,"Interface",pageTitle,def[k].desc||"",src.route+k);
        if(!d)return;
        Object.keys(d).forEach(tb=>{
          if(tb==="meta"||!Array.isArray(d[tb]))return;
          d[tb].forEach(r=>{
            if(!Array.isArray(r))return;
            const cells=r.map(S).filter(Boolean);if(!cells.length)return;
            const code=cells[0].length<=14&&cells.length>1;
            const title=code?cells[0]+" · "+cells[1]:cells[0];
            const body=cells.slice(code?2:1).join(" · ");
            add(src.mod,pageTitle+(tb==="main"?"":" · "+(SECTION[tb]||tb)),title,body,src.route+k,
              tb==="main"?{filter:cells[0],inp:src.inp,st:src.st}:{});
          });
        });
      });
    }catch(e){}
  });

  /* 5. Privacy page */
  try{Object.keys(prvData).forEach(tb=>{
    if(tb==="meta"||!Array.isArray(prvData[tb]))return;
    prvData[tb].forEach(r=>{if(!Array.isArray(r))return;
      const c=r.map(S).filter(Boolean);
      const hasNo=/^\d+$/.test(c[0]||"");
      add("Data Privacy","Privacy · "+(SECTION[tb]||tb),hasNo?c[1]:c[0],c.slice(hasNo?2:1).join(" · "),"privacy");
    });
  })}catch(e){}

  /* 6. School calendar activities */
  try{calEvents.forEach(ev=>add("Smart Admin","Calendar",ev.title,[ev.date+(ev.end?" to "+ev.end:""),ev.type,ev.status,ev.notes].filter(Boolean).join(" · "),"cal"))}catch(e){}

  return items;
}

/* Scoring: every typed word must appear somewhere; title matches rank highest. */
function run(query,items){
  const toks=query.toLowerCase().split(/\s+/).filter(Boolean);
  if(!toks.length)return[];
  const phrase=toks.join(" "),out=[];
  items.forEach(it=>{
    if(!toks.every(t=>t.length<3?new RegExp("(^|[^a-z0-9])"+t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).test(it.hay):it.hay.includes(t)))return;
    let s=0;
    if(it.tl===phrase)s+=60;
    if(it.tl.startsWith(phrase))s+=30;
    if(it.tl.includes(phrase))s+=15;
    toks.forEach(t=>{if(it.tl.includes(t))s+=10;if(it.tl.split(/[\s·\-–(),/]+/).some(w=>w.startsWith(t)))s+=4;if(it.body.toLowerCase().includes(t))s+=1});
    if(it.page==="Module"||it.page==="Page")s+=3;
    out.push(Object.assign({s},it));
  });
  return out.sort((a,b)=>b.s-a.s);
}

function mark(text,toks){
  let h=E(text);
  toks.slice().sort((a,b)=>b.length-a.length).forEach(t=>{
    const re=new RegExp("("+E(t).replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+")","gi");
    h=h.replace(re,"<mark>$1</mark>");
  });
  return h;
}
function snippet(body,toks){
  if(body.length<=130)return body;
  const low=body.toLowerCase();let at=-1;
  for(const t of toks){const i=low.indexOf(t);if(i>=0){at=i;break}}
  if(at<0)return body.slice(0,130)+"…";
  const a=Math.max(0,at-45),b=Math.min(body.length,a+130);
  return(a>0?"…":"")+body.slice(a,b)+(b<body.length?"…":"");
}

/* ---- Overlay UI ---- */
let overlay,input,list,count,items=[],flat=[],active=-1,lastFocus=null;
const PER_GROUP=5;let expanded={};

function ensureUI(){
  if(overlay)return;
  overlay=document.createElement("div");
  overlay.id="searchOverlay";overlay.className="srch-pop";overlay.setAttribute("role","dialog");overlay.setAttribute("aria-label","Search portal");
  overlay.innerHTML=`<input id="srchInput" type="search" autocomplete="off" spellcheck="false" placeholder="Search …" aria-label="Search the portal" />
    <div class="srch-count" id="srchCount" aria-live="polite"></div>
    <div class="srch-list" id="srchList" role="listbox"></div>`;
  document.body.appendChild(overlay);
  input=q$("#srchInput");list=q$("#srchList");count=q$("#srchCount");
  input.addEventListener("input",()=>{expanded={};render()});
  document.addEventListener("mousedown",e=>{
    if(!overlay.classList.contains("show"))return;
    if(overlay.contains(e.target)||e.target.closest("#govSearch,#headSearch"))return;
    close(true);
  });
  window.addEventListener("resize",()=>{if(overlay.classList.contains("show"))place()});
  list.addEventListener("click",e=>{
    const more=e.target.closest("[data-more]");
    if(more){expanded[more.dataset.more]=1;render();return}
    const r=e.target.closest("[data-i]");if(r)open(+r.dataset.i);
  });
  list.addEventListener("mousemove",e=>{const r=e.target.closest("[data-i]");if(r&&+r.dataset.i!==active)setActive(+r.dataset.i,false)});
  overlay.addEventListener("keydown",e=>{
    if(e.key==="Escape"){e.preventDefault();close()}
    else if(e.key==="ArrowDown"){e.preventDefault();setActive(Math.min(flat.length-1,active+1),true)}
    else if(e.key==="ArrowUp"){e.preventDefault();setActive(Math.max(0,active-1),true)}
    else if(e.key==="Enter"){if(active>=0){e.preventDefault();open(active)}}
    else if(e.key==="Tab"){/* keep focus inside the dialog */
      const f=overlay.querySelectorAll("input,button");const first=f[0],last=f[f.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
    }
  });
}

function render(){
  const raw=input.value.trim(),toks=raw.toLowerCase().split(/\s+/).filter(Boolean);
  flat=[];active=-1;
  if(!toks.length){count.textContent="";list.innerHTML="";return}
  const res=run(raw,items);
  if(!res.length){
    count.textContent="";
    list.innerHTML=`<div class="srch-empty">No results for “${E(raw)}”. Try fewer or different words.</div>`;
    return;
  }
  const groups=[],byMod={};
  res.forEach(r=>{if(!byMod[r.mod]){byMod[r.mod]={mod:r.mod,rows:[],top:r.s};groups.push(byMod[r.mod])}byMod[r.mod].rows.push(r)});
  count.textContent=res.length+(res.length===1?" result":" results");
  let html="";
  groups.forEach(g=>{
    const show=expanded[g.mod]?g.rows:g.rows.slice(0,PER_GROUP);
    html+=`<div class="srch-group"><div class="srch-gh">${E(g.mod)}<span>${g.rows.length}</span></div>`;
    show.forEach(r=>{
      const i=flat.push(r)-1;
      html+=`<div class="srch-row" role="option" data-i="${i}"><div class="srch-t">${mark(r.title,toks)}</div><div class="srch-m"><b>${E(r.page)}</b>${r.body?" — "+mark(snippet(r.body,toks),toks):""}</div></div>`;
    });
    if(g.rows.length>show.length)html+=`<button class="srch-more" data-more="${E(g.mod)}">Show ${g.rows.length-show.length} more in ${E(g.mod)}</button>`;
    html+=`</div>`;
  });
  list.innerHTML=html;
  setActive(0,false);
}

function setActive(i,scroll){
  const rows=list.querySelectorAll(".srch-row");
  rows.forEach(r=>{r.classList.remove("on");r.setAttribute("aria-selected","false")});
  active=i;
  const el=list.querySelector(`.srch-row[data-i="${i}"]`);
  if(el){el.classList.add("on");el.setAttribute("aria-selected","true");if(scroll)el.scrollIntoView({block:"nearest"})}
}

function open(i){
  const r=flat[i];if(!r)return;
  const term=input.value.trim();
  close(true);
  try{
    if(r.route==="cal"){goTo("admin");setTimeout(()=>{window.scrollToCal&&scrollToCal()},600);return}
    goTo(r.route);
    /* For table rows, narrow the destination table to the chosen record. */
    if(r.filter&&r.inp){
      setTimeout(()=>{
        try{r.st().q=r.filter}catch(e){}
        const f=document.getElementById(r.inp);
        if(f){f.value=r.filter;f.dispatchEvent(new Event("input",{bubbles:true}))}
      },30);
    }
    if(typeof showToast==="function")showToast("Opened: "+r.title);
  }catch(e){if(typeof showToast==="function")showToast("Could not open that result.")}
}

let anchorEl=null;
function visible(el){return el&&el.offsetParent!==null&&el.getBoundingClientRect().width>0}
function place(){
  const a=visible(anchorEl)?anchorEl:(visible(q$("#govSearch"))?q$("#govSearch"):visible(q$("#headSearch"))?q$("#headSearch"):null);
  const vw=document.documentElement.clientWidth,w=Math.min(260,vw-16);
  overlay.style.width=w+"px";
  if(a){
    const r=a.getBoundingClientRect();
    overlay.style.top=Math.round(r.bottom+6)+"px";
    overlay.style.left=Math.round(Math.max(8,Math.min(r.right-w,vw-w-8)))+"px";
  }else{overlay.style.top="60px";overlay.style.left=Math.max(8,vw-w-8)+"px"}
}
function openSearch(prefill,anchor){
  ensureUI();
  try{items=buildIndex()}catch(e){items=[]}
  lastFocus=document.activeElement;
  anchorEl=anchor&&anchor.nodeType===1?anchor:null;
  overlay.classList.add("show");place();
  input.value=typeof prefill==="string"?prefill:"";
  expanded={};render();
  setTimeout(()=>{input.focus();input.select()},0);
}
function close(keepFocus){
  if(!overlay)return;
  overlay.classList.remove("show");
  if(keepFocus!==true&&lastFocus&&lastFocus.focus)try{lastFocus.focus()}catch(e){}
}

window.openSearch=openSearch;
window.closeSearch=close;

/* Wire up the buttons and keyboard shortcuts */
["govSearch","headSearch"].forEach(id=>{const b=document.getElementById(id);if(b)b.addEventListener("click",()=>{overlay&&overlay.classList.contains("show")?close():openSearch("",b)})});
document.addEventListener("keydown",e=>{
  const t=e.target,typing=t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.tagName==="SELECT"||t.isContentEditable);
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();overlay&&overlay.classList.contains("show")?close():openSearch();return}
  if(e.key==="/"&&!typing&&!e.ctrlKey&&!e.metaKey&&!e.altKey){e.preventDefault();openSearch()}
});
})();
