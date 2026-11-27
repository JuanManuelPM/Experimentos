// The Root Machine / Chamber 01 / M07. Original, editable procedural geometry.
export const VERSION="root-machine/0.1.0-candidate";
export const CORE_ID="scene.n", JOINT_ID="scene.j", PORT_ID="scene.root.exit";
export const SPEC=Object.freeze({radius:1,portRadius:.25,bore:.15,spigot:.145,depth:.08,collarLength:.24,tolerance:.005,angleLimit:.32,rootLength:1.42});
const TAU=2*Math.PI, EPS=1e-10;
const add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]),mul=(a,s)=>a.map(v=>v*s),dot=(a,b)=>a.reduce((v,x,i)=>v+x*b[i],0);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const mag=a=>Math.hypot(...a),unit=a=>mul(a,1/Math.max(EPS,mag(a))),clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export const PORT_X=Math.sqrt(1-SPEC.portRadius**2), FRONT=PORT_X+SPEC.collarLength;
function make(id,material,positions,indices,role,dynamic=false){
 let volume=0;for(let i=0;i<indices.length;i+=3){const a=positions.slice(3*indices[i],3*indices[i]+3),b=positions.slice(3*indices[i+1],3*indices[i+1]+3),c=positions.slice(3*indices[i+2],3*indices[i+2]+3);volume+=dot(a,cross(b,c))/6;}
 if(volume<0){for(let i=0;i<indices.length;i+=3)[indices[i+1],indices[i+2]]=[indices[i+2],indices[i+1]];}
 return {id,material,positions,indices,role,dynamic};
}
function quad(ix,a,b,c,d,flip=false){if(flip)ix.push(a,c,b,b,c,d);else ix.push(a,b,c,b,d,c);}
function shellSector(k,count=8){
 const P=[],I=[],NU=26,NV=16,N=(NU+1)*(NV+1),a0=Math.asin(SPEC.portRadius),a1=Math.PI-.34;
 const start=TAU*k/count+.018,end=TAU*(k+1)/count-.018;
 function pt(i,j,inside){
  const u=i/NU,v=j/NV,theta=a0+(a1-a0)*u;
  const phi=start+(end-start)*v+.055*Math.sin(Math.PI*u)*Math.sin(k*.78);
  const belly=Math.sin(Math.PI*u)**2;
  const fluting=.035*belly*Math.sin(Math.PI*v)**2+.007*belly*Math.cos(8*Math.PI*u+1.2*k)*Math.sin(Math.PI*v)**2;
  const radius=1+fluting-(inside?.095:0);
  return [radius*Math.cos(theta),radius*Math.sin(theta)*Math.cos(phi),radius*Math.sin(theta)*Math.sin(phi)];
 }
 for(let layer=0;layer<2;layer++)for(let j=0;j<=NV;j++)for(let i=0;i<=NU;i++)P.push(...pt(i,j,layer===1));
 for(let j=0;j<NV;j++)for(let i=0;i<NU;i++){let a=j*(NU+1)+i,b=a+1,c=a+NU+1,d=c+1;quad(I,a,b,c,d);quad(I,a+N,b+N,c+N,d+N,true);}
 for(let i=0;i<NU;i++){let a=i,b=i+1;quad(I,b,a,b+N,a+N);a=NV*(NU+1)+i;b=a+1;quad(I,a,b,a+N,b+N);}
 for(let j=0;j<NV;j++){let a=j*(NU+1),b=a+NU;quad(I,a,a+NU+1,a+N,a+NU+1+N);quad(I,b+NU+1,b,b+NU+1+N,b+N);}
 return make("scene.n.shell."+k,k%3===0?"ceramicB":"ceramic",P,I,"protected-shell");
}
// Closed ring from a closed axial profile; no artificial cap through the bore.
function ring(id,material,profile,sides=48,role="collar",dynamic=false){
 const P=[],I=[];for(const [x,r] of profile)for(let j=0;j<sides;j++){const t=TAU*j/sides;P.push(x,r*Math.cos(t),r*Math.sin(t));}
 for(let i=0;i<profile.length;i++)for(let j=0;j<sides;j++)quad(I,i*sides+j,i*sides+(j+1)%sides,((i+1)%profile.length)*sides+j,((i+1)%profile.length)*sides+(j+1)%sides);
 return make(id,material,P,I,role,dynamic);
}
function sweep(id,material,sections,sides=24,role="neck",dynamic=false){
 const P=[],I=[];let n=null;
 for(let i=0;i<sections.length;i++){
  const s=sections[i],prev=sections[Math.max(0,i-1)].p,next=sections[Math.min(sections.length-1,i+1)].p,t=unit(sub(next,prev));
  const seed=n??[0,1,0];n=unit(sub(seed,mul(t,dot(seed,t))));if(mag(n)<.5)n=unit(cross([0,0,1],t));const b=unit(cross(t,n));
  for(let j=0;j<sides;j++){const u=TAU*j/sides;P.push(...add(s.p,add(mul(n,s.a*Math.cos(u)),mul(b,s.b*Math.sin(u)))));}
 }
 for(let i=0;i<sections.length-1;i++)for(let j=0;j<sides;j++)quad(I,i*sides+j,i*sides+(j+1)%sides,(i+1)*sides+j,(i+1)*sides+(j+1)%sides);
 for(const e of [0,sections.length-1]){const center=P.length/3;P.push(...sections[e].p);for(let j=0;j<sides;j++){const a=e*sides+j,b=e*sides+(j+1)%sides;if(e===0)I.push(center,b,a);else I.push(center,a,b);}}
 return make(id,material,P,I,role,dynamic);
}
export function neckCenter(t,angle=0,offset=0){
 const x=FRONT+SPEC.rootLength*t+offset,y=(.28+.85*Math.sin(angle))*t*t,z=.22*t*t+.10*t*t*t;
 return [x,y,z];
}
function profile(t,spigot=SPEC.spigot){
 if(t<=0)return [spigot,spigot];
 const flare=clamp(t/.07,0,1),r=spigot+(.18-spigot)*flare-.058*t+.006*Math.sin(20*Math.PI*t)*Math.sin(Math.PI*t);
 return [r,r*(1-.18*flare)];
}
export function joint(angle=0,{offset=0,spigot=SPEC.spigot,curvatureMultiplier=1}={}){
 if(!Number.isFinite(angle)||Math.abs(angle)>SPEC.angleLimit)throw Error("angle out of range");
 const a=angle*curvatureMultiplier,section=(t)=>{const p=neckCenter(t,a,offset),[r,b]=profile(t,spigot);return {p,a:r,b};};
 // Insertion is a single continuous closed mesh; flare starts outside the collar.
 const sections=[{p:[FRONT-SPEC.depth+offset,0,0],a:spigot,b:spigot},{p:[FRONT-.025+offset,0,0],a:spigot,b:spigot},...Array.from({length:43},(_,i)=>section(i/42))];
 const parts=[sweep("scene.j.neck","membrane",sections,40,"neck",true)];
 // Five ribs have a deliberate seat at both ends and bow outside the flexible skin.
 for(let k=0;k<5;k++){
  const phi=TAU*k/5+.20;
  const rib=Array.from({length:21},(_,i)=>{
   const u=i/20,t=Math.max(0,(.46*u-.035)/SPEC.rootLength),center=neckCenter(t,a,offset);
   const radius=.244*(1-u)+.149*u+.122*Math.sin(Math.PI*u);
   return {p:[FRONT-.035+.46*u+offset,center[1]+radius*Math.cos(phi),center[2]+radius*Math.sin(phi)],a:.019+.008*Math.sin(Math.PI*u),b:.016+.006*Math.sin(Math.PI*u)};
  });
  parts.push(sweep("scene.j.rib."+k,"steel",rib,12,"rib",true));
 }
 // Root-terminal socket is a deliberate future attachment interface, not a new graph edge.
 const end=neckCenter(1,a,offset),tip=neckCenter(.96,a,offset),dir=unit(sub(end,tip));
 const cap=sweep("scene.root.terminal","steel",[{p:add(end,mul(dir,-.026)),a:.13,b:.108},{p:add(end,mul(dir,.015)),a:.138,b:.112},{p:add(end,mul(dir,.047)),a:.118,b:.098},{p:add(end,mul(dir,.062)),a:.103,b:.085}],32,"terminal",true);
 parts.push(cap);return {parts,sections,angle,spigot,offset};
}
export function build(angle=0,opts={}){
 const parts=Array.from({length:8},(_,k)=>shellSector(k));
 // Recessed inner body and rear lip: the external segmented shell really has a cavity.
 const internal=Array.from({length:21},(_,i)=>{const t=i/20,x=-.80+1.59*t,r=.052+.72*Math.sin(Math.PI*t)**.85;return {p:[x,0,0],a:r,b:r*.98};});
 parts.push(sweep("scene.n.inner","inner",internal,40,"recessed-core"));
 parts.push(ring("scene.n.rear-rim","steel",[[-.96,.25],[-.96,.345],[-.90,.365],[-.85,.345],[-.85,.24],[-.92,.23]],48,"rear-rim"));
 parts.push(ring("scene.j.collar","steel",[[PORT_X,SPEC.bore],[FRONT,SPEC.bore],[FRONT,.254],[FRONT-.022,.272],[FRONT-.068,.272],[FRONT-.084,.225],[PORT_X+.085,.225],[PORT_X+.060,.271],[PORT_X+.015,.271],[PORT_X,.25]],64));
 const j=joint(angle,opts);parts.push(...j.parts);
 const end=neckCenter(1,angle,opts.offset??0);
 return {id:VERSION,parts,joint:j,ports:[{id:"scene.n.port",node:CORE_ID,position:[PORT_X,0,0],type:"structure"},{id:PORT_ID,node:JOINT_ID,position:end,type:"structure"}],graph:{nodes:[CORE_ID,JOINT_ID],edges:[{id:"scene.n-j",kind:"STRUCTURE",from:CORE_ID,to:JOINT_ID}]},data:{mode:"UNKNOWN",reason:"No authorized live source; flex is inspection only."}};
}
export function inspectMesh(part){
 const {positions:P,indices:I}=part,edge=new Map(),errors=[];let minArea=Infinity,volume=0;
 if(!P.every(Number.isFinite)||P.length%3||I.length%3)errors.push("INVALID_BUFFER");
 for(let i=0;i<I.length;i+=3){
  const [a,b,c]=I.slice(i,i+3);if([a,b,c].some(n=>!Number.isInteger(n)||n<0||n>=P.length/3)){errors.push("INDEX");continue;}
  const A=P.slice(a*3,a*3+3),B=P.slice(b*3,b*3+3),C=P.slice(c*3,c*3+3);
  const area=mag(cross(sub(B,A),sub(C,A)))/2;minArea=Math.min(minArea,area);if(area<EPS)errors.push("DEGENERATE");
  volume+=dot(A,cross(B,C))/6;
  for(const [x,y] of [[a,b],[b,c],[c,a]]){const key=x<y?x+":"+y:y+":"+x;const v=edge.get(key)||[0,0];v[0]++;v[1]+=x<y?1:-1;edge.set(key,v);}
 }
 if([...edge.values()].some(v=>v[0]!==2||v[1]!==0))errors.push("OPEN_OR_WINDING");
 if(volume<=EPS)errors.push("VOLUME");
 return {id:part.id,ok:errors.length===0,errors:[...new Set(errors)],triangles:I.length/3,minArea,volume};
}
export function inspectJoint(j){
 const errs=[],clearance=SPEC.bore-j.spigot,depth=SPEC.depth-j.offset;
 if(clearance<-.00001)errs.push("BORE_INTRUSION");
 if(depth<SPEC.depth-SPEC.tolerance)errs.push("INSERTION_GAP");
 if(depth>SPEC.depth+SPEC.tolerance)errs.push("INSERTION_TOO_DEEP");
 let protectedVertices=0,collarViolations=0;
 for(const part of j.parts.filter(p=>p.role==="neck"||p.role==="terminal")){
  for(let i=0;i<part.positions.length;i+=3){
   const [x,y,z]=part.positions.slice(i,i+3),rho=Math.hypot(y,z);
   // The front shell is protected outside its real aperture. A neck vertex cannot enter the core.
   if(x<PORT_X-SPEC.tolerance){protectedVertices++;if(rho>SPEC.bore+1e-6)errs.push("PROTECTED_SURFACE");}
   if(x>=PORT_X&&x<FRONT-1e-5&&rho>SPEC.bore+1e-6)collarViolations++;
  }
 }
 if(protectedVertices)errs.push("CORE_INTRUSION");if(collarViolations)errs.push("COLLAR_INTRUSION");
 // Sample curvature with circumradii of consecutive center sections; detects folds in this specific smooth sweep.
 let minCurve=Infinity;
 for(let i=1;i<j.sections.length-1;i++){
  const a=j.sections[i-1].p,b=j.sections[i].p,c=j.sections[i+1].p,ab=mag(sub(a,b)),bc=mag(sub(b,c)),ca=mag(sub(c,a)),twice=mag(cross(sub(b,a),sub(c,a)));
  if(twice>1e-9)minCurve=Math.min(minCurve,ab*bc*ca/(2*twice));
 }
 if(minCurve<.36)errs.push("CURVE_RADIUS");
 return {ok:!errs.length,errors:[...new Set(errs)],clearance,depth,protectedVertices,collarViolations,minCurve:Number.isFinite(minCurve)?minCurve:null};
}
export function bounds(parts){const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];for(const part of parts)for(let i=0;i<part.positions.length;i+=3)for(let j=0;j<3;j++){min[j]=Math.min(min[j],part.positions[i+j]);max[j]=Math.max(max[j],part.positions[i+j]);}return {min,max};}
