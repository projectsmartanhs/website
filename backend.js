/* SMART-ANHS backend: Supabase sign-in, cloud saving, and the Google Drive file API.
   Needs config.js filled in and supabase/schema.sql run. When config.js is blank this file does nothing,
   and the app keeps working in local prototype mode. */
(function(){
"use strict";
const cfg=window.SMART_CONFIG||{};
const RV="smartanhs.rv";               // last cloud version this browser has applied
const EDITORS=["admin","school_head"];  // roles that may edit data
const UPLOADERS=["admin","school_head","teacher","staff"];
const ROLE_LABEL={admin:"Administrator",school_head:"School Head",teacher:"Teacher",staff:"Staff",viewer:"Viewer"};

const B=window.Backend={enabled:!!window.SMART_BACKEND_ON,ready:false,user:null,profile:null,role:null,files:[],
  canEdit:()=>EDITORS.includes(B.role),canUpload:()=>UPLOADERS.includes(B.role),canDelete:()=>EDITORS.includes(B.role),
  roleLabel:r=>ROLE_LABEL[r]||r};
if(!B.enabled)return;

const toast=m=>{if(typeof showToast==="function")showToast(m)};
if(!window.supabase||!window.supabase.createClient){
  B.enabled=false;B.error="The Supabase library could not load (check your internet connection or ad blocker).";
  window.addEventListener("load",()=>toast(B.error));return;
}
const sb=B.client=window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
const fnUrl=cfg.SUPABASE_URL.replace(/\/$/,"")+"/functions/v1/drive";
let ver=+localStorage.getItem(RV)||0,timer=null,saving=false,dirty=false,retry=null;

/* ---------- small status chip in the admin bar ---------- */
function status(txt,cls){
  let el=document.getElementById("syncStatus");
  if(!el){const bar=document.getElementById("admBar");if(!bar)return;
    bar.insertAdjacentHTML("afterbegin",'<span id="syncStatus" class="sync-chip"></span>');el=document.getElementById("syncStatus")}
  el.textContent=txt;el.className="sync-chip "+(cls||"");
}

/* ---------- sign-in / sign-out ---------- */
function setLabel(){
  const b=document.getElementById("portalLogin");if(!b||!b.lastChild)return;
  b.lastChild.textContent=B.user?" "+(ROLE_LABEL[B.role]||"Signed in")+" · Log out":" Portal Login";
}
async function loadProfile(){
  const {data:s}=await sb.auth.getSession();
  B.user=s.session?s.session.user:null;
  if(!B.user){B.profile=null;B.role=null;return}
  const {data}=await sb.from("profiles").select("role,full_name,email").eq("id",B.user.id).single();
  B.profile=data||null;B.role=(data&&data.role)||"viewer";
}
function applyRole(){
  if(typeof setAdmin==="function")setAdmin(B.canEdit());
  setLabel();
  if(B.canEdit())status("Cloud: connected","ok");
  document.dispatchEvent(new CustomEvent("backend:auth",{detail:{role:B.role}}));
}
B.openLogin=function(){
  if(B.user){if(confirm("Sign out of SMART-ANHS?"))B.signOut();return}
  admForm("Sign in to SMART-ANHS",[["Email","email"],["Password","password"]],["",""],async v=>{
    const email=v[0].trim(),pw=v[1];
    if(!email||!pw){toast("Enter your email and password.");return false}
    const {error}=await sb.auth.signInWithPassword({email,password:pw});
    if(error){toast(error.message==="Invalid login credentials"?"Incorrect email or password.":error.message);return false}
    await loadProfile();applyRole();await B.pull();toast("Signed in as "+(ROLE_LABEL[B.role]||"user")+".");
  });
  const m=document.getElementById("admModal"),pb=m&&m.querySelector(".primary-btn");
  if(m&&pb){m.classList.add("signin");pb.innerHTML='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/></svg> Login'}
};
B.signOut=async function(){
  await sb.auth.signOut();
  /* remove the cached school data from this browser so it does not stay on shared computers */
  try{localStorage.removeItem(SKEY);localStorage.removeItem(RV);sessionStorage.removeItem(AKEY)}catch(e){}
  location.reload();
};

/* ---------- cloud state: pull ---------- */
B.pull=async function(){
  if(!B.user)return;
  const {data,error}=await sb.from("app_state").select("data,version").eq("id",1).single();
  if(error){status("Cloud: read failed","bad");toast("Could not read the cloud data: "+error.message);return}
  const has=data&&data.data&&data.data.modules;
  if(has&&data.version>ver){
    try{localStorage.setItem(SKEY,JSON.stringify(data.data));localStorage.setItem(RV,String(data.version))}catch(e){return}
    ver=data.version;
    toast("Loading the latest saved data…");setTimeout(()=>location.reload(),400);return;
  }
  ver=data?data.version:ver;
  if(!has&&B.canEdit()){await B.pushNow()}   // first run: upload the starting data
};

/* ---------- cloud state: push (debounced, with conflict detection) ---------- */
B.queue=function(){
  if(!B.user||!B.canEdit())return;
  dirty=true;status("Cloud: saving…","busy");
  clearTimeout(timer);timer=setTimeout(B.pushNow,900);
};
B.pushNow=async function(){
  if(!B.user||!B.canEdit()||saving)return;
  clearTimeout(timer);clearTimeout(retry);retry=null;saving=true;dirty=false;
  try{
    const snap=snapshot();
    const {data,error}=await sb.from("app_state").update({data:snap}).eq("id",1).eq("version",ver).select("version");
    if(error)throw error;
    if(!data||!data.length){
      status("Cloud: conflict","bad");
      toast("Someone else saved newer changes. Reload the page to get them before editing again.");
      saving=false;return;
    }
    ver=data[0].version;localStorage.setItem(RV,String(ver));
    status("Cloud: saved","ok");
  }catch(e){
    status("Cloud: not saved, retrying","bad");dirty=true;
    retry=setTimeout(B.pushNow,10000);
  }
  saving=false;
  if(dirty&&!retry)B.queue();
};
window.addEventListener("beforeunload",e=>{if(dirty||saving){e.preventDefault();e.returnValue=""}});

/* ---------- Google Drive files (through the Edge Function) ---------- */
async function authHeaders(){
  const {data}=await sb.auth.getSession();
  if(!data.session)throw new Error("Please sign in first.");
  return {Authorization:"Bearer "+data.session.access_token,apikey:cfg.SUPABASE_ANON_KEY};
}
async function fnJson(res){
  let j=null;try{j=await res.json()}catch(e){}
  if(!res.ok)throw new Error((j&&j.error)||("Request failed ("+res.status+")"));
  return j;
}
B.listFiles=async function(){
  const {data,error}=await sb.from("files").select("*").order("uploaded_at",{ascending:false});
  if(error)throw error;B.files=data||[];return B.files;
};
B.upload=async function(file,meta){
  const f=new FormData();f.append("file",file);
  f.append("module",meta.module||"General");f.append("category",meta.category||"");f.append("note",meta.note||"");
  const j=await fnJson(await fetch(fnUrl,{method:"POST",headers:await authHeaders(),body:f}));
  return j.file;
};
B.download=async function(rec){
  const res=await fetch(fnUrl+"?id="+encodeURIComponent(rec.id),{headers:await authHeaders()});
  if(!res.ok)await fnJson(res);
  const blob=await res.blob(),a=document.createElement("a");
  a.href=URL.createObjectURL(blob);a.download=rec.name;document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),4000);
};
B.removeFile=async function(rec){
  await fnJson(await fetch(fnUrl+"?id="+encodeURIComponent(rec.id),{method:"DELETE",headers:await authHeaders()}));
};

/* ---------- start ---------- */
(async function init(){
  try{
    await loadProfile();
    if(B.user){applyRole();await B.pull()}else setLabel();
  }catch(e){status("Cloud: offline","bad")}
  B.ready=true;document.dispatchEvent(new CustomEvent("backend:ready"));
  sb.auth.onAuthStateChange(ev=>{if(ev==="SIGNED_OUT"&&B.user){B.user=null;setLabel()}});
})();
})();
