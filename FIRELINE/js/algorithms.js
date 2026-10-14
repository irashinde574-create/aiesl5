import {astar} from './astar.js';
import {DStarLite} from './dstar-lite.js';
import {createBug2,stepBug2} from './bug2.js';
import {keyOf,parseKey,isPassable,neighbors,edgeCost,cellChanges,VIRTUAL_GOAL} from './building.js';
import {cloneBuilding} from './fire.js';
import {newMetrics,recordMove} from './metrics.js';
export function createAgent(type,building,start,log=()=>{}){
 const agent={type,position:{...start},path:[{...start}],route:[],routeIndex:0,metrics:newMetrics(),done:false,failed:false,planner:null,bug:null,log,initializedAt:performance.now(),lastCompute:0};
 if(type==='bug2'){agent.bug=createBug2(building,start);if(agent.bug.failed){agent.failed=true;agent.metrics.status='Failed / No Route';}else agent.route=agent.bug.planned;}
 else if(type==='astar'){const result=astar(building,start);agent.lastCompute=result.time;agent.metrics.computeTime=result.time;agent.route=result.path;if(!result.path.length){agent.failed=true;agent.metrics.status='Failed / No Route';}else log('A* calculated a route');}
 else {const result=astar(building,start);agent.lastCompute=result.time;agent.metrics.computeTime=result.time;agent.route=result.path;agent.planner=new DStarLite(building,start);if(!result.path.length||!agent.planner.extractPath().length){agent.failed=true;agent.metrics.status='Failed / No Route';}else {agent.route=agent.planner.extractPath();log('Initial A* route calculated; D* Lite initialized');}}
 return agent;
}
export function updateAgentEnvironment(agent,building,changedKeys){if(agent.done||agent.failed||!changedKeys.length)return;
 if(agent.type==='hybrid'){
  const t=performance.now();agent.planner.updateBuilding(building,changedKeys);agent.metrics.computeTime+=performance.now()-t;agent.metrics.replans++;agent.route=agent.planner.extractPath();if(!agent.route.length){agent.failed=true;agent.metrics.status='Failed / No Route';agent.log('No valid route remains');}else agent.log('D* Lite updated affected states; route incrementally repaired');
 }
}
export function moveAgent(agent,building){if(agent.done||agent.failed)return;
 const before={...agent.position};
 if(agent.type==='bug2'){
  const res=stepBug2(agent.bug,building);agent.position={...agent.bug.position};if(agent.bug.event){agent.log(agent.bug.event);agent.bug.event=null;}if(agent.position.floor!==before.floor||agent.position.r!==before.r||agent.position.c!==before.c){agent.path.push({...agent.position});recordMove(agent.metrics,before,agent.position);}
  if(agent.bug.done){agent.done=true;agent.metrics.status='Reached';agent.log('BUG2 agent reached an exit');}else if(agent.bug.failed){agent.failed=true;agent.metrics.status='Failed / No Route';agent.log('BUG2 could not find a valid route');}return;
 }
 if(agent.type==='hybrid'){
  if(!agent.planner||!isPassable(building,agent.position)){agent.failed=true;agent.metrics.status='Failed / No Route';return;}
  agent.planner.moveStart(agent.position);let route=agent.planner.extractPath();if(!route.length){agent.failed=true;agent.metrics.status='Failed / No Route';agent.log('No valid route remains');return;}agent.route=route;
  const next=route[1];if(!next){if(building.exits.some(e=>keyOf(e)===keyOf(agent.position))){agent.done=true;agent.metrics.status='Reached';}else {agent.failed=true;agent.metrics.status='Failed / No Route';}return;}
  if(!isPassable(building,next)){agent.failed=true;agent.metrics.status='Failed / No Route';return;}agent.position={...next};agent.path.push({...next});recordMove(agent.metrics,before,agent.position);if(building.exits.some(e=>keyOf(e)===keyOf(agent.position))){agent.done=true;agent.metrics.status='Reached';agent.log('A* + D* Lite agent reached an exit');}return;
 }
 // A*: use the stored plan until the next step is blocked, then replan against the current grid.
 let idx=agent.route.findIndex(p=>keyOf(p)===keyOf(agent.position));let next=idx>=0?agent.route[idx+1]:null;
 if(!next||!isPassable(building,next)||!neighbors(building,agent.position).includes(keyOf(next))){const t=performance.now(),res=astar(building,agent.position);agent.metrics.computeTime+=performance.now()-t;agent.metrics.replans++;agent.route=res.path;idx=0;next=agent.route[1];if(!next){agent.failed=true;agent.metrics.status='Failed / No Route';agent.log('A* found no valid route');return;}}
 if(!isPassable(building,next)){agent.failed=true;agent.metrics.status='Failed / No Route';return;}agent.position={...next};agent.path.push({...next});recordMove(agent.metrics,before,agent.position);if(building.exits.some(e=>keyOf(e)===keyOf(agent.position))){agent.done=true;agent.metrics.status='Reached';agent.log('A* agent reached an exit');}
}
export function snapshot(building){return cloneBuilding(building);}
export function changesBetween(oldB,newB){return cellChanges(oldB,newB);}
