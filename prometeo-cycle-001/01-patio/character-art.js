
import * as THREE from "three";
// Extra procedural character language. No third-party geometry, textures or licenses.
const ink = "#332c32";
const mat = (c,metalness=0) => new THREE.MeshStandardMaterial({color:c,roughness:.91,metalness,flatShading:true});
const ball=(x,y,z)=>new THREE.SphereGeometry(1,9,7).scale(x,y,z);
function add(p,g,m,x,y,z,cast=true){
 const mesh=new THREE.Mesh(g,m);mesh.position.set(x,y,z);mesh.castShadow=cast;mesh.receiveShadow=true;p.add(mesh);return mesh;
}
const prism=(r1,r2,h,n=7)=>new THREE.CylinderGeometry(r1,r2,h,n);

// Painted fibers, tiny seam strokes and color irregularity make the silhouettes less plastic.
// Generated at runtime, from code. No photo or third-party texture is bundled.
function fabric(color,seed){
  const c=document.createElement("canvas");c.width=c.height=128;
  const ctx=c.getContext("2d");if(!ctx)return mat(color);
  ctx.fillStyle=color;ctx.fillRect(0,0,128,128);
  let n=seed.split("").reduce((a,ch)=>(Math.imul(a,33)+ch.charCodeAt(0))>>>0,2166136261);
  const rnd=()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296};
  for(let i=0;i<550;i++){
    const x=rnd()*128,y=rnd()*128;
    ctx.fillStyle=rnd()>.5?"rgba(255,244,214,.16)":"rgba(35,40,38,.11)";
    ctx.fillRect(x,y,1+rnd()*2,.5+rnd()*1.4);
  }
  ctx.strokeStyle="rgba(250,226,193,.23)";ctx.lineWidth=1;
  for(let y=8;y<128;y+=21){ctx.beginPath();for(let x=0;x<128;x+=12){ctx.moveTo(x+(y%13),y);ctx.lineTo(x+5+(y%13),y+1)}ctx.stroke();}
  const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;
  texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
  texture.anisotropy=2;
  return new THREE.MeshStandardMaterial({map:texture,roughness:.94,metalness:0,flatShading:true});
}

