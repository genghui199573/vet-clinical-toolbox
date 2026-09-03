/* Vet Clinical Toolbox 5.0-r08 · Architecture / UX layer
 * Goal: one clinical workflow, no duplicate navigation, no sticky-header overlap,
 * responsive home layout, and low-friction first use.
 */
(()=>{
  'use strict';
  const $=id=>document.getElementById(id);
  const GROUPS=[
    ['核心工作流',['home','case','clinical','ai']],
    ['急诊与治疗',['emergency','shock','fluid','electro','anesthesia','surgery','pain','nutrition','transfusion','toxic']],
    ['检验与诊断',['cbc','biochem','gas','ddx','labAnalyzer']],
    ['药物与知识',['dose','cri','drugs','protocols','vaccine']]
  ];
  const labels={home:'首页',case:'病例工作台',clinical:'临床决策中心',ai:'AI临床助手',emergency:'急救/CPR',shock:'休克/乳酸',fluid:'液体',electro:'电解质',anesthesia:'麻醉',surgery:'围手术期',pain:'疼痛',nutrition:'营养',transfusion:'输血',toxic:'中毒',cbc:'CBC',biochem:'生化',gas:'血气',ddx:'鉴别诊断',labAnalyzer:'实验室参考',dose:'剂量/制剂',cri:'CRI',drugs:'药物数据库',protocols:'常见病治疗方案',vaccine:'疫苗/生物制品'};
  const aliases={
    '患者':['home','case'],'病例':['case'],'病历':['case'],'诊断':['clinical','ddx'],'鉴别':['ddx'],'ai':['ai'],'人工智能':['ai'],
    '急救':['emergency'],'cpr':['emergency'],'休克':['shock'],'乳酸':['shock'],'补液':['fluid'],'液体':['fluid'],'钾':['electro'],'电解质':['electro'],
    '麻醉':['anesthesia'],'手术':['surgery'],'疼痛':['pain'],'营养':['nutrition'],'输血':['transfusion'],'中毒':['toxic'],
    '血常规':['cbc'],'cbc':['cbc'],'生化':['biochem'],'血气':['gas'],'实验室':['labAnalyzer'],'参考范围':['labAnalyzer'],
    '剂量':['dose'],'复溶':['dose'],'抽取量':['dose'],'cri':['cri'],'药物':['drugs'],'疾病':['protocols'],'方案':['protocols'],'疫苗':['vaccine']
  };

  function setHeaderOffset(){
    const h=document.querySelector('header');
    if(h) document.documentElement.style.setProperty('--vct-header-h',Math.ceil(h.getBoundingClientRect().height)+'px');
  }

  function show(id){
    const target=$(id); if(!target)return;
    document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));
    target.classList.add('active');
    document.querySelectorAll('#nav button[data-v]').forEach(b=>b.classList.toggle('active',b.dataset.v===id));
    history.replaceState(null,'','#'+id);
    window.scrollTo({top:0,behavior:'smooth'});
    try{localStorage.setItem('vct50_last_view',id)}catch(_){ }
  }
  function bindNavigation(){
    document.querySelectorAll('#nav button[data-v]').forEach(b=>{
      if(b.dataset.vctNavBound==='1')return;
      b.dataset.vctNavBound='1';
      b.addEventListener('click',()=>show(b.dataset.v));
    });
    window.addEventListener('hashchange',()=>{const h=location.hash.slice(1);if($(h))show(h)});
  }

  function rebuildNav(){
    const n=$('nav'); if(!n)return;
    const buttons=[...n.querySelectorAll('button[data-v]')];
    if(!buttons.length)return;
    // Rebuild from the original buttons so there is never a duplicated ungrouped row.
    const activeId=document.querySelector('#nav button.active')?.dataset.v || location.hash.slice(1) || 'home';
    n.innerHTML='';
    const used=new Set();
    GROUPS.forEach(([title,ids])=>{
      const bs=ids.map(id=>buttons.find(b=>b.dataset.v===id)).filter(Boolean);
      if(!bs.length)return;
      const g=document.createElement('div');g.className='nav-group';
      const label=document.createElement('span');label.className='nav-group-label';label.textContent=title;
      g.appendChild(label); bs.forEach(b=>{used.add(b.dataset.v);g.appendChild(b)}); n.appendChild(g);
    });
    const rest=buttons.filter(b=>!used.has(b.dataset.v));
    if(rest.length){const g=document.createElement('div');g.className='nav-group nav-group-more';const label=document.createElement('span');label.className='nav-group-label';label.textContent='其他';g.appendChild(label);rest.forEach(b=>g.appendChild(b));n.appendChild(g)}
    n.querySelectorAll('button[data-v]').forEach(b=>b.classList.toggle('active',b.dataset.v===activeId));
    bindNavigation();
  }

  function movePatientPanelOutOfGrid(){
    const home=$('home');const panel=$('globalPatientPanel');
    if(!home||!panel)return;
    const hero=home.querySelector(':scope > .card');
    const grid=hero?.querySelector(':scope > .grid');
    if(hero&&grid&&panel.parentElement===grid)hero.insertBefore(panel,grid);
  }

  function addCommandCenter(){
    const home=$('home'); if(!home||$('vct50CommandCenter'))return;
    const anchor=home.querySelector(':scope > .card'); if(!anchor)return;
    const c=document.createElement('section');c.id='vct50CommandCenter';c.className='card vct-command-center';
    c.innerHTML=`<div class="command-head"><div><div class="eyebrow">CLINICAL COMMAND CENTER · 5.0-r08</div><h2>临床指挥台</h2><p class="muted">只记住一条路径：<b>建立患者 → 判断风险 → 形成问题 → 执行与复评</b>。</p></div><div id="commandPatientStatus" class="command-status">未建立患者</div></div>
      <div class="workflow-steps">
        <button type="button" data-go="home"><b>01</b><span>建立患者<small>Patient State</small></span></button>
        <button type="button" data-go="emergency"><b>02</b><span>判断风险<small>ABCDE / Red Flags</small></span></button>
        <button type="button" data-go="clinical"><b>03</b><span>形成问题<small>POMR / Differential</small></span></button>
        <button type="button" data-go="case"><b>04</b><span>执行与复评<small>Tasks / Monitoring</small></span></button>
      </div>
      <div class="command-launch"><label for="vct50ModuleSearch">快速打开工具 <span class="muted">输入“血气 / 剂量 / 猫传腹 / 麻醉 / AI…”</span></label><div class="command-search-row"><input id="vct50ModuleSearch" autocomplete="off" placeholder="搜索模块，不需要记住菜单位置"><button type="button" class="primary" id="vct50ModuleSearchBtn">打开</button></div><div id="vct50ModuleResults" class="module-results"></div></div>
      <div class="command-actions"><button class="primary" data-go="case">病例工作台</button><button class="secondary" data-go="clinical">临床决策中心</button><button class="secondary" data-go="emergency">急诊 Cockpit</button><button class="secondary" data-go="ai">AI 临床助手</button></div>`;
    anchor.after(c);
    c.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>show(b.dataset.go)));
    const render=()=>{const p=window.VCT50_PATIENT_STATE||{};const el=$('commandPatientStatus');if(!el)return;el.innerHTML=p.patientId?`<b>${escapeHtml(p.patientId)}</b><br><span>${escapeHtml(p.species||'犬')}${p.weight?` · ${escapeHtml(p.weight)} kg`:''}</span>`:'未建立患者';el.className='command-status '+(p.patientId?'is-active':'')};
    render();window.addEventListener('vct50:patient-change',render);
    bindModuleSearch();
  }
  function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function moduleSearch(q){
    q=String(q||'').trim().toLowerCase();
    if(!q)return [];
    const direct=[];
    Object.entries(aliases).forEach(([term,ids])=>{if(term.includes(q)||q.includes(term))ids.forEach(id=>direct.push(id))});
    Object.entries(labels).forEach(([id,label])=>{if(label.toLowerCase().includes(q)||id.toLowerCase().includes(q))direct.push(id)});
    // Disease/protocol queries should land in the protocol or differential workspace, not a dead search result.
    if(/传腹|猫瘟|细小|胰腺炎|尿闭|ckd|mmvd|dka|糖尿病|肺水肿/.test(q))direct.unshift('protocols');
    if(/呼吸困难|呕吐|腹泻|黄疸|倒地|抽搐|发热/.test(q))direct.unshift('ddx');
    return [...new Set(direct)].filter(id=>$(id));
  }
  function bindModuleSearch(){
    const input=$('vct50ModuleSearch'),btn=$('vct50ModuleSearchBtn'),out=$('vct50ModuleResults');if(!input||!btn||!out)return;
    const render=()=>{const ids=moduleSearch(input.value);out.innerHTML=ids.slice(0,6).map(id=>`<button type="button" class="module-result" data-go="${escapeHtml(id)}"><b>${escapeHtml(labels[id]||id)}</b><span>${escapeHtml(id==='protocols'?'疾病/综合征方案':id==='ddx'?'鉴别诊断框架':'临床工具')}</span></button>`).join('')||'<span class="muted">输入关键词后显示入口。</span>';out.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>show(b.dataset.go)))};
    if(btn.dataset.bound!=='1'){btn.dataset.bound='1';btn.addEventListener('click',()=>{const ids=moduleSearch(input.value);if(ids[0])show(ids[0]);render()});input.addEventListener('input',render);input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();const ids=moduleSearch(input.value);if(ids[0])show(ids[0])}});render()}
  }

  function polish(){
    if($('vct50-architecture-style'))return;
    const s=document.createElement('style');s.id='vct50-architecture-style';s.textContent=`
      :root{--shadow:0 4px 18px rgba(23,33,38,.06);--vct-header-h:64px}
      html{scroll-padding-top:calc(var(--vct-header-h) + 52px)}
      header{z-index:50;box-shadow:0 3px 16px rgba(0,0,0,.12)}
      nav{top:var(--vct-header-h)!important;z-index:49;align-items:flex-start;gap:8px;padding:7px 10px;box-shadow:0 2px 10px rgba(0,0,0,.04)}
      .nav-group{display:flex;align-items:center;gap:4px;padding:3px 4px;border:1px solid var(--line);border-radius:12px;background:#f9fbfb;flex:0 0 auto}
      .nav-group-label{font-size:10px;font-weight:800;color:#64777d;padding:0 5px;white-space:nowrap}
      .nav-group button{border:0;background:transparent;padding:7px 9px;font-size:12px}
      .nav-group button.active{background:#dff7f2;border:0;color:var(--p2)}
      main{max-width:1320px;padding:14px 16px}
      .view>.card,.card{box-shadow:var(--shadow)}
      #home > .card:first-child{background:linear-gradient(180deg,#ffffff 0%,#fbfdfd 100%)}
      #globalPatientPanel{width:100%;margin:0 0 12px}
      #home > .card:first-child > .grid{margin-top:12px}
      .patient-workspace-head,.command-head{display:flex;justify-content:space-between;align-items:flex-start;gap:14px}
      .eyebrow{font-size:10px;font-weight:900;letter-spacing:.08em;color:var(--p2);margin-bottom:2px}
      .patient-core-grid{grid-template-columns:repeat(4,minmax(210px,1fr))}
      .patient-actionbar{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:12px;padding:10px 12px;border:1px solid var(--line);border-radius:11px;background:#f7faf9}
      .patient-actionbar .toolbar{flex:0 0 auto}.patient-actionbar .toolbar>*{min-width:170px}
      .command-status{min-width:180px;text-align:right;padding:10px 12px;border:1px solid var(--line);border-radius:12px;background:#f7faf9;color:#64777d;font-size:12px}
      .command-status.is-active{background:#effaf7;border-color:#a5d8ce;color:#115e59}
      .workflow-steps{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:12px 0}
      .workflow-steps>button{display:flex;align-items:center;gap:9px;padding:11px;border:1px solid var(--line);border-radius:10px;background:#fbfdfd;text-align:left;cursor:pointer}
      .workflow-steps>button:hover,.module-result:hover{border-color:#79cbbb;background:#f2fbf9}
      .workflow-steps b{font-size:18px;color:var(--p)}.workflow-steps span{font-size:13px;font-weight:700}.workflow-steps small{display:block;font-weight:400;color:#718087;margin-top:1px}
      .command-launch{border:1px solid var(--line);border-radius:11px;padding:10px 12px;background:#fff}
      .command-launch label{margin:0 0 6px;color:var(--text);font-weight:700}
      .command-search-row{display:grid;grid-template-columns:1fr auto;gap:8px}.command-search-row button{min-width:88px}
      .module-results{display:flex;gap:7px;flex-wrap:wrap;margin-top:8px}
      .module-result{display:flex;flex-direction:column;align-items:flex-start;gap:1px;border:1px solid var(--line);border-radius:9px;background:#fbfdfd;padding:8px 10px;cursor:pointer;min-width:150px}
      .module-result span{font-size:11px;color:var(--muted)}
      .command-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.command-actions button{min-width:150px}
      #vct50CommandCenter{margin:0 0 12px}
      @media(max-width:1000px){.patient-core-grid{grid-template-columns:repeat(2,minmax(220px,1fr))}.workflow-steps{grid-template-columns:repeat(2,1fr)}}
      @media(max-width:700px){main{padding:9px}.patient-workspace-head,.command-head,.patient-actionbar{flex-direction:column}.patient-core-grid,.workflow-steps{grid-template-columns:1fr}.command-status{text-align:left;width:100%}.patient-actionbar .toolbar{width:100%}.patient-actionbar .toolbar>*{min-width:100%}.command-search-row{grid-template-columns:1fr}.command-search-row button{width:100%}.nav-group-label{display:none}.nav-group{border:0;background:transparent;padding:0}.nav-group button{padding:7px 8px}.module-result{min-width:calc(50% - 4px);flex:1}}
    `;document.head.appendChild(s);
  }
  function keyboard(){
    if(window.__VCT50_ARCH_KEYS)return;window.__VCT50_ARCH_KEYS=true;
    window.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();const i=$('vct50ModuleSearch');if(i){show('home');setTimeout(()=>{i.focus();i.select()},0)}}});
  }
  function boot(){
    polish();setHeaderOffset();movePatientPanelOutOfGrid();rebuildNav();addCommandCenter();bindNavigation();keyboard();setTimeout(()=>{setHeaderOffset();movePatientPanelOutOfGrid();rebuildNav()},200);setTimeout(setHeaderOffset,1000);
  }
  window.addEventListener('resize',setHeaderOffset);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.VCT50_ARCHITECTURE={version:'5.0-r08',refresh:boot,show};
})();
