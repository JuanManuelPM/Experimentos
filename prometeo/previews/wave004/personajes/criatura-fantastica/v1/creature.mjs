// LÚMEA · criatura fantástica original. Fuente geométrica y animación editables.
// Requiere three.js >= 0.186, importado con el mismo importmap del visor.
import * as THREE from 'three';

const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const palette = {
  body: '#38294d', shell: '#5b4a74', pearl: '#d2d4e8',
  ink: '#171729', glimmer: '#9cefe6', gold: '#e9be87',
  wine: '#9b608f', pale: '#eadfff'
};

function colorGeometry(g, colors) {
  g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  g.computeVertexNormals();
  return g;
}
function xyzColor(out, color) {
  out.push(color.r, color.g, color.b);
}
function catmull(a,b,c,d,t) {
  return .5 * (2*b + (-a+c)*t + (2*a-5*b+4*c-d)*t*t + (-a+3*b-3*c+d)*t*t*t);
}
function profileAt(p,u) {
  const q=u*(p.length-1), i=Math.min(p.length-2,Math.floor(q)), t=q-i;
  return [0,1,2].map(k=>catmull(p[Math.max(0,i-1)][k],p[i][k],p[i+1][k],p[Math.min(p.length-1,i+2)][k],t));
}
// Malla cerrada propia: sección radial modulada, sin ensamblar cápsulas ni cuerpos estándar.
function sculpt(profile, n=88, rows=66, hueA='#392845', hueB='#b09cc0', warp=.04) {
  const v=[], indices=[], col=[];
  const c0=new THREE.Color(hueA),c1=new THREE.Color(hueB);
  for(let r=0;r<=rows;r++) {
    const t=r/rows, p=profileAt(profile,t);
    const tint=c0.clone().lerp(c1, .23+.62*Math.pow(t,.8));
    for(let k=0;k<=n;k++) {
      const a=TAU*k/n;
      const edge=1+warp*Math.cos(6*a+3.5*t)+.027*Math.sin(3*a-5*t);
      const rx=Math.max(.003,p[1])*edge, rz=Math.max(.003,p[2])*(1+warp*.5*Math.sin(5*a+t));
      v.push(rx*Math.cos(a),p[0],rz*Math.sin(a)+.055*Math.cos(2*a)*Math.sin(Math.PI*t));
      xyzColor(col,tint.clone().multiplyScalar(.86+.18*Math.max(0,Math.sin(a))));
    }
  }
  for(let r=0;r<rows;r++)for(let k=0;k<n;k++) {
    const a=r*(n+1)+k,b=a+n+1;
    indices.push(a,b,a+1,b,b+1,a+1);
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));
  g.setIndex(indices);
  return colorGeometry(g,col);
}
function makeTube(points,radius,material,segments=48) {
  const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
  return new THREE.Mesh(new THREE.TubeGeometry(curve,segments,radius,7,false),material);
}
function membrane(side) {
  const root=new THREE.Group();
  root.position.set(side*.57,.48,-.05);
  const verts=[],colors=[],ids=[],ns=40,nv=15;
  const inner=new THREE.Color('#4d416b'),outer=new THREE.Color('#b2d8dc');
  for(let i=0;i<=ns;i++) {
    const u=i/ns, span=Math.sin(Math.PI*u);
    for(let j=0;j<=nv;j++) {
      const v=j/nv*2-1;
      verts.push(
        side*(1.84*u + .11*span*Math.sin(2*Math.PI*u+v)),
        .19+.78*span+.33*v*span+.31*u,
        -.24-.31*u+.19*span*Math.sin(v*2.2+u*4)
      );
      xyzColor(colors,inner.clone().lerp(outer,Math.pow(u,.8)*.77+Math.max(0,v)*.13));
    }
  }
  for(let i=0;i<ns;i++)for(let j=0;j<nv;j++){
    const a=i*(nv+1)+j,b=a+nv+1;ids.push(a,b,a+1,b,b+1,a+1);
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));
  g.setIndex(ids);colorGeometry(g,colors);
  const mesh=new THREE.Mesh(g,new THREE.MeshPhysicalMaterial({
    side:THREE.DoubleSide,vertexColors:true,transparent:true,opacity:.86,
    roughness:.36,metalness:.08,clearcoat:.55,clearcoatRoughness:.25,
    emissive:new THREE.Color('#238e94'),emissiveIntensity:.13,depthWrite:false
  }));
  root.add(mesh);
  const vein=new THREE.MeshBasicMaterial({color:'#94d0cf',transparent:true,opacity:.47});
  for(const branch of [-.65,.15,.85]){
    const pts=[];
    for(let i=0;i<=14;i++){
      const u=i/14,span=Math.sin(Math.PI*u), v=branch;
      pts.push([side*(1.84*u+.11*span*Math.sin(2*Math.PI*u+v)),.19+.78*span+.33*v*span+.31*u,-.225-.31*u+.19*span*Math.sin(v*2.2+u*4)+.015]);
    }
    root.add(makeTube(pts,.009,vein,36));
  }
  return root;
}
function eye(x,y,z,size,irisColor) {
  const root=new THREE.Group();
  root.position.set(x,y,z);
  const rim=new THREE.Mesh(new THREE.SphereGeometry(size*1.28,32,18),
    new THREE.MeshPhysicalMaterial({color:palette.ink,roughness:.68}));
  rim.scale.set(1,.92,.34);root.add(rim);
  const lid=new THREE.Group();root.add(lid);
  const white=new THREE.Mesh(new THREE.SphereGeometry(size,32,20),
    new THREE.MeshPhysicalMaterial({color:'#e4e8ec',roughness:.22,clearcoat:.7}));
  white.position.z=size*.32;white.scale.z=.53;lid.add(white);
  const iris=new THREE.Mesh(new THREE.SphereGeometry(size*.56,28,20),
    new THREE.MeshPhysicalMaterial({color:irisColor,roughness:.18,metalness:.08,clearcoat:1}));
  iris.position.z=size*.84;iris.scale.z=.34;lid.add(iris);
  const pupil=new THREE.Mesh(new THREE.SphereGeometry(size*.32,22,14),
    new THREE.MeshBasicMaterial({color:'#121328'}));
  pupil.position.z=size*.99;pupil.scale.z=.32;lid.add(pupil);
  const flare=new THREE.Mesh(new THREE.SphereGeometry(size*.145,12,8),
    new THREE.MeshBasicMaterial({color:'#ffffff'}));
  flare.position.set(-size*.19,size*.2,size*1.12);
  flare.scale.z=.21;lid.add(flare);
  return {root,lid,iris,pupil,size};
}
function ribbon(index) {
  const count=33, across=6;
  const positions=new Float32Array((count+1)*(across+1)*3);
  const color=[],idx=[];
  const c0=new THREE.Color(index%2?'#6b4f83':'#688da4'),
        c1=new THREE.Color(index%2?'#b3b8e0':'#b0f0da');
  for(let i=0;i<=count;i++)for(let k=0;k<=across;k++) {
    xyzColor(color,c0.clone().lerp(c1,Math.pow(i/count,.76)));
  }
  for(let i=0;i<count;i++)for(let k=0;k<across;k++){
    const a=i*(across+1)+k,b=a+across+1;idx.push(a,b,a+1,b,b+1,a+1);
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(positions,3));
  g.setIndex(idx);colorGeometry(g,color);
  const mesh=new THREE.Mesh(g,new THREE.MeshPhysicalMaterial({
    side:THREE.DoubleSide,vertexColors:true,roughness:.4,metalness:.08,
    transparent:true,opacity:.93,depthWrite:false
  }));
  const baseX=(index-2.5)*.25;
  const baseY=-.95+(index%2)*.07;
  const baseZ=index%2?-.21:.39;
  const bias=index<3?-1:1;
  function animate(t, energy, cautious) {
    const p=g.attributes.position;
    for(let i=0;i<=count;i++) {
      const u=i/count;
      const wave=Math.sin(t*(1.12+energy*.2)+index*1.67+u*5.6);
      const bend=Math.sin(t*.8+index+u*3);
      const x=baseX+bias*(.07+.22*u)+u*u*(.33*wave)+.12*bend*u;
      const y=baseY-(1.62-(cautious*.52))*u+.13*Math.sin(u*Math.PI*1.8+t*.5+index)*u;
      const z=baseZ+.35*u*Math.sin(t*.77+index*2+u*3.1);
      const width=(.13+.055*(index%3))*Math.pow(1-u,.8)+.004;
      for(let k=0;k<=across;k++){
        const v=k/across*2-1;
        const o=(i*(across+1)+k)*3;
        p.array[o]=x+width*v*Math.cos(u*4+index*.45);
        p.array[o+1]=y+.055*Math.sin(v*Math.PI)*u;
        p.array[o+2]=z+width*v*Math.sin(u*4+index*.45);
      }
    }
    p.needsUpdate=true;g.computeVertexNormals();
  }
  return {mesh,animate};
}
export function createCreature() {
  const root=new THREE.Group();
  root.name='LUMEA_original_creature';
  const core=new THREE.Group();root.add(core);
  const skin=new THREE.MeshPhysicalMaterial({
    vertexColors:true,side:THREE.DoubleSide,roughness:.48,
    metalness:.13,clearcoat:.44,clearcoatRoughness:.29
  });
  const bodyProfile=[
    [-1.48,.015,.015],[-1.35,.22,.18],[-1.05,.42,.34],
    [-.58,.69,.47],[.02,.92,.57],[.52,.88,.52],
    [.97,.61,.35],[1.25,.19,.17],[1.32,.012,.014]
  ];
  const body=new THREE.Mesh(sculpt(bodyProfile,88,70,'#34273f','#7f6b94',.068),skin);
  body.name='Organic_shell_body';core.add(body);

  // Placa de nácar frontal, una segunda superficie tallada independiente.
  const maskProfile=[
    [-.83,.025,.025],[-.64,.35,.16],[-.25,.63,.25],
    [.16,.64,.27],[.58,.51,.23],[.89,.22,.13],[.98,.01,.01]
  ];
  const mask=new THREE.Mesh(sculpt(maskProfile,76,54,'#9783a8','#e1c9c5',.02),
    new THREE.MeshPhysicalMaterial({vertexColors:true,roughness:.33,metalness:.09,
      clearcoat:.72,clearcoatRoughness:.2,side:THREE.DoubleSide}));
  mask.position.z=.43;mask.scale.set(.88,1,.55);mask.name='Pearl_face_plate';core.add(mask);

  const accent=new THREE.MeshBasicMaterial({color:palette.glimmer,transparent:true,opacity:.74});
  for(let side of [-1,1]){
    core.add(makeTube([[side*.54,-.55,.42],[side*.77,-.19,.39],
      [side*.86,.37,.28],[side*.53,.95,.22]],.013,accent,52));
  }
  const filaments=[];
  for(let j=0;j<5;j++){
    const x=(j-2)*.22, h=1.53+(.22-Math.abs(j-2)*.08);
    const material=new THREE.MeshPhysicalMaterial({
      color:j%2?'#8ec7cc':'#c8a5ba',roughness:.29,
      metalness:.21,clearcoat:.6});
    const stalk=makeTube([[x*.5,1.14,-.02],[x*.8,1.37,-.06],
      [x+Math.sin(j*2.1)*.17,h,-.13]],.035*(1-Math.abs(j-2)*.13),material,25);
    stalk.name='Crown_filament_'+j;core.add(stalk);filaments.push(stalk);
  }
  const left=membrane(-1),right=membrane(1);
  core.add(left,right);left.name='Left_sail';right.name='Right_sail';
  const eyes=[
    eye(-.31,.24,.77,.19,'#e5bb85'),
    eye(.31,.24,.77,.19,'#a3e7cb'),
    eye(0,.66,.76,.145,'#d7addb')
  ];
  eyes.forEach((o,i)=>{o.root.name='Expressive_eye_'+(i+1);core.add(o.root)});
  const brows=[];
  const browMat=new THREE.MeshBasicMaterial({color:'#453454'});
  for(const side of [-1,1]){
    const brow=makeTube([[side*.18,.51,.81],[side*.3,.56,.83],[side*.48,.5,.75]],
      .021,browMat,20);core.add(brow);brows.push(brow);
  }
  const mouthMat=new THREE.MeshBasicMaterial({color:'#59334b'});
  const mouthQuiet=makeTube([[-.13,-.19,.744],[0,-.214,.756],[.13,-.19,.744]],.014,mouthMat,22);
  const mouthHappy=makeTube([[-.18,-.19,.744],[0,-.3,.784],[.18,-.19,.744]],.016,mouthMat,24);
  core.add(mouthQuiet,mouthHappy);
  const tendrils=Array.from({length:6},(_,i)=>ribbon(i));
  tendrils.forEach((r,i)=>{r.mesh.name='Flexible_appendage_'+(i+1);core.add(r.mesh)});
  const biolum=new THREE.MeshBasicMaterial({color:'#b4ffef',transparent:true,opacity:.85});
  for(let i=0;i<10;i++){
    const a=i/9*Math.PI*.95+.1,x=Math.cos(a)*.63,y=-.55+Math.sin(a)*1.06;
    const dot=new THREE.Mesh(new THREE.IcosahedronGeometry(.023+(i%3)*.006,1),biolum);
    dot.position.set(x,y,.71-(Math.abs(x)*.25));dot.name='Light_mark_'+i;core.add(dot);
  }
  const ready={root,core,eyes,wings:[left,right],tendrils,
    metadata:{name:'LÚMEA',species:'criatura ficticia original',sails:2,appendages:6,eyes:3,
      model:'authored deformable BufferGeometry',animation:'procedural source animation'}};
  function update(time,mood='curiosa',gaze={x:0,y:0}) {
    const happy=mood==='alegre'?1:0, cautious=mood==='cautelosa'?1:0;
    const speed=1+happy*.85-cautious*.45;
    core.position.y=.08+Math.sin(time*1.34*speed)*(.065+happy*.045);
    core.rotation.z=Math.sin(time*.46)*.025;
    core.rotation.y=Math.sin(time*.37)*.075;
    core.scale.setScalar(1+Math.sin(time*1.5)*.012);
    left.rotation.z=.10+Math.sin(time*1.24*speed)*.11+cautious*.3-happy*.11;
    right.rotation.z=-.10-Math.sin(time*1.24*speed+.45)*.11-cautious*.3+happy*.11;
    left.rotation.y=.08+Math.sin(time*.81)*.09;
    right.rotation.y=-.08-Math.sin(time*.81+.4)*.09;
    const blinkTime=time%5.6;
    const blink=blinkTime<.13?Math.max(.07,Math.abs(blinkTime-.065)/.065):1;
    eyes.forEach((e,i)=>{
      const b=clamp(blink*(cautious?.76:1)*(happy?1.1:1),.1,1.06);
      e.lid.scale.y=b;
      e.iris.position.x=clamp(gaze.x,-1,1)*e.size*.23;
      e.iris.position.y=clamp(gaze.y,-1,1)*e.size*.2;
      e.pupil.position.x=e.iris.position.x;
      e.pupil.position.y=e.iris.position.y;
      e.iris.scale.x=happy?1.14:cautious?.83:1;
      e.pupil.scale.x=cautious?.76:1;
      e.root.rotation.z=(i===2?-1:1)*Math.sin(time*.55)*.025;
    });
    mouthQuiet.visible=!happy;mouthHappy.visible=!!happy;
    brows.forEach((b,i)=>{b.position.y=cautious?.042:happy?.025:0;b.rotation.z=cautious?(i===0?-.1:.1):0});
    tendrils.forEach(t=>t.animate(time,speed,cautious));
  }
  ready.update=update;
  update(0,'curiosa');
  return ready;
}
