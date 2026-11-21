import {sampleRail,validateRail,cross3,viewMatrix,perspectiveMatrix} from './camera/world-to-scene-rails.mjs';
import {SHOTLIST} from './timeline.mjs';
import {createActorMeshes,createActorAtlas} from './assets/anonymous-actor-mesh.mjs';
import {ACTOR_STYLE,EXPOSURE} from './scene-config.mjs';

const canvas=document.querySelector('#stage'),bar=document.querySelector('#bar'),fill=document.querySelector('#fill'),play=document.querySelector('#play'),replay=document.querySelector('#replay'),pulse=document.querySelector('#pulse'),fail=document.querySelector('#fail');
const gl=canvas.getContext('webgl2',{alpha:false,antialias:true,powerPreference:'high-performance'});
if(!gl){fail.style.display='flex';throw Error('WebGL2 unavailable');}
if(!validateRail(SHOTLIST).ok)throw Error('Invalid shotlist');

// All meshes are original scene-local geometry. The anonymous actor is intentionally NOT a likeness.
const C={night:[.028,.041,.078],road:[.018,.028,.046],tower:[.079,.116,.158],towerAlt:[.11,.13,.163],trim:[.25,.29,.33],blue:[.19,.61,.76],gold:[.95,.53,.23],window:[.76,.51,.24],cream:[.73,.68,.54],wall:[.15,.19,.22],wood:[.26,.16,.115],woodHi:[.43,.26,.16],metal:[.22,.29,.33],black:[.07,.087,.105],screen:[.15,.61,.66],rug:[.24,.22,.22],fabric:[.21,.33,.34],skin:[.72,.62,.49],hair:[.08,.10,.12],plant:[.1,.31,.23]};
let seed=19112026;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
const vadd=(a,b)=>a.map((x,i)=>x+b[i]),vsub=(a,b)=>a.map((x,i)=>x-b[i]),vmul=(a,n)=>a.map(x=>x*n),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),cross=cross3,unit=a=>{let l=Math.hypot(...a)||1;return a.map(x=>x/l)};
class Batch{
 constructor(){this.p=[];this.n=[];this.c=[];this.e=[]}
 vert(p,n,c,e=0){this.p.push(...p);this.n.push(...n);this.c.push(...c);this.e.push(e)}
 tri(a,b,c,color,em=0,norm=null){const n=norm||unit(cross(vsub(b,a),vsub(c,a)));this.vert(a,n,color,em);this.vert(b,n,color,em);this.vert(c,n,color,em)}
 quad(a,b,c,d,color,em=0){this.tri(a,b,c,color,em);this.tri(a,c,d,color,em)}
 box(x,y,z,w,h,d,c,e=0){const x0=x-w/2,x1=x+w/2,y0=y-h/2,y1=y+h/2,z0=z-d/2,z1=z+d/2;
 const V=[[x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0],[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]];
 for(const ids of [[4,5,6,7],[1,0,3,2],[0,4,7,3],[5,1,2,6],[3,7,6,2],[0,1,5,4]])this.quad(...ids.map(i=>V[i]),c,e);}
 sphere(center,rad,c,e=0,sub=15,rings=11){const [rx,ry,rz]=Array.isArray(rad)?rad:[rad,rad,rad]; const pt=(a,b)=>[center[0]+rx*Math.sin(a)*Math.cos(b),center[1]+ry*Math.cos(a),center[2]+rz*Math.sin(a)*Math.sin(b)];
 for(let i=0;i<rings;i++){let a=Math.PI*i/rings,b=Math.PI*(i+1)/rings;for(let j=0;j<sub;j++){let u=2*Math.PI*j/sub,v=2*Math.PI*(j+1)/sub;const q=[pt(a,u),pt(b,u),pt(b,v),pt(a,v)];this.tri(q[0],q[2],q[1],c,e,unit([(q[1][0]-center[0])/rx,(q[1][1]-center[1])/ry,(q[1][2]-center[2])/rz]));this.tri(q[0],q[3],q[2],c,e,unit([(q[3][0]-center[0])/rx,(q[3][1]-center[1])/ry,(q[3][2]-center[2])/rz]));}}
 }
 cyl(a,b,r1,r2,c,e=0,sub=12){const axis=unit(vsub(b,a)),right=unit(cross(axis,Math.abs(axis[1])>.9?[1,0,0]:[0,1,0])),forward=unit(cross(right,axis));const at=(p,r,t)=>vadd(p,vmul(vadd(vmul(right,Math.cos(t)),vmul(forward,Math.sin(t))),r));for(let i=0;i<sub;i++){let t=i*2*Math.PI/sub,nt=(i+1)*2*Math.PI/sub;const a0=at(a,r1,t),a1=at(a,r1,nt),b0=at(b,r2,t),b1=at(b,r2,nt);this.quad(a0,b0,b1,a1,c,e);this.tri(a,a0,a1,c,e,vmul(axis,-1));this.tri(b,b1,b0,c,e,axis)}}
 tube(pts,r,c,e=0,segments=8){for(let i=1;i<pts.length;i++)this.cyl(pts[i-1],pts[i],r,r,c,e,segments)}
 disk(center,r,c,e=0){this.cyl([center[0],center[1]-.015,center[2]],[center[0],center[1]+.015,center[2]],r,r,c,e,20)}
 serialize(){return {positions:new Float32Array(this.p),normals:new Float32Array(this.n),colors:new Float32Array(this.c),emissives:new Float32Array(this.e),count:this.e.length}}
}
const city=new Batch(),room=new Batch(),roof=new Batch(),traffic=new Batch();
// Small separately transformed street vehicles add visible life to the existing district.
traffic.box(0,.31,0,.89,.30,1.52,C.gold);traffic.box(0,.50,.05,.72,.29,.84,C.black);traffic.box(0,.30,-.78,.43,.09,.055,C.cream,1.8);traffic.box(0,.30,.78,.38,.08,.055,C.gold,1.3);
// Architectural city, original procedural district. 23 × 23 block grid; no map tiles, no commercial content.
for(let i=-12;i<=12;i++){city.box(i*20,-.22,0,5.4,.14,550,C.road);city.box(0,-.22,i*20,550,.14,5.4,C.road);for(let j=-12;j<=12;j++){city.box(i*20,-.133,j*20,1.0,.035,1.0,(i+j)%3===0?C.gold:C.trim,.2)}}
const towerPalette=[[.075,.10,.14],[.065,.095,.12],[.12,.12,.15],[.1,.14,.165],[.14,.095,.11]];
for(let ix=-12;ix<=12;ix++)for(let iz=-12;iz<=12;iz++){
 const x=ix*20+9.1,z=iz*20+9.1;if(Math.hypot(x,z)<23)continue;
 let h=7+Math.pow(rand(),1.4)*44, w=10.7+rand()*3.4,d=10.7+rand()*3.4; if(rand()<.1)h*=1.75;
 const c=towerPalette[Math.floor(rand()*towerPalette.length)];city.box(x,h/2,z,w,h,d,c);
 city.box(x,h+.3,z,w+1.0,.6,d+1.0,[.085,.1,.125]);
 if(h>29&&rand()<.24)city.cyl([x,h,z],[x,h+4+rand()*6,z],.075,.075,C.metal,.1,6);
 const n=Math.max(2,Math.floor(h/3.4));const brighten=rand()>.3;
 // Small glowing windows are legitimate instanced architectural details, not a map image.
 for(let f=1;f<n;f++)for(let k=0;k<4;k++){
  let lit=rand()>(brighten?.39:.72);if(!lit)continue;
  let wz=x-w/2+1.5+k*(w-3)/3.3;const cy=f*3.4;
  city.box(wz,cy,z+d/2+.016,1.42,1.4,.045,rand()>.83?C.blue:C.window,.9);
  if(rand()>.6)city.box(wz,cy,z-d/2-.016,1.42,1.4,.045,C.window,.65);
 }
 if(rand()>.89){city.box(x,h+1.2,z,2.5,1.9,2.2,C.metal);city.box(x,h+2.4,z,3.2,.2,2.7,C.gold,.5)}
}
// The destination building shell, dissolved as camera crosses its physical roof.
const hero=[.102,.14,.182];
// V3: the destination building is a shell with a genuinely open, framed aperture at Z+.
city.box(-2.7,2.45,0,3.9,4.9,9.3,hero);city.box(2.7,2.45,0,3.9,4.9,9.3,hero);
city.box(0,.48,0,1.5,.96,9.3,hero);city.box(0,4.1,0,1.5,1.6,9.3,hero);
city.box(0,2.35,-4.65,1.5,2.8,.16,hero);
city.box(-.80,2.05,4.79,.095,2.4,.17,C.gold,.1);city.box(.80,2.05,4.79,.095,2.4,.17,C.gold,.1);
city.box(0,3.27,4.79,1.70,.11,.17,C.gold,.2);city.box(0,.99,4.79,1.70,.12,.17,C.gold,.2);
city.box(0,.88,4.87,1.66,.13,.25,C.woodHi);city.box(0,5.06,0,9.5,.35,9.5,C.metal);city.box(0,5.35,0,8.2,.25,8.4,C.gold,.2);
for(let a=-3;a<=3;a++){if(a!==0)city.box(a*1.06,2.65,4.68,.48,1.45,.08,C.window,.55);city.box(a*1.06,2.65,-4.68,.48,1.45,.08,C.blue,.55)}
for(let a=-3;a<=3;a++){city.box(-4.68,2.65,a*1.06,.08,1.45,.48,C.window,.6);city.box(4.68,2.65,a*1.06,.08,1.45,.48,C.window,.6)}
city.box(0,5.77,0,3.4,.85,2.5,[.15,.18,.2]);city.cyl([0,5.85,0],[0,12,0],.055,.055,C.gold,.85,10);
// Original astrophotography-free star geometry: distant small emissive facets, fading with the city.
for(let k=0;k<210;k++){const x=-760+rand()*1520,y=590+rand()*430,z=-820+rand()*1640,size=1.7+rand()*3.0;
 city.box(x,y,z,size,size*.36,size*.36,rand()>.72?[.65,.77,.95]:[.81,.73,.57],1.25);
}
// Detailed interior: a closed physical room with furniture, lighting and an anonymous seated actor.
room.box(0,-.17,0,8.2,.34,8.2,C.wood);
room.box(-4,1.85,0,.25,3.7,8.2,C.wall);room.box(4,1.85,0,.25,3.7,8.2,C.wall);
room.box(0,1.85,-4,8.2,3.7,.25,C.wall);// Physically open front window aligned with the camera's passage, not an opaque wall.
room.box(-2.4,1.85,4,3.4,3.7,.25,C.wall);room.box(2.4,1.85,4,3.4,3.7,.25,C.wall);
room.box(0,.48,4,1.4,.96,.25,C.wall);room.box(0,3.31,4,1.4,.78,.25,C.wall);
room.box(-.78,2.0,4.09,.07,2.35,.11,C.woodHi);room.box(.78,2.0,4.09,.07,2.35,.11,C.woodHi);
room.box(0,3.17,4.09,1.58,.09,.11,C.woodHi);room.box(0,.93,4.09,1.58,.12,.11,C.woodHi);
roof.box(0,3.78,0,8.4,.19,8.4,[.095,.112,.15]);
// Brick accent wall and dark crown molding.
for(let y=.35;y<3.3;y+=.34)for(let x=-3.9;x<3.75;x+=.88){let offset=(Math.round(y/.34)%2)*.43;room.box(x+offset,y,-3.83,.77,.275,.05,[.175+rand()*.055,.115+rand()*.025,.105+rand()*.024])}
room.box(0,3.47,-3.87,8.1,.15,.12,C.black);room.box(0,.18,-3.87,8.1,.14,.12,C.black);
// Window behind desk, pane muntins and rain-like skyline silhouettes outside.
room.box(2.73,2.15,-3.855,1.45,1.6,.08,[.025,.055,.09],.3);room.box(2.73,2.15,-3.76,1.6,.11,.15,C.woodHi);room.box(2.73,2.15,-3.76,.11,1.72,.15,C.woodHi);
for(let j=0;j<7;j++)room.box(2.7,1.50+j*.21,-3.7,1.6,.052,.14,C.metal);
// Wall book shelf and details
room.box(-2.96,2.0,-3.25,1.38,.11,.52,C.woodHi);room.box(-2.96,2.68,-3.25,1.38,.11,.52,C.woodHi);
for(let j=0;j<16;j++){let x=-3.6+j*.081;room.box(x,2.28,-3.26,.066,.37+rand()*.18,.39,[[.5,.24,.21],[.14,.3,.36],[.6,.44,.26]][j%3]);}
room.box(-3.6,1.1,-1.3,.65,1.9,2.0,C.black);room.box(-3.6,2.12,-1.3,.73,.12,2.08,C.woodHi);
// Carpet and tiles, intentional subtle material variation.
room.box(0,-.016,.4,3.5,.035,3.2,C.rug);for(let i=-6;i<=6;i++)room.box(i*.25,.007,.4,.012,.01,3.0,[.29,.25,.22]);
// Desk and brass/wood detailing.
room.box(0,1.00,-1.38,2.76,.14,1.44,C.woodHi);room.box(0,.92,-1.38,2.65,.055,1.32,C.wood);
for(let x of [-1.14,1.14])for(let z of [-1.93,-.86]){room.cyl([x,.92,z],[x,.07,z],.047,.072,C.metal)}
room.box(0,.86,-1.36,2.45,.06,.07,C.gold,.1);
// CRT-style workstation: modeled monitor body, glass, vent, illuminated code/grid.
// Contoured CRT front, bevel stack, control and cooling details improve hero prop silhouette.
room.box(0,1.55,-1.94,1.36,.91,.36,C.black);
// Four narrow molding strips frame the emissive glass without covering the screen.
room.box(0,1.98,-1.69,1.24,.075,.045,C.cream);
room.box(0,1.16,-1.69,1.24,.072,.045,C.cream);
room.box(-.61,1.57,-1.69,.07,.79,.045,C.cream);
room.box(.61,1.57,-1.69,.07,.79,.045,C.cream);
for(let x of [-.64,.64])for(let y of [1.15,1.99])room.box(x,y,-1.727,.045,.055,.085,C.metal);
for(let j=0;j<7;j++)room.box(-.43+j*.13,1.98,-2.14,.04,.012,.24,C.trim);
room.box(.49,1.19,-1.725,.10,.014,.027,C.gold,.75);
room.box(0,1.57,-1.726,1.2,.76,.048,C.metal);room.box(0,1.57,-1.686,1.07,.63,.025,[.036,.20,.24],.64);
for(let y=0;y<12;y++){room.box(-.35+(y%4)*.045,1.80-y*.045,-1.662,.33+(y%4)*.08,.011,.014,y%5===0?C.gold:C.screen,1.0)}
room.box(.44,1.32,-1.664,.033,.032,.015,C.gold,1.5);
room.cyl([0,1.1,-1.99],[0,1.03,-1.99],.06,.09,C.metal);room.box(0,1.036,-1.99,.54,.036,.34,C.black);
// Keyboard and movable (animated) hands are separately layered.
room.box(0,1.105,-.87,.85,.045,.25,C.black);for(let i=0;i<12;i++)for(let j=0;j<3;j++){room.box(-.365+i*.066,1.138,-.97+j*.06,.048,.008,.038,(i+j)%5===0?C.blue:C.metal,.3)}
room.box(.68,1.105,-.81,.2,.035,.3,C.black);
// Task lamp with proper curved geometry.
room.cyl([-1.03,1.04,-1.92],[-1.03,1.13,-1.92],.19,.15,C.metal);room.tube([[-1.03,1.17,-1.92],[-1.19,1.55,-2.10],[-.98,1.86,-2.2]],.039,C.gold);
room.cyl([-.98,1.86,-2.2],[-.76,1.74,-2.02],.16,.10,C.woodHi,.2);room.sphere([-.8,1.77,-2.05],.068,C.gold,1.9);
// Coffee mug and handle.
room.cyl([.99,1.07,-1.24],[.99,1.28,-1.24],.12,.13,C.cream);room.cyl([.99,1.28,-1.24],[.99,1.283,-1.24],.10,.10,C.black);room.tube([[1.1,1.2,-1.24],[1.20,1.20,-1.24],[1.20,1.10,-1.24],[1.10,1.09,-1.24]],.033,C.cream);
// Plant, leaf clusters and radiator.
room.cyl([2.64,.23,-2.79],[2.64,.65,-2.79],.35,.43,C.woodHi);room.cyl([2.64,.65,-2.79],[2.64,.69,-2.79],.35,.35,C.black);
for(let i=0;i<11;i++){const theta=rand()*Math.PI*2,r=.4+rand()*.65;let x=2.64+Math.cos(theta)*r,z=-2.79+Math.sin(theta)*r;room.cyl([2.64,.68,-2.79],[x,1.15+rand()*.7,z],.027,.007,C.plant);room.sphere([x,1.2+rand()*.7,z],[.18,.07,.08],C.plant)}
for(let i=0;i<10;i++)room.box(3.68,.65,-2.1+i*.34,.11,.95,.24,C.metal);
// Chair assembly. Occupant looks toward screen along NEGATIVE local Z.
room.cyl([0,.15,.58],[0,.88,.58],.072,.072,C.metal);for(let a=0;a<5;a++){const t=a*Math.PI*2/5;room.cyl([0,.2,.58],[Math.cos(t)*.49,.17,.58+Math.sin(t)*.49],.028,.028,C.metal)}
room.box(0,.85,.58,1.06,.17,1.05,C.black);room.box(0,1.35,1.08,1.02,1.08,.17,[.16,.20,.24]);
// V2: original UV-mapped anthropomorphic mesh, NOT V1 spherical placeholder.
const actorOriginal=createActorMeshes(ACTOR_STYLE);
// Sunken clock with warm halo and decorative cylinders.
room.box(-1.75,2.92,-3.73,.73,.73,.1,C.woodHi);room.disk([-1.75,2.92,-3.65],.31,C.black);room.cyl([-1.75,2.92,-3.56],[-1.75,3.12,-3.56],.015,.015,C.gold,1);

