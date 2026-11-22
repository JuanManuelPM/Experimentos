import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { DESIGN, BOM, PALETTES, VARIANTS, foldPose, validateDesign } from './mechanics.mjs';

// F/20 : a meter-scaled, original concept visualizer. No structural certification.
const canvas=document.getElementById('view');
const error=document.getElementById('error');
let renderer;
try { renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'}); }
catch(e){error.hidden=false;error.textContent='No se pudo iniciar WebGL: '+e.message;throw e}
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.8));
renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.23;
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x111920);
scene.fog=new THREE.Fog(0x111920,5,14);
const camera=new THREE.PerspectiveCamera(40,innerWidth/innerHeight,.03,80);
camera.position.set(1.52,1.14,2.38);
const controls=new OrbitControls(camera,canvas);
controls.enableDamping=true;controls.dampingFactor=.075;
controls.target.set(0,.59,0);controls.minDistance=1.1;controls.maxDistance=6.2;
controls.maxPolarAngle=Math.PI*.5-.015;
controls.enablePan=false;controls.update();

scene.add(new THREE.HemisphereLight(0xc9ddff,0x2d3535,2.2));
const key=new THREE.DirectionalLight(0xffe4c6,3.7);key.position.set(-2.5,4,3);key.castShadow=true;
key.shadow.mapSize.set(1536,1536);key.shadow.camera.left=-2.8;key.shadow.camera.right=2.8;key.shadow.camera.top=2.8;key.shadow.camera.bottom=-2.8;
key.shadow.normalBias=.018;scene.add(key);
const fill=new THREE.DirectionalLight(0x8eb9e2,2.2);fill.position.set(2,2.2,-2);scene.add(fill);
const rimLight=new THREE.DirectionalLight(0xffc58d,1.7);rimLight.position.set(.3,3,-3);scene.add(rimLight);
const floor=new THREE.Mesh(new THREE.PlaneGeometry(100,100),new THREE.MeshStandardMaterial({color:0x1b262c,metalness:.08,roughness:.89}));
floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;floor.position.y=-.008;scene.add(floor);
const grid=new THREE.GridHelper(5,20,0x3b4b50,0x23323a);grid.position.y=-.006;
grid.material.transparent=true;grid.material.opacity=.17;scene.add(grid);

