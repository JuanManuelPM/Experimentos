/* PROMETEO Ventilador Explicado V4 · source derivative (MIT). Native WebGL 3D scene, zero network dependencies. MIT. */
(()=>{'use strict';
const canvas=document.getElementById('stage'),gl=canvas.getContext('webgl2',{antialias:true,alpha:false,preserveDrawingBuffer:true});
if(!gl){document.getElementById('error').style.display='flex';return}
const AT=window.AssemblyKit,TAU=Math.PI*2, CY=2.6;
// Source of names, stage decomposition and offsets is a separate scene-specific configuration.
const partData=(window.FAN_PARTS||[]).map(p=>[p.id,p.name,p.short,p.explode]);
if(!partData.length)throw Error('parts.js no cargado');
const parts=partData.map(([id,name,short,explode])=>({id,name,short,explode}));
const model=AT.createPresenter({parts,assemblyOrder:["base-pad","base","control","neck","motor","stator","rotor","bearing","shaft","gearbox","rear-cap","rear-guard","blades","hub-cap","front-guard","latches"]});
const material={body:[.18,.43,.40],base:[.20,.28,.30],dark:[.13,.18,.21],guard:[.74,.79,.77],silver:[.79,.83,.82],copper:[.90,.52,.30],blue:[.29,.67,.66],cream:[.91,.85,.68],accent:[.99,.69,.33],floor:[.28,.32,.33],magnet:[.30,.49,.55]};
const v3=(x=0,y=0,z=0)=>[x,y,z],sub=(a,b)=>a.map((v,i)=>v-b[i]),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],normal=a=>{let n=Math.hypot(...a)||1;return a.map(v=>v/n)};
const meshes=[];
function geom(){return {verts:[],norms:[]}}
function tri(g,a,b,c){let n=normal(cross(sub(b,a),sub(c,a)));for(let p of [a,b,c]){g.verts.push(...p);g.norms.push(...n)}}
function quad(g,a,b,c,d){tri(g,a,b,c);tri(g,a,c,d)}
function param(g,nu,nv,fn,flip=false,periodic=true){const sample=(u,v)=>fn(periodic?(u%1+1)%1:Math.max(0,Math.min(1,u)),Math.max(0,Math.min(1,v)));const norm=(u,v)=>{const n=cross(sub(sample(u+.0002,v),sample(u-.0002,v)),sub(sample(u,v+.0002),sample(u,v-.0002)));return Math.hypot(...n)>1e-10?normal(n).map(x=>flip?-x:x):null};for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){let uv=[[i/nu,j/nv],[(i+1)/nu,j/nv],[(i+1)/nu,(j+1)/nv],[i/nu,(j+1)/nv]],ps=uv.map(([u,v])=>fn(u,v)),ns=uv.map(([u,v])=>norm(u,v));for(let ids of [[0,1,2],[0,2,3]]){if(flip)ids.reverse();let [a,b,c]=ids,f=normal(cross(sub(ps[b],ps[a]),sub(ps[c],ps[a])));for(let k of ids){g.verts.push(...ps[k]);g.norms.push(...(ns[k]||f))}}}}
function revolved(g,profile,n=64){for(let j=0;j<profile.length-1;j++){let [r,z]=profile[j],[R,Z]=profile[j+1],dr=R-r,dz=Z-z;for(let i=0;i<n;i++){let a=i*TAU/n,b=(i+1)*TAU/n;const P=(r,z,a)=>[r*Math.cos(a),CY+r*Math.sin(a),z],N=a=>normal([dz*Math.cos(a),dz*Math.sin(a),-dr]);let pts=[P(r,z,a),P(r,z,b),P(R,Z,b),P(R,Z,a)],ns=[N(a),N(b),N(b),N(a)];for(let k of [0,1,2,0,2,3]){g.verts.push(...pts[k]);g.norms.push(...ns[k])}}}}
function arcMagnet(g,t){const P=(r,a,z)=>[r*Math.cos(a),CY+r*Math.sin(a),z];for(let i=0;i<24;i++){let a=t-.76+1.52*i/24,b=t-.76+1.52*(i+1)/24;for(let [r,z,R,Z] of [[.263,-.74,.263,-.37],[.193,-.37,.193,-.74],[.193,-.74,.263,-.74],[.263,-.37,.193,-.37]])quad(g,P(r,a,z),P(r,b,z),P(R,b,Z),P(R,a,Z))}for(let a of [t-.76,t+.76])quad(g,P(.193,a,-.74),P(.263,a,-.74),P(.263,a,-.37),P(.193,a,-.37))}
function gear(g,x,y,z,r,teeth,w){const rad=i=>r*(i%4===1||i%4===2?1:.83),P=(i,z0)=>[x+rad(i)*Math.cos(i*TAU/(teeth*4)),y+rad(i)*Math.sin(i*TAU/(teeth*4)),z0];for(let i=0;i<teeth*4;i++){let j=i+1;quad(g,P(i,z-w/2),P(j,z-w/2),P(j,z+w/2),P(i,z+w/2));tri(g,[x,y,z+w/2],P(i,z+w/2),P(j,z+w/2));tri(g,[x,y,z-w/2],P(j,z-w/2),P(i,z-w/2))}}
function cylinder(g,a,b,r,n=16,r2=r){let dir=normal(sub(b,a)),seed=Math.abs(dir[1])<.89?[0,1,0]:[1,0,0],u=normal(cross(dir,seed)),v=cross(dir,u);
const p=(center,R,t)=>center.map((x,i)=>x+R*(u[i]*Math.cos(t)+v[i]*Math.sin(t)));
for(let i=0;i<n;i++){let t=i*TAU/n,q=(i+1)*TAU/n,A=p(a,r,t),B=p(a,r,q),C=p(b,r2,q),D=p(b,r2,t);quad(g,A,B,C,D);tri(g,a,B,A);tri(g,b,D,C)}}
function tube(g,points,r=.016){for(let i=0;i<points.length-1;i++)cylinder(g,points[i],points[i+1],r,8)}
function ellipsoid(g,c,rad,na=28,nb=14){param(g,na,nb,(u,v)=>{let a=u*TAU,p=v*Math.PI;return [c[0]+rad[0]*Math.sin(p)*Math.cos(a),c[1]+rad[1]*Math.cos(p),c[2]+rad[2]*Math.sin(p)*Math.sin(a)]})}
function torus(g,c,R,r=.014,plane='xy',n=72,m=8){param(g,n,m,(u,v)=>{let a=u*TAU,b=v*TAU,q=R+r*Math.cos(b),c0=r*Math.sin(b);return plane==='xy'?[c[0]+q*Math.cos(a),c[1]+q*Math.sin(a),c[2]+c0]:[c[0]+q*Math.cos(a),c[1]+c0,c[2]+q*Math.sin(a)]})}
function box(g,c,sz){let [x,y,z]=c,[a,b,d]=sz.map(v=>v/2),p=[[-a,-b,-d],[a,-b,-d],[a,b,-d],[-a,b,-d],[-a,-b,d],[a,-b,d],[a,b,d],[-a,b,d]].map(q=>[x+q[0],y+q[1],z+q[2]]);for(const [i,j,k,l] of [[0,1,2,3],[4,7,6,5],[0,4,5,1],[3,2,6,7],[0,3,7,4],[1,5,6,2]])quad(g,p[i],p[j],p[k],p[l])}
function blade(g,a){const a0=a,twist=.30;
const P=(u,v,s)=>{let t=.13+.87*u,r=.18+.78*u;let ang=a0+twist*(1-u),width=.34*Math.pow(Math.sin(Math.PI*Math.pow(u,.78)),.70)+.018;let tang=v*width;let x=r*Math.cos(ang)-tang*Math.sin(ang),y=CY+r*Math.sin(ang)+tang*Math.cos(ang),z=.19+.105*v*(1-.65*u)+.035*Math.sin(u*Math.PI)+s*.012;return [x,y,z]};
param(g,32,12,(u,v)=>P(u,v*2-1,1),false,false);param(g,32,12,(u,v)=>P(u,v*2-1,-1),true,false);for(let u of [0,1])quad(g,P(u,-1,-1),P(u,1,-1),P(u,1,1),P(u,-1,1));for(let i=0;i<32;i++){let u=i/32,j=(i+1)/32;quad(g,P(u,-1,-1),P(j,-1,-1),P(j,-1,1),P(u,-1,1));quad(g,P(u,1,-1),P(u,1,1),P(j,1,1),P(j,1,-1))}}
const gstore=[];
function add(id,mt,build,{spin=false,alpha=1,group=id,metal=0}={}){let g=geom();build(g);if(!g.verts.length)return;let vv=new Float32Array(g.verts),nn=new Float32Array(g.norms),vb=gl.createBuffer(),nb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bufferData(gl.ARRAY_BUFFER,vv,gl.STATIC_DRAW);gl.bindBuffer(gl.ARRAY_BUFFER,nb);gl.bufferData(gl.ARRAY_BUFFER,nn,gl.STATIC_DRAW);meshes.push({part:id,group,color:material[mt],metal,spin,alpha,vb,nb,count:vv.length/3});const bounds=[[Infinity,Infinity,Infinity],[-Infinity,-Infinity,-Infinity]];for(let j=0;j<vv.length;j++){let k=j%3;bounds[0][k]=Math.min(bounds[0][k],vv[j]);bounds[1][k]=Math.max(bounds[1][k],vv[j])}gstore.push({part:id,triangles:vv.length/9,bounds})}
// Machined base, discrete rubber plate and selector.
add('base','body',g=>ellipsoid(g,[0,.175,-.26],[.83,.15,.64],64,22));
add('base','silver',g=>torus(g,[0,.15,-.26],.70,.012,'xz'),{metal:.53});
add('base-pad','dark',g=>ellipsoid(g,[0,.055,-.26],[.70,.055,.53],48,16));
for(let x of [-.42,.42])for(let z of [-.56,.04])add('base-pad','dark',g=>cylinder(g,[x,.008,z],[x,.054,z],.10,24));
add('control','dark',g=>cylinder(g,[0,.27,.03],[0,.36,.03],.105,40));
add('control','silver',g=>torus(g,[0,.365,.03],.092,.011,'xz'),{metal:.7});
add('control','cream',g=>box(g,[0,.373,.082],[.019,.012,.066]));
for(let i=0;i<16;i++){let a=i*TAU/16;add('control','dark',g=>cylinder(g,[.104*Math.cos(a),.29,.03+.104*Math.sin(a)],[.104*Math.cos(a),.35,.03+.104*Math.sin(a)],.005,6))}
add('neck','silver',g=>cylinder(g,[0,.30,-.35],[0,2.15,-.35],.102,40,.073),{metal:.73});
add('neck','body',g=>cylinder(g,[0,.31,-.35],[0,.65,-.35],.17,40,.115));
add('neck','dark',g=>cylinder(g,[0,1.05,-.35],[0,1.16,-.35],.115,32));
add('neck','body',g=>ellipsoid(g,[0,2.19,-.41],[.25,.23,.22],40,22));
add('neck','silver',g=>cylinder(g,[-.29,2.17,-.39],[.29,2.17,-.39],.070,24),{metal:.7});
// Hollow cylindrical wall with returned edges, no solid occluding motor insert.
add('motor','body',g=>revolved(g,[[.28,-.89],[.34,-.86],[.375,-.79],[.375,-.40],[.415,-.35],[.415,-.31],[.314,-.31],[.314,-.37],[.329,-.42],[.329,-.78],[.28,-.84],[.28,-.89]]));
add('motor','silver',g=>revolved(g,[[.33,-.39],[.434,-.38],[.434,-.33],[.33,-.33],[.33,-.39]]),{metal:.68});
for(let i=0;i<20;i++){let a=i*TAU/20;add('motor','body',g=>tube(g,[[.373*Math.cos(a),CY+.373*Math.sin(a),-.77],[.386*Math.cos(a),CY+.386*Math.sin(a),-.69],[.386*Math.cos(a),CY+.386*Math.sin(a),-.45]],.013))}
add('rear-cap','body',g=>revolved(g,[[.04,-1.04],[.18,-1.04],[.28,-1.015],[.34,-.96],[.354,-.88],[.318,-.88],[.307,-.947],[.25,-.98],[.15,-1.008],[.04,-1.008],[.04,-1.04]]));
add('rear-cap','silver',g=>torus(g,[0,CY,-.982],.25,.013),{metal:.66});
add('rear-cap','dark',g=>cylinder(g,[0,CY+.155,-1.09],[0,CY+.155,-1.025],.065,28));
for(let i=0;i<8;i++){let a=i*TAU/8;add('rear-cap','dark',g=>cylinder(g,[.22*Math.cos(a),CY+.22*Math.sin(a),-1.016],[.22*Math.cos(a),CY+.22*Math.sin(a),-1.023],.018,16))}
add('gearbox','silver',g=>revolved(g,[[.04,-.96],[.26,-.96],[.26,-.84],[.235,-.84],[.235,-.93],[.04,-.93],[.04,-.96]]),{metal:.4});
add('gearbox','cream',g=>gear(g,0,CY+.10,-.895,.115,12,.045));
add('gearbox','copper',g=>gear(g,0,CY-.08,-.895,.092,10,.045),{metal:.38});
add('gearbox','silver',g=>tube(g,[[0,CY+.1,-.92],[.065,CY+.16,-.92],[.12,CY+.20,-.92]],.018),{metal:.6});
// DC schematic: pole arcs; laminated rotor, visible loop windings, segmented commutator.
add('stator','magnet',g=>{arcMagnet(g,0);arcMagnet(g,Math.PI)},{metal:.22});
add('stator','silver',g=>revolved(g,[[.292,-.77],[.311,-.77],[.311,-.36],[.292,-.36],[.292,-.77]]),{metal:.66});
add('rotor','dark',g=>cylinder(g,[0,CY,-.74],[0,CY,-.37],.115,40),{spin:true,metal:.45});
for(let j=0;j<15;j++)add('rotor','silver',g=>revolved(g,[[.08,-.735+j*.024],[.136,-.735+j*.024],[.136,-.725+j*.024],[.08,-.725+j*.024],[.08,-.735+j*.024]]),{spin:true,metal:.6});
for(let i=0;i<3;i++){let a=i*TAU/3,point=(r,t,z)=>[r*Math.cos(t),CY+r*Math.sin(t),z];for(let j=0;j<5;j++){const r=.148+j*.006,d=.23+j*.023;add('rotor','copper',g=>tube(g,[point(r,a-d,-.69),point(r,a-d,-.41),point(r,a,-.36+j*.004),point(r,a+d,-.41),point(r,a+d,-.69),point(r,a,-.75+j*.004),point(r,a-d,-.69)],.0065),{spin:true,metal:.61})}}
add('rotor','dark',g=>cylinder(g,[0,CY,-.35],[0,CY,-.27],.09,32),{spin:true});
for(let i=0;i<12;i++){let a=i*TAU/12;add('rotor','copper',g=>tube(g,[[.091*Math.cos(a),CY+.091*Math.sin(a),-.349],[.091*Math.cos(a),CY+.091*Math.sin(a),-.272]],.012),{spin:true,metal:.7})}
for(let a of [0,Math.PI])add('stator','dark',g=>box(g,[.12*Math.cos(a),CY+.12*Math.sin(a),-.30],[.09,.05,.067]));
add('bearing','silver',g=>{for(let z of [-.79,-.32])revolved(g,[[.060,z-.025],[.119,z-.025],[.119,z+.025],[.060,z+.025],[.060,z-.025]])},{metal:.82});
add('bearing','dark',g=>{for(let z of [-.79,-.32])torus(g,[0,CY,z],.090,.013)},{metal:.25});
add('shaft','silver',g=>cylinder(g,[0,CY,-.83],[0,CY,.38],.056,40),{spin:true,metal:.78});
for(let j=0;j<8;j++)add('shaft','silver',g=>torus(g,[0,CY,.255+j*.010],.061,.003),{spin:true,metal:.8});

