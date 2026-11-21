import * as THREE from 'three';
// Abismo NEREIDA IV: geometría 3D original editable. Sin modelos externos.
export function createAbyssV4({scene,outside,interior}){
 const world=new THREE.Group();outside.add(world);
 const mat=(hex,r=.84,m=0)=>new THREE.MeshStandardMaterial({color:hex,roughness:r,metalness:m,side:THREE.DoubleSide});
 const shale=mat(0x19353e,.94),basalt=mat(0x314750,.98),coralMats=[mat(0x486f64),mat(0x88717c),mat(0x327381)];
 const flesh=mat(0x68515f,.79),under=mat(0xac9296,.65);
 const lightSkin=new THREE.MeshStandardMaterial({color:0x8bd7cb,emissive:0x317e87,emissiveIntensity:.87,roughness:.33});
 const filament=new THREE.MeshBasicMaterial({color:0xa4d9d2,transparent:true,opacity:.56,depthWrite:false});
 const mesh=(geo,material,parent=world)=>{const obj=new THREE.Mesh(geo,material);parent.add(obj);return obj;};
 const rnd=i=>{const n=Math.sin(i*76.731+12.79)*43758.53;return n-Math.floor(n);};
 const pipe=(points,thick,material,parent=world)=>{
  const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
  return mesh(new THREE.TubeGeometry(curve,22,thick,6,false),material,parent);
 };
 // Dientes de basalto irregular, volumétricos a distintas distancias.
 for(let k=0;k<28;k++){
  const x=-100+200*rnd(k*5+1),z=-22-103*rnd(k*3+9),height=2.6+11*rnd(k*7+3);
  const v=[],f=[],R=10,S=11;
  for(let j=0;j<=R;j++){
   const u=j/R,r=(1-u)*(.9+.7*rnd(k*13))+.18;
   for(let i=0;i<=S;i++){
    const a=i/S*Math.PI*2,b=.8+.31*rnd(k*211+j*19+i);
    v.push(x+Math.cos(a)*r*b+Math.sin(k)*u*u*.5,-15.6+height*u,z+Math.sin(a)*r*b);
   }
  }
  for(let j=0;j<R;j++)for(let i=0;i<S;i++){
   const p=j*(S+1)+i,q=p+S+1;f.push(p,q,p+1,p+1,q,q+1);
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setIndex(f);geo.computeVertexNormals();
  mesh(geo,k%3===0?basalt:shale);
 }
 // Corales: colonias ramificadas con materialidad diferenciada.
 for(let i=0;i<24;i++){
  const x=-57+114*rnd(i*17+5),z=-19-45*rnd(i*5+13),h=2+4.3*rnd(i*9+3);
  for(let b=0;b<4;b++){
   const a=i*.37+b*Math.PI/2,s=.8+.6*rnd(i+b*7);
   pipe([[x,-14.8,z],[x+Math.cos(a)*s*.7,-14.8+h*.49,z+Math.sin(a)*s*.65],
    [x+Math.cos(a)*s*1.9,-14.8+h*(.75+.22*rnd(i+b*3)),z+Math.sin(a)*s*1.9]],.035,coralMats[i%3]);
  }
 }
 // Gran calamar: manto lofted, aletas, ojos y diez brazos con pivotes.
 const squid=new THREE.Group();world.add(squid);const swim=new THREE.Group();squid.add(swim);
 const vertices=[],indices=[],R=27,S=20;
 for(let i=0;i<=R;i++){
  const u=i/R,rad=Math.pow(Math.max(.0001,Math.sin(u*Math.PI)),.56);
  for(let j=0;j<=S;j++){
   const a=j/S*Math.PI*2;
   vertices.push(-1.1+7*u,rad*1.2*Math.sin(a),rad*.95*Math.cos(a));
  }
 }
 for(let i=0;i<R;i++)for(let j=0;j<S;j++){
  const p=i*(S+1)+j,q=p+S+1;indices.push(p,q,p+1,p+1,q,q+1);
 }
 const mantle=new THREE.BufferGeometry();mantle.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));mantle.setIndex(indices);mantle.computeVertexNormals();
 mesh(mantle,flesh,swim);
 for(const side of [-1,1]){
  const fin=new THREE.BufferGeometry();
  fin.setAttribute('position',new THREE.Float32BufferAttribute([2.1,0,side*.67,4.1,2.45*side,0,5.7,0,side*.1],3));
  fin.computeVertexNormals();mesh(fin,flesh,swim);
 }
 const head=mesh(new THREE.IcosahedronGeometry(.85,2),flesh,swim);head.position.x=-1.5;head.scale.set(1.7,.95,.95);
 for(const s of [-1,1]){
  const eye=mesh(new THREE.SphereGeometry(.23,16,10),under,swim);eye.position.set(-2.15,.16,s*.62);
  const iris=mesh(new THREE.SphereGeometry(.10,12,8),lightSkin,swim);iris.position.set(-2.19,.16,s*.83);
 }
 const arms=[];
 for(let i=0;i<10;i++){
  const a=i/10*Math.PI*2,anchor=new THREE.Group();
  anchor.position.set(-2.45,.39*Math.sin(a),.4*Math.cos(a));swim.add(anchor);
  const length=i<2?10.7:5.2+2*rnd(i*17+3),p=[];
  for(let j=0;j<=9;j++){
   const u=j/9;
   p.push([-length*u,Math.sin(a)*(.35+1.1*u)+.2*Math.sin(u*7+i),Math.cos(a)*(.36+1.5*u)+.25*Math.sin(u*4+i)]);
  }
  pipe(p,i<2?.09:.063,i%4?flesh:under,anchor);arms.push(anchor);
 }
 squid.position.set(-45,-3,-31);
 // Campana de medusa moldeada, transparente, con seis tentáculos.
 const bellV=[],bellF=[],BR=10,BS=20;
 for(let j=0;j<=BR;j++){
  const u=j/BR,rad=.02+.87*Math.sqrt(u);
  for(let i=0;i<=BS;i++){
   const a=i/BS*Math.PI*2;
   bellV.push(rad*Math.cos(a),1.08-.78*u*u+.025*u*Math.cos(8*a),rad*Math.sin(a));
  }
 }
 for(let j=0;j<BR;j++)for(let i=0;i<BS;i++){
  const p=j*(BS+1)+i,q=p+BS+1;bellF.push(p,p+1,q,p+1,q+1,q);
 }
 const bell=new THREE.BufferGeometry();bell.setAttribute('position',new THREE.Float32BufferAttribute(bellV,3));bell.setIndex(bellF);bell.computeVertexNormals();
 const jellyMat=[
  new THREE.MeshPhysicalMaterial({color:0x88c5c2,emissive:0x328f91,emissiveIntensity:.5,transparent:true,opacity:.58,roughness:.29,side:THREE.DoubleSide,depthWrite:false}),
  new THREE.MeshPhysicalMaterial({color:0xbcaacb,emissive:0x6e5a91,emissiveIntensity:.5,transparent:true,opacity:.54,roughness:.29,side:THREE.DoubleSide,depthWrite:false})
 ];
 const jellies=[];
 for(let i=0;i<16;i++){
  const g=new THREE.Group();world.add(g);
  const shell=mesh(bell,jellyMat[i%2],g);
  const lip=mesh(new THREE.TorusGeometry(.87,.02,6,28),filament,g);lip.rotation.x=Math.PI/2;lip.position.y=.29;
  for(let k=0;k<6;k++){
   const a=k/6*Math.PI*2+i;
   pipe([[.51*Math.cos(a),.29,.51*Math.sin(a)],[.7*Math.cos(a),-1,.7*Math.sin(a)],
    [.62*Math.cos(a)+.11*Math.sin(i+k),-2.5,.59*Math.sin(a)]],.009,filament,g);
  }
  g.position.set(-55+110*rnd(i*13+5),-4+18*rnd(i*7+2),-16-54*rnd(i*19+9));
  g.scale.setScalar(.6+1.5*rnd(i*3+3));jellies.push({g,y:g.position.y,shell,i});
 }
 // Sutil brillo de refracción de los diez ventanales arquitectónicos V3.
 const glass=new THREE.MeshBasicMaterial({color:0xade9df,transparent:true,opacity:.085,depthWrite:false,side:THREE.DoubleSide});
 for(let i=0;i<10;i++){
  const p=mesh(new THREE.PlaneGeometry(.15,4.4),glass,interior);
  p.position.set(-24.3+i*5,3.5,-12.14);p.rotation.z=-.05;
 }
 // Sensor del observatorio + iluminación exterior tenue.
 const sensor=new THREE.Group();interior.add(sensor);sensor.position.set(-17,5.8,-11.6);
 mesh(new THREE.TorusGeometry(.31,.032,8,32),mineral,sensor);
 const led=mesh(new THREE.SphereGeometry(.12,12,8),lightSkin,sensor);
 const lamp=new THREE.PointLight(0x367e8b,.72,22,2);lamp.position.set(-15,0,-26);scene.add(lamp);
 // 140 partículas dinámicas de profundidad en un draw call.
 const count=140,raw=new Float32Array(count*3),orig=[];
 for(let i=0;i<count;i++){
  const x=-58+116*rnd(i*7+1),y=-13+28*rnd(i*9+8),z=-15-76*rnd(i*3+5);
  raw[3*i]=x;raw[3*i+1]=y;raw[3*i+2]=z;orig.push({x,y,z,rate:.3+.5*rnd(i+11)});
 }
 const particleGeo=new THREE.BufferGeometry();
 particleGeo.setAttribute('position',new THREE.BufferAttribute(raw,3));
 world.add(new THREE.Points(particleGeo,new THREE.PointsMaterial({color:0xa2e1d9,size:.13,transparent:true,opacity:.38,depthWrite:false})));
 return {
  stats:{giantSquid:1,jellyfish:16,hydrothermalSpires:28,coralColonies:24,glazedWindows:10},
  update(t,dt){
   squid.position.x=-49+(t*.73%105);squid.position.y=-3+Math.sin(t*.2)*1.4;
   squid.position.z=-31+Math.sin(t*.1)*3;swim.rotation.y=Math.PI+.08*Math.sin(t*.17);
   arms.forEach((a,i)=>{a.rotation.z=.12*Math.sin(t*.42+i*1.7);a.rotation.y=.20*Math.cos(t*.56+i*1.4)});
   jellies.forEach(j=>{j.g.position.y=j.y+.68*Math.sin(t*.47+j.i*2.8);j.g.rotation.z=.10*Math.sin(t*.31+j.i);j.shell.scale.y=.92+.08*Math.sin(t*1.6+j.i)});
   sensor.rotation.y=.4*Math.sin(t*.25);
   led.material.emissiveIntensity=1+.26*Math.sin(t*1.3);
   glass.opacity=.073+.023*Math.sin(t*.15);
   const a=particleGeo.attributes.position;
   for(let i=0;i<count;i++){const o=orig[i];a.setY(i,-13+((o.y+13+t*o.rate)%38));a.setX(i,o.x+.23*Math.sin(t*.4+i));}
   a.needsUpdate=true;
  }
 };
}
