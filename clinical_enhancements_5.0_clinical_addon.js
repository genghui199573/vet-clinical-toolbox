/* Vet Clinical Toolbox 5.0 — Clinical Integration Add-on
 * Keeps the project version at 5.0. Does not replace the existing 5.0 engine or data files.
 * Native ES6. Intended to be loaded after clinical_enhancements_5.0.js.
 */
(function(){
  "use strict";
  const $=id=>document.getElementById(id);
  const num=v=>{const x=parseFloat(v);return Number.isFinite(x)?x:null};
  const esc=s=>String(s??"").replace(/[&<>\"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
  const STATE_KEY="vetPatientState5";
  const DEFAULT={species:"犬",breed:"",weight:null,age:null,pcv:null,temp:null,albumin:null,na:null,naPrev:null,naHours:null,hr:null,rr:null,sbp:null,spo2:null,glucose:null,k:null,cl:null,hco3:null,creatinine:null,sdma:null,urineMl:null,urineHours:null};
  let state=Object.assign({},DEFAULT);
  try{state=Object.assign({},DEFAULT,JSON.parse(localStorage.getItem(STATE_KEY)||"{}"));}catch(e){}
  function syncState(patch,reason){Object.assign(state,patch);window.patientState=state;try{localStorage.setItem(STATE_KEY,JSON.stringify(state));}catch(e){};document.dispatchEvent(new CustomEvent("vet:patientState",{detail:{state:Object.freeze(Object.assign({},state)),reason:reason||"update"}}));}
  function read(id){return $(id)?.value??"";}
  function write(id,v){const e=$(id);if(e&&v!==null&&v!==undefined&&v!=="")e.value=v;}
  function collect(){
    const p={};
    if($("patientSpecies"))p.species=read("patientSpecies");
    if($("patientBreed"))p.breed=read("patientBreed");
    if($("patientWeight"))p.weight=num(read("patientWeight"));
    if($("caseAge"))p.age=read("caseAge");
    ["pcv","temp","albumin","na","naPrev","naHours","hr","rr","sbp","spo2","glucose","k","cl","hco3","creatinine","sdma","urineMl","urineHours"].forEach(k=>{const e=$(k)||$("patient"+k.charAt(0).toUpperCase()+k.slice(1));if(e&&e.value!=="")p[k]=num(e.value)});
    syncState(p,"workbench-input");
  }
  function injectStyle(){if($("vet50AddonStyle"))return;const s=document.createElement("style");s.id="vet50AddonStyle";s.textContent=`
    .v50-addon-danger{background:#fef2f2!important;border:2px solid #dc2626!important;color:#991b1b!important;animation:v50flash .9s infinite}
    .v50-addon-warn{background:#fffbeb!important;border:1px solid #f59e0b!important;color:#854d0e!important}
    .v50-addon-ok{background:#f0fdf4!important;border:1px solid #86efac!important;color:#166534!important}
    .v50-addon-card{margin-top:10px;padding:11px;border-radius:10px}
    @keyframes v50flash{50%{box-shadow:0 0 0 4px rgba(220,38,38,.22)}}
    @media print{.v50-no-print{display:none!important}.v50-print-card{display:block!important}}
  `;document.head.appendChild(s)}
  function card(parent,id,title,html){if($(id))return $(id);const c=document.createElement("div");c.id=id;c.className="card v50-print-card";c.innerHTML=`<h3>${title}</h3>${html}`;parent.appendChild(c);return c;}

  // 1) patientState event bus while preserving the original 5.0 localStorage state.
  function installPatientBus(){
    ["patientSpecies","patientBreed","patientWeight","caseSpecies","caseBreed","caseWeight","caseAge"].forEach(id=>$(id)?.addEventListener("input",collect));
    $("syncPatientBtn")?.addEventListener("click",()=>{collect();renderPatientBanner()});
    window.getVetPatientState=()=>Object.assign({},state);
    window.setVetPatientState=(patch,reason)=>{syncState(patch,reason||"manual");renderPatientBanner()};
    window.addEventListener("load",()=>{write("patientSpecies",state.species);write("patientBreed",state.breed);write("patientWeight",state.weight);write("caseSpecies",state.species);write("caseBreed",state.breed);write("caseWeight",state.weight);document.dispatchEvent(new CustomEvent("vet:patientState",{detail:{state:Object.freeze(Object.assign({},state)),reason:"initial"}}));renderPatientBanner()});
  }
  function renderPatientBanner(){
    const home=$("home");if(!home)return;const old=$("v50PatientBanner");if(old)old.remove();const b=document.createElement("div");b.id="v50PatientBanner";b.className="info";b.innerHTML=`<b>全局患宠状态</b>：${esc(state.species||"未设")} · ${state.weight?esc(state.weight)+" kg":"体重未设"} · ${esc(state.breed||"未设品种")}<br><span class="small">计算器通过 vet:patientState 联动；原有5.0数据结构保持不变。</span>`;home.querySelector(".card")?.appendChild(b);
  }

  // 2) feline / MDR1 safety rules attached to dose section.
  function installDrugSafety(){
    const sec=$("dose");if(!sec||$("v50DrugSafety"))return;const c=card(sec,"v50DrugSafety","物种安全锁 / 极量警告",`<div id="v50DrugSafetyOut" class="v50-addon-card v50-addon-ok">未触发安全锁。</div>`);
    function check(){
      const species=read("doseSpecies")||state.species, breed=(read("doseBreed")||state.breed).toLowerCase(), drug=(read("doseDrug")||"").toLowerCase(), dose=num(read("doseValue")), unit=read("doseUnit");
      const out=$("v50DrugSafetyOut");let msgs=[],level="ok";
      const cat=["猫","cat"].some(x=>species.toLowerCase().includes(x));
      if(cat&&["对乙酰氨基酚","acetaminophen","paracetamol","菊酯","permethrin","pyrethrin","pyrethroid"].some(x=>drug.includes(x))){msgs.push("猫禁用/高危：对乙酰氨基酚及菊酯/拟除虫菊酯类触发硬性红线。不要继续按犬剂量计算。");level="danger"}
      if(cat&&["恩诺沙星","enrofloxacin"].some(x=>drug.includes(x))&&unit==="mg/kg/day"&&dose!==null&&dose>5){msgs.push("猫恩诺沙星：每日总剂量 >5 mg/kg 触发本工具红线；考虑视网膜毒性，停止计算并复核替代方案。");level="danger"}
      if(["伊维菌素","ivermectin","阿维菌素","avermectin","莫昔克丁","moxidectin"].some(x=>drug.includes(x))&&["柯基","corgi","边牧","border collie","喜乐蒂","sheltie","澳牧","australian shepherd","牧羊犬"].some(x=>breed.includes(x))){msgs.push("MDR1/ABCB1 高风险提示：品种与药物组合存在潜在神经毒性风险；应核对个体基因型、药物和剂量。不要仅凭品种推断基因型。");level="danger"}
      if(!msgs.length)msgs.push("当前输入未触发内置红线。仍需核对适应证、剂量范围、制剂浓度和监测要求。");out.className=`v50-addon-card v50-addon-${level}`;out.innerHTML=msgs.map(x=>`<div>${esc(x)}</div>`).join("");
    }
    ["doseSpecies","doseBreed","doseDrug","doseValue","doseUnit"].forEach(id=>$(id)?.addEventListener("input",check));
    check();
  }

  // 3) Shock bolus: explicit fractionated resuscitation and reassessment checklist.
  function installShock(){
    const sec=$("shock");if(!sec||$("v50ShockBolus"))return;const c=card(sec,"v50ShockBolus","休克晶体液：分次 Bolus 安全模块",`<div class="grid"><label>物种<select id="v50ShockSpecies"><option>犬</option><option>猫</option></select></label><label>体重 kg<input id="v50ShockWeight" type="number" step=".01"></label><div><button class="primary" id="v50ShockBtn">计算分次 Bolus</button></div></div><div id="v50ShockOut"></div><div class="warn"><b>强制复评：</b>每次 Bolus 后听诊肺音，并复评 CRT、心率、脉搏质量、血压、呼吸频率/努力和乳酸趋势；出现容量过负荷迹象应停止盲目追加。</div>`);
    write("v50ShockSpecies",state.species&&state.species.includes("猫")?"猫":"犬");write("v50ShockWeight",state.weight);
    $("v50ShockBtn").onclick=()=>{const w=num(read("v50ShockWeight")),s=read("v50ShockSpecies");if(!(w>0)){ $("v50ShockOut").innerHTML="<div class='bad'>请输入有效体重。</div>";return}const r=s==="猫"?[10,15]:[10,20];$("v50ShockOut").innerHTML=`<div class='result'>${s}分次 Bolus：<b>${r[0]*w}–${r[1]*w} mL/次</b>（${r[0]}–${r[1]} mL/kg），建议15–20分钟内给完，随后重新评估。</div>`};
  }

  // 4) Blood gas + albumin-corrected AG.
  function installGas(){
    const sec=$("gas");if(!sec||$("v50GasSafety"))return;const c=card(sec,"v50GasSafety","血气 / 低白蛋白 AG 校正 / 实际体温",`<div class="grid"><label>Na mmol/L<input id="v50Na" type="number" step=".1"></label><label>Cl mmol/L<input id="v50Cl" type="number" step=".1"></label><label>HCO₃⁻ mmol/L<input id="v50Hco3" type="number" step=".1"></label><label>Albumin g/dL<input id="v50Alb" type="number" step=".1"></label><label>实际体温 ℃<input id="v50Temp" type="number" step=".1" value="37"></label></div><button class="primary" id="v50GasBtn">计算</button><div id="v50GasOut"></div><div class="info">AG校正采用：实测AG + 2.5 × (4.0 − Albumin)。血气温度修正受分析仪算法影响，设备原生报告优先。</div>`);
    $("v50GasBtn").onclick=()=>{const na=num(read("v50Na")),cl=num(read("v50Cl")),h=num(read("v50Hco3")),a=num(read("v50Alb"));if([na,cl,h,a].some(x=>x===null)){ $("v50GasOut").innerHTML="<div class='bad'>请完整输入 Na、Cl、HCO₃⁻、Albumin。</div>";return}const ag=na-cl-h,cor=ag+2.5*(4-a);$("v50GasOut").innerHTML=`<div class='result'>实测 AG：<b>${ag.toFixed(1)}</b> mmol/L；低白蛋白校正 AG：<b>${cor.toFixed(1)}</b> mmol/L。</div>`};
  }

  // 5) Sodium direction-aware safety monitor.
  function installNa(){
    const sec=$("electro");if(!sec||$("v50NaSafety"))return;const c=card(sec,"v50NaSafety","Na 变化速度：双向神经安全红线",`<div class="grid"><label>方向<select id="v50NaDirection"><option value="hypo">低钠：纠正中</option><option value="hyper">高钠：降钠中</option></select></label><label>起始 Na<input id="v50Na0" type="number" step=".1"></label><label>当前 Na<input id="v50Na1" type="number" step=".1"></label><label>经过小时数<input id="v50NaH" type="number" step=".1"></label></div><button class="primary" id="v50NaBtn">计算变化率</button><div id="v50NaOut"></div>`);
    $("v50NaBtn").onclick=()=>{const a=num(read("v50Na0")),b=num(read("v50Na1")),h=num(read("v50NaH")),d=read("v50NaDirection");if(a===null||b===null||!(h>0)){ $("v50NaOut").innerHTML="<div class='bad'>请输入完整参数。</div>";return}const r=(b-a)/h;const high=Math.abs(r)>0.5;const msg=d==="hypo"?"低钠过快升高：警惕渗透性脱髓鞘综合征风险。":"高钠过快下降：警惕脑水肿风险。";$("v50NaOut").innerHTML=high?`<div class='v50-addon-card v50-addon-danger'><b>红线：</b>${r.toFixed(3)} mmol/L/h。${msg}立即复核液体/补钠方案并增加监测。</div>`:`<div class='v50-addon-card v50-addon-ok'>变化率 ${r.toFixed(3)} mmol/L/h，未超过本工具0.5 mmol/L/h警戒线。</div>`};
  }

  // 6) CPR dose card tied to patientState and audio metronome.
  function installCPR(){
    const sec=$("emergency");if(!sec||$("v50CPRAddon"))return;const c=card(sec,"v50CPRAddon","CPR：全局体重剂量卡 + 100–120 bpm 节拍器",`<div id="v50CPRDoses" class="result">等待体重。</div><div class="toolbar"><select id="v50Bpm"><option>100</option><option selected>110</option><option>120</option></select><button class="secondary" id="v50BeatBtn">开启节拍器</button><button class="secondary" id="v50StopBeat">停止节拍器</button></div><div class="info">胸外按压按2分钟为一个周期组织复评。首次点击后浏览器才允许音频播放。</div>`);
    function render(){const w=num(state.weight);$("v50CPRDoses").innerHTML=w>0?`体重 ${w} kg：肾上腺素低剂量 0.01 mg/kg = <b>${(w*.01).toFixed(3)} mg</b>；高剂量 0.1 mg/kg = <b>${(w*.1).toFixed(3)} mg</b>；阿托品 0.04 mg/kg = <b>${(w*.04).toFixed(3)} mg</b>。<br><span class="small">mL 必须根据现场实际制剂浓度计算，不默认假定浓度。</span>`:"请先在病例工作台输入体重。"}
    render();document.addEventListener("vet:patientState",render);
    let ctx=null,timer=null;function beep(){if(!ctx)return;const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.value=880;g.gain.value=.035;o.connect(g).connect(ctx.destination);o.start();o.stop(ctx.currentTime+.04)}
    $("v50BeatBtn").onclick=()=>{ctx=ctx||new(window.AudioContext||window.webkitAudioContext)();if(ctx.state==="suspended")ctx.resume();clearInterval(timer);beep();timer=setInterval(beep,60000/Math.max(100,Math.min(120,parseInt(read("v50Bpm"),10)||110)));$("v50BeatBtn").textContent="节拍器运行中"};$("v50StopBeat").onclick=()=>{clearInterval(timer);timer=null;$("v50BeatBtn").textContent="开启节拍器"};
  }

  // 7) New compact clinical tools.
  function installNewTools(){
    const home=$("home");if(!home)return;const wrap=document.createElement("div");wrap.className="grid";
    const tools=[
      ["v50Cardio","VHS / VLAS / ACVIM犬MMVD辅助","<label>VHS<input id='v50VHS' type='number' step='.1'></label><label>VLAS<input id='v50VLAS' type='number' step='.1'></label><label>CHF临床症状<select id='v50CHF'><option>无</option><option>有</option></select></label><button class='primary' id='v50CardioBtn'>辅助判读</button><div id='v50CardioOut'></div>"],
      ["v50Effusion","胸腹水性质快速筛查","<label>积液TP g/dL<input id='v50EfTP' type='number' step='.1'></label><label>TNCC/μL<input id='v50EfN' type='number'></label><label>积液TG<input id='v50EfTG' type='number'></label><label>血清TG<input id='v50SeTG' type='number'></label><label>积液Cr<input id='v50EfCr' type='number'></label><label>血清Cr<input id='v50SeCr' type='number'></label><label>积液胆红素<input id='v50EfBil' type='number'></label><label>血清胆红素<input id='v50SeBil' type='number'></label><button class='primary' id='v50EfBtn'>筛查</button><div id='v50EfOut'></div>"],
      ["v50IRIS","IRIS CKD分期辅助","<label>物种<select id='v50IrisSp'><option>犬</option><option>猫</option></select></label><label>肌酐 mg/dL<input id='v50IrisCr' type='number' step='.01'></label><label>SDMA μg/dL<input id='v50IrisSdma' type='number' step='.1'></label><label>UPC<input id='v50UPC' type='number' step='.01'></label><label>SBP mmHg<input id='v50SBP' type='number'></label><button class='primary' id='v50IrisBtn'>辅助分期</button><div id='v50IrisOut'></div>"],
      ["v50Local","局麻药最大剂量（单药）","<label>物种<select id='v50LAsp'><option>犬</option><option>猫</option></select></label><label>药物<select id='v50LAd'><option>利多卡因</option><option>布比卡因</option></select></label><label>体重 kg<input id='v50LAw' type='number' step='.01'></label><label>制剂 mg/mL<input id='v50LAc' type='number' step='.1'></label><button class='primary' id='v50LABtn'>计算</button><div id='v50LAOut'></div>"],
      ["v50ILE","ILE 20% 解毒计算辅助","<label>体重 kg<input id='v50ILEw' type='number' step='.01'></label><label>Bolus mL/kg<input id='v50ILEb' value='1.5' type='number' step='.1'></label><label>CRI mL/kg/h<input id='v50ILEr' value='.25' type='number' step='.05'></label><label>持续 h<input id='v50ILEh' value='4' type='number' step='.5'></label><button class='primary' id='v50ILEBtn'>计算</button><div id='v50ILEOut'></div>"],
      ["v50UOP","每小时尿量 UOP","<label>体重 kg<input id='v50UOPw' type='number' step='.01'></label><label>尿量 mL<input id='v50UOPm' type='number' step='.1'></label><label>小时<input id='v50UOPh' type='number' step='.1'></label><button class='primary' id='v50UOPBtn'>计算</button><div id='v50UOPOut'></div>"],
      ["v50BSA","BSA / 化疗剂量","<label>体重 kg<input id='v50BSAw' type='number' step='.01'></label><label>化疗剂量 mg/m²<input id='v50ChemoD' type='number' step='.01'></label><label>制剂 mg/mL<input id='v50ChemoC' type='number' step='.01'></label><button class='primary' id='v50BSABtn'>计算</button><div id='v50BSAOut'></div>"],
      ["v50DKA","DKA 短效胰岛素 CRI 辅助","<label>体重 kg<input id='v50DKAw' type='number' step='.01'></label><label>目标胰岛素 U/kg/h<input id='v50DKAr' value='.1' type='number' step='.01'></label><label>胰岛素浓度 U/mL<input id='v50DKAc' value='1' type='number' step='.1'></label><button class='primary' id='v50DKABtn'>计算</button><div id='v50DKAOut'></div>"],
      ["v50Anti","ISCAID感染部位决策提示","<label>感染部位<select id='v50Site'><option>皮肤/软组织</option><option>尿路</option><option>呼吸道</option><option>胃肠道</option><option>伤口/咬伤</option><option>骨/关节</option><option>败血症</option></select></label><button class='primary' id='v50AntiBtn'>显示原则</button><div id='v50AntiOut'></div>"],
      ["v50Emesis","催吐决策器","<label>物种<select id='v50EmSp'><option>犬</option><option>猫</option></select></label><label>意识<select id='v50EmCon'><option>正常</option><option>异常</option></select></label><label>腐蚀性/石油烃/误吸风险<select id='v50EmRisk'><option>否</option><option>是</option></select></label><button class='primary' id='v50EmBtn'>判断</button><div id='v50EmOut'></div>"],
      ["v50Print","A4住院/输液泵卡","<p class='small'>生成原生浏览器打印页；不修改现有病例数据。</p><button class='primary' id='v50PrintBtn'>打印住院/泵卡</button>"]
    ];
    tools.forEach(([id,title,body])=>{const c=document.createElement("div");c.id=id;c.className="card";c.innerHTML=`<h3>${title}</h3>${body}`;wrap.appendChild(c)});
    home.appendChild(wrap);
    $("v50CardioBtn").onclick=()=>{const v=num(read("v50VHS")),l=num(read("v50VLAS")),ch=read("v50CHF")==="有";let x=ch?"若已有明确MMVD相关CHF证据，至少进入C阶段框架；D需有标准治疗下难治性证据。":(v!==null&&v>=10.5||l!==null&&l>=2.3)?"存在心脏重构可能，需结合超声/品种标准评估B2。":"若已确诊MMVD且无重构证据，更接近B1。";$("v50CardioOut").innerHTML=`<div class='result'>VHS ${v??"—"}；VLAS ${l??"—"}<br>${esc(x)}</div>`};
    $("v50EfBtn").onclick=()=>{const tp=num(read("v50EfTP")),nn=num(read("v50EfN")),t1=num(read("v50EfTG")),t2=num(read("v50SeTG")),c1=num(read("v50EfCr")),c2=num(read("v50SeCr")),b1=num(read("v50EfBil")),b2=num(read("v50SeBil"));let a=[];if(t1!==null&&t2!==null&&t1>t2)a.push("乳糜液倾向：积液TG高于血清TG。");if(c1!==null&&c2!==null&&c1>c2)a.push("尿腹倾向：积液肌酐高于血清肌酐。");if(b1!==null&&b2!==null&&b1>b2)a.push("胆汁性腹膜炎倾向：积液胆红素高于血清胆红素。");if(tp!==null&&nn!==null)a.push(tp<2.5&&nn<1500?"低蛋白/低细胞数，漏出液方向。":tp>=2.5&&nn>=1500?"蛋白及细胞数升高，修饰性漏出液/渗出液方向。":"需结合细胞学、比重和临床背景。");$("v50EfOut").innerHTML=`<div class='result'>${a.map(esc).join("<br>")||"请输入关键参数。"}</div>`};
    $("v50IrisBtn").onclick=()=>{const cr=num(read("v50IrisCr")),sd=num(read("v50IrisSdma"));let stage="无法仅凭当前输入确定";if(cr!==null)stage=cr<1.4?"肌酐 Stage 1 范围":cr<2.8?"肌酐 Stage 2 范围":cr<5?"肌酐 Stage 3 范围":"肌酐 Stage 4 范围";$("v50IrisOut").innerHTML=`<div class='result'><b>${stage}</b>${sd!==null?`；SDMA ${sd} μg/dL。`:""}</div><div class='warn'>IRIS CKD分期要求稳定患者、持续异常并结合尿检、影像、血压及蛋白尿；不能用单次肌酐/SDMA直接确诊CKD。</div>`};
    $("v50LABtn").onclick=()=>{const sp=read("v50LAsp"),d=read("v50LAd"),w=num(read("v50LAw")),c=num(read("v50LAc"));if(!(w>0&&c>0)){ $("v50LAOut").innerHTML="<div class='bad'>请输入体重和浓度。</div>";return}const max=d==="利多卡因"?(sp==="猫"?2:4):(sp==="猫"?1:2);$("v50LAOut").innerHTML=`<div class='result'>按工具保守上限 ${max} mg/kg：总量 <b>${(w*max).toFixed(2)} mg</b>；${(w*max/c).toFixed(2)} mL。</div><div class='warn'>混合局麻药毒性可累加；实际安全剂量还受注射部位、血管内误注风险、患者状态和联合药物影响。</div>`};
    $("v50ILEBtn").onclick=()=>{const w=num(read("v50ILEw")),b=num(read("v50ILEb")),r=num(read("v50ILEr")),h=num(read("v50ILEh"));if(!(w>0)){ $("v50ILEOut").innerHTML="<div class='bad'>请输入体重。</div>";return}$("v50ILEOut").innerHTML=`<div class='result'>Bolus <b>${(w*b).toFixed(1)} mL</b>；CRI <b>${(w*r).toFixed(1)} mL/h</b>；${h} h总量约 <b>${(w*(b+r*h)).toFixed(1)} mL</b>。</div><div class='warn'>ILE必须核对具体毒物适应证、禁忌证、脂质负荷和重复给药方案；本工具不替代毒理学会诊。</div>`};
    $("v50UOPBtn").onclick=()=>{const w=num(read("v50UOPw")),m=num(read("v50UOPm")),h=num(read("v50UOPh"));if(!(w>0&&h>0)){ $("v50UOPOut").innerHTML="<div class='bad'>请输入体重和小时数。</div>";return}const r=m/(w*h);$("v50UOPOut").innerHTML=`<div class='result'>UOP <b>${r.toFixed(3)} mL/kg/h</b>：${r===0?"无尿":r<1?"少尿方向":"未达到本工具少尿阈值"}。</div>`};
    $("v50BSABtn").onclick=()=>{const w=num(read("v50BSAw")),d=num(read("v50ChemoD")),c=num(read("v50ChemoC"));if(!(w>0)){ $("v50BSAOut").innerHTML="<div class='bad'>请输入体重。</div>";return}const bsa=.101*Math.pow(w,2/3);$("v50BSAOut").innerHTML=`<div class='result'>BSA ≈ <b>${bsa.toFixed(3)} m²</b>${d&&c?`；剂量 ${(bsa*d).toFixed(2)} mg；体积 ${(bsa*d/c).toFixed(2)} mL。`:""}</div><div class='warn'>化疗必须核对具体方案、血常规、生化、器官功能和给药途径。</div>`};
    $("v50DKABtn").onclick=()=>{const w=num(read("v50DKAw")),r=num(read("v50DKAr")),c=num(read("v50DKAc"));if(!(w>0&&r>0&&c>0)){ $("v50DKAOut").innerHTML="<div class='bad'>请输入完整参数。</div>";return}$("v50DKAOut").innerHTML=`<div class='result'>胰岛素 ${ (w*r).toFixed(3)} U/h；泵速 ${ (w*r/c).toFixed(3)} mL/h。</div><div class='warn'>DKA必须同步监测K+、P、血糖趋势、酸碱、容量和神经状态；不要单凭血糖机械调节。</div>`};
    const anti={"皮肤/软组织":"优先细胞学/培养并评估耐药风险。","尿路":"抗菌药前尽可能获取尿液培养/药敏；避免无指征广谱化。","呼吸道":"先区分病毒/炎症与细菌性肺炎；疑似细菌性肺炎优先培养和氧合评估。","胃肠道":"多数急性胃肠道疾病不需要经验性抗菌药；败血症/屏障破坏时按感染源处理。","伤口/咬伤":"彻底清创、引流和采样通常比盲目升级广谱药重要。","骨/关节":"优先采样培养，长期疗程需要明确感染证据和复评。","败血症":"尽快获取合适培养，同时稳定灌注/氧合并依据感染源和当地耐药谱选择经验方案。"};
    $("v50AntiBtn").onclick=()=>$("v50AntiOut").innerHTML=`<div class='info'>${esc(anti[read("v50Site")])}</div>`;
    $("v50EmBtn").onclick=()=>{const s=read("v50EmSp"),bad=read("v50EmCon")==="异常"||read("v50EmRisk")==="是";$("v50EmOut").innerHTML=bad?"<div class='v50-addon-danger'><b>不要催吐：</b>气道保护能力异常或存在高误吸/危险物质风险。优先稳定、气道评估和毒理学处理。</div>":s==="猫"?"<div class='v50-addon-warn'>猫催吐不能套用犬方案；必须明确适应证并选择合适药物/途径。</div>":"<div class='info'>仅在摄入时间短、物质可催吐、意识和气道保护正常且获益大于风险时考虑。</div>"};
    $("v50PrintBtn").onclick=()=>{const s=state,w=window.open("","_blank","width=900,height=700");if(!w){alert("请允许浏览器弹出窗口以打印。");return}w.document.write(`<!doctype html><html><head><meta charset='utf-8'><title>兽医临床住院/输液泵卡 5.0</title><style>@page{size:A4;margin:12mm}body{font-family:Arial,'Microsoft YaHei',sans-serif}.box{border:1px solid #222;padding:10px;margin:10px 0}.line{border-bottom:1px solid #999;padding:8px}</style></head><body><h1>兽医临床住院 / 输液泵卡</h1><div class='box'>物种：${esc(s.species)}　体重：${esc(s.weight||"")} kg　品种：${esc(s.breed||"")}</div><div class='box'><b>液体/药物医嘱</b><div class='line'>液体：</div><div class='line'>药物/添加量：</div><div class='line'>泵速：</div><div class='line'>开始/复核时间：</div></div><div class='box'><b>安全复核</b><p>□ 体重核实　□ 制剂浓度核实　□ 禁忌/过敏核实　□ 高警示药物双人复核　□ 泵速复核　□ 每次Bolus后重新评估</p></div><script>window.onload=()=>window.print()<\/script></body></html>`);w.document.close()};
  }

  function init(){injectStyle();installPatientBus();installDrugSafety();installShock();installGas();installNa();installCPR();installNewTools();renderPatientBanner();}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
