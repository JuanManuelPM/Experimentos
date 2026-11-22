// Laboratorio de leva · núcleo reutilizable, independiente del renderizador.
// Unidad de longitud: mm. Angulos internos: radianes. Fuerzas: N.
// Modelo cinemático de seguidor de rodillo; no es un solver de elementos finitos.
export const TAU = Math.PI * 2;
export const DEFAULTS = Object.freeze({base:48, roller:9, lift:16, rise:130, topDwell:60, lowDwell:40, rpm:42, mass:0.16, springK:0.75, preload:26});
export function normalize(p={}) {
  const x={...DEFAULTS,...p};
  for(const k of ['base','roller','lift','rise','topDwell','lowDwell','rpm','mass','springK','preload']) if(!Number.isFinite(+x[k]))throw Error('Parámetro no numérico: '+k);
  if(x.base<35||x.base>80||x.roller<4||x.roller>15||x.lift<3||x.lift>26||x.rise<95||x.rise>155||x.topDwell<20||x.topDwell>95||x.lowDwell<20||x.lowDwell>65||x.rpm<0||x.rpm>140)throw Error('Fuera del dominio de esta máquina');
  if(360-x.rise-x.topDwell-x.lowDwell<80)throw Error('El retorno necesita al menos 80 grados');
  return x;
}
const rad=d=>d*Math.PI/180;
export function motion(theta,raw={}) {
  const p=normalize(raw);
  const deg=(((theta*180/Math.PI)%360)+360)%360;
  const a=p.rise,b=p.topDwell,c=360-a-b-p.lowDwell;
  let u=0, span=1, sign=0, event='reposo inferior', value=0;
  if(deg<a){u=deg/a;span=a;sign=1;event='subida';}
  else if(deg<a+b){value=1;event='meseta superior';}
  else if(deg<a+b+c){u=(deg-a-b)/c;span=c;sign=-1;event='retorno';}
  if(sign!==0){
    const h=35*u**4-84*u**5+70*u**6-20*u**7;
    const dh=140*u**3-420*u**4+420*u**5-140*u**6;
    const d2h=420*u**2-1680*u**3+2100*u**4-840*u**5;
    const scale=rad(span);
    return {event,theta,deg,s:p.lift*(sign===1?h:1-h),ds:p.lift*sign*dh/scale,d2s:p.lift*sign*d2h/(scale*scale)};
  }
  return {event,theta,deg,s:p.lift*value,ds:0,d2s:0};
}
export function pitch(theta,p={}) {
  const q=normalize(p),m=motion(theta,q),r=q.base+q.roller+m.s;
  // Cam local = inv(rotacion angular) × centro del rodillo sobre el eje Y.
  return {x:r*Math.sin(theta),y:r*Math.cos(theta),r,m};
}
export function camPoint(theta,raw={}) {
  const p=normalize(raw),h=0.000025;
  const a=pitch(theta,p),before=pitch(theta-h,p),after=pitch(theta+h,p);
  const tx=(after.x-before.x)/(2*h),ty=(after.y-before.y)/(2*h);
  const len=Math.hypot(tx,ty);
  // Normal exterior: curva paramétrica con orientación horaria.
  const nx=-ty/len,ny=tx/len;
  return {x:a.x-p.roller*nx,y:a.y-p.roller*ny,nx,ny,px:a.x,py:a.y,pressure:Math.atan(Math.abs(a.m.ds)/a.r),theta};
}
export function profile(raw={},count=720) {
  const p=normalize(raw);
  return Array.from({length:count},(_,i)=>camPoint(TAU*i/count,p));
}
export function state(theta,raw={}) {
  const p=normalize(raw),m=motion(theta,p),cp=camPoint(theta,p);
  const omega=p.rpm*TAU/60,acc=m.d2s*omega*omega/1000; // m/s²
  const spring=p.preload+p.springK*m.s;
  const axial=spring+p.mass*(9.81+acc);
  const normal=Math.max(0,axial/Math.cos(cp.pressure));
  const side=normal*Math.sin(cp.pressure);
  return {...m,omega,acc,spring,axial,normal,side,pressureDeg:cp.pressure*180/Math.PI,contactMaintained:axial>=0,rollerY:p.base+p.roller+m.s,contact:cp};
}
function segmentDistance(x,y,a,b){
 const vx=b.x-a.x,vy=b.y-a.y,t=Math.max(0,Math.min(1,((x-a.x)*vx+(y-a.y)*vy)/(vx*vx+vy*vy)));
 return Math.hypot(x-(a.x+t*vx),y-(a.y+t*vy));
}
export function diagnose(raw={},samples=90,vertices=720) {
 const p=normalize(raw),shape=profile(p,vertices);
 let minGap=Infinity,maxGap=-Infinity,maxPressure=0,minRadius=Infinity,minAxial=Infinity;
 let maxGapAngle=0;
 for(let j=0;j<samples;j++){
  const th=TAU*j/samples,st=state(th,p), cx=0,cy=st.rollerY;
  // Transformamos el rodillo a coordenadas locales de la leva.
  const x=cx*Math.cos(th)+cy*Math.sin(th),y=-cx*Math.sin(th)+cy*Math.cos(th);
  let d=Infinity;
  for(let i=0;i<shape.length;i++)d=Math.min(d,segmentDistance(x,y,shape[i],shape[(i+1)%shape.length]));
  const gap=d-p.roller;
  if(gap<minGap)minGap=gap;
  if(gap>maxGap){maxGap=gap;maxGapAngle=th;}
  maxPressure=Math.max(maxPressure,st.pressureDeg);
  minAxial=Math.min(minAxial,st.axial);
 }
 // Curvatura aproximada del contorno terminado. Radio local pequeño => precaución de fresado.
 for(let i=0;i<shape.length;i++){
  const a=shape[(i-1+shape.length)%shape.length],b=shape[i],c=shape[(i+1)%shape.length];
  const ab=Math.hypot(b.x-a.x,b.y-a.y),bc=Math.hypot(c.x-b.x,c.y-b.y),ca=Math.hypot(a.x-c.x,a.y-c.y);
  const twice=Math.abs((b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x));
  if(twice>1e-8) minRadius=Math.min(minRadius,ab*bc*ca/(2*twice));
 }
 return {samples,vertices,minGap,maxGap,maxGapAngle,maxPressure,minRadius,minAxial,continuousContact: minAxial>=0&&minGap>-0.12&&maxGap<0.12, pressureOK:maxPressure<=30, machiningNote:'Radii/tolerancias orientativos; requiere revisión industrial y esfuerzos Hertz.'};
}
export function buildDXF(raw={},segments=360){
 const p=normalize(raw),points=profile(p,segments),rows=['0','SECTION','2','ENTITIES','0','LWPOLYLINE','8','CAM_OUTLINE','90',String(points.length),'70','1'];
 for(const pt of points)rows.push('10',pt.x.toFixed(5),'20',pt.y.toFixed(5));
 rows.push('0','CIRCLE','8','AXLE_BORE','10','0','20','0','40','6','0','ENDSEC','0','EOF');
 return rows.join('\\n')+'\\n';
}
