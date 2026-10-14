import {keyOf,parseKey,neighbors,edgeCost,VIRTUAL_GOAL,isPassable} from './building.js';
function heuristic(building,node){if(node===VIRTUAL_GOAL)return 0;const p=parseKey(node);let best=Infinity;for(const e of building.exits){const d=p.floor===e.floor?Math.abs(p.r-e.r)+Math.abs(p.c-e.c):Math.abs(p.r-7)+Math.abs(p.c-10)+1+Math.abs(e.r-7)+Math.abs(e.c-10);best=Math.min(best,d);}return best===Infinity?0:best;}
export function astar(building,start){
 const t0=performance.now();const sk=keyOf(start);if(!isPassable(building,start))return {path:[],cost:Infinity,time:performance.now()-t0,expanded:0};
 const open=new Set([sk]),came=new Map(),g=new Map([[sk,0]]),f=new Map([[sk,heuristic(building,sk)]]);let expanded=0,goal=null;
 while(open.size){let current=null,best=Infinity;for(const n of open){const score=f.get(n)??Infinity;if(score<best){best=score;current=n;}}if(current===VIRTUAL_GOAL){goal=current;break;}open.delete(current);expanded++;
  for(const nb of neighbors(building,current)){const tentative=(g.get(current)??Infinity)+edgeCost(building,current,nb);if(tentative<(g.get(nb)??Infinity)){came.set(nb,current);g.set(nb,tentative);f.set(nb,tentative+heuristic(building,nb));open.add(nb);}}
  // virtual goal is connected from every usable fixed exit
  if(building.exits.some(e=>keyOf(e)===current)){const tentative=(g.get(current)??Infinity)+edgeCost(building,current,VIRTUAL_GOAL);if(tentative<(g.get(VIRTUAL_GOAL)??Infinity)){came.set(VIRTUAL_GOAL,current);g.set(VIRTUAL_GOAL,tentative);f.set(VIRTUAL_GOAL,tentative);open.add(VIRTUAL_GOAL);}}
 }
 if(!goal)return {path:[],cost:Infinity,time:performance.now()-t0,expanded};let cur=came.get(VIRTUAL_GOAL),rev=[];while(cur){rev.push(cur);cur=came.get(cur);}rev.reverse();return {path:rev.map(parseKey),cost:g.get(VIRTUAL_GOAL),time:performance.now()-t0,expanded};
}
