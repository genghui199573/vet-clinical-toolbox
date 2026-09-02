import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
const root=process.cwd();
const idx=fs.readFileSync(path.join(root,"index.html"),"utf8");
const leaf=JSON.parse(fs.readFileSync(path.join(root,"data/drug_leaflets_5.0.json"),"utf8"));
const prot=JSON.parse(fs.readFileSync(path.join(root,"data/disease_protocols_5.0.json"),"utf8"));
assert.match(idx,/evidenceBadge/);assert.match(idx,/常见病治疗方案/);assert.match(idx,/protocolDrugLink/);
assert.equal(leaf.drugs.length,427);assert.ok(Object.keys(prot.protocols).length>=10);
for(const d of leaf.drugs){assert.ok(d.drug_id);assert.ok(d.product_identity);assert.ok(d.evidence);}
console.log(`drug/protocol validation: OK (${leaf.drugs.length} drug leaflets, ${Object.keys(prot.protocols).length} disease protocols)`);
