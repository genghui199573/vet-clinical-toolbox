"use strict";
/* Vet Clinical Toolbox 5.0-r08 · Local Case Archive + Follow-up + AI Drug Fallback */
(function(){
  const CASES_KEY='vct50_case_archive_v1';
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const now=()=>new Date().toISOString();
  const safe=(s,d)=>{try{return JSON.parse(s)||d}catch{return d}};
  const val=id=>$(id)?.value??'';
  const ids=['caseId','caseSpecies','caseBreed','caseAge','caseSex','caseWeight','caseChief','caseHistory','casePast','casePrevent','caseTests','caseResults','caseDx','caseDDx','casePlan','caseAdvice','caseFollow','casePetName','caseOwner','casePhone'];
  function records(){const a=safe(localStorage.getItem(CASES_KEY),[]);return Array.isArray(a)?a:[]}
  function saveRecords(a){localStorage.setItem(CASES_KEY,JSON.stringify(a.slice(-500)))}
  function capture(){const o={};ids.forEach(id=>o[id]=val(id));o.updatedAt=now();o.ownerName=o.caseOwner;o.ownerPhone=o.casePhone;o.petName=o.casePetName;return o}
  function key(o){return String(o.caseId||'').trim()||String(o.casePhone||'').trim()+'|'+String(o.casePetName||'').trim()||('case-'+Date.now())}
  function ensureId(o){if(!String(o.caseId||'').trim())o.caseId=(window.VCT50_PATIENT_STATE?.patientId)||('VCT-'+new Date().toISOString().replace(/[-:TZ.]/g,'').slice(0,14));return o.caseId}
  function setField(id,v){const e=$(id);if(e&&v!==undefined&&v!==null)e.value=v}
  function loadCase(o,followup=false){ensureId(o);ids.forEach(id=>setField(id,o[id]??''));
    if(followup){setField('caseFollow','');$('caseOut')?.insertAdjacentHTML('afterbegin','<div class="info">已进入复诊模式：请录入本次复诊检查、结果、治疗调整和复查计划后保存。</div>')}
    syncPatientFromCase(o);
    if(location.hash!=='#case'){document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));$('case')?.classList.add('active');document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b.dataset.v==='case'));history.replaceState(null,'','#case')}
  }
  function syncPatientFromCase(o){
    const p=window.VCT50_PATIENT_STATE;
    if(!p)return;
    const map={patientId:o.caseId,patientSpecies:o.caseSpecies,patientBreed:o.caseBreed,patientAge:o.caseAge,patientSex:o.caseSex,patientWeight:o.caseWeight,patientChief:o.caseChief,patientHistory:o.caseHistory,patientConditions:o.casePast,patientDx:o.caseDx,patientOwner:o.caseOwner,patientPhone:o.casePhone,patientPetName:o.casePetName};
    Object.entries(map).forEach(([id,v])=>{if($(id)&&v!==undefined)$(id).value=v});
    if($('patientMeds')&&o.casePast)$('patientMeds').value=o.casePast;
    try{p.sync?.()}catch(e){console.warn(e)}
    try{window.VCT50_AI_BRIDGE?.clearPlan?.()}catch(e){}
    window.dispatchEvent(new CustomEvent('vct50:patient-change',{detail:{...(window.VCT50_PATIENT_STATE||{}),source:'case-archive-load'}}));
  }
  function saveCurrent(){
    const o=capture();ensureId(o);
    const a=records();const k=key(o);const idx=a.findIndex(x=>key(x)===k);
    const old=idx>=0?a[idx]:null;
    if(old){o.createdAt=old.createdAt||now();o.visitHistory=Array.isArray(old.visitHistory)?old.visitHistory.slice():[];o.visitHistory.push({time:now(),type:'复诊/更新',snapshot:{...o}});o.visitHistory=o.visitHistory.slice(-100);a[idx]=o}
    else{o.createdAt=now();o.visitHistory=[{time:now(),type:'初诊/建档',snapshot:{...o}}];a.push(o)}
    saveRecords(a);
    // Keep legacy single-case key for compatibility.
    localStorage.setItem('vetCase5',JSON.stringify(o));
    syncPatientFromCase(o);
    const out=$('caseOut');if(out)out.innerHTML=`<div class="good">✓ 病例已保存：${esc(o.caseId)} · ${esc(o.casePetName||'未填写宠物姓名')}。已同步 Patient State，并清除了上一位患者的 AI 计划。</div>`;
    renderSearch();
  }
  function startFollowup(o){const x={...o};x.caseFollow='';x.caseTests='';x.caseResults='';x.casePlan=o.casePlan||'';x.caseAdvice='';loadCase(x,true)}
  function renderSearch(){
    const q=(val('caseArchiveQ')||'').trim().toLowerCase();const arr=records().filter(o=>!q||JSON.stringify(o).toLowerCase().includes(q)).sort((a,b)=>String(b.updatedAt||'').localeCompare(String(a.updatedAt||''))).slice(0,100);
    const out=$('caseArchiveList');if(!out)return;
    if(!arr.length){out.innerHTML='<div class="muted">暂无匹配病例。</div>';return}
    out.innerHTML=arr.map((o,i)=>{const visits=(o.visitHistory||[]).length;return `<article class="label-card"><div class="label-head"><div><div class="label-title">${esc(o.casePetName||'未命名宠物')} <span class="pill">${esc(o.caseSpecies||'')}</span></div><div>${esc(o.caseOwner||'未填写主人')} · ${esc(o.casePhone||'未填写手机号')}</div><div class="muted">病历号：${esc(o.caseId||'')} · 最近更新：${esc(o.updatedAt||'')} · 就诊记录 ${visits} 次</div></div><div class="toolbar"><button class="primary" data-load-case="${i}">打开病例</button><button class="secondary" data-follow-case="${i}">复诊</button></div></div><div class="label-row"><b>主诉：</b>${esc(o.caseChief||'未记录')}</div><div class="label-row"><b>诊断：</b>${esc(o.caseDx||'未记录')}</div><div class="label-row"><b>治疗：</b>${esc(o.casePlan||'未记录')}</div></article>`}).join('');
    out.querySelectorAll('[data-load-case]').forEach(b=>b.onclick=()=>loadCase(arr[Number(b.dataset.loadCase)]));
    out.querySelectorAll('[data-follow-case]').forEach(b=>b.onclick=()=>startFollowup(arr[Number(b.dataset.followCase)]));
  }
  function installArchiveUI(){
    $('caseSaveBtn')?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();saveCurrent()});
    $('caseArchiveSearchBtn')?.addEventListener('click',renderSearch);
    $('caseArchiveQ')?.addEventListener('input',()=>renderSearch());
    $('caseArchiveQ')?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();renderSearch()}});
    $('caseNewVisitBtn')?.addEventListener('click',()=>{const o=capture();startFollowup(o)});
    $('caseExportBtn')?.addEventListener('click',()=>{const o=capture();const blob=new Blob([JSON.stringify(o,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=(o.caseId||'case')+'-5.0.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)});
    renderSearch();
  }
  function extractJSON(t){const s=String(t||'').trim();const m=s.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);if(m){const x=safe(m[1],null);if(x)return x}const a=s.indexOf('{'),b=s.lastIndexOf('}');if(a>=0&&b>a)return safe(s.slice(a,b+1),null);return null}
  function aiDrugCard(x){const e=x.evidence||{};const d=x.dose_use||x.dosing||{};const c=x.label_card||{};const basic=c.basic||{};const list=(t,v)=>Array.isArray(v)&&v.length?`<div class="label-sec"><h4>${t}</h4><ul class="label-list">${v.map(z=>`<li>${esc(z)}</li>`).join('')}</ul></div>`:'';return `<article class="label-card"><div class="label-head"><div><div class="label-title">${esc(basic.generic_name_zh||x.generic_name_zh||x.name||'AI候选药物')}</div><div>${esc(basic.generic_name_en||x.generic_name_en||'')}</div><div class="evidence-line"><span class="evidence-badge evidence-C">待核验｜AI Candidate</span></div></div><span class="pill">非正式数据库记录</span></div>${list('基本信息',[basic.aliases&&('别名：'+basic.aliases.join('、')),basic.brands&&('商品名：'+basic.brands.join('、')),basic.class&&('药理类别：'+basic.class),basic.species&&('适用物种：'+basic.species)].filter(Boolean))}${list('适应症 / 临床用途',c.indications||x.indications_general)}${list('剂量与用法',[d.species&&('物种：'+d.species),d.indication&&('适应症：'+d.indication),d.route&&('途径：'+d.route),d.dose&&('剂量：'+d.dose),d.frequency&&('频次：'+d.frequency),d.duration&&('疗程：'+d.duration)].filter(Boolean))}${list('禁忌证',c.contraindications)}${list('警告与注意事项',c.warnings)}${list('相互作用',c.interactions)}${list('监测',c.monitoring)}<div class="label-sec"><h4>证据与来源</h4><div class="label-row"><b>来源：</b>${esc(e.source||e.sources||'AI检索结果，尚未核验')}</div><div class="label-row"><b>来源URL：</b>${esc(e.source_url||e.url||'未提供')}</div></div><div class="label-note">⚠ AI Candidate（待核验候选）：不会自动写入正式427药物数据库。剂量、适应证、禁忌证、相互作用必须由执业兽医核对当前制剂官方说明书/标签或可靠指南后才能用于临床。</div></article>`}
  async function aiDrugSearch(){
    const q=val('drugQ').trim();if(!q){$('drugList').innerHTML='<div class="bad">请输入药物名称、商品名、疾病/适应症或关键词。</div>';return}
    const cfg=safe(localStorage.getItem('vetAI5')||'{}',{});const base=(val('aiBase')||cfg.base||'').trim().replace(/\/$/,'');const model=(val('aiModel')||cfg.model||'').trim();const key=(val('aiKey')||cfg.key||'').trim();if(!base||!model||!key){$('drugList').innerHTML='<div class="bad">请先在 AI 临床助手保存 API Base URL、模型和 API Key。</div>';return}
    const sp=val('drugSp')||'全部物种';const p=window.VCT50_PATIENT_STATE||{};const btn=$('drugAiSearchBtn');if(btn)btn.disabled=true;$('drugList').innerHTML='<div class="info">AI正在检索并按本地药物卡片格式整理。结果不会写入正式数据库。</div>';
    const system=`你是兽医药物知识检索助手。只输出JSON，禁止Markdown。用户需要查询一个本地427条正式数据库中可能未记录的药物。返回顶层 DRUGS 数组，每个对象尽可能包含 generic_name_zh,generic_name_en,aliases,brand_names,pharmacologic_class,species_groups,indications_general,label_card:{basic:{generic_name_zh,generic_name_en,aliases,brands,class,species},indications,contraindications,warnings,interactions,monitoring},dose_use:{species,indication,route,dose,frequency,duration,basis,notes},evidence:{source,source_url,source_note,last_verified}}。不得编造来源URL；不知道就写“未提供”。剂量不确定时必须写“需核对当前制剂标签/指南”，不得猜测。英文专业术语旁给简短中文解释。所有结果必须标记为AI Candidate/待核验候选，不得声称进入正式数据库。`;
    const user={query:q,species:sp,patient:{species:p.species||'',breed:p.breed||'',weight:p.weight||null,conditions:p.conditions||'',diagnosis:p.diagnosis||''}};
    try{const r=await fetch(base+'/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+key},body:JSON.stringify({model,messages:[{role:'system',content:system},{role:'user',content:JSON.stringify(user)}],temperature:.1})});if(!r.ok)throw new Error('HTTP '+r.status+' '+await r.text());const j=await r.json();const txt=j.choices?.[0]?.message?.content||'';const raw=extractJSON(txt);const arr=Array.isArray(raw?.DRUGS)?raw.DRUGS:Array.isArray(raw?.drugs)?raw.drugs:(raw?[raw]:[]);if(!arr.length)throw new Error('AI未返回可解析药物结果');$('drugList').innerHTML=`<div class="info"><b>AI Candidate（待核验）</b>：以下内容只用于补充检索，不会自动加入正式药物库。</div>${arr.map(aiDrugCard).join('')}`;}
    catch(e){$('drugList').innerHTML=`<div class="bad">AI药物搜索失败：${esc(e.message)}</div>`}finally{if(btn)btn.disabled=false}
  }
  function installDrug(){
    $('drugAiSearchBtn')?.addEventListener('click',aiDrugSearch);
    $('drugQ')?.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.ctrlKey){e.preventDefault();aiDrugSearch()}});
  }
  function init(){installArchiveUI();installDrug()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
