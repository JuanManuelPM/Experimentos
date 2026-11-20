/* PROMETEO Ventilador Explicado 001. Native WebGL 3D scene, zero network dependencies. MIT. */
(()=>{'use strict';
const canvas=document.getElementById('stage'),gl=canvas.getContext('webgl2',{antialias:true,alpha:false,preserveDrawingBuffer:true});
if(!gl){document.getElementById('error').style.display='flex';return}
const AT=window.AssemblyKit,TAU=Math.PI*2, CY=2.6;
const partData=[
 ['base','Base y control','Sostiene el conjunto y abre o cierra el circuito.',[0,0,0]],
 ['neck','Soporte','Fija la altura y la orientación del cabezal.',[0,0,0]],
 ['motor','Carcasa','Protege y sujeta el motor.',[0,0,-1.05]],
 ['stator','Estator · imanes','Mantiene un campo magnético fijo.',[0,0,-.66]],
 ['rotor','Rotor · bobinas','Las escobillas y el conmutador llevan corriente a las bobinas.',[0,0,-.27]],
 ['shaft','Eje','Transmite el movimiento del rotor a la hélice.',[0,0,.48]],
 ['rear-guard','Rejilla posterior','Se monta antes de colocar las aspas.',[0,0,.93]],
 ['blades','Hélice','Las aspas inclinadas impulsan el aire hacia delante.',[0,0,1.58]],
 ['front-guard','Rejilla anterior','Cierra la protección de las aspas.',[0,0,2.35]]
];
const parts=partData.map(([id,name,short,explode])=>({id,name,short,explode}));
const model=AT.createPresenter({parts,assemblyOrder:['base','neck','motor','stator','rotor','shaft','rear-guard','blades','front-guard']});
const material={body:[.18,.42,.43],base:[.20,.34,.36],dark:[.13,.20,.21],guard:[.50,.61,.59],silver:[.67,.74,.72],copper:[.90,.52,.27],blue:[.27,.70,.67],cream:[.93,.88,.75],accent:[.97,.75,.38],floor:[.84,.84,.81],magnet:[.30,.55,.59]};
const v3=(x=0,y=0,z=0)=>[x,y,z],sub=(a,b)=>a.map((v,i)=>v-b[i]),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],normal=a=>{let n=Math.hypot(...a)||1;return a.map(v=>v/n)};
const meshes=[];
function geom(){return {verts:[],norms:[]}}
function tri(g,a,b,c){let n=normal(cross(sub(b,a),sub(c,a)));for(let p of [a,b,c]){g.verts.push(...p);g.norms.push(...n)}}
function quad(g,a,b,c,d){tri(g,a,b,c);tri(g,a,c,d)}
function param(g,nu,nv,fn){for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){let a=fn(i/nu,j/nv),b=fn((i+1)/nu,j/nv),c=fn((i+1)/nu,(j+1)/nv),d=fn(i/nu,(j+1)/nv);quad(g,a,b,c,d)}}
function cylinder(g,a,b,r,n=16,r2=r){let dir=normal(sub(b,a)),seed=Math.abs(dir[1])<.89?[0,1,0]:[1,0,0],u=normal(cross(dir,seed)),v=cross(dir,u);
const p=(center,R,t)=>center.map((x,i)=>x+R*(u[i]*Math.cos(t)+v[i]*Math.sin(t)));
for(let i=0;i<n;i++){let t=i*TAU/n,q=(i+1)*TAU/n,A=p(a,r,t),B=p(a,r,q),C=p(b,r2,q),D=p(b,r2,t);quad(g,A,B,C,D);tri(g,a,B,A);tri(g,b,D,C)}}
function tube(g,points,r=.016){for(let i=0;i<points.length-1;i++)cylinder(g,points[i],points[i+1],r,8)}
function ellipsoid(g,c,rad,na=28,nb=14){param(g,na,nb,(u,v)=>{let a=u*TAU,p=v*Math.PI;return [c[0]+rad[0]*Math.sin(p)*Math.cos(a),c[1]+rad[1]*Math.cos(p),c[2]+rad[2]*Math.sin(p)*Math.sin(a)]})}
function torus(g,c,R,r=.014,plane='xy',n=72,m=8){param(g,n,m,(u,v)=>{let a=u*TAU,b=v*TAU,q=R+r*Math.cos(b),c0=r*Math.sin(b);return plane==='xy'?[c[0]+q*Math.cos(a),c[1]+q*Math.sin(a),c[2]+c0]:[c[0]+q*Math.cos(a),c[1]+c0,c[2]+q*Math.sin(a)]})}
function box(g,c,sz){let [x,y,z]=c,[a,b,d]=sz.map(v=>v/2),p=[[-a,-b,-d],[a,-b,-d],[a,b,-d],[-a,b,-d],[-a,-b,d],[a,-b,d],[a,b,d],[-a,b,d]].map(q=>[x+q[0],y+q[1],z+q[2]]);for(const [i,j,k,l] of [[0,1,2,3],[4,7,6,5],[0,4,5,1],[3,2,6,7],[0,3,7,4],[1,5,6,2]])quad(g,p[i],p[j],p[k],p[l])}
function blade(g,a){const a0=a,twist=.30;
const P=(u,v,s)=>{let t=.13+.87*u,r=.13+.94*t;let ang=a0+twist*(1-u),width=.34*Math.pow(Math.sin(Math.PI*Math.pow(u,.78)),.70)+.018;let tang=v*width;let x=r*Math.cos(ang)-tang*Math.sin(ang),y=CY+r*Math.sin(ang)+tang*Math.cos(ang),z=.205+.15*v*(1-.65*u)+.045*Math.sin(u*Math.PI)+s*.018;return [x,y,z]};
param(g,20,8,(u,v)=>P(u,v*2-1,1));param(g,20,8,(u,v)=>P(u,v*2-1,-1));for(let i=0;i<20;i++){let u=i/20,j=(i+1)/20;quad(g,P(u,-1,-1),P(j,-1,-1),P(j,-1,1),P(u,-1,1));quad(g,P(u,1,-1),P(u,1,1),P(j,1,1),P(j,1,-1))}}
const gstore=[];
function add(id,mt,build,{spin=false,alpha=1,group=id,metal=0}={}){let g=geom();build(g);if(!g.verts.length)return;let vv=new Float32Array(g.verts),nn=new Float32Array(g.norms),vb=gl.createBuffer(),nb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bufferData(gl.ARRAY_BUFFER,vv,gl.STATIC_DRAW);gl.bindBuffer(gl.ARRAY_BUFFER,nb);gl.bufferData(gl.ARRAY_BUFFER,nn,gl.STATIC_DRAW);meshes.push({part:id,group,color:material[mt],metal,spin,alpha,vb,nb,count:vv.length/3});gstore.push({part:id,triangles:vv.length/9})}
// base: designed contact foot, control dial, neck and tilt pivot
add('base','body',g=>ellipsoid(g,[0,.16,-.26],[.83,.15,.64],44,15));
add('base','dark',g=>ellipsoid(g,[0,.076,-.26],[.69,.06,.53],36,12));
add('base','silver',g=>torus(g,[0,.26,-.25],.38,.017,'xz'));
add('base','dark',g=>cylinder(g,[0,.27,.03],[0,.36,.03],.11,28));
add('base','copper',g=>torus(g,[0,.365,.03],.085,.012,'xz'));
add('neck','silver',g=>cylinder(g,[0,.30,-.35],[0,2.15,-.35],.074,24));
add('neck','body',g=>cylinder(g,[0,1.05,-.35],[0,1.18,-.35],.11,24));
add('neck','dark',g=>ellipsoid(g,[0,2.19,-.41],[.25,.23,.22],22,14));
add('neck','silver',g=>cylinder(g,[-.29,2.17,-.39],[.29,2.17,-.39],.070,18));
// motor cover: capped shell, contours, exhaust fins
add('motor','body',g=>cylinder(g,[0,CY,-.89],[0,CY,-.28],.355,46),{alpha:.96});
add('motor','dark',g=>cylinder(g,[0,CY,-.94],[0,CY,-.89],.30,38));
for(let i=0;i<10;i++){let t=i*TAU/10;add('motor','guard',g=>tube(g,[[.32*Math.cos(t),CY+.32*Math.sin(t),-.74],[.32*Math.cos(t),CY+.32*Math.sin(t),-.42]],.012),{alpha:.8})}
// true educational schematic of a brushed DC motor, not scaled engineering geometry
add('stator','magnet',g=>{for(let a of [-1,1]){let x=a*.23;box(g,[x,CY,-.54],[.105,.32,.24])}});
add('rotor','silver',g=>cylinder(g,[0,CY,-.76],[0,CY,-.28],.125,18),{spin:true});
for(let i=0;i<3;i++){let t=i*TAU/3;add('rotor','copper',g=>{for(let j=0;j<4;j++){let z=-.63+j*.034;torus(g,[0,CY,z],.159,.014)}},{spin:true})}
add('rotor','copper',g=>cylinder(g,[0,CY,-.31],[0,CY,-.225],.10,18),{spin:true});
add('rotor','dark',g=>{box(g,[-.13,CY,-.28],[.09,.07,.09]);box(g,[.13,CY,-.28],[.09,.07,.09])});
add('shaft','silver',g=>cylinder(g,[0,CY,-.35],[0,CY,.38],.057,22),{spin:true,metal:.4});
// rear grille: concentric stays and ribs, offset around impeller
add('rear-guard','guard',g=>{for(let r of [.21,.48,.73,1.08])torus(g,[0,CY,-.035],r,r===1.08?.025:.013)}, {metal:.2});
add('rear-guard','guard',g=>{for(let j=0;j<28;j++){let a=j*TAU/28;tube(g,[[.20*Math.cos(a),CY+.20*Math.sin(a),-.03],[1.079*Math.cos(a),CY+1.079*Math.sin(a),-.04]],.010)}},{metal:.2});
add('rear-guard','body',g=>cylinder(g,[0,CY,-.095],[0,CY,-.015],.22,34));
// aerodynamic blades are curved continuous triangulated surfaces, not boxes
add('blades','cream',g=>{for(let i=0;i<5;i++)blade(g,i*TAU/5+.11)},{spin:true,metal:.16});
add('blades','body',g=>ellipsoid(g,[0,CY,.26],[.22,.22,.12],32,16),{spin:true});
add('blades','copper',g=>torus(g,[0,CY,.345],.085,.012),{spin:true});
// protective front grille domed slightly in z toward the center
add('front-guard','dark',g=>{for(let r of [.29,.58,.83,1.09])torus(g,[0,CY,.46-(1-r)*.06],r,r===1.09?.029:.013)},{metal:.25});
add('front-guard','guard',g=>{for(let i=0;i<28;i++){let a=i*TAU/28;const p=r=>[r*Math.cos(a),CY+r*Math.sin(a),.46-(1-r)*.06];tube(g,[p(.20),p(1.085)],.011)}},{metal:.15});
add('front-guard','dark',g=>ellipsoid(g,[0,CY,.485],[.16,.16,.055],24,12));
// understated grounded surface
add('floor','floor',g=>{quad(g,[-10,.001,-9],[-10,.001,9],[10,.001,9],[10,.001,-9])},{group:'floor'});
// visible electrical path; indicative supply only, no exposed mains
add('power','copper',g=>tube(g,[[0,.27,-.19],[.12,.35,-.24],[.14,.63,-.29],[.13,1.4,-.32],[.12,2.16,-.43],[.12,CY,-.80]],.017),{group:'power'});
add('power','blue',g=>tube(g,[[0,.27,-.2],[-.11,.36,-.25],[-.12,1.2,-.37],[-.11,2.16,-.45],[-.11,CY,-.82]],.012),{group:'power'});
// airflow appears ONLY when motor runs: particles travel forwards (not CFD)
const flows=[];for(let i=0;i<12;i++){const r=.28+(i%4)*.20,ang=i*TAU/12;let g=geom();tube(g,Array.from({length:9},(_,j)=>[r*Math.cos(ang+.10*j),CY+r*Math.sin(ang+.10*j),.8+j*.13]),.010);flows.push({g,color:i%3?material.blue:material.silver})}
const vs=`#version 300 es\nprecision highp float;in vec3 aPos;in vec3 aNor;uniform mat4 uView,uProj;uniform vec3 uOffset;uniform float uSpin;out vec3 vNormal;out vec3 vWorld;void main(){vec3 p=aPos;vec3 n=aNor;float c=cos(uSpin),s=sin(uSpin);p.y-=2.6;vec2 t=vec2(p.x*c-p.y*s,p.x*s+p.y*c);p.x=t.x;p.y=t.y+2.6;vec2 tn=vec2(n.x*c-n.y*s,n.x*s+n.y*c);n.x=tn.x;n.y=tn.y;p+=uOffset;vNormal=normalize(n);vWorld=p;gl_Position=uProj*uView*vec4(p,1.);}`;
const fs=`#version 300 es\nprecision highp float;in vec3 vNormal;in vec3 vWorld;uniform vec3 uColor;uniform float uAlpha,uMetal,uSelected;out vec4 outColor;void main(){vec3 N=normalize(vNormal);vec3 L=normalize(vec3(-.5,1.4,2.2));float d=.56+.40*abs(dot(N,L));float hemi=.06*max(0.,N.y);float rim=.07*pow(1.-abs(dot(N,normalize(vec3(.2,.6,1.5)))),3.);vec3 col=uColor*(d+hemi)+vec3(.70,.8,.75)*(rim+uMetal*.085);col=mix(col,vec3(.94,.64,.19),uSelected*.40);outColor=vec4(pow(clamp(col,0.,1.),vec3(.94)),uAlpha);}`;
function shader(type,src){let s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}
const prog=gl.createProgram();gl.attachShader(prog,shader(gl.VERTEX_SHADER,vs));gl.attachShader(prog,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(prog);if(!gl.getProgramParameter(prog,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(prog));gl.useProgram(prog);
const loc={aPos:gl.getAttribLocation(prog,'aPos'),aNor:gl.getAttribLocation(prog,'aNor'),view:gl.getUniformLocation(prog,'uView'),proj:gl.getUniformLocation(prog,'uProj'),off:gl.getUniformLocation(prog,'uOffset'),spin:gl.getUniformLocation(prog,'uSpin'),color:gl.getUniformLocation(prog,'uColor'),alpha:gl.getUniformLocation(prog,'uAlpha'),metal:gl.getUniformLocation(prog,'uMetal'),sel:gl.getUniformLocation(prog,'uSelected')};
gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);
function perspective(fov,aspect,n,f){let a=1/Math.tan(fov/2),z=1/(n-f);return [a/aspect,0,0,0,0,a,0,0,0,0,(f+n)*z,-1,0,0,2*f*n*z,0]}
function lookAt(eye,target){let z=normal(sub(eye,target)),x=normal(cross([0,1,0],z)),y=cross(z,x);return [x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-x.reduce((s,v,i)=>s+v*eye[i],0),-y.reduce((s,v,i)=>s+v*eye[i],0),-z.reduce((s,v,i)=>s+v*eye[i],0),1]}
const T=(id)=>document.getElementById(id);let orbit={az:.53,el:.18,dist:6.6,focus:[0,1.45,.12]},target={az:.53,el:.18,dist:6.6,focus:[0,1.45,.12]},drag=null,spinAngle=0,last=0,fanSpeed=0,uiUpdate=0;
const centers={base:[0,.3,-.3],neck:[0,1.5,-.35],motor:[0,CY,-.55],stator:[0,CY,-.53],rotor:[0,CY,-.42],shaft:[0,CY,.1],'rear-guard':[0,CY,-.03],blades:[0,CY,.25],'front-guard':[0,CY,.48]};
const stepButtons=[...document.querySelectorAll('#bottom button')],partButtons=new Map();
for(let i=0;i<parts.length;i++){let p=parts[i],b=document.createElement('button');b.textContent=String(i+1).padStart(2,'0')+'  '+p.name;b.onclick=()=>{model.select(p.id);refreshUI()};T('parts').appendChild(b);partButtons.set(p.id,b)}
function stage(n){model.setStage(n);if(n===3)model.resetAssembly();if(n===2)model.select('rotor');else model.select(null);if(n===1||n===2||n===3){target.dist=8.1;target.az=.65}else{target.dist=6.6;target.az=.50}if(n===2){target.dist=3.2;target.az=.72;target.el=.13}refreshUI()}
function refreshUI(){let s=model.state();stepButtons.forEach((b,i)=>b.classList.toggle('active',s.stage===i));T('parts').classList.toggle('open',s.stage===2);T('assembly').classList.toggle('open',s.stage===3);T('isolate').classList.toggle('active',s.isolate);T('isolate').title=s.isolate?'Mostrar todo':'Aislar pieza';let p=parts.find(p=>p.id===s.selection);let i=parts.indexOf(p);T('card').classList.toggle('hidden',!p);if(p){T('countLabel').textContent=`${String(i+1).padStart(2,'0')} / ${String(parts.length).padStart(2,'0')}`;T('partName').textContent=p.name;T('partDescription').textContent=p.short}for(let [id,b] of partButtons)b.classList.toggle('active',id===s.selection);if(s.stage===4){T('note').textContent='Aire: representación conceptual · no CFD'}else if(s.stage===2)T('note').textContent='Motor CC con escobillas · esquema didáctico';else T('note').textContent=''}
stepButtons.forEach(b=>b.onclick=()=>stage(+b.dataset.step));T('isolate').onclick=()=>{if(!model.state().selection)model.select('blades');model.toggleIsolate();refreshUI()};T('reset').onclick=()=>{target.az=.53;target.el=.18;target.dist=model.state().stage===1?8.1:6.6};T('replay').onclick=()=>{model.resetAssembly();refreshUI()};
function resize(){let w=canvas.clientWidth,h=canvas.clientHeight,ratio=Math.min(devicePixelRatio||1,2);canvas.width=Math.max(1,Math.round(w*ratio));canvas.height=Math.max(1,Math.round(h*ratio));gl.viewport(0,0,canvas.width,canvas.height)}addEventListener('resize',resize);resize();
canvas.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY};canvas.setPointerCapture(e.pointerId)});
canvas.addEventListener('pointermove',e=>{if(!drag)return;let dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>0){target.az+=dx*.006;target.el=AT.clamp(target.el+dy*.005,-.35,.85)}drag.x=e.clientX;drag.y=e.clientY});
canvas.addEventListener('pointerup',e=>{if(drag&&Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)<7)pick(e.clientX,e.clientY);drag=null});
canvas.addEventListener('wheel',e=>{e.preventDefault();target.dist=AT.clamp(target.dist+e.deltaY*.006,4.2,12)},{passive:false});
window.addEventListener('keydown',e=>{if(e.key>='1'&&e.key<='5')stage(+e.key-1);if(e.key.toLowerCase()==='i'){if(!model.state().selection)model.select('blades');model.toggleIsolate();refreshUI()}if(e.key==='ArrowRight')stage(AT.clamp(model.state().stage+1,0,4));if(e.key==='ArrowLeft')stage(AT.clamp(model.state().stage-1,0,4))});
function mul(m,v){return [m[0]*v[0]+m[4]*v[1]+m[8]*v[2]+m[12]*v[3],m[1]*v[0]+m[5]*v[1]+m[9]*v[2]+m[13]*v[3],m[2]*v[0]+m[6]*v[1]+m[10]*v[2]+m[14]*v[3],m[3]*v[0]+m[7]*v[1]+m[11]*v[2]+m[15]*v[3]]}
function project(pt,view,proj){let v=mul(proj,mul(view,[...pt,1]));return [(v[0]/v[3]*.5+.5)*canvas.clientWidth,(1-(v[1]/v[3]*.5+.5))*canvas.clientHeight]}
function getCamera(){let dist=orbit.dist,az=orbit.az,el=orbit.el,center=orbit.focus,eye=[Math.sin(az)*Math.cos(el)*dist,center[1]+Math.sin(el)*dist,center[2]+Math.cos(az)*Math.cos(el)*dist];let aspect=canvas.width/canvas.height,small=canvas.clientWidth<680,fov=(small&&aspect<.8?62:43)*Math.PI/180;return {view:lookAt(eye,center),proj:perspective(fov,aspect,.05,100)}}
function pick(x,y){let s=model.state(),{view,proj}=getCamera(),best=999,id=null;for(let p of parts){let c=centers[p.id].map((v,i)=>v+model.pose(p.id).position[i]),xy=project(c,view,proj),d=Math.hypot(xy[0]-x,xy[1]-y);if(d<best){best=d;id=p.id}}if(best<80){model.select(id);refreshUI()}else if(s.stage!==2){model.select(null);refreshUI()}}
function renderMesh(m,offset,alpha,selected,spin){gl.bindBuffer(gl.ARRAY_BUFFER,m.vb);gl.enableVertexAttribArray(loc.aPos);gl.vertexAttribPointer(loc.aPos,3,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ARRAY_BUFFER,m.nb);gl.enableVertexAttribArray(loc.aNor);gl.vertexAttribPointer(loc.aNor,3,gl.FLOAT,false,0,0);gl.uniform3fv(loc.off,offset);gl.uniform1f(loc.spin,spin);gl.uniform3fv(loc.color,m.color);gl.uniform1f(loc.alpha,alpha);gl.uniform1f(loc.metal,m.metal);gl.uniform1f(loc.sel,selected?1:0);gl.drawArrays(gl.TRIANGLES,0,m.count)}
function frame(ms){let dt=Math.min((ms-last)/1000||0,.05);last=ms;model.update(dt);let s=model.state();orbit.az+=(target.az-orbit.az)*Math.min(1,dt*4);orbit.el+=(target.el-orbit.el)*Math.min(1,dt*4);orbit.dist+=(target.dist-orbit.dist)*Math.min(1,dt*4);let center=(s.stage===2&&s.selection&&centers[s.selection])?centers[s.selection].map((x,i)=>x+model.pose(s.selection).position[i]):[0,1.45,.12];target.focus=center;for(let i=0;i<3;i++)orbit.focus[i]+=(target.focus[i]-orbit.focus[i])*Math.min(1,dt*3.5);fanSpeed+=(+(s.stage===4)-fanSpeed)*Math.min(1,dt*1.5);spinAngle+=dt*fanSpeed*14;
let {view,proj}=getCamera();gl.uniformMatrix4fv(loc.view,false,new Float32Array(view));gl.uniformMatrix4fv(loc.proj,false,new Float32Array(proj));gl.clearColor(.92,.918,.895,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
const solid=[],transparent=[];for(let m of meshes){let pose=model.pose(m.part);let off=pose?.position||[0,0,0],alpha=(m.group==='power'?(s.stage===4||s.stage===2?1:.11):pose?pose.alpha:1)*m.alpha;
if(s.stage===2&&m.part==='motor')alpha=Math.min(alpha,.11);if(s.stage===2&&['front-guard','rear-guard','blades'].includes(m.part)&&s.selection==='rotor')alpha=Math.min(alpha,.15);if(alpha<.02)continue;let item={m,off,alpha,selected:pose?.highlight,spin:m.spin?spinAngle:0};(alpha>.94?solid:transparent).push(item)}
for(let o of solid)renderMesh(o.m,o.off,o.alpha,o.selected,o.spin);
gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);
for(let o of transparent)renderMesh(o.m,o.off,o.alpha,o.selected,o.spin);
gl.depthMask(true);gl.disable(gl.BLEND);
// airflow visual (short moving streaks); original geometry belongs to renderer, not fluid simulation
if(fanSpeed>.08){for(let i=0;i<12;i++){let g=flows[i].g,offZ=((ms*.0009*(.3+fanSpeed)+i*.137)%2.7);let v=new Float32Array(g.verts),n=new Float32Array(g.norms),vb=gl.createBuffer(),nb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bufferData(gl.ARRAY_BUFFER,v,gl.STREAM_DRAW);gl.bindBuffer(gl.ARRAY_BUFFER,nb);gl.bufferData(gl.ARRAY_BUFFER,n,gl.STREAM_DRAW);renderMesh({vb,nb,count:v.length/3,color:flows[i].color,metal:0},[0,0,offZ],.22*fanSpeed,false,0);gl.deleteBuffer(vb);gl.deleteBuffer(nb)}}
if(s.stage===3&&ms-uiUpdate>150){uiUpdate=ms;T('counter').textContent=`${Math.min(9,Math.floor(s.phase*9))} / 9`}
requestAnimationFrame(frame)}
// Comparison-only camera adapter: original V1 mesh code and materials are unchanged.
addEventListener('message',e=>{if(e.data?.type!=='FAN_VIEW')return;const angles={frontal:0,perfil:Math.PI/2,trescuartos:.63};if(!(e.data.name in angles))return;target.az=orbit.az=angles[e.data.name];target.el=orbit.el=.08;target.dist=orbit.dist=6.7;});
refreshUI();requestAnimationFrame(frame);
window.__FAN_QA__={scene:'ventilador-explicado-001',parts:parts.map(p=>p.id),geometry:gstore,renderer:'webgl2',getState:()=>model.state(),setStage:stage,select:(id)=>{model.select(id);refreshUI()},ready:true};
})();
