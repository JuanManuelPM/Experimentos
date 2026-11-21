import * as THREE from "three";
import {createLiveSurface} from "./screen.mjs";

// Editable manufactured silhouette, not a stack of boxes.
// Side profile in depth/height space; cut, bevel and UV artwork are generated locally.
export const CABINET_MODEL_ID="prometeo/prop/signal-cabinet@0.1.0";
export function makeCabinet(options={}){
 const g=new THREE.Group();g.name=CABINET_MODEL_ID;
 const paint=new THREE.MeshStandardMaterial({color:0x25383b,metalness:.34,roughness:.39});
 const dark=new THREE.MeshStandardMaterial({color:0x10151e,metalness:.35,roughness:.5});
 const edge=new THREE.MeshStandardMaterial({color:0xb4a27c,metalness:.62,roughness:.3});
 const pink=new THREE.MeshStandardMaterial({color:0xdb547c,metalness:.48,roughness:.3,emissive:0x6f1731,emissiveIntensity:.22});
 const screen=createLiveSurface({mode:options.mode||"signal",speed:1});
 const outline=[[-.46,0],[.42,0],[.45,.12],[.44,1.98],[.36,2.17],[-.36,2.17],[-.49,2.07],[-.49,1.9],[-.22,1.79],[-.21,1.27],[-.55,1.04],[-.54,.92],[-.42,.88],[-.43,.18]];
 const shape=new THREE.Shape();shape.moveTo(...outline[0]);for(let i=1;i<outline.length;i++)shape.lineTo(...outline[i]);shape.closePath();
 const cg=new THREE.ExtrudeGeometry(shape,{depth:.75,steps:1,bevelEnabled:true,bevelSegments:2,bevelThickness:.016,bevelSize:.011,curveSegments:6});
 cg.rotateY(Math.PI/2);cg.translate(-.375,0,0);
 const body=new THREE.Mesh(cg,[paint,dark]);body.name="custom-contour-body";body.castShadow=true;body.receiveShadow=true;g.add(body);
 // Materialized UV side art: ShapeGeometry cap, normalized UV to 512x1024 atlas.
 const atlas=document.createElement("canvas");atlas.width=512;atlas.height=1024;
 const ax=atlas.getContext("2d");ax.fillStyle="#24383b";ax.fillRect(0,0,512,1024);
 const gr=ax.createLinearGradient(0,0,512,1024);gr.addColorStop(0,"#345f5e");gr.addColorStop(.5,"#102833");gr.addColorStop(1,"#6c303c");ax.fillStyle=gr;ax.fillRect(0,0,512,1024);
 ax.globalAlpha=.7;ax.strokeStyle="#eab971";ax.lineWidth=7;
 for(let k=0;k<8;k++){ax.beginPath();ax.moveTo(-90+k*59,115);ax.lineTo(120+k*59,855);ax.stroke();}
 ax.globalAlpha=1;ax.fillStyle="#06151f";ax.beginPath();ax.arc(280,410,185,0,Math.PI*2);ax.fill();
 ax.strokeStyle="#df6589";ax.lineWidth=19;ax.beginPath();ax.arc(280,410,148,.19,5.65);ax.stroke();
 ax.strokeStyle="#f0d89c";ax.lineWidth=4;ax.beginPath();ax.arc(280,410,111,0,Math.PI*2);ax.stroke();
 ax.fillStyle="#f7dfb5";ax.textAlign="center";ax.font="900 100px Arial";ax.fillText("86",280,443);
 ax.font="bold 31px Arial";ax.letterSpacing="7px";ax.fillText("LOST SIGNAL",258,695);
 ax.fillStyle="#d9b477";for(let i=0;i<38;i++){let x=(i*97)%500,y=(i*193)%1000;ax.fillRect(x,y,3+(i%3),3+(i%3));}
 ax.strokeStyle="#79dccd";ax.lineWidth=14;ax.strokeRect(19,24,474,974);
 // Restricted tiny scuffs: paint wear follows atlas, not repeating random wallpaper.
 ax.fillStyle="rgba(239,225,190,.25)";for(let i=0;i<150;i++){let x=(i*139+22)%512,y=(i*i*27+102)%1024;ax.fillRect(x,y,1+(i%4),1);}
 const sideTex=new THREE.CanvasTexture(atlas);sideTex.colorSpace=THREE.SRGBColorSpace;sideTex.anisotropy=4;
 const sideMat=new THREE.MeshStandardMaterial({map:sideTex,roughness:.57,metalness:.14,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1});
 for(const sideX of [-.393,.393]){
    const sg=new THREE.ShapeGeometry(shape);const p=sg.attributes.position,uv=sg.attributes.uv;
    for(let i=0;i<p.count;i++)uv.setXY(i,(p.getX(i)+.6)/1.1,p.getY(i)/2.2);
    sg.rotateY(Math.PI/2);sg.translate(sideX,0,0);
    const m=new THREE.Mesh(sg,sideMat);m.name="UV-painted-side";g.add(m);
 }
 // Piping follows the silhouette, including an intentionally stepped console.
 const outlineCurve=outline.map(([d,y])=>new THREE.Vector3(0,y,-d));
 for(const x of [-.403,.403]){
   let pth=outlineCurve.map(v=>new THREE.Vector3(x,v.y,v.z));
   const geo=new THREE.TubeGeometry(new THREE.CatmullRomCurve3([...pth,pth[0]],true,"catmullrom",.04),96,.008,5,true);
   const trim=new THREE.Mesh(geo,edge);g.add(trim);
 }
 function box(name,w,h,d,x,y,z,mat,rx=0){
   const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.rotation.x=rx;m.name=name;g.add(m);return m;
 }
 // Optical system is housed inside the inclined upper face, not floated as an HTML image.
 box("CRT dark recess",.675,.55,.058,0,1.52,.244,dark,-.045);
 box("anodized CRT bezel",.716,.59,.03,0,1.52,.287,edge,-.045);
 box("inner CRT gasket",.641,.516,.04,0,1.52,.312,dark,-.045);
 const pg=new THREE.PlaneGeometry(.602,.472,20,14);const pos=pg.attributes.position;
 for(let i=0;i<pos.count;i++){let x=pos.getX(i)/.31,y=pos.getY(i)/.24;pos.setZ(i,.025*Math.max(0,1-(x*x+y*y)*.55));}pg.computeVertexNormals();
 const crtMat=new THREE.MeshBasicMaterial({map:screen.texture,side:THREE.DoubleSide});
 const crt=new THREE.Mesh(pg,crtMat);crt.position.set(0,1.52,.346);crt.rotation.x=-.045;crt.name="live-CRT-on-curved-mesh";crt.userData.interactive=true;g.add(crt);
 // One diagonal highlight cues curved glass; no fake photographic image.
 const flare=new THREE.Mesh(new THREE.PlaneGeometry(.045,.45),new THREE.MeshBasicMaterial({color:0xc9e9dc,transparent:true,opacity:.10,depthWrite:false}));
 flare.position.set(-.17,1.52,.379);flare.rotation.set(-.045,0,.38);g.add(flare);
 const mcan=document.createElement("canvas");mcan.width=1024;mcan.height=256;const mx=mcan.getContext("2d");
 const mg=mx.createLinearGradient(0,0,1024,256);mg.addColorStop(0,"#431b39");mg.addColorStop(.55,"#0a212c");mg.addColorStop(1,"#3e1632");mx.fillStyle=mg;mx.fillRect(0,0,1024,256);
 mx.strokeStyle="#e3b58c";mx.lineWidth=14;mx.strokeRect(13,13,998,230);
 mx.fillStyle="#fbdfbb";mx.textAlign="center";mx.font="900 114px Arial Black,Arial";mx.fillText("S I G N A L",512,147);
 mx.font="bold 35px monospace";mx.fillStyle="#9cf4d0";mx.fillText("LOST FREQUENCY  //  1986",512,207);
 const mt=new THREE.CanvasTexture(mcan);mt.colorSpace=THREE.SRGBColorSpace;
 const mm=new THREE.MeshBasicMaterial({map:mt,color:0xffffff});box("marquee cast",.72,.215,.035,0,2.007,.51,dark);
 const marquee=new THREE.Mesh(new THREE.PlaneGeometry(.685,.193),mm);marquee.position.set(0,2.008,.536);g.add(marquee);
 const led=new THREE.PointLight(0xde789f,.55,1.8);led.position.set(0,2.08,.61);g.add(led);
 // Angled controls and hardware with real axes; geometry components are mechanical details.
 box("control deck",.78,.045,.32,0,1.049,.475,dark,-.60);
 box("control inlay",.72,.012,.264,0,1.079,.478,pink,-.60);
 // Joystick stems/screw washers/buttons on the top face
 function disk(name,x,z,r,color){
   const material=new THREE.MeshStandardMaterial({color,metalness:.48,roughness:.29});
   const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,.024,24),material);
   m.position.set(x,1.118,z);m.name=name;g.add(m);return m;
 }
 disk("joystick ring",-.21,.50,.068,0xc4ae81);
 const shaft=new THREE.Mesh(new THREE.CylinderGeometry(.015,.020,.115,14),edge);shaft.position.set(-.21,1.188,.50);shaft.rotation.z=-.1;g.add(shaft);
 const knob=new THREE.Mesh(new THREE.SphereGeometry(.048,20,12),new THREE.MeshStandardMaterial({color:0x101d27,metalness:.4,roughness:.24}));knob.position.set(-.21,1.252,.50);knob.name="live-joystick";knob.userData.interactive=true;g.add(knob);
 const buttons=[];for(let i=0;i<3;i++){const b=disk("button-"+i,.065+i*.11,.49-(i%2)*.045,.038,i===0?0xf6c27d:i===1?0x84e5db:0xef7096);b.userData.interactive=true;buttons.push(b);}
 const plate=box("coin-plate",.28,.22,.018,0,.57,.447,dark);
 for(const x of [-.065,.065]){box("coin slot",.013,.069,.012,x,.57,.463,edge);}
 box("kick badge",.40,.09,.02,0,.18,.461,pink);
 const floorLight=new THREE.PointLight(0x5df2d3,.6,1.8);floorLight.position.set(0,.2,.45);g.add(floorLight);
 g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
 const interactive=[crt,knob,...buttons];
 return {group:g,screen,interactive,modelId:CABINET_MODEL_ID,update(dt){screen.update(dt)},input(action){screen.input(action);knob.rotation.z=action==="left"?.24:action==="right"?-.24:0;buttons[0].position.y=action==="fire"?1.108:1.118;}};
}