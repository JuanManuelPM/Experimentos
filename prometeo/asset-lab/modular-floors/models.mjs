import {shell,meshAnchor,inspectAssembly} from 'https://cdn.jsdelivr.net/gh/JuanManuelPM/Experimentos@6ebdfe30fde33e3a570f683ac3bb93cfecfb38a3/prometeo/asset-lab/surface-gate/constructor.mjs';
import {surfaceGate} from 'https://cdn.jsdelivr.net/gh/JuanManuelPM/Experimentos@6ebdfe30fde33e3a570f683ac3bb93cfecfb38a3/prometeo/asset-lab/surface-gate/surface-gate.mjs';
// Existing PROMETEO closed shell constructor; world metres, Y up, finished datum Y=0.
export const MODULE=1.2;
export const catalog={
 wood:{name:'01 · ROBLE / parquet',description:'Roble aceitado, aparejo a media tabla, bisel y veta longitudinal. Contrapiso y base acústica.',w:.60,d:.12,gap:.002,bevel:.0015,bottom:-.022,base:-.055,rows:10,cols:2,materials:['oak0','oak1','oak2','oak3','oak4','oak5'],substrate:'cork',foundation:'screed'},
 shop:{name:'02 · FORJA / taller',description:'Hormigón fratasado en paños, juntas serradas, árido, abrasión y marcas de rodadura. Base resistente.',w:.60,d:.60,gap:.008,bevel:.003,bottom:-.105,base:-.18,rows:2,cols:2,materials:['concrete0','concrete1','concrete2','concrete3'],substrate:'grout',foundation:'concreteBase'},
 stone:{name:'03 · BASALTO / exterior',description:'Adoquines de granito y basalto alternados, aristas erosionadas, juntas de arena y lecho drenante.',w:.20,d:.12,gap:.008,bevel:.007,bottom:-.075,base:-.14,rows:10,cols:6,materials:['stone0','stone1','stone2','stone3','stone4','stone5'],substrate:'sand',foundation:'gravel'}
};
const hash=(x,z,k=0)=>{let h=Math.imul(x+19999,374761393)^Math.imul(z+25999,668265263)^Math.imul(k+7,1274126177);h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967296;};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const rect=(name,mat,role,x0,x1,z0,z1,y,bottom,opts={})=>{
 const W=x1-x0,D=z1-z0,b=Math.min(opts.bevel||0,W*.15,D*.15),nu=opts.nu||2,nv=opts.nv||2;
 const coord=(t,n,len)=>{if(!b||n<4)return t*len;const i=Math.round(t*n);if(i===0)return 0;if(i===n)return len;if(i===1)return b;if(i===n-1)return len-b;return b+(len-2*b)*(i-1)/(n-2);};
 const part=shell(name,mat,role,nu,nv,(u,v)=>{
  const px=coord(u,nu,W),pz=coord(v,nv,D),ex=Math.min(px,W-px),ez=Math.min(pz,D-pz);
  const edge=b?clamp(1-Math.min(ex,ez)/b,0,1):0;
  const wave=opts.wave||0,ir=opts.irregular||0,seed=opts.seed||0;
  const sx=ir*(1+.55*Math.sin(v*17+seed))*Math.pow(Math.abs(u*2-1),6),sz=ir*(1+.55*Math.sin(u*19+seed))*Math.pow(Math.abs(v*2-1),6);
  const x=x0+px+(u<.5?sx:-sx),z=z0+pz+(v<.5?sz:-sz);
  const micro=wave*(.5*Math.sin(u*14+v*5+seed)+.3*Math.cos(v*17-u*5+seed)+.2*Math.sin(u*41+v*29));
  const yy=y+micro-(opts.drop||b*.55)*edge;
  return {p:[x,yy,z],n:[0,1,0]};
 },Math.max(.0001,y-bottom));
 const n=(nu+1)*(nv+1);for(let i=n;i<2*n;i++)part.positions[i*3+1]=bottom;
 // UV spans normalized local tile, with baked world position available for global material mapping.
 part.faceVertices=n;return part;
};
export function buildFloor(kind,{ix=0,iz=0,nx=1,nz=1,clip=false,transition=false}={}){
 const s=catalog[kind];if(!s||![ix,iz,nx,nz].every(Number.isInteger)||nx<1||nz<1||nx>8||nz>8)throw Error('invalid floor region');
 const x0=ix*MODULE,z0=iz*MODULE,x1=x0+nx*MODULE,z1=z0+nz*MODULE;
 const m={name:s.name,kind,units:'m',datum:0,nominal:{x0,x1,z0,z1},clip,parts:[],relations:[],protectedFaces:[],roots:[],independent:[],tiles:[],anchors:{origin:[x0,0,z0],east:[x1,0,z0],south:[x0,0,z1],grid:MODULE},ownership:'Global row/column; odd rows overhang east, west filled by previous module. clip only at final perimeter.'};
 const add=p=>(m.parts.push(p),p),rel=(guest,host,seed,axis,min=-.0001,max=.0001,type='CONTACTO',reason='')=>m.relations.push({id:guest.name+'→'+host.name,guest:guest.name,host:host.name,type,min,max,probes:[{seed,axis,reach:.04}],reason});
 const base=add(rect('foundation',s.foundation,'foundation',x0,x1,z0,z1,s.base,s.base-.035));m.roots.push(base.name);
 const bed=add(rect('bedding',s.substrate,'bedding',x0,x1,z0,z1,s.bottom,s.base));rel(bed,base,[(x0+x1)/2,s.base,(z0+z1)/2],[0,-1,0]);
 for(let j=iz*s.rows;j<(iz+nz)*s.rows;j++){
  const shift=kind==='shop'?0:((j%2+2)%2)*s.w/2;
  const from=ix*s.cols-(clip&&shift?1:0),to=(ix+nx)*s.cols;
  for(let i=from;i<to;i++){
   const a=i*s.w+shift,b=a+s.w,c=j*s.d,d=c+s.d;
   const xa=(clip?Math.max(a,x0):a)+s.gap/2,xb=(clip?Math.min(b,x1):b)-s.gap/2,za=c+s.gap/2,zb=d-s.gap/2;
   if(xb-xa<.02)continue;
   const h=hash(i,j),t=hash(i,j,1),name='tile-'+i+'-'+j;
   const top=kind==='wood'?-h*.00045:kind==='shop'?-.0003-h*.0007:(h-.5)*.003;
   const tile=add(rect(name,s.materials[Math.floor(t*s.materials.length)],'finish',xa,xb,za,zb,top,s.bottom,{bevel:s.bevel,nu:kind==='wood'?12:10,nv:kind==='wood'?6:10,drop:kind==='stone'?.004:s.bevel*.65,wave:kind==='stone'?.0018:kind==='shop'?.00065:.00016,irregular:kind==='stone'?.002:0,seed:h*60}));
   const cx=(Math.max(xa,x0)+Math.min(xb,x1))/2,cz=(za+zb)/2;
   const anchor=meshAnchor(bed,[cx,s.bottom,cz],[0,-1,0],'entry',.04);
   rel(tile,bed,anchor?anchor.point:[cx,s.bottom,cz],[0,-1,0]);
   m.protectedFaces.push({name,faceVertices:tile.faceVertices,residual:kind==='wood'?.002:.004});
   m.tiles.push({name,i,j,footprint:[xa,xb,za,zb],material:tile.material,top});
  }
 }
 // Perimeter transition, optional; never inserted at interior module interfaces.
 if(transition&&clip){
  const strip=add(rect('threshold',kind==='wood'?'brass':kind==='shop'?'steel':'edgeStone','transition',x0,x1,z0-.045,z0-.001,-.002,s.bottom,{bevel:.003,nu:8,nv:6,drop:.003}));
  const support=add(rect('threshold-bed',s.substrate,'transition-bed',x0,x1,z0-.045,z0-.001,s.bottom,s.base));
  m.roots.push(support.name);rel(strip,support,[(x0+x1)/2,s.bottom,z0-.023],[0,-1,0]);
  rel(strip,bed,[(x0+x1)/2,s.bottom-.001,z0],[0,0,1],.0009,.0011,'HOLGURA','Junta perimetral de 1 mm entre soporte y módulo; umbral independiente.');
  // The strip is connected to its own bedding; horizontal gap is measured between bedding parts at shared height.
  m.relations.pop();rel(support,bed,[(x0+x1)/2,(s.bottom+s.base)/2,z0],[0,0,1],.0009,.0011,'HOLGURA','Junta perimetral de 1 mm, no se usa entre módulos.');
 }
 return m;
}
export const buildParquet=o=>buildFloor('wood',o);
export const buildWorkshop=o=>buildFloor('shop',o);
export const buildPaving=o=>buildFloor('stone',o);
export function auditFloor(m,{surfaces=true}={}){
 const a=inspectAssembly(surfaces?m:{...m,protectedFaces:[]},{gate:surfaceGate});
 let degenerate=0,open=0,nonfinite=0,invalid=0,triangles=0,overlaps=0;
 for(const p of m.parts){const edges=new Map();nonfinite+=p.positions.filter(x=>!Number.isFinite(x)).length;triangles+=p.indices.length/3;
  for(let i=0;i<p.indices.length;i+=3){let t=p.indices.slice(i,i+3);if(t.some(k=>!Number.isInteger(k)||k<0||k>=p.positions.length/3)){invalid++;continue;}const [a,b,c]=t.map(k=>p.positions.slice(k*3,k*3+3));const u=b.map((x,k)=>x-a[k]),v=c.map((x,k)=>x-a[k]);if(Math.hypot(u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0])<1e-12)degenerate++;
   for(let j=0;j<3;j++){const k=[t[j],t[(j+1)%3]].sort((a,b)=>a-b).join(':');edges.set(k,(edges.get(k)||0)+1);}}
  open+=[...edges.values()].filter(x=>x!==2).length;
 }
 for(let i=0;i<m.tiles.length;i++)for(let j=i+1;j<m.tiles.length;j++){const a=m.tiles[i].footprint,b=m.tiles[j].footprint;if(Math.min(a[1],b[1])-Math.max(a[0],b[0])>1e-8&&Math.min(a[3],b[3])-Math.max(a[2],b[2])>1e-8)overlaps++;}
 return {name:m.name,parts:m.parts.length,tiles:m.tiles.length,triangles,degenerate,open,nonfinite,invalid,overlaps,geometry:degenerate+open+nonfinite+invalid+overlaps?'FAIL':'PASS',assembly:a.status,issues:a.issues,surfacePairs:a.surfaces.length,surfaceFailures:a.surfaces.filter(x=>x.status==='FAIL'||x.status==='ERROR').length,relations:a.relations.length,relationFailures:a.relations.filter(x=>!x.ok).length,surfaces:surfaces?'LOCAL_PAIRED_FACE':'NOT_RUN'};
}
export function auditSeam(kind){
 const a=buildFloor(kind),b=buildFloor(kind,{ix:1}),c=buildFloor(kind,{iz:1});
 const same=(p,q)=>p.name===q.name&&p.material===q.material&&p.positions.every((v,i)=>v===q.positions[i]);
 const whole=buildFloor(kind,{nx:2,nz:2}),d=buildFloor(kind,{ix:1,iz:1});
 const map=new Map(whole.parts.filter(p=>p.role==='finish').map(p=>[p.name,p]));
 const pieces=[a,b,c,d].flatMap(m=>m.parts.filter(p=>p.role==='finish'));
 const keys=new Set(pieces.map(p=>p.name));
 let overlaps=0,maxError=0;const tiles=[...a.tiles,...b.tiles,...c.tiles,...d.tiles];
 for(let i=0;i<tiles.length;i++)for(let j=i+1;j<tiles.length;j++){const p=tiles[i].footprint,q=tiles[j].footprint;if(Math.min(p[1],q[1])-Math.max(p[0],q[0])>1e-8&&Math.min(p[3],q[3])-Math.max(p[2],q[2])>1e-8)overlaps++;}
 for(const t of tiles){const next=tiles.find(q=>q.i===t.i+1&&q.j===t.j);if(next)maxError=Math.max(maxError,Math.abs(next.footprint[0]-t.footprint[1]-catalog[kind].gap));}
 const pass=keys.size===pieces.length&&map.size===keys.size&&pieces.every(p=>map.has(p.name)&&same(p,map.get(p.name)))&&overlaps===0&&maxError<1e-8;
 return {kind,pass,unique:keys.size,assembled:pieces.length,combined:map.size,overlaps,maxGapError:maxError,axes:['X','Z'],method:'2×2 identical world geometry vs four separately generated modules; no duplicate tile ownership'};
}
