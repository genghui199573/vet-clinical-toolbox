/* Vet Clinical Toolbox 5.0 — Clinical Safety & Decision Add-on
 * Fixed product version 5.0; internal build 5.0-r08.
 * Requires clinical_rules_engine_5.0.js and preserves the existing core UI.
 */
(function(){
'use strict';
if(window.__VET5_CLINICAL_ADDON_R08__) return;
window.__VET5_CLINICAL_ADDON_R08__=true;
const $=id=>document.getElementById(id);
const n=id=>{const v=Number.parseFloat($(id)?.value);return Number.isFinite(v)?v:null};
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const fmt=x=>Number.isFinite(x)?(Math.round(x*1000)/1000).toString():'—';
const out=(id,html)=>{if($(id))$(id).innerHTML=html};
const E=window.VetClinical5;
if(!E){console.error('Vet Clinical Toolbox 5.0: rules engine missing');return}
const state=()=>E.getState();
const species=()=>state().species||'犬';
const weight=()=>Number.isFinite(state().weight)&&state().weight>0?state().weight:null;
const breed=()=>state().breed||'';
const on=(id,event,fn)=>$(id)?.addEventListener(event,fn);
const btn=(id,fn)=>on(id,'click',fn);
const html=(tag,attrs,content)=>`<${tag} ${Object.entries(attrs||{}).map(([k,v])=>`${k}="${esc(v)}"`).join(' ')}>${content||''}</${tag}>`;

function injectStyle(){
 if($('v5r08Style'))return;
 const s=document.createElement('style');s.id='v5r08Style';s.textContent=`
.v5r08{--b:#0f766e;--soft:#f0fdfa;--warn:#fff7ed;--bad:#fff1f2;--line:#d1d5db}
.v5r08 .v5-card{background:#fff;border:1px solid var(--line);border-radius:12px;padding:14px;margin:12px 0;box-shadow:0 1px 2px rgba(0,0,0,.04)}
.v5r08 .v5-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px}
.v5r08 label{display:flex;flex-direction:column;gap:4px;font-size:13px}
.v5r08 input,.v5r08 select,.v5r08 textarea{box-sizing:border-box;width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:8px;background:#fff}
.v5r08 textarea{min-height:76px;resize:vertical}
.v5r08 .v5-result,.v5r08 .v5-ok,.v5r08 .v5-warn,.v5r08 .v5-bad,.v5r08 .v5-note{border-radius:10px;padding:10px;margin-top:8px}
.v5r08 .v5-result{background:var(--soft);border:1px solid #99d8cd}
.v5r08 .v5-ok{background:#f0fdf4;border:1px solid #bbf7d0;color:#166534}
.v5r08 .v5-warn{background:var(--warn);border:1px solid #fed7aa;color:#9a3412}
.v5r08 .v5-bad{background:var(--bad);border:1px solid #fecaca;color:#991b1b}
.v5r08 .v5-note{background:#eff6ff;border:1px solid #bfdbfe;color:#1e3a8a}
.v5r08 .v5-critical{animation:v5blink .9s linear infinite;border:2px solid #dc2626!important;background:#fee2e2!important;color:#991b1b!important}
@keyframes v5blink{50%{opacity:.42}}
.v5r08 .v5-tabs{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}.v5r08 .v5-tabs button{border:1px solid #cbd5e1;background:#fff;border-radius:8px;padding:7px 10px;cursor:pointer}.v5r08 .v5-tabs button.active{background:var(--b);color:#fff}
.v5r08 .v5-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.v5r08 .v5-mono{font:700 34px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:1px}
.v5r08 table{width:100%;border-collapse:collapse}.v5r08 th,.v5r08 td{border:1px solid #d1d5db;padding:7px;text-align:left;vertical-align:top}
.v5r08 .small{font-size:12px;color:#64748b}.v5r08 .source{font-size:11px;color:#64748b;margin-top:6px}
.v5r08 .v5-safety-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px}.v5r08 .v5-chip{padding:8px;border-radius:999px;background:#f1f5f9;font-size:12px}
@media print{.no-print{display:none!important}.v5-print-area{display:block!important}@page{size:A4;margin:12mm}}
`;
 document.head.appendChild(s);
}

function makeSection(){
 if($('v5ClinicalR08'))return $('v5ClinicalR08');
 const nav=$('#nav'),main=document.querySelector('main'); if(!nav||!main)return null;
 const b=document.createElement('button');b.type='button';b.dataset.v='v5ClinicalR08';b.textContent='5.0 临床安全中心';nav.appendChild(b);
 const s=document.createElement('section');s.id='v5ClinicalR08';s.className='view v5r08';
 s.innerHTML=`
 <div class="v5-card"><h2>Vet Clinical Toolbox 5.0 · 临床安全与决策中心</h2>
  <div id="v5r08Safety"></div>
  <div class="v5-note">固定产品版本 5.0 · 内部构建 5.0-r08。此中心只做计算、验证、红线提示和决策框架；药品标签、实验室报告及当前专业指南优先。高风险处方必须由执业兽医独立复核。</div>
 </div>
 <div class="v5-card"><h3>① 全局患者状态中心</h3>
  <div class="v5-grid">
   <label>物种<select id="r08Species"><option>犬</option><option>猫</option><option>鹦鹉/鸟类</option><option>兔/啮齿类</option><option>爬宠/龟鳖</option><option>其他</option></select></label>
   <label>品种<input id="r08Breed"></label><label>体重 kg<input id="r08Weight" type="number" step=".01"></label><label>年龄<input id="r08Age"></label>
   <label>PCV %<input id="r08PCV" type="number" step=".1"></label><label>体温 ℃<input id="r08Temp" type="number" step=".1"></label>
   <label>HR bpm<input id="r08HR" type="number"></label><label>SBP mmHg<input id="r08SBP" type="number"></label>
   <label>Na mmol/L<input id="r08Na" type="number" step=".1"></label><label>K mmol/L<input id="r08K" type="number" step=".01"></label>
   <label>Albumin g/dL<input id="r08Alb" type="number" step=".01"></label><label>肌酐 mg/dL<input id="r08Crea" type="number" step=".01"></label>
  </div><div class="v5-actions"><button class="primary" id="r08Sync">同步并广播</button><button class="secondary" id="r08Reset">恢复已保存状态</button></div><div id="r08State" class="small"></div>
 </div>
 <div class="v5-card"><h3>② CRI / 单位 / 护士配液指令</h3>
  <div class="v5-grid"><label>目标剂量 mg/kg/h<input id="r08CriDose" type="number" step=".001"></label><label>原液浓度 mg/mL<input id="r08CriStock" type="number" step=".001"></label><label>最终体积 mL<input id="r08CriVol" type="number" value="250" step=".1"></label><label>泵速 mL/h<input id="r08CriRate" type="number" step=".1"></label></div>
  <button class="primary" id="r08CriCalc">生成护士配液指令</button><div id="r08CriOut"></div>
  <hr><h4>常用单位换算</h4><div class="v5-grid"><label>数值<input id="r08UnitValue" type="number" step=".001"></label><label>分子量 g/mol<input id="r08MW" type="number" step=".001" placeholder="例如 glucose 180.16"></label><label>从<select id="r08UnitFrom"><option>mmol/L</option><option>mg/dL</option><option>µmol/L</option><option>mg/L</option></select></label><label>到<select id="r08UnitTo"><option>mg/dL</option><option>mmol/L</option><option>mg/L</option><option>µmol/L</option></select></label></div><button class="secondary" id="r08UnitCalc">换算</button><div id="r08UnitOut"></div>
 </div>
 <div class="v5-card"><h3>③ 急诊红线：休克 / Na / KCl / CPR</h3>
  <div class="v5-grid">
   <div><h4>休克分次 Bolus</h4><label>物种<select id="r08BolusSp"><option>犬</option><option>猫</option></select></label><label>体重 kg<input id="r08BolusW" type="number" step=".01"></label><label>选择 mL/kg<input id="r08BolusRate" type="number" step=".1"></label><button class="primary" id="r08BolusCalc">计算</button><div id="r08BolusOut"></div></div>
   <div><h4>Na 变化率</h4><label>起始 Na<input id="r08Na0" type="number" step=".1"></label><label>当前 Na<input id="r08Na1" type="number" step=".1"></label><label>经过 h<input id="r08NaH" type="number" step=".1"></label><button class="primary" id="r08NaCalc">计算</button><div id="r08NaOut"></div></div>
   <div><h4>NaHCO₃ 补碱 + KCl 添加/速度</h4><label>补碱体重 kg<input id="r08BicarbW" type="number" step=".01"></label><label>目标补碱 mEq/kg<input id="r08BicarbDose" type="number" step=".01"></label><label>NaHCO₃ 浓度 mEq/mL<input id="r08BicarbConc" type="number" step=".01" placeholder="按实际制剂填写"></label><button class="secondary" id="r08BicarbCalc">计算 NaHCO₃</button><div id="r08BicarbOut"></div><hr><label>体重 kg<input id="r08KW" type="number" step=".01"></label><label>KCl 原液 mEq/mL<input id="r08KConc" type="number" step=".01"></label><label>添加 mEq<input id="r08KAdd" type="number" step=".01"></label><label>液体体积 mL<input id="r08KVol" type="number"></label><label>泵速 mL/h<input id="r08KRate" type="number"></label><button class="primary" id="r08KCalc">计算</button><div id="r08KOut"></div></div>
  </div>
  <div class="v5-card"><h4>CPR 剂量卡（RECOVER 2024）</h4><div class="v5-grid"><label>体重 kg<input id="r08CPRW" type="number" step=".01"></label><label>肾上腺素低剂量浓度 mg/mL<input id="r08EpiConc" type="number" step=".001" placeholder="按现场制剂填写"></label><label>阿托品浓度 mg/mL<input id="r08AtroConc" type="number" step=".001"></label><label>节拍 bpm<select id="r08Bpm"><option>100</option><option selected>110</option><option>120</option></select></label></div><div id="r08CPRDose"></div><div class="v5-actions"><button class="primary" id="r08Metro">启动/停止节拍器</button><button class="secondary" id="r08CPRStart">开始 2 分钟周期</button><button class="secondary" id="r08CPRStop">停止</button><button class="secondary" id="r08CPRReset">重置</button></div><div id="r08CPRTime" class="v5-mono">02:00</div><div id="r08CPRMsg" class="small"></div></div>
 </div>
 <div class="v5-card"><h3>④ 血气 / 生化</h3>
  <div class="v5-grid"><label>Na mmol/L<input id="r08AGNa" type="number"></label><label>Cl mmol/L<input id="r08AGCl" type="number"></label><label>HCO₃ mmol/L<input id="r08AGH" type="number"></label><label>Albumin g/dL<input id="r08AGAlb" type="number" step=".01" value="4"></label></div><button class="primary" id="r08AGCalc">AG + 低白蛋白校正</button><div id="r08AGOut"></div>
  <hr><div class="v5-grid"><label>实际体温 ℃<input id="r08GasT" type="number" step=".1"></label><label>pH @37℃<input id="r08GasPh" type="number" step=".001"></label><label>PaCO₂ @37℃ mmHg<input id="r08GasCO2" type="number" step=".1"></label><label>PaO₂ @37℃ mmHg<input id="r08GasO2" type="number" step=".1"></label></div><button class="primary" id="r08GasCalc">温度校正估算</button><div id="r08GasOut"></div>
 </div>
 <div class="v5-card"><h3>⑤ 心脏 / 肾脏</h3>
  <div class="v5-grid"><div><h4>VHS / VLAS / ACVIM MMVD</h4><label>VHS<input id="r08VHS" type="number" step=".1"></label><label>VLAS<input id="r08VLAS" type="number" step=".1"></label><label>LA:Ao<input id="r08LAAo" type="number" step=".01"></label><label>LVIDDN<input id="r08LVIDDN" type="number" step=".01"></label><label>MMVD/风险状态<select id="r08CardioStatus"><option>未确诊 MMVD / 仅风险</option><option>已确诊 MMVD、无心衰</option><option>已确诊 MMVD、既往/当前心衰</option></select></label><label>临床心衰史<select id="r08CHF"><option>无</option><option>有</option></select></label><label>标准治疗下仍难以控制<select id="r08Refractory"><option>否</option><option>是</option></select></label><button class="primary" id="r08HeartCalc">辅助分期</button><div id="r08HeartOut"></div></div>
   <div><h4>IRIS CKD 分期/亚分期</h4><label>物种<select id="r08CKDSp"><option>犬</option><option>猫</option></select></label><label>肌酐 mg/dL<input id="r08CKDCrea" type="number" step=".01"></label><label>SDMA µg/dL<input id="r08CKDSDMA" type="number" step=".1"></label><label>UPC<input id="r08CKDUPC" type="number" step=".01"></label><label>SBP mmHg<input id="r08CKDBP" type="number"></label><label>靶器官损伤<select id="r08TOD"><option>无/未知</option><option>有</option></select></label><button class="primary" id="r08CKDCalc">分期</button><div id="r08CKDOut"></div></div>
  </div>
 </div>
 <div class="v5-card"><h3>⑥ 积液性质鉴别</h3>
  <div class="v5-grid"><label>液体蛋白 g/dL<input id="r08EfP" type="number" step=".01"></label><label>液体有核细胞/µL<input id="r08EfC" type="number"></label><label>液体 TG mg/dL<input id="r08EfTG" type="number"></label><label>血清 TG mg/dL<input id="r08SerTG" type="number"></label><label>液体胆红素 mg/dL<input id="r08EfBil" type="number"></label><label>血清胆红素 mg/dL<input id="r08SerBil" type="number"></label><label>液体肌酐 mg/dL<input id="r08EfCrea" type="number"></label><label>血清肌酐 mg/dL<input id="r08SerCrea" type="number"></label><label>血清蛋白 g/dL<input id="r08SerP" type="number" step=".01"></label></div><button class="primary" id="r08EffCalc">判读</button><div id="r08EffOut"></div>
 </div>
 <div class="v5-card"><h3>⑦ 局麻 / 中毒 / ILE</h3>
  <div class="v5-grid"><div><h4>局麻 LADD</h4><label>体重 kg<input id="r08LAw" type="number" step=".01"></label><label>利多卡因目标上限 mg/kg<input id="r08LidoMax" type="number" step=".1"></label><label>布比卡因目标上限 mg/kg<input id="r08BupiMax" type="number" step=".1"></label><label>利多卡因实际 mg<input id="r08LidoActual" type="number" step=".1"></label><label>布比卡因实际 mg<input id="r08BupiActual" type="number" step=".1"></label><button class="primary" id="r08LACalc">计算</button><div id="r08LAOut"></div><div class="small">本工具不硬编码一个跨物种/途径通用的“最大安全剂量”；上限必须来自你的本院 protocol/产品标签/可靠文献。</div></div>
   <div><h4>催吐决策器</h4><label>物种<select id="r08EmSp"><option>犬</option><option>猫</option></select></label><label>摄入后 h<input id="r08EmH" type="number" step=".1"></label><label>毒物类型<select id="r08EmTox"><option>非腐蚀性、非烃类、患者清醒</option><option>腐蚀性物质</option><option>烃类/挥发性碳氢化合物</option><option>意识障碍/癫痫/无法保护气道</option><option>短头颅/高误吸风险</option><option>未知</option></select></label><button class="primary" id="r08EmCalc">决策</button><div id="r08EmOut"></div></div>
   <div><h4>ILE 20%</h4><label>体重 kg<input id="r08ILEW" type="number" step=".01"></label><label>Bolus mL/kg<input id="r08ILEB" type="number" step=".01"></label><label>CRI mL/kg/min<input id="r08ILER" type="number" step=".001"></label><label>持续 min<input id="r08ILEMin" type="number" value="30"></label><button class="primary" id="r08ILECalc">计算</button><div id="r08ILEOut"></div><div class="small">ILE 不是通用解毒剂；适应证和具体毒物证据必须核对。</div></div>
  </div>
 </div>
 <div class="v5-card"><h3>⑧ DKA / BSA / 化疗</h3>
  <div class="v5-grid"><div><h4>DKA 短效胰岛素 CRI</h4><label>体重 kg<input id="r08DKAW" type="number" step=".01"></label><label>当前血糖 mg/dL<input id="r08DKAG" type="number"></label><label>本院 protocol 胰岛素 U/kg/h<input id="r08DKAR" type="number" step=".01"></label><label>目标血糖下降 mg/dL/h<input id="r08DKADrop" type="number" step=".1"></label><button class="primary" id="r08DKACalc">计算</button><div id="r08DKAOut"></div></div>
   <div><h4>BSA / 化疗</h4><label>体重 kg<input id="r08BSAW" type="number" step=".01"></label><label>剂量 mg/m²<input id="r08ChemoDose" type="number" step=".01"></label><label>药液浓度 mg/mL<input id="r08ChemoConc" type="number" step=".01"></label><button class="primary" id="r08BSACalc">计算</button><div id="r08BSAOut"></div></div></div>
 </div>
 <div class="v5-card"><h3>⑨ UOP / ISCAID / A4 文书</h3>
  <div class="v5-grid"><div><h4>每小时尿量</h4><label>尿量 mL<input id="r08UopVol" type="number" step=".1"></label><label>时间 h<input id="r08UopH" type="number" step=".1"></label><label>体重 kg<input id="r08UopW" type="number" step=".01"></label><button class="primary" id="r08UopCalc">计算</button><div id="r08UopOut"></div></div>
   <div><h4>ISCAID 感染部位决策树</h4><label>感染部位<select id="r08InfSite"><option>皮肤/浅表软组织</option><option>泌尿道</option><option>呼吸道</option><option>胃肠道</option><option>骨/关节</option><option>胆道/腹腔</option><option>子宫/生殖道</option><option>未知</option></select></label><label>严重程度<select id="r08InfSev"><option>稳定/轻症</option><option>中度</option><option>重症/脓毒症疑虑</option></select></label><button class="primary" id="r08InfCalc">生成框架</button><div id="r08InfOut"></div></div>
  </div>
  <hr><h4>A4 住院单 / 输液泵卡</h4><div class="v5-grid"><label>患者名<input id="r08PrintName"></label><label>诊断<input id="r08PrintDx"></label><label>医嘱/输液<textarea id="r08PrintPlan"></textarea></label><label>执行/复核<input id="r08PrintStaff"></label></div><button class="primary" id="r08Print">生成 A4 打印</button>
 </div>
 <div class="v5-card"><h3>⑩ 药物安全审计</h3><div class="v5-grid"><label>药物名称<input id="r08DrugName" placeholder="例如：恩诺沙星 / 对乙酰氨基酚 / 伊维菌素"></label><label>计划剂量 mg/kg/day<input id="r08DrugDose" type="number" step=".01"></label></div><button class="primary" id="r08DrugAudit">执行安全审计</button><div id="r08DrugOut"></div></div>
 <div class="v5-card"><h3>来源与构建信息</h3><div id="r08Refs" class="small"></div></div>`;
 main.appendChild(s);
 b.addEventListener('click',()=>{document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));s.classList.add('active');document.querySelectorAll('#nav button').forEach(x=>x.classList.toggle('active',x===b));history.replaceState(null,'','#v5ClinicalR08')});
 return s;
}

