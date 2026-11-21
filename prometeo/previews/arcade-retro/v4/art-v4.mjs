// Original authored meshes, artwork and architectural dressing for arcade V4.
// Dimensions in meters; no third-party imagery, no avatar.
export function cabinetProfiles(id,h){
 const shapes={
 nebula:[[-.40,0],[.43,0],[.43,.2],[.27,.78],[.36,h-.27],[.13,h],[-.36,h],[-.44,h-.22],[-.30,1.60],[-.53,1.16],[-.47,.96],[-.33,.79]],
 drift:[[-.57,0],[.52,0],[.52,.24],[.41,.62],[.35,h-.24],[.22,h],[-.22,h],[-.48,h-.21],[-.35,1.61],[-.73,1.12],[-.65,.91],[-.56,.78]],
 maze:[[-.34,0],[.36,0],[.43,.16],[.38,h-.22],[.28,h],[-.22,h],[-.38,h-.12],[-.30,1.56],[-.48,1.18],[-.46,.98],[-.31,.85]],
 abyss:[[-.49,0],[.48,0],[.50,.31],[.44,h-.38],[.30,h],[-.31,h],[-.46,h-.29],[-.39,1.60],[-.55,1.16],[-.54,.93],[-.48,.76]],
 beat:[[-.30,0],[.35,0],[.41,.17],[.34,h-.22],[.20,h],[-.27,h],[-.37,h-.19],[-.28,1.60],[-.65,1.15],[-.57,.96],[-.33,.77]]};
 return shapes[id]||shapes.nebula;
}
export function lookDelta(dx,dy){return{yaw:dx*.0032,pitch:-dy*.003}}
export function fitMedia(w,h,W,H){if(!w||!h)return[0,0,W,H];const scale=Math.min(W/w,H/h),a=w*scale,b=h*scale;return[(W-a)/2,(H-b)/2,a,b]}
export function paintSide(c,id,label,accent){
 c.fillStyle="#141b25";c.fillRect(0,0,512,1024);c.save();c.strokeStyle=accent;c.fillStyle=accent;
 const line=(points,width=8)=>{c.lineWidth=width;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke()};
 const ring=(x,y,r,width=5)=>{c.lineWidth=width;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.stroke()};
 c.globalAlpha=.6;
 if(id==="nebula"){for(let i=0;i<36;i++){let x=(i*97+27)%512,y=(i*173+35)%760;c.fillRect(x,y,3+i%4,3+i%2)}for(let i=0;i<4;i++)ring(245,370,65+i*43,3);line([[60,720],[220,420],[350,585],[480,240]],17)}
 if(id==="drift"){for(let i=0;i<6;i++)line([[0,220+i*35],[280,430+i*35],[512,310+i*35]],15);ring(320,220,105,8);line([[10,800],[230,510],[500,800]],44)}
 if(id==="maze"){for(let x=40;x<480;x+=68)for(let y=80;y<750;y+=68){if((x+y)%3)line([[x,y],[x+42,y],[x+42,y+40]],6);else ring(x,y,8)}}
 if(id==="abyss"){for(let i=0;i<7;i++)ring(260,420,32+i*31,4);line([[260,420],[419,285]],9);for(let i=0;i<5;i++)ring(100+i*72,180+(i*97)%350,10)}
 if(id==="beat"){for(let i=0;i<9;i++){const h=80+(i*97)%290;c.fillRect(i*54+16,630-h,29,h)}for(let i=0;i<5;i++)line([[25,150+i*29],[160,185+i*29],[320,112+i*29],[492,170+i*29]],7)}
 c.globalAlpha=1;c.fillStyle="#eeddb6";c.font="900 39px monospace";c.textAlign="center";c.save();c.translate(256,820);c.rotate(-Math.PI/2);c.fillText(label,0,0);c.restore();c.strokeStyle=accent;c.lineWidth=5;c.strokeRect(14,15,484,994);c.restore();
}
export function finishCabinet(T,g,cfg,w,h){
 const metal=new T.MeshStandardMaterial({color:0x9d8a69,metalness:.7,roughness:.3}),rubber=new T.MeshStandardMaterial({color:0x141820,roughness:.72}),accent=new T.MeshStandardMaterial({color:cfg.accent,emissive:cfg.accent,emissiveIntensity:.18,roughness:.45});
 const box=(name,x,y,z,W,H,D,m)=>{let o=new T.Mesh(new T.BoxGeometry(W,H,D),m);o.name=name;o.position.set(x,y,z);g.add(o);return o};
 const ring=(name,x,y,z,r,t,m)=>{let o=new T.Mesh(new T.TorusGeometry(r,t,8,32),m);o.name=name;o.position.set(x,y,z);g.add(o);return o};
 for(let i=0;i<7;i++)box("speaker-slot",0,.72+i*.027,.49,w*.38,.011,.014,rubber);
 for(let x of [-w*.38,w*.38])for(let y of [.15,.81,h-.2]){let screw=new T.Mesh(new T.CylinderGeometry(.013,.013,.012,8),metal);screw.rotation.x=Math.PI/2;screw.position.set(x,y,.48);g.add(screw)}
 box("coin-return",0,.38,.50,.16,.08,.042,metal);box("coin-return-recess",0,.38,.526,.12,.048,.012,rubber);
 if(cfg.id==="drift"){const seat=new T.Mesh(new T.CapsuleGeometry(.28,.30,5,12),rubber);seat.rotation.z=Math.PI/2;seat.position.set(0,.49,.93);g.add(seat);box("seat-base",0,.24,.94,.43,.45,.50,metal);box("racer-pedal-deck",0,.13,.64,.55,.12,.36,rubber);for(let x of [-.12,.12])box("brake-accelerator",x,.24,.69,.12,.13,.035,metal).rotation.x=-.5;}
 if(cfg.id==="nebula"){for(let x of [-w*.41,w*.41])box("wing-fin",x,h-.44,.43,.06,.43,.19,accent).rotation.z=x>0?-.2:.2}
 if(cfg.id==="maze"){for(let x of [-w*.25,w*.25])ring("maze-badge",x,h-.43,.52,.071,.018,accent)}
 if(cfg.id==="abyss"){for(let x of [-w*.37,w*.37]){ring("sonar-fastener",x,1.49,.57,.053,.015,metal);box("reinforced-rib",x,1.86,.45,.075,.52,.10,metal)}}
 if(cfg.id==="beat"){for(let x of [-w*.37,w*.37]){ring("speaker-rim",x,1.84,.56,.12,.014,metal);ring("speaker-cone",x,1.84,.565,.07,.022,rubber)}}
}
export function finishRoom(T,room){
 const wood=new T.MeshStandardMaterial({color:0x523b31,roughness:.73}),bronze=new T.MeshStandardMaterial({color:0xaa7950,metalness:.64,roughness:.4}),dark=new T.MeshStandardMaterial({color:0x121a24,roughness:.88});
 const box=(n,w,h,d,x,y,z,m)=>{let a=new T.Mesh(new T.BoxGeometry(w,h,d),m);a.position.set(x,y,z);a.name=n;room.add(a);return a};
 // Designed carpet runner: restrained period geometry rather than random noise.
 const c=document.createElement("canvas");c.width=256;c.height=512;const x=c.getContext("2d");x.fillStyle="#292237";x.fillRect(0,0,256,512);for(let j=0;j<8;j++){let y=j*64;x.strokeStyle=j%2?"#764f63":"#586274";x.lineWidth=4;x.beginPath();x.moveTo(20,y);x.lineTo(128,y+52);x.lineTo(236,y);x.stroke()}x.fillStyle="#b18b67";x.fillRect(6,0,4,512);x.fillRect(246,0,4,512);
 const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;tex.wrapT=T.RepeatWrapping;tex.repeat.set(1,4);const carpet=new T.Mesh(new T.PlaneGeometry(3.2,13.1),new T.MeshStandardMaterial({map:tex,roughness:.98}));carpet.rotation.x=-Math.PI/2;carpet.position.set(0,.012,0);room.add(carpet);
 // Acoustic panels and wall composition. Keep a broad unobstructed center aisle.
 for(const side of [-1,1])for(let z of [-3.3,.9,4.8]){box("wall-panel",.07,1.18,1.8,side*6.22,3,z,dark);for(let j=0;j<8;j++)box("walnut-batten",.05,1.12,.025,side*6.16,3,z-.78+j*.22,wood)}
 for(const z of [-6.5,-2.2,2.2,6.5]){box("ceiling-light-trough",2.9,.12,.31,0,5.05,z,dark);const l=new T.Mesh(new T.BoxGeometry(2.65,.025,.13),new T.MeshBasicMaterial({color:0xffd4a0}));l.position.set(0,4.97,z);room.add(l)}
 for(const side of [-1,1]){for(let i=0;i<5;i++)box("vent-louver",.075,.028,.9,side*6.22,4.31+i*.08,-1.8,bronze)}
 const sign=document.createElement("canvas");sign.width=1024;sign.height=256;const q=sign.getContext("2d");q.fillStyle="#10242b";q.fillRect(0,0,1024,256);q.strokeStyle="#82c8ba";q.lineWidth=9;q.strokeRect(16,16,992,224);q.fillStyle="#f5d6a0";q.font="900 70px monospace";q.textAlign="center";q.fillText("OPEN  /  1986",512,112);q.font="30px monospace";q.fillText("TOKENS   •   HIGH SCORES",512,178);const t=new T.CanvasTexture(sign);t.colorSpace=T.SRGBColorSpace;const poster=new T.Mesh(new T.PlaneGeometry(2.5,.62),new T.MeshBasicMaterial({map:t}));poster.position.set(0,2.25,-8.60);room.add(poster);
}
