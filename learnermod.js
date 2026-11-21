/* Smart Learner: six DepEd-aligned interfaces (editable by admin). Uses learner codes only, never names. */
const lmchip=v=>/^(Improved|Completed|Released|Yes|Held|At target|Achieved|On schedule|Closed|Done|Low|On track|Met|Improving|None needed)/.test(v)?"completed":/^(Ongoing|Watch|Not started|Scheduled|In preparation|Ready|Due soon|Pending|Medium|Paused|Not yet|Stable|Close|Monitor)/.test(v)?"progress":"review";
const lmChip=t=>`<span class="status-chip ${lmchip(t)}">${esc(t)}</span>`;
const lmcell=(c,v)=>c[3]?lmChip(String(v)):c[1]==="date"?esc(amDate(v)):c[1]==="number"?esc(amn(v).toLocaleString("en-US")):esc(v);
const lmsum=(a,i)=>a.reduce((s,x)=>s+(+x[i]||0),0);
const LR={
 d15:["DepEd Order No. 15, s. 2026","Revised Guidelines on Classroom Assessment, Grading System, and Awards and Recognition (issued June 4, 2026). Standards-based grading for SY 2026–2027. The final grade is the average of the term grades. Transmutation stays this year with an adjusted table and is phased out in stages. Formative assessment is not used to compute grades.","Grades, passing marks, and report cards follow this Order. Assessment results guide remediation, enrichment, and learner support."],
 d9:["DepEd Order No. 9, s. 2026","Guidelines on the Implementation of the Three-Term School Calendar in Basic Education (April 16, 2026). 201 class days from June 8, 2026 to April 8, 2027.","Attendance, grades, and report cards are read per term (Term 1 to Term 3)."],
 ra12028:["RA 12028","ARAL Program Act (signed October 16, 2024) and its Implementing Rules and Regulations","Legal basis of the ARAL Program, the umbrella program for learning recovery."],
 d18:["DepEd Order No. 18, s. 2025","Implementing Guidelines of the Academic Recovery and Accessible Learning (ARAL) Program (June 13, 2025). Covers public schools from Kindergarten to Grade 10.","Rules for identifying ARAL learners, tutors, tutoring, and monitoring. Senior High School learners are not covered."],
 dm56:["DepEd Memorandum No. 56, s. 2025","Supplemental Guidelines on the ARAL School Readiness and Responsiveness Audit (ASRRA)","Readiness audit of the school's ARAL delivery."],
 dm64:["DepEd Memorandum No. 64, s. 2025","Implementing Guidelines for ARAL-Reading for Key Stages 1 to 3 (effective August 1, 2025)","Reading tutoring. Frustration-level learners in Grades 4 to 10 are a priority group."],
 dm60:["DepEd Memorandum No. 060, s. 2026","Implementing guidelines expanding the ARAL Program to Mathematics for Grades 1 to 10 from Term 2 of SY 2026–2027, with tutoring allowed during class time (as reported; verify in the memorandum)","Mathematics tutoring groups in this interface follow this memorandum."],
 priv:["RA 10173","Data Privacy Act of 2012","Use learner codes only. Never enter names, LRNs, or other personal data into flags, notes, or AI tools."],
 cp:["DepEd Order No. 40, s. 2012","DepEd Child Protection Policy","Home visits, guidance referrals, and welfare concerns follow the child protection procedures."],
 ai:["DepEd Order No. 3, s. 2026","Foundational Guidelines on Artificial Intelligence in Basic Education (February 20, 2026)","Any automated flag is a prompt for a person. Human review and disclosure are required, and high-risk uses are prohibited."],
 lardo:["Division and regional memoranda on Learners at Risk of Dropping Out (LARDO)","Schools submit consolidated data on learners at risk of dropping out when the division asks (for example, November 2025). Check your SDO's current request.","Keep the register ready to consolidate. Counts only are reported."],
 abs:["Division and regional data requests on learners' absenteeism and late enrollees","Consolidated absenteeism and late-enrollee data requested from schools (for example, June to December 2025). Check your SDO's current schedule.","Attendance figures here can feed these requests."],
 talaan:["News report, November 19, 2026 (not a policy issuance)","DepEd announced it will expand a dropout early warning system, Talaan, to 300 schools in 2027.","Ask your SDO whether the school will take part. Until then, the thresholds on this page are school-set."],
 d10:["DepEd Order No. 10, s. 2026","Guidelines for the Implementation of 2026 Summer Remediation Programs (April 28, 2026)","Reference for remediation after the school year. Check for the next break's issuance."],
 sf:["School Forms (SF2, SF4, SF9, SF10)","DepEd school forms for attendance, learner movement, progress report card, and permanent record","Confirm the current forms and layouts with your SDO. Grades follow DO 15, s. 2026."]
};
function lmdefaults(){return{
attendance:{main:[
 ["Grade 7 – Sec A",40,96.2,95.8,0,0,"None needed"],
 ["Grade 7 – Sec B",39,94.1,94.8,0,2,"Adviser follow-up"],
 ["Grade 8 – Sec A",41,92,96.1,1,4,"Parent contact"],
 ["Grade 8 – Sec B",40,88.6,93,3,6,"Home visit planned"],
 ["Grade 9 – Sec A",38,95.5,95.2,0,1,"None needed"],
 ["Grade 10 – Sec A",37,94.9,95,0,1,"None needed"],
 ["Grade 10 – Sec C",36,93.8,94.5,1,3,"Adviser follow-up"],
 ["Grade 11 – Sec A",33,96.4,96,0,0,"None needed"]],
 aux:[["Target attendance rate (%)",95,"A section at or above this value is At target."],["Section alert below (%)",90,"A section below this value is on Alert. Between this and the target is Watch."],["Learner alert below (%)",85,"Reference for the individual learner count. Count learners below this level in each section."],["Consecutive absences that need follow-up",3,"Reference for the consecutive-absence count."]],
 check:[["Daily attendance recorded by class advisers (SF2)","Daily","Ongoing",""],["Monthly summary checked and consolidated (SF4)","Monthly","Ongoing",""],["Learners with consecutive absences contacted","Within the week","Ongoing","1 section on alert"],["Class suspensions and emergencies noted so they are not counted as absences","As they occur","Ongoing",""],["Data on absenteeism and late enrollees ready for SDO requests","Per SDO schedule (verify)","Pending",""],["Only counts shown here; learner names stay with the adviser","Always","Done",""]],
 refs:[LR.d9,LR.sf,LR.abs,LR.lardo,LR.cp,LR.priv]},
performance:{main:[
 ["Mathematics","Grade 10",80.4,81.9,0,85,255,24],
 ["English","Grade 8",84.2,84.9,0,85,295,12],
 ["Science","Grade 9",82.7,81.2,0,85,270,27],
 ["Filipino","Grade 7",85.1,85.6,0,85,310,9],
 ["Araling Panlipunan","Grade 8",83.9,84.4,0,85,295,15],
 ["Mathematics","Grade 7",79.8,80.9,0,85,310,52],
 ["General Mathematics","Grade 11",81.5,82.3,0,85,62,4]],
 aux:[["Stable band (± points)",1,"A change within this band between the last two terms is reported as Stable."],["Close to target (points)",2,"A mean grade within this many points of the target is reported as Close."],["Concern when learners below passing reach (%)",15,"The share of enrolled learners below the passing grade. At or above this value, the row is flagged as a Concern."]],
 check:[["Term grades encoded after each end-of-term block","Each term","Ongoing",""],["Grades computed under DO 15, s. 2026 (formative work not counted)","Each term","Ongoing",""],["Learning areas with many learners below passing reviewed with the teachers","Each term","Pending",""],["Remediation or enrichment planned from assessment results","Each term","Pending",""],["Class-level results only here; individual grades stay in the class record","Always","Done",""]],
 refs:[LR.d15,LR.d9,LR.d18,LR.priv,LR.sf]},
atrisk:{main:[
 ["LRN-A01","Grade 8 – Sec A",78,2,0,"","No","None yet"],
 ["LRN-B07","Grade 10 – Sec C",88,0,3,"Grades dropped 9 points since Term 1","Yes","Adviser follow-up"],
 ["LRN-C12","Grade 7 – Sec B",81,0,0,"No prior-school record on file","Yes","Home visit"],
 ["LRN-D03","Grade 11 – Sec A",92,0,0,"Incomplete Term 1 outputs","Yes","Adviser follow-up"],
 ["LRN-E05","Grade 9 – Sec A",90,1,0,"Reading below grade level","Yes","ARAL"],
 ["LRN-F11","Grade 10 – Sec C",83,2,4,"Family concern reported to the adviser","No","None yet"]],
 aux:[["Attendance below (%)",85,"Counts as one trigger."],["Failing learning areas, at least",2,"Counts as one trigger."],["Consecutive absences, at least",3,"Counts as one trigger."],["Triggers needed for High risk",2,"One trigger is Medium. None is Low."]],
 check:[["Every flag reviewed by the class adviser before any action","Within the week","Ongoing","2 awaiting review"],["Medium and High flags given a support plan","After review","Ongoing","1 without support"],["Learner codes only; no names in flags or notes","Always","Done",""],["Counts ready for LARDO or other SDO requests","Per SDO schedule (verify)","Pending",""],["Flags rechecked after each term's results","Each term","Pending",""],["Dismissed flags recorded with the reason","As they occur","Ongoing",""]],
 refs:[LR.lardo,LR.d15,LR.ai,LR.priv,LR.cp,LR.talaan,LR.ra12028]},
intervention:{main:[
 ["LRN-A01","Grade 8 – Sec A","Attendance","Parent conference",amIn(-7),amIn(7),"Class adviser","Ongoing","Parent contacted; waiting for a reply"],
 ["LRN-B07","Grade 10 – Sec C","Grades","Remediation class",amIn(-14),amIn(-1),"Subject teacher","Ongoing","Mean grade dropped 9 points"],
 ["LRN-C12","Grade 7 – Sec B","Attendance","Home visit",amIn(-5),amIn(9),"Class adviser","Not started","Visit to be scheduled"],
 ["LRN-D03","Grade 11 – Sec A","Grades","Adviser follow-up",amIn(-21),amIn(3),"Class adviser","Improved","Outputs now complete"],
 ["LRN-E05","Grade 9 – Sec A","Reading","ARAL tutoring",amIn(-30),amIn(14),"ARAL tutor","Ongoing","Midline check in December"],
 ["LRN-F11","Grade 10 – Sec C","Attendance","Guidance referral",amIn(-3),amIn(11),"Guidance designate","Not started",""],
 ["LRN-G02","Grade 9 – Sec A","Mathematics","Peer tutoring",amIn(-40),amIn(-5),"Subject teacher","Completed","Back above passing"],
 ["LRN-H04","Grade 7 – Sec B","Mathematics","Remediation class",amIn(-28),amIn(-2),"Subject teacher","No change","Review the plan with the subject teacher"]],
 aux:[["Adviser follow-up","Early signs: attendance dip or a missed output","Talk with the learner, contact the parent or guardian, record the result","Adviser's judgment; learner codes only"],["Remediation class","Learners below passing in a learning area","Short, targeted sessions from assessment results; recheck after the next summative test","DO 15, s. 2026: results guide remediation"],["ARAL tutoring","Learners below grade level in Reading or Mathematics (Grades 1 to 10)","Tag in the LIS, assign a tutor, keep a session log, check at midline and end of year","RA 12028; DO 18, s. 2025; DM 064, s. 2025; DM 060, s. 2026"],["Peer tutoring","Learners who need practice with a classmate's help","Pair learners, set a short schedule, check progress","School-set"],["Home visit or parent conference","Long absences or a family concern","Agree the purpose first and record what was agreed","DO 40, s. 2012 for welfare concerns"],["Guidance referral","Welfare or well-being concerns","Refer to the guidance designate and follow child protection steps","DO 40, s. 2012"]],
 check:[["Each intervention has a start date, an owner, and a review date","When assigned","Ongoing",""],["Reviews held on the review date","Per intervention","Ongoing","2 overdue"],["Interventions with No change adjusted or escalated","At review","Pending",""],["Outcome recorded when the intervention ends","On completion","Ongoing",""],["Learner codes only in notes","Always","Done",""]],
 refs:[LR.d15,LR.d18,LR.ra12028,LR.d10,LR.cp,LR.priv]},
aral:{main:[
 ["Reading group 1","Reading","Grade 7",14,"ARAL tutor",24,20,9,"Ongoing"],
 ["Reading group 2","Reading","Grade 8",12,"ARAL tutor",24,18,6,"Ongoing"],
 ["Mathematics group 1","Mathematics","Grade 7",18,"ARAL tutor",16,6,0,"Ongoing"],
 ["Mathematics group 2","Mathematics","Grade 9",10,"ARAL tutor",16,6,0,"Ongoing"],
 ["Mathematics group 3","Mathematics","Grade 10",8,"ARAL tutor",16,0,0,"Not started"],
 ["Science group 1","Science","Grade 8",0,"To be assigned",0,0,0,"Not started"]],
 aux:[["Beginning-of-school-year assessment and identification of learners","Term 1 opening block (verify against DO 9, s. 2026)","Teachers and School Head","Assessment results and learner list"],["Tagging of ARAL learners in the LIS","As directed by the LIS memorandum","LIS coordinator","LIS record"],["Tutor assignment and orientation","Before sessions start","School Head","Tutor list"],["Tutoring sessions and attendance","Per the school's ARAL schedule","ARAL tutors","Session log"],["Midline assessment","Around the middle of the school year (verify)","Teachers","Midline results"],["End-of-school-year assessment","Last term","Teachers","End-of-year results"],["School readiness and responsiveness audit (ASRRA)","As scheduled by the SDO (verify)","School Head","Audit form"]],
 check:[["Only Grades 1 to 10 learners placed in ARAL (Senior High School is not covered)","Always","Done",""],["Mathematics groups started from Term 2 as per DM 060, s. 2026","Term 2","Ongoing","1 group not started"],["Tutor assigned to every group","Before sessions","Ongoing","1 group without a tutor"],["Session logs kept and checked monthly","Monthly","Ongoing",""],["Midline results compared with the start","At midline","Pending",""],["ARAL learners tagged in the LIS","As directed","Pending",""]],
 refs:[LR.ra12028,LR.d18,LR.dm56,LR.dm64,LR.dm60,LR.priv]},
reports:{main:[
 ["Grade 7 – Sec A","Term 1",100,100,"Held","2026-09-18","Released"],
 ["Grade 8 – Sec B","Term 1",100,100,"Held","2026-09-18","Released"],
 ["Grade 10 – Sec C","Term 1",100,100,"Held","2026-09-18","Released"],
 ["Grade 11 – Sec A","Term 1",100,100,"Held","2026-09-18","Released"],
 ["Grade 7 – Sec A","Term 2",60,20,"Not yet","2026-12-18","In preparation"],
 ["Grade 7 – Sec B","Term 2",55,0,"Not yet","2026-12-18","In preparation"],
 ["Grade 8 – Sec A","Term 2",40,0,"Not yet","2026-12-18","Not yet due"],
 ["Grade 8 – Sec B","Term 2",40,0,"Scheduled","2026-12-18","Not yet due"],
 ["Grade 9 – Sec A","Term 2",35,0,"Not yet","2026-12-18","Not yet due"],
 ["Grade 10 – Sec A","Term 2",35,0,"Not yet","2026-12-18","Not yet due"],
 ["Grade 10 – Sec C","Term 2",30,0,"Not yet","2026-12-18","Not yet due"],
 ["Grade 11 – Sec A","Term 2",30,0,"Not yet","2026-12-18","Not yet due"]],
 aux:[["Term grades","The grade in each learning area for each term","Grades computed under DO 15, s. 2026"],["Final grade","The average of the term grades, rounded to the nearest whole number","Shown after Term 3"],["Learner support","Remediation, enrichment, or other support recommended from assessment results","Written by the teacher or adviser"],["Attendance","Days present and absent for the term","From SF2 and SF4"],["Parent-teacher conference","Date held and what was agreed","Recorded by the adviser"],["Form","The current report card and permanent record forms","Confirm with the SDO"]],
 aux2:[["Mathematics",82,84,0,"On track"],["English",80,82,0,"On track"],["Science",78,77,0,"Needs support in Term 3"],["Filipino",85,86,0,""],["Araling Panlipunan",81,83,0,""],["MAPEH",88,89,0,""],["GMRC / Values Education",90,91,0,""]],
 check:[["Grades encoded and checked by the subject teachers","End of each term","Ongoing",""],["Report cards prepared and signed by the adviser","After encoding","Ongoing",""],["Parent-teacher conference held when cards are released","Each term","Ongoing","1 held"],["Support recommended for learners below passing","Each term","Pending",""],["Cards and records stored securely","Always","Done",""],["AI-drafted comments, if any, edited by the teacher and disclosed","Always","Done",""]],
 refs:[LR.d15,LR.d9,LR.sf,LR.priv,LR.ai]}
};}
var lmData=lmdefaults();
try{const s=JSON.parse(localStorage.getItem("smartanhs.v1")||"null");if(s&&s.lmData)Object.keys(lmData).forEach(k=>{if(s.lmData[k])lmData[k]=Object.assign(lmData[k],s.lmData[k])})}catch(e){}

