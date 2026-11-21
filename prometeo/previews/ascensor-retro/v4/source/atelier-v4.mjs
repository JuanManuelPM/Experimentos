// Original V4 design layer over the existing 3D building and spatial worlds.
// All art geometry is authored here; no downloaded model or image.
export function installV4Art(T,{cab,lobby,garden,library,abyss}){
 const mat=(color,metalness=0,roughness=.48,extra={})=>new T.MeshStandardMaterial({color,metalness,roughness,...extra});
 const brass=mat(0xcba96b,.8,.24),iron=mat(0x71543c,.72,.36);
 const porcelain=mat(0xf3ddb4,.22,.27,{emissive:0x91602d,emissiveIntensity:.35});
 const jade=mat(0x509973,.10,.72,{emissive:0x104734,emissiveIntensity:.35,side:T.DoubleSide});
 const cyan=mat(0x62bed1,.12,.35,{emissive:0x2c7d97,emissiveIntensity:.8,side:T.DoubleSide});
 const blue=mat(0x163a51,.16,.55,{emissive:0x0d425c,emissiveIntensity:.46,side:T.DoubleSide});
 const V=(p)=>new T.Vector3(...p);
 function add(parent,name,geo,material){const o=new T.Mesh(geo,material);o.name=name;parent.add(o);return o;}
 function draw(parent,name,pts,material,r=.014){
   const c=new T.CatmullRomCurve3(pts.map(V),false,'centripetal');
   return add(parent,name,new T.TubeGeometry(c,Math.max(12,pts.length*8),r,6,false),material);
 }
 function span(parent,name,a,b,material,r=.014){
   const v1=V(a),v2=V(b),delta=v2.clone().sub(v1);
   const o=add(parent,name,new T.CylinderGeometry(r,r,delta.length(),8),material);
   o.position.copy(v1).add(v2).multiplyScalar(.5);
   o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());
 }
 // Antique elevator: carved fan-shaped tracery rather than a flat recolor.
 for(const side of [-1,1])for(const z0 of [-.82,.78]){
   const x=side*1.52;
   for(let i=0;i<=12;i++){
     const a=Math.PI*i/12;
     draw(cab,'cabin.art.deco.fan.ray',[[x,1.66,z0],
       [x,1.75+Math.sin(a)*.18,z0+Math.cos(a)*.18],
       [x,1.75+Math.sin(a)*.43,z0+Math.cos(a)*.39]],i%3===0?brass:iron,.010);
   }
   draw(cab,'cabin.art.deco.fan.arch',Array.from({length:19},(_,i)=>{
     const a=Math.PI*i/18;return[x,1.75+Math.sin(a)*.43,z0+Math.cos(a)*.39];
   }),brass,.021);
   const gem=add(cab,'cabin.carved.medallion',new T.IcosahedronGeometry(.062,1),porcelain);
   gem.position.set(x,1.67,z0);
 }
 for(let i=0;i<24;i++){
   const a=i*Math.PI/12;
   const inset=add(cab,'cabin.floor.sunburst.inlay',new T.BoxGeometry(.018,.009,.38),i%2?brass:iron);
   inset.position.set(Math.sin(a)*.37,.048,Math.cos(a)*.37);inset.rotation.y=a;
 }
 for(const side of [-1,1])for(const z of [-1.08,1.08]){
   const lum=add(cab,'cabin.opaline.wall.sconce',new T.OctahedronGeometry(.075,1),porcelain);
   lum.position.set(side*1.44,2.55,z);
 }
 const cabinLight=new T.PointLight(0xf0ba82,1.35,5.8,2);cabinLight.position.set(0,2.5,0);cab.add(cabinLight);
 // Occupied lobby: slender iron scrollwork, architectural not wallpaper.
 for(const side of [-1,1])for(let i=0;i<8;i++){
   const z=2.7+i*1.13,x=side*3.62;
   span(lobby,'lobby.wrought.stile',[x,.77,z],[x,3.69,z],brass,.018);
   draw(lobby,'lobby.wrought.scroll',[[x,1.77,z-.30],[x,1.99,z+.12],
     [x,2.43,z+.30],[x,2.76,z-.06],[x,2.65,z-.24]],iron,.015);
 }
 // Greenhouse: organic hand-drawn leaves and hanging jewel seeds.
 const leafShape=new T.Shape();leafShape.moveTo(0,0);
 leafShape.bezierCurveTo(.17,.18,.22,.47,0,.90);
 leafShape.bezierCurveTo(-.18,.47,-.13,.15,0,0);
 const leafGeo=new T.ShapeGeometry(leafShape,10);
 const leaves=[],seeds=[];
 for(let row=0;row<9;row++){
   const z=-4.45-row*1.47;
   draw(garden,'conservatory.leaded.glass.arch',Array.from({length:25},(_,i)=>{
     const a=Math.PI*i/24;return[2.61*Math.cos(a),2.02+2.63*Math.sin(a),z-.32];
   }),brass,.011);
   for(const side of [-1,1]){
     draw(garden,'conservatory.hanging.vine',[[side*1.84,4.65,z],
       [side*1.71,3.89,z+.10],[side*1.70,3.16,z+.14],[side*1.77,2.65,z+.13]],jade,.015);
     for(let j=0;j<4;j++){
       const o=add(garden,'conservatory.sculpted.leaf',leafGeo,jade);
       o.position.set(side*(1.72+j*.07),3.47-j*.26,z+j*.12);
       o.rotation.set(.16,side*.55,(j%2?1:-1)*.63);
       o.scale.set(.56,.54,.56);leaves.push({o,p:row*.4+j,base:o.rotation.y});
     }
     const seed=add(garden,'conservatory.glass.seed',new T.OctahedronGeometry(.08,1),porcelain);
     seed.position.set(side*1.72,2.75,z+.15);seeds.push(seed);
   }
 }
 // Observatory of stars: a kinetic wall armillary and suspended gilded particles.
 const armillary=new T.Group();armillary.name='library.kinetic.armillary';library.add(armillary);
 armillary.position.set(0,3.5,-14.75);
 for(let j=0;j<5;j++){
   const o=add(armillary,'celestial.engraved.orbit',new T.TorusGeometry(.52+j*.17,.014,8,68),j%2?brass:porcelain);
   o.rotation.set(j*.43,j*.77,j*.2);
 }
 const stars=[];
 for(let i=0;i<160;i++){
   const a=i*2.39996,r=Math.sqrt((i+.5)/160)*2.3;
   stars.push(Math.sin(a)*r,1.75+(i%19)*.153,-5.5-(i%39)*.31);
 }
 const starGeo=new T.BufferGeometry();starGeo.setAttribute('position',new T.Float32BufferAttribute(stars,3));
 const starDust=new T.Points(starGeo,new T.PointsMaterial({color:0xf6dfb5,size:.027,transparent:true,opacity:.64,depthWrite:false}));
 starDust.name='library.floating.star.dust';library.add(starDust);
 const astralLight=new T.PointLight(0x9f83cb,2.2,7,2);astralLight.position.set(0,3.5,-11.3);library.add(astralLight);
 // Undersea world: distinct flying-ray silhouettes shaped with Bezier surfaces, not primitive creatures.
 const rays=[];
 for(let i=0;i<6;i++){
   const wing=new T.Shape();wing.moveTo(0,-.26);
   wing.bezierCurveTo(-.38,-.25,-.92,-.09,-1.34,.26);
   wing.bezierCurveTo(-1.04,-.27,-.47,-.48,0,-.44);
   wing.bezierCurveTo(.47,-.48,1.04,-.27,1.34,.26);
   wing.bezierCurveTo(.92,-.09,.38,-.25,0,-.26);
   const group=new T.Group();group.name='abyss.authored.flying.ray';
   add(group,'ray.wing.sculpture',new T.ShapeGeometry(wing,18),cyan);
   for(const s of [-1,1])draw(group,'ray.wing.filament',
     [[0,-.28,.018],[s*.42,-.26,.019],[s*1.13,.09,.019]],blue,.012);
   draw(group,'ray.long.tail',[[0,-.4,0],[0,-.75,.09],[.08,-1.1,.11]],cyan,.014);
   const side=i%2?-1:1,depth=Math.floor(i/2);
   group.rotation.y=side*Math.PI/2;
   group.position.set(side*(3.8+depth*.38),1.6+depth*.53,-6.3-depth*4.45);
   group.scale.setScalar(.78+depth*.13);abyss.add(group);
   rays.push({group,origin:group.position.clone(),phase:i*1.29});
 }
 const particles=[];
 for(let i=0;i<116;i++)particles.push((i%2?-1:1)*(3+(i%11)*.2),.35+(i%31)*.11,-4.9-(i%47)*.27);
 const particlesGeo=new T.BufferGeometry();
 particlesGeo.setAttribute('position',new T.Float32BufferAttribute(particles,3));
 const underwater=new T.Points(particlesGeo,new T.PointsMaterial({
   color:0x64dfeb,size:.052,transparent:true,opacity:.57,depthWrite:false}));
 underwater.name='abyss.suspended.bioluminescence';abyss.add(underwater);
 const chapter=document.createElement('div');chapter.id='chapter-v4';chapter.setAttribute('aria-live','polite');
 chapter.style.cssText='position:fixed;z-index:3;pointer-events:none;bottom:76px;left:max(16px,env(safe-area-inset-left));color:#efcd98;text-shadow:0 2px 15px #02040c;font:11px Georgia,serif;letter-spacing:.14em;max-width:65vw;opacity:0;transition:opacity .35s';
 document.body.append(chapter);
 let lastTitle='';
 function update(t){
   armillary.rotation.set(t*.017,t*.043,t*.008);starDust.rotation.y=t*.004;
   leaves.forEach(({o,p,base})=>o.rotation.y=base+Math.sin(t*.69+p)*.15);
   seeds.forEach((o,i)=>o.scale.setScalar(.88+Math.sin(t*1.1+i)*.13));
   rays.forEach(({group,origin,phase})=>{group.position.copy(origin);
     group.position.y+=Math.sin(t*.31+phase)*.23;group.position.z+=Math.cos(t*.15+phase)*.83;
     group.rotation.z=Math.sin(t*.24+phase)*.06;});
   underwater.rotation.y=Math.sin(t*.13)*.012;
   const floor=t<10?0:t<23?1:t<36?2:3;
   cabinLight.color.setHex([0xf0ba82,0xc7d9a0,0xbaa4eb,0x74c6dc][floor]);
   cabinLight.intensity=1.28+((t>=10&&t<14)||(t>=23&&t<27)||(t>=36&&t<40)?1:0);
   const n=t>=13&&t<18?0:t>=26&&t<31?1:t>=39&&t<45?2:-1;
   const label=['I   /   EL JARDÍN DE CRISTAL','II   /   EL ARCHIVO DE LAS ESTRELLAS','III   /   EL OCÉANO QUE RECUERDA'][n]||'';
   if(label!==lastTitle){chapter.textContent=label;lastTitle=label;}
   chapter.style.opacity=n<0?'0':String(Math.max(0,Math.min(1,t-[13,26,39][n],[18,31,45][n]-t)));
 }
 return {update,source:'Original V4 art module, V3 preserved'};
}
