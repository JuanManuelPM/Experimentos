import {terrainHeight,waterHeight,riverX,riverWidth,riverDistance,createRng,generateTrees,validateTrees,QUALITY,SEASONS,SPECIES,seasonalWeights} from './forest-core.mjs';
import {buildBroadleaf,selectInstances} from './botany.mjs';
/* HERBARIUM · original WebGL2 study. Terrain, plant morphologies, weather and GPU-instanced vegetation. */
const canvas=document.getElementById('gl'),metricEl=document.getElementById('metrics'),errEl=document.getElementById('error');
const gl=canvas.getContext('webgl2',{antialias:true,alpha:false,depth:true,powerPreference:'high-performance'});
if(!gl){errEl.style.display='block';errEl.textContent='Este navegador no dispone de WebGL2. Para ver el bosque necesitás un navegador compatible con aceleración 3D.';throw Error('WebGL2 unavailable')}
const VERT=`#version 300 es
precision highp float;
layout(location=0) in vec3 aPos;layout(location=1) in vec3 aNormal;layout(location=2) in vec3 aColor;layout(location=3) in vec4 aMeta;
uniform mat4 uVP;uniform float uTime,uWind;out vec3 vWorld,vNormal,vColor;out vec4 vMeta;
void main(){vec3 p=aPos;float k=aMeta.x;if(k==2.||k==4.){float gust=sin(uTime*.86+p.x*.047+p.z*.035)*.55+sin(uTime*1.92+p.x*.15-p.z*.096)*.45;p.x+=uWind*gust*aMeta.y*.21;p.z+=uWind*gust*aMeta.y*.09;}
vWorld=p;vNormal=aNormal;vColor=aColor;vMeta=aMeta;gl_Position=uVP*vec4(p,1.);}`;
const FRAG=`#version 300 es
precision highp float;in vec3 vWorld,vNormal,vColor;in vec4 vMeta;out vec4 outColor;
uniform float uSeason,uRain,uTime,uFog;uniform vec3 uEye;uniform float uView;
vec3 spPalette(int i){if(i==0)return vec3(.35,.50,.28);if(i==1)return vec3(.25,.39,.20);if(i==2)return vec3(.46,.33,.19);return vec3(.73,.78,.76);}
float wave(float x){return .5+.5*sin(x);}void main(){vec3 col=vColor;float type=vMeta.x;float s=mod(uSeason,4.);float i=floor(s);float f=smoothstep(0.,1.,fract(s));
vec3 ground=mix(spPalette(int(i)),spPalette((int(i)+1)%4),f);
if(type==6.){float slope=vMeta.y;float moisture=vMeta.z;col=mix(ground,vec3(.36,.36,.33),clamp(slope*.55,0.,.65));col=mix(col,vec3(.20,.28,.22),moisture*.28);col*=vColor;col=mix(col,col*.64,uRain*.48);}
if(type==3.){vec3 p1=vec3(.16,.30,.19),p2=vec3(.11,.23,.15),p3=vec3(.20,.27,.21),p4=vec3(.32,.40,.36);col=mix(mix(mix(p1,p2,step(1.,i)),p3,step(2.,i)),p4,step(3.,i));col=mix(col,vColor,.23);}
float brightness=clamp(dot(normalize(vNormal),normalize(vec3(-.39,.84,.45)))*.62+.49,.27,1.18);
if(type==7.){float a=sin(vWorld.x*2.6+uTime*1.3+sin(vWorld.z*.6))*.5+.5;float b=sin(vWorld.z*3.4-uTime*1.7)*.5+.5;float fres=pow(1.-abs(dot(normalize(vWorld-uEye),vec3(0.,1.,0.))),2.);
col=mix(vec3(.055,.19,.18),vec3(.37,.53,.53),clamp(.26+fres*.52+a*.12+b*.10+uRain*.15,0.,1.));
col+=vec3(.15,.18,.13)*pow(max(0.,sin(vWorld.z*2.6+vWorld.x*1.8+uTime*2.2)),42.)*.8;col=mix(col,vec3(.52,.66,.69),smoothstep(2.5,3.,s)*.66);brightness=.95;}
if(type==8.){outColor=vec4(.015,.031,.020,.19*vMeta.y);return;}
col*=brightness;float fogAmount=1.-exp(-pow(length(vWorld.xz-uEye.xz)*uFog*.015,1.6));
vec3 fog=mix(vec3(.66,.72,.64),vec3(.63,.70,.73),smoothstep(2.0,3.9,s));fog=mix(fog,vec3(.40,.48,.52),uRain*.5);
col=mix(col,fog,clamp(fogAmount,0.,.86));col=pow(max(col,0.),vec3(.91));outColor=vec4(col,1.);}`;
const PLANT_VERT=`#version 300 es
precision highp float;
layout(location=0) in vec3 aShape;layout(location=1) in vec3 iPosition;layout(location=2) in vec4 iData;
uniform mat4 uVP;uniform float uTime,uWind,uSeason,uView;uniform vec3 uEye;
out vec3 vColor,vNormal,vWorld;out float vClip;
vec3 palette(int kind,float s){vec3 a=vec3(.59,.75,.36),b=vec3(.20,.44,.21),c=vec3(.79,.43,.13),d=vec3(.50,.48,.36);
if(kind==1){a=vec3(.65,.77,.40);b=vec3(.27,.53,.22);c=vec3(.88,.69,.25);d=vec3(.56,.52,.43);}if(kind==2){a=vec3(.61,.78,.34);b=vec3(.16,.38,.19);c=vec3(.75,.24,.14);d=vec3(.53,.47,.39);}
if(kind==3){a=vec3(.15,.32,.19);b=vec3(.13,.30,.22);c=vec3(.17,.27,.21);d=vec3(.18,.33,.30);}if(kind==4){a=vec3(.49,.68,.33);b=vec3(.21,.47,.25);c=vec3(.70,.59,.24);d=vec3(.49,.51,.40);}
if(kind==5){a=vec3(.41,.60,.27);b=vec3(.22,.47,.18);c=vec3(.53,.43,.20);d=vec3(.70,.74,.69);}
if(kind==6){a=vec3(.93,.70,.66);b=vec3(.46,.62,.45);c=vec3(.67,.46,.27);d=vec3(.88,.90,.87);}
int idx=int(floor(s));float f=smoothstep(0.,1.,fract(s));vec3 x=idx==0?a:idx==1?b:idx==2?c:d;vec3 y=idx==0?b:idx==1?c:idx==2?d:a;return mix(x,y,f);}
void main(){int kind=int(iData.z+.1);float s=mod(uSeason,4.);float density=kind==3?1.:(kind==5?mix(mix(.9,1.,smoothstep(0.,1.,s)),.08,smoothstep(2.55,3.,s)):(kind==6?mix(.78,.04,smoothstep(0.,1.,s)):(1.-.975*smoothstep(2.25,3.,s))));
float near=distance(iPosition.xz,uEye.xz);float cull=1.-step(uView,near);float size=iData.x*density*cull;
float angle=iData.y;float sn=sin(angle),cs=cos(angle);vec3 local=vec3(aShape.x*cs-aShape.z*sn,aShape.y,aShape.x*sn+aShape.z*cs)*size;
float gust=sin(uTime*.85+iPosition.x*.04+iPosition.z*.034)*.61+sin(uTime*2.05+iPosition.x*.18-iPosition.z*.16+iData.y)*.39;
local.x+=uWind*gust*max(aShape.y,0.)*size*.24;local.z+=uWind*gust*max(aShape.y,0.)*size*.09;
vec3 p=iPosition+local;vWorld=p;vColor=palette(kind,s)*(iData.w*.32+.79);vNormal=normalize(vec3(.15+sn*.36,.8+abs(aShape.y)*.1,.17+cs*.38));vClip=density*cull;
gl_Position=uVP*vec4(p,1.);}`;
const PLANT_FRAG=`#version 300 es
precision highp float;in vec3 vColor,vNormal,vWorld;in float vClip;out vec4 outColor;uniform float uRain,uFog;uniform vec3 uEye;uniform float uSeason;
void main(){if(vClip<.015)discard;float lit=clamp(dot(normalize(vNormal),normalize(vec3(-.39,.84,.45)))*.55+.53,.32,1.2);vec3 c=vColor*lit*(1.-uRain*.20);float fog=1.-exp(-pow(length(vWorld.xz-uEye.xz)*uFog*.015,1.6));vec3 f=mix(vec3(.66,.72,.64),vec3(.63,.70,.73),smoothstep(2.,3.8,uSeason));f=mix(f,vec3(.40,.48,.52),uRain*.5);c=mix(c,f,clamp(fog,0.,.86));outColor=vec4(pow(c,vec3(.91)),1.);}`;
const SKY_VERT=`#version 300 es
precision highp float;layout(location=0) in vec2 aPos;out vec2 vUV;void main(){vUV=aPos*.5+.5;gl_Position=vec4(aPos,0.,1.);}`;
const SKY_FRAG=`#version 300 es
precision highp float;in vec2 vUV;out vec4 frag;uniform float uSeason,uRain,uTime;
void main(){float t=clamp(vUV.y,0.,1.);float winter=smoothstep(2.1,3.0,uSeason);vec3 top=mix(vec3(.22,.42,.48),vec3(.47,.58,.66),winter);vec3 base=mix(vec3(.79,.79,.66),vec3(.78,.81,.82),winter);vec3 sky=mix(base,top,pow(t,.72));float haze=exp(-pow((t-.43)*5.,2.));sky=mix(sky,vec3(.77,.80,.72),haze*.22);vec2 sun=vec2(.72,.77);float glow=exp(-distance(vUV,sun)*13.);sky+=vec3(.78,.61,.34)*glow*.42;sky=mix(sky,vec3(.24,.34,.41),uRain*.57);frag=vec4(sky,1.);}`;
const RAIN_VERT=`#version 300 es
precision highp float;layout(location=0) in vec4 aRain;uniform mat4 uVP;uniform float uTime;uniform vec3 uEye;out float vFade;
void main(){float fall=mod(aRain.z*18.-uTime*(22.+aRain.w*15.),21.);vec3 p=uEye+vec3(aRain.x*34.-17.,fall-7.5,aRain.y*38.-19.);p.y-=float(gl_VertexID%2)*.9;vFade=.40+.5*aRain.w;gl_Position=uVP*vec4(p,1.);}`;
const RAIN_FRAG=`#version 300 es
precision highp float;in float vFade;out vec4 frag;void main(){frag=vec4(.75,.84,.88,vFade*.46);}`;
function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}
function program(v,f){const p=gl.createProgram();gl.attachShader(p,shader(gl.VERTEX_SHADER,v));gl.attachShader(p,shader(gl.FRAGMENT_SHADER,f));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));return p}
let worldP,plantP,skyP,rainP;try{worldP=program(VERT,FRAG);plantP=program(PLANT_VERT,PLANT_FRAG);skyP=program(SKY_VERT,SKY_FRAG);rainP=program(RAIN_VERT,RAIN_FRAG)}catch(e){errEl.style.display='block';errEl.textContent='No se pudieron iniciar los shaders: '+e.message;throw e}
const uniform=(p,n)=>gl.getUniformLocation(p,n),setF=(p,n,v)=>gl.uniform1f(uniform(p,n),v),setV=(p,n,v)=>gl.uniform3fv(uniform(p,n),v),setM=(p,n,v)=>gl.uniformMatrix4fv(uniform(p,n),false,v);
const world={vertices:[],triangles:0},terrain={vertices:[],triangles:0},water={vertices:[],triangles:0},shadows={vertices:[],triangles:0};
function point(P,N,C,K=0,A=0,B=0,D=0){return [...P,...N,...C,K,A,B,D]}
function tri(buf,a,b,c){buf.vertices.push(...a,...b,...c);buf.triangles++}
function quad(buf,a,b,c,d){tri(buf,a,b,c);tri(buf,a,c,d)}
function cross(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]}
function sub(a,b){return [a[0]-b[0],a[1]-b[1],a[2]-b[2]]}
function normalize(v){const l=Math.hypot(...v)||1;return v.map(x=>x/l)}
function surface(buf,pts,col,k=0,meta=[0,0,0]){const n=normalize(cross(sub(pts[1],pts[0]),sub(pts[2],pts[0])));tri(buf,...pts.map(p=>point(p,n,col,k,...meta)))}
function tube(buf,A,B,rA,rB,color,n=7,kind=0){const axis=normalize(sub(B,A)),reference=Math.abs(axis[1])>.9?[1,0,0]:[0,1,0],u=normalize(cross(axis,reference)),v=normalize(cross(u,axis));let bottom=[],top=[];
 for(let i=0;i<n;i++){const a=i/n*Math.PI*2,side=[u[0]*Math.cos(a)+v[0]*Math.sin(a),u[1]*Math.cos(a)+v[1]*Math.sin(a),u[2]*Math.cos(a)+v[2]*Math.sin(a)];bottom.push([A[0]+side[0]*rA,A[1]+side[1]*rA,A[2]+side[2]*rA]);top.push([B[0]+side[0]*rB,B[1]+side[1]*rB,B[2]+side[2]*rB]);}
 for(let i=0;i<n;i++){const j=(i+1)%n;surface(buf,[bottom[i],top[j],top[i]],color,kind,[rB,0,0]);surface(buf,[bottom[i],bottom[j],top[j]],color,kind,[rB,0,0]);}}
