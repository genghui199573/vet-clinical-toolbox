(function(){
"use strict";
function el(tag,attrs,html){const x=document.createElement(tag);Object.entries(attrs||{}).forEach(([k,v])=>x.setAttribute(k,v));if(html!=null)x.innerHTML=html;return x}
function ensureMissingControls(){
  if(document.getElementById("reconstituteBtn")) return;
  const dose=document.getElementById("dose"); if(!dose)return;
  const card=el("div",{class:"card",id:"reconstituteCard"},`
    <h2>粉针复溶 / 抽取量</h2>
    <div class="grid"><div>
      <label>物种<select id="rwSpecies"><option>犬</option><option>猫</option><option>鹦鹉/鸟类</option><option>兔/啮齿类</option><option>爬宠/龟鳖</option></select></label>
      <label>品种<input id="rwBreed"></label>
      <label>体重 kg<input id="rwWeight" type="number" step=".01"></label>
      <label>目标剂量<input id="rwDose" type="number" step=".001"></label>
      <label>剂量单位<select id="rwDoseUnit"><option>mg/kg</option><option>µg/kg</option></select></label>
      <label>每瓶总药量<input id="vialAmount" type="number" step=".001"></label>
      <label>药量单位<select id="vialUnit"><option>mg</option><option>g</option><option>µg</option></select></label>
    </div><div>
      <label>稀释液加入量 mL<input id="diluentVolume" type="number" step=".1"></label>
      <label>复溶后最终体积 mL<input id="finalVolume" type="number" step=".1"></label>
      <button class="primary" id="reconstituteBtn">计算复溶后抽取量</button>
      <div id="reOut"></div>
    </div></div>`);
  dose.appendChild(card);
  const hidden=el("select",{id:"rwDrug",style:"display:none"});card.appendChild(hidden);
}
function addStyles(){
 const s=document.createElement("style");s.textContent=`
 .lab-ref-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px}
 .lab-chip{display:inline-block;padding:3px 8px;border-radius:999px;background:#edf4f3;margin:2px;font-size:11px}
 .cpr-big{font:700 48px/1.1 ui-monospace,Consolas,monospace;text-align:center;padding:16px;border-radius:14px;background:#0b1220;color:#fff;letter-spacing:2px}
 .cpr-controls{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.cpr-controls button{flex:1;min-width:120px}
 .lab-source{font-size:12px;color:#66777d}
 @media(max-width:700px){.cpr-big{font-size:38px}}
 `;document.head.appendChild(s);
}
function installCPR(){
 const box=document.getElementById("emergency"); if(!box)return;
 const card=[...box.querySelectorAll(".card")].find(x=>x.textContent.includes("CPR 计时"));
 if(!card)return;
 const old=card.querySelector("#cprTimer"); if(!old)return;
 old.classList.add("cpr-big");
 let total=0, remaining=120, timer=null, running=false;
 const controls=card.querySelector(".toolbar");
 if(controls){
   controls.innerHTML="";
   [["cprStart","开始/继续"],["cprStop","暂停"],["cprReset","重置2分钟"],["cprNext","下一周期"]].forEach(([id,t])=>{
     const b=document.createElement("button");b.id=id;b.className=id==="cprStart"?"primary":"secondary";b.textContent=t;controls.appendChild(b);
   });
   let status=document.getElementById("cprStatus");
   if(!status){status=document.createElement("div");status.id="cprStatus";status.className="info";controls.after(status)}
   const render=()=>{const m=String(Math.floor(remaining/60)).padStart(2,"0"),s=String(remaining%60).padStart(2,"0");old.textContent=m+":"+s;status.innerHTML=`周期：${Math.floor(total/120)+1} · 总计时：${Math.floor(total/60)}:${String(total%60).padStart(2,"0")} · ${running?"进行中":"已暂停"}`};
   const tick=()=>{if(!running)return;remaining--;total++;render();if(remaining<=0){running=false;clearInterval(timer);timer=null;status.innerHTML="<b>2分钟周期结束：立即进行节律/脉搏评估，尽量减少胸外按压中断，并记录下一步决策。</b>"}};
   controls.querySelector("#cprStart").onclick=()=>{if(running)return;running=true;timer=setInterval(tick,1000);render()};
   controls.querySelector("#cprStop").onclick=()=>{running=false;clearInterval(timer);timer=null;render()};
   controls.querySelector("#cprReset").onclick=()=>{running=false;clearInterval(timer);timer=null;remaining=120;total=0;render()};
   controls.querySelector("#cprNext").onclick=()=>{running=false;clearInterval(timer);timer=null;remaining=120;render();status.innerHTML="<b>新2分钟周期已准备。</b>"};
   render();
 }
 // Add high-yield CPR guidance based on RECOVER 2024.
 let guide=card.querySelector("#cprGuide"); if(!guide){
   guide=document.createElement("div");guide.id="cprGuide";guide.className="info";guide.innerHTML=`
   <b>RECOVER 2024 犬猫 CPR 快速框架</b>
   <ul><li>BLS优先：立即开始高质量胸外按压并尽量减少中断。</li>
   <li>目标按压频率：100–120 次/分钟；按压深度和手法根据体型/胸廓形态调整。</li>
   <li>每个2分钟周期结束时进行节律/脉搏评估并立即恢复按压。</li>
   <li>ALS包括气道/通气、IV/IO通路、节律识别、可逆原因处理和复苏药物；具体剂量以RECOVER 2024算法/医院急救表核对。</li></ul>
   <span class="lab-source">依据：RECOVER 2024 CPR Guidelines。工具仅作认知辅助，不替代受训团队的现场流程。</span>`;
   card.appendChild(guide);
 }
}
async function addLabSection(){
 if(document.getElementById("labAnalyzer"))return;
 const nav=document.getElementById("nav"),main=document.querySelector("main");if(!nav||!main)return;
 const b=document.createElement("button");b.dataset.v="labAnalyzer";b.textContent="检验仪器/参考区间";nav.appendChild(b);
 const sec=document.createElement("section");sec.id="labAnalyzer";sec.className="view";
 sec.innerHTML=`<div class="card"><h2>检验仪器 / 厂家参考区间工作站</h2>
 <div class="info">参考区间优先使用厂家当前说明书/报告；不同仪器、方法、试剂和实验室可存在差异。未取得厂家公开参考区间的型号不会被系统“猜范围”。</div>
 <div class="lab-ref-grid">
   <div><label>厂家<select id="labMaker"></select></label></div>
   <div><label>型号<select id="labModel"></select></label></div>
   <div><label>物种<select id="labSpecies"><option>犬</option><option>猫</option><option>其他</option></select></label></div>
   <div><label>年龄组<select id="labAge"><option>成年</option><option>老年</option><option>幼年</option></select></label></div>
 </div>
 <div id="labMeta" class="result"></div>
 <div class="toolbar"><input id="labQ" placeholder="检索项目，如 ALT / CREA / K / Na"><button class="primary" id="labRefresh">载入参考区间</button></div>
 <div id="labTable" style="overflow:auto"></div>
 <div class="warn">注意：本模块用于判读和录入辅助。实际报告上的参考区间优先级最高，尤其当厂家软件已按物种/年龄/方法动态提供参考区间时。</div>
 </div>`;
 main.appendChild(sec);
 const styleBtn=nav.querySelector('button[data-v="labAnalyzer"]');
 styleBtn.addEventListener("click",()=>{document.querySelectorAll(".view").forEach(x=>x.classList.remove("active"));sec.classList.add("active");nav.querySelectorAll("button").forEach(x=>x.classList.toggle("active",x===styleBtn));location.hash="labAnalyzer"});
 let data;
 try{const r=await fetch("data/lab_analyzers_5.0.json?v=5.0",{cache:"no-store"});if(!r.ok)throw new Error("HTTP "+r.status);data=await r.json()}catch(e){document.getElementById("labMeta").innerHTML=`<div class="bad">检验仪器数据库读取失败：${e.message}</div>`;return}
 const makers=[...new Set(data.analyzers.map(x=>x.manufacturer))];
 const makerSel=document.getElementById("labMaker"),modelSel=document.getElementById("labModel");
 makerSel.innerHTML=makers.map(x=>`<option>${x}</option>`).join("");
 function models(){const m=makerSel.value;modelSel.innerHTML=data.analyzers.filter(x=>x.manufacturer===m).map(x=>`<option value="${x.id}">${x.model}</option>`).join("");render()}
 function render(){
   const x=data.analyzers.find(a=>a.id===modelSel.value)||data.analyzers[0]; if(!x)return;
   document.getElementById("labMeta").innerHTML=`<b>${x.manufacturer} · ${x.model}</b><br>${x.origin||""}<br>检测：${(x.tests||[]).join("、")}<br>${x.reference_intervals?.status==="official"?"<span class='lab-chip'>官方参考区间已录入</span>":"<span class='lab-chip'>暂无可核验的官方参考区间</span>"}<br><span class='lab-source'>来源：${(x.sources||[]).map(s=>s.title+" "+s.url).join("；")}</span>`;
   const q=(document.getElementById("labQ").value||"").trim().toUpperCase();
   const age=document.getElementById("labAge").value.toLowerCase(),sp=document.getElementById("labSpecies").value;
   let rows=x.reference_intervals?.values||[];
   rows=rows.filter(r=>(!q||r.analyte.toUpperCase().includes(q))&&(!r.species||r.species===sp)&&(!r.age_group||r.age_group.includes(age)||r.age_group==="all"));
   document.getElementById("labTable").innerHTML=rows.length?`<table><thead><tr><th>项目</th><th>单位</th><th>下限</th><th>上限</th><th>备注</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${r.analyte}</td><td>${r.unit}</td><td>${r.low??""}</td><td>${r.high??""}</td><td>${r.note||""}</td></tr>`).join("")}</tbody></table>`:"<div class='muted'>该厂家/型号/物种目前没有可核验的官方参考区间数据。</div>";
 }
 makerSel.onchange=models;modelSel.onchange=render;document.getElementById("labRefresh").onclick=render;document.getElementById("labQ").oninput=render;document.getElementById("labSpecies").onchange=render;document.getElementById("labAge").onchange=render;models();
}
function start(){
 ensureMissingControls();addStyles();
 // Run after the existing inline script so our CPR handlers become authoritative.
 setTimeout(()=>{installCPR();addLabSection()},0);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();