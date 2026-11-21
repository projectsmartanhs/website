const modules = {
  admin:{title:"SMART ADMIN",icon:"⌂",description:"Centralized school information, administrative records, calendar, and reporting.",summary:[["School documents","128"],["Upcoming activities","6"],["Reports prepared","24"]],records:[["School calendar 2026–2027","Calendar","Nov 18, 2026","Active"],["School profile and information","School records","Nov 17, 2026","Active"],["Quarterly accomplishment summary","Reports","Nov 15, 2026","For review"],["Faculty meeting documentation","Documents","Nov 12, 2026","Completed"]]},
  learner:{title:"SMART LEARNER",icon:"♧",description:"Learner attendance, academic progress, intervention, and support monitoring.",summary:[["Learner profiles","1,248"],["Attendance rate","94.6%"],["Intervention plans","18"]],records:[["Grade 11 learner progress overview","Academic monitoring","Nov 18, 2026","Active"],["Attendance monitoring summary","Attendance","Nov 17, 2026","Active"],["Sample learner support plan","Intervention","Nov 14, 2026","In progress"],["ARAL monitoring overview","ARAL program","Nov 10, 2026","For review"]]},
  teacher:{title:"SMART TEACHER",icon:"♙",description:"Personnel profiles, professional development, supervision, and teacher support.",summary:[["Personnel profiles","48"],["Training activities","9"],["Supervision records","16"]],records:[["Personnel profile directory","Personnel","Nov 18, 2026","Active"],["Professional development tracker","PPST / L&D","Nov 16, 2026","In progress"],["Instructional supervision schedule","Supervision","Nov 12, 2026","Active"],["Teacher support monitoring","Support","Nov 09, 2026","For review"]]},
  instruction:{title:"SMART INSTRUCTION",icon:"▤",description:"Curriculum implementation, assessment, learning resources, and instructional support.",summary:[["Learning areas","8"],["Assessment records","36"],["Learning resources","214"]],records:[["Curriculum implementation overview","Curriculum","Nov 18, 2026","Active"],["Assessment analysis – sample","Assessment","Nov 15, 2026","Completed"],["Learning resource inventory","Resources","Nov 13, 2026","Active"],["Instructional planning support","Planning","Nov 11, 2026","In progress"]]},
  project:{title:"SMART PROJECT",icon:"◈",description:"Monitor SIP, AIP, school programs, research, accomplishments, and utilization.",summary:[["Total projects","12"],["Completed","5"],["Ongoing","4"]],records:[["School Improvement Plan tracker","SIP","Nov 18, 2026","Active"],["Annual Implementation Plan","AIP","Nov 16, 2026","In progress"],["School-based research tracker","Research","Nov 13, 2026","For review"],["Sample reading intervention project","PPA","Nov 10, 2026","Completed"]]},
  resource:{title:"SMART RESOURCE",icon:"▣",description:"School inventory, facilities, equipment, maintenance, and resource monitoring.",summary:[["Inventory items","486"],["Facilities records","22"],["Open maintenance requests","7"]],records:[["ICT equipment inventory","Equipment","Nov 18, 2026","Active"],["Classroom facilities checklist","Facilities","Nov 16, 2026","Active"],["Sample repair request","Maintenance","Nov 14, 2026","In progress"],["School resource utilization summary","Utilization","Nov 09, 2026","For review"]]},
  decision:{title:"SMART DECISION",icon:"✧",description:"Data-informed insights, trend analysis, early indicators, and management recommendations.",summary:[["Indicators monitored","18"],["Insights prepared","7"],["Items for validation","3"]],records:[["Monthly attendance trend – sample","Trend analysis","Nov 18, 2026","Active"],["Assessment performance overview","Learning outcomes","Nov 16, 2026","For review"],["School project status summary","Operational insights","Nov 13, 2026","Completed"],["Planning recommendations – sample","AI assistance","Nov 11, 2026","In progress"]]}
};
let currentModule = "admin";
let currentRecords = [];
const $ = (s)=>document.querySelector(s);
const $$ = (s)=>document.querySelectorAll(s);
function showToast(message){const t=$("#toast");t.textContent=message;t.classList.add("show");clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>t.classList.remove("show"),2600)}
function goTo(page){
  $$(".page-section").forEach(s=>s.classList.remove("active"));
  $$(".nav-item").forEach(li=>li.classList.toggle("active",li.dataset.pages.split(" ").includes(page)));
  if(page==="dashboard"||page==="reports"||page==="settings"){
    $("#page-"+page).classList.add("active");
    $("#breadcrumbPage").textContent=page.charAt(0).toUpperCase()+page.slice(1);
  }else{
    currentModule=page;renderModule(page);$("#page-module").classList.add("active");$("#breadcrumbPage").textContent=modules[page].title;
  }
  closeDD();$("#topNav").classList.remove("open");
  window.scrollTo({top:0,behavior:"smooth"});
}
function renderModule(key){
  const m=modules[key];currentRecords=m.records.map((r,i)=>({id:i+1,name:r[0],category:r[1],date:r[2],status:r[3]}));
  $("#moduleTitle").textContent=m.title;$("#moduleIcon").textContent=m.icon;$("#moduleDescription").textContent=m.description;
  $("#workspaceTitle").textContent=m.title+" workspace";
  $("#moduleSummary").innerHTML=m.summary.map(x=>`<div class="summary-tile"><span>${escapeHTML(x[0])}</span><strong>${escapeHTML(x[1])}</strong></div>`).join("");
  $("#moduleSearch").value="";$("#moduleFilter").value="all";renderRows();renderExtras(key);
}
function escapeHTML(value){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function renderRows(){
  const query=$("#moduleSearch").value.toLowerCase(),filter=$("#moduleFilter").value;
  const rows=currentRecords.filter(r=>(r.name+" "+r.category).toLowerCase().includes(query)&&(filter==="all"||r.status===filter));
  $("#recordsBody").innerHTML=rows.map(r=>`<tr><td>${escapeHTML(r.name)}</td><td>${escapeHTML(r.category)}</td><td>${escapeHTML(r.date)}</td><td><span class="status-chip ${r.status==="In progress"?"progress":r.status==="Completed"?"completed":r.status==="For review"?"review":""}">${escapeHTML(r.status)}</span></td><td><button class="row-action" title="View record" data-record="${r.id}">···</button></td></tr>`).join("")||'<tr><td colspan="5" style="text-align:center;padding:25px;color:#98a4b1">No matching records found.</td></tr>';
  $("#recordCount").textContent=`Showing ${rows.length} of ${currentRecords.length} sample records`;
}
$$(".nav-link").forEach(btn=>btn.addEventListener("click",()=>goTo(btn.dataset.page)));
$$("[data-go]").forEach(btn=>btn.addEventListener("click",()=>goTo(btn.dataset.go)));
$("#moduleSearch").addEventListener("input",renderRows);$("#moduleFilter").addEventListener("change",renderRows);


function openModal(){$("#modalBackdrop").classList.add("show");$("#recordName").focus()}
function closeModal(){$("#modalBackdrop").classList.remove("show");$("#recordForm").reset()}
$("#addRecord").addEventListener("click",openModal);$("#closeModal").addEventListener("click",closeModal);$("#cancelModal").addEventListener("click",closeModal);
$("#modalBackdrop").addEventListener("click",e=>{if(e.target.id==="modalBackdrop")closeModal()});
$("#recordForm").addEventListener("submit",e=>{
  e.preventDefault();
  const now=new Date();const date=now.toLocaleDateString("en-US",{month:"short",day:"2-digit",year:"numeric"});
  modules[currentModule].records.unshift([$("#recordName").value.trim(),$("#recordCategory").value.trim(),date,$("#recordStatus").value]);window.persist&&persist();renderModule(currentModule);
  closeModal();showToast("Record added.");
});
$("#openAssistant").addEventListener("click",()=>$("#assistantPanel").classList.add("show"));
$("#closeAssistant").addEventListener("click",()=>$("#assistantPanel").classList.remove("show"));
$("#quickReport").addEventListener("click",()=>goTo("reports"));
$$(".report-action").forEach(btn=>btn.addEventListener("click",()=>showToast("Sample report preview is not connected yet.")));
$("#saveSettings").addEventListener("click",()=>showToast("Demo settings saved for this preview only."));
$("#notificationBtn").addEventListener("click",()=>showToast("You are all caught up in this demo."));
$("#performancePeriod").addEventListener("change",()=>showToast("Chart period selector is a visual prototype."));
$("#recordsBody").addEventListener("click",e=>{const b=e.target.closest("[data-record]");if(b)showToast("Record details preview is not connected yet.");});
/* ---- Proposal alignment additions ---- */
const extraRecords={
 admin:[["Digital document and records archive","Documents","Nov 14, 2026","Active"],["AI-assisted administrative summary – draft","AI assistance","Nov 13, 2026","For review"]],
 learner:[["At-risk learner early-warning list","At-risk monitoring","Nov 18, 2026","For review"],["Remediation and intervention log","Intervention","Nov 17, 2026","In progress"],["Learner progress report – sample","Progress reports","Nov 12, 2026","Active"]],
 teacher:[["Attendance and participation monitoring","Attendance","Nov 17, 2026","Active"],["PPST professional growth records","PPST","Nov 15, 2026","In progress"]],
 instruction:[["Instructional supervision reports","Supervision","Nov 14, 2026","Completed"],["AI-assisted lesson planning outline – draft","AI assistance","Nov 12, 2026","For review"]],
 project:[["Access, Quality, and Governance PPA monitoring","PPA","Nov 15, 2026","Active"],["Budget utilization and accomplishment","Budget","Nov 14, 2026","In progress"]],
 resource:[["Canteen and feeding program monitoring","Canteen","Nov 16, 2026","Active"],["Authorized financial utilization report","Financial reports","Nov 13, 2026","For review"]],
 decision:[["Early identification of operational concerns","Alerts","Nov 17, 2026","For review"],["Customized executive dashboard","Dashboards","Nov 15, 2026","Active"]]
};
Object.keys(extraRecords).forEach(k=>modules[k].records.push(...extraRecords[k]));

const features={
 admin:[["Centralized school information dashboard",1],["Automated report generation",1],["Digital document and records management",1],["School calendar and activity monitoring",1],["Management performance indicators (SBM-aligned)",1],["AI-assisted administrative summaries",1]],
 learner:[["Learner attendance monitoring",1],["Academic performance tracking",1],["Identification of learners at risk of failing or dropping out",1],["Intervention and remediation monitoring",1],["ARAL Program monitoring",1],["Learner progress reports",1]],
 teacher:[["Personnel profile and assignment records",1],["Attendance and participation monitoring",1],["Instructional supervision tracking",1],["Professional development monitoring",1],["PPST-related professional growth records",1],["Teacher intervention and support monitoring",1]],
 instruction:[["Instructional supervision reports",1],["Curriculum implementation monitoring",1],["Assessment and learning outcome analytics",1],["Learning resource monitoring",1],["AI-assisted instructional planning support",1]],
 project:[["SIP and AIP implementation tracking",1],["Program and project accomplishment monitoring",1],["School-based research monitoring",1],["Monitoring of Access, Quality, and Governance PPAs",1],["Budget utilization and accomplishment tracking",1]],
 resource:[["Inventory monitoring",1],["School facilities and equipment records",1],["Maintenance and repair monitoring",1],["Authorized financial and resource utilization reports",1],["Canteen and feeding program monitoring",1]],
 decision:[["Automated data analysis",1],["Trend and performance analysis",1],["Early identification of operational concerns",1],["Management recommendations",1],["Predictive analytics for planning",1],["Customized executive dashboards",1]]
};
const ADVISORY="AI-generated recommendations are advisory only. Final decisions remain with authorized school officials.";
const stages=["AI flag – awaiting human review","Reviewed by adviser","Intervention assigned (ARAL / remediation / home visit)","Monitoring outcome","Resolved"];
const atRisk=[
 {id:"LRN-A01",gs:"Grade 8 – Sec A",risk:"High",stage:0,why:["Attendance 78% (below 85%)","2 failing grades in Q1–Q2"]},
 {id:"LRN-B07",gs:"Grade 10 – Sec C",risk:"Medium",stage:1,why:["Grades dropped 9 points since Q1","3 consecutive absences"]},
 {id:"LRN-C12",gs:"Grade 7 – Sec B",risk:"Medium",stage:2,why:["Attendance 81%","No prior-school record on file"]},
 {id:"LRN-D03",gs:"Grade 11 – Sec A",risk:"Low",stage:3,why:["Incomplete Q2 outputs"]}];
const budget=[["MOOE – Repairs and maintenance",120000,84000],["MOOE – ICT and learning resources",90000,52000],["School-based feeding program",150000,111000],["Canteen operations (fund report)",60000,38000],["Research and capability building",45000,15000]];
const insights=[
 {t:"Grade 8 attendance fell 4 points over 3 weeks",k:"Trend analysis",f:"Based on weekly attendance by section",s:"Suggested: adviser follow-up and parent contact",v:null},
 {t:"Repair requests may exceed the MOOE repairs line by Q4",k:"Predictive (illustrative)",f:"Based on open requests and past repair spend",s:"Suggested: review budget realignment",v:null},
 {t:"1 high-risk learner has had no intervention for 7+ days",k:"Operational concern",f:"Based on the at-risk workflow log",s:"Suggested: assign an ARAL slot",v:null}];
const canteenTiles=[["Feeding beneficiaries","86"],["Meals served this month","1,720"],["Canteen reports filed","3 of 4"]];
const peso=n=>"₱"+n.toLocaleString("en-US");
function renderExtras(key){
  $("#moduleFeatures").innerHTML=`<div class="panel feat-panel"><div class="panel-heading"><div><h3>Module scope</h3><p class="muted">Features from the project proposal and their status in this prototype.</p></div></div><ul class="feat-list">${features[key].map(f=>`<li><span>${escapeHTML(f[0])}</span><b class="tag ${f[1]?"on":"off"}">${f[1]?"Preview":"Planned"}</b></li>`).join("")}</ul></div>`;
  const note=`<div class="advisory-note">${ADVISORY}</div>`;
  let h="";
  if(key==="learner")h=note+riskPanel();
  if(key==="project"||key==="resource")h=budgetPanel(key==="resource");
  if(key==="decision")h=note+insightPanel();
  if(key==="instruction"||key==="admin")h=note;
  $("#moduleExtra").innerHTML=h;
}
function riskPanel(){
  return `<div class="panel extra-panel"><div class="panel-heading"><div><h3>At-risk learners and intervention workflow</h3><p class="muted">Fictional learner codes. Every flag needs human review before action.</p></div></div><div class="table-wrap"><table><thead><tr><th>LEARNER</th><th>RISK</th><th>WHY FLAGGED</th><th>WORKFLOW STAGE</th><th></th></tr></thead><tbody>${atRisk.map((l,i)=>`<tr><td><strong>${l.id}</strong><br><small>${l.gs}</small></td><td><span class="status-chip ${l.risk==="High"?"review":l.risk==="Medium"?"progress":"completed"}">${l.risk}</span></td><td>${l.why.map(escapeHTML).join("<br>")}</td><td>${l.dismissed?"Dismissed by reviewer":`<div class="steps">${stages.map((s,j)=>`<i class="${j<l.stage?"done":j===l.stage?"now":""}"></i>`).join("")}</div><small>${stages[l.stage]}</small>`}</td><td>${l.dismissed||l.stage>=stages.length-1?"":`<button class="outline-btn mini" data-act="adv" data-i="${i}">${l.stage===0?"Confirm review":"Advance"}</button>${l.stage===0?` <button class="outline-btn mini" data-act="dismiss" data-i="${i}">Dismiss</button>`:""}`}</td></tr>`).join("")}</tbody></table></div><div class="table-foot"><span>Flags are drawn from attendance and grade trends. They support, not replace, adviser judgment.</span><span>Session only</span></div></div>`;
}
function budgetPanel(canteen){
  const tiles=canteen?`<div class="module-summary-grid">${canteenTiles.map(x=>`<div class="summary-tile"><span>${escapeHTML(x[0])}</span><strong>${escapeHTML(x[1])}</strong></div>`).join("")}</div>`:"";
  return `<div class="panel extra-panel"><div class="panel-heading"><div><h3>Budget utilization${canteen?" and canteen / feeding":""}</h3><p class="muted">Sample figures. View and report only; not a substitute for official accounting records. Follow COA and DepEd financial rules.</p></div></div>${tiles}<div class="table-wrap"><table><thead><tr><th>LINE ITEM</th><th>ALLOCATED</th><th>UTILIZED</th><th>PROGRESS</th></tr></thead><tbody>${budget.map(b=>{const p=Math.round(b[2]/b[1]*100);return `<tr><td>${b[0]}</td><td>${peso(b[1])}</td><td>${peso(b[2])}</td><td><div class="bar"><span style="width:${p}%"></span></div><small>${p}%</small></td></tr>`}).join("")}</tbody></table></div></div>`;
}
function insightPanel(){
  return `<div class="panel extra-panel"><div class="panel-heading"><div><h3>Insights and recommendations</h3><p class="muted">Illustrative. Each item shows what it was based on and waits for an official's decision.</p></div></div>${insights.map((x,i)=>`<div class="insight"><div><strong>${x.t}</strong><p>${x.k} · ${x.f}</p><p>${x.s}</p></div><div class="insight-act">${x.v?`<span class="status-chip ${x.v==="Accepted"?"completed":"review"}">${x.v}</span>`:`<button class="outline-btn mini" data-act="acc" data-i="${i}">Accept</button> <button class="outline-btn mini" data-act="ret" data-i="${i}">Return for review</button>`}</div></div>`).join("")}</div>`;
}
$("#moduleExtra").addEventListener("click",e=>{
  const b=e.target.closest("[data-act]");if(!b)return;const i=+b.dataset.i,a=b.dataset.act;
  if(a==="adv"){atRisk[i].stage++;showToast("Stage updated for "+atRisk[i].id+".");$("#moduleExtra").innerHTML=$("#moduleExtra").firstElementChild.outerHTML+riskPanel()}
  if(a==="dismiss"){atRisk[i].dismissed=true;showToast("Flag dismissed after human review.");$("#moduleExtra").innerHTML=$("#moduleExtra").firstElementChild.outerHTML+riskPanel()}
  if(a==="acc"||a==="ret"){insights[i].v=a==="acc"?"Accepted":"Returned for review";showToast("Decision recorded for this session.");$("#moduleExtra").innerHTML=$("#moduleExtra").firstElementChild.outerHTML+insightPanel()}
});

/* ---- Top navigation with dropdowns ---- */
function closeDD(){$$(".nav-item.open").forEach(l=>l.classList.remove("open"))}
function renderNav(){
  const list=$("#navList");
  let h=`<li class="nav-item" data-pages="dashboard"><button class="nav-top" data-page="dashboard">Home</button></li>`;
  Object.keys(modules).forEach(k=>{
    const name=modules[k].title.split(" ").map(w=>w[0]+w.slice(1).toLowerCase()).join(" ");
    h+=`<li class="nav-item" data-pages="${k}"><button class="nav-top" aria-haspopup="true">${name}${k==="decision"?'<em class="ai-pill">AI</em>':""}<i class="caret"></i></button><div class="dropdown"><button class="dd-open" data-page="${k}">Open ${name} workspace →</button>${features[k].map(f=>`<button class="dd-item${f[1]?"":" soft"}" data-page="${k}">${escapeHTML(f[0])}${f[1]?"":"<small>Planned</small>"}</button>`).join("")}</div></li>`;
  });
  h+=`<li class="nav-item" data-pages="reports settings privacy"><button class="nav-top" aria-haspopup="true">System<i class="caret"></i></button><div class="dropdown"><button class="dd-item" data-page="reports">Reports</button><button class="dd-item" data-page="privacy">Data Privacy &amp; AI Safeguards</button><button class="dd-item" data-page="settings">Settings</button></div></li>`;
  list.innerHTML=h;
}
renderNav();
(function(){
  const nav=$("#topNav");
  nav.addEventListener("click",e=>{
    const top=e.target.closest(".nav-top");
    if(top){
      if(top.dataset.page){nav.classList.add("lock");goTo(top.dataset.page);return}
      const li=top.parentElement,was=li.classList.contains("open");closeDD();if(!was)li.classList.add("open");nav.classList.remove("lock");return;
    }
    const dd=e.target.closest(".dropdown [data-page]");if(dd){nav.classList.add("lock");goTo(dd.dataset.page)}
  });
  nav.addEventListener("mouseleave",()=>nav.classList.remove("lock"));
  document.addEventListener("click",e=>{if(!e.target.closest(".top-nav"))closeDD()});
  $("#navToggle").addEventListener("click",()=>nav.classList.toggle("open"));
  $("#portalLogin").addEventListener("click",()=>window.adminLogin?adminLogin():showToast("Admin tools are loading."));
  $("#govSearch").addEventListener("click",()=>showToast("Portal search is not connected in this prototype."));
})();
goTo("dashboard");

$("#footAssistant").addEventListener("click",()=>$("#assistantPanel").classList.add("show"));
