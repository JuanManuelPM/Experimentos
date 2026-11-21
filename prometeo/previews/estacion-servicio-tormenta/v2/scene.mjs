import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
/* NOCTURNA V2: original authored environment; CC BY 4.0 CesiumMan from Cruce V1 read-only. */
const $=id=>document.getElementById(id), view=$('view');
if(!document.createElement('canvas').getContext('webgl2')){window.__nFail('WEBGL_CONTEXT','WebGL2 no disponible');throw Error('WEBGL_CONTEXT')}
let renderer;
try{renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});}catch(e){window.__nFail('WEBGL_CONTEXT',String(e));throw e}
renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.5;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;view.appendChild(renderer.domElement);
const world=new THREE.Scene();world.background=new THREE.Color(0x10212b);world.fog=new THREE.FogExp2(0x10202a,.014);
const camera=new THREE.PerspectiveCamera(54,innerWidth/innerHeight,.1,200);
const orbit=new OrbitControls(camera,renderer.domElement);orbit.enabled=false;orbit.enableDamping=true;orbit.maxPolarAngle=1.5;orbit.minDistance=3;orbit.maxDistance=70;orbit.target.set(0,2,-4);
const hemi=new THREE.HemisphereLight(0x9ebfd6,0x433631,2);world.add(hemi);
const moon=new THREE.DirectionalLight(0xbad5ee,2.3);moon.position.set(-16,26,16);moon.castShadow=true;moon.shadow.mapSize.set(1024,1024);moon.shadow.camera.left=-40;moon.shadow.camera.right=40;moon.shadow.camera.top=40;moon.shadow.camera.bottom=-40;world.add(moon);
const storm=new THREE.DirectionalLight(0xc5e9ff,0);storm.position.set(12,25,-25);world.add(storm);
const M=(c,r=.68,m=0,opt={})=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m,...opt});
const mat={ivory:M(0xd7c5a2),steel:M(0x8d9899,.35,.6),rust:M(0xa45d48,.65,.2),ink:M(0x26333a),red:M(0x833d3a),wood:M(0x524438),rubber:M(0x111a20),asphalt:M(0x293034,.5,.14),
glass:new THREE.MeshPhysicalMaterial({color:0x4d8b9e,roughness:.12,metalness:.1,transparent:true,opacity:.55,depthWrite:false,side:THREE.DoubleSide}),
lamp:new THREE.MeshStandardMaterial({color:0xffeac3,emissive:0xffc17d,emissiveIntensity:3.1}),
paint:M(0x4e7986,.32,.4),silver:M(0xc6c1af,.32,.75)};
const mesh=(g,m,p=world)=>{let o=new THREE.Mesh(g,m);o.castShadow=true;o.receiveShadow=true;p.add(o);return o};
const box=(p,x,y,z,w,h,d,m)=>{let o=mesh(new THREE.BoxGeometry(w,h,d),m,p);o.position.set(x,y,z);return o};
const cyl=(p,x,y,z,r,h,m,n=16)=>{let o=mesh(new THREE.CylinderGeometry(r,r,h,n),m,p);o.position.set(x,y,z);return o};
const light=(x,y,z,color,power,dist)=>{let l=new THREE.PointLight(color,power,dist,2);l.position.set(x,y,z);world.add(l);return l};
function tex(a,b,bg,fg,w=800,h=256){let c=document.createElement('canvas');c.width=w;c.height=h;let ctx=c.getContext('2d');
ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);ctx.fillStyle=fg;ctx.fillRect(15,14,w-30,6);ctx.fillRect(15,h-23,w-30,4);
ctx.textAlign='center';ctx.font='bold '+Math.floor(h*.42)+'px Impact,Arial Black,sans-serif';ctx.fillText(a,w/2,h*.57,w-45);
ctx.font='bold '+Math.floor(h*.095)+'px monospace';ctx.fillText(b,w/2,h*.83,w-40);
let t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
const sign=tex('NOCTURNA','RUTA  ·  SERVICIO 24 HORAS','#79362f','#ffe1b2');
const cafe=tex('CAFE 24H','TIENDA  /  REFUGIO  /  RUTA','#27332f','#e9b785',620,230);
const pumpSign=tex('NOCTURNA','SUPER · 95','#e5d6b7','#70372f',480,240);
const meter=tex('0018.74','LITROS  /  PRECIO','#1b3438','#b7efdc',500,240);
function decal(p,x,y,z,w,h,t){let o=mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:t,roughness:.8,side:THREE.DoubleSide}),p);o.position.set(x,y,z);o.castShadow=false;return o}
box(world,0,-.5,-12,170,.8,75,M(0x334039,.98));
box(world,0,-.3,14,170,.5,14,mat.asphalt);
box(world,0,-.08,6.2,170,.28,.95,mat.wood);
for(let x=-80;x<80;x+=10)box(world,x,.015,14,4.5,.018,.12,mat.ivory);
/* Wetness is an approximation: puddles with dynamic light ribbons, no geometric planar reflection. */
const wetU={t:{value:0},flash:{value:0}};
const wetMat=new THREE.ShaderMaterial({uniforms:wetU,transparent:true,depthWrite:false,side:THREE.DoubleSide,
vertexShader:'varying vec3 wp;void main(){vec4 p=modelMatrix*vec4(position,1.0);wp=p.xyz;gl_Position=projectionMatrix*viewMatrix*p;}',
fragmentShader:'varying vec3 wp;uniform float t;uniform float flash;void main(){vec2 p=wp.xz;float n=sin(p.x*.45+sin(p.y*.4))*sin(p.y*.73+p.x*.15);float w=smoothstep(.18,.75,n);float glow=0.0;for(int i=0;i<4;i++){float x=(float(i)-1.5)*5.0;glow+=exp(-abs(p.x-x)*.95)*exp(-abs(p.y-2.0)*.22)*.6;}float streak=sin(p.x*12.0+t*.8)*.035;vec3 c=vec3(.06,.16,.19)+vec3(.8,.43,.24)*(glow+streak)+vec3(.18,.3,.4)*flash;gl_FragColor=vec4(c,clamp(.08+w*.28+glow*.19,0.0,.55));}'});
const wet=mesh(new THREE.PlaneGeometry(170,85),wetMat);wet.rotation.x=-Math.PI/2;wet.position.y=.025;wet.castShadow=false;
/* Complete shop volume, physically laid out to support free orbit. */
const shop=new THREE.Group();world.add(shop);
box(shop,0,.1,-16,20,.3,11,mat.ink);
box(shop,0,2.75,-21,21,5.5,.6,mat.ivory);
for(let x of [-10.2,10.2])box(shop,x,2.75,-16,.55,5.5,11,mat.ivory);
box(shop,0,5.55,-16,22,.55,12,mat.red);box(shop,0,5.9,-16,22,.18,12,mat.ivory);
box(shop,0,4.69,-10.45,21,1.4,.48,mat.ivory);box(shop,0,.72,-10.45,21,1.45,.4,mat.red);
for(let x of [-10,-7,-3,1,5,9])box(shop,x,2.65,-10.28,.3,2.8,.32,mat.wood);
for(let x of [-8.5,-5,-1,3,7.5]){
let glass=box(shop,x,2.67,-10.34,2.7,2.55,.075,mat.glass);glass.castShadow=false;
box(shop,x,3.92,-10.28,2.7,.1,.14,mat.steel);box(shop,x,1.45,-10.28,2.7,.1,.14,mat.steel);}
decal(shop,0,4.87,-10.16,6.5,.95,cafe);
for(let x of [-7,0,7]){box(shop,x,1,-16,3.5,1.9,1.3,mat.wood);box(shop,x,2.65,-16,3.6,.15,1.4,mat.steel);
for(let i=0;i<4;i++)box(shop,x-1.25+i*.84,3.1,-15.7,.43,.7,.38,i%2?mat.red:mat.ivory)}
for(let x of [-6,0,6]){box(shop,x,5.1,-14,.96,.12,.5,mat.lamp);light(x,4.4,-13.5,0xffbf7d,2.8,13)}
const door=new THREE.Group();door.position.set(2.2,1.42,-10.2);shop.add(door);
box(door,-.75,1.13,0,1.5,2.25,.14,mat.steel);box(door,-.75,1.15,.09,1.24,1.94,.02,mat.glass);
const canopy=new THREE.Group();world.add(canopy);
box(canopy,0,6.12,-.3,24.5,.52,12.5,mat.ivory);box(canopy,0,6.56,-.3,25,.5,13.1,mat.red);
box(canopy,0,6.24,6.05,24.7,.6,.34,mat.wood);decal(canopy,0,6.52,6.28,16.8,.97,sign);
for(let x of [-10.4,10.4])for(let z of [-4.65,4.1])box(canopy,x,2.88,z,.7,5.7,.7,mat.steel);
for(let x of [-7.5,-2.5,2.5,7.5]){box(canopy,x,5.8,1.2,2.7,.11,.95,mat.lamp);light(x,5.2,1.2,0xffe1a6,3.1,13)}
function pump(x,z){const g=new THREE.Group();g.position.set(x,0,z);world.add(g);
box(g,0,.2,0,2.1,.35,1.65,mat.steel);
let sh=new THREE.Shape();sh.moveTo(-.85,.38);sh.lineTo(.85,.38);sh.lineTo(.85,2.65);sh.lineTo(.58,3);sh.lineTo(-.6,3);sh.lineTo(-.85,2.65);sh.closePath();
const geom=new THREE.ExtrudeGeometry(sh,{depth:1.12,bevelEnabled:true,bevelSize:.075,bevelThickness:.07,bevelSegments:2});geom.translate(0,0,-.56);
mesh(geom,mat.ivory,g);decal(g,0,2.73,.67,1.45,.45,pumpSign);
box(g,0,1.91,.69,1.35,.77,.12,mat.ink);decal(g,0,1.93,.75,1.22,.61,meter);
for(let k=0;k<3;k++)box(g,-.43+k*.43,1.29,.68,.3,.21,.13,mat.steel);
box(g,.88,1.53,.15,.24,1.15,.5,mat.red);
const hose=mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(.8,2.22,.5),new THREE.Vector3(1.5,1.6,.8),new THREE.Vector3(1.7,.64,.78),new THREE.Vector3(1.02,.5,.62)]),32,.07,8,false),mat.rubber,g);
box(g,1.04,1.15,.63,.22,.65,.22,mat.steel).rotation.z=-.28;box(g,0,3.09,0,1.9,.15,1.36,mat.red);
return g}
pump(-4.6,-.7);pump(4.7,-.7);
for(let x of [-4.6,4.7]){box(world,x,.08,0,5,.15,3.6,mat.wood);for(let j of [-2.3,2.3])cyl(world,x+j,.5,.4,.12,.95,mat.ivory)}
cyl(world,15,5,-8,.34,10,mat.steel);box(world,15,10.3,-8,5.8,3.9,.55,mat.red);decal(world,15,10.3,-7.65,5.3,3.1,sign);light(15,10,-8,0xf5a46b,2.6,18);
for(let x of [-42,-31,29,41])for(let z of [-34,-22,2]){const t=new THREE.Group();t.position.set(x,0,z);world.add(t);cyl(t,0,1.3,0,.3,2.6,mat.wood);for(let j=0;j<3;j++){let c=mesh(new THREE.ConeGeometry(1.6+(2-j)*.25,3.5,6),M(0x2e453d,.92),t);c.position.y=2.7+j*1.15}}
for(let x of [-25,-18,24,32]){cyl(world,x,4.6,-28,.12,9,mat.wood);box(world,x,8.8,-28,3.3,.15,.15,mat.ink)}
/* Vehicle with continuous manufactured silhouette, glazed cabin, 4 wheel assemblies and opening driver door. */
const car=new THREE.Group();world.add(car);
const profile=new THREE.Shape();profile.moveTo(-2.75,.63);profile.lineTo(-2.8,1.16);profile.lineTo(-2.35,1.39);profile.lineTo(-1.42,1.49);profile.lineTo(-.94,2.25);profile.lineTo(-.35,2.5);profile.lineTo(.88,2.5);profile.lineTo(1.56,1.9);profile.lineTo(1.82,1.46);profile.lineTo(2.62,1.33);profile.lineTo(2.8,1.04);profile.lineTo(2.76,.62);profile.closePath();
const body=new THREE.ExtrudeGeometry(profile,{depth:2.07,bevelEnabled:true,bevelSize:.07,bevelThickness:.06,bevelSegments:2});body.translate(0,0,-1.035);mesh(body,mat.paint,car);
function sideGlass(points,z){let s=new THREE.Shape();s.moveTo(points[0][0],points[0][1]);for(let p of points.slice(1))s.lineTo(p[0],p[1]);s.closePath();let o=mesh(new THREE.ShapeGeometry(s),M(0x254656,.17,.35,{side:THREE.DoubleSide}),car);o.position.z=z;}
for(let v of [-1,1]){const z=v*1.12;sideGlass([[-1.26,1.57],[-.85,2.15],[-.29,2.38],[.14,2.38],[.14,1.58]],z);
sideGlass([[.3,1.58],[.3,2.38],[.8,2.38],[1.34,1.91],[1.59,1.57]],z);
box(car,0,1.29,z,4.6,.05,.06,mat.silver);
for(let p of [-1.84,1.77]){let tyre=cyl(car,p,.65,v*1.09,.64,.31,mat.rubber,24);tyre.rotation.x=Math.PI/2;
let hub=cyl(car,p,.65,v*1.26,.37,.035,mat.silver,20);hub.rotation.x=Math.PI/2;}}
for(let z of [-.69,.69]){cyl(car,2.78,1.02,z,.22,.11,mat.lamp,16).rotation.z=Math.PI/2;
cyl(car,-2.83,1.02,z,.16,.12,mat.red,16).rotation.z=Math.PI/2;}
box(car,2.79,.58,0,.16,.15,1.95,mat.silver);box(car,-2.84,.59,0,.16,.14,1.94,mat.silver);
const carDoor=new THREE.Group();carDoor.position.set(.26,1.52,1.13);car.add(carDoor);
box(carDoor,-.8,-.2,.03,1.56,.87,.12,mat.paint);box(carDoor,-.8,.27,.03,1.38,.10,.10,mat.silver);
const headlights=[];for(let z of [-.69,.69]){let l=new THREE.SpotLight(0xffe5ba,9,29,.29,.48,2);world.add(l);world.add(l.target);headlights.push({l,z})}
let human=null,mixer=null,hasAnim=false;
new GLTFLoader().load('../../cruce-urbano/v1/assets/cesium-man.glb',gltf=>{
 const o=gltf.scene;const b=new THREE.Box3().setFromObject(o),sz=b.getSize(new THREE.Vector3());o.scale.setScalar(1.84/Math.max(.01,sz.y));
 const b2=new THREE.Box3().setFromObject(o);o.position.y=-b2.min.y;human=new THREE.Group();human.add(o);world.add(human);
 if(gltf.animations.length){mixer=new THREE.AnimationMixer(o);mixer.clipAction(gltf.animations[0]).play();hasAnim=true}
 $('loadText').textContent='Modelo humano GLB cargado';
},undefined,e=>{console.warn('ASSET_LOAD CESIUM_MAN',e);$('loadText').textContent='Recurso humano externo no disponible'});
/* rain lines sit in three-dimensional world space, 900 segments on mobile */
let seed=33159;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
const n=950,coords=new Float32Array(n*6),dr=[];
for(let i=0;i<n;i++)dr.push({x:(rand()-.5)*85,z:(rand()-.5)*76,y:rand()*24,s:11+rand()*16});
const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.BufferAttribute(coords,3).setUsage(THREE.DynamicDrawUsage));
const rain=new THREE.LineSegments(rg,new THREE.LineBasicMaterial({color:0xc3dcf1,transparent:true,opacity:.3,depthWrite:false}));rain.frustumCulled=false;world.add(rain);
const splashes=new THREE.Group();world.add(splashes);
for(let i=0;i<50;i++){let r=.12+rand()*.29,o=mesh(new THREE.RingGeometry(r,r+.017,16),new THREE.MeshBasicMaterial({color:0xb6d4e0,transparent:true,opacity:.12,side:THREE.DoubleSide,depthWrite:false}),splashes);o.rotation.x=-Math.PI/2;o.position.set((rand()-.5)*33,.03,(rand()-.5)*32);o.castShadow=false}
const smooth=(a,b,t)=>{let x=THREE.MathUtils.clamp((t-a)/(b-a),0,1);return x*x*(3-2*x)};
const positions=new THREE.CatmullRomCurve3([new THREE.Vector3(-23,7,22),new THREE.Vector3(-13,6,12),new THREE.Vector3(0,8,17),new THREE.Vector3(12,5.7,11),new THREE.Vector3(8,6,8)]);
const looks=new THREE.CatmullRomCurve3([new THREE.Vector3(-9,2,-2),new THREE.Vector3(-5,1,2),new THREE.Vector3(-1,2,-4),new THREE.Vector3(-4,2,-1),new THREE.Vector3(1,2,-11)]);
let time=0,playing=true,free=false,raining=true,last=performance.now();const total=36;
function update(t,dt){
 const x=-28+23.6*Math.pow(smooth(0,10,t),.9);car.position.set(x,0,2.8);
 carDoor.rotation.y=.97*(smooth(10,12,t)-smooth(19,21,t));
 door.rotation.y=-.82*(smooth(19,22,t)-smooth(27,29,t));
 for(let h of headlights){h.l.position.set(x+2.7,1.05,2.8+h.z);h.l.target.position.set(x+16,.9,2.8+h.z)}
 if(human){let p=smooth(12,19,t);human.position.set(-4.7-1.35*p,0,4.2-4.9*p);human.rotation.y=2.8+.6*p;human.visible=t>=11.8;
 if(!hasAnim)human.position.y=(p>0&&p<1)?Math.sin(t*13)*.025:0}
 if(mixer)mixer.update(dt);
 if(!free){const s=smooth(0,total,t);camera.position.copy(positions.getPoint(s));let dest=looks.getPoint(s);camera.lookAt(dest);orbit.target.copy(dest)}else orbit.update();
 const f=t%21,flash=(f>18.2&&f<18.35)?1:((f>18.54&&f<18.61)?.35:0);
 storm.intensity=flash*8;hemi.intensity=2+flash;wetU.flash.value=flash;wetU.t.value=t;
 if(raining){for(let i=0;i<n;i++){let d=dr[i];d.y-=dt*d.s;if(d.y<.2)d.y+=24;let j=i*6;
 coords[j]=d.x;coords[j+1]=d.y;coords[j+2]=d.z;coords[j+3]=d.x+.14;coords[j+4]=d.y-.65;coords[j+5]=d.z+.08}
 rg.attributes.position.needsUpdate=true}
 $('beat').textContent=t<10?'01 · LA CARRETERA':t<12?'02 · LLEGADA':t<20?'03 · EL CONDUCTOR':t<29?'04 · LA ESTACIÓN':'05 · MADRUGADA';
 $('scrub').value=t.toFixed(2);$('time').textContent=String(Math.floor(t)).padStart(2,'0');
}
renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();playing=false;window.__nFail('CONTEXT_LOST','La GPU perdió su contexto de render')});
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
$('play').onclick=()=>{playing=!playing;if(playing&&time>=total)time=0;$('play').textContent=playing?'Ⅱ':'▶'};
$('reset').onclick=()=>{time=0;playing=true;$('play').textContent='Ⅱ';free=false;orbit.enabled=false;$('mode').textContent='EXPLORAR';$('mode').setAttribute('aria-pressed','false')};
$('mode').onclick=()=>{free=!free;orbit.enabled=free;$('mode').textContent=free?'CINE':'EXPLORAR';$('mode').setAttribute('aria-pressed',String(free));$('modeLabel').textContent=free?'CÁMARA LIBRE · ARRASTRÁ PARA GIRAR':'CINE / V2';if(free){orbit.target.set(0,2,-4);orbit.update()}};
$('rain').onclick=()=>{raining=!raining;rain.visible=raining;splashes.visible=raining;$('rain').setAttribute('aria-pressed',String(raining))};
$('scrub').oninput=e=>{time=Math.max(0,Math.min(total,Number(e.target.value)))};
window.__nReady=true;$('boot').style.display='none';
function loop(now){let dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;if(playing){time=Math.min(total,time+dt);if(time>=total){playing=false;$('play').textContent='▶'}}update(time,dt);renderer.render(world,camera);requestAnimationFrame(loop)}
requestAnimationFrame(loop);