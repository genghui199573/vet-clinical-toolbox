/* Vet Clinical Toolbox 5.0-r08-final5
 * 修复 vet_biologics_5.0.json 使用 products[] 导致生物制品显示 0。
 * 产品版本保持 5.0。
 */
(()=>{"use strict";
const norm=x=>Array.isArray(x)?x:(x&&Array.isArray(x.products)?x.products:(x&&Array.isArray(x.biologics)?x.biologics:(x&&Array.isArray(x.items)?x.items:[])));
const esc=s=>String(s??"").replace(/[&<>\"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
async function repair(){
 try{
  const r=await fetch("./data/vet_biologics_5.0.json?v=5.0-r08-final5",{cache:"no-store"});
  if(!r.ok) throw Error("HTTP "+r.status);
  const a=norm(await r.json()).map((x,i)=>({...x,name:x.name||x.product_name||x.generic_name_zh||("生物制品-"+(i+1)),product_name:x.product_name||x.name||x.generic_name_zh||("生物制品-"+(i+1))}));
  window.__VCT50_BIOLOGICS_DATA=a; window.__VCT50_BIOLOGICS_COUNT=a.length;
  if(window.DB&&typeof window.DB==="object") window.DB.biologics=a;
  if(typeof window.renderVax==="function"){try{window.renderVax()}catch(_) {}}
  const s=document.getElementById("dbStatus");
  if(s)s.innerHTML='<div class="good">数据库读取完成；生物制品 <b>'+a.length+'</b> 条。<span class="small">（5.0 数据兼容修复）</span></div>';
  [500,1200,2500,5000].forEach(ms=>setTimeout(()=>{try{if(window.DB&&typeof window.DB==="object"){window.DB.biologics=a;if(typeof window.renderVax==="function")window.renderVax();}}catch(_){}},ms));
 }catch(e){
  window.__VCT50_BIOLOGICS_COUNT=0; window.__VCT50_BIOLOGICS_ERROR=e;
  const s=document.getElementById("dbStatus"); if(s)s.innerHTML='<div class="bad">生物制品数据库读取失败：'+esc(e.message)+'。</div>';
 }
}
window.VCT50Final5={version:"5.0",normalizeBiologics:norm,repairBiologics:repair,getBiologicsCount:()=>window.__VCT50_BIOLOGICS_COUNT||0}; repair();
})();
