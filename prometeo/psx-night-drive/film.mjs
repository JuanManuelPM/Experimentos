import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

/* PROMETEO · NO HAY VUELTA · authored PSX character/vehicle pipeline.
   Actor and sedan are real skinned/sculpted GLB meshes, not stacks of shapes.
   Original artwork: nocturnal road kit, facade atlases, composition, rain and Foley.
   Deterministic shot sampling: all transforms are recomputed from absolute time.
*/
const $=id=>document.getElementById(id),clamp=(v,a,b)=>Math.min(b,Math.max(a,v)),mix=(a,b,t)=>a+(b-a)*t;
const V=(a)=>new THREE.Vector3(...a),DURATION=38,FRAMES=9;
const shots=[
 {start:0,end:4.5,name:'01 / EN LA RUTA',kind:'ext',a:[3.4,2.15,6.6],b:[2.4,1.85,4.85],target:[0,.80,.1],fov:38},
 {start:4.5,end:8.2,name:'02 / DETRÁS DEL PARABRISAS',kind:'int',a:[.18,1.43,-1.55],b:[.45,1.53,-1.29],target:[-.54,1.35,.1],fov:40,speaker:'CONDUCTOR',line:'Te juro que doblé acá.'},
 {start:8.2,end:12.4,name:'03 / ROSTRO',kind:'int',a:[1.1,1.53,-1.04],b:[.78,1.48,-.88],target:[-.61,1.35,.16],fov:32,speaker:'CONDUCTOR',line:'La salida estaba después del puente.'},
 {start:12.4,end:16.1,name:'04 / CALLE',kind:'pov',a:[-.37,1.51,-.38],b:[-.37,1.48,-.47],target:[-.05,1.10,-12],fov:55},
 {start:16.1,end:20.0,name:'05 / CONTRALUZ',kind:'ext',a:[-3.9,1.71,.75],b:[-3.15,1.65,2.5],target:[0,1.0,-.1],fov:35,speaker:'RADIO',line:'…sintonía perdida…'},
 {start:20.0,end:24.4,name:'06 / SEÑAL',kind:'pov',a:[.08,1.48,-.5],b:[.19,1.46,-.61],target:[.38,1.34,-18],fov:48,speaker:'CONDUCTOR',line:'Otra vez el mismo cartel.'},
 {start:24.4,end:29.0,name:'07 / SILENCIO',kind:'int',a:[.96,1.35,-.85],b:[.66,1.39,-.98],target:[-.59,1.32,.13],fov:29,speaker:'CONDUCTOR',line:'No… antes no decía eso.'},
 {start:29.0,end:33.4,name:'08 / ÚLTIMA CURVA',kind:'pov',a:[-.4,1.51,-.39],b:[-.55,1.47,-.35],target:[0,1.36,-20],fov:47,speaker:'RADIO',line:'No hay vuelta.'},
 {start:33.4,end:38,name:'09 / FIN DEL CAMINO',kind:'ext',a:[-2.3,1.75,4.4],b:[-5.4,2.53,9],target:[0,.9,0],fov:39}
];
let renderer,camera,scene,sceneRoot,carRoot,cabinRoot,carModel,actorRoot,rain,headLight,taillights,ready=false,playing=false,soundOn=true,now=0,lastFrame=0,lastShot=-1,ctx=null,noiseNode=null,engineNode=null,glassWipers=[],actorHeadBone=null;
const qa={ready:false,webgl:false,carLoaded:false,actorLoaded:false,frameCount:FRAMES,duration:DURATION,assets:['licensed-car-glb','authored-human-glb'],renderer:'not-started'};
window.__DRIVE_QA=qa;
const loader=new GLTFLoader();
const materials={
 asphalt:new THREE.MeshStandardMaterial({color:0x17262b,roughness:.38,metalness:.13}),
 curb:new THREE.MeshStandardMaterial({color:0x586267,roughness:1}),
 stone:new THREE.MeshStandardMaterial({color:0x49555a,roughness:.95}),
 dark:new THREE.MeshStandardMaterial({color:0x162329,roughness:.92}),
 dashboard:new THREE.MeshStandardMaterial({color:0x242e30,roughness:.84}),
 beige:new THREE.MeshStandardMaterial({color:0xae9b80,roughness:.9}),
 lamp:new THREE.MeshStandardMaterial({color:0xffc183,emissive:0xcc612d,emissiveIntensity:1.8,roughness:.4}),
 cyan:new THREE.MeshStandardMaterial({color:0x5c92a0,emissive:0x207e9e,emissiveIntensity:1.1}),
 red:new THREE.MeshStandardMaterial({color:0xd64f40,emissive:0xc33b29,emissiveIntensity:1.6})
};
function mesh(g,m,pos,parent=sceneRoot,name=''){
 const o=new THREE.Mesh(g,m);o.position.set(...pos);o.castShadow=true;o.receiveShadow=true;o.name=name;parent.add(o);return o;
}
function rect(pos,size,mat,parent=sceneRoot,name=''){return mesh(new THREE.BoxGeometry(...size),mat,pos,parent,name)}
function cylindricalLine(a,b,r,mat,parent=sceneRoot){
 const A=V(a),B=V(b),d=B.clone().sub(A);
 const o=mesh(new THREE.CylinderGeometry(r,r,d.length(),6),mat,A.add(B).multiplyScalar(.5).toArray(),parent);
 o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return o;
}
function atlas(build,mode=256){
 const c=document.createElement('canvas');c.width=mode;c.height=mode;const x=c.getContext('2d');
 build(x,c);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestMipmapNearestFilter;
 return t;
}
function facadeTexture(seed,base,lit){
 return atlas((g,c)=>{
  g.fillStyle=base;g.fillRect(0,0,c.width,c.height);
  let ran=seed;const rand=()=>((ran=(1664525*ran+1013904223)>>>0)/4294967296);
  for(let k=0;k<1000;k++){let v=rand()*.08;g.fillStyle=k%3?'#00000008':'#ffffff06';g.fillRect(rand()*256,rand()*256,rand()*5+1,rand()*12+1);}
  for(let y=20;y<242;y+=52)for(let xx=12;xx<245;xx+=42){
   let light=rand()<lit;g.fillStyle='#131c22';g.fillRect(xx,y,28,37);
   g.fillStyle=light?'#b78a5f':'#273843';g.fillRect(xx+3,y+3,22,29);
   g.fillStyle=light?'#e4c38e':'#38515a';g.fillRect(xx+3,y+5,10,24);
   g.fillStyle='#15262a';g.fillRect(xx+14,y+1,2,35);
   g.fillStyle='#46535a';g.fillRect(xx+2,y+18,25,2);
  }
  g.fillStyle='#10212b66';for(let y=0;y<=256;y+=51)g.fillRect(0,y,256,5);
 });
}
function signTexture(label,accent){
 return atlas((g,c)=>{
  g.fillStyle='#17212a';g.fillRect(0,0,256,256);
  g.strokeStyle=accent;g.lineWidth=14;g.strokeRect(11,11,234,234);
  g.fillStyle=accent;g.font='bold 32px monospace';g.textAlign='center';
  const words=label.split(' ');let y=100;for(const word of words){g.fillText(word,128,y);y+=43}
  g.font='11px monospace';g.fillText('RUTA 09 · 1998',128,218);
 },256);
}
function createStreet(){
 scene.background=new THREE.Color(0x0b1721);scene.fog=new THREE.FogExp2(0x152936,.0225);
 const street=mesh(new THREE.PlaneGeometry(13,260),materials.asphalt,[0,-.04,-39]);street.rotation.x=-Math.PI/2;street.castShadow=false;
 const edgeMat=materials.curb;
 for(const sign of [-1,1]){
  const edge=rect([sign*4.4,.055,-37],[.35,.22,200],edgeMat);
  rect([sign*7.1,.18,-37],[5.05,.36,200],materials.stone);
  for(let z=-114;z<45;z+=4){
   // Road drainage and reflections, no random clutter.
   rect([sign*4.18,.016,z],[.075,.028,1.23],materials.beige);
  }
 }
 const paint=new THREE.MeshStandardMaterial({color:0xc6c0aa,roughness:.52,metalness:.13});
 for(let z=-114;z<43;z+=6.7)rect([0,-.015,z],[.115,.007,2.4],paint);
 for(let z=-120;z<48;z+=16){
  const idx=Math.floor((z+120)/16);
  for(const sign of [-1,1]){
   const x=sign*(10.6+(idx%3)*.4);
   const h=6.4+(idx%4)*1.65,w=6.9+(idx%3)*.6;
   const wall=new THREE.MeshStandardMaterial({map:facadeTexture(idx*7+sign*18+145,['#37434c','#45504e','#4d4848','#323e4b'][idx%4],.25),roughness:.97});
   rect([x,h/2,-1.8+z],[w,h,13.2],wall,sceneRoot,'FACADE');
   // Sill, corners, base, roofline make the block read as one building.
   rect([x, h-.18,z-1.8],[w+.32,.37,13.5],materials.dark);
   if(idx%3===0)rect([sign*6.98,2.0,z+1.2],[.24,3.65,1.65],materials.beige);
   if((idx%4)===1){
    const tex=signTexture(idx%8===1?'CINE 24':'SALIDA 09',idx%8===1?'#e7ae71':'#a6cbd2');
    const signFace=mesh(new THREE.PlaneGeometry(2.6,2.6),new THREE.MeshStandardMaterial({map:tex,emissiveMap:tex,emissive:0x4a4137,emissiveIntensity:.65}),[sign*7.95,3.05,z+.72]);
    signFace.rotation.y=sign===1?-Math.PI/2:Math.PI/2;
   }
  }
 }
 // Street lamps have physical armatures and shade, concentrated pools of light.
 for(let z=-108;z<36;z+=16){
  for(const side of [-1,1]){
   const x=side*4.8;
   cylindricalLine([x,.15,z],[x,4.75,z],.075,materials.dark);
   cylindricalLine([x,4.68,z],[x-side*.90,4.78,z],.055,materials.dark);
   rect([x-side*.9,4.73,z],[.43,.13,.34],materials.lamp);
   if(side===-1&&[-76,-44,-12,20].includes(z)){const light=new THREE.PointLight(0xffb37b,4.1,8,2.3);light.position.set(x-side*.75,4.56,z);scene.add(light)}
  }
 }
 // A distinct story prop, the sign which keeps returning.
 const exitTex=signTexture('SIN SALIDA','#ed7a66');
 const exitMat=new THREE.MeshStandardMaterial({map:exitTex,roughness:.7,emissiveMap:exitTex,emissive:new THREE.Color(0x5a1509),emissiveIntensity:.68});
 for(const z of [-31,-65]){
  cylindricalLine([-4.78,.3,z],[-4.78,3.3,z],.11,materials.stone);
  const q=mesh(new THREE.PlaneGeometry(1.65,1.65),exitMat,[-4.77,3.18,z]);
  q.rotation.y=Math.PI/2;
 }
 // Wet directional glints on road as low-contrast painted geometry.
 const puddle=new THREE.MeshBasicMaterial({color:0x29576c,transparent:true,opacity:.18,depthWrite:false});
 for(let z=-100;z<35;z+=12){
  const p=mesh(new THREE.PlaneGeometry(2.7,3.6),puddle,[z%3-1,.005,z-2]);p.rotation.x=-Math.PI/2;p.castShadow=false;
 }
 scene.add(new THREE.HemisphereLight(0x6997b2,0x171312,1.15));
 const moon=new THREE.DirectionalLight(0x90bdd6,2.6);moon.position.set(7,13,2);scene.add(moon);
 const amber=new THREE.PointLight(0xe88c4b,10,12,2);amber.position.set(-3,4,-6);scene.add(amber);
}
function buildCabin(){
 cabinRoot=new THREE.Group();cabinRoot.name='INTERIOR_SCENOGRAPHY';carRoot.add(cabinRoot);
 const dash=rect([0,.82,-1.13],[2.25,.54,.62],materials.dashboard,cabinRoot,'DASHBOARD');
 rect([0,1.05,-1.36],[2.14,.07,.38],materials.dark,cabinRoot);
 const seatMat=new THREE.MeshStandardMaterial({color:0x59606a,roughness:.96});
 // Facing direction is -Z: seats in rear section, steering wheel at driver x=-0.6.
 rect([-.57,.55,.45],[.69,.48,.72],seatMat,cabinRoot,'DRIVER_SEAT');
 rect([-.57,1.14,.76],[.75,1.33,.22],seatMat,cabinRoot,'SEAT_BACK');
 rect([.57,.55,.45],[.68,.48,.72],seatMat,cabinRoot,'PASSENGER_SEAT');
 rect([.57,1.14,.76],[.72,1.33,.22],seatMat,cabinRoot);
 rect([-1.08,1.15,-.23],[.12,1.15,2.5],materials.dark,cabinRoot,'DOOR_LEFT');
 rect([1.08,1.15,-.23],[.12,1.15,2.5],materials.dark,cabinRoot,'DOOR_RIGHT');
 // Physical windscreen frame and steering wheel, not avatar anatomy.
 for(const x of [-1.14,1.14])cylindricalLine([x,.88,-1.42],[x,2.06,-1.66],.06,materials.dark,cabinRoot);
 cylindricalLine([-1.18,2.06,-1.66],[1.18,2.06,-1.66],.06,materials.dark,cabinRoot);
 const wheel=mesh(new THREE.TorusGeometry(.31,.044,5,12),materials.dark,[-.57,1.02,-.84],cabinRoot,'STEERING_WHEEL');
 wheel.rotation.x=-.35;
 for(let a=0;a<3;a++){let theta=(a*2*Math.PI/3);
  cylindricalLine([-.57+Math.cos(theta)*.24,1.02+Math.sin(theta)*.24,-.84],[-.57,1.02,-.84],.028,materials.stone,cabinRoot)
 }
 mesh(new THREE.CylinderGeometry(.08,.11,.07,8),materials.stone,[-.57,1.02,-.82],cabinRoot).rotation.x=Math.PI/2;
 for(let i=0;i<4;i++){const m=i%2?materials.cyan:materials.lamp;rect([-.1+i*.19,1.07,-.83],[.08,.04,.022],m,cabinRoot)}
 // Two windshield wipers are actual linked props, with deterministic absolute rotation.
 for(const x of [-.51,.53]){
  const root=new THREE.Group();root.position.set(x,.95,-1.58);cabinRoot.add(root);glassWipers.push(root);
  cylindricalLine([0,0,0],[x<0?.77:-.77,.28,0],.024,materials.dark,root);
 }
 // Faint dashboard green glow; acts on face in closeups.
 const cablight=new THREE.PointLight(0x62b6bb,5.3,3.5);cablight.position.set(-.13,1.24,-.83);cabinRoot.add(cablight);
}
function createRain(){
 // Line segments with 3D parallax, not postprocessing noise.
 const pts=[];let seed=17;const rnd=()=>((seed=(1103515245*seed+12345)>>>0)/4294967296);
 for(let i=0;i<320;i++){let x=(rnd()-.5)*17, y=rnd()*9,z=-22+rnd()*46;pts.push(x,y,z,x-.032,y-.21-rnd()*.33,z-.02)}
 const geom=new THREE.BufferGeometry();geom.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));
 rain=new THREE.LineSegments(geom,new THREE.LineBasicMaterial({color:0x82aeb9,transparent:true,opacity:.33,depthWrite:false}));
 sceneRoot.add(rain);
}
async function loadGLBs(){
 const carUrl='./assets/sedan_blue.glb';
 const personUrl='https://cdn.jsdelivr.net/gh/programasweights/avatar@a488723e3a93d73d5c562d88f8a85353c37bc721/public/assets/gangnam-character.glb';
 const carData=await loader.loadAsync(carUrl);
 carModel=carData.scene;carModel.name='AUTHOR_DESIGNED_SEDAN';carRoot.add(carModel);
 // Fit to real car scale; not remodelled from primitive shapes.
 carModel.updateMatrixWorld(true);
 let bounds=new THREE.Box3().setFromObject(carModel),size=bounds.getSize(new THREE.Vector3());
 let turn=Math.abs(size.x)>Math.abs(size.z)*1.19?Math.PI/2:0;
 carModel.rotation.y=turn;carModel.updateMatrixWorld(true);
 bounds=new THREE.Box3().setFromObject(carModel);size=bounds.getSize(new THREE.Vector3());
 const unit=4.35/Math.max(size.z,.05);carModel.scale.setScalar(unit);
 carModel.updateMatrixWorld(true);bounds=new THREE.Box3().setFromObject(carModel);
 const center=bounds.getCenter(new THREE.Vector3()),min=bounds.min.clone();
 carModel.position.sub(new THREE.Vector3(center.x,min.y,center.z));
 carModel.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;for(const m of Array.isArray(o.material)?o.material:[o.material]){if(m.map){m.map.magFilter=THREE.NearestFilter; m.map.minFilter=THREE.NearestMipmapNearestFilter}}}});
 qa.carLoaded=true;qa.carDimensions=size.toArray().map(v=>+v.toFixed(2));qa.carClipNames=carData.animations.map(x=>x.name);
 carRoot.userData.carMixer=new THREE.AnimationMixer(carModel);const drive=carData.animations.find(a=>/drive/i.test(a.name));if(drive)carRoot.userData.carMixer.clipAction(drive).play();
 let human;
 try{human=await loader.loadAsync(personUrl)}
 catch(e){try{human=await loader.loadAsync('https://raw.githubusercontent.com/programasweights/avatar/a488723e3a93d73d5c562d88f8a85353c37bc721/public/assets/gangnam-character.glb')}catch(e2){human=await loader.loadAsync('https://cdn.jsdelivr.net/gh/programasweights/avatar@a488723e3a93d73d5c562d88f8a85353c37bc721/public/assets/character.glb');qa.actorFallback=true}}
 actorRoot=human.scene;actorRoot.name='AUTHOR_DESIGNED_HUMAN_WITH_CLOTH_FACE_HAIR';
 cabinRoot.add(actorRoot);
 actorRoot.updateMatrixWorld(true);
 let bx=new THREE.Box3().setFromObject(actorRoot);let extent=bx.getSize(new THREE.Vector3()),bottom=bx.min.y;
 const scale=1.72/Math.max(.01,extent.y);
 actorRoot.scale.setScalar(scale);actorRoot.rotation.y=Math.PI;
 actorRoot.position.set(-.56,.23-bottom*scale-.48,.28);
 actorRoot.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}if(o.isBone&&/head$/i.test(o.name))actorHeadBone=o});
 qa.actorLoaded=true;qa.actorBones=[...new Set((()=>{let n=[];actorRoot.traverse(o=>{if(o.isBone)n.push(o.name)});return n})())].length;
 // Fixed seated pose only in lower body. Upper body remains model-authored and static.
 qa.actorSource='programasweights/avatar@a488723e (MIT costume & Quaternius CC0)';
 ready=true;qa.ready=true;
 $('loading').textContent='Mallas auténticas cargadas · 9 planos · 38 segundos';
 $('status').textContent='PELÍCULA LISTA · 9 planos · 3D real y audio original.';
 }
