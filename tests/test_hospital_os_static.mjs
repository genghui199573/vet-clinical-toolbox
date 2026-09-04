import fs from 'node:fs';
import assert from 'node:assert/strict';
const root=new URL('..',import.meta.url).pathname;
const js=fs.readFileSync(root+'hospital_os_complete_5.0.js','utf8');
const html=fs.readFileSync(root+'index.html','utf8');
for(const token of ['CRM','appointments','EMR','POMR','invoices','inventory','hospitalizations','procedures','ownerPortal','AI Doctor','AI Nurse','AI Manager','AI Marketing','audit']) assert.ok(js.includes(token),`missing ${token}`);
assert.ok(html.includes('hospital_os_complete_5.0.js'));
assert.ok(js.includes("VCT50_HOSPITAL_OS"));
console.log('hospital OS static architecture validation: OK');
