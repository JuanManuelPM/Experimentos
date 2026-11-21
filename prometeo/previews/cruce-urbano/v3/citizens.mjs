import * as T from 'three';
export const CAST=[{"id":"Mara","role":"editora","height":1.68,"build":0.91,"head":0.95,"leg":0.95,"skin":"#93634d","hair":"#3c2925","top":"#ae583c","pants":"#243649","style":"bob","garment":"coat"},{"id":"Dante","role":"mensajero","height":1.84,"build":1.12,"head":1.03,"leg":1.06,"skin":"#b47e58","hair":"#201c20","top":"#527d85","pants":"#322f33","style":"crop","garment":"jacket"},{"id":"Sol","role":"estudiante","height":1.59,"build":0.87,"head":1.04,"leg":0.91,"skin":"#d4a184","hair":"#683329","top":"#d7a64a","pants":"#50636d","style":"long","garment":"sweater"},{"id":"Nico","role":"mecánico","height":1.76,"build":1.19,"head":0.97,"leg":1.02,"skin":"#a46f50","hair":"#2b2523","top":"#677256","pants":"#353c3b","style":"cap","garment":"work"},{"id":"Luz","role":"diseñadora","height":1.73,"build":0.9,"head":0.92,"leg":1.04,"skin":"#b98878","hair":"#262029","top":"#a05d78","pants":"#4b3a4d","style":"bun","garment":"coat"},{"id":"Ivo","role":"profesor","height":1.87,"build":1.02,"head":1.07,"leg":1.07,"skin":"#d2a58b","hair":"#77716a","top":"#687e93","pants":"#605044","style":"part","garment":"jacket"},{"id":"Uma","role":"comerciante","height":1.65,"build":1.11,"head":1.05,"leg":0.98,"skin":"#784f3c","hair":"#252321","top":"#a8733b","pants":"#3a4240","style":"curly","garment":"sweater"},{"id":"Leo","role":"fotógrafo","height":1.77,"build":0.94,"head":0.91,"leg":1.03,"skin":"#c19375","hair":"#3b302b","top":"#87905f","pants":"#3c4653","style":"part","garment":"coat"},{"id":"Ana","role":"vecina","height":1.57,"build":1.13,"head":1.06,"leg":0.94,"skin":"#c38c74","hair":"#9d8271","top":"#c08075","pants":"#5b5552","style":"bob","garment":"jacket"},{"id":"Tomi","role":"músico","height":1.8,"build":0.91,"head":1.1,"leg":1.05,"skin":"#e0ad8e","hair":"#4b342d","top":"#9690b6","pants":"#384555","style":"long","garment":"sweater"},{"id":"Río","role":"repartidor","height":1.69,"build":1.04,"head":0.96,"leg":0.96,"skin":"#8d5946","hair":"#2f2826","top":"#d1a253","pants":"#37494b","style":"crop","garment":"work"},{"id":"Eva","role":"bibliotecaria","height":1.72,"build":0.96,"head":1.02,"leg":1.02,"skin":"#d7ad91","hair":"#513731","top":"#66918e","pants":"#4b4250","style":"bun","garment":"coat"}];
export function loftData(rings,n=24,relief=0){
 const p=[],uv=[],indices=[];
 for(let j=0;j<rings.length;j++){const [y,rx,rz,cz=0]=rings[j];for(let i=0;i<=n;i++){const a=2*Math.PI*i/n,front=Math.max(0,Math.cos(a));p.push(Math.sin(a)*rx,y,cz+Math.cos(a)*rz+relief*front**12*(j===3?1:j===4?.35:0));uv.push(i/n,j/(rings.length-1));}}
 for(let j=0;j<rings.length-1;j++)for(let i=0;i<n;i++){const a=j*(n+1)+i,b=a+n+1;indices.push(a,a+1,b,b,a+1,b+1);}
 return{p,uv,indices};
}
function part(parent,material,rings,x=0,y=0,z=0,n=20,relief=0){const d=loftData(rings,n,relief),g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(d.p,3));g.setAttribute('uv',new T.Float32BufferAttribute(d.uv,2));g.setIndex(d.indices);g.computeVertexNormals();const m=new T.Mesh(g,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
const mat=(c,r=.85)=>new T.MeshStandardMaterial({color:c,roughness:r});
function group(parent,x=0,y=0,z=0){const g=new T.Group();g.position.set(x,y,z);parent.add(g);return g;}
function ribbon(parent,m,points,width=.007){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));const o=new T.Mesh(new T.TubeGeometry(curve,12,width,5,false),m);parent.add(o);return o;}
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function createCitizen(id){
 const s=CAST.find(p=>p.id===id);if(!s)throw Error('UNKNOWN_CITIZEN '+id);
 const root=new T.Group(),body=group(root),skin=mat(s.skin,.72),hair=mat(s.hair),shirt=mat(s.top),pants=mat(s.pants),shoe=mat('#302c2d',.63),sole=mat('#a49c8b'),accent=mat(new T.Color(s.top).multiplyScalar(.63)),white=mat('#d5ccc0'),iris=mat('#383132'),lip=mat(new T.Color(s.skin).multiplyScalar(.69));
 const B=s.build,H=s.head,L=s.leg,coat=s.garment==='coat',work=s.garment==='work';
 const hip=.84*L,upper=.38*L,lower=.40*L,legX=.097*B,shoulder=.208*B;
 const torso=group(body,0,hip,0);
 part(torso,shirt,[[-.07,0,0],[-.065,.156*B,.096],[.005,(coat?.20:.164)*B,.115],[.13,.14*B,.113],[.25,.193*B,.116],[.36,shoulder,.102],[.40,.127*B,.085],[.42,.062,.06],[.425,0,0]],0,0,0,28);
 part(torso,accent,[[.36,0,0],[.365,.082,.069],[.401,.076,.07],[.42,.061,.059],[.423,0,0]]);
 part(torso,skin,[[0,0,0],[.009,.055,.05],[.095,.053,.047],[.10,0,0]],0,.395);
 if(coat||work){for(let k=0;k<5;k++)part(torso,accent,[[0,0,0],[.002,.012,.005],[.018,.012,.005],[.02,0,0]],0,.05+k*.06,.116,12);ribbon(torso,accent,[[-.025,.38,.086],[-.035,.22,.119],[-.025,.035,.115]],.006);}
 if(work)for(const x of [-.095,.095])ribbon(torso,accent,[[x-.035,.22,.106],[x-.035,.16,.119],[x+.035,.16,.119],[x+.035,.22,.106]],.006);
 const head=group(torso,0,.46,0),jaw=(s.style==='crop'||s.style==='cap')?.086:.068,cheek=.097*H;
 part(head,skin,[[0,0,0],[.013,jaw*H,.076,.012],[.046,.085*H,.087,.005],[.087,cheek,.095,0],[.124,.093*H,.091,-.002],[.157,.098*H,.091,-.006],[.204,.077*H,.075,-.008],[.232,.028,.034,-.009],[.238,0,0,-.009]],0,0,0,40,.036*H);
 for(const sign of [-1,1]){const x=sign*.041*H;
 part(head,skin,[[0,0,0],[.008,.019,.016],[.049,.017,.018],[.061,0,0]],sign*.097*H,.077,-.004,16);
 part(head,white,[[0,0,0],[.004,.024,.007],[.014,.022,.007],[.018,0,0]],x,.121,.083,18);
 part(head,iris,[[0,0,0],[.002,.008,.003],[.013,.008,.003],[.015,0,0]],x,.122,.092,16);
 ribbon(head,hair,[[x-.022,.150,.088],[x,.154,.094],[x+.022,.148,.086]],.004);}
 ribbon(head,lip,[[-.024,.056,.088],[0,.052,.101],[.024,.056,.088]],.004);
 part(head,hair,[[.114,0,0,-.04],[.127,.102*H,.084,-.035],[.161,.11*H,.099,-.009],[.211,.092*H,.088,-.008],[.246,.05,.057,-.011],[.252,0,0,-.011]],0,0,0,32);
 if(s.style==='long'||s.style==='bob')for(const sign of [-1,1])part(head,hair,[[s.style==='long'?-.13:-.04,0,0,-.025],[s.style==='long'?-.10:-.015,.039,.045,-.027],[.08,.047,.078,-.03],[.17,.041,.067,-.024],[.20,0,0]],sign*.079*H,0,0,24);
 if(s.style==='bun')part(head,hair,[[.15,0,0],[.17,.050,.049],[.23,.064,.057],[.28,.038,.037],[.292,0,0]],0,0,-.091,24);
 if(s.style==='curly')for(let i=0;i<9;i++){const a=i*2*Math.PI/9;part(head,hair,[[.167,0,0],[.178,.035,.035],[.22,.041,.039],[.25,0,0]],Math.sin(a)*.077,0,Math.cos(a)*.065,14);}
 if(s.style==='cap'){part(head,shirt,[[.15,0,0],[.155,.118,.115],[.202,.11,.10],[.248,.06,.06],[.25,0,0]],0,0,0,28);part(head,accent,[[.148,0,0],[.151,.102,.079],[.162,.102,.079],[.165,0,0]],0,0,.10,24);}
 if(s.style==='part')ribbon(head,accent,[[-.057,.212,.073],[-.031,.242,.016],[.005,.225,-.061]],.006);
 const arms=[],legs=[];
 for(const sign of [-1,1]){
  const a=group(torso,sign*shoulder,.344,0);a.rotation.z=sign*.10;
  part(a,shirt,[[-.258,0,0],[-.248,.043,.05],[-.15,.061*B,.057],[-.065,.073*B,.068],[.012,.067,.06],[.026,0,0]]);
  const elbow=group(a,0,-.25,0);part(elbow,coat||work?shirt:skin,[[-.226,0,0],[-.22,.032,.033],[-.13,.041,.039],[-.022,.052,.049],[.017,.05,.046],[.027,0,0]]);
  const hand=group(elbow,0,-.224,0);part(hand,skin,[[-.09,0,0],[-.077,.031,.016],[-.035,.041,.023],[.006,.029,.022],[.015,0,0]]);
  part(hand,skin,[[-.052,0,0],[-.042,.013,.015],[0,.016,.018],[.016,0,0]],-sign*.033,-.02,.006,12);
  for(let j=0;j<3;j++)ribbon(hand,lip,[[-.020+j*.014,-.074,.015],[-.020+j*.014,-.044,.023]],.0015);
  arms.push({a,elbow});
  const thigh=group(body,sign*legX,hip,0),knee=group(thigh,0,-upper,0),foot=group(knee,0,-lower,0);
  part(thigh,pants,[[-upper-.025,0,0],[-upper-.014,.055,.058],[-.22,.069*B,.073],[-.10,.092*B,.089],[.035,.103*B,.097],[.058,0,0]]);
  part(knee,pants,[[-lower-.015,0,0],[-lower,.047,.045],[-.24,.052,.056],[-.12,.068,.068],[.005,.057,.058],[.025,0,0]]);
  part(foot,shoe,[[-.081,0,0,.05],[-.073,.076,.141,.075],[-.04,.074,.139,.075],[.012,.055,.103,.035],[.038,.049,.056,0],[.048,0,0]]);
  part(foot,sole,[[-.088,0,0,.05],[-.083,.077,.142,.075],[-.068,.077,.142,.075],[-.064,0,0,.05]]);legs.push({thigh,knee,foot});
 }
 root.scale.setScalar(s.height/(hip+.46+.252));root.userData={focusId:id,kind:'person',role:s.role};
 let distance=0;
 function pose(speed,dt,t,action='walk'){
  const move=speed>.05;distance+=speed*dt/root.scale.x;const stride=.64,phase=distance/stride;
  body.position.y=move?-.024+.012*Math.cos(phase*4*Math.PI):-.02;torso.rotation.y=move?.025*Math.sin(phase*2*Math.PI):0;
  for(let i=0;i<2;i++){const a=arms[i],l=legs[i],q=((phase+i*.5)%1+1)%1;let z=0,lift=0;
   if(move){if(q<.5)z=stride*(.25-q);else{const u=(q-.5)*2;z=stride*(-.25+.5*(u*u*(3-2*u)));lift=.105*Math.sin(Math.PI*u);}}
   const ankle=.088-body.position.y+lift,down=hip-ankle,d=clamp(Math.hypot(down,z),.02,upper+lower-.001);
   const bend=Math.acos(clamp((upper*upper+lower*lower-d*d)/(2*upper*lower),-1,1)),kneeAngle=Math.PI-bend;
   const a0=Math.atan2(z,down)+Math.acos(clamp((upper*upper+d*d-lower*lower)/(2*upper*d),-1,1));
   l.thigh.rotation.x=-a0;l.knee.rotation.x=kneeAngle;l.foot.rotation.x=a0-kneeAngle;
   a.a.rotation.x=move?.37*Math.sin((q+.25)*2*Math.PI):.035*Math.sin(t*1.1+i);a.elbow.rotation.x=move?-.20-.15*Math.max(0,Math.sin(q*2*Math.PI)):-.13;
  }
  head.rotation.y=move?.035*Math.sin(phase*Math.PI):.14*Math.sin(t*.9+id.length);
  head.rotation.x=action==='window'&&!move?.10:0;
  if(!move&&action==='window'){arms[0].a.rotation.x=-.37;arms[0].elbow.rotation.x=-.8;head.rotation.y=.25;}
 }
 return{root,pose,profile:s};
}
