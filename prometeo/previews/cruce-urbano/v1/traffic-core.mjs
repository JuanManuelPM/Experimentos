/** PROMETEO traffic-core@0.1.0 - authored in cruce-urbano, candidate; traffic laws receive all timing/positions externally. */
export const positiveMod=(n,m)=>((n%m)+m)%m;
export function phaseAt(seconds, phases, cycleSeconds) {
  const t=positiveMod(seconds,cycleSeconds);
  const stage=phases.find(p=>t>=p.start && t<p.end);
  if(!stage) throw Error('TRAFFIC_STAGE_GAP:'+t);
  if(stage.cars==='GREEN' && stage.walk==='GREEN') throw Error('CONFLICTING_GREEN_PHASE');
  return stage;
}
export function samplePath(time, keyframes) {
  const t=Math.max(keyframes[0].t,Math.min(keyframes[keyframes.length-1].t,time));
  let i=0;while(i<keyframes.length-2&&t>keyframes[i+1].t)i++;
  const a=keyframes[i],b=keyframes[i+1],dt=b.t-a.t;
  if(!(dt>0))throw Error('NON_MONOTONIC_PATH');
  const u=Math.max(0,Math.min(1,(t-a.t)/dt));
  const p={x:a.x+(b.x-a.x)*u,z:a.z+(b.z-a.z)*u};
  const v={x:(b.x-a.x)/dt,z:(b.z-a.z)/dt};
  return {...p,v,speed:Math.hypot(v.x,v.z)};
}
export function clearanceToCar(ped,car,halfX,halfZ,personRadius){
 const dx=Math.max(Math.abs(ped.x-car.x)-halfX,0);
 const dz=Math.max(Math.abs(ped.z-car.z)-halfZ,0);
 return Math.hypot(dx,dz)-personRadius;
}
export function cameraPose(seconds,ped){
 const t=Math.min(19,Math.max(0,seconds)),u=t/19;
 // Unbroken circular dolly while actor walks or waits. Deliberate loop cut at t=19.
 const az=-0.23+u*1.42,dist=4.6;
 return {x:ped.x+Math.sin(az)*dist,y:2.55+0.19*Math.sin(u*Math.PI),z:ped.z-Math.cos(az)*dist,
         look:{x:ped.x,y:1.20,z:ped.z+0.55}};
}
