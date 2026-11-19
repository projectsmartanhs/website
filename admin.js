/* SMART-ANHS admin editing (prototype: data is saved in this browser only) */
const SKEY="smartanhs.v1",AKEY="smartanhs.admin";
let isAdmin=sessionStorage.getItem(AKEY)==="1",admSave=null,texts={};
const today=()=>new Date().toLocaleDateString("en-US",{month:"short",day:"2-digit",year:"numeric"});
async function hashPass(p){const d=new TextEncoder().encode("smartanhs:"+p);if(window.crypto&&crypto.subtle){const b=await crypto.subtle.digest("SHA-256",d);return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("")}return btoa(p)}
function snapshot(){const m={};Object.keys(modules).forEach(k=>{const x=modules[k];m[k]={title:x.title,description:x.description,icon:x.icon,summary:x.summary,records:x.records}});return{v:1,modules:m,features,atRisk,budget,insights,canteenTiles,calEvents:window.calEvents||[],texts}}
function persist(){if(!isAdmin)return;try{localStorage.setItem(SKEY,JSON.stringify(snapshot()))}catch(e){showToast("Could not save in this browser.")}}
function restore(s){
  Object.keys(s.modules||{}).forEach(k=>modules[k]&&Object.assign(modules[k],s.modules[k]));
  if(s.features)Object.assign(features,s.features);
  [["atRisk",atRisk],["budget",budget],["insights",insights],["canteenTiles",canteenTiles]].forEach(([n,a])=>{if(Array.isArray(s[n]))a.splice(0,a.length,...s[n])});
  texts=s.texts||{};
}
/* generic form modal */
document.body.insertAdjacentHTML("beforeend",`<div class="modal-backdrop" id="admModal"><div class="modal"><div class="modal-head"><h2 id="admTitle"></h2><button class="icon-btn" id="admClose" type="button" aria-label="Close">×</button></div><form id="admForm"><div id="admFields"></div><div class="adm-actions"><button type="button" class="outline-btn" id="admCancel">Cancel</button><button class="primary-btn">Save</button></div></form></div></div>`);
function admForm(title,fields,vals,onSave){
  $("#admTitle").textContent=title;
  $("#admFields").innerHTML=fields.map((f,i)=>`<label>${f[0]}${f[1]==="select"?`<select data-f="${i}">${f[2].map(o=>`<option${o===vals[i]?" selected":""}>${escapeHTML(o)}</option>`).join("")}</select>`:`<input data-f="${i}" type="${f[1]||"text"}" value="${escapeHTML(vals[i]??"")}" />`}</label>`).join("");
  admSave=onSave;$("#admModal").classList.add("show");const f=$("#admFields input,#admFields select");f&&f.focus();
}
const admClose=()=>$("#admModal").classList.remove("show");
$("#admClose").onclick=$("#admCancel").onclick=admClose;
$("#admForm").addEventListener("submit",async e=>{e.preventDefault();const v=[...$$("#admFields [data-f]")].map(x=>x.value);if(await admSave(v)!==false)admClose()});
/* login */
function adminLogin(){
  if(isAdmin){if(confirm("Log out of admin mode?"))setAdmin(false);return}
  const saved=localStorage.getItem(AKEY);
  if(!saved)admForm("Create admin passcode",[["New passcode (6+ characters)","password"],["Repeat passcode","password"]],["",""],async v=>{if(v[0].length<6||v[0]!==v[1]){showToast("Passcodes must match and have 6+ characters.");return false}localStorage.setItem(AKEY,await hashPass(v[0]));setAdmin(true)});
  else admForm("Admin sign-in",[["Admin passcode","password"]],[""],async v=>{if(await hashPass(v[0])===saved)setAdmin(true);else{showToast("Incorrect passcode.");return false}});
}
function setAdmin(on){
  isAdmin=on;sessionStorage.setItem(AKEY,on?"1":"0");document.body.classList.toggle("is-admin",on);$("#admBar").hidden=!on;
  $("#portalLogin").lastChild.textContent=on?" Admin · Log out":" Portal Login";
  TE.forEach(({el})=>{if(on)el.setAttribute("contenteditable","true");else el.removeAttribute("contenteditable");el.classList.toggle("adm-edit",on)});
  if($("#page-module").classList.contains("active"))renderModule(currentModule);
  showToast(on?"Admin mode on. Click any text to edit it.":"Logged out of admin mode.");
}
/* editable static text */
const TE=[];
$$("#page-dashboard *,#page-reports *,#page-settings *,.site-footer *,.site-head *,.gov-bar *,.crumb-row *").forEach(el=>{
  if(el.closest("svg,button,select,#topNav,#breadcrumbPage")||["INPUT","LABEL","OPTION","SCRIPT","STYLE","IMG"].includes(el.tagName))return;
  if(el.children.length&&!el.matches(".stat-number"))return;
  const t=el.textContent.trim();if(!t)return;TE.push({el,key:TE.length+"|"+t.slice(0,40),orig:t});
});
TE.forEach(o=>{
  const el=o.el;if(texts[o.key]!==undefined)el.textContent=texts[o.key];
  el.addEventListener("blur",()=>{if(!isAdmin)return;const t=el.textContent.trim();if(t!==(texts[o.key]??o.orig)){texts[o.key]=t;persist()}});
  el.addEventListener("keydown",e=>{if(isAdmin&&e.key==="Enter"){e.preventDefault();el.blur()}});
  el.addEventListener("click",e=>{if(isAdmin&&el.tagName==="A")e.preventDefault()});
});
/* item definitions */
const ST=["Active","In progress","For review","Completed"];
const CFG={
 rec:{arr:()=>modules[currentModule].records,name:"record",fields:[["Record name"],["Category"],["Date"],["Status","select",ST]],blank:()=>["New record","General",today(),"Active"],front:1},
 feat:{arr:()=>features[currentModule],name:"feature",fields:[["Feature"],["Status","select",["Preview","Planned"]]],blank:()=>["New feature",1],to:v=>[v[0],v[1]?"Preview":"Planned"],from:v=>[v[0],v[1]==="Preview"?1:0]},
 tile:{arr:()=>modules[currentModule].summary,name:"summary tile",fields:[["Label"],["Value"]],blank:()=>["New item","0"]},
 canteen:{arr:()=>canteenTiles,name:"canteen tile",fields:[["Label"],["Value"]],blank:()=>["New item","0"]},
 bud:{arr:()=>budget,name:"budget line",fields:[["Line item"],["Allocated (₱)","number"],["Utilized (₱)","number"]],blank:()=>["New line",0,0],from:v=>[v[0],+v[1]||0,+v[2]||0]},
 risk:{arr:()=>atRisk,name:"learner",fields:[["Learner code (no real names)"],["Grade – Section"],["Risk level","select",["High","Medium","Low"]],["Workflow stage","select",stages],["Reasons (separate with ;)"]],blank:()=>({id:"LRN-NEW",gs:"Grade 7 – Sec A",risk:"Medium",stage:0,why:["Reason for flag"]}),to:o=>[o.id,o.gs,o.risk,stages[o.stage],o.why.join("; ")],from:v=>({id:v[0],gs:v[1],risk:v[2],stage:Math.max(0,stages.indexOf(v[3])),why:v[4].split(";").map(s=>s.trim()).filter(Boolean)})},
 ins:{arr:()=>insights,name:"insight",fields:[["Insight"],["Type"],["Based on"],["Suggested action"]],blank:()=>({t:"New insight",k:"Trend analysis",f:"Based on …",s:"Suggested: …",v:null}),to:o=>[o.t,o.k,o.f,o.s],from:(v,o)=>({t:v[0],k:v[1],f:v[2],s:v[3],v:o?o.v:null})}
};
function after(t){persist();if(["rec","tile","mod"].includes(t))renderModule(currentModule);else renderExtras(currentModule);if(["feat","mod"].includes(t))renderNav();showToast("Saved.")}
function act(a,t,i){
  if(t==="mod"){const m=modules[currentModule];return admForm("Edit module details",[["Module title"],["Description"],["Icon (one character)"]],[m.title,m.description,m.icon],v=>{Object.assign(m,{title:v[0]||m.title,description:v[1],icon:v[2]||m.icon});$("#breadcrumbPage").textContent=m.title;after("mod")})}
  const c=CFG[t],arr=c.arr(),to=c.to||(x=>x),from=c.from||(x=>x);
  if(a==="del"){if(confirm("Delete this "+c.name+"?")){arr.splice(i,1);after(t)}return}
  const old=a==="edit"?arr[i]:null;
  admForm((a==="edit"?"Edit ":"Add ")+c.name,c.fields,to(old||c.blank()),v=>{const n=from(v,old);if(old)arr[i]=n;else if(c.front)arr.unshift(n);else arr.push(n);after(t)});
}
document.addEventListener("click",e=>{const b=e.target.closest("[data-adm]");if(b&&isAdmin){e.preventDefault();act(b.dataset.adm,b.dataset.t,+b.dataset.i)}});
$("#moduleExtra").addEventListener("click",e=>{if(e.target.closest("[data-act]"))persist()});
/* controls injected into rendered content */
const B=(a,t,i,l,c="")=>`<button class="adm ${c}" data-adm="${a}" data-t="${t}" data-i="${i}" title="${a==="del"?"Delete":a==="edit"?"Edit":"Add"}">${l}</button>`;
const EB=(t,i)=>B("edit",t,i,"✎")+B("del",t,i,"✕","danger");
function addBtn(host,t,label){if(host&&!host.querySelector(`[data-adm=add][data-t=${t}]`))host.insertAdjacentHTML("beforeend",B("add",t,0,"＋ "+label,"add"))}
function decorate(){
  if(!isAdmin)return;
  const mh=$(".module-title-row>div:last-child");if(mh&&!mh.querySelector(".adm"))mh.insertAdjacentHTML("beforeend",B("edit","mod",0,"✎ Edit module details","add"));
  $$("#moduleSummary .summary-tile").forEach((el,i)=>{if(!el.querySelector(".adm"))el.insertAdjacentHTML("beforeend",`<span class="adm-row">${EB("tile",i)}</span>`)});
  addBtn($("#moduleSummary").parentElement.querySelector(".adm-tilebar")||$("#moduleSummary").insertAdjacentElement("afterend",Object.assign(document.createElement("div"),{className:"adm-tilebar"})),"tile","Add summary tile");
  $$("#recordsBody tr").forEach(tr=>{const b=tr.querySelector("[data-record]");if(b)b.parentElement.innerHTML=EB("rec",+b.dataset.record-1)});
  addBtn($(".module-workspace .panel-heading"),"rec","Add record");
  $$(".feat-list li").forEach((li,i)=>{if(!li.querySelector(".adm"))li.insertAdjacentHTML("beforeend",EB("feat",i))});addBtn($(".feat-panel .panel-heading"),"feat","Add feature");
  $$(".extra-panel").forEach(p=>{
    const h=p.querySelector("h3").textContent,hd=p.querySelector(".panel-heading");
    if(h.startsWith("At-risk")){p.querySelectorAll("tbody tr").forEach((tr,i)=>{const td=tr.lastElementChild;if(!td.querySelector(".adm"))td.insertAdjacentHTML("beforeend",EB("risk",i))});addBtn(hd,"risk","Add learner")}
    if(h.startsWith("Budget")){p.querySelectorAll("tbody tr").forEach((tr,i)=>{const td=tr.lastElementChild;if(!td.querySelector(".adm"))td.insertAdjacentHTML("beforeend",EB("bud",i))});addBtn(hd,"bud","Add budget line");
      p.querySelectorAll(".summary-tile").forEach((el,i)=>{if(!el.querySelector(".adm"))el.insertAdjacentHTML("beforeend",`<span class="adm-row">${EB("canteen",i)}</span>`)});if(p.querySelector(".summary-tile"))addBtn(hd,"canteen","Add canteen tile")}
    if(h.startsWith("Insights")){p.querySelectorAll(".insight").forEach((el,i)=>{if(!el.querySelector(".adm"))el.querySelector(".insight-act").insertAdjacentHTML("beforeend",EB("ins",i))});addBtn(hd,"ins","Add insight")}
  });
}
let raf=0;const obs=new MutationObserver(()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(decorate)});
["#moduleSummary","#moduleFeatures","#moduleExtra","#recordsBody","#moduleTitle"].forEach(s=>obs.observe($(s),{childList:true,subtree:true,characterData:true}));
/* admin bar: export / import / reset */
$(".crumb-row").insertAdjacentHTML("afterend",`<div class="adm-bar" id="admBar" hidden><strong>Admin mode</strong><span>Click any text to edit it. Use ✎ ＋ ✕ on records, features, learners, budget, and insights. Saved in this browser only, so export a backup regularly.</span><span class="adm-tools"><button class="outline-btn mini" id="admExport">Export data</button><button class="outline-btn mini" id="admImport">Import data</button><button class="outline-btn mini" id="admReset">Reset edits</button><input type="file" id="admFile" accept="application/json" hidden></span></div>`);
$("#admExport").onclick=()=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(snapshot(),null,2)],{type:"application/json"}));a.download="smart-anhs-data.json";a.click()};
$("#admImport").onclick=()=>$("#admFile").click();
$("#admFile").onchange=e=>{const f=e.target.files[0];if(!f)return;f.text().then(t=>{try{const s=JSON.parse(t);if(!s.modules)throw 0;localStorage.setItem(SKEY,t);location.reload()}catch(x){showToast("That file is not a valid SMART-ANHS export.")}})};
$("#admReset").onclick=()=>{if(confirm("Remove all saved edits in this browser? The admin passcode is kept.")){localStorage.removeItem(SKEY);location.reload()}};
/* start */
try{const s=JSON.parse(localStorage.getItem(SKEY)||"null");if(s){restore(s);TE.forEach(o=>{if(texts[o.key]!==undefined)o.el.textContent=texts[o.key]});renderNav()}}catch(e){}
if(isAdmin)setAdmin(true);
