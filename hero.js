/* Home page photo: shows the default school photo, or the one an admin uploaded. */
(function(){
const el=document.getElementById("heroPhoto");if(!el)return;
const note=m=>{if(typeof showToast==="function")showToast(m)};
const save=()=>{if(typeof persist==="function")persist()};
window.applyHero=function(){el.style.backgroundImage=window.heroImage?'url("'+window.heroImage+'")':""};
function shrink(img,w,q){
  const s=Math.min(1,w/img.naturalWidth),c=document.createElement("canvas");
  c.width=Math.round(img.naturalWidth*s);c.height=Math.round(img.naturalHeight*s);
  c.getContext("2d").drawImage(img,0,0,c.width,c.height);
  return c.toDataURL("image/jpeg",q);
}
document.getElementById("heroFile").addEventListener("change",e=>{
  const f=e.target.files[0];e.target.value="";if(!f)return;
  if(!/^image\//.test(f.type)){note("Please choose an image file (JPG or PNG).");return}
  if(f.size>20*1024*1024){note("That image is too large. Choose one under 20 MB.");return}
  const url=URL.createObjectURL(f),img=new Image();
  img.onload=()=>{
    URL.revokeObjectURL(url);
    let w=1400,q=.8,out=shrink(img,w,q);
    while(out.length>450000&&q>.45){q-=.1;out=shrink(img,w,q)}
    while(out.length>450000&&w>700){w-=200;out=shrink(img,w,.6)}
    window.heroImage=out;applyHero();save();note("Home photo updated.");
  };
  img.onerror=()=>{URL.revokeObjectURL(url);note("That image could not be read. Try another file.")};
  img.src=url;
});
document.getElementById("heroReset").addEventListener("click",()=>{
  window.heroImage="";applyHero();save();note("Home photo reset to the default.");
});
applyHero();
})();
