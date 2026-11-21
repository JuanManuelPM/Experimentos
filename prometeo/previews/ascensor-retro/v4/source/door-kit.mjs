// PROMETEO Studio 3D · Authorial mechanical door kit · v0.1.0 · CC0
// Independent of scene, camera and palette. Geometry has real thickness / tracks.
// Contract: metres; local opening centre x=0, floor y=0, door face plane z=0.
export const DOOR_KIT_ID = 'prometeo.door-portal@0.1.0';
export function createDoorPortal(T, cfg={}) {
  const P={width:1.08,height:2.66,thickness:0.078,closedGap:0.028,travel:1.14,frameHalfWidth:1.195, ...cfg};
  // Authorial UV-aligned canvas materials (no borrowed photo textures).
  const texture=(kind)=>{
    const c=document.createElement('canvas');c.width=256;c.height=512;
    const g=c.getContext('2d');const base={wood:'#3a2227',steel:'#4b555d',inset:'#15212a'}[kind];
    g.fillStyle=base;g.fillRect(0,0,c.width,c.height);
    let seed=kind==='wood'?191:kind==='steel'?223:307;
    const rand=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
    for(let i=0;i<4600;i++){
      const x=rand()*256,y=rand()*512,len=4+rand()*(kind==='wood'?110:30);
      g.fillStyle=kind==='wood'?(rand()>.4?'rgba(220,157,87,.045)':'rgba(8,2,2,.09)')
         :(rand()>.5?'rgba(255,233,196,.030)':'rgba(0,7,12,.085)');
      g.fillRect(x,y,kind==='steel'?.35+rand()*.9:1+rand()*1.2,len);
    }
    if(kind==='wood')for(let x=0;x<256;x+=23){g.strokeStyle='rgba(195,119,70,.09)';g.beginPath();g.moveTo(x,0);g.bezierCurveTo(x+8,180,x-7,400,x+5,512);g.stroke();}
    if(kind==='inset')for(let y=0;y<512;y+=48){g.fillStyle='rgba(120,184,173,.035)';g.fillRect(0,y,256,2);}
    const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;t.wrapS=t.wrapT=T.RepeatWrapping;
    return t;
  };
  const brushed=texture('steel'),walnut=texture('wood'),darkGlass=texture('inset');
  const wood=new T.MeshStandardMaterial({color:P.woodColor||0x766063,map:walnut,roughness:.46,metalness:.10});
  const dark=new T.MeshStandardMaterial({color:P.doorColor||0x9b9f9f,map:brushed,roughness:.37,metalness:.61});
  const inset=new T.MeshStandardMaterial({color:P.insetColor||0xb7d4de,map:darkGlass,roughness:.32,metalness:.64});
  const brass=new T.MeshStandardMaterial({color:P.brassColor||0xc8a56b,roughness:.27,metalness:.81});
  const patina=new T.MeshStandardMaterial({color:P.patinaColor||0x6d6652,roughness:.47,metalness:.68});
  const black=new T.MeshStandardMaterial({color:0x0d1118,roughness:.27,metalness:.45});
  const root=new T.Group();root.name='portal.root';
  const piece=(parent,n,w,h,d,x,y,z,m)=>{
    const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.name=n;o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;
  };
  const cylinder=(parent,n,r,h,x,y,z,m,axis='z')=>{
    const o=new T.Mesh(new T.CylinderGeometry(r,r,h,20),m);
    if(axis==='z')o.rotation.x=Math.PI/2;
    o.position.set(x,y,z);o.name=n;o.castShadow=true;parent.add(o);return o;
  };
  const leaf=(side)=>{
    const g=new T.Group();g.name='portal.leaf.'+(side<0?'left':'right');root.add(g);
    const w=P.width,h=P.height;
    piece(g,'door.structured.steel',w,h,P.thickness,0,h/2,0,dark);
    // Front and back face: this geometry can survive exterior and interior close-ups.
    for(const s of [-1,1]) {
      const z=s*(P.thickness/2+.004);
      piece(g,'door.upper.rail',w-.08,.028,.012,0,h-.18,z,brass);
      piece(g,'door.middle.rail',w-.12,.02,.012,0,h*.49,z,patina);
      piece(g,'door.lower.rail',w-.10,.032,.014,0,.19,z,brass);
      for(const x of [-(w/2-.07),(w/2-.07)]) piece(g,'door.stile',.028,h-.22,.015,x,h/2,z,brass);
      // Two recessed steel panels with brass bordering and real raised fields.
      for(const [yc,hh] of [[.69,.83],[1.82,1.24]]) {
        piece(g,'door.recess',w-.22,hh,.014,0,yc,z+s*.01,inset);
        for(const dy of [-1,1]) piece(g,'door.inlay.horizontal',w-.23,.014,.014,0,yc+dy*(hh/2),z+s*.024,brass);
        for(const dx of [-1,1]) piece(g,'door.inlay.vertical',.013,hh,.014,dx*((w-.23)/2),yc,z+s*.024,brass);
      }
      // Fan / stepped sunburst relief, independent of photographic textures.
      const cx=0,cy=1.93,rz=z+s*.034;
      for(let k=0;k<9;k++){
        const a=Math.PI*(k/8);
        const r=.27;const rr=.075;
        const x=(rr+r)*.5*Math.cos(a),y=(rr+r)*.5*Math.sin(a);
        const len=r-rr;
        const ray=piece(g,'sunburst.ray',.012,len,.012,cx+x,cy+y,rz,brass);
        ray.rotation.z=a-Math.PI/2;
      }
      cylinder(g,'sunburst.boss',.055,.020,cx,cy,rz+s*.014,brass);
      // Thick rivets, not 2D UI circles.
      for(const y of [.22,.47,1.28,2.4])for(const x of [-w*.42,w*.42])
        cylinder(g,'door.rivet',.012,.012,x,y,rz,brass);
      const gripx=-side*.13;
      piece(g,'door.grip.mount',.088,.31,.028,gripx,1.27,z+s*.043,black);
      piece(g,'door.grip.brass',.026,.21,.065,gripx,1.27,z+s*.092,brass);
      piece(g,'door.grip.cap.top',.067,.028,.069,gripx,1.39,z+s*.078,brass);
      piece(g,'door.grip.cap.bottom',.067,.028,.069,gripx,1.15,z+s*.078,brass);
    }
    // Shoes and guides are physically parented to the moving leaf.
    piece(g,'door.roller.top',.26,.05,.14,0,h+.045,-.045,black);
    piece(g,'door.shoe.bottom',.24,.036,.12,0,.023,-.05,patina);
    return g;
  };
  // Frame + continuous guide tracks, supported by the full swept extent.
  piece(root,'portal.outer.lintel',4.90,.21,.27,0,P.height+.16,0,wood);
  piece(root,'portal.rail.top',4.87,.046,.15,0,P.height+.032,-.065,black);
  piece(root,'portal.rail.bottom',4.87,.035,.13,0,.020,-.07,black);
  for(const s of [-1,1]){
    piece(root,'portal.pocket.steel',.17,P.height+.23,.27,s*P.frameHalfWidth,(P.height+.23)/2,0,dark);
    piece(root,'portal.pocket.fluting',.035,P.height-.18,.035,s*(P.frameHalfWidth+.004),P.height*.5,.154,brass);
    piece(root,'portal.column.cap',.20,.085,.32,s*P.frameHalfWidth,P.height+.04,0,brass);
    piece(root,'portal.base.socle',.30,.19,.36,s*P.frameHalfWidth,.105,0,patina);
    for(let i=0;i<7;i++)piece(root,'portal.column.flute',.012,P.height-.47,.018,s*(P.frameHalfWidth+.036+i*.008),P.height/2,.14,patina);
  }
  // Fan crest, a semicircle with real 3D metal spokes.
  cylinder(root,'crest.central.medallion',.078,.065,0,P.height+.175,.158,brass);
  for(let i=0;i<=14;i++){
    const a=(i/14)*Math.PI;
    const x=.49*Math.cos(a),y=.49*Math.sin(a);
    const spoke=piece(root,'crest.radiating',.018,.50,.018,x/2,P.height+.15+y/2,.156,brass);
    spoke.rotation.z=a-Math.PI/2;
  }
  piece(root,'crest.horizontal.base',1.25,.028,.06,0,P.height+.16,.151,brass);
  const left=leaf(-1),right=leaf(1);
  const home=(P.width+P.closedGap)/2;
  const slot={left,right};
  function setOpen(x) {
    const t=Math.max(0,Math.min(1,Number(x)||0));
    left.position.x=-home-P.travel*t; right.position.x=home+P.travel*t;
    root.userData.openness=t;return getFit(t);
  }
  function getFit(t=root.userData.openness||0){
    const opening=P.closedGap+2*P.travel*t;
    const leftEdge=-home-P.travel*t+P.width/2;
    const rightEdge=home+P.travel*t-P.width/2;
    return {openness:t,centerGap:opening,leftEdge,rightEdge,overlap:Math.max(0,leftEdge-rightEdge),frameClearance:P.frameHalfWidth-(P.width+P.closedGap)/2,minimumLeafThickness:P.thickness,
      sweptLeft:[-home-P.travel-P.width/2,-home+P.width/2],sweptRight:[home-P.width/2,home+P.travel+P.width/2]};
  }
  setOpen(0);
  return {root,leaves:slot,config:P,setOpen,getFit,materials:{wood,dark,inset,brass,patina,black}};
}
export function assertDoorClearance(portal) {
  const checks=[0,.5,1].map(t=>portal.setOpen(t));
  const pass=checks.every(x=>x.overlap<=0 && x.frameClearance>.02 && x.minimumLeafThickness>.05);
  portal.setOpen(0);
  return {pass,states:checks,claimedPhysics:'lateral doors with mechanical pockets; cab motion is camera/audio simulation'};
}
