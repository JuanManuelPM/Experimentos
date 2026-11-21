import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';

// ARCHIVO DE LLUVIA · autonomous original WebGL vertical slice · 2026-11-21.
// All textures, geometry, prose, and interaction states are authored here.
const EVIDENCE = [
 {id:'log',name:'Libro de guardia',type:'DOCUMENTO / MESA CENTRAL',body:'La anotación de las 02:17 registra un corte de corriente. La puerta del archivo siguió cerrada y nadie atravesó el único acceso hasta las 02:26.',insight:'La cinta no pudo salir por la puerta principal durante el apagón.'},
 {id:'panel',name:'Interruptor forzado',type:'MECANISMO / MURO OESTE',body:'La palanca de emergencia fue bajada a mano. El resorte conserva una marca nueva y la caja no presenta señales de tormenta eléctrica.',insight:'El apagón fue deliberado; no lo causó el temporal.'},
 {id:'glove',name:'Guante de mantenimiento',type:'OBJETO / MESA CENTRAL',body:'Un guante abandonado junto al libro. Tiene polvo de cobre en las puntas y fibras grises enganchadas en la costura.',insight:'El cobre procede de una instalación mecánica, no de la cerradura del archivo.'},
 {id:'recorder',name:'Grabación de las 02:16',type:'AUDIO / ESTANTERÍA',body:'La última voz quedó registrada un minuto antes del corte: «No la saqué. Donde el aire sigue moviéndose, nadie mira dos veces».',insight:'La pista habla de un sistema que continuó funcionando durante el apagón.'},
 {id:'plan',name:'Plano de ventilación',type:'PLANO / MURO ESTE',body:'El conducto auxiliar tiene energía independiente. Termina detrás de la rejilla de servicio número 04; ni el desagüe ni el casillero se conectan con él.',insight:'Todas las pistas convergen en un escondite técnico dentro del archivo.'}
];
const $=id=>document.getElementById(id);
const state={entered:false,found:new Set(),inspecting:null,ventOpen:false,won:false,modal:null};
const mats={wall:new THREE.MeshStandardMaterial({color:0x344145,roughness:.91}),dark:new THREE.MeshStandardMaterial({color:0x121d22,roughness:.8}),metal:new THREE.MeshStandardMaterial({color:0x58676a,metalness:.76,roughness:.36}),brass:new THREE.MeshStandardMaterial({color:0xb58a54,metalness:.76,roughness:.3}),paper:new THREE.MeshStandardMaterial({color:0xbcae90,roughness:.95}),wood:new THREE.MeshStandardMaterial({color:0x43302b,roughness:.74}),ink:new THREE.MeshStandardMaterial({color:0x182628,roughness:.72}),red:new THREE.MeshStandardMaterial({color:0x9e4735,metalness:.3,roughness:.6}),glow:new THREE.MeshBasicMaterial({color:0xf0b96a}),glass:new THREE.MeshPhysicalMaterial({color:0x668e8b,roughness:.16,metalness:.1,transparent:true,opacity:.22,depthWrite:false})};
let scene,camera,renderer,ventDoor,hiddenTape,hiddenMarker,raycaster=new THREE.Raycaster(),interactive=[],markers=[],rain=[],dust,clock,tableLamp,accentLight;
const v=new THREE.Vector2();const target=new THREE.Vector3(0,1.35,-.9),goalTarget=target.clone();
const orbit={az:.70,el:.56,r:13.3,goalAz:.70,goalEl:.56,goalR:13.3};
const pointers=new Map();let dragStarted=false,pinchDistance=0,downX=0,downY=0;
function box(w,h,d,mat,x,y,z,parent=scene){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function ball(r,mat,x,y,z,parent=scene){const m=new THREE.Mesh(new THREE.SphereGeometry(r,16,10),mat);m.position.set(x,y,z);parent.add(m);return m}
function cyl(rt,rb,h,mat,x,y,z,parent=scene,radial=22){const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,radial),mat);m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m}
function plane(w,h,mat,x,y,z,parent=scene){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat);m.position.set(x,y,z);m.receiveShadow=true;parent.add(m);return m}
function inkTexture(lines,{w=600,h=420,bg='#c3b79a',ink='#243238',accent='#986648',grid=false}={}){
 const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.fillStyle=bg;g.fillRect(0,0,w,h);
 for(let i=0;i<1400;i++){const t=(i*73)%w,z=(i*271)%h;g.fillStyle=i%7===0?'#5c52421b':'#e6d8b20c';g.fillRect(t,z,2,2)}
 g.strokeStyle=accent;g.lineWidth=3;g.strokeRect(25,25,w-50,h-50);
 if(grid){g.strokeStyle='#546a646a';g.lineWidth=1;for(let x=52;x<w-35;x+=35){g.beginPath();g.moveTo(x,40);g.lineTo(x,h-38);g.stroke()}for(let y=45;y<h-38;y+=35){g.beginPath();g.moveTo(36,y);g.lineTo(w-38,y);g.stroke()}}
 lines.forEach((row,i)=>{const [text,size=27,x=46,y=75+i*52,color=ink]=typeof row==='string'?[row]:row;g.font='600 '+size+'px monospace';g.fillStyle=color;g.fillText(text,x,y,w-x-25)});
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;
}
function texturedPanel(w,h,lines,x,y,z,opts={}){const mat=new THREE.MeshStandardMaterial({map:inkTexture(lines,opts),roughness:1,side:THREE.DoubleSide});return plane(w,h,mat,x,y,z)}
function line(points,material,thickness=.025){for(let i=1;i<points.length;i++){const a=new THREE.Vector3(...points[i-1]),b=new THREE.Vector3(...points[i]),dir=b.clone().sub(a),m=new THREE.Mesh(new THREE.CylinderGeometry(thickness,thickness,dir.length(),7),material);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.normalize());scene.add(m)}}
function markerTexture(text){const c=document.createElement('canvas');c.width=256;c.height=256;const g=c.getContext('2d');g.shadowBlur=23;g.shadowColor='#f5c37b';g.fillStyle='#e8bf83';g.beginPath();g.arc(128,128,61,0,Math.PI*2);g.fill();g.shadowBlur=0;g.strokeStyle='#d0a776';g.lineWidth=3;g.beginPath();g.arc(128,128,88,0,Math.PI*2);g.stroke();g.fillStyle='#172122';g.font='700 48px monospace';g.textAlign='center';g.textBaseline='middle';g.fillText(text,128,132);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
function evidenceTarget(id,x,y,z,hitSize=[.9,.65,.9]){const number=String(EVIDENCE.findIndex(e=>e.id===id)+1).padStart(2,'0');const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:markerTexture(number),transparent:true,depthTest:false,depthWrite:false}));sprite.position.set(x,y+.5,z);sprite.scale.set(.65,.65,.65);sprite.userData.evidence=id;scene.add(sprite);interactive.push(sprite);markers.push({sprite,id,y:y+.5});const hit=box(...hitSize,new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,color:0xffffff}),x,y,z);hit.userData.evidence=id;hit.castShadow=false;hit.receiveShadow=false;interactive.push(hit)}
function buildRoom(){
 scene.background=new THREE.Color(0x09151a);scene.fog=new THREE.FogExp2(0x0c1b21,.022);
 scene.add(new THREE.HemisphereLight(0x7b9c9e,0x171414,1.0));
 const key=new THREE.DirectionalLight(0x9dc1bc,1.8);key.position.set(1,9,6);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-11;key.shadow.camera.right=11;key.shadow.camera.top=11;key.shadow.camera.bottom=-11;key.shadow.bias=-.001;scene.add(key);
 const amber=new THREE.PointLight(0xf1ac66,38,9,2);amber.position.set(-1.2,3,1.1);amber.castShadow=false;scene.add(amber);tableLamp=amber;
 accentLight=new THREE.PointLight(0x64c2bd,12,8);accentLight.position.set(2.1,2.7,-3.4);scene.add(accentLight);
 // Vertical cutaway diorama: old municipal records room, two solid rear/left walls.
 box(13,.32,11.7,mats.dark,0,-.2,-.5);box(13,.17,11.7,mats.brass,0,-.34,-.5);
 for(let i=0;i<25;i++){const z=-5.72+i*.43;const material=new THREE.MeshStandardMaterial({color:new THREE.Color().setHSL(.065+i%5*.002,.22,.16+i%4*.012),roughness:.83});box(12.7,.045,.40,material,0,.018,z)}
 box(13,5.2,.24,mats.wall,0,2.6,-5.78);box(.24,5.2,11.7,mats.wall,-6.42,2.6,-.4);
 const wains=new THREE.MeshStandardMaterial({color:0x263337,roughness:.83});box(12.9,1.13,.29,wains,0,.65,-5.6);box(.31,1.13,11.5,wains,-6.25,.65,-.4);
 for(let i=0;i<10;i++){box(.09,1.0,.16,mats.metal,-5.7+i*1.25,.65,-5.37)}
 for(let i=0;i<8;i++){box(.15,1,.08,mats.metal,-6.05,.65,-4.8+i*1.27)}
 box(13,.16,.42,mats.wood,0,5.05,-5.5);box(.4,.16,11.5,mats.wood,-6.28,5.06,-.4);
 for(let i=0;i<3;i++)box(.25,.21,11.6,mats.dark,-6+i*5,5.10,-.4);
 // Rear window and authored rainy night skyline. No borrowed image or texture.
 const sky=inkTexture([], {w:800,h:640,bg:'#10252d',accent:'#10252d'});const cv=sky.image,ctx=cv.getContext('2d');const grad=ctx.createLinearGradient(0,0,0,640);grad.addColorStop(0,'#13303c');grad.addColorStop(.6,'#0d1c27');grad.addColorStop(1,'#090f19');ctx.fillStyle=grad;ctx.fillRect(0,0,800,640);
 for(let i=0;i<24;i++){const x=i*36-15,height=140+(i*179)%300;ctx.fillStyle=i%3===0?'#0c1920':'#09131b';ctx.fillRect(x,640-height,39+(i%4)*8,height);for(let y=650-height;y<632;y+=21){for(let j=0;j<3;j++){if((i*11+y+j)%5!==0){ctx.fillStyle=(i+j+y)%3===0?'#b68c6366':'#688c9277';ctx.fillRect(x+8+j*12,y,4,7)}}}}
 ctx.fillStyle='#ef865080';ctx.font='700 45px sans-serif';ctx.fillText('HOTEL',510,220);sky.needsUpdate=true;
 const skyMat=new THREE.MeshBasicMaterial({map:sky,side:THREE.DoubleSide});plane(3.75,2.82,skyMat,.15,3.04,-5.48);
 const frameMat=new THREE.MeshStandardMaterial({color:0x1a2528,metalness:.5,roughness:.3});box(3.92,.17,.24,frameMat,.15,4.53,-5.37);box(3.92,.18,.24,frameMat,.15,1.61,-5.37);box(.14,3,.24,frameMat,-1.8,3.05,-5.37);box(.14,3,.24,frameMat,2.10,3.05,-5.37);box(.12,3,.18,frameMat,.15,3.04,-5.33);box(3.81,.10,.17,frameMat,.15,3.03,-5.33);
 plane(3.75,2.82,mats.glass,.15,3.05,-5.31);
 for(let i=0;i<66;i++){const x=-1.66+((i*89)%350)/100,z=-5.21+(i%5)*.02;const m=box(.008,.09+(i%5)*.09,.008,new THREE.MeshBasicMaterial({color:0x9abbb6,transparent:true,opacity:.25+(i%4)*.04}),x,1.8+((i*79)%265)/100,z);m.userData.rain=true;rain.push({m,speed:.035+(i%6)*.012,top:4.35})}
 // Radiator below window; framed wall diagram, lamps, signage.
 for(let i=0;i<17;i++){box(.13,.64,.34,mats.metal,-1.5+i*.18,.47,-5.15)}box(3.4,.08,.45,mats.dark,-.1,.77,-5.17);
 texturedPanel(1.28,.55,[['DIRECCIÓN GENERAL',29,36,68],['ARCHIVO / 1949',23,36,119]],-4.20,4.47,-5.60,{w:560,h:240,bg:'#292c2a',ink:'#d3b285',accent:'#ad8454'});
 // Tall shelves with individual paper files rather than undifferentiated blocks.
 const shelf= new THREE.MeshStandardMaterial({color:0x2a3637,roughness:.73,metalness:.44});
 for(const x of [-5.35,-3.55]){for(const y of [.45,1.45,2.45,3.45])box(1.53,.10,.74,shelf,x,y,-4.76);for(const dx of [-.75,.75])box(.10,4.07,.78,shelf,x+dx,2.08,-4.77);
 for(let j=0;j<3;j++)for(let k=0;k<13;k++){const thick=.055+(k%3)*.015;const m=new THREE.MeshStandardMaterial({color:new THREE.Color().setHSL(.08+(j%3)*.05,.12,.25+(k%7)*.04),roughness:1});box(thick,.56+(k%3)*.08,.39,m,x-.6+k*.095,.81+j, -4.72+(k%2)*.06)}}
 // Floor skirting, scattered puddles, fog-safe little glints.
 for(let i=0;i<8;i++){const mat=new THREE.MeshBasicMaterial({color:0x6fa6a7,transparent:true,opacity:.04+(i%3)*.015,depthWrite:false});let p=new THREE.Mesh(new THREE.CircleGeometry(.5+(i%4)*.19,32),mat);p.rotation.x=-Math.PI/2;p.scale.set(1.7,.5,1);p.position.set(-4+i*1.19,.055,2.7-i*.24);scene.add(p)}
 const dustGeom=new THREE.BufferGeometry();const pts=[];for(let i=0;i<125;i++)pts.push(((i*173)%119)/10-5.9,((i*71)%44)/10+.2,((i*281)%108)/10-5.3);dustGeom.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));dust=new THREE.Points(dustGeom,new THREE.PointsMaterial({color:0xd4b58a,size:.023,transparent:true,opacity:.45}));scene.add(dust);
}
function buildDesk(){
 // Intricate paired archive desks, modestly beveled geometry, actual handles and hinged-looking drawers.
 const topmat=new THREE.MeshStandardMaterial({color:0x594032,roughness:.52});
 const desk=box(4.45,.17,2.32,topmat,-.15,1.2,.94);
 box(4.6,.10,2.47,mats.brass,-.15,1.08,.94);box(4.3,.27,2.09,mats.wood,-.15,.94,.94);
 for(const x of [-2.18,1.84])for(const z of [-.05,1.93])box(.19,.85,.19,mats.wood,x,.57,z);
 for(let j=0;j<3;j++){box(.95,.20,.04,mats.ink,-1.39+j*1.5,.89,2.00);box(.28,.045,.06,mats.brass,-1.39+j*1.5,.87,2.06)}
 // Brass task lamp, a proper physical object with shade and illumination.
 cyl(.28,.29,.045,mats.brass,-1.55,1.34,.20);cyl(.05,.05,.85,mats.brass,-1.55,1.73,.20);
 const stem=box(.05,.70,.05,mats.brass,-1.28,2.2,.2);stem.rotation.z=-.52;
 const shade=new THREE.Mesh(new THREE.CylinderGeometry(.18,.53,.49,36,1,true),new THREE.MeshStandardMaterial({color:0x566f6b,metalness:.66,roughness:.35,side:THREE.DoubleSide}));shade.position.set(-1.04,2.43,.20);shade.rotation.z=.24;shade.castShadow=true;scene.add(shade);
 const bulb=ball(.18,new THREE.MeshBasicMaterial({color:0xf7d3a2}),-1.03,2.2,.18);
 // Leather blotter and real papers. Log must be clearly at desk height.
 box(1.95,.022,1.26,new THREE.MeshStandardMaterial({color:0x1d3432,roughness:.75}),-.34,1.30,.96);
 const p= texturedPanel(.99,1.19,[['ACCESOS',44,60,92],['02:17 / APAGÓN',28,56,169],['PUERTA SELLADA',24,56,240],['SIN SALIDAS',24,56,301],['02:26 / REABRE',23,56,368]],-.94,1.331,1.13,{w:500,h:600});p.rotation.x=-Math.PI/2;
 for(let i=0;i<5;i++){const x=.25+i*.09,z=.48+i*.05;const paper=box(.8,.01,.56,mats.paper,x,1.337+i*.012,z);paper.rotation.y=i*.06}
 evidenceTarget('log',-.88,1.41,1.0,[1,.36,1.2]);
 // Coffee in cup, stained saucer, loose pencil and typed note.
 cyl(.18,.18,.02,mats.paper,1.2,1.33,.35);cyl(.14,.10,.24,mats.paper,1.2,1.47,.35);cyl(.109,.11,.012,new THREE.MeshStandardMaterial({color:0x33251c,roughness:.9}),1.2,1.60,.35);
 const pen=box(.47,.032,.036,mats.brass,.25,1.35,1.73);pen.rotation.y=.45;
 // Cloth glove is a deliberately drawn organic silhouette, not humanoid blockout.
 const shape=new THREE.Shape();shape.moveTo(-.32,-.23);shape.bezierCurveTo(-.35,-.1,-.37,.04,-.3,.13);shape.lineTo(-.26,.32);shape.quadraticCurveTo(-.20,.39,-.14,.28);shape.lineTo(-.12,.39);shape.quadraticCurveTo(-.05,.49,.015,.35);shape.lineTo(.07,.42);shape.quadraticCurveTo(.13,.47,.16,.32);shape.lineTo(.18,.34);shape.quadraticCurveTo(.25,.38,.25,.23);shape.lineTo(.19,.03);shape.lineTo(.39,.10);shape.quadraticCurveTo(.49,.07,.38,-.06);shape.lineTo(.17,-.27);shape.closePath();
 const gloveGeom=new THREE.ExtrudeGeometry(shape,{depth:.035,bevelEnabled:true,bevelSize:.014,bevelThickness:.015,bevelSegments:2,steps:1});const glove=new THREE.Mesh(gloveGeom,new THREE.MeshStandardMaterial({color:0x343c38,roughness:1,side:THREE.DoubleSide}));glove.rotation.x=-Math.PI/2;glove.rotation.z=-.22;glove.position.set(.96,1.39,1.33);scene.add(glove);
 for(let i=0;i<6;i++)ball(.012,mats.brass,1.01+(i%3)*.048,1.43,1.42+Math.floor(i/3)*.04);
 evidenceTarget('glove',1.05,1.48,1.30,[.9,.3,.9]);
 // Low upholstered chair, visibly different upholstery from desk.
 const fabric=new THREE.MeshStandardMaterial({color:0x283738,roughness:1});box(1.32,.20,1.15,fabric,0,.64,3.25);const back=box(1.35,.95,.18,fabric,0,1.04,3.73);back.rotation.x=-.13;for(const x of [-.51,.51])for(const z of [2.75,3.68])box(.09,.62,.09,mats.brass,x,.32,z);
}
function buildClues(){
 // Wall emergency breaker, four screws, coil, physically placed red switch.
 box(1.24,1.72,.22,mats.dark,-2.55,2.45,-5.38);box(1.07,1.55,.08,mats.metal,-2.55,2.45,-5.20);
 for(const dx of [-.42,.42])for(const dy of [-.62,.62])cyl(.035,.035,.02,mats.brass,-2.55+dx,2.45+dy,-5.13);
 box(.58,.76,.14,mats.ink,-2.55,2.51,-5.11);const lever=box(.115,.5,.12,mats.red,-2.55,2.54,-4.99);lever.rotation.x=-.46;
 texturedPanel(.67,.22,[['EMERGENCIA',20,25,58]],-2.55,3.04,-5.075,{w:400,h:125,bg:'#bdaf90'});
 evidenceTarget('panel',-2.55,2.45,-4.95,[1.12,1.5,.53]);
 // Compact two-spool recorder sitting on left-most mid shelf.
 box(.95,.23,.54,mats.metal,-4.95,2.62,-4.45);box(.84,.16,.42,mats.dark,-4.95,2.80,-4.45);
 for(const x of [-5.16,-4.76]){const m=cyl(.18,.18,.06,mats.brass,x,2.9,-4.45);m.rotation.x=Math.PI/2;for(let a=0;a<5;a++){const theta=a*Math.PI*2/5;const p=box(.08,.035,.04,mats.dark,x+Math.cos(theta)*.095,2.9+Math.sin(theta)*.095,-4.40);p.rotation.z=theta}}
 box(.24,.04,.10,mats.red,-4.65,2.76,-4.1);evidenceTarget('recorder',-4.95,2.95,-4.45,[1,.7,.72]);
 // Ventilation schematic on east wall. Distinct lines and labels rendered to physical paper.
 box(1.86,1.65,.12,mats.wood,2.77,3.01,-5.43);
 const plan= texturedPanel(1.64,1.41,[['SERVICIO / 04',35,34,76],['CONDUCTO AUX.',22,34,130],['ENERGÍA AISLADA',20,34,176],['AIRE -> 04',29,34,246,'#ae593e'],['NO: DESAGÜE',18,34,325]],2.77,3.01,-5.345,{w:560,h:480,bg:'#c0b99c',ink:'#293b3b',accent:'#5b7975',grid:true});evidenceTarget('plan',2.75,3.17,-5.03,[1.7,1.5,.5]);
 // Recessed service ventilation cabinet with a real opening animated door.
 box(1.7,1.62,.14,mats.brass,4.45,1.8,-5.40);box(1.52,1.46,.13,mats.ink,4.45,1.8,-5.31);
 const cavity=box(1.29,1.23,.06,new THREE.MeshBasicMaterial({color:0x071212}),4.45,1.82,-5.21);
 for(const [x,y] of [[3.66,1.06],[5.22,1.06],[3.66,2.56],[5.22,2.56]]){const s=cyl(.045,.045,.02,mats.brass,x,y,-5.21);s.rotation.x=Math.PI/2}
 ventDoor=new THREE.Group();ventDoor.position.set(3.75,1.8,-5.06);scene.add(ventDoor);
 box(1.37,1.37,.08,mats.metal,.685,0,0,ventDoor);box(1.22,1.19,.09,mats.dark,.69,0,.065,ventDoor);
 for(let i=0;i<9;i++){const slat=box(1.06,.07,.10,mats.metal,.69,-.47+i*.12,.13,ventDoor);slat.rotation.x=-.38}
 cyl(.045,.045,.12,mats.brass,1.19,0,.14,ventDoor).rotation.x=Math.PI/2;
 const tag= texturedPanel(.55,.17,[['04',65,62,80]],4.45,2.57,-5.21,{w:300,h:130,bg:'#171d1e',ink:'#e4c89c',accent:'#171d1e'});
 // Cassette does not appear or become clickable until a correct deduction opens the cabinet.
 hiddenTape=new THREE.Group();hiddenTape.position.set(4.43,1.73,-5.04);scene.add(hiddenTape);
 box(.70,.42,.15,mats.brass,0,0,0,hiddenTape);box(.58,.29,.17,mats.ink,0,0,.02,hiddenTape);
 for(const x of [-.18,.18]){const a=cyl(.135,.135,.04,mats.paper,x,0,.14,hiddenTape);a.rotation.x=Math.PI/2}
 hiddenTape.visible=false;
 hiddenMarker=new THREE.Sprite(new THREE.SpriteMaterial({map:markerTexture('✓'),transparent:true,depthTest:false,depthWrite:false}));hiddenMarker.position.set(4.43,2.30,-4.68);hiddenMarker.scale.set(.74,.74,.74);hiddenMarker.userData.recover=true;hiddenMarker.visible=false;scene.add(hiddenMarker);interactive.push(hiddenMarker);
 const cassetteHit=box(.90,.78,.75,new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}),4.43,1.76,-4.77);cassetteHit.castShadow=false;cassetteHit.receiveShadow=false;cassetteHit.userData.recover=true;interactive.push(cassetteHit);
 // World details that make this a room, not a row of evidence markers.
 texturedPanel(1.55,.40,[['SECTOR 4 / ARCHIVO',30,30,96]],3.88,4.65,-5.60,{w:600,h:190,bg:'#222f32',ink:'#d3ae7f',accent:'#6a7b74'});
 const clockBody=cyl(.55,.55,.11,mats.brass,-.95,4.47,-5.42);clockBody.rotation.x=Math.PI/2;
 const clockFace=cyl(.45,.45,.11,mats.paper,-.95,4.47,-5.33);clockFace.rotation.x=Math.PI/2;
 line([[-.95,4.47,-5.26],[-.95,4.69,-5.26]],mats.ink,.018);line([[-.95,4.47,-5.25],[-.78,4.55,-5.25]],mats.ink,.018);
 // Hanging wire and ceiling fixture.
 box(.035,.42,.035,mats.dark,3.7,4.80,.7);const light=cyl(.46,.26,.24,mats.brass,3.7,4.47,.7);cyl(.33,.33,.035,new THREE.MeshBasicMaterial({color:0xffddac}),3.7,4.30,.7);
}
function sound(f=500,seconds=.08,shape='sine',volume=.018){try{if(!state.entered)return;const ctx=window.__caseSound||(window.__caseSound=new (window.AudioContext||window.webkitAudioContext)());const o=ctx.createOscillator(),g=ctx.createGain();o.type=shape;o.frequency.setValueAtTime(f,ctx.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(80,f*.72),ctx.currentTime+seconds);g.gain.setValueAtTime(volume,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+seconds);o.connect(g).connect(ctx.destination);o.start();o.stop(ctx.currentTime+seconds)}catch(e){/* sound is optional */}}
function refresh(){const found=state.found.size;$('progress').textContent='PISTAS '+String(found).padStart(2,'0')+' / 05';$('notebookCount').textContent=found;$('deduceBtn').disabled=found!==5||state.ventOpen||state.won;
 for(const m of markers){m.sprite.material.opacity=state.found.has(m.id)?.27:1; m.sprite.scale.setScalar(state.found.has(m.id)?.45:.65)}
}
function modal(id){for(const k of ['inspectPanel','notebookPanel','deducePanel','endPanel'])$(k).classList.toggle('hidden',k!==id);$('scrim').classList.toggle('hidden',!id);state.modal=id}
function inspect(id){const e=EVIDENCE.find(x=>x.id===id);if(!e)return;state.inspecting=id;const n=EVIDENCE.indexOf(e)+1;$('evidenceIndex').textContent='EVIDENCIA '+String(n).padStart(2,'0')+' / 05';$('inspectType').textContent=e.type;$('inspectTitle').textContent=e.name;$('inspectBody').textContent=e.body;$('inspectInsight').textContent=e.insight;
 $('collectBtn').disabled=state.found.has(id);$('collectBtn').innerHTML=state.found.has(id)?'GUARDADA EN EL CUADERNO <span>✓</span>':'AGREGAR AL CUADERNO <span>＋</span>';modal('inspectPanel');sound(500,.13)}
