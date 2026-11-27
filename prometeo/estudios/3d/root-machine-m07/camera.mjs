// Pure camera contract. X/Y/Z in same world as geometry. Three gestures: orbit, translate, zoom.
const TAU=2*Math.PI, clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]),mul=(a,s)=>a.map(v=>v*s),mag=a=>Math.hypot(...a);
export const CAMERA=Object.freeze({fov:42,pitch:.18,near:.04,far:80,initialYaw:.24});
export function basis(yaw){
 const c=Math.cos(CAMERA.pitch),s=Math.sin(CAMERA.pitch),u=Math.sin(yaw),v=Math.cos(yaw);
 return {dir:[u*c,s,v*c],right:[v,0,-u],up:[-u*s,c,-v*s]};
}
export function corners(bounds){const out=[];for(let i=0;i<8;i++)out.push([0,1,2].map(j=>i&(1<<j)?bounds.max[j]:bounds.min[j]));return out;}
export function fitDistance(points,target,yaw,aspect,padding=1.12){
 const b=basis(yaw),tv=Math.tan(CAMERA.fov*Math.PI/360),th=tv*Math.max(.18,aspect);
 return Math.max(.3,...points.map(P=>{const d=sub(P,target);return dot(d,b.dir)+padding*Math.max(Math.abs(dot(d,b.right))/th,Math.abs(dot(d,b.up))/tv)+CAMERA.near*2;}));
}
export function initialView(){return {yaw:CAMERA.initialYaw,y:0,zoom:1,macro:false};}
export function drag(v,dx,dy,height){return {...v,yaw:(v.yaw-dx*.009)%TAU,y:clamp(v.y+dy/Math.max(1,height)*2.6,-1.0,1.0)};}
export function zoom(v,ratio){return {...v,zoom:clamp(v.zoom*ratio,.48,2.15)};}
export function toggleMacro(v){return {...v,macro:!v.macro,zoom:1,y:0};}
export function pose(view,aspect,bounds,collarX){
 const target=view.macro?[collarX+.14,view.y,0]:[(bounds.min[0]+bounds.max[0])/2,view.y,0];
 const focus=view.macro?{min:[collarX-.38,-.48,-.48],max:[collarX+.70,.48,.48]}:bounds;
 const b=basis(view.yaw),fit=fitDistance(corners(focus),target,view.yaw,aspect);
 let distance=Math.max(view.macro?.94:1.35,fit/view.zoom),position=add(target,mul(b.dir,distance));
 // Push camera out of the conservative core and neck volume. Never pretend this is scene physics.
 const safe=P=>mag(P)>=1.22&&!(P[0]>.96&&P[0]<2.90&&Math.hypot(P[1],P[2])<.55);
 let n=0;while(!safe(position)&&n++<100){distance+=.06;position=add(target,mul(b.dir,distance));}
 return {target,position,distance,fit,basis:b,safe:safe(position)};
}
export function fits(points,camera,aspect){const tv=Math.tan(CAMERA.fov*Math.PI/360),th=tv*Math.max(.18,aspect);return points.every(P=>{const v=sub(P,camera.target),depth=camera.distance-dot(v,camera.basis.dir);return depth>CAMERA.near&&Math.abs(dot(v,camera.basis.right))<=depth*th&&Math.abs(dot(v,camera.basis.up))<=depth*tv;});}