const material={
 frame:new THREE.MeshPhysicalMaterial({color:PALETTES.graphite.frame,metalness:.79,roughness:.27,clearcoat:.72,clearcoatRoughness:.18}),
 accent:new THREE.MeshPhysicalMaterial({color:PALETTES.graphite.detail,metalness:.67,roughness:.3,clearcoat:.45}),
 alloy:new THREE.MeshStandardMaterial({color:0xb5bec2,metalness:.89,roughness:.24}),
 dark:new THREE.MeshStandardMaterial({color:0x252a2e,metalness:.76,roughness:.38}),
 tyre:new THREE.MeshStandardMaterial({color:0x101318,metalness:0,roughness:.93}),
 tread:new THREE.MeshStandardMaterial({color:0x303238,metalness:0,roughness:.95}),
 leather:new THREE.MeshStandardMaterial({color:0x252829,metalness:.1,roughness:.64}),
 lamp:new THREE.MeshBasicMaterial({color:0xeacb87}),
 red:new THREE.MeshBasicMaterial({color:0xb4392c})
};
const root=new THREE.Group();root.name='F20-original-bicycle';scene.add(root);
const axis=new THREE.Vector3(0,1,0);
const p=(x,y,z)=>new THREE.Vector3(x,y,z);
const from=a=>new THREE.Vector3(...a);
const geom=(parent,g,m,x=0,y=0,z=0)=>{
 const mesh=new THREE.Mesh(g,m);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
};
function tube(parent,a,b,r,mat,segments=14){
 const start=from(a),end=from(b),delta=end.clone().sub(start);
 const mesh=geom(parent,new THREE.CylinderGeometry(r,r,delta.length(),segments,1),mat);
 mesh.position.copy(start).add(end).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(axis,delta.normalize());return mesh;
}
function ball(parent,pt,r,mat){return geom(parent,new THREE.SphereGeometry(r,12,8),mat,...pt)}
function torus(parent,x,y,z,r,t,mat,arc=Math.PI*2,rotation=0){
 const m=geom(parent,new THREE.TorusGeometry(r,t,8,72,arc),mat,x,y,z);m.rotation.z=rotation;return m;
}
function disc(parent,x,y,z,r,w,mat){
 const m=geom(parent,new THREE.CylinderGeometry(r,r,w,32),mat,x,y,z);m.rotation.x=Math.PI/2;return m;
}
function box(parent,pt,size,mat){
 return geom(parent,new THREE.BoxGeometry(...size),mat,...pt);
}
function cable(parent,pts,r=.0028){
 const cv=new THREE.CatmullRomCurve3(pts.map(from));return geom(parent,new THREE.TubeGeometry(cv,28,r,5,false),material.dark);
}
let rear,frontPivot,frontLocal,parts,stemHinge,saddleSlide;
let variant='city',palette='graphite',mode='assembled',targetFold=0,targetExplode=0,actualFold=0,actualExplode=0;
function mount(id,parent){const g=new THREE.Group();g.name='BOM:'+id;g.userData.bomId=id;parent.add(g);parts[id]=g;return g}
function wheel(parent,x,y,z,tag){
 const group=new THREE.Group();group.name='wheel:'+tag;group.position.set(x,y,z);parent.add(group);
 const tyre=VARIANTS[variant].tyre,rr=DESIGN.wheelRadius-tyre/2;
 torus(group,0,0,0,rr,tyre/2,material.tyre);
 for(const depth of [-.013,.013])torus(group,0,0,depth,DESIGN.rimRadius,.0065,material.alloy);
 for(let i=0;i<24;i++){
  const a=i*Math.PI/12;
  for(const side of [-1,1]){
   const b=a+side*.16;
   tube(group,[0,0,side*.037],
     [Math.cos(b)*DESIGN.rimRadius,Math.sin(b)*DESIGN.rimRadius,side*.013],.0015,material.alloy,6);
  }
 }
 disc(group,0,0,0,.022,.112,material.dark);
 disc(group,0,0,-.067,.015,.01,material.alloy);
 disc(group,0,0,.067,.015,.01,material.alloy);
 for(let i=0;i<40;i++){
  const a=i*Math.PI/20;
  const tread=box(group,[Math.cos(a)*(DESIGN.wheelRadius-.001),Math.sin(a)*(DESIGN.wheelRadius-.001),0],[.009,.003,tyre*.72],material.tread);
  tread.rotation.z=a;
 }
 return group;
}
function brake(parent,x,y,side=1){
 const z=-.083;
 torus(parent,x,y,z,.071,.005,material.alloy);
 for(let i=0;i<8;i++){let a=i*Math.PI/4;
  tube(parent,[x,y,z],[x+Math.cos(a)*.065,y+Math.sin(a)*.065,z],.003,material.alloy,6);
 }
 box(parent,[x+side*.045,y+.06,z],[.049,.036,.032],material.dark);
 box(parent,[x+side*.056,y+.073,z],[.02,.018,.043],material.accent);
}
function fender(parent,x,y){
 torus(parent,x,y,0,DESIGN.wheelRadius+.036,.008,material.frame,Math.PI*.75,Math.PI*.11);
 for(const side of [-1,1]){
  tube(parent,[x-.18,y+.18,side*.02],[x-.24,y+.083,side*.025],.003,material.alloy,7);
 }
}
function build(){
 root.traverse(obj=>{if(obj.isMesh)obj.geometry.dispose()});
 root.clear();parts={};stemHinge=null;saddleSlide=null;
 rear=new THREE.Group();rear.name='unfolded-rear-chassis';root.add(rear);
 frontPivot=new THREE.Group();frontPivot.name='vertical-folding-hinge-axis';
 frontPivot.position.copy(from(DESIGN.hinge));root.add(frontPivot);
 frontLocal=new THREE.Group();frontLocal.position.copy(from(DESIGN.hinge).negate());frontPivot.add(frontLocal);
 const rr=mount('rear-frame',rear);
 // Triangulated, double-seat-stay rear. Transmission and rear wheel remain together while folding.
 tube(rr,[-.22,.365,0],[-.265,.80,0],.024,material.frame);
 tube(rr,[-.265,.79,0],[.02,.545,0],.026,material.frame);
 tube(rr,[-.22,.365,0],[.02,.545,0],.029,material.frame);
 for(const z of [-.051,.051]){
  tube(rr,[-.55,.276,z],[-.24,.40,z*.54],.013,material.frame);
  tube(rr,[-.55,.276,z],[-.265,.77,z*.5],.0125,material.frame);
  ball(rr,[-.55,.276,z],.017,material.alloy);
 }
 disc(rr,-.22,.365,0,.038,.095,material.dark);
 const ff=mount('front-frame',frontLocal);
 tube(ff,[.02,.545,0],[.35,.79,0],.030,material.frame);
 tube(ff,[.02,.545,0],[.405,.60,0],.027,material.frame);
 tube(ff,[.35,.79,0],[.405,.60,0],.027,material.frame);
 tube(ff,[.18,.66,0],[.385,.645,0],.015,material.frame);
 // Front hinge lug remains geometrically attached to its eccentric vertical axis.
 tube(ff,[.02,.545,0],[.02,.545,-.09],.023,material.alloy);
 ball(ff,[.02,.545,0],.036,material.accent);
 const h=mount('hinge',rear);
 tube(h,[.02,.545,0],[.02,.545,-.09],.025,material.dark);
 const hingeCylinder=disc(h,.02,.545,-.09,.038,.125,material.accent);
 hingeCylinder.rotation.set(0,0,0); // vertical hinge, not wheel-axle orientation
 for(const level of [.49,.60])ball(h,[.02,level,-.09],.038,material.alloy);
 box(h,[.036,.56,-.143],[.085,.035,.028],material.dark);
 disc(h,.02,.616,-.09,.017,.012,material.alloy).rotation.set(0,0,0);

 wheel(mount('rear-wheel',rear),...DESIGN.rearAxle,'rear');
 wheel(mount('front-wheel',frontLocal),...DESIGN.frontAxle,'front');
 const fork=mount('fork',frontLocal);
 for(const z of [-.062,.062]){
  tube(fork,[.394,.62,z*.60],[.58,.276,z],.018,material.frame);
  tube(fork,[.58,.276,z],[.58,.276,0],.014,material.dark);
 }
 tube(fork,[.36,.76,0],[.40,.60,0],.024,material.alloy);
 tube(fork,[.407,.60,-.064],[.407,.60,.064],.014,material.frame);
 const seat=mount('seat',rear);
 saddleSlide=new THREE.Group();seat.add(saddleSlide);
 tube(saddleSlide,[-.267,.77,0],[-.290,1.06,0],.017,material.alloy);
 disc(saddleSlide,-.268,.81,0,.028,.047,material.dark);
 tube(saddleSlide,[-.29,1.057,-.07],[-.29,1.057,.07],.008,material.alloy);
 const saddle=geom(saddleSlide,new THREE.SphereGeometry(1,32,16),material.leather,-.338,1.077,0);
 saddle.scale.set(.141,.024,.073);
 const underSaddle=geom(saddleSlide,new THREE.SphereGeometry(1,20,12),material.dark,-.332,1.05,0);
 underSaddle.scale.set(.10,.013,.043);
 const cockpit=mount('cockpit',frontLocal);
 stemHinge=new THREE.Group();stemHinge.position.set(.35,.79,0);cockpit.add(stemHinge);
 tube(stemHinge,[0,0,0],[.025,.31,0],.019,material.alloy);
 tube(stemHinge,[.025,.31,-VARIANTS[variant].barWidth/2],[.025,.31,VARIANTS[variant].barWidth/2],.013,material.dark);
 const bw=VARIANTS[variant].barWidth/2;
 for(const s of [-1,1]){
  const grip=geom(stemHinge,new THREE.CylinderGeometry(.018,.018,.126,18),material.leather,.025,.31,s*(bw-.056));
  grip.rotation.x=Math.PI/2;
  tube(stemHinge,[.025,.31,s*(bw-.13)],[.085,.24,s*(bw-.11)],.009,material.accent);
  cable(stemHinge,[[.07,.255,s*(bw-.11)],[.13,.16,s*.09],[.03,.02,s*.02]],.002);
 }
 disc(cockpit,.35,.79,0,.034,.06,material.dark).rotation.z=0;
 const crank=mount('crank',rear);
 const [cx,cy]=DESIGN.bottomBracket;
 disc(crank,cx,cy,.105,.024,.16,material.dark);
 for(const side of [-1,1]){
  const z=side*.12;
  const y=cy+side*.105;
  tube(crank,[cx,cy,z],[cx+.040,y,z],.014,material.alloy);
  box(crank,[cx+.045,y,z+side*.025],[.085,.021,.055],material.dark);
  for(let j=0;j<3;j++)box(crank,[cx+.025+j*.017,y+.011,z+side*.025],[.006,.003,.048],material.accent);
 }
 const chain=mount('chain',rear);
 torus(chain,cx,cy,.118,DESIGN.chainringRadius,.007,material.accent);
 torus(chain,-.55,.276,.118,DESIGN.rearSprocketRadius,.007,material.accent);
 // Two tangent chain runs, both on the REAR half: never cut by the frame fold.
 tube(chain,[cx-.008,cy+DESIGN.chainringRadius,.118],[-.55,.276+DESIGN.rearSprocketRadius,.118],.004,material.dark,7);
 tube(chain,[cx-.008,cy-DESIGN.chainringRadius,.118],[-.55,.276-DESIGN.rearSprocketRadius,.118],.004,material.dark,7);
 for(let i=0;i<30;i++){const a=i*Math.PI/15;
  const t=box(chain,[cx+Math.cos(a)*.095,cy+Math.sin(a)*.095,.118],[.010,.006,.012],material.dark);t.rotation.z=a;
 }
 brake(mount('rear-brake',rear),-.55,.276,1);
 brake(mount('front-brake',frontLocal),.58,.276,-1);
 fender(mount('rear-fender',rear),-.55,.276);
 fender(mount('front-fender',frontLocal),.58,.276);
 const current=BOM.map(p=>p.id);
 if(current.some(id=>!parts[id])||Object.keys(parts).length!==current.length)throw new Error('BOM / scene membership mismatch');
 Object.values(parts).forEach(p=>p.traverse(obj=>{if(obj.isMesh)obj.userData.bomId=p.userData.bomId}));
 root.updateMatrixWorld(true);
}
build();

