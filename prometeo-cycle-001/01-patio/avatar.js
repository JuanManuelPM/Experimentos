import * as THREE from "three";
const mat=(color,roughness=.88)=>new THREE.MeshStandardMaterial({color,roughness,metalness:0});
const flesh=mat("#e3a77b"), dark=mat("#443b3b"),cream=mat("#fff0d0");
const palette=["#5c8b8a","#d47b64","#a77cbd","#d5ab61","#6e86b5"];
function piece(parent,geo,m,x,y,z,cast=true){const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=cast;o.receiveShadow=true;parent.add(o);return o}
const orb=(a,b,c,w=12,h=9)=>new THREE.SphereGeometry(1,w,h).scale(a,b,c);
export function createAvatar({color=0,hat="beret",npc=false,skin="#e4aa82",hair="#554234"}={}){
 const root=new THREE.Group(),body=new THREE.Group();root.add(body);
 const skinMat=mat(skin),hairMat=mat(hair),shirt=mat(palette[color]??palette[0]),pants=mat(npc?"#d2a679":"#675f66"),shoe=mat("#51493f");
 const torso=piece(body,new THREE.CapsuleGeometry(.48,.48,5,9),shirt,0,1.22,0);torso.scale.set(1,.93,.76);
 piece(body,orb(.48,.13,.37),cream,0,1.66,0);
 const head=piece(body,orb(.50,.52,.47,20,14),skinMat,0,2.12,.02);
 piece(body,orb(.51,.18,.47,18,10),hairMat,0,2.52,-.01);
 // short locks around the forehead and cheek
 for(let i=-1;i<=1;i++)piece(body,orb(.18,.16,.14),hairMat,i*.27,2.45,.35);
 for(const sign of [-1,1]){
  piece(body,orb(.067,.082,.041),dark,sign*.175,2.15,.442);
  piece(body,orb(.021,.028,.014),cream,sign*.18-.019,2.17,.48);
  piece(body,orb(.12,.065,.08),skinMat,sign*.48,2.0,.05);
  piece(body,orb(.11,.09,.10),skinMat,sign*.48,1.97,.24);
 }
 piece(body,orb(.095,.055,.045),mat("#9d564d"),0,1.95,.47);
 piece(body,orb(.10,.07,.1),skinMat,0,2.04,.51);
 const arms=[],legs=[];
 for(const s of [-1,1]){
  const arm=new THREE.Group();arm.position.set(s*.53,1.6,0);body.add(arm);
  piece(arm,new THREE.CapsuleGeometry(.17,.39,4,8),shirt,s*.08,-.35,0);
  piece(arm,orb(.17,.17,.16),skinMat,s*.10,-.75,.04);arms.push(arm);
  const leg=new THREE.Group();leg.position.set(s*.25,.86,0);body.add(leg);
  piece(leg,new THREE.CapsuleGeometry(.205,.32,4,9),pants,0,-.33,0);
  piece(leg,orb(.23,.16,.34),shoe,0,-.72,.13);legs.push(leg);
 }
 const hatGroup=new THREE.Group();body.add(hatGroup);
 function setHat(next){hatGroup.clear();if(next==="none")return;
  if(next==="beret"){piece(hatGroup,orb(.51,.16,.49,20,12),mat("#d0a56a"),0,2.65,.04);piece(hatGroup,orb(.38,.17,.39),mat("#d0a56a"),.10,2.73,.03)}
  if(next==="cap"){piece(hatGroup,orb(.51,.22,.48),mat("#5b7569"),0,2.67,-.05);piece(hatGroup,orb(.43,.06,.23),mat("#425a52"),0,2.57,.40)}
  if(next==="crown"){for(let i=0;i<5;i++){const a=i*Math.PI*2/5;piece(hatGroup,new THREE.ConeGeometry(.15,.37,5),mat("#f1c859"),Math.sin(a)*.36,2.81,Math.cos(a)*.34)}piece(hatGroup,new THREE.CylinderGeometry(.44,.44,.16,10),mat("#e2ac50"),0,2.63,0)}
 }
 setHat(hat);
 const cupGroup=new THREE.Group();cupGroup.position.set(.71,.75,.27);body.add(cupGroup);
 const cup=piece(cupGroup,new THREE.CylinderGeometry(.13,.10,.22,12),mat("#fff4d9"),0,0,0);
 piece(cupGroup,new THREE.TorusGeometry(.095,.028,5,12,Math.PI*1.5),mat("#fff4d9"),.135,.015,.015).rotation.y=Math.PI/2;
 cupGroup.visible=false;
 let walkClock=0;
 function tick(dt,{moving=false,dancing=false,waving=false,sitting=false,holding=false}={}){
  walkClock+=dt*(moving?9:2);
  const swing=moving?Math.sin(walkClock)*.58:Math.sin(walkClock)*.035;
  if(dancing){body.position.y=Math.abs(Math.sin(walkClock*1.2))*.22;body.rotation.z=Math.sin(walkClock*.65)*.12}
  else{body.position.y=moving?Math.abs(Math.sin(walkClock))*.045:Math.sin(walkClock)*.018;body.rotation.z*=.85}
  legs[0].rotation.x=sitting?-1.33:dancing?Math.sin(walkClock*.8)*.42:swing;
  legs[1].rotation.x=sitting?-1.33:dancing?-Math.sin(walkClock*.8)*.42:-swing;
  arms[0].rotation.x=dancing?Math.sin(walkClock*.83)*.6-.6: waving?-.2:sitting?-.3:-swing*.7;
  arms[1].rotation.x=dancing?-Math.sin(walkClock*.83)*.6-.7:waving?-2.35:sitting?-.3:swing*.7;
  arms[1].rotation.z=waving?Math.sin(walkClock*2.0)*.24-.2:0;
  cupGroup.visible=holding;
  if(holding)arms[1].rotation.x=-.95;
  body.position.y+=sitting?-.41:0;
 }
 function recolor(next){shirt.color.set(palette[next]??palette[0])}
 return {root,body,head,arms,legs,recolor,setHat,tick,cupGroup};
}
export {palette};

