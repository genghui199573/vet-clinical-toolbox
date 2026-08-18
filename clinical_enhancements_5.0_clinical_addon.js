/* Vet Clinical Toolbox 5.0 — clinical addon
   Fixed project version: 5.0
   This file is additive. It does not replace clinical_enhancements_5.0.js or data/*.json.
*/
(function(){
"use strict";
if(window.__VET5_CLINICAL_ADDON__) return;
window.__VET5_CLINICAL_ADDON__=true;

const $=id=>document.getElementById(id);
const n=id=>{const v=parseFloat($(id)?.value);return Number.isFinite(v)?v:null};
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const out=(id,html)=>{const e=$(id);if(e)e.innerHTML=html};
const kg=()=>Number.isFinite(window.patientState?.weight)?window.patientState.weight:n("v5w");
const species=()=>window.patientState?.species||$("patientSpecies")?.value||"犬";
const breed=()=>window.patientState?.breed||$("patientBreed")?.value||"";
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const fmt=x=>Number.isFinite(x)?(Math.round(x*1000)/1000).toString():"—";

window.patientState=Object.assign({
  species:"犬",weight:null,breed:"",age:null,sex:null,pcv:null,temp:null,
  hr:null,rr:null,sbp:null,dbp:null,spo2:null,albumin:null,
  na:null,k:null,cl:null,hco3:null,glucose:null,creatinine:null,sdma:null,
  urineOutput:null,urineHours:null,updatedAt:null
},window.patientState||{});

function readPatient(){
  const p=window.patientState;
  const get=(...ids)=>{for(const id of ids){const e=$(id);if(e?.value!==undefined&&e.value!=="")return e.value}return null};
  p.species=get("caseSpecies","patientSpecies","doseSpecies")||p.species;
  p.breed=get("caseBreed","patientBreed","doseBreed")||p.breed;
  p.weight=parseFloat(get("caseWeight","patientWeight","doseWeight"))||p.weight;
  p.age=get("caseAge")||p.age;p.sex=get("caseSex")||p.sex;
  p.pcv=parseFloat(get("trPcv","asaPcv","pcv"))||p.pcv;
  p.temp=parseFloat(get("asaTemp","gasTemp","patientTemp"))||p.temp;
  p.hr=parseFloat(get("shHr","patientHr"))||p.hr;
  p.sbp=parseFloat(get("shBp","lacBp","patientSbp"))||p.sbp;
  p.spo2=parseFloat(get("asaSpo2","patientSpo2"))||p.spo2;
  p.albumin=parseFloat(get("gasAlb","bioAlb","patientAlbumin"))||p.albumin;
  p.na=parseFloat(get("enaNow","gasNa","bioNa"))||p.na;
  p.k=parseFloat(get("ekNow","bioK"))||p.k;
  p.cl=parseFloat(get("gasCl","bioCl"))||p.cl;
  p.hco3=parseFloat(get("gasHco3"))||p.hco3;
  p.glucose=parseFloat(get("bioGlu"))||p.glucose;
  p.creatinine=parseFloat(get("bioCrea"))||p.creatinine;
  p.sdma=parseFloat(get("bioSdma"))||p.sdma;
  p.updatedAt=new Date().toISOString();
  try{localStorage.setItem("vetPatientState5",JSON.stringify(p))}catch(e){}
  window.dispatchEvent(new CustomEvent("vet:patientState",{detail:{...p}}));
  window.dispatchEvent(new CustomEvent("patientStateUpdated",{detail:{...p}}));
  return p;
}
function syncToInputs(p){
  const set=(id,v)=>{const e=$(id);if(e&&v!==null&&v!==undefined)e.value=v};
  set("patientSpecies",p.species);set("patientBreed",p.breed);set("patientWeight",p.weight);
  set("caseSpecies",p.species);set("caseBreed",p.breed);set("caseWeight",p.weight);set("caseAge",p.age);
  set("doseSpecies",p.species);set("doseBreed",p.breed);set("doseWeight",p.weight);
  set("criW",p.weight);set("anWeight",p.weight);set("ekW",p.weight);set("enaW",p.weight);
  set("fw",p.weight);set("mw",p.weight);set("sw",p.weight);set("nw",p.weight);
  set("trW",p.weight);set("tubeW",p.weight);set("v5w",p.weight);
}
try{const saved=JSON.parse(localStorage.getItem("vetPatientState5")||"null");if(saved)Object.assign(window.patientState,saved)}catch(e){}

function safetyCard(){
 const sp=species(),b=breed().toLowerCase(),flags=[];
 if(sp==="猫"){
   flags.push("猫：对乙酰氨基酚（扑热息痛）禁用；菊酯/拟除虫菊酯暴露应视为高风险。");
   flags.push("猫：恩诺沙星原则上不超过 5 mg/kg/day；超过该上限时阻断并提示视网膜毒性风险。");
 }
 if(/边牧|喜乐蒂|苏牧|澳牧|澳洲牧羊|柯利|collie|sheltie|australian shepherd|border collie/i.test(b)){
   flags.push("疑似 MDR1/ABCB1 高风险品种：使用伊维菌素等大环内酯类前核对品种/基因型及剂量，避免将常规剂量直接套用。");
 }
 return flags.length?`<div class="v5-red"><b>物种/品种安全锁</b>${flags.map(x=>`<div>• ${esc(x)}</div>`).join("")}</div>`:`<div class="v5-ok">当前未触发内置物种/品种红线；仍需按药品标签和可靠文献核对。</div>`;
}

function buildUI(){
 if($("v5Clinical")) return;
 const nav=document.querySelector("#nav"),main=document.querySelector("main");
 if(!nav||!main)return;
 const btn=document.createElement("button");btn.type="button";btn.dataset.v="v5Clinical";btn.textContent="5.0 临床增强";
 nav.appendChild(btn);
 const sec=document.createElement("section");sec.id="v5Clinical";sec.className="view";
 sec.innerHTML=`
 <div class="card"><h2>5.0 临床增强中心</h2>
 <div class="v5-note">本模块保持项目版本 5.0。原有工作台、计算器和 data/*.json 不被替换。高风险计算均为决策支持，必须结合患者监测与产品/指南要求复核。</div>
 <div id="v5Safety"></div></div>
 <div class="grid">
  <div class="card"><h3>全局患者状态</h3>
   <div class="grid">
    <label>体重 kg<input id="v5w" type="number" step=".01"></label>
    <label>物种<select id="v5sp"><option>犬</option><option>猫</option><option>鹦鹉/鸟类</option><option>兔/啮齿类</option><option>爬宠/龟鳖</option><option>其他</option></select></label>
    <label>品种<input id="v5breed"></label><label>年龄<input id="v5age"></label>
    <label>PCV %<input id="v5pcv" type="number" step=".1"></label><label>体温 ℃<input id="v5temp" type="number" step=".1"></label>
    <label>SBP mmHg<input id="v5sbp" type="number"></label><label>HR bpm<input id="v5hr" type="number"></label>
   </div>
   <button class="primary" id="v5sync">广播到全站计算器</button><div id="v5stateOut" class="small"></div>
  </div>
  <div class="card"><h3>CRI 护士配液指令</h3>
   <label>目标剂量 mg/kg/h<input id="v5criDose" type="number" step=".001"></label>
   <label>药物原液 mg/mL<input id="v5criStock" type="number" step=".001"></label>
   <label>最终配液体积 mL<input id="v5criVol" type="number" value="250" step=".1"></label>
   <label>泵速 mL/h<input id="v5criRate" type="number" step=".1"></label>
   <button class="primary" id="v5criCalc">生成指令</button><div id="v5criOut"></div>
  </div>
 </div>
 <div class="grid">
  <div class="card"><h3>休克分次 Bolus</h3>
   <label>体重 kg<input id="v5bolusW" type="number" step=".01"></label>
   <label>物种<select id="v5bolusSp"><option>犬</option><option>猫</option></select></label>
   <label>选择量 mL/kg<input id="v5bolusRate" type="number" step=".1"></label>
   <button class="primary" id="v5bolusCalc">计算单次 Bolus</button><div id="v5bolusOut"></div>
  </div>
  <div class="card"><h3>Na 纠正速度红线</h3>
   <label>起始 Na mEq/L<input id="v5na0" type="number"></label>
   <label>当前 Na mEq/L<input id="v5na1" type="number"></label>
   <label>经过时间 h<input id="v5nah" type="number" step=".1"></label>
   <button class="primary" id="v5naCalc">计算变化率</button><div id="v5naOut"></div>
  </div>
 </div>
 <div class="grid">
  <div class="card"><h3>血气：AG / 低白蛋白校正</h3>
   <label>Na mmol/L<input id="v5agNa" type="number"></label><label>Cl mmol/L<input id="v5agCl" type="number"></label><label>HCO₃ mmol/L<input id="v5agHco3" type="number"></label><label>Albumin g/dL<input id="v5agAlb" type="number" step=".01" value="4"></label>
   <button class="primary" id="v5agCalc">计算</button><div id="v5agOut"></div>
  </div>
  <div class="card"><h3>血气温度校正（估算）</h3>
   <label>患者温度 ℃<input id="v5gasT" type="number" step=".1"></label><label>pH（37℃）<input id="v5gasPh" type="number" step=".001"></label><label>PaCO₂ 37℃ mmHg<input id="v5gasPco2" type="number" step=".1"></label><label>PaO₂ 37℃ mmHg<input id="v5gasPo2" type="number" step=".1"></label>
   <button class="primary" id="v5gasCalc">估算校正值</button><div id="v5gasOut"></div>
   <div class="v5-warn">不同血气分析仪/算法存在差异；仪器原生温度校正优先。本模块仅作估算。</div>
  </div>
 </div>
 <div class="grid">
  <div class="card"><h3>CPR 剂量卡 / 节拍器</h3>
   <label>体重 kg<input id="v5cprW" type="number" step=".01"></label>
   <div id="v5cprDose" class="v5-result"></div>
   <div class="v5-metronome"><b id="v5bpm">100–120 bpm</b><button class="secondary" id="v5metro">启动/停止节拍器</button></div>
   <div id="v5cprTime">02:00</div>
  </div>
  <div class="card"><h3>UOP 每小时尿量</h3>
   <label>尿量 mL<input id="v5urine" type="number" step=".1"></label><label>时间 h<input id="v5urineH" type="number" step=".1"></label><label>体重 kg<input id="v5uopW" type="number" step=".01"></label>
   <button class="primary" id="v5uopCalc">计算 UOP</button><div id="v5uopOut"></div>
  </div>
 </div>
 <div class="grid">
  <div class="card"><h3>VHS / VLAS / ACVIM</h3>
   <label>VHS（椎体单位）<input id="v5vhs" type="number" step=".1"></label><label>VLAS（椎体单位）<input id="v5vlas" type="number" step=".1"></label>
   <label>有无临床心衰史<select id="v5hf"><option>无</option><option>有</option></select></label><label>有无当前/既往肺水肿证据<select id="v5pe"><option>无</option><option>有</option></select></label>
   <button class="primary" id="v5heartCalc">辅助分层</button><div id="v5heartOut"></div>
  </div>
  <div class="card"><h3>IRIS CKD 辅助分期</h3>
   <label>肌酐 mg/dL<input id="v5crea" type="number" step=".01"></label><label>SDMA µg/dL<input id="v5sdma" type="number" step=".1"></label><label>蛋白尿 UPC<input id="v5upc" type="number" step=".01"></label><label>收缩压 mmHg<input id="v5ckdbp" type="number"></label>
   <button class="primary" id="v5ckdCalc">辅助分期</button><div id="v5ckdOut"></div>
  </div>
 </div>
 <div class="grid">
  <div class="card"><h3>积液性质筛查</h3>
   <label>液体蛋白 g/dL<input id="v5efp" type="number" step=".01"></label><label>液体细胞数 /µL<input id="v5efc" type="number"></label><label>液体甘油三酯 mg/dL<input id="v5eftg" type="number"></label><label>血清甘油三酯 mg/dL<input id="v5stg" type="number"></label><label>液体胆红素 mg/dL<input id="v5efbil" type="number"></label><label>血清胆红素 mg/dL<input id="v5sbil" type="number"></label><label>液体肌酐 mg/dL<input id="v5efcrea" type="number"></label><label>血清肌酐 mg/dL<input id="v5screa" type="number"></label>
   <button class="primary" id="v5effCalc">鉴别</button><div id="v5effOut"></div>
  </div>
  <div class="card"><h3>局麻药最大剂量辅助</h3>
   <label>体重 kg<input id="v5laW" type="number" step=".01"></label><label>利多卡因 mg/kg<input id="v5lido" type="number" step=".1" placeholder="按本院/文献方案填写"></label><label>布比卡因 mg/kg<input id="v5bupi" type="number" step=".1" placeholder="按本院/文献方案填写"></label><label>利多卡因实际 mg<input id="v5lidoMg" type="number"></label><label>布比卡因实际 mg<input id="v5bupiMg" type="number"></label>
   <button class="primary" id="v5laCalc">计算</button><div id="v5laOut"></div><div class="v5-warn">最大剂量存在物种、途径、组织部位、联合用药和患者状态差异；本模块不硬编码单一“安全极量”，避免误用。</div>
  </div>
 </div>
 <div class="grid">
  <div class="card"><h3>催吐决策器</h3>
   <label>物种<select id="v5emSp"><option>犬</option><option>猫</option></select></label><label>摄入后时间 h<input id="v5emH" type="number" step=".1"></label><label>毒物<select id="v5emTox"><option>未知/其他</option><option>腐蚀性物质</option><option>烃类/挥发性碳氢化合物</option><option>意识异常/癫痫</option><option>短头颅/高误吸风险</option><option>可考虑催吐的非腐蚀性口服毒物</option></select></label>
   <button class="primary" id="v5emCalc">决策</button><div id="v5emOut"></div>
  </div>
  <div class="card"><h3>ILE 20% 解毒计算</h3>
   <label>体重 kg<input id="v5ileW" type="number" step=".01"></label><label>首剂 bolus mL/kg<input id="v5ileB" type="number" step=".01" placeholder="按毒物/指南填写"></label><label>CRI mL/kg/min<input id="v5ileR" type="number" step=".001" placeholder="按毒物/指南填写"></label><label>持续时间 min<input id="v5ileMin" type="number" value="30"></label>
   <button class="primary" id="v5ileCalc">计算</button><div id="v5ileOut"></div><div class="v5-warn">ILE 不是通用解毒剂；适应证、脂血症风险、胰腺炎/高脂血症风险及具体毒物证据必须核对。</div>
  </div>
 </div>
 <div class="grid">
  <div class="card"><h3>NaHCO₃ 补碱 + KCl 添加</h3>
   <label>体重 kg<input id="v5bicarbW" type="number" step=".01"></label><label>目标补碱剂量 mEq/kg<input id="v5bicarbDose" type="number" step=".01"></label><label>NaHCO₃ 浓度 mEq/mL<input id="v5bicarbConc" type="number" step=".01" placeholder="按实际制剂填写"></label>
   <label>KCl 原液 mEq/mL<input id="v5kConc" type="number" step=".01" placeholder="按实际制剂填写"></label><label>输液体积 mL<input id="v5kVol" type="number"></label><label>计划泵速 mL/h<input id="v5kRate" type="number"></label><label>目标 KCl 添加 mEq<input id="v5kAdd" type="number" step=".01"></label>
   <button class="primary" id="v5alkCalc">计算</button><div id="v5alkOut"></div>
   <div class="v5-warn">KCl 速率硬红线：工具按 ≤0.5 mEq/kg/h 进行数学检查；实际上限还受监护条件和机构协议约束。KCl 必须充分混匀，严禁直接静推。</div>
  </div>
  <div class="card"><h3>DKA 短效胰岛素 CRI / Sliding Window</h3>
   <label>体重 kg<input id="v5dkaW" type="number" step=".01"></label><label>当前血糖 mg/dL<input id="v5dkaG" type="number"></label><label>胰岛素 CRI U/kg/h<input id="v5dkaRate" type="number" step=".01" placeholder="按本院 DKA protocol"></label><label>目标下降 mg/dL/h<input id="v5dkaDrop" type="number" step=".1"></label>
   <button class="primary" id="v5dkaCalc">计算</button><div id="v5dkaOut"></div><div class="v5-warn">DKA 的胰岛素速度、葡萄糖补充和钾管理应按连续监测与本院 protocol 滴定；此处不自动给出固定处方。</div>
  </div>
 </div>
 <div class="grid">
  <div class="card"><h3>BSA / 化疗</h3>
   <label>体重 kg<input id="v5bsaW" type="number" step=".01"></label><label>化疗剂量 mg/m²<input id="v5chemoDose" type="number" step=".01"></label><label>药液浓度 mg/mL<input id="v5chemoConc" type="number" step=".01"></label>
   <button class="primary" id="v5bsaCalc">计算</button><div id="v5bsaOut"></div><div class="v5-warn">化疗必须按具体药物、物种、方案、CBC/生化/器官功能和累积剂量核对；本模块不自动判断可否给药。</div>
  </div>
  <div class="card"><h3>ISCAID 感染部位决策</h3>
   <label>感染部位<select id="v5infSite"><option>皮肤/浅表软组织</option><option>泌尿道</option><option>呼吸道</option><option>胃肠道</option><option>骨/关节</option><option>胆道/腹腔</option><option>子宫/生殖道</option><option>未知</option></select></label><label>严重程度<select id="v5infSev"><option>稳定/轻症</option><option>中度</option><option>重症/脓毒症疑虑</option></select></label>
   <button class="primary" id="v5infCalc">生成抗菌药决策框架</button><div id="v5infOut"></div>
  </div>
 </div>
 <div class="grid">
  <div class="card"><h3>A4 住院单 / 输液泵卡</h3>
   <label>患者名<input id="v5printName"></label><label>主要诊断<input id="v5printDx"></label><label>医嘱/输液方案<textarea id="v5printPlan"></textarea></label>
   <button class="primary" id="v5print">生成 A4 打印</button>
  </div>
 </div>
 </section>`;
 main.appendChild(sec);
 const activate=window.activateView||((id)=>{document.querySelectorAll(".view").forEach(x=>x.classList.remove("active"));$(id)?.classList.add("active");document.querySelectorAll("#nav button").forEach(b=>b.classList.toggle("active",b.dataset.v===id));});
 btn.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();activate("v5Clinical")});
 sec.querySelectorAll("input,select").forEach(e=>e.addEventListener("input",()=>{if(e.id==="v5w"){$("v5cprW").value=e.value;$("v5uopW").value=e.value;$("v5laW").value=e.value}}));
}