function setMode(next){
 mode=next;targetFold=next==='folded'?1:0;targetExplode=next==='exploded'?1:0;
 document.querySelectorAll('[data-mode]').forEach(b=>{const yes=b.dataset.mode===next;b.classList.toggle('selected',yes);b.setAttribute('aria-pressed',String(yes))});
 document.getElementById('parts').hidden=next!=='exploded';
 document.getElementById('annotation').textContent=next==='folded'?'01 / HINGE · 180°':next==='exploded'?'02 / SISTEMA · 14 CONJUNTOS':'00 / EN MARCHA · 1:1';
}
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode)));
document.querySelectorAll('[data-palette]').forEach(b=>b.addEventListener('click',()=>{
 palette=b.dataset.palette;material.frame.color.setHex(PALETTES[palette].frame);material.accent.color.setHex(PALETTES[palette].detail);
 document.querySelectorAll('[data-palette]').forEach(x=>{x.classList.toggle('chosen',x===b);x.setAttribute('aria-pressed',String(x===b))});
 document.getElementById('finish').textContent=PALETTES[palette].name;
}));
document.getElementById('variant').addEventListener('click',()=>{
 variant=variant==='city'?'swift':'city';build();document.getElementById('variant').textContent=VARIANTS[variant].name;
 document.getElementById('variantSpec').textContent=VARIANTS[variant].description;
});
document.getElementById('reset').addEventListener('click',()=>{
 camera.position.set(1.52,1.14,2.38);controls.target.set(0,.59,0);controls.update();
});
document.getElementById('download').addEventListener('click',()=>{
 const payload={product:'F/20 original concept',units:'m',variant,palette,design:DESIGN,bom:BOM,
  qa:validateDesign(),note:'Concept art visualization, not manufacturing-ready engineering'};
 const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='F20-config-BOM.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);
});
document.getElementById('exportGlb').addEventListener('click',async()=>{
 const btn=document.getElementById('exportGlb');btn.disabled=true;btn.textContent='EXPORTANDO...';
 try{
  root.updateMatrixWorld(true);
  const data=await new GLTFExporter().parseAsync(root,{binary:true,onlyVisible:true});
  if(!(data instanceof ArrayBuffer)||data.byteLength<1000)throw new Error('GLB sin geometría exportable');
  const url=URL.createObjectURL(new Blob([data],{type:'model/gltf-binary'}));
  const anchor=document.createElement('a');anchor.href=url;anchor.download='F20-'+variant+'-'+palette+'.glb';anchor.click();
  setTimeout(()=>URL.revokeObjectURL(url),2000);
 }catch(e){error.hidden=false;error.textContent='Export GLB no disponible: '+e.message}
 finally{btn.disabled=false;btn.textContent='EXPORTAR MODELO (GLB)'}
});
const list=document.getElementById('bom');
BOM.forEach(part=>{
 const li=document.createElement('li'),n=document.createElement('span'),q=document.createElement('span');
 n.textContent=part.name;q.textContent=String(part.qty).padStart(2,'0');li.append(n,q);list.append(li);
});
const check=validateDesign();
if(!check.ok){error.hidden=false;error.textContent='Control geométrico: '+check.issues.join(', ')}
window.__PROMETEO_W7_10={
 status:'WEBGL_INITIALIZED',qa:check,realDimensions:true,parts:BOM.length,
 setMode,foldPose,renderState:()=>({mode,fold:actualFold,explode:actualExplode,drawCalls:renderer.info.render.calls})
};
function animate(){
 requestAnimationFrame(animate);
 actualFold+=(targetFold-actualFold)*.065;
 actualExplode+=(targetExplode-actualExplode)*.07;
 const pose=foldPose(actualFold);frontPivot.rotation.y=pose.mainYaw;
 stemHinge.rotation.z=pose.stemAngle;saddleSlide.position.y=-pose.seatDrop;
 for(const entry of BOM){const part=parts[entry.id],v=entry.offset;
  part.position.set(v[0]*actualExplode,v[1]*actualExplode,v[2]*actualExplode);
 }
 if(Math.abs(actualFold-targetFold)<1e-5)actualFold=targetFold;
 controls.update();renderer.render(scene,camera);
}
animate();
addEventListener('resize',()=>{
 camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);
});