function showNotebook(){const ul=$('notebookList');ul.replaceChildren();EVIDENCE.forEach((e,i)=>{const b=document.createElement('button');b.className='note-item';b.disabled=!state.found.has(e.id);b.style.opacity=b.disabled?'.33':'1';b.innerHTML='<small>'+String(i+1).padStart(2,'0')+'</small><div><strong>'+e.name+'</strong><span>'+(state.found.has(e.id)?'RELEER EVIDENCIA':'SIN INSPECCIONAR')+'</span></div>';b.addEventListener('click',()=>inspect(e.id));ul.append(b)});modal('notebookPanel')}
function choose(id){if(id==='vent'){
 state.ventOpen=true;modal(null);$('deduceBtn').disabled=true;$('hint').innerHTML='<span class="star">✳</span> REJILLA ABIERTA · TOCÁ LA CINTA QUE QUEDÓ ADENTRO';goalTarget.set(3.0,1.7,-4.0);orbit.goalAz=.41;orbit.goalR=9;hiddenTape.visible=true;hiddenMarker.visible=true;interactive.forEach(o=>{if(o.userData.recover)o.visible=true});sound(590,.5,'triangle',.04);
 }else{$('wrongAnswer').textContent=id==='drain'?'El desagüe no se conecta con el conducto; además, la puerta nunca se abrió. Volvé a contrastar el plano.':'El casillero está fuera de la sala sellada. La grabación menciona aire que continúa moviéndose.';sound(160,.18,'sawtooth',.012)}}
