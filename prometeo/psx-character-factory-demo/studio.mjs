import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';

// PSX FACE FACTORY v1. One neutral, reusable character template and a late-1990s video store.
// All face pixels are applied to actual front-facing polygonal head triangles through UVs.
// The source photo is NEVER displayed as a flat polygon in the 3D scene.
const $=id=>document.getElementById(id);
const canvas=$('world'), status=$('status'), fallback=$('fallback');
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const scene=new THREE.Scene(),clock=new THREE.Clock(),world=new THREE.Group();
scene.add(world);
const photoState={image:null,source:'',crop:{cx:.50,cy:.397,scale:1},shape:{jaw:1,head:1,nose:1},url:null};
const PROFILE={
 portrait:{p:[.46,2.46,2.43],t:[.46,2.39,-.34],fov:29,label:'01 / ROSTRO FRONTAL'},
 quarter:{p:[1.63,2.43,2.27],t:[.46,2.37,-.34],fov:30,label:'02 / VISTA 3/4'},
 profile:{p:[3.08,2.42,-.15],t:[.46,2.38,-.34],fov:27,label:'03 / PERFIL 3D'},
 scene:{p:[3.05,2.58,5.84],t:[0,1.54,-1.04],fov:45,label:'04 / VIDEOCLUB · 1998'}
};
let renderer,camera,controls,character,headMesh,faceTexture,faceMaterial,skinMaterial,view='portrait',detector=null,ready=false,currentInput=null;
let exportInProgress=false;const setStatus=(msg)=>{status.textContent=msg};
const material=(color,roughness=.85,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
const palette={
 concrete:material(0x354144,.98),plaster:material(0x384f58,.98),
 wood:material(0x675443,.94),woodEdge:material(0x98765b,.86),
 metal:material(0x667779,.51,.47),brass:material(0xc3a16e,.38,.48),
 black:material(0x17252b,.83),night:material(0x102733,.99),
 skin:material(0xc6987f,.92),coat:material(0x494942,.91),
 teal:material(0x527470,.87),boot:material(0x242629,.82),tan:material(0x94755d,.92)
};
function box(p,s,m,parent=world,name=''){
 const o=new THREE.Mesh(new THREE.BoxGeometry(...s),m);o.position.set(...p);o.castShadow=true;o.receiveShadow=true;o.name=name;parent.add(o);return o;
}
function geomMesh(g,m,p,parent=world,name=''){
 const o=new THREE.Mesh(g,m);o.position.set(...p);o.castShadow=true;o.receiveShadow=true;o.name=name;parent.add(o);return o;
}
function pipe(a,b,r,mat,parent=world,n=8){
 const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),delta=B.clone().sub(A);
 const o=geomMesh(new THREE.CylinderGeometry(r,r,delta.length(),n),mat,A.clone().add(B).multiplyScalar(.5).toArray(),parent);
 o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return o;
}
function capsule(p,rad,length,mat,parent=world){
 return geomMesh(new THREE.CapsuleGeometry(rad,length,3,8),mat,p,parent);
}
function posterTexture(title,sub,color='#6f4d44'){
 const c=document.createElement('canvas');c.width=128;c.height=192;
 const x=c.getContext('2d');x.imageSmoothingEnabled=false;
 x.fillStyle=color;x.fillRect(0,0,128,192);x.strokeStyle='#dbc9a3';x.lineWidth=3;x.strokeRect(5,5,118,182);
 x.fillStyle='#1b2424';x.fillRect(12,20,104,75);x.fillStyle='#d6ba88';x.fillRect(19,27,42,59);
 x.fillStyle='#b16d58';x.beginPath();x.moveTo(65,27);x.lineTo(110,93);x.lineTo(75,93);x.fill();
 x.fillStyle='#f3dfb7';x.textAlign='center';x.font='bold 20px Georgia';x.fillText(title,64,130);
 x.fillStyle='#d3bb9d';x.font='bold 11px monospace';x.fillText(sub,64,153);x.font='10px monospace';x.fillText('VHS · 1998',64,170);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;return t;
}
function clothTexture(base='#4b5150'){
 const c=document.createElement('canvas');c.width=128;c.height=128;const x=c.getContext('2d');
 x.fillStyle=base;x.fillRect(0,0,128,128);let seed=8315;const rand=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
 for(let i=0;i<1600;i++){x.fillStyle=(i%4===0)?'#ffffff09':'#00000010';x.fillRect(rand()*128,rand()*128,1,rand()*4+.5)}
 for(let k=10;k<128;k+=18){x.strokeStyle='#172a2630';x.beginPath();x.moveTo(k,0);x.lineTo(k+7,128);x.stroke()}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestMipmapNearestFilter;return t;
}
function uvProfile(rings,n=12){
 // [height, radiusX, radiusZ, offsetX, offsetZ], conical fabric mesh with deliberate cloth profile
 const positions=[],uvs=[],ind=[];
 for(let i=0;i<rings.length;i++){
  let [y,rx,rz,ox=0,oz=0]=rings[i];
  for(let j=0;j<=n;j++){
   const a=2*Math.PI*j/n;
   positions.push(ox+Math.cos(a)*rx,y,oz+Math.sin(a)*rz);
   uvs.push(j/n,i/(rings.length-1));
  }
 }
 for(let i=0;i<rings.length-1;i++)for(let j=0;j<n;j++){
  const a=i*(n+1)+j,b=a+n+1;
  ind.push(a,b,a+1,b,b+1,a+1);
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.setIndex(ind);g.computeVertexNormals();return g;
}
function finishObject(m,rough=.88){m.castShadow=true;m.receiveShadow=true;return m}
function makeCharacter(){
 const root=new THREE.Group();root.name='PSX_TEMPLATE_01';root.position.set(.45,0,-.34);world.add(root);
 const jacketMat=new THREE.MeshStandardMaterial({map:clothTexture('#4b5a52'),color:0xc1c3bc,roughness:1,flatShading:true});
 const trousers=new THREE.MeshStandardMaterial({map:clothTexture('#4a4f4c'),color:0xa8a9aa,roughness:1,flatShading:true});
 const leather=new THREE.MeshStandardMaterial({map:clothTexture('#584336'),roughness:.9,flatShading:true});
 // Torso crafted as continuous tapered garment rather than a stack of primitive cubes.
 const torso=geomMesh(uvProfile([[.91,.275,.19],[1.05,.31,.22],[1.50,.34,.225],[1.79,.38,.26],[1.99,.295,.22],[2.05,.16,.15]],12),jacketMat,[0,0,0],root,'COAT_MAIN');
 // overlapping cloth panels add realistic overlapping seams/volume
 const panel=geomMesh(new THREE.ShapeGeometry(new THREE.Shape()),palette.teal,[0,0,0],root);panel.visible=false;
 for(const side of [-1,1]){
  // regular joint at knees / shoes with tapered boot toe
  geomMesh(uvProfile([[.04,.12,.19],[.21,.12,.165],[.58,.15,.16],[1.00,.18,.17]],9),trousers,[side*.17,0,0],root,'TROUSER');
  const foot=geomMesh(new THREE.DodecahedronGeometry(.18,0),palette.boot,[side*.17,.10,.12],root,'LEATHER_SHOE');
  foot.scale.set(1.05,.53,1.4);
  const arm=geomMesh(uvProfile([[-.57,.09,.12],[-.32,.14,.145],[-.03,.20,.20],[.07,.15,.16]],10),jacketMat,[side*.35,1.88,0],root,'SLEEVE');
  arm.rotation.z=side*.13;arm.rotation.x=-.08;
  const hand=geomMesh(new THREE.IcosahedronGeometry(.105,1),palette.skin,[side*.46,1.19,.065],root,'HAND');
  hand.scale.set(.90,1.20,.85);
 }
 // recognizable clothing identifiers: zip seam, contrast collar, cuffs, belt.
 pipe([0,1.03,.245],[0,1.91,.251],.012,palette.brass,root,5);
 for(let k=0;k<5;k++){
  const y=1.20+k*.147;box([.055,y,.264],[.035,.018,.018],palette.brass,root,'ZIPPER');
 }
 for(const side of [-1,1]){
  const collar=geomMesh(new THREE.ConeGeometry(.21,.28,4),palette.tan,[side*.15,1.99,.17],root,'COLLAR');
  collar.scale.set(.77,.63,.52);collar.rotation.z=side*.45;
 }
 box([0,1.035,.221],[.61,.11,.08],leather,root,'BELT');
 box([0,1.048,.273],[.13,.12,.04],palette.brass,root,'BUCKLE');
 for(const side of [-1,1])box([side*.21,1.44,.216],[.14,.16,.026],palette.black,root,'POCKET');
 // neck under real cranium, not a planar sticker
 geomMesh(new THREE.CylinderGeometry(.13,.15,.25,10),palette.skin,[0,2.10,.018],root,'NECK');
 const headRoot=new THREE.Group();headRoot.name='HEAD_RIG_STATIC';headRoot.position.set(0,2.40,.015);root.add(headRoot);
 // Initial template geometry replaced by createFaceMaterial/updateHead.
 skinMaterial=material(0xb99a80,.95);
 faceMaterial=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.93,metalness:0,side:THREE.FrontSide});
 headMesh=geomMesh(makeHeadGeometry(photoState.shape),[faceMaterial,skinMaterial],[0,0,0],headRoot,'UV_FACIAL_MESH');
 for(const side of [-1,1]){
  const ear=geomMesh(new THREE.IcosahedronGeometry(.105,1),skinMaterial,[side*.31,-.04,-.023],headRoot,'EAR');
  ear.scale.set(.67,1.28,.82);
 }
 // Crown/hair is purpose-built separate polygonal mesh and not a face card.
 const hairMat=material(0xb08d62,.99);
 const hair=geomMesh(uvProfile([[.19,.275,.285],[.35,.30,.285],[.44,.245,.245],[.51,.11,.10]],12),hairMat,[0,0,-.035],headRoot,'HAIR_SCALP');
 for(let k=0;k<4;k++){
  const strand=geomMesh(new THREE.ConeGeometry(.11,.25,3),hairMat,[-.18+k*.12,.405,.245],headRoot,'HAIR_STRAND');
  strand.rotation.z=.28;strand.rotation.x=.72;strand.scale.set(1,.55,1.13);
 }
 root.userData.factory={schema:'prometeo.psx.character/v1',rigged:false,faceMaterial:'projected-photo-uv',movements:'static-clean-baseline',source:'photo-upload-or-licensed-sample'};
 return root;
}
// Real curved triangulated cranium with nose extrusion, cheek and chin profiles.
export function makeHeadGeometry(shape={jaw:1,head:1,nose:1}){
 const rings=[
 [-.49,.07,.18],[-.43,.17,.23],[-.32,.235,.28],[-.19,.272,.304],
 [-.075,.282,.32],[.035,.278,.325],[.13,.29,.318],[.23,.287,.302],
 [.34,.264,.265],[.43,.20,.205],[.50,.09,.12]
 ];
 const segments=28,points=[],uv=[],indices=[],groups=[];const fullCount=segments+1;
 for(let r=0;r<rings.length;r++){
  const [y,rx,rz]=rings[r];
  for(let j=0;j<=segments;j++){
   let theta=-Math.PI+2*Math.PI*j/segments;
   const side=Math.sin(theta),front=Math.cos(theta);
   let w=rx*(y<-.22?shape.jaw:shape.head);
   let x=w*side,z=rz*front;
   // cheekbones and nose bridge are actual 3D relief
   const noseZone=Math.exp(-Math.pow(theta/.27,2))*Math.exp(-Math.pow((y+.03)/.16,2));
   z+=.095*noseZone*shape.nose;
   if(y<-.28)z-=.015*front;
   points.push(x,y,z);
   uv.push(.5+side*.48,(y+.50)/1.0);
  }
 }
 for(let r=0;r<rings.length-1;r++)for(let j=0;j<segments;j++){
  const a=r*fullCount+j,b=a+fullCount;
  const first=indices.length;indices.push(a,b,a+1,b,b+1,a+1);
  const angle=-Math.PI+2*Math.PI*(j+.5)/segments;
  // Only the front facial polygon receives photo material; ears/scalp/back keep skin.
  groups.push({start:first,count:6,materialIndex:Math.abs(angle)<1.21?0:1});
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(points,3));
 g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);
 for(let q of groups)g.addGroup(q.start,q.count,q.materialIndex);
 g.computeVertexNormals();return g;
}
function makeTexture(img){
 const size=256,c=document.createElement('canvas');c.width=c.height=size;
 const x=c.getContext('2d',{willReadFrequently:true});x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';
 const w=img.naturalWidth||img.width,h=img.naturalHeight||img.height;
 const {cx,cy,scale}=photoState.crop;
 const base=Math.min(w,h)*.69/scale;
 // Crops retain hair, eyes, nose, jaw; alignment fine-tuned by Face Landmarker or manual controls.
 const sx=cx*w-base/2,sy=cy*h-base/2;
 const crop=document.createElement('canvas');crop.width=crop.height=size;const p=crop.getContext('2d',{willReadFrequently:true});
 p.drawImage(img,sx,sy,base,base,0,0,size,size);
 // Sample skin from cheek centers, avoiding flag, clothing and background.
 const sample=p.getImageData(0,0,size,size).data;
 const positions=[[.30,.65],[.70,.65],[.26,.54],[.74,.54],[.50,.74]];
 let rr=0,gg=0,bb=0,n=0;
 for(let [u,v] of positions){
  const idx=((Math.round(v*255)*256)+Math.round(u*255))*4;
  const r=sample[idx],g=sample[idx+1],b=sample[idx+2];if(r>55&&r<245&&g>38&&b>25){rr+=r;gg+=g;bb+=b;n++}
 }
 const skin=n?[(rr/n)|0,(gg/n)|0,(bb/n)|0]:[189,148,124];
 const bg='rgb('+skin.join(',')+')';x.fillStyle=bg;x.fillRect(0,0,size,size);
 // Feather photo into the same skin base; no rectangular billboard boundaries.
 const mask=document.createElement('canvas');mask.width=mask.height=size;const m=mask.getContext('2d');
 m.drawImage(crop,0,0);
 m.globalCompositeOperation='destination-in';const grad=m.createRadialGradient(128,127,81,128,127,138);
 grad.addColorStop(0,'rgba(0,0,0,1)');grad.addColorStop(.60,'rgba(0,0,0,.96)');grad.addColorStop(1,'rgba(0,0,0,0)');
 m.fillStyle=grad;m.fillRect(0,0,256,256);m.globalCompositeOperation='source-over';
 x.drawImage(mask,0,0);
 // PS1-style color precision with deliberately restrained near-neighbor sampling, not a VHS filter.
 const image=x.getImageData(0,0,256,256);
 for(let i=0;i<image.data.length;i+=4){
  for(let c=0;c<3;c++)image.data[i+c]=Math.min(255,Math.round(image.data[i+c]/8)*8);
 }
 x.putImageData(image,0,0);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
 t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestMipmapNearestFilter;t.anisotropy=1;
 t.needsUpdate=true;return {texture:t,canvas:c,skin};
}
function applyPhoto(img,source){
 photoState.image=img;photoState.source=source;
 const old=faceTexture;const result=makeTexture(img);faceTexture=result.texture;
 faceMaterial.map=faceTexture;faceMaterial.color.setHex(0xffffff);faceMaterial.needsUpdate=true;
 const [r,g,b]=result.skin;skinMaterial.color.setRGB(r/255,g/255,b/255,THREE.SRGBColorSpace);skinMaterial.needsUpdate=true;
 palette.skin.color.copy(skinMaterial.color);
 if(old)old.dispose();
 const preview=$('preview');preview.src=result.canvas.toDataURL('image/png');preview.style.display='block';
 ready=true;window.__PSX_FACTORY_QA={...(window.__PSX_FACTORY_QA||{}),ready:true,photoApplied:true,photoSource:source,triangles:headMesh.geometry.index.count/3,frontGroups:headMesh.geometry.groups.filter(g=>g.materialIndex===0).length,texture:256,mesh3d:true};
 setStatus('ROSTRO UV ACTIVO · 256² · '+(headMesh.geometry.index.count/3)+' TRIÁNGULOS\n'+source+' · foto local: NO se sube');
}
function readImage(src,source){
 return new Promise((resolve,reject)=>{
  const img=new Image();img.crossOrigin='anonymous';
  img.onload=()=>{try{applyPhoto(img,source);resolve(img)}catch(e){reject(e)}};
  img.onerror=()=>reject(Error('No se pudo decodificar la imagen '+source));
  img.src=src;
 });
}
function createLighting(){
 scene.background=new THREE.Color(0x111f29);scene.fog=new THREE.FogExp2(0x142933,.028);
 scene.add(new THREE.HemisphereLight(0xa3b4b3,0x251e1e,1.12));
 const warm=new THREE.SpotLight(0xffcf9b,105,12,Math.PI*.39,.73,1.4);
 warm.position.set(-.1,4.1,2.5);warm.target.position.set(.2,1.4,-.8);
 warm.castShadow=true;warm.shadow.mapSize.set(1024,1024);warm.shadow.normalBias=.014;warm.shadow.bias=-.00024;
 world.add(warm,warm.target);
 const cool=new THREE.DirectionalLight(0x5b9fb8,3.3);cool.position.set(3.1,3.2,-1.5);world.add(cool);
 const signage=new THREE.PointLight(0xe9895e,18,5,2);signage.position.set(-2.8,3.2,-2.0);world.add(signage);
 const windowLight=new THREE.PointLight(0x6bc1d5,20,4,2);windowLight.position.set(2.2,2.6,-2.65);world.add(windowLight);
}
function sceneTexture(type){
 const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');
 x.fillStyle=type==='floor'?'#484c46':'#6e5c4b';x.fillRect(0,0,128,128);
 let seed=3317;const rand=()=>((seed=(1103515245*seed+12345)>>>0)/4294967296);
 for(let i=0;i<950;i++){
  x.fillStyle=(i%5===0)?'#ffffff0b':'#09090c10';
  const xx=rand()*128,yy=rand()*128;x.fillRect(xx,yy,type==='floor'?2:1,rand()*8+1);
 }
 if(type==='wood'){x.strokeStyle='#1b19171f';for(let k=0;k<8;k++){let px=rand()*128;x.beginPath();x.moveTo(px,0);x.bezierCurveTo(px+5,30,px-5,80,px,128);x.stroke()}}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=THREE.NearestFilter;return t;
}
function makeVideoStore(){
 // Location and visual mood: a coherent 1998 Argentine video club, not a void with props.
 const floorMat=new THREE.MeshStandardMaterial({map:sceneTexture('floor'),roughness:1});
 const floor=geomMesh(new THREE.PlaneGeometry(11,10),floorMat,[0,-.02,-1.0],world,'TILE_FLOOR');
 floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;floor.castShadow=false;
 for(let x=-4.2;x<=4.2;x+=.60)box([x,.002,-1.0],[.013,.012,9.5],palette.concrete);
 for(let z=-4.5;z<=3.5;z+=.62)box([0,.003,z],[9,.012,.012],palette.concrete);
 box([0,2.3,-3.20],[9,4.8,.20],palette.plaster);
 box([-4.3,2.28,-.8],[.20,4.65,5.8],palette.concrete);
 for(let y of [.21,1.18,2.38,3.4,4.3])box([0,y,-3.05],[8.6,.07,.10],palette.woodEdge);
 for(let x of [-4.12,-2.42,-.78,.73,2.85,4.15])box([x,2.29,-3.04],[.08,4.58,.12],palette.wood);
 // Window: night street visible and atmospheric, framed in actual geometry
 const glass=new THREE.MeshStandardMaterial({color:0x173c4f,emissive:0x061b29,emissiveIntensity:.38,roughness:.18,metalness:.12});
 box([2.35,2.56,-2.93],[2.5,2.34,.06],glass);
 for(let x of [1.08,2.35,3.62])box([x,2.55,-2.80],[.08,2.42,.15],palette.metal);
 for(let y of [1.38,2.53,3.72])box([2.35,y,-2.80],[2.62,.08,.15],palette.metal);
 for(let [x,h] of [[1.4,.50],[1.94,.87],[2.65,.73],[3.13,.99]]){
  box([x,1.55+h*.5,-3.03],[.35,h,.045],palette.night);
  for(let j=0;j<3;j++)if((Math.ceil(x*9)+j)%2)box([x,1.64+j*.23,-2.997],[.052,.065,.005],palette.brass);
 }
 // rain strands as real line geometry behind window
 const pts=[];
 for(let i=0;i<110;i++){
  let x=1.14+((i*1.43)%2.30),y=1.50+((i*.417)%2.05),z=-2.89+((i*.03)%.015);
  pts.push(x,y,z,x-.023,y-.10-(i%4)*.032,z);
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));
 world.add(new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0x8bc6d9,transparent:true,opacity:.52})));
 // Shelves and VHS tape cases (different colors, orientation, meaningful repetitive design)
 for(const y of [.82,1.70,2.61,3.52]){
  box([-2.95,y,-2.69],[1.72,.16,.72],palette.wood);
  for(let i=0;i<13;i++){
   let col=[0x5d6665,0x7f4d42,0x4e6770,0x927052,0x58634c][(i+Math.floor(y*10))%5];
   box([-3.70+i*.115,y+.23,-2.43],[.086,.37+(i%3)*.045,.29],material(col,.97));
   box([-3.70+i*.115,y+.21,-2.277],[.060,.23,.006],material(0xb6a28c,.97));
  }
 }
 // neon store signage, actually attached to architecture
 const sign=document.createElement('canvas');sign.width=512;sign.height=128;const sx=sign.getContext('2d');
 sx.fillStyle='#203235';sx.fillRect(0,0,512,128);sx.strokeStyle='#c08358';sx.lineWidth=9;sx.strokeRect(7,7,498,114);
 sx.fillStyle='#f6cc8e';sx.font='bold 65px Georgia';sx.textAlign='center';sx.fillText('VIDEO · 24',256,83);
 const st=new THREE.CanvasTexture(sign);st.colorSpace=THREE.SRGBColorSpace;st.magFilter=THREE.NearestFilter;
 const signMesh=geomMesh(new THREE.PlaneGeometry(2.7,.66),new THREE.MeshStandardMaterial({map:st,emissiveMap:st,emissive:0x774422,emissiveIntensity:.45,roughness:.95}),[-2.67,3.83,-2.64],world,'VIDEO_SIGN');
 // Art-directed poster prop, actual artwork on walls
 for(let [x,ttl,sub,col] of [[-.20,'ÚLTIMA','NOCHE','#60453d'],[.77,'NADIE','VOLVIÓ','#355768']]){
  const tex=posterTexture(ttl,sub,col);
  geomMesh(new THREE.PlaneGeometry(.66,.99),new THREE.MeshStandardMaterial({map:tex,roughness:.99}),[x,2.94,-2.91],world,'PSX_POSTER');
 }
 // Split counter leaves space for protagonist, with proper legs/base
 const woodMat=new THREE.MeshStandardMaterial({map:sceneTexture('wood'),roughness:.95});
 for(const x of [-2.65,-1.05]){
  box([x,.61,1.05],[.22,1.22,.22],palette.black);
  box([x,.61,.1],[.22,1.22,.22],palette.black);
 }
 box([-1.88,1.25,.60],[2.9,.19,1.38],woodMat);
 box([-1.88,1.32,.60],[2.94,.045,1.42],palette.woodEdge);
 box([-1.91,.64,1.05],[2.75,.75,.12],palette.wood);
 box([-1.91,.38,1.12],[2.36,.19,.10],palette.woodEdge);
 // Cassette stack and register, materiality and visual contact
 for(let k=0;k<3;k++){
  const a=box([-2.91+.17*k,1.385,.88],[.27,.05,.42],material([0x6a5260,0x637066,0x4a5364][k]));
  a.rotation.y=(k-1)*.18;
 }
 box([-1.55,1.45,.35],[.50,.22,.38],palette.black);
 box([-1.55,1.58,.34],[.36,.035,.19],palette.metal);
 for(let k=0;k<5;k++)box([-1.70+k*.075,1.603,.38],[.052,.01,.09],palette.tan);
 // Hanging fluorescent fixture: single luminous warm key
 box([.25,4.05,.31],[2.6,.19,.31],palette.black);
 box([.25,3.91,.31],[2.35,.045,.24],new THREE.MeshStandardMaterial({color:0xffe7b8,emissive:0xffcf8b,emissiveIntensity:2.4}));
 for(let x of [-.75,1.25])pipe([x,4.07,.31],[x,4.50,.31],.035,palette.metal);
 // Street door on side: architectural proportions, panel and handle
 box([3.95,1.95,-.58],[.17,3.58,2.2],palette.black);
 for(let y of [.26,1.98,3.56])box([3.85,y,-.58],[.12,.09,2.2],palette.metal);
 for(let z of [-1.52,.38])box([3.84,1.96,z],[.12,3.6,.12],palette.metal);
 const doorHandle=geomMesh(new THREE.CylinderGeometry(.055,.055,.07,8),palette.brass,[3.73,1.52,.12],world,'DOOR_HANDLE');doorHandle.rotation.x=Math.PI/2;
 const rug=geomMesh(new THREE.PlaneGeometry(1.8,.7),palette.tan,[-.28,.018,1.83]);rug.rotation.x=-Math.PI/2;rug.castShadow=false;
}
function setupThree(){
 const context=canvas.getContext('webgl2',{alpha:false,antialias:false,powerPreference:'default',preserveDrawingBuffer:true});
 if(!context)throw Error('WebGL2 no disponible. Abrí en Chrome con aceleración gráfica.');
 renderer=new THREE.WebGLRenderer({canvas,context,antialias:false,preserveDrawingBuffer:true});
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 renderer.setPixelRatio(1);
 camera=new THREE.PerspectiveCamera(36,1,.04,110);
 controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.075;
 controls.enablePan=false;controls.minDistance=.6;controls.maxDistance=10.5;
 controls.minPolarAngle=.5;controls.maxPolarAngle=2.15;
 createLighting();makeVideoStore();character=makeCharacter();
 canvas.addEventListener('pointerdown',()=>{});
 resize();setView(new URLSearchParams(location.search).get('view')||'portrait');
 const count=()=>{let n=0;character.traverse(o=>{if(o.isMesh&&o.visible)n+=o.geometry.index?o.geometry.index.count/3:o.geometry.attributes.position.count/3});return Math.round(n)};
 window.__PSX_FACTORY_QA={ready:false,webgl:true,templateTris:count(),shader:'ACES',exportSupported:true,scene:'videoclub-1998',platform:THREE.REVISION};
 window.__PSX_FACTORY_SETVIEW=(v)=>setView(v);
 window.__PSX_FACTORY_SET_CROP=(crop)=>{Object.assign(photoState.crop,crop);if(photoState.image)applyPhoto(photoState.image,photoState.source)};
 requestAnimationFrame(frame);
}
function resize(){
 if(!renderer)return;
 const bounds=canvas.getBoundingClientRect();
 const width=Math.max(240,bounds.width),height=Math.max(240,bounds.height);
 const scale=Math.min(1.0,560/Math.max(width,height)); // deliberate controlled raster resolution
 const w=Math.max(240,Math.round(width*scale)),h=Math.max(240,Math.round(height*scale));
 renderer.setSize(w,h,false);
 camera.aspect=width/height;camera.updateProjectionMatrix();
}
function setView(id){
 view=PROFILE[id]?id:'portrait';
 for(let b of document.querySelectorAll('[data-view]'))b.classList.toggle('active',b.dataset.view===view);
 const d=PROFILE[view];camera.position.set(...d.p);controls.target.set(...d.t);
 camera.fov=d.fov;camera.updateProjectionMatrix();controls.update();
 $('viewLabel').textContent=d.label;
}
function frame(){
 requestAnimationFrame(frame);
 if(!renderer||!camera)return;
 controls.update();renderer.render(scene,camera);
}
async function runFaceDetection(){
 if(!photoState.image)throw Error('Primero cargá una fotografía');
 const button=$('detect');button.disabled=true;setStatus('Descargando modelo de landmarks / WASM…');
 try{
  if(!detector){
   const {FaceLandmarker,FilesetResolver}=await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/+esm');
   const vision=await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm');
   detector=await FaceLandmarker.createFromOptions(vision,{
    baseOptions:{modelAssetPath:'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',delegate:'CPU'},
    runningMode:'IMAGE',numFaces:1,outputFaceBlendshapes:false
   });
  }
  const result=detector.detect(photoState.image),lm=result.faceLandmarks?.[0];
  if(!lm||lm.length<468)throw Error('No se detectó un rostro frontal válido');
  const xs=lm.map(p=>p.x),ys=lm.map(p=>p.y);
  const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
  const cw=x1-x0,ch=y1-y0;
  photoState.crop.cx=(x0+x1)/2;
  photoState.crop.cy=(y0+y1)/2-.012;
  const image=photoState.image;
  const width=image.naturalWidth||image.width,height=image.naturalHeight||image.height;
  const pixels=Math.max(cw*width*1.47,ch*height*1.19);
  photoState.crop.scale=clamp(Math.min(width,height)*.69/pixels,.67,1.55);
  $('zoom').value=photoState.crop.scale.toFixed(2);$('offsetY').value=0;
  // Narrow, clamped identity shape adaptation; not a claim of precise 360° reconstruction
  const cheekWidth=Math.abs(lm[234].x-lm[454].x),eyeWidth=Math.abs(lm[33].x-lm[263].x);
  const chinToNose=Math.abs(lm[152].y-lm[4].y);
  const faceLength=Math.abs(lm[152].y-lm[10].y);
  photoState.shape.jaw=clamp(.93+.17*(cheekWidth/Math.max(cw,.01)),.91,1.12);
  photoState.shape.head=clamp(.96+.07*(eyeWidth/Math.max(cw,.01)),.94,1.08);
  photoState.shape.nose=clamp(.90+.35*(chinToNose/Math.max(faceLength,.01)),.89,1.15);
  const prev=headMesh.geometry;headMesh.geometry=makeHeadGeometry(photoState.shape);prev.dispose();
  applyPhoto(photoState.image,photoState.source+' · detección real');
  window.__PSX_FACTORY_QA.detected=true;
  setStatus('MEDIAPIPE DETECTÓ '+lm.length+' PUNTOS.\nMapa UV y perfil calibrados; precisión lateral todavía aproximada.');
 }catch(e){
  setStatus('MEDIAPIPE NO DISPONIBLE: '+e.message+'\nLa textura manual sigue lista. Ajustá zoom e Y.');
  window.__PSX_FACTORY_QA.detectError=String(e);
 }finally{button.disabled=false}
}
async function exportGLB(){
 if(exportInProgress||!ready)return;
 const b=$('export');b.disabled=true;exportInProgress=true;setStatus('Exportando GLB con textura incorporada…');
 try{
  const root=character.clone(true);root.position.set(0,0,0);
  root.traverse(o=>{if(o.name==='UV_FACIAL_MESH')o.material=[faceMaterial,skinMaterial]});
  const exporter=new GLTFExporter();
  const data=await exporter.parseAsync(root,{binary:true,onlyVisible:true,trs:true,maxTextureSize:512});
  if(!(data instanceof ArrayBuffer)||data.byteLength<1000)throw Error('GLB vacío');
  const blob=new Blob([data],{type:'model/gltf-binary'}),url=URL.createObjectURL(blob);
  const link=document.createElement('a');link.href=url;link.download='prometeo-psx-persona-001.glb';
  document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
  window.__PSX_FACTORY_QA.exportBytes=data.byteLength;
  setStatus('EXPORTADO: '+Math.round(data.byteLength/1024)+' KiB GLB con UV.\nVerificá importación en FORJA antes de producción.');
 }catch(e){setStatus('FALLÓ EXPORT GLB: '+e.message);window.__PSX_FACTORY_QA.exportError=String(e)}
 finally{b.disabled=false;exportInProgress=false}
}
function bindUI(){
 document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
 const update=()=>{if(!photoState.image)return;const z=Number($('zoom').value);
  photoState.crop.scale=z;
  photoState.crop.cy=photoState.source.startsWith('ejemplo')?.397+Number($('offsetY').value):photoState.cropBaseY+Number($('offsetY').value);
  applyPhoto(photoState.image,photoState.source);
 };
 $('zoom').addEventListener('input',update);$('offsetY').addEventListener('input',update);
 $('file').addEventListener('change',async e=>{
  const file=e.target.files?.[0];if(!file)return;
  if(!/^image\/(png|jpeg|webp)$/.test(file.type)||file.size>12_000_000){setStatus('Formato no válido o imagen superior a 12MB');return}
  if(photoState.url)URL.revokeObjectURL(photoState.url);
  photoState.url=URL.createObjectURL(file);
  photoState.crop={cx:.5,cy:.43,scale:1};photoState.cropBaseY=.43;
  $('zoom').value=1;$('offsetY').value=0;
  try{await readImage(photoState.url,'foto local: '+file.name);setView('portrait');await runFaceDetection()}
  catch(err){setStatus('ERROR LEYENDO FOTO '+err.message)}
 });
 $('example').addEventListener('click',async()=>{
  photoState.crop={cx:.50,cy:.397,scale:1};photoState.cropBaseY=.397;
  $('zoom').value='1';$('offsetY').value='0';
  try{await readImage('./assets/reference-trump-2017-500px.jpg','ejemplo público');setView('portrait')}catch(e){setStatus(e.message)}
 });
 $('detect').addEventListener('click',runFaceDetection);
 $('export').addEventListener('click',exportGLB);
 window.addEventListener('resize',resize);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)resize()});
}
async function boot(){
 try{
  setupThree();bindUI();
  const img=await readImage('./assets/reference-trump-2017-500px.jpg','ejemplo público');
  photoState.cropBaseY=.397;
  setView(new URLSearchParams(location.search).get('view')||'portrait');
 }catch(e){
  console.error(e);setStatus('ERROR '+e.message);fallback.classList.add('show');
  fallback.textContent='No se pudo iniciar el laboratorio WebGL2: '+e.message;
  window.__PSX_FACTORY_QA={ready:false,error:String(e),stack:String(e.stack||'')};
 }
}
boot();
