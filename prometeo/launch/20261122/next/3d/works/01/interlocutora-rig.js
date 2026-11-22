// INTERLOCUTORA · character rig v0.1 · original authored geometry
// All positions are in metres. Face/garment/gestures are stylized, not photoreal.
export function createInterlocutora(T) {
  const root = new T.Group(); root.name = 'Interlocutora_Rig';
  const skin = new T.MeshStandardMaterial({color:0xb98269,roughness:.7,metalness:0});
  const skinLight = new T.MeshStandardMaterial({color:0xd69c7b,roughness:.72});
  const skinShadow = new T.MeshStandardMaterial({color:0x875944,roughness:.84});
  const hair = new T.MeshStandardMaterial({color:0x282523,roughness:.88,metalness:.01,side:T.DoubleSide});
  const hairHighlight = new T.MeshStandardMaterial({color:0x463c35,roughness:.8,side:T.DoubleSide});
  const coat = new T.MeshStandardMaterial({color:0x274a52,roughness:.8,side:T.DoubleSide});
  const darkCoat = new T.MeshStandardMaterial({color:0x183239,roughness:.87,side:T.DoubleSide});
  const shirt = new T.MeshStandardMaterial({color:0xd8cbb4,roughness:.93,side:T.DoubleSide});
  const lips = new T.MeshStandardMaterial({color:0x955d55,roughness:.61});
  const lipShade = new T.MeshStandardMaterial({color:0x4b272b,roughness:.9,side:T.DoubleSide});
  const tooth = new T.MeshStandardMaterial({color:0xe1d8cb,roughness:.53});
  const white = new T.MeshStandardMaterial({color:0xded9cb,roughness:.34});
  const iris = new T.MeshStandardMaterial({color:0x4b736c,roughness:.3});
  const pupil = new T.MeshStandardMaterial({color:0x111a20,roughness:.17});
  const glint = new T.MeshBasicMaterial({color:0xffffff});
  const meshes = [];
  function addMesh(parent,geometry,material,name,pos=[0,0,0],rot=[0,0,0]) {
    const o=new T.Mesh(geometry,material);o.name=name;o.position.set(...pos);o.rotation.set(...rot);
    o.castShadow=true;o.receiveShadow=true;parent.add(o);meshes.push(o);return o;
  }
  const sphere=(p,m,n,x,y,z,sx,sy,sz)=>{const o=addMesh(p,new T.SphereGeometry(1,36,24),m,n,[x,y,z]);o.scale.set(sx,sy,sz);return o};
  function curve(parent,points,radius,material,name,segments=32){
    return addMesh(parent,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),segments,radius,6,false),material,name);
  }
  // Smooth tailor's loft with elliptical cross sections, no cuboid body parts.
  function loft(parent,rings,material,name){
    const verts=[], indices=[], N=24;
    for(const ring of rings){for(let j=0;j<N;j++){const a=2*Math.PI*j/N;verts.push(ring.x+ring.rx*Math.cos(a),ring.y,ring.z+ring.rz*Math.sin(a));}}
    for(let k=0;k<rings.length-1;k++)for(let j=0;j<N;j++){
      const a=k*N+j,b=k*N+(j+1)%N,c=(k+1)*N+j,d=(k+1)*N+(j+1)%N;
      indices.push(a,c,b,b,c,d);
    }
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(verts,3));g.setIndex(indices);g.computeVertexNormals();
    return addMesh(parent,g,material,name);
  }
  loft(root,[
    {x:0,y:.18,z:0,rx:.32,rz:.2},{x:0,y:.38,z:0,rx:.38,rz:.24},
    {x:0,y:.75,z:0,rx:.44,rz:.26},{x:0,y:1.04,z:0,rx:.43,rz:.25},
    {x:0,y:1.18,z:0,rx:.31,rz:.19},{x:0,y:1.22,z:0,rx:.13,rz:.14}
  ],coat,'Tailored body');
  // Shirt & asymmetrical lapels
  loft(root,[
    {x:0,y:.76,z:.19,rx:.16,rz:.035},{x:0,y:1.06,z:.175,rx:.18,rz:.06},
    {x:0,y:1.22,z:.12,rx:.12,rz:.07}
  ],shirt,'High collar shirt');
  function panel(verts,mat,name){
    const g=new T.BufferGeometry(), v=verts.flat();
    g.setAttribute('position',new T.Float32BufferAttribute(v,3));
    const idx=[];for(let i=1;i<verts.length-1;i++)idx.push(0,i,i+1);
    g.setIndex(idx);g.computeVertexNormals();
    return addMesh(root,g,mat,name);
  }
  panel([[-.12,1.16,.232],[-.38,1.03,.245],[-.23,.75,.29],[-.06,.91,.277]],darkCoat,'Left folded lapel');
  panel([[.12,1.16,.232],[.36,1.03,.245],[.2,.77,.29],[.02,.91,.277]],coat,'Right folded lapel');
  curve(root,[[-.28,1.02,.235],[-.16,.89,.28],[-.07,.74,.282]],.008,shirt,'Lapel piping');
  // Shoulder and arms have anatomically proportioned joint-to-joint contours.
  const arms=[];
  for(const s of [-1,1]){
    const pivot=new T.Group();pivot.position.set(s*.37,1.105,.008);root.add(pivot);
    loft(pivot,[
      {x:0,y:.05,z:0,rx:.135,rz:.14},
      {x:s*.047,y:-.15,z:.015,rx:.15,rz:.145},
      {x:s*.085,y:-.38,z:.08,rx:.125,rz:.12},
      {x:s*.057,y:-.54,z:.16,rx:.095,rz:.098}
    ],coat,s<0?'Left sleeve':'Right sleeve');
    sphere(pivot,skin,s<0?'Left hand':'Right hand',s*.055,-.61,.16,.092,.15,.058);
    curve(pivot,[[s*.01,-.48,.22],[s*.11,-.49,.22]],.012,darkCoat,'Sleeve seam');
    arms.push(pivot);
  }
  // Neck and all face pieces are under one 3-axis head joint.
  const headJoint=new T.Group();headJoint.position.set(0,1.15,.015);root.add(headJoint);
  const head=new T.Group();head.position.set(0,.41,0);headJoint.add(head);
  loft(headJoint,[{x:0,y:.01,z:0,rx:.11,rz:.115},{x:0,y:.18,z:.01,rx:.118,rz:.112},{x:0,y:.38,z:.015,rx:.135,rz:.12}],skin,'Neck');
  const geo=new T.SphereGeometry(1,56,40);
  const P=geo.attributes.position;
  for(let i=0;i<P.count;i++){
    const x=P.getX(i),y=P.getY(i),z=P.getZ(i);
    const cheek=1+.055*Math.exp(-Math.pow((Math.abs(x)-.51)/.22,2)-Math.pow((y+.2)/.31,2));
    const taper=y<-.27 ? 1+(y+.27)*.36 : 1;
    const forehead=y>.34?1-.045*(y-.34):1;
    const jaw=y<-.45 ? .94 : 1;
    P.setXYZ(i,x*.24*cheek*taper*jaw*forehead,y*.305,z*.235*(.95+.03*y));
  }
  geo.computeVertexNormals();
  // Three.js morph targets: soft cheeks/jaw change by expression, editable in the rig.
  const neutral=geo.attributes.position,targets=[];
  for(const kind of ['smile','concern']){
    const data=[];
    for(let i=0;i<neutral.count;i++){
      const x=neutral.getX(i),y=neutral.getY(i),z=neutral.getZ(i);
      const front=Math.max(0,Math.min(1,(z-.03)/.11));
      const cheek=Math.exp(-Math.pow((Math.abs(x)-.13)/.065,2)-Math.pow((y+.125)/.085,2))*front;
      const brow=Math.exp(-Math.pow((Math.abs(x)-.1)/.08,2)-Math.pow((y-.12)/.07,2))*front;
      data.push(x+(kind==='smile'?x*.025*cheek:-x*.01*brow),
        y+(kind==='smile'?.014*cheek:-.013*brow),
        z+(kind==='smile'?.008*cheek:.006*brow));
    }
    const a=new T.Float32BufferAttribute(data,3);a.name=kind;targets.push(a);
  }
  geo.morphAttributes.position=targets;
  const face=addMesh(head,geo,skinLight,'Anatomical portrait', [0,0,0]);
  // Sculpted brow ridge, bridge, alae and chin contour.
  sphere(head,skin,'Bridge',0,-.015,.214,.065,.138,.08);
  sphere(head,skinLight,'Nasal tip',0,-.086,.275,.073,.041,.054);
  for(const s of [-1,1]){
    sphere(head,skin,'Nostril wing',s*.056,-.112,.262,.038,.023,.029);
    sphere(head,skinShadow,'Nostril',s*.048,-.125,.293,.016,.009,.004);
    sphere(head,skin,'Ear',s*.249,-.059,-.025,.052,.091,.051);
    sphere(head,skinShadow,'Ear fold',s*.258,-.054,.015,.025,.050,.01);
    sphere(head,skinLight,'Cheek',s*.138,-.17,.154,.095,.065,.051);
  }
  sphere(head,skinLight,'Chin',0,-.226,.173,.12,.038,.038);
  // Eyes are layered sclera / iris / pupil / catchlight; visible from profile.
  const eyeRig=[], brows=[];
  for(const s of [-1,1]){
    const eye=new T.Group();eye.position.set(s*.115,.058,.205);head.add(eye);
    sphere(eye,skinShadow,'Orbit',0,0,-.009,.089,.055,.022);
    sphere(eye,white,'Sclera',0,0,.007,.078,.038,.027);
    const gaze=new T.Group();eye.add(gaze);
    sphere(gaze,iris,'Iris',0,0,.034,.026,.029,.006);
    sphere(gaze,pupil,'Pupil',0,0,.040,.012,.015,.006);
    sphere(gaze,glint,'Corneal catchlight',-.007,.012,.046,.006,.006,.002);
    curve(eye,[[-.078,.007,.018],[-.039,.042,.025],[.004,.045,.033],[.050,.026,.023],[.079,.002,.013]],.009,skinShadow,'Upper eyelid');
    curve(eye,[[-.08,-.005,.017],[0,-.042,.029],[.072,-.006,.018]],.008,skin,'Lower eyelid');
    const blink=sphere(eye,skinLight,'Blink skin',0,.038,.04,.077,.003,.019);
    const brow=curve(head,[
      [s*.034,.14,.189],[s*.083,.167,.197],[s*.13,.169,.198],[s*.181,.148,.168]
    ],.014,hair,s<0?'Left brow':'Right brow');
    eyeRig.push({eye,gaze,blink});brows.push(brow);
  }
  // Lips drawn on continuous parametric curves, with independent commissures.
  const mouth=new T.Group();mouth.position.set(0,-.173,.230);head.add(mouth);
  const aperture=sphere(mouth,lipShade,'Oral cavity',0,0,.016,.11,.011,.012);
  const upper=curve(mouth,[[-.118,0,.013],[-.064,.012,.032],[0,.007,.045],[.068,.012,.031],[.118,0,.013]],.012,lips,'Orbicularis upper');
  const lower=curve(mouth,[[-.117,0,.014],[-.06,-.022,.033],[0,-.025,.04],[.066,-.021,.031],[.118,0,.014]],.013,lips,'Orbicularis lower');
  const teeth=sphere(mouth,tooth,'Teeth glimpse',0,-.006,.030,.071,.006,.009);
  // Hundreds of tapered ribbon strips. No block/primitive wig.
  function hairRibbon(pts,width,mat,name){
    const v=[],idx=[];
    for(let i=0;i<pts.length;i++){
      const p=pts[i],u=i/(pts.length-1),w=width*(.6+.4*Math.sin(Math.PI*u))*(1-.90*Math.pow(u,7));
      v.push(p[0]-w,p[1],p[2],p[0]+w,p[1],p[2]-.006);
      if(i) {let j=i*2;idx.push(j-2,j-1,j,j-1,j+1,j);}
    }
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setIndex(idx);g.computeVertexNormals();
    return addMesh(head,g,mat,name);
  }
  // Crown cap makes roots coherent from all views.
  const cap=new T.SphereGeometry(1,42,24,0,Math.PI*2,0,Math.PI*.53);
  const cp=cap.attributes.position;
  for(let i=0;i<cp.count;i++)cp.setXYZ(i,cp.getX(i)*.251,cp.getY(i)*.312+.026,cp.getZ(i)*.242);
  cap.computeVertexNormals();addMesh(head,cap,hair,'Crown/scalp cap');
  let seed=19;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967295};
  for(let s of [-1,1]){
    for(let i=0;i<56;i++){
      const a=(i+.5)/56 * Math.PI*.89 +.03;
      const x=s*(.05+.195*Math.sin(a)), z=.15*Math.cos(a)-.055;
      const from=[x*.75,.255-.06*rnd(),z+.03];
      const m=[x*1.1,.08+rnd()*.08,z+.055];
      const to=[x*(1.12+.1*rnd()),-.27-rnd()*.19,z+.06+(rnd()-.5)*.06];
      hairRibbon([from,m,to],.008+.008*rnd(),i%6===0?hairHighlight:hair,'Bob strand '+s+' '+i);
    }
  }
  // Side-parted asymmetrical fringe, with no hair covering the eyes.
  for(let i=0;i<22;i++){
    const u=i/22;
    hairRibbon([
      [-.17+u*.33,.285,.03],
      [-.09+u*.31,.226,.196],
      [-.022+u*.26,.158-.047*u,.232]
    ],.008+(1-u)*.008,i%4===0?hairHighlight:hair,'Swept fringe '+i);
  }
  // Earrings and garment: all original, author-created forms.
  const gold=new T.MeshStandardMaterial({color:0xc7a87c,metalness:.77,roughness:.31});
  for(const s of [-1,1])addMesh(head,new T.TorusGeometry(.028,.005,7,30),gold,'Hoop earring',[s*.261,-.135,.01]);
  sphere(root,gold,'Collar pin',-.15,.86,.29,.023,.023,.010);
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const state={emotion:'neutral',viseme:'rest',speaking:false,blink:0,gazeX:0,gazeY:0,headYaw:0,headPitch:0,headRoll:0,armLift:0,breath:0};
  // Mouth: [opening, spread, round, jaw]. Visemes are syllable-cue shapes,
  // not a forced alignment model. Gesture data is editable independently.
  const PHONEMES={rest:[.03,.8,0,0],A:[.77,1,0,.8],E:[.38,1.24,0,.47],I:[.2,1.23,0,.2],O:[.56,.57,1,.52],U:[.24,.48,1,.23],M:[.01,.85,0,.04],F:[.11,.85,0,.08],S:[.17,.9,0,.14]};
  function update(dt,time,command={}){
    Object.assign(state,command);
    const e=state.emotion, warm=e==='warm', uneasy=e==='uneasy';
    const target=PHONEMES[state.speaking?state.viseme:'rest']||PHONEMES.rest;
    const expression=warm?.13:uneasy?-.12:0;
    const opening=target[0]*(state.speaking?1:0);
    aperture.scale.set(.10*(target[1]+expression),.012+opening*.10,.012);
    aperture.position.y=-opening*.032;
    upper.scale.x=target[1]+expression;lower.scale.x=target[1]+expression;
    if(face.morphTargetInfluences){face.morphTargetInfluences[0]=warm?.96:0;face.morphTargetInfluences[1]=uneasy?.86:0;}
    brows[0].position.y=warm?-.002:uneasy?.011:0;
    brows[1].position.y=warm?-.003:uneasy?.009:0;
    upper.position.y=opening*.009+(warm?.014:uneasy?-.009:0);
    lower.position.y=-opening*.077+(warm?.012:uneasy?-.012:0);
    teeth.visible=opening>.21 && !uneasy;
    teeth.scale.y=.35+opening*.4;
    for(const {eye,gaze,blink} of eyeRig){
      gaze.position.x=clamp(state.gazeX,-1,1)*.015;
      gaze.position.y=clamp(state.gazeY,-1,1)*.012;
      const spontaneousBlink=(Math.sin(time*.61)+Math.sin(time*1.23))>1.975 ? 1:0;
      const b=Math.max(state.blink||0,spontaneousBlink);
      blink.position.y=.037-.036*b;blink.scale.y=.003+b*.039;
      eye.scale.y=Math.max(.08,1-b*.92);
    }
    headJoint.rotation.y=state.headYaw+Math.sin(time*.33)*.027;
    headJoint.rotation.x=state.headPitch+(uneasy?.065:0)+Math.sin(time*.66)*.008;
    headJoint.rotation.z=state.headRoll+(warm?-.023:0);
    arms[0].rotation.x=.05+Math.sin(time*.61)*.024-(state.armLift||0);
    arms[1].rotation.x=.06+Math.sin(time*.58+.6)*.021+(state.armLift||0)*.64;
    root.position.y=.006*Math.sin(time*1.7);
    root.rotation.y=.01*Math.sin(time*.31);
  }
  update(0,0,{});
  return {root,head,headJoint,meshes,state,update,phonemes:PHONEMES,
    exportPose(){return {version:'interlocutora-rig/1',units:'metres',...state};},
    applyPose(pose){update(0,0,pose);}
  };
}
