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
    box.innerHTML=arr.length?arr.map(x=>{const title=x.product_name||x.name||x.generic_name_zh||"生物制品"; const rows=[
  ["通用名",x.generic_name_zh], ["类型/类别",[x.type,x.category].filter(Boolean).join(" / ")], ["适用动物",x.species||x.species_group],
  ["生产企业",x.manufacturer], ["作用与用途",x.indications||x.summary], ["抗原/主要成分",x.antigens], ["适用年龄",x.age],
  ["用法与用量",x.dose], ["免疫程序",x.schedule], ["接种途径",x.route], ["规格",x.specification], ["贮藏",x.storage],
  ["不良反应",x.adverse_reactions], ["注意事项",x.precautions], ["注册信息",x.registration], ["核验提示",x.verification], ["资料来源",x.source]
 ].filter(r=>r[1]); return `<div class="drug"><b class="title">${esc(title)}</b>${rows.map(r=>`<div class="vax-detail"><span class="muted">${esc(r[0])}：</span>${esc(r[1])}</div>`).join("")}${x.source_url?`<div class="source">来源：<a href="${esc(x.source_url)}" target="_blank" rel="noopener">官方资料</a>${x.source_note?` · ${esc(x.source_note)}`:""}</div>`:""}</div>`}).join(""):"<div class='muted'>当前筛选条件下无匹配生物制品。</div>";
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
