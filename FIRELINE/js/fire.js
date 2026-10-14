import {ROWS,COLS,keyOf,getCell,isPassable} from './building.js';
export function ignite(building,seed={floor:0,r:7,c:14}){const cell=getCell(building,seed);if(!cell||cell.wall||cell.staticObstacle||cell.exit||cell.stairs||cell.dynamicObstacle)return false;cell.fire='burning';return true;}
export function advanceFire(building,{crossFloor=true}={}){
 const igniteNext=new Map(),riskNext=new Map();building._fireTick=(building._fireTick||0)+1;const phase=building._fireTick;
 for(let f=0;f<2;f++)for(let r=1;r<ROWS-1;r++)for(let c=1;c<COLS-1;c++)if(building.floors[f][r][c].fire==='burning'){
  const x=building.floors[f][r][c];x.fire='burned';const candidates=[];
  for(const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]]){const nr=r+dr,nc=c+dc;if(nr<1||nr>=ROWS-1||nc<1||nc>=COLS-1)continue;const n=building.floors[f][nr][nc];if(!n.wall&&!n.staticObstacle&&!n.dynamicObstacle&&!['burning','burned'].includes(n.fire))candidates.push({floor:f,r:nr,c:nc});}
  if(crossFloor&&x.stairs){const other=building.stairs.find(s=>s.floor!==f);if(other){const n=getCell(building,other);if(n&&!n.wall&&!n.staticObstacle&&!n.dynamicObstacle&&!['burning','burned'].includes(n.fire))candidates.push(other);}}
  let selected=0;for(const p of candidates){const shouldIgnite=((p.r+p.c+p.floor+phase)%2===0)||selected===0;if(shouldIgnite){igniteNext.set(keyOf(p),p);selected++;}else if(!igniteNext.has(keyOf(p)))riskNext.set(keyOf(p),p);}
 }
 for(const p of riskNext.values()){const x=getCell(building,p);if(x.fire==='safe')x.fire='risk';}
 for(const p of igniteNext.values()){const x=getCell(building,p);if(x.fire!=='burning'&&x.fire!=='burned')x.fire='burning';}
 // Keep risk as a visible warning when adjacent to an active flame; clear stale warnings.
 for(let f=0;f<2;f++)for(let r=1;r<ROWS-1;r++)for(let c=1;c<COLS-1;c++){const x=building.floors[f][r][c];if(x.fire==='safe'){const near=[[1,0],[-1,0],[0,1],[0,-1]].some(([dr,dc])=>building.floors[f][r+dr]?.[c+dc]?.fire==='burning');if(near)x.fire='risk';}else if(x.fire==='risk'&&![[1,0],[-1,0],[0,1],[0,-1]].some(([dr,dc])=>building.floors[f][r+dr]?.[c+dc]?.fire==='burning'))x.fire='safe';}
 return igniteNext.size;
}
export function cloneBuilding(b){return {...b,floors:b.floors.map(f=>f.map(row=>row.map(c=>({...c})))),exits:b.exits.map(x=>({...x})),stairs:b.stairs.map(x=>({...x}))};}