// V2: genuinely spatial guard. A rear cradle with axial staves and front hoop; not two disconnected flat discs.
const cage={radius:1.18,outer:1.205,rearZ:-.23,frontZ:.615,bladeMaxRadius:.961,bladeMinZ:.073,bladeMaxZ:.315};
add('rear-guard','body',g=>cylinder(g,[0,CY,-.255],[0,CY,-.115],.24,44));
add('rear-guard','guard',g=>{
 for(let r of [.23,.46,.72,.96,1.18])torus(g,[0,CY,-.115-.115*(r/1.18)],r,r===1.18?.034:.012);
 for(let j=0;j<36;j++){let a=j*TAU/36;
  const pos=r=>[r*Math.cos(a),CY+r*Math.sin(a),-.115-.115*(r/1.18)];
  tube(g,[pos(.23),pos(.46),pos(.72),pos(.96),pos(1.18)],.011);
 }
 // Side-wall arched staves make a continuous 3D enclosure, allowing the blades to remain visible.
 for(let j=0;j<24;j++){let a=j*TAU/24,c=Math.cos(a),sn=Math.sin(a);
  tube(g,[[1.18*c,CY+1.18*sn,-.23],[1.205*c,CY+1.205*sn,-.09],[1.205*c,CY+1.205*sn,.19],[1.205*c,CY+1.205*sn,.43],[1.18*c,CY+1.18*sn,.615]],.018);
 }
 for(const z of [-.23,.02,.43,.615])torus(g,[0,CY,z],z===.615?1.18:1.205,z===.615?.035:.022);
},{metal:.22});
add('rear-guard','dark',g=>torus(g,[0,CY,-.238],1.205,.018),{metal:.14});
add('motor','dark',g=>torus(g,[0,CY,-.313],.43,.015),{metal:.20});
for(let k=0;k<4;k++){let a=(k+.5)*TAU/4;add('motor','silver',g=>cylinder(g,[.385*Math.cos(a),CY+.385*Math.sin(a),-.331],[.385*Math.cos(a),CY+.385*Math.sin(a),-.284],.026,12),{metal:.72})}
add('neck','body',g=>tube(g,[[0,2.18,-.405],[0,2.29,-.46],[0,2.37,-.57]],.09));
// Trimmed five-skin swept impeller; the blade radius and axial surfaces are checked against cage.
add('blades','cream',g=>{for(let i=0;i<5;i++)blade(g,i*TAU/5+.11)},{spin:true,metal:.16});
add('blades','body',g=>ellipsoid(g,[0,CY,.26],[.22,.22,.12],32,16),{spin:true});
add('hub-cap','dark',g=>cylinder(g,[0,CY,.345],[0,CY,.416],.105,32,.085),{spin:true});
add('hub-cap','silver',g=>torus(g,[0,CY,.418],.071,.011),{spin:true,metal:.75});
// Front basket, domed forward; the outer hoop mates with the rear cradle at radius 1.18.
add('front-guard','dark',g=>{
 for(let r of [.20,.43,.69,.93,1.18])torus(g,[0,CY,.69-.075*(r/1.18)],r,r===1.18?.032:.012);
},{metal:.24});
add('front-guard','guard',g=>{
 for(let i=0;i<56;i++){let a=i*TAU/56;
  const p=r=>[r*Math.cos(a+.12*(1-r/1.18)),CY+r*Math.sin(a+.12*(1-r/1.18)),.70-.085*(r/1.18)];
  tube(g,[p(.18),p(.43),p(.69),p(.93),p(1.18)],.0085);
 }
},{metal:.22});
add('front-guard','body',g=>ellipsoid(g,[0,CY,.704],[.166,.166,.05],40,20));
add('front-guard','silver',g=>torus(g,[0,CY,.73],.134,.008),{metal:.68});
// Dedicated assembly group for six removable cage clips.
for(let j=0;j<6;j++){let a=j*TAU/6+.1,c=Math.cos(a),sn=Math.sin(a);
 add('latches','copper',g=>tube(g,[[1.197*c,CY+1.197*sn,.53],[1.229*c,CY+1.229*sn,.585],[1.214*c,CY+1.214*sn,.645]],.027),{metal:.32});
 add('latches','silver',g=>cylinder(g,[1.19*c,CY+1.19*sn,.573],[1.19*c,CY+1.19*sn,.64],.020,12),{metal:.35});
}