const TERRAIN_SIZE=214,TERRAIN_N=174;
for(let z=0;z<TERRAIN_N;z++){const z0=-TERRAIN_SIZE/2+(z/TERRAIN_N)*TERRAIN_SIZE,z1=-TERRAIN_SIZE/2+((z+1)/TERRAIN_N)*TERRAIN_SIZE;
 for(let x=0;x<TERRAIN_N;x++){const x0=-TERRAIN_SIZE/2+x/TERRAIN_N*TERRAIN_SIZE,x1=-TERRAIN_SIZE/2+(x+1)/TERRAIN_N*TERRAIN_SIZE;
 const a=[x0,terrainHeight(x0,z0),z0],b=[x0,terrainHeight(x0,z1),z1],c=[x1,terrainHeight(x1,z1),z1],d=[x1,terrainHeight(x1,z0),z0];const slope=Math.abs(a[1]-c[1])*.7,moisture=Math.max(0,1-riverDistance(x0,z0)/20),colour=[.92+Math.sin(x0*2+z0)*.06,.95, .88+Math.sin(x0*.8-z0)*.09];
 const n=normalize(cross(sub(b,a),sub(c,a)));const vert=p=>point(p,n,colour,6,slope,moisture,0);quad(terrain,vert(a),vert(b),vert(c),vert(d));}}
