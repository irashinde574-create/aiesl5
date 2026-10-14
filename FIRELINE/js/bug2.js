import {keyOf,parseKey,neighbors,isPassable,edgeCost} from './building.js';
// Grid BUG2 adaptation: choose a deterministic direct-to-goal direction; when blocked, trace a wall
// using a fixed right-hand neighbor order until a strictly better hit-to-goal progress point appears.
export function createBug2(building,start){const goal=building.exits.filter(e=>isPassable(building,e)).sort((a,b)=>manhattan(start,a)-manhattan(start,b))[0]||null;return {building,position:{...start},path:[{...start}],visited:new Set([keyOf(start)]),mode:'goal',hit:null,hitDistance:Infinity,traceSteps:0,failed:!goal,done:false,goal,planned:goal?[{...start}]:[]};}
function manhattan(a,b){return a.floor===b.floor?Math.abs(a.r-b.r)+Math.abs(a.c-b.c):100+Math.abs(a.r-7)+Math.abs(a.c-10)+Math.abs(b.r-7)+Math.abs(b.c-10);}
export function stepBug2(agent,building){if(agent.done||agent.failed)return {moved:false,terminal:true};agent.building=building;const p=agent.position;
 // The goal is the nearest currently reachable fixed exit; refresh when environment changes.
 const goal=building.exits.filter(e=>isPassable(building,e)).sort((a,b)=>manhattan(p,a)-manhattan(p,b))[0]||agent.goal;if(!goal){agent.failed=true;return {moved:false,terminal:true};}
 if(!agent.goal||keyOf(agent.goal)!==keyOf(goal))agent.goal=goal;
 const ns=neighbors(building,p).filter(k=>k!=='__FIRELINE_GOAL__').map(parseKey);if(!ns.length){agent.failed=true;return {moved:false,terminal:true};}
 let next=null;
 if(agent.mode==='goal'){
  const best=ns.slice().sort((a,b)=>manhattan(a,goal)-manhattan(b,goal))[0];
  if(manhattan(best,goal)>=manhattan(p,goal)||agent.visited.has(keyOf(best))){agent.mode='boundary';agent.hit={...p};agent.hitDistance=manhattan(p,goal);agent.traceSteps=0;agent.boundaryVisited=new Set();agent.event='BUG2 began boundary following';}
  else next=best;
 }
 if(agent.mode==='boundary'){
  const candidates=ns.filter(n=>!agent.boundaryVisited.has(keyOf(n))).sort((a,b)=>{
   const da=manhattan(a,goal),db=manhattan(b,goal);if(da!==db)return da-db;return keyOf(a).localeCompare(keyOf(b));});
  if(candidates.length){next=candidates[0];agent.boundaryVisited.add(keyOf(next));agent.traceSteps++;if(manhattan(next,goal)<agent.hitDistance&&manhattan(next,goal)<manhattan(p,goal)){agent.mode='goal';agent.hit=null;agent.boundaryVisited.clear();}}
  else {agent.failed=true;return {moved:false,terminal:true};}
  if(agent.traceSteps>ROWSAFE(building)){agent.failed=true;return {moved:false,terminal:true};}
 }
 if(!next){agent.failed=true;return {moved:false,terminal:true};}if(!isPassable(building,next)){agent.mode='goal';return {moved:false,blocked:true};}
 agent.position={...next};agent.path.push({...next});agent.visited.add(keyOf(next));if(building.exits.some(e=>keyOf(e)===keyOf(next)))agent.done=true;return {moved:true,terminal:agent.done};
}
function ROWSAFE(b){return b.floors.length*b.floors[0].length*b.floors[0][0].length;}
