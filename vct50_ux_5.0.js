/* Vet Clinical Toolbox 5.0-r08-final4 */
(()=>{"use strict";
const norm=x=>Array.isArray(x)?x:(x&&Array.isArray(x.products)?x.products:(x&&Array.isArray(x.biologics)?x.biologics:(x&&Array.isArray(x.items)?x.items:[])));
async function loadBiologics(){
 try{
  const r=await fetch("./data/vet_biologics_5.0.json",{cache:"no-store"});
  if(!r.ok)throw Error("HTTP "+r.status);
  const a=norm(await r.json()).map((x,i)=>({...x,name:x.name||x.product_name||x.generic_name_zh||("生物制品-"+(i+1)),product_name:x.product_name||x.name||x.generic_name_zh||("生物制品-"+(i+1))}));
  if(window.DB&&typeof window.DB==="object")window.DB.biologics=a;
  window.__VCT50_BIOLOGICS_COUNT=a.length;
  if(typeof window.renderVax==="function")window.renderVax();
  const s=document.getElementById("dbStatus");if(s)s.innerHTML='<div class="good">数据库读取完成：生物制品 <b>'+a.length+'</b> 条。</div>';
  return a;
 }catch(e){window.__VCT50_BIOLOGICS_COUNT=0;window.__VCT50_BIOLOGICS_ERROR=e;return []}
}
const n=v=>{v=parseFloat(v);return Number.isFinite(v)?v:null},low=v=>String(v??"").toLowerCase();
function pat(){const p=window.patientState||{},g=(ids,d)=>{for(const id of ids){const e=document.getElementById(id);if(e&&e.value!=="")return e.value}return d};return{species:low(g(["caseSpecies","patientSpecies","doseSpecies"],p.species))}}
function stop(t,m){document.getElementById("vct50-hardlock")?.remove();const d=document.createElement("div");d.id="vct50-hardlock";d.style.cssText="position:fixed;inset:0;z-index:100000;background:#0008;display:grid;place-items:center;padding:18px";d.innerHTML='<div style="max-width:560px;background:#fff;border:3px solid #b91c1c;border-radius:14px;padding:18px;font-family:system-ui"><b style="font-size:20px;color:#991b1b">⛔ '+t+'</b><p style="line-height:1.7">'+m+'</p><button id="vct50-close">返回修改</button></div>';document.body.appendChild(d);document.getElementById("vct50-close").onclick=()=>d.remove()}
document.addEventListener("click",e=>{
 const b=e.target.closest("button");if(!b)return;const p=pat();
 const drug=low((document.getElementById("doseDrug")?.selectedOptions?.[0]?.textContent||"")+" "+(document.getElementById("criDrug")?.value||""));
 if(p.species.includes("猫")){
  if(/对乙酰氨基酚|acetaminophen|paracetamol/.test(drug)){e.preventDefault();e.stopImmediatePropagation();stop("猫禁用对乙酰氨基酚","存在严重猫中毒风险。本工具阻止生成可执行给药结果。");return false}
  if(/菊酯|氯菊酯|permethrin|pyrethrin|pyrethroid/.test(drug)){e.preventDefault();e.stopImmediatePropagation();stop("猫禁用菊酯类","存在严重神经毒性风险。本工具阻止生成可执行给药结果。");return false}
  const d=n(document.getElementById("doseValue")?.value);if(/恩诺沙星|enrofloxacin/.test(drug)&&d!==null&&d>5){e.preventDefault();e.stopImmediatePropagation();stop("恩诺沙星超过5 mg/kg/day","当前输入超过本5.0工具设定的猫每日5 mg/kg硬锁。");return false}
 }
 const bol=n(document.getElementById("shockVol")?.value||document.getElementById("bolusMlKg")?.value),max=p.species.includes("猫")?15:20;
 if((location.hash.toLowerCase().includes("shock")||/bolus|冲击|休克/.test(low(b.textContent)))&&bol!==null&&bol>max){e.preventDefault();e.stopImmediatePropagation();stop("休克Bolus超过安全上限",(p.species.includes("猫")?"猫":"犬")+"单次Bolus ≤ "+max+" mL/kg；15–20分钟给药后重新评估肺音、CRT、血压和心率。");return false}
 const k=n(document.getElementById("kclRate")?.value||document.getElementById("kclMeqKgH")?.value);if(k!==null&&k>0.5){e.preventDefault();e.stopImmediatePropagation();stop("KCl速率超过硬锁","超过0.5 mEq/kg/h，禁止生成可执行配液结果。");return false}
},true);
window.VCT50Final4={version:"5.0",normalizeBiologics:norm,loadBiologics,getBiologicsCount:()=>window.__VCT50_BIOLOGICS_COUNT||0};
loadBiologics();
})();