const WATER_SEG=240;
for(let z=0;z<WATER_SEG;z++){const z0=-106+212*z/WATER_SEG,z1=-106+212*(z+1)/WATER_SEG;for(let j=0;j<9;j++){const t0=j/9*2-1,t1=(j+1)/9*2-1;const pos=(z,t)=>[riverX(z)+t*riverWidth(z)*.82,waterHeight(z)+.013*Math.sin(t*3),z];const n=[0,1,0],col=[.18,.43,.41],vert=p=>point(p,n,col,7);quad(water,vert(pos(z0,t0)),vert(pos(z0,t1)),vert(pos(z1,t1)),vert(pos(z1,t0)));}}
const trees=generateTrees(609061,245),rng=createRng(8419206);const plants={0:[],1:[],2:[],3:[],4:[],5:[],6:[]};
function plant(x,y,z,size,phase,species,shade){plants[species].push(x,y,z,size,phase,species,shade)}
const bark=[[.29,.24,.18],[.77,.79,.72],[.34,.29,.24],[.41,.29,.22],[.37,.35,.29]];
for(const tree of trees){const {x,y,z,height:h,species:k}=tree;const rad=k===3?h*.075:h*.056;const base=[x,y,z],top=[x,y+h*(k===3?.91:.72),z];if(k===3)tube(world,base,top,rad,rad*.33,bark[k],7);
 if(k===3){for(let n=0;n<165;n++){const t=rng(),angle=rng()*6.283,rr=(1-t)*h*.24*Math.sqrt(rng()),hh=h*(.27+t*.69);plant(x+Math.cos(angle)*rr,y+hh,z+Math.sin(angle)*rr,.55+rng()*.35,rng()*6.283,3,.72+rng()*.45)}let tiers=8;for(let a=0;a<tiers;a++){const t=a/tiers,yy=y+h*(.26+t*.69),spread=h*.30*(1-t*.78);for(let j=0;j<7;j++){const angle=j/7*Math.PI*2+a*.6,len=spread*(.78+rng()*.42);const s=[x,yy,z],tip=[x+Math.cos(angle)*len,yy-len*.23,z+Math.sin(angle)*len];tube(world,s,tip,.115*(1-t*.6),.02,bark[k],4);for(let q=0;q<4;q++){const u=q/4+.12,center=[x+Math.cos(angle)*len*u,yy-len*.23*u,z+Math.sin(angle)*len*u],r=len*(.14+.08*(1-u));const dir=[-Math.sin(angle),0,Math.cos(angle)],up=[0,1,0];const p1=[center[0]+dir[0]*r,center[1]-.13,center[2]+dir[2]*r],p2=[center[0]-dir[0]*r,center[1]-.13,center[2]-dir[2]*r],tip2=[center[0]+up[0]*r,center[1]+r*.9,center[2]+up[2]*r];surface(world,[p1,tip2,p2],[.13+rng()*.09,.25+rng()*.1,.17],2,[.7,0,0]);}}}}
 else {buildBroadleaf(tree,{branch:(a,b,ra,rb,col,n)=>tube(world,a,b,ra,rb,col,n),leaf:plant},Math.hypot(x-6,z-18)<48?1:.58);}
 // A soft ground-contact penumbra, shaped to match the surface instead of a floating disc.
 const r=rad*3.5;for(let q=0;q<10;q++){const angle=q/10*6.283,next=(q+1)/10*6.283;let aa=[x+Math.cos(angle)*r,terrainHeight(x+Math.cos(angle)*r,z+Math.sin(angle)*r)+.03,z+Math.sin(angle)*r],bb=[x+Math.cos(next)*r,terrainHeight(x+Math.cos(next)*r,z+Math.sin(next)*r)+.03,z+Math.sin(next)*r],cc=[x,y+.032,z];const n=[0,1,0],v=p=>point(p,n,[.035,.06,.039],8,.78,0,0);tri(shadows,v(cc),v(aa),v(bb));}
}
// Small understory: a deterministic distribution of real instanced plant blades.
for(let i=0;i<10500;i++){let x=(rng()*2-1)*105,z=(rng()*2-1)*105,d=riverDistance(x,z);if(d<riverWidth(z)+.35)continue;const yy=terrainHeight(x,z),s=.24+rng()*.55;plant(x,yy+.015,z,s,rng()*6.283,5,.60+rng()*.55);
 if(i%35===0){plant(x,yy+.19,z,.14+rng()*.11,rng()*6.283,6,.8+rng()*.4);}}
