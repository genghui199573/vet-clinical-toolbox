"use strict";
/* Vet Clinical Toolbox 5.0-r08 · AI Clinical Copilot Bridge
 * Bidirectional bridge: AI <-> Patient State / Clinical OS.
 * AI suggestions are NEVER auto-activated as medical orders; clinician review is required.
 */
(function(){
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const now=()=>new Date().toISOString();
  const KEY='vct50_ai_plan_v1';
  let lastPlan=null;
  const safe=(s,d)=>{try{return JSON.parse(s)||d}catch{return d}};
  const asArr=v=>Array.isArray(v)?v:(v==null||v===''?[]:[v]);
  const txt=v=>Array.isArray(v)?v.join('；'):String(v??'');
  function patient(){return window.VCT50_PATIENT_STATE||safe(localStorage.getItem('vct50_patient_state'),{})||{}}
  function osState(){return window.VCT50_CLINICAL_OS_STATE||safe(localStorage.getItem('vct50_clinical_os_state_v2'),{problemList:[],vitals:[],labs:[],timeline:[],tasks:[],goals:[],audit:[]})}
  function saveOS(s){s.version='5.0-r08';localStorage.setItem('vct50_clinical_os_state_v2',JSON.stringify(s));window.VCT50_CLINICAL_OS_STATE=s}
  function audit(action,detail){const s=osState();s.audit=Array.isArray(s.audit)?s.audit:[];s.audit.push({time:now(),action,detail:detail||'',patientId:patient().patientId||''});s.audit=s.audit.slice(-300);saveOS(s)}
  function normalize(raw){
    const p=raw?.PATIENT||raw?.patient||{};
    const plan={version:'5.0-r08',generated_at:now(),plan_id:'ai-'+Date.now()+'-'+Math.random().toString(36).slice(2,8),patient:{
      patientId:p.patientId||p.id||'',species:p.species||p.Species||'',breed:p.breed||'',age:p.age||'',sex:p.sex||'',weight:p.weight??null,vaccination:p.vaccination||p.vaccine||''
    },problems:[],red_flags:[],differentials:[],recommended_tests:[],treatment_options:[],medication_options:[],monitoring:[],reassessment:[],evidence:[],safety_warnings:[],raw_text:''};
    const mapItems=(arr,def='')=>asArr(arr).map(x=>typeof x==='string'?{text:x,priority:def||'P2',status:'Suggested'}:{...x,status:x.status||'Suggested',priority:x.priority||def||'P2'}).filter(x=>x.text||x.name||x.test||x.problem||x.drug);
    plan.problems=mapItems(raw?.PROBLEMS||raw?.problems,'P2');
    plan.red_flags=mapItems(raw?.RED_FLAGS||raw?.red_flags,'P0');
    plan.differentials=mapItems(raw?.DIFFERENTIALS||raw?.differentials,'P2');
    plan.recommended_tests=mapItems(raw?.RECOMMENDED_TESTS||raw?.recommended_tests,'P1');
    plan.treatment_options=mapItems(raw?.TREATMENT_OPTIONS||raw?.treatment_options,'P1');
    plan.medication_options=mapItems(raw?.MEDICATION_OPTIONS||raw?.medication_options,'P1');
    plan.monitoring=mapItems(raw?.MONITORING||raw?.monitoring,'P2');
    plan.reassessment=mapItems(raw?.REASSESSMENT||raw?.reassessment,'P1');
    plan.evidence=mapItems(raw?.EVIDENCE||raw?.evidence,'P2');
    plan.safety_warnings=mapItems(raw?.SAFETY_WARNINGS||raw?.safety_warnings,'P0');
    return plan;
  }
  function extractJSON(text){
    const t=String(text||'').trim();
    const fence=t.match(/```(?:json)?\s*([\s\S]*?)\s*```/i); if(fence) {const x=safe(fence[1],null);if(x)return x}
    const start=t.indexOf('{'),end=t.lastIndexOf('}'); if(start>=0&&end>start){const x=safe(t.slice(start,end+1),null);if(x)return x}
    return null;
  }
  function label(x){return x.name||x.test||x.problem||x.drug||x.text||x.item||''}
  function detail(x){return [x.description,x.rationale,x.reason,x.note,x.plan,x.action,x.dose,x.route,x.frequency,x.duration].filter(Boolean).join(' · ')}
  function renderItem(x,kind){return `<div class="ai-plan-row"><div><span class="os-chip ${x.priority==='P0'?'os-red':x.priority==='P1'?'os-amber':x.priority==='P2'?'os-yellow':'os-green'}">${esc(x.priority||'P2')}</span><b>${esc(label(x))}</b>${detail(x)?`<div class="os-muted">${esc(detail(x))}</div>`:''}</div><span class="os-chip os-blue">Suggested（AI建议）</span></div>`}
  function renderPlan(plan){
    const sec=(title,arr)=>arr.length?`<section class="ai-plan-sec"><h4>${title}</h4>${arr.map(x=>renderItem(x,title)).join('')}</section>`:'';
    const p=plan.patient;
    return `<div class="ai-plan"><div class="ai-plan-head"><div><h3>AI Clinical Plan（AI临床计划）</h3><div class="os-muted">${esc(p.species||patient().species||'物种未识别')} · ${esc(p.age||patient().age||'年龄未识别')} · ${esc(p.weight??patient().weight??'')} ${p.weight||patient().weight?'kg':''}</div></div><span class="os-chip os-amber">Doctor Review Required（必须医生审核）</span></div>
      ${sec('PROBLEMS · 临床问题',plan.problems)}${sec('RED FLAGS · 危险信号',plan.red_flags)}${sec('DIFFERENTIALS · 鉴别诊断',plan.differentials)}${sec('RECOMMENDED TESTS · 建议检查',plan.recommended_tests)}${sec('TREATMENT OPTIONS · 治疗候选',plan.treatment_options)}${sec('MEDICATION OPTIONS · 用药候选',plan.medication_options)}${sec('MONITORING · 监测',plan.monitoring)}${sec('REASSESSMENT · 复评',plan.reassessment)}${sec('EVIDENCE · 证据',plan.evidence)}${sec('SAFETY WARNINGS · 安全警告',plan.safety_warnings)}
      <div class="ai-sync-bar"><button class="primary" id="aiApplyPlan">⚡ Apply Clinical Plan（应用临床计划）</button><button id="aiSyncSelected">＋ Sync to Patient State（同步到患者）</button><button id="aiRejectPlan">✕ Reject（拒绝本次计划）</button></div><div class="os-warning">AI输出属于 Suggested（建议）状态。应用后会写入 Problem List、检查/治疗任务、监测与 Timeline；不会自动执行药物、输液、麻醉或其他高风险医嘱。</div></div>`;
  }
  function syncPatient(plan){
    const p=plan.patient;const cur=patient();
    const set=(id,v)=>{if($(id)&&v!==undefined&&v!==null&&v!=='')$(id).value=v};
    set('patientId',p.patientId||cur.patientId);set('patientSpecies',p.species||cur.species||'犬');set('patientBreed',p.breed||cur.breed);set('patientAge',p.age||cur.age);set('patientSex',p.sex||cur.sex);set('patientWeight',p.weight??cur.weight??'');
    const chief=$('patientChief');if(chief&&!chief.value){const pr=plan.problems.map(label).filter(Boolean);chief.value=pr.join('、')||cur.chief||''}
    const conditions=$('patientConditions');if(conditions&&plan.patient.vaccination&&!conditions.value)conditions.value=`免疫状态：${plan.patient.vaccination}`;
    const dx=$('patientDx');if(dx&&!dx.value&&plan.differentials.length)dx.value='鉴别诊断：'+plan.differentials.slice(0,3).map(label).join('、');
    $('patientSyncNow')?.click();
  }
  function autoSyncSuggested(plan){
    const s=osState(); s.problemList=s.problemList||[]; s.tasks=s.tasks||[]; s.timeline=s.timeline||[]; s.goals=s.goals||[];
    const pid=plan.plan_id||plan.generated_at;
    if(s.timeline.some(x=>x.ai_plan_id===pid)) return false;
    const add=(text,priority='P2',kind='AI建议')=>{if(!text)return;s.tasks.push({text,time:now(),done:false,status:'Suggested',source:'AI',priority,kind,ai_plan_id:pid})};
    const existing=new Set(s.problemList.map(x=>String(x.text||'').toLowerCase()));
    plan.problems.concat(plan.red_flags.map(x=>({...x,priority:'P0',text:'⚠ '+label(x)}))).forEach(x=>{const t=label(x);if(!t||existing.has(t.toLowerCase()))return;existing.add(t.toLowerCase());s.problemList.push({text:t,priority:x.priority||'P2',status:'Suggested',source:'AI',created_at:now(),ai_plan_id:pid})});
    plan.recommended_tests.forEach(x=>add('检查：'+label(x)+(detail(x)?' · '+detail(x):''),x.priority,'Recommended Test（建议检查）'));
    plan.treatment_options.forEach(x=>add('治疗候选：'+label(x)+(detail(x)?' · '+detail(x):''),x.priority,'Treatment Option（治疗候选）'));
    plan.medication_options.forEach(x=>add('用药候选（医生审核）：'+label(x)+(detail(x)?' · '+detail(x):''),x.priority,'Medication Option（用药候选）'));
    plan.monitoring.forEach(x=>add('监测：'+label(x)+(detail(x)?' · '+detail(x):''),x.priority,'Monitoring（监测）'));
    plan.reassessment.forEach(x=>add('复评：'+label(x)+(detail(x)?' · '+detail(x):''),x.priority,'Reassessment（复评）'));
    plan.reassessment.forEach(x=>s.goals.push({text:label(x),status:'Suggested',source:'AI',time:now(),ai_plan_id:pid}));
    s.timeline.push({time:now(),type:'AI建议',text:'AI结构化临床计划已自动同步到 Clinical OS，全部保持 Suggested（建议）状态，未经医生审核不得视为执行医嘱。',patientId:patient().patientId||'',ai_plan_id:pid});
    saveOS(s); audit('ai_auto_sync_suggested','AI plan synced as Suggested; no active orders'); window.VCT50_CLINICAL_OS?.renderAll?.(); return true;
  }
  function applyPlan(plan){
    syncPatient(plan);const s=osState();
    const uniq=(arr,k)=>{const seen=new Set(arr.map(x=>String(k(x)).toLowerCase()));return arr.filter(x=>{const z=String(k(x)).toLowerCase();if(seen.has(z))return false;seen.add(z);return true})};
    const existing=s.problemList||[];plan.problems.forEach(x=>existing.push({text:label(x),priority:x.priority||'P2',status:'Suggested',source:'AI',created_at:now()}));plan.red_flags.forEach(x=>existing.push({text:'⚠ '+label(x),priority:'P0',status:'Suggested',source:'AI',created_at:now()}));s.problemList=uniq(existing,x=>x.text).slice(-100);
    s.tasks=s.tasks||[];plan.recommended_tests.forEach(x=>s.tasks.push({text:'检查：'+label(x)+(detail(x)?' · '+detail(x):''),time:now(),done:false,status:'Suggested',source:'AI'}));plan.treatment_options.forEach(x=>s.tasks.push({text:'治疗候选：'+label(x)+(detail(x)?' · '+detail(x):''),time:now(),done:false,status:'Suggested',source:'AI'}));plan.medication_options.forEach(x=>s.tasks.push({text:'用药候选（医生审核）：'+label(x)+(detail(x)?' · '+detail(x):''),time:now(),done:false,status:'Suggested',source:'AI'}));plan.monitoring.forEach(x=>s.tasks.push({text:'监测：'+label(x)+(detail(x)?' · '+detail(x):''),time:now(),done:false,status:'Suggested',source:'AI'}));plan.reassessment.forEach(x=>s.tasks.push({text:'复评：'+label(x)+(detail(x)?' · '+detail(x):''),time:now(),done:false,status:'Suggested',source:'AI'}));
    s.timeline=s.timeline||[];s.timeline.push({time:now(),type:'AI计划',text:'AI Clinical Plan 已由医生应用到 Clinical OS；所有项目保持 Suggested（建议）状态，待逐项审核。',patientId:patient().patientId||''});
    s.goals=s.goals||[];plan.reassessment.forEach(x=>s.goals.push({text:label(x),status:'Suggested',source:'AI',time:now()}));
    saveOS(s);audit('ai_apply_plan','AI clinical plan applied; still requires clinician review');
    window.VCT50_CLINICAL_OS?.renderAll?.();
  }
  function reject(){lastPlan=null;localStorage.removeItem(KEY);if($('aiOut'))$('aiOut').innerHTML=`<div class="os-note">本次 AI 计划已拒绝，未同步到患者全局。</div>`;audit('ai_reject_plan','AI plan rejected')}
  function wire(plan){lastPlan=plan;localStorage.setItem(KEY,JSON.stringify(plan));autoSyncSuggested(plan);const a=$('aiOut');if(!a)return;a.innerHTML=renderPlan(plan);$('aiApplyPlan').onclick=()=>{applyPlan(plan);a.innerHTML+=`<div class="os-note">已应用到 Clinical OS。状态：Suggested（建议）→等待医生审核。高风险用药/输液/麻醉/输血不会自动执行。</div>`};$('aiSyncSelected').onclick=()=>{syncPatient(plan);audit('ai_sync_patient','AI patient fields synced');a.innerHTML+=`<div class="os-note">患者基础信息已同步到 Patient State。</div>`};$('aiRejectPlan').onclick=reject;}
  function promptContext(){
    const p=patient(),s=osState();return {version:'5.0-r08',patient:p,problems:s.problemList||[],vitals:s.vitals||[],labs:s.labs||[],timeline:(s.timeline||[]).slice(-50),tasks:s.tasks||[],goals:s.goals||[],allergies:s.allergies||[],drug_safety:window.VCT50_CLINICAL_OS?.drugSafety?.()||[],fluid_safety:window.VCT50_CLINICAL_OS?.fluidSafety?.()||[],user_input:{chief:$('aiChief')?.value||'',tests:$('aiTests')?.value||'',results:$('aiResults')?.value||'',history:$('aiHistory')?.value||'',question:$('aiQuestion')?.value||''}};
  }
  function install(){
    if(!$('aiRun'))return;
    if(!$('ai-sync-style')){const st=document.createElement('style');st.id='ai-sync-style';st.textContent=`.ai-plan{margin-top:12px;border:2px solid var(--line);border-radius:14px;padding:12px;background:#fff}.ai-plan-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.ai-plan-sec{margin-top:10px}.ai-plan-sec h4{margin:7px 0}.ai-plan-row{display:flex;justify-content:space-between;gap:8px;border:1px solid var(--line);border-radius:10px;padding:9px;margin:6px 0;background:#fbfdff}.ai-sync-bar{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;padding-top:10px;border-top:1px solid var(--line)}@media(max-width:700px){.ai-plan-head,.ai-plan-row{flex-direction:column}}`;document.head.appendChild(st)}
    const old=$('aiRun');if(old.dataset.structuredBridge)return;old.dataset.structuredBridge='1';
    old.onclick=async()=>{
      const base=$('aiBase').value.trim().replace(/\/$/,''),model=$('aiModel').value.trim(),key=$('aiKey').value.trim();
      if(!base||!model||!key){$('aiOut').innerHTML='<div class="bad">请先填写 API Base URL、模型和 API Key。</div>';return}
      const ctx=promptContext();$('aiOut').innerHTML='<div class="info">AI正在分析病例，并生成可审核的结构化临床计划……</div>';
      const system=`你是兽医临床决策支持模型，不替代执业兽医。只做辅助推理。请把用户自然语言病例转换成严格 JSON，不要 Markdown，不要解释文字。必须包含以下顶层键：PATIENT, PROBLEMS, RED_FLAGS, DIFFERENTIALS, RECOMMENDED_TESTS, TREATMENT_OPTIONS, MEDICATION_OPTIONS, MONITORING, REASSESSMENT, EVIDENCE, SAFETY_WARNINGS。PATIENT字段：patientId,species,breed,age,sex,weight,vaccination。所有数组元素优先使用对象：{name/text/test/problem/drug,priority,description,rationale,note,dose,route,frequency,duration,status}，可缺省无关字段。priority只能P0/P1/P2/P3。status初始只能Suggested。重要原则：确诊与鉴别诊断必须区分；资料不足就明确不足；不要编造药物剂量、制剂标签或证据；药物/输液/麻醉/输血等高风险内容只能给候选方案并写明需要医生审核、标签/指南核对。英文专业术语旁给出简短中文解释，例如 Differential Diagnosis（鉴别诊断）、Next Best Test（下一项最有价值检查）、Reassessment（复评）、Drug Safety（用药安全）。`;
      try{const r=await fetch(base+'/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+key},body:JSON.stringify({model,messages:[{role:'system',content:system},{role:'user',content:JSON.stringify(ctx)}],temperature:.1})});if(!r.ok)throw new Error('HTTP '+r.status+' '+await r.text());const j=await r.json();const txt=j.choices?.[0]?.message?.content||'';const raw=extractJSON(txt);if(!raw)throw new Error('模型未返回可解析的结构化 JSON；请重试或更换支持 JSON 输出的模型。');const plan=normalize(raw);plan.raw_text=txt;wire(plan);audit('ai_generate_plan','structured AI plan generated');}
      catch(e){$('aiOut').innerHTML=`<div class="bad">AI调用/结构化解析失败：${esc(e.message)}<br>请检查 Base URL、模型、Key、CORS，或选择支持 JSON 输出的模型。</div>`}
    };
    // Add a global AI inbox link to Clinical OS navigation if available.
    const nav=$('nav');if(nav&&!document.querySelector('[data-v="aiInbox"]')){const b=document.createElement('button');b.dataset.v='aiInbox';b.textContent='🤖 AI Plan（AI计划）';b.onclick=()=>window.show?.('aiInbox');nav.insertBefore(b,nav.children[1]||null)}
    const main=document.querySelector('main');if(main&&!$('aiInbox')){const sec=document.createElement('section');sec.id='aiInbox';sec.className='view';sec.innerHTML=`<div class="card"><h2>🤖 AI Plan Inbox（AI临床计划收件箱）</h2><p class="muted">这里集中查看最近一次 AI 结构化计划。AI建议必须经过医生审核；不会自动成为执行医嘱。</p><div id="aiInboxOut"></div></div>`;main.insertBefore(sec,main.firstChild)}
    const cached=safe(localStorage.getItem(KEY),null);if(cached){lastPlan=cached;setTimeout(()=>{$('aiInboxOut')&&($('aiInboxOut').innerHTML=renderPlan(cached));wire(cached)},0)}
    window.addEventListener('vct50:patient-change',()=>{if($('aiInboxOut')&&lastPlan){$('aiInboxOut').innerHTML=renderPlan(lastPlan)}});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
  window.VCT50_AI_BRIDGE={promptContext,normalize,wire,applyPlan,syncPatient,getLastPlan:()=>lastPlan};
})();
