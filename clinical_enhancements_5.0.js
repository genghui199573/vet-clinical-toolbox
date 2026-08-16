(function(){
"use strict";
const V5U="5.0";
const $=id=>document.getElementById(id);
const n=id=>{const v=parseFloat($(id)?.value);return Number.isFinite(v)?v:null};
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
function card(id,title,html){if($(id))return $(id);const sec=document.createElement("section");sec.id=id;sec.className="view";sec.innerHTML=`<div class="card"><h2>${title}</h2>${html}</div>`;document.querySelector("main")?.appendChild(sec);return sec}
function nav(id,label,after){const nav=document.querySelector("#nav");if(!nav||nav.querySelector(`[data-v="${id}"]`))return;const b=document.createElement("button");b.dataset.v=id;b.textContent=label;const a=nav.querySelector(`[data-v="${after||"ai"}"]`);a?a.before(b):nav.appendChild(b)}
function activate(id){document.querySelectorAll(".view").forEach(x=>x.classList.remove("active"));const s=$(id);if(s)s.classList.add("active");document.querySelectorAll("#nav button").forEach(b=>b.classList.toggle("active",b.dataset.v===id));history.replaceState(null,"","#"+id);window.scrollTo({top:0,behavior:"smooth"})}
function bindNav(){const nav=$("#nav");if(!nav)return;nav.addEventListener("click",e=>{const b=e.target.closest("button[data-v]");if(!b)return;const id=b.dataset.v;if($(id)){e.preventDefault();activate(id)}})}
function patientState(){
 const p=JSON.parse(localStorage.getItem("vetPatientState5")||"null")||{species:"犬",breed:"",weight:null};
 window.patientState=p;
 const set=(id,v)=>{const x=$(id);if(x&&v!==null&&v!==undefined&&v!=="")x.value=v};
 const syncAll=()=>{["doseSpecies","rwSpecies","anSpecies","labSpecies","caseSpecies"].forEach(id=>set(id,p.species));["doseBreed","rwBreed","caseBreed"].forEach(id=>set(id,p.breed));["doseWeight","rwWeight","anWeight","criW","caseWeight"].forEach(id=>set(id,p.weight))};
 const sync=()=>{p.species=$( "patientSpecies")?.value||p.species;p.breed=$( "patientBreed")?.value||"";p.weight=n("patientWeight");localStorage.setItem("vetPatientState5",JSON.stringify(p));window.patientState=p;syncAll();if($("patientMsg"))$("patientMsg").textContent="已同步到全局病例。"};
 ["patientSpecies","patientBreed","patientWeight"].forEach(id=>$(id)?.addEventListener("input",sync));
 $("syncPatientBtn")?.addEventListener("click",sync);syncAll();window.syncPatientState=syncAll
}
function addGlobalCRIOutput(){
 const out=$("#criOut"),btn=$("#criBtn");if(!out||!btn||btn.dataset.nursePatch)return;btn.dataset.nursePatch="1";
 const old=btn.onclick;btn.onclick=function(){if(typeof old==="function")old();setTimeout(()=>{
  const w=n("criW"),t=n("criTarget"),c=n("criConc"),V=n("criVol"),rate=n("criRate"),unit=$("#criUnit")?.value;
  if(!w||!t||!c||!V)return;
  const mgph=unit==="µg/kg/min"?t*w*0.06:unit==="µg/kg/h"?t*w/1000:t*w;
  const r=rate||((mgph*60)/(c*V)),totalMg=mgph*V/r,stock=totalMg/c;
  out.insertAdjacentHTML("beforeend",`<div class="result"><b>护士配液指令</b><br>在 <b>${V.toFixed(1)} mL</b> 最终配液中加入原液 <b>${stock.toFixed(3)} mL</b>，按最终体积校准；输注泵速 <b>${r.toFixed(3)} mL/h</b>。<br><span class="small">床旁执行前复核药物浓度、配伍稳定性、管路死腔/吸附及独立双人核对。</span></div>`);
 },0)}
}
function addGasTemp(){
 const sec=$("#gas");if(!sec||sec.querySelector("#gasTemp5"))return;
 const c=document.createElement("div");c.className="card";c.id="gasTemp5";c.innerHTML=`<h3>实际体温校正</h3><div class="grid"><label>患者实际体温 ℃<input id="gasTemp" type="number" step=".1" placeholder="37.0"></label><div><button class="primary" id="gasTempBtn">计算温度校正</button><div id="gasTempOut"></div></div></div><div class="info">默认假设分析仪报告为37 ℃；不同仪器/实验室可能采用不同温度校正策略，床旁报告和仪器说明书优先。</div>`;
 sec.appendChild(c);
 $("#gasTempBtn").onclick=()=>{const T=n("gasTemp"),ph=n("gasPh"),co2=n("gasPco2"),o2=n("gasPo2");if(T===null||ph===null||co2===null){$("#gasTempOut").innerHTML="<div class='bad'>至少输入体温、pH、PaCO₂。</div>";return}const d=T-37,pht=ph-0.0147*d,co2t=co2*Math.pow(10,0.019*d),o2t=o2===null?null:o2*Math.pow(10,-0.015*d);$("#gasTempOut").innerHTML=`<div class="result">估算校正：pH <b>${pht.toFixed(3)}</b>；PaCO₂ <b>${co2t.toFixed(1)}</b> mmHg${o2t===null?"":`；PaO₂ <b>${o2t.toFixed(1)}</b> mmHg`}。<br><span class="small">仅作计算辅助，不覆盖设备原生温度校正。</span></div>`}
}
function addNaRate(){
 const sec=$("#electro");if(!sec||sec.querySelector("#naRate5"))return;
 const c=document.createElement("div");c.className="card";c.id="naRate5";c.innerHTML=`<h3>钠变化率 / 神经系统安全监测</h3><div class="grid"><label>起始 Na mmol/L<input id="na0" type="number" step=".1"></label><label>当前 Na mmol/L<input id="na1" type="number" step=".1"></label><label>经过小时数<input id="naHours" type="number" step=".1"></label><div><button class="primary" id="naRateBtn">计算</button><div id="naRateOut"></div></div></div><div class="info">工具将0.5 mmol/L/h作为保守警戒线；实际目标速度需按急慢性、神经症状和病因制定。</div>`;
 sec.appendChild(c);
 $("#naRateBtn").onclick=()=>{const a=n("na0"),b=n("na1"),h=n("naHours");if(a===null||b===null||!h){$("#naRateOut").innerHTML="<div class='bad'>请完整输入两个钠值和时间。</div>";return}const r=(b-a)/h;$("#naRateOut").innerHTML=`<div class="result">Na变化率：<b>${r.toFixed(3)} mmol/L/h</b>。</div>${Math.abs(r)>0.5?"<div class='bad'>超过0.5 mmol/L/h：提示过快纠正风险。低钠纠正需警惕渗透性脱髓鞘；高钠快速下降需警惕脑水肿。立即复核方案并增加监测。</div>":"<div class='good'>当前变化率未超过工具设定警戒线。</div>"}`}
}
function addCPRAudio(){
 const sec=$("#emergency");if(!sec||sec.dataset.audioPatch)return;sec.dataset.audioPatch="1";
 const card=[...sec.querySelectorAll(".card")].find(x=>x.textContent.includes("CPR"));if(!card)return;
 const bar=card.querySelector(".toolbar"),timerEl=$("#cprTimer"),start=$("#cprStart"),stop=$("#cprStop"),reset=$("#cprReset");if(!bar||!timerEl||!start||!stop||!reset)return;
 const wrap=document.createElement("div");wrap.className="info";wrap.innerHTML=`<b>CPR按压节拍器与2分钟周期</b><div class="toolbar"><select id="cprBpm"><option>100</option><option selected>110</option><option>120</option></select><button class="secondary" id="cprBeat">开启/关闭音频节拍</button></div><div id="cprAudioStatus" class="small">首次点击后浏览器才允许播放音频。</div>`;
 bar.after(wrap);
 let ctx=null,beatTimer=null,beepOn=false;
 function beep(){if(!ctx)return;const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.value=880;g.gain.setValueAtTime(.0001,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.08,ctx.currentTime+.005);g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+.045);o.connect(g).connect(ctx.destination);o.start();o.stop(ctx.currentTime+.05)}
 $("#cprBeat").onclick=()=>{if(beepOn){clearInterval(beatTimer);beatTimer=null;beepOn=false;$("#cprAudioStatus").textContent="节拍器已关闭";return}ctx=ctx||new(window.AudioContext||window.webkitAudioContext)();const bpm=parseInt($("#cprBpm").value,10);beep();beatTimer=setInterval(beep,60000/bpm);beepOn=true;$("#cprAudioStatus").textContent=`节拍器运行：${bpm} 次/分钟`};
 $("#cprBpm").onchange=()=>{if(beepOn){clearInterval(beatTimer);const bpm=parseInt($("#cprBpm").value,10);beatTimer=setInterval(beep,60000/bpm)}};
 let remain=120,running=false,tick=null;
 const render=()=>timerEl.textContent=String(Math.floor(remain/60)).padStart(2,"0")+":"+String(remain%60).padStart(2,"0");
 const announce=()=>{const msg="两分钟周期结束，请评估心律和脉搏，更换按压人员并尽快恢复胸外按压。";try{speechSynthesis.cancel();speechSynthesis.speak(new SpeechSynthesisUtterance(msg))}catch{}$("#cprAudioStatus").textContent=msg};
 start.onclick=()=>{if(running)return;running=true;tick=setInterval(()=>{remain--;render();if(remain<=0){clearInterval(tick);tick=null;running=false;announce()}},1000);render()};
 stop.onclick=()=>{running=false;clearInterval(tick);tick=null;render()};
 reset.onclick=()=>{running=false;clearInterval(tick);tick=null;remain=120;render();$("#cprAudioStatus").textContent="已重置为2分钟周期"};
 render();
}
function addClinicalNew(){
 function add(id,title,html){if($(id))return;const s=document.createElement("section");s.id=id;s.className="view";s.innerHTML=`<div class="card"><h2>${title}</h2>${html}</div>`;document.querySelector("main")?.appendChild(s);nav(id,title,"ai")}
 add("cardio","心脏影像 / VHS / VLAS / ACVIM","<div class='grid'><label>VHS 椎体单位<input id='vhs' type='number' step='.01'></label><label>VLAS 椎体单位<input id='vlas' type='number' step='.01'></label><label>临床症状<select id='cardioSigns'><option>无临床症状</option><option>有心脏病相关症状</option></select></label></div><button class='primary' id='cardioBtn'>分期辅助</button><div id='cardioOut'></div><div class='info'>VHS/VLAS只能辅助判断心脏重构；ACVIM分期不能仅凭两个影像数值决定，需结合超声、胸片、症状及既往CHF证据。</div>");
 $("#cardioBtn").onclick=()=>{const v=n("vhs"),l=n("vlas"),s=$("#cardioSigns").value;let r="需进一步资料";if(s==="有心脏病相关症状")r="若已确诊MMVD且存在CHF证据，临床分期需考虑C；D需依据标准治疗下的难治性CHF证据。";else if(v!==null&&l!==null)r=(v<10.5&&l<2.3)?"若确诊MMVD且无明显重构：倾向B1。":"存在心脏重构可能：需结合超声/胸片和临床证据评估B2。";$("#cardioOut").innerHTML=`<div class='result'>VHS：${v??"—"}；VLAS：${l??"—"}<br><b>${r}</b></div>`}
 add("effusion","胸腹水 / 心包积液性质鉴别","<div class='grid'><label>积液总蛋白 g/dL<input id='efTP' type='number' step='.1'></label><label>有核细胞/μL<input id='efTNCC' type='number'></label><label>比重<input id='efSG' type='number' step='.001'></label><label>积液TG mg/dL<input id='efTG' type='number'></label><label>血清TG mg/dL<input id='serTG' type='number'></label><label>积液肌酐 mg/dL<input id='efCr' type='number'></label><label>血清肌酐 mg/dL<input id='serCr' type='number'></label><label>积液胆红素 mg/dL<input id='efBil' type='number'></label><label>血清胆红素 mg/dL<input id='serBil' type='number'></label></div><button class='primary' id='efBtn'>判读</button><div id='efOut'></div>");
 $("#efBtn").onclick=()=>{const tp=n("efTP"),tn=n("efTNCC"),sg=n("efSG"),et=n("efTG"),st=n("serTG"),ec=n("efCr"),sc=n("serCr"),eb=n("efBil"),sb=n("serBil"),o=[];if(et!==null&&st!==null&&et>st)o.push("乳糜液可能：积液TG高于血清TG支持，需结合乳白外观和细胞学。");if(ec!==null&&sc!==null&&ec>sc)o.push("尿腹可能：积液肌酐高于血清支持。");if(eb!==null&&sb!==null&&eb>sb)o.push("胆汁性腹膜炎可能：积液胆红素高于血清支持。");if(tp!==null&&tp<2.5&&sg!==null&&sg<1.015)o.push("更接近低蛋白低细胞漏出液。");else if(tp!==null&&tp>=2.5)o.push("蛋白较高：考虑修饰性漏出液/渗出液，需结合细胞分类、细胞学和病因。");$("#efOut").innerHTML=`<div class='result'>${o.length?o.map(x=>`<div>• ${esc(x)}</div>`).join(""):"目前参数不足以可靠分类。"}<div class='small'>积液分类不能靠单一阈值完成；应结合细胞学、培养、影像和临床背景。</div></div>`}
 add("iris","IRIS CKD 分期辅助","<div class='grid'><label>肌酐 μmol/L<input id='irisCr' type='number'></label><label>SDMA μg/dL<input id='irisSdma' type='number'></label><label>UPC<input id='irisUpc' type='number' step='.01'></label><label>收缩压 mmHg<input id='irisBp' type='number'></label></div><button class='primary' id='irisBtn'>分期/亚分级</button><div id='irisOut'></div>");
 $("#irisBtn").onclick=()=>{const cr=n("irisCr"),sd=n("irisSdma"),up=n("irisUpc"),bp=n("irisBp");let stage="需结合重复检测与水合状态确认";if(sd!==null)stage=sd<18?"Stage 1/非氮质血症范围":sd<=25?"Stage 2可能":sd<=44?"Stage 3可能":"Stage 4可能";else if(cr!==null)stage=cr<125?"Stage 1可能":cr<=250?"Stage 2可能":cr<=440?"Stage 3可能":"Stage 4可能";const p=up===null?"UPC未输入":up<0.2?"蛋白尿阴性":up<0.5?"蛋白尿临界":"蛋白尿阳性方向，按犬猫物种阈值亚分级";const b=bp===null?"血压未输入":bp<140?"血压低风险":bp<160?"高血压风险":bp<180?"高血压":"严重高血压风险";$("#irisOut").innerHTML=`<div class='result'><b>${stage}</b><br>${p}<br>${b}<div class='small'>IRIS分期应在稳定、充分水合状态下重复评估；肌酐/SDMA不能脱离尿检、趋势和实验室方法单独定级。</div></div>`}
 add("ladd","局麻药最大剂量 / LADD","<div class='grid'><label>物种<select id='laddSp'><option>犬</option><option>猫</option></select></label><label>体重 kg<input id='laddW' type='number' step='.01'></label><label>药物<select id='laddDrug'><option>利多卡因</option><option>布比卡因</option></select></label><label>浓度 mg/mL<input id='laddConc' type='number' step='.01'></label></div><button class='primary' id='laddBtn'>计算保守上限</button><div id='laddOut'></div><div class='warn'>此处为保守数学上限参考，不等同于每种神经阻滞/局部浸润的推荐剂量；必须按给药部位、总量、联合局麻药和患者状态复核。</div>");
 $("#laddBtn").onclick=()=>{const sp=$("#laddSp").value,w=n("laddW"),c=n("laddConc"),d=$("#laddDrug").value;if(!w||!c)return;const mgkg=d==="利多卡因"?(sp==="猫"?4:6):(sp==="猫"?1:2),mg=w*mgkg;$("#laddOut").innerHTML=`<div class='result'>${d}：按保守${mgkg} mg/kg参考，上限约<b>${mg.toFixed(2)} mg</b>；${c} mg/mL制剂约<b>${(mg/c).toFixed(2)} mL</b>。多点注射必须计算总量。</div>`}
 add("fast","AFAST / TFAST / UOP 监测","<div class='grid'><label>时间点<input id='fastTime' placeholder='如14:00'></label><label>尿量 mL<input id='uopVol' type='number' step='.1'></label><label>观察时长 h<input id='uopHours' type='number' step='.1'></label><label>体重 kg<input id='uopW' type='number' step='.01'></label></div><div class='checklist'><label><input type='checkbox'> DH</label><label><input type='checkbox'> Hepato-renal</label><label><input type='checkbox'> Cysto-colic</label><label><input type='checkbox'> Pericardial</label><label><input type='checkbox'> Pleural</label></div><button class='primary' id='uopBtn'>计算UOP</button><div id='uopOut'></div><div class='info'>AFAST/TFAST为定点超声监测框架，不能替代完整腹部/胸部超声。</div>");
 $("#uopBtn").onclick=()=>{const v=n("uopVol"),h=n("uopHours"),w=n("uopW");if(v===null||!h||!w){$("#uopOut").innerHTML="<div class='bad'>请输入尿量、时间和体重。</div>";return}const r=v/(h*w);$("#uopOut").innerHTML=`<div class='${r<1?"warn":"result"}'>UOP：<b>${r.toFixed(2)} mL/kg/h</b>。${r<1?"低于常用少尿警戒水平，需结合输入量、肾功能、循环状态和导尿管通畅性复核。":"当前未达到<1 mL/kg/h的常用少尿警戒线。"}</div>`}
 add("discharge","住院 / 出院文书","<div class='grid'><label>住院输液/泵挂牌<textarea id='labelText' placeholder='药物、最终浓度、泵速、开始时间'></textarea></label><label>宠主出院医嘱<textarea id='disText' placeholder='把专业治疗计划粘贴到这里'></textarea></label></div><button class='primary' id='labelBtn'>生成护士挂牌</button><button class='secondary' id='disBtn'>生成宠主白话版</button><div id='docOut'></div>");
 $("#labelBtn").onclick=()=>$("#docOut").innerHTML=`<div class='result'><h3>输液泵挂牌</h3><pre style='white-space:pre-wrap;font:inherit'>${esc($("#labelText").value)}</pre><div class='warn'>执行前核对患者、药物、浓度、泵速、通路和双人核对要求。</div></div>`;
 $("#disBtn").onclick=()=>{const x=$("#disText").value.trim();if(!x){$("#docOut").innerHTML="<div class='bad'>请先输入专业医嘱。</div>";return}$("#docOut").innerHTML=`<div class='result'><h3>宠主版说明</h3><p>${esc(x).replace(/[；;]/g,"。<br>")}</p><div class='small'>仅做语言简化，不改变原处方剂量和疗程。</div></div>`}
}
async function addLabSection(){
 if(document.getElementById("labAnalyzer"))return;
 const nav=document.getElementById("nav"),main=document.querySelector("main");if(!nav||!main)return;
 const b=document.createElement("button");b.dataset.v="labAnalyzer";b.textContent="检验仪器/参考区间";nav.appendChild(b);
 const sec=document.createElement("section");sec.id="labAnalyzer";sec.className="view";
 sec.innerHTML=`<div class="card"><h2>检验仪器 / 厂家参考区间工作站</h2><div class="info">参考区间优先使用厂家当前说明书/报告；不同仪器、方法、试剂和实验室可存在差异。未取得厂家公开参考区间的型号不会由系统猜范围。</div><div class="grid"><label>厂家<select id="labMaker"></select></label><label>型号<select id="labModel"></select></label><label>物种<select id="labSpecies"><option>犬</option><option>猫</option><option>其他</option></select></label><label>年龄组<select id="labAge"><option>成年</option><option>老年</option><option>幼年</option></select></label></div><div id="labMeta" class="result"></div><div class="toolbar"><input id="labQ" placeholder="检索项目，如 ALT / CREA / K / Na"><button class="primary" id="labRefresh">载入参考区间</button></div><div id="labTable" style="overflow:auto"></div><div class="warn">实际检验报告上的参考区间优先级最高。</div></div>`;
 main.appendChild(sec);b.addEventListener("click",()=>activate("labAnalyzer"));
 let data;try{const r=await fetch("data/lab_analyzers_5.0.json?v=5.0",{cache:"no-store"});if(!r.ok)throw new Error("HTTP "+r.status);data=await r.json()}catch(e){$("#labMeta").innerHTML=`<div class="bad">检验仪器数据库读取失败：${esc(e.message)}</div>`;return}
 const makers=[...new Set((data.analyzers||[]).map(x=>x.manufacturer))],ms=$("#labMaker"),xs=$("#labModel");ms.innerHTML=makers.map(x=>`<option>${esc(x)}</option>`).join("");
 function render(){const x=(data.analyzers||[]).find(a=>a.id===xs.value);if(!x)return;$("#labMeta").innerHTML=`<b>${esc(x.manufacturer)} · ${esc(x.model)}</b><br>${esc(x.origin||"")}<br>检测：${esc((x.tests||[]).join("、"))}<br>${x.reference_intervals?.status==="official"?"<span class='pill'>官方参考区间已录入</span>":"<span class='pill'>暂无可核验官方参考区间</span>"}`;let rows=x.reference_intervals?.values||[],q=($("#labQ").value||"").trim().toUpperCase(),sp=$("#labSpecies").value,age=$("#labAge").value.toLowerCase();rows=rows.filter(r=>(!q||String(r.analyte).toUpperCase().includes(q))&&(!r.species||r.species===sp)&&(!r.age_group||r.age_group==="all"||String(r.age_group).includes(age)));$("#labTable").innerHTML=rows.length?`<table><thead><tr><th>项目</th><th>单位</th><th>下限</th><th>上限</th><th>备注</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${esc(r.analyte)}</td><td>${esc(r.unit)}</td><td>${r.low??""}</td><td>${r.high??""}</td><td>${esc(r.note||"")}</td></tr>`).join("")}</tbody></table>`:"<div class='muted'>该厂家/型号/物种目前没有可核验的官方参考区间。</div>"}
 function models(){xs.innerHTML=(data.analyzers||[]).filter(x=>x.manufacturer===ms.value).map(x=>`<option value="${esc(x.id)}">${esc(x.model)}</option>`).join("");render()}
 ms.onchange=models;xs.onchange=render;$("#labRefresh").onclick=render;$("#labQ").oninput=render;$("#labSpecies").onchange=render;$("#labAge").onchange=render;models()
}
function addPWA(){if(!("serviceWorker"in navigator))return;let link=document.querySelector('link[rel="manifest"]');if(!link){link=document.createElement("link");link.rel="manifest";link.href="manifest.json";document.head.appendChild(link)}window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}),{once:true})}
function main(){bindNav();patientState();addGlobalCRIOutput();addGasTemp();addNaRate();addCPRAudio();addClinicalNew();addLabSection();addPWA()}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(main,100),{once:true});else setTimeout(main,100);
})();