// scattered field stones with irregular silhouettes, not physics-free hovering props.
for(let i=0;i<190;i++){const x=(rng()*2-1)*103,z=(rng()*2-1)*103;if(riverDistance(x,z)<riverWidth(z)-1)continue;const y=terrainHeight(x,z)-.13,rx=.36+rng()*1.1,rz=.3+rng()*.9,ry=.20+rng()*.53;const peak=[x,y+ry,z],color=[.38+rng()*.08,.40+rng()*.10,.37+rng()*.07];for(let j=0;j<9;j++){const a=j/9*6.283,b=(j+1)/9*6.283,pa=[x+rx*Math.cos(a),y, z+rz*Math.sin(a)],pb=[x+rx*Math.cos(b),y,z+rz*Math.sin(b)];surface(world,[pa,peak,pb],color,0);}}
function createWorld(buf){const vao=gl.createVertexArray();gl.bindVertexArray(vao);const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(buf.vertices),gl.STATIC_DRAW);const stride=13*4;for(const [idx,size,offset] of [[0,3,0],[1,3,12],[2,3,24],[3,4,36]]){gl.enableVertexAttribArray(idx);gl.vertexAttribPointer(idx,size,gl.FLOAT,false,stride,offset)}gl.bindVertexArray(null);return{vao,count:buf.vertices.length/13,tris:buf.triangles}}
const gpuWorld=[createWorld(terrain),createWorld(shadows),createWorld(world),createWorld(water)];
function shapeFor(species){if(species===5)return [[-.07,0,0],[0,1.5,.05],[.1,0,0],[-.04,.16,.08],[.03,1.1,.08],[.13,.13,.05]];
 if(species===6)return [[-.68,-.15,0],[0,.7,.05],[.68,-.12,0],[-.4,.15,.08],[.27,.51,0],[.38,-.3,.06]];
 const a=species===1?.48:species===4?.42:.65;const tip=species===2?1.1:.82;
 return [[-a,-.12,0],[0,tip,.02],[a,-.12,0],[-a,-.12,0],[a,-.12,0],[0,-.46,0],[-a*.75,.02,.04],[0,tip,.02],[a*.75,.02,.04]];}
