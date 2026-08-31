import test from "node:test";import assert from "node:assert/strict";import fs from "node:fs";
const d=JSON.parse(fs.readFileSync("data/vet_biologics_5.0.json","utf8"));
test("biologics schema",()=>{assert.ok(Array.isArray(d.products));assert.ok(d.products.length>=14);assert.equal(new Set(d.products.map(x=>x.id)).size,d.products.length)});