export function dressCharacter(avatar,role="traveler"){
 const body=avatar.body, dark=mat(ink),warm=mat("#efbb93"),ivory=mat("#f8ecd0");
 const colors={traveler:["#c75b54","#e4bd78","#537981"],mora:["#6e8b68","#e7b9ad","#d9bb73"],tilo:["#a87754","#f4dcb1","#5d837c"],luz:["#8b688f","#edb772","#dc6d63"]};
 const [a,b,c]=colors[role]||colors.traveler;
 const jacket=fabric(a,role+"-coat"),accent=fabric(b,role+"-detail"),secondary=mat(c);
 // Individual silhouette is essential: no interchangeable colored capsule NPCs.
 const ornament=new THREE.Group();body.add(ornament);
 const shoulders=add(ornament,prism(.68,.56,.55,9),jacket,0,1.45,-.075);shoulders.scale.z=.76;
 for(const s of [-1,1]){
   add(ornament,ball(.10,.17,.08),accent,s*.25,1.35,.44).rotation.z=s*.36;
   add(ornament,ball(.11,.07,.046),mat("#c97d74"),s*.34,2.01,.43);
   // Expressive brows above original face; skin stays visible.
   const brow=add(ornament,ball(.115,.03,.038),dark,s*.18,2.305,.462);
   brow.rotation.z=s*(role==="luz"?-.18:.10);
 }
 const eyeLids=[-1,1].map(s=>add(ornament,ball(.065,.047,.026),ivory,s*.176,2.155,.492,false));
 const mouth=add(ornament,ball(.073,.026,.018),mat("#894b4b"),0,1.929,.518,false);
 const swish=new THREE.Group();ornament.add(swish);
 let movingPart=null;
 if(role==="mora"){
   // Gardener: bell-shaped apron, scalloped collar, floral crown.
   movingPart=add(swish,prism(.41,.76,.72,8),mat("#728f75"),0,.97,-.03);
   add(ornament,prism(.30,.36,.53,8),ivory,0,1.15,.27).scale.z=.43;
   for(let i=0;i<5;i++){const k=i*2.399;add(ornament,new THREE.IcosahedronGeometry(.13,0),mat(i%2?"#e8bda9":"#f5dc91"),Math.sin(k)*.42,2.67,Math.cos(k)*.36);}
   add(ornament,ball(.13,.13,.07),secondary,.37,2.65,.29);
 } else if(role==="tilo"){
   avatar.setHat("none");
   // Barista: tall asymmetrical hat, apron, side-slung mug.
   add(ornament,prism(.43,.50,.18,10),dark,0,2.63,0);
   add(ornament,prism(.30,.41,.52,8),secondary,0,2.93,0).rotation.z=-.12;
   add(ornament,prism(.22,.46,.70,8),accent,0,1.17,.31).scale.z=.45;
   for(const s of [-1,1])add(ornament,ball(.13,.038,.055),dark,s*.10,1.96,.49).rotation.z=s*.25;
   movingPart=add(swish,ball(.36,.29,.14),secondary,-.47,1.12,-.23);
 } else if(role==="luz"){
   // Performer: big off-center swept hair and concert coat tails.
   add(ornament,new THREE.IcosahedronGeometry(.27,1),dark,.40,2.51,-.16);
   add(ornament,prism(.12,.31,.49,7),accent,.53,2.25,-.21).rotation.z=-.40;
   movingPart=add(swish,prism(.54,.30,.62,7),jacket,0,1.03,-.19);
   movingPart.scale.z=1.1;
   for(const s of [-1,1])add(ornament,new THREE.IcosahedronGeometry(.09,0),secondary,s*.51,2.0,.10);
   add(ornament,ball(.13,.07,.07),accent,-.52,1.51,.30);
 } else {
   // Traveller: cropped cape, a crossbody messenger bag, and a striped scarf.
   movingPart=add(swish,prism(.38,.75,.88,9),jacket,0,1.22,-.30);
   movingPart.scale.z=.48;
   add(ornament,ball(.43,.095,.38),accent,0,1.68,.01);
   const strap=add(ornament,prism(.04,.045,1.05,6),secondary,-.22,1.33,.40);strap.rotation.z=-.42;
   add(ornament,new THREE.BoxGeometry(.32,.29,.16),secondary,.42,1.12,.31);
   add(ornament,ball(.16,.08,.07),ivory,.42,1.27,.40);
 }
 let time={mora:1.9,tilo:3.8,luz:5.2,traveler:0}[role]||0;
 const tick=avatar.tick;
 avatar.tick=(dt,opts={})=>{
   tick(dt,opts);time+=Math.min(dt,.06);
   const pace=opts.moving?9.5:1.5;
   const sway=Math.sin(time*pace);
   // Cheap secondary motion for low-end mobile: no bones, GLBs, or texture downloads.
   swish.rotation.z=(opts.moving?.08:.025)*sway;
   swish.rotation.x=opts.moving?-.055*Math.cos(time*pace):0;
   ornament.rotation.y=opts.waving?.08*Math.sin(time*8):.025*Math.sin(time*.8);
   // Blinks are independent of idle/walk/dance cycles.
   const blink=Math.sin(time*.83+({mora:0,tilo:1.2,luz:2.4,traveler:3.6}[role]||0))>.991;
   for(const lid of eyeLids)lid.scale.y=blink?2.7:.06;
   mouth.scale.x=opts.dancing?1.45:opts.waving?1.22:1;
   mouth.scale.y=opts.dancing?2:1;
   body.rotation.y=opts.dancing?.08*Math.sin(time*8):opts.moving?.028*sway:Math.sin(time*.75)*.016;
   // Never modify root position, collision radius or camera follow.
 };
 avatar.artRole=role;
 return avatar;
}
