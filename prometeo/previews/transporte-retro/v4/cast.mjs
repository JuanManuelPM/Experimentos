import * as T from 'three';
import {clamp,legTarget,solveLeg} from './motion.mjs';
// Authored radial cross-section meshes with continuous topology and UV seams.
// Ring: y, half-width, half-depth, z centre. +Z is front; no reused humanoid assets.
const N=32;
function meshLoft(rings,material,sculpt=null,n=N){
 const pos=[],uv=[],idx=[];
 rings.forEach((r,j)=>{for(let i=0;i<=n;i++){let a=i/n*Math.PI*2,s=Math.sin(a),c=Math.cos(a),v=[r[1]*s,r[0],r[3]||0];v[2]+=r[2]*c;if(sculpt)sculpt(v,c,s,r,j);pos.push(...v);uv.push(i/n,j/(rings.length-1));}});
 for(let j=0;j<rings.length-1;j++)for(let i=0;i<n;i++){let a=j*(n+1)+i,b=a+n+1;idx.push(a,a+1,b,b,a+1,b+1);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
 return new T.Mesh(g,material);
}
function material(color,roughness=.85){return new T.MeshStandardMaterial({color,roughness,side:T.DoubleSide});}
const dark=material(0x24242a),white=material(0xd5c9ad),mouth=material(0x703e37),leather=material(0x302a29,.53);
function group(parent,x=0,y=0,z=0){const g=new T.Group();parent.add(g);g.position.set(x,y,z);return g}
function put(parent,m,x=0,y=0,z=0){parent.add(m);m.position.set(x,y,z);return m}
function line(parent,points,r,m){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));return put(parent,new T.Mesh(new T.TubeGeometry(curve,12,r,5,false),m));}
function patch(parent,w,h,c,x,y,z){return put(parent,new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({color:c,side:T.DoubleSide})),x,y,z)}
const identities={
 ines:[.96,.91,.97,.85,0,0],raul:[1.07,1.12,.93,1.22,1,1],flora:[.89,.89,1.08,.72,2,2],dario:[1.10,1.04,.98,1.04,3,3],elena:[.94,1.12,.90,1.16,4,1],tomas:[1.09,.92,1.06,.89,1,0],mila:[.91,.86,1.03,.79,2,2],oscar:[.98,1.18,.86,1.27,4,3],luz:[1.02,.93,.97,.83,0,2],conductor:[1.07,1.15,.98,1.16,5,1],viajero:[1.04,.98,1.04,1.00,1,1]};