// understated grounded surface
add('floor','floor',g=>{quad(g,[-10,-1.53,-9],[-10,-1.53,9],[10,-1.53,9],[10,-1.53,-9])},{group:'floor'});

/* V3 · actual spatial set: restrained industrial workshop, illuminated alcove, table and cabling.
   Original scene-owned parametric geometry, not purchased meshes or an image backdrop. */
add('set','base',g=>box(g,[0,2.65,-5.15],[13,7,.20]),{group:'backdrop'});
add('set','dark',g=>box(g,[-5,2.8,-2.0],[.14,6,7.3]),{group:'sidewall'});
add('set','floor',g=>box(g,[0,-.09,-.36],[5.40,.18,3.28]),{group:'table'});
add('set','dark',g=>box(g,[0,-.004,-.32],[2.24,.008,1.70]),{group:'table'});
for(let i=0;i<8;i++)add('set','silver',g=>box(g,[-2.34+i*.085,.014,1.13],[.012,.008,.09]),{group:'table'});
add('set','dark',g=>box(g,[0,-.205,-.36],[5.35,.10,3.24]));
for(const x of [-2.28,2.28])for(const z of [-1.65,.95]){
 add('set','silver',g=>box(g,[x,-.83,z],[.09,1.38,.09]));
 add('set','dark',g=>ellipsoid(g,[x,-1.5,z],[.10,.032,.10],16,8));
}
add('set','silver',g=>tube(g,[[-2.55,1.1,-4.96],[-2.55,4.2,-4.96],[2.55,4.2,-4.96],[2.55,1.1,-4.96]],.027));
for(let j=0;j<9;j++)add('set','guard',g=>tube(g,[[-2.33+j*.58,4.06,-4.95],[-2.33+j*.58,3.88,-4.95]],.009));
add('set','dark',g=>box(g,[3.25,1.37,-4.45],[1.35,.11,.9]));
add('set','silver',g=>box(g,[3.25,1.45,-4.40],[1.15,.05,.72]));
add('set','dark',g=>{for(let x=2.8;x<=3.75;x+=.3)box(g,[x,1.58,-4.35],[.14,.23,.15])});
add('set','silver',g=>tube(g,[[.42,.05,-.63],[.85,.018,-.70],[1.3,-.02,-.65],[1.75,-.08,-.85]],.022));
add('control','accent',g=>ellipsoid(g,[.14,.30,.03],[.025,.009,.025],20,12),{metal:.05});
add('set','silver',g=>box(g,[0,4.30,-4.75],[4.5,.08,.22]),{group:'backdrop'});
add('set','cream',g=>box(g,[0,4.25,-4.72],[4.3,.03,.16]),{group:'backdrop'});
for(let j=0;j<6;j++)add('set','dark',g=>box(g,[-2.25+j*.9,2.05,-5.035],[.018,3.1,.012]),{group:'backdrop'});
// V3 low-voltage brushed motor remains an explanatory schematic, not a build-ready wiring diagram.

