/* Working previews: feature tags, record details, sample reports */
document.body.insertAdjacentHTML("beforeend",`<div class="modal-backdrop" id="infoModal"><div class="modal info-modal"><div class="modal-head"><h2 id="infoTitle"></h2><button class="icon-btn" id="infoClose" type="button" aria-label="Close">×</button></div><div id="infoBody"></div><div class="adm-actions" id="infoActions"></div></div></div>`);
let infoActs=[];
const closeInfo=()=>$("#infoModal").classList.remove("show");
function openInfo(title,html,actions=[]){
  infoActs=actions;$("#infoTitle").textContent=title;$("#infoBody").innerHTML=html;
  $("#infoActions").innerHTML=actions.map((a,i)=>`<button class="${a[2]||"outline-btn"}" data-ia="${i}">${a[0]}</button>`).join("")+`<button class="outline-btn" data-ia="x">Close</button>`;
  $("#infoModal").classList.add("show");
}
$("#infoClose").onclick=closeInfo;
$("#infoModal").addEventListener("click",e=>{if(e.target.id==="infoModal")closeInfo();const b=e.target.closest("[data-ia]");if(b){b.dataset.ia==="x"?closeInfo():infoActs[+b.dataset.ia][1]()}});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeInfo()});
const esc=escapeHTML,rows=(a)=>a.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join("")}</tr>`).join("");
const tbl=(head,body)=>`<div class="table-wrap"><table class="rep-table"><thead><tr>${head.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${body}</tbody></table></div>`;
/* feature preview */
function featTarget(k,t){
  t=t.toLowerCase();const ex=$("#moduleExtra .extra-panel");
  if(ex){
    if(k==="learner"&&/risk|dropout|intervention|remediation|aral/.test(t))return[ex,"The at-risk learner list, with reasons for each flag and a human-reviewed intervention workflow."];
    if((k==="project"||k==="resource")&&/budget|financ|canteen|feeding|utiliz/.test(t))return[ex,"The budget utilization table"+(k==="resource"?" and the canteen / feeding summary":"")+". It is view and report only."];
    if(k==="decision"&&/trend|early|recommend|operational/.test(t))return[ex,"Sample insights. Each shows what it is based on and waits for an official to accept or return it."];
  }
  return[$(".module-workspace"),"The related records in this module's workspace table. You can search and filter them."];
}
function featPreview(f){
  const m=modules[currentModule];
  if(!f[1])return openInfo(f[0],`<p><span class="tag off">Planned</span> in ${esc(m.title)}</p><p>This feature is planned for a later phase and is not built in the prototype yet. An admin can change its status to Preview with the ✎ button once it is ready.</p>`);
  const [el,desc]=featTarget(currentModule,f[0]);
  const words=f[0].toLowerCase().split(/\W+/).filter(w=>w.length>4);
  const rel=m.records.filter(r=>words.some(w=>(r[0]+" "+r[1]).toLowerCase().includes(w))).slice(0,4);
  openInfo(f[0],`<p><span class="tag on">Preview</span> in ${esc(m.title)}</p><p><strong>What you can try:</strong> ${desc}</p>`+(rel.length?`<p><strong>Related records</strong></p><ul>${rel.map(r=>`<li>${esc(r[0])} · ${esc(r[1])} · ${esc(r[3])}</li>`).join("")}</ul>`:""),
   [["Show me",()=>{closeInfo();el.scrollIntoView({behavior:"smooth",block:"center"});el.classList.add("flash");setTimeout(()=>el.classList.remove("flash"),1800)},"primary-btn"]]);
}
/* sample reports */
const REP=[["School performance report",["admin","learner","teacher","project"]],["Learner monitoring report",["learner"]],["Personnel monitoring report",["teacher"]],["Project accomplishment report",["project"]]];
function repHTML(title,keys){
  const one=keys.length===1;
  let h=`<div class="rep-head"><img src="logo.png" width="48" height="48" alt=""><div><small>DIVISION OF ROMBLON</small><strong>Alcantara National High School</strong><span>${title} · Sample report · ${new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</span></div></div>`;
  keys.forEach(k=>{const m=modules[k];h+=`<h4>${esc(m.title)}</h4><p class="rep-tiles">${m.summary.map(s=>`<span><b>${esc(s[1])}</b> ${esc(s[0])}</span>`).join("")}</p>`;
    if(one)h+=tbl(["Record","Category","Updated","Status"],rows(m.records))});
  if(keys[0]==="learner"&&one)h+=`<h4>Learners flagged for review</h4>`+tbl(["Learner","Risk","Reasons","Stage"],rows(atRisk.map(l=>[l.id+" · "+l.gs,l.risk,l.why.join("; "),stages[l.stage]])));
  if(keys[0]==="project"&&one)h+=`<h4>Budget utilization</h4>`+tbl(["Line item","Allocated","Utilized","Rate"],rows(budget.map(b=>[b[0],peso(b[1]),peso(b[2]),Math.round(b[2]/b[1]*100)+"%"])));
  return h+`<p class="rep-note">Sample data only. ${ADVISORY}</p>`;
}
/* click handlers (capture phase replaces the old "not connected" messages) */
document.addEventListener("click",e=>{
  const rec=e.target.closest("[data-record]");
  if(rec){e.stopPropagation();const r=modules[currentModule].records[+rec.dataset.record-1];if(r)openInfo(r[0],`<table class="rep-table"><tbody>${rows([["Module",modules[currentModule].title],["Category",r[1]],["Last updated",r[2]],["Status",r[3]]]).replace(/<td>/,'<td class="k">')}</tbody></table><p class="muted">Sample record. An admin can edit or delete it from the admin controls.</p>`);return}
  const rb=e.target.closest(".report-action");
  if(rb){e.stopPropagation();const [t,k]=REP[[...$$(".report-action")].indexOf(rb)];openInfo(t,repHTML(t,k),[["Print / Save as PDF",()=>window.print(),"primary-btn"]]);return}
  const li=e.target.closest(".feat-list li");
  if(li&&!e.target.closest(".adm")){const f=features[currentModule][[...li.parentElement.children].indexOf(li)];if(f)featPreview(f)}
},true);
