const modules = {
  admin:{title:"SMART ADMIN",icon:"⌂",description:"Centralized school information, administrative records, calendar, and reporting.",summary:[["School documents","128"],["Upcoming activities","6"],["Reports prepared","24"]],records:[["School calendar 2026–2027","Calendar","Nov 18, 2026","Active"],["School profile and information","School records","Nov 17, 2026","Active"],["Quarterly accomplishment summary","Reports","Nov 15, 2026","For review"],["Faculty meeting documentation","Documents","Nov 12, 2026","Completed"]]},
  learner:{title:"SMART LEARNER",icon:"♧",description:"Learner attendance, academic progress, intervention, and support monitoring.",summary:[["Learner profiles","1,248"],["Attendance rate","94.6%"],["Intervention plans","18"]],records:[["Grade 11 learner progress overview","Academic monitoring","Nov 18, 2026","Active"],["Attendance monitoring summary","Attendance","Nov 17, 2026","Active"],["Sample learner support plan","Intervention","Nov 14, 2026","In progress"],["ARAL monitoring overview","ARAL program","Nov 10, 2026","For review"]]},
  teacher:{title:"SMART TEACHER",icon:"♙",description:"Personnel profiles, professional development, supervision, and teacher support.",summary:[["Personnel profiles","48"],["Training activities","9"],["Supervision records","16"]],records:[["Personnel profile directory","Personnel","Nov 18, 2026","Active"],["Professional development tracker","PPST / L&D","Nov 16, 2026","In progress"],["Instructional supervision schedule","Supervision","Nov 12, 2026","Active"],["Teacher support monitoring","Support","Nov 09, 2026","For review"]]},
  instruction:{title:"SMART INSTRUCTION",icon:"▤",description:"Curriculum implementation, assessment, learning resources, and instructional support.",summary:[["Learning areas","8"],["Assessment records","36"],["Learning resources","214"]],records:[["Curriculum implementation overview","Curriculum","Nov 18, 2026","Active"],["Assessment analysis – sample","Assessment","Nov 15, 2026","Completed"],["Learning resource inventory","Resources","Nov 13, 2026","Active"],["Instructional planning support","Planning","Nov 11, 2026","In progress"]]},
  project:{title:"SMART PROJECT",icon:"◈",description:"Monitor SIP, AIP, school programs, research, accomplishments, and utilization.",summary:[["Active projects","12"],["Completed projects","5"],["For monitoring","4"]],records:[["School Improvement Plan tracker","SIP","Nov 18, 2026","Active"],["Annual Implementation Plan","AIP","Nov 16, 2026","In progress"],["School-based research tracker","Research","Nov 13, 2026","For review"],["Sample reading intervention project","PPA","Nov 10, 2026","Completed"]]},
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
  $$(".nav-link").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
  if(page==="dashboard"||page==="reports"||page==="settings"){
    $("#page-"+page).classList.add("active");
    $("#breadcrumbPage").textContent=page.charAt(0).toUpperCase()+page.slice(1);
  }else{
    currentModule=page;renderModule(page);$("#page-module").classList.add("active");$("#breadcrumbPage").textContent=modules[page].title;
  }
  $("#sidebar").classList.remove("open");
  window.scrollTo({top:0,behavior:"smooth"});
}
function renderModule(key){
  const m=modules[key];currentRecords=m.records.map((r,i)=>({id:i+1,name:r[0],category:r[1],date:r[2],status:r[3]}));
  $("#moduleTitle").textContent=m.title;$("#moduleIcon").textContent=m.icon;$("#moduleDescription").textContent=m.description;
  $("#workspaceTitle").textContent=m.title+" workspace";
  $("#moduleSummary").innerHTML=m.summary.map(x=>`<div class="summary-tile"><span>${escapeHTML(x[0])}</span><strong>${escapeHTML(x[1])}</strong></div>`).join("");
  $("#moduleSearch").value="";$("#moduleFilter").value="all";renderRows();
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
$("#menuToggle").addEventListener("click",()=>$("#sidebar").classList.add("open"));
$("#closeSidebar").addEventListener("click",()=>$("#sidebar").classList.remove("open"));
function openModal(){$("#modalBackdrop").classList.add("show");$("#recordName").focus()}
function closeModal(){$("#modalBackdrop").classList.remove("show");$("#recordForm").reset()}
$("#addRecord").addEventListener("click",openModal);$("#closeModal").addEventListener("click",closeModal);$("#cancelModal").addEventListener("click",closeModal);
$("#modalBackdrop").addEventListener("click",e=>{if(e.target.id==="modalBackdrop")closeModal()});
$("#recordForm").addEventListener("submit",e=>{
  e.preventDefault();
  const now=new Date();const date=now.toLocaleDateString("en-US",{month:"short",day:"2-digit",year:"numeric"});
  currentRecords.unshift({id:Date.now(),name:$("#recordName").value.trim(),category:$("#recordCategory").value.trim(),date,status:$("#recordStatus").value});
  renderRows();closeModal();showToast("Sample record added to this session.");
});
$("#openAssistant").addEventListener("click",()=>$("#assistantPanel").classList.add("show"));
$("#closeAssistant").addEventListener("click",()=>$("#assistantPanel").classList.remove("show"));
$("#quickReport").addEventListener("click",()=>goTo("reports"));
$$(".report-action").forEach(btn=>btn.addEventListener("click",()=>showToast("Sample report preview is not connected yet.")));
$("#saveSettings").addEventListener("click",()=>showToast("Demo settings saved for this preview only."));
$("#notificationBtn").addEventListener("click",()=>showToast("You are all caught up in this demo."));
$("#performancePeriod").addEventListener("change",()=>showToast("Chart period selector is a visual prototype."));
$("#recordsBody").addEventListener("click",e=>{const b=e.target.closest("[data-record]");if(b)showToast("Record details preview is not connected yet.");});
goTo("dashboard");
