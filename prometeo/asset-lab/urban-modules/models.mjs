import {shell,sweep,meshAnchor,inspectAssembly} from '../surface-gate/constructor.mjs';
export const catalog=[
 ['residential','JACARANDÁ','Residencial · hormigón peinado, vado y asfalto reparado'],
 ['commercial','PASAJE','Comercial · adoquín modular, parada y cruce peatonal'],
 ['industrial','ÓXIDO','Industrial · losas quebradas, drenaje pesado y huellas de carga']
];
export const interfaceProfile={units:'m',up:'Y',length:18,width:12,roadHalf:3.5,curb:.18,datum:0,origin:[0,0,0],start:[0,0,0],end:[0,0,18],anchors:[[-6,.18,0],[0,.06,0],[6,.18,0],[-6,.18,18],[0,.06,18],[6,.18,18]]};
const D=[0,-1,0],U=[0,1,0],clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),lerp=(a,b,t)=>a+(b-a)*t;
export function build(id){
 const idx=catalog.findIndex(c=>c[0]===id);if(idx<0)throw Error('Unknown module '+id);
 let seed=3301+idx*119;const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 const m={name:catalog[idx][1],id,units:'m',parts:[],relations:[],roots:['subgrade'],independent:[],protectedFaces:[],interface:interfaceProfile,features:[],materials:{}};
 const add=p=>(m.parts.push(p),p),byName=new Map(),keep=p=>(byName.set(p.name,p),add(p));
 const rect=(name,mat,role,x0,x1,z0,z1,h,t=.08,nx=1,nz=1)=>keep(shell(name,mat,role,nx,nz,(u,v)=>{let x=lerp(x0,x1,u),z=lerp(z1,z0,v);return {p:[x,h(x,z),z],n:U}},t));
 const relation=(guest,host,x,z,y,axis=D,kind='CONTACTO',range=[-.002,.002],reason='')=>{
   let a=meshAnchor(host,[x,y,z],axis,'entry',.8),b=meshAnchor(guest,[x,y,z],axis,'exit',.8);
   m.relations.push({id:guest.name+'>'+host.name,guest:guest.name,host:host.name,type:kind,min:range[0],max:range[1],probes:[{seed:a?.point||[x,y,z],axis,reach:.8}],reason,anchor:a?.point||null,guestAnchor:b?.point||null});
 };
 const slab=rect('subgrade','earth','foundation',-6,6,0,18,()=>-.24,.36);
 const fade=z=>Math.min(1,z/1.5,(18-z)/1.5);
 const road=(x,z)=>.06*(1-Math.abs(x)/3.5)+(idx===2?-.018*Math.sin(Math.PI*clamp((Math.abs(x)-.4)/2.7,0,1))**2*fade(z)*(.65+.35*Math.cos(z*1.4)):0);
 const rheight=z=>{let c=idx===1?8.9:idx===2?12:5.4;return .18-.155*Math.max(0,1-Math.max(0,Math.abs(z-c)-.85)/1.05)};
 const walk=(x,z)=>lerp(rheight(z),.18,clamp((Math.abs(x)-3.7)/1.7,0,1));
 const structural=(name,mat,role,x0,x1,z0,z1,h,nx=1,nz=1)=>{
   const p=rect(name,mat,role,x0,x1,z0,z1,h,.38,nx,nz),x=(x0+x1)/2,z=(z0+z1)/2;
   relation(p,slab,x,z,h(x,z)-.38,D,'ENCASTRE',[-.17,-.035]);return p;
 };
 const coverX=[.70,1.46],coverZ=[8.0,8.76],xs=[-3.12,-1.7,0,.70,1.46,3.12],zs=[0,3,6,8,8.76,12,15,18];
 let roadParts=[];
 for(let i=0;i<xs.length-1;i++)for(let j=0;j<zs.length-1;j++){
   if(i===3&&j===3)continue;
   let mat=idx===2?((i+j)%4===0?'concreteDark':'asphaltOld'):idx===1?'asphaltFine':'asphalt';
   const p=structural('road-'+i+'-'+j,mat,'carriageway',xs[i],xs[i+1],zs[j],zs[j+1],road,3,Math.ceil((zs[j+1]-zs[j])/.5));
   roadParts.push({p,x0:xs[i],x1:xs[i+1],z0:zs[j],z1:zs[j+1]});
 }
 const hostRoad=(x,z)=>roadParts.find(q=>x>q.x0-1e-7&&x<q.x1+1e-7&&z>q.z0-1e-7&&z<q.z1+1e-7)?.p;
 // Square service recess, split cast frame surrounding actual circular lid.
 const cx=1.08,cz=8.38,R=.305,outer=.38,hy=road(cx,cz),bottom=structural('service-well','dark','utility-well',...coverX,...coverZ,()=>hy-.085);
 const disk=(name,mat,role,x,z,y0,y1,r,sides=48)=>keep(sweep(name,mat,role,[[x,y0,z],[x,y1,z]],()=>[r,r],sides));
 for(let k=0;k<4;k++){
   const a0=Math.PI/4+k*Math.PI/2;
   let p=keep(shell('cast-frame-'+k,'iron','utility-frame',12,2,(u,v)=>{let a=a0+u*Math.PI/2,dx=Math.cos(a),dz=Math.sin(a),r=lerp(R+.004,outer/Math.max(Math.abs(dx),Math.abs(dz)),v);let x=cx+r*dx,z=cz+r*dz;return {p:[x,road(x,z),z],n:U}},.085));
   const a=a0+Math.PI/4,r=(R+.004+outer)/2,x=cx+r*Math.cos(a),z=cz+r*Math.sin(a);
   relation(p,bottom,x,z,hy-.085,D,'JUNTA_VISIBLE',[-.015,.015],'Cast frame seated in utility well; slope tolerance');
 }
 const lid=disk('service-lid','iron','utility-cover',cx,cz,hy-.085,hy-.002,R);
 relation(lid,bottom,cx,cz,hy-.085);
 for(let i=-3;i<=3;i++)for(let j=-3;j<=3;j++)if(Math.hypot(i,j)<=3.5){
   const p=rect('lid-tread-'+i+'-'+j,'ironLight','raised-tread',cx+i*.073-.019,cx+i*.073+.019,cz+j*.073-.01,cz+j*.073+.01,()=>hy+.001,.003);
   relation(p,lid,cx+i*.073,cz+j*.073,hy-.002);
 }
 m.features.push({type:'manhole',position:[cx,hy,cz],opening:'actual recess',diameter:.61});
 for(const s of [-1,1]){
   const side=s<0?'L':'R',X=(a,b)=>s<0?[-b,-a]:[a,b];
   const drainZ=idx===0?3.75:idx===1?5.1:6.6,ends=[0,drainZ-.34,drainZ+.34,18];
   for(let j=0;j<3;j++){
     const [z0,z1]=[ends[j],ends[j+1]];
     if(j!==1){structural('gutter-'+side+j,'gutter','drainage-channel',...X(3.12,3.5),z0,z1,road,2,Math.ceil((z1-z0)/.5));continue}
     const well=structural('drain-well-'+side,'dark','storm-drain-recess',...X(3.12,3.5),z0,z1,()=>-.12);
     const frameA=rect('grate-rail-in-'+side,'iron','grate-frame',...X(3.12,3.165),z0,z1,()=>.005,.125);
     const frameB=rect('grate-rail-out-'+side,'iron','grate-frame',...X(3.455,3.5),z0,z1,()=>.005,.125);
     relation(frameA,well,s*3.14,drainZ,-.12);relation(frameB,well,s*3.48,drainZ,-.12);
     for(let k=0;k<11;k++){
       const z=lerp(z0+.024,z1-.024,k/10),p=rect('grate-bar-'+side+k,'ironLight','open-grate',...X(3.165,3.455),z-.011,z+.011,()=>.004,.045);
       relation(p,frameA,s*3.165,z,-.018,[-s,0,0]);relation(p,frameB,s*3.455,z,-.018,[s,0,0]);
     }
     m.features.push({type:'storm-drain',side,position:[s*3.31,0,drainZ],openSlots:10});
   }
   const c=idx===1?8.9:idx===2?12:5.4,breaks=[0,c-1.9,c-.85,c+.85,c+1.9,18];
   for(let j=0;j<breaks.length-1;j++){
     const z0=breaks[j],z1=breaks[j+1];
     structural('curb-'+side+j,idx===2?'curbOld':'curb','curb',...X(3.5,3.7),z0,z1,(_,z)=>rheight(z),2,Math.ceil((z1-z0)/.45));
     const step=idx===1?.75:idx===2?1.45:1.2,n=Math.ceil((z1-z0)/step);
     for(let k=0;k<n;k++){
       let a=lerp(z0,z1,k/n),b=lerp(z0,z1,(k+1)/n),gap=.004;
       let aa=a+(a===0?0:gap/2),bb=b-(b===18?0:gap/2);
       // Solid joint bedding, top slightly below tile edges; not a floating slab.
       structural('walk-joint-'+side+j+'-'+k,'mortar','walk-bedding',...X(3.7,6),a,b,(x,z)=>walk(x,z)-.012,3,2);
       const under=byName.get('walk-joint-'+side+j+'-'+k);
       for(let l=0;l<(idx===1?4:2);l++){
         const count=idx===1?4:2,x0=3.7+2.3*l/count+(l?gap/2:0),x1=3.7+2.3*(l+1)/count-(l<count-1?gap/2:0);
         let mat=idx===1?(l===0?'graniteBand':(k+l)%4===0?'paverWarm':'paver'):idx===2?(rand()>.68?'concreteDark':'concrete'):'concrete';
         let p=rect('walk-tile-'+side+j+'-'+k+'-'+l,mat,'sidewalk',...X(x0,x1),aa,bb,walk,.012,3,2);
         relation(p,under,s*(x0+x1)/2,(aa+bb)/2,walk(s*(x0+x1)/2,(aa+bb)/2)-.012,D,'JUNTA_VISIBLE',[-.008,.008],'Tile bed follows ramp profile');
         if(j===2&&l===0&&idx!==2){
           for(let row=0;row<4;row++)for(let col=0;col<3;col++){
             let x=s*lerp(x0+.05,x1-.05,(col+.5)/3),z=lerp(aa+.015,bb-.015,(row+.5)/4),y=walk(x,z);
             const dot=disk('tactile-'+side+k+'-'+row+'-'+col,'tactile','tactile-stud',x,z,y-.004,y+.014,.019,12);
             relation(dot,p,x,z,y,D,'JUNTA_VISIBLE',[-.025,.003],'Deliberate tactile projection');
           }
         }
       }
     }
   }
   m.features.push({type:'curb-ramp',side,center:c,rise:.155});
 }
 // Painted geometry follows substrate; split at every road tile boundary.
 const paint=(name,mat,x0,x1,z0,z1)=>{
   for(const q of roadParts){
     let a=Math.max(x0,q.x0),b=Math.min(x1,q.x1),c=Math.max(z0,q.z0),d=Math.min(z1,q.z1);
     if(b-a<.003||d-c<.003)continue;
     const p=rect(name+'-'+q.p.name,mat,'road-marking',a,b,c,d,(x,z)=>road(x,z)+.0015,.0015,2,Math.max(1,Math.ceil((d-c)/.25)));
     const x=(a+b)/2,z=(c+d)/2;
     relation(p,q.p,x,z,road(x,z),D,'JUNTA_VISIBLE',[-.012,.012],'Thin intentional paint layer on surface');
   }
 };
 if(idx===0){for(let z=1;z<18;z+=3.6)paint('center-'+z,'paintWhite',-.055,.055,z,z+1.55);}
 if(idx===1){
   for(let k=0;k<9;k++){let x=-2.92+k*.66;paint('zebra-'+k,'paintWhite',x,x+.38,8.12,9.68)}
   for(let z=1;z<17;z+=3.9){if(z>6&&z<11)continue;paint('parking-'+z,'paintWhite',2.15,3.09,z,z+.075);}
   paint('loading-line','paintYellow',-3.03,-2.96,1.2,6.9);
 }else if(idx===2){
   for(let z=1;z<17;z+=4.6){paint('worn-center-'+z,'paintFaded',-.075,.075,z,z+1.5);paint('edge-'+z,'paintFaded',2.87,2.94,z,z+2.6)}
 }
 // Material-specific wear: patches have finite depth, cracks are very thin dark ribbons with branching.
 for(let k=0;k<(idx===2?22:idx===0?7:3);k++){
   const x=(rand()-.5)*5.2,z=1+rand()*16,q=hostRoad(x,z);if(!q||z>7.8&&z<8.9&&x>.55&&x<1.65)continue;
   const w=Math.min(.22+rand()*.43,x-q.x0-.012,q.x1-x-.012),l=Math.min(.22+rand()*.9,z-q.z0-.012,q.z1-z-.012);if(w<.05||l<.05)continue;
   const mat=idx===2?(k%2?'patchOld':'patch'):'patch';
   let p=keep(shell('repair-'+k,mat,'repair-patch',6,6,(u,v)=>{let a=(2*u-1)*w,b=(1-2*v)*l;let xx=x+a*(.9+.1*Math.sin(v*13+k)),zz=z+b*(.94+.06*Math.sin(u*15));return {p:[xx,road(xx,zz)+.002,zz],n:U}},.002));
   relation(p,q,x,z,road(x,z),D,'JUNTA_VISIBLE',[-.015,.015],'Surface repair film');
 }
 if(idx===2)for(let k=0;k<35;k++){
   let x=(rand()-.5)*5.6,z=.6+rand()*16.8,q=hostRoad(x,z);if(!q)continue;
   let pts=[];for(let j=0;j<6;j++){let xx=clamp(x+(rand()-.5)*.24,q.x0+.02,q.x1-.02),zz=clamp(z+j*.09,q.z0+.02,q.z1-.02);pts.push([xx,road(xx,zz)+.002,zz]);}
   if(Math.hypot(pts[0][0]-pts.at(-1)[0],pts[0][2]-pts.at(-1)[2])<.08)continue;
   const p=keep(shell('crack-'+k,'crack','surface-fissure',1,5,(u,v)=>{let j=Math.round(v*5),a=pts[j],xx=clamp(a[0]+(u-.5)*(.008+.012*Math.sin(j*Math.PI/5)),q.x0+.001,q.x1-.001);return {p:[xx,road(xx,a[2])+.003,a[2]],n:U}},.001));
   relation(p,q,pts[2][0],pts[2][2],pts[2][1],D,'JUNTA_VISIBLE',[-.02,.02],'Fissure visual ribbon, not structural simulation');
 }
 return m;
}
export function chain(ids){return ids.map((id,i)=>({model:build(id),translation:[0,0,i*18]}))}
export function audit(m){return inspectAssembly(m)}