function safetyRender(){
 const p=state(), flags=E.speciesSafety(p); const el=$('v5r08Safety'); if(!el)return;
 el.innerHTML=`<div class="v5-safety-grid"><div class="v5-chip">物种：<b>${esc(p.species||'—')}</b></div><div class="v5-chip">体重：<b>${fmt(p.weight)} kg</b></div><div class="v5-chip">品种：<b>${esc(p.breed||'—')}</b></div><div class="v5-chip">构建：<b>5.0-r08</b></div></div>`+
 (flags.length?`<div class="v5-bad"><b>物种/品种安全锁</b>${flags.map(x=>`<div>• ${esc(x.message)}</div>`).join('')}</div>`:`<div class="v5-ok">当前未触发内置物种/品种红线。</div>`);
 $('r08State').textContent=`已同步：${p.species||'—'} · ${fmt(p.weight)} kg · ${p.breed||'—'} · ${p.updatedAt||'—'}`;
}
function fillState(){
 const p=state(),set=(id,v)=>{if($(id)&&v!==null&&v!==undefined&&v!=='')$(id).value=v};
 [['r08Species',p.species],['r08Breed',p.breed],['r08Weight',p.weight],['r08BicarbW',p.weight],['r08Age',p.age],['r08PCV',p.pcv],['r08Temp',p.temp],['r08HR',p.hr],['r08SBP',p.sbp],['r08Na',p.na],['r08K',p.k],['r08Alb',p.albumin],['r08Crea',p.creatinine],['r08CKDSp',p.species],['r08CKDCrea',p.creatinine],['r08CKDSDMA',p.sdma],['r08CKDUPC',p.upc],['r08CKDBP',p.sbp],['r08BolusSp',p.species],['r08BolusW',p.weight],['r08CPRW',p.weight],['r08KW',p.weight],['r08LAw',p.weight],['r08ILEW',p.weight],['r08DKAW',p.weight],['r08BSAW',p.weight],['r08UopW',p.weight]].forEach(x=>set(x[0],x[1]));
 safetyRender();
}
function syncState(){
 const p=E.setState({species:$('r08Species').value,breed:$('r08Breed').value,weight:n('r08Weight'),age:$('r08Age').value,pcv:n('r08PCV'),temp:n('r08Temp'),hr:n('r08HR'),sbp:n('r08SBP'),na:n('r08Na'),k:n('r08K'),albumin:n('r08Alb'),creatinine:n('r08Crea')},'r08');
 E.syncInputs(p);fillState();
}

