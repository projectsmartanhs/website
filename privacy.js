/* Data Privacy and AI Safeguards page (editable by admin) */
const pvchip=v=>/^(In place|Approved|Done|Ongoing|Yes)/.test(v)?"completed":/^(Partly|Policy|Drafting|For review|Pending)/.test(v)?"progress":"review";
const pvChip=t=>`<span class="status-chip ${pvchip(t)}">${esc(t)}</span>`;
const PVSTATUS=["In place","Partly in place","Planned for production","Policy and procedure"];
const PVCOLS={
 main:[["No.","number"],["Safeguard"],["What it means in practice"],["Responsible (role)"],["Status in this prototype","select",PVSTATUS,1],["Where to see it / evidence"],["Next step"]],
 decide:[["Decision area"],["How the system handles it"],["Who decides"]],
 roles:[["Role"],["Can view"],["Can edit"],["Cannot access"]],
 notices:[["Document"],["Audience"],["When needed"],["Status","select",["Not started","Drafting","For review","Approved"],1]],
 check:CHKC,refs:REFC
};
const PVMETA_DEFAULT=["Data privacy and AI safeguards",
 "The implementation of Project SMART-ANHS shall comply with Republic Act No. 10173, otherwise known as the Data Privacy Act of 2012, applicable DepEd policies, and other relevant regulations. The safeguards below show what this prototype already does and what must be in place before real data or AI tools are used.",
 "The system shall not expose confidential learner or personnel information to unauthorized AI services or public platforms.",
 "This prototype uses sample data only. Do not enter real learner, personnel, financial, or other confidential information.",
 "2026-11-22"];