function createPlant(species){const array=plants[species],vao=gl.createVertexArray();gl.bindVertexArray(vao);const geo=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,geo);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(shapeFor(species).flat()),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,0,0);
 const instances=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,instances);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(array),gl.DYNAMIC_DRAW);gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,7*4,0);gl.vertexAttribDivisor(1,1);gl.enableVertexAttribArray(2);gl.vertexAttribPointer(2,4,gl.FLOAT,false,7*4,3*4);gl.vertexAttribDivisor(2,1);
 gl.bindVertexArray(null);return{vao,vertices:shapeFor(species).length,instances:array.length/7,species,buffer:instances,source:new Float32Array(array),visible:0,lod:{near:0,mid:0,far:0}};}
const gpuPlants=Object.keys(plants).map(x=>createPlant(+x));
let lodX=Infinity,lodZ=Infinity,lodQuality='';
function refreshLOD(){
 for(const p of gpuPlants){
  const selected=selectInstances(p.source,camera,QUALITY[quality],p.species);
  gl.bindBuffer(gl.ARRAY_BUFFER,p.buffer);gl.bufferSubData(gl.ARRAY_BUFFER,0,selected.data);
  p.visible=selected.count;p.lod={near:selected.near,mid:selected.mid,far:selected.far};
 }
 lodX=camera.x;lodZ=camera.z;lodQuality=quality;
}
let rainy=false,windy=true,quality=innerWidth<781?'eco':'balanced',season=1,targetSeason=1,tour=false,yaw=-.32,pitch=-.065;
const camera={x:6,z:18,y:terrainHeight(6,18)+1.67};const keys={},stick={x:0,y:0},locationSequence=[{x:6,z:18,yaw:-.32},{x:7,z:8,yaw:-.54},{x:4,z:-3,yaw:-.60},{x:6,z:-17,yaw:-.80},{x:13,z:-28,yaw:-.42},{x:6,z:18,yaw:-.32}];let tourT=0,tourSpeed=0.025;
function perspective(fov,aspect,near,far){const f=1/Math.tan(fov/2),r=1/(near-far);return [f/aspect,0,0,0,0,f,0,0,0,0,(far+near)*r,-1,0,0,2*far*near*r,0]}
function lookAt(eye,target){let f=normalize(sub(target,eye)),s=normalize(cross(f,[0,1,0])),u=cross(s,f);return [s[0],u[0],-f[0],0,s[1],u[1],-f[1],0,s[2],u[2],-f[2],0,-s[0]*eye[0]-s[1]*eye[1]-s[2]*eye[2],-u[0]*eye[0]-u[1]*eye[1]-u[2]*eye[2],f[0]*eye[0]+f[1]*eye[1]+f[2]*eye[2],1]}
function mul(A,B){const out=Array(16).fill(0);for(let j=0;j<4;j++)for(let i=0;i<4;i++)for(let k=0;k<4;k++)out[i+j*4]+=A[i+k*4]*B[k+j*4];return out}
function blocked(x,z){if(Math.abs(x)>101||Math.abs(z)>101)return true;for(const t of trees){if(Math.abs(t.x-x)>2||Math.abs(t.z-z)>2)continue;if(Math.hypot(t.x-x,t.z-z)<.85+t.height*.026)return true}return false}
function navigate(dx,dz,dt){const speed=dt*5.7,px=camera.x+dx*speed,pz=camera.z+dz*speed;if(!blocked(px,camera.z))camera.x=px;if(!blocked(camera.x,pz))camera.z=pz;}
let drag=null;canvas.addEventListener('pointerdown',e=>{if(e.clientX<innerWidth*.26&&innerWidth<781)return;drag={x:e.clientX,y:e.clientY,id:e.pointerId};canvas.setPointerCapture(e.pointerId);tour=false;document.getElementById('tour').setAttribute('aria-pressed','false')});canvas.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;yaw-=dx*.0030;pitch=Math.max(-1.0,Math.min(.75,pitch-dy*.0024))});canvas.addEventListener('pointerup',()=>drag=null);canvas.addEventListener('pointercancel',()=>drag=null);
window.addEventListener('keydown',e=>{if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft'].includes(e.code))e.preventDefault();keys[e.code]=true});window.addEventListener('keyup',e=>keys[e.code]=false);
const joystick=document.getElementById('joystick'),stickEl=document.getElementById('stick');const stickMove=e=>{const b=joystick.getBoundingClientRect(),x=e.clientX-(b.left+b.width/2),y=e.clientY-(b.top+b.height/2),l=Math.max(1,Math.hypot(x,y)),r=Math.min(40,l);stick.x=x/l*r/40;stick.y=y/l*r/40;stickEl.style.transform=`translate(${stick.x*40}px,${stick.y*40}px)`};joystick.addEventListener('pointerdown',e=>{joystick.setPointerCapture(e.pointerId);stickMove(e);tour=false});joystick.addEventListener('pointermove',e=>{if(joystick.hasPointerCapture(e.pointerId))stickMove(e)});function clearStick(){stick.x=stick.y=0;stickEl.style.transform='translate(0,0)'}joystick.addEventListener('pointerup',clearStick);joystick.addEventListener('pointercancel',clearStick);
for(const b of document.querySelectorAll('[data-season]'))b.addEventListener('click',()=>{targetSeason=+b.dataset.season;document.querySelectorAll('[data-season]').forEach(v=>v.setAttribute('aria-pressed',String(v===b)));document.getElementById('caption').textContent=['Renacer entre flores y brotes nuevos.','Un mismo valle. Cuatro maneras de respirar.','El viento guarda el color del año.','Las ramas recuerdan el paisaje.'][targetSeason]});
document.getElementById('rain').addEventListener('click',e=>{rainy=!rainy;e.currentTarget.setAttribute('aria-pressed',String(rainy))});document.getElementById('wind').addEventListener('click',e=>{windy=!windy;e.currentTarget.setAttribute('aria-pressed',String(windy))});document.getElementById('quality').value=quality;document.getElementById('quality').addEventListener('change',e=>{quality=e.target.value;resize();lodQuality=''});document.getElementById('tour').addEventListener('click',e=>{tour=!tour;tourT=0;e.currentTarget.setAttribute('aria-pressed',String(tour));e.currentTarget.textContent=tour?'❚❚ Detener recorrido':'▶ Recorrer el valle'});
const rainArray=[];for(let i=0;i<1000;i++){const x=rng(),z=rng(),phase=rng(),s=rng();rainArray.push(x,z,phase,s,x,z,phase,s)}
const rainVAO=gl.createVertexArray();gl.bindVertexArray(rainVAO);const rainBuf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,rainBuf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(rainArray),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,4,gl.FLOAT,false,0,0);
const skyVAO=gl.createVertexArray();gl.bindVertexArray(skyVAO);const skyBuf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,skyBuf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);gl.bindVertexArray(null);
function resize(){const q=QUALITY[quality],dpr=Math.min(q.dpr,window.devicePixelRatio||1),w=Math.round(canvas.clientWidth*dpr),h=Math.round(canvas.clientHeight*dpr);canvas.width=Math.max(1,w);canvas.height=Math.max(1,h);gl.viewport(0,0,w,h)}window.addEventListener('resize',resize);resize();gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
let last=performance.now(),frames=0,lastFps=performance.now(),fps=0,now=0;
function frame(t){const dt=Math.min(.06,(t-last)*.001||.016);last=t;now=t*.001;
 const delta=((targetSeason-season+6)%4)-2;season=(season+delta*Math.min(1,dt*1.9)+4)%4;
 if(tour){tourT+=dt*tourSpeed*12;const seg=Math.floor(tourT)%5,a=locationSequence[seg],b=locationSequence[seg+1],f=tourT%1,lerp=f*f*(3-2*f);camera.x=a.x+(b.x-a.x)*lerp;camera.z=a.z+(b.z-a.z)*lerp;yaw=a.yaw+(b.yaw-a.yaw)*lerp;pitch=-.04;if(tourT>=5)tourT=0}
 else{const forward=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0)-stick.y;const side=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0)+stick.x;const len=Math.max(1,Math.hypot(forward,side));navigate((Math.sin(yaw)*forward+Math.cos(yaw)*side)/len,(-Math.cos(yaw)*forward+Math.sin(yaw)*side)/len,dt)}
 if(lodQuality!==quality||Math.hypot(camera.x-lodX,camera.z-lodZ)>1.6)refreshLOD();
 const eyeHeight=terrainHeight(camera.x,camera.z)+1.67;camera.y+=(eyeHeight-camera.y)*Math.min(1,dt*8);
 const eye=[camera.x,camera.y,camera.z],dir=[Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch)];const view=lookAt(eye,[eye[0]+dir[0],eye[1]+dir[1],eye[2]+dir[2]]),proj=perspective(Math.PI/3.1,canvas.width/canvas.height,.08,230),vp=mul(proj,view);
 gl.disable(gl.DEPTH_TEST);gl.depthMask(false);gl.useProgram(skyP);setF(skyP,'uSeason',season);setF(skyP,'uRain',rainy?1:0);setF(skyP,'uTime',now);gl.bindVertexArray(skyVAO);gl.drawArrays(gl.TRIANGLES,0,3);
 gl.enable(gl.DEPTH_TEST);gl.depthMask(true);const q=QUALITY[quality];gl.useProgram(worldP);setM(worldP,'uVP',vp);setF(worldP,'uTime',now);setF(worldP,'uSeason',season);setF(worldP,'uWind',windy?1:0);setF(worldP,'uRain',rainy?1:0);setF(worldP,'uView',q.distance);setF(worldP,'uFog',rainy?1.5:.85);setV(worldP,'uEye',eye);
 gl.bindVertexArray(gpuWorld[0].vao);gl.drawArrays(gl.TRIANGLES,0,gpuWorld[0].count);
 gl.depthMask(false);gl.bindVertexArray(gpuWorld[1].vao);gl.drawArrays(gl.TRIANGLES,0,gpuWorld[1].count);gl.depthMask(true);
 gl.bindVertexArray(gpuWorld[2].vao);gl.drawArrays(gl.TRIANGLES,0,gpuWorld[2].count);
 gl.bindVertexArray(gpuWorld[3].vao);gl.drawArrays(gl.TRIANGLES,0,gpuWorld[3].count);
 gl.useProgram(plantP);setM(plantP,'uVP',vp);setF(plantP,'uTime',now);setF(plantP,'uWind',windy?1:0);setF(plantP,'uSeason',season);setF(plantP,'uRain',rainy?1:0);setF(plantP,'uView',q.distance);setF(plantP,'uFog',rainy?1.5:.85);setV(plantP,'uEye',eye);
 for(const p of gpuPlants){gl.bindVertexArray(p.vao);const ratio=p.species>=5?q.grasses:q.leaves;gl.drawArraysInstanced(gl.TRIANGLES,0,p.vertices,p.visible);}
 if(rainy){gl.useProgram(rainP);setM(rainP,'uVP',vp);setF(rainP,'uTime',now);setV(rainP,'uEye',eye);gl.bindVertexArray(rainVAO);gl.depthMask(false);gl.drawArrays(gl.LINES,0,Math.floor(rainArray.length/4*q.rain/2)*2);gl.depthMask(true)}
 gl.bindVertexArray(null);frames++;if(t-lastFps>650){fps=Math.round(frames*1000/(t-lastFps));frames=0;lastFps=t;const drawn=gpuPlants.reduce((sum,p)=>sum+p.visible,0);metricEl.innerHTML=`<b>${SEASONS[Math.round(season)%4]}</b> · ${rainy?'LLUVIA':'CIELO ABIERTO'}<br>${trees.length} ÁRBOLES · ${drawn.toLocaleString('es-AR')} INSTANCIAS<br>${fps} FPS · ${canvas.width} × ${canvas.height} · ${quality.toUpperCase()}`;
 window.__FOREST_DIAGNOSTICS__={status:'RENDERING',season,targetSeason,rainy,windy,quality,fps,drawnInstances:drawn,drawCalls:4+gpuPlants.length+(rainy?1:0)+1,pixelWidth:canvas.width,pixelHeight:canvas.height,camera:{...camera,yaw,pitch},treeCheck:validateTrees(trees),renderer:'WebGL2',nativeInstancing:true,cpuLODCulling:true,visibleLOD:gpuPlants.map(p=>({species:p.species,visible:p.visible,...p.lod}))};}
 requestAnimationFrame(frame)}
window.__FOREST_DIAGNOSTICS__={status:'INITIALIZED',treeCheck:validateTrees(trees)};requestAnimationFrame(frame);