/* Vet Clinical Toolbox 5.0 — Clinical Rules Engine
 * Fixed product version: 5.0
 * Internal build: 5.0-r08
 * Single source of truth for patient state, units, validation and safety rules.
 */
(function(){
  'use strict';
  if(window.VetClinical5 && window.VetClinical5.rulesEngine) return;
  const KEY='vetPatientState5';
  const defaults={version:'5.0',build:'5.0-r08',species:'犬',breed:'',weight:null,age:null,sex:null,pcv:null,temp:null,hr:null,rr:null,sbp:null,dbp:null,spo2:null,albumin:null,na:null,k:null,cl:null,hco3:null,glucose:null,creatinine:null,sdma:null,upc:null,uop:null,uopHours:null,updatedAt:null};
  let state=Object.assign({},defaults);
  try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');if(saved)state=Object.assign(state,saved)}catch(e){}
  window.patientState=state;

  const num=v=>{const x=Number.parseFloat(v);return Number.isFinite(x)?x:null};
  const finite=x=>Number.isFinite(x);
  const clamp=(x,min,max)=>Math.min(max,Math.max(min,x));
  const kg=()=>finite(num(state.weight))&&num(state.weight)>0?num(state.weight):null;
  const normalizeSpecies=s=>s==='猫'?'猫':s==='犬'?'犬':s||'犬';
  function merge(p,source){
    const next=Object.assign({},state,p||{});
    next.species=normalizeSpecies(next.species);
    ['weight','age','pcv','temp','hr','rr','sbp','dbp','spo2','albumin','na','k','cl','hco3','glucose','creatinine','sdma','upc','uop','uopHours'].forEach(k=>{if(next[k]!==null&&next[k]!==''&&next[k]!==undefined){const n=num(next[k]);if(n!==null)next[k]=n}});
    next.updatedAt=new Date().toISOString();
    state=next;window.patientState=state;
    try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}
    const detail=Object.assign({},state,{source:source||'unknown'});
    window.dispatchEvent(new CustomEvent('vet:patientState',{detail}));
    window.dispatchEvent(new CustomEvent('patientStateUpdated',{detail}));
    return state;
  }
  function readInputs(){
    const q=id=>document.getElementById(id);
    const val=(...ids)=>{for(const id of ids){const e=q(id);if(e&&e.value!=='')return e.value}return null};
    return merge({
      species:val('caseSpecies','patientSpecies','doseSpecies')||state.species,
      breed:val('caseBreed','patientBreed','doseBreed')??state.breed,
      weight:num(val('caseWeight','patientWeight','doseWeight'))??state.weight,
      age:val('caseAge','patientAge')??state.age,
      sex:val('caseSex','patientSex')??state.sex,
      pcv:num(val('trPcv','v5pcv','patientPcv'))??state.pcv,
      temp:num(val('asaTemp','gasTemp','v5temp','patientTemp'))??state.temp,
      hr:num(val('shHr','v5hr','patientHr'))??state.hr,
      sbp:num(val('shBp','lacBp','v5sbp','patientSbp'))??state.sbp,
      spo2:num(val('asaSpo2','patientSpo2'))??state.spo2,
      albumin:num(val('gasAlb','bioAlb','v5agAlb','patientAlbumin'))??state.albumin,
      na:num(val('gasNa','bioNa','enaNow','v5agNa'))??state.na,
      k:num(val('bioK','ekNow'))??state.k,
      cl:num(val('gasCl','bioCl','v5agCl'))??state.cl,
      hco3:num(val('gasHco3','v5agHco3'))??state.hco3,
      glucose:num(val('bioGlu','v5dkaG'))??state.glucose,
      creatinine:num(val('bioCrea','v5crea'))??state.creatinine,
      sdma:num(val('bioSdma','v5sdma'))??state.sdma,
      upc:num(val('v5upc'))??state.upc
    },'input');
  }
  function syncInputs(p){
    const set=(id,v)=>{const e=document.getElementById(id);if(e&&v!==null&&v!==undefined&&v!=='')e.value=v};
    [['patientSpecies',p.species],['patientBreed',p.breed],['patientWeight',p.weight],['caseSpecies',p.species],['caseBreed',p.breed],['caseWeight',p.weight],['caseAge',p.age],['doseSpecies',p.species],['doseBreed',p.breed],['doseWeight',p.weight],['criW',p.weight],['anWeight',p.weight],['fw',p.weight],['sw',p.weight],['nw',p.weight],['trW',p.weight]].forEach(x=>set(x[0],x[1]));
    window.dispatchEvent(new CustomEvent('vet:patientStateSynced',{detail:Object.assign({},p)}));
  }
  function speciesSafety(p=state){
    const sp=p.species||'犬', b=String(p.breed||'').toLowerCase(), f=[];
    if(sp==='猫'){
      f.push({level:'BLOCK',code:'CAT_ACETAMINOPHEN',message:'猫禁用对乙酰氨基酚/扑热息痛。'});
      f.push({level:'BLOCK',code:'CAT_PYRETHROID',message:'猫对拟除虫菊酯/菊酯类暴露高度危险；避免直接使用犬用拟除虫菊酯制剂。'});
    }
    if(/边牧|喜乐蒂|苏牧|澳牧|澳大利亚牧羊|柯利|collie|sheltie|australian shepherd|old english sheepdog/i.test(b)) f.push({level:'WARN',code:'MDR1',message:'疑似 MDR1/ABCB1 高风险品种；使用大环内酯类/伊维菌素等前核对基因型、适应证和剂量。'});
    return f;
  }
  function drugSafety(name,p=state){
    const s=String(name||'').toLowerCase(), out=[];
    if(p.species==='猫' && /对乙酰氨基酚|扑热息痛|acetaminophen|paracetamol/.test(s))out.push({level:'BLOCK',message:'猫：对乙酰氨基酚禁用。'});
    if(p.species==='猫' && /氯菊酯|拟除虫菊酯|菊酯|permethrin|pyrethroid/.test(s))out.push({level:'BLOCK',message:'猫：拟除虫菊酯/氯菊酯制剂高风险，阻断犬用产品直接套用。'});
    if(p.species==='猫' && /恩诺沙星|enrofloxacin/.test(s))out.push({level:'LIMIT',message:'猫：恩诺沙星总日剂量超过 5 mg/kg/day 时阻断，并提示视网膜毒性风险。'});
    if(/伊维菌素|ivermectin|莫昔克丁|moxidectin|塞拉菌素|selamectin|阿维菌素|macrocyclic lactone/.test(s) && speciesSafety(p).some(x=>x.code==='MDR1'))out.push({level:'WARN',message:'MDR1/ABCB1 高风险品种：核对具体药物、剂量、给药途径及基因型。'});
    return out;
  }
  function units(){
    return {
      mmolToMg:(x,mw)=>finite(num(x)&&num(mw))?num(x)*num(mw):null,
      mgToMmol:(x,mw)=>finite(num(x)&&num(mw))?num(x)/num(mw):null,
      umolToMg:(x,mw)=>finite(num(x)&&num(mw))?num(x)*num(mw)/1000:null,
      mgToUmol:(x,mw)=>finite(num(x)&&num(mw))?num(x)*1000/num(mw):null,
      mgdlToMmol:(x,mw)=>finite(num(x)&&num(mw))?num(x)*10/num(mw):null,
      mmolToMgdl:(x,mw)=>finite(num(x)&&num(mw))?num(x)*mw/10:null
    };
  }
  function rules(){return {
    version:'5.0',build:'5.0-r08',
    sodium:{maxAbsRate:0.5},
    shockBolus:{dog:[10,20],cat:[10,15],minutes:[15,20]},
    cpr:{compressionBpm:[100,120],epinephrineLow:0.01,epinephrineHighHistorical:0.1,atropine:0.04},
    kcl:{maxRate:0.5},
    feline:{acetaminophen:'BLOCK',pyrethroid:'BLOCK',enrofloxacinMaxMgKgDay:5},
    md1Breeds:['Border Collie','Shetland Sheepdog','Australian Shepherd','Collie','Corgi'],
    bsa:{formula:'0.101*kg^(2/3)'},
    note:'High-dose epinephrine 0.1 mg/kg is retained only as historical/reference input; current RECOVER 2024 does not recommend high-dose epinephrine.'
  }}
  window.VetClinical5={version:'5.0',build:'5.0-r08',rulesEngine:true,state:state,getState:()=>Object.assign({},state),setState:merge,readInputs,syncInputs,speciesSafety,drugSafety,units,rules,clamp,num,kg};
  window.dispatchEvent(new CustomEvent('vet:patientState',{detail:Object.assign({},state,{source:'init'})}));
})();
