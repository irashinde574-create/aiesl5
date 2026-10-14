export const ROWS=15, COLS=20;
export const EXIT_CELLS=[{floor:0,r:7,c:0},{floor:1,r:7,c:19}];
export const STAIR_CELLS=[{floor:0,r:7,c:10},{floor:1,r:7,c:10}];
export const keyOf=p=>`${p.floor}:${p.r}:${p.c}`;
export const parseKey=k=>{const [floor,r,c]=k.split(':').map(Number);return {floor,r,c};};
export const VIRTUAL_GOAL='__FIRELINE_GOAL__';
export function createBuilding(scenario='office'){
 const floors=[];
 for(let f=0;f<2;f++){
  const cells=Array.from({length:ROWS},(_,r)=>Array.from({length:COLS},(_,c)=>({floor:f,r,c,wall:r===0||c===0||r===ROWS-1||c===COLS-1,staticObstacle:false,dynamicObstacle:false,fire:'safe',exit:false,stairs:false})));
  const setWall=(r,c)=>{if(r>0&&r<ROWS-1&&c>0&&c<COLS-1)cells[r][c].wall=true;};
  // Two segmented internal partitions with door openings.
  if(scenario==='corridor'){
   for(let r=1;r<ROWS-1;r++){if(![3,11].includes(r))setWall(r,6);if(![5,9].includes(r))setWall(r,13);}
  } else if(scenario==='open'){
   for(let c=3;c<17;c++){if(![9,10].includes(c)){setWall(4,c);setWall(10,c);}}
   for(let r=5;r<10;r++)if(![7].includes(r)){setWall(r,4);setWall(r,15);}
  } else {
   for(let c=2;c<18;c++)if(![5,10,15].includes(c))setWall(4,c);
   for(let c=2;c<18;c++)if(![3,8,14].includes(c))setWall(10,c);
   for(let r=5;r<10;r++)if(![7].includes(r))setWall(r,9);
   for(let r=1;r<4;r++)setWall(r,14);
  }
  // Ensure exits and stairs remain open.
  for(const p of [...EXIT_CELLS.filter(x=>x.floor===f),...STAIR_CELLS.filter(x=>x.floor===f)])cells[p.r][p.c].wall=false;
  floors.push(cells);
 }
 for(const p of EXIT_CELLS)floors[p.floor][p.r][p.c].exit=true;
 for(const p of STAIR_CELLS)floors[p.floor][p.r][p.c].stairs=true;
 // Stable static furniture blocks (avoiding critical connections).
 if(scenario!=='corridor')for(let f=0;f<2;f++)for(const [r,c] of (scenario==='open'?[[2,7],[7,5],[7,14],[12,7],[12,14]]:[[2,4],[2,5],[6,4],[8,15],[12,4],[12,15]])){
  const x=floors[f][r][c];if(!x.wall&&!x.exit&&!x.stairs)x.staticObstacle=true;
 }
 return {floors, exits:EXIT_CELLS.map(p=>({...p})),stairs:STAIR_CELLS.map(p=>({...p})),scenario};
}
export function getCell(building,p){return building.floors[p.floor]?.[p.r]?.[p.c]||null;}
export function isPassable(building,p,{allowRisk=true}={}){const x=getCell(building,p);return !!x&&!x.wall&&!x.staticObstacle&&!x.dynamicObstacle&&x.fire!=='burning'&&x.fire!=='burned'&&(allowRisk||x.fire!=='risk');}
export function traversalCost(building,p){if(!isPassable(building,p))return Infinity;return getCell(building,p).fire==='risk'?3:1;}
export function neighbors(building,node,{allowRisk=true}={}){
 if(node===VIRTUAL_GOAL)return building.exits.filter(p=>isPassable(building,p,{allowRisk})).map(keyOf);
 const p=typeof node==='string'?parseKey(node):node;const result=[];
 for(const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]]){const q={floor:p.floor,r:p.r+dr,c:p.c+dc};if(isPassable(building,q,{allowRisk}))result.push(keyOf(q));}
 if(getCell(building,p)?.stairs){const other=building.stairs.find(s=>s.floor!==p.floor);if(other&&isPassable(building,other,{allowRisk}))result.push(keyOf(other));}
 if(building.exits.some(e=>keyOf(e)===keyOf(p)))result.push(VIRTUAL_GOAL);
 return result;
}
export function edgeCost(building,a,b){if(a===VIRTUAL_GOAL||b===VIRTUAL_GOAL)return 1;const pa=parseKey(a),pb=parseKey(b);if(!isPassable(building,pa)||!isPassable(building,pb))return Infinity;return traversalCost(building,pb);}
export function isExit(building,p){return building.exits.some(e=>keyOf(e)===keyOf(p));}
export function cellChanges(oldBuilding,newBuilding){const out=[];for(let f=0;f<2;f++)for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const a=oldBuilding.floors[f][r][c],b=newBuilding.floors[f][r][c];if(a.wall!==b.wall||a.staticObstacle!==b.staticObstacle||a.dynamicObstacle!==b.dynamicObstacle||a.fire!==b.fire)out.push(keyOf({floor:f,r,c}));}return out;}

// Deep-copy the complete shared environment before comparing grid changes.
// Fire and obstacle state are nested by floor, row, and cell, so a shallow
// copy would mutate the snapshot along with the live building.
export function cloneBuilding(building) {
  return {
    ...building,
    floors: building.floors.map(floor => floor.map(row => row.map(cell => ({ ...cell })))),
    exits: building.exits.map(cell => ({ ...cell })),
    stairs: building.stairs.map(cell => ({ ...cell }))
  };
}