// airflow appears ONLY when motor runs: particles travel forwards (not CFD)
const flows=[];for(let i=0;i<12;i++){const r=.28+(i%4)*.20,ang=i*TAU/12;let g=geom();tube(g,Array.from({length:9},(_,j)=>[r*Math.cos(ang+.10*j),CY+r*Math.sin(ang+.10*j),.8+j*.13]),.010);const v=new Float32Array(g.verts),n=new Float32Array(g.norms),vb=gl.createBuffer(),nb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bufferData(gl.ARRAY_BUFFER,v,gl.STATIC_DRAW);gl.bindBuffer(gl.ARRAY_BUFFER,nb);gl.bufferData(gl.ARRAY_BUFFER,n,gl.STATIC_DRAW);flows.push({mesh:{vb,nb,count:v.length/3,color:i%3?material.blue:material.silver,metal:0}})}
const vs="#version 300 es\nprecision highp float;\nin vec3 aPos; in vec3 aNor;\nuniform mat4 uView,uProj; uniform vec3 uOffset; uniform float uSpin,uYaw;\nout vec3 vNormal,vWorld;\nvoid main(){\n vec3 p=aPos,n=aNor;\n float c=cos(uSpin),s=sin(uSpin);\n vec2 r=p.xy-vec2(0.,2.6);\n p.x=r.x*c-r.y*s;p.y=r.x*s+r.y*c+2.6;\n vec2 rn=n.xy;n.x=rn.x*c-rn.y*s;n.y=rn.x*s+rn.y*c;\n float cy=cos(uYaw),sy=sin(uYaw);\n vec2 q=p.xz-vec2(0.,-.42);\n p.x=q.x*cy+q.y*sy;p.z=-q.x*sy+q.y*cy-.42;\n vec2 qn=n.xz;n.x=qn.x*cy+qn.y*sy;n.z=-qn.x*sy+qn.y*cy;\n p+=uOffset;vNormal=normalize(n);vWorld=p;\n gl_Position=uProj*uView*vec4(p,1.);\n}";
const fs="#version 300 es\nprecision highp float;\nin vec3 vNormal,vWorld;\nuniform vec3 uColor,uEye;uniform float uAlpha,uMetal,uSelected,uTable;\nout vec4 outColor;\nvoid main(){\n vec3 n=normalize(vNormal),v=normalize(uEye-vWorld);\n vec3 l=normalize(vec3(-4.6,9.,5.5)-vWorld);\n vec3 fill=normalize(vec3(5.,4.,-1.)-vWorld);\n float kd=max(dot(n,l),0.),kf=max(dot(n,fill),0.);\n float spec=pow(max(dot(n,normalize(v+l)),0.),mix(22.,90.,uMetal));\n float spec2=pow(max(dot(n,normalize(v+fill)),0.),34.);\n float rim=pow(1.-max(dot(n,v),0.),3.);\n float grain=sin(vWorld.x*200.+sin(vWorld.z*31.)*2.)*.5+.5;\n vec3 lit=uColor*(.24+kd*.85+kf*.27)*(1.-uMetal*.055*grain);\n lit+=vec3(1.,.84,.65)*spec*(.16+uMetal*.62);\n lit+=vec3(.40,.78,.85)*spec2*(.09+uMetal*.27);\n lit+=vec3(.25,.43,.48)*rim*.13;\n lit=mix(lit,vec3(1.,.70,.31),uSelected*.36);\n float contact=exp(-dot((vWorld.xz-vec2(0.,-.26))*vec2(1.4,1.8),(vWorld.xz-vec2(0.,-.26))*vec2(1.4,1.8)));\n lit*=1.-uTable*contact*.45;\n vec3 mapped=lit/(lit+vec3(.51));\n outColor=vec4(pow(clamp(mapped,0.,1.),vec3(.72)),uAlpha);\n}";
function shader(type,src){let s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}
const prog=gl.createProgram();gl.attachShader(prog,shader(gl.VERTEX_SHADER,vs));gl.attachShader(prog,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(prog);if(!gl.getProgramParameter(prog,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(prog));gl.useProgram(prog);
const loc={aPos:gl.getAttribLocation(prog,'aPos'),aNor:gl.getAttribLocation(prog,'aNor'),view:gl.getUniformLocation(prog,'uView'),proj:gl.getUniformLocation(prog,'uProj'),off:gl.getUniformLocation(prog,'uOffset'),spin:gl.getUniformLocation(prog,'uSpin'),yaw:gl.getUniformLocation(prog,'uYaw'),color:gl.getUniformLocation(prog,'uColor'),alpha:gl.getUniformLocation(prog,'uAlpha'),metal:gl.getUniformLocation(prog,'uMetal'),sel:gl.getUniformLocation(prog,'uSelected'),eye:gl.getUniformLocation(prog,'uEye'),table:gl.getUniformLocation(prog,'uTable')};
gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);
function perspective(fov,aspect,n,f){let a=1/Math.tan(fov/2),z=1/(n-f);return [a/aspect,0,0,0,0,a,0,0,0,0,(f+n)*z,-1,0,0,2*f*n*z,0]}
function lookAt(eye,target){let z=normal(sub(eye,target)),x=normal(cross([0,1,0],z)),y=cross(z,x);return [x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-x.reduce((s,v,i)=>s+v*eye[i],0),-y.reduce((s,v,i)=>s+v*eye[i],0),-z.reduce((s,v,i)=>s+v*eye[i],0),1]}
const T=(id)=>document.getElementById(id);let orbit={az:.53,el:.18,dist:6.6,focus:[0,1.45,.12]},target={az:.53,el:.18,dist:6.6,focus:[0,1.45,.12]},drag=null,spinAngle=0,last=0,fanSpeed=0,headYaw=0,uiUpdate=0;const drive={on:false,speed:2,oscillate:false};const tour={on:false,start:0,index:-1};
const centers={'base-pad':[0,.05,-.26],control:[0,.33,.03],'rear-cap':[0,CY,-.98],gearbox:[0,CY,-.9],bearing:[0,CY,-.32],'hub-cap':[0,CY,.4],base:[0,.3,-.3],neck:[0,1.5,-.35],motor:[0,CY,-.55],stator:[0,CY,-.53],rotor:[0,CY,-.42],shaft:[0,CY,.1],'rear-guard':[0,CY,-.03],blades:[0,CY,.25],'front-guard':[0,CY,.615],latches:[0,CY,.585]};
const stepButtons=[...document.querySelectorAll('#bottom button')],partButtons=new Map();
for(let i=0;i<parts.length;i++){let p=parts[i],b=document.createElement('button');b.textContent=String(i+1).padStart(2,'0')+'  '+p.name;b.onclick=()=>{model.select(p.id);refreshUI()};T('parts').appendChild(b);let option=document.createElement('option');option.value=p.id;option.textContent=String(i+1).padStart(2,'0')+' · '+p.name;T('partPicker').appendChild(option);partButtons.set(p.id,b)}
T('partPicker').onchange=e=>{model.select(e.target.value||null);model.setIsolate(false);refreshUI()};
function stage(n){model.setStage(n);if(n===3)model.resetAssembly();model.setIsolate(false);if(n===2)model.select('rotor');else model.select(null);if(n>0&&n<4){drive.on=false;fanSpeed=0;headYaw=0}if(n===4)drive.on=true;if(n===1||n===3){target.dist=canvas.clientWidth<680?14.5:11.8;target.az=1.12;target.el=.18}else{target.dist=6.6;target.az=.50;target.el=.18}if(n===2){target.dist=3.6;target.az=.86;target.el=.17}refreshUI()}
function refreshUI(){let s=model.state();stepButtons.forEach((b,i)=>b.classList.toggle('active',s.stage===i));T('parts').classList.toggle('open',s.stage===2||s.stage===1);T('partPicker').classList.toggle('open',s.stage===2||s.stage===1);T('partPicker').value=s.selection||'';T('op').classList.toggle('open',s.stage===4);T('isolate').style.display=s.selection?'':'none';T('assembly').classList.toggle('open',s.stage===3);T('isolate').classList.toggle('active',s.isolate);T('isolate').title=s.isolate?'Mostrar todo':'Aislar pieza';let p=parts.find(p=>p.id===s.selection);let i=parts.indexOf(p);T('card').classList.toggle('hidden',!p);if(p){T('countLabel').textContent=`${String(i+1).padStart(2,'0')} / ${String(parts.length).padStart(2,'0')}`;T('partName').textContent=p.name;T('partDescription').textContent=p.short}for(let [id,b] of partButtons)b.classList.toggle('active',id===s.selection);if(s.stage===4){T('note').textContent='Aire: representación conceptual · no CFD'}else if(s.stage===2)T('note').textContent='Motor CC con escobillas · esquema didáctico';else T('note').textContent='';controlsUI()}
stepButtons.forEach(b=>b.onclick=()=>stage(+b.dataset.step));T('isolate').onclick=()=>{if(!model.state().selection)model.select('blades');model.toggleIsolate();refreshUI()};T('reset').onclick=()=>{const n=model.state().stage;target.az=n===1||n===3?1.12:.53;target.el=.18;target.dist=n===2?3.6:n===1||n===3?(canvas.clientWidth<680?14.5:11.8):6.6};T('replay').onclick=()=>{model.resetAssembly();refreshUI()};

function controlsUI(){
 const running=drive.on&&(model.state().stage===0||model.state().stage===4);
 for(const [id,v] of [['power',drive.on],['swing',drive.oscillate],['tour',tour.on]]){
 const el=T(id);if(el){el.classList.toggle('active',v);el.setAttribute('aria-pressed',String(v))}}
 T('power').textContent=drive.on?'■ Apagar':'⏻ Encender';
 T('speed').textContent='Vel. '+drive.speed;
 T('swing').textContent=drive.oscillate?'Oscilación ✓':'Oscilación';
 T('tour').textContent=tour.on?'Detener':'Recorrido';T('guide').setAttribute('aria-pressed',String(tour.on));T('guide').textContent=tour.on?'■':'▷';
 T('driveStatus').textContent=running?('MOTOR · NIVEL '+drive.speed+' / 3'):'MOTOR · DETENIDO';
}
T('power').onclick=()=>{drive.on=!drive.on;if(drive.on&&model.state().stage>0&&model.state().stage<4)stage(4);tour.on=false;controlsUI()};
T('speed').onclick=()=>{drive.speed=drive.speed%3+1;controlsUI()};
T('swing').onclick=()=>{drive.oscillate=!drive.oscillate;controlsUI()};
T('tour').onclick=T('guide').onclick=()=>{tour.on=!tour.on;tour.start=performance.now();tour.index=-1;if(tour.on){stage(0);drive.on=false;}controlsUI()};
T('zoomIn').onclick=()=>{target.dist=AT.clamp(target.dist-.8,2.3,18)};
T('zoomOut').onclick=()=>{target.dist=AT.clamp(target.dist+.8,2.3,18)};
const pointers=new Map();

function resize(){let w=canvas.clientWidth,h=canvas.clientHeight,ratio=Math.min(devicePixelRatio||1,canvas.clientWidth<680?1.5:2);canvas.width=Math.max(1,Math.round(w*ratio));canvas.height=Math.max(1,Math.round(h*ratio));gl.viewport(0,0,canvas.width,canvas.height)}addEventListener('resize',resize);resize();
canvas.addEventListener('pointerdown',e=>{pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});drag={x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY};canvas.setPointerCapture(e.pointerId)});
canvas.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;const prior=pointers.get(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2){drag=null;let other=[...pointers].find(([k])=>k!==e.pointerId)?.[1];if(other){let prev=Math.hypot(prior.x-other.x,prior.y-other.y),next=Math.hypot(e.clientX-other.x,e.clientY-other.y);target.dist=AT.clamp(target.dist+(prev-next)*.014,2.3,18)}return}if(!drag)return;let dx=e.clientX-drag.x,dy=e.clientY-drag.y;target.az-=dx*.006;target.el=AT.clamp(target.el+dy*.005,-.35,.85);drag.x=e.clientX;drag.y=e.clientY});
canvas.addEventListener('pointerup',e=>{const wasOne=pointers.size===1;pointers.delete(e.pointerId);if(wasOne&&drag&&Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)<7)pick(e.clientX,e.clientY);drag=null;if(tour.on){tour.on=false;controlsUI()}});
const cancelPointer=e=>{pointers.delete(e.pointerId);drag=null};canvas.addEventListener('pointercancel',cancelPointer);canvas.addEventListener('lostpointercapture',cancelPointer);
canvas.addEventListener('wheel',e=>{e.preventDefault();target.dist=AT.clamp(target.dist+e.deltaY*.006,2.3,18)},{passive:false});
window.addEventListener('keydown',e=>{if(e.key>='1'&&e.key<='5')stage(+e.key-1);if(e.code==='Space'){e.preventDefault();T('power').click()}if(e.key.toLowerCase()==='i'){if(!model.state().selection)model.select('blades');model.toggleIsolate();refreshUI()}if(e.key==='ArrowRight')stage(AT.clamp(model.state().stage+1,0,4));if(e.key==='ArrowLeft')stage(AT.clamp(model.state().stage-1,0,4))});
function mul(m,v){return [m[0]*v[0]+m[4]*v[1]+m[8]*v[2]+m[12]*v[3],m[1]*v[0]+m[5]*v[1]+m[9]*v[2]+m[13]*v[3],m[2]*v[0]+m[6]*v[1]+m[10]*v[2]+m[14]*v[3],m[3]*v[0]+m[7]*v[1]+m[11]*v[2]+m[15]*v[3]]}
function project(pt,view,proj){let v=mul(proj,mul(view,[...pt,1]));return [(v[0]/v[3]*.5+.5)*canvas.clientWidth,(1-(v[1]/v[3]*.5+.5))*canvas.clientHeight]}
function getCamera(){let dist=orbit.dist,az=orbit.az,el=orbit.el,center=orbit.focus,eye=[Math.sin(az)*Math.cos(el)*dist,center[1]+Math.sin(el)*dist,center[2]+Math.cos(az)*Math.cos(el)*dist];let aspect=canvas.width/canvas.height,small=canvas.clientWidth<680,fov=(small&&aspect<.8?62:43)*Math.PI/180;return {eye,view:lookAt(eye,center),proj:perspective(fov,aspect,.05,100)}}
function pick(x,y){let s=model.state(),{view,proj}=getCamera(),best=999,id=null;for(let p of parts){let c=centers[p.id].map((v,i)=>v+model.pose(p.id).position[i]),xy=project(c,view,proj),d=Math.hypot(xy[0]-x,xy[1]-y);if(d<best){best=d;id=p.id}}if(best<80){model.select(id);refreshUI()}else if(s.stage!==2){model.select(null);refreshUI()}}
function renderMesh(m,offset,alpha,selected,spin){gl.bindBuffer(gl.ARRAY_BUFFER,m.vb);gl.enableVertexAttribArray(loc.aPos);gl.vertexAttribPointer(loc.aPos,3,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ARRAY_BUFFER,m.nb);gl.enableVertexAttribArray(loc.aNor);gl.vertexAttribPointer(loc.aNor,3,gl.FLOAT,false,0,0);gl.uniform3fv(loc.off,offset);gl.uniform1f(loc.spin,spin);gl.uniform1f(loc.yaw,(m.part&&['base','base-pad','control','neck','floor','set'].includes(m.part))?0:headYaw);gl.uniform3fv(loc.color,m.color);gl.uniform1f(loc.alpha,alpha);gl.uniform1f(loc.metal,m.metal);gl.uniform1f(loc.sel,selected?1:0);gl.uniform1f(loc.table,m.group==='table'?1:0);gl.drawArrays(gl.TRIANGLES,0,m.count)}
function frame(ms){let dt=Math.min((ms-last)/1000||0,.05);last=ms;
if(tour.on){let t=(ms-tour.start)/1000,idx=t<7?0:t<17?1:t<28?2:t<39?3:4;if(idx!==tour.index){tour.index=idx;stage(idx);if(idx===4)drive.oscillate=true}if(t>49){tour.on=false;controlsUI()}}
model.update(dt);let s=model.state();orbit.az+=(target.az-orbit.az)*Math.min(1,dt*4);orbit.el+=(target.el-orbit.el)*Math.min(1,dt*4);orbit.dist+=(target.dist-orbit.dist)*Math.min(1,dt*4);let center=(s.stage===2&&s.selection&&centers[s.selection])?centers[s.selection].map((x,i)=>x+model.pose(s.selection).position[i]):(s.stage===1||s.stage===3?[0,1.80,.55]:[0,1.45,.12]);target.focus=center;for(let i=0;i<3;i++)orbit.focus[i]+=(target.focus[i]-orbit.focus[i])*Math.min(1,dt*3.5);const wanted=drive.on&&(s.stage===0||s.stage===4)?(.16+.23*drive.speed):0;fanSpeed+=(wanted-fanSpeed)*Math.min(1,dt*2.3);spinAngle+=dt*fanSpeed*30;headYaw=drive.oscillate&&fanSpeed>.05?Math.sin(ms*.00106)*.46:headYaw*Math.max(0,1-dt*3.0);
let {view,proj,eye}=getCamera();gl.uniform3fv(loc.eye,eye);gl.uniformMatrix4fv(loc.view,false,new Float32Array(view));gl.uniformMatrix4fv(loc.proj,false,new Float32Array(proj));gl.clearColor(.13,.18,.21,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
const solid=[],transparent=[];for(let m of meshes){if(m.group==='backdrop'&&Math.cos(orbit.az)<-.25||m.group==='sidewall'&&Math.sin(orbit.az)<-.7)continue;let pose=model.pose(m.part);let off=pose?.position||[0,0,0],alpha=(m.group==='power'?(s.stage===4||s.stage===2?1:.11):pose?pose.alpha:1)*m.alpha;
if(s.stage===2&&m.part==='motor'&&s.selection!=='motor')alpha=Math.min(alpha,.11);if(s.stage===2&&['front-guard','rear-guard','latches','blades'].includes(m.part)&&s.selection==='rotor')alpha=Math.min(alpha,.15);if(alpha<.02)continue;let item={m,off,alpha,selected:pose?.highlight,spin:m.spin?spinAngle:0};(alpha>.94?solid:transparent).push(item)}
for(let o of solid)renderMesh(o.m,o.off,o.alpha,o.selected,o.spin);
gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);
transparent.sort((a,b)=>{const depth=o=>{let c=centers[o.m.part]||[0,0,0];return Math.hypot(...c.map((v,i)=>v+o.off[i]-eye[i]))};return depth(b)-depth(a)});for(let o of transparent)renderMesh(o.m,o.off,o.alpha,o.selected,o.spin);
gl.depthMask(true);gl.disable(gl.BLEND);
// airflow visual (short moving streaks); original geometry belongs to renderer, not fluid simulation
if(fanSpeed>.08){gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);for(let i=0;i<12;i++){const offZ=((ms*.0009*(.3+fanSpeed)+i*.137)%2.7);renderMesh(flows[i].mesh,[0,0,offZ],.22*fanSpeed,false,0)}gl.depthMask(true);gl.disable(gl.BLEND)}
if(s.stage===3&&ms-uiUpdate>150){uiUpdate=ms;T('counter').textContent=`${Math.min(parts.length,Math.floor(s.phase*parts.length))} / ${parts.length}`}
requestAnimationFrame(frame)}
refreshUI();controlsUI();requestAnimationFrame(frame);
addEventListener('message',e=>{if(e.data?.type==='FAN_VIEW')window.__FAN_QA__?.setView(e.data.name)});
window.__FAN_QA__={setView:(name)=>{const angles={frontal:0,perfil:Math.PI/2,trescuartos:.63};if(!(name in angles))return false;target.az=orbit.az=angles[name];target.el=orbit.el=.08;target.dist=orbit.dist=6.7;return true;}, scene:'ventilador-explicado-v4',parts:parts.map(p=>p.id),geometry:gstore,cage,fit:{radial:cage.radius-cage.bladeMaxRadius,rear:cage.bladeMinZ-cage.rearZ,front:cage.frontZ-cage.bladeMaxZ},renderer:'webgl2',getState:()=>model.state(),getPose:id=>model.pose(id),setStage:stage,select:(id)=>{model.select(id);refreshUI()},getDrive:()=>({...drive,spinAngle,fanSpeed,headYaw}),setPower:v=>{drive.on=!!v;controlsUI()},setSpeed:v=>{drive.speed=AT.clamp(Math.round(v),1,3);controlsUI()},setOscillation:v=>{drive.oscillate=!!v;controlsUI()},ready:true};
})();

//# sourceURL=prometeo-fan-v4.js
