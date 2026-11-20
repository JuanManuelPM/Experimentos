// PROMETEO Studio 3D · Continuous camera and mechanical timing · v0.1.0 · CC0
// Pure math: no renderer dependency, no scene-specific coordinates in the engine.
export const TIMELINE_ID='prometeo.camera-rails@0.1.0';
export const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
export const lerp=(a,b,t)=>a+(b-a)*t;
export const ease=(t)=>{t=clamp(t);return t*t*(3-2*t)};
export const interval=(t,a,b)=>ease((t-a)/(b-a));
export function sampleCamera(t,tracks){
  const tracksSorted=tracks.slice().sort((a,b)=>a.start-b.start);
  if(!tracksSorted.length)throw Error('Camera track missing');
  const track=tracksSorted.find(b=>t>=b.start&&t<b.end)||(
    t<tracksSorted[0].start?tracksSorted[0]:tracksSorted[tracksSorted.length-1]);
  const u=track.kind==='HOLD'?0:interval(t,track.start,track.end);
  const from=track.from,to=track.to||from;
  return {x:lerp(from.x,to.x,u),y:lerp(from.y,to.y,u),z:lerp(from.z,to.z,u),
    yaw:lerp(from.yaw,to.yaw,u),pitch:lerp(from.pitch||0,to.pitch||0,u),beat:track.kind};
}
export function sampleDoors(t,mechanical){
  const phase=(key)=>{const f=mechanical[key];return interval(t,f.start,f.end)};
  return {
    front:clamp(phase('frontOpen')-phase('frontClose')),
    back:phase('backOpen')
  };
}
export function sampleVibration(t,range,scale=1) {
  if(t<range.start||t>range.end)return {x:0,y:0,z:0,roll:0};
  const k=Math.min(1,(t-range.start)*2,(range.end-t)*2)*scale;
  return {x:k*(.009*Math.sin(21*t)+.005*Math.sin(37*t)),y:k*(.012*Math.sin(18*t)+.006*Math.sin(59*t)),
    z:k*.004*Math.sin(15*t),roll:k*.003*Math.sin(12*t)};
}
export function sampleFloor(t,markers){
  let value=markers[0]?.label||'01';
  for(const marker of markers)if(t>=marker.at)value=marker.label;
  return value;
}
export function validateCameraTrack(tracks,doorConfig){
  const failures=[];const sorted=tracks.slice().sort((a,b)=>a.start-b.start);
  for(let i=0;i<sorted.length;i++){
    const a=sorted[i];
    if(!(a.end>a.start)||!Number.isFinite(a.end))failures.push('BAD_TIME_'+i);
    if(a.kind==='HOLD'&&!a.motivation)failures.push('UNMOTIVATED_HOLD_'+i);
    if(i && Math.abs(a.start-sorted[i-1].end)>1e-9)failures.push('GAP_OR_OVERLAP_'+i);
    if(i && a.kind!=='CUT'){
      const prev=sorted[i-1].to||sorted[i-1].from;
      for(const field of ['x','y','z','yaw','pitch']){
        if(Math.abs((prev[field]||0)-(a.from[field]||0))>1e-6)failures.push('POSITION_DISCONTINUITY_'+i+'_'+field);
      }
    }
  }
  const configs=[doorConfig.frontOpen,doorConfig.frontClose,doorConfig.backOpen];
  if(configs.some(x=>x.end<=x.start))failures.push('BAD_DOOR_INTERVAL');
  return {pass:failures.length===0,failures,frameCount:Math.ceil((sorted.at(-1)?.end||0)*60)};
}
export function validateThresholdCrossings(tracks,door,thresholds){
  const errors=[];
  for(const s of thresholds){
    const c=sampleCamera(s.at,tracks);
    const p=sampleDoors(s.at,door);
    const gap=(s.door==='front'?p.front:p.back);
    if(gap<.98)errors.push('CAMERA_DOOR_CLOSED_AT_'+s.door+'_'+s.at);
    if(Math.abs(c.z-s.z)>.12)errors.push('CAMERA_NOT_AT_THRESHOLD_'+s.door+'_'+s.at);
  }
  return {pass:!errors.length,errors};
}
