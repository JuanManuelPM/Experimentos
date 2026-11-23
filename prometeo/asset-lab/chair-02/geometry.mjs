// PROMETEO · ARC CHAIR 02 / HÉLICE. Original authored meshes, metres, Three.js renderer.
// Pure geometry; this module needs no build tooling, browser, Blender or model downloads.
export const ASSET_ID = 'prometeo/prop/helix-chair@0.2.0';
export const DEFAULTS = Object.freeze({width:.524,depth:.472,seatHeight:.457,backHeight:.86,legSplay:.034});
const V=(x,y,z)=>[x,y,z], minus=(a,b)=>a.map((x,i)=>x-b[i]);
const add=(a,b)=>a.map((x,i)=>x+b[i]),mul=(a,s)=>a.map(x=>x*s);
const cross=(a,b)=>V(a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]);
const unit=a=>{let n=Math.hypot(...a);return n?mul(a,1/n):V(0,1,0)};
const lerp=(a,b,t)=>a+(b-a)*t;
function mesh(name,material,positions,uvs,indices,role){return{name,material,positions,uvs,indices,role};}
function appendQuad(ix,a,b,c,d,flip=false){if(flip)ix.push(a,c,b,b,c,d);else ix.push(a,b,c,b,d,c);}
function sweep(name,material,sections,sides=16,role='structure'){
 // Cross-section rings transported by tangent; continuous variable taper, physically capped.
 const positions=[],uvs=[],indices=[];let prevN=null;
 for(let i=0;i<sections.length;i++){
  const s=sections[i],p=sections[Math.max(0,i-1)].p,q=sections[Math.min(sections.length-1,i+1)].p;
  const tangent=unit(minus(q,p));let guide=Math.abs(tangent[2])>.94?V(0,1,0):V(0,0,1);
  let n=unit(cross(tangent,guide));if(prevN&&n.reduce((v,x,j)=>v+x*prevN[j],0)<0)n=mul(n,-1);
  let b=unit(cross(tangent,n));prevN=n;
  for(let k=0;k<sides;k++){
   const theta=k/sides*2*Math.PI;
   positions.push(...add(s.p,add(mul(n,Math.cos(theta)*s.a),mul(b,Math.sin(theta)*s.b))));
   uvs.push(k/sides,i/(sections.length-1));
  }
 }
 for(let i=0;i<sections.length-1;i++)for(let k=0;k<sides;k++){
  const a=i*sides+k,b=i*sides+(k+1)%sides,c=(i+1)*sides+k,d=(i+1)*sides+(k+1)%sides;
  appendQuad(indices,a,b,c,d);
 }
 for(const end of [0,sections.length-1]){
  const c=positions.length/3;positions.push(...sections[end].p);uvs.push(.5,end?1:0);
  for(let k=0;k<sides;k++){
   const a=end*sides+k,b=end*sides+(k+1)%sides;
   if(end===0)indices.push(c,b,a);else indices.push(c,a,b);
  }
 }
 return mesh(name,material,positions,uvs,indices,role);
}
const ring=(x,y,z,a,b)=>({p:V(x,y,z),a,b});
function seatSurface(p,kind='wood'){
 // Rounded-superellipse saddle, fully enclosed with a shaped top, rolled lip and undercut.
 const N=64,positions=[],uvs=[],indices=[];
 const outline=t=>{const c=Math.cos(t),s=Math.sin(t),e=.56;
  return V(Math.sign(c)*Math.abs(c)**e,0,Math.sign(s)*Math.abs(s)**e);};
 const rings=kind==='wood'
 ? [{r:.16,y:0},{r:.43,y:0},{r:.70,y:0},{r:.89,y:0},{r:.965,y:0},{r:1,y:-.004},{r:1,y:-.034},{r:.975,y:-.042},{r:.80,y:-.043},{r:.16,y:-.038}]
 : [{r:.16,y:.004},{r:.46,y:.004},{r:.74,y:.004},{r:.90,y:.004},{r:.915,y:.002},{r:.915,y:-.006},{r:.895,y:-.009},{r:.16,y:-.007}];
 const hw=p.width/2*(kind==='wood'?1:.993),hd=p.depth/2*(kind==='wood'?1:.993),centreZ=-.004;
 function point(r,theta,yoff){const o=outline(theta),x=o[0]*hw*r,z=centreZ+o[2]*hd*r;
  let concavity=-.018*(1-r*r),side=.011*(x/hw)**2,front=.004*(Math.max(0,z/hd))**2;
  return V(x,p.seatHeight+concavity+side+front+yoff,z);
 }
 for(let j=0;j<rings.length;j++)for(let i=0;i<N;i++){
  const r=rings[j],pt=point(r.r,2*Math.PI*i/N,r.y+(kind==='wood'?0:.003));positions.push(...pt);
  uvs.push(.5+pt[0]/p.width,.5+pt[2]/p.depth);
 }
 for(let j=0;j<rings.length-1;j++)for(let i=0;i<N;i++){
  const a=j*N+i,b=j*N+(i+1)%N,c=(j+1)*N+i,d=(j+1)*N+(i+1)%N;
  appendQuad(indices,a,b,c,d,j< (kind==='wood'?6:4));
 }
 // Top/bottom caps. No degenerate centre ring.
 for(let end=0;end<2;end++){
  const id=positions.length/3;positions.push(...point(0,0,end===0?(kind==='wood'?0:.007):(kind==='wood'?-.038:-.004)));
  uvs.push(.5,.5);
  const base=end===0?0:(rings.length-1)*N;
  for(let i=0;i<N;i++){
   let a=base+i,b=base+(i+1)%N;
   if(end===0)indices.push(id,a,b);else indices.push(id,b,a);
  }
 }
 return mesh(kind==='wood'?'saddle-shell':'saddle-inlay',kind==='wood'?'oak':'leather',positions,uvs,indices,'seat');
}
function bentBack(p){
 // Continuous laminated shell, front/back surfaces separated in Z; ergonomic transverse wrap.
 // This replaces V1's three individual splats and decorative crest with a manufactured shape.
 const NU=32,NV=18,positions=[],uvs=[],indices=[],offset=(NU+1)*(NV+1);
 function pt(u,v,face){const t=2*u-1,shoulder=Math.abs(t),hw=.208+.024*v+.004*Math.sin(Math.PI*v);
  const x=hw*t,y=p.seatHeight+.142+.262*v-.027*shoulder**2*v+.009*shoulder**2*(1-v);
  const z=-.210-.073*v+.034*t*t+.014*Math.sin(Math.PI*v)*(t*t-.3)+(face===0?.013:-.013);
  return V(x,y,z);
 }
 for(let face=0;face<2;face++)for(let j=0;j<=NV;j++)for(let i=0;i<=NU;i++){
  const u=i/NU,v=j/NV;positions.push(...pt(u,v,face));uvs.push(u,v);
 }
 for(let j=0;j<NV;j++)for(let i=0;i<NU;i++){
  const a=j*(NU+1)+i,b=a+1,c=a+NU+1,d=c+1;
  appendQuad(indices,a,b,c,d,true);appendQuad(indices,a+offset,b+offset,c+offset,d+offset,false);
 }
 // Close all four edges; roll appears as an actual 26mm thick solid edge.
 for(let i=0;i<NU;i++){
  appendQuad(indices,i,i+1,i+offset,(i+1)+offset);
  const a=NV*(NU+1)+i;appendQuad(indices,a+1,a,a+1+offset,a+offset);
 }
 for(let j=0;j<NV;j++){
  let a=j*(NU+1),b=a+NU;
  appendQuad(indices,a,a+offset,a+NU+1,a+offset+NU+1);
  appendQuad(indices,b,b+NU+1,b+offset,b+offset+NU+1);
 }
 return mesh('floating-lumbar-shell','oak',positions,uvs,indices,'backrest');
}
function frontLeg(s,p){
 const x=s*.207;
 return sweep('front-leg-'+(s<0?'L':'R'),'oak',[
  ring(x+s*(p.legSplay+.008),.002,.235,.017,.020),
  ring(x+s*.029,.10,.225,.019,.022),
  ring(x+s*.008,.32,.190,.023,.026),
  ring(x,.440,.170,.028,.029),
  ring(x,.452,.170,.029,.028)],20,'leg');
}
function backPost(s,p){
 return sweep('rear-leg-and-stile-'+(s<0?'L':'R'),'oak',[
  ring(s*.244,.002,-.281,.017,.020),
  ring(s*.236,.105,-.269,.020,.022),
  ring(s*.219,.33,-.225,.023,.026),
  ring(s*.213,.442,-.199,.027,.030),
  ring(s*.212,.592,-.194,.023,.025),
  ring(s*.219,.730,-.234,.024,.026),
  ring(s*.229,.832,-.258,.023,.026),
  ring(s*.231,.853,-.269,.022,.026)
 ],20,'structural-stile');
}
function apron(name,a,b,material='oak'){
 const m=V(...a.map((x,i)=>(x+b[i])/2));
 return sweep(name,material,[{p:a,a:.020,b:.022},{p:m,a:.022,b:.025},{p:b,a:.020,b:.022}],12,'underframe');
}
const pos=(s,p)=>({front:V(s*.207,.390,.174),rear:V(s*.215,.390,-.204)});
export function generateChair(input={}){
 const p={...DEFAULTS,...input};
 if(p.width<.48||p.width>.62||p.depth<.43||p.depth>.55||p.seatHeight<.42||p.seatHeight>.51||p.backHeight<.81||p.backHeight>.98)throw Error('INVALID_DIMENSIONS');
 const parts=[seatSurface(p),seatSurface(p,'leather'),bentBack(p),frontLeg(-1,p),frontLeg(1,p),backPost(-1,p),backPost(1,p)];
 for(const s of [-1,1]){
  const {front,rear}=pos(s,p),label=s<0?'L':'R';
  parts.push(apron('side-rail-'+label,front,rear));
  // Pegs on side cheeks are separately selectable, not faked as painted circles.
  parts.push(sweep('side-tenon-'+label,'brass',[
   ring(s*.237,.390,-.180,.006,.006),ring(s*.239,.390,-.164,.006,.006)
  ],12,'joinery'));
 }
 parts.push(apron('front-apron',V(-.208,.392,.173),V(.208,.392,.173)));
 parts.push(apron('rear-apron',V(-.216,.391,-.203),V(.216,.391,-.203)));
 const joints=[
  ...[-1,1].flatMap(s=>{const x=s*.207,z=s<0?'L':'R';return [
   {type:'bearing',from:'saddle-shell',to:'front-leg-'+z,point:V(x,.434,.170)},
   {type:'bearing',from:'saddle-shell',to:'rear-leg-and-stile-'+z,point:V(s*.213,.431,-.199)},
   {type:'mortise-tenon',from:'front-apron',to:'front-leg-'+z,point:V(x,.392,.173)},
   {type:'mortise-tenon',from:'rear-apron',to:'rear-leg-and-stile-'+z,point:V(s*.216,.391,-.203)},
   {type:'mortise-tenon',from:'side-rail-'+z,to:'front-leg-'+z,point:V(x,.390,.174)},
   {type:'mortise-tenon',from:'side-rail-'+z,to:'rear-leg-and-stile-'+z,point:V(s*.215,.390,-.204)},
   {type:'recessed-edge',from:'floating-lumbar-shell',to:'rear-leg-and-stile-'+z,point:V(s*.224,.746,-.233)}
  ];}),
  {type:'laminated-seat',from:'saddle-inlay',to:'saddle-shell',point:V(0,p.seatHeight-.015,0)}
 ];
 return {assetId:ASSET_ID,version:'0.2.0',unit:'metre',parameters:p,parts,joints,referenceViews:['front','profile','three-quarter']};
}
const bbox=part=>{const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];for(let k=0;k<part.positions.length;k++){min[k%3]=Math.min(min[k%3],part.positions[k]);max[k%3]=Math.max(max[k%3],part.positions[k]);}return {min,max};};
const distanceBox=(b,p)=>Math.hypot(...p.map((v,i)=>Math.max(b.min[i]-v,0,v-b.max[i])));
export function inspectChair(model){
 const errors=[],stats={parts:model.parts.length,triangles:0,vertices:0,degenerate:0,feet:0,joints:model.joints.length};
 const names=new Set(),boxes=new Map();let minY=Infinity,maxY=-Infinity;
 for(const part of model.parts){if(names.has(part.name))errors.push('DUPLICATE_PART:'+part.name);names.add(part.name);
  if(!part.positions.length||part.positions.length%3||part.indices.length%3||part.uvs.length!==part.positions.length/3*2)errors.push('BAD_BUFFER:'+part.name);
  const bounds=bbox(part);boxes.set(part.name,bounds);minY=Math.min(minY,bounds.min[1]);maxY=Math.max(maxY,bounds.max[1]);
  stats.vertices+=part.positions.length/3;stats.triangles+=part.indices.length/3;
  if(part.name.includes('-leg-')||part.name.startsWith('rear-leg'))if(bounds.min[1]<=.004)stats.feet++;
  for(let i=0;i<part.positions.length;i++)if(!Number.isFinite(part.positions[i]))errors.push('NON_FINITE:'+part.name);
  for(const ix of part.indices)if(ix<0||ix>=part.positions.length/3||!Number.isInteger(ix))errors.push('OUT_OF_RANGE:'+part.name);
  for(let k=0;k<part.indices.length;k+=3){
   const v=j=>part.positions.slice(3*part.indices[k+j],3*part.indices[k+j]+3);
   if(Math.hypot(...cross(minus(v(1),v(0)),minus(v(2),v(0))))<1e-10)stats.degenerate++;
  }
 }
 for(const j of model.joints){if(!names.has(j.from)||!names.has(j.to))errors.push('MISSING_JOINT_PART');
  else if(distanceBox(boxes.get(j.from),j.point)>.065||distanceBox(boxes.get(j.to),j.point)>.065)errors.push('DISCONNECTED:'+j.from+'-'+j.to);
 }
 if(stats.degenerate)errors.push('DEGENERATE_TRIANGLES');
 if(stats.feet!==4)errors.push('FEET_MUST_CONTACT_GROUND');
 if(minY<-.004||minY>.004)errors.push('GROUND_PLANE');
 if(maxY<model.parameters.backHeight-.055)errors.push('BACKREST_TOO_LOW');
 if(stats.parts<12)errors.push('INSUFFICIENT_STRUCTURAL_PARTS');
 return {ok:errors.length===0,errors:[...new Set(errors)],stats,bounds:{minY,maxY}};
}
