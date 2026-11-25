// IRIS V7. Planar sculpt: non-destructive geometry pass over the V6 authored topology.
import * as T from 'three';
import {StyledFace,PRESETS6,FIELDS,HAIR,STYLES,recipe as styleRecipe} from '../v6/style-system.mjs';
export {FIELDS,HAIR,STYLES};
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(+x)?+x:0)),mix=(a,b,t)=>a+(b-a)*t;
const sm=(a,b,x)=>{let t=clamp((x-a)/(b-a));return t*t*(3-2*t)};
export const DEFAULT_SCULPT={amount:.82,nose:1,cheeks:.72,jaw:.55};
export const PRESETS7=Object.fromEntries(Object.entries(PRESETS6).map(([k,r])=>[k,{...r,sculpt:{...DEFAULT_SCULPT}}]));
export function recipe(raw={}){let r=styleRecipe(raw);r.sculpt=Object.fromEntries(Object.keys(DEFAULT_SCULPT).map(k=>[k,clamp(raw.sculpt?.[k]??DEFAULT_SCULPT[k])]));return r}
const get=(m,i,v=new T.Vector3())=>m.getVertexPosition(i,v).applyMatrix4(m.matrixWorld);
const materials=m=>[].concat(m.material||[]);
function surface(points,index,y0,y1){
 const triangles=[];for(let i=0;i<index.length;i+=3){let a=points[index[i]],b=points[index[i+1]],c=points[index[i+2]];if(Math.max(a.y,b.y,c.y)<y0||Math.min(a.y,b.y,c.y)>y1)continue;let den=(b.y-c.y)*(a.x-c.x)+(c.x-b.x)*(a.y-c.y);if(Math.abs(den)<1e-11)continue;triangles.push({a,b,c,den,minX:Math.min(a.x,b.x,c.x),maxX:Math.max(a.x,b.x,c.x),minY:Math.min(a.y,b.y,c.y),maxY:Math.max(a.y,b.y,c.y)})}
 return (x,y)=>{let best=-Infinity;for(let t of triangles){if(x<t.minX-1e-8||x>t.maxX+1e-8||y<t.minY-1e-8||y>t.maxY+1e-8)continue;let {a,b,c,den}=t,u=((b.y-c.y)*(x-c.x)+(c.x-b.x)*(y-c.y))/den,v=((c.y-a.y)*(x-c.x)+(a.x-c.x)*(y-c.y))/den,w=1-u-v;if(Math.min(u,v,w)<-1e-5)continue;best=Math.max(best,a.z*u+b.z*v+c.z*w)}return Number.isFinite(best)?best:null}
}
function eyeLandmarks(sys){let b=new T.Box3(),parts=sys.parts.filter(m=>materials(m).some(a=>a.name==='Iris'||a.name==='Eye'));for(let m of parts)for(let i=0;i<m.geometry.attributes.position.count;i++)b.expandByPoint(get(m,i));return b.isEmpty()?null:{y:(b.min.y+b.max.y)/2,span:(b.max.x-b.min.x)/2}}
function lineAt(knots,y){if(y<=knots[0][0])return knots[0][1];for(let i=1;i<knots.length;i++)if(y<=knots[i][0])return mix(knots[i-1][1],knots[i][1],(y-knots[i-1][0])/(knots[i][0]-knots[i-1][0]));return knots.at(-1)[1]}
function planeFrom(z,x,y,rx,ry){
 let z0=z(x,y),xl=z(x-rx,y),xr=z(x+rx,y),yb=z(x,y-ry),yt=z(x,y+ry);if([z0,xl,xr,yb,yt].some(v=>v===null))return null;
 // secant slope averages the broad surface instead of following its small convexities
 let a=(xr-xl)/(2*rx),b=(yt-yb)/(2*ry),c=(z0*2+xl+xr+yb+yt)/6;return (X,Y)=>c+a*(X-x)+b*(Y-y)
}
function normalArray(positions,index){let g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(positions,3));g.setIndex(new T.BufferAttribute(index,1));g.computeVertexNormals();let n=g.attributes.normal.array.slice();g.dispose();return n}
function localDelta(m,i,d){const inv=new T.Matrix3().setFromMatrix4(m.matrixWorld).invert();let p=d.clone().applyMatrix3(inv);if(!m.isSkinnedMesh)return p;let o=m.applyBoneTransform(i,new T.Vector3()),x=m.applyBoneTransform(i,new T.Vector3(1,0,0)).sub(o),y=m.applyBoneTransform(i,new T.Vector3(0,1,0)).sub(o),z=m.applyBoneTransform(i,new T.Vector3(0,0,1)).sub(o);let M=new T.Matrix3().set(x.x,y.x,z.x,x.y,y.y,z.y,x.z,y.z,z.z);if(Math.abs(M.determinant())<1e-8)return new T.Vector3();return p.applyMatrix3(M.invert())}
function cross(a,b,c){return b.clone().sub(a).cross(c.clone().sub(a))}
export class PlanarFace extends StyledFace{
 constructor(scene){super(scene);this.identity=recipe(PRESETS7.iris);this.planarStats={status:'not initialized'};this.original=null}
 async load(){await super.load();this.capture();this.sculpt();return this}
 capture(){let g=this.body.geometry;this.original={position:g.attributes.position.array.slice(),normal:g.attributes.normal?.array.slice(),index:g.index?g.index.array:Uint32Array.from({length:g.attributes.position.count},(_,i)=>i)};this.original.calcNormal=normalArray(this.original.position,this.original.index)}
 restore(){if(!this.original)return;let g=this.body.geometry;g.attributes.position.array.set(this.original.position);g.attributes.position.needsUpdate=true;if(this.original.normal){g.attributes.normal.array.set(this.original.normal);g.attributes.normal.needsUpdate=true}}
 async setRecipe(raw){this.restore();await super.setRecipe(recipe(raw));this.identity=recipe({...this.identity,sculpt:raw.sculpt});this.sculpt();return this.identity}
 setStyle(name,override){let p=this.identity.sculpt;this.restore();super.setStyle(name,override);this.identity=recipe({...this.identity,sculpt:p});this.sculpt();return this.identity}
 setFace(k,value,commit=true){let p=this.identity.sculpt;this.restore();super.setFace(k,value,commit);this.identity.sculpt=p;if(commit)this.sculpt()}
 setSculpt(p){this.identity=recipe({...this.identity,sculpt:{...this.identity.sculpt,...p}});this.sculpt();return this.planarStats}
 sculpt(){
  if(!this.original)return;this.restore();let s=this.identity.sculpt||DEFAULT_SCULPT,m=this.body,g=m.geometry,idx=this.original.index;this.group.updateMatrixWorld(true);for(let p of this.parts)p.skeleton?.update();
  if(s.amount===0){this.planarStats={status:'original',changed:0,maxMM:0,nose:0,cheeks:0,jaw:0,triangles:idx.length/3,guard:'PASS',scale:0};this.updateBrows();return}
  const eyes=eyeLandmarks(this);if(!eyes||eyes.span<.025||eyes.span>.09){this.planarStats={status:'landmarks unavailable',guard:'FALLBACK',changed:0,maxMM:0};this.updateBrows();return}
  const before=Array.from({length:g.attributes.position.count},(_,i)=>get(m,i)),ey=eyes.y,unit=clamp(eyes.span/.052,.75,1.25),z=surface(before,idx,ey-.128*unit,ey+.028*unit);
  // Nose tip determined from anterior surface, not hard-coded world coordinates.
  let tip=null;for(let j=0;j<=44;j++){let y=ey-unit*(.016+j*.00125),v=z(0,y);if(v!==null&&(!tip||v>tip.z))tip={y,z:v}}
  if(!tip||tip.y>ey-.021*unit||tip.y<ey-.062*unit){this.planarStats={status:'nose landmark rejected',guard:'FALLBACK',changed:0,maxMM:0};this.updateBrows();return}
  const ny=tip.y,ys=[ny-.003*unit,ny+.006*unit,ny+.019*unit,ey-.006*unit,ey+.009*unit].sort((a,b)=>a-b),sections=[];
  for(let y of ys){let t=clamp((y-ny)/(.035*unit)),w=mix(.017,.012,t)*unit,f=mix(.0062,.0045,t)*unit,center=z(0,y),sideL=z(-w,y),sideR=z(w,y);if([center,sideL,sideR].some(v=>v===null))continue;let depth=center;if(y<ny+.009*unit)depth=tip.z-.00075*unit;sections.push({y,w,f,depth,sideL,sideR})}
  if(sections.length<4){this.planarStats={status:'nose sampling failed',guard:'FALLBACK',changed:0,maxMM:0};this.updateBrows();return}
  const interp=(k,y)=>lineAt(sections.map(q=>[q.y,q[k]]),y);
  let cheekPlans=[-1,1].map(sign=>{let x=sign*.046*unit,y=ey-.036*unit;return{sign,x,y,rx:.018*unit,ry:.016*unit,plane:planeFrom(z,x,y,.014*unit,.013*unit)}});
  let jawPlans=[-1,1].map(sign=>{let x=sign*.046*unit,y=ny-.059*unit;return{sign,x,y,rx:.016*unit,ry:.019*unit,plane:planeFrom(z,x,y,.012*unit,.015*unit)}});
  let chin={x:0,y:ny-.081*unit,rx:.018*unit,ry:.009*unit,plane:planeFrom(z,0,ny-.081*unit,.014*unit,.007*unit)};
  let offsets=new Map(),counts={nose:0,cheeks:0,jaw:0},desired=new Map();
  function patch(p,r){if(!r.plane)return 0;let u=Math.abs((p.x-r.x)/r.rx),v=Math.abs((p.y-r.y)/r.ry);if(u>=1||v>=1)return 0;let front=z(p.x,p.y);if(front===null||front-p.z>.0025*unit)return 0;return clamp(r.plane(p.x,p.y)-p.z,-.0035*unit,.0035*unit)*(1-sm(.48,1,Math.max(u,v)))}
  for(let i=0;i<before.length;i++){
   let p=before[i],ax=Math.abs(p.x);if(p.y<ey-.126*unit||p.y>ey+.012*unit||ax>.079*unit)continue;
   let dz=0,region=null;
   if(p.y>=ny-.004*unit&&p.y<=ey+.009*unit&&ax<.023*unit&&s.nose>0){
    let front=z(p.x,p.y);if(front!==null&&front-p.z<.0018*unit){
     let w=interp('w',p.y),f=interp('f',p.y),a=interp('depth',p.y),b=interp(p.x<0?'sideL':'sideR',p.y);
     // Planar central strip, angled side planes; smooth only narrow bevel transitions.
     let t=clamp((ax-f)/(w-f)),bevel=.16;t=mix(t,sm(0,1,t),bevel);
     let target=mix(a,b,t),mask=(1-sm(w*.83,w*1.18,ax))*sm(ny-.004*unit,ny+.001*unit,p.y)*(1-sm(ey-.004*unit,ey+.009*unit,p.y));
     dz=clamp(target-p.z,-.0052*unit,.0052*unit)*mask*s.nose;region='nose';
    }
   }
   if(!region&&s.cheeks>0){let d=patch(p,cheekPlans[p.x<0?0:1])*s.cheeks;if(Math.abs(d)>1e-7){dz=d;region='cheeks'}}
   if(!region&&s.jaw>0){let d=(patch(p,jawPlans[p.x<0?0:1])+patch(p,chin))*s.jaw;if(Math.abs(d)>1e-7){dz=d;region='jaw'}}
   dz*=s.amount;if(!region||Math.abs(dz)<.000015)continue;let d=new T.Vector3(0,0,dz);offsets.set(i,localDelta(m,i,d));desired.set(i,dz);counts[region]++;
  }
  if(!offsets.size){this.planarStats={status:'no eligible vertices',guard:'FALLBACK',changed:0,maxMM:0};this.updateBrows();return}
  // UV seam duplicates share a single displacement where their original rest positions coincide.
  const weld=new Map(),pos=this.original.position;for(let i=0;i<pos.length/3;i++){let k=[pos[i*3],pos[i*3+1],pos[i*3+2]].map(x=>Math.round(x*1e6)).join(':');let a=weld.get(k);if(a)a.push(i);else weld.set(k,[i])}
  for(let a of weld.values()){let selected=a.filter(i=>offsets.has(i));if(!selected.length)continue;let v=selected.reduce((sum,i)=>sum.add(offsets.get(i)),new T.Vector3()).multiplyScalar(1/selected.length);for(let i of a)offsets.set(i,v.clone())}
  const affected=[];for(let i=0;i<idx.length;i+=3)if(offsets.has(idx[i])||offsets.has(idx[i+1])||offsets.has(idx[i+2]))affected.push([idx[i],idx[i+1],idx[i+2]]);
  let scale=1,qa=null,after=null;
  for(let attempt=0;attempt<7;attempt++,scale*=.65){
   this.restore();let p=g.attributes.position;for(let [i,d] of offsets)p.setXYZ(i,pos[i*3]+d.x*scale,pos[i*3+1]+d.y*scale,pos[i*3+2]+d.z*scale);
   after=new Map([...offsets.keys()].map(i=>[i,get(m,i)]));let max=0,flips=0,stretch=0,minDot=1,minRatio=1,maxRatio=1;
   for(let [i,v] of after)max=Math.max(max,v.distanceTo(before[i]));for(let [a,b,c] of affected){let n=cross(before[a],before[b],before[c]),q=cross(after.get(a)||before[a],after.get(b)||before[b],after.get(c)||before[c]),l=n.length(),r=q.length();if(l<1e-10)continue;let dot=n.dot(q)/Math.max(1e-18,l*r),ratio=r/l;minDot=Math.min(minDot,dot);minRatio=Math.min(minRatio,ratio);maxRatio=Math.max(maxRatio,ratio);if(dot<.20)flips++;if(ratio<.30||ratio>2.4)stretch++}
   qa={maxMM:+(max*1000).toFixed(3),flips,stretch,minDot:+minDot.toFixed(3),minRatio:+minRatio.toFixed(3),maxRatio:+maxRatio.toFixed(3),guard:flips===0&&stretch===0&&max<.007?'PASS':'RETRY'};
   if(qa.guard==='PASS')break;
  }
  if(qa.guard!=='PASS'){this.restore();this.planarStats={status:'protected fallback',changed:0,maxMM:0,guard:'FALLBACK',last:qa};this.updateBrows();return}
  // Preserve authored normals and add ONLY the geometric correction. Weld normal corrections at UV duplicates.
  if(this.original.normal){let fresh=normalArray(g.attributes.position.array.slice(),idx),orig=this.original.calcNormal,auth=this.original.normal,n=g.attributes.normal;let active=new Set(affected.flat());let deltas=new Map([...active].map(i=>[i,new T.Vector3(fresh[3*i]-orig[3*i],fresh[3*i+1]-orig[3*i+1],fresh[3*i+2]-orig[3*i+2])]));for(let a of weld.values()){let f=a.filter(i=>deltas.has(i));if(!f.length)continue;let d=f.reduce((v,i)=>v.add(deltas.get(i)),new T.Vector3()).multiplyScalar(1/f.length);for(let i of a)deltas.set(i,d)}for(let [i,d] of deltas){let v=new T.Vector3(auth[i*3],auth[i*3+1],auth[i*3+2]).add(d).normalize();n.setXYZ(i,v.x,v.y,v.z)}n.needsUpdate=true}
  g.attributes.position.needsUpdate=true;g.computeBoundingSphere();this.planarStats={status:'sculpted',changed:offsets.size,...counts,...qa,scale:+scale.toFixed(3),triangles:idx.length/3,eyeY:+ey.toFixed(4),noseY:+ny.toFixed(4),sampledSections:sections.length};this.updateBrows()
 }
}