function pvdefaults(){return{
main:[
 [1,"Secure authorization and role-based access to information","Each person signs in and sees only what their role needs.","School Head and ICT coordinator","Partly in place","Admin edit mode needs a passcode, which is stored as a hash in the browser. There is only one admin role.","Add server-side sign-in and the role plan below before real data is used."],
 [2,"Protection of sensitive learner and personnel records","Sensitive records stay in restricted storage. The system shows counts and learner codes.","School Head and records custodians","Partly in place","Sample data only. Learner codes replace names. Every page carries a privacy warning.","Encrypt records at rest and limit access by role in production."],
 [3,"Collection and processing of only necessary information","Each field exists for a stated purpose. No names, LRNs, contact details, or home addresses are collected.","All module owners","In place","No form holds personal identifiers. The personal-data check on this page scans saved content.","Review each new field against its purpose before adding it."],
 [4,"Secure data storage, backup, and recovery procedures","Data is kept in approved storage, backed up on a schedule, and can be restored.","ICT coordinator","Partly in place","Admins can export and import a backup file. There is no database yet.","Use an approved, encrypted database with scheduled backups and a tested recovery step."],
 [5,"Appropriate consent, privacy notices, and parental involvement when required","Parents and guardians are told what is collected and why, and consent is asked for optional uses.","School Head and Data Protection Officer","Planned for production","See the privacy notices and consent table below.","Prepare the notices and consent forms and have them reviewed by the Data Protection Officer."],
 [6,"Human verification of AI-generated outputs","A named person reviews every AI-generated output before it is used, and AI help is disclosed.","All staff using AI outputs","In place","Every AI-labeled output is marked advisory. Learner flags wait for adviser review. The summaries register records who reviewed each item.","Keep this review step when AI is connected."],
 [7,"Prevention of discriminatory or unfair AI-based recommendations","Recommendations are based on visible, job-related information, and results are checked for unfair patterns.","School Head and School Planning Team","Partly in place","Flags use visible rules on attendance and grades only. No personal characteristics are used.","Review flags and outcomes each term for patterns that disadvantage any group, before any AI model is added."],
 [8,"No automated disciplinary, grading, promotion, or high-stakes learner decisions without appropriate human review","These decisions stay with teachers and school officials. The system may inform them but never make them.","School Head","In place","The system does not compute official grades, decide promotion, or handle discipline. See the table below.","Keep these decisions with teachers and school officials."],
 [9,"Regular monitoring of system security and accuracy","Security and the accuracy of figures and flags are checked on a schedule, and results are recorded.","ICT coordinator and School Head","Planned for production","The monitoring checklist below lists the checks.","Assign an owner and a schedule, then record each check."]],
decide:[
 ["Disciplinary actions","No automated action. The system has no discipline module and makes no recommendation.","School Head and the school's discipline process"],
 ["Grading","The system does not compute or change official grades. Class-level averages are summaries only.","Subject teacher, under DO 15, s. 2026"],
 ["Promotion and retention","No automatic decision. Report cards are tracked, not decided.","Teachers and School Head, under DO 15, s. 2026"],
 ["Learner support (ARAL, remediation)","Flags are suggestions. A class adviser reviews each one before any action.","Class adviser"],
 ["Admission and scholarship decisions","Not part of the system.","Authorized officials"],
 ["Personnel evaluation","Not automated. Observation records are tracked only.","School Head and rating officials (verify)"]],
roles:[
 ["School Head","All modules and reports","Approvals, settings, and school records","Nothing in the school's own data"],
 ["Administrative staff","Admin and resource records, reports","Records for their own office","Learner welfare notes and personnel evaluations"],
 ["Class adviser","Their own section's attendance, flags, and interventions","Attendance and intervention notes for their section","Learner-level data of other sections"],
 ["Subject teacher","Results for their own classes and their own records","Their own grades and lesson plans","Other teachers' records"],
 ["Guidance designate","Welfare referrals","Referral notes","Finance and personnel records"],
 ["SDO or district monitor","Aggregate reports only","Nothing","Learner-level and personnel records"],
 ["Learners and parents (later)","Their own records, with consent","Nothing","Other learners' data"]],
notices:[
 ["Privacy notice for learners and their parents or guardians","Learners and parents or guardians","Before data is collected","Not started"],
 ["Consent form for optional uses (photos, learner work, extra tools)","Parents or guardians","Before the optional use","Not started"],
 ["Privacy notice for personnel","Teachers and staff","Before data is collected","Not started"],
 ["Data sharing agreement with the SDO or any service provider","Providers and the SDO","Before any sharing","Not started"],
 ["Parent orientation on AI use at school","Parents or guardians","Start of the school year","Not started"],
 ["Privacy Impact Assessment","Data Protection Officer","Before real data or any AI system is used (DO 3, s. 2026)","Not started"]],
check:[
 ["Privacy Impact Assessment completed before any AI system is deployed","Before deployment","Pending","DO 3, s. 2026; RA 10173"],
 ["Data Protection Officer named and contact shown to the school community","Once","Pending",""],
 ["Personal-data check run on saved content","Monthly","Ongoing","Use the check on this page"],
 ["Backups made and a restore tested","Monthly","Pending",""],
 ["Access list reviewed and unused accounts removed","Each term","Pending",""],
 ["AI outputs checked for accuracy and fairness","Each term","Pending",""],
 ["AI use declared where required, and AI help disclosed in documents","Every use","Ongoing","Verify the declaration procedure in DO 3, s. 2026"],
 ["Any suspected breach reported to the Data Protection Officer at once","As it happens","Pending",""]],
refs:[
 ["RA 10173","Data Privacy Act of 2012 and its Implementing Rules. Personal information must be collected for a stated purpose, kept secure, and shared only as allowed.","Basis of the safeguards on this page. Follow National Privacy Commission issuances (verify the current ones with your Data Protection Officer)."],
 ["DepEd Order No. 3, s. 2026","Foundational Guidelines on Artificial Intelligence in Basic Education (February 20, 2026). Requires human oversight, disclosure of AI help, and a Privacy Impact Assessment before an AI system is deployed. Grading, admissions, scholarship, and disciplinary uses are high-risk and need strict human oversight. Some tools, such as facial recognition, are prohibited.","Safeguards 6, 7, and 8, and the table of decisions the system does not make."],
 ["DepEd Order No. 15, s. 2026","Revised Guidelines on Classroom Assessment, Grading System, and Awards and Recognition","Grades and promotion stay with teachers and school officials."],
 ["DepEd Order No. 40, s. 2012","DepEd Child Protection Policy","Welfare concerns follow child protection procedures, not this system alone."],
 ["DepEd and SDO data privacy issuances","The school's Data Protection Officer and the SDO can confirm which DepEd data privacy policies apply.","Add the specific issuances here once confirmed."]]
};}
var prvData=pvdefaults();
try{const s=JSON.parse(localStorage.getItem("smartanhs.v1")||"null");if(s&&s.prvData)prvData=Object.assign(prvData,s.prvData)}catch(e){}
const pvmeta=()=>prvData.meta&&prvData.meta.length>=5?prvData.meta:PVMETA_DEFAULT;
const pvEB=(tb,i)=>`<button class="adm" data-pch="edit" data-tb="${tb}" data-i="${i}">✎</button><button class="adm danger" data-pch="del" data-tb="${tb}" data-i="${i}">✕</button>`;
const pvAdd=(tb,l)=>`<button class="adm add" data-pch="add" data-tb="${tb}">＋ ${l}</button>`;
const pvcell=(c,v)=>c[3]?pvChip(String(v)):c[1]==="number"?esc(amn(v)):esc(v);
function pvtable(tb){
  const cols=PVCOLS[tb],rows=prvData[tb];
  return `<div class="table-wrap"><table><thead><tr>${cols.map(c=>`<th>${esc(c[0].toUpperCase())}</th>`).join("")}<th></th></tr></thead><tbody>${rows.map((r,i)=>`<tr>${r.map((v,j)=>`<td>${pvcell(cols[j],v)}</td>`).join("")}<td class="cal-act">${pvEB(tb,i)}</td></tr>`).join("")||`<tr><td colspan="${cols.length+1}" style="text-align:center;padding:20px;color:#98a4b1">No rows yet.</td></tr>`}</tbody></table></div>`;
}
const pvpanel=(t,sub,add,body)=>`<div class="panel tui-panel"><div class="panel-heading"><div><h3>${t}</h3><p class="muted">${sub}</p></div>${add}</div>${body}</div>`;