function face(parent,skin,hair,id,params){
 const [height,width,depth,jaw,style]=params;const skull=group(parent,0,.195,0);
 const feature=(v,c,s,r)=>{const y=v[1],front=Math.pow(Math.max(c,0),12);v[2]+=front*(.044*Math.exp(-(((y-.171)/.035)**2))+.020*Math.exp(-(((y-.205)/.048)**2))-.011*Math.exp(-(((y-.245)/.022)**2)));};
 // Mandible, mouth, cheek, orbital and cranial cross sections are independently profiled.
 const rr=[[0,.001,.001,.012],[.015,.064*jaw,.061,.018],[.042,.102*jaw,.088,.012],[.084,.127*width,.104,.003],[.118,.137*width,.115,0],[.15,.142*width,.116*depth,0],[.18,.140*width,.115*depth,0],[.206,.139*width,.115*depth,0],[.233,.137*width,.111*depth,0],[.26,.137*width,.110,-.004],[.30,.132*width,.103,-.009],[.332,.108*width,.084,-.012],[.359,.060,.052,-.015],[.37,.001,.001,-.015]];
 put(skull,meshLoft(rr,skin,feature));
 for(const s of [-1,1]){
  const eye=group(skull,s*.056*width,.231,.105*depth);eye.rotation.y=s*.25;
  const e=meshLoft([[-.009,.001,.001,0],[-.005,.025,.012,0],[.003,.028,.015,0],[.011,.001,.001,0]],white,null,16);put(eye,e);
  put(eye,meshLoft([[-.007,.001,.001,0],[-.004,.008,.005,0],[.005,.008,.005,0],[.009,.001,.001,0]],dark,null,12),0,0,.013);
  line(eye,[[-.028,0,.006],[-.012,.011,.012],[.011,.011,.012],[.028,0,.006]],.004,skin);
  line(eye,[[-.029,.030,.005],[0,.037+((jaw-1)*.02),.014],[.028,.031,.006]],.006,hair);
  const ear=meshLoft([[.00,.002,.002,0],[.021,.025,.019,0],[.055,.025,.024,0],[.075,.012,.014,0],[.08,.001,.001,0]],skin,null,16);put(skull,ear,s*.137*width,.135,-.008);
 }
 line(skull,[[-.037,.104,.112],[-.018,.100,.122],[0,.101,.127],[.018,.100,.122],[.037,.105,.111]],.0045,mouth);
 // Hairline follows scalp; different front length, part, back curtain and crown topology.
 const hairRings=[[.235-(style===2?.115:style===3?.065:0),.140*width,.112,-.010],[.278,.144*width,.116,-.008],[.32,.138*width,.109,-.014],[.352,.104*width,.087,-.014],[.379+(style===1?.025:0),.054,.045,-.012],[.391+(style===1?.025:0),.001,.001,-.012]];
 put(skull,meshLoft(hairRings,hair,(v,c,s,r,j)=>{if(j===0)v[1]+=.080*Math.max(c,0)+.012*Math.sin(s*7+style);if(style===1)v[1]+=.017*Math.max(0,-s)*Math.max(c,0);if(style===4)v[1]-=.014*Math.max(c,0);}));
 if(style===5||style===4){
 const cap=meshLoft([[.293,.148,.119,.007],[.315,.155,.128,.008],[.35,.142,.112,.0],[.365,.123,.096,0]],material(style===5?0x293c49:0x585247));put(skull,cap);
 const brim=meshLoft([[.295,.145,.154,.057],[.304,.15,.158,.057],[.311,.145,.149,.057]],leather);put(skull,brim);
 }
 skull.scale.y=height;return skull;
}
function limb(parent,rings,mat,x=0,y=0,z=0){return put(parent,meshLoft(rings,mat),x,y,z)}
export function makeActor(parent,profile){
 const id=profile.id,par=identities[id]||identities.viajero,[h,w,d,j,style,cut]=par;
 const root=group(parent),pelvis=group(root,0,.88,0),chest=group(pelvis),neck=group(chest,0,.43*h,0);
 const skin=material(profile.skin),coat=material(profile.coat),hair=material(profile.hair),pants=material(id==='conductor'?0x25323b:0x3a3a40),trim=material(0xc9b793);
 limb(pelvis,[[-.13,.12,.10,0],[-.09,.19*w,.13,0],[0,.205*w,.145,0],[.11,.17*w,.12,0],[.15,.001,.001,0]],pants);
 limb(chest,[[-.08,.186*w,.13,0],[.02,.20*w,.145,0],[.12,.17*w,.13,0],[.24,.20*w,.142,0],[.34,.235*w,.14,0],[.40*h,.205*w,.115,0],[.46*h,.09,.075,0],[.48*h,.001,.001,0]],coat);
 limb(neck,[[0,.052,.055,0],[.10,.052,.057,0],[.20,.061,.060,0]],skin);
 const head=face(neck,skin,hair,id,par);
 // Open jacket seam, lapels and structural coat folds, not palette-only variation.
 line(chest,[[0,.04,.145],[.008,.23,.145],[0,.39,.12]],.008,trim);
 for(const s of [-1,1]){
 const collar=group(chest,s*.072,.39,.105);collar.rotation.z=s*.36;patch(collar,.071,.155,cut===2?0xb8a490:0x493f38,0,-.045,.016);
 if(cut===1||cut===3){line(chest,[[s*.153,.14,.135],[s*.126,.12,.148],[s*.095,.12,.148]],.007,trim);}
 }
 const arms=[],legs=[];
 for(const s of [-1,1]){
 const shoulder=group(chest,s*.207*w,.351*h,0);
 limb(shoulder,[[-.30,.045,.052,0],[-.25,.063,.062,0],[-.10,.079,.074,0],[-.015,.095,.085,0],[.05,.06,.063,0]],coat);
 const elbow=group(shoulder,0,-.275,0);limb(elbow,[[-.265,.044,.042,0],[-.18,.054,.052,0],[-.025,.069,.065,0],[.025,.06,.06,0]],coat);
 limb(elbow,[[-.35,.014,.014,0],[-.33,.039,.031,.005],[-.27,.039,.033,0],[-.245,.028,.026,0]],skin);
 line(elbow,[[s*.027,-.28,.015],[s*.045,-.31,.022],[s*.028,-.334,.023]],.012,skin);
 arms.push({s,shoulder,elbow});
 const hip=group(pelvis,s*.103*w,0,0);
 limb(hip,[[-.45,.060,.061,0],[-.39,.072,.077,0],[-.20,.09,.088,0],[-.02,.103,.104,0],[.05,.09,.09,0]],pants);
 const knee=group(hip,0,-.43,0);limb(knee,[[-.43,.046,.049,0],[-.33,.055,.061,0],[-.15,.064,.068,0],[-.025,.069,.071,0],[.045,.057,.060,0]],pants);
 const foot=group(knee,0,-.43,0);limb(foot,[[-.065,.068,.122,.058],[-.047,.077,.143,.066],[.005,.071,.136,.063],[.042,.06,.092,.035],[.065,.044,.055,0]],leather);
 legs.push({s,hip,knee,foot});
 }
 const accessory=group(chest,0,.05,.24);
 if(['book','newspaper','paper'].includes(profile.accessory)){const book=new T.Mesh(new T.BoxGeometry(profile.accessory==='book'?.24:.32,.033,.23),material(profile.accessory==='book'?0x8d4b35:0xd6c3a0));put(accessory,book,0,.035,.05);book.rotation.x=.18;}
 if(['bag','satchel'].includes(profile.accessory)){limb(chest,[[.02,.001,.001,0],[.04,.13,.072,0],[.23,.15,.077,0],[.26,.12,.065,0]],leather,.22,-.15,.10);line(chest,[[-.18,.37,.08],[0,.20,.155],[.23,.02,.07]],.018,leather);}
 function pose({t=0,sit=0,walk=0,distance=0,greet=0,drive=0}={}){
  pelvis.position.y=.86-.19*sit+.012*walk*Math.cos(distance/.64*Math.PI*4);
  chest.rotation.x=.055*walk+.07*sit;chest.rotation.z=.022*Math.sin(t*1.6+style);
  head.rotation.y=.13*Math.sin(t*.47+style)+greet*.45;head.rotation.x=.035*Math.sin(t*1.1+style);
  for(const a of arms){let swing=Math.sin(distance/.64*Math.PI*2+a.s*Math.PI/2);
   a.shoulder.rotation.z=-a.s*(.07+.035*sit);a.shoulder.rotation.x=-.20*sit+.35*walk*swing-(a.s===1?.8*greet:0)-.65*drive;
   a.elbow.rotation.x=-.15-.82*sit-.64*drive-.5*greet; }
  for(const l of legs){const tar=legTarget(distance,l.s,walk,sit),sol=solveLeg(pelvis.position.y,tar.y,tar.z);
   l.hip.rotation.x=sol.hip;l.knee.rotation.x=sol.knee;l.foot.rotation.x=-sol.hip-sol.knee;
  }
 }
 return {id,root,pose,head,params:par};
}
export function createSeated(parent,profile,seat){const a=makeActor(parent,profile);a.root.position.set(seat.x,.055,seat.z);a.root.rotation.y=seat.yaw;a.pose({sit:1});return a}
