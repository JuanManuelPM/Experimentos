// Casa entre patios: reusable viewport-aware occlusion + tactile first-person camera.
// Metres throughout. No rendering library coupling.
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function segmentAABB(a,b,box){let t0=0,t1=1;const min=box.min,max=box.max;for(let i=0;i<3;i++){let d=b[i]-a[i];if(Math.abs(d)<1e-9){if(a[i]<min[i]||a[i]>max[i])return null;continue}let near=(min[i]-a[i])/d,far=(max[i]-a[i])/d;if(near>far)[near,far]=[far,near];t0=Math.max(t0,near);t1=Math.min(t1,far);if(t0>t1)return null}return t0;}
export function coverage(camera,focal,occluder,viewportWidth=390){let aspect=viewportWidth/Math.max(450,viewportWidth*.64),fov=60*Math.PI/180;let dir=norm(sub(focal,camera));let right=norm(cross(dir,[0,1,0]));let up=norm(cross(right,dir));let length=Math.hypot(...sub(focal,camera));let reach=length*Math.tan(fov/2)*.14;let blocked=0;for(let y of [-1,0,1])for(let x of [-1,0,1]){let p=add(focal,add(scale(right,x*reach*aspect),scale(up,y*reach)));let t=segmentAABB(camera,p,occluder);if(t!==null&&t>.002&&t<.975)blocked++}return blocked/9;}
const sub=(a,b)=>a.map((v,i)=>v-b[i]),add=(a,b)=>a.map((v,i)=>v+b[i]),scale=(a,n)=>a.map(v=>v*n),norm=a=>{let l=Math.hypot(...a)||1;return scale(a,1/l)},cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export function resolveOcclusion(camera,focal,objects,viewportWidth=390){const ranked=[];for(const o of objects){if(!o.occluder||!o.bounds)continue;let c=coverage(camera,focal,o.bounds,viewportWidth);if(c>=.44)ranked.push({id:o.id,coverage:c,roof:!!o.roof});}
 ranked.sort((a,b)=>b.coverage-a.coverage);return new Set(ranked.filter((r,i)=>i<3||r.roof).map(r=>r.id));}
export function walkable(p,walls,radius=.29){if(p[0]<-8.12||p[0]>8.12||p[2]<-7.48||p[2]>7.55)return false;for(const w of walls){if(!w.solid||!w.bounds||w.roof)continue;const b=w.bounds;if(p[0]>b.min[0]-radius&&p[0]<b.max[0]+radius&&p[2]>b.min[2]-radius&&p[2]<b.max[2]+radius)return false}return true;}
export const PRESETS={
 sala:{pos:[-4.34,1.62,3.45],look:[-.73,1.38,-.58],name:'Sala',detail:'Estar · 31 m²'},
 patio:{pos:[-.25,1.62,1.65],look:[.45,1.32,-2.45],name:'Patio',detail:'Agua y sombra · 22 m²'},
 comedor:{pos:[5.85,1.62,3.50],look:[1.95,1.4,.2],name:'Comedor',detail:'Mesa · 27 m²'},
 estudio:{pos:[-.3,1.62,-6.55],look:[.0,1.43,-3.12],name:'Estudio',detail:'Trabajo · 19 m²'}
};
export function anglesFrom(pos,target){let d=sub(target,pos);return {yaw:Math.atan2(d[0],-d[2]),pitch:Math.atan2(d[1],Math.hypot(d[0],d[2]))}}
export class ArchitectureCamera{
 constructor(walls){this.walls=walls;this.pos=[...PRESETS.sala.pos];const a=anglesFrom(this.pos,PRESETS.sala.look);this.yaw=a.yaw;this.pitch=a.pitch;this.route=[];this.focus=[...PRESETS.sala.look];this.scene='sala';this.moving=false;}
 target(){return [this.pos[0]+Math.sin(this.yaw)*Math.cos(this.pitch)*6,this.pos[1]+Math.sin(this.pitch)*6,this.pos[2]-Math.cos(this.yaw)*Math.cos(this.pitch)*6]}
 turn(dx,dy){this.yaw+=dx;this.pitch=clamp(this.pitch+dy,-.91,.74);this.route=[]}
 move(forward,side,dt){this.route=[];const s=Math.min(.12,dt)*2.2,f=scale([Math.sin(this.yaw),0,-Math.cos(this.yaw)],forward*s),r=scale([Math.cos(this.yaw),0,Math.sin(this.yaw)],side*s);let p=add(this.pos,add(f,r));if(walkable(p,this.walls))this.pos=p;else{let x=[p[0],this.pos[1],this.pos[2]],z=[this.pos[0],this.pos[1],p[2]];if(walkable(x,this.walls))this.pos=x;if(walkable(z,this.walls))this.pos=z;}return this.pos}
 go(key){const to=PRESETS[key];if(!to)return;this.scene=key;let steps=[];if(key==='sala')steps=[[-1.8,1.62,0],[-2.9,1.62,.5],to.pos];else if(key==='comedor')steps=[[1.8,1.62,0],[2.95,1.62,.5],to.pos];else if(key==='estudio')steps=[[0,1.62,-2.7],[0,1.62,-3.55],to.pos];else steps=[to.pos];this.route=steps.map((pos,i)=>({pos,look:i===steps.length-1?to.look:[0,1.45,0]}));this.moving=true;}
 tick(dt){if(!this.route.length){this.moving=false;return}let waypoint=this.route[0],delta=sub(waypoint.pos,this.pos),dist=Math.hypot(...delta),speed=Math.min(dist,dt*3.35);if(dist>.04)this.pos=add(this.pos,scale(delta,speed/Math.max(dist,.01)));else{this.pos=[...waypoint.pos];this.route.shift()}const a=anglesFrom(this.pos,waypoint.look);let deltaYaw=((a.yaw-this.yaw+Math.PI*3)%(Math.PI*2))-Math.PI;this.yaw+=clamp(deltaYaw,-dt*2.2,dt*2.2);this.pitch+=clamp(a.pitch-this.pitch,-dt*1.5,dt*1.5);this.moving=this.route.length>0;}
}
