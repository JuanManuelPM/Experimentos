import * as THREE from 'three';
// Original editable Nereida scientist, Dr. Vera: profile-sculpted geometry, UVs,
// hierarchical skin and analytic foot placement. No external avatar or texture.
const mat=(color,roughness=.78,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
const skin=mat(0xb98568,.76),coat=mat(0xb7c8be,.88),seam=mat(0x46656a),shirt=mat(0x29484d),pants=mat(0x263b44),boot=mat(0x10252c,.58),hair=mat(0x343132),iris=mat(0x384c43),white=mat(0xc9c9b9),rim=mat(0x382e2b,.36,.4);
const TAU=Math.PI*2;
export function profileData(rows,n=32,sculpt=null){
 const p=[],uv=[],idx=[];
 for(let i=0;i<rows.length;i++){
  const [y,rx,rz,cz=0,cx=0]=rows[i];
  for(let j=0;j<=n;j++){const t=j/n*TAU, x=cx+Math.sin(t)*rx,z=cz+Math.cos(t)*rz;
   const d=sculpt?sculpt(x,y,z,t):[x,y,z];p.push(...d);uv.push(j/n,i/(rows.length-1));
  }
 }
 for(let i=0;i<rows.length-1;i++)for(let j=0;j<n;j++){const a=i*(n+1)+j,b=a+n+1; if(rows[1][0]>rows[0][0])idx.push(a,a+1,b,a+1,b+1,b);else idx.push(a,b,a+1,b,b+1,a+1);}
 return {p,uv,idx};
}
function geo(rows,n,sculpt){const {p,uv,idx}=profileData(rows,n,sculpt),g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;}
function shape(parent,rows,material,n=32,sculpt){const m=new THREE.Mesh(geo(rows,n,sculpt),material);parent.add(m);return m;}
function group(parent,x=0,y=0,z=0){const o=new THREE.Group();o.position.set(x,y,z);parent.add(o);return o;}
function oval(parent,x,y,z,rx,ry,rz,material){const o=new THREE.Mesh(new THREE.SphereGeometry(1,16,12),material);o.scale.set(rx,ry,rz);o.position.set(x,y,z);parent.add(o);return o;}
function stitch(parent,pts,r,material){const m=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p))),16,r,6,false),material);parent.add(m);return m;}
function patch(parent,pts,material){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pts.flat(),3));g.computeVertexNormals();const m=new THREE.Mesh(g,material);m.material.side=THREE.DoubleSide;parent.add(m);return m;}
function limb(parent,x,y,z,a,b,rows,material){
 const anchor=group(parent,x,y,z),g=geo(rows,24),p=g.attributes.position,ind=[],w=[];
 for(let i=0;i<p.count;i++){let d=-p.getY(i),mix=THREE.MathUtils.smoothstep(d,a-.075,a+.075);ind.push(0,1,0,0);w.push(1-mix,mix,0,0);}
 g.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(ind,4));g.setAttribute('skinWeight',new THREE.Float32BufferAttribute(w,4));
 const upper=new THREE.Bone(),lower=new THREE.Bone(),end=new THREE.Bone();lower.position.y=-a;end.position.y=-b;upper.add(lower);lower.add(end);
 const m=new THREE.SkinnedMesh(g,material);m.add(upper);anchor.add(m);m.bind(new THREE.Skeleton([upper,lower,end]));m.frustumCulled=false;
 return {anchor,upper,lower,end,a,b};
}
export function solveLeg(a,b,down,z){
 const r=Math.max(.01,Math.min(a+b-.0001,Math.hypot(down,z)));
 const angle=Math.atan2(z,down),bend=Math.acos(Math.max(-1,Math.min(1,(a*a+r*r-b*b)/(2*a*r))));
 const knee=Math.acos(Math.max(-1,Math.min(1,(a*a+b*b-r*r)/(2*a*b))));
 return {upper:-(angle+bend),lower:Math.PI-knee};
}
const faceRows=[[0,.004,.005,-.01],[.018,.048,.048,-.006],[.045,.070,.067,-.002],[.08,.083,.078,0],[.112,.086,.081,-.003],[.145,.084,.085,-.006],[.178,.078,.078,-.009],[.205,.061,.06,-.013],[.221,.025,.029,-.015],[.225,.001,.001,-.015]];
function facialSculpt(x,y,z,t){
 const front=Math.max(0,Math.cos(t))**7,ga=(x,c,s)=>Math.exp(-(((x-c)/s)**2));
 // nasal bridge, cheekbones, eyelid sockets, jaw plane; continuous mesh.
 const bridge=.031*ga(x,0,.017)*ga(y,.105,.025)+.017*ga(x,0,.016)*ga(y,.128,.035);
 const sockets=-.009*(ga(x,.034,.019)+ga(x,-.034,.019))*ga(y,.135,.015);
 const cheek=.010*(ga(x,.049,.023)+ga(x,-.049,.023))*ga(y,.091,.027);
 const lips=.009*ga(x,0,.026)*ga(y,.058,.012);
 return [x,y,z+front*(bridge+sockets+cheek+lips)];
}
export function createScientist(parent){
 const root=group(parent),body=group(root,0,.94,0);
 shape(body,[[-.12,.15,.096],[0,.178,.11],[.14,.158,.102],[.26,.167,.102],[.37,.205,.104],[.45,.225,.097],[.49,.172,.08],[.51,.067,.051],[.52,.002,.002]],coat,40);
 // Open lapel, dark turtleneck, fitted seam and removable badge.
 shape(body,[[.30,.073,.09,.025],[.46,.089,.081,.019],[.53,.060,.055,0],[.55,.051,.052,0]],shirt,32);
 for(const s of [-1,1]){
  patch(body,[[s*.055,.51,.062],[s*.135,.40,.085],[s*.057,.25,.107],[s*.055,.51,.062],[s*.057,.25,.107],[s*.026,.42,.112]],seam);
  stitch(body,[[s*.15,.40,.073],[s*.157,.18,.09],[s*.155,.02,.105]],.0022,seam);
 }
 stitch(body,[[0,.01,.113],[0,.10,.116],[0,.25,.115]],.002,seam);
 const badge=patch(body,[[.09,.32,.106],[.15,.32,.106],[.15,.27,.112],[.09,.32,.106],[.15,.27,.112],[.09,.27,.112]],shirt);
 stitch(body,[[.101,.302,.115],[.139,.302,.115]],.002,white);
 // Coat skirt has volume and a central split; opposite panels animate with gait.
 const skirts=[];
 for(const s of [-1,1]){const o=group(body,s*.103,-.03,0);shape(o,[[-.29,.105,.105],[-.22,.111,.117],[-.09,.095,.114],[0,.083,.105]],coat,24);skirts.push(o);}
 const head=group(body,0,.56,0);
 shape(head,[[-.07,.052,.047],[-.006,.047,.045],[.022,.055,.05]],skin,24);
 shape(head,faceRows,skin,64,facialSculpt);
 // Hair cap, asymmetric swept crown, with the face left uncovered.
 shape(head,[[.161,.081,.082,-.014],[.190,.086,.085,-.012],[.218,.067,.072,-.012],[.239,.021,.034,-.019],[.244,.001,.001,-.02]],hair,40,(x,y,z,t)=>[x+.006*Math.sin(y*45),y+.008*Math.sin(t*2),z]);
 for(const s of [-1,1]){
  oval(head,s*.080,.100,-.006,.013,.026,.013,skin);
  oval(head,s*.032,.135,.073,.016,.009,.007,white);
  oval(head,s*.032,.135,.079,.006,.007,.003,iris);
  stitch(head,[[s*.012,.150,.077],[s*.033,.155,.083],[s*.052,.15,.066]],.003,hair);
  const lens=group(head,s*.032,.134,.086);const q=new THREE.Mesh(new THREE.TorusGeometry(.023,.0023,6,28),rim);q.scale.y=.67;lens.add(q);
  stitch(head,[[s*.054,.136,.086],[s*.080,.137,.050],[s*.087,.13,-.008]],.002,rim);
 }
 stitch(head,[[-.009,.137,.091],[0,.142,.094],[.009,.137,.091]],.002,rim);
 stitch(head,[[-.018,.057,.077],[0,.055,.084],[.019,.057,.077]],.0019,mat(0x774c42));
 const arms=[],legs=[];
 for(const s of [-1,1]){
  const a=limb(body,s*.208,.435,0,.26,.245,[[.015,.062,.062],[-.02,.081,.075],[-.075,.069,.066],[-.18,.058,.055],[-.26,.054,.05],[-.32,.057,.052],[-.45,.046,.043],[-.505,.043,.041]],coat);
  a.anchor.rotation.z=s*.08;shape(a.end,[[.014,.043,.039],[-.022,.035,.026],[-.049,.033,.026],[-.082,.029,.022],[-.105,.013,.013],[-.111,.001,.001]],skin,24);
  for(let i=0;i<3;i++)stitch(a.end,[[(i-1)*.013,-.057,.024],[(i-1)*.012,-.085,.016]],.001,mat(0x9d705b));
  oval(a.end,-s*.026,-.040,.008,.013,.028,.015,skin);arms.push(a);
  const l=limb(root,s*.092,.91,0,.43,.43,[[.02,.087,.084],[-.06,.087,.08],[-.21,.071,.068],[-.41,.057,.059],[-.46,.052,.052],[-.58,.061,.056],[-.76,.046,.043],[-.86,.044,.041]],pants);
  shape(l.end,[[-.055,.055,.104,.046],[-.038,.058,.109,.049],[.018,.055,.102,.045],[.049,.047,.065,.014],[.065,.043,.047]],boot,28);
  legs.push(l);
 }
 let travel=0;
 function update(dt,speed){
  const walk=Math.min(1,Math.max(0,speed/.45));travel+=Math.max(0,speed)*dt;
  const cycle=travel/.857142857,phase=cycle*TAU;const hip=.89+.012*Math.cos(phase*2)*walk;
  body.position.y=hip+.028;body.rotation.z=.025*Math.sin(phase)*walk;head.rotation.y=.11*Math.sin(cycle*.75)+.18*Math.sin(travel*.045);head.rotation.x=.035;
  for(let i=0;i<2;i++){
   const f=(cycle+i*.5)%1,stance=.63;
   let z,lift;
   if(f<stance){z=.27-.54*f/stance;lift=0;}else{const a=(f-stance)/(1-stance),smooth=a*a*(3-2*a);z=-.27+.54*smooth;lift=.12*Math.sin(Math.PI*a);}
   z*=walk;lift*=walk;
   const l=legs[i];l.anchor.position.y=hip;const ik=solveLeg(l.a,l.b,hip-.056-lift,z);l.upper.rotation.x=ik.upper;l.lower.rotation.x=ik.lower;l.end.rotation.x=-ik.upper-ik.lower;
   arms[i].upper.rotation.x=.31*Math.sin(phase+i*Math.PI)*walk;arms[i].lower.rotation.x=-.17-.14*Math.max(0,Math.sin(phase+i*Math.PI))*walk;
   skirts[i].rotation.x=legs[i].upper.rotation.x*.32;
  }
 }
 update(0,0);return {root,update,frontLocal:{x:0,z:1},identity:'VERA_NEREIDA_ORIGINAL_V4'};
}
