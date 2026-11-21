/** PROMETEO 3D · camera/world-to-scene-rails@0.1.0
 * Standalone deterministic normalized-time shot sampler. Original MIT.
 * No Three.js, DOM, renderer, actor, tile service, or network dependency.
 */
export const VERSION='0.1.1';
const vec=a=>Array.isArray(a)&&a.length===3&&a.every(Number.isFinite);
const finite=Number.isFinite;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const lerp=(a,b,t)=>a+(b-a)*t;
const mix3=(a,b,t)=>a.map((v,i)=>lerp(v,b[i],t));
const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t)};
const smoother=t=>{t=clamp(t,0,1);return t*t*t*(t*(t*6-15)+10)};
const easing={linear:t=>t,smooth,smoother,inQuad:t=>t*t,outCubic:t=>1-(1-t)**3};
export function validateRail(plan){
 const errors=[];
 if(plan?.schema!=='prometeo.3d.world-to-scene-rail/v1')errors.push('SCHEMA');
 if(!finite(plan?.fps)||plan.fps<1||plan.fps>120)errors.push('FPS');
 if(!Array.isArray(plan?.shots)||plan.shots.length<2||plan.shots.length>24)errors.push('SHOTS');
 let cursor=0; const seen=new Set();
 for(const [name,layer] of Object.entries(plan?.layers||{})){if(!/^[a-z][a-z0-9-]*$/.test(name)||!Array.isArray(layer?.range)||layer.range.length!==2||!layer.range.every(finite)||layer.range[1]<=layer.range[0]||!['in','out'].includes(layer?.mode))errors.push('LAYER:'+name);}
 for(const s of plan?.shots??[]){
  if(typeof s.id!=='string'||!s.id||seen.has(s.id))errors.push('ID');seen.add(s.id);
  if(!finite(s.from)||!finite(s.to)||Math.abs(s.from-cursor)>1e-5||s.to<=s.from)errors.push('TIME:'+s.id);
  cursor=s.to;
  if(!Array.isArray(s.camera)||s.camera.length<2||!s.camera.every(vec))errors.push('CAMERA:'+s.id);
  if(!Array.isArray(s.target)||s.target.length<2||!s.target.every(vec))errors.push('TARGET:'+s.id);
  if(!Array.isArray(s.fov)||s.fov.length!==2||!s.fov.every(finite)||s.fov.some(v=>v<15||v>100))errors.push('FOV:'+s.id);
  if(s.ease&&!easing[s.ease])errors.push('EASE:'+s.id);
  if(s.transition&&!['continuous','cut'].includes(s.transition))errors.push('TRANSITION:'+s.id);
 }
 return {ok:errors.length===0,errors,duration:cursor};
}
function catmull(p0,p1,p2,p3,t){const t2=t*t,t3=t2*t;return p1.map((v,i)=>.5*((2*v)+(-p0[i]+p2[i])*t+(2*p0[i]-5*v+4*p2[i]-p3[i])*t2+(-p0[i]+3*v-3*p2[i]+p3[i])*t3));}
function samplePath(pts,t){if(pts.length===2)return mix3(pts[0],pts[1],t);const u=t*(pts.length-1), i=Math.min(pts.length-2,Math.floor(u)),k=u-i;return catmull(pts[Math.max(0,i-1)],pts[i],pts[i+1],pts[Math.min(pts.length-1,i+2)],k);}
export function sampleRail(plan,seconds){const q=validateRail(plan);if(!q.ok)throw new Error('INVALID_RAIL:'+q.errors.join(','));if(!finite(seconds))throw new Error('INVALID_TIME');
 const time=clamp(seconds,0,q.duration), idx=Math.min(plan.shots.length-1,plan.shots.findIndex(s=>time<s.to)===-1?plan.shots.length-1:plan.shots.findIndex(s=>time<s.to));
 const s=plan.shots[idx], raw=clamp((time-s.from)/(s.to-s.from),0,1), t=(easing[s.ease||'smooth'])(raw);
 const layers=Object.fromEntries(Object.entries(plan.layers||{}).map(([name,config])=>{const amount=smooth((time-config.range[0])/(config.range[1]-config.range[0]));return [name,config.mode==='out'?1-amount:amount]}));
 return {time,shotId:s.id,shotIndex:idx,shotProgress:raw,position:samplePath(s.camera,t),target:samplePath(s.target,t),fov:lerp(s.fov[0],s.fov[1],t),transition:s.transition||'continuous',cutIn:time===s.from&&s.transition==='cut',layers};
}
export function sampleFrame(plan,frame){if(!Number.isInteger(frame)||frame<0)throw new Error('INVALID_FRAME');return sampleRail(plan,frame/plan.fps);}

/** Verified right-handed cross product: never truncate the third component. */
export function cross3(a,b){
 if(!vec(a)||!vec(b))throw Error('INVALID_CROSS_INPUT');
 return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
}
/** Column-major 4×4 view matrix for Y-up renderer. Throws on degenerate direction. */
export function viewMatrix(eye,target){
 if(!vec(eye)||!vec(target))throw Error('INVALID_CAMERA_VECTOR');
 const sub=(a,b)=>a.map((v,i)=>v-b[i]);const dot=(a,b)=>a.reduce((n,x,i)=>n+x*b[i],0);
 const unit=a=>{const len=Math.hypot(...a);if(!(len>1e-7))throw Error('DEGENERATE_CAMERA_DIRECTION');return a.map(v=>v/len)};
 const z=unit(sub(eye,target)), x=unit(cross3([0,1,0],z)), y=cross3(z,x);
 const m=[x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1];
 if(!m.every(Number.isFinite))throw Error('CAMERA_MATRIX_NOT_FINITE');return m;
}
export function perspectiveMatrix(fov,aspect,near=.06,far=1400){
 if(![fov,aspect,near,far].every(Number.isFinite)||fov<=0||fov>=179||aspect<=0||near<=0||far<=near)throw Error('INVALID_PERSPECTIVE');
 const f=1/Math.tan(fov*Math.PI/360),nf=1/(near-far);
 return [f/aspect,0,0,0,0,f,0,0,0,0,(far+near)*nf,-1,0,0,2*far*near*nf,0];
}
