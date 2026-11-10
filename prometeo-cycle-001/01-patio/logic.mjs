export const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
export function nearestInteractable(player,items,radius=2.5){
 let best=null,md=Infinity;
 for(const item of items){const d=Math.hypot(player.x-item.x,player.z-item.z);if(d<Math.min(radius,item.radius??radius)&&d<md){best=item;md=d}}
 return best;
}
export function collides(x,z,obstacles,radius=.37){
 return obstacles.some(b=>{
  const nx=clamp(x,b.minX,b.maxX),nz=clamp(z,b.minZ,b.maxZ);
  return (x-nx)**2+(z-nz)**2<radius**2;
 });
}
export function moveWithCollisions(current,dx,dz,obstacles=[],boundary=11.5,radius=.37){
 let x=clamp(current.x+dx,-boundary,boundary),z=clamp(current.z+dz,-boundary,boundary);
 if(collides(x,z,obstacles,radius)){if(!collides(x,current.z,obstacles,radius))z=current.z;
 else if(!collides(current.x,z,obstacles,radius))x=current.x;
 else{x=current.x;z=current.z}}
 return {x,z};
}
export function readSave(store){
 const fallback={color:0,hat:"beret",visited:[],unlocked:false};
 try{const raw=store?.getItem("patio-v1");if(!raw)return fallback;const data=JSON.parse(raw);
  return {color:Number.isInteger(data.color)?clamp(data.color,0,4):0,hat:["none","beret","cap","crown"].includes(data.hat)?data.hat:"beret",visited:Array.isArray(data.visited)?data.visited.filter(x=>["mora","tilo","luz","cafe","stage","bells"].includes(x)):[],unlocked:Boolean(data.unlocked)}
 }catch{return fallback}
}
export function getProgress(visited){const n=new Set(visited).size;return {count:n,unlocked:n>=3};}
export function writeSave(store,data){try{store?.setItem("patio-v1",JSON.stringify(data));return true}catch{return false}}

