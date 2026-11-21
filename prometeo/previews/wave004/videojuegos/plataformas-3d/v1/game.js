/* ISLAS DE PAPEL / PROMETEO · W4 VIDEOJUEGOS 01
 * Original WebGL2 scene, hand-illustrated Sori SVG, no runtime/CDN dependencies.
 * Isolated small vertical slice. Creative review belongs to the human, not a self-rating loop.
 */
(() => {
'use strict';
const $=id=>document.getElementById(id);
const canvas=$('world'), overlay=$('overlay'), title=$('overlay-title'), intro=$('overlay-body');
const gl=canvas.getContext('webgl2',{alpha:true,antialias:true,depth:true,premultipliedAlpha:false,powerPreference:'high-performance'});
if(!gl){$('webgl-error').hidden=false;overlay.hidden=true;return;}
let stopped=false;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const mix=(a,b,t)=>a+(b-a)*t;
const PI=Math.PI;
const rgba=(hex)=>{let n=parseInt(hex.replace('#',''),16);return [(n>>16&255)/255,(n>>8&255)/255,(n&255)/255];};
const v3=(x,y,z)=>[x,y,z];
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const norm=(a)=>{let l=Math.hypot(...a)||1;return a.map(q=>q/l);};
function perspective(fov,aspect,near,far){let f=1/Math.tan(fov/2),nf=1/(near-far);return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)*nf,-1,0,0,2*far*near*nf,0]);}
function lookAt(eye,center,up=[0,1,0]){let z=norm(sub(eye,center)), x=norm(cross(up,z)),y=cross(z,x);return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-(x[0]*eye[0]+x[1]*eye[1]+x[2]*eye[2]),-(y[0]*eye[0]+y[1]*eye[1]+y[2]*eye[2]),-(z[0]*eye[0]+z[1]*eye[1]+z[2]*eye[2]),1]);}
function model(pos=[0,0,0],angle=0,scale=[1,1,1]){let c=Math.cos(angle),s=Math.sin(angle),[x,y,z]=scale;return new Float32Array([c*x,0,-s*x,0,0,y,0,0,s*z,0,c*z,0,pos[0],pos[1],pos[2],1]);}
const vs=`#version 300 es
precision highp float;
layout(location=0) in vec3 aPos;layout(location=1) in vec3 aNorm;layout(location=2) in vec3 aColor;
uniform mat4 uProj,uView,uModel;out vec3 vColor,vNormal;out float vDistance;out vec3 vWorld;
void main(){vec4 w=uModel*vec4(aPos,1.);vWorld=w.xyz;vNormal=normalize(mat3(uModel)*aNorm);vColor=aColor;vec4 eye=uView*w;vDistance=length(eye.xyz);gl_Position=uProj*eye;}`;
const fs=`#version 300 es
precision highp float;
in vec3 vColor,vNormal,vWorld;in float vDistance;
uniform vec3 uFog;uniform float uGlow,uOpacity;out vec4 frag;
void main(){vec3 sun=normalize(vec3(-.5,.88,.62));float diffuse=max(dot(normalize(vNormal),sun),0.);float bounce=.62+diffuse*.47;vec3 col=vColor*bounce+vColor*uGlow;float fog=smoothstep(31.,91.,vDistance)*.84;col=mix(col,uFog,fog);frag=vec4(col,uOpacity);}`;
const spriteVS=`#version 300 es
precision highp float;
layout(location=0) in vec2 aPos;layout(location=1) in vec2 aUV;uniform mat4 uProj,uView;
uniform vec3 uCenter,uRight;uniform vec2 uSize;uniform float uTilt;out vec2 vUV;
void main(){vec2 p=aPos;float s=sin(uTilt),c=cos(uTilt);p=vec2(p.x*c-p.y*s,p.x*s+p.y*c);vec3 xyz=uCenter+uRight*p.x*uSize.x+vec3(0.,p.y*uSize.y,0.);gl_Position=uProj*uView*vec4(xyz,1.);vUV=aUV;}`;
const spriteFS=`#version 300 es
precision highp float;
in vec2 vUV;uniform sampler2D uImage;uniform float uFade;out vec4 frag;
void main(){vec4 c=texture(uImage,vUV);if(c.a<.04)discard;frag=vec4(c.rgb*.98,c.a*uFade);}`;
const shaders=[];
function shader(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));shaders.push(s);return s;}
function program(vertex,fragment){const p=gl.createProgram();gl.attachShader(p,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(p,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));return p;}
let solid,sprite;
try{solid=program(vs,fs);sprite=program(spriteVS,spriteFS);}catch(e){console.error(e);$('webgl-error').hidden=false;$('webgl-error').querySelector('p').textContent='Error de compilación de WebGL. '+e.message;overlay.hidden=true;return;}
const U=(p,name)=>gl.getUniformLocation(p,name);
const su={proj:U(solid,'uProj'),view:U(solid,'uView'),model:U(solid,'uModel'),fog:U(solid,'uFog'),glow:U(solid,'uGlow'),opacity:U(solid,'uOpacity')};
const tu={proj:U(sprite,'uProj'),view:U(sprite,'uView'),center:U(sprite,'uCenter'),right:U(sprite,'uRight'),size:U(sprite,'uSize'),tilt:U(sprite,'uTilt'),fade:U(sprite,'uFade'),image:U(sprite,'uImage')};
function pushVert(out,p,n,c){out.push(...p,...n,...c);}
function tri(out,a,b,c,col,normal){const n=normal||norm(cross(sub(b,a),sub(c,a)));pushVert(out,a,n,col);pushVert(out,b,n,col);pushVert(out,c,n,col);}
function quad(out,a,b,c,d,col,normal){tri(out,a,b,c,col,normal);tri(out,a,c,d,col,normal);}
function box(out,cx,cy,cz,w,h,d,color,topColor=color){let x=cx-w/2,X=cx+w/2,y=cy-h/2,Y=cy+h/2,z=cz-d/2,Z=cz+d/2;
quad(out,[x,Y,z],[X,Y,z],[X,Y,Z],[x,Y,Z],topColor,[0,1,0]);
quad(out,[x,y,Z],[X,y,Z],[X,Y,Z],[x,Y,Z],color,[0,0,1]);
quad(out,[X,y,z],[x,y,z],[x,Y,z],[X,Y,z],color,[0,0,-1]);
quad(out,[X,y,Z],[X,y,z],[X,Y,z],[X,Y,Z],color,[1,0,0]);
quad(out,[x,y,z],[x,y,Z],[x,Y,Z],[x,Y,z],color,[-1,0,0]);}
function polygon(out,points,col,normal){for(let i=1;i<points.length-1;i++)tri(out,points[0],points[i],points[i+1],col,normal);}
function cylinder(out,cx,y,cz,r,h,color,N=8){for(let i=0;i<N;i++){let a=i/N*2*PI,b=(i+1)/N*2*PI,A=[cx+Math.cos(a)*r,y,cz+Math.sin(a)*r],B=[cx+Math.cos(b)*r,y,cz+Math.sin(b)*r],C=[B[0],y+h,B[2]],D=[A[0],y+h,A[2]];quad(out,A,B,C,D,color);tri(out,[cx,y+h,cz],D,C,color,[0,1,0]);}}
function spike(out,cx,y,cz,r,h,color,N=5){for(let i=0;i<N;i++){let a=i/N*2*PI,b=(i+1)/N*2*PI;tri(out,[cx+Math.cos(a)*r,y,cz+Math.sin(a)*r],[cx+Math.cos(b)*r,y,cz+Math.sin(b)*r],[cx,y+h,cz],color);}}
function roundRect(cx,cz,w,d,r=0.65){let pts=[];for(let [x,z,offset] of [[cx+w/2-r,cz+d/2-r,0],[cx-w/2+r,cz+d/2-r,90],[cx-w/2+r,cz-d/2+r,180],[cx+w/2-r,cz-d/2+r,270]])for(let k=0;k<=3;k++){let a=(offset+k*30)*PI/180;pts.push([x+Math.cos(a)*r,z+Math.sin(a)*r]);}return pts;}
const islands=[
{x:0,z:0,w:8,d:5.6,y:0,seed:1},
{x:7.9,z:.5,w:5.9,d:4.8,y:.62,seed:2},
{x:15.3,z:-.65,w:6.1,d:4.5,y:1.04,seed:3},
{x:22.8,z:.5,w:5.8,d:4.9,y:.52,seed:4},
{x:30.5,z:0,w:6.5,d:5.6,y:.76,seed:5}
];
const palettes=[['#bdc6a3','#87a795','#607d72'],['#e9c998','#b6aa84','#8d8c72'],['#b6bda0','#8faaa0','#66897f'],['#d6c394','#9da88a','#668e7d'],['#c0c4a8','#8caa95','#68877d']].map(row=>row.map(rgba));
let staticVerts=[];
function islandGeo(I,index){const [top,side,rock]=palettes[index];const pts=roundRect(I.x,I.z,I.w,I.d,.75);let o=staticVerts;
for(let i=0;i<pts.length;i++){let a=pts[i],b=pts[(i+1)%pts.length];tri(o,[I.x,I.y-.01,I.z],[a[0],I.y,a[1]],[b[0],I.y,b[1]],top,[0,1,0]);}
// Rim band, tapered rocky base and floating bottom point.
for(let i=0;i<pts.length;i++){let a=pts[i],b=pts[(i+1)%pts.length],f=.91;const aT=[a[0],I.y-.09,a[1]],bT=[b[0],I.y-.09,b[1]],aB=[I.x+(a[0]-I.x)*f,I.y-.39,I.z+(a[1]-I.z)*f],bB=[I.x+(b[0]-I.x)*f,I.y-.39,I.z+(b[1]-I.z)*f];quad(o,aT,bT,bB,aB,side);let low=.62+Math.sin(i*5.12+I.seed)*.24;tri(o,aB,bB,[I.x+(a[0]-I.x)*.22,I.y-1.2-low,I.z+(a[1]-I.z)*.22],rock);}
// Surface paths are matte inlaid pieces, not stacks of cubes.
let marble=rgba(index%2?'#f5dcab':'#e9e7cb');const path=roundRect(I.x,I.z,I.w*.62,1.23,.35);for(let j=0;j<path.length;j++){let a=path[j],b=path[(j+1)%path.length];tri(o,[I.x,I.y+.012,I.z],[a[0],I.y+.012,a[1]],[b[0],I.y+.012,b[1]],marble,[0,1,0]);}
// Tiny carved edge studs, individual stone silhouettes, intentional irregularity.
for(let j=0;j<8;j++){let a=j*2*PI/8+index*.3,x=I.x+Math.cos(a)*(I.w*.40),z=I.z+Math.sin(a)*(I.d*.40),rr=.12+(j%3)*.04;spike(o,x,I.y+.016,z,rr,.16,rgba('#e9e3c9'),5);}
// Wildflower clusters at perimeter, kept clear of the playable center.
for(let j=0;j<16;j++){let f=(j*9.618+index*4.1)%1,s=j%4===0?1:-1,x=I.x+(f-.5)*(I.w-1.4),z=I.z+s*(I.d*.32+(j%3)*.12);flower(o,x,I.y+.03,z,j+index*16);}
}
function flower(o,x,y,z,n){const stem=rgba('#648875'),petal=rgba(n%4===0?'#ecb76b':n%4===1?'#f6e3b1':n%4===2?'#d98b79':'#e6d7c1'),h=.20+(n%5)*.048;
quad(o,[x-.016,y,z],[x+.016,y,z],[x+.016,y+h,z],[x-.016,y+h,z],stem,[0,0,1]);for(let j=0;j<5;j++){let a=2*PI*j/5,b=2*PI*(j+1)/5;tri(o,[x,y+h,z],[x+Math.cos(a)*.13,y+h+Math.sin(a)*.13,z],[x+Math.cos(b)*.13,y+h+Math.sin(b)*.13,z],petal,[0,0,1]);}}
for(let i=0;i<islands.length;i++)islandGeo(islands[i],i);
// Background archipelago: deliberately distant, no colliders.
for(let i=0;i<14;i++){let x=-18+i*5.6,z=-18-(i%4)*5,y=-5+Math.sin(i*1.3)*1.1,w=3.1+(i%3)*1.7;
let pts=roundRect(x,z,w,3+(i%4)*.7,.8),c=rgba(i%2?'#9bb3a9':'#acc8b7');for(let j=0;j<pts.length;j++){let a=pts[j],b=pts[(j+1)%pts.length];tri(staticVerts,[x,y,z],[a[0],y,a[1]],[b[0],y,b[1]],c,[0,1,0]);tri(staticVerts,[a[0],y,a[1]],[b[0],y,b[1]],[x,y-3,z],rgba('#8caaa1'));}}
// Landmark: stone gateway pillars, no invisible collision or misleading exit.
let end=islands[4];for(let z of [-1.9,1.9]){box(staticVerts,31.65,end.y+.42,z,.38,.84,.38,rgba('#829b8e'),rgba('#e5deb6'));box(staticVerts,31.65,end.y+.94,z,.53,.17,.53,rgba('#e2d4ad'));}
// Tiny directional markers with edge-readable bright tips.
for(let k=0;k<4;k++){let I=islands[k];let xx=I.x+I.w*.34;box(staticVerts,xx,I.y+.15,I.z-I.d*.24,.19,.3,.19,rgba('#637e75'));spike(staticVerts,xx,I.y+.29,I.z-I.d*.24,.22,.32,rgba('#efbe81'),4);}
function solidMesh(verts){let vao=gl.createVertexArray(),buffer=gl.createBuffer();gl.bindVertexArray(vao);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(verts),gl.STATIC_DRAW);for(let j=0;j<3;j++){gl.enableVertexAttribArray(j);gl.vertexAttribPointer(j,3,gl.FLOAT,false,36,j*12);}gl.bindVertexArray(null);return {vao,count:verts.length/9};}
const world=solidMesh(staticVerts);
function orbMesh(){let o=[];const colors=['#d85e59','#e8a176','#a44451'].map(rgba);let R=.48;for(let i=0;i<8;i++){let a=i*2*PI/8,b=(i+1)*2*PI/8,A=[R*Math.cos(a),0,R*Math.sin(a)],B=[R*Math.cos(b),0,R*Math.sin(b)];tri(o,A,B,[0,.87,0],colors[i%3]);tri(o,B,A,[0,-.70,0],colors[(i+1)%3]);}return solidMesh(o);}
function ringMesh(major,tube,color){let o=[];for(let i=0;i<40;i++){let a=i/40*2*PI,b=(i+1)/40*2*PI;for(let j=0;j<7;j++){let c=j/7*2*PI,d=(j+1)/7*2*PI;function pos(t,u){return [tube*Math.sin(u),Math.sin(t)*(major+tube*Math.cos(u)),Math.cos(t)*(major+tube*Math.cos(u))];}quad(o,pos(a,c),pos(b,c),pos(b,d),pos(a,d),color);}}return solidMesh(o);}
function starMesh(){let o=[],col=rgba('#f6d47e');for(let i=0;i<10;i++){let a=i*PI/5,b=(i+1)*PI/5,r=i%2?.3:.63,R=(i+1)%2?.3:.63;tri(o,[0,0,0],[Math.cos(a)*r,Math.sin(a)*r,0],[Math.cos(b)*R,Math.sin(b)*R,0],col,[0,0,1]);}return solidMesh(o);}
function circleMesh(r,color){let o=[];for(let i=0;i<28;i++){let a=i*PI/14,b=(i+1)*PI/14;tri(o,[0,0,0],[Math.cos(a)*r,0,Math.sin(a)*r],[Math.cos(b)*r,0,Math.sin(b)*r],color,[0,1,0]);}return solidMesh(o);}
const hazardMesh=orbMesh(), ring=ringMesh(1.14,.10,rgba('#f1d18f')),ring2=ringMesh(1.36,.035,rgba('#f5e6bb')),stars=starMesh(),shadow=circleMesh(.66,rgba('#48695f'));
const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([0,0,0,0]));
let imageReady=false;const img=new Image();img.onload=()=>{gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);gl.generateMipmap(gl.TEXTURE_2D);imageReady=true;};img.onerror=()=>{$('mini-note').textContent='El personaje no pudo cargarse';$('mini-note').classList.add('visible');};img.src='sori.svg';
const spriteVertices=new Float32Array([-0.5,-.5,0,0,.5,-.5,1,0,.5,.5,1,1,-.5,-.5,0,0,.5,.5,1,1,-.5,.5,0,1]);let sVAO=gl.createVertexArray(),sBuffer=gl.createBuffer();gl.bindVertexArray(sVAO);gl.bindBuffer(gl.ARRAY_BUFFER,sBuffer);gl.bufferData(gl.ARRAY_BUFFER,spriteVertices,gl.STATIC_DRAW);for(let j=0;j<2;j++){gl.enableVertexAttribArray(j);gl.vertexAttribPointer(j,2,gl.FLOAT,false,16,j*8);}gl.bindVertexArray(null);
let state='menu',t=0,last=0,frame=0,camYaw=2.71,camPitch=.52,camDist=11.5,camFocus=[0,.8,0],proj,view;
const player={x:-2.75,y:0,z:0,vx:0,vy:0,vz:0,ground:true,coyote:0,jumpBuffer:0,lastSafe:0,facing:0,run:0};
const pickups=[{x:7.4,z:.5,y:2.1},{x:15.5,z:-.6,y:2.5},{x:29.1,z:0,y:2.2}].map(x=>({...x,got:false}));
const input={keys:new Set(),joyX:0,joyY:0,jump:false};
const hazardAt=(i,time)=>{const I=islands[i===0?1:3];return {x:I.x+.1+Math.sin(time*(i===0?1.16:1.34)+i)*1.25,z:I.z+Math.cos(time*(i===0?1.14:1.07)+i)*1.25,y:I.y+1.0};};
function reset(){Object.assign(player,{x:-2.75,y:0,z:0,vx:0,vy:0,vz:0,ground:true,coyote:.12,jumpBuffer:0,lastSafe:0,run:0});pickups.forEach(p=>p.got=false);$('leaves').textContent='✦ ○ ○ ○';$('stage').textContent='01 / 05';$('guide').hidden=false;input.keys.clear();input.joyX=input.joyY=0;input.jump=false;resetStick();}
function start(){reset();state='play';overlay.hidden=true;canvas.focus({preventScroll:true});}
function screen(which){state=which;overlay.hidden=false;input.keys.clear();input.joyX=input.joyY=0;resetStick();if(which==='win'){ $('overlay-eyebrow').textContent='CAMINO COMPLETADO · 001';title.innerHTML='Un mundo<br><em>por descubrir.</em>';intro.textContent='Sori encontró el camino entre las nubes. '+pickups.filter(x=>x.got).length+' de 3 estrellas encontradas. Podés volver a recorrer las islas.';$('primary').innerHTML='VOLVER A JUGAR <span>↗</span>'; }else if(which==='fail'){$('overlay-eyebrow').textContent='OTRA OPORTUNIDAD · 001';title.innerHTML='Las nubes<br><em>te esperan.</em>';intro.textContent='Una caída o una centinela interrumpió el viaje. Cada salto es una historia nueva.';$('primary').innerHTML='REINTENTAR <span>↗</span>';}}
$('primary').addEventListener('click',start);
$('reset-camera').addEventListener('click',()=>{camYaw=2.71;camPitch=.52;camDist=11.5;});
const jump=()=>{if(state==='menu'){start();return;}if(state==='play')player.jumpBuffer=.16;};
$('jump').addEventListener('pointerdown',e=>{e.preventDefault();jump();});
window.addEventListener('keydown',e=>{let k=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright',' ','w','a','s','d','r','enter'].includes(k))e.preventDefault();input.keys.add(k);if((k===' '||k==='enter')&&!e.repeat){if(state==='play')jump();else start();}if(k==='r'&&state==='play')start();});
window.addEventListener('keyup',e=>input.keys.delete(e.key.toLowerCase()));
window.addEventListener('blur',()=>{input.keys.clear();input.joyX=input.joyY=0;resetStick();});
let joystickPointer=null;const stick=$('stick'),joy=$('joystick');
function resetStick(){stick.style.transform='translate(0px,0px)';}
function moveStick(e){let r=joy.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,dx=e.clientX-cx,dy=e.clientY-cy,max=42,len=Math.hypot(dx,dy),scale=Math.min(1,max/(len||1));dx*=scale;dy*=scale;input.joyX=dx/max;input.joyY=-dy/max;stick.style.transform=`translate(${dx}px,${dy}px)`;}
joy.addEventListener('pointerdown',e=>{e.preventDefault();if(joystickPointer!==null)return;joystickPointer=e.pointerId;joy.setPointerCapture(e.pointerId);moveStick(e);});
joy.addEventListener('pointermove',e=>{if(e.pointerId===joystickPointer)moveStick(e);});
function stopStick(e){if(e.pointerId!==joystickPointer)return;joystickPointer=null;input.joyX=input.joyY=0;resetStick();}
joy.addEventListener('pointerup',stopStick);joy.addEventListener('pointercancel',stopStick);joy.addEventListener('lostpointercapture',stopStick);
let cameraPointers=new Map(),prevPinch=0,moved=false;
canvas.addEventListener('pointerdown',e=>{if(state!=='play')return;e.preventDefault();cameraPointers.set(e.pointerId,{x:e.clientX,y:e.clientY});canvas.setPointerCapture(e.pointerId);prevPinch=0;moved=false;});
canvas.addEventListener('pointermove',e=>{if(!cameraPointers.has(e.pointerId)||state!=='play')return;const p=cameraPointers.get(e.pointerId),dx=e.clientX-p.x,dy=e.clientY-p.y;cameraPointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(Math.hypot(dx,dy)>1)moved=true;if(cameraPointers.size===1){camYaw=camYaw-dx*.006;camPitch=clamp(camPitch+dy*.004,.24,1.12);}else if(cameraPointers.size===2){const a=[...cameraPointers.values()],dist=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);if(prevPinch)camDist=clamp(camDist+(prevPinch-dist)*.02,6.6,16.5);prevPinch=dist;}});
function stopCam(e){cameraPointers.delete(e.pointerId);prevPinch=0;}
canvas.addEventListener('pointerup',stopCam);canvas.addEventListener('pointercancel',stopCam);canvas.addEventListener('lostpointercapture',stopCam);
function floorFor(x,z){let b=null;for(let i=0;i<islands.length;i++){const I=islands[i];if(x>=I.x-I.w/2+.22&&x<=I.x+I.w/2-.22&&z>=I.z-I.d/2+.22&&z<=I.z+I.d/2-.22){if(!b||I.y>b.y)b={...I,i};}}return b;}
let noteEnd=0;function note(msg){let el=$('mini-note');el.textContent=msg;el.classList.add('visible');noteEnd=t+1.7;}
function step(dt){if(state!=='play')return;
const x=((input.keys.has('d')||input.keys.has('arrowright'))?1:0)-((input.keys.has('a')||input.keys.has('arrowleft'))?1:0)+input.joyX;
const f=((input.keys.has('w')||input.keys.has('arrowup'))?1:0)-((input.keys.has('s')||input.keys.has('arrowdown'))?1:0)+input.joyY;
let len=Math.hypot(x,f),forward=[1,0],right=[0,-1],wx=0,wz=0;
if(len>.06){let mult=Math.min(1,len)/len;wx=(forward[0]*f+right[0]*x)*mult;wz=(forward[1]*f+right[1]*x)*mult;}
const speed=5.7,a=1-Math.exp(-(player.ground?15:6)*dt);player.vx=mix(player.vx,wx*speed,a);player.vz=mix(player.vz,wz*speed,a);
player.run=mix(player.run,Math.min(1,len),1-Math.exp(-dt*9));if(len>.06)player.facing=Math.atan2(player.vz,player.vx);
player.jumpBuffer=Math.max(0,player.jumpBuffer-dt);player.coyote=Math.max(0,player.coyote-dt);
if(player.ground)player.coyote=.12;
if(player.jumpBuffer>0&&player.coyote>0){player.vy=7.9;player.ground=false;player.coyote=0;player.jumpBuffer=0;note('¡Buen salto!');}
let prevY=player.y;player.vy-=19.2*dt;player.x+=player.vx*dt;player.z+=player.vz*dt;player.y+=player.vy*dt;
let floor=floorFor(player.x,player.z);
if(floor&&player.vy<=0&&prevY>=floor.y-.15&&player.y<=floor.y){player.y=floor.y;player.vy=0;player.ground=true;player.lastSafe=floor.i;}else{player.ground=false;}
if(player.y < -7.5){screen('fail');return;}
const close=islands.reduce((best,I,i)=>Math.abs(player.x-I.x)<Math.abs(player.x-islands[best].x)?i:best,0);$('stage').textContent=`0${close+1} / 05`;if(player.x>27)$('guide').hidden=true;
for(let i=0;i<2;i++){let h=hazardAt(i,t);if(Math.hypot(player.x-h.x,player.z-h.z)<.73&&Math.abs((player.y+1)-h.y)<1.12){screen('fail');return;}}
for(let p of pickups){if(!p.got&&Math.hypot(player.x-p.x,player.z-p.z)<.7&&Math.abs((player.y+1)-p.y)<1.4){p.got=true;$('leaves').textContent='✦ '+pickups.map(q=>q.got?'✦':'○').join(' ');note('Una estrella para el viaje');}}
if(Math.hypot(player.x-31.6,player.z)<1.2&&player.y>=end.y-.2){screen('win');}
}
function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;let dpr=Math.min(window.devicePixelRatio||1,1.6),bw=Math.round(w*dpr),bh=Math.round(h*dpr);if(canvas.width!==bw||canvas.height!==bh){canvas.width=bw;canvas.height=bh;}gl.viewport(0,0,bw,bh);proj=perspective(PI/3.2,bw/bh,.12,150);}
window.addEventListener('resize',resize);resize();
function paintMesh(mesh,transform=model(),glow=0,opacity=1){gl.uniformMatrix4fv(su.model,false,transform);gl.uniform1f(su.glow,glow);gl.uniform1f(su.opacity,opacity);gl.bindVertexArray(mesh.vao);gl.drawArrays(gl.TRIANGLES,0,mesh.count);}
function render(){resize();gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);
const target=[player.x+2,player.y+1.1,player.z];let k=1-Math.exp(-Math.min(frame,.05)*4.5);for(let i=0;i<3;i++)camFocus[i]=mix(camFocus[i],target[i],k);
let horizontal=camDist*Math.cos(camPitch),eye=[camFocus[0]+Math.cos(camYaw)*horizontal,camFocus[1]+camDist*Math.sin(camPitch),camFocus[2]+Math.sin(camYaw)*horizontal];view=lookAt(eye,camFocus);
gl.useProgram(solid);gl.uniformMatrix4fv(su.proj,false,proj);gl.uniformMatrix4fv(su.view,false,view);gl.uniform3f(su.fog,.68,.82,.77);
paintMesh(world);
for(let i=0;i<2;i++){let h=hazardAt(i,t);paintMesh(hazardMesh,model([h.x,h.y+Math.sin(t*3+i)*.2,h.z],t*1.3,[1,1,1]),.16);}
for(let p of pickups){if(!p.got){paintMesh(stars,model([p.x,p.y+.2*Math.sin(t*2+p.x),p.z],-t*.9,[.8,.8,.8]),.12);}}
paintMesh(ring,model([31.65,end.y+1.62,0],Math.sin(t*.3)*.04,[1,1,1]),.2);
paintMesh(ring2,model([31.65,end.y+1.62,0],.09*Math.sin(t*.7),[1,1,1]),.08);
const floor=floorFor(player.x,player.z);if(floor){gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);paintMesh(shadow,model([player.x,floor.y+.03,player.z],0,[1,1,1]),0,clamp(.27-(player.y-floor.y)*.045,.05,.27));gl.depthMask(true);gl.disable(gl.BLEND);}
if(imageReady){gl.useProgram(sprite);gl.uniformMatrix4fv(tu.proj,false,proj);gl.uniformMatrix4fv(tu.view,false,view);let stepSway=Math.sin(t*12)*(player.run*.04);let bob=player.ground?Math.abs(Math.sin(t*12))*player.run*.075:0;let spriteCenter=[player.x,player.y+1.18+bob,player.z];gl.uniform3fv(tu.center,spriteCenter);gl.uniform3f(tu.right,Math.sin(camYaw),0,-Math.cos(camYaw));gl.uniform2f(tu.size,1.85,2.35);gl.uniform1f(tu.tilt,stepSway+(player.ground?0:player.vy>0?-.065:.04));gl.uniform1f(tu.fade,1);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);gl.uniform1i(tu.image,0);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);gl.bindVertexArray(sVAO);gl.drawArrays(gl.TRIANGLES,0,6);gl.depthMask(true);gl.disable(gl.BLEND);}
}
function loop(time){if(stopped)return;let seconds=time/1000;frame=clamp(seconds-(last||seconds),0,.04);last=seconds;t+=frame;step(frame);render();if(t>noteEnd)$('mini-note').classList.remove('visible');requestAnimationFrame(loop);}
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();stopped=true;$('webgl-error').hidden=false;$('webgl-error').querySelector('p').textContent='Se perdió el contexto gráfico. Recargá la página para reiniciar la experiencia.';});
canvas.addEventListener('webglcontextrestored',()=>location.reload());
requestAnimationFrame(loop);
window.__PAPER_ISLANDS__={getState:()=>({state,player:{x:player.x,y:player.y,z:player.z,ground:player.ground},stars:pickups.filter(x=>x.got).length,renderer:'WebGL2',imageReady}),reset:start};
})();
