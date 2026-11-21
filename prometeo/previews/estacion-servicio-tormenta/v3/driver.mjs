import * as T from 'three';
// Original raincoat character, authored cross-section meshes + two-link articulated pose.
// Forward +Z; meters, y-up. Source geometry, no dependency on prior humanoids.
const v=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
export function createDriver(){
 const root=new T.Group();
 const cloth=new T.MeshStandardMaterial({color:0xc5a35b,roughness:.72,metalness:.03});
 const seam=new T.MeshStandardMaterial({color:0x80673b,roughness:.86});
 const pants=new T.MeshStandardMaterial({color:0x35404a,roughness:.85});
 const skin=new T.MeshStandardMaterial({color:0xb98064,roughness:.78});
 const boot=new T.MeshStandardMaterial({color:0x1d2629,roughness:.53});
 const hair=new T.MeshStandardMaterial({color:0x2b2624,roughness:.9});
 const eye=new T.MeshStandardMaterial({color:0x252827,roughness:.45});
 const white=new T.MeshStandardMaterial({color:0xd7c5ad,roughness:.52});
 const add=(g,m,p=root)=>{const o=new T.Mesh(g,m);o.castShadow=true;o.receiveShadow=true;p.add(o);return o};
 // Elliptical sections [height, half width, half depth, offsetZ], triangulated + end caps.
 function loft(rows,m,p=root,n=32){
  const pos=[],uv=[],ix=[];
  for(let j=0;j<rows.length;j++){const [y,rx,rz,z0=0]=rows[j];for(let i=0;i<=n;i++){const a=i/n*Math.PI*2;pos.push(rx*Math.sin(a),y,z0+rz*Math.cos(a));uv.push(i/n,j/(rows.length-1))}}
  for(let j=0;j<rows.length-1;j++)for(let i=0;i<n;i++){const a=j*(n+1)+i,b=a+n+1;ix.push(a,a+1,b,b,a+1,b+1)}
  for(const j of [0,rows.length-1]){const k=pos.length/3;pos.push(0,rows[j][0],rows[j][3]||0);uv.push(.5,.5);for(let i=0;i<n;i++){const a=j*(n+1)+i;ix.push(k,j===0?a+1:a,j===0?a:a+1)}}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();return add(g,m,p);
 }
 function oval(p,m,x,y,z,a,b,c){const o=add(new T.SphereGeometry(1,20,12),m,p);o.scale.set(a,b,c);o.position.set(x,y,z);return o}
 function cord(points,r,m,p=root){return add(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(a=>v(...a))),24,r,6,false),m,p)}
 const torso=new T.Group();root.add(torso);
 loft([[.78,.23,.14],[.84,.24,.15],[.98,.215,.135],[1.16,.20,.135],[1.32,.255,.15],[1.42,.265,.125],[1.49,.13,.105]],cloth,torso);
 // shaped overlapping placket, zipper track, angled pockets, real raised seams
 cord([[0,.79,.144],[.008,1.01,.14],[.006,1.27,.157],[0,1.47,.108]],.009,seam,torso);
 for(const s of [-1,1]){
  cord([[s*.185,.99,.095],[s*.132,1.055,.128],[s*.08,1.06,.14]],.009,seam,torso);
  cord([[s*.22,.82,.07],[s*.20,1.14,.08],[s*.242,1.36,.06]],.006,seam,torso);
 }
 for(let i=0;i<5;i++)oval(torso,boot,.018,.91+i*.105,.150,.012,.012,.006);
 loft([[1.46,.09,.08],[1.54,.078,.075],[1.58,.07,.065]],skin,torso);
 const head=new T.Group();head.position.y=1.57;torso.add(head);
 // sculpted cranial/jaw profile, brow and cheeks integrated; forward face at +Z
 loft([[-.025,.035,.042,.015],[.015,.064,.067,.02],[.047,.091,.081,.014],[.083,.099,.086,.008],[.132,.101,.09,.002],[.183,.096,.09,-.007],[.225,.07,.07,-.015],[.244,.018,.023,-.018]],skin,head);
 oval(head,skin,0,.091,.087,.026,.042,.038);
 oval(head,skin,0,.070,.108,.024,.018,.023);
 for(const s of [-1,1]){
  oval(head,skin,s*.077,.073,.058,.023,.029,.026);
  oval(head,white,s*.043,.132,.083,.024,.012,.011);
  oval(head,eye,s*.043,.132,.093,.009,.009,.005);
  cord([[s*.019,.151,.086],[s*.045,.156,.088],[s*.072,.15,.075]],.006,hair,head);
  oval(head,skin,s*.101,.102,.002,.019,.038,.020);
 }
 cord([[-.032,.041,.083],[0,.037,.094],[.032,.042,.083]],.0045,hair,head);
 // Hair cap and an open hood shell, not a solid helmet: cut-out around face.
 loft([[.17,.098,.083,-.018],[.207,.10,.09,-.014],[.25,.073,.075,-.014],[.27,.015,.023,-.017]],hair,head);
 const hoodPos=[],hoodUv=[],hoodIx=[],rows=[[.01,.126,.105,-.014],[.075,.132,.12,-.012],[.17,.132,.125,-.005],[.25,.109,.104,-.012],[.294,.05,.061,-.02],[.30,.009,.013,-.02]];
 for(let j=0;j<rows.length;j++){const [y,rx,rz,z]=rows[j];for(let i=0;i<=40;i++){const a=.83+i/40*(Math.PI*2-1.66);hoodPos.push(Math.sin(a)*rx,y,z+Math.cos(a)*rz);hoodUv.push(i/40,j/5)}}
 for(let j=0;j<5;j++)for(let i=0;i<40;i++){const a=j*41+i,b=a+41;hoodIx.push(a,a+1,b,b,a+1,b+1)}
 const hg=new T.BufferGeometry();hg.setAttribute('position',new T.Float32BufferAttribute(hoodPos,3));hg.setAttribute('uv',new T.Float32BufferAttribute(hoodUv,2));hg.setIndex(hoodIx);hg.computeVertexNormals();const hoodMat=cloth.clone();hoodMat.side=T.DoubleSide;add(hg,hoodMat,head);
 for(const s of [-1,1])cord(rows.map(([y,rx,rz,z])=>[s*Math.sin(.83)*rx,y,z+Math.cos(.83)*rz]),.009,seam,head);
 // two-link limbs, lofted sleeves/legs with knee/elbow overlap for independent contact.
 const segment=(mat,profile)=>loft(profile,mat,root,20);
 const limb=(kind,s)=>{
  const arm=kind==='arm',m=arm?cloth:pants;
  const top=segment(m,arm?[[0,.065,.065],[.22,.077,.075],[.72,.059,.054],[1,.048,.048]]:[[0,.088,.09],[.25,.096,.089],[.72,.077,.072],[1,.061,.062]]);
  const low=segment(m,arm?[[0,.055,.052],[.35,.061,.059],[.82,.043,.043],[1,.041,.04]]:[[0,.065,.064],[.35,.073,.066],[.85,.055,.055],[1,.054,.052]]);
  const joint=oval(root,m,0,0,0,arm?.054:.067,arm?.054:.067,arm?.054:.067);
  const end=new T.Group();root.add(end);
  if(arm){
   loft([[0,.035,.028],[.035,.045,.026],[.09,.04,.024],[.114,.024,.02]],skin,end,16);
   for(let i=0;i<4;i++)oval(end,skin,-.028+i*.018,.10,0,.011,.034-i*.003,.018);
   oval(end,skin,s*.044,.049,.012,.017,.025,.018);
  }else{
   loft([[-.065,.064,.12,.065],[-.034,.073,.137,.067],[.025,.071,.135,.06],[.09,.06,.064,0],[.13,.057,.061,0]],boot,end,24);
   cord([[-.057,-.039,.16],[0,-.046,.197],[.057,-.039,.16]],.006,seam,end);
  }
  return {top,low,joint,end,arm,s};
 };
 const legs=[limb('leg',-1),limb('leg',1)],arms=[limb('arm',-1),limb('arm',1)];
 function axis(o,a,b){const d=b.clone().sub(a);o.position.copy(a);o.quaternion.setFromUnitVectors(v(0,1,0),d.clone().normalize());o.scale.y=d.length()}
 function solve(l,a,b,aLen,bLen,pole){
  let d=b.clone().sub(a),len=Math.max(.0001,d.length());d.normalize();const dist=Math.min(len,aLen+bLen-.001),x=(aLen*aLen-bLen*bLen+dist*dist)/(2*dist),h=Math.sqrt(Math.max(0,aLen*aLen-x*x));
  let p=pole.clone().addScaledVector(d,-pole.dot(d)).normalize();const mid=a.clone().addScaledVector(d,x).addScaledVector(p,h);const end=a.clone().addScaledVector(d,dist);
  axis(l.top,a,mid);axis(l.low,mid,end);l.joint.position.copy(mid);l.end.position.copy(end);
  if(l.arm)l.end.quaternion.setFromUnitVectors(v(0,1,0),end.clone().sub(mid).normalize());else l.end.rotation.set(0,0,0);
 }
 function pose({distance=0,speed=0,sit=0,reach=null,carry=false,look=0}={}){
  const gait=Math.min(1,speed/.65),cycle=distance/.79,bob=.018*gait*Math.cos(cycle*Math.PI*4),pelvis=.91+bob-.39*sit;
  torso.position.y=bob-.39*sit;torso.rotation.x=-.10*sit;head.rotation.y=look;
  for(const l of legs){
   const phase=(cycle+(l.s===1?.5:0))%1;
   // stance sweeps backward; swing travels forward with toe clearance
   const z=phase<.62?.245-.49*phase/.62:-.245+.49*(phase-.62)/.38;
   const lift=phase<.62?0:.105*Math.sin(Math.PI*(phase-.62)/.38);
   const target=v(l.s*.125,.075+lift*gait+.12*sit,z*gait+.34*sit);
   solve(l,v(l.s*.12,pelvis,0),target,.44,.43,v(0,0,1));
  }
  for(const l of arms){
   const swing=Math.sin(cycle*2*Math.PI+(l.s<0?Math.PI:0))*.22*gait;
   const a=v(l.s*.248,1.38+bob-.39*sit,0);
   const target=l.s===1&&reach?reach.clone():v(l.s*.29,carry&&l.s===1?.99: .86-.28*sit,carry&&l.s===1?.24:swing+.23*sit);
   solve(l,a,target,.306,.292,v(l.s*.8,-.1,-.4));
  }
 }
 pose();return {root,pose,handWorld:()=>arms[1].end.getWorldPosition(v())};
}
