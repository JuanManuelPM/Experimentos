// ARCADE / 86 V4. Original environment: no downloaded assets or likenesses.
export function dressV4(T,room,scene){
 const brass=new T.MeshStandardMaterial({color:0xb99870,metalness:.72,roughness:.31});
 const plum=new T.MeshStandardMaterial({color:0x342738,metalness:.38,roughness:.53});
 const ink=new T.MeshStandardMaterial({color:0x101a2a,metalness:.25,roughness:.54});
 function block(w,h,d,x,y,z,material){const m=new T.Mesh(new T.BoxGeometry(w,h,d),material);m.position.set(x,y,z);m.receiveShadow=true;room.add(m);return m;}
 // Four architectural arches make a readable rhythm along the entire hall.
 const colors=[0x75ecd7,0xf2b675,0xbe8bf4,0xf07aab];
 for(let i=0;i<4;i++){
   const z=-6.7+i*4.4,pts=[];
   for(let k=0;k<=24;k++){const t=k/24;pts.push(new T.Vector3(-5.86+11.72*t,3.8+.47*Math.sin(Math.PI*t),z));}
   room.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),56,.029,6,false),new T.MeshBasicMaterial({color:colors[i]})));
   for(const side of [-1,1]){
     block(.26,.26,.20,side*5.85,3.8,z,brass);
     const lamp=new T.PointLight(colors[i],2.9,3.8,2);lamp.position.set(side*5.65,3.8,z);scene.add(lamp);
   }
 }
 // Individual cabinet pools and floor wayfinding: no collision and no character stand-ins.
 const machineColors=[0xf57b99,0x7bf5db,0xffb76f,0xb49eff,0x85d5f4,0xff84d5],lamps=[];
 for(let i=0;i<6;i++){
   const side=i%2===0?-1:1,z=-4.7+Math.floor(i/2)*4.5;
   const glow=new T.Mesh(new T.CircleGeometry(1.04,40),new T.MeshBasicMaterial({color:machineColors[i],transparent:true,opacity:.17,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide}));
   glow.rotation.x=-Math.PI/2;glow.scale.y=1.4;glow.position.set(side*4.72,.018,z);room.add(glow);
   const stripMat=new T.MeshBasicMaterial({color:machineColors[i],transparent:true,opacity:.74});
   for(let j=0;j<4;j++)block(.035,.008,.34,side*(3.46+j*.17),.024,z-.76,stripMat);
   const spot=new T.PointLight(machineColors[i],2.1,2.4,2);spot.position.set(side*4.05,1.1,z);scene.add(spot);lamps.push(spot);
 }
 // Abstract theatrical haze beams, low opacity and no user-obscuring particles.
 for(const [x,z,color] of [[-3.8,-4.7,0x7fdcd8],[3.8,-.1,0xc08be7],[-3.8,4.25,0xffaa87]]){
   const fogCone=new T.Mesh(new T.ConeGeometry(1.7,4.7,24,1,true),new T.MeshBasicMaterial({color,transparent:true,opacity:.029,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide}));
   fogCone.position.set(x,2.4,z);room.add(fogCone);
 }
 // Full ticket dispenser and its printed, original marquee.
 block(1.23,.71,.54,4.9,.39,7.50,plum);
 block(1.3,.095,.60,4.9,.79,7.50,brass);
 block(.77,.13,.026,4.9,.66,7.18,ink);
 for(let i=0;i<6;i++)block(.1,.014,.32,4.49+i*.16,.846,7.5,new T.MeshBasicMaterial({color:i%2?0xf2dfb3:0xe1a0a7}));
 const canvas=document.createElement("canvas");canvas.width=768;canvas.height=256;const c=canvas.getContext("2d");
 c.fillStyle="#101b2e";c.fillRect(0,0,768,256);c.strokeStyle="#edbb8c";c.lineWidth=11;c.strokeRect(10,10,748,236);
 c.textAlign="center";c.fillStyle="#f0d6a8";c.font="900 64px monospace";c.fillText("NO REFUNDS",384,101);
 c.font="700 28px monospace";c.fillStyle="#83dbcb";c.fillText("ONE TOKEN / ONE DREAM",384,176);
 const tx=new T.CanvasTexture(canvas);tx.colorSpace=T.SRGBColorSpace;
 const poster=new T.Mesh(new T.PlaneGeometry(2.35,.79),new T.MeshBasicMaterial({map:tx}));poster.position.set(0,1.95,-8.56);room.add(poster);
 return{update(time){for(let i=0;i<lamps.length;i++)lamps[i].intensity=2.08+.33*Math.sin(time*(1.48+i*.18)+i*1.32);}};
}