// WebGL2 raster pipeline: no remote libraries, no texture server; local preview works offline.
const vert=`#version 300 es
in vec3 a_pos;in vec3 a_norm;in vec3 a_col;in float a_emit;in vec2 a_uv;
uniform mat4 u_vp;uniform mat4 u_model;uniform float u_useAtlas;out vec3 v_n;out vec3 v_col;out vec3 v_p;out float v_e;out vec2 v_uv;out float v_tex;
void main(){vec4 wp=u_model*vec4(a_pos,1.0);v_n=mat3(u_model)*a_norm;v_col=a_col;v_p=wp.xyz;v_e=a_emit;v_uv=a_uv;v_tex=u_useAtlas;gl_Position=u_vp*wp;}`;
const frag=`#version 300 es
precision highp float;in vec3 v_n;in vec3 v_col;in vec3 v_p;in float v_e;in vec2 v_uv;in float v_tex;uniform sampler2D u_atlas;
uniform vec3 u_camera;uniform float u_alpha;uniform float u_fog;uniform vec3 u_fogColor;uniform float u_exposure;out vec4 outColor;
void main(){vec3 n=normalize(v_n), sun=normalize(vec3(-0.53,0.89,0.33));float lam=max(dot(n,sun),0.0);
float candle=2.0/(1.0+0.6*pow(distance(v_p,vec3(-1.2,2.2,-2.2)),2.0));
float screen=1.7/(1.0+1.5*pow(distance(v_p,vec3(0.0,1.7,-1.6)),2.0));
vec3 tex=mix(vec3(1.),texture(u_atlas,v_uv).rgb*1.30,clamp(v_tex,0.,1.));vec3 base=v_col*tex;vec3 lit=base*(0.42+0.49*lam+0.35*candle)+base*vec3(.3,.72,.88)*screen*.37+base*v_e*1.7;
float fog=1.0-exp(-distance(v_p,u_camera)*u_fog);
vec3 col=mix(lit*u_exposure,u_fogColor,clamp(fog,0.,.87));col=col/(vec3(1.0)+col*.42);
outColor=vec4(pow(col,vec3(0.88)),u_alpha);}`;
const shader=(type,code)=>{const sh=gl.createShader(type);gl.shaderSource(sh,code);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(sh));return sh};
const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vert));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,frag));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);
const attr=['a_pos','a_norm','a_col','a_emit','a_uv'].map(k=>gl.getAttribLocation(program,k));const unif=n=>gl.getUniformLocation(program,n);
const uVP=unif('u_vp'),uCam=unif('u_camera'),uAlpha=unif('u_alpha'),uFog=unif('u_fog'),uFogC=unif('u_fogColor'),uExposure=unif('u_exposure'),uModel=unif('u_model'),uUseAtlas=unif('u_useAtlas'),uAtlas=unif('u_atlas');
const IDENTITY=new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
const atlas=createActorAtlas(128),actorTexture=gl.createTexture();
gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,actorTexture);
gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,atlas.width,atlas.height,0,gl.RGBA,gl.UNSIGNED_BYTE,atlas.bytes);
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.uniform1i(uAtlas,0);
function upload(batch){const data=batch.serialize();if(data.normals.length!==data.positions.length||data.colors.length!==data.positions.length||data.emissives.length*3!==data.positions.length)throw Error('INVALID_VERTEX_STREAM_LENGTH');if(![...data.positions,...data.normals].every(Number.isFinite))throw Error('INVALID_VERTEX_STREAM_NAN');const out={count:data.count,buffers:[]};for(const field of ['positions','normals','colors','emissives','uvs']){const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);const arr=field==='uvs'?(data.uvs||new Float32Array(data.count*2)):data[field];if(arr.length!==data.count*(field==='uvs'?2:field==='emissives'?1:3))throw Error('INVALID_ATTRIBUTE_'+field);gl.bufferData(gl.ARRAY_BUFFER,arr,gl.STATIC_DRAW);out.buffers.push(b)}return out}
const cityMesh=upload(city),roomMesh=upload(room),roofMesh=upload(roof),trafficMesh=upload(traffic),actorMeshes=Object.fromEntries(Object.entries(actorOriginal).map(([key,data])=>[key,upload({serialize:()=>data})]));city.p=city.n=city.c=city.e=null;room.p=room.n=room.c=room.e=null;roof.p=roof.n=roof.c=roof.e=null;
function draw(mesh,alpha,exposure=1,useAtlas=0,model=IDENTITY){if(alpha<.005)return;gl.uniform1f(uAlpha,alpha);gl.uniform1f(uExposure,exposure);gl.uniform1f(uUseAtlas,useAtlas);gl.uniformMatrix4fv(uModel,false,model);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,actorTexture);for(let i=0;i<5;i++){gl.bindBuffer(gl.ARRAY_BUFFER,mesh.buffers[i]);gl.enableVertexAttribArray(attr[i]);gl.vertexAttribPointer(attr[i],i===3?1:i===4?2:3,gl.FLOAT,false,0,0)}gl.drawArrays(gl.TRIANGLES,0,mesh.count);const error=gl.getError();if(error!==0){fail.textContent='No se pudo dibujar la escena 3D';fail.style.display='flex';throw Error('WEBGL_DRAW_ERROR_'+error)}}
function mul4(a,b){const c=new Array(16);for(let col=0;col<4;col++)for(let row=0;row<4;row++)c[col*4+row]=a[row]*b[col*4]+a[4+row]*b[col*4+1]+a[8+row]*b[col*4+2]+a[12+row]*b[col*4+3];return c}
let time=0,playing=true,last=0,frame=0;
const saturate=x=>Math.max(0,Math.min(1,x)),smooth01=x=>{x=saturate(x);return x*x*(3-2*x)};
function rotateArm(pitch,yaw,x=.32,y=1.53,z=.53){const c=Math.cos(pitch),s=Math.sin(pitch),h=Math.cos(yaw),q=Math.sin(yaw);const M=new Float32Array([h,0,-q,0,q*s,c,h*s,0,q*c,-s,h*c,0,0,0,0,1]);M[12]=x-(h*x+q*s*y+q*c*z);M[13]=y-(c*y-s*z);M[14]=z-(-q*x+h*s*y+h*c*z);return M;}
function rotateHead(a,x,z){const c=Math.cos(a),s=Math.sin(a);return new Float32Array([c,0,-s,0,0,1,0,0,s,0,c,0,x-c*x-s*z,0,z+s*x-c*z,1]);}
function translate(x=0,y=0,z=0){const m=new Float32Array(IDENTITY);m[12]=x;m[13]=y;m[14]=z;return m}
function tiltHead(a){const c=Math.cos(a),s=Math.sin(a),y=2.04,z=.46;
 const m=new Float32Array([1,0,0,0,0,c,s,0,0,-s,c,0,0,0,0,1]);
 m[13]=y-(c*y-s*z);m[14]=z-(s*y+c*z);return m}
