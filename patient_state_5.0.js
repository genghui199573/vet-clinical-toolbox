"use strict";
/* Vet Clinical Toolbox 5.0-r08 · Global Patient State
 * One patient record feeds the clinical workstation modules. Local-only by design.
 */
(function(){
  const KEY="vct50_patient_state";
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));
  const fields=["patientId","patientSpecies","patientBreed","patientAge","patientSex","patientWeight","patientChief","patientHistory","patientConditions","patientCreatinine","patientK","patientNa","patientAlb","patientGlucose","patientMeds","patientDx"];
  const aliases={
    patientSpecies:["caseSpecies","doseSpecies","rwSpecies","anSpecies","cbcSpecies","biochemSpecies","gasSpecies","electroSpecies"],
    patientBreed:["caseBreed","doseBreed","rwBreed"],
    patientAge:["caseAge"], patientSex:["caseSex"], patientWeight:["caseWeight","doseWeight","rwWeight","anWeight","cwBsaW","cwUopW","cwKBagW","cwFw","cwTrW","qW","qTrW","mw","sw","nw","tubeW","painW","sxW"],
    patientChief:["caseChief","aiChief","cwRChief"], patientHistory:["caseHistory","aiHistory"], patientConditions:["casePast","aiQuestion"], patientDx:["caseDx"], patientMeds:["casePast","aiQuestion"],
    patientCreatinine:["cwCr"], patientK:["cwKTarget","qK","shK"], patientNa:["qSNa"], patientAlb:["qAlb"], patientGlucose:["erGlu","osGlu","ceGlu","r08DKAG"]
  };
  const state={version:"5.0-r08",updated_at:null,patientId:"",species:"犬",breed:"",age:"",sex:"",weight:null,chief:"",history:"",conditions:"",creatinine:null,potassium:null,sodium:null,albumin:null,glucose:null,currentMeds:"",diagnosis:"",notes:"",labAnalyzerId:"",labAnalyzerLabel:""};
  function read(){try{const x=JSON.parse(localStorage.getItem(KEY)||"null");if(x&&typeof x==="object")Object.assign(state,x)}catch{}}
  function val(id){return $(id)?.value??""}
  function num(id){const x=parseFloat(val(id));return Number.isFinite(x)?x:null}
  function fromForm(){
    state.patientId=val("patientId"); state.species=val("patientSpecies")||"犬"; state.breed=val("patientBreed"); state.age=val("patientAge"); state.sex=val("patientSex"); state.weight=num("patientWeight");
    state.chief=val("patientChief"); state.history=val("patientHistory"); state.conditions=val("patientConditions"); state.creatinine=num("patientCreatinine"); state.potassium=num("patientK"); state.sodium=num("patientNa"); state.albumin=num("patientAlb"); state.glucose=num("patientGlucose"); state.currentMeds=val("patientMeds"); state.diagnosis=val("patientDx"); state.updated_at=new Date().toISOString();
    return state;
  }
  function makePatientId(){
    const d=new Date(), pad=n=>String(n).padStart(2,"0");
    return `VCT-${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  }
  function ensurePatientId(){
    if(!String(state.patientId||"").trim()){
      const caseId=String(val("caseId")||"").trim();
      state.patientId=caseId||makePatientId();
    }
    return state.patientId;
  }
  function persist(){
    localStorage.setItem(KEY,JSON.stringify(state));
    // Backward compatibility: older 5.0 modules used vetPatientState5.
    localStorage.setItem("vetPatientState5",JSON.stringify({
      ...state, build:"5.0-r08", updatedAt:state.updated_at
    }));
    window.VCT50_PATIENT_STATE={...state,get summary(){return summary()},get context(){return contextText()},sync,exportState,ensurePatientId};
    window.patientState=window.VCT50_PATIENT_STATE;
    // Keep the legacy rules engine state aligned without making it the source of truth.
    try{
      if(window.VetClinical5?.setState){
        window.VetClinical5.setState({
          species:state.species,breed:state.breed,weight:state.weight,age:state.age,sex:state.sex,
          albumin:state.albumin,na:state.sodium,k:state.potassium,glucose:state.glucose,creatinine:state.creatinine
        },"patient-state");
      }
    }catch(e){}
  }
  function set(id,v){if($(id)&&v!==null&&v!==undefined)$(id).value=v}
  function push(){
    set("patientId",state.patientId);set("patientSpecies",state.species);set("patientBreed",state.breed);set("patientAge",state.age);set("patientSex",state.sex);set("patientWeight",state.weight??"");set("patientChief",state.chief);set("patientHistory",state.history);set("patientConditions",state.conditions);set("patientCreatinine",state.creatinine??"");set("patientK",state.potassium??"");set("patientNa",state.sodium??"");set("patientAlb",state.albumin??"");set("patientGlucose",state.glucose??"");set("patientMeds",state.currentMeds);set("patientDx",state.diagnosis);
    Object.entries(aliases).forEach(([src,ids])=>{const v=$(src)?.value; if(v!==undefined)ids.forEach(id=>set(id,v))});
    // Current medications can seed the interaction audit without overwriting deliberate choices.
    if(state.currentMeds){const meds=state.currentMeds.split(/[，,；;\n]+/).map(x=>x.trim()).filter(Boolean);["cwDrugA","cwDrugB","cwDrugC"].forEach((id,i)=>{if($(id)&&!$(id).value&&meds[i])$(id).value=meds[i]})}
    refreshBadge();
  }
  function sync(){
    fromForm();
    ensurePatientId();
    persist();
    push();
    fillCase();
    setStatus(`患者已建立并同步：${state.patientId} · ${state.species}${state.weight?` · ${state.weight} kg`:""}`);
    const badge=$("globalPatientBadge");if(badge)badge.textContent=`已建立 · ${state.patientId}`;
    broadcast();
    // Re-render every patient-aware module after the patient identity is guaranteed.
    try{window.VCT50_CLINICAL_OS?.renderAll?.()}catch(e){}
    return {...state};
  }
  function broadcast(){window.dispatchEvent(new CustomEvent("vct50:patient-change",{detail:{...state}}))}
  function setStatus(t){if($("patientMsg"))$("patientMsg").textContent=t}
  function refreshBadge(){const b=$("globalPatientHeaderBadge");if(!b)return;b.innerHTML=state.patientId?`<b>${esc(state.patientId)}</b> · ${esc(state.species)} · ${esc(state.breed||"未填品种")} · ${state.weight?esc(state.weight)+" kg":"体重未填"}`:`未建立患者 · ${esc(state.species||"犬")}`}
  function summary(){return {患者编号:state.patientId||"未记录",物种:state.species,品种:state.breed||"未记录",年龄:state.age||"未记录",性别:state.sex||"未记录",体重:state.weight?state.weight+" kg":"未记录",主诉:state.chief||"未记录","既往/基础病":state.conditions||"未记录",肌酐:state.creatinine??"未记录",K:state.potassium??"未记录",Na:state.sodium??"未记录",白蛋白:state.albumin??"未记录",血糖:state.glucose??"未记录",当前用药:state.currentMeds||"未记录",诊断:state.diagnosis||"未记录",当前检验参考体系:state.labAnalyzerLabel||"未记录"};}
  function contextText(){return JSON.stringify(summary(),null,2)}
  function fillCase(){
    const map={patientId:"caseId",species:"caseSpecies",breed:"caseBreed",age:"caseAge",sex:"caseSex",weight:"caseWeight",chief:"caseChief",history:"caseHistory",conditions:"casePast",diagnosis:"caseDx"};Object.entries(map).forEach(([a,b])=>set(b,state[a]??""));
    if($("casePast")&&state.currentMeds&&!$("casePast").value)$("casePast").value=state.currentMeds;
  }
  function injectUI(){
    const header=document.querySelector("header");
    if(header&&!$("globalPatientStrip")){
      const strip=document.createElement("div");strip.id="globalPatientStrip";
      strip.innerHTML=`<span>🧠 全局患者</span><b id="globalPatientHeaderBadge"></b><button type="button" id="globalPatientGo">回到患者工作台</button>`;
      header.appendChild(strip);
      strip.style.cssText="display:flex;align-items:center;gap:8px;margin-top:7px;font-size:12px;flex-wrap:wrap";
      $("globalPatientGo").onclick=()=>{const h=$("home");if(h){document.querySelectorAll(".view").forEach(x=>x.classList.remove("active"));h.classList.add("active");document.querySelectorAll("nav button").forEach(b=>b.classList.toggle("active",b.dataset.v==="home"));history.replaceState(null,"","#home")}};
    }
    const home=$("home");const base=home?.querySelector(".card .grid .card");
    if(!base||base.dataset.vctPatientReady)return;
    base.dataset.vctPatientReady="1";base.id="globalPatientPanel";
    base.innerHTML=`<div class="patient-workspace-head"><div><div class="eyebrow">PATIENT STATE · SINGLE SOURCE OF TRUTH</div><h3>🧠 全局患者工作台</h3><p class="muted">患者只建立一次。病例、急诊、检验、计算、治疗任务与 AI 均从这里读取。</p></div><span id="globalPatientBadge" class="pill">未建立患者</span></div>
    <div class="grid patient-core-grid">
      <div><label>患者/病例编号<input id="patientId" placeholder="留空自动生成"></label><label>物种<select id="patientSpecies"><option>犬</option><option>猫</option><option>鹦鹉/鸟类</option><option>兔/啮齿类</option><option>爬宠/龟鳖</option><option>其他</option></select></label><label>品种<input id="patientBreed"></label><label>体重 kg<input id="patientWeight" type="number" step=".01"></label></div>
      <div><label>年龄<input id="patientAge" placeholder="如 6岁"></label><label>性别<select id="patientSex"><option value="">未记录</option><option>雄</option><option>雌</option><option>雄性绝育</option><option>雌性绝育</option></select></label><label>主诉<input id="patientChief" placeholder="如 呕吐、呼吸困难、尿闭"></label><label>当前诊断/工作诊断<input id="patientDx"></label></div>
      <div><label>既往史/基础病<input id="patientConditions" placeholder="如 CKD、HCM、糖尿病"></label><label>肌酐 mg/dL<input id="patientCreatinine" type="number" step=".01"></label><label>血钾 mmol/L<input id="patientK" type="number" step=".01"></label><label>血钠 mmol/L<input id="patientNa" type="number" step=".01"></label></div>
      <div><label>白蛋白 g/dL<input id="patientAlb" type="number" step=".01"></label><label>血糖 mmol/L<input id="patientGlucose" type="number" step=".01"></label><label>当前用药（可多项）<textarea id="patientMeds" placeholder="每行/逗号分隔一个药物"></textarea></label><label>补充临床备注<textarea id="patientHistory"></textarea></label></div>
    </div>
    <div class="patient-actionbar"><div><b>工作流：</b>①建立患者 → ②录入核心信息 → ③同步 → ④进入 Clinical OS / AI</div><div class="toolbar"><button class="primary" id="patientSyncNow">建立并同步全部模块</button><button class="secondary" id="patientClear">清空当前患者</button></div></div><div id="patientStateStatus" class="muted"></div>`;
    $("patientSyncNow").onclick=sync;
    $("patientClear").onclick=()=>{localStorage.removeItem(KEY);Object.keys(state).forEach(k=>state[k]=k==="version"?"5.0-r08":k==="species"?"犬":k==="updated_at"?null:k.match(/weight|creatinine|potassium|sodium|albumin|glucose/)?null:"");push();setStatus("已清空当前患者");broadcast()};
    let broadcastTimer=null;
    const schedulePatientBroadcast=()=>{clearTimeout(broadcastTimer);broadcastTimer=setTimeout(()=>{broadcast();try{window.VCT50_AI_BRIDGE?.refreshPatientContext?.()}catch(e){}},80)};
    fields.forEach(id=>$(id)?.addEventListener("input",()=>{fromForm();persist();refreshBadge();schedulePatientBroadcast()}));
    fields.forEach(id=>$(id)?.addEventListener("change",()=>{fromForm();persist();refreshBadge();schedulePatientBroadcast()}));
    refreshBadge();
  }
  function bindCaseBridge(){
    ["caseId","caseSpecies","caseBreed","caseAge","caseSex","caseWeight","caseChief","caseHistory","casePast","caseDx"].forEach(id=>$(id)?.addEventListener("input",()=>{if(!$("patientSyncNow"))return; if(id==="caseId")state.patientId=val(id); if(id==="caseSpecies")state.species=val(id); if(id==="caseBreed")state.breed=val(id); if(id==="caseAge")state.age=val(id); if(id==="caseSex")state.sex=val(id); if(id==="caseWeight")state.weight=num(id); if(id==="caseChief")state.chief=val(id); if(id==="caseHistory")state.history=val(id); if(id==="casePast")state.conditions=val(id); if(id==="caseDx")state.diagnosis=val(id); state.updated_at=new Date().toISOString();persist();refreshBadge();}));
  }
  function autoContext(){
    // Keep modules aligned whenever the patient changes.
    window.addEventListener("vct50:patient-change",e=>{
      const s=e.detail||state;
      ["doseSpecies","rwSpecies","anSpecies","cbcSpecies","biochemSpecies","gasSpecies","electroSpecies"].forEach(id=>set(id,s.species));
      ["doseBreed","rwBreed"].forEach(id=>set(id,s.breed));
      ["doseWeight","rwWeight","anWeight","cwBsaW","cwUopW","cwKBagW","cwFw","cwTrW","qW","mw","sw","nw"].forEach(id=>set(id,s.weight??""));
      ["cwCr"].forEach(id=>set(id,s.creatinine??""));["qAlb"].forEach(id=>set(id,s.albumin??""));["erGlu","osGlu","ceGlu","r08DKAG"].forEach(id=>set(id,s.glucose??""));["qSNa"].forEach(id=>set(id,s.sodium??""));
      ["aiChief","cwRChief"].forEach(id=>set(id,s.chief));["aiHistory"].forEach(id=>set(id,s.history));
      if($("aiQuestion")&&!$("aiQuestion").value&&s.conditions)$("aiQuestion").value=`基础病：${s.conditions}`;
      if($("cwRSpecies"))$("cwRSpecies").value=s.species;
      if($("cwRW"))$("cwRW").value=s.weight??"";
      fillCase();
    });
  }
  window.addEventListener("vct50:lab-ref-change",e=>{const a=e.detail?.analyzer;if(!a)return;state.labAnalyzerId=a.id||"";state.labAnalyzerLabel=(a.manufacturer||"")+" · "+(a.model||"");state.updated_at=new Date().toISOString();persist();broadcast()});
  function exportState(){const blob=new Blob([JSON.stringify({version:state.version,exported_at:new Date().toISOString(),patient:state,summary:summary()},null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=(state.patientId||"patient")+"-patient-state-5.0.json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
  read();window.VCT50_PATIENT_STATE={...state,get summary(){return summary()},get context(){return contextText()},sync,exportState,ensurePatientId};
  window.patientState=window.VCT50_PATIENT_STATE;
  function init(){injectUI();bindCaseBridge();autoContext();push();broadcast();if($("patientStateStatus"))$("patientStateStatus").textContent="Patient State 已启用 · 本机 localStorage · 仅用于本次临床工作站联动";}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
