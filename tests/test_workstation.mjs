import fs from 'node:fs';
const html=fs.readFileSync('index.html','utf8');
const js=fs.readFileSync('clinical_workstation_5.0.js','utf8');
for (const id of ['clinical','cwBsaBtn','cwUopBtn','cwKBtn','cwFluidBtn','cwTrBtn','cwLabBtn','cwIntBtn','cwProtoBtn','cwReportBtn','cwTimelineBtn']) {
  if(!html.includes(`id="${id}"`)) throw new Error(`missing UI id ${id}`);
}
if(!html.includes('clinical_workstation_5.0.js')) throw new Error('workstation script not loaded');
if(!js.includes('window.VCT50_WORKSTATION')) throw new Error('workstation module not initialized');
const m=js.match(/const protocols=\{/);
if(!m) throw new Error('protocol registry missing');
const count=(js.match(/\": \[\"(?:犬|猫|犬\/猫)/g)||[]).length;
if(count<50) throw new Error(`expected >=50 protocol templates, got ${count}`);
if(!fs.readFileSync('sw.js','utf8').includes('clinical_workstation_5.0.js')) throw new Error('SW core cache missing workstation script');
console.log(`clinical workstation validation: OK (${count}+ protocol templates)`);
