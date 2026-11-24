import * as builder from '../surface-gate/constructor.mjs';
function collection(builder){
 const {shell,sweep,path}=builder, pi=Math.PI, P=(x,y,z)=>[x,y,z], mix=(a,b,t)=>a+(b-a)*t;
 const designs=[
 ["06","MAREA","Cantilever tubular cromado, cojines de cuero coñac"],
 ["07","TELAR","Trama de cuerda entre bastidores de fresno"],
 ["08","DUNA","Monocasco ondulado de contrachapado sobre patines"],
 ["09","NIDO","Sillón envolvente de fieltro con pedestal circular"],
 ["10","PRISMA","Trestles facetados de madera, asiento y respaldo de listones"],
 ["11","ÓRBITA","Silla giratoria de aluminio, estrella de cinco apoyos"],
 ["12","BRUMA","Club chair tapizado, brazos acolchados y costuras"],
 ["13","QUILLA","Mecedora de madera curvada con respaldo de husillos"],
 ["14","VELA","Lona suspendida en bastidor lateral de acero esmaltado"]
 ];
 const models={};
 function build(id){
 const meta=designs.find(d=>d[0]===id);if(!meta)throw Error("Unknown chair "+id);
 const parts=[],protectedFaces=[],joints=[],add=p=>(parts.push(p),p),line=(name,mat,role,pts,a,b=a,sides=24)=>add(sweep(name,mat,role,pts,typeof a==="function"?a:()=>[a,b],sides));
 const curve=(name,mat,role,segments,a,b=a,steps=18,sides=24)=>line(name,mat,role,path(segments,steps),a,b,sides);
 const surface=(name,mat,role,nu,nv,fn,t,protect=true)=>{const p=add(shell(name,mat,role,nu,nv,fn,t));if(protect)protectedFaces.push({name,faceVertices:(nu+1)*(nv+1),residual:Math.min(.004,t*.15)});return p;};
 const tie=(a,b,p,type="hidden socket")=>joints.push({from:a,to:b,point:p,type});
 const saddle=(name,mat,w,d,h,thick,z0=0,bowl=.013)=>surface(name,mat,"seat",40,32,(u,v)=>{const x=2*u-1,z=1-2*v;return {p:[x*w/2*(1-.10*z**8),h+bowl*(x*x+.23*z*z-1),z*d/2+z0],n:[0,1,0]};},thick);
 const back=(name,mat,w,h0,h1,z0,z1,t,wrap=.035)=>surface(name,mat,"backrest",40,32,(u,v)=>{const x=2*u-1;return {p:[x*w/2*(.91+.09*Math.sin(pi*v)),mix(h0,h1,v)-.025*x*x*v,mix(z0,z1,v)+wrap*x*x],n:[0,0,1]};},t);
 const disk=(name,mat,role,y0,y1,r0,r1=r0)=>line(name,mat,role,[P(0,y0,0),P(0,y1,0)],t=>[mix(r0,r1,t),mix(r0,r1,t)],0,72);
 const foot=(name,x,z,mat="rubber",r=.021)=>line(name,mat,"foot",[P(x,0,z),P(x,.018,z)],r,r,32);
 const rail=(name,mat,a,b,r=.019)=>line(name,mat,"rail",[a,b],r);
 const seam=(name,mat,pts,r=.0023)=>line(name,mat,"piping",pts,r,r,10);
 const zig=(a,b,n)=>Array.from({length:n+1},(_,i)=>a.map((v,k)=>mix(v,b[k],i/n)));
 const sides=[-1,1];
 if(id==="06"){
 saddle("cognac-seat","cognac",.50,.48,.475,.067,0,.008);back("cognac-back","cognac",.49,.59,.90,-.225,-.30,.058,.028);
 for(const s of sides){const x=s*.226,L=s<0?"L":"R";
 curve("cantilever-"+L,"chrome","structure",[
 [P(x,.021,-.29),P(x,.021,-.12),P(x,.021,.18),P(x,.027,.24)],
 [P(x,.027,.24),P(x,.04,.31),P(x,.19,.29),P(x,.35,.21)],
 [P(x,.35,.21),P(x,.41,.19),P(x,.412,.06),P(x,.407,-.19)],
 [P(x,.407,-.19),P(x,.42,-.29),P(x,.55,-.31),P(x,.80,-.325)]],.018,.018,20,32);
 for(const z of [-.23,.16])foot("glide-"+L+z,x,z,"rubber",.022);
 rail("seat-bearer-"+L,"chrome",P(x,.414,.18),P(x,.414,-.18),.018);
 tie("cognac-seat","seat-bearer-"+L,P(x,.42,0));
 }
 for(const z of [-.17,.16])rail("crossbar"+z,"chrome",P(-.226,.406,z),P(.226,.406,z),.016);
 rail("back-bearer","chrome",P(-.226,.79,-.325),P(.226,.79,-.325),.019);
 } else if(id==="07"){
 const w=.224,front=.22,rear=-.22,Y=.45;
 for(const s of sides){const x=s*w,L=s<0?"L":"R";
 line("front-ash-"+L,"ash","leg",[P(s*.26,.018,.25),P(x,.23,.235),P(x,.444,front)],t=>[.019+.008*t,.023+.005*t]);
 curve("rear-ash-"+L,"ash","stile",[[P(s*.25,.018,-.28),P(x,.27,-.235),P(x,.45,rear),P(x,.57,-.245)],[P(x,.57,-.245),P(x,.68,-.27),P(x,.80,-.29),P(x,.91,-.31)]],.022,.026);
 rail("seat-side-"+L,"ash",P(x,Y,front),P(x,Y,rear),.024);
 for(const z of [front,rear])foot("ash-glide-"+L+z,s*.25,z>0?.25:-.28,"rubber",.019);
 }
 for(const z of [front,rear])rail("seat-frame-"+z,"ash",P(-w,Y,z),P(w,Y,z),.024);
 for(const y of [.60,.88])rail("back-frame-"+y,"ash",P(-w,y,-.245-(y-.60)*.23),P(w,y,-.245-(y-.60)*.23),.023);
 for(let i=0;i<23;i++){const x=mix(-w+.014,w-.014,i/22);line("seat-warp-"+i,"rope","weave",Array.from({length:49},(_,j)=>{let t=j/48;return P(x,Y+.006-.013*Math.sin(pi*t)+.004*Math.cos(pi*j/2),mix(rear,front,t));}),.0048,.0048,12);}
 for(let j=0;j<25;j++){const z=mix(rear+.011,front-.011,j/24);line("seat-weft-"+j,"ropeDark","weave",Array.from({length:45},(_,i)=>{let t=i/44;return P(mix(-w,w,t),Y+.006-.013*Math.sin(pi*(z-rear)/(front-rear))-.004*Math.cos(pi*i/2+pi*j),z);}),.0047,.0047,12);}
 for(let i=0;i<29;i++){const x=mix(-w+.013,w-.013,i/28);line("back-warp-"+i,"rope","weave",Array.from({length:24},(_,j)=>{let t=j/23;return P(x,mix(.60,.88,t),mix(-.245,-.309,t)+.012*Math.sin(pi*t));}),.0046,.0046,12);}
 for(let j=0;j<14;j++){const t=(j+1)/15;line("back-weft-"+j,"ropeDark","weave",Array.from({length:57},(_,i)=>P(mix(-w,w,i/56),mix(.60,.88,t),mix(-.245,-.309,t)+.012*Math.sin(pi*t)+.004*Math.cos(pi*i/2+pi*j))),.0045,.0045,12);}
 } else if(id==="08"||id==="14"){
 const vela=id==="14",w=vela?.264:.258;
 const seg=vela?[[P(0,.48,.25),P(0,.42,.12),P(0,.40,-.12),P(0,.49,-.24)],[P(0,.49,-.24),P(0,.58,-.32),P(0,.76,-.34),P(0,.91,-.32)]]:[[P(0,.465,.245),P(0,.435,.10),P(0,.431,-.14),P(0,.49,-.23)],[P(0,.49,-.23),P(0,.56,-.30),P(0,.75,-.32),P(0,.91,-.28)]];
 const pts=path(seg,40),center=t=>{const k=Math.min(pts.length-2,Math.floor(t*(pts.length-1)));return pts[k].map((v,i)=>mix(v,pts[k+1][i],t*(pts.length-1)-k));};
 const shape=(u,v)=>{const x=2*u-1,p=center(v),a=center(Math.max(0,v-.008)),b=center(Math.min(1,v+.008)),dy=b[1]-a[1],dz=b[2]-a[2],l=Math.hypot(dy,dz);const n=[0,-dz/l,dy/l];const edge=w*(1-(vela?.10:.16)*Math.sin(pi*v)**2);const lift=(vela?.028:.018)*x*x*Math.sin(pi*v);return {p:[x*edge,p[1]+n[1]*lift,p[2]+n[2]*lift],n};};
 surface(vela?"suspended-canvas":"laminated-ribbon",vela?"canvas":"birch","seat-back",48,80,shape,vela?.012:.035);
 for(const s of sides){const L=s<0?"L":"R",x=s*(w+.004);
 if(vela){
 const edge=Array.from({length:81},(_,i)=>{const p=shape(s<0?0:1,i/80);return [p.p[0]+s*.010,p.p[1]-p.n[1]*.013,p.p[2]-p.n[2]*.013];});
 line("canvas-edge-"+L,"teal","structure",edge,.012,.012,24);
 curve("triangular-frame-"+L,"teal","structure",[[P(x,.012,.25),P(x,.05,.24),P(x,.24,.17),P(x,.46,.10)],[P(x,.46,.10),P(x,.55,.06),P(x,.30,-.20),P(x,.015,-.34)]],.019,.019,22,24);
 rail("floor-tie-"+L,"teal",P(x,.017,-.34),P(x,.017,.25),.019);
 for(const z of [-.33,.24])foot("glide-"+L+z,x,z,"rubber",.023);
 } else {
 curve("sled-"+L,"graphite","structure",[[P(s*.22,.022,-.30),P(s*.22,.022,-.10),P(s*.22,.022,.18),P(s*.22,.03,.26)],[P(s*.22,.03,.26),P(s*.22,.12,.25),P(s*.19,.33,.13),P(s*.17,.416,.11)]],.022,.014,24,28);
 curve("rear-brace-"+L,"graphite","structure",[[P(s*.22,.026,-.24),P(s*.22,.15,-.21),P(s*.19,.32,-.20),P(s*.17,.421,-.15)]],.021,.016);
 for(const z of [-.27,.22])foot("glide-"+L+z,s*.22,z,"rubber",.023);
 }
 }
 for(const z of vela?[-.32,.23]:[-.16,.12])rail("cross-"+z,vela?"teal":"graphite",P(-.22,vela?.024:.408,z),P(.22,vela?.024:.408,z),.014);
 } else if(id==="09"){
 disk("pedestal-disk","bronze","foot",0,.027,.255,.237);disk("pedestal-stem","bronze","structure",.022,.318,.071,.045);disk("mount","graphite","structure",.30,.361,.115,.14);
 saddle("bucket-cushion","moss",.57,.51,.426,.075,.015,.018);
 const wrap=(u,v)=>{const a=mix(-2.02,2.02,u),r=.305+.018*v;return {p:[r*Math.sin(a),.365+v*(.40-.20*(Math.abs(a)/2.02)**2),-.027-r*Math.cos(a)],n:[-Math.sin(a),0,Math.cos(a)]};};
 surface("felt-barrel","felt","backrest",80,40,wrap,.042);
 for(const s of sides){const a=s*2.02;curve("rim-"+s,"felt","arm",[[P(.305*Math.sin(a),.365,-.027-.305*Math.cos(a)),P(.32*Math.sin(a),.42,-.027-.32*Math.cos(a)),P(.326*Math.sin(a),.49,-.027-.326*Math.cos(a)),P(.323*Math.sin(a),.565,-.027-.323*Math.cos(a))]],.019,.016);}
 const top=Array.from({length:81},(_,i)=>wrap(i/80,1).p);seam("bound-upper-edge","mossDark",top,.006);
 disk("under-bucket","graphite","underframe",.345,.366,.205,.23);
 } else if(id==="10"){
 for(const s of sides){const L=s<0?"L":"R";
 const x=s*.21;line("front-trestle-"+L,"walnut","leg",[P(s*.28,.018,.25),P(x,.25,.18),P(s*.16,.414,.09)],.037,.030,8);
 line("rear-trestle-"+L,"walnut","leg",[P(s*.28,.018,-.28),P(x,.22,-.18),P(s*.16,.414,-.09)],.037,.030,8);
 line("back-stile-"+L,"walnut","stile",[P(s*.205,.398,-.18),P(s*.22,.63,-.25),P(s*.205,.88,-.30)],.031,.023,8);
 rail("under-side-"+L,"walnut",P(s*.18,.401,-.21),P(s*.18,.401,.21),.027);
 for(const z of [-.28,.25])foot("pad-"+L+z,s*.28,z,"rubber",.025);
 }
 for(const z of [-.16,.16])rail("tie-"+z,"walnut",P(-.22,.398,z),P(.22,.398,z),.025);
 for(let i=0;i<8;i++){const z=mix(-.205,.205,i/7);surface("seat-slat-"+i,"oak","seat",28,8,(u,v)=>{const x=2*u-1;return{p:[x*.247,.45+.014*x*x,z+(v-.5)*.052],n:[0,1,0]};},.032);}
 for(let i=0;i<5;i++){const y=.61+.059*i;surface("back-slat-"+i,"oak","backrest",28,8,(u,v)=>{const x=2*u-1;return{p:[x*.23,y+(v-.5)*.049,-.23-(y-.61)*.27+.023*x*x],n:[0,0,1]};},.03);}
 } else if(id==="11"){
 disk("swivel-hub","aluminium","structure",.055,.14,.074,.062);disk("gas-column","chrome","structure",.13,.374,.028);disk("height-collar","graphite","structure",.28,.37,.045,.05);disk("seat-mount","aluminium","underframe",.36,.405,.105,.12);
 for(let i=0;i<5;i++){const a=2*pi*i/5,rad=(r,y)=>P(r*Math.cos(a),y,r*Math.sin(a)),q=rad(.29,.029);curve("star-spoke-"+i,"aluminium","structure",[[rad(.04,.092),rad(.12,.09),rad(.24,.06),q]],t=>[.025-.009*t,.022-.007*t],0,20,24);line("rubber-foot-"+i,"rubber","foot",[P(q[0],0,q[2]),P(q[0],.041,q[2])],.024,.024,32);}
 saddle("upholstered-seat","indigo",.51,.48,.47,.065,0,.012);back("flex-back","indigo",.47,.58,.88,-.22,-.29,.038,.034);
 for(const s of sides){const x=s*.13;curve("back-bracket-"+s,"aluminium","structure",[[P(x,.398,-.14),P(x,.40,-.29),P(x,.51,-.34),P(x,.62,-.30)],[P(x,.62,-.30),P(x,.68,-.32),P(x,.74,-.32),P(x,.77,-.303)]],.019,.014,20);}
 rail("adjustment-lever","graphite",P(.06,.374,.01),P(.22,.365,.03),.008);line("lever-knob","rubber","detail",[P(.215,.365,.03),P(.255,.365,.036)],.014,.012);
 } else if(id==="12"){
 const cushion=(name,mat,w,d,h,thick,z=0)=>saddle(name,mat,w,d,h,thick,z,.012);
 cushion("base-upholstery","creamDark",.72,.65,.36,.14,-.02);cushion("loose-seat","cream",.53,.54,.455,.097,.025);
 back("back-body","creamDark",.66,.34,.85,-.30,-.34,.115,.04);back("back-cushion","cream",.52,.49,.81,-.233,-.285,.09,.035);
 for(const s of sides){const x=s*.316,L=s<0?"L":"R";
 for(const z of [-.26,.25]){line("walnut-foot-"+L+z,"walnut","leg",[P(s*.31,.016,z),P(s*.30,.17,z*.92),P(s*.28,.25,z*.90)],t=>[.024+.014*t,.022+.012*t]);foot("felt-glide-"+L+z,s*.31,z,"rubber",.024);}
 surface("arm-panel-"+L,"creamDark","arm",32,28,(u,v)=>{const z=mix(.29,-.30,u);return{p:[x,.25+v*(.34-.05*u),z],n:[s,0,0]};},.105);
 curve("rolled-arm-"+L,"cream","arm",[[P(x,.535,.27),P(x,.60,.15),P(x,.61,-.13),P(x,.64,-.30)]],.058,.062,32,36);
 seam("arm-piping-"+L,"thread",Array.from({length:41},(_,i)=>P(x+s*.047,.535+.105*i/40,mix(.27,-.30,i/40))),.003);
 }
 for(const z of [-.226,.276])seam("seat-seam-"+z,"thread",Array.from({length:41},(_,i)=>P(mix(-.234,.234,i/40),.444+.007*((i-20)/20)**2,z)),.002);
 } else if(id==="13"){
 for(const s of sides){const x=s*.245,L=s<0?"L":"R";
 const run=Array.from({length:81},(_,i)=>{const z=mix(-.43,.43,i/80);return P(x,.019+.15*(z/.43)**2,z);});line("rocker-"+L,"cherry","foot",run,.025,.019,32);
 for(const z of [-.21,.21])line("leg-"+L+z,"cherry","leg",[P(x,.051+.15*(z/.43)**2,z),P(s*.225,.23,z*.88),P(s*.195,.398,z*.84)],t=>[.022+.005*t,.021+.006*t]);
 curve("rear-stile-"+L,"cherry","stile",[[P(s*.20,.40,-.18),P(s*.23,.59,-.25),P(s*.25,.78,-.34),P(s*.22,.99,-.36)]],.024,.022,28);
 rail("side-stretcher-"+L,"cherry",P(s*.23,.22,-.19),P(s*.23,.22,.19),.019);
 curve("armrest-"+L,"cherry","arm",[[P(s*.23,.67,-.27),P(s*.28,.65,-.11),P(s*.30,.64,.13),P(s*.29,.66,.24)]],.030,.021,24);
 line("arm-support-"+L,"cherry","structure",[P(s*.20,.41,.16),P(s*.27,.55,.17),P(s*.29,.65,.18)],.019,.019);
 }
 saddle("sculpted-seat","cherry",.55,.50,.45,.065,0,.021);
 for(let i=0;i<9;i++){const x=mix(-.18,.18,i/8);curve("turned-spindle-"+i,"cherry","backrest",[[P(x,.411,-.19),P(x,.55,-.25),P(x*.95,.80,-.32),P(x,.955-.035*(x/.18)**2,-.35)]],t=>[.011+.006*Math.sin(pi*t)**2,.011+.006*Math.sin(pi*t)**2],0,24,24);}
 curve("crest-rail","cherry","backrest",[[P(-.23,.95,-.36),P(-.10,1.015,-.37),P(.10,1.015,-.37),P(.23,.95,-.36)]],.029,.036,32);
 for(const z of [-.22,.21])rail("rocker-cross-"+z,"cherry",P(-.245,.075,z),P(.245,.075,z),.022);
 }
 return {id:"chair-"+id,name:meta[1]+" "+id,description:meta[2],units:"metre",unit:"metre",parts,joints,protectedFaces};
 }
 for(const d of designs)models[d[0]]=()=>build(d[0]);
 return {designs,models,build};
}
const collectionAPI=collection(builder);export const designs=collectionAPI.designs, models=collectionAPI.models, build=collectionAPI.build;
