// ADRIAN · original stylized Art Deco traveler. Editable continuous loft surfaces.
// Anatomical forward +Z; scene route is -Z. No imported avatar, external asset or hidden mannequin.
export function gaitAt(distance,weight=1){
 const cycle=1.12, stance=.62;
 return [0,.5].map(offset=>{const f=((distance/cycle+offset)%1+1)%1;
 const z=f<stance?(.3472-f*cycle):(-.3472+.6944*((f-stance)/(1-stance)));
 const u=Math.max(0,(f-stance)/(1-stance));
 return {z:z*weight,lift:(f<stance?0:Math.sin(Math.PI*u)*.115)*weight};});
}
export function createTraveler(T){
 const root=new T.Group();root.name='Adrian.original.traveler';
 const mat=(color,roughness=.78,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
 const skin=mat(0xb98668,.82),shadow=mat(0x875c49),hair=mat(0x30251f),coat=mat(0x283d41),lapel=mat(0x17282c),pants=mat(0x343237),shoe=mat(0x36251c,.43),shirt=mat(0xe5d8bf),tie=mat(0x823d31),brass=mat(0xb79a62,.36,.6),eyes=mat(0xe7dfcb),iris=mat(0x27352e);
 const mesh=(p,name,g,m)=>{const o=new T.Mesh(g,m);o.name=name;o.castShadow=true;o.receiveShadow=true;p.add(o);return o};
 const ell=(p,n,m,x,y,z,rx,ry,rz)=>{const o=mesh(p,n,new T.SphereGeometry(1,20,14),m);o.position.set(x,y,z);o.scale.set(rx,ry,rz);return o};
 // Each loft uses elliptical cross sections [height, width radius, depth radius, front shift].
 function loft(p,n,rings,m,face=false,segments=40){
  const verts=[],uv=[],idx=[];
  for(let j=0;j<rings.length;j++){const [y,rx,rz,shift]=rings[j];
   for(let i=0;i<=segments;i++){const a=i/segments*Math.PI*2,x=Math.sin(a)*rx,c=Math.cos(a);let z=c*rz+shift;
    if(face&&c>0){const eye=Math.exp(-(((y-1.659)/.022)**2))*Math.exp(-(((Math.abs(x)-.039)/.026)**2));z-=eye*.010*c;
     z+=Math.exp(-(((y-1.62)/.043)**2))*Math.exp(-((x/.020)**2))*.021*c;}
    verts.push(x,y,z);uv.push(i/segments,j/(rings.length-1));}}
  for(let j=0;j<rings.length-1;j++)for(let i=0;i<segments;i++){const a=j*(segments+1)+i,b=a+segments+1;idx.push(a,a+1,b,b,a+1,b+1)}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(verts,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return mesh(p,n,g,m);
 }
 const body=new T.Group();root.add(body);
 loft(body,'tailored.coat.torso',[[.87,.005,.005,0],[.88,.154,.096,-.016],[.98,.171,.106,-.01],[1.13,.147,.093,0],[1.29,.18,.109,0],[1.405,.216,.104,-.005],[1.46,.166,.079,0],[1.49,.075,.062,0],[1.495,.005,.005,0]],coat);
 loft(body,'neck',[[1.43,.060,.055,0],[1.53,.055,.053,0],[1.58,.065,.060,0]],skin);
 // Shirt and tailored lapels are thin garment meshes, not painted cubes.
 function panel(n,points,m){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(points.flat(),3));g.setIndex(Array.from({length:points.length-2},(_,i)=>[0,i+1,i+2]).flat());g.computeVertexNormals();const o=mesh(body,n,g,m);o.material.side=T.DoubleSide;return o}
 panel('shirt.front',[[-.073,1.466,.075],[.073,1.466,.075],[.067,1.33,.111],[0,1.15,.105],[-.067,1.33,.111]],shirt);
 for(const s of [-1,1]){panel('folded.lapel.'+s,[[s*.071,1.465,.08],[s*.144,1.403,.105],[s*.077,1.368,.125],[s*.11,1.31,.12],[s*.015,1.15,.113]],lapel);}
 panel('silk.tie',[[-.026,1.452,.088],[.026,1.452,.088],[.020,1.395,.119],[.031,1.235,.12],[0,1.2,.12],[-.031,1.235,.12],[-.020,1.395,.119]],tie);
 for(let i=0;i<3;i++)ell(body,'coat.button',brass,.016,1.15-i*.077,.111,.012,.012,.005);
 const head=new T.Group();body.add(head);
 loft(head,'sculpted.head',[[1.505,.008,.014,.016],[1.523,.036,.052,.015],[1.55,.057,.066,.01],[1.58,.074,.076,.002],[1.61,.084,.082,-.003],[1.64,.085,.087,-.008],[1.665,.082,.087,-.009],[1.70,.084,.084,-.01],[1.73,.077,.077,-.015],[1.765,.057,.062,-.016],[1.784,.002,.002,-.012]],skin,true,48);
 for(const s of [-1,1]){
  ell(head,'ear.'+s,skin,s*.084,1.626,-.013,.019,.035,.017);
  ell(head,'ear.concha.'+s,shadow,s*.094,1.628,-.003,.007,.020,.009);
  ell(head,'eye.'+s,eyes,s*.035,1.653,.074,.023,.008,.009);
  ell(head,'iris.'+s,iris,s*.035,1.653,.082,.008,.008,.0035);
  const brow=ell(head,'eyebrow.'+s,hair,s*.036,1.672,.076,.025,.004,.004);brow.rotation.z=s*-.13;
 }
 ell(head,'nose.tip',skin,0,1.620,.103,.018,.013,.019);
 ell(head,'lower.lip',shadow,0,1.578,.078,.025,.0045,.006);
 // Swept wave hair cap: silhouette mesh + combed ridges. Open bottom extends around back.
 const hv=[],hi=[],N=48,R=16;
 for(let j=0;j<=R;j++)for(let i=0;i<=N;i++){const a=i/N*Math.PI*2;const cap=1.25+.43*(1-Math.cos(a))/2+.10*Math.sin(2*a);const t=j/R*cap;
  const wave=.0035*Math.sin(9*a+2*t)+.0025*Math.sin(15*a-3*t);hv.push((.090+wave)*Math.sin(t)*Math.sin(a)+.009*Math.sin(t),1.686+(.119+wave)*Math.cos(t),-.017+(.091+wave)*Math.sin(t)*Math.cos(a));}
 for(let j=0;j<R;j++)for(let i=0;i<N;i++){let a=j*(N+1)+i,b=a+N+1;hi.push(a,b,a+1,a+1,b,b+1)}
 const hg=new T.BufferGeometry();hg.setAttribute('position',new T.Float32BufferAttribute(hv,3));hg.setIndex(hi);hg.computeVertexNormals();const hm=hair.clone();hm.side=T.DoubleSide;mesh(head,'swept.hair.cap',hg,hm);
 // Deforming continuous sleeve/trouser surfaces, cross-sections following joints.
 function tube(n,m,radii){
  const len=radii.length,N=20,verts=new Float32Array(len*(N+1)*3),inds=[];
  for(let j=0;j<len-1;j++)for(let i=0;i<N;i++){let a=j*(N+1)+i,b=a+N+1;inds.push(a,a+1,b,b,a+1,b+1)}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(verts,3).setUsage(T.DynamicDrawUsage));g.setIndex(inds);const o=mesh(root,n,g,m);o.frustumCulled=false;
  function set(points){for(let j=0;j<len;j++){const p=points[j],q=points[Math.min(j+1,len-1)].clone().sub(points[Math.max(j-1,0)]).normalize();const a=new T.Vector3(1,0,0).addScaledVector(q,-q.x).normalize(),b=new T.Vector3().crossVectors(q,a);
    for(let i=0;i<=N;i++){let t=i/N*Math.PI*2,v=p.clone().addScaledVector(a,Math.cos(t)*radii[j][0]).addScaledVector(b,Math.sin(t)*radii[j][1]);v.toArray(verts,(j*(N+1)+i)*3);}}
   g.attributes.position.needsUpdate=true;g.computeVertexNormals();}
  return {set};
 }
 const V=(x,y,z)=>new T.Vector3(x,y,z),mix=(a,b,t)=>a.clone().lerp(b,t);
 const limbs=[-1,1].map(s=>{
  const leg=tube('continuous.trouser.'+s,pants,[[.083,.087],[.083,.086],[.071,.073],[.056,.061],[.058,.064],[.047,.051],[.043,.047]]);
  const sleeve=tube('continuous.sleeve.'+s,coat,[[.071,.071],[.070,.068],[.060,.061],[.048,.05],[.049,.052],[.042,.044],[.036,.038]]);
  const foot=ell(root,'leather.oxford.'+s,shoe,0,.055,.045,.063,.050,.126);
  const hand=new T.Group();root.add(hand);
  ell(hand,'palm',skin,0,-.038,0,.040,.052,.022);
  for(let j=0;j<4;j++)ell(hand,'finger.'+j,skin,(j-1.5)*.018,-.082+(j===0?.010:0),.003,.009,.029-j*.002,.010);
  ell(hand,'thumb',skin,-s*.043,-.029,.016,.014,.033,.014);
  return {s,leg,sleeve,foot,hand};
 });
 function pose(t,distance,moving,look=0){
  const w=moving?Math.min(1,distance/.22,Math.max(0,(3.76-distance)/.22)):0;
  const gait=gaitAt(distance,w),bob=.022*Math.sin(distance/1.12*Math.PI*4)*w;body.position.y=bob;
  body.rotation.y=.026*Math.sin(distance/1.12*Math.PI*2)*w;head.rotation.y=look*.22;head.rotation.z=.025*Math.sin(t*.9);
  limbs.forEach((l,i)=>{const s=l.s,step=gait[i],hip=V(s*.086,.91+bob,0),ankle=V(s*.088,.105+step.lift,step.z);
   const v=ankle.clone().sub(hip),len=Math.min(.83,v.length()),mid=hip.clone().addScaledVector(v,.5),bend=Math.sqrt(Math.max(.0001,.425*.425-len*len/4));
   const f=V(0,0,1).addScaledVector(v,-v.z/v.lengthSq()).normalize();const knee=mid.addScaledVector(f,bend);
   l.leg.set([hip,mix(hip,knee,.19),mix(hip,knee,.65),knee,mix(knee,ankle,.27),mix(knee,ankle,.72),ankle]);
   l.foot.position.set(s*.088,.055+step.lift,step.z+.057);l.foot.rotation.x=-.12*step.lift/.115;
   const swing=-step.z*.63,shoulder=V(s*.186,1.405+bob,0), elbow=V(s*.235,1.17+bob,swing*.53-.018),wrist=V(s*.235,.965+bob,swing+.02);
   l.sleeve.set([shoulder,mix(shoulder,elbow,.20),mix(shoulder,elbow,.65),elbow,mix(elbow,wrist,.28),mix(elbow,wrist,.73),wrist]);
   l.hand.position.copy(wrist);l.hand.rotation.x=swing*.8;
  });
 }
 pose(0,0,false);return {root,pose,front:[0,0,1],author:'PROMETEO original geometry',variant:'continuous loft + articulated deforming tubes'};
}
