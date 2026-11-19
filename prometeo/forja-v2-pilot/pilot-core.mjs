/** FORJA V2 pilot: deterministic choreography & camera math. Tests are NOT visual QA. */
import {validateShotlist,sampleFrame,semanticAnchors} from './vendor/semantic-director.mjs';
export const DURATION=20;
export const ACTOR_ID='prometeo/civil_azul';
export const ACTOR_ALT='prometeo/civil_granate';
export const SCRIPT=[
{name:'ESPERA',start:0,end:2,mode:'idle',from:[-1.25,2.65],to:[-1.25,2.65]},
{name:'ENTRADA',start:2,end:6,mode:'walk',from:[-1.25,2.65],to:[-1.15,-.25]},
{name:'GIRO',start:6,end:7,mode:'turn',from:[-1.15,-.25],to:[-1.15,-.25]},
{name:'APROXIMACIÓN',start:7,end:11,mode:'walk',from:[-1.15,-.25],to:[1.0,-1.25]},
{name:'OBJETO',start:11,end:14,mode:'interact',from:[1.0,-1.25],to:[1.0,-1.25]},
{name:'ROSTRO',start:14,end:17,mode:'idle',from:[1.0,-1.25],to:[1.0,-1.25]},
{name:'CIERRE',start:17,end:20,mode:'idle',from:[1.0,-1.25],to:[1.0,-1.25]}];
export const SHOTS=[
{id:'GENERAL',start:0,end:4,fov:53},{id:'SEGUIMIENTO',start:4,end:10,fov:46},
{id:'ROSTRO',start:10,end:13,fov:34},{id:'OBJETO',start:13,end:16,fov:41},
{id:'CIERRE',start:16,end:20,fov:55}];
export function clamp(n,a,b){return Math.max(a,Math.min(b,n))}
export function lerp(a,b,t){return a+(b-a)*t}
export function wrapAngle(a){return Math.atan2(Math.sin(a),Math.cos(a))}
export function interpolateAngle(a,b,u){return a+wrapAngle(b-a)*u}
export function localForwardAngle(axis){const map={'+Z':0,'-Z':Math.PI,'+X':Math.PI/2,'-X':-Math.PI/2};if(!(axis in map))throw Error('FRONT_AXIS_UNCALIBRATED');return map[axis]}
export function yawForDirection(dx,dz,axis){if(Math.hypot(dx,dz)<1e-7)throw Error('NO_MOVEMENT_DIRECTION');return wrapAngle(Math.atan2(dx,dz)-localForwardAngle(axis))}
export function frontDot(yaw,dx,dz,axis){const a=yaw+localForwardAngle(axis),l=Math.hypot(dx,dz);return l>1e-7?(Math.sin(a)*dx+Math.cos(a)*dz)/l:null}
export function sampleActor(time,axis='+Z'){
 const t=clamp(time,0,DURATION),part=SCRIPT.find(s=>t>=s.start&&t<s.end)||SCRIPT.at(-1);
 const u=clamp((t-part.start)/(part.end-part.start),0,1);
 const x=lerp(part.from[0],part.to[0],u),z=lerp(part.from[1],part.to[1],u);let yaw;
 if(t<6)yaw=yawForDirection(.1,-2.9,axis);
 else if(t<7)yaw=interpolateAngle(yawForDirection(.1,-2.9,axis),yawForDirection(2.15,-1,axis),u);
 else yaw=yawForDirection(2.15,-1,axis);
 const dx=part.to[0]-part.from[0],dz=part.to[1]-part.from[1];
 return{time:t,phase:part.name,mode:part.mode,position:[x,0,z],yaw,frontDot:part.mode==='walk'?frontDot(yaw,dx,dz,axis):null}
}
/** Reuses the original camera:semantic-director@0.1.0 verbatim, MIT, exact Git blob 43b8138... */
export const OWNER_SHOTLIST={
 schema:'prometeo.3d.semantic-director/1',
 fps:{num:24,den:1},totalFrames:480,
 shots:[
 {id:'GENERAL',label:'Cocina vacía',startFrame:0,endFrame:96,camera:{origin:'object',lookAt:'object',from:[5.4,3.1,8.4],to:[5.4,3.1,8.4],fov:53},subtitle:'',transition:{type:'cut',frames:0}},
 {id:'SEGUIMIENTO',label:'Entrada civil',startFrame:96,endFrame:240,camera:{origin:'root',lookAt:'root',from:[2.6,1.9,4],to:[2.6,1.9,4],fov:46},subtitle:'',transition:{type:'cut',frames:0}},
 {id:'ROSTRO',label:'Rostro',startFrame:240,endFrame:312,camera:{origin:'face',lookAt:'face',from:[1,.4,2],to:[1,.4,2],fov:34},subtitle:'',transition:{type:'cut',frames:0}},
 {id:'OBJETO',label:'Taza / radio',startFrame:312,endFrame:384,camera:{origin:'interaction',lookAt:'interaction',from:[.9,.9,2.5],to:[.9,.9,2.5],fov:41},subtitle:'',transition:{type:'cut',frames:0}},
 {id:'CIERRE',label:'Salida',startFrame:384,endFrame:480,camera:{origin:'object',lookAt:'object',from:[5.6,2.6,5.4],to:[5.6,2.6,5.4],fov:55},subtitle:'',transition:{type:'cut',frames:0}}
 ]};
