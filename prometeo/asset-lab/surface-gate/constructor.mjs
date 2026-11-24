/* Extracted reusable primitives from chair-03-04/geometry.mjs; originals untouched. */
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

 return {shell,sweep,path,bez,joint};
}
const {shell,sweep,path,bez,joint}=library();
export {shell,sweep,path,bez,joint};
