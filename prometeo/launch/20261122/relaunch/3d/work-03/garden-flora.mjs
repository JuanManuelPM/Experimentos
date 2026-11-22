// ASTEROIDE JARDÍN W7 · family: hand-directed paper-botanical / volumetric silhouettes.
// Original procedural assets only. Public reusable Three.js scene-graph module.
export function plantGrove(THREE,{up,baseRadius=9,scale=1,bloom=false,index=0}={}){
 const Y=new THREE.Vector3(0,1,0),root=new THREE.Group();
 root.position.copy(up.clone().normalize().multiplyScalar(baseRadius+.04));
 root.quaternion.setFromUnitVectors(Y,up.clone().normalize());
 const bark=new THREE.MeshStandardMaterial({color:'#7c675d',roughness:.94,flatShading:false});
 const body=new THREE.MeshStandardMaterial({color:index%3===0?'#345d56':'#547d66',roughness:.88,side:THREE.DoubleSide});
 const bright=new THREE.MeshStandardMaterial({color:index%4===0?'#b7d7a6':'#98c5a1',roughness:.85,side:THREE.DoubleSide});
 const ink=new THREE.MeshStandardMaterial({color:'#25413e',roughness:1});
 const flower=new THREE.MeshStandardMaterial({color:index%2===0?'#efbca7':'#e0cba4',roughness:.69,side:THREE.DoubleSide});
 const s=new THREE.Shape();
 s.moveTo(0,0);
 s.bezierCurveTo(-.13,.07,-.36,.26,-.40,.55);
 s.bezierCurveTo(-.36,.85,-.14,.99,0,1.10);
 s.bezierCurveTo(.18,.91,.36,.70,.38,.52);
 s.bezierCurveTo(.31,.22,.10,.08,0,0);
 const leafGeo=new THREE.ShapeGeometry(s,10);
 const mid=new THREE.Shape();mid.moveTo(0,0);mid.quadraticCurveTo(.03,.5,0,1.1);
 const tipCount=3+index%2;
 const trunkCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(0,0,0),new THREE.Vector3(.03,.48,0),new THREE.Vector3(-.08,1.04,.04),new THREE.Vector3(-.06,1.54,.04)]);
 const trunk=new THREE.Mesh(new THREE.TubeGeometry(trunkCurve,22,.11,9,false),bark);root.add(trunk);
 const flare=new THREE.Mesh(new THREE.ConeGeometry(.24,.37,9),bark);flare.position.y=.16;flare.rotation.z=Math.PI;root.add(flare);
 const tiers=[{y:.63,r:.18,leaves:5,k:.75},{y:1.02,r:.28,leaves:6,k:.95},{y:1.35,r:.13,leaves:tipCount,k:.69}];
 tiers.forEach((tier,t)=>{
   const pivot=new THREE.Group();pivot.position.set(t%2?-.04:.03,tier.y,.01);root.add(pivot);
   for(let i=0;i<tier.leaves;i++){
     const a=i/tier.leaves*Math.PI*2+t*.38,part=new THREE.Group();
     part.rotation.y=a;part.rotation.z=-.22-(t%2)*.13;part.position.set(Math.sin(a)*tier.r,0,Math.cos(a)*tier.r);
     pivot.add(part);
     const blade=new THREE.Mesh(leafGeo,(i+t)%5===0?bright:body);
     blade.scale.set(tier.k*(.68+(i%3)*.12),tier.k*(.63+(i%2)*.14),tier.k);
     blade.rotation.x=-.45;blade.rotation.z=(i%2?.08:-.06);
     blade.position.y=0;part.add(blade);
     const rib=new THREE.Mesh(new THREE.CylinderGeometry(.007,.013,.74,4),ink);rib.position.set(0,.32,.012);rib.rotation.z=.02;part.add(rib);
   }
 });
 if(index%3===0){
  const flowerHead=new THREE.Group();flowerHead.position.set(-.07,1.64,.02);
  for(let i=0;i<6;i++){const leaf=new THREE.Mesh(leafGeo,flower);leaf.scale.set(.31,.30,1);leaf.rotation.z=i*Math.PI/3;flowerHead.add(leaf)}
  const center=new THREE.Mesh(new THREE.SphereGeometry(.12,12,8),bright);flowerHead.add(center);root.add(flowerHead);
 }
 root.scale.setScalar(scale);
 root.userData.windPhase=index*1.73;
 root.userData.windAmplitude=.017+.012*(index%4);
 root.userData.originalQuaternion=root.quaternion.clone();
 root.userData.kind='paper-grove';
 return root;
}
export function animateGrove(node,time){
 if(!node?.userData?.kind)return;
 node.rotation.z=Math.sin(time*.85+node.userData.windPhase)*node.userData.windAmplitude;
}