/* computed values */
const lmRule=(D,i,def)=>D.aux[i]&&isFinite(+D.aux[i][1])&&D.aux[i][1]!==""?+D.aux[i][1]:def;
function lmAtt(r,D){const c=amn(r[2]),p=amn(r[3]),tg=lmRule(D,0,95),al=lmRule(D,1,90),ch=amfix(c-p);return[(ch>0?"+":"")+ch+" pts",c>=tg?"At target":c>=al?"Watch":"Alert"]}
function lmPerf(r,D){
  const v=[r[2],r[3],r[4]].map(amn).filter(x=>x>0),tg=amn(r[5]),band=lmRule(D,0,1),close=lmRule(D,1,2),cap=lmRule(D,2,15);
  const last=v.length?v[v.length-1]:0,ch=v.length>1?amfix(last-v[v.length-2]):null;
  const dir=ch===null?"–":Math.abs(ch)<=band?"Stable":ch>0?"Improving":"Declining";
  const vs=!last?"–":last>=tg?"Met":tg-last<=close?"Close":"Below";
  const pct=amn(r[6])?Math.round(amn(r[7])/amn(r[6])*1000)/10:0;
  return{last:last||"–",ch:ch===null?"–":(ch>0?"+":"")+ch,dir,vs,pct,concern:pct>=cap};
}
function lmRisk(r,D){
  const at=lmRule(D,0,85),fl=lmRule(D,1,2),co=lmRule(D,2,3),hi=lmRule(D,3,2);
  const n=(amn(r[2])&&amn(r[2])<at?1:0)+(amn(r[3])>=fl?1:0)+(amn(r[4])>=co?1:0),risk=n>=hi?"High":n>=1?"Medium":"Low";
  const next=risk==="Low"?"Monitor":r[6]!=="Yes"?"Review needed":r[7]==="None yet"?"Assign support":"Monitor";
  return{n,risk,next};
}
function lmTiming(due,done){if(done)return"–";const d=Math.round((new Date(due)-new Date(amToday()))/864e5);return lmChip(d<0?"Overdue":d<=7?"Due soon":"On schedule")}
const lmPct=(a,b)=>amn(b)?Math.round(amn(a)/amn(b)*100):null;

