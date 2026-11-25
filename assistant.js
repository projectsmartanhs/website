/* SMART Assistant chat. Talks to the Supabase Edge Function "assistant" (the AI key stays on the server). */
(function(){
const panel=document.getElementById("assistantPanel");if(!panel)return;
const body=panel.querySelector(".assistant-body"),form=panel.querySelector("#assistantForm"),
  input=panel.querySelector("#assistantText"),send=panel.querySelector("#assistantSend"),sub=panel.querySelector("#assistantSub");
const cfg=window.SMART_CONFIG||{},B=()=>window.Backend;
const url=(cfg.SUPABASE_URL||"").replace(/\/$/,"")+"/functions/v1/assistant";
const st=document.createElement("style");
st.textContent=".assistant-body{max-height:min(55vh,420px);overflow-y:auto}.a-msg{margin-top:10px;padding:10px 12px;border-radius:9px;font-size:11px;line-height:1.6;white-space:pre-wrap;word-break:break-word}.a-user{background:#0b3a6e;color:#fff;margin-left:28px}.a-bot{background:#f2f6fb;color:#1c2b3d;margin-right:18px}.a-bad{background:#fdecec;color:#8a1f1f}.assistant-input input{flex:1;min-width:0}";
document.head.appendChild(st);
const history=[];let busy=false;
function add(cls,text){const d=document.createElement("div");d.className="a-msg "+cls;d.textContent=text;body.appendChild(d);body.scrollTop=body.scrollHeight;return d}
function ready(){
  const b=B(),ok=!!(b&&b.enabled&&b.user&&b.canUpload&&b.canUpload());
  input.disabled=send.disabled=!ok||busy;
  input.placeholder=!b||!b.enabled?"Cloud not connected":!b.user?"Sign in with Portal Login to chat":!ok?"Your role cannot use the assistant":"Ask the SMART Assistant…";
  sub.textContent=ok?"Advisory AI · Do not enter learner names or LRN":"Sign in to use the assistant";
}
form.addEventListener("submit",async e=>{
  e.preventDefault();const text=input.value.trim();if(!text||busy)return;
  input.value="";add("a-user",text);history.push({role:"user",content:text});
  busy=true;ready();const wait=add("a-bot","Thinking…");
  try{
    const {data}=await B().client.auth.getSession();
    if(!data.session)throw new Error("Please sign in first.");
    const res=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+data.session.access_token,apikey:cfg.SUPABASE_ANON_KEY},body:JSON.stringify({messages:history})});
    let j=null;try{j=await res.json()}catch(_){}
    if(!res.ok)throw new Error((j&&j.error)||"Request failed ("+res.status+")");
    wait.textContent=j.reply;history.push({role:"assistant",content:j.reply});
  }catch(err){wait.className="a-msg a-bad";wait.textContent=err.message;history.pop()}
  busy=false;ready();input.focus();body.scrollTop=body.scrollHeight;
});
document.addEventListener("backend:ready",ready);document.addEventListener("backend:auth",ready);
ready();
})();
