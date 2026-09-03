import fs from 'fs';
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const js=fs.readFileSync(new URL('../patient_state_5.0.js',import.meta.url),'utf8');
for(const x of ['patient_state_5.0.js','globalPatientPanel','patientSyncNow','vct50:patient-change','VCT50_PATIENT_STATE']) if(!html.includes(x)&&!js.includes(x)) throw new Error('missing '+x);
for(const x of ['patientSpecies','patientWeight','patientMeds','patientCreatinine','patientK','patientNa','patientAlb','patientDx']) if(!js.includes(x)) throw new Error('missing state field '+x);
console.log('patient state validation: OK');
