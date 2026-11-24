import {shell,sweep,path,meshAnchor,inspectAssembly} from 'https://cdn.jsdelivr.net/gh/JuanManuelPM/Experimentos@6ebdfe30fde33e3a570f683ac3bb93cfecfb38a3/prometeo/asset-lab/surface-gate/constructor.mjs';
import {surfaceGate} from 'https://cdn.jsdelivr.net/gh/JuanManuelPM/Experimentos@6ebdfe30fde33e3a570f683ac3bb93cfecfb38a3/prometeo/asset-lab/surface-gate/surface-gate.mjs';
export const catalog=[
{id:'01',name:'NERVIO',desc:'Interior · roble claro, junquillos verticales, latón satinado',w:.82,h:2.04,t:.044,frame:'oak',body:'oak',metal:'brass',hinges:3},
{id:'02',name:'BASTIÓN',desc:'Exterior · bastidor de acero, nogal profundo, cerradura multipunto',w:.96,h:2.15,t:.068,frame:'graphite',body:'walnut',metal:'steel',hinges:4},
{id:'03',name:'REMACHE',desc:'Taller antiguo · tablones envejecidos, flejes y pernos de hierro',w:1.08,h:2.12,t:.058,frame:'iron',body:'aged',metal:'iron',hinges:3}];
const X=[1,0,0],Y=[0,1,0],Z=[0,0,1],neg=a=>a.map(x=>-x);
export function buildDoor(id){
 const d=catalog.find(x=>x.id===id);if(!d)throw Error('Unknown door '+id);
 const {w,h,t}=d,L=.012,R=L+w,J=R+.012,B=.016,T=B+h,F=.052,K=F-t,P=[.006,0,.091];
 const m={...d,units:'m',pivot:P,axis:Y,maxAngle:105,parts:[],roots:['jamb-L'],independent:[],relations:[],protectedFaces:[],moving:[],anchors:{wall:[],hinge:[]}};
 const add=(p,moving=false)=>{m.parts.push(p);if(moving)m.moving.push(p.name);return p};
 const box=(name,mat,x0,x1,y0,y1,z0,z1,moving=false,detail=1)=>add(shell(name,mat,'solid',detail,detail,(u,v)=>({p:[x0+(x1-x0)*u,y0+(y1-y0)*v,z1],n:Z}),z1-z0),moving);
 const tube=(name,mat,a,b,r,moving=false,r2=r)=>add(sweep(name,mat,'hardware',[a,b],()=>[r,r2],32),moving);
 const curved=(name,mat,segments,r,moving)=>add(sweep(name,mat,'hardware',path(segments,12),()=>[r,r],24),moving);
 const join=(g,a,axis,seed,min=-.001,max=.001,type='CONTACTO',reason='')=>{const ha=meshAnchor(a,seed,axis,'entry',.25),ga=meshAnchor(g,seed,axis,'exit',.25);m.relations.push({id:g.name+'→'+a.name,guest:g.name,host:a.name,type,min,max,probes:[{seed:ha?.point||seed,axis,reach:.25}],reason});return {host:ha?.point,guest:ga?.point};};
 const mount=(g,a,axis,seed,reason='Fijación visible intencional')=>join(g,a,axis,seed,-.025,.001,'JUNTA_VISIBLE',reason);
 const front=(g,a,x,y,z=F)=>mount(g,a,neg(Z),[x,y,z]);
 const back=(g,a,x,y,z=K)=>mount(g,a,Z,[x,y,z]);
 const jl=box('jamb-L',d.frame,-.075,0,0,T+.082,-.09,.074),jr=box('jamb-R',d.frame,J,J+.075,0,T+.082,-.09,.074),head=box('head',d.frame,0,J,T+.012,T+.082,-.09,.074);
 join(head,jl,neg(X),[0,T+.04,0]);join(head,jr,X,[J,T+.04,0]);
 const sill=box('threshold',d.id==='01'?'brass':'steel',0,J,0,.006,-.085,.078);
 join(sill,jl,neg(X),[0,.003,0]);join(sill,jr,X,[J,.003,0]);
 for(let i=0;i<3;i++){const y=.28+i*(h-.55)/2;for(const side of ['L','R']){const x=side==='L'?-.075:J+.075,sg=side==='L'?-1:1;const p=tube('wall-anchor-'+side+i,'steel',[x,y,-.035],[x+sg*.065,y,-.035],.006);mount(p,side==='L'?jl:jr,[-sg,0,0],[x,y,-.035]);m.anchors.wall.push({part:p.name,point:[x+sg*.065,y,-.035],normal:[sg,0,0]});}}
 // Stops behind the leaf. Their inner faces leave a 4 mm closed clearance.
 const stopZ=K-.004;
 for(const [key,x0,x1,host,axis] of [['L',0,.027,jl,neg(X)],['R',J-.027,J,jr,X]]){
 const s=box('stop-'+key,d.frame,x0,x1,.007,T+.012,stopZ-.025,stopZ);join(s,host,axis,[key==='L'?0:J,.8,stopZ-.01]);
 const seal=box('seal-'+key,'rubber',x0+.002,x1-.002,.012,T+.009,stopZ,stopZ+.002);join(seal,s,neg(Z),[(x0+x1)/2,.8,stopZ]);}
 const top=box('stop-head',d.frame,.027,J-.027,T-.008,T+.012,stopZ-.025,stopZ);join(top,head,Y,[J/2,T+.012,stopZ-.01]);
 const leaf=box('leaf-core',d.body,L,R,B,T,K,F,true,12);
 // Functional hinge with alternate fixed/moving knuckles; each shares one real vertical axis.
 for(let i=0;i<d.hinges;i++){
 const y=B+.20+i*(h-.40)/(d.hinges-1),a=P[0],z=P[2],r=.009,half=.045;
 const fixed=box('hinge-fixed-'+i,d.metal,-.042,a+r*.7,y-half,y+half,.071,z+.003);
 const moving=box('hinge-leaf-'+i,d.metal,a-r*.7,.064,y-half,y+half,F-.001,z-.006,true);
 front(fixed,jl,-.024,y,.074);front(moving,leaf,.035,y,F);
 // Barrel rings have open bore (nearly full revolution with 0.06 degree seam).
 const ring=(name,y0,y1,move)=>add(shell(name,d.metal,'hinge sleeve',48,2,(u,v)=>{const q=(u*2-1)*(Math.PI-.0005);return {p:[a+r*Math.cos(q),y0+(y1-y0)*v,z+r*Math.sin(q)],n:[Math.cos(q),0,Math.sin(q)]}},.0035),move);
 const lo=ring('hinge-lower-'+i,y-.043,y-.016,false),mid=ring('hinge-moving-'+i,y-.014,y+.014,true),hi=ring('hinge-upper-'+i,y+.016,y+.043,false);
 // Plates and barrels contact on rear radial band; use actual mesh probes from front toward back.
 for(const [p,plate,yy] of [[lo,fixed,y-.03],[hi,fixed,y+.03],[mid,moving,y]]){
  // visible mechanical attachment with local overlap at rear rim, probe along x
  mount(p,plate,p===mid?X:neg(X),[a,yy,z-.007]);
 }
 join(lo,mid,Y,[a+.007,y-.015,z],.0015,.0025,'ARTICULACION','Holgura axial de 2 mm entre casquillos coaxiales');
 join(mid,hi,Y,[a+.007,y+.015,z],.0015,.0025,'ARTICULACION','Holgura axial de 2 mm entre casquillos coaxiales');
 const pin=tube('hinge-pin-'+i,d.metal,[a,y-.049,z],[a,y+.049,z],.0053);
 const cap=tube('hinge-cap-'+i,d.metal,[a,y+.043,z],[a,y+.052,z],.011);
 join(pin,cap,Y,[a,y+.047,z],-.007,-.004,'ENCASTRE');
 join(cap,hi,neg(Y),[a+.007,y+.043,z],-.001,.001);
 m.anchors.hinge.push({point:[a,y,z],axis:Y,fixed:fixed.name,moving:moving.name,knuckle:mid.name});
 for(const yy of [y-.029,y+.029])for(const [x,plate,move,zz] of [[-.025,fixed,false,z+.003],[.045,moving,true,z-.006]]){
 const s=tube('hinge-screw-'+i+'-'+yy+'-'+x,'steel',[x,yy,zz-.004],[x,yy,zz+.0015],.004,move);front(s,plate,x,yy,zz);}
 }
 const plateX=R-.095,hy=1.04;
 // Lock body is represented as surface escutcheon and edge faceplate; latch is retracted for swing.
 const edge=box('lock-faceplate',d.metal,R-.003,R,hy-.104,hy+.10,K+.004,F-.004,true);mount(edge,leaf,neg(X),[R,hy,(F+K)/2]);
 const bolt=box('retracted-latch','steel',R-.002,R+.001,hy+.025,hy+.046,K+.011,F-.011,true);mount(bolt,edge,neg(X),[R,hy+.035,(F+K)/2]);
 const strike=box('strike','steel',J,J+.003,hy-.077,hy+.078,K+.003,F-.003);mount(strike,jr,X,[J,hy,(F+K)/2]);
 for(const side of [1,-1]){
 const z=side===1?F:K,sg=side;
 const rose=tube('rose-'+side,d.metal,[plateX,hy,z-sg*.001],[plateX,hy,z+sg*.009],.032,true);
 (side===1?front:back)(rose,leaf,plateX,hy,z);
 const handle=curved('lever-'+side,d.metal,[[[plateX,hy,z+sg*.008],[plateX,hy,z+sg*.038],[plateX-.015,hy,z+sg*.057],[plateX-.04,hy,z+sg*.057]],[[plateX-.04,hy,z+sg*.057],[plateX-.07,hy,z+sg*.057],[plateX-.10,hy,z+sg*.055],[plateX-.112,hy,z+sg*.052]]],.011,true);
 mount(handle,rose,[0,0,-sg],[plateX,hy,z+sg*.009]);
 const lock=tube('cylinder-'+side,'steel',[plateX,hy-.075,z-sg*.001],[plateX,hy-.075,z+sg*.006],.012,true);(side===1?front:back)(lock,leaf,plateX,hy-.075,z);
 const slot=box('key-slot-'+side,'rubber',plateX-.0018,plateX+.0018,hy-.081,hy-.069,z+sg*.006-.0005,z+sg*.006+.0005,true);mount(slot,lock,[0,0,-sg],[plateX,hy-.075,z+sg*.006]);
 }
 const applied=(name,mat,x0,x1,y0,y1,depth,side=1,protect=false)=>{
 const z=side===1?F:K;const p=box(name,mat,x0,x1,y0,y1,side===1?z-.001:z-depth,side===1?z+depth:z+.001,true,protect?6:1);
 (side===1?front:back)(p,leaf,(x0+x1)/2,(y0+y1)/2,z);
 if(protect&&side===1)m.protectedFaces.push({name,faceVertices:49,residual:.001});return p;};
 if(id==='01'){
 for(let i=0;i<13;i++){const x=L+.077+i*.037;applied('oak-flute-'+i,i%3===0?'oakDark':'oak',x,x+.026,B+.10,T-.10,.004,1,true);}
 applied('lower-inlay','brass',L+.065,R-.16,B+.087,B+.092,.002);
 applied('upper-inlay','brass',L+.065,R-.16,T-.092,T-.087,.002);
 }else if(id==='02'){
 for(const side of [1,-1]){
 for(const [key,x0,x1] of [['left',L+.035,L+.105],['right',R-.105,R-.035]])applied('stile-'+side+key,'graphite',x0,x1,B+.04,T-.04,.008,side);
 for(let i=0;i<3;i++){const y=B+.075+i*(h-.15)/2;applied('rail-'+side+i,'graphite',L+.106,R-.106,y-.024,y+.024,.008,side);}
 for(let i=0;i<2;i++){const y0=B+.105+i*(h-.15)/2,y1=y0+(h-.15)/2-.065;applied('raised-panel-'+side+i,'walnut',L+.125,R-.175,y0,y1,.007,side,side===1);}
 }
 for(const y of [.31,1.81]){const b=box('multipoint-'+y,'steel',R-.003,R+.001,y-.013,y+.013,K+.008,F-.008,true);mount(b,leaf,neg(X),[R,y,(K+F)/2]);}
 }else{
 for(let i=0;i<9;i++){const x=L+.072+i*(w-.144)/9;applied('aged-plank-'+i,i%3===0?'agedDark':'aged',x,x+(w-.144)/9-.003,B+.065,T-.065,.008,1);}
 for(const y of [B+.24,T-.24]){
 const strap=applied('iron-strap-'+y,'iron',L+.055,R-.055,y-.024,y+.024,.014,1);
 for(let i=0;i<8;i++){const x=L+.086+i*(w-.172)/7;const p=tube('rivet-'+y+'-'+i,'iron',[x,y,F+.013],[x,y,F+.019],.007,true);front(p,strap,x,y,F+.014);}
 }
 const brace=curved('back-diagonal','iron',[[[L+.09,B+.15,K-.007],[L+.36,B+.7,K-.007],[R-.36,T-.7,K-.007],[R-.09,T-.15,K-.007]]],.014,true);
 back(brace,leaf,(L+R)/2,(B+T)/2,K);
 }
 return m;
}
export function posePoint(model,p,degrees){const a=-degrees*Math.PI/180,c=Math.cos(a),s=Math.sin(a),[x,,z]=model.pivot;return [x+c*(p[0]-x)+s*(p[2]-z),p[1],z-s*(p[0]-x)+c*(p[2]-z)];}
export function diagnose(model){return inspectAssembly(model,{gate:surfaceGate});}
export function bounds(p){const lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];for(let i=0;i<p.positions.length;i++){let k=i%3;lo[k]=Math.min(lo[k],p.positions[i]);hi[k]=Math.max(hi[k],p.positions[i]);}return {lo,hi};}
// Conservative horizontal OBB swept against frame and non-hinge hardware, 1 degree samples.
export function sweepCheck(m){const moving=new Set(m.moving),fixed=m.parts.filter(p=>!moving.has(p.name)&&!p.name.startsWith('hinge')&&!p.name.startsWith('wall-anchor')),mobile=m.parts.filter(p=>moving.has(p.name)&&!p.name.startsWith('hinge'));const hits=[];
 for(let a=0;a<=m.maxAngle;a++){const q=a*Math.PI/180,axes=[[1,0],[0,1],[Math.cos(q),Math.sin(q)],[-Math.sin(q),Math.cos(q)]];
 for(const p of mobile){const b=bounds(p),corners=[[b.lo[0],0,b.lo[2]],[b.hi[0],0,b.lo[2]],[b.hi[0],0,b.hi[2]],[b.lo[0],0,b.hi[2]]].map(v=>posePoint(m,v,a));
 for(const f of fixed){const k=bounds(f);if(Math.min(b.hi[1],k.hi[1])-Math.max(b.lo[1],k.lo[1])<=.0001)continue;const fc=[[k.lo[0],0,k.lo[2]],[k.hi[0],0,k.lo[2]],[k.hi[0],0,k.hi[2]],[k.lo[0],0,k.hi[2]]];if(axes.every(ax=>{const x=corners.map(v=>v[0]*ax[0]+v[2]*ax[1]),y=fc.map(v=>v[0]*ax[0]+v[2]*ax[1]);return Math.min(Math.max(...x),Math.max(...y))-Math.max(Math.min(...x),Math.min(...y))>.0002;}))hits.push({a,moving:p.name,fixed:f.name});}
 }}return {samples:m.maxAngle+1,hits:hits.slice(0,20),count:hits.length,status:hits.length?'FAIL_CONSERVATIVE':'PASS_SAMPLED_OBB'};}
