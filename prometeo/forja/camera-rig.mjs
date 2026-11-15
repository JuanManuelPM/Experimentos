/** C107 · Surface-independent cinematic camera rig for 3D scenes. */
const V = (x=0,y=0,z=0)=>[x,y,z];
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const add=(a,b)=>a.map((v,i)=>v+b[i]);
const sub=(a,b)=>a.map((v,i)=>v-b[i]);
const mul=(a,n)=>a.map(v=>v*n);
const len=a=>Math.hypot(...a);
const unit=a=>{const r=len(a);return r>1e-7?mul(a,1/r):V(0,0,-1)};
const lerp=(a,b,t)=>add(mul(a,1-t),mul(b,t));
const smooth=t=>t*t*(3-2*t);
const coords=arr=>Array.isArray(arr)&&arr.length===3&&arr.every(Number.isFinite);
const modes=Object.freeze(['ORBIT','FOLLOW','FIRST_PERSON','SHOT']);
function blocked(x,z,obstacles,r=.45){return obstacles.some(b=>x>b.minX-r&&x<b.maxX+r&&z>b.minZ-r&&z<b.maxZ+r)}
function checkPose(eye,target,near=.1){
 if(!coords(eye)||!coords(target)||len(sub(eye,target))<=near*2)throw Error('INVALID_CAMERA_POSE');
 return {eye,target,up:V(0,1,0),near,far:300};
}
const DEFAULT_SHOTS=Object.freeze([
 {at:0,eye:[51,39,54],target:[0,3,0],fov:44},
 {at:4,eye:[-37,24,44],target:[4,5,3],fov:49},
 {at:8,eye:[-42,16,-12],target:[3,4,0],fov:55},
 {at:12,eye:[24,31,-48],target:[-2,5,2],fov:48},
 {at:16,eye:[51,39,54],target:[0,3,0],fov:44}
]);
export function shotAt(seconds,shots=DEFAULT_SHOTS){
 if(!Array.isArray(shots)||shots.length<2||shots.some((s,i)=>!Number.isFinite(s.at)||s.at<0||!coords(s.eye)||!coords(s.target)||!Number.isFinite(s.fov)||(i>0&&s.at<=shots[i-1].at)))throw Error('INVALID_SHOT_TIMELINE');
 const duration=shots.at(-1).at;
 const t=(((Number.isFinite(seconds)?seconds:0)%duration)+duration)%duration;
 let i=0;while(i+1<shots.length&&shots[i+1].at<t)i++;
 const a=shots[i],b=shots[Math.min(i+1,shots.length-1)],u=smooth(clamp((t-a.at)/(b.at-a.at||1),0,1));
 return {...checkPose(lerp(a.eye,b.eye,u),lerp(a.target,b.target,u)),fov:clamp(a.fov+(b.fov-a.fov)*u,25,90),mode:'SHOT',shot:i,progress:+(t/duration).toFixed(3)};
}
export class CameraRig{
 constructor({bounds=46,obstacles=[],shots=DEFAULT_SHOTS}={}){
  if(!Number.isFinite(bounds)||bounds<5||bounds>1000)throw Error('INVALID_BOUNDS');
  this.bounds=bounds;this.obstacles=obstacles;this.shots=shots;this.mode='ORBIT';this.yaw=.57;this.pitch=.48;this.radius=74;
  this.eye=[0,2,36];this.fp=[6,1.8,30];this.followEye=[0,12,0];this.followTarget=[0,0,0];this.modeTime=0;
 }
 setMode(mode){if(!modes.includes(mode))throw Error('INVALID_CAMERA_MODE');if(mode==='FIRST_PERSON'&&this.mode!==mode){this.yaw=0;this.pitch=0}this.mode=mode;this.modeTime=0;return this.mode}
 drag(dx=0,dy=0){if(!Number.isFinite(dx)||!Number.isFinite(dy))throw Error('INVALID_INPUT');this.yaw+=clamp(dx,-500,500)*.006;this.pitch=clamp(this.pitch+clamp(dy,-500,500)*.005,this.mode==='FIRST_PERSON'?-0.8:.14,this.mode==='FIRST_PERSON'?.8:1.3)}
 zoom(factor){if(!Number.isFinite(factor)||factor<=0)throw Error('INVALID_ZOOM');this.radius=clamp(this.radius*factor,14,145)}
 move(forward=0,side=0){
  if(this.mode!=='FIRST_PERSON')return this.fp.slice();
  if(!Number.isFinite(forward)||!Number.isFinite(side))throw Error('INVALID_INPUT');
  const f=clamp(forward,-5,5),s=clamp(side,-5,5),dx=(-Math.sin(this.yaw)*f+Math.cos(this.yaw)*s),dz=(-Math.cos(this.yaw)*f-Math.sin(this.yaw)*s);
  const x=clamp(this.fp[0]+dx,-this.bounds,this.bounds),z=clamp(this.fp[2]+dz,-this.bounds,this.bounds);
  if(!blocked(x,this.fp[2],this.obstacles))this.fp[0]=x;
  if(!blocked(this.fp[0],z,this.obstacles))this.fp[2]=z;
  return this.fp.slice();
 }
 pose(time=0,dt=1/60,{follow=null}={}){
  const d=clamp(Number.isFinite(dt)?dt:0,0,.1);this.modeTime+=d;
  let pose;
  if(this.mode==='ORBIT'){
   const target=[0,5,0],theta=this.yaw,phi=this.pitch;
   const eye=[Math.sin(theta)*Math.cos(phi)*this.radius,8+Math.sin(phi)*this.radius*.9,Math.cos(theta)*Math.cos(phi)*this.radius];
   pose={...checkPose(eye,target),fov:50,mode:this.mode};
  }else if(this.mode==='FIRST_PERSON'){
   const eye=this.fp.slice();eye[1]=1.8;const v=[-Math.sin(this.yaw)*Math.cos(this.pitch),Math.sin(this.pitch),-Math.cos(this.yaw)*Math.cos(this.pitch)];
   pose={...checkPose(eye,add(eye,mul(v,5))),fov:69,mode:this.mode};
  }else if(this.mode==='FOLLOW'){
   const p=follow && Number.isFinite(follow.x)&&Number.isFinite(follow.z)?follow:{x:0,z:0,heading:0};
   const heading=Number.isFinite(p.heading)?p.heading:0;
   const target=[clamp(p.x,-this.bounds,this.bounds),2.1,clamp(p.z,-this.bounds,this.bounds)];
   const desired=[target[0]-Math.sin(heading)*10,target[1]+5,target[2]-Math.cos(heading)*10];
   const alpha=1-Math.exp(-d*7);this.followEye=lerp(this.followEye,desired,alpha);this.followTarget=lerp(this.followTarget,target,alpha);
   if(len(sub(this.followEye,this.followTarget))<.3)this.followEye[1]+=3;
   pose={...checkPose(this.followEye,this.followTarget),fov:55,mode:this.mode};
  }else pose=shotAt(time,this.shots);
  return {...pose,poseRevision:1};
 }
}
export {DEFAULT_SHOTS,modes};