export function ownerCameraCheck(){return validateShotlist(OWNER_SHOTLIST)}
export function sampleCamera(time,actor){
 const origin=actor.position;
 const anchors=semanticAnchors({height:1.75,origin,object:[1.9,.92,-1.8]});
 // The original director owns frame sequencing, origins, cuts, target, and projection.
 const s=sampleFrame(OWNER_SHOTLIST,Math.floor(clamp(time,0,DURATION)*24),anchors,'civil');
 return{shot:s.shotId,fov:s.fov,position:s.position,target:s.target,cutIn:s.cutIn,alpha:s.alpha,frame:s.frame}
}
export function chooseClip(clips,mode){
 const arr=Array.isArray(clips)?clips:[],names=arr.map(c=>typeof c==='string'?c:c.name);
 const priorities=mode==='walk'?[/^walk(?:ing)?$/i,/walk/i]:mode==='interact'?[/pick|interact|grab/i]:[/^idle$/i,/idle|stand|breath/i];
 for(const re of priorities){const i=names.findIndex(s=>re.test(s||''));if(i!==-1)return{index:i,name:names[i],verifiedMode:mode==='walk'?'WALK_CLIP_PRESENT':mode==='interact'?'ACTION_CLIP_PRESENT':'IDLE_CLIP_PRESENT'}}
 return{index:-1,name:null,verifiedMode:'MISSING_'+mode.toUpperCase()+'_CLIP'}
}
export function validateScript(){
 const problems=[];let end=0;for(const p of SCRIPT){if(p.start!==end||p.end<=p.start)problems.push('TIMELINE_GAP:'+p.name);end=p.end}
 if(end!==DURATION)problems.push('DURATION');let prev=0;for(const s of SHOTS){if(s.start!==prev||s.end<=s.start)problems.push('SHOT_GAP:'+s.id);prev=s.end}
 if(prev!==DURATION)problems.push('SHOT_DURATION');return{pass:!problems.length,problems}
}
export function makeScene(knownIds){
 const props=[
 ['furniture-kit/kitchencabinet',-2.45,0,-2.6,1,0],
 ['furniture-kit/kitchenstove',-1.55,0,-2.6,1,0],
 ['furniture-kit/kitchencabinetdrawer',-.6,0,-2.6,1,0],
 ['furniture-kit/kitchensink',.3,0,-2.6,1,0],
 ['furniture-kit/kitchenfridge',-3.15,0,-2.1,1.9,0],
 ['furniture-kit/kitchencabinetupper',-2.3,1.65,-2.65,.7,0],
 ['furniture-kit/kitchenmicrowave',-1.55,.93,-2.4,.35,0],
 ['furniture-kit/kitchencoffeemachine',-.25,.91,-2.55,.25,0],
 ['furniture-kit/table',2,0,-1.8,.86,0],
 ['furniture-kit/chair',2,0,-.65,.9,Math.PI],
 ['furniture-kit/chair',3.05,0,-1.75,.9,-Math.PI/2],
 ['furniture-kit/lampsquareceiling',1.3,2.62,-1.5,.5,0],
 ['furniture-kit/radio',1.95,.86,-1.78,.28,0],
 [ACTOR_ID,-1.25,0,2.65,1.75,0]];
 const items=props.filter(([id])=>knownIds.has(id)).map(([id,x,y,z,h,r],i)=>({uid:'pilot-'+i,id,p:[x,y,z],r,h,s:[1,1,1]}));
 return{schema:'prometeo.forja.scene/v1',name:'Cocina · ensayo cinematográfico 20s',items}
}

/** Actor only: freeze skeletal animation while paused cinematic root is frozen. */
export const shouldAdvanceActorMixer=(id,actorId,cinematic,playing)=>!(cinematic&&id===actorId&&!playing);
export const phaseElapsed=(t,phase)=>{const s=SCRIPT.find(x=>x.name===phase);if(!s)throw Error('UNKNOWN_PHASE');return clamp(t-s.start,0,s.end-s.start)};
