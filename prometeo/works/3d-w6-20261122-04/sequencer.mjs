/**
 * PROMETEO · Cinematic Sequence Kernel v1
 * Deterministic, engine-independent keyframe evaluator.
 * Author: 3d-w6-20261122-04. MIT.
 */
const EPS = 1e-7;
export const clamp = (x,a,b) => Math.min(b,Math.max(a,Number(x)||0));
export const ease = t => {const x=clamp(t,0,1);return x*x*(3-2*x)};
export const lerp = (a,b,t) => a+(b-a)*t;
export const vec = (a,b,t) => a.map((v,i)=>lerp(v,b[i],t));
export function validateTimeline(t){
  const errors=[];
  if(!t||t.schema!=='prometeo.cinematic-timeline/v1')errors.push('schema');
  if(!Array.isArray(t?.shots)||!t.shots.length)return [...errors,'no shots'];
  if(t.shots[0].start!==0)errors.push('start not zero');
  if(t.shots.length>24)errors.push('too many shots');
  let last=0;
  const ids=new Set();
  for(const s of t.shots){
    if(ids.has(s.id))errors.push('duplicate shot '+s.id);ids.add(s.id);
    if(!Number.isFinite(s.start)||!Number.isFinite(s.end)||s.start<0||s.end<=s.start||s.end-s.start<0.25)errors.push('invalid duration '+s.id);
    if(Math.abs(last-s.start)>EPS)errors.push('gap/overlap at '+s.id);
    last=s.end;
    const c=s.camera;
    if(!c||!['from','to','targetFrom','targetTo'].every(k=>Array.isArray(c[k])&&c[k].length===3&&c[k].every(Number.isFinite)))errors.push('invalid camera '+s.id);
    if(!Number.isFinite(c?.fov)||c.fov<15||c.fov>95)errors.push('invalid fov '+s.id);
    if(!Array.isArray(s.light?.from===undefined?undefined:[s.light.from,s.light.to])||![s.light.from,s.light.to].every(Number.isFinite))errors.push('invalid light '+s.id);
    for(const id of ['vera','noe'])for(const key of ['head','reach','lean','walk']){
      const v=s.actors?.[id]?.[key];
      if(!Array.isArray(v)||v.length!==2||!v.every(Number.isFinite))errors.push('invalid '+id+'.'+key+' '+s.id);
    }
  }
  if(Math.abs(last-t.duration)>EPS)errors.push('total duration mismatch');
  if(t.duration>180||t.duration<=0)errors.push('unsupported total duration');
  return errors;
}
export function getShot(t,film){
  if(!film?.shots?.length)throw new Error('No shots');
  const time=clamp(t,0,film.duration);
  const i=film.shots.findIndex((s,index)=>time<s.end-EPS||index===film.shots.length-1);
  return {shot:film.shots[Math.max(0,i)],index:Math.max(0,i),time};
}
export function evaluateTimeline(t,film){
  const {shot,index,time}=getShot(t,film);
  const progress=clamp((time-shot.start)/(shot.end-shot.start),0,1), k=ease(progress);
  const actors={};
  for(const id of ['vera','noe']){
    const a=shot.actors[id];actors[id]={};
    for(const key of ['head','reach','lean','walk'])actors[id][key]=lerp(a[key][0],a[key][1],k);
  }
  return {
    time,shotId:shot.id,shotIndex:index,progress,
    eye:vec(shot.camera.from,shot.camera.to,k),
    target:vec(shot.camera.targetFrom,shot.camera.targetTo,k),
    fov:shot.camera.fov,
    light:lerp(shot.light.from,shot.light.to,k),
    actors,subtitle:shot.subtitle||''
  };
}
/** Retimes the current shot and translates later boundaries without gaps. */
export function retimeShot(film,id,seconds){
 const next=JSON.parse(JSON.stringify(film));
 const index=next.shots.findIndex(s=>s.id===id);
 if(index<0)throw new Error('Unknown shot');
 const shot=next.shots[index], length=clamp(seconds,1,15), delta=length-(shot.end-shot.start);
 if(next.duration+delta>180)throw new Error('Maximum runtime exceeded');
 shot.end=Number((shot.start+length).toFixed(4));
 for(let i=index+1;i<next.shots.length;i++){next.shots[i].start=Number((next.shots[i].start+delta).toFixed(4));next.shots[i].end=Number((next.shots[i].end+delta).toFixed(4))}
 next.duration=Number((next.duration+delta).toFixed(4));
 const errors=validateTimeline(next);if(errors.length)throw new Error(errors.join(', '));
 return next;
}
/** Safe, complete round-trip. JSON is the source of truth, not editor UI state. */
export function cloneValidated(film){
 const result=JSON.parse(JSON.stringify(film));
 const errors=validateTimeline(result);
 if(errors.length)throw new Error('Invalid sequence: '+errors.join(', '));
 return result;
}
export const frameAt=(index,fps)=>index/fps;
/** Numeric comparison of camera, acting and light across serialization. */
export function diffAt(filmA,filmB,time){
 const a=evaluateTimeline(time,filmA),b=evaluateTimeline(time,filmB);
 const flat=s=>[...s.eye,...s.target,s.fov,s.light,...Object.values(s.actors).flatMap(x=>[x.head,x.reach,x.lean,x.walk])];
 return Math.max(...flat(a).map((v,i)=>Math.abs(v-flat(b)[i])));
}
