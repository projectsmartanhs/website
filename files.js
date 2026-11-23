/* School files panel (Reports & documents page). Files live in Google Drive; this panel talks to them through backend.js. */
(function(){
const host=document.getElementById("page-reports");if(!host)return;
const MODULES=["General","Smart Admin","Smart Learner","Smart Teacher","Smart Instruction","Smart Project","Smart Resource","Smart Decision","Data Privacy"];
host.insertAdjacentHTML("beforeend",`<div class="panel files-panel" id="filesPanel"><div class="panel-heading"><div><h3>School files</h3><p class="muted">Stored in the school's Google Drive and shared through your Supabase sign-in.</p></div></div><div id="filesBody"></div></div>`);
const body=document.getElementById("filesBody"),B=()=>window.Backend;
const esc=v=>typeof escapeHTML==="function"?escapeHTML(String(v==null?"":v)):String(v);
let q="",busy=false,loadErr="";
const size=n=>!n?"":n<1024?n+" B":n<1048576?Math.round(n/1024)+" KB":(n/1048576).toFixed(1)+" MB";
const day=d=>{try{return new Date(d).toLocaleDateString("en-US",{month:"short",day:"2-digit",year:"numeric"})}catch(e){return""}};

function view(){
  const b=B();
  if(!b||!b.enabled){body.innerHTML=`<p class="files-note">Cloud storage is not connected yet. Add your Supabase details in <code>config.js</code> to turn on sign-in and Google Drive files (see SETUP.md).</p>`;return}
  if(!b.user){body.innerHTML=`<p class="files-note">Sign in with <strong>Portal Login</strong> to see the school's files.</p>`;return}
  const rows=(b.files||[]).filter(f=>!q||[f.name,f.module,f.category,f.note,f.uploader].join(" ").toLowerCase().includes(q));
  const up=b.canUpload()?`<form class="files-up" id="filesForm">
      <input type="file" id="fFile" required />
      <select id="fMod">${MODULES.map(m=>`<option>${esc(m)}</option>`).join("")}</select>
      <input type="text" id="fCat" placeholder="Category (e.g. SF2, Memo)" maxlength="80" />
      <input type="text" id="fNote" placeholder="Note (optional)" maxlength="300" />
      <button class="primary-btn" id="fBtn"${busy?" disabled":""}>${busy?"Uploading…":"Upload to Drive"}</button></form>`
    :`<p class="files-note">Your role (${esc(b.roleLabel(b.role))}) can view and download files.</p>`;
  body.innerHTML=up+`<div class="files-bar"><input type="search" id="fQ" placeholder="Search files…" value="${esc(q)}" /><span class="muted">${rows.length} file${rows.length===1?"":"s"}</span></div>`+
    (loadErr?`<p class="files-note bad">${esc(loadErr)}</p>`:"")+
    (rows.length?`<div class="table-wrap"><table class="files-table"><thead><tr><th>FILE</th><th>MODULE</th><th>CATEGORY</th><th>SIZE</th><th>UPLOADED</th><th></th></tr></thead><tbody>${rows.map(f=>`<tr><td><strong>${esc(f.name)}</strong>${f.note?`<div class="muted">${esc(f.note)}</div>`:""}</td><td>${esc(f.module)}</td><td>${esc(f.category||"")}</td><td>${size(f.size_bytes)}</td><td>${day(f.uploaded_at)}<div class="muted">${esc(f.uploader||"")}</div></td><td class="files-act"><button class="outline-btn mini" data-dl="${esc(f.id)}">Download</button>${b.canDelete()?`<button class="outline-btn mini danger" data-rm="${esc(f.id)}">Delete</button>`:""}</td></tr>`).join("")}</tbody></table></div>`
    :`<p class="files-note">${(b.files||[]).length?"No files match your search.":"No files yet."}</p>`);
}
async function refresh(){
  const b=B();if(!b||!b.enabled||!b.user){view();return}
  try{loadErr="";await b.listFiles()}catch(e){loadErr="Could not load files: "+e.message}
  view();
}
body.addEventListener("input",e=>{if(e.target.id==="fQ"){q=e.target.value.trim().toLowerCase();view();const f=document.getElementById("fQ");f.focus();f.setSelectionRange(f.value.length,f.value.length)}});
body.addEventListener("submit",async e=>{
  if(e.target.id!=="filesForm")return;e.preventDefault();
  const file=document.getElementById("fFile").files[0];if(!file)return;
  const meta={module:document.getElementById("fMod").value,category:document.getElementById("fCat").value.trim(),note:document.getElementById("fNote").value.trim()};
  busy=true;view();
  try{await B().upload(file,meta);showToast("Uploaded to Google Drive.");await B().listFiles()}catch(err){showToast(err.message)}
  busy=false;view();
});
body.addEventListener("click",async e=>{
  const dl=e.target.closest("[data-dl]"),rm=e.target.closest("[data-rm]"),b=B();
  const rec=id=>(b.files||[]).find(f=>f.id===id);
  if(dl){const r=rec(dl.dataset.dl);if(!r)return;dl.disabled=true;try{await b.download(r)}catch(err){showToast(err.message)}dl.disabled=false}
  if(rm){const r=rec(rm.dataset.rm);if(!r||!confirm("Move \""+r.name+"\" to the Drive trash?"))return;
    try{await b.removeFile(r);showToast("File moved to the Drive trash.");await refresh()}catch(err){showToast(err.message)}}
});
/* refresh when the page opens, and when sign-in state changes */
new MutationObserver(()=>{if(host.classList.contains("active"))refresh()}).observe(host,{attributes:true,attributeFilter:["class"]});
document.addEventListener("backend:ready",refresh);
document.addEventListener("backend:auth",refresh);
view();
})();