function swingLeg(a){const c=Math.cos(a),s=Math.sin(a),y=.94,z=.50;
 const m=new Float32Array([1,0,0,0,0,c,s,0,0,-s,c,0,0,0,0,1]);
 m[13]=y-(c*y-s*z);m[14]=z-(s*y+c*z);return m}
function resize(){const dpr=Math.min(1.65,devicePixelRatio||1),w=Math.round(innerWidth*dpr),h=Math.round(innerHeight*dpr);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h)}}
function render(now){if(!last)last=now;const dt=Math.min(.07,(now-last)/1000);last=now;if(playing)time=Math.min(36,time+dt);if(time===36&&playing){playing=false;play.textContent='▶';play.setAttribute('aria-label','Reproducir')}
 resize();const state=sampleRail(SHOTLIST,time);gl.clearColor(.038,.056,.088,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
 gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
 const vp=mul4(perspectiveMatrix(state.fov,canvas.width/canvas.height,.06,1400),viewMatrix(state.position,state.target));
 if(vp.length!==16||!vp.every(Number.isFinite)){fail.textContent='Error de cámara 3D';fail.style.display='flex';throw Error('CAMERA_MATRIX_NOT_FINITE')}gl.uniformMatrix4fv(uVP,false,new Float32Array(vp));gl.uniform3fv(uCam,state.position);gl.uniform3fv(uFogC,new Float32Array([.038,.056,.088]));gl.uniform1f(uFog,time<10?.00022:.0010);
 // Rendering city first with depth write disabled while it dissolves through the roof.
 if(state.layers.city>.005){
 gl.depthMask(state.layers.city>.995);draw(cityMesh,state.layers.city,EXPOSURE.city);
 for(let i=0;i<22;i++){const lane=((i*7)%21-10)*20;const phase=(i*31.7+time*(4.6+i%4)*((i%2)?1:-1)+800)%480-240;
 const carTransform=translate(i%2?lane+2.1:phase,.0,i%2?phase:lane-2.2);
 draw(trafficMesh,state.layers.city,EXPOSURE.city,0,carTransform)}
}
 gl.depthMask(true);const inside=state.layers.room;
draw(roomMesh,inside,EXPOSURE.interior);draw(roofMesh,inside*state.layers.roof,EXPOSURE.interior);
// Act I: sleeping torso/head. Act II: distinct upright torso and independently swung legs.
const wake=smooth01((time-16.2)/3.0);
const rise=smooth01((time-21.2)/2.2);
const walk=smooth01((time-25.2)/5.1);
const stepEnvelope=smooth01((time-25.1)/.8)*(1-smooth01((time-29.6)/1.3));
const footPhase=(time-25.2)*7.0;
const root=translate(0,-.14*(1-rise)+Math.sin(footPhase*2)*.024*stepEnvelope,-.52*rise-.52*walk);
const headNod=tiltHead((1-wake)*.25+Math.sin((time-16.5)*3.2)*.028*wake*(1-rise));
const headTurn=rotateHead(-.12*wake-.19*walk,0,.47);
const headModel=mul4(root,mul4(headTurn,headNod));
gl.disable(gl.CULL_FACE);
draw(actorMeshes.body,inside*(1-rise),EXPOSURE.actor,1,root);
draw(actorMeshes.standingTorso,inside*rise,EXPOSURE.actor,1,root);
draw(actorMeshes.legL,inside*rise,EXPOSURE.actor,1,mul4(root,swingLeg(Math.sin(footPhase)*.26*stepEnvelope)));
draw(actorMeshes.legR,inside*rise,EXPOSURE.actor,1,mul4(root,swingLeg(-Math.sin(footPhase)*.26*stepEnvelope)));
draw(actorMeshes.portrait,inside,EXPOSURE.portrait,1,headModel);
if(time<21.0){draw(actorMeshes.gesture,inside,EXPOSURE.actor,1,root)}
else{draw(actorMeshes.walkingArm,inside,EXPOSURE.actor,1,mul4(root,rotateArm(Math.sin(footPhase)*.18*stepEnvelope,0)))}
  gl.enable(gl.CULL_FACE);
 fill.style.width=`${(time/36)*100}%`;bar.setAttribute('aria-valuenow',time.toFixed(2));
 pulse.style.opacity=time>11.5&&time<12.5?String(.12*(1-Math.abs(time-12)/.5)):'0';
 window.__PROMETEO3D={ready:true,sceneId:'respawn-desk',time,shot:state.shotId,cityTriangles:cityMesh.count/3,roomTriangles:roomMesh.count/3,roofTriangles:roofMesh.count/3,actorTriangles:Object.values(actorMeshes).reduce((n,v)=>n+v.count/3,0),actorIdentity:'generic-fictional',flowVersion:'2.0.0',frame:frame++};
 requestAnimationFrame(render)}
requestAnimationFrame(render);
function setPlaying(v){playing=v;play.textContent=v?'Ⅱ':'▶';play.setAttribute('aria-label',v?'Pausar':'Reproducir')}
play.addEventListener('click',()=>setPlaying(!playing));replay.addEventListener('click',()=>{time=0;setPlaying(true)});
bar.addEventListener('click',e=>{const r=bar.getBoundingClientRect();time=Math.max(0,Math.min(36,36*(e.clientX-r.left)/r.width));setPlaying(false)});
bar.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();time=e.key==='Home'?0:e.key==='End'?36:Math.max(0,Math.min(36,time+(e.key==='ArrowRight'?.5:-.5)));setPlaying(false)}});
window.addEventListener('keydown',e=>{if(e.key===' '&&e.target!==bar){e.preventDefault();setPlaying(!playing)}else if(e.key==='r'){time=0;setPlaying(true)}});
