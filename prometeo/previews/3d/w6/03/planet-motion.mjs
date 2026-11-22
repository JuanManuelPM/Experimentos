// Asteroide Jardín · planet-motion v1 (original, renderer-independent)
const EPS=1e-9;
export const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
export const add=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
export const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
export const mul=(a,k)=>[a[0]*k,a[1]*k,a[2]*k];
export const len=a=>Math.hypot(a[0],a[1],a[2]);
export const unit=a=>{let l=len(a);return l<EPS?[0,1,0]:mul(a,1/l)};
export const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export const tangent=(v,n)=>sub(v,mul(n,dot(v,n)));
export const arcDistance=(a,b,r=1)=>r*Math.acos(Math.max(-1,Math.min(1,dot(unit(a),unit(b)))));
export function slerp(a,b,t){
 a=unit(a);b=unit(b);const c=Math.max(-1,Math.min(1,dot(a,b)));
 if(c>.99999)return unit(add(mul(a,1-t),mul(b,t)));
 if(c<-.99999){const axis=unit(cross(a,Math.abs(a[1])<.9?[0,1,0]:[1,0,0]));return unit(add(mul(a,Math.cos(Math.PI*t)),mul(axis,Math.sin(Math.PI*t))))}
 const th=Math.acos(c),s=Math.sin(th);return unit(add(mul(a,Math.sin((1-t)*th)/s),mul(b,Math.sin(t*th)/s)));
}
export function advanceOnSphere(normal,wish,meters,radius){
 const n=unit(normal),t=tangent(wish,n),l=len(t);
 if(l<EPS||!Number.isFinite(meters)||radius<=0)return n;
 const angle=meters/radius;
 return unit(add(mul(n,Math.cos(angle)),mul(t,Math.sin(angle)/l)));
}
export function moveWithObstacles(normal,wish,meters,radius,obstacles=[],bodyRadius=.27){
 let n=unit(normal),original=tangent(wish,n);
 if(len(original)<EPS||meters<=0)return {normal:n,blocked:false,sliding:false};
 let blocked=false,sliding=false;
 const count=Math.max(1,Math.ceil(meters/Math.max(.09,bodyRadius*.45)));
 for(let j=0;j<count;j++){
  let v=unit(tangent(wish,n)),next=advanceOnSphere(n,v,meters/count,radius);
  for(const o of obstacles){
   const min=(o.radius||0)+bodyRadius;
   if(arcDistance(next,o.normal,radius)>=min)continue;
   blocked=true;
   const away=tangent(sub(n,o.normal),n),inward=dot(v,unit(away));
   if(len(away)<EPS||inward>=0){next=n;break}
   const side=tangent(sub(v,mul(unit(away),inward)),n);
   if(len(side)<EPS){next=n;break}
   const alt=advanceOnSphere(n,unit(side),meters/count,radius);
   if(arcDistance(alt,o.normal,radius)>=min){next=alt;sliding=true}else next=n;
  }
  n=next;
 }
 return {normal:n,blocked,sliding};
}
export function isNear(a,b,radius,meters){return arcDistance(a,b,radius)<=meters}
