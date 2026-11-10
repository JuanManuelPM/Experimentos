import * as THREE from "three";
// Sculpted, original procedural geometry. Decorative meshes do not impersonate users.
const colors={ink:"#493b40",paper:"#fff1d6",terra:"#cb7264",mint:"#6d9992",gold:"#e7b95c",flower:"#f0a8aa"};
const material=c=>new THREE.MeshStandardMaterial({color:c,flatShading:true,roughness:.82,metalness:0});
const mats=Object.fromEntries(Object.entries(colors).map(([k,v])=>[k,material(v)]));
const geometry={
 box:new THREE.BoxGeometry(1,1,1),
 leaf:new THREE.IcosahedronGeometry(1,0),
 cone:new THREE.ConeGeometry(1,1,5)
};
function put(parent,geo,mat,x,y,z,sx=1,sy=1,sz=1){
 const mesh=new THREE.Mesh(geo,mat);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);mesh.castShadow=true;parent.add(mesh);return mesh;
}
function fold(parent,x,y,z,s,m){
 const p=put(parent,geometry.box,m,x,y,z,.47*s,.30*s,.035*s);
 const tip=new THREE.Mesh(new THREE.ConeGeometry(.23*s,.18*s,3),m);
 tip.position.set(x,y+.015*s,z+.03*s);tip.rotation.z=Math.PI;tip.rotation.x=Math.PI/2;parent.add(tip);
 return p;
}
export function addPostOffice(scene,world){
 const desk=new THREE.Group();desk.position.set(-1.55,0,5.6);scene.add(desk);
 put(desk,new THREE.CylinderGeometry(.44,.54,.15,8),mats.ink,0,.1,0);
 put(desk,new THREE.CylinderGeometry(.13,.17,.88,8),mats.ink,0,.62,0);
 put(desk,geometry.box,mats.terra,0,1.18,0,.88,.66,.62);
 put(desk,geometry.box,mats.paper,0,1.47,.05,1.04,.11,.78);
 put(desk,geometry.box,mats.ink,0,1.25,.326,.53,.055,.04);
 fold(desk,0,1.73,.06,1.04,mats.paper);
 for(let k=0;k<4;k++){const leaf=put(desk,geometry.leaf,k%2?mats.gold:mats.mint,(k-1.5)*.18,1.86+Math.abs(k-1.5)*.11,-.17,.13,.08,.045);leaf.rotation.z=k*.3;}
 world.interactables.push({id:"postbox",kind:"postbox",x:-1.55,z:5.6,radius:1.85,label:"Leer buzón",subtitle:"✉ Repartir tres cartas"});
 // The stand is real geometry; small exclusion preserves honest collision.
 world.obstacles.push({minX:-1.94,maxX:-1.16,minZ:5.21,maxZ:5.99,top:1.85});
 const markers=[];
 for(const npc of world.npc){
   const group=new THREE.Group();scene.add(group);group.position.set(npc.root.position.x,3.34,npc.root.position.z);
   const plate=put(group,geometry.box,mats.paper,0,0,0,.55,.37,.08);
   fold(group,0,.015,.06,.81,mats.terra);
   const halo=put(group,new THREE.TorusGeometry(.50,.035,5,20),mats.gold,0,-.5,0);halo.rotation.x=Math.PI/2;
   markers.push({id:npc.id,group,halo,offset:{mora:0,tilo:2.2,luz:4.1}[npc.id]});
   const body=npc.avatar.body;
   if(npc.id==="mora"){
     const plant=new THREE.Group();plant.position.set(-.58,1.5,-.20);body.add(plant);
     put(plant,geometry.box,mats.terra,0,0,0,.32,.34,.29);
     for(let k=0;k<4;k++){const l=put(plant,geometry.leaf,mats.mint,Math.sin(k*2.4)*.2,.28+Math.cos(k)*.11,Math.cos(k*2.4)*.17,.18,.28,.10);l.rotation.z=Math.sin(k*2.4)*.35;}
   } else if(npc.id==="tilo"){
     const mug=new THREE.Group();mug.position.set(.55,1.02,.2);body.add(mug);
     put(mug,new THREE.CylinderGeometry(.19,.16,.39,9),mats.gold,0,0,0);
     put(mug,new THREE.TorusGeometry(.14,.045,5,12),mats.ink,.21,.02,0).rotation.y=Math.PI/2;
   } else {
     for(let k=0;k<3;k++){const star=put(body,geometry.leaf,k%2?mats.gold:mats.flower,(k-1)*.36,2.73+Math.abs(k-1)*.12,.04,.12,.19,.09);star.rotation.z=k*.37;}
     const bow=put(body,geometry.cone,mats.terra,.60,1.56,.24,.24,.48,.14);bow.rotation.z=-.4;
   }
 }
 // A little origami courier follows the avatar, with no impact on physics.
 const courier=new THREE.Group();scene.add(courier);
 const core=put(courier,geometry.leaf,mats.paper,0,0,0,.27,.19,.40);
 const left=put(courier,new THREE.ConeGeometry(.26,.65,3),mats.mint,-.29,.1,0);left.rotation.z=-.9;
 const right=put(courier,new THREE.ConeGeometry(.26,.65,3),mats.terra,.29,.1,0);right.rotation.z=.9;
 put(courier,geometry.cone,mats.gold,0,-.11,.38,.08,.21,.16).rotation.x=Math.PI/2;
 const petals=[];
 for(let k=0;k<18;k++){
   const p=put(scene,geometry.leaf,k%3===0?mats.gold:k%3===1?mats.flower:mats.paper,0,-10,0,.08,.15,.05);
   p.visible=false;petals.push({mesh:p,index:k});
 }
 let postal={step:0,active:false,completed:false},celebrate=-1,elapsed=0;
 function setState(p){const won=p.completed===true&&!postal.completed;postal=p;if(won)celebrate=0;}
 function update(t,dt,player,camera){
   elapsed=t;
   const target=postal.active?["mora","tilo","luz"][postal.step]:null;
   for(const m of markers){
     m.group.visible=target===m.id;
     m.group.position.y=3.34+Math.sin(t*2+m.offset)*.17;
     m.group.rotation.y=t*.43+m.offset;
     m.halo.rotation.z=t*.15;
   }
   const to=new THREE.Vector3(player.x-.9,1.94+Math.sin(t*4)*.17,player.z+.65);
   courier.position.lerp(to,Math.min(1,dt*5));
   courier.rotation.y=t*.6;
   left.rotation.z=-.9+Math.sin(t*8)*.18;
   right.rotation.z=.9-Math.sin(t*8)*.18;
   core.material=postal.completed?mats.gold:mats.paper;
   if(celebrate>=0){
     celebrate+=dt;
     for(const {mesh,index:k} of petals){
       const a=k*2.39996,rr=celebrate*1.25+(k%3)*.14;
       mesh.visible=celebrate<3.1;
       mesh.position.set(player.x+Math.cos(a)*rr,.7+celebrate*.84-(celebrate*celebrate)*.13+(k%4)*.11,player.z+Math.sin(a)*rr);
       mesh.rotation.set(celebrate*3+k,celebrate*2+k,celebrate+k);
     }
     if(celebrate>=3.1)celebrate=-1;
   }
 }
 return {setState,update};
}