function bind(){
 on('r08Sync','click',syncState);on('r08Reset','click',fillState);
 ['r08Species','r08Breed','r08Weight','r08Age','r08PCV','r08Temp','r08HR','r08SBP','r08Na','r08K','r08Alb','r08Crea'].forEach(id=>on(id,'input',()=>{clearTimeout(window.__v5r08Debounce);window.__v5r08Debounce=setTimeout(syncState,250)}));
 window.addEventListener('vet:patientState',()=>{fillState();cprDose();safetyRender()});

 btn('r08CriCalc',()=>{const W=n('r08Weight')||weight(),d=n('r08CriDose'),c=n('r08CriStock'),V=n('r08CriVol'),r=n('r08CriRate');if(!(W>0&&d>0&&c>0&&V>0&&r>0))return out('r08CriOut','<div class="v5-bad">请完整输入体重、目标剂量、原液浓度、最终体积和泵速。</div>');const need=W*d,finalConc=need/r,drugVol=finalConc*V/c;if(drugVol>=V)return out('r08CriOut','<div class="v5-bad">计算得到原液体积 ≥ 最终配液体积，配方无效；请复核浓度、剂量或泵速。</div>');out('r08CriOut',`<div class="v5-result"><b>护士配液指令</b><br>在 <b>${fmt(V)} mL</b> 生理盐水最终配液中加入 <b>${fmt(drugVol)} mL</b> 药物原液，按最终体积校准；输液泵设为 <b>${fmt(r)} mL/h</b>。<br>目标给药速率 ${fmt(need)} mg/h；终浓度 ${fmt(finalConc)} mg/mL。<div class="small">执行前独立复核：药物浓度、配伍/稳定性、管路死腔/吸附、泵设置及双人核对。</div></div>`)});
 btn('r08UnitCalc',()=>{const x=n('r08UnitValue'),mw=n('r08MW'),from=$('r08UnitFrom').value,to=$('r08UnitTo').value;if(!(x!==null&&mw>0))return out('r08UnitOut','<div class="v5-bad">需要数值和分子量。</div>');let mmol;if(from==='mmol/L')mmol=x;else if(from==='mg/dL')mmol=x*10/mw;else if(from==='µmol/L')mmol=x/1000;else if(from==='mg/L')mmol=x/mw;let ans;if(to==='mmol/L')ans=mmol;else if(to==='mg/dL')ans=mmol*mw/10;else if(to==='µmol/L')ans=mmol*1000;else ans=mmol*mw;out('r08UnitOut',`<div class="v5-result"><b>${fmt(ans)} ${esc(to)}</b><div class="small">按分子量 ${fmt(mw)} g/mol 计算。</div></div>`)});
 btn('r08BolusCalc',()=>{const sp=$('r08BolusSp').value,W=n('r08BolusW')||weight(),rate=n('r08BolusRate')||(sp==='猫'?12.5:15);const lim=sp==='猫'?[10,15]:[10,20];if(!(W>0&&rate>=lim[0]&&rate<=lim[1]))return out('r08BolusOut',`<div class="v5-bad">${sp} 的单次 Bolus 选择范围为 ${lim[0]}–${lim[1]} mL/kg；请输入范围内数值。</div>`);out('r08BolusOut',`<div class="v5-result">单次 Bolus：<b>${fmt(W*rate)} mL</b>（${fmt(rate)} mL/kg），建议在约 <b>15–20 min</b>内完成并立即复评。</div><div class="v5-bad"><b>强制安全复评：</b>听诊肺音、呼吸功/SpO₂、CRT、心率、脉搏质量、血压及灌注趋势。若出现肺水肿/容量超负荷迹象，停止继续补液并重新评估容量反应性。</div>`)});
 btn('r08NaCalc',()=>{const a=n('r08Na0'),b=n('r08Na1'),h=n('r08NaH');if(!(a!==null&&b!==null&&h>0))return out('r08NaOut','<div class="v5-bad">请完整输入。</div>');const r=(b-a)/h,el=$('r08NaOut');if(Math.abs(r)>0.5){el.innerHTML=`<div class="v5-bad v5-critical"><b>Na 变化率 ${fmt(r)} mEq/L/h：超过 0.5 红线。</b><br>${r>0?'快速升高：警惕渗透性脱髓鞘风险。':'快速降低：警惕脑水肿风险。'}立即复核纠正方案并提高监测频率。</div>`}else el.innerHTML=`<div class="v5-ok">Na 变化率 ${fmt(r)} mEq/L/h，未超过 0.5 红线；仍需按急/慢性、病因和神经状态制定目标。</div>`});
 btn('r08BicarbCalc',()=>{const W=n('r08BicarbW')||weight(),d=n('r08BicarbDose'),c=n('r08BicarbConc');if(!(W>0&&d>0&&c>0))return out('r08BicarbOut','<div class="v5-bad">请输入体重、目标补碱剂量和实际制剂浓度。</div>');const meq=W*d,vol=meq/c;out('r08BicarbOut',`<div class="v5-result">NaHCO₃ 目标总量：<b>${fmt(meq)} mEq</b>；按 ${fmt(c)} mEq/mL 计算抽取 <b>${fmt(vol)} mL</b>。</div><div class="v5-warn">补碱应由血气/碱剩余、灌注与病因共同决定；避免把计算结果直接等同于应一次性给予的处方量。</div>`)});
 btn('r08KCalc',()=>{const W=n('r08KW')||weight(),c=n('r08KConc'),add=n('r08KAdd'),V=n('r08KVol'),R=n('r08KRate');if(!(W>0&&c>0&&add>=0&&V>0&&R>0))return out('r08KOut','<div class="v5-bad">请完整输入。</div>');const vol=add/c,rateMeqKgH=(add/(V/R))/W;out('r08KOut',`<div class="v5-result">KCl 原液加入：<b>${fmt(vol)} mL</b>；按当前泵速的 KCl 输注速率：<b>${fmt(rateMeqKgH)} mEq/kg/h</b>。</div>${rateMeqKgH>0.5?'<div class="v5-bad v5-critical"><b>超过 0.5 mEq/kg/h：阻断。</b>请重新设计补钾方案并连续监测心电图/血钾。</div>':'<div class="v5-ok">未超过工具设定的 0.5 mEq/kg/h 安全红线；仍需按本院 protocol 与血钾趋势复核。</div>'}`)});

 function cprDose(){const W=n('r08CPRW')||weight();if(!(W>0))return out('r08CPRDose','<div class="v5-warn">输入体重。</div>');const ec=n('r08EpiConc'),ac=n('r08AtroConc');const low=W*.01,at=W*.04;out('r08CPRDose',`<div class="v5-result"><b>肾上腺素当前 RECOVER 低剂量 0.01 mg/kg：</b>${fmt(low)} mg${ec>0?` = <b>${fmt(low/ec)} mL</b>`:''}<br><b>阿托品 0.04 mg/kg：</b>${fmt(at)} mg${ac>0?` = <b>${fmt(at/ac)} mL</b>`:''}<br><span class="small">历史高剂量肾上腺素 0.1 mg/kg 仅作参考，不作为当前自动处方：RECOVER 2024 不再推荐 high-dose epinephrine；阿托品如使用仅给一次。</span></div>`)}
 on('r08CPRW','input',cprDose);on('r08EpiConc','input',cprDose);on('r08AtroConc','input',cprDose);
 let metro=null,audio=null,timer=120,timerId=null;
 function beep(){if(!audio)return;const o=audio.createOscillator(),g=audio.createGain();o.frequency.value=880;g.gain.setValueAtTime(.0001,audio.currentTime);g.gain.exponentialRampToValueAtTime(.05,audio.currentTime+.004);g.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+.045);o.connect(g).connect(audio.destination);o.start();o.stop(audio.currentTime+.05)}
 btn('r08Metro',()=>{if(metro){clearInterval(metro);metro=null;audio?.close();audio=null;$('r08CPRMsg').textContent='节拍器已停止';return}const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return out('r08CPRMsg','<div class="v5-bad">当前浏览器不支持 Web Audio。</div>');audio=new AC();if(audio.state==='suspended')audio.resume();beep();const bpm=Number($('r08Bpm').value);metro=setInterval(beep,60000/bpm);$('r08CPRMsg').textContent=`节拍器：${bpm} bpm；按压质量与换人/通气按 RECOVER 周期执行。`});
 function renderTimer(){$('r08CPRTime').textContent=`${String(Math.floor(timer/60)).padStart(2,'0')}:${String(timer%60).padStart(2,'0')}`}
 btn('r08CPRStart',()=>{if(timerId)return;timerId=setInterval(()=>{timer=Math.max(0,timer-1);renderTimer();if(timer===0){clearInterval(timerId);timerId=null;try{speechSynthesis.cancel();speechSynthesis.speak(new SpeechSynthesisUtterance('两分钟 CPR 周期结束，请进行节律和脉搏评估、复核复苏质量并立即继续下一周期。'))}catch(e){}$('r08CPRMsg').textContent='2 分钟周期结束：节律/脉搏评估、质量复核、立即恢复下一周期。'}},1000)});
 btn('r08CPRStop',()=>{clearInterval(timerId);timerId=null});btn('r08CPRReset',()=>{clearInterval(timerId);timerId=null;timer=120;renderTimer();$('r08CPRMsg').textContent='已重置为 02:00'});

 btn('r08AGCalc',()=>{const na=n('r08AGNa'),cl=n('r08AGCl'),h=n('r08AGH'),alb=n('r08AGAlb');if([na,cl,h,alb].some(x=>x===null))return out('r08AGOut','<div class="v5-bad">请输入 Na、Cl、HCO₃ 和 Albumin。</div>');const ag=na-cl-h,cag=ag+2.5*(4-alb);out('r08AGOut',`<div class="v5-result">实测 AG = <b>${fmt(ag)} mmol/L</b><br>低白蛋白校正 AG = <b>${fmt(cag)} mmol/L</b><br><span class="small">公式：校正 AG = 实测 AG + 2.5 × (4.0 − Albumin g/dL)。</span></div>`)});
 btn('r08GasCalc',()=>{const T=n('r08GasT'),ph=n('r08GasPh'),co=n('r08GasCO2'),po=n('r08GasO2');if([T,ph,co,po].some(x=>x===null))return out('r08GasOut','<div class="v5-bad">请输入完整数据。</div>');const d=T-37,pht=ph-0.0147*d,pco=co*Math.pow(10,0.019*d),po2=po*Math.pow(10,-0.015*d);out('r08GasOut',`<div class="v5-result">估算体温校正：pH <b>${fmt(pht)}</b>；PaCO₂ <b>${fmt(pco)} mmHg</b>；PaO₂ <b>${fmt(po2)} mmHg</b>。</div><div class="v5-warn">这是估算模型；不同血气分析仪和校正策略不同，仪器原生温度校正优先。</div>`)});

 btn('r08HeartCalc',()=>{const v=n('r08VHS'),l=n('r08VLAS'),la=n('r08LAAo'),lv=n('r08LVIDDN'),chf=$('r08CHF').value==='有',ref=$('r08Refractory').value==='是',status=$('r08CardioStatus').value;let stage='A：高风险/易感犬，但尚无确诊心脏病证据（需按品种/家族史/体检定义）。';if(ref&&chf)stage='D：若已符合 MMVD 临床心衰且在标准治疗下仍难治/复发，考虑 ACVIM D。';else if(chf||status==='已确诊 MMVD、既往/当前心衰')stage='C：已出现由 MMVD 导致的临床心衰或有明确既往 CHF 证据。';else if(status==='已确诊 MMVD、无心衰'){const echoB2=la!==null&&lv!==null&&la>=1.6&&lv>=1.7;const radioB2=(v!==null&&v>10.5)||(l!==null&&l>=3);stage=echoB2||radioB2?'B2：存在达到重构标准的可能；优先用超声确认 LA:Ao ≥1.6、LVIDDN ≥1.7，并结合影像/体检。':'B1：已确诊 MMVD、无临床心衰且未达到 B2 重构标准。'}out('r08HeartOut',`<div class="v5-result">${v!==null?`VHS ${fmt(v)}；`:''}${l!==null?`VLAS ${fmt(l)}；`:''}${la!==null?`LA:Ao ${fmt(la)}；`:''}${lv!==null?`LVIDDN ${fmt(lv)}；`:''}<br><b>${stage}</b></div><div class="v5-warn">VHS/VLAS 不能单独定义 ACVIM 分期。2019 ACVIM MMVD 共识的 B2 核心超声标准为 LA:Ao ≥1.6 与 LVIDDN ≥1.7；无超声时 VLAS ≥3 可作为 B2 辅助识别。</div>`)});

 function irisStage(sp,crea,sdma){let cStage=null,sStage=null;if(crea!==null){if(sp==='犬'){if(crea<1.4)cStage=1;else if(crea<2.8)cStage=2;else if(crea<5)cStage=3;else cStage=4}else{if(crea<1.6)cStage=1;else if(crea<2.8)cStage=2;else if(crea<5)cStage=3;else cStage=4}}if(sdma!==null){if(sdma<=14)sStage=null;else if(sdma<=17)sStage=1;else if(sp==='犬'){if(sdma<=35)sStage=2;else if(sdma<=54)sStage=3;else sStage=4}else{if(sdma<=25)sStage=2;else if(sdma<=38)sStage=3;else sStage=4}}return {cStage,sStage,stage:cStage&&sStage?Math.max(cStage,sStage):(cStage||sStage)} }
 btn('r08CKDCalc',()=>{const sp=$('r08CKDSp').value,c=n('r08CKDCrea'),s=n('r08CKDSDMA'),u=n('r08CKDUPC'),bp=n('r08CKDBP'),tod=$('r08TOD').value==='有';if(c===null&&s===null)return out('r08CKDOut','<div class="v5-bad">至少输入肌酐或 SDMA。</div>');const z=irisStage(sp,c,s),subs=[];if(u!==null){if(u<0.2)subs.push('UPC：非蛋白尿范围');else if(u<0.5&&sp==='犬')subs.push('UPC：边缘蛋白尿范围（犬）');else if(u<0.4&&sp==='猫')subs.push('UPC：边缘蛋白尿范围（猫）');else subs.push('UPC：蛋白尿范围，需确认持续性并排除活动性尿沉渣/其他干扰。')}if(bp!==null){if(bp<140)subs.push('SBP <140：低血压/正常风险区，结合测量条件');else if(bp<160)subs.push('SBP 140–159：边界高血压区，重复标准化测量');else if(bp<180)subs.push('SBP 160–179：高血压，需按 IRIS 亚分期与靶器官损伤评估');else subs.push('SBP ≥180：严重高血压，尤其有靶器官损伤时需及时处理。')}out('r08CKDOut',`<div class="v5-result"><b>IRIS Stage ${z.stage||'—'}</b><br>肌酐推定：Stage ${z.cStage??'—'}；SDMA推定：Stage ${z.sStage??'—'}。<br>${subs.join('<br>')}</div><div class="v5-warn">IRIS CKD 分期仅适用于稳定 CKD；需排除脱水、急性肾损伤及肾后原因，并以重复测量确认。若肌酐与 SDMA 持续不一致，IRIS 建议复查并结合肌肉量等因素，必要时采取较高阶段的保守解释。${tod?' 已存在靶器官损伤输入：血压亚分期不能等待长期持续性证据。':''}</div>`)});

 btn('r08EffCalc',()=>{
  const p=n('r08EfP'),c=n('r08EfC'),ft=n('r08EfTG'),st=n('r08SerTG'),fb=n('r08EfBil'),sb=n('r08SerBil'),fc=n('r08EfCrea'),sc=n('r08SerCrea'),sp=n('r08SerP');
  const r=[];
  if(ft!==null&&st!==null&&ft>st)r.push('<b>乳糜胸/乳糜液高度可疑：</b>液体 TG 高于血清 TG；结合外观、细胞学和胸导管相关病因。');
  if(fb!==null&&sb!==null&&fb>sb)r.push('<b>胆汁性腹膜炎高度可疑：</b>液体胆红素高于血清；结合细胞学和影像。');
  if(fc!==null&&sc!==null&&fc>sc)r.push('<b>尿腹高度可疑：</b>液体肌酐高于血清；结合液体 K/creatinine 比值和影像。');
  if(p!==null&&c!==null){
    if(sp!==null&&p<sp*0.5&&c<2500)r.push('偏向漏出液/低细胞性液体，但需结合血清蛋白、静水压/胶体渗透压及病因。');
    else if(c>=2500||p>=3)r.push('偏向渗出液/高细胞性液体，但不能仅凭单一 cut-off 定性。');
    else r.push('蛋白和细胞数处于中间区，建议结合细胞学、比重、血清蛋白和病因。');
  }
  out('r08EffOut',r.length?r.map(x=>`<div class="v5-result">${x}</div>`).join(''):'<div class="v5-warn">数据不足。建议补充液体/血清蛋白、细胞学、TG、胆红素、肌酐及影像信息。</div>');
 });
 btn('r08LACalc',()=>{const W=n('r08LAw')||weight(),lm=n('r08LidoMax'),bm=n('r08BupiMax'),li=n('r08LidoActual'),bi=n('r08BupiActual');if(!(W>0))return out('r08LAOut','<div class="v5-bad">请输入体重。</div>');const r=[];if(lm!==null){const max=W*lm;r.push(`利多卡因按你设定上限：${fmt(max)} mg；实际 ${fmt(li??0)} mg。`);if(li!==null&&li>max)r.push('<span class="v5-bad">超过设定上限。</span>')}if(bm!==null){const max=W*bm;r.push(`布比卡因按你设定上限：${fmt(max)} mg；实际 ${fmt(bi??0)} mg。`);if(bi!==null&&bi>max)r.push('<span class="v5-bad">超过设定上限。</span>')}out('r08LAOut',r.join('<br>')||'<div class="v5-warn">请先输入你采用的、与物种/途径/部位匹配的 mg/kg 上限。</div>')});
 btn('r08EmCalc',()=>{const sp=$('r08EmSp').value,h=n('r08EmH'),t=$('r08EmTox').value;let text;if(/腐蚀|烃类|意识障碍|癫痫|无法保护|短头/i.test(t))text='不建议催吐：误吸、食管/胃损伤或神经抑制风险优先。先稳定气道与循环并按具体毒物处理。';else if(h!==null&&h<=2)text=`可进入催吐评估（${sp}）：必须确认患者清醒、可保护气道、无禁忌、毒物适合催吐；猫的催吐方案选择更受限。`;else text='摄入时间较长或不详：催吐获益通常下降，应转向毒物特异性处理、去污、吸附/排泄增强和监测。';out('r08EmOut',`<div class="v5-result">${esc(text)}</div><div class="v5-warn">催吐不是“越早越一定做”；先确认毒物、剂型、气道保护、临床状态和禁忌。</div>`)});
 btn('r08ILECalc',()=>{const W=n('r08ILEW'),b=n('r08ILEB'),r=n('r08ILER'),m=n('r08ILEMin');if(!(W>0&&b>0&&r>0&&m>0))return out('r08ILEOut','<div class="v5-bad">请完整输入。</div>');const bol=W*b,rate=W*r,total=bol+rate*m;out('r08ILEOut',`<div class="v5-result">Bolus：<b>${fmt(bol)} mL</b>；CRI：<b>${fmt(rate)} mL/h</b>；${fmt(m)} min 总量约 <b>${fmt(total)} mL</b>。</div><div class="v5-warn">ILE 20% 仅在有合理毒物证据/适应证时使用；监测脂血症、胰腺炎风险、氧合/循环及输液负荷。</div>`)});

 btn('r08DKACalc',()=>{const W=n('r08DKAW'),g=n('r08DKAG'),r=n('r08DKAR'),drop=n('r08DKADrop');if(!(W>0&&g>0&&r>0))return out('r08DKAOut','<div class="v5-bad">请填写体重、血糖和本院 DKA protocol 的胰岛素速度。</div>');out('r08DKAOut',`<div class="v5-result">胰岛素泵速：<b>${fmt(W*r)} U/h</b>；当前血糖 ${fmt(g)} mg/dL。${drop!==null?`目标下降窗：${fmt(drop)} mg/dL/h。`:''}</div><div class="v5-warn">DKA 滴定不能只看血糖：同步监测 β-羟丁酸/酮体、K、P、pH/血气、灌注和神经状态；葡萄糖加入及 K 调整必须按动态数据和本院 protocol。</div>`)});
 btn('r08BSACalc',()=>{const W=n('r08BSAW'),d=n('r08ChemoDose'),c=n('r08ChemoConc');if(!(W>0))return out('r08BSAOut','<div class="v5-bad">请输入体重。</div>');const bsa=.101*Math.pow(W,2/3),mg=d>0?bsa*d:null;out('r08BSAOut',`<div class="v5-result">BSA ≈ <b>${fmt(bsa)} m²</b>${mg!==null?`；化疗总量 <b>${fmt(mg)} mg</b>${c>0?`；抽取量 ${fmt(mg/c)} mL`:''}`:''}</div><div class="v5-warn">化疗必须核对具体药物、物种、方案、CBC/生化、器官功能、累积剂量及静脉外渗风险。</div>`)});
 btn('r08UopCalc',()=>{const u=n('r08UopVol'),h=n('r08UopH'),W=n('r08UopW')||weight();if(!(u>=0&&h>0&&W>0))return out('r08UopOut','<div class="v5-bad">请完整输入。</div>');const r=u/h/W;let msg;if(r===0)msg='<div class="v5-bad v5-critical">无尿：立即排查导尿管/尿路阻塞、严重低灌注和肾脏原因。</div>';else if(r<1)msg='<div class="v5-warn">低于 1 mL/kg/h：结合容量状态、肾灌注、尿路通畅性和连续趋势评估；单次值不能单独诊断 AKI。</div>';else msg='<div class="v5-ok">当前 UOP 未触发工具的低输出提示。</div>';out('r08UopOut',`UOP = <b>${fmt(r)} mL/kg/h</b>${msg}`)});

 btn('r08InfCalc',()=>{const site=$('r08InfSite').value,sev=$('r08InfSev').value;const culture=/骨|关节|胆道|腹腔|子宫|生殖|重症|脓毒/i.test(site+' '+sev);out('r08InfOut',`<div class="v5-result"><b>${esc(site)}</b>：先确认细菌感染可能性与感染源控制需求；可采样时优先培养/药敏；经验用药应尽量窄谱、与感染部位和药代动力学匹配。</div><div class="v5-warn">${culture?'该部位/严重程度更应重视培养、药敏、影像和感染源控制。':'稳定轻症病例避免无指征扩大抗菌谱；明确诊断后按 ISCAID/本地指南选择一线方案。'} 不对病毒性/免疫介导/非感染性疾病例行使用抗菌药。</div>`)});

 btn('r08DrugAudit',()=>{const name=$('r08DrugName').value,d=n('r08DrugDose'),flags=E.drugSafety(name,state());let extra='';if(/恩诺沙星|enrofloxacin/i.test(name)&&species()==='猫'&&d!==null){extra=d>5?'<div class="v5-bad v5-critical">猫恩诺沙星 >5 mg/kg/day：阻断，视网膜毒性风险。</div>':'<div class="v5-ok">猫恩诺沙星 ≤5 mg/kg/day：未超过工具上限；仍需按具体适应证/制剂和疗程复核。</div>'}out('r08DrugOut',(flags.length?flags.map(f=>`<div class="v5-bad"><b>${f.level}</b>：${esc(f.message)}</div>`).join(''):'<div class="v5-ok">未触发内置名称规则。</div>')+extra)});

 btn('r08Print',()=>{const p=state(),name=$('r08PrintName').value||'患者',dx=$('r08PrintDx').value||'',plan=$('r08PrintPlan').value||'',staff=$('r08PrintStaff').value||'';const w=window.open('','_blank');if(!w)return;w.document.write(`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>住院单-${esc(name)}</title><style>@page{size:A4;margin:12mm}body{font-family:Arial,"Microsoft YaHei",sans-serif;font-size:12px}h1{font-size:20px}table{width:100%;border-collapse:collapse;margin-bottom:12px}td,th{border:1px solid #333;padding:6px;text-align:left}.box{border:1px solid #333;min-height:120px;padding:8px;white-space:pre-wrap}.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.sig{margin-top:28px;display:flex;justify-content:space-between}</style></head><body><h1>兽医临床工具箱 5.0 · 住院/输液泵卡</h1><table><tr><th>患者</th><td>${esc(name)}</td><th>物种</th><td>${esc(p.species)}</td></tr><tr><th>品种</th><td>${esc(p.breed)}</td><th>体重</th><td>${esc(p.weight)} kg</td></tr><tr><th>诊断</th><td colspan="3">${esc(dx)}</td></tr></table><h3>医嘱/输液方案</h3><div class="box">${esc(plan)}</div><div class="sig"><span>执行：${esc(staff)}</span><span>复核：________</span><span>时间：________</span></div><script>setTimeout(()=>print(),250)</script></body></html>`);w.document.close()});
}

