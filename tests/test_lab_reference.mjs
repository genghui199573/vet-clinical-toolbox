import fs from 'node:fs';
import assert from 'node:assert/strict';

const d=JSON.parse(fs.readFileSync(new URL('../data/lab_analyzers_5.0.json', import.meta.url),'utf8'));
const local=d.analyzers.find(x=>x.id==='dingdang-nabai-biochemistry');
assert(local,'本院纳百生化参考体系缺失');
assert.equal(local.reference_intervals.status,'hospital_validated_report');
const vals=local.reference_intervals.values;
const get=k=>vals.find(x=>x.analyte===k);
assert.deepEqual([get('GLU').unit,get('GLU').low,get('GLU').high],['mmol/L',4.11,8.84]);
assert.deepEqual([get('ALB').unit,get('ALB').low,get('ALB').high],['g/L',22,45]);
assert.deepEqual([get('BUN').unit,get('BUN').low,get('BUN').high],['mmol/L',5.7,13.8]);
assert.deepEqual([get('CRE').unit,get('CRE').low,get('CRE').high],['umol/L',55,236]);
assert.deepEqual([get('PHOS').unit,get('PHOS').low,get('PHOS').high],['mmol/L',1,2.74]);
assert.deepEqual([get('Ca').unit,get('Ca').low,get('Ca').high],['mmol/L',1.95,3]);
assert.equal(get('TBA').high,10);
assert.equal(get('CK').high,315);

const core=fs.readFileSync(new URL('../clinical_core_5.0.js', import.meta.url),'utf8');
const os=fs.readFileSync(new URL('../clinical_os_5.0.js', import.meta.url),'utf8');
const addon=fs.readFileSync(new URL('../clinical_enhancements_5.0_clinical_addon.js', import.meta.url),'utf8');
assert.match(core,/血糖 mmol\/L/);
assert.match(core,/g<3\.3/);
assert.match(os,/Glucose（血糖）mmol\/L/);
assert.match(os,/glu<3\.3/);
assert.doesNotMatch(addon,/当前血糖 mg\/dL/);
console.log('lab reference / glucose unit validation: OK');