const LMDEF={
 attendance:{title:"Learner attendance monitoring",icon:"✓",chip:6,
  desc:"Attendance by section for the month, compared with the school's targets, with follow-up actions for sections that need support.",
  notice:"Sample data only. Section totals only; learner names stay with the adviser. Do not count suspensions or emergency closures as absences (DO 14, s. 2026).",
  cols:[["Grade and section"],["Enrolled","number"],["Attendance this month (%)","number"],["Previous month (%)","number"],["Consecutive-absence cases","number"],["Learners below the alert level","number"],S("Follow-up",["None needed","Adviser follow-up","Parent contact","Home visit planned","Referred to guidance"])],
  calc:{head:["Change","Status"],fn:(r,D)=>{const x=lmAtt(r,D);return[esc(x[0]),lmChip(x[1])]}},
  auxTitle:"Attendance rules",auxCols:[["Rule"],["Value","number"],["Meaning"]],auxSub:"The first two values set each section's status. The other two are reference levels for advisers.",
  tiles:(r,D)=>{const e=lmsum(r,1),w=e?Math.round(r.reduce((s,x)=>s+amn(x[1])*amn(x[2]),0)/e*10)/10:0,x=r.map(y=>lmAtt(y,D)[1]);return[["School-wide attendance",w+"%"],["Sections at target",x.filter(y=>y==="At target").length+" of "+r.length],["Sections on alert",x.filter(y=>y==="Alert").length],["Consecutive-absence cases",lmsum(r,4)]]}},
 performance:{title:"Academic performance tracking",icon:"▥",chip:1,
  desc:"Mean grades per learning area across Terms 1 to 3, with the direction of change and the share of learners below passing.",
  notice:"Sample data only. Grades follow DO 15, s. 2026 and use class-level figures. Enter 0 for a term with no grades yet. Individual grades stay in the class record.",
  cols:[["Learning area"],S("Grade level",["Grade 7","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12"]),["Term 1 mean grade","number"],["Term 2 mean grade","number"],["Term 3 mean grade","number"],["Target mean grade","number"],["Learners enrolled","number"],["Learners below passing","number"]],
  calc:{head:["Latest","Change","Direction","Below passing","Against target"],fn:(r,D)=>{const x=lmPerf(r,D);return[esc(x.last),esc(x.ch),lmChip(x.dir),`${x.pct}% ${x.concern?lmChip("Concern"):lmChip("On track")}`,lmChip(x.vs)]}},
  auxTitle:"Performance rules",auxCols:[["Rule"],["Value","number"],["Meaning"]],auxSub:"These values set Direction, Against target, and the Concern flag.",
  tiles:(r,D)=>{const x=r.map(y=>lmPerf(y,D));return[["Learning areas tracked",r.length],["Improving",x.filter(y=>y.dir==="Improving").length],["Declining",x.filter(y=>y.dir==="Declining").length],["With a concern",x.filter(y=>y.concern).length]]}},
 atrisk:{title:"Identification of learners at risk of failing or dropping out",icon:"◬",chip:6,
  desc:"Learners are flagged from simple, visible rules on attendance and grades. Every flag waits for the class adviser's review before any action.",
  notice:"Sample data only, with fictional learner codes. A flag is a prompt for a person, not a decision. Keep names out of this register (RA 10173; DO 3, s. 2026).",
  cols:[["Learner code"],["Grade and section"],["Attendance (%)","number"],["Failing learning areas","number"],["Consecutive absences","number"],["Other factors noted"],S("Reviewed by adviser",["Yes","No"],1),S("Support assigned",["None yet","Adviser follow-up","ARAL","Remediation","Home visit","Guidance referral"])],
  calc:{head:["Triggers","Suggested risk","Next step"],fn:(r,D)=>{const x=lmRisk(r,D);return[String(x.n),lmChip(x.risk),lmChip(x.next)]}},
  auxTitle:"Flagging rules",auxCols:[["Rule"],["Value","number"],["Meaning"]],auxSub:"Each rule met counts as one trigger. These values drive the suggested risk.",
  tiles:(r,D)=>{const x=r.map((y,i)=>Object.assign({r:y},lmRisk(y,D))),f=x.filter(y=>y.risk!=="Low");return[["Learners flagged",f.length],["High risk",x.filter(y=>y.risk==="High").length],["Awaiting adviser review",f.filter(y=>y.r[6]!=="Yes").length],["Without support assigned",f.filter(y=>y.r[7]==="None yet").length]]}},
 intervention:{title:"Intervention and remediation monitoring",icon:"✚",chip:7,
  desc:"Each intervention has an owner, a review date, and a recorded outcome, so no learner is left without follow-up.",
  notice:"Sample data only, with fictional learner codes. Record outcomes briefly and keep personal details out of the notes.",
  cols:[["Learner code"],["Grade and section"],S("Concern",["Attendance","Grades","Reading","Mathematics","Well-being","Other"]),S("Intervention",["Adviser follow-up","Remediation class","ARAL tutoring","Peer tutoring","Home visit","Parent conference","Guidance referral"]),["Start date","date"],["Review date","date"],["Assigned to (role)"],S("Progress",["Not started","Ongoing","Improved","No change","Completed"],1),["Notes"]],
  calc:{head:["Review timing"],fn:r=>[lmTiming(r[5],r[7]==="Improved"||r[7]==="Completed")]},
  auxTitle:"Intervention guide",auxCols:[["Intervention"],["Used for"],["Expected steps"],["Basis"]],auxSub:"Adjust to your school's practice and the SDO's guidance.",
  tiles:r=>[["Active interventions",r.filter(x=>x[7]==="Ongoing"||x[7]==="Not started").length],["Improved or completed",r.filter(x=>x[7]==="Improved"||x[7]==="Completed").length],["No change",r.filter(x=>x[7]==="No change").length],["Reviews overdue",r.filter(x=>x[7]!=="Improved"&&x[7]!=="Completed"&&new Date(x[5])<new Date(amToday())).length]]},
 aral:{title:"ARAL Program monitoring",icon:"✎",chip:8,
  desc:"ARAL tutoring groups in Reading, Mathematics, and Science for Grades 7 to 10, with sessions held and learners who improved.",
  notice:"Sample data only. ARAL covers Kindergarten to Grade 10. Senior High School learners are not covered. Mathematics groups start from Term 2 of SY 2026–2027 (DM 060, s. 2026).",
  cols:[["ARAL group"],S("Subject",["Reading","Mathematics","Science"]),S("Grade level",["Grade 7","Grade 8","Grade 9","Grade 10"]),["Learners in ARAL","number"],["Tutor (role)"],["Sessions planned","number"],["Sessions held","number"],["Learners improved at midline","number"],S("Status",["Not started","Ongoing","Completed","Paused"],1)],
  calc:{head:["Sessions done","Improved"],fn:r=>{const a=lmPct(r[6],r[5]),b=amn(r[7])?lmPct(r[7],r[3]):null;return[a===null?"–":a+"%",b===null?"No data":b+"%"]}},
  auxTitle:"ARAL monitoring steps",auxCols:[["Step"],["When"],["Responsible"],["Record kept"]],auxSub:"Follow DO 18, s. 2025 and the memoranda listed below. Confirm dates with your SDO.",
  tiles:r=>{const L=lmsum(r,3),P=lmsum(r,5),H=lmsum(r,6),I=lmsum(r,7),m=r.filter(x=>amn(x[7])).reduce((s,x)=>s+amn(x[3]),0);return[["ARAL groups",r.length],["Learners in ARAL",L],["Sessions done",P?Math.round(H/P*100)+"%":"–"],["Improved at midline",m?Math.round(I/m*100)+"%":"No data"]]}},
 reports:{title:"Learner progress reports",icon:"▤",chip:6,
  desc:"Tracks report cards for each section and term, and shows how a learner's term grades become a final grade.",
  notice:"Sample data only. Release dates are school-set. Follow the SDO's schedule and DO 15, s. 2026. The sample report below uses a fictional learner code.",
  cols:[["Grade and section"],S("Term",["Term 1","Term 2","Term 3"]),["Grades encoded (%)","number"],["Report cards prepared (%)","number"],S("Parent-teacher conference",["Held","Scheduled","Not yet"],1),["Release date","date"],S("Status",["Not yet due","In preparation","Ready","Released"],1)],
  calc:{head:["Timing"],fn:r=>[r[6]==="Released"?lmChip("Closed"):lmTiming(r[5],false)]},
  auxTitle:"Report card content checklist",auxCols:[["Item"],["What it shows"],["Remarks"]],auxSub:"Content to check before cards are released.",
  aux2Title:"Sample learner progress report (fictional learner code LRN-S01)",aux2Cols:[["Learning area"],["Term 1","number"],["Term 2","number"],["Term 3","number"],["Support recommended"]],aux2Sub:"The final grade is the average of the term grades, rounded to the nearest whole number. It shows as partial until all three terms are in.",
  aux2Calc:{head:["Final grade"],fn:r=>{const v=[r[1],r[2],r[3]].map(amn).filter(x=>x>0);if(!v.length)return["–"];const a=Math.round(v.reduce((s,x)=>s+x,0)/v.length);return[v.length===3?`<strong>${a}</strong>`:`${a} (partial)`]}},
  tiles:r=>[["Report cards released",r.filter(x=>x[6]==="Released").length],["In preparation or ready",r.filter(x=>x[6]==="In preparation"||x[6]==="Ready").length],["Conferences held",r.filter(x=>x[4]==="Held").length],["Due within 7 days or overdue",r.filter(x=>x[6]!=="Released"&&(new Date(x[5])-new Date(amToday()))/864e5<=7).length]]}
};
const LMKEYS=Object.keys(LMDEF);
const learnerKey=t=>/attendance/i.test(t)?"attendance":/academic performance/i.test(t)?"performance":/at risk|dropping out/i.test(t)?"atrisk":/intervention and remediation/i.test(t)?"intervention":/ARAL/i.test(t)?"aral":/progress report/i.test(t)?"reports":null;
const lmREV="2026-11-22";
let lmcur="attendance";const lmst={q:"",f:""};
const lmmeta=k=>{const m=lmData[k].meta;return m&&m.length>=4?m:[LMDEF[k].title,LMDEF[k].desc,LMDEF[k].notice,lmREV]};
const lmcols=(k,tb)=>tb==="main"?LMDEF[k].cols:tb==="refs"?REFC:tb==="check"?CHKC:tb==="aux2"?LMDEF[k].aux2Cols:LMDEF[k].auxCols;
const lmEB=(k,tb,i)=>`<button class="adm" data-lch="edit" data-k="${k}" data-tb="${tb}" data-i="${i}">✎</button><button class="adm danger" data-lch="del" data-k="${k}" data-tb="${tb}" data-i="${i}">✕</button>`;
const lmAdd=(k,tb,l)=>`<button class="adm add" data-lch="add" data-k="${k}" data-tb="${tb}">＋ ${l}</button>`;
function lmtable(k,tb,rows,idx){
  const d=LMDEF[k],cols=lmcols(k,tb),D=lmData[k],calc=tb==="main"?d.calc:tb==="aux2"?d.aux2Calc:null;
  const head=cols.map(c=>`<th>${esc(c[0].toUpperCase())}</th>`).concat(calc?calc.head.map(h=>`<th>${esc(h.toUpperCase())}</th>`):[]).join("");
  const body=rows.map((r,n)=>{const i=idx?idx[n]:n;return `<tr>${r.map((v,j)=>`<td>${lmcell(cols[j],v)}</td>`).join("")}${calc?calc.fn(r,D,i).map(x=>`<td>${x}</td>`).join(""):""}<td class="cal-act">${lmEB(k,tb,i)}</td></tr>`}).join("")||`<tr><td colspan="${cols.length+(calc?calc.head.length:0)+1}" style="text-align:center;padding:20px;color:#98a4b1">No records match.</td></tr>`;
  return `<div class="table-wrap"><table><thead><tr>${head}<th></th></tr></thead><tbody>${body}</tbody></table></div>`;
}
function lmmain(k){
  const d=LMDEF[k],q=lmst.q.toLowerCase(),idx=[],rows=[];
  lmData[k].main.forEach((r,i)=>{if((!q||r.join(" ").toLowerCase().includes(q))&&(!lmst.f||r[d.chip]===lmst.f)){idx.push(i);rows.push(r)}});
  return lmtable(k,"main",rows,idx);
}
const lmpanel=(t,sub,add,body)=>`<div class="panel tui-panel"><div class="panel-heading"><div><h3>${t}</h3><p class="muted">${sub}</p></div>${add}</div>${body}</div>`;
function lmStages(){
  return lmpanel("Review workflow","Every flag follows these stages. The first stage always needs a person's review. The live list is on the Smart Learner page.","",`<div class="steps" style="margin:6px 0 8px">${stages.map((s,j)=>`<i class="${j===0?"now":""}"></i>`).join("")}</div><ol class="muted" style="margin:0;padding-left:18px;font-size:12px;line-height:1.7">${stages.map(s=>`<li>${esc(s)}</li>`).join("")}</ol>`);
}
function lmRender(){
  const k=lmcur,d=LMDEF[k],D=lmData[k],m=lmmeta(k);
  $("#page-lmu").innerHTML=`<div class="tui-top"><button class="outline-btn mini" data-lm="back">← Smart Learner</button><div class="tui-tabs">${LMKEYS.map(x=>`<button class="${x===k?"on":""}" data-lm="${x}">${esc(lmmeta(x)[0])}</button>`).join("")}</div></div>
  <div class="tui-head"><div class="tui-icon">${d.icon}</div><div><p class="eyebrow">SMART LEARNER</p><h1>${esc(m[0])}</h1><p class="muted">${esc(m[1])}</p><p class="dui-rev">Content last reviewed against DepEd issuances: <b>${esc(amDate(m[3])||"not recorded")}</b></p><div class="dui-adm"><button class="adm add" data-lch="meta" data-k="${k}">✎ Edit page details</button><button class="adm danger" data-lch="reset" data-k="${k}">Restore default content</button></div></div></div>
  <div class="advisory-note">${esc(m[2])}</div>
  <div class="module-summary-grid">${d.tiles(D.main,D).map(t=>`<div class="summary-tile"><span>${esc(t[0])}</span><strong>${esc(t[1])}</strong></div>`).join("")}</div>
  ${k==="atrisk"?lmStages():""}
  ${lmpanel("Records","Search, filter, and review. Admins can add, edit, and delete rows.",lmAdd(k,"main","Add record"),`<div class="tui-tools"><input id="lmQ" placeholder="Search records…" value="${esc(lmst.q)}" /><select id="lmF"><option value="">All ${esc(d.cols[d.chip][0].toLowerCase())}</option>${d.cols[d.chip][2].map(o=>`<option${o===lmst.f?" selected":""}>${esc(o)}</option>`).join("")}</select></div><div id="lmMain">${lmmain(k)}</div>`)}
  ${d.aux2Title?lmpanel(d.aux2Title,d.aux2Sub,lmAdd(k,"aux2","Add row"),lmtable(k,"aux2",D.aux2)):""}
  ${lmpanel(d.auxTitle,d.auxSub,lmAdd(k,"aux","Add row"),lmtable(k,"aux",D.aux))}
  ${lmpanel("Monitoring checklist","Requirements to track for this area.",lmAdd(k,"check","Add item"),lmtable(k,"check",D.check))}
  ${lmpanel("DepEd basis and references","The orders, memorandums, and laws this interface follows. Verify and update as new issuances are released.",lmAdd(k,"refs","Add reference"),lmtable(k,"refs",D.refs))}`;
}
function lmShow(k){
  lmcur=k;lmst.q="";lmst.f="";currentModule="learner";
  $$(".page-section").forEach(s=>s.classList.remove("active"));$("#page-lmu").classList.add("active");
  $$(".nav-item").forEach(li=>li.classList.toggle("active",li.dataset.pages.split(" ").includes("learner")));
  $("#breadcrumbPage").textContent="Smart Learner · "+lmmeta(k)[0];
  lmRender();closeDD();$("#topNav").classList.remove("open");window.scrollTo({top:0,behavior:"smooth"});
}
const _goTo7=goTo;goTo=function(p){if(typeof p==="string"&&p.startsWith("lrn:"))return lmShow(p.slice(4));_goTo7(p)};
function lmSave(msg){persist();lmRender();$("#breadcrumbPage").textContent="Smart Learner · "+lmmeta(lmcur)[0];showToast(msg||"Saved.")}
function lmAct(a,k,tb,i){
  const D=lmData[k];
  if(a==="meta")return admForm("Edit page details",[["Page title"],["Description"],["Notice shown to users"],["Content last reviewed against DepEd issuances","date"]],lmmeta(k),v=>{D.meta=[v[0]||LMDEF[k].title,v[1],v[2],v[3]];lmSave()});
  if(a==="reset"){if(confirm("Restore the default content for this page? Your edits to it will be removed.")){lmData[k]=lmdefaults()[k];lmSave("Default content restored.")}return}
  const arr=D[tb],cols=lmcols(k,tb);
  if(a==="del"){if(confirm("Delete this row?")){arr.splice(i,1);lmSave()}return}
  const row=a==="add"?cols.map(c=>c[1]==="number"?0:c[1]==="select"?c[2][0]:c[1]==="date"?amToday():""):arr[i];
  admForm((a==="add"?"Add":"Edit")+" row",cols.map(c=>[c[0],c[1]||"text",c[2]]),row,v=>{
    const n=v.map((x,j)=>cols[j][1]==="number"?(+x||0):x);
    if(a==="add")arr.push(n);else arr[i]=n;lmSave();
  });
}
$("#page-lmu").addEventListener("click",e=>{
  const t=e.target.closest("[data-lm]");
  if(t){const v=t.dataset.lm;return v==="back"?goTo("learner"):lmShow(v)}
  const b=e.target.closest("[data-lch]");if(b&&isAdmin)lmAct(b.dataset.lch,b.dataset.k,b.dataset.tb,+b.dataset.i);
});
$("#page-lmu").addEventListener("input",e=>{if(e.target.id==="lmQ"){lmst.q=e.target.value;$("#lmMain").innerHTML=lmmain(lmcur)}});
$("#page-lmu").addEventListener("change",e=>{if(e.target.id==="lmF"){lmst.f=e.target.value;$("#lmMain").innerHTML=lmmain(lmcur)}});
document.addEventListener("click",e=>{
  const b=e.target.closest('.dropdown .dd-item[data-page="learner"]');if(!b)return;
  const k=learnerKey(b.textContent);if(k){e.stopPropagation();$("#topNav").classList.add("lock");lmShow(k)}
},true);
