import test from 'node:test';import assert from 'node:assert/strict';import {createBuilding,getCell,isPassable,keyOf,EXIT_CELLS,STAIR_CELLS} from '../js/building.js';
test('building always has exactly two floors and fixed exits',()=>{const b=createBuilding();assert.equal(b.floors.length,2);assert.equal(b.exits.length,2);for(const p of EXIT_CELLS)assert.equal(getCell(b,p).exit,true);for(const p of STAIR_CELLS)assert.equal(getCell(b,p).stairs,true);});
test('walkability rejects walls and obstacles',()=>{const b=createBuilding('open');assert.equal(isPassable(b,{floor:0,r:0,c:0}),false);const p={floor:0,r:2,c:7};getCell(b,p).dynamicObstacle=true;assert.equal(isPassable(b,p),false);});
test('start key round trips',()=>assert.equal(keyOf({floor:1,r:3,c:4}),'1:3:4'));
