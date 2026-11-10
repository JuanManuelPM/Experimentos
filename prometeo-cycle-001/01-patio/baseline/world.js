import * as THREE from "three";
import {createAvatar} from "./avatar.js";
const M=(color,more={})=>new THREE.MeshStandardMaterial({color,roughness:.88,...more});
const colors={grass:"#9ab897",stone:"#e7cfad",clay:"#ba7f62",cream:"#f6e6ca",copper:"#b9664d",dark:"#655449",wood:"#966a52",teal:"#5b8e88",sage:"#72987a",yellow:"#eec67a",coral:"#db8e71"};
const turf=M(colors.grass),stone=M(colors.stone),wood=M(colors.wood),cream=M(colors.cream),deep=M(colors.dark),yellow=M(colors.yellow),salmon=M(colors.coral),teal=M(colors.teal);
const boxGeo=new THREE.BoxGeometry(1,1,1);
function mesh(parent,geo,mat,x,y,z,{cast=true,receive=true}={}){const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);o.castShadow=cast;o.receiveShadow=receive;parent.add(o);return o}
function box(parent,x,y,z,w,h,d,material){const o=mesh(parent,boxGeo,material,x,y,z);o.scale.set(w,h,d);return o}
function sphere(parent,x,y,z,r,color,detail=1){return mesh(parent,new THREE.IcosahedronGeometry(r,detail),M(color,{flatShading:detail<2}),x,y,z)}
function cylinder(parent,x,y,z,rt,rb,h,mat,n=12){return mesh(parent,new THREE.CylinderGeometry(rt,rb,h,n),mat,x,y,z)}
function plane(parent,x,y,z,w,d,mat){const o=mesh(parent,new THREE.PlaneGeometry(w,d),mat,x,y,z,{cast:false});o.rotation.x=-Math.PI/2;return o}
function disc(parent,x,y,z,r,mat,n=48){return cylinder(parent,x,y,z,r,r,.09,mat,n)}
function textSign(scene,content,x,y,z,w=2.7){const cvs=document.createElement("canvas");cvs.width=512;cvs.height=128;const ctx=cvs.getContext("2d");ctx.clearRect(0,0,512,128);ctx.fillStyle="#6c4a3b";ctx.font="900 84px Trebuchet MS, sans-serif";ctx.textAlign="center";ctx.fillText(content,256,93);const texture=new THREE.CanvasTexture(cvs);texture.colorSpace=THREE.SRGBColorSpace;const o=new THREE.Mesh(new THREE.PlaneGeometry(w,w*.25),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:THREE.DoubleSide}));o.position.set(x,y,z);scene.add(o);return o}
export function buildWorld(scene){
 const obstacles=[],cameraObstacles=[],interactables=[],npc=[],stageLights=[],flowers=[];
 const addAabb=(x,z,w,d,top=5)=>{const b={minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2,top};obstacles.push(b);return b};
 // The playable square is a warm garden inside larger grass, with small paths and uneven edges.
 const ground=plane(scene,0,-.15,0,58,58,turf);
 const plaza=disc(scene,0,-.13,0,9.45,M("#ddc7a9"),72);
 disc(scene,0,-.075,0,8.65,M("#eddbbb"),72);
 const tileGroups=[[],[]],tmp=new THREE.Object3D();
 for(let ring=1;ring<=5;ring++){
  const rr=ring*1.47;
  for(let i=0;i<ring*19;i++){
   const angle=i*Math.PI*2/(ring*19)+(ring%2)*.22,rad=rr+(i%3)*.025;
   tmp.position.set(Math.sin(angle)*rad,-.014+((i%3)*.001),Math.cos(angle)*rad);
   tmp.rotation.set(0,-angle,0);tmp.scale.set(.92,.026,.48);tmp.updateMatrix();
   tileGroups[(i+ring)%5===0?0:1].push(tmp.matrix.clone());
  }
 }
 for(let k=0;k<tileGroups.length;k++){const inst=new THREE.InstancedMesh(boxGeo,M(k===0?"#e2c7a3":"#ecd8b7"),tileGroups[k].length);
  tileGroups[k].forEach((matrix,i)=>inst.setMatrixAt(i,matrix));inst.instanceMatrix.needsUpdate=true;inst.receiveShadow=true;scene.add(inst);}

 // Curved paths carry the eye toward the three uses of the plaza.
 for(const [x,z,rot,len] of [[-4.7,-.8,-.26,6],[5.0,-2.3,.4,7],[0,5.4,0,5]]){
  const p=box(scene,x,-.01,z,1.9,.03,len,M("#e4c9a7"));p.rotation.y=rot;
  for(let q=-2;q<=2;q++){const b=box(scene,x+Math.sin(rot)*q*.8,.015,z+Math.cos(rot)*q*.8,1.6,.025,.10,M("#f3dfbf"));b.rotation.y=rot;}
 }
 // Center island: giant shade tree with visible raised circular bed.
 const bed=disc(scene,0,.12,-3.15,1.72,M("#d9a881"));bed.scale.y=3;
 disc(scene,0,.30,-3.15,1.44,M("#829b75"));
 const trunk=cylinder(scene,0,1.4,-3.15,.31,.42,2.75,M("#9d7656"),9);
 for(const [x,y,z,r,col] of [[-.75,3.55,-3.12,1.38,"#6f9878"],[.82,3.83,-3.16,1.5,"#79a485"],[0,4.22,-3.65,1.38,"#8cb18c"],[-.18,4.35,-2.76,1.14,"#789d78"]])sphere(scene,x,y,z,r,col,1);
 addAabb(0,-3.15,2.2,2.2,3.1);
 // Wishing basin, offset from the tree, with blue glazed ceramic.
 cylinder(scene,1.5,.28,-1.5,.91,1.06,.46,M("#e5ceac"),18);
 disc(scene,1.5,.52,-1.5,.76,M("#6fa6a3"),24);
 for(let i=0;i<10;i++){const a=i*Math.PI/5;sphere(scene,1.5+Math.cos(a)*.87,.53,-1.5+Math.sin(a)*.87,.13,"#f1dfbf",0)}
 const basinObstacle=addAabb(1.5,-1.5,1.7,1.7,1);
 // Cafe to left: solid timber building, front counter, awning, sign, planter.
 const cafe=new THREE.Group();scene.add(cafe);
 const facade=box(cafe,-7.15,1.65,-5.2,5.3,3.5,4.1,M("#f3dcc0"));facade.castShadow=true;
 box(cafe,-7.15,3.6,-5.2,5.75,.24,4.5,M("#aa6d59"));
 for(const s of [-1,1]){const e=box(cafe,-7.15,4.12,-5.2+s*.96,5.9,.20,2.6,M("#b9745d"));e.rotation.x=s*.49;}
 for(const x of [-9.18,-5.11])box(cafe,x,1.8,-2.98,.24,3.4,.25,M("#a8785d"));
 for(const x of [-8.45,-6.9,-5.35]){
  box(cafe,x,1.85,-3.10,1.1,1.35,.16,M("#6b918a"));
  box(cafe,x,2.45,-3.0,1.16,.10,.21,M("#e8b779"));
  box(cafe,x,1.19,-3.0,1.16,.10,.2,M("#c0916e"));
 }
 box(cafe,-7.15,3.14,-2.55,5.4,.20,1.35,M("#f4d59b"));
 for(let i=-3;i<=3;i++){const b=box(cafe,-7.15+i*.70,3.12,-1.99,.36,.18,1,M(i%2===0?"#d68a6c":"#f8ebd4"));b.rotation.x=.09;}
 const counter=box(cafe,-7.15,.75,-1.62,3.0,1.25,.74,wood);
 box(cafe,-7.15,1.42,-1.45,3.4,.15,1.04,M("#e4bb83"));
 for(let i=0;i<3;i++){const mug=cylinder(cafe,-8.0+i*.78,1.62,-1.38,.13,.12,.23,cream,10);mug.castShadow=true}
 textSign(scene,"CAFÉ",-7.13,3.20,-1.73,2.45);
 obstacles.push({minX:-10,maxX:-4.4,minZ:-7.4,maxZ:-2.85,top:5});
 cameraObstacles.push({minX:-10,maxX:-4.4,minZ:-7.4,maxZ:-2.85,top:5});
 addAabb(-7.15,-1.62,3,.85,1.5);
 // A couple of chairs and an actual sit-able bench are outside the cafe.
 const benchGroup=new THREE.Group();benchGroup.position.set(-3.85,0,3.2);scene.add(benchGroup);
 box(benchGroup,0,.59,0,2.55,.20,.67,wood);
 box(benchGroup,0,1.05,-.29,2.55,.67,.16,M("#be8567"));
 for(const s of [-1,1]){box(benchGroup,s*1.06,.35,-.23,.17,.8,.18,deep);box(benchGroup,s*1.06,.32,.22,.17,.66,.16,deep);}
 addAabb(-3.85,3.0,2.7,.52,1.6);
 interactables.push({id:"bench",kind:"bench",x:-3.85,z:4.03,radius:2.35,label:"Sentarse",subtitle:"Banco de la plaza",seatX:-3.85,seatZ:3.29,yaw:0});
 // A hat stall with visible cloth display on the right of the plaza.
 const stall=new THREE.Group();scene.add(stall);
 box(stall,4.50,.75,4.35,2.7,1.2,1.45,M("#9f7d69"));
 box(stall,4.50,1.4,4.35,3.0,.14,1.65,cream);
 for(const x of [3.25,5.75])for(const z of [3.7,5.0])box(stall,x,2, z,.11,2,.11,wood);
 const canopy=box(stall,4.5,2.73,4.35,3.15,.2,1.78,M("#d2a875"));canopy.rotation.z=-.07;
 for(const x of [3.8,4.5,5.2]){const cap=cylinder(stall,x,1.61,4.25,.35,.33,.14,M(x>5?"#85a88f":"#d69d83"),12);cap.castShadow=true}
 textSign(scene,"SOMBREROS",4.45,2.45,5.29,2.6);
 addAabb(4.5,4.2,2.7,1.15,2.9);
 interactables.push({id:"wardrobe",kind:"wardrobe",x:4.5,z:5.85,radius:2.35,label:"Cambiar look",subtitle:"Tienda de sombreros"});
 // Stage on the far right, lights respond to dance, musical floor in front.
 const stage=new THREE.Group();scene.add(stage);
 box(stage,6.8,.30,-5.95,5.25,.62,3.2,M("#ae7b69"));
 box(stage,6.8,.68,-7.55,5.5,.84,.18,M("#5a695d"));
 box(stage,6.8,3.06,-7.56,5.5,.20,.22,wood);
 for(const x of [4.25,9.35]){box(stage,x,1.82,-7.5,.24,3.3,.28,wood);sphere(stage,x,3.1,-7.45,.3,"#eac281",1)}
 textSign(scene,"RITMOS",6.8,2.65,-7.41,2.9);
 for(let x=0;x<4;x++)for(let z=0;z<3;z++){
  box(stage,5.15+x*.99,.645,-7.05+z*.85,.88,.035,.75,M((x+z)%2===0?"#e0bb84":"#8caa9a"));
 }
 const bulbs=[];
 for(let i=0;i<7;i++){const x=4.35+i*.81;const light=new THREE.PointLight(i%2?"#ffbd73":"#a6d9c2",0,4.2);light.position.set(x,2.6,-6.8);stage.add(light);stageLights.push(light);
  const b=sphere(stage,x,2.55,-6.8,.12,i%2?"#fff0bb":"#c5ffed",1);b.material.emissive=new THREE.Color(i%2?"#f2b37b":"#a4dbc3");b.material.emissiveIntensity=.15;bulbs.push(b);
 }
 obstacles.push({minX:4.2,maxX:9.4,minZ:-8,maxZ:-4.3,top:3.4});
 cameraObstacles.push({minX:4.2,maxX:9.4,minZ:-8,maxZ:-4.3,top:3.4});
 interactables.push({id:"stage",kind:"stage",x:6.65,z:-3.35,radius:2.5,label:"Bailar",subtitle:"Encender la pista"});
 interactables.push({id:"coffee",kind:"coffee",x:-6.8,z:-.5,radius:2.5,label:"Tomar algo",subtitle:"Cafetería Patio"});
 // NPC with own hair palette and position, no false social network.
 for(const item of [
  {id:"mora",name:"Mora",x:-2.05,z:1.1,color:2,skin:"#ba806b",hair:"#574739",speech:"¡Bienvenido al Patio! El café huele mejor si te sentás un rato. Y Luz siempre tiene música."},
  {id:"tilo",name:"Tilo",x:-5.2,z:-.28,color:3,skin:"#e9b88d",hair:"#584d44",speech:"No vendo nada, comparto tazas. Probá el café, después saludá a Mora y visitá la pista."},
  {id:"luz",name:"Luz",x:4.25,z:-2.2,color:1,skin:"#af735e",hair:"#343d41",speech:"En esta pista nadie baila mal. Si tocás el escenario, las luces se despiertan."}
 ]){
  const a=createAvatar({color:item.color,hat:item.id==="tilo"?"cap":"none",npc:true,skin:item.skin,hair:item.hair});a.root.position.set(item.x,0,item.z);a.root.rotation.y=item.id==="luz"?.6:item.id==="tilo"?.3:-.4;scene.add(a.root);
  npc.push({root:a.root,avatar:a,name:item.name,id:item.id});
  interactables.push({id:item.id,kind:"npc",name:item.name,x:item.x,z:item.z,radius:2.35,label:"Hablar con "+item.name,subtitle:"Habitante · NPC",speech:item.speech});
  addAabb(item.x,item.z,.45,.45,3);
 }
 // Garden lanterns, warm beacons and benches with purpose.
 for(const [x,z] of [[-9,2],[-6,6],[3,9],[8,3],[10,-1],[-3,-8]]){
  cylinder(scene,x,1.2,z,.065,.095,2.35,deep,8);
  sphere(scene,x,2.4,z,.22,"#ffd08a",1);
  cylinder(scene,x,2.55,z,.21,.21,.10,M("#7e6654"),10);
 }
 // Shrubs and clusters are placed away from the walking lanes.
 for(const [x,z,s] of [[-10,0,1],[-9,5,.8],[-2,7,1],[2,8,.9],[8,7,.8],[10,1,1],[-9,-9,.9],[2,-9,1],[11,-6,.7],[-10,-6,.9]]){
  sphere(scene,x,.54*s,z,.72*s,"#709c73",1);sphere(scene,x+.44*s,.42*s,z+.1,.5*s,"#85ad86",1);
 }
 for(let i=0;i<75;i++){
  const a=i*2.3999632,r=9.0+(i%5)*.42,x=Math.sin(a)*r,z=Math.cos(a)*r;
  if(Math.abs(x+7)<3.5&&z<-2)continue;
  const stem=cylinder(scene,x,.16,z,.025,.03,.3,M("#668c5c"),5);
  const flower=sphere(scene,x,.31,z,.09,["#f2c685","#efab9e","#fff1cb"][i%3],0);
  flowers.push(flower);
 }
 // Courtyard posters, lights strung behind NPCs.
 for(const z of [6.9,-8.4])for(const x of [-9,-7,-5,-3,-1,1,3,5,7,9]){
  const bulb=sphere(scene,x,3.5+Math.sin(x)*.2,z,.09,"#ffe7b0",0);bulb.material.emissive=new THREE.Color("#d9aa6e");bulb.material.emissiveIntensity=.6;
 }
 // Gradient sky tint via fog and horizon elements, no downloaded textures.
 for(let i=0;i<13;i++){const ang=i*Math.PI*2/13,r=17.5,s=1+(i%3)*.32;
  cylinder(scene,Math.sin(ang)*r,.9*s,Math.cos(ang)*r,.18*s,.32*s,1.8*s,M("#8b765d"),8);
  sphere(scene,Math.sin(ang)*r,2.5*s,Math.cos(ang)*r,1.3*s,i%2?"#83a98c":"#769c81",1);
 }
 let t=0;
 function update(elapsed,dt,activeDance){
  t=elapsed;
  for(const n of npc){n.avatar.tick(dt,{moving:false,waving:Math.sin(t*.67+n.root.position.x)> .85});}
  for(let i=0;i<stageLights.length;i++){
   stageLights[i].intensity=activeDance?1.9+Math.sin(elapsed*7+i*1.4)*.9:.12;
   bulbs[i].material.emissiveIntensity=activeDance?2.6+.6*Math.sin(t*9+i):.1;
   bulbs[i].scale.setScalar(activeDance?1+.18*Math.sin(t*8+i):1);
  }
  for(let i=0;i<flowers.length;i++)flowers[i].rotation.z=Math.sin(t*2+i)*.15;
 }
 return {interactables,obstacles,cameraObstacles,npc,stageLights,update};
}

