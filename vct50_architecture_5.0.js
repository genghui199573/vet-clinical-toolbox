/* Vet Clinical Toolbox 5.0-r08 · Architecture & UX layer
 * Information architecture only: navigation, clinical workflow, patient command center.
 */
(()=>{
  'use strict';
  const $=id=>document.getElementById(id);
  const groups=[
    ['核心工作流','home,case,clinical,ai'],
    ['急诊与治疗','emergency,shock,fluid,electro,anesthesia,surgery,pain,nutrition,transfusion,toxic'],
    ['检验与诊断','cbc,biochem,gas,ddx,labAnalyzer'],
    ['药物与知识','dose,cri,drugs,protocols,vaccine']
  ];
  function nav(){
    const n=$('nav'); if(!n||n.dataset.architectureReady)return;
    n.dataset.architectureReady='1';
    const buttons=[...n.querySelectorAll('button[data-v]')];
    groups.forEach(([title,ids])=>{
      const set=new Set(ids.split(','));
      const bs=buttons.filter(b=>set.has(b.dataset.v));
      if(!bs.length)return;
      const g=document.createElement('div');g.className='nav-group';
      const label=document.createElement('span');label.className='nav-group-label';label.textContent=title;g.appendChild(label);
      bs.forEach(b=>g.appendChild(b)); n.appendChild(g);
    });
    const used=new Set(groups.flatMap(x=>x[1].split(',')));
    const rest=[...n.querySelectorAll(':scope > button[data-v]')].filter(b=>!used.has(b.dataset.v));
    if(rest.length){const g=document.createElement('div');g.className='nav-group nav-group-more';const label=document.createElement('span');label.className='nav-group-label';label.textContent='其他';g.appendChild(label);rest.forEach(b=>g.appendChild(b));n.appendChild(g);}
  }
  function commandCenter(){
    const home=$('home'), panel=$('globalPatientPanel'); if(!home||!panel||$('vct50CommandCenter'))return;
    const c=document.createElement('div');c.id='vct50CommandCenter';c.className='card vct-command-center';
    c.innerHTML=`<div class="command-head"><div><div class="eyebrow">CLINICAL COMMAND CENTER · 5.0-r08</div><h2>临床指挥台</h2><p class="muted">围绕一个患者组织工作：患者状态 → 风险 → 问题 → 检查 → 治疗 → 监测 → 复评。</p></div><div id="commandPatientStatus" class="command-status">未建立患者</div></div>
      <div class="workflow-steps"><div><b>01</b><span>建立患者<br><small>Patient State</small></span></div><div><b>02</b><span>判断风险<br><small>ABCDE / Red Flags</small></span></div><div><b>03</b><span>形成问题<br><small>POMR / Differential</small></span></div><div><b>04</b><span>执行与复评<br><small>Tasks / Monitoring</small></span></div></div>
      <div class="command-actions"><button class="primary" data-go="case">病例工作台</button><button class="secondary" data-go="clinical">临床决策中心</button><button class="secondary" data-go="emergency">急诊 Cockpit</button><button class="secondary" data-go="ai">AI 临床助手</button></div>`;
    panel.after(c);
    c.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>document.querySelector(`#nav button[data-v="${b.dataset.go}"]`)?.click());
    const render=()=>{const p=window.VCT50_PATIENT_STATE||{};const el=$('commandPatientStatus');if(!el)return;el.innerHTML=p.patientId?`<b>${p.patientId}</b><br><span>${p.species||'犬'}${p.weight?` · ${p.weight} kg`:''}</span>`:'未建立患者';el.className='command-status '+(p.patientId?'is-active':'');};
    render();window.addEventListener('vct50:patient-change',render);
  }
  function polish(){
    if($('vct50-architecture-style'))return;
    const s=document.createElement('style');s.id='vct50-architecture-style';s.textContent=`
      :root{--shadow:0 4px 18px rgba(23,33,38,.06)}
      header{box-shadow:0 3px 16px rgba(0,0,0,.12)}
      header h1{letter-spacing:.2px}
      nav{display:flex;align-items:flex-start;gap:8px;padding:7px 10px;box-shadow:0 2px 10px rgba(0,0,0,.04)}
      .nav-group{display:flex;align-items:center;gap:5px;padding:3px 5px;border:1px solid var(--line);border-radius:12px;background:#f9fbfb;flex:0 0 auto}
      .nav-group-label{font-size:10px;font-weight:800;color:#64777d;padding:0 4px;white-space:nowrap}
      .nav-group button{border:0;background:transparent;padding:7px 9px;font-size:12px}
      .nav-group button.active{background:#dff7f2;border:0;color:var(--p2)}
      main{max-width:1320px;padding:14px 16px}
      .view>.card{box-shadow:var(--shadow)}
      .card{box-shadow:var(--shadow)}
      .patient-workspace-head,.command-head{display:flex;justify-content:space-between;align-items:flex-start;gap:14px}
      .eyebrow{font-size:10px;font-weight:900;letter-spacing:.08em;color:var(--p2);margin-bottom:2px}
      .patient-core-grid{grid-template-columns:repeat(4,minmax(210px,1fr))}
      .patient-actionbar{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:12px;padding:10px 12px;border:1px solid var(--line);border-radius:11px;background:#f7faf9}
      .patient-actionbar .toolbar{flex:0 0 auto}.patient-actionbar .toolbar>*{min-width:170px}
      .command-status{min-width:170px;text-align:right;padding:10px 12px;border:1px solid var(--line);border-radius:12px;background:#f7faf9;color:#64777d;font-size:12px}
      .command-status.is-active{background:#effaf7;border-color:#a5d8ce;color:#115e59}
      .workflow-steps{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:12px 0}
      .workflow-steps>div{display:flex;align-items:center;gap:9px;padding:10px;border:1px solid var(--line);border-radius:10px;background:#fbfdfd}
      .workflow-steps b{font-size:18px;color:var(--p)}.workflow-steps span{font-size:13px;font-weight:700}.workflow-steps small{font-weight:400;color:#718087}
      .command-actions{display:flex;gap:8px;flex-wrap:wrap}.command-actions button{min-width:150px}
      #globalPatientPanel{margin-bottom:10px}
      @media(max-width:1000px){.patient-core-grid{grid-template-columns:repeat(2,minmax(220px,1fr))}.workflow-steps{grid-template-columns:repeat(2,1fr)}}
      @media(max-width:700px){main{padding:9px}.patient-workspace-head,.command-head,.patient-actionbar{flex-direction:column}.patient-core-grid,.workflow-steps{grid-template-columns:1fr}.command-status{text-align:left;width:100%}.patient-actionbar .toolbar{width:100%}.patient-actionbar .toolbar>*{min-width:100%}.nav-group-label{display:none}.nav-group{border:0;background:transparent;padding:0}.nav-group button{padding:7px 9px}}
    `;document.head.appendChild(s);
  }
  function boot(){polish();nav();commandCenter();setTimeout(nav,600);setTimeout(nav,1600)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.VCT50_ARCHITECTURE={version:'5.0-r08',refresh:boot};
})();
