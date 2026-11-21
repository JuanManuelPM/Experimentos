import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import {config} from './scene-config.mjs';
import {phaseAt,carPosition,pedPosition,heading,mod,DURATION} from './traffic-core.mjs';

const ui=id=>document.getElementById(id);
let renderer,scene,camera,controls,world,clockTime=0,last=0,paused=false,night=false;
const people=[],cars=[],selectables=[],lights=[],signalHeads=[],pedHeads=[];
const MAX_DPR=Math.min(devicePixelRatio||1,1.45);
const M={};
function material(color,roughness=.88,metalness=0){return new THREE.MeshStandardMaterial({color,roughness,metalness})}
function mat(k,color,roughness,metalness){return M[k]||(M[k]=material(color,roughness,metalness))}
function cube(parent,w,h,d,x,y,z,m,shadow=false){
 const a=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);a.position.set(x,y,z);
 a.castShadow=shadow;a.receiveShadow=true;parent.add(a);return a;
}
function cylinder(parent,r1,r2,h,x,y,z,m,segments=10){
 const a=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,segments),m);a.position.set(x,y,z);a.castShadow=true;parent.add(a);return a;
}
function plane(parent,w,h,x,y,z,m,ry=0){
 const a=new THREE.Mesh(new THREE.PlaneGeometry(w,h),m);a.position.set(x,y,z);a.rotation.y=ry;parent.add(a);return a;
}
function groundPlane(w,h,x,y,z,m){
 const a=plane(world,w,h,x,y,z,m);a.rotation.x=-Math.PI/2;a.receiveShadow=true;return a;
}
function textTexture(label,bg,fg,sub=''){
 const c=document.createElement('canvas');c.width=768;c.height=196;
 const g=c.getContext('2d');g.fillStyle=bg;g.fillRect(0,0,c.width,c.height);
 g.strokeStyle='rgba(255,255,255,.3)';g.lineWidth=7;g.strokeRect(11,11,746,174);
 g.textAlign='center';g.fillStyle=fg;g.font='700 94px Georgia,serif';g.fillText(label,384,114,690);
 if(sub){g.font='bold 27px sans-serif';g.letterSpacing='4px';g.fillText(sub,384,160,650)}
 const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=4;return tex;
}
function sign(parent,txt,w,x,y,z,ry=0,bg='#24444a',fg='#f9e4ba',sub=''){
 const materialSign=new THREE.MeshStandardMaterial({map:textTexture(txt,bg,fg,sub),roughness:.65,metalness:.05,emissive:0x322214,emissiveIntensity:.2});
 return plane(parent,w,w*.26,x,y,z,materialSign,ry);
}
function makeStreets(){
 groundPlane(110,110,0,-.19,0,mat('ground','#586561'));
 cube(world,110,.14,13,0,-.06,0,mat('asphalt','#343d45'));
 cube(world,13,.14,110,0,-.06,0,mat('asphalt','#343d45'));
 const paving=mat('paving','#b0aaa0'),curb=mat('curb','#c7bcb0');
 for(const sx of [-1,1])for(const sz of [-1,1]){
  cube(world,42,.28,42,sx*27.5,.09,sz*27.5,paving);
  cube(world,42,.39,.20,sx*27.5,.065,sz*6.52,curb);
  cube(world,.20,.39,42,sx*6.52,.065,sz*27.5,curb);
 }
 const zebra=mat('zebra','#f3e7d0'),paint=mat('paint','#e6bd86');
 for(const x of [-8.8,8.8])for(let i=0;i<9;i++)groundPlane(.68,.76,x,.028,(i-4)*1.24,zebra);
 for(const z of [-8.8,8.8])for(let i=0;i<9;i++)groundPlane(.76,.68,(i-4)*1.24,.028,z,zebra);
 for(let x=-46;x<47;x+=5.5)if(Math.abs(x)>14)groundPlane(2,.10,x,.023,0,paint);
 for(let z=-46;z<47;z+=5.5)if(Math.abs(z)>14)groundPlane(.10,2,0,.023,z,paint);
 for(const a of [-10.8,10.8]){
  groundPlane(.18,10.3,a,.029,0,zebra);groundPlane(10.3,.18,0,.029,a,zebra);
 }
 // Curbstones and curb access at all four zebra entrances.
 for(const x of [-8.8,8.8])for(const z of [-6.65,6.65])groundPlane(3.0,1.1,x,.254,z,mat('ramp','#9e9e93'));
 for(const z of [-8.8,8.8])for(const x of [-6.65,6.65])groundPlane(1.1,3.0,x,.254,z,mat('ramp','#9e9e93'));
}
const brands=[
 ['CAFÉ LUNA','#304d4b','#edcd99'],['PANADERÍA','#714739','#f4dc9e'],['LIBRERÍA','#3d4e61','#fff0d7'],['FLORES','#58634a','#fae7b5'],
 ['FARMACIA','#46695f','#d1f0df'],['ALMACÉN','#775742','#f7d2a4'],['CINE ATLAS','#353753','#f4c8ac'],['SASTRERÍA','#5d424c','#fde7c2'],
 ['DISCOS','#4e555e','#eec1a8'],['TALLER','#57606c','#f9e4bb'],['BARRIO','#716d5e','#f0ddaa'],['MERCADO','#4e6553','#f8e1be']
];
const brickColors=['#a38174','#7c6c6c','#b6aaa0','#9d7568','#777d7a','#81788c','#aa8d73','#93877c'];
function building(x,z,w,d,h,sx,sz,index){
 const g=new THREE.Group();world.add(g);
 const brick=material(brickColors[index%brickColors.length]);
 const trim=material(index%3===0?'#d9c7b7':'#c0b5a4');
 const windowGlass=new THREE.MeshStandardMaterial({color:0x344c58,metalness:.24,roughness:.23,emissive:0x283844,emissiveIntensity:.35});
 const litGlass=new THREE.MeshStandardMaterial({color:0xb8a282,metalness:.17,roughness:.25,emissive:0xc19d6a,emissiveIntensity:.36});
 const dark=mat('dark','#26333a',.55,.15);
 const stories=Math.max(3,Math.round((h-3.7)/2.65));
 cube(g,w,h,d,x,.29+h/2,z,brick,true);
 // Parapet, base plinth, cornices, vertical bays, and rooftop equipment.
 cube(g,w+.35,.38,d+.35,x,.29+h,z,trim);
 cube(g,w+.45,.18,d+.45,x,.36+3.7,z,trim);
 cube(g,w+.15,.4,d+.16,x,.5,z,mat('plinth','#6c6863'));
 for(let level=1;level<=stories;level++){
  const y=3.7+(level-.48)*((h-3.9)/stories);
  for(let i=0;i<Math.max(2,Math.floor(w/2.45));i++){
   const n=Math.max(2,Math.floor(w/2.45)),px=x+(i-(n-1)/2)*w/(n+.2);
   const frontZ=z-sz*(d/2+.009),ry=sz>0?Math.PI:0;
   const glaze=((i+level+index*3)%5===0)?litGlass:windowGlass;
   plane(g,1.09,1.38,px,y,frontZ,glaze,ry);
   cube(g,1.23,.095,.17,px,y-.73,frontZ-sz*.04,trim);
   cube(g,.085,1.51,.10,px-.56,y,frontZ-sz*.06,trim);
   cube(g,.085,1.51,.10,px+.56,y,frontZ-sz*.06,trim);
   const backZ=z+sz*(d/2+.009);
   plane(g,1.09,1.33,px,y,backZ,glaze,sz>0?0:Math.PI);
  }
  for(let j=0;j<Math.max(2,Math.floor(d/2.65));j++){
   const n=Math.max(2,Math.floor(d/2.65)),pz=z+(j-(n-1)/2)*d/(n+.2);
   const sideX=x-sx*(w/2+.01),rot=sx>0?-Math.PI/2:Math.PI/2;
   plane(g,1.0,1.37,sideX,y,pz,((j+level+index)%4===0)?litGlass:windowGlass,rot);
  }
 }
 // Ground-level storefront, side fascia, recessed entrance and sign.
 const frontZ=z-sz*(d/2+.021),ry=sz>0?Math.PI:0;
 cube(g,w-.30,2.90,.15,x,1.8,frontZ,mat('shopTrim','#2c3b42'));
 const paneMat=new THREE.MeshStandardMaterial({color:index%2?0x42616c:0x626d6c,metalness:.55,roughness:.16,transparent:true,opacity:.83,emissive:0x473c30,emissiveIntensity:.14});
 for(let k=0;k<4;k++){
  const xx=x+(k-1.5)*(w-.7)/4;
  plane(g,(w-.7)/4-.17,2.35,xx,1.90,frontZ-sz*.095,paneMat,ry);
  cube(g,.095,2.48,.10,xx+(w-.7)/8,1.90,frontZ-sz*.1,trim);
 }
 const [label,bg,fg]=brands[index%brands.length];
 sign(g,label,w*.68,x,3.17,frontZ-sz*.14,ry,bg,fg,'DESDE 1986');
 const awning=material(index%2?'#853b3c':'#315761',.77);
 cube(g,w-.35,.16,1.22,x,2.86,frontZ-sz*.65,awning);
 for(let i=0;i<10;i++){
  cube(g,(w-.35)/10-.035,.24,.18,x+(i-4.5)*(w-.35)/10,2.73,frontZ-sz*1.12,
       i%2?trim:awning);
 }
 for(let i=0;i<3;i++){
  cube(g,w+.06,.08,d+.06,x,3.95+i*3.1,z,trim);
 }
 // Rooftop water tanks, antennas, little chimneys.
 if(index%3===0){
  cylinder(g,.9,.9,1.5,x+w*.23,h+1.55,z-d*.22,dark);
  cylinder(g,1.05,1.05,.10,x+w*.23,h+2.33,z-d*.22,trim);
  cylinder(g,.025,.025,2,x-w*.24,h+1.4,z+d*.25,dark);
 }else{
  cube(g,1.4,1.0,1.3,x-w*.22,h+.85,z+d*.15,mat('roofBox','#817c72'));
 }
 return g;
}
function makeDistrict(){
 const data=[];
 let i=0;
 for(const sx of [-1,1])for(const sz of [-1,1]){
  data.push([sx*16.2,sz*17.6,15,16.2,17+(i*3)%8,sx,sz,i++]);
  data.push([sx*33,sz*15.8,12,12.0,12+(i*4)%11,sx,sz,i++]);
  data.push([sx*17,sz*34,12.3,12.5,11+(i*5)%10,sx,sz,i++]);
 }
 for(const values of data)building(...values);
 for(const sx of [-1,1])for(const sz of [-1,1]){
  // Street corner masonry bollards, planters and newspaper boxes.
  for(const a of [10.1,12.2])cylinder(world,.2,.23,.8,sx*a,.67,sz*7.1,mat('bollard','#474743'),10);
  cube(world,1.4,.8,1.2,sx*9.4,.65,sz*12.8,mat('planter','#676253'));
 }
}
function foliage(x,z,scale=1){
 const trunk=mat('bark','#58473e'),leaf=mat('leaves','#59756d'),leaf2=mat('leaves2','#7e8a6f');
 cylinder(world,.17*scale,.25*scale,2.25*scale,x,1.55*scale,z,trunk);
 for(const [dx,dy,dz,r] of [[0,3.2,0,1.25],[-.6,2.85,.15,.95],[.6,2.85,.12,.9],[.1,3.68,-.15,.86]]){
  const a=new THREE.Mesh(new THREE.IcosahedronGeometry(r*scale,1),(dy>3.5?leaf2:leaf));a.position.set(x+dx*scale,dy*scale,z+dz*scale);world.add(a);
 }
}
function lamp(x,z){
 const metal=mat('lampMetal','#303a3f',.48,.5);
 const warm=new THREE.MeshStandardMaterial({color:0xffebba,emissive:0xffb875,emissiveIntensity:2.1,roughness:.4});
 cylinder(world,.065,.10,4.8,x,2.58,z,metal,12);
 cube(world,.85,.09,.12,x+.35,4.91,z,metal);
 cube(world,.43,.27,.43,x+.72,4.67,z,warm);
 lights.push({x:x+.72,z});
}
function bench(x,z,angle=0){
 const g=new THREE.Group();g.position.set(x,.35,z);g.rotation.y=angle;world.add(g);
 const wood=mat('wood','#86634b'),leg=mat('benchMetal','#353e42');
 for(const y of [.50,.63])cube(g,2.25,.105,.57,0,y,0,wood);
 for(const y of [.98,1.19])cube(g,2.25,.12,.13,0,y,-.34,wood);
 for(const xx of [-.86,.86])cube(g,.1,.65,.62,xx,.32,0,leg);
}
function makeStreetscape(){
 for(const q of [-1,1]){
  for(const a of [25,39]){
   foliage(q*7.9,a,.82);foliage(a,q*7.9,.82);
   foliage(q*7.9,-a,.76);foliage(-a,q*7.9,.76);
  }
  for(const a of [14.5,32]){
   lamp(q*7.1,a);lamp(q*7.1,-a);
   lamp(a,q*7.1);lamp(-a,q*7.1);
  }
  bench(q*10,q*27,q>0?0:Math.PI);
  bench(q*26,q*10,Math.PI/2);
 }
 // Bus shelter: thin metal frame with tinted real translucent panel, bench, advertising.
 const g=new THREE.Group();g.position.set(29.2,.2,-7.65);world.add(g);
 const metal=mat('shelterMetal','#283b42',.4,.5);
 for(const x of [-2.6,2.6])for(const z of [-.7,.7])cube(g,.10,2.6,.10,x,1.3,z,metal);
 cube(g,6.2,.15,2.1,0,2.69,0,metal);
 const glazing=new THREE.MeshStandardMaterial({color:0x91a7aa,metalness:.3,roughness:.15,transparent:true,opacity:.33,depthWrite:false,side:THREE.DoubleSide});
 cube(g,5.05,2.4,.055,0,1.38,.72,glazing);
 const poster=sign(g,'PARADA',2.0,-1.4,1.75,.77,0,'#345a57','#ffdf9f');
 bench(28.8,-7.8,0);
 // Café terrace: tables, chairs, parasols, potted plants.
 const cafeX=-12,cafeZ=7.8;
 for(let i=0;i<3;i++){
  const xx=cafeX-i*2.3;
  cylinder(world,.06,.07,.9,xx,.68,cafeZ,metal);
  cylinder(world,.82,.82,.075,xx,1.14,cafeZ,mat('table','#59483d'),14);
  cylinder(world,.15,.19,.65,xx+.8,.57,cafeZ+.75,metal);
  cube(world,.70,.10,.7,xx+.8,.93,cafeZ+.75,mat('wood','#86634b'));
  cylinder(world,.042,.045,2.3,xx,2.18,cafeZ,metal);
  const umbrella=new THREE.Mesh(new THREE.ConeGeometry(1.75,.75,12),mat('umbrella','#a74f3e'));umbrella.position.set(xx,3.27,cafeZ);umbrella.rotation.y=i*.8;world.add(umbrella);
 }
 // Parked bicycle: circles with spokes and articulated frame.
 for(const x of [-30,-27.5]){
  const g=new THREE.Group();g.position.set(x,.27,7.4);world.add(g);
  const wheel=mat('bikeWheel','#282e34',.45,.3),frame=mat('bikeFrame',x<-29?'#ba7657':'#6b9b9e');
  for(const wx of [-.72,.72]){
   const tor=new THREE.Mesh(new THREE.TorusGeometry(.42,.035,6,18),wheel);tor.position.set(wx,.48,0);g.add(tor);
  }
  function rod(ax,ay,bx,by){
   const a=new THREE.Vector3(ax,ay,0),b=new THREE.Vector3(bx,by,0),m=a.clone().add(b).multiplyScalar(.5);
   const q=new THREE.Mesh(new THREE.CylinderGeometry(.026,.026,a.distanceTo(b),6),frame);
   q.position.copy(m);q.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());g.add(q);
  }
  rod(-.72,.48,-.04,.77);rod(-.04,.77,.72,.48);rod(-.72,.48,.15,.44);rod(.15,.44,-.04,.77);rod(.72,.48,.45,1.12);
  cube(g,.36,.055,.12,-.05,.91,0,wheel);
 }
}
function signal(x,z,axis,side=1){
 const g=new THREE.Group();g.position.set(x,.28,z);world.add(g);
 const dark=mat('signal','#252e32',.55,.25);
 cylinder(g,.072,.095,4.3,0,2.15,0,dark,12);
 let y=3.76;
 const head=cube(g,.52,1.3,.37,0,y,0,dark);
 // Sign faces on all sides, easy to inspect from a free camera.
 const faces=[{z:.195,rot:0},{z:-.195,rot:Math.PI}];
 const lens=[];
 for(const face of faces)for(const [i,name,color] of [[0,'RED',0xeb3529],[1,'AMBER',0xe9aa40],[2,'GREEN',0x2ecf8b]]){
  const m=new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.06});
  const disc=new THREE.Mesh(new THREE.CircleGeometry(.158,20),m);
  disc.position.set(0,y+.36-i*.36,face.z);disc.rotation.y=face.rot;g.add(disc);
  lens.push({name,m});
 }
 signalHeads.push({axis,lens});
 const pedBox=cube(g,.34,.43,.25,.37,2.72,0,dark);
 const walk=new THREE.MeshBasicMaterial({color:0xff5544});
 plane(g,.23,.25,.37,2.72,.135,walk);pedHeads.push({walk});
 return g;
}
function makeSignals(){
 // Four pillars positioned on sidewalks beyond the curb, not floating in traffic.
 signal(-10.7,-6.9,'x');signal(10.7,6.9,'x');
 signal(-6.9,10.7,'z');signal(6.9,-10.7,'z');
}
function createVehicle(entry){
 const g=new THREE.Group();world.add(g);g.userData.focusId=entry.id;
 const body=material(entry.tint,.42,.26),trim=mat('carTrim','#232d32',.42,.35),
  glass=new THREE.MeshStandardMaterial({color:0x4b6872,metalness:.35,roughness:.12,transparent:true,opacity:.89}),
  tyre=mat('tyre','#22252c',.96),rim=mat('rim','#b0b8b2',.30,.72),
  head=new THREE.MeshStandardMaterial({color:0xffecc0,emissive:0xffdba3,emissiveIntensity:1.2});
 const isVan=entry.type==='van',isTaxi=entry.type==='taxi',isSedan=entry.type==='sedan';
 const len=isVan?4.0:3.48,height=isVan?1.56:1.30;
 cube(g,len,.56,1.79,0,.64,0,body,true);
 cube(g,len-.16,.10,1.87,0,.43,0,trim);
 const roofProfile=new THREE.Shape();
 const rear=-len*.41,front=len*.34;
 roofProfile.moveTo(rear,0);roofProfile.lineTo(rear+(isVan?.10:.34),isVan?.85:.55);
 roofProfile.lineTo(front-(isVan?.11:.37),isVan?.85:.55);roofProfile.lineTo(front,0);roofProfile.closePath();
 const geo=new THREE.ExtrudeGeometry(roofProfile,{depth:1.57,bevelEnabled:true,bevelThickness:.045,bevelSize:.06,bevelSegments:1,steps:1});
 const hood=new THREE.Mesh(geo,body);hood.position.set(0,1.0,-.785);hood.castShadow=true;g.add(hood);
 for(const zz of [-.801,.802]){
  const glassSection=cube(g,len*.42,isVan?.62:.36,.035,.02,isVan?1.28:1.30,zz,glass);
 }
 for(const xx of [-len*.30,len*.29]){
  const wind=cube(g,.036,isVan?.60:.46,1.42,xx,1.34,0,glass);wind.rotation.z=xx>0?-.27:.27;
 }
 for(const xx of [-len*.31,len*.29])for(const zz of [-.905,.905]){
  const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.39,.39,.18,16),tyre);
  wheel.position.set(xx,.40,zz);wheel.rotation.x=Math.PI/2;g.add(wheel);
  const hub=new THREE.Mesh(new THREE.CylinderGeometry(.22,.22,.190,12),rim);hub.position.copy(wheel.position);hub.rotation.x=Math.PI/2;g.add(hub);
 }
 for(const zz of [-.57,.57]){
  cube(g,.09,.25,.35,len/2+.009,.81,zz,head);
  cube(g,.08,.20,.31,-len/2-.009,.83,zz,mat('rear','#973b34'));
 }
 if(isTaxi){cube(g,.58,.26,.31,.1,1.65,0,mat('taxiLamp','#e6d4a6'));sign(g,'TAXI',.48,.1,1.7,-.173,0,'#343b37','#ffe39d');}
 if(isSedan){cube(g,.27,.12,1.56,-len*.45,.91,0,body);}
 if(entry.type==='truck'){} // Actual textured GLB is loaded separately in loadAssets.
 return g;
}
function setFacing(g,entry){
 g.rotation.y=entry.axis==='x'?(entry.dir===1?0:Math.PI):(entry.dir===1?-Math.PI/2:Math.PI/2);
}
function makeVehicles(){
 for(const entry of config.vehicles){
  const root=createVehicle(entry);setFacing(root,entry);cars.push({entry,root});
  selectables.push(root);
 }
}
function normalizeModel(root,height){
 root.updateMatrixWorld(true);
 const b=new THREE.Box3().setFromObject(root),size=b.getSize(new THREE.Vector3());
 if(!(size.y>0))throw Error('INVALID_ASSET_BOUNDS');
 root.scale.multiplyScalar(height/size.y);root.updateMatrixWorld(true);
 const bb=new THREE.Box3().setFromObject(root),center=bb.getCenter(new THREE.Vector3());
 root.position.x-=center.x;root.position.z-=center.z;root.position.y-=bb.min.y;
 root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
 return root;
}
function accessory(parent,entry){
 const cloth=material(entry.tint,.8);
 if(entry.accessory==='bag'){
  cube(parent,.46,.56,.22,.27,1.12,-.27,cloth,true);
  const strap=cube(parent,.07,.73,.09,.18,1.29,-.15,mat('straps','#3e3939'));strap.rotation.z=.29;
 }
 if(entry.accessory==='cap'){
  const cap=new THREE.Mesh(new THREE.SphereGeometry(.30,9,6,0,Math.PI*2,0,Math.PI/2),cloth);cap.position.set(0,1.75,0);parent.add(cap);
  cube(parent,.34,.055,.29,0,1.70,.30,cloth);
 }
}
async function loadAssets(){
 const loader=new GLTFLoader();
 function glb(url){return new Promise((resolve,reject)=>loader.load(url,resolve,undefined,reject))}
 const out=await Promise.allSettled([glb(config.assets.human),glb(config.assets.truck)]);
 let acquired=0;
 if(out[0].status==='fulfilled'){
  try{
   const asset=out[0].value,template=normalizeModel(asset.scene,1.73);
   if(!asset.animations.length)throw Error('PERSON_CLIP_MISSING');
   // Skin and skeleton instances must be remapped, not shallow cloned.
   for(const entry of config.walkers){
    const group=new THREE.Group();group.userData.focusId=entry.id;group.userData.kind='person';
    const clone=SkeletonUtils.clone(template);
    clone.traverse(o=>{if(o.isMesh&&o.material){
      if(Array.isArray(o.material))o.material=o.material.map(m=>m.clone());
      else o.material=o.material.clone();
      const all=Array.isArray(o.material)?o.material:[o.material];
      for(const m of all)if(m.color)m.color.lerp(new THREE.Color(entry.tint),.17);
    }});
    group.add(clone);accessory(group,entry);world.add(group);
    const mixer=new THREE.AnimationMixer(clone);mixer.clipAction(asset.animations[0]).play();
    people.push({entry,root:group,mixer});selectables.push(group);
   }
   acquired++;
  }catch(err){report('HUMAN_MODEL: '+String(err.message||err));}
 }else report('HUMAN_ASSET_LOAD: '+String(out[0].reason||'network'));
 if(out[1].status==='fulfilled'){
  try{
   const target=cars.find(a=>a.entry.id==='milk-truck');
   const asset=out[1].value;
   target.root.clear();const model=normalizeModel(asset.scene,1.92);model.rotation.y=-Math.PI/2;
   target.root.add(model);
   if(asset.animations.length){
    target.mixer=new THREE.AnimationMixer(model);target.mixer.clipAction(asset.animations[0]).play();
   }
   acquired++;
  }catch(err){report('VEHICLE_MODEL: '+String(err.message||err));}
 }else report('TRUCK_ASSET_LOAD: '+String(out[1].reason||'network'));
 ui('count').textContent=people.length+' PERSONAS · '+cars.length+' VEHÍCULOS · '+acquired+'/2 GLB';
 ui('overlay').style.display='none';
 window.__PROMETEO_SCENE_V2__={acquiredAssets:acquired,actors:people.length,vehicles:cars.length,flowVersion:'2.0.0',visualApproved:false};
}
function report(s){ui('error').textContent=(ui('error').textContent+' '+s).trim().slice(-290);console.warn('[PROMETEO]',s)}
function updateSimulation(t,dt){
 const ph=phaseAt(t);
 ui('signal').textContent=ph.label;
 ui('light').style.background=ph.walk?'#5ae8ac':(ph.ew==='GREEN'||ph.ns==='GREEN')?'#8fe2b0':ph.ew==='AMBER'||ph.ns==='AMBER'?'#f5b94e':'#ed6f60';
 ui('clock').textContent=String(Math.floor(mod(t,DURATION)/60)).padStart(2,'0')+':'+String(Math.floor(mod(t,DURATION)%60)).padStart(2,'0')+' / 01:20';
 ui('phase').textContent=ph.walk?'PEATONES HABILITADOS':ph.ew==='GREEN'?'TRÁFICO ESTE / OESTE':ph.ns==='GREEN'?'TRÁFICO NORTE / SUR':'SEMAFORIZACIÓN COORDINADA';
 for(const s of signalHeads){
  const state=s.axis==='x'?ph.ew:ph.ns;
  for(const l of s.lens)l.m.emissiveIntensity=l.name===state?3.5:.035;
 }
 for(const p of pedHeads)p.walk.color.set(ph.walk?0x54f3c1:0xfb5949);
 for(const o of cars){
  const p=carPosition(t,o.entry);
  o.root.position.set(p.x,.035,p.z);o.root.visible=p.visible;
  if(o.mixer&&!paused)o.mixer.update(Math.min(.05,dt));
 }
 for(const o of people){
  const p=pedPosition(t,o.entry);
  const pp=pedPosition(t+.055,o.entry);
  const along=o.entry.axis==='x'?p.x:p.z;const ramp=o.entry.kind==='cross'?Math.max(0,Math.min(1,(Math.abs(along)-5.8)/1.3)):1;
  o.root.position.set(p.x,.055+.215*ramp,p.z);
  if(p.moving)o.root.rotation.y=heading(p,pp);
  if(o.mixer&&p.moving&&!paused)o.mixer.update(Math.min(.055,dt));
 }
}
function pick(event){
 if(event.target!==renderer.domElement)return;
 const r=renderer.domElement.getBoundingClientRect();
 const pointer=new THREE.Vector2((event.clientX-r.left)/r.width*2-1,-((event.clientY-r.top)/r.height)*2+1);
 const ray=new THREE.Raycaster();ray.setFromCamera(pointer,camera);
 const candidates=ray.intersectObjects(selectables,true);
 if(!candidates.length)return;
 let o=candidates[0].object;
 while(o&&!o.userData.focusId)o=o.parent;
 if(!o)return;
 ui('focus').textContent=o.userData.focusId.toUpperCase();
 const target=new THREE.Vector3();o.getWorldPosition(target);target.y+=.95;
 controls.target.copy(target);
 controls.update();
}
function moveCamera(dt){
 const dirs=new THREE.Vector3(),right=new THREE.Vector3();
 camera.getWorldDirection(dirs);dirs.y=0;dirs.normalize();right.set(-dirs.z,0,dirs.x);
 const k=window.__KEYS__||new Set();const delta=new THREE.Vector3(),speed=k.has('Shift')?18:9;
 if(k.has('w')||k.has('ArrowUp'))delta.add(dirs);
 if(k.has('s')||k.has('ArrowDown'))delta.sub(dirs);
 if(k.has('a')||k.has('ArrowLeft'))delta.sub(right);
 if(k.has('d')||k.has('ArrowRight'))delta.add(right);
 if(k.has('q'))delta.y-=.5;if(k.has('e'))delta.y+=.5;
 if(delta.lengthSq()>0){delta.normalize().multiplyScalar(dt*speed);camera.position.add(delta);controls.target.add(delta);}
}
function boot(){
 try{
  const canvas=document.createElement('canvas');
  const gl=canvas.getContext('webgl2',{antialias:true,alpha:false,powerPreference:'high-performance'});
  if(!gl)throw Error('WEBGL2_UNAVAILABLE');
  renderer=new THREE.WebGLRenderer({canvas,context:gl,antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(MAX_DPR);renderer.setSize(innerWidth,innerHeight);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.20;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  ui('app').appendChild(renderer.domElement);
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();report('WEBGL_CONTEXT_LOST');ui('overlay').style.display='grid';ui('overlay').textContent='CONTEXTO 3D PERDIDO';});
  renderer.domElement.addEventListener('webglcontextrestored',()=>location.reload());
  scene=new THREE.Scene();scene.background=new THREE.Color(0x82939c);scene.fog=new THREE.FogExp2(0x82939c,.011);
  world=new THREE.Group();scene.add(world);
  const hemi=new THREE.HemisphereLight(0xe8f0ef,0x4c5965,2.0);scene.add(hemi);
  const sun=new THREE.DirectionalLight(0xffc28c,2.8);sun.position.set(-25,40,-27);
  sun.castShadow=true;sun.shadow.mapSize.set(1536,1536);
  sun.shadow.camera.left=-50;sun.shadow.camera.right=50;sun.shadow.camera.top=50;sun.shadow.camera.bottom=-50;sun.shadow.bias=-.0003;scene.add(sun);
  camera=new THREE.PerspectiveCamera(59,innerWidth/innerHeight,.065,160);camera.position.set(29,22,28);
  controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,2.2,0);
  controls.enableDamping=true;controls.dampingFactor=.085;controls.minDistance=.55;controls.maxDistance=105;
  controls.maxPolarAngle=Math.PI*.498;controls.screenSpacePanning=true;
  controls.mouseButtons={LEFT:THREE.MOUSE.ROTATE,MIDDLE:THREE.MOUSE.DOLLY,RIGHT:THREE.MOUSE.PAN};
  controls.touches={ONE:THREE.TOUCH.ROTATE,TWO:THREE.TOUCH.DOLLY_PAN};
  controls.update();
  makeStreets();makeDistrict();makeStreetscape();makeSignals();makeVehicles();
  const keys=new Set();window.__KEYS__=keys;
  addEventListener('keydown',e=>{if(['INPUT','TEXTAREA'].includes(document.activeElement.tagName))return;keys.add(e.key);if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();if(e.key===' ')paused=!paused;});
  addEventListener('keyup',e=>keys.delete(e.key));
  let down=null;
  renderer.domElement.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY,t:performance.now()};});
  renderer.domElement.addEventListener('pointerup',e=>{if(down&&Math.hypot(e.clientX-down.x,e.clientY-down.y)<7&&performance.now()-down.t<450)pick(e);down=null;});
  ui('pause').onclick=()=>{paused=!paused;ui('pause').textContent=paused?'▶':'Ⅱ';ui('pause').classList.toggle('active',paused);};
  ui('reset').onclick=()=>{camera.position.set(29,22,28);controls.target.set(0,2.2,0);controls.update();ui('focus').textContent='CIUDAD EN MOVIMIENTO';};
  ui('night').onclick=()=>{night=!night;scene.background.set(night?0x27354d:0x82939c);scene.fog.color.set(night?0x27354d:0x82939c);hemi.intensity=night?.8:2.0;sun.intensity=night?.6:2.8;renderer.toneMappingExposure=night?.85:1.2;ui('night').classList.toggle('active',night);};
  ui('info').onclick=()=>ui('help').classList.toggle('show');
  addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
  last=performance.now();function frame(now){
   const dt=Math.min(.06,Math.max(0,(now-last)/1000));last=now;
   if(!paused)clockTime=mod(clockTime+dt,DURATION);
   updateSimulation(clockTime,dt);moveCamera(dt);controls.update();
   renderer.render(scene,camera);requestAnimationFrame(frame);
  }requestAnimationFrame(frame);
  loadAssets().catch(e=>{report('ASSET_STAGE: '+String(e.message||e));ui('overlay').style.display='none';});
 }catch(e){
  console.error(e);ui('overlay').classList.add('error');
  const type=/WEBGL2/.test(String(e))?'WEBGL2 NO DISPONIBLE':'ERROR AL INICIAR';
  ui('overlay').innerHTML=type+'<small>'+String(e.message||e).replace(/[<>]/g,'')+'<br>No es una captura prerenderizada ni un fallback falso.</small>';
 }
}
boot();
