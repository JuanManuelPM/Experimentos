/** Pure integer-frame camera director. No Three.js, no actor model mutations. MIT original code. */
export const VERSION = '0.1.0';
const allowed = new Set(['root','face','paws','hands','object','interaction']);
const finite = x => typeof x === 'number' && Number.isFinite(x);
const vec3 = a => Array.isArray(a) && a.length === 3 && a.every(finite);
const clamp = (x,a,b) => Math.min(b,Math.max(a,x));
const mix = (a,b,t) => a + (b-a)*t;
const lerp3 = (a,b,t) => a.map((v,i)=>mix(v,b[i],t));
const add3 = (a,b) => a.map((v,i)=>v+b[i]);
const sub3 = (a,b) => a.map((v,i)=>v-b[i]);
const dot = (a,b) => a.reduce((v,x,i)=>v+x*b[i],0);
const cross = (a,b) => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const normalize = a => { const n=Math.hypot(...a); return n>1e-9?a.map(x=>x/n):null; };
export const smoothstep = x => {const t=clamp(x,0,1);return t*t*(3-2*t);};

export function validateShotlist(data) {
  const errors=[];
  if(!data||data.schema!=='prometeo.3d.semantic-director/1') errors.push('SCHEMA');
  if(!Number.isInteger(data?.fps?.num)||data.fps.num<=0||!Number.isInteger(data?.fps?.den)||data.fps.den<=0) errors.push('FPS');
  if(!Number.isInteger(data?.totalFrames)||data.totalFrames<1||data.totalFrames>24000) errors.push('TOTAL_FRAMES');
  if(!Array.isArray(data?.shots)||data.shots.length<2||data.shots.length>40) errors.push('SHOT_COUNT');
  let end=0;const ids=new Set();
  for(const shot of data?.shots||[]) {
    if(typeof shot?.id!=='string'||!shot.id||ids.has(shot.id)) errors.push('SHOT_ID');
    ids.add(shot?.id);
    if(!Number.isInteger(shot?.startFrame)||!Number.isInteger(shot?.endFrame)||shot.startFrame!==end||shot.endFrame<=end) errors.push('SHOT_RANGE:'+shot?.id);
    if(Number.isInteger(shot?.endFrame))end=shot.endFrame;
    const c=shot?.camera;
    if(!c||!allowed.has(c.origin)||!allowed.has(c.lookAt)||!vec3(c.from)||!vec3(c.to)||!finite(c.fov)||c.fov<20||c.fov>100) errors.push('CAMERA:'+shot?.id);
    if(typeof shot?.subtitle!=='string'||shot.subtitle.length>240) errors.push('SUBTITLE:'+shot?.id);
    const tr=shot?.transition;
    if(!tr||!['cut','fade'].includes(tr.type)||!Number.isInteger(tr.frames)||tr.frames<0||tr.frames>24||(tr.type==='cut'&&tr.frames!==0)||(tr.type==='fade'&&tr.frames<1)) errors.push('TRANSITION:'+shot?.id);
    if(tr?.type==='fade'&&Number.isInteger(shot?.endFrame)&&shot.endFrame-shot.startFrame<2*tr.frames) errors.push('FADE_TOO_LONG:'+shot?.id);
  }
  if(end!==data?.totalFrames) errors.push('END_MISMATCH');
  return {ok:errors.length===0,errors,durationSeconds:(data?.totalFrames||0)*((data?.fps?.den||1)/(data?.fps?.num||24))};
}
export function semanticAnchors({height=1.4,origin=[0,0,0],object=[1.55,0.85,0.1]}={}) {
  if(!finite(height)||height<=0||!vec3(origin)||!vec3(object)) throw Error('INVALID_SUBJECT_BOUNDS');
  return {root:add3(origin,[0,height*.48,0]),face:add3(origin,[0,height*.77,height*.15]),paws:add3(origin,[0,height*.17,height*.2]),hands:add3(origin,[0,height*.17,height*.2]),object:[...object],interaction:[...object]};
}
export function sampleFrame(data,frame,anchors,subject='gato') {
  const checked=validateShotlist(data);if(!checked.ok)throw Error('INVALID_SHOTLIST:'+checked.errors.join(','));
  if(!finite(frame)||!anchors||typeof anchors!=='object')throw Error('INVALID_FRAME_OR_ANCHORS');
  const f=clamp(Math.floor(frame),0,data.totalFrames-1);
  const i=data.shots.findIndex(s=>f>=s.startFrame&&f<s.endFrame);
  const shot=data.shots[i];const c=shot.camera;
  if(!vec3(anchors[c.origin])||!vec3(anchors[c.lookAt]))throw Error('ANCHOR_MISSING:'+(!vec3(anchors[c.origin])?c.origin:c.lookAt));
  const elapsed=f-shot.startFrame, span=shot.endFrame-shot.startFrame;
  const t=smoothstep(span===1?1:elapsed/(span-1));
  let alpha=1;
  if(shot.transition.type==='fade')alpha=Math.min(1,(elapsed+1)/shot.transition.frames,(span-elapsed)/shot.transition.frames);
  const position=add3(anchors[c.origin],lerp3(c.from,c.to,t));
  const target=[...anchors[c.lookAt]];
  return {frame:f,shotIndex:i,shotId:shot.id,label:shot.label,position,target,fov:c.fov,alpha,
    subtitle:shot.subtitle.replaceAll('{subject}',String(subject)),timeSeconds:f*data.fps.den/data.fps.num,
    cutIn:f===shot.startFrame,cutOut:f===shot.endFrame-1,progress:elapsed/span};
}
/** No WebGL dependency: projects a real subject point into normalized device coordinates. */
export function projectPoint(sample,point,aspect=16/9) {
  if(!sample||!vec3(sample.position)||!vec3(sample.target)||!vec3(point)||!finite(aspect)||aspect<=0)throw Error('BAD_PROJECTION_INPUT');
  const forward=normalize(sub3(sample.target,sample.position));
  const right=forward&&normalize(cross(forward,[0,1,0]));
  const up=forward&&right&&normalize(cross(right,forward));
  if(!forward||!right||!up) return {visible:false,reason:'DEGENERATE_CAMERA'};
  const v=sub3(point,sample.position),depth=dot(v,forward),tan=Math.tan(sample.fov*Math.PI/360);
  if(depth<=0.08) return {visible:false,reason:'BEHIND_NEAR'};
  const ndcX=dot(v,right)/(depth*tan*aspect),ndcY=dot(v,up)/(depth*tan);
  return {visible:Math.abs(ndcX)<=1&&Math.abs(ndcY)<=1,ndcX,ndcY,depth,reason:'PROJECTED'};
}
export function safeSubject(sample,anchors,key='face',aspect=16/9,margin=.14) {
  if(!anchors||!vec3(anchors[key]))return {visible:false,reason:'ANCHOR_MISSING'};
  const p=projectPoint(sample,anchors[key],aspect);
  return {...p,safe:p.visible&&Math.abs(p.ndcX)<=1-margin&&Math.abs(p.ndcY)<=1-margin};
}
