import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

const $=id=>document.getElementById(id),D=53,clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x)},v=a=>new THREE.Vector3(...a),L=(a,b,t)=>a+(b-a)*t;
const src='https://raw.githubusercontent.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0/672074b73ba276876a19e8816ecdc5241817ab47/addons/kaykit_character_pack_adventures/Characters/gltf/';
const screen=$('screen'),stage=$('stage'),entry=$('entry'),start=$('start'),progress=$('progress'),toggle=$('toggle'),notice=$('notice');
let renderer,scene,camera,spot,lampLight,windowLight,bot,actors={},loaded=false,playing=false,time=0,previous=0,lastFrame=0,muted=false,sound=null,ended=false;
const SHOTS=[
 [0,3.7,[3.20,2.90,7.7],[2.5,2.40,5.35],[0,1.83,-.6],[0,1.88,-.5],47,'Ventana'],
 [3.7,6.2,[.45,.42,3.10],[-.72,.58,1.35],[.12,1.10,-.58],[-.12,1.42,-.8],63,'Debajo de la mesa'],
 [6.2,9.3,[.2,3.5,7.2],[.6,2.95,5.45],[0,1.86,-.7],[.0,1.70,-.6],44,'Los tres'],
 [9.3,12.4,[-1.50,2.16,2.65],[-1.46,2.09,2.22],[-1.32,2.01,-.78],[-1.36,2.01,-.78],36,'Vera'],
 [12.4,15.2,[-.54,2.28,2.63],[-.16,2.14,2.10],[.06,1.92,.28],[.10,1.85,.32],38,'Sobre el hombro'],
 [15.2,18.1,[.15,2.24,2.5],[.11,2.13,1.87],[.12,2.15,.1],[.10,2.11,.22],29,'Ojos sin luz'],
 [18.1,20.9,[1.53,2.15,2.67],[1.47,2.13,2.29],[1.36,2.07,-.78],[1.36,2.07,-.77],33,'Nico'],
 [20.9,23.3,[-1.13,2.22,2.87],[-.59,2.03,2.21],[-.08,1.74,.23],[.05,1.74,.29],42,'El gesto'],
 [23.3,26.2,[.23,3.40,2.35],[.28,2.80,1.80],[.07,1.37,.54],[.09,1.45,.4],39,'Mesa cenital'],
 [26.2,29.8,[1.46,2.17,2.49],[1.37,2.12,2.17],[1.35,2.06,-.80],[1.32,2.03,-.78],34,'La duda'],
 [29.8,33.2,[-.57,1.61,2.19],[-.62,1.55,1.66],[-.56,1.37,.53],[-.50,1.40,.48],30,'Última pieza'],
 [33.2,36.4,[-2.20,.53,1.56],[1.56,.60,1.61],[.02,1.30,-.6],[.13,1.42,-.66],64,'Bajo la mesa'],
 [36.4,40.4,[.58,2.19,2.50],[.15,2.12,1.83],[.09,2.11,.26],[.09,2.10,.26],30,'Tensión'],
 [40.4,44.0,[.16,2.05,1.96],[.10,2.04,1.56],[.09,2.10,.26],[.09,2.08,.25],24,'Encendido'],
 [44.0,47.6,[1.80,2.29,2.73],[.45,2.14,2.41],[.06,1.94,-.43],[.06,1.94,-.43],39,'La respuesta'],
 [47.6,50.4,[-1.56,2.20,2.64],[-.65,2.17,2.45],[-1.37,1.98,-.76],[.04,1.87,-.34],37,'Vera reacciona'],
 [50.4,53,[2.62,3.05,6.35],[2.93,3.27,7.11],[0,1.70,-.52],[0,1.66,-.53],43,'Último cuadro']
];
const DIALOG=[
 {start:9.8,end:12.2,id:'vera',name:'VERA',text:'Le cambié todo.'},
 {start:18.5,end:20.8,id:'nico',name:'NICO',text:'¿Y sigue siendo él?'},
 {start:29.9,end:33.0,id:'vera',name:'VERA',text:'Solo queda esta pieza.'},
 {start:44.5,end:47.3,id:'robot',name:'ROBOT',text:'Esa no la necesito.'}
];
const AUDIO_CUES=[[3.9,'metal'],[7.3,'tap'],[12.4,'metal'],[16.4,'gear'],[23.1,'tap'],[30.3,'metal'],[34.5,'gear'],[40.65,'power'],[42.6,'chime'],[49,'tap']];
const palette={wall:0x263741,wood:0x675042,woodHi:0x806348,metal:0x587074,dark:0x17262d,copper:0xb88b61,brass:0xd3af77,glow:0x7be4c2,clay:0x8b7770,blue:0x325b73};
const MAT=(c,rough=.82,metal=0)=>new THREE.MeshStandardMaterial({color:c,roughness:rough,metalness:metal});
const paint={wood:MAT(palette.wood,.90),woodHi:MAT(palette.woodHi,.83),steel:MAT(palette.metal,.47,.55),dark:MAT(palette.dark,.55,.62),copper:MAT(palette.copper,.53,.48),brass:MAT(palette.brass,.33,.69),leather:MAT(0x473d3a,.99),wall:MAT(palette.wall,1),lit:new THREE.MeshStandardMaterial({color:0xf8c98d,emissive:0xf7ae63,emissiveIntensity:1.6})};
const group=new THREE.Group();function attach(m,parent=group){parent.add(m);return m}
function mesh(g,m,p,s=null,parent=group){const o=new THREE.Mesh(g,m);if(p)o.position.set(...p);if(s)o.scale.set(...s);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
function box(p,s,m,parent=group){return mesh(new THREE.BoxGeometry(...s),m,p,null,parent)}
function bevel(p,s,m,bev=.06,parent=group){
 const [w,h,d]=s,b=Math.min(bev,w*.22,h*.22,d*.22);
 const sh=new THREE.Shape();sh.moveTo(-w/2+b,-h/2);sh.lineTo(w/2-b,-h/2);sh.quadraticCurveTo(w/2,-h/2,w/2,-h/2+b);sh.lineTo(w/2,h/2-b);sh.quadraticCurveTo(w/2,h/2,w/2-b,h/2);sh.lineTo(-w/2+b,h/2);sh.quadraticCurveTo(-w/2,h/2,-w/2,h/2-b);sh.lineTo(-w/2,-h/2+b);sh.quadraticCurveTo(-w/2,-h/2,-w/2+b,-h/2);
 const g=new THREE.ExtrudeGeometry(sh,{depth:d-2*b,bevelEnabled:true,bevelThickness:b,bevelSize:b*.4,bevelSegments:1,steps:1,curveSegments:1});
 g.translate(0,0,-d/2+b);
 return mesh(g,m,p,null,parent);
}
function pipe(a,b,r,m,parent=group,n=9){const A=v(a),B=v(b),d=B.clone().sub(A),o=mesh(new THREE.CylinderGeometry(r,r,d.length(),n,1),m,A.clone().add(B).multiplyScalar(.5).toArray(),null,parent);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return o}
function globe(p,r,m,parent=group,w=12,h=9){return mesh(new THREE.SphereGeometry(r,w,h),m,p,null,parent)}
function disk(p,r,m,parent=group){const o=mesh(new THREE.CylinderGeometry(r,r,.025,12),m,p,null,parent);o.rotation.x=Math.PI/2;return o}
function repeatMark(p,s,m){return box(p,s,m)}
function fabricTexture(base,kind='wood'){
 const c=document.createElement('canvas');c.width=128;c.height=128;const cx=c.getContext('2d');
 cx.fillStyle=base;cx.fillRect(0,0,128,128);
 let seed=317;const rand=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296};
 for(let i=0;i<(kind==='wood'?105:200);i++){const x=rand()*128,y=rand()*128;cx.fillStyle=(i%3===0)?'#ffffff0b':'#00000013';if(kind==='wood')cx.fillRect(x,y,.5+rand()*2,1+rand()*24);else cx.fillRect(x,y,.6+rand(),.6+rand())}
 if(kind==='wood'){cx.strokeStyle='#15100f30';for(let i=0;i<6;i++){cx.beginPath();const x=rand()*128;cx.moveTo(x,0);cx.bezierCurveTo(x-5,44,x+5,72,x,128);cx.stroke()}}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=THREE.NearestFilter;return t;
}
function room(){
 const floor=mesh(new THREE.PlaneGeometry(9,9),new THREE.MeshStandardMaterial({map:fabricTexture('#40433f'),roughness:1}),[0,-.06,-.5]);floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;
 for(let i=-9;i<=9;i++)box([i*.43,-.038,-.6],[.018,.018,8.5],paint.wood);
 box([0,2.2,-2.94],[8.1,4.65,.25],paint.wall);box([-3.85,2.15,-.7],[.22,4.5,5.0],MAT(0x23323c));
 for(let y of [.22,1.25,2.38,3.6,4.27])box([0,y,-2.77],[8,.055,.085],MAT(0x414c4b));
 for(let x of [-3.50,-2.15,-.75,.64,3.4])box([x,2.2,-2.77],[.08,4.4,.12],MAT(0x414948));
 box([1.62,2.60,-2.75],[2.36,2.10,.06],new THREE.MeshStandardMaterial({color:0x102935,emissive:0x09202b,emissiveIntensity:.4,roughness:.15,metalness:.3}));
 for(let x of [.4,1.62,2.83])box([x,2.62,-2.55],[.095,2.20,.18],paint.woodHi);
 for(let y of [1.57,2.65,3.64])box([1.62,y,-2.54],[2.45,.10,.18],paint.woodHi);
 for(let x of [.79,1.45,2.45,2.70]){const h=1.15+(x%1)*.48;box([x,1.57+h*.33,-2.71],[.35,h,.065],MAT(0x0b222e));for(let j=0;j<4;j++)if((j+x*3)%2>1)box([x,1.7+j*.26,-2.64],[.055,.08,.016],MAT(0x8d8260))}
 const wallStrip=MAT(0x3d5658);for(let z of [-2.45,-1.35,.05,1.15])pipe([-3.68,.67,z],[-3.68,1.4,z],.02,wallStrip);
 for(let x of [-3.1,.2,3.1])box([x,4.22,-.5],[.23,.21,4.8],paint.dark);
 // Left shelf, with brackets, labeled boxes and tools in layers
 for(let y of [1.34,2.37,3.31]){box([-2.95,y,-2.35],[1.42,.11,.57],paint.wood);for(let x of [-3.55,-2.38])pipe([x,y,-2.60],[x,y-.35,-2.67],.025,paint.steel)}
 for(let [x,y,w,h,col] of [[-3.32,1.60,.34,.44,0x84654d],[-2.82,1.55,.25,.33,0x66716c],[-3.25,2.62,.28,.38,0x86694f],[-2.77,2.61,.39,.24,0x5b7177],[-3.2,3.55,.43,.35,0x806554],[-2.7,3.5,.18,.23,0x637476]])bevel([x,y,-2.30],[w,h,.26],MAT(col),.025);
 // utility door and its inset panel, inset metal grate
 bevel([-2.05,1.60,-2.83],[.83,2.9,.12],paint.dark,.08);
 for(let i=0;i<6;i++)box([-2.06,.57+i*.38,-2.72],[.58,.04,.05],paint.steel);
 globe([-1.73,1.54,-2.67],.055,paint.brass);
 // front workbench with genuine rail joinery; designed clear support footprint
 for(let x of [-1.92,1.92])for(let z of [-.23,.64])bevel([x,.57,z],[.17,1.07,.2],paint.dark,.025);
 box([0,.65,.29],[3.7,.10,.11],paint.woodHi);
 bevel([0,1.18,.20],[4.36,.20,1.68],new THREE.MeshStandardMaterial({map:fabricTexture('#71553e'),roughness:.87}),.075);
 box([0,1.32,1.05],[4.19,.044,.07],paint.brass);
 for(let x of [-2,2])bevel([x,1.18,.2],[.085,.31,1.65],paint.copper,.021);
 // Lamp arm and shade; source of warm motivated light
 pipe([-.48,1.32,-.06],[-.57,2.13,-.18],.044,paint.dark);
 pipe([-.57,2.13,-.18],[-.03,2.92,.22],.04,paint.brass);
 const shade=mesh(new THREE.CylinderGeometry(.11,.43,.29,12,1,true),paint.copper,[.02,2.82,.22]);shade.rotation.z=-.16;
 disk([.02,2.65,.22],.31,paint.lit).rotation.x=-Math.PI/2;
 // small mechanical bench objects with visible purposeful handles
 for(let [x,z] of [[-1.70,.66],[1.53,.48],[1.78,-.35]])pipe([x,1.32,z],[x+.20,1.32,z+.12],.023,paint.steel);
 bevel([1.17,1.38,.43],[.82,.11,.50],paint.dark,.035);
 for(let i=0;i<3;i++)globe([.97+i*.20,1.46,.48],.058,i===1?paint.brass:paint.copper);
 // blueprint pinned on back wall as scenery, not an explanatory slide
 box([-.28,2.90,-2.72],[.83,1.12,.06],MAT(0x9b8c72));
 for(let k=0;k<6;k++)box([-.30,2.53+k*.11,-2.679],[.47-k*.025,.012,.004],MAT(0x516563));
 for(let [x,y] of [[-.65,3.45],[.08,3.44]])globe([x,y,-2.66],.025,paint.brass);
 // hand tools, coils, industrial piping in depth
 for(let z of [-2.52,-1.9])pipe([-3.7,3.81,z],[.50,3.81,z],.034,paint.dark);
 for(let i=0;i<5;i++){let x=-1.85+i*.18;pipe([x,1.33,-.33],[x+.1,1.33,-.22],.019,paint.steel)}
 const gas=mesh(new THREE.CylinderGeometry(.19,.22,.85,11),MAT(0x536b6b,.55,.3),[-3.30,.42,-.04]);pipe([-3.30,.84,-.04],[-3.30,1.08,-.04],.035,paint.brass);
}
function robot(){
 const base=new THREE.Group();base.position.set(.12,1.34,.23);group.add(base);
 const metal=MAT(0x718587,.44,.47),patina=MAT(0x557275,.68,.38),copper=MAT(0xb27f57,.5,.45);
 function rmesh(g,m,p){return mesh(g,m,p,null,base)}
 // legs are tapered integrated links, shoes are rounded, body silhouette is designed
 for(let x of [-.18,.18]){rmesh(new THREE.CylinderGeometry(.078,.096,.34,9),patina,[x,.28,0]);rmesh(new THREE.CapsuleGeometry(.11,.13,3,8),paint.dark,[x,.12,.095])}
 const torso=rmesh(new THREE.LatheGeometry([new THREE.Vector2(.08,.36),new THREE.Vector2(.22,.40),new THREE.Vector2(.32,.52),new THREE.Vector2(.33,.70),new THREE.Vector2(.26,.81),new THREE.Vector2(.10,.85)],11),metal,[0,0,0]);
 const plate=bevel([0,.62,.314],[.47,.28,.049],copper,.035,base);
 rmesh(new THREE.TorusGeometry(.15,.026,5,10),paint.brass,[0,.61,.35]).rotation.x=0;
 rmesh(new THREE.SphereGeometry(.044,9,6),new THREE.MeshStandardMaterial({color:0xe0c9a1,emissive:0x4d947e,emissiveIntensity:.4}),[0,.61,.365]);
 // etched, repaired shoulder from mismatched eras
 const brassSide=bevel([-.25,.76,.01],[.14,.26,.35],paint.brass,.025,base);brassSide.rotation.z=.20;
 pipe([0,.84,0],[0,.98,0],.083,paint.dark,base);
 const headRig=new THREE.Group();headRig.position.set(0,.97,0);base.add(headRig);
 const shell=mesh(new THREE.IcosahedronGeometry(.40,1),metal,[0,.22,0],null,headRig);shell.scale.set(1.17,.86,.90);
 bevel([0,.20,.375],[.62,.30,.055],paint.dark,.04,headRig);
 // mechanically plausible lens recesses with glowing lenses
 const eyeMat=new THREE.MeshStandardMaterial({color:0x173b40,emissive:0x173b40,emissiveIntensity:.18,metalness:.15,roughness:.25});
 const pupils=[];
 for(let x of [-.155,.155]){const e=mesh(new THREE.CircleGeometry(.088,16),paint.brass,[x,.23,.411],null,headRig);pupils.push(mesh(new THREE.CircleGeometry(.060,12),eyeMat,[x,.23,.428],null,headRig));}
 // stitched forehead and broken helmet plate, not symmetrical
 const scrap=bevel([-.19,.44,.28],[.31,.12,.05],copper,.018,headRig);scrap.rotation.z=.26;
 for(let x of [-.17,-.06,.06])globe([x,.45,.30],.015,paint.dark,headRig);
 const antenna=pipe([.26,.49,.05],[.40,.78,.05],.022,paint.brass,headRig);
 globe([.40,.80,.05],.058,new THREE.MeshStandardMaterial({color:0xae6551,emissive:0x662217,emissiveIntensity:1}),headRig);
 const arms=[];
 for(let sign of [-1,1]){
  const shoulder=new THREE.Group();shoulder.position.set(sign*.31,.73,0);base.add(shoulder);
  mesh(new THREE.CylinderGeometry(.064,.083,.32,8),patina,[sign*.055,-.14,0],null,shoulder).rotation.z=sign*.25;
  globe([sign*.09,-.30,.01],.089,copper,shoulder);
  mesh(new THREE.CapsuleGeometry(.075,.12,3,8),paint.brass,[sign*.12,-.4,.13],null,shoulder);
  arms.push(shoulder)
 }
 // realistic shadow contact: table receives shadow automatically
 return {base,headRig,pupils,eyeMat,arms};
}
function lighting(){
 scene.background=new THREE.Color(0x0e1d28);scene.fog=new THREE.FogExp2(0x11222b,.035);
 scene.add(new THREE.HemisphereLight(0x92b4c5,0x2a2321,1.12));
 const key=new THREE.SpotLight(0xffc385,105,10,Math.PI*.31,.65,1.4);key.position.set(.03,2.78,.32);key.target.position.set(0,1.31,.12);
 key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.bias=-.0002;key.shadow.normalBias=.018;key.shadow.camera.near=.25;key.shadow.camera.far=9;scene.add(key,key.target);spot=key;
 const moon=new THREE.DirectionalLight(0x6a9fc0,3.3);moon.position.set(2.8,3.5,-1.85);moon.castShadow=true;moon.shadow.mapSize.set(512,512);moon.shadow.camera.left=-5;moon.shadow.camera.right=5;moon.shadow.camera.top=5;moon.shadow.camera.bottom=-5;moon.shadow.bias=-.0004;scene.add(moon);
 const warm=new THREE.PointLight(0xffa65b,13,3.3,2);warm.position.set(-3.1,3.25,-2.08);scene.add(warm);lampLight=warm;
 const cool=new THREE.PointLight(0x4b9fd4,20,5,2);cool.position.set(1.62,2.86,-2.15);scene.add(cool);windowLight=cool;
 const r=new THREE.AmbientLight(0x7b8b96,.13);scene.add(r);
}
let rainItems=[],steam;
function atmosphere(){
 const geo=new THREE.BufferGeometry();const lines=[],alph=[];
 for(let i=0;i<220;i++){
  const x=.40+(i*1.131%2.42),y=1.63+(i*.719%1.96),z=-2.47+(i*.057% .15);
  lines.push(x,y,z,x-.026,y-.17,z);alph.push((i%4)*.18+.35);
 }
 geo.setAttribute('position',new THREE.Float32BufferAttribute(lines,3));
 const drop=new THREE.LineSegments(geo,new THREE.LineBasicMaterial({color:0x91c5cf,transparent:true,opacity:.44,depthWrite:false}));
 drop.position.y=0;group.add(drop);rainItems=[drop];
 // faint volumetric-esque particles on the table light axis
 const pts=[],col=[];
 for(let i=0;i<120;i++){let x=Math.sin(i*123.4)*1.45,y=1.33+(i*.173%1.29),z=Math.cos(i*29.17)*.66+.18;pts.push(x,y,z);col.push(.9,.62,.36)}
 let g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
 steam=new THREE.Points(g,new THREE.PointsMaterial({size:.014,vertexColors:true,transparent:true,opacity:.25,depthWrite:false}));group.add(steam);
}
function piece(){
 const g=new THREE.Group();g.position.set(-.68,1.39,.64);group.add(g);
 const frame=bevel([0,0,0],[.235,.075,.17],paint.brass,.018,g);
 for(let x of [-.07,.07]){globe([x,.046,.06],.036,paint.dark,g);pipe([x,-.045,.06],[x,-.10,.065],.013,paint.copper,g)}
 box([0,.047,-.07],[.095,.028,.025],paint.steel,g);return g;
}
function adaptActor(root,wanted,p,zTurn=0){
 const bounding=new THREE.Box3().setFromObject(root),dims=new THREE.Vector3();bounding.getSize(dims);
 if(!(dims.y>.05))throw Error('Modelo 3D sin volumen');
 const sceneRoot=new THREE.Group();sceneRoot.position.set(...p);group.add(sceneRoot);
 root.position.set(-bounding.min.x-dims.x*.5,-bounding.min.y,-bounding.min.z-dims.z*.5);
 root.scale.setScalar(wanted/dims.y);sceneRoot.add(root);sceneRoot.rotation.y=zTurn;
 root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;if(o.material){let mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>{if(m?.map)m.map.colorSpace=THREE.SRGBColorSpace;if(m?.isMeshStandardMaterial){m.roughness=Math.max(.52,m.roughness||.65);m.needsUpdate=true}})}}});
 return sceneRoot;
}
async function loadActor(id,file,position,turn){
 const data=await new GLTFLoader().loadAsync(src+file+'.glb');
 const actor=adaptActor(data.scene,1.82,position,turn);
 const bones=[];data.scene.traverse(o=>{if(o.isBone)bones.push(o)});
 const mixer=data.animations.length?new THREE.AnimationMixer(data.scene):null;
 let action=null;
 if(mixer){
  const clip=data.animations.find(c=>/idle|breathing|stand/i.test(c.name))||data.animations[0];
  action=mixer.clipAction(clip);action.play();
 }
 const head=bones.find(b=>/head/i.test(b.name)&&!/headtop|headend/i.test(b.name));
 const left=bones.find(b=>/upperarm.*l|arm.*left|left.*arm/i.test(b.name));
 const right=bones.find(b=>/upperarm.*r|arm.*right|right.*arm/i.test(b.name));
 actors[id]={root:actor,mixer,bones,head,left,right,clips:data.animations.length};
 return actors[id];
}
function aim(now){
 const shot=SHOTS.find(s=>now<s[1])||SHOTS.at(-1);
 const f=shot[1]-shot[0],u=smooth((now-shot[0])/f);
 camera.position.copy(v(shot[2]).lerp(v(shot[3]),u));
 const q=v(shot[4]).lerp(v(shot[5]),u);camera.lookAt(q);camera.fov=shot[6]+((shot[7]==='Debajo de la mesa')?2*Math.sin(u*Math.PI):0);camera.updateProjectionMatrix();
 // Cinematic hard cuts and a short deliberate dip-to-black before reveal
 let alpha=0;
 if(now<.40)alpha=1-smooth(now/.40);
 if(now>39.98&&now<40.56)alpha=Math.max(alpha,.82*(1-Math.abs(now-40.27)/.29));
 if(now>52.1)alpha=smooth((now-52.1)/.9);
 $('cinemaMask').style.opacity=String(clamp(alpha));
 const ttl=$('filmTitle');ttl.classList.toggle('show',now>.67&&now<4.2);
 const ds=DIALOG.find(d=>now>=d.start&&now<d.end);
 $('bubble').classList.toggle('active',!!ds);
 if(ds){$('speaker').textContent=ds.name;$('words').textContent=ds.text;const b=$('bubble');b.style.transform='translateY('+((1-smooth((now-ds.start)/.15))*11)+'px)';}
 $('subtitleDots').textContent=now<5.3?'UN TALLER · UNA NOCHE · UNA PREGUNTA':now>48.7?'LA ÚLTIMA PIEZA · FIN':'';
}
function updateActors(now){
 for(let [id,a] of Object.entries(actors)){
  a.mixer?.setTime(now*.55);
  const phase=now*1.2+(id==='nico'?2.4:0);
  a.root.position.y=.013*Math.sin(phase);
  a.root.rotation.y=(id==='vera'?-.15:.22)+(id==='vera'?.045:-.04)*Math.sin(now*.36);
  if(a.head){a.head.rotation.x += (.024*Math.sin(now*.65)+(id==='nico'&&now>17.8&&now<27?.09:0));a.head.rotation.y+=.065*Math.sin(now*.33)}
  if(a.right&&id==='vera'){const strength=smooth((now-20.8)/1.3)*(1-smooth((now-23.3)/1.8));a.right.rotation.x+=.54*strength;}
  if(a.left&&id==='nico'){const strength=smooth((now-18.1)/.3)*(1-smooth((now-21.3)/.8));a.left.rotation.x+=.34*strength;}
 }
 const wake=smooth((now-40.5)/1.65);
 const alive=now>40.5;
 bot.eyeMat.color.setHex(alive?0x9de5bc:0x173b40);
 bot.eyeMat.emissive.setHex(alive?0x55ffb2:0x10323b);
 bot.eyeMat.emissiveIntensity=.15+4.3*wake+(.17*Math.sin(now*8.5))*wake;
 bot.headRig.rotation.z=wake*(-.13)+(.027*Math.sin(now*1.2))*wake;
 bot.headRig.rotation.y=.035*Math.sin(now*1.2)+(wake*.34);
 bot.arms[0].rotation.x=.045*Math.sin(now*.9);
 bot.arms[1].rotation.x=(now>42?-.65*smooth((now-42)/1.5):0)+.045*Math.sin(now*.7);
 const take=smooth((now-31.6)/1.6);original.position.set(-.68-.06*take,1.39+.44*take,.64+.045*take);
 original.rotation.z=-.11*take;
 for(let drop of rainItems)drop.position.y=-((now*.73)%1.9);
 steam.rotation.y=now*.003;
 spot.intensity=105+2*Math.sin(now*8.7);
 windowLight.intensity=19+1.4*Math.sin(now*.5);
 // action beats: robot wakes, antenna and lens flare are physically motivated
}
function soundInit(){
 const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
 const ctx=new AC();const master=ctx.createGain();master.gain.value=.53;master.connect(ctx.destination);
 const rain=ctx.createBuffer(1,ctx.sampleRate*4,ctx.sampleRate);
 const d=rain.getChannelData(0);let p=0;for(let i=0;i<d.length;i++){p=.996*p+(Math.random()*2-1)*.004;d[i]=p}
 const n=ctx.createBufferSource();n.buffer=rain;n.loop=true;const filter=ctx.createBiquadFilter();filter.type='bandpass';filter.frequency.value=1150;filter.Q.value=.44;
 const rg=ctx.createGain();rg.gain.value=.19;n.connect(filter);filter.connect(rg);rg.connect(master);n.start();
 sound={ctx,master,rg,events:new Set()};
}
function chirp(type='tick',volume=.1,freq=320){
 if(!sound||muted||!playing)return;const c=sound.ctx,n=c.currentTime;
 if(type==='metal'||type==='tap'||type==='gear'){
  const len=Math.floor(c.sampleRate*.19);const b=c.createBuffer(1,len,c.sampleRate);const out=b.getChannelData(0);let seed=19;
  for(let i=0;i<len;i++){seed=(seed*1664525+1013904223)>>>0;const t=i/c.sampleRate;
   out[i]=Math.exp(-(type==='metal'?25:58)*t)*(.7*Math.sin(t*(type==='metal'?2200:3100)+30*t*t)+.15*((seed/4294967296)*2-1));}
  const s=c.createBufferSource(),g=c.createGain();s.buffer=b;g.gain.value=type==='metal'?.11:.085;s.connect(g);g.connect(sound.master);s.start(n);
 }else{
  const o=c.createOscillator(),gain=c.createGain();
  o.type=type==='power'?'triangle':'sine';o.frequency.setValueAtTime(freq,n);o.frequency.exponentialRampToValueAtTime(type==='power'?115:freq*.76,n+.13);
  gain.gain.setValueAtTime(.0001,n);gain.gain.exponentialRampToValueAtTime(volume,n+.016);gain.gain.exponentialRampToValueAtTime(.0001,n+.22);
  o.connect(gain);gain.connect(sound.master);o.start(n);o.stop(n+.24);
 }
}
function cues(from,to){
 if(!playing||!sound||muted)return;
 for(let [when,type] of AUDIO_CUES)if(when>from&&when<=to)chirp(type,.12,type==='chime'?760:205);
 for(let d of DIALOG){
  if(to<d.start||from>d.end)continue;
  const words=d.text.split(/\s+/).length;
  const span=(d.end-d.start)/Math.max(1,words*2);
  for(let i=0;i<words*2;i++){
   const tick=d.start+.12+i*span;
   if(tick>from&&tick<=to)chirp('voice',d.id==='robot'?.06:.024,(d.id==='nico'?420:d.id==='robot'?720:335)+(i%3)*33);
  }
 }
}
function render(now){
 time=clamp(now,0,D);
 updateActors(time);aim(time);
 renderer.render(scene,camera);
 progress.value=time;$('clock').textContent='00:'+String(Math.floor(time)).padStart(2,'0');
 if(time>=D&&!ended){playing=false;ended=true;toggle.textContent='▶';entry.hidden=false;entry.querySelector('h1').innerHTML='¿EL<br>MISMO<br>ROBOT?';start.textContent='↺ VOLVER A VER';}
}
function frame(ms){
 const dt=Math.min(.10,Math.max(0,(ms-lastFrame)/1000||0));lastFrame=ms;
 if(playing){const old=time;render(time+dt);cues(old,time)}else if(loaded)renderer.render(scene,camera);
 requestAnimationFrame(frame);
}
function setStatus(text){notice.textContent=text;notice.classList.add('show')}
async function init(){
 try{
  renderer=new THREE.WebGLRenderer({canvas:stage,antialias:false,alpha:false,powerPreference:'high-performance',preserveDrawingBuffer:true});
  renderer.setSize(360,640,false);renderer.setPixelRatio(1);
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.17;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  scene=new THREE.Scene();scene.add(group);
  camera=new THREE.PerspectiveCamera(45,9/16,.04,70);
  room();lighting();bot=robot();original=piece();atmosphere();
  aim(0);renderer.render(scene,camera);
  start.textContent='CARGANDO PERSONAJES…';start.disabled=true;
  const res=await Promise.allSettled([
   loadActor('vera','Rogue_Hooded',[-1.40,.0,-.79],-.13),
   loadActor('nico','Barbarian',[1.35,.0,-.86],.13)
  ]);
  if(res.some(x=>x.status==='rejected')){throw Error('Falló la descarga de modelos GLB. Revisá tu conexión y recargá. '+res.filter(x=>x.status==='rejected').map(x=>String(x.reason)).join(' / ').slice(0,160));}
  loaded=true;start.disabled=false;start.textContent='▶ VER LA PELÍCULA';
  render(0);window.__FILM_QA={ready:true,actors:Object.keys(actors),clips:Object.fromEntries(Object.entries(actors).map(([k,v])=>[k,v.clips])),duration:D,shots:SHOTS.length,canvas:{width:stage.width,height:stage.height}};
  window.__FILM_SEEK=t=>render(t);
  requestAnimationFrame(frame);
 }catch(e){console.error(e);setStatus(e.message||String(e));start.textContent='INTENTAR OTRA VEZ';start.disabled=false;start.onclick=()=>location.reload();
  window.__FILM_QA={ready:false,error:String(e)};
 }
}
let original;
function play(){
 if(!loaded)return;ended=false;entry.hidden=true;
 if(time>=D)render(0);
 playing=true;toggle.textContent='Ⅱ';
 if(!sound)soundInit();sound?.ctx.resume();sound?.rg.gain.setTargetAtTime(.19,sound.ctx.currentTime,.15);
}
function pause(){
 playing=false;toggle.textContent='▶';if(sound)sound.rg.gain.setTargetAtTime(.025,sound.ctx.currentTime,.07);
}
start.addEventListener('click',play);
toggle.addEventListener('click',()=>playing?pause():play());
$('restart').addEventListener('click',()=>{render(0);if(!playing)play()});
$('mute').addEventListener('click',()=>{muted=!muted;$('mute').textContent=muted?'♩':'♫';if(sound)sound.master.gain.setTargetAtTime(muted?0:.53,sound.ctx.currentTime,.07)});
progress.addEventListener('input',()=>{render(Number(progress.value));if(ended){ended=false;entry.hidden=true}});
screen.addEventListener('click',e=>{if(e.target===stage){$('controls').classList.toggle('visible')}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing)pause()});
init();
