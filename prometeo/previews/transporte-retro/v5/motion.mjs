// Transport V4 original deterministic choreography. +Z is anatomical front.
export const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
const mix=(a,b,u)=>a+(b-a)*u;
export function heroAt(t){
 let x=0,z=8.65,yaw=Math.PI,sit=0,walk=0,distance=0,greet=0,turn=0;
 if(t>=7&&t<14){z=mix(8.65,5.45,(t-7)/7);walk=1;distance=8.65-z}
 else if(t>=14&&t<26){z=mix(5.45,-1.55,(t-14)/12);walk=1;distance=8.65-z}
 else if(t>=26&&t<30){z=-1.55;yaw=Math.PI-Math.PI/2*Math.sin(Math.PI*(t-26)/4);greet=Math.sin(Math.PI*(t-26)/4)}
 else if(t>=30&&t<32){z=mix(-1.55,-2.45,(t-30)/2);walk=1;distance=8.65-z}
 else if(t>=32&&t<34){z=-2.45;x=mix(0,-1.17,(t-32)/2);yaw=-Math.PI/2;walk=1;distance=11.1-x}
 else if(t>=34){z=-2.45;x=-1.17;yaw=mix(-Math.PI/2,Math.PI/2,smooth((t-34)/.8));sit=smooth((t-34.8)/1.2)}
 return {x,z,yaw,sit,walk,distance,greet,turn};
}
export function legTarget(distance,side,walk,sit){
 const phase=((distance/.64+(side>0?.5:0))%1+1)%1;
 const step=phase<.60? .192-.384*phase/.60 : -.192+.384*(phase-.60)/.40;
 const lift=phase<.60?0:.105*Math.sin(Math.PI*(phase-.60)/.40);
 return {z:mix(walk*step,.47,sit),y:.075+lift*walk*(1-sit)};
}
export function solveLeg(hipY,footY,footZ,L1=.43,L2=.43){
 const dy=hipY-footY,d=Math.min(L1+L2-.001,Math.max(.03,Math.hypot(dy,footZ)));
 const base=Math.atan2(footZ,dy),a=Math.acos(clamp((L1*L1+d*d-L2*L2)/(2*L1*d),-1,1));
 const knee=Math.PI-Math.acos(clamp((L1*L1+L2*L2-d*d)/(2*L1*L2),-1,1));
 return {hip:-(base+a),knee};
}
