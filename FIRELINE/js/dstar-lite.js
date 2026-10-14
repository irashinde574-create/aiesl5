import {keyOf,parseKey,neighbors,edgeCost,VIRTUAL_GOAL,isPassable} from './building.js';
// D* Lite: backward search from a virtual goal connected to all currently valid fixed exits.
export class DStarLite{
 constructor(building,start){this.building=building;this.start=keyOf(start);this.last=this.start;this.goal=VIRTUAL_GOAL;this.km=0;this.g=new Map();this.rhs=new Map([[this.goal,0]]);this.open=[];this.seq=0;this.push(this.goal,this.calculateKey(this.goal));this.computeCount=0;this.repairCount=0;this.initialized=true;this.computeShortestPath();}
 val(map,u){return map.has(u)?map.get(u):Infinity;}
 h(a,b){if(a===b)return 0;if(a===VIRTUAL_GOAL||b===VIRTUAL_GOAL)return 0;const p=parseKey(a),q=parseKey(b);return (p.floor===q.floor?Math.abs(p.r-q.r)+Math.abs(p.c-q.c):Math.abs(p.r-7)+Math.abs(p.c-10)+1+Math.abs(q.r-7)+Math.abs(q.c-10));}
 calculateKey(u){const m=Math.min(this.val(this.g,u),this.val(this.rhs,u));return [m+this.h(this.start,u)+this.km,m];}
 less(a,b){return a[0]<b[0]||(a[0]===b[0]&&a[1]<b[1]);}
 push(u,key){this.open.push({u,key,seq:this.seq++});}
 pop(){this.open.sort((a,b)=>this.less(a.key,b.key)?-1:this.less(b.key,a.key)?1:a.seq-b.seq);return this.open.shift();}
 topKey(){if(!this.open.length)return [Infinity,Infinity];return this.open.reduce((best,x)=>this.less(x.key,best)?x.key:best,[Infinity,Infinity]);}
 successors(u){return neighbors(this.building,u);}
 predecessors(u){if(u===this.goal)return this.building.exits.map(keyOf).filter(x=>isPassable(this.building,parseKey(x)));return neighbors(this.building,u);}
 updateVertex(u){if(u!==this.goal){let best=Infinity;for(const s of this.successors(u))best=Math.min(best,edgeCost(this.building,u,s)+this.val(this.g,s));this.rhs.set(u,best);}this.open=this.open.filter(x=>x.u!==u);if(this.val(this.g,u)!==this.val(this.rhs,u))this.push(u,this.calculateKey(u));}
 computeShortestPath(limit=20000){let iterations=0;while(this.less(this.topKey(),this.calculateKey(this.start))||this.val(this.rhs,this.start)!==this.val(this.g,this.start)){
  if(!this.open.length||iterations++>limit)break;const item=this.pop(),u=item.u,kOld=item.key,kNew=this.calculateKey(u);if(this.less(kOld,kNew)){this.push(u,kNew);}else if(this.val(this.g,u)>this.val(this.rhs,u)){this.g.set(u,this.val(this.rhs,u));for(const p of this.predecessors(u))this.updateVertex(p);}else{this.g.set(u,Infinity);this.updateVertex(u);for(const p of this.predecessors(u))this.updateVertex(p);}}
 this.computeCount+=iterations;return iterations;}
 moveStart(next){const nk=keyOf(next);this.km+=this.h(this.last,nk);this.last=nk;this.start=nk;}
 updateChangedCells(keys){for(const k of keys){this.updateVertex(k);for(const p of this.predecessors(k))this.updateVertex(p);}this.computeShortestPath();this.repairCount++;}
 extractPath(max=ROWSAFE(this.building)){let cur=this.start,path=[parseKey(cur)],seen=new Set([cur]);for(let i=0;i<max&&cur!==this.goal;i++){let best=null,cost=Infinity;for(const s of this.successors(cur)){const v=edgeCost(this.building,cur,s)+this.val(this.g,s);if(v<cost){cost=v;best=s;}}if(!best||!Number.isFinite(cost)||seen.has(best))return [];if(best===this.goal)break;cur=best;seen.add(cur);path.push(parseKey(cur));}return path.length&&this.building.exits.some(e=>keyOf(e)===keyOf(path[path.length-1]))?path:[];}
 updateBuilding(building,changedKeys){this.building=building;this.updateChangedCells(changedKeys);}
}
function ROWSAFE(building){return building.floors.length*building.floors[0].length*building.floors[0][0].length+5;}
