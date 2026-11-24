/* Paired shell face regression gate. Coordinates metres. */
export function surfaceGate(host,foreign,{faceVertices,normalOffset=0.001,windows=[]}={}){
 const sub=(a,b)=>a.map((x,i)=>x-b[i]),add=(a,b)=>a.map((x,i)=>x+b[i]),mul=(a,s)=>a.map(x=>x*s),dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
 const vertex=(m,i)=>m.positions.slice(3*i,3*i+3),eps=1e-9;
 const bbox=t=>[0,1,2].map(i=>[Math.min(...t.map(p=>p[i])),Math.max(...t.map(p=>p[i]))]);
 const overlap=(a,b)=>a.every(([l,h],i)=>l<=b[i][1]+eps&&h>=b[i][0]-eps);
 const tri=m=>Array.from({length:m.indices.length/3},(_,i)=>m.indices.slice(3*i,3*i+3).map(j=>vertex(m,j)));
 const ray=(o,d,t)=>{let e=sub(t[1],t[0]),f=sub(t[2],t[0]),h=cross(d,f),a=dot(e,h);if(Math.abs(a)<eps)return null;let s=sub(o,t[0]),u=dot(s,h)/a;if(u< -eps||u>1+eps)return null;let q=cross(s,e),v=dot(d,q)/a;if(v< -eps||u+v>1+eps)return null;return dot(f,q)/a;};
 const inside=(p,ts)=>{const d=[1,.371,.197],hits=ts.map(t=>ray(p,d,t)).filter(t=>t!==null&&t>eps).sort((a,b)=>a-b);return hits.filter((x,i)=>!i||x-hits[i-1]>1e-7).length%2===1;};
 const allowed=p=>windows.some(w=>w.min.every((v,i)=>p[i]>=v-eps&&p[i]<=w.max[i]+eps));
 if(!Number.isInteger(faceVertices)||faceVertices<3||2*faceVertices>host.positions.length/3||normalOffset<0)throw Error("protected paired face required");
 const ft=tri(foreign),fb=ft.map(bbox),whole=bbox(foreign.positions.reduce((a,_,i)=>{if(i%3===0)a.push(vertex(foreign,i/3));return a;},[]));
 const hits=[];let examined=0;
 for(let k=0;k<host.indices.length;k+=3){const ids=host.indices.slice(k,k+3);if(!ids.every(i=>i<faceVertices))continue;
  const front=ids.map(i=>vertex(host,i)),inner=ids.map(i=>{const p=vertex(host,i),d=sub(vertex(host,i+faceVertices),p),len=Math.hypot(...d);if(len<=normalOffset)throw Error("residual exceeds thickness");return add(p,mul(d,normalOffset/len));});
  for(const [surface,t] of [["visible",front],["residual",inner]]){
   const box=bbox(t);if(!overlap(box,whole))continue;examined++;
   const record=p=>{if(!allowed(p))hits.push({surface,point:p.map(x=>+x.toFixed(7))});};
   for(const p of t)if(inside(p,ft))record(p);
   for(let j=0;j<ft.length;j++){if(!overlap(box,fb[j]))continue;const b=ft[j];
    for(const [a,c] of [[t,b],[b,t]])for(let i=0;i<3;i++){let o=a[i],d=sub(a[(i+1)%3],o),u=ray(o,d,c);if(u!==null&&u>=-eps&&u<=1+eps)record(add(o,mul(d,u)));}
   }
   if(hits.some(h=>h.surface==='visible')&&hits.some(h=>h.surface==='residual'))return {ok:false,host:host.name,foreign:foreign.name,examined,hits:[...hits.filter(h=>h.surface==='visible').slice(0,3),...hits.filter(h=>h.surface==='residual').slice(0,3)]};
  }
 }
 return {ok:hits.length===0,host:host.name,foreign:foreign.name,examined,hits:hits.slice(0,12)};
}