function patchLegacy(){
 // Core 5.0 has a legacy shock-fluid calculator. Replace its action with the safety-bounded Bolus calculator.
 const legacy=$('shockFluidBtn');if(legacy&&!legacy.dataset.r08Patched){legacy.dataset.r08Patched='1';legacy.onclick=()=>{const W=Number.parseFloat($('sw')?.value)||weight(),sp=species(),lim=sp==='猫'?[10,15]:[10,20],rate=Number.parseFloat($('sml')?.value)||lim[0];if(!(W>0&&rate>=lim[0]&&rate<=lim[1]))return $('sfo').innerHTML=`<div class="bad">5.0 安全锁：${sp} 单次复苏 Bolus 选择 ${lim[0]}–${lim[1]} mL/kg。</div>`;const total=W*rate,mins=Math.max(15,Math.min(20,Number.parseFloat($('smin')?.value)||15));$('sfo').innerHTML=`<div class="result"><b>分次 Bolus：${fmt(total)} mL</b>，${mins} min 内完成。</div><div class="bad"><b>强制复评：</b>肺音、呼吸功/SpO₂、CRT、HR、脉搏质量、SBP及灌注趋势。容量超负荷时停止并重新评估。</div>`}}
}
function refs(){const el=$('r08Refs');if(!el)return;el.innerHTML=`<div><b>5.0-r08</b></div><div>IRIS CKD：<a href="https://www.iris-kidney.com/iris-staging-system" target="_blank" rel="noopener">IRIS Staging System</a></div><div>RECOVER CPR 2024：<a href="https://pubmed.ncbi.nlm.nih.gov/38924627/" target="_blank" rel="noopener">PubMed PMID 38924627</a></div><div>ACVIM MMVD：<a href="https://onlinelibrary.wiley.com/doi/full/10.1111/jvim.15488" target="_blank" rel="noopener">2019 consensus</a></div><div>ISCAID：<a href="https://www.iscaid.org/guidelines" target="_blank" rel="noopener">Guidelines</a></div><div class="source">规则文件：data/clinical_rules_5.0.json。当前界面仍固定显示 5.0。</div>`}
function start(){injectStyle();const s=makeSection();if(!s)return;bind();fillState();cprDose();refs();setTimeout(patchLegacy,450);setTimeout(()=>{if($('clinical_enhancements_5.0_clinical_addon'))return},0)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
