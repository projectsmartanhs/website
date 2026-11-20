/* Smart Decision: six DepEd-aligned interfaces (editable by admin) */
const dToday=()=>new Date().toISOString().slice(0,10),dIn=n=>new Date(Date.now()+n*864e5).toISOString().slice(0,10);
const dDate=s=>s?new Date(s+"T00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):"";
const dn=v=>Number.isFinite(+v)?+v:0,dfix=n=>Math.round(n*100)/100;
const dsum=(a,i)=>a.reduce((s,x)=>s+(+x[i]||0),0);
const dchip=v=>/^(Meets|Met\b|Improving|Resolved|Closed|Validated|Accepted|Implemented|Done|Low|Used in AIP|On schedule|Shown)/.test(v)?"completed":/^(Medium|Stable|Close|Under review|Action ongoing|Draft|Pending|Ongoing|Open|Due soon|Needs validation|Deferred|Hidden)/.test(v)?"progress":"review";
const chipH=t=>`<span class="status-chip ${dchip(t)}">${esc(t)}</span>`;
const dcell=(c,v)=>c[3]?chipH(String(v)):c[1]==="date"?esc(dDate(v)):c[1]==="number"?esc(dn(v).toLocaleString("en-US")):esc(v);

/* shared DepEd references (verify against the latest issuances; admins can edit) */
const RF={
 ai:["DepEd Order No. 3, s. 2026","Foundational Guidelines on Artificial Intelligence in Basic Education (issued February 20, 2026)","AI supports school officials and teachers and does not replace them. Human oversight is required and high-risk uses are prohibited, so everything generated here is advisory."],
 sbm:["DepEd Order No. 7, s. 2024","Policy Guidelines on the Implementation of the Revised School-Based Management (SBM) System","Evidence-based planning and monitoring. Indicators here feed the SBM assessment and the school's plans."],
 sip:["DepEd Order No. 44, s. 2015 (verify the current version)","Policy guidelines on the Enhanced School Improvement Plan (SIP) process and the School Report Card","Source of the indicators, targets, and the Annual Implementation Plan (AIP). Confirm the current SIP cycle with your SDO."],
 cal:["DepEd Order No. 9, s. 2026","Guidelines on the Implementation of the Three-Term School Calendar in Basic Education (April 16, 2026)","Analysis and review points are set per term (Term 1 to Term 3)."],
 asm:["DepEd Order No. 15, s. 2026","Revised Guidelines on Classroom Assessment, Grading System, and Awards and Recognition","Learning outcome indicators use results under the revised guidelines. Formative assessment is not used to compute grades."],
 priv:["RA 10173","Data Privacy Act of 2012","Only counts, rates, and learner codes are used. Never enter names, LRNs, or other personal data into analysis or AI tools."],
 lcf:["DepEd Order No. 14, s. 2026","Learning Continuity Framework in Emergencies","Concerns about suspensions and emergencies are planned and tracked against this framework."],
 cp:["DepEd Order No. 40, s. 2012","DepEd Child Protection Policy","Concerns involving learner safety follow the child protection procedures, not this register alone."],
 aral:["Republic Act No. 12028","ARAL Program Act (Academic Recovery and Accessible Learning Program)","Learner support recommendations point to ARAL when learning gaps persist."],
 ilaw:["DepEd Order No. 16, s. 2026","Guidelines on Lesson Planning and Learning Design (ILAW Framework)","Instructional recommendations follow the ILAW framework."],
 lr:["DepEd Memorandum No. 0522, s. 2026","Guidelines on learning resources utilization, management, and monitoring for SY 2026–2027 (verify the current memorandum)","Textbook and resource planning figures follow this memorandum."]
};
const SRC_MODS=["Smart Admin","Smart Learner","Smart Teacher","Smart Instruction","Smart Project","Smart Resource"];
const D_AREAS=["Learner welfare / attendance","Instruction / curriculum","Personnel","Facilities / maintenance","Finance / budget","Learning resources","Safety / DRRM / child protection","Governance / reporting"];
const D_AUD=["School Head","School Planning Team","School Governing Council","Division / district monitoring"];
const D_SRC=["Manual entry","Auto: High-risk learner flags","Auto: Budget utilization (%)","Auto: Open operational concerns","Auto: Recommendations pending","Auto: Indicators below target"];

/* computed values */
function aRes(r){const cur=dn(r[5]),tg=dn(r[6]),hi=r[8]!=="Lower",u=r[7]==="%"?" pts":" "+r[7];if(r[9]==="Incomplete"&&!cur)return["–","No data"];const gap=dfix(cur-tg);return[(gap>0?"+":"")+gap+u,(hi?cur>=tg:cur<=tg)?"Meets target":"Below target"]}
const dRule=(D,i,def)=>D.aux[i]&&isFinite(+D.aux[i][1])&&D.aux[i][1]!==""?+D.aux[i][1]:def;
function tCalc(r,D){
  const v=[r[3],r[4],r[5]].map(dn).filter(x=>x>0),tg=dn(r[6]),hi=r[7]!=="Lower",band=dRule(D,0,1),close=dRule(D,1,2);
  if(!v.length)return["–","–","No data","No data"];
  const last=v[v.length-1],ch=v.length>1?dfix(last-v[v.length-2]):null;
  const dir=ch===null?"–":Math.abs(ch)<=band?"Stable":((hi&&ch>0)||(!hi&&ch<0))?"Improving":"Declining";
  const gap=hi?tg-last:last-tg,vs=gap<=0?"Met":gap<=close?"Close":"Below";
  return[last,ch===null?"–":(ch>0?"+":"")+ch,dir,vs];
}
function spark(vals,tg){
  const p=vals.map((v,i)=>[i,v]).filter(x=>x[1]>0);if(!p.length)return"";
  const all=p.map(x=>x[1]).concat(tg>0?[tg]:[]),mn=Math.min(...all),mx=Math.max(...all),rg=(mx-mn)||1,X=i=>10+i*50,Y=v=>34-((v-mn)/rg)*26;
  return `<svg viewBox="0 0 120 42" width="120" height="42" role="img" aria-label="Trend across terms">${tg>0?`<line x1="4" x2="116" y1="${Y(tg)}" y2="${Y(tg)}" stroke="#f2b705" stroke-width="1.5" stroke-dasharray="4 3"/>`:""}<polyline fill="none" stroke="#0b3a6e" stroke-width="2" points="${p.map(x=>X(x[0])+","+Y(x[1])).join(" ")}"/>${p.map(x=>`<circle cx="${X(x[0])}" cy="${Y(x[1])}" r="3" fill="#0b3a6e"/>`).join("")}</svg>`;
}
function cCalc(r){
  if(r[8]==="Resolved")return["–",chipH("Closed")];
  const open=Math.max(0,Math.round((new Date(dToday())-new Date(r[1]))/864e5)),due=Math.round((new Date(r[7])-new Date(dToday()))/864e5);
  return[open+" d",chipH(due<0?"Overdue":due<=7?"Due soon":"On schedule")];
}
function pCalc(r){
  const b=dn(r[4]),g=dn(r[6]),y=dn(r[7]),p=Math.round(b*Math.pow(1+g/100,y)*10)/10,c=dfix(p-b),u=r[5]?" "+esc(r[5]):"";
  return[`<strong>${p.toLocaleString("en-US")}</strong>${u}`,(c>0?"▲ +":c<0?"▼ ":"► ")+c.toLocaleString("en-US")];
}
/* live data from other modules (all guarded) */
function dAuto(src){
  try{
    if(/High-risk/.test(src))return atRisk.filter(l=>!l.dismissed&&l.risk==="High").length;
    if(/Budget/.test(src)){const a=dsum(budget,1),u=dsum(budget,2);return a?Math.round(u/a*100)+"%":"–"}
    if(/concerns/.test(src))return decData.concerns.main.filter(r=>r[8]!=="Resolved").length;
    if(/Recommendations/.test(src))return decData.recommend.main.filter(r=>r[8]==="Pending decision").length;
    if(/below target/.test(src))return decData.analysis.main.filter(r=>aRes(r)[1]==="Below target").length;
  }catch(e){}
  return"–";
}
const dThr=(i,def)=>{const a=decData.concerns&&decData.concerns.aux[i];return a&&isFinite(+a[2])&&a[2]!==""?+a[2]:def};
function dSignals(){
  const s=[],lo=dThr(0,40),hi=dThr(1,85);
  try{const n=atRisk.filter(l=>!l.dismissed&&l.risk==="High"&&l.stage<=0).length;if(n)s.push({t:n+" high-risk learner flag"+(n>1?"s":"")+" awaiting adviser review",k:"Smart Learner",area:D_AREAS[0],trigger:"High-risk flag not yet reviewed",sev:"High"})}catch(e){}
  try{budget.forEach(b=>{if(!b[1])return;const p=Math.round(b[2]/b[1]*100);if(p<lo)s.push({t:b[0]+" is only "+p+"% utilized",k:"Smart Project",area:D_AREAS[4],trigger:"Utilization below "+lo+"%",sev:"Medium"});else if(p>=hi)s.push({t:b[0]+" is "+p+"% utilized and nearing its allocation",k:"Smart Project",area:D_AREAS[4],trigger:"Utilization at or above "+hi+"%",sev:"Medium"})})}catch(e){}
  try{const rs=insData.resources.main,nd=rs.filter(x=>x[6]==="Not yet delivered"),mc=rs.filter(x=>x[7]==="Missing");
    nd.forEach(x=>s.push({t:x[2]+" has not been delivered",k:"Smart Instruction",area:D_AREAS[5],trigger:"Resource not yet delivered",sev:"Medium"}));
    mc.filter(x=>x[6]!=="Not yet delivered").forEach(x=>s.push({t:"Certificate of acceptance missing: "+x[2],k:"Smart Instruction",area:D_AREAS[5],trigger:"Certificate of acceptance missing",sev:"Low"}))}catch(e){}
  return s;
}

function ddefaults(){return{
analysis:{main:[
 ["IND-01","Learner attendance rate",SRC_MODS[1],"November 2026",94.2,94.6,95,"%","Higher","Validated"],
 ["IND-02","Learners at or above the expected level (Term 1 examinations)",SRC_MODS[3],"Term 1, SY 2026–2027",71,74.8,75,"%","Higher","Validated"],
 ["IND-03","Learners flagged at risk",SRC_MODS[1],"November 2026",14,18,12,"learners","Lower","Needs validation"],
 ["IND-04","Learners per textbook copy",SRC_MODS[3],"Term 2, SY 2026–2027",1.4,1.3,1,"learners per copy","Lower","Validated"],
 ["IND-05","Budget utilization against the work and financial plan",SRC_MODS[4],"As of November 2026",48,58,65,"%","Higher","Needs validation"],
 ["IND-06","Open repair requests",SRC_MODS[5],"November 2026",5,7,3,"requests","Lower","Validated"],
 ["IND-07","Teachers with a completed classroom observation",SRC_MODS[2],"Term 2 to date",40,62,70,"%","Higher","Validated"]],
 aux:[["Source records are current","All indicators","Flags an indicator when its source module has not been updated within the school's set period (default: 30 days)."],["No personal learner data","Learner indicators","Only counts, rates, and learner codes are analyzed. No names or LRNs (RA 10173)."],["Human validation first","All automated findings","An authorized official validates a finding before it enters a report (DO 3, s. 2026)."],["Complete data","All indicators","Indicators marked Incomplete show No data instead of a result."]],
 check:[["Source modules updated before each analysis run","Weekly for attendance; monthly for the others","Ongoing",""],["Each indicator validated by its module owner before it is reported","Each reporting period","Ongoing","2 need validation"],["Targets match the SIP, AIP, and SBM indicators","Start of each term","Done",""],["Findings reviewed by the School Head or designee before they are shared","Every run","Ongoing",""],["No personal learner data entered into analysis or AI tools","Always","Done",""],["Analysis summarized for the term review","Each term","Pending",""]],
 refs:[RF.ai,RF.sbm,RF.sip,RF.cal,RF.asm,RF.priv]},
trend:{main:[
 ["Mean score, Mathematics","Grade 10","%",69.5,71.2,0,75,"Higher"],
 ["Mean score, English","Grade 8","%",78.4,79,0,80,"Higher"],
 ["Mean score, Science","Grade 9","%",74.2,73.1,0,75,"Higher"],
 ["Learner attendance rate","School-wide","%",95.1,92.8,0,95,"Higher"],
 ["Learners at or above the expected level","School-wide","%",70,74.8,0,75,"Higher"],
 ["Learners who stopped attending","School-wide","%",0.8,1.1,0,0.5,"Lower"],
 ["Lesson plans submitted on time","All teachers","%",88,94,0,100,"Higher"]],
 aux:[["Stable band (± points)",1,"A change within this band between the last two terms is reported as Stable."],["Close to target (points)",2,"A value within this many points of the target is reported as Close."]],
 check:[["Term results entered after each term examination and summative test","Each term","Ongoing",""],["Targets taken from the SIP and AIP","Start of the school year","Done",""],["Declining indicators discussed with the teachers concerned","Each term","Pending",""],["Trends read with context: suspensions, absences, resource delivery","Each term","Ongoing",""],["Formative results used for teaching only, not to compute grades","Always","Done",""]],
 refs:[RF.asm,RF.cal,RF.sbm,RF.sip,RF.priv]},
concerns:{main:[
 ["OC-2026-01",dIn(-9),D_AREAS[0],"Grade 8 attendance fell 4 points in 3 weeks","Weekly attendance by section below the set threshold","High","Grade 8 advisers",dIn(4),"Action ongoing"],
 ["OC-2026-02",dIn(-7),D_AREAS[5],"Grade 9 Science textbooks not yet delivered","Delivery not received after the term started","Medium","Property custodian",dIn(-1),"Open"],
 ["OC-2026-03",dIn(-3),D_AREAS[6],"Roof leak above a Grade 9 classroom during typhoon season","Facility hazard reported by a teacher","High","School Head",dIn(5),"Under review"],
 ["OC-2026-04",dIn(-6),D_AREAS[4],"Repair requests may exceed the MOOE repairs line by Q4","Open requests compared with the remaining allocation","Medium","School Head",dIn(12),"Under review"],
 ["OC-2026-05",dIn(-5),D_AREAS[1],"Araling Panlipunan pacing is behind the term plan","Competencies covered below the term plan","Medium","Master Teacher I",dIn(8),"Action ongoing"],
 ["OC-2026-06",dIn(-2),D_AREAS[6],"Learning continuity plan for suspensions is not finalized","No plan on file during typhoon season","Medium","School DRRM coordinator",dIn(14),"Open"],
 ["OC-2026-07",dIn(-14),D_AREAS[5],"Certificate of acceptance missing for English 8 textbooks","Certificate not on file after delivery","Low","Property custodian",dIn(-6),"Resolved"]],
 aux:[["Budget line utilization is LOW",D_AREAS[4],40,"%","Auto-checked. Review whether the activity is delayed or can be realigned."],["Budget line utilization is HIGH",D_AREAS[4],85,"%","Auto-checked. Review remaining needs before the year ends."],["Monthly attendance rate below",D_AREAS[0],85,"%","Reference. Adviser follow-up and parent contact."],["Consecutive absences",D_AREAS[0],3,"days","Reference. Adviser contact; consider ARAL or support referral."],["Failing grades in learning areas",D_AREAS[1],2,"areas","Reference. Remediation planning."],["High-risk flag without an intervention",D_AREAS[0],7,"days","Reference. Assign a support slot."]],
 check:[["New concerns logged with an owner and a due date","As they arise","Ongoing",""],["High-severity concerns reviewed by the School Head within the week","Weekly","Ongoing",""],["Learner safety concerns handled under the Child Protection Policy","Immediately","Done",""],["Overdue actions escalated or rescheduled","Weekly","Pending","1 overdue"],["Resolved concerns documented with the action taken","On closure","Ongoing",""],["Learning continuity plan ready for suspensions","Before typhoon season","Pending",""]],
 refs:[RF.sbm,RF.cp,RF.lcf,RF.ai,RF.priv,RF.lr]},
recommend:{main:[
 ["REC-2026-01",dIn(-8),"Learners","Grade 8 attendance fell 4 points over 3 weeks (weekly attendance by section)","Adviser follow-up and parent contact. Refer to ARAL if absences continue.","AI-assisted analysis","RA 12028 (ARAL); DO 7, s. 2024 (SBM)","High","Pending decision",""],
 ["REC-2026-02",dIn(-6),"Finance and projects","Repair requests may exceed the MOOE repairs line by Q4","Review budget realignment within the allowed rules. Prioritize safety repairs.","AI-assisted analysis","Current MOOE and COA rules (verify)","High","Pending decision",""],
 ["REC-2026-03",dIn(-5),"Learners","One high-risk learner has had no intervention for 7 or more days","Assign an ARAL or remediation slot and record it in the workflow.","School monitoring","RA 12028; DO 7, s. 2024","High","Accepted","School Head"],
 ["REC-2026-04",dIn(-12),"Instruction","Mathematics 10 is behind schedule and textbook copies are insufficient","Request more copies through the SDO. Use peer tutoring in the meantime.","Instructional supervision","DM 0522, s. 2026; DO 15, s. 2026","Medium","Implemented","School Head"],
 ["REC-2026-05",dIn(-2),"Facilities and resources","Learning continuity plan for suspensions is not finalized","Finalize the plan with the DRRM coordinator and brief teachers.","School monitoring","DO 14, s. 2026","Medium","Pending decision",""]],
 aux:[["Learner intervention assignment","Class adviser or guidance designate","School Head","Record the decision and the support given."],["Budget realignment within school funds","Designated finance officer","School Head, after consulting the School Planning Team","Follow current MOOE and COA rules (verify)."],["Changes to pacing or lesson planning","Head Teacher or Master Teacher","School Head","Align with the ILAW framework (DO 16, s. 2026)."],["Use of AI-assisted analysis in a report","ICT coordinator","School Head","Human review and disclosure are required (DO 3, s. 2026)."]],
 check:[["Each recommendation states its evidence and DepEd basis","Every item","Ongoing",""],["AI-assisted recommendations reviewed and decided by an authorized official","Every item","Ongoing","2 pending"],["Decision, decider, and date recorded","Every item","Ongoing",""],["Accepted items assigned to the SIP, the AIP, or a named action","After the decision","Pending",""],["Returned or deferred items explained to the proponent","After the decision","Pending",""],["Implemented items checked against the expected result","Each term","Pending",""]],
 refs:[RF.ai,RF.sbm,RF.sip,RF.aral,RF.ilaw,RF.lr,["DepEd Order No. 10, s. 2026","Guidelines for the Implementation of 2026 Summer Remediation Programs (April 28, 2026)","Reference for remediation recommendations. Check whether a new issuance applies to the next break."]]},
predictive:{main:[
 ["Grade 7 enrolment next school year","Enrolment","Cohort survival","SY 2026–2027",310,"learners",2.5,1,"Medium","Classroom and teacher assignment","Draft"],
 ["Total school enrolment in two years","Enrolment","Average growth rate","SY 2026–2027",1248,"learners",1.8,2,"Medium","SIP targets and resource planning","Validated"],
 ["Mathematics 10 textbooks to request for next year","Textbooks and learning resources","Ratio / standard-based","SY 2026–2027",120,"copies",56.7,1,"Low","Request to the SDO","Draft"],
 ["Repairs spending by year end","MOOE / budget","Linear trend","As of November 2026",84000,"pesos",45,1,"Medium","Budget realignment review","Draft"],
 ["Learners needing ARAL support next term","Learner support (ARAL)","Linear trend","Term 2, SY 2026–2027",18,"learners",15,1,"Low","ARAL schedule and materials","Draft"]],
 aux:[["Learner transition rate, Grade 9 to Grade 10","98%","Last three years of school records (sample)",dIn(-10)],["Textbook target ratio","1 copy per learner","DepEd target; confirm in the current learning resources memorandum",dIn(-10)],["Learners per classroom (planning figure)","40","School-set. Confirm the current standard with your SDO.",dIn(-10)],["Enrolment source","Official school data systems (LIS, EBEIS)","Use official figures when preparing the AIP",dIn(-10)]],
 check:[["Projections use official enrolment and school records","Each planning cycle","Ongoing",""],["Assumptions written down and reviewed each year","Annually","Pending",""],["Projections validated by the School Planning Team before use in the AIP","Before AIP submission","Pending",""],["Aggregate figures only: no predictions about individual learners","Always","Done",""],["Projections compared with actual results and adjusted","Each term","Pending",""]],
 refs:[RF.sip,RF.sbm,RF.ai,RF.cal,RF.lr,RF.priv]},
dashboard:{main:[
 ["Learner attendance rate",D_AUD[0],D_SRC[0],"94.6%","95%","Progress bar","Shown"],
 ["Learners at or above the expected level",D_AUD[0],D_SRC[0],"74.8%","75%","Progress bar","Shown"],
 ["High-risk learner flags",D_AUD[0],D_SRC[1],"","","Number","Shown"],
 ["Open operational concerns",D_AUD[0],D_SRC[3],"","","Number","Shown"],
 ["Recommendations awaiting a decision",D_AUD[0],D_SRC[4],"","","Number","Shown"],
 ["Budget utilization",D_AUD[1],D_SRC[2],"","65%","Progress bar","Shown"],
 ["Indicators below target",D_AUD[1],D_SRC[5],"","","Number","Shown"],
 ["Learners per textbook copy",D_AUD[1],D_SRC[0],"1.3","1.0","Number","Shown"],
 ["Feeding program beneficiaries",D_AUD[2],D_SRC[0],"86 learners","","Number","Shown"],
 ["SIP/AIP activities accomplished",D_AUD[2],D_SRC[0],"58%","65%","Progress bar","Shown"],
 ["Monitoring reports submitted to the SDO",D_AUD[3],D_SRC[0],"3 of 4","","Number","Shown"]],
 aux:[["School Head overview",D_AUD[0],"Daily and weekly decisions","Weekly"],["Planning team view",D_AUD[1],"Term review and AIP adjustments","Each term"],["School Governing Council view",D_AUD[2],"Report to partners and stakeholders","Each quarter"],["Division / district monitoring view",D_AUD[3],"Accomplishment and compliance reporting","Per SDO schedule (verify)"]],
 check:[["Each audience sees only the widgets meant for it","When widgets change","Ongoing",""],["Manual values updated before each review meeting","Per review frequency","Ongoing",""],["Auto-linked widgets checked against their source module","Monthly","Pending",""],["Targets match the SIP and AIP","Start of each term","Done",""],["Printed or shared views contain no personal learner data","Always","Done",""]],
 refs:[RF.sbm,RF.sip,RF.ai,RF.priv,RF.cal]}
};}
var decData=ddefaults();
try{const s=JSON.parse(localStorage.getItem("smartanhs.v1")||"null");if(s&&s.decData)Object.keys(decData).forEach(k=>{if(s.decData[k])decData[k]=Object.assign(decData[k],s.decData[k])})}catch(e){}

const DREV="2026-11-21";
const DDEF={
 analysis:{title:"Automated data analysis",icon:"✧",chip:9,
  desc:"Indicators from the SMART modules are compared with their targets and summarized automatically. Admins manage the indicators, rules, and references.",
  notice:"Sample data only. Findings are advisory and need review by an authorized official before use (DO 3, s. 2026). Do not enter personal learner data (RA 10173).",
  cols:[["Code"],["Indicator"],S("Source module",SRC_MODS),["Period"],["Previous","number"],["Current","number"],["Target","number"],["Unit"],S("Better when",["Higher","Lower"]),S("Data check",["Validated","Needs validation","Incomplete"],1)],
  calc:{head:["Gap to target","Result"],fn:r=>{const x=aRes(r);return[esc(x[0]),chipH(x[1])]}},
  auxTitle:"Data validation rules",auxCols:[["Rule"],["Applies to"],["What is checked"]],
  tiles:r=>{const x=r.map(aRes);return[["Indicators analyzed",r.length],["Meet target",x.filter(y=>y[1]==="Meets target").length+" of "+r.length],["Below target",x.filter(y=>y[1]==="Below target").length],["Need validation",r.filter(y=>y[9]!=="Validated").length]]}},
 trend:{title:"Trend and performance analysis",icon:"▤",chip:-1,
  desc:"Term-by-term results compared with targets, with the direction of change worked out from the values entered. Enter 0 for a term with no data yet.",
  notice:"Sample data only. Read trends with context such as suspensions, absences, and resource delivery. Use results under DO 15, s. 2026; formative results are not used to compute grades.",
  cols:[["Indicator"],["Group"],["Unit"],["Term 1","number"],["Term 2","number"],["Term 3","number"],["Target","number"],S("Better when",["Higher","Lower"])],
  calc:{head:["Latest","Change","Direction","Against target"],fn:(r,D)=>{const x=tCalc(r,D);return[esc(x[0]),esc(x[1]),chipH(x[2]),chipH(x[3])]}},
  auxTitle:"Trend rules",auxCols:[["Rule"],["Value","number"],["Meaning"]],
  tiles:(r,D)=>{const x=r.map(y=>tCalc(y,D));return[["Indicators tracked",r.length],["Improving",x.filter(y=>y[2]==="Improving").length],["Declining",x.filter(y=>y[2]==="Declining").length],["Meeting target",x.filter(y=>y[3]==="Met").length]]}},
 concerns:{title:"Early identification of operational concerns",icon:"◈",chip:8,
  desc:"A register of early-warning signals across learners, instruction, resources, facilities, and funds, each with an owner, a due date, and a status.",
  notice:"Sample data only. Signals are prompts for a person to check, not conclusions. Learner safety concerns follow the Child Protection Policy. Use learner codes, never names.",
  cols:[["Ref no."],["Date flagged","date"],S("Area",D_AREAS),["Concern"],["Trigger / indicator"],S("Severity",["High","Medium","Low"],1),["Responsible (role)"],["Action due","date"],S("Status",["Open","Under review","Action ongoing","Resolved"],1)],
  calc:{head:["Open for","Timing"],fn:r=>cCalc(r)},
  auxTitle:"Early-warning triggers (school-set thresholds)",auxCols:[["Trigger"],["Area"],["Threshold","number"],["Unit"],["Basis / action when triggered"]],
  tiles:r=>{const o=r.filter(x=>x[8]!=="Resolved");return[["Open concerns",o.length],["High severity, open",o.filter(x=>x[5]==="High").length],["Overdue actions",o.filter(x=>new Date(x[7])<new Date(dToday())).length],["Resolved",r.length-o.length]]}},
 recommend:{title:"Management recommendations",icon:"✦",chip:8,
  desc:"Recommendations from analysis, supervision, and monitoring, each with its evidence, DepEd basis, and the decision of an authorized official.",
  notice:"Sample data only. AI-assisted recommendations are advisory. Final decisions remain with authorized school officials, and the decision is recorded here.",
  cols:[["Ref no."],["Date","date"],S("Area",["Learners","Instruction","Personnel","Facilities and resources","Finance and projects","Governance and planning"]),["Finding / evidence"],["Recommendation"],S("Source",["AI-assisted analysis","Instructional supervision","School monitoring","Stakeholder feedback","SDO / district feedback"]),["DepEd basis"],S("Priority",["High","Medium","Low"],1),S("Decision",["Pending decision","Accepted","Returned for review","Deferred","Implemented"],1),["Decided by (role)"]],
  auxTitle:"Decision authority guide (edit to match your school's rules)",auxCols:[["Type of decision"],["Recommended by"],["Decided by"],["Basis / remarks"]],
  tiles:r=>[["Recommendations",r.length],["Pending decision",r.filter(x=>x[8]==="Pending decision").length],["Accepted or implemented",r.filter(x=>x[8]==="Accepted"||x[8]==="Implemented").length],["AI-assisted",Math.round(r.filter(x=>x[5]==="AI-assisted analysis").length/(r.length||1)*100)+"%"]]},
 predictive:{title:"Predictive analytics for planning",icon:"◧",chip:10,
  desc:"Simple, transparent projections for planning. Each figure shows its method, base value, and rate, so anyone can see how it was worked out.",
  notice:"Sample data only. Projections are aggregate planning estimates and do not predict or label individual learners. Use official enrolment data for the AIP.",
  cols:[["Planning item"],S("Category",["Enrolment","Classroom and facilities","Textbooks and learning resources","Teacher workload","MOOE / budget","Learner support (ARAL)"]),S("Method",["Cohort survival","Linear trend","Average growth rate","Ratio / standard-based","Manual estimate"]),["Base year / period"],["Base value","number"],["Unit"],["Change per period (%)","number"],["Periods ahead","number"],S("Reliability",["Low","Medium","High"]),["Planning use"],S("Status",["Draft","Validated","Used in AIP"],1)],
  calc:{head:["Projected","Change"],fn:r=>pCalc(r)},
  auxTitle:"Planning assumptions",auxCols:[["Assumption"],["Value"],["Source / basis"],["Reviewed on","date"]],
  tiles:r=>[["Projections",r.length],["Validated or used in AIP",r.filter(x=>x[10]!=="Draft").length],["Still in draft",r.filter(x=>x[10]==="Draft").length],["Low reliability",r.filter(x=>x[8]==="Low").length]]},
 dashboard:{title:"Customized executive dashboards",icon:"▣",chip:6,
  desc:"Choose which widgets each audience sees. Widgets can be typed in or linked to live figures from the other SMART modules.",
  notice:"Sample data only. Dashboards support decisions and do not replace official reports. Keep personal learner data off any shared or printed view.",
  cols:[["Widget title"],S("Audience",D_AUD),S("Data source",D_SRC),["Value (for manual entry)"],["Target"],S("Display",["Number","Progress bar"]),S("Show",["Shown","Hidden"],1)],
  auxTitle:"Dashboard views",auxCols:[["View"],["Audience"],["Purpose"],["Review frequency"]],
  tiles:r=>[["Widgets configured",r.length],["Shown",r.filter(x=>x[6]==="Shown").length],["Linked to live data",r.filter(x=>x[2]!=="Manual entry").length],["Audiences",new Set(r.map(x=>x[1])).size]]}
};
const DKEYS=Object.keys(DDEF);
const decisionKey=t=>/automated data/i.test(t)?"analysis":/trend/i.test(t)?"trend":/early identification|operational/i.test(t)?"concerns":/recommendation/i.test(t)?"recommend":/predictive/i.test(t)?"predictive":/dashboard/i.test(t)?"dashboard":null;
let dcur="analysis";const dst={q:"",f:"",aud:""};
const dmeta=k=>{const m=decData[k].meta;return m&&m.length>=4?m:[DDEF[k].title,DDEF[k].desc,DDEF[k].notice,DREV]};
const dcols=(k,tb)=>tb==="main"?DDEF[k].cols:tb==="refs"?REFC:tb==="check"?CHKC:DDEF[k].auxCols;
const dEB=(k,tb,i)=>`<button class="adm" data-dch="edit" data-k="${k}" data-tb="${tb}" data-i="${i}">✎</button><button class="adm danger" data-dch="del" data-k="${k}" data-tb="${tb}" data-i="${i}">✕</button>`;
const dAdd=(k,tb,l)=>`<button class="adm add" data-dch="add" data-k="${k}" data-tb="${tb}">＋ ${l}</button>`;
function dtable(k,tb,rows,idx){
  const d=DDEF[k],cols=dcols(k,tb),D=decData[k],calc=tb==="main"&&d.calc;
  const head=cols.map(c=>`<th>${esc(c[0].toUpperCase())}</th>`).concat(calc?d.calc.head.map(h=>`<th>${esc(h.toUpperCase())}</th>`):[]).join("");
  const body=rows.map((r,n)=>`<tr>${r.map((v,j)=>`<td>${dcell(cols[j],v)}</td>`).join("")}${calc?d.calc.fn(r,D).map(x=>`<td>${x}</td>`).join(""):""}<td class="cal-act">${dEB(k,tb,idx?idx[n]:n)}</td></tr>`).join("")||`<tr><td colspan="${cols.length+(calc?d.calc.head.length:0)+1}" style="text-align:center;padding:20px;color:#98a4b1">No records match.</td></tr>`;
  return `<div class="table-wrap"><table><thead><tr>${head}<th></th></tr></thead><tbody>${body}</tbody></table></div>`;
}
function dmain(k){
  const d=DDEF[k],q=dst.q.toLowerCase(),idx=[],rows=[];
  decData[k].main.forEach((r,i)=>{if((!q||r.join(" ").toLowerCase().includes(q))&&(!dst.f||r[d.chip]===dst.f)){idx.push(i);rows.push(r)}});
  return dtable(k,"main",rows,idx);
}
/* page-specific panels */
const dpanel=(t,sub,add,body,cls="")=>`<div class="panel tui-panel ${cls}"><div class="panel-heading"><div><h3>${t}</h3><p class="muted">${sub}</p></div>${add}</div>${body}</div>`;
function findingsPanel(){
  const f=[];
  decData.analysis.main.forEach(r=>{const x=aRes(r);if(x[1]!=="Below target")return;const cur=dn(r[5]),tg=dn(r[6]),prev=dn(r[4]),u=r[7]==="%"?"points":r[7],hi=r[8]!=="Lower";
    f.push({rel:Math.abs(cur-tg)/(Math.abs(tg)||1),t:`${r[1]} is ${Math.abs(dfix(cur-tg))} ${u} ${hi?"below":"above"} the target (${cur} against ${tg}).`,n:prev?` Previous period: ${prev}.`:"",k:r[2]+" · "+r[3]})});
  f.sort((a,b)=>b.rel-a.rel);
  const cross=dSignals();
  return dpanel("Automated findings","Worked out from the indicators below and from live data in the other modules. Advisory only.",`<button class="outline-btn mini" data-dui="rerun">↻ Re-run analysis</button>`,
   `<p class="muted" style="margin:0 0 6px;font-size:11px">Last run ${new Date().toLocaleString("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"})}</p>`+
   (f.length?f.slice(0,5).map(x=>`<div class="insight"><div><strong>${esc(x.t)}</strong><p>${esc(x.k)}${esc(x.n)}</p></div></div>`).join(""):`<p class="muted">All validated indicators meet their targets.</p>`)+
   (cross.length?`<h4 style="margin:16px 0 4px;font-size:12px;color:#082a52">Cross-module checks</h4>`+cross.map(x=>`<div class="insight"><div><strong>${esc(x.t)}</strong><p>${esc(x.k)}</p></div></div>`).join(""):""));
}
function trendPanel(){
  const D=decData.trend;
  return dpanel("Trend view","One small chart per indicator across Terms 1 to 3. The dashed gold line is the target.","",
   `<div class="dui-cards">${D.main.map(r=>{const x=tCalc(r,D);return `<div class="dui-card"><strong>${esc(r[0])}</strong><small>${esc(r[1])}</small>${spark([r[3],r[4],r[5]].map(dn),dn(r[6]))}<div class="dui-card-foot"><span>Latest <b>${esc(x[0])}</b>${r[2]==="%"?"%":""}</span>${chipH(x[2])}</div></div>`}).join("")||'<p class="muted">No indicators yet.</p>'}</div>`);
}
function signalsPanel(){
  const s=dSignals();
  return dpanel("Auto-detected signals","Found in the data of other modules, using the thresholds in the triggers table. A person decides whether each one becomes a concern.","",
   s.length?s.map((x,i)=>`<div class="insight"><div><strong>${esc(x.t)}</strong><p>${esc(x.k)} · ${esc(x.area)} · ${chipH(x.sev)}</p></div><div class="insight-act"><button class="adm add" data-dui="log" data-i="${i}">＋ Log as concern</button></div></div>`).join(""):`<p class="muted">No signals found right now.</p>`);
}
function predPanel(){
  const rows=decData.predictive.main;
  return dpanel("Base value against projection","Each pair of bars is scaled within its own row.","",
   `<div class="dui-pairs">${rows.map(r=>{const b=dn(r[4]),p=Math.round(b*Math.pow(1+dn(r[6])/100,dn(r[7]))*10)/10,m=Math.max(b,p)||1;return `<div class="dui-pair"><span>${esc(r[0])}</span><div><div class="bar"><span style="width:${b/m*100}%;background:#9fb4cc"></span></div><small>Base ${b.toLocaleString("en-US")} ${esc(r[5])}</small></div><div><div class="bar"><span style="width:${p/m*100}%"></span></div><small>Projected ${p.toLocaleString("en-US")} ${esc(r[5])}</small></div></div>`}).join("")}</div>`);
}
function dWidget(r){
  const auto=r[2]!=="Manual entry",val=auto?dAuto(r[2]):r[3],nv=parseFloat(String(val).replace(/,/g,"")),nt=parseFloat(String(r[4]).replace(/,/g,""));
  let bar="";if(r[5]==="Progress bar"&&isFinite(nv)&&isFinite(nt)&&nt>0)bar=`<div class="bar"><span style="width:${Math.max(0,Math.min(100,nv/nt*100))}%"></span></div>`;
  return `<div class="dui-widget"><span>${esc(r[0])}</span><strong>${esc(val===""?"–":val)}</strong>${bar}<small>${r[4]?"Target: "+esc(r[4]):""}${auto?(r[4]?" · ":"")+"live":""}</small></div>`;
}
function dashHTML(){
  const rows=decData.dashboard.main.filter(r=>r[6]==="Shown"&&(!dst.aud||r[1]===dst.aud));
  return rows.length?`<div class="dui-widgets">${rows.map(dWidget).join("")}</div>`:`<p class="muted">No widgets are shown for this audience.</p>`;
}
function dashPanel(){
  return dpanel("Dashboard preview","Pick an audience to see its dashboard.",`<button class="outline-btn mini" data-dui="print">Print / Save as PDF</button>`,
   `<div class="tui-tools"><select id="duiAud"><option value="">All audiences</option>${D_AUD.map(a=>`<option${a===dst.aud?" selected":""}>${esc(a)}</option>`).join("")}</select></div><div id="duiDash">${dashHTML()}</div>`);
}
function renderDUI(){
  const k=dcur,d=DDEF[k],D=decData[k],m=dmeta(k);
  const extra={analysis:findingsPanel,trend:trendPanel,concerns:signalsPanel,predictive:predPanel,dashboard:dashPanel}[k];
  const aux=k==="recommend"||k==="analysis"||k==="trend"||k==="concerns"||k==="predictive"||k==="dashboard";
  const auxSub={concerns:"The first two rows (budget utilization) set the auto-detected signals above. The other rows are reference thresholds for staff.",trend:"These two values set how Direction and Against target are worked out.",dashboard:"Defines each audience view and how often it is reviewed.",predictive:"Write down the assumptions behind each projection so they can be reviewed.",recommend:"Who recommends and who decides. Adjust to your school's rules.",analysis:"Checks the system applies to every automated finding."}[k];
  $("#page-dui").innerHTML=`<div class="tui-top"><button class="outline-btn mini" data-dui="back">← Smart Decision</button><div class="tui-tabs">${DKEYS.map(x=>`<button class="${x===k?"on":""}" data-dui="${x}">${esc(dmeta(x)[0])}</button>`).join("")}</div></div>
  <div class="tui-head"><div class="tui-icon">${d.icon}</div><div><p class="eyebrow">SMART DECISION</p><h1>${esc(m[0])}</h1><p class="muted">${esc(m[1])}</p><p class="dui-rev">Content last reviewed against DepEd issuances: <b>${esc(dDate(m[3])||"not recorded")}</b></p><div class="dui-adm"><button class="adm add" data-dch="meta" data-k="${k}">✎ Edit page details</button><button class="adm danger" data-dch="reset" data-k="${k}">Restore default content</button></div></div></div>
  <div class="advisory-note">${esc(m[2])}</div>
  <div class="module-summary-grid">${d.tiles(D.main,D).map(t=>`<div class="summary-tile"><span>${esc(t[0])}</span><strong>${esc(t[1])}</strong></div>`).join("")}</div>
  ${extra?extra():""}
  ${dpanel("Records","Search, filter, and review. Admins can add, edit, and delete rows.",dAdd(k,"main","Add record"),`<div class="tui-tools"><input id="duiQ" placeholder="Search records…" value="${esc(dst.q)}" />${d.chip>=0?`<select id="duiF"><option value="">All ${esc(d.cols[d.chip][0].toLowerCase())}</option>${d.cols[d.chip][2].map(o=>`<option${o===dst.f?" selected":""}>${esc(o)}</option>`).join("")}</select>`:""}</div><div id="duiMain">${dmain(k)}</div>`)}
  ${aux?dpanel(d.auxTitle,auxSub,dAdd(k,"aux","Add row"),dtable(k,"aux",D.aux)):""}
  ${dpanel("Monitoring checklist","Requirements to track for this area.",dAdd(k,"check","Add item"),dtable(k,"check",D.check))}
  ${dpanel("DepEd basis and references","The orders, memorandums, and laws this interface follows. Verify and update as new issuances are released.",dAdd(k,"refs","Add reference"),dtable(k,"refs",D.refs))}`;
}
function showDUI(k){
  dcur=k;dst.q="";dst.f="";dst.aud="";currentModule="decision";
  $$(".page-section").forEach(s=>s.classList.remove("active"));$("#page-dui").classList.add("active");
  $$(".nav-item").forEach(li=>li.classList.toggle("active",li.dataset.pages.split(" ").includes("decision")));
  $("#breadcrumbPage").textContent="Smart Decision · "+dmeta(k)[0];
  renderDUI();closeDD();$("#topNav").classList.remove("open");window.scrollTo({top:0,behavior:"smooth"});
}
const _goTo5=goTo;goTo=function(p){if(typeof p==="string"&&p.startsWith("decision:"))return showDUI(p.slice(9));_goTo5(p)};
function dsave(msg){persist();renderDUI();$("#breadcrumbPage").textContent="Smart Decision · "+dmeta(dcur)[0];showToast(msg||"Saved.")}
function dact(a,k,tb,i){
  const D=decData[k];
  if(a==="meta"){const m=dmeta(k);return admForm("Edit page details",[["Page title"],["Description"],["Notice shown to users"],["Content last reviewed against DepEd issuances","date"]],m,v=>{D.meta=[v[0]||DDEF[k].title,v[1],v[2],v[3]];dsave()})}
  if(a==="reset"){if(confirm("Restore the default content for this page? Your edits to it will be removed.")){decData[k]=ddefaults()[k];dsave("Default content restored.")}return}
  const arr=D[tb],cols=dcols(k,tb);
  if(a==="del"){if(confirm("Delete this row?")){arr.splice(i,1);dsave()}return}
  const row=a==="add"?cols.map(c=>c[1]==="number"?0:c[1]==="select"?c[2][0]:c[1]==="date"?dToday():""):arr[i];
  admForm((a==="add"?"Add":"Edit")+" row",cols.map(c=>[c[0],c[1]||"text",c[2]]),row,v=>{
    const n=v.map((x,j)=>cols[j][1]==="number"?(+x||0):x);
    if(a==="add")arr.push(n);else arr[i]=n;dsave();
  });
}
$("#page-dui").addEventListener("click",e=>{
  const t=e.target.closest("[data-dui]");
  if(t){
    const v=t.dataset.dui;
    if(v==="back")return goTo("decision");
    if(v==="rerun"){renderDUI();return showToast("Analysis re-run with the current data.")}
    if(v==="print")return openInfo("Executive dashboard"+(dst.aud?" · "+dst.aud:""),`<div class="rep-head"><img src="logo.png" width="48" height="48" alt=""><div><small>DIVISION OF ROMBLON</small><strong>Alcantara National High School</strong><span>Sample dashboard · ${new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</span></div></div>${dashHTML()}<p class="rep-note">Sample data only. ${ADVISORY}</p>`,[["Print / Save as PDF",()=>window.print(),"primary-btn"]]);
    if(v==="log"){if(!isAdmin)return;const s=dSignals()[+t.dataset.i];if(!s)return;const n=decData.concerns.main.length+1;decData.concerns.main.push(["OC-"+new Date().getFullYear()+"-"+String(n).padStart(2,"0"),dToday(),s.area,s.t,s.trigger,s.sev,"School Head",dIn(7),"Open"]);return dsave("Logged as a concern.")}
    return showDUI(v);
  }
  const b=e.target.closest("[data-dch]");if(b&&isAdmin)dact(b.dataset.dch,b.dataset.k,b.dataset.tb,+b.dataset.i);
});
$("#page-dui").addEventListener("input",e=>{if(e.target.id==="duiQ"){dst.q=e.target.value;$("#duiMain").innerHTML=dmain(dcur)}});
$("#page-dui").addEventListener("change",e=>{
  if(e.target.id==="duiF"){dst.f=e.target.value;$("#duiMain").innerHTML=dmain(dcur)}
  if(e.target.id==="duiAud"){dst.aud=e.target.value;$("#duiDash").innerHTML=dashHTML()}
});
document.addEventListener("click",e=>{
  const b=e.target.closest('.dropdown .dd-item[data-page="decision"]');if(!b)return;
  const k=decisionKey(b.textContent);if(k){e.stopPropagation();$("#topNav").classList.add("lock");showDUI(k)}
},true);
