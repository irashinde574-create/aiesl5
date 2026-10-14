import test from 'node:test';import assert from 'node:assert/strict';import {createBuilding,getCell} from '../js/building.js';import {advanceFire,ignite,cloneBuilding} from '../js/fire.js';
test('fire ignition rejects barriers and accepts eligible cells',()=>{const b=createBuilding('open');assert.equal(ignite(b,{floor:0,r:0,c:0}),false);assert.equal(ignite(b,{floor:0,r:7,c:7}),true);});
test('fire advances progressively and burning cells become burned',()=>{const b=createBuilding('open');ignite(b,{floor:0,r:7,c:7});const count=advanceFire(b);assert.ok(count>0);assert.equal(getCell(b,{floor:0,r:7,c:7}).fire,'burned');assert.ok(b.floors.flat(2).some(c=>c.fire==='burning'));});
test('clone is independent',()=>{const b=createBuilding();const copy=cloneBuilding(b);copy.floors[0][2][2].fire='burning';assert.notEqual(b.floors[0][2][2].fire,'burning');});

test('fire can leave neighboring cells visibly at risk',()=>{const b=createBuilding('open');ignite(b,{floor:0,r:7,c:7});advanceFire(b);assert.ok(b.floors.flat(2).some(c=>c.fire==='risk'));});