function recover(){if(!state.ventOpen||state.won)return;state.won=true;hiddenMarker.visible=false;modal('endPanel');$('hint').innerHTML='<span class="star">✓</span> CINTA RECUPERADA · EXPEDIENTE CERRADO';sound(650,.6,'sine',.03)}
function restart(){state.found.clear();state.ventOpen=false;state.won=false;state.inspecting=null;ventDoor.rotation.y=0;hiddenTape.visible=false;hiddenMarker.visible=false;goalTarget.set(0,1.35,-.9);orbit.goalAz=.7;orbit.goalEl=.56;orbit.goalR=13.3;$('hint').innerHTML='<span class="star">✳</span> ARRASTRÁ PARA MIRAR <span class="sep">·</span> TOCÁ LAS SEÑALES PARA INVESTIGAR';$('wrongAnswer').textContent='';modal(null);refresh()}
function bindUI(){
 $('enterBtn').addEventListener('click',()=>{state.entered=true;$('cover').classList.add('hidden');sound(330,.2,'triangle',.03)});
 $('closeInspect').addEventListener('click',()=>modal(null));$('closeNotebook').addEventListener('click',()=>modal(null));$('closeDeduce').addEventListener('click',()=>modal(null));$('scrim').addEventListener('click',()=>{if(!state.won)modal(null)});
 $('collectBtn').addEventListener('click',()=>{if(!state.inspecting)return;state.found.add(state.inspecting);refresh();sound(800,.12,'sine',.025);modal(null);if(state.found.size===5){$('hint').innerHTML='<span class="star">✳</span> CINCO PISTAS REGISTRADAS · YA PODÉS FORMULAR UNA DEDUCCIÓN'}});
 $('notebookBtn').addEventListener('click',showNotebook);$('deduceBtn').addEventListener('click',()=>{if(state.found.size!==5||state.ventOpen)return;$('wrongAnswer').textContent='';modal('deducePanel')});
 $('replayBtn').addEventListener('click',restart);document.querySelectorAll('[data-choice]').forEach(b=>b.addEventListener('click',()=>choose(b.dataset.choice)));
 $('resetCam').addEventListener('click',()=>{goalTarget.set(0,1.35,-.9);orbit.goalAz=.7;orbit.goalEl=.56;orbit.goalR=13.3});
 window.addEventListener('keydown',e=>{if(e.key==='Escape'&&!state.won)modal(null);if(state.modal||!state.entered)return;if(e.key==='ArrowLeft')orbit.goalAz-=.12;if(e.key==='ArrowRight')orbit.goalAz+=.12;if(e.key==='ArrowUp')orbit.goalEl=Math.min(.96,orbit.goalEl+.09);if(e.key==='ArrowDown')orbit.goalEl=Math.max(.25,orbit.goalEl-.09)});
}
function raypick(clientX,clientY){const rect=renderer.domElement.getBoundingClientRect();v.set(((clientX-rect.left)/rect.width)*2-1,-((clientY-rect.top)/rect.height)*2+1);raycaster.setFromCamera(v,camera);const hits=raycaster.intersectObjects(interactive.filter(o=>o.visible!==false),false);return hits.length?hits[0].object:null}
function bindPointer(){const el=renderer.domElement;
 el.addEventListener('pointerdown',e=>{if(!state.entered||state.modal)return;el.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===1){dragStarted=false;downX=e.clientX;downY=e.clientY}if(pointers.size===2){const a=[...pointers.values()];pinchDistance=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);dragStarted=true}});
 el.addEventListener('pointermove',e=>{if(!state.entered||state.modal)return;const prev=pointers.get(e.pointerId);if(prev){const dx=e.clientX-prev.x,dy=e.clientY-prev.y;prev.x=e.clientX;prev.y=e.clientY;
 if(pointers.size>=2){const a=[...pointers.values()],d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);if(pinchDistance)orbit.goalR=THREE.MathUtils.clamp(orbit.goalR*pinchDistance/Math.max(1,d),6.4,17.5);pinchDistance=d}
 else if(Math.hypot(e.clientX-downX,e.clientY-downY)>7){dragStarted=true;orbit.goalAz=THREE.MathUtils.clamp(orbit.goalAz-dx*.0068,-.85,1.43);orbit.goalEl=THREE.MathUtils.clamp(orbit.goalEl+dy*.0052,.25,1.12)}
 }else if(e.pointerType==='mouse'){const picked=raypick(e.clientX,e.clientY);$('hoverHint').classList.toggle('visible',!!picked);if(picked){$('hoverHint').textContent=picked.userData.recover?'RECUPERAR CINTA':EVIDENCE.find(q=>q.id===picked.userData.evidence)?.name.toUpperCase()||'';$('hoverHint').style.left=e.clientX+'px';$('hoverHint').style.top=e.clientY+'px';el.style.cursor='pointer'}else el.style.cursor='grab'}
 });
 el.addEventListener('pointerup',e=>{if(!state.entered)return;const wasTap=pointers.size===1&&!dragStarted&&Math.hypot(e.clientX-downX,e.clientY-downY)<12;pointers.delete(e.pointerId);pinchDistance=0;if(wasTap&&!state.modal){const picked=raypick(e.clientX,e.clientY);if(picked?.userData.recover){recover()}else if(picked?.userData.evidence){inspect(picked.userData.evidence)}}});
 const clear=e=>{pointers.delete(e.pointerId);pinchDistance=0};el.addEventListener('pointercancel',clear);el.addEventListener('lostpointercapture',clear);
 el.addEventListener('wheel',e=>{if(state.modal||!state.entered)return;e.preventDefault();orbit.goalR=THREE.MathUtils.clamp(orbit.goalR+e.deltaY*.011,6.4,17.5)},{passive:false});
}
function animate(t){requestAnimationFrame(animate);
 const sec=t*.001;orbit.az+=THREE.MathUtils.clamp(orbit.goalAz-orbit.az,-.11,.11)*.12;orbit.el+=(orbit.goalEl-orbit.el)*.10;orbit.r+=(orbit.goalR-orbit.r)*.09;target.lerp(goalTarget,.065);
 const horiz=Math.cos(orbit.el)*orbit.r;camera.position.set(target.x+Math.sin(orbit.az)*horiz,target.y+Math.sin(orbit.el)*orbit.r,target.z+Math.cos(orbit.az)*horiz);camera.lookAt(target);
 for(const r of rain){r.m.position.y-=r.speed;if(r.m.position.y<1.74)r.m.position.y=r.top}
 markers.forEach((m,i)=>m.sprite.position.y=m.y+Math.sin(sec*2.1+i*.7)*.055);
 if(hiddenMarker.visible)hiddenMarker.position.y=2.30+Math.sin(sec*2.5)*.075;
 if(state.ventOpen)ventDoor.rotation.y+=( -1.65-ventDoor.rotation.y)*.08;
 if(tableLamp)tableLamp.intensity=35+Math.sin(sec*11)*1.3+Math.sin(sec*2.4)*2.0;
 if(accentLight)accentLight.intensity=11+Math.sin(sec*1.2)*1.2;
 if(dust)dust.rotation.y=sec*.004;
 renderer.render(scene,camera);
}
function init(){
 if(!window.WebGL2RenderingContext)throw Error('WEBGL2_NOT_SUPPORTED');
 scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(43,innerWidth/innerHeight,.1,80);
 renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.24;renderer.domElement.setAttribute('aria-label','Archivo nocturno en 3D. Tocá señales de evidencia y arrastrá para mirar.');$('stage').append(renderer.domElement);
 buildRoom();buildDesk();buildClues();bindUI();bindPointer();refresh();
 // Hide recovery collider before the solved state; it is never an accidental shortcut.
 for(const o of interactive){if(o.userData.recover)o.visible=false}
 window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.fov=innerWidth<600?49:43;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7))});requestAnimationFrame(animate);
}
try{init()}catch(err){console.error('CASE_BOOT_ERROR',err);$('errorMessage').classList.remove('hidden')}