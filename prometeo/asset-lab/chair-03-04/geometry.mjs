// Original parametric geometry; adapted closed shells and continuous variable-radius sweep from ARC/HÉLICE. metres, Y up, +Z front.
function library(){
 const v=(a,b)=>a.map((x,i)=>x-b[i]), add=(a,b)=>a.map((x,i)=>x+b[i]), mul=(a,t)=>a.map(x=>x*t), dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0), cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]], norm=a=>mul(a,1/Math.hypot(...a));
 function solid(name,material,role,p,uv,i){
  let volume=0;for(let k=0;k<i.length;k+=3){const q=j=>p.slice(i[k+j]*3,i[k+j]*3+3);volume+=dot(q(0),cross(q(1),q(2)))/6;}
  if(volume<0)for(let k=0;k<i.length;k+=3)[i[k+1],i[k+2]]=[i[k+2],i[k+1]];
  return {name,material,role,positions:p,uvs:uv,indices:i};
 }
 function shell(name,mat,role,nu,nv,point,thickness){
  const p=[],uv=[],ix=[],n=(nu+1)*(nv+1);
  for(let f=0;f<2;f++)for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){const u=i/nu,v=j/nv;const a=point(u,v);p.push(...add(a.p,mul(a.n,-f*thickness)));uv.push(u,v);}
  for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const a=j*(nu+1)+i,b=a+1,c=a+nu+1,d=c+1;ix.push(a,b,c,b,d,c,a+n,c+n,b+n,b+n,c+n,d+n);}
  const wall=(a,b)=>ix.push(b,a,a+n,b,a+n,b+n);
  for(let i=0;i<nu;i++){wall(i,i+1);const k=nv*(nu+1)+i;wall(k+1,k);}
  for(let j=0;j<nv;j++){const a=j*(nu+1);wall(a+nu,a+2*nu+1);wall(a+nu+1,a);}
  return solid(name,mat,role,p,uv,ix);
 }
 function bez(a,b,c,d,t){const s=1-t;return a.map((x,i)=>s*s*s*x+3*s*s*t*b[i]+3*s*t*t*c[i]+t*t*t*d[i]);}
 function path(segments,steps=12){const p=[];for(const s of segments)for(let i=0;i<=steps;i++)if(i||!p.length)p.push(bez(...s,i/steps));return p;}
 function sweep(name,mat,role,points,radii,sides=24){
  const p=[],uv=[],ix=[];let last=null;
  for(let j=0;j<points.length;j++){const tangent=norm(v(points[Math.min(j+1,points.length-1)],points[Math.max(j-1,0)]));let n=last?norm(v(last,mul(tangent,dot(last,tangent)))):norm(cross(tangent,Math.abs(tangent[2])>.92?[0,1,0]:[0,0,1]));last=n;const b=cross(tangent,n);const [ra,rb]=radii(j/(points.length-1),j);
   for(let k=0;k<sides;k++){const a=2*Math.PI*k/sides;p.push(...add(points[j],add(mul(n,ra*Math.cos(a)),mul(b,rb*Math.sin(a)))));uv.push(k/sides,j/(points.length-1));}}
  for(let j=0;j<points.length-1;j++)for(let k=0;k<sides;k++){const a=j*sides+k,b=j*sides+(k+1)%sides,c=a+sides,d=b+sides;ix.push(a,b,c,b,d,c);}
  for(const end of [0,points.length-1]){const center=p.length/3;p.push(...points[end]);uv.push(.5,end?1:0);for(let k=0;k<sides;k++){const a=end*sides+k,b=end*sides+(k+1)%sides;ix.push(...(end?[center,a,b]:[center,b,a]));}}
  return solid(name,mat,role,p,uv,ix);
 }
 const joint=(from,to,point,type)=>({from,to,point,type});
 function generate(id){
  const parts=[],joints=[];
  if(id==="rail"){
   parts.push(shell("seat","oak","seat",36,30,(u,w)=>{const t=2*u-1,q=2*w-1;return {p:[.255*t*(1-.095*Math.abs(q)**8),.461+.009*t*t-.009*(1-t*t)*Math.sin(Math.PI*w),-.235*q],n:[0,1,0]};},.038));
   parts.push(shell("back-band","oak","backrest",40,20,(u,w)=>{const t=2*u-1;return {p:[.252*t*(.97+.03*Math.sin(Math.PI*w)),.665+.135*w-.018*t*t*(.4+.6*w),-.252+.043*t*t-.025*w],n:[0,0,1]};},.024));
   for(const s of [-1,1]){const x=s*.205,n=s<0?"left-sled":"right-sled",P=(y,z)=>[x,y,z];
    const pts=path([
     [P(.447,.165),P(.40,.185),P(.17,.235),P(.085,.235)],
     [P(.085,.235),P(.037,.235),P(.018,.207),P(.018,.165)],
     [P(.018,.165),P(.018,.065),P(.018,-.105),P(.018,-.17)],
     [P(.018,-.17),P(.018,-.215),P(.043,-.232),P(.087,-.225)],
     [P(.087,-.225),P(.22,-.205),P(.36,-.18),P(.445,-.18)],
     [P(.445,-.18),P(.55,-.18),P(.68,-.232),P(.755,-.252)]
    ],18);
    parts.push(sweep(n,"rail","grounded continuous side frame",pts,()=>[.016,.018],24));
    joints.push(joint("seat",n,[x,.443,.167],"front socket"),joint("seat",n,[x,.443,-.18],"rear socket"),joint("back-band",n,[x,.737,-.249],"back socket"));
   }
   parts.push(sweep("cross-brace","rail","transverse brace",[[-.205,.335,-.193],[0,.335,-.193],[.205,.335,-.193]],()=>[.012,.012]));
   joints.push(joint("cross-brace","left-sled",[-.202,.335,-.193],"weld"),joint("cross-brace","right-sled",[.202,.335,-.193],"weld"));
   return {id,name:"RIEL 03",parts,joints,feet:["left-sled","right-sled"],dimensions:{width:.51,seatHeight:.461,backHeight:.80,seatThickness:.038,backThickness:.024},notes:"Two continuous steel sleds; open back band and independent seat."};
  }
  if(id!=="petal")throw Error("unknown asset");
  const segs=[[[0,.468,.235],[0,.455,.17],[0,.431,-.066],[0,.445,-.145]],[[0,.445,-.145],[0,.459,-.224],[0,.69,-.258],[0,.825,-.29]]];
  const center=w=>w<=.5?bez(...segs[0],2*w):bez(...segs[1],2*w-1);
  parts.push(shell("continuous-shell","clay","seat and back",48,64,(u,w)=>{const t=2*u-1,p=center(w),a=center(Math.max(0,w-.0001)),b=center(Math.min(1,w+.0001)),d=norm(v(b,a));const n=[0,-d[2],d[1]];
   const hw=.255-.04*Math.sin(Math.PI*w)**2-.035*w*w+.019*Math.sin(2*Math.PI*w);
   return {p:add([hw*t,p[1],p[2]],mul(n,(.027+.015*w)*t*t-.013*(1-t*t)*Math.sin(Math.PI*w))),n};},.028));
  const column=[[0,.060,0],[0,.088,0],[0,.12,0],[0,.34,0],[0,.39,0],[0,.416,0]];
  parts.push(sweep("column","rail","pedestal",column,(t,j)=>[[.058,.058],[.058,.058],[.038,.038],[.03,.03],[.044,.044],[.044,.044]][j],40));
  parts.push(sweep("mount","rail","seat mounting plate",[[0,.394,0],[0,.403,0],[0,.426,0],[0,.437,0]],(t,j)=>[[.065,.065],[.105,.105],[.105,.105],[.083,.083]][j],48));
  joints.push(joint("mount","column",[0,.408,0],"flanged socket"),joint("continuous-shell","mount",[0,.431,0],"seat bearing"));
  const feet=[];
  for(let k=0;k<4;k++){const a=Math.PI/4+k*Math.PI/2,dx=Math.cos(a),dz=Math.sin(a),P=(r,y)=>[dx*r,y,dz*r],name="radial-foot-"+k;
   const pts=path([[P(.018,.079),P(.085,.079),P(.16,.044),P(.25,.018)],[P(.25,.018),P(.27,.012),P(.295,.018),P(.325,.018)]],18);
   parts.push(sweep(name,"rail","radial support",pts,t=>[.021-.006*t,.020-.002*t],24));
   feet.push(name);joints.push(joint("column",name,P(.035,.079),"radial socket"));
  }
  return {id,name:"PÉTALO 04",parts,joints,feet,dimensions:{width:.51,seatHeight:.468,backHeight:.825,shellThickness:.028},notes:"One continuous curved seat-back shell; central pedestal and four radial feet."};
 }
 function inspect(m){
  const errors=[],stats={parts:m.parts.length,triangles:0,vertices:0,groundedSupports:0,verifiedJoints:0},map=new Map(),bounds={min:[Infinity,Infinity,Infinity],max:[-Infinity,-Infinity,-Infinity]};
  for(const p of m.parts){map.set(p.name,p);const ed=new Map();let vol=0,minY=Infinity;stats.vertices+=p.positions.length/3;stats.triangles+=p.indices.length/3;
   for(let i=0;i<p.positions.length;i++){const x=p.positions[i],j=i%3;if(!Number.isFinite(x))errors.push("nonfinite:"+p.name);bounds.min[j]=Math.min(bounds.min[j],x);bounds.max[j]=Math.max(bounds.max[j],x);if(j===1)minY=Math.min(minY,x);}
   if(p.uvs.length!==p.positions.length/3*2||p.uvs.some(x=>!Number.isFinite(x)))errors.push("uv:"+p.name);
   if(m.feet.includes(p.name)&&Math.abs(minY)<=.009)stats.groundedSupports++;
   for(let k=0;k<p.indices.length;k+=3){const ids=p.indices.slice(k,k+3),q=j=>p.positions.slice(ids[j]*3,ids[j]*3+3);if(ids.some(i=>i<0||i>=p.positions.length/3||!Number.isInteger(i)))errors.push("index:"+p.name);
    if(Math.hypot(...cross(v(q(1),q(0)),v(q(2),q(0))))<1e-10)errors.push("degenerate:"+p.name);
    vol+=dot(q(0),cross(q(1),q(2)))/6;
    for(let j=0;j<3;j++){const a=ids[j],b=ids[(j+1)%3],key=Math.min(a,b)+":"+Math.max(a,b),e=ed.get(key)||[0,0];e[0]++;e[1]+=a<b?1:-1;ed.set(key,e);}
   }
   if([...ed.values()].some(e=>e[0]!==2||e[1]!==0)||vol<=0)errors.push("open-or-winding:"+p.name);
  }
  function inside(p,o){if(!p)return false;const d=norm([1,.371,.197]),ts=[];for(let k=0;k<p.indices.length;k+=3){const q=j=>p.positions.slice(p.indices[k+j]*3,p.indices[k+j]*3+3),a=q(0),e1=v(q(1),a),e2=v(q(2),a),h=cross(d,e2),det=dot(e1,h);if(Math.abs(det)<1e-10)continue;const f=1/det,s=v(o,a),u=f*dot(s,h);if(u<0||u>1)continue;const r=cross(s,e1),w=f*dot(d,r);if(w<0||u+w>1)continue;const t=f*dot(e2,r);if(t>1e-7)ts.push(t);}ts.sort((a,b)=>a-b);return ts.filter((t,i)=>!i||t-ts[i-1]>1e-7).length%2===1;}
  const jointResults=m.joints.map(j=>({...j,insideFrom:inside(map.get(j.from),j.point),insideTo:inside(map.get(j.to),j.point)}));
  for(const j of jointResults){if(j.insideFrom&&j.insideTo)stats.verifiedJoints++;else errors.push("joint:"+j.from+"/"+j.to+" "+j.insideFrom+"/"+j.insideTo);}
  const seen=new Set([m.parts[0].name]);for(let i=0;i<m.parts.length;i++)for(const j of jointResults)if(j.insideFrom&&j.insideTo){if(seen.has(j.from))seen.add(j.to);if(seen.has(j.to))seen.add(j.from);}
  if(seen.size!==m.parts.length)errors.push("disconnected graph");if(stats.groundedSupports!==m.feet.length)errors.push("ground support");if(bounds.min[1]<-.009)errors.push("floor penetration");
  return {ok:!errors.length,errors:[...new Set(errors)],stats,bounds,jointResults,connectedParts:seen.size};
 }
 return {generate,inspect};
}
const api=library();
export const generate=api.generate, inspect=api.inspect;