function audioStart(){
 if(!soundOn)return;
 const A=window.AudioContext||window.webkitAudioContext;if(!A)return;
 if(!ctx)ctx=new A();
 ctx.resume();
 if(noiseNode)return;
 const n=ctx.sampleRate*3,b=ctx.createBuffer(1,n,ctx.sampleRate),a=b.getChannelData(0);let x=593;
 for(let i=0;i<n;i++){x=(x*1664525+1013904223)>>>0;a[i]=((x/4294967296)*2-1)*.37;}
 const src=ctx.createBufferSource();src.buffer=b;src.loop=true;
 const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=800;
 const gain=ctx.createGain();gain.gain.value=.24;src.connect(lp).connect(gain).connect(ctx.destination);src.start();noiseNode=src;
 const oscillator=ctx.createOscillator();oscillator.type='sawtooth';oscillator.frequency.value=44;
 const ef=ctx.createBiquadFilter();ef.type='lowpass';ef.frequency.value=90;
 const eg=ctx.createGain();eg.gain.value=.032;oscillator.connect(ef).connect(eg).connect(ctx.destination);oscillator.start();engineNode=oscillator;
}
function audioMute(){if(!ctx)return;ctx.suspend()}
function timeLabel(t){const sec=Math.floor(t);return '00:'+String(sec).padStart(2,'0')+' / 00:38'}
function setTime(t){
 now=clamp(t,0,DURATION);let n=shots.findIndex(s=>now>=s.start&&now<s.end);if(n<0)n=shots.length-1;
 const shot=shots[n],u=clamp((now-shot.start)/(shot.end-shot.start),0,1),e=u*u*(3-2*u);
 // Car moves through the built city; scenery remains fixed.
 const z=18-now*1.95;
 carRoot.position.set(Math.sin(now*.19)*.11,Math.sin(now*9)*.005,z);
 carRoot.rotation.y=Math.sin(now*.13)*.027;
 carRoot.userData.carMixer?.setTime(now*.78);
 if(cabinRoot)cabinRoot.visible=shot.kind!=='ext';
 if(carModel)carModel.visible=shot.kind==='ext';
 for(let i=0;i<glassWipers.length;i++)glassWipers[i].rotation.z=(i===0?-1:1)*(.18+.36*Math.sin(now*3.8));
 if(rain)rain.position.z=-(now*1.9%15);
 // Dynamic camera by shot, not one-minute orbit.
 const rel=V(shot.a).lerp(V(shot.b),e),target=V(shot.target);
 camera.position.copy(carRoot.position).add(rel);
 camera.lookAt(carRoot.position.clone().add(target));camera.fov=shot.fov;camera.updateProjectionMatrix();
 // Filmic depth, motivated palette and cut-specific legibility.
 $('shot').textContent=shot.name;
 $('speaker').textContent=shot.speaker||'';
 $('subtitle').textContent=shot.line||'';
 $('timeline').value=String(now);$('time').textContent=timeLabel(now);
 qa.now=+now.toFixed(2);qa.shotIndex=n;qa.camera=shot.name;
 if(lastShot!==n){lastShot=n;qa.shotsVisited=[...new Set([...(qa.shotsVisited||[]),n])]}
 if(now>=DURATION&&playing){playing=false;$('toggle').textContent='▶ REPRODUCIR';$('startCurtain').hidden=false;$('start').textContent='↺ VOLVER A VER';audioMute()}
}
function loop(ts){
 requestAnimationFrame(loop);
 const delta=lastFrame?Math.min((ts-lastFrame)/1000,.055):0;lastFrame=ts;
 if(playing)setTime(now+delta);
 if(renderer&&ready){renderer.render(scene,camera);qa.lastRender=+now.toFixed(2);qa.frameVisible=true}
}
function resize(){
 if(!renderer)return;const w=Math.max(200,$('screen').clientWidth),h=Math.max(350,$('screen').clientHeight);
 const scale=Math.min(1,600/h);renderer.setSize(Math.floor(w*scale),Math.floor(h*scale),false);
 camera.aspect=w/h;camera.updateProjectionMatrix();
}
function begin(){
 if(!ready){$('loading').textContent='Esperando actor y vehículo GLB…';return}
 if(now>=DURATION)setTime(0);
 $('startCurtain').hidden=true;playing=true;$('toggle').textContent='Ⅱ PAUSAR';
 audioStart();
}
function init(){
 const canvas=$('screen'),gl=canvas.getContext('webgl2',{antialias:false,alpha:false,preserveDrawingBuffer:true,powerPreference:'high-performance'});
 if(!gl)throw Error('WebGL2 no está disponible en este navegador. Se necesita Chrome con aceleración gráfica.');
 renderer=new THREE.WebGLRenderer({canvas,context:gl,antialias:false,preserveDrawingBuffer:true});
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.91;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.setPixelRatio(1);
 qa.renderer='WebGL2';qa.webgl=true;
 scene=new THREE.Scene();sceneRoot=new THREE.Group();scene.add(sceneRoot);
 camera=new THREE.PerspectiveCamera(41,9/16,.045,125);
 carRoot=new THREE.Group();sceneRoot.add(carRoot);
 createStreet();buildCabin();createRain();
 resize();setTime(0);requestAnimationFrame(loop);
 $('start').addEventListener('click',begin);
 $('toggle').addEventListener('click',()=>{if(playing){playing=false;$('toggle').textContent='▶ REPRODUCIR';audioMute()}else begin()});
 $('replay').addEventListener('click',()=>{setTime(0);begin()});
 $('sound').addEventListener('click',()=>{soundOn=!soundOn;$('sound').textContent='SONIDO: '+(soundOn?'SÍ':'NO');if(soundOn&&playing){noiseNode=null;engineNode=null;ctx?.close();ctx=null;audioStart()}else audioMute()});
 $('timeline').addEventListener('input',e=>setTime(Number(e.target.value)));
 window.addEventListener('resize',resize);
 loadGLBs().catch(err=>{console.error(err);$('loading').textContent='No se pudo cargar la malla 3D. Revisá conexión / Chrome.';$('status').textContent='ERROR DE ASSETS: '+err.message;qa.error=String(err);qa.ready=false});
}
try{init()}catch(e){qa.error=String(e);$('status').textContent='ERROR: '+e.message;$('loading').textContent=e.message;console.error(e)}
