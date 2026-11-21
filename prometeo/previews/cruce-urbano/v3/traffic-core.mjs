/** Cruce urbano V2 · deterministic 80 s network · metres/seconds. */
export const DURATION=80;
export const mod=(x,n)=>((x%n)+n)%n;
export function phaseAt(time){
 const t=mod(time,DURATION);
 if(t<13)return {id:'WALK_A',walk:true,ew:'RED',ns:'RED',label:'CRUCE PEATONAL'};
 if(t<16)return {id:'BUFFER_A',walk:false,ew:'RED',ns:'RED',label:'DESPEJE'};
 if(t<30)return {id:'EW_GO',walk:false,ew:'GREEN',ns:'RED',label:'AVENIDA ESTE / OESTE'};
 if(t<32)return {id:'EW_AMBER',walk:false,ew:'AMBER',ns:'RED',label:'PRECAUCIÓN'};
 if(t<40)return {id:'EW_CLEAR',walk:false,ew:'RED',ns:'RED',label:'DESPEJE'};
 if(t<53)return {id:'WALK_B',walk:true,ew:'RED',ns:'RED',label:'CRUCE PEATONAL'};
 if(t<56)return {id:'BUFFER_B',walk:false,ew:'RED',ns:'RED',label:'DESPEJE'};
 if(t<70)return {id:'NS_GO',walk:false,ew:'RED',ns:'GREEN',label:'AVENIDA NORTE / SUR'};
 if(t<72)return {id:'NS_AMBER',walk:false,ew:'RED',ns:'AMBER',label:'PRECAUCIÓN'};
 return {id:'NS_CLEAR',walk:false,ew:'RED',ns:'RED',label:'DESPEJE'};
}
export function carPosition(t, v){
 const time=mod(t,DURATION),begin=v.axis==='x'?16:56,end=v.axis==='x'?32:72;
 const approach=Math.min(v.start+v.speed*begin,v.stop);
 let travel;
 if(time<begin)travel=Math.min(v.start+v.speed*time,v.stop);
 else travel=approach+v.speed*(time-begin);
 // Once across the stopline, finish clearing during the red buffer.
 return {x:v.axis==='x'?v.dir*travel:v.lane,y:0,z:v.axis==='z'?v.dir*travel:v.lane, visible:travel<43};
}
export function pedPosition(t,actor){
 const time=mod(t,DURATION);
 if(actor.kind==='cross'){
  const q=(time<40)?Math.max(0,Math.min(1,(time-1)/10.6)):Math.max(0,Math.min(1,(time-41)/10.6));
  const u=time<40?q:1-q;
  const from=-7.1,to=7.1;
  return {x:actor.axis==='x'?from+(to-from)*u:actor.fixed,
          z:actor.axis==='z'?from+(to-from)*u:actor.fixed,
          moving:(time>=1&&time<11.6)||(time>=41&&time<51.6)};
 }
 const route=actor.route,segmentSeconds=actor.segmentSeconds||8;
 const p=mod(t+actor.offset,route.length*segmentSeconds)/segmentSeconds;
 const i=Math.floor(p),f=p-i,a=route[i],b=route[(i+1)%route.length];
 const u=f*f*(3-2*f);return {x:a[0]+(b[0]-a[0])*u,z:a[1]+(b[1]-a[1])*u,moving:f>.07&&f<.93};
}
export function heading(a,b){return Math.atan2(b.x-a.x,b.z-a.z)}
export function auditPhases(){
 let conflicts=0;for(let i=0;i<800;i++){const p=phaseAt(i/10);if((p.walk&&(p.ew!=='RED'||p.ns!=='RED'))||(p.ew==='GREEN'&&p.ns==='GREEN'))conflicts++}
 return {samples:800,conflicts,pass:conflicts===0};
}
