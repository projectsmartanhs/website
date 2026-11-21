/* Smart Admin: school calendar and activity monitoring */
var calEvents=[
 {id:"s7",date:"2026-11-18",title:"Classroom observation – Grade 10 Math",type:"Class observation",time:"10:00",notes:"",status:"Completed"},
 {id:"s1",date:"2026-11-20",title:"General faculty meeting",type:"Meeting",time:"15:00",notes:"AVR",status:"Scheduled"},
 {id:"s2",date:"2026-11-23",title:"Classroom observation – Grade 8 English",type:"Class observation",time:"09:00",notes:"Observer: Head Teacher",status:"Scheduled"},
 {id:"s3",date:"2026-11-24",end:"2026-11-25",title:"LAC session on learner assessment",type:"Seminar / training",time:"13:00",notes:"",status:"Scheduled"},
 {id:"s4",date:"2026-11-26",title:"Monthly school Mass",type:"Mass",time:"07:30",notes:"School grounds",status:"Scheduled"},
 {id:"s5",date:"2026-11-27",title:"Nutrition Month closing program",type:"Program / event",time:"14:00",notes:"",status:"Scheduled"},
 {id:"s6",date:"2026-11-30",title:"Bonifacio Day",type:"Holiday",time:"",notes:"No classes. Verify against the official DepEd calendar.",status:"Scheduled"},
 {id:"s8",date:"2026-12-08",title:"Feast of the Immaculate Conception",type:"Holiday",time:"",notes:"",status:"Scheduled"},
 {id:"s9",date:"2026-12-25",title:"Christmas Day",type:"Holiday",time:"",notes:"",status:"Scheduled"},
 {id:"s10",date:"2026-12-30",title:"Rizal Day",type:"Holiday",time:"",notes:"",status:"Scheduled"}];
