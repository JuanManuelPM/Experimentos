// PROMETEO ARC CHAIR 01 · authored procedural geometry in metres, no dependency
export const ASSET_ID="prometeo/prop/arc-chair@0.1.0";
const C=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const sub=(a,b)=>a.map((v,i)=>v-b[i]),add=(a,b)=>a.map((v,i)=>v+b[i]),scale=(a,s)=>a.map(v=>v*s);
const norm=a=>{const m=Math.hypot(...a)||1;return a.map(v=>v/m)};
function grid(name,material,nu,nv,point){
 const positions=[],uvs=[],indices=[];
 for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){positions.push(...point(i/nu,j/nv));uvs.push(i/nu,j/nv);}
 for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const a=j*(nu+1)+i,b=a+1,c=a+nu+1,d=c+1;indices.push(a,c,b,b,c,d);}
 return{name,material,positions,uvs,indices};
}
function shell(name,material,nu,nv,f,t){
 const top=grid(name,material,nu,nv,f);
 const low=grid(name,material,nu,nv,(u,v)=>{const p=f(u,v);return[p[0],p[1]-t,p[2]]});
 const positions=top.positions.concat(low.positions),uvs=top.uvs.concat(low.uvs),indices=top.indices.slice(),offset=top.positions.length/3;
 for(let i=0;i<low.indices.length;i+=3)indices.push(low.indices[i+2]+offset,low.indices[i+1]+offset,low.indices[i]+offset);
 function wall(a,b){indices.push(a,b,a+offset,b,b+offset,a+offset);}
 for(let i=0;i<nu;i++){wall(i,i+1);let k=nv*(nu+1)+i;wall(k+1,k);}
 for(let j=0;j<nv;j++){const a=j*(nu+1),b=a+nu;wall(a+nu+1,a);wall(b,b+nu+1);}
 return{name,material,positions,uvs,indices};
}
function sweep(name,material,rings,sides=12){
 const positions=[],uvs=[],indices=[];
 for(let i=0;i<rings.length;i++){
  const s=rings[i],prev=rings[Math.max(i-1,0)].p,next=rings[Math.min(i+1,rings.length-1)].p;
  const tangent=norm(sub(next,prev));let n=norm(C(tangent,[0,0,1]));
  if(Math.hypot(...n)<.01)n=[1,0,0];
  const binormal=norm(C(tangent,n));
  for(let k=0;k<sides;k++){
   const th=k/sides*Math.PI*2;
   const p=add(s.p,add(scale(n,Math.cos(th)*s.rx),scale(binormal,Math.sin(th)*s.rz)));
   positions.push(...p);uvs.push(k/sides,i/(rings.length-1));
  }
 }
 for(let i=0;i<rings.length-1;i++)for(let k=0;k<sides;k++){
  const a=i*sides+k,b=i*sides+(k+1)%sides,c=(i+1)*sides+k,d=(i+1)*sides+(k+1)%sides;
  indices.push(a,b,c,b,d,c);
 }
 for(const [end,flip] of [[0,true],[rings.length-1,false]]){
  const z=positions.length/3;positions.push(...rings[end].p);uvs.push(.5,end);
  for(let k=0;k<sides;k++){const a=end*sides+k,b=end*sides+(k+1)%sides;if(flip)indices.push(z,b,a);else indices.push(z,a,b);}
 }
 return{name,material,positions,uvs,indices};
}
const ring=(p,rx,rz)=>({p,rx,rz});
export function generateChair({width=.52,seatHeight=.45,backHeight=.82}={}){
 if(!(width>=.46&&width<=.68&&seatHeight>=.40&&seatHeight<=.52&&backHeight>=seatHeight+.28&&backHeight<=1.05))throw Error("INVALID_DIMENSIONS");
 const h=width/2,parts=[];
 const seat=(u,v)=>{const x=(2*u-1)*h*(.96-.075*Math.abs(2*v-1)),z=(v-.5)*.44+.02*(2*u-1)**2;
  const edge=Math.abs(2*u-1)**6,y=seatHeight+.014*edge-.018*(1-edge)*Math.sin(v*Math.PI)**2-.011*v;
  return[x,y,z];};
 parts.push(shell("seat-contoured","leather",24,20,seat,.034));
 const back=(u,v)=>{const t=2*u-1,w=h*(.77+.20*Math.sin(Math.PI*v));
 return[t*w,seatHeight+.072+v*(backHeight-seatHeight-.08),-.207-.062*v+.025*t*t+.012*Math.sin(v*Math.PI)]};
 parts.push(shell("backrest-sculpted","wood",28,22,back,.023));
 for(const sign of [-1,1]){
  const x=sign*h*.79,lr=sign<0?"left":"right";
  parts.push(sweep("front-leg-"+lr,"wood",[
   ring([x*1.09,.005,.246],.015,.019),ring([x*1.06,.09,.23],.017,.021),
   ring([x,.26,.194],.022,.025),ring([x*.96,seatHeight-.027,.163],.027,.03)]));
  parts.push(sweep("rear-leg-"+lr,"wood",[
   ring([x*1.06,.005,-.272],.017,.02),ring([x*1.04,.1,-.253],.018,.022),
   ring([x*.98,.29,-.207],.023,.025),ring([x*.96,seatHeight-.018,-.164],.026,.03),
   ring([x*.97,seatHeight+.18,-.213],.021,.026),ring([x*.96,backHeight-.025,-.27],.016,.022)]));
  parts.push(sweep("side-rail-"+lr,"wood",[
   ring([x*.96,seatHeight-.085,-.156],.012,.012),ring([x*.96,seatHeight-.092,-.012],.012,.012),
   ring([x*.96,seatHeight-.082,.158],.012,.012)],10));
  parts.push(sweep("joinery-pin-"+lr,"brass",[
   ring([x*.97,seatHeight-.048,-.174],.006,.006),ring([x*.97,seatHeight-.048,-.155],.006,.006)]));
 }
 parts.push(sweep("front-rail","wood",[
  ring([-h*.74,seatHeight-.07,.174],.014,.019),
  ring([0,seatHeight-.065,.18],.014,.019),
  ring([h*.74,seatHeight-.07,.174],.014,.019)],10));
 return{assetId:ASSET_ID,version:"0.1.0",unit:"metre",parameters:{width,seatHeight,backHeight},parts};
}
export function validateChair(a){
 const errors=[],stats={partCount:a.parts.length,vertices:0,triangles:0,degenerate:0,bounds:{min:[Infinity,Infinity,Infinity],max:[-Infinity,-Infinity,-Infinity]}},seen=new Set();
 for(const part of a.parts){
  if(seen.has(part.name))errors.push("DUPLICATE_PART");seen.add(part.name);
  const p=part.positions,ix=part.indices;
  if(p.length%3||ix.length%3||part.uvs.length!==p.length/3*2)errors.push("INVALID_BUFFERS");
  stats.vertices+=p.length/3;stats.triangles+=ix.length/3;
  for(let i=0;i<p.length;i++){if(!Number.isFinite(p[i]))errors.push("NONFINITE");const k=i%3;stats.bounds.min[k]=Math.min(stats.bounds.min[k],p[i]);stats.bounds.max[k]=Math.max(stats.bounds.max[k],p[i]);}
  for(let i=0;i<ix.length;i++)if(!Number.isInteger(ix[i])||ix[i]<0||ix[i]>=p.length/3)errors.push("BAD_INDEX");
  for(let i=0;i<ix.length;i+=3){
   const pt=j=>p.slice(3*ix[i+j],3*ix[i+j]+3);
   if(Math.hypot(...C(sub(pt(1),pt(0)),sub(pt(2),pt(0))))<1e-10)stats.degenerate++;
  }
 }
 if(stats.degenerate)errors.push("DEGENERATE_FACES");
 if(Math.abs(stats.bounds.min[1])>.005)errors.push("UNSUPPORTED_FEET");
 if(stats.bounds.max[1]<a.parameters.backHeight-.07)errors.push("BACK_TOO_SHORT");
 if(stats.partCount<10)errors.push("MISSING_PARTS");
 return{pass:!errors.length,errors:[...new Set(errors)],stats};
}
export function serializeOBJ(a){
 const out=["# "+a.assetId,"# authored vertices in metres"];let off=1;
 for(const p of a.parts){
  out.push("o "+p.name,"usemtl "+p.material);
  for(let i=0;i<p.positions.length;i+=3)out.push("v "+p.positions.slice(i,i+3).map(x=>x.toFixed(6)).join(" "));
  for(let i=0;i<p.indices.length;i+=3)out.push("f "+p.indices.slice(i,i+3).map(x=>x+off).join(" "));
  off+=p.positions.length/3;
 }return out.join("\n")+"\n";
}