function patientUI(){
 const p=readPatient();
 const set=(id,v)=>{if($(id)&&v!=null)$(id).value=v};
 set("v5w",p.weight);set("v5sp",p.species);set("v5breed",p.breed);set("v5age",p.age);set("v5pcv",p.pcv);set("v5temp",p.temp);set("v5sbp",p.sbp);set("v5hr",p.hr);
 ["v5cprW","v5uopW","v5laW","v5bicarbW","v5dkaW","v5bsaW","v5bolusW"].forEach(id=>set(id,p.weight));
 $("v5Safety").innerHTML=safetyCard();
 $("v5stateOut").textContent=`已广播：${p.species||"—"} · ${p.weight||"—"} kg · ${p.breed||"—"} · ${p.updatedAt||""}`;
}

function bind(){
 const on=(id,fn)=>$(id)?.addEventListener("click",fn);
 on("v5sync",()=>{const p=readPatient();patientUI();syncToInputs(p);});
 on("v5criCalc",()=>{
   const W=n("v5w")||kg(),d=n("v5criDose"),c=n("v5criStock"),V=n("v5criVol")||250,r=n("v5criRate");
   if(!(W>0&&d>0&&c>0&&V>0&&r>0))return out("v5criOut",`<div class="v5-bad">请完整输入体重、目标剂量、原液浓度、最终体积和泵速。</div>`);
   const need=W*d, conc=need/r, drugVol=conc*V/c;
   out("v5criOut",`<div class="v5-result"><b>护士配液指令</b><br>在 <b>${fmt(V)} mL</b> 输液液中加入 <b>${fmt(drugVol)} mL</b> 药物原液，最终配液体积按实际操作校准，输液泵设为 <b>${fmt(r)} mL/h</b>。<br><span class="small">反算：${fmt(need)} mg/h；最终浓度 ${fmt(conc)} mg/mL。</span></div>`);
 });
 on("v5bolusCalc",()=>{
   const W=n("v5bolusW")||kg(),sp=$("v5bolusSp")?.value||species(),rate=n("v5bolusRate")||(sp==="猫"?12.5:15);
   if(!(W>0&&rate>0))return out("v5bolusOut",`<div class="v5-bad">请输入体重和 mL/kg。</div>`);
   const vol=W*rate;
   out("v5bolusOut",`<div class="v5-result"><b>单次分次 Bolus：${fmt(vol)} mL</b><br>${sp==="猫"?"猫常用 10–15 mL/kg":"犬常用 10–20 mL/kg"}，约 15–20 min 给完后必须复评。<div class="v5-red">强制复评：肺音、呼吸功/SpO₂、CRT、心率、血压、脉搏质量及乳酸/灌注趋势。出现容量超负荷迹象应立即停止继续推注并重新评估。</div></div>`);
 });
 on("v5naCalc",()=>{
   const a=n("v5na0"),b=n("v5na1"),h=n("v5nah");if(!(Number.isFinite(a)&&Number.isFinite(b)&&h>0))return out("v5naOut",`<div class="v5-bad">请输入完整数据。</div>`);
   const rate=(b-a)/h,abs=Math.abs(rate),dir=rate>0?"升高":"降低",risk=abs>0.5?`<div class="v5-red">超过 0.5 mEq/L/h：触发安全红线。${rate>0?"快速升高需警惕渗透性脱髓鞘风险。":"快速降低需警惕脑水肿风险。"}</div>`:`<div class="v5-ok">当前变化率未超过 0.5 mEq/L/h；仍需按急/慢性和病因复查。</div>`;
   out("v5naOut",`变化率：<b>${fmt(rate)} mEq/L/h</b>（${dir}）${risk}`);
 });
 on("v5agCalc",()=>{
   const na=n("v5agNa"),cl=n("v5agCl"),h=n("v5agHco3"),alb=n("v5agAlb");if([na,cl,h,alb].some(x=>!Number.isFinite(x)))return out("v5agOut",`<div class="v5-bad">请输入 Na、Cl、HCO₃ 和 Albumin。</div>`);
   const ag=na-cl-h, cag=ag+2.5*(4-alb);
   out("v5agOut",`实测 AG = <b>${fmt(ag)} mmol/L</b><br>低白蛋白校正 AG = <b>${fmt(cag)} mmol/L</b><div class="small">公式：校正 AG = 实测 AG + 2.5 × (4.0 − Albumin g/dL)。</div>`);
 });
 on("v5gasCalc",()=>{
   const T=n("v5gasT"),ph=n("v5gasPh"),co=n("v5gasPco2"),po=n("v5gasPo2");if([T,ph,co,po].some(x=>!Number.isFinite(x)))return out("v5gasOut",`<div class="v5-bad">请输入完整数据。</div>`);
   const d=T-37;
   // Approximate alpha-stat style estimates; analyzer-specific correction should supersede.
   const pH=ph-0.015*d, pco2=co*(1+0.04*d/10), po2=po*(1+0.02*d/10);
   out("v5gasOut",`估算校正：pH <b>${fmt(pH)}</b>；PaCO₂ <b>${fmt(pco2)} mmHg</b>；PaO₂ <b>${fmt(po2)} mmHg</b>。<div class="small">仅估算，不替代分析仪原生温度校正。</div>`);
 });
 on("v5cprW",()=>{});
 function cprDose(){const W=n("v5cprW")||kg();if(!(W>0))return out("v5cprDose",`<div class="v5-warn">输入体重后显示剂量。</div>`);out("v5cprDose",`肾上腺素低剂量 0.01 mg/kg：<b>${fmt(W*.01)} mg</b><br>肾上腺素高剂量 0.1 mg/kg：<b>${fmt(W*.1)} mg</b><br>阿托品 0.04 mg/kg：<b>${fmt(W*.04)} mg</b><div class="small">mL 需结合实际制剂浓度；工具不假定安瓿浓度。</div>`)}
 $("v5cprW")?.addEventListener("input",cprDose);cprDose();
 let metro=null,audio=null,osc=null;
 on("v5metro",()=>{
   if(metro){clearInterval(metro);metro=null;osc?.stop();osc=null;audio?.close();audio=null;$("v5bpm").textContent="100–120 bpm";return}
   audio=new (window.AudioContext||window.webkitAudioContext)();let flip=0;
   const tick=()=>{if(!audio)return;osc=audio.createOscillator();const g=audio.createGain();osc.frequency.value=flip++%2?880:660;g.gain.value=.04;osc.connect(g);g.connect(audio.destination);osc.start();osc.stop(audio.currentTime+.035)};
   tick();metro=setInterval(tick,60000/110);$("v5bpm").textContent="节拍器运行：110 bpm";
 });
 let timer=120,timerId=null;
 function renderTimer(){const m=Math.floor(timer/60),s=timer%60;$("v5cprTime").textContent=`${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`}
 const cprStart=()=>{if(timerId)return;timerId=setInterval(()=>{timer=Math.max(0,timer-1);renderTimer();if(timer===0){clearInterval(timerId);timerId=null}},1000)};
 on("v5cprW",cprDose);on("v5metro",()=>{});on("v5cprStart",cprStart);
 on("v5uopCalc",()=>{const u=n("v5urine"),h=n("v5urineH"),W=n("v5uopW")||kg();if(!(u>=0&&h>0&&W>0))return out("v5uopOut",`<div class="v5-bad">请输入尿量、时间和体重。</div>`);const r=u/h/W;out("v5uopOut",`UOP = <b>${fmt(r)} mL/kg/h</b>${r<1?`<div class="v5-warn">低于 1 mL/kg/h：建议结合容量状态、肾灌注、尿路通畅性和连续趋势评估；不能仅凭单次值诊断 AKI。</div>`:""}`)});
 on("v5heartCalc",()=>{const v=n("v5vhs"),l=n("v5vlas"),hf=$("v5hf")?.value,pe=$("v5pe")?.value;let text=[];if(v!=null)text.push(`VHS ${fmt(v)} TV`);if(l!=null)text.push(`VLAS ${fmt(l)} TV`);let stage="需结合影像、心脏超声和临床史";if(hf==="有"&&pe==="有")stage="更符合 ACVIM C/D 范畴的临床心衰背景；需区分 C 与 D 并由治疗反应/难治性判断";else if(hf==="有")stage="至少进入有临床事件/心衰史的进一步评估路径";else if((v!=null&&v>10.5)||(l!=null&&l>2.5))stage="影像提示心脏增大风险升高；不能仅凭 VHS/VLAS 单独确定 B2";else stage="不能仅凭当前数据确定分期";out("v5heartOut",`${text.join("；")}<br><b>${stage}</b><div class="small">VHS/VLAS 阈值受品种、体位、个体和测量方法影响；ACVIM 分期需要完整病史、影像/超声和是否有心衰临床表现。</div>`)});
 on("v5ckdCalc",()=>{const c=n("v5crea"),s=n("v5sdma"),u=n("v5upc"),bp=n("v5ckdbp");let stage="需进一步确认";if(c!=null){if(c<1.4)stage="肌酐：IRIS Stage 1 范围/非氮质血症；不能单凭肌酐确诊 CKD";else if(c<2.8)stage="肌酐：IRIS Stage 2 范围";else if(c<5)stage="肌酐：IRIS Stage 3 范围";else stage="肌酐：IRIS Stage 4 范围"}const sub=[];if(u!=null)sub.push(u<0.2?"UPC 非蛋白尿范围":"UPC ≥0.2：蛋白尿需结合持续性确认");if(bp!=null)sub.push(bp<140?"血压：正常风险区":"血压升高：需要重复测量并按 IRIS 亚分期");if(s!=null)sub.push(`SDMA ${fmt(s)} µg/dL：需结合持续趋势与实验室方法`);out("v5ckdOut",`<b>${stage}</b><br>${sub.join("<br>")}<div class="small">IRIS 分期应使用稳定、充分水合状态下重复测量，并结合 SDMA、UPC 和血压进行亚分期。</div>`)});
 on("v5effCalc",()=>{const p=n("v5efp"),c=n("v5efc"),lt=n("v5eftg"),st=n("v5stg"),lb=n("v5efbil"),sb=n("v5sbil"),lc=n("v5efcrea"),sc=n("v5screa");const r=[];if(lt!=null&&st!=null&&lt>st)r.push("乳糜胸高度可疑（液体 TG > 血清 TG）；需结合外观/细胞学。");if(lb!=null&&sb!=null&&lb>sb)r.push("胆汁性腹膜炎高度可疑（液体胆红素 > 血清）；建议结合细胞学/影像。");if(lc!=null&&sc!=null&&lc>sc)r.push("尿腹高度可疑（液体肌酐 > 血清）；结合腹腔液电解质和影像。");if(p!=null&&c!=null)r.push(`蛋白 ${fmt(p)} g/dL、细胞数 ${fmt(c)}/µL：可作为漏出液/渗出液分类线索，但必须结合血清蛋白、细胞学和病因。`);out("v5effOut",r.length?r.map(x=>`<div class="v5-result">${esc(x)}</div>`).join(""):`<div class="v5-warn">目前数据不足以可靠分类。补充血清/液体蛋白、细胞数、TG、胆红素、肌酐等。</div>`)});
 on("v5laCalc",()=>{const W=n("v5laW")||kg(),lm=n("v5lido"),bm=n("v5bupi"),li=n("v5lidoMg"),bi=n("v5bupiMg");if(!(W>0))return out("v5laOut",`<div class="v5-bad">请输入体重。</div>`);const a=[];if(lm!=null)a.push(`按你输入的利多卡因 ${lm} mg/kg：理论上限量 = ${fmt(W*lm)} mg`);if(bm!=null)a.push(`按你输入的布比卡因 ${bm} mg/kg：理论上限量 = ${fmt(W*bm)} mg`);if(li!=null&&lm!=null&&li>W*lm)a.push(`<span class="v5-red">利多卡因超过你设定的上限。</span>`);if(bi!=null&&bm!=null&&bi>W*bm)a.push(`<span class="v5-red">布比卡因超过你设定的上限。</span>`);out("v5laOut",a.join("<br>")||"请填写本院/文献采用的 mg/kg 上限后计算。")});
 on("v5emCalc",()=>{const sp=$("v5emSp")?.value,h=n("v5emH"),t=$("v5emTox")?.value;let s="";if(/腐蚀|烃类|意识异常|癫痫|短头/i.test(t||""))s="不建议催吐：存在误吸、食管/胃损伤或神经抑制风险，应优先稳定气道和按毒物处理。";else if(h!=null&&h<=2)s="可进入催吐评估，但必须确认患者意识正常、气道保护完整、毒物适合催吐且无禁忌。猫催吐选择尤其有限，应由兽医根据毒物决定。";else s="时间较长或不详：催吐获益下降；重点转向毒物特异性处理、去污和监测。";out("v5emOut",`<div class="v5-result">${esc(s)}</div>`)});
 on("v5ileCalc",()=>{const W=n("v5ileW"),b=n("v5ileB"),r=n("v5ileR"),m=n("v5ileMin");if(!(W>0&&b>0&&r>0&&m>0))return out("v5ileOut",`<div class="v5-bad">请填写体重、bolus、CRI 和时间。</div>`);const bol=W*b,rate=W*r,total=bol+rate*m;out("v5ileOut",`Bolus：<b>${fmt(bol)} mL</b>；CRI：<b>${fmt(rate)} mL/h</b>；按 ${fmt(m)} min 计算总量约 <b>${fmt(total)} mL</b>。<div class="small">实际方案必须按具体毒物/指南核对。</div>`)});
 on("v5alkCalc",()=>{const W=n("v5bicarbW"),d=n("v5bicarbDose"),c=n("v5bicarbConc"),kc=n("v5kConc"),V=n("v5kVol"),R=n("v5kRate"),add=n("v5kAdd");const a=[];if(W>0&&d>0&&c>0)a.push(`NaHCO₃ 总量 ${fmt(W*d)} mEq ≈ ${fmt(W*d/c)} mL（按输入制剂浓度）。`);if(kc>0&&add>=0)a.push(`KCl 加入体积 ${fmt(add/kc)} mL。`);if(kc>0&&add>=0&&V>0&&R>0){const rate=add/(V/R);const perkg=rate/W;a.push(`按整袋以 ${fmt(R)} mL/h 输注，KCl 速率约 ${fmt(perkg)} mEq/kg/h。`);if(perkg>0.5)a.push(`<span class="v5-red">超过 0.5 mEq/kg/h 红线：阻断。</span>`)}out("v5alkOut",a.join("<br>")||`<div class="v5-bad">请至少填写有效的体重/剂量/制剂浓度。</div>`)});
 on("v5dkaCalc",()=>{const W=n("v5dkaW"),g=n("v5dkaG"),r=n("v5dkaRate"),drop=n("v5dkaDrop");if(!(W>0&&g>0&&r>0))return out("v5dkaOut",`<div class="v5-bad">请填写体重、血糖和本院 protocol 的胰岛素速率。</div>`);out("v5dkaOut",`胰岛素：<b>${fmt(W*r)} U/h</b>（按 ${fmt(r)} U/kg/h）。当前血糖 ${fmt(g)} mg/dL。${drop?`目标下降窗：${fmt(drop)} mg/dL/h。`:""}<div class="v5-warn">不要仅按血糖数字调整胰岛素；同时监测 β-羟丁酸/酮体、K、P、pH、灌注和临床状态。</div>`)});
 on("v5bsaCalc",()=>{const W=n("v5bsaW"),d=n("v5chemoDose"),c=n("v5chemoConc");if(!(W>0))return out("v5bsaOut",`<div class="v5-bad">请输入体重。</div>`);const bsa=0.101*W**(2/3);out("v5bsaOut",`BSA ≈ <b>${fmt(bsa)} m²</b>${d>0?`；化疗剂量 ${fmt(d)} mg/m² → <b>${fmt(bsa*d)} mg</b>${c>0?` ≈ ${fmt(bsa*d/c)} mL`:""}`:""}<div class="small">BSA 公式适用于犬猫常用估算；化疗方案必须独立核对。</div>`)});
 on("v5infCalc",()=>{const s=$("v5infSite")?.value,sev=$("v5infSev")?.value;const culture=/骨|关节|胆道|腹腔|子宫|生殖|重症/.test(s+" "+sev);out("v5infOut",`<div class="v5-result"><b>${esc(s)}</b>：先判断是否真正存在细菌感染，再采样培养/药敏（可行时），选择尽可能窄谱、与感染部位和药代动力学匹配的方案。</div><div class="v5-warn">${culture?"该部位/严重程度更应优先考虑培养、药敏和感染源控制。":"轻症稳定病例应避免仅凭经验扩大抗菌谱；明确感染部位后按 ISCAID 原则选择一线方案。"}<br>避免把抗生素用于明显非细菌性疾病；疗程和停药点应基于临床反应、培养和指南。</div>`)});
 on("v5print",()=>{const name=$("v5printName")?.value||"患者",dx=$("v5printDx")?.value||"",plan=$("v5printPlan")?.value||"",p=window.patientState;const w=window.open("","_blank");if(!w)return;w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>住院单-${esc(name)}</title><style>@page{size:A4;margin:14mm}body{font-family:Arial,\"Microsoft YaHei\",sans-serif;font-size:13px}h1{font-size:20px}table{width:100%;border-collapse:collapse}td,th{border:1px solid #333;padding:7px;text-align:left}.box{min-height:100px;border:1px solid #333;padding:8px;white-space:pre-wrap}.sig{margin-top:35px;display:flex;justify-content:space-between}</style></head><body><h1>兽医临床工具箱 5.0 · 住院/输液泵卡</h1><table><tr><th>患者</th><td>${esc(name)}</td><th>物种</th><td>${esc(p.species)}</td></tr><tr><th>体重</th><td>${esc(p.weight)} kg</td><th>品种</th><td>${esc(p.breed)}</td></tr><tr><th>诊断</th><td colspan="3">${esc(dx)}</td></tr></table><h3>医嘱/输液方案</h3><div class="box">${esc(plan)}</div><div class="sig"><span>执行人：__________</span><span>复核：__________</span><span>时间：__________</span></div><script>setTimeout(()=>print(),300)</script></body></html>`);w.document.close()});
}
function injectStyle(){
 if($("v5ClinicalStyle"))return;
 const s=document.createElement("style");s.id="v5ClinicalStyle";s.textContent=`
.v5-result{background:#effaf7;border:1px solid #a5d8ce;border-radius:10px;padding:10px;margin-top:8px}
.v5-warn{background:#fffbeb;border:1px solid #f6d58a;color:#7a4b00;border-radius:10px;padding:9px;margin-top:8px}
.v5-bad,.v5-red{background:#fff1f2;border:1px solid #fecaca;color:#991b1b;border-radius:10px;padding:9px;margin-top:8px}
.v5-ok{background:#f0fdf4;border:1px solid #bbf7d0;color:#166534;border-radius:10px;padding:9px}
.v5-note{background:#eff6ff;border:1px solid #bfdbfe;color:#1e3a8a;border-radius:10px;padding:9px}
.v5-metronome{display:flex;gap:8px;align-items:center;margin-top:8px}.v5-metronome b{flex:1}
#v5cprTime{font:700 34px ui-monospace,monospace;margin:10px 0}
`;
 document.head.appendChild(s);
}
function start(){
 buildUI();injectStyle();bind();patientUI();
 const p=window.patientState;
 window.addEventListener("vet:patientState",e=>{Object.assign(window.patientState,e.detail||{});patientUI()});
 ["patientSpecies","patientBreed","patientWeight","caseSpecies","caseBreed","caseWeight","caseAge","doseSpecies","doseBreed","doseWeight"].forEach(id=>$(id)?.addEventListener("change",()=>{readPatient();patientUI()}));
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
})();