/* Official DepEd calendar, SY 2026-2027 (DepEd Order No. 9, s. 2026: three-term calendar, 201 class days) */
const DEPED_CAL=[
 ["dep-1","2026-06-08","2026-06-11","Term 1: Opening block","open","Start of the school year. Beginning-of-school-year routines, health assessment, and parent orientations."],
 ["dep-2","2026-06-15","2026-09-01","Term 1: Instructional block","inst",""],
 ["dep-3","2026-09-02","2026-09-15","Term 1: End-of-term block","eot","Assessments and end-of-term activities."],
 ["dep-4","2026-09-16","2026-12-04","Term 2: Instructional block","inst","Start date from DO 9, s. 2026. End date follows from the end-of-term block starting December 7. Verify against the Order."],
 ["dep-5","2026-12-07","2026-12-18","Term 2: End-of-term block","eot","Assessments and end-of-term activities before the break."],
 ["dep-6","2026-12-19","2026-12-31","Year-end break","brk","No classes."],
 ["dep-7","2027-01-04","2027-03-23","Term 3: Instructional block","inst","Classes resume January 4, 2027."],
 ["dep-8","2027-03-24","2027-04-08","Term 3: End-of-term block","eot","Final assessments and closing activities."],
 ["dep-9","2027-04-06","2027-04-07","End-of-school-year rites","","Reported date. Verify with the division memorandum."],
 ["dep-10","2027-04-08","","Last day of classes, SY 2026–2027","","201 class days from the first day of Term 1 to the last day of Term 3."]
].map(x=>({id:x[0],date:x[1],end:x[2],title:x[3],type:"DepEd calendar",time:"",notes:x[5],status:(x[2]||x[1])<new Date().toISOString().slice(0,10)?"Completed":"Scheduled",blk:x[4]}));
calEvents=calEvents.concat(DEPED_CAL);
try{const s=JSON.parse(localStorage.getItem("smartanhs.v1")||"null");if(s&&Array.isArray(s.calEvents)){calEvents=s.calEvents;if(!calEvents.some(e=>String(e.id).startsWith("dep-")))calEvents=calEvents.concat(DEPED_CAL)}}catch(e){}
const CT={"Class observation":"#0b3a6e","Meeting":"#2b7a9b","Seminar / training":"#1f6b45","Holiday":"#c8102e","Mass":"#8a6500","Program / event":"#b86e00","DepEd calendar":"#082a52","Other":"#5b6775"};
const CST=["Scheduled","Completed","Postponed","Cancelled"],CSC={Completed:"completed",Postponed:"progress",Cancelled:"review",Scheduled:""};
const MN=["January","February","March","April","May","June","July","August","September","October","November","December"];
const calNow=new Date(),cal={y:calNow.getFullYear(),m:calNow.getMonth(),hide:{}};
const pad2=n=>String(n).padStart(2,"0"),isoD=(y,m,d)=>`${y}-${pad2(m+1)}-${pad2(d)}`;
const fmtT=t=>{if(!t)return"";const[h,m]=t.split(":");return(+h%12||12)+":"+m+(+h<12?" AM":" PM")};
const fmtD=d=>new Date(d+"T00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"});
const evOn=d=>calEvents.filter(e=>e.date<=d&&(e.end||e.date)>=d&&!cal.hide[e.type]).sort((a,b)=>(a.time||"").localeCompare(b.time||""));
function monthEvents(){const a=isoD(cal.y,cal.m,1),b=isoD(cal.y,cal.m,new Date(cal.y,cal.m+1,0).getDate());return calEvents.filter(e=>e.date<=b&&(e.end||e.date)>=a).sort((x,y)=>x.date.localeCompare(y.date)||(x.time||"").localeCompare(y.time||""))}
const blkOn=d=>calEvents.find(e=>e.blk&&!cal.hide[e.type]&&e.date<=d&&(e.end||e.date)>=d);
const pill=e=>`<span class="cal-ev${e.status==="Cancelled"?" x":""}" style="--c:${CT[e.type]||CT.Other}" data-cal="ev" data-id="${e.id}" title="${escapeHTML(e.title)}">${e.time?fmtT(e.time)+" ":""}${escapeHTML(e.title)}</span>`;
function blocksHTML(me){
  const bl=me.filter(e=>e.blk&&!cal.hide[e.type]).sort((a,b)=>a.date.localeCompare(b.date)),tk=isoD(calNow.getFullYear(),calNow.getMonth(),calNow.getDate()),cur=blkOn(tk);
  if(!bl.length&&!cur)return"";
  return `<div class="cal-blocks"><strong>DepEd calendar</strong>${cur?`<span class="cal-now">Today: ${escapeHTML(cur.title)}</span>`:""}${bl.map(e=>`<span class="cal-blk b-${e.blk}">${fmtD(e.date)}${e.end?" – "+fmtD(e.end):""} · ${escapeHTML(e.title)}</span>`).join("")}</div>`;
}
function calHTML(){
  const first=new Date(cal.y,cal.m,1).getDay(),days=new Date(cal.y,cal.m+1,0).getDate(),tk=isoD(calNow.getFullYear(),calNow.getMonth(),calNow.getDate());
  const me=monthEvents(),shown=me.filter(e=>!cal.hide[e.type]),acts=me.filter(e=>e.type!=="DepEd calendar"),done=acts.filter(e=>e.status==="Completed").length,pct=acts.length?Math.round(done/acts.length*100):0;
  let cells="";for(let i=0;i<first;i++)cells+=`<div class="cal-cell blank"></div>`;
  for(let d=1;d<=days;d++){const k=isoD(cal.y,cal.m,d),ev=evOn(k).filter(e=>!e.blk),bk=blkOn(k),wd=(first+d-1)%7;
    cells+=`<div class="cal-cell${k===tk?" today":""}${wd%6===0?" wk":""}${bk&&bk.blk?" cal-b-"+bk.blk:""}" data-cal="day" data-d="${k}"><span class="cal-n">${d}</span>${ev.slice(0,3).map(pill).join("")}${ev.length>3?`<span class="cal-more">+${ev.length-3} more</span>`:""}</div>`}
  const legend=Object.keys(CT).map(t=>`<button class="cal-chip${cal.hide[t]?" off":""}" style="--c:${CT[t]}" data-cal="filter" data-t="${t}">${t} <b>${me.filter(e=>e.type===t).length}</b></button>`).join("");
  const list=shown.map(e=>`<tr><td>${fmtD(e.date)}${e.end?" – "+fmtD(e.end):""}${e.time?`<br><small>${fmtT(e.time)}</small>`:""}</td><td><strong>${escapeHTML(e.title)}</strong>${e.notes?`<br><small>${escapeHTML(e.notes)}</small>`:""}</td><td><span class="cal-chip static" style="--c:${CT[e.type]||CT.Other}">${e.type}</span></td><td><span class="status-chip ${CSC[e.status]||""}">${e.status}</span></td><td class="cal-act"><button class="adm" data-cal="edit" data-id="${e.id}">✎</button><button class="adm danger" data-cal="del" data-id="${e.id}">✕</button></td></tr>`).join("")||`<tr><td colspan="5" style="text-align:center;padding:22px;color:#98a4b1">No activities scheduled for this month.</td></tr>`;
  return `<div class="panel cal-panel" id="calPanel"><div class="panel-heading"><div><h3>School calendar and activity monitoring</h3><p class="muted">Includes the DepEd SY 2026–2027 three-term calendar (DO 9, s. 2026). Admins can add, edit, and track activities for each month.</p></div><div class="cal-nav"><button class="outline-btn mini" data-cal="prev" aria-label="Previous month">‹</button><strong>${MN[cal.m]} ${cal.y}</strong><button class="outline-btn mini" data-cal="next" aria-label="Next month">›</button><button class="outline-btn mini" data-cal="today">Today</button><button class="adm add" data-cal="add">＋ Schedule activity</button><button class="adm" data-cal="depload" title="Add any missing DepEd calendar entries">⟳ Load DepEd calendar</button></div></div>
  <div class="cal-legend">${legend}</div>
  ${blocksHTML(me)}
  <div class="cal-prog"><span>${done} of ${me.length} activities completed this month</span><div class="bar"><span style="width:${pct}%"></span></div></div>
  <div class="cal-grid">${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=>`<div class="cal-dow">${d}</div>`).join("")}${cells}</div>
  <p class="cal-hint adm">Click a day to schedule an activity, or click an activity to edit it.</p>
  <h4 class="cal-h">Activities this month</h4><div class="table-wrap"><table><thead><tr><th>DATE</th><th>ACTIVITY</th><th>TYPE</th><th>STATUS</th><th></th></tr></thead><tbody>${list}</tbody></table></div></div>`;
}
function refreshCal(){const el=$("#calPanel");if(el)el.outerHTML=calHTML()}
function scrollToCal(){const el=$("#calPanel");if(!el)return;el.scrollIntoView({behavior:"smooth",block:"start"});el.classList.add("flash");setTimeout(()=>el.classList.remove("flash"),1800)}
const _renderExtras=renderExtras;
renderExtras=function(key){_renderExtras(key);if(key==="admin")$("#moduleExtra").insertAdjacentHTML("beforeend",calHTML())};
function evForm(ev,def){
  const isNew=!ev,v=ev||{date:def,title:"",type:"Meeting",time:"",notes:"",status:"Scheduled"};
  admForm(isNew?"Schedule an activity":"Edit activity",[["Activity title"],["Type","select",Object.keys(CT)],["Start date","date"],["End date (optional, for multi-day)","date"],["Time (optional)","time"],["Venue / notes"],["Status","select",CST]],[v.title,v.type,v.date,v.end||"",v.time||"",v.notes||"",v.status],vals=>{
    const[title,type,date,end,time,notes,status]=vals;
    if(!title.trim()||!date){showToast("Please enter a title and a start date.");return false}
    if(end&&end<date){showToast("The end date can't be before the start date.");return false}
    const n={id:isNew?"e"+Date.now():ev.id,title:title.trim(),type,date,end,time,notes,status};
    if(isNew)calEvents.push(n);else Object.assign(ev,n);
    cal.y=+date.slice(0,4);cal.m=+date.slice(5,7)-1;persist();refreshCal();showToast("Calendar saved.");
  });
}
function dayInfo(list,title){openInfo(title,list.length?`<ul>${list.map(e=>`<li><strong>${escapeHTML(e.title)}</strong> · ${e.type} · ${e.status}${e.time?" · "+fmtT(e.time):""}${e.end?" · until "+fmtD(e.end):""}${e.notes?`<br><small>${escapeHTML(e.notes)}</small>`:""}</li>`).join("")}</ul>`:"<p>No activities scheduled for this day.</p>")}
document.addEventListener("click",e=>{
  const nb=e.target.closest(".dropdown [data-page]");if(nb&&nb.dataset.page==="admin"&&/calendar/i.test(nb.textContent))setTimeout(scrollToCal,600);
  const b=e.target.closest("#calPanel [data-cal]");if(!b)return;const a=b.dataset.cal,ev=calEvents.find(x=>x.id===b.dataset.id);
  if(a==="prev"||a==="next"){cal.m+=a==="next"?1:-1;if(cal.m<0){cal.m=11;cal.y--}if(cal.m>11){cal.m=0;cal.y++}return refreshCal()}
  if(a==="today"){cal.y=calNow.getFullYear();cal.m=calNow.getMonth();return refreshCal()}
  if(a==="filter"){cal.hide[b.dataset.t]=!cal.hide[b.dataset.t];return refreshCal()}
  if(a==="ev")return isAdmin?evForm(ev):dayInfo([ev],ev.title);
  if(a==="day")return isAdmin?evForm(null,b.dataset.d):dayInfo(evOn(b.dataset.d),fmtD(b.dataset.d)+", "+b.dataset.d.slice(0,4));
  if(!isAdmin)return;
  if(a==="depload"){const have=new Set(calEvents.map(x=>x.id)),add=DEPED_CAL.filter(x=>!have.has(x.id));calEvents.push(...add);persist();refreshCal();return showToast(add.length?add.length+" DepEd calendar entries added.":"All DepEd calendar entries are already there.")}
  if(a==="add")return evForm(null,calNow.getMonth()===cal.m&&calNow.getFullYear()===cal.y?isoD(cal.y,cal.m,calNow.getDate()):isoD(cal.y,cal.m,1));
  if(a==="edit")return evForm(ev);
  if(a==="del"&&confirm("Delete this activity?")){calEvents.splice(calEvents.indexOf(ev),1);persist();refreshCal();showToast("Activity deleted.")}
});
