
import * as THREE from "three";
const M=(color)=>new THREE.MeshStandardMaterial({color,roughness:.87,flatShading:true});
function put(parent,geo,material,x,y,z,shadow=false){
 const o=new THREE.Mesh(geo,material);o.position.set(x,y,z);o.castShadow=shadow;parent.add(o);return o;
}
export function dressWorld(scene,world){
 const accents=["#d9aa67","#5f9593","#d57a6d","#f0d5a7"];
 // Colorful fabric pennants, not interface cards: each has a different silhouette.
 const strings=[];
 for(const [z,start,end] of [[7.7,-8,8],[-9.0,-7,7]]){
  const points=[new THREE.Vector3(start,3.9,z),new THREE.Vector3(0,3.55,z),new THREE.Vector3(end,3.9,z)];
  const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:"#786b58"}));scene.add(line);
  for(let k=0;k<13;k++){
   const x=start+(end-start)*(k+.6)/13,y=3.9-.35*(1-Math.abs(x)/9);
   const flag=put(scene,new THREE.ConeGeometry(.27,.63,3),M(accents[k%4]),x,y-.33,z);
   flag.rotation.x=Math.PI;flag.rotation.y=(k%2)*.35;
   strings.push({mesh:flag,k});
  }
 }
 // Three playable clay bells. All geometry original, no asset license ambiguity.
 const tones=[
  {id:"amber",color:"#e7b45d",x:1.27,z:6.45,title:"Ámbar"},
  {id:"coral",color:"#d97f75",x:2.61,z:6.86,title:"Coral"},
  {id:"teal",color:"#69b2ac",x:3.95,z:6.45,title:"Verde"}
 ];
 const bells=[];
 for(const tone of tones){
  const group=new THREE.Group();group.position.set(tone.x,0,tone.z);scene.add(group);
  put(group,new THREE.CylinderGeometry(.41,.47,.16,10),M("#d9bd9b"),0,.10,0);
  put(group,new THREE.CylinderGeometry(.08,.11,1.16,8),M("#856b5e"),0,.69,0);
  const bell=put(group,new THREE.ConeGeometry(.32,.55,9),M(tone.color),0,1.41,0,true);
  bell.rotation.z=Math.PI;
  put(group,new THREE.SphereGeometry(.11,9,7),M("#fbefcf"),0,1.73,0);
  const ring=put(group,new THREE.TorusGeometry(.39,.045,5,16),M(tone.color),0,1.12,0);
  ring.rotation.x=Math.PI/2;
  world.interactables.push({id:"bell-"+tone.id,kind:"bell",tone:tone.id,x:tone.x,z:tone.z,radius:1.28,label:"Tocar "+tone.title,subtitle:"Carillón de la plaza"});
  bells.push({tone,bell,ring});
 }
 // Original paper birds and garden stones add depth without obstructing movement.
 const birds=[];
 for(let i=0;i<9;i++){
  const bird=new THREE.Group();scene.add(bird);
  const x=-8+i*1.65,z=-8-(i%2)*.8;bird.position.set(x,4.25+(i%3)*.43,z);
  const wing=M(i%2?"#fbebce":"#b7d2bc");
  const l=put(bird,new THREE.ConeGeometry(.18,.45,3),wing,-.16,0,0);
  const r=put(bird,new THREE.ConeGeometry(.18,.45,3),wing,.16,0,0);
  l.rotation.z=.6;r.rotation.z=-.6;
  birds.push({bird,l,r,i});
 }
 let phase=0,completed=false;
 function setMelodyState(step=0,done=false){phase=step;completed=done;}
 const oldUpdate=world.update;
 world.update=(time,dt,dancing)=>{
  oldUpdate?.(time,dt,dancing);
  strings.forEach(({mesh,k})=>mesh.rotation.z=Math.sin(time*1.2+k)*.035);
  for(let i=0;i<bells.length;i++){
   const {bell,ring}=bells[i];
   const highlight=completed||i===phase;
   const amplitude=highlight?.12:.035;
   bell.position.y=1.41+Math.sin(time*3+i)*amplitude;
   bell.scale.setScalar(highlight?1+.055*Math.sin(time*4+i):1);
   ring.material.emissive?.set?.(highlight?bell.material.color:"#000000");
   ring.material.emissiveIntensity=highlight?.24:0;
  }
  birds.forEach(({bird,l,r,i})=>{bird.position.y=4.25+(i%3)*.43+Math.sin(time*1.9+i)*.13;l.rotation.z=.6+Math.sin(time*5+i)*.13;r.rotation.z=-.6-Math.sin(time*5+i)*.13;});
 };
 world.setMelodyState=setMelodyState;
 world.melodyTones=tones.map(({id,color})=>({id,color}));
 return world;
}
