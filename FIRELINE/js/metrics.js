export function newMetrics(){return {pathLength:0,computeTime:0,status:'In Progress',replans:0,floorChanges:0};}
export function recordMove(metrics,from,to){metrics.pathLength+=1;if(from.floor!==to.floor)metrics.floorChanges++;}
export function statusClass(status){return status==='Reached'?'status-reached':status==='In Progress'?'status-progress':'status-failed';}