/* Personal-data pattern check over the app's saved content */
const PV_PATTERNS=[["12-digit number (could be an LRN)",/(?<!\d)\d{12}(?!\d)/g],["Email address",/[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+\.[A-Za-z0-9.-]+/g],["Philippine mobile number",/(?:\+?63|0)9\d{2}[\s-]?\d{3}[\s-]?\d{4}(?!\d)/g]];
function pvSources(){
  const g=f=>{try{return f()}catch(e){return undefined}};
  return [["Smart Admin",g(()=>amData)],["Smart Learner",g(()=>lmData)],["Smart Decision",g(()=>decData)],["Calendar",g(()=>calEvents)],["At-risk workflow",g(()=>atRisk)],["Instruction",g(()=>insData)],["Teacher",g(()=>tchData)],["Project",g(()=>prjData)],["Resource",g(()=>resData)],["Modules",g(()=>modules)],["Privacy page",prvData]];
}
function pvScan(){
  const hits=[];
  const walk=(v,label,path)=>{
    if(typeof v==="string"){PV_PATTERNS.forEach(([t,re])=>{(v.match(re)||[]).forEach(m=>hits.push([label,path,t,m.slice(0,2)+"•".repeat(Math.max(2,m.length-3))+m.slice(-1)]))})}
    else if(Array.isArray(v))v.forEach((x,i)=>walk(x,label,path+"["+(i+1)+"]"));
    else if(v&&typeof v==="object")Object.keys(v).forEach(k=>walk(v[k],label,path?path+"."+k:k));
  };
  pvSources().forEach(([l,v])=>{if(v!==undefined)walk(v,l,"")});
  return hits;
}
const pvScanState={hits:null,at:""};
function pvScanPanel(){
  const h=pvScanState.hits,body=h===null?`<p class="muted">Not run yet.</p>`:h.length?`<div class="table-wrap"><table><thead><tr><th>WHERE</th><th>LOCATION</th><th>PATTERN</th><th>FOUND (MASKED)</th></tr></thead><tbody>${h.map(x=>`<tr><td>${esc(x[0])}</td><td>${esc(x[1])}</td><td>${esc(x[2])}</td><td>${esc(x[3])}</td></tr>`).join("")}</tbody></table></div><p class="muted" style="margin:8px 0 0;font-size:11px">Remove these values from the records, then run the check again.</p>`:`<p><span class="status-chip completed">No patterns found</span> <span class="muted" style="font-size:12px">Checked ${esc(pvScanState.at)}</span></p>`;
  return pvpanel("Personal-data check","Scans the content saved in this prototype for 12-digit numbers, email addresses, and Philippine mobile numbers. It cannot recognize names, so people must still review records.",`<button class="outline-btn mini" data-pv="scan">Run personal-data check</button>`,body);
}
function pvRender(){
  const m=pvmeta(),D=prvData,n=s=>D.main.filter(r=>r[4]===s).length;
  $("#page-prv").innerHTML=`<div class="tui-top"><button class="outline-btn mini" data-pv="back">← Home</button></div>
  <div class="tui-head"><div class="tui-icon">⛨</div><div><p class="eyebrow">SYSTEM / DATA PRIVACY</p><h1>${esc(m[0])}</h1><p class="muted">${esc(m[1])}</p><p class="dui-rev">Content last reviewed against DepEd issuances: <b>${esc(amDate(m[4])||"not recorded")}</b></p><div class="dui-adm"><button class="adm add" data-pch="meta">✎ Edit page details</button><button class="adm danger" data-pch="reset">Restore default content</button></div></div></div>
  <div class="advisory-note">${esc(m[3])}</div>
  <div class="module-summary-grid"><div class="summary-tile"><span>Safeguards</span><strong>${D.main.length}</strong></div><div class="summary-tile"><span>In place</span><strong>${n("In place")}</strong></div><div class="summary-tile"><span>Partly in place</span><strong>${n("Partly in place")}</strong></div><div class="summary-tile"><span>Planned for production</span><strong>${n("Planned for production")}</strong></div></div>
  ${pvpanel("Safeguards","Status shows what this prototype actually does today. Planned items must be done before real data or AI tools are used.",pvAdd("main","Add safeguard"),pvtable("main"))}
  <div class="panel tui-panel pv-closing"><strong>Data exposure</strong><p>${esc(m[2])}</p></div>
  ${pvScanPanel()}
  ${pvpanel("Decisions the system does not make","High-stakes decisions stay with people. This follows DO 3, s. 2026 on human oversight.",pvAdd("decide","Add row"),pvtable("decide"))}
  ${pvpanel("Planned role-based access","The prototype has one demo admin. In production, each role sees only what it needs.",pvAdd("roles","Add role"),pvtable("roles"))}
  ${pvpanel("Privacy notices and consent","Documents to prepare with the Data Protection Officer before real data is collected.",pvAdd("notices","Add document"),pvtable("notices"))}
  ${pvpanel("Monitoring checklist","Regular checks for security, accuracy, and compliance.",pvAdd("check","Add item"),pvtable("check"))}
  ${pvpanel("DepEd basis and references","The laws and issuances behind these safeguards. Verify with your Data Protection Officer and update as new issuances are released.",pvAdd("refs","Add reference"),pvtable("refs"))}`;
}
function pvShow(){
  currentModule="privacy";
  $$(".page-section").forEach(s=>s.classList.remove("active"));$("#page-prv").classList.add("active");
  $$(".nav-item").forEach(li=>li.classList.toggle("active",li.dataset.pages.split(" ").includes("privacy")));
  $("#breadcrumbPage").textContent="System · "+pvmeta()[0];
  pvRender();closeDD();$("#topNav").classList.remove("open");window.scrollTo({top:0,behavior:"smooth"});
}
const _goTo8=goTo;goTo=function(p){if(p==="privacy")return pvShow();_goTo8(p)};
function pvSave(msg){persist();pvRender();$("#breadcrumbPage").textContent="System · "+pvmeta()[0];showToast(msg||"Saved.")}
function pvAct(a,tb,i){
  if(a==="meta")return admForm("Edit page details",[["Page title"],["Commitment statement"],["Data exposure statement"],["Notice shown to users"],["Content last reviewed","date"]],pvmeta(),v=>{prvData.meta=[v[0]||PVMETA_DEFAULT[0],v[1],v[2],v[3],v[4]];pvSave()});
  if(a==="reset"){if(confirm("Restore the default content for this page? Your edits to it will be removed.")){prvData=pvdefaults();pvSave("Default content restored.")}return}
  const arr=prvData[tb],cols=PVCOLS[tb];
  if(a==="del"){if(confirm("Delete this row?")){arr.splice(i,1);pvSave()}return}
  const row=a==="add"?cols.map(c=>c[1]==="number"?arr.length+1:c[1]==="select"?c[2][0]:""):arr[i];
  admForm((a==="add"?"Add":"Edit")+" row",cols.map(c=>[c[0],c[1]||"text",c[2]]),row,v=>{
    const n=v.map((x,j)=>cols[j][1]==="number"?(+x||0):x);
    if(a==="add")arr.push(n);else arr[i]=n;pvSave();
  });
}
$("#page-prv").addEventListener("click",e=>{
  const t=e.target.closest("[data-pv]");
  if(t){
    if(t.dataset.pv==="back")return goTo("dashboard");
    if(t.dataset.pv==="scan"){pvScanState.hits=pvScan();pvScanState.at=new Date().toLocaleString("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"});pvRender();return showToast(pvScanState.hits.length?pvScanState.hits.length+" possible personal-data values found.":"No personal-data patterns found.")}
  }
  const b=e.target.closest("[data-pch]");if(b&&isAdmin)pvAct(b.dataset.pch,b.dataset.tb,+b.dataset.i);
});
