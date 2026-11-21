/* Smart Admin: five DepEd-aligned interfaces (editable by admin). The calendar keeps its own page (calendar.js). */
const amToday=()=>new Date().toISOString().slice(0,10),amIn=n=>new Date(Date.now()+n*864e5).toISOString().slice(0,10);
const amDate=s=>s?new Date(s+"T00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):"";
const amn=v=>Number.isFinite(+v)?+v:0,amfix=n=>Math.round(n*100)/100;
const amchip=v=>/^(Updated|Generated|Submitted|Active|Public|Reviewed|Yes|No personal|Allowed with|Achieved|On schedule|Closed|Done|Ongoing)/.test(v)?"completed":/^(For update|Needs validation|Ready|Not yet due|Internal|For review|Pending|Not checked|Not applicable|On track|Due soon|Archived|Partly)/.test(v)?"progress":"review";
const amChip=t=>`<span class="status-chip ${amchip(t)}">${esc(t)}</span>`;
const amcell=(c,v)=>c[3]?amChip(String(v)):c[1]==="date"?esc(amDate(v)):c[1]==="number"?esc(amn(v).toLocaleString("en-US")):esc(v);
const AM_MODS=["Smart Admin","Smart Learner","Smart Teacher","Smart Instruction","Smart Project","Smart Resource","All modules"];
const AM_MAP={"Smart Admin":["admin"],"Smart Learner":["learner"],"Smart Teacher":["teacher"],"Smart Instruction":["instruction"],"Smart Project":["project"],"Smart Resource":["resource"],"All modules":["admin","learner","teacher","instruction","project","resource"]};
const AR={
 sbm:["DepEd Order No. 7, s. 2024","Policy Guidelines on the Implementation of the Revised School-Based Management (SBM) System (May 16, 2024). Schools do an SBM self-assessment checklist across six dimensions.","Indicators, school information, and evidence kept here support the SBM self-assessment and planning."],
 sip:["DepEd Order No. 44, s. 2015 (verify the current version)","Policy guidelines on the Enhanced School Improvement Plan (SIP) process and the School Report Card","Source of the SIP, the Annual Implementation Plan (AIP), and the School Report Card figures."],
 cal:["DepEd Order No. 9, s. 2026","Guidelines on the Implementation of the Three-Term School Calendar in Basic Education (April 16, 2026). The school year opens June 8, 2026 and ends April 8, 2027, with 201 class days.","Due dates and review points follow the term blocks: opening, instructional, and end-of-term."],
 asm:["DepEd Order No. 15, s. 2026","Revised Guidelines on Classroom Assessment, Grading System, and Awards and Recognition","Learning outcome indicators and school forms that carry grades follow these guidelines."],
 ai:["DepEd Order No. 3, s. 2026","Foundational Guidelines on Artificial Intelligence in Basic Education (February 20, 2026)","AI supports staff and does not replace them. Human oversight and disclosure are required, and high-risk uses are prohibited."],
 priv:["RA 10173","Data Privacy Act of 2012","No personal learner or personnel data in dashboards, summaries, or AI tools. Registers hold titles and links only."],
 ra9155:["RA 9155","Governance of Basic Education Act of 2001","School heads are accountable for school operations and records."],
 sys:["LIS and EBEIS","DepEd's Learner Information System and Enhanced Basic Education Information System (verify the current memorandum)","Enrolment and school figures here should match what is recorded in these systems."]
};
const AM_RET="Per the approved records disposition schedule (verify with the SDO records officer)";

function amRepTiming(r){
  if(r[7]==="Submitted")return amChip("Closed");
  const due=Math.round((new Date(r[5])-new Date(amToday()))/864e5);
  return amChip(due<0?"Overdue":due<=7?"Due soon":"On schedule");
}
function amDocTiming(r){
  if(r[8]==="Archived"||r[8]==="For disposal"||!r[7])return"–";
  const d=Math.round((new Date(r[7])-new Date(amToday()))/864e5);
  return amChip(d<0?"Overdue":d<=30?"Due soon":"On schedule");
}
function amInd(r,D){
  const b=amn(r[3]),t=amn(r[4]),c=amn(r[5]),hi=r[6]!=="Lower",th=D.aux[0]&&isFinite(+D.aux[0][1])?+D.aux[0][1]:60;
  if(!c)return{p:null,rate:"No data"};
  const span=t-b,p=span?Math.max(0,(c-b)/span*100):(hi?(c>=t?100:0):(c<=t?100:0)),ok=hi?c>=t:c<=t;
  return{p:Math.round(p),rate:ok?"Achieved":p>=th?"On track":"Behind"};
}

function amdefaults(){return{
dashboard:{main:[
 ["School profile","School name","Alcantara National High School",amIn(-30),"School records","Updated"],
 ["School profile","School ID","301747",amIn(-30),"School records","Updated"],
 ["School profile","Division and region","Division of Romblon · Region IV-B MIMAROPA",amIn(-30),"School records","Updated"],
 ["School profile","Curriculum offered","Junior High School and Senior High School (sample; edit as needed)",amIn(-30),"School records","For update"],
 ["School profile","School Head","Enter name and position",amIn(-30),"School records","For update"],
 ["Enrolment","Total enrolment","1,248",amIn(-20),"LIS (sample figure)","Needs validation"],
 ["Personnel","Teaching personnel","48",amIn(-12),"Smart Teacher (sample)","Updated"],
 ["Personnel","Non-teaching personnel","6",amIn(-12),"School records (sample)","Updated"],
 ["Facilities","Classrooms","36",amIn(-25),"Smart Resource (sample)","Updated"],
 ["Facilities","Classrooms in good condition","30",amIn(-25),"Smart Resource (sample)","For update"],
 ["Finance","Budget lines tracked (allocation)","₱465,000",amIn(-8),"Smart Project (sample; not an official accounting record)","Updated"],
 ["Programs and projects","Feeding program beneficiaries","86",amIn(-6),"Smart Resource (sample)","Updated"],
 ["Programs and projects","SIP cycle","Confirm the current cycle with the SDO",amIn(-60),"SIP document","For update"]],
 aux:[["Grade 7",8,310],["Grade 8",8,295],["Grade 9",7,270],["Grade 10",7,255],["Grade 11",2,62],["Grade 12",2,56]],
 check:[["School profile checked and updated","Start of each school year","Ongoing",""],["Enrolment figures match the official school data systems (LIS, EBEIS)","After enrolment and each term","Pending","1 needs validation"],["Personnel and facilities data updated when they change","As changes occur","Ongoing",""],["Module snapshot reviewed by the School Head","Weekly","Pending",""],["No personal learner or personnel data on the dashboard","Always","Done",""]],
 refs:[AR.sbm,AR.sip,AR.sys,AR.cal,AR.ra9155,AR.priv]},
reports:{main:[
 ["School Form 4 (SF4): Monthly Learner Movement and Attendance","Monthly","Smart Learner","Registrar and class advisers","SDO",amIn(6),"","Ready to generate","Verify the form and schedule with the SDO."],
 ["School Form 2 (SF2): Daily Attendance Report of Learners","Monthly","Smart Learner","Class advisers","School Head",amIn(-3),amIn(-3),"Submitted",""],
 ["Term accomplishment report","Per term","All modules","School Head","SDO",amIn(26),"","Not yet due","Term 2 end-of-term block ends December 18, 2026 (DO 9, s. 2026)."],
 ["Instructional supervision consolidation","Per term","Smart Instruction","Head Teacher","SDO",amIn(20),"","Not yet due",""],
 ["Learning resources monitoring report","Per term","Smart Instruction","Property custodian","SDO",amIn(-2),"","Overdue","Check the current learning resources memorandum (DM 0522, s. 2026)."],
 ["Budget utilization and liquidation report","Monthly","Smart Project","Designated finance officer","SDO",amIn(9),"","Not yet due","Follow current MOOE and COA rules (verify). View and report only."],
 ["Canteen and feeding program report","Monthly","Smart Resource","Feeding program coordinator","School Head",amIn(5),"","Ready to generate",""],
 ["SBM self-assessment checklist (DO 7, s. 2024)","Annual","Smart Admin","SBM coordinator","SDO",amIn(120),"","Not yet due","Follow the SDO's schedule for the self-assessment."],
 ["SIP and AIP progress report","Per term","Smart Project","School Planning Team","SDO",amIn(28),"","Not yet due",""],
 ["School Forms 5 and 6: Promotion, learning progress, and summarized report","Annual","Smart Learner","Class advisers and registrar","SDO","2027-04-08","","Not yet due","Check the forms against DO 15, s. 2026 before use."]],
 aux:[["School name","Alcantara National High School"],["School ID","301747"],["Division and region","Division of Romblon · Region IV-B MIMAROPA"],["Prepared by","Name and position of the preparer"],["Noted by","Name of the School Head"],["Footer note","Generated from school data. Review and sign before submission."]],
 check:[["Source modules updated before generating","Before each report","Ongoing",""],["Report data checked against school records","Every report","Ongoing",""],["Prepared by and Noted by completed before submission","Every report","Ongoing",""],["Submitted by the SDO's required channel and by the due date","Per SDO schedule (verify)","Ongoing","1 overdue"],["School forms checked against the current grading guidelines","Start of each term","Pending",""],["A copy of each submitted report filed in the document register","After submission","Pending",""]],
 refs:[AR.cal,AR.asm,AR.sbm,["School Forms (SF1 to SF10)","DepEd school forms for learner and personnel records and reports","Forms and schedules can change with new guidelines. Verify the current versions and due dates with your SDO."],AR.priv,AR.ai]},
documents:{main:[
 ["DOC-001","SY 2026–2027 school calendar (DO 9, s. 2026)","DepEd issuances","Public","2026-04-16","School Head","Shelf location or link",amIn(120),"Active"],
 ["DOC-002","Revised SBM policy guidelines (DO 7, s. 2024)","DepEd issuances","Public","2024-05-16","SBM coordinator","Shelf location or link",amIn(200),"Active"],
 ["DOC-003","Foundational Guidelines on AI in Basic Education (DO 3, s. 2026)","DepEd issuances","Public","2026-02-20","ICT coordinator","Shelf location or link",amIn(90),"Active"],
 ["DOC-004","School Improvement Plan and Annual Implementation Plan","Planning documents","Internal","2025-09-30","School Planning Team","Shelf location or link",amIn(45),"Active"],
 ["DOC-005","Personnel files: index only","Personnel records","Confidential","2026-06-01","School Head","Locked cabinet (index only)",amIn(150),"Active"],
 ["DOC-006","Learner permanent records: index only","Learner records (restricted)","Confidential","2026-06-01","Registrar","Locked cabinet (index only)",amIn(150),"Active"],
 ["DOC-007","MOOE liquidation reports","Financial records","Internal","2026-10-31","Designated finance officer","Shelf location or link",amIn(-4),"For review"],
 ["DOC-008","Minutes of faculty meetings, Term 2","School records","Internal","2026-10-12","School secretary","Shelf location or link",amIn(60),"Active"],
 ["DOC-009","Division memorandum on learning resources (DM 0522, s. 2026)","DepEd issuances","Public","2026-06-10","Property custodian","Shelf location or link",amIn(100),"Active"],
 ["DOC-010","Attendance sheets, SY 2021–2022","Reports and forms","Internal","2022-03-31","Registrar","Storage room","","Archived"]],
 aux:[["Learner records","Confidential","Class adviser, registrar, School Head",AM_RET],["Personnel records","Confidential","School Head and authorized staff",AM_RET],["Financial records","Internal","School Head, designated finance officer, auditors",AM_RET],["Planning documents and reports","Internal","School staff and the SDO",AM_RET],["DepEd issuances","Public","Anyone",AM_RET]],
 check:[["Each document registered with an owner and a classification","When received or created","Ongoing",""],["Confidential and learner records kept in restricted storage","Always","Done",""],["Documents reviewed on their review date","Per document","Pending","1 overdue"],["Archived and disposal-ready records handled under the disposition schedule","Annually","Pending",""],["Latest DepEd issuances filed and the older version marked","When issued","Ongoing",""],["The register holds titles and links only, never the learner or personnel data itself","Always","Done",""]],
 refs:[["RA 9470","National Archives of the Philippines Act of 2007","Governs the management and disposal of government records. Follow the approved records disposition schedule."],AR.priv,["Executive Order No. 2, s. 2016","Freedom of Information in the Executive Branch","Public documents may be requested. Mark which documents are Public."],AR.ra9155,AR.ai]},
indicators:{main:[
 ["Learners enrolled out of the school-age children in the catchment area","Access","%",92,95,93.5,"Higher","Early registration and LIS","Registrar"],
 ["School leaver (dropout) rate","Access","%",1.4,1,1.1,"Lower","Learner records","Class advisers"],
 ["Learner attendance rate","Access","%",93.8,95,94.6,"Higher","Smart Learner","Class advisers"],
 ["Learners at or above the expected level","Quality","%",70,75,74.8,"Higher","Term examinations (DO 15, s. 2026)","Teachers"],
 ["Promotion rate","Quality","%",96,97,0,"Higher","End-of-year records","Class advisers"],
 ["Learners in ARAL who improved","Equity and inclusion","%",60,70,64,"Higher","ARAL monitoring","ARAL coordinator"],
 ["Learners with a completed health assessment","Resilience and well-being","%",85,100,92,"Higher","Health assessment records","Health coordinator"],
 ["Teachers with a completed classroom observation","Governance and management","%",70,100,82,"Higher","Smart Teacher","Head Teacher"],
 ["SIP and AIP activities accomplished","Governance and management","%",0,100,58,"Higher","Smart Project","School Planning Team"],
 ["Learners per textbook copy","Governance and management","learners",1.8,1,1.3,"Lower","Smart Instruction","Property custodian"]],
 aux:[["On track at or above (% progress to target)",60,"Progress is measured from the baseline toward the target. Below this value, an indicator is rated Behind. A current value of 0 is read as No data."]],
 check:[["Targets match the SIP, AIP, and SBM plan","Start of the school year","Done",""],["Current values updated from the source modules","Monthly","Ongoing",""],["Term results added after each end-of-term block (DO 9, s. 2026)","Each term","Ongoing",""],["Indicators rated Behind discussed by the School Planning Team","Each term","Pending",""],["SBM self-assessment done with stakeholders","Annually, per SDO schedule (verify)","Pending",""],["Results shared with stakeholders through the School Report Card","Annually","Pending",""]],
 refs:[AR.sbm,AR.sip,AR.asm,AR.cal,["Basic Education Development Plan (BEDP) 2030 (verify)","DepEd's medium-term plan for basic education","The areas used to group indicators (access, quality, equity, resilience, governance) should be confirmed against this plan and your SDO."]]},
summaries:{main:[
 [amIn(-11),"Weekly school summary","School Head","Administrative officer","School-approved AI assistant (sample)","Reviewed and edited","Yes","No personal data used","Corrected two figures against school records"],
 [amIn(-9),"Meeting minutes draft","Faculty","School secretary","School-approved AI assistant (sample)","Reviewed and edited","Yes","No personal data used","Names of learners removed before drafting"],
 [amIn(-6),"Report narrative draft","SDO","School Planning Team","School-approved AI assistant (sample)","Pending review","Yes","Not checked","Waiting for the School Head's review"],
 [amIn(-4),"Memo or communication draft","Parents and guardians","Administrative officer","School-approved AI assistant (sample)","Rejected","No","Not checked","Tone did not fit a formal notice"],
 [amIn(-2),"Data highlights","School Planning Team","ICT coordinator","School-approved AI assistant (sample)","Reviewed and edited","Yes","No personal data used",""]],
 aux:[["Drafting narratives from aggregated school data","Allowed with review","A named official reviews and edits the draft, and AI help is disclosed."],["Summarizing meeting notes or memos","Allowed with review","Remove personal data first."],["Grammar checking and formatting of reports","Allowed with review","Check that the meaning has not changed."],["Deciding final grades or promotion of learners","Not allowed","Teachers and school officials decide (DO 3, s. 2026; DO 15, s. 2026)."],["Facial recognition or biometric surveillance","Not allowed","High-risk use prohibited under DO 3, s. 2026 (verify in the Order)."],["Entering names, LRNs, or other personal data into an AI tool","Not allowed","Data Privacy Act (RA 10173)."]],
 check:[["Summary reviewed and edited by an authorized staff member before use","Every item","Ongoing","1 pending"],["AI help disclosed in the document","Every item","Ongoing","1 not disclosed"],["Only school-approved AI tools used","Always","Done",""],["No personal learner or personnel data entered into AI tools","Always","Done",""],["Facts and figures checked against the source records","Every item","Ongoing",""],["Log kept of AI-assisted summaries","Every item","Ongoing",""]],
 refs:[AR.ai,AR.priv,AR.asm,["Project AGAP.AI","DepEd's program on AI awareness and training in basic education (launched January 9, 2026)","Reference for training staff on responsible AI use."]]}
};}
var amData=amdefaults();
try{const s=JSON.parse(localStorage.getItem("smartanhs.v1")||"null");if(s&&s.amData)Object.keys(amData).forEach(k=>{if(s.amData[k])amData[k]=Object.assign(amData[k],s.amData[k])})}catch(e){}

const AMREV="2026-11-21";
const AMDEF={
 dashboard:{title:"Centralized school information dashboard",icon:"⌂",chip:5,
  desc:"One place for the school's key information, with a live snapshot of every SMART module and enrolment by grade level.",
  notice:"Sample data only. Match enrolment and school figures to the official school data systems (LIS, EBEIS). Do not put personal learner or personnel data here.",
  cols:[S("Category",["School profile","Enrolment","Personnel","Facilities","Finance","Programs and projects"]),["Item"],["Value"],["As of","date"],["Source / system"],S("Status",["Updated","For update","Needs validation"],1)],
  auxTitle:"Enrolment by grade level",auxCols:[["Grade level"],["Sections","number"],["Learners enrolled","number"]],
  auxCalc:{head:["Average class size"],fn:r=>[amn(r[1])?String(amfix(amn(r[2])/amn(r[1]))):"–"]},
  auxSub:"Totals feed the summary tiles above.",
  tiles:(r,D)=>[["Total enrolment",dsumAm(D.aux,2).toLocaleString("en-US")],["Sections",dsumAm(D.aux,1)],["Items to update",r.filter(x=>x[5]!=="Updated").length],["Items tracked",r.length]]},
 reports:{title:"Automated report generation",icon:"▤",chip:7,
  desc:"A list of the school's regular reports with due dates. Generate a report from current SMART data, then print or save it as PDF.",
  notice:"Sample data only. Generated reports use the figures in the SMART modules and need review and signature before submission. Confirm forms and due dates with your SDO.",
  cols:[["Report / form"],S("Frequency",["Weekly","Monthly","Per term","Annual","As requested"]),S("Source module",AM_MODS),["Prepared by (role)"],["Submitted to"],["Next due","date"],["Last generated","date"],S("Status",["Not yet due","Ready to generate","Generated","Submitted","Overdue"],1),["Remarks"]],
  calc:{head:["Timing",""],fn:(r,D,i)=>[amRepTiming(r),`<button class="outline-btn mini" data-am="gen" data-i="${i}">Generate</button>`]},
  auxTitle:"Report header and sign-off settings",auxCols:[["Setting"],["Value"]],
  auxSub:"These values appear on every generated report. Keep the order of the rows.",
  tiles:r=>[["Reports tracked",r.length],["Generated or submitted",r.filter(x=>x[7]==="Generated"||x[7]==="Submitted").length],["Due within 7 days",r.filter(x=>x[7]!=="Submitted"&&(new Date(x[5])-new Date(amToday()))/864e5>=0&&(new Date(x[5])-new Date(amToday()))/864e5<=7).length],["Overdue",r.filter(x=>x[7]!=="Submitted"&&new Date(x[5])<new Date(amToday())).length]]},
 documents:{title:"Digital document and records management",icon:"▣",chip:8,
  desc:"A register of school documents and records with their category, classification, owner, location, and review date.",
  notice:"Sample data only. The register holds titles and links, not the records themselves. Keep learner and personnel records in restricted storage (RA 10173).",
  cols:[["Doc no."],["Document title"],S("Category",["School records","Personnel records","Learner records (restricted)","Financial records","Planning documents","DepEd issuances","Reports and forms"]),S("Classification",["Public","Internal","Confidential"],1),["Document date","date"],["Owner (role)"],["Storage / link"],["Next review","date"],S("Status",["Active","For review","Archived","For disposal"],1)],
  calc:{head:["Review timing"],fn:r=>[amDocTiming(r)]},
  auxTitle:"Records classification and access guide",auxCols:[["Record type"],["Classification"],["Who may access"],["Retention / disposal basis"]],
  auxSub:"Adjust to your school's rules and the SDO records officer's guidance.",
  tiles:r=>[["Documents registered",r.length],["Confidential",r.filter(x=>x[3]==="Confidential").length],["Review overdue or within 30 days",r.filter(x=>x[7]&&x[8]!=="Archived"&&x[8]!=="For disposal"&&(new Date(x[7])-new Date(amToday()))/864e5<=30).length],["Archived or for disposal",r.filter(x=>x[8]==="Archived"||x[8]==="For disposal").length]]},
 indicators:{title:"Management performance indicators",icon:"◈",chip:1,
  desc:"Indicators with a baseline, a target, and the current value. Progress and rating are worked out from the numbers, in line with SBM and the school's plans.",
  notice:"Sample data only. Set targets from the SIP and AIP. Use end-of-term data from the three-term calendar (DO 9, s. 2026) and align with the SBM self-assessment (DO 7, s. 2024).",
  cols:[["Indicator"],S("Area",["Access","Quality","Equity and inclusion","Resilience and well-being","Governance and management"]),["Unit"],["Baseline (SY 2025–2026)","number"],["Target (SY 2026–2027)","number"],["Current","number"],S("Better when",["Higher","Lower"]),["Data source"],["Owner (role)"]],
  calc:{head:["Progress","Rating"],fn:(r,D)=>{const x=amInd(r,D);return[x.p===null?"–":`<div class="bar"><span style="width:${Math.min(100,x.p)}%"></span></div><small>${x.p}%</small>`,amChip(x.rate)]}},
  auxTitle:"Rating rules",auxCols:[["Rule"],["Value","number"],["Meaning"]],
  auxSub:"This value sets when an indicator is rated On track or Behind.",
  tiles:(r,D)=>{const x=r.map(y=>amInd(y,D).rate);return[["Indicators",r.length],["Achieved",x.filter(y=>y==="Achieved").length],["On track",x.filter(y=>y==="On track").length],["Behind",x.filter(y=>y==="Behind").length]]}},
 summaries:{title:"AI-assisted administrative summaries",icon:"✧",chip:5,
  desc:"A log of administrative summaries and drafts, with human review, disclosure, and a privacy check, following DO 3, s. 2026. A template can also prepare a draft from current school data.",
  notice:"Sample data only. AI is not connected in this prototype. The draft below comes from a template, not from AI. AI help must always be reviewed by an authorized person and disclosed.",
  cols:[["Date","date"],S("Summary type",["Weekly school summary","Monthly accomplishment summary","Meeting minutes draft","Memo or communication draft","Report narrative draft","Data highlights"]),["Prepared for"],["Prepared by (role)"],["Tool used"],S("Human review",["Reviewed and edited","Pending review","Rejected"],1),S("AI use disclosed",["Yes","No","Not applicable"],1),S("Personal data check",["No personal data used","Not checked"],1),["Notes"]],
  auxTitle:"Allowed and not allowed uses (DO 3, s. 2026)",auxCols:[["Use"],S("Rule",["Allowed with review","Not allowed"],1),["Condition"]],
  auxSub:"Edit to match the Order and your division's guidance.",
  tiles:r=>[["Summaries logged",r.length],["Reviewed by staff",r.filter(x=>x[5]==="Reviewed and edited").length],["Pending review",r.filter(x=>x[5]==="Pending review").length],["Disclosed as AI-assisted",Math.round(r.filter(x=>x[6]==="Yes").length/(r.length||1)*100)+"%"]]}
};
function dsumAm(a,i){return a.reduce((s,x)=>s+(+x[i]||0),0)}
const AMKEYS=Object.keys(AMDEF);
const adminKey=t=>/centralized|information dashboard/i.test(t)?"dashboard":/report generation/i.test(t)?"reports":/document|records management/i.test(t)?"documents":/performance indicators/i.test(t)?"indicators":/AI-assisted|administrative summar/i.test(t)?"summaries":null;
let amcur="dashboard";const amst={q:"",f:""};
const ammeta=k=>{const m=amData[k].meta;return m&&m.length>=4?m:[AMDEF[k].title,AMDEF[k].desc,AMDEF[k].notice,AMREV]};
const amcols=(k,tb)=>tb==="main"?AMDEF[k].cols:tb==="refs"?REFC:tb==="check"?CHKC:AMDEF[k].auxCols;
const amEB=(k,tb,i)=>`<button class="adm" data-ach="edit" data-k="${k}" data-tb="${tb}" data-i="${i}">✎</button><button class="adm danger" data-ach="del" data-k="${k}" data-tb="${tb}" data-i="${i}">✕</button>`;
const amAdd=(k,tb,l)=>`<button class="adm add" data-ach="add" data-k="${k}" data-tb="${tb}">＋ ${l}</button>`;
function amtable(k,tb,rows,idx){
  const d=AMDEF[k],cols=amcols(k,tb),D=amData[k],calc=tb==="main"?d.calc:tb==="aux"?d.auxCalc:null;
  const head=cols.map(c=>`<th>${esc(c[0].toUpperCase())}</th>`).concat(calc?calc.head.map(h=>`<th>${esc(h.toUpperCase())}</th>`):[]).join("");
  const body=rows.map((r,n)=>{const i=idx?idx[n]:n;return `<tr>${r.map((v,j)=>`<td>${amcell(cols[j],v)}</td>`).join("")}${calc?calc.fn(r,D,i).map(x=>`<td>${x}</td>`).join(""):""}<td class="cal-act">${amEB(k,tb,i)}</td></tr>`}).join("")||`<tr><td colspan="${cols.length+(calc?calc.head.length:0)+1}" style="text-align:center;padding:20px;color:#98a4b1">No records match.</td></tr>`;
  return `<div class="table-wrap"><table><thead><tr>${head}<th></th></tr></thead><tbody>${body}</tbody></table></div>`;
}
function ammain(k){
  const d=AMDEF[k],q=amst.q.toLowerCase(),idx=[],rows=[];
  amData[k].main.forEach((r,i)=>{if((!q||r.join(" ").toLowerCase().includes(q))&&(!amst.f||r[d.chip]===amst.f)){idx.push(i);rows.push(r)}});
  return amtable(k,"main",rows,idx);
}
const ampanel=(t,sub,add,body)=>`<div class="panel tui-panel"><div class="panel-heading"><div><h3>${t}</h3><p class="muted">${sub}</p></div>${add}</div>${body}</div>`;
function amSnapshot(){
  return ampanel("Live module snapshot","Figures taken from each SMART module, so the whole school is visible in one place.","",
   `<div class="am-mods">${Object.keys(modules).map(k=>{const m=modules[k];return `<div class="am-mod"><div class="am-mod-h"><span>${esc(m.icon)}</span><strong>${esc(m.title)}</strong></div>${m.summary.map(s=>`<div class="am-kv"><span>${esc(s[0])}</span><b>${esc(s[1])}</b></div>`).join("")}<button class="outline-btn mini" data-am="go" data-k="${k}">Open →</button></div>`}).join("")}</div>`);
}
function amDraft(){
  const L=[],d=new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"});
  L.push("School summary as of "+d+", Alcantara National High School.");
  ["learner","teacher","instruction","project","resource"].forEach(k=>{const m=modules[k];L.push(m.title+": "+m.summary.map(s=>s[0]+" "+s[1]).join("; ")+".")});
  try{const o=decData.concerns.main.filter(r=>r[8]!=="Resolved").length,p=decData.recommend.main.filter(r=>r[8]==="Pending decision").length;L.push(`Smart Decision: ${o} open operational concern${o===1?"":"s"}; ${p} recommendation${p===1?"":"s"} awaiting a decision.`)}catch(e){}
  try{const rp=amData.reports.main,od=rp.filter(r=>r[7]!=="Submitted"&&new Date(r[5])<new Date(amToday())).length,ds=rp.filter(r=>r[7]!=="Submitted"&&(new Date(r[5])-new Date(amToday()))/864e5>=0&&(new Date(r[5])-new Date(amToday()))/864e5<=7).length;L.push(`Reports: ${od} overdue; ${ds} due within 7 days.`)}catch(e){}
  return L;
}
function amDraftPanel(){
  const L=amDraft();
  return ampanel("Draft summary from current data","Prepared by a template from the figures in the SMART modules. It is not AI output. Review and edit before use.",`<button class="outline-btn mini" data-am="copy">Copy text</button> <button class="adm add" data-am="log">＋ Log in register</button>`,
   `<div class="am-draft">${L.map(x=>`<p>${esc(x)}</p>`).join("")}</div><p class="muted" style="font-size:11px;margin:8px 0 0">Figures come from sample data. Check them against school records.</p>`);
}
function amRender(){
  const k=amcur,d=AMDEF[k],D=amData[k],m=ammeta(k);
  const extra={dashboard:amSnapshot,summaries:amDraftPanel}[k];
  $("#page-amu").innerHTML=`<div class="tui-top"><button class="outline-btn mini" data-am="back">← Smart Admin</button><div class="tui-tabs">${["dashboard","reports","documents","calendar","indicators","summaries"].map(x=>x==="calendar"?`<button data-am="cal">School calendar and activity monitoring</button>`:`<button class="${x===k?"on":""}" data-am="${x}">${esc(ammeta(x)[0])}</button>`).join("")}</div></div>
  <div class="tui-head"><div class="tui-icon">${d.icon}</div><div><p class="eyebrow">SMART ADMIN</p><h1>${esc(m[0])}</h1><p class="muted">${esc(m[1])}</p><p class="dui-rev">Content last reviewed against DepEd issuances: <b>${esc(amDate(m[3])||"not recorded")}</b></p><div class="dui-adm"><button class="adm add" data-ach="meta" data-k="${k}">✎ Edit page details</button><button class="adm danger" data-ach="reset" data-k="${k}">Restore default content</button></div></div></div>
  <div class="advisory-note">${esc(m[2])}</div>
  <div class="module-summary-grid">${d.tiles(D.main,D).map(t=>`<div class="summary-tile"><span>${esc(t[0])}</span><strong>${esc(t[1])}</strong></div>`).join("")}</div>
  ${extra?extra():""}
  ${ampanel("Records","Search, filter, and review. Admins can add, edit, and delete rows.",amAdd(k,"main","Add record"),`<div class="tui-tools"><input id="amQ" placeholder="Search records…" value="${esc(amst.q)}" /><select id="amF"><option value="">All ${esc(d.cols[d.chip][0].toLowerCase())}</option>${d.cols[d.chip][2].map(o=>`<option${o===amst.f?" selected":""}>${esc(o)}</option>`).join("")}</select></div><div id="amMain">${ammain(k)}</div>`)}
  ${ampanel(d.auxTitle,d.auxSub,amAdd(k,"aux","Add row"),amtable(k,"aux",D.aux))}
  ${ampanel("Monitoring checklist","Requirements to track for this area.",amAdd(k,"check","Add item"),amtable(k,"check",D.check))}
  ${ampanel("DepEd basis and references","The orders, memorandums, and laws this interface follows. Verify and update as new issuances are released.",amAdd(k,"refs","Add reference"),amtable(k,"refs",D.refs))}`;
}
function amShow(k){
  amcur=k;amst.q="";amst.f="";currentModule="admin";
  $$(".page-section").forEach(s=>s.classList.remove("active"));$("#page-amu").classList.add("active");
  $$(".nav-item").forEach(li=>li.classList.toggle("active",li.dataset.pages.split(" ").includes("admin")));
  $("#breadcrumbPage").textContent="Smart Admin · "+ammeta(k)[0];
  amRender();closeDD();$("#topNav").classList.remove("open");window.scrollTo({top:0,behavior:"smooth"});
}
const _goTo6=goTo;goTo=function(p){if(typeof p==="string"&&p.startsWith("adm:"))return amShow(p.slice(4));_goTo6(p)};
function amSave(msg){persist();amRender();$("#breadcrumbPage").textContent="Smart Admin · "+ammeta(amcur)[0];showToast(msg||"Saved.")}
function amAct(a,k,tb,i){
  const D=amData[k];
  if(a==="meta"){return admForm("Edit page details",[["Page title"],["Description"],["Notice shown to users"],["Content last reviewed against DepEd issuances","date"]],ammeta(k),v=>{D.meta=[v[0]||AMDEF[k].title,v[1],v[2],v[3]];amSave()})}
  if(a==="reset"){if(confirm("Restore the default content for this page? Your edits to it will be removed.")){amData[k]=amdefaults()[k];amSave("Default content restored.")}return}
  const arr=D[tb],cols=amcols(k,tb);
  if(a==="del"){if(confirm("Delete this row?")){arr.splice(i,1);amSave()}return}
  const row=a==="add"?cols.map(c=>c[1]==="number"?0:c[1]==="select"?c[2][0]:c[1]==="date"?amToday():""):arr[i];
  admForm((a==="add"?"Add":"Edit")+" row",cols.map(c=>[c[0],c[1]||"text",c[2]]),row,v=>{
    const n=v.map((x,j)=>cols[j][1]==="number"?(+x||0):x);
    if(a==="add")arr.push(n);else arr[i]=n;amSave();
  });
}
function amReport(i){
  const r=amData.reports.main[i];if(!r)return;
  const s=amData.reports.aux,g=(n,def)=>s[n]&&s[n][1]!==undefined?s[n][1]:def,keys=AM_MAP[r[2]]||["admin"],one=keys.length===1;
  let h=`<div class="rep-head"><img src="logo.png" width="48" height="48" alt=""><div><small>${esc(g(2,""))}</small><strong>${esc(g(0,"Alcantara National High School"))}</strong><span>School ID ${esc(g(1,""))}</span></div></div><h4>${esc(r[0])}</h4><p class="muted">${esc(r[1])} report · Source: ${esc(r[2])} · Generated ${new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</p>`;
  keys.forEach(k=>{const m=modules[k];h+=`<h4>${esc(m.title)}</h4><p class="rep-tiles">${m.summary.map(x=>`<span><b>${esc(x[1])}</b> ${esc(x[0])}</span>`).join("")}</p>`;if(one)h+=tbl(["Record","Category","Updated","Status"],rows(m.records))});
  if(one&&keys[0]==="learner")h+=`<h4>Learners flagged for review</h4>`+tbl(["Learner code","Risk","Reasons","Stage"],rows(atRisk.map(l=>[l.id+" · "+l.gs,l.risk,l.why.join("; "),stages[l.stage]])));
  if(one&&(keys[0]==="project"||keys[0]==="resource"))h+=`<h4>Budget utilization</h4>`+tbl(["Line item","Allocated","Utilized","Rate"],rows(budget.map(b=>[b[0],peso(b[1]),peso(b[2]),Math.round(b[2]/b[1]*100)+"%"])));
  h+=`<div class="am-sign"><div><span>Prepared by</span><b>${esc(g(3,""))}</b></div><div><span>Noted by</span><b>${esc(g(4,""))}</b></div></div><p class="rep-note">${esc(g(5,""))} ${ADVISORY}</p>`;
  if(isAdmin){r[6]=amToday();if(["Ready to generate","Not yet due","Overdue"].includes(r[7]))r[7]="Generated";persist();amRender()}
  openInfo(r[0],h,[["Print / Save as PDF",()=>window.print(),"primary-btn"]]);
}
$("#page-amu").addEventListener("click",e=>{
  const t=e.target.closest("[data-am]");
  if(t){
    const v=t.dataset.am;
    if(v==="back")return goTo("admin");
    if(v==="cal"){goTo("admin");return setTimeout(()=>window.scrollToCal&&scrollToCal(),600)}
    if(v==="go")return goTo(t.dataset.k);
    if(v==="gen")return amReport(+t.dataset.i);
    if(v==="copy"){const txt=amDraft().join("\n\n");try{navigator.clipboard.writeText(txt).then(()=>showToast("Draft copied."),()=>showToast("Could not copy. Select the text instead."))}catch(x){showToast("Could not copy. Select the text instead.")}return}
    if(v==="log"){if(!isAdmin)return;amData.summaries.main.unshift([amToday(),"Data highlights","School Head","School Head","System template (not AI)","Pending review","Not applicable","No personal data used","Draft from live module data"]);return amSave("Logged in the register.")}
    return amShow(v);
  }
  const b=e.target.closest("[data-ach]");if(b&&isAdmin)amAct(b.dataset.ach,b.dataset.k,b.dataset.tb,+b.dataset.i);
});
$("#page-amu").addEventListener("input",e=>{if(e.target.id==="amQ"){amst.q=e.target.value;$("#amMain").innerHTML=ammain(amcur)}});
$("#page-amu").addEventListener("change",e=>{if(e.target.id==="amF"){amst.f=e.target.value;$("#amMain").innerHTML=ammain(amcur)}});
document.addEventListener("click",e=>{
  const b=e.target.closest('.dropdown .dd-item[data-page="admin"]');if(!b)return;
  const k=adminKey(b.textContent);if(k){e.stopPropagation();$("#topNav").classList.add("lock");amShow(k)}
},true);
