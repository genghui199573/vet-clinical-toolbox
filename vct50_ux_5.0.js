/* Vet Clinical Toolbox 5.0-r09 — biologics search fix */
(()=>{"use strict";
const norm=x=>Array.isArray(x)?x:(x&&Array.isArray(x.products)?x.products:(x&&Array.isArray(x.biologics)?x.biologics:(x&&Array.isArray(x.items)?x.items:[])));
const esc=s=>String(s??"").replace(/[&<>\"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
async function repairBiologics(){
 try{
  const r=await fetch("./data/vet_biologics_5.0.json?v=5.0-r09",{cache:"no-store"});
  if(!r.ok)throw Error("HTTP "+r.status);
  const a=norm(await r.json()).map((x,i)=>({...x,name:x.name||x.product_name||x.generic_name_zh||("生物制品-"+(i+1)),product_name:x.product_name||x.name||x.generic_name_zh||("生物制品-"+(i+1))}));
  window.__VCT50_BIOLOGICS_DATA=a; window.__VCT50_BIOLOGICS_COUNT=a.length;
  const refresh=()=>{try{if(window.DB&&typeof window.DB==="object")window.DB.biologics=a;if(typeof window.renderVax==="function")window.renderVax()}catch(_){} };
  refresh(); [300,800,1500,3000].forEach(ms=>setTimeout(refresh,ms));
  const s=document.getElementById("dbStatus"); if(s)s.innerHTML='<div class="good">数据库读取完成；生物制品 <b>'+a.length+'</b> 条。<span class="small">（5.0 数据兼容修复）</span></div>';
 }catch(e){window.__VCT50_BIOLOGICS_ERROR=e; const s=document.getElementById("dbStatus"); if(s)s.innerHTML='<div class="bad">生物制品数据库读取失败：'+esc(e.message)+'。</div>';}
}
window.VCT50Final9={version:"5.0",normalizeBiologics:norm,repairBiologics,getBiologicsCount:()=>window.__VCT50_BIOLOGICS_COUNT||0};
repairBiologics();
})();

/* Vet Clinical Toolbox 5.0-r08-final6 — biologics search UI hardening */
(()=>{
  "use strict";
  const norm=x=>Array.isArray(x)?x:(x&&Array.isArray(x.products)?x.products:(x&&Array.isArray(x.biologics)?x.biologics:(x&&Array.isArray(x.items)?x.items:[])));
  const esc=s=>String(s??"").replace(/[&<>\"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
  function data(){return Array.isArray(window.__VCT50_BIOLOGICS_DATA)?window.__VCT50_BIOLOGICS_DATA:[]}
  function render(){
    const box=document.getElementById("vaxList"), q=(document.getElementById("vaxQ")?.value||"").trim().toLowerCase(), sp=document.getElementById("vaxSp")?.value||"";
    if(!box)return;
    const arr=data().filter(x=>{
      const text=JSON.stringify(x).toLowerCase();
      return (!q||text.includes(q))&&(!sp||JSON.stringify(x).includes(sp));
    });
    box.innerHTML=arr.length?arr.map(x=>`<div class="drug"><b class="title">${esc(x.product_name||x.name||x.generic_name_zh||"生物制品")}</b><div>${esc(x.manufacturer||"")}</div><div>${esc(x.species||x.species_group||"")}</div><div class="source">${esc(x.notes||x.label_status||"以实际官方标签为准")}</div></div>`).join(""):"<div class='muted'>当前筛选条件下无匹配生物制品。</div>";
  }
  function bind(){
    const q=document.getElementById("vaxQ"), sp=document.getElementById("vaxSp"), btn=document.getElementById("vaxBtn");
    if(!q||!sp||!btn)return false;
    btn.type="button";
    if(btn.dataset.vct50Bound!=="1"){
      btn.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();render();},true);
      q.addEventListener("input",render,true);
      q.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();render();}},true);
      sp.addEventListener("change",render,true);
      btn.dataset.vct50Bound="1";
    }
    return true;
  }
  const boot=()=>{bind();render()};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true}); else boot();
  [100,500,1200,2500].forEach(ms=>setTimeout(boot,ms));
  window.VCT50BiologicsSearch={version:"5.0",render,bind,getData:data};
})();
