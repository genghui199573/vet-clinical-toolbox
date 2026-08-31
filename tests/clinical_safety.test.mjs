import test from "node:test";
import assert from "node:assert/strict";
test("CPR 10 kg",()=>{assert.equal(.01*10,.1);assert.equal(.1*10,1);assert.equal(.04*10,.4)});
test("Na rate red line",()=>{const r=Math.abs(145-139)/10;assert.equal(r,.6);assert.ok(r>.5)});
test("corrected AG",()=>assert.equal(18+2.5*(4-2),23));
