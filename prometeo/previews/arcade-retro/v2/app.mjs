import * as THREE from "three";
import {makeCabinet} from "./cabinet.mjs";
import {startFallback} from "./fallback.mjs";

// Arcade Retro V2, Wave 002. Original room/game, manufactured V1 cabinet reused intact.
// Rendering requirements: WebGL2 and an ES-module-capable browser. No compressed JS boot.
const root=document.querySelector("#stage");
const notice=document.querySelector("#notice");
const title=document.querySelector("#machineTitle");
const subtitle=document.querySelector("#machineSub");
const playButton=document.querySelector("#play");
const mediaButton=document.querySelector("#media");
const ownButton=document.querySelector("#own");
const clearButton=document.querySelector("#clearMedia");
const qa=window.__ARCADE_V2_QA__={status:"BOOT",frames:0,machineCount:0,screenFrames:0,inputs:0,score:0,collisionChecks:0,mediaMode:"builtin",browserWebGL2:false};
function error(category,e){qa.status=category;notice.textContent=category+" · "+String(e?.message||e);notice.hidden=false;console.error(category,e);}
function clamp(x,a,b){return Math.max(a,Math.min(b,x));}
function mat(hex,metal=.1,rough=.65,emissive=0){return new THREE.MeshStandardMaterial({color:hex,metalness:metal,roughness:rough,emissive:hex,emissiveIntensity:emissive});}
const profiles=[
 {id:"signal",label:"SIGNAL / 86",sub:"Lost Frequency",accent:"#ff769d",color:0x294447,type:"signal"},
 {id:"nebula",label:"NEBULA RUN",sub:"Juego: esquivá y dispará",accent:"#7af7d6",color:0x24314e,type:"shooter"},
 {id:"drift",label:"OUTRUN / 1987",sub:"Carreras de medianoche",accent:"#ffb96c",color:0x513246,type:"racer"},
 {id:"maze",label:"PHANTOM MAZE",sub:"Laberinto eléctrico",accent:"#ac8cff",color:0x39304f,type:"maze"},
 {id:"abyss",label:"ABYSS / 02",sub:"Radar del océano",accent:"#77c9ff",color:0x173e4d,type:"sonar"},
 {id:"beat",label:"BEAT CIRCUIT",sub:"Ritmo analógico",accent:"#ff77cb",color:0x453047,type:"rhythm"}
];
const audio={ctx:null};
function beep(f=330,d=.1){try{const A=window.AudioContext||window.webkitAudioContext;if(!A)return;if(!audio.ctx)audio.ctx=new A();audio.ctx.resume();const o=audio.ctx.createOscillator(),v=audio.ctx.createGain(),n=audio.ctx.currentTime;o.type="triangle";o.frequency.setValueAtTime(f,n);o.frequency.exponentialRampToValueAtTime(Math.max(80,f*.56),n+d);v.gain.setValueAtTime(.025,n);v.gain.exponentialRampToValueAtTime(.0001,n+d);o.connect(v).connect(audio.ctx.destination);o.start(n);o.stop(n+d+.005);}catch(_){}}
function drawnText(c,str,x,y,size=24,color="#edf9e4",align="center"){c.textAlign=align;c.font="900 "+size+"px system-ui,monospace";c.fillStyle=color;c.fillText(str,x,y);}
function textTexture(text,ink="#ffdcae",edge="#9e5972",w=1024,h=256){
 const c=document.createElement("canvas");c.width=w;c.height=h;const x=c.getContext("2d");
 const grad=x.createLinearGradient(0,0,w,h);grad.addColorStop(0,"#271d33");grad.addColorStop(.5,"#0d1524");grad.addColorStop(1,"#25172b");
 x.fillStyle=grad;x.fillRect(0,0,w,h);x.strokeStyle=edge;x.lineWidth=18;x.strokeRect(18,18,w-36,h-36);
 drawnText(x,text,w/2,h*.61,text.length>15?75:99,ink);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
function screenSurface(id){
 const canvas=document.createElement("canvas");canvas.width=640;canvas.height=480;
 const c=canvas.getContext("2d");const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=2;
 const s={texture:tex,canvas,ctx:c,id,time:0,frameCount:0,media:null,mediaUrl:null,htmlLabel:null};
 s.draw=(now,game)=>{
   s.time=now;const w=640,h=480,t=now;const accent=profiles.find(v=>v.id===id).accent;
   const grd=c.createLinearGradient(0,0,640,480);grd.addColorStop(0,"#050e22");grd.addColorStop(1,"#241125");
   c.fillStyle=grd;c.fillRect(0,0,w,h);
   c.strokeStyle="rgba(135,188,220,.09)";c.lineWidth=1;
   for(let x=0;x<w;x+=32){c.beginPath();c.moveTo(x,0);c.lineTo(x,h);c.stroke();}
   for(let y=0;y<h;y+=32){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();}
   if(s.media&&s.media.readyState>=2||s.media&&s.media.complete&&s.media.naturalWidth){
     try{c.drawImage(s.media,0,0,w,h);}catch(_){}
   }else if(s.htmlLabel){
     drawnText(c,"CUSTOM GAME",320,190,44,accent);drawnText(c,s.htmlLabel.slice(0,24).toUpperCase(),320,255,21);
     drawnText(c,"ABRIR DESDE EL PANEL",320,322,17,"#bde3da");
   }else if(id==="nebula"){
     c.fillStyle="#d7e8ff";
     for(let i=0;i<55;i++){let sx=(i*293+Math.sin(t*.3+i)*50)%640,sy=(i*173+t*(14+i%5*10))%480;c.fillRect(sx,sy,1+i%3,1+i%3);}
     const bullets=game.bullets;for(const b of bullets){c.fillStyle="#fffaa6";c.fillRect(b.x-3,b.y-17,6,18);}
     for(const e of game.enemies){c.fillStyle="#ff6eac";c.beginPath();c.moveTo(e.x,e.y+16);c.lineTo(e.x-24,e.y-12);c.lineTo(e.x+24,e.y-12);c.closePath();c.fill();c.strokeStyle="#ffe2a6";c.stroke();}
     c.save();c.translate(game.x,413);c.shadowBlur=17;c.shadowColor="#75f9e0";c.fillStyle="#a6ffe9";c.beginPath();c.moveTo(0,-33);c.lineTo(-24,23);c.lineTo(0,12);c.lineTo(24,23);c.closePath();c.fill();c.restore();
     drawnText(c,"NEBULA RUN  /  "+String(game.score).padStart(5,"0"),320,39,22);
     if(!game.playing)drawnText(c,"PULSÁ JUGAR",320,245,29,"#ffdcaa");
     if(game.over)drawnText(c,"FIN DE PARTIDA  ·  REINICIAR",320,257,20,"#ff9caa");
   }else if(id==="drift"){
     c.fillStyle="#241632";c.fillRect(0,0,640,240);c.fillStyle="#e1798b";c.beginPath();c.arc(465,132,78,0,Math.PI*2);c.fill();
     for(let i=0;i<9;i++){let h=90+(i*51)%100;c.fillStyle=i%2?"#18263a":"#17273e";c.fillRect(i*82-12,238-h,67,h);}
     c.fillStyle="#171625";c.beginPath();c.moveTo(285,240);c.lineTo(355,240);c.lineTo(700,480);c.lineTo(-80,480);c.closePath();c.fill();
     c.strokeStyle="#ffe7a6";c.lineWidth=7;for(let j=0;j<6;j++){let zz=((j*.2+t*.33)%1);let y=240+zz*zz*250;c.beginPath();c.moveTo(318,y);c.lineTo(322,y+18*zz);c.stroke();}
     c.fillStyle="#ffad6f";c.fillRect(222+Math.sin(t)*80,356,82,35);drawnText(c,"O U T R U N",320,55,43,"#ffe1a8");
   }else if(id==="maze"){
     c.strokeStyle=accent;c.lineWidth=8;for(let x=85;x<590;x+=62)for(let y=88;y<398;y+=62){if((x+y/2)%5<2.8){c.beginPath();c.moveTo(x,y);c.lineTo(x+45,y);c.stroke();}else{c.beginPath();c.moveTo(x,y);c.lineTo(x,y+45);c.stroke();}}
     const px=320+Math.cos(t*.8)*140,py=245+Math.sin(t*.91)*100;c.fillStyle="#ffd990";c.beginPath();c.arc(px,py,21,.1+t%1,Math.PI*1.9+t%1);c.lineTo(px,py);c.fill();
     drawnText(c,"PHANTOM MAZE",320,47,29);
   }else if(id==="sonar"){
     c.strokeStyle="rgba(83,225,244,.45)";c.lineWidth=3;for(let r=40;r<=185;r+=40){c.beginPath();c.arc(320,242,r,0,7);c.stroke();}
     c.save();c.translate(320,242);c.rotate(t*.8);c.fillStyle="rgba(100,240,216,.18)";c.beginPath();c.moveTo(0,0);c.arc(0,0,188,-.8,0);c.closePath();c.fill();c.strokeStyle="#8effe0";c.beginPath();c.moveTo(0,0);c.lineTo(190,0);c.stroke();c.restore();
     for(let i=0;i<5;i++){c.fillStyle="#b3ffc8";c.beginPath();c.arc(210+Math.cos(i*2.4)*100,240+Math.sin(i*1.8)*110,4,0,7);c.fill();}
     drawnText(c,"ABYSS  /  DEEP SCAN",320,49,24);
   }else if(id==="rhythm"){
     for(let k=0;k<5;k++){let x=85+k*103;c.fillStyle=k%2?"#6e294f":"#303769";c.fillRect(x,90,82,300);c.strokeStyle=accent;c.lineWidth=3;c.strokeRect(x,90,82,300);
       for(let i=0;i<4;i++){let y=100+((i*127+t*(65+k*9))%288);c.fillStyle=i%2?"#8af7e1":"#ff9ad3";c.fillRect(x+5,y,72,10);}}
     c.fillStyle="#f1e6a3";c.fillRect(72,374,496,7);drawnText(c,"BEAT CIRCUIT",320,50,27);
   }else{
     drawnText(c,"SIGNAL / 86",320,40,28,accent);for(let i=0;i<8;i++){let a=t*.3+i*2.3;c.strokeStyle=i%2?"#ec729c":"#8bf6d7";c.lineWidth=4;c.strokeRect(260+Math.sin(a)*120,175+Math.cos(a)*80,25+i*3,25+i*3);}
   }
   c.fillStyle="rgba(0,0,0,.12)";for(let y=0;y<h;y+=4)c.fillRect(0,y,w,1);
   const v=c.createRadialGradient(320,235,75,320,235,430);v.addColorStop(0,"#00000000");v.addColorStop(1,"#000000c9");c.fillStyle=v;c.fillRect(0,0,w,h);
   tex.needsUpdate=true;s.frameCount++;
 };
 return s;
}
function finishScreen(group,surface,y=1.48,z=.53,w=.69,h=.52){
 const border=new THREE.Mesh(new THREE.BoxGeometry(w+.1,h+.1,.052),mat(0x090d1b,.35,.4));border.position.set(0,y,z-.03);group.add(border);
 const curved=new THREE.PlaneGeometry(w,h,16,12);const p=curved.attributes.position;
 for(let i=0;i<p.count;i++){const x=p.getX(i)/w,yy=p.getY(i)/h;p.setZ(i,.025*(1-2*x*x-2*yy*yy));}curved.computeVertexNormals();
 const mesh=new THREE.Mesh(curved,new THREE.MeshBasicMaterial({map:surface.texture,side:THREE.DoubleSide}));mesh.position.set(0,y,z);mesh.name="CRT "+surface.id;mesh.userData.machineId=surface.id;group.add(mesh);return mesh;
}
function meshBox(parent,w,h,d,x,y,z,m){
 const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;
}
function makeAlternateCabinet(cfg,idx){
 const g=new THREE.Group();g.name="manufactured-"+cfg.id;
 const w=[.82,.91,.85,1.03,1.19][idx-1],height=[2.36,2.13,2.33,2.54,2.21][idx-1];
 const side=[[-.39,0],[.41,0],[.46,.16],[.46,height-.26],[.34,height],[-.37,height],[-.47,height-.18],[-.36,1.55],[-.54,1.18],[-.52,1.04],[-.40,.9]];
 const shape=new THREE.Shape();shape.moveTo(...side[0]);for(let i=1;i<side.length;i++)shape.lineTo(...side[i]);shape.closePath();
 const bodygeo=new THREE.ExtrudeGeometry(shape,{depth:w,bevelEnabled:true,bevelThickness:.018,bevelSize:.012,bevelSegments:2});bodygeo.rotateY(Math.PI/2);bodygeo.translate(-w/2,0,0);
 const shell=new THREE.Mesh(bodygeo,mat(cfg.color,.38,.4));shell.castShadow=true;shell.receiveShadow=true;g.add(shell);
 // Each cabinet receives original individually painted side graphics.
 const c=document.createElement("canvas");c.width=512;c.height=1024;const ct=c.getContext("2d");
 ct.fillStyle="#1c2434";ct.fillRect(0,0,512,1024);const grad=ct.createLinearGradient(0,0,512,1024);grad.addColorStop(0,cfg.accent);grad.addColorStop(1,"#0d1627");ct.globalAlpha=.64;ct.fillStyle=grad;ct.fillRect(0,0,512,1024);ct.globalAlpha=1;
 for(let k=0;k<9;k++){ct.strokeStyle=k%2?"#172032":cfg.accent;ct.lineWidth=6+k%3*3;ct.beginPath();ct.arc(250,470,70+k*30,k*.24,k*.24+Math.PI*.95);ct.stroke();}
 ct.save();ct.translate(255,765);ct.rotate(-Math.PI/2);drawnText(ct,cfg.label,0,0,36);ct.restore();
 const art=new THREE.CanvasTexture(c);art.colorSpace=THREE.SRGBColorSpace;
 const sideMat=new THREE.MeshStandardMaterial({map:art,metalness:.16,roughness:.47,polygonOffset:true,polygonOffsetFactor:-1,side:THREE.DoubleSide});
 for(const x of [-w/2-.018,w/2+.018]){let geo=new THREE.ShapeGeometry(shape),p=geo.attributes.position,uv=geo.attributes.uv;for(let j=0;j<p.count;j++)uv.setXY(j,(p.getX(j)+.58)/1.2,p.getY(j)/height);geo.rotateY(Math.PI/2);geo.translate(x,0,0);g.add(new THREE.Mesh(geo,sideMat));}
 const rim=mat(0xbfa784,.66,.24),black=mat(0x0a1020,.3,.5),glow=new THREE.MeshBasicMaterial({color:new THREE.Color(cfg.accent)});
 for(const x of [-w/2,w/2]){const line=side.map(v=>new THREE.Vector3(x,v[1],-v[0]));const geo=new THREE.TubeGeometry(new THREE.CatmullRomCurve3([...line,line[0]],true),80,.011,5,true);g.add(new THREE.Mesh(geo,rim));}
 meshBox(g,w*.94,.05,.33,0,1.03,.52,black).rotation.x=-.4;
 meshBox(g,w*.85,.022,.28,0,1.072,.55,mat(cfg.color,.4,.3));
 const surface=screenSurface(cfg.id),monitor=finishScreen(g,surface,1.49,.505,w*.8,.52);
 const t=textTexture(cfg.label,"#f8e5b6",cfg.accent);
 const marquee=new THREE.Mesh(new THREE.PlaneGeometry(w*.87,.19),new THREE.MeshBasicMaterial({map:t}));marquee.position.set(0,height-.155,.48);g.add(marquee);
 const marqueeBar=meshBox(g,w*.93,.025,.045,0,height-.28,.48,glow);
 meshBox(g,.29,.2,.02,0,.54,.47,black);
 for(const x of [-.07,.07])meshBox(g,.016,.08,.019,x,.54,.485,rim);
 if(idx===2){ // wheel rim and bespoke racer console
   const wheel=new THREE.Mesh(new THREE.TorusGeometry(.125,.026,8,28),black);wheel.position.set(-.13,1.17,.66);wheel.rotation.x=-.7;g.add(wheel);
   const hub=new THREE.Mesh(new THREE.CylinderGeometry(.055,.055,.06,18),rim);hub.position.set(-.13,1.18,.66);hub.rotation.x=Math.PI/2;g.add(hub);
   for(let j=0;j<2;j++)meshBox(g,.12,.03,.13,.16,1.10,.54+j*.12,black);
 }else if(idx===4){ // sonar has ocular housing, prongs, and sensor crown
   const ring=new THREE.Mesh(new THREE.TorusGeometry(.31,.039,10,36),rim);ring.position.set(0,1.49,.56);g.add(ring);
   for(let x of [-.29,.29])meshBox(g,.055,.43,.09,x,height-.30,.13,black);
   meshBox(g,.40,.08,.22,0,height+.04,-.03,glow);
 }else if(idx===5){ // rhythm machine has oversized beat pads and speaker units
   for(let k=0;k<5;k++)meshBox(g,.135,.03,.13,-.37+k*.185,1.105,.60,mat(k%2?0xf172b2:0x8eeed6,.25,.29));
   for(let x of [-.39,.39]){const sp=new THREE.Mesh(new THREE.TorusGeometry(.115,.024,10,24),black);sp.position.set(x,1.84,.53);g.add(sp);}
 }else{
   const stem=new THREE.Mesh(new THREE.CylinderGeometry(.016,.017,.15,14),rim);stem.position.set(-.18,1.16,.59);g.add(stem);
   const knob=new THREE.Mesh(new THREE.SphereGeometry(.045,14,10),glow);knob.position.set(-.18,1.24,.59);g.add(knob);
   for(let k=0;k<3;k++){const b=new THREE.Mesh(new THREE.CylinderGeometry(.039,.04,.028,20),mat(k===1?0xeccf93:0x8be8cf,.35,.24));b.position.set(.05+k*.13,1.104,.60);g.add(b);}
 }
 g.add(new THREE.PointLight(new THREE.Color(cfg.accent),.7,2.3));
 return {group:g,screen:surface,monitor,cfg};
}
const game={playing:false,over:false,x:320,score:0,lives:3,bullets:[],enemies:[],spawn:0,shot:0,keys:{left:false,right:false,fire:false}};
function resetGame(){Object.assign(game,{playing:true,over:false,x:320,score:0,lives:3,bullets:[],enemies:[],spawn:0,shot:0});qa.score=0;}
function tickGame(dt){if(!game.playing)return;
 game.x=clamp(game.x+(Number(game.keys.right)-Number(game.keys.left))*320*dt,24,616);game.shot-=dt;game.spawn-=dt;
 if(game.keys.fire&&game.shot<=0){game.bullets.push({x:game.x,y:382});game.shot=.19;beep(530,.055);}
 if(game.spawn<=0){game.enemies.push({x:65+Math.random()*510,y:-15,speed:65+Math.random()*90});game.spawn=clamp(.75-game.score/1200,.22,.75);}
 for(const b of game.bullets)b.y-=360*dt;for(const e of game.enemies)e.y+=e.speed*dt;
 for(const e of game.enemies)for(const b of game.bullets){if(!b.hit&&!e.hit&&Math.abs(e.x-b.x)<27&&Math.abs(e.y-b.y)<23){e.hit=b.hit=true;game.score+=10;qa.score=game.score;beep(740,.08);}}
 for(const e of game.enemies){if(!e.hit&&e.y>425){e.hit=true;game.lives--;beep(130,.18);}}
 game.bullets=game.bullets.filter(b=>b.y>-25&&!b.hit);game.enemies=game.enemies.filter(e=>e.y<480&&!e.hit);
 if(game.lives<=0){game.playing=false;game.over=true;}
}
const rendererReady=(()=>{try{const c=document.createElement("canvas");return !!c.getContext("webgl2");}catch{return false;}})();
if(!rendererReady){startFallback(root,qa);}
else {
 qa.browserWebGL2=true;
 try{start3d();}catch(e){error("RUNTIME",e);startFallback(root,qa);}
}
function start3d(){
 const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"});
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.36;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.45));root.appendChild(renderer.domElement);
 renderer.domElement.addEventListener("webglcontextlost",e=>{e.preventDefault();error("CONTEXT_LOST","Se perdió el contexto gráfico.");});
 renderer.domElement.addEventListener("webglcontextrestored",()=>location.reload());
 const scene=new THREE.Scene();scene.background=new THREE.Color(0x0a0b15);scene.fog=new THREE.FogExp2(0x0a0b15,.023);
 const camera=new THREE.PerspectiveCamera(68,1,.07,95);
 const room=new THREE.Group();scene.add(room);
 scene.add(new THREE.HemisphereLight(0x8b9ac0,0x28232e,1.15));
 const overhead=new THREE.SpotLight(0xffddb8,55,19,Math.PI/4,.8,1);overhead.position.set(0,7,0);overhead.target.position.set(0,0,0);overhead.castShadow=true;overhead.shadow.mapSize.set(1024,1024);scene.add(overhead,overhead.target);
 for(const [x,z,color] of [[-4,0,0x72c9e8],[4,-3,0xd252aa],[0,4,0xe4a75d]]){let L=new THREE.PointLight(color,13,7,2);L.position.set(x,3.1,z);scene.add(L);}
 const dark=mat(0x111721,.15,.8),tileDark=mat(0x1d2630,.05,.35),brass=mat(0xae8059,.6,.32),glass=mat(0x6dbbc5,.48,.12),trim=mat(0x424754,.6,.27);
 meshBox(room,12.8,.23,17.6,0,-.14,0,dark);
 const tCanvas=document.createElement("canvas");tCanvas.width=tCanvas.height=512;const tc=tCanvas.getContext("2d");
 for(let y=0;y<8;y++)for(let x=0;x<8;x++){tc.fillStyle=(x+y)%2?"#1c2832":"#25222c";tc.fillRect(x*64,y*64,64,64);tc.fillStyle="#ffffff0b";tc.fillRect(x*64+2,y*64+2,60,2);}
 const floorMap=new THREE.CanvasTexture(tCanvas);floorMap.colorSpace=THREE.SRGBColorSpace;floorMap.wrapS=floorMap.wrapT=THREE.RepeatWrapping;floorMap.repeat.set(5,7);floorMap.anisotropy=4;
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(12.8,17.6),new THREE.MeshStandardMaterial({map:floorMap,metalness:.28,roughness:.38}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;room.add(floor);
 // Architecturally enclosed room: intentional colliders, ceiling, side wall treatment and neon cornice.
 for(const [x,z,w,d] of [[-6.4,0,.2,17.6],[6.4,0,.2,17.6],[0,-8.8,12.8,.2],[0,8.8,12.8,.2]]){
   meshBox(room,w,5.2,d,x,2.6,z,mat(0x171d2b,.1,.87));meshBox(room,w+.025,1.05,d+.025,x,.53,z,mat(0x3a2731,.1,.57));
   meshBox(room,w+.035,.07,d+.04,x,1.06,z,brass);meshBox(room,w+.035,.065,d+.04,x,3.72,z,trim);
 }
 meshBox(room,12.8,.19,17.6,0,5.38,0,dark);
 for(let x=-6;x<=6;x+=1.6){meshBox(room,.045,.05,17.5,x,5.22,0,trim);}
 for(let z=-8;z<=8;z+=2){meshBox(room,12.7,.05,.047,0,5.19,z,trim);}
 function neonLine(w,h,d,x,y,z,color){
   const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshBasicMaterial({color}));m.position.set(x,y,z);room.add(m);
 }
 for(let z=-7;z<=7;z+=3.5){neonLine(.09,.07,16.7,-6.24,3.88,0,0x4eb7c5);neonLine(.09,.07,16.7,6.24,3.88,0,0xb45a96);break;}
 for(let z=-6.5;z<7;z+=4.4){neonLine(2.6,.06,.08,0,5.12,z,0xdfa877);}
 // Recessed entry, baffles, stylized glass panel and exterior slice for spatial depth.
 meshBox(room,2.45,3.35,.08,0,1.67,8.66,mat(0x101724,.2,.2));
 for(let x of [-1.24,1.24])meshBox(room,.075,3.58,.17,x,1.77,8.54,brass);
 meshBox(room,2.37,.055,.16,0,3.48,8.54,brass);
 meshBox(room,.85,1.45,.035,0,2.24,8.59,glass);
 const EXIT=textTexture("EXIT","#b5f2c5","#3f9572");const exitSign=new THREE.Mesh(new THREE.PlaneGeometry(1.45,.32),new THREE.MeshBasicMaterial({map:EXIT}));exitSign.position.set(0,4.09,8.57);exitSign.rotation.y=Math.PI;room.add(exitSign);
 function wallPoster(label,z,xSide,tint){
   const face=textTexture(label,"#f6d5aa",tint,740,500);
   const f=new THREE.Mesh(new THREE.PlaneGeometry(1.55,1.05),new THREE.MeshBasicMaterial({map:face}));
   f.position.set(xSide*6.26,2.53,z);f.rotation.y=-xSide*Math.PI/2;room.add(f);
   const outer=meshBox(room,.07,1.17,1.68,xSide*6.30,2.53,z,brass);
 }
 wallPoster("HIGH SCORE",-6,-1,"#b65c8b");wallPoster("INSERT COIN",6,1,"#5bb8bc");
 const hanging=textTexture("THE LAST ARCADE","#e9dfb3","#e2639c",1024,256);
 const backSign=new THREE.Mesh(new THREE.PlaneGeometry(5.6,1.37),new THREE.MeshBasicMaterial({map:hanging}));backSign.position.set(0,3.65,-8.65);room.add(backSign);
 // Extra set dressing: stools, ticket counter, pin board, ventilation and ceiling lights.
 const vinyl=mat(0x7b365b,.3,.45);
 for(const [x,z] of [[-2.15,-6.5],[2.2,-6.7],[-2.3,6.45],[2.25,6.3]]){
   const stool=new THREE.Group();stool.position.set(x,0,z);room.add(stool);
   const seat=new THREE.Mesh(new THREE.CylinderGeometry(.31,.29,.13,24),vinyl);seat.position.y=.68;stool.add(seat);
   const leg=new THREE.Mesh(new THREE.CylinderGeometry(.036,.045,.64,10),brass);leg.position.y=.33;stool.add(leg);
   const base=new THREE.Mesh(new THREE.TorusGeometry(.24,.025,8,22),brass);base.position.y=.12;base.rotation.x=Math.PI/2;stool.add(base);
 }
 meshBox(room,2.1,.82,.75,-4.7,.41,-7.05,mat(0x59473f,.2,.45));meshBox(room,2.17,.1,.8,-4.7,.9,-7.05,brass);
 meshBox(room,1.35,1.24,.65,4.83,.62,-7.06,mat(0x34434d,.4,.33));neonLine(.9,.14,.025,4.83,1.1,-6.7,0x79dee0);
 for(let x of [-4.7,4.7]){const l=new THREE.PointLight(x<0?0xffbe7e:0x83d9ff,5,4);l.position.set(x,2.8,-6.7);scene.add(l);}
 for(let x of [-4.6,4.6])for(let z of [-7.7,7.7])meshBox(room,.23,5,.23,x,2.5,z,trim);
 const machines=[];
 for(let i=0;i<profiles.length;i++){
   const cfg=profiles[i];const obj=i===0?makeCabinet({mode:"signal"}):makeAlternateCabinet(cfg,i);
   const group=obj.group;
   const side=i%2===0?-1:1;const slot=Math.floor(i/2);
   group.position.set(side*4.72,0,-4.7+slot*4.5);group.rotation.y=side===-1?Math.PI/2:-Math.PI/2;
   scene.add(group);
   const m={...obj,cfg,index:i,front:new THREE.Vector3(side===-1?1:-1,0,0),zone:new THREE.Vector3(group.position.x,0,group.position.z)};
   if(i===0){ // The V1 CRT stays alive; use its documented live-surface update.
     const v1crt=group.getObjectByName("live-CRT-on-curved-mesh");m.monitor=v1crt;
   }
   machines.push(m);
 }
 qa.machineCount=machines.length;
 const player={pos:new THREE.Vector3(0,1.65,6.95),yaw:0,pitch:0,keys:{},focus:null,drag:false,previous:{x:0,y:0},moved:0};
 const pressed=new Set();let selected=1,playing=false,mediaObjectUrl=null,lastFrame=performance.now(),screenTick=0;
 function setSelected(i,approach=true){
   selected=(i+machines.length)%machines.length;const m=machines[selected];title.textContent=m.cfg.label;subtitle.textContent=m.cfg.sub;
   document.querySelector("#counter").textContent=String(selected+1).padStart(2,"0")+" / 06";
   const target=m.zone.clone().addScaledVector(m.front,1.9);target.y=1.62;
   if(approach)player.focus={position:target,yaw:Math.atan2(m.zone.x-target.x,target.z-m.zone.z)};
   playButton.textContent=selected===1?(game.playing?"SALIR DEL JUEGO":"JUGAR"):"INTERACTUAR";
 }
 function interact(){
   if(selected===1){if(!game.playing){resetGame();playing=true;playButton.textContent="SALIR DEL JUEGO";}else{game.playing=false;playing=false;playButton.textContent="JUGAR";}beep(560,.12);}
   else {beep(250+selected*50,.18);if(selected===0)machines[0].input("fire");else setSelected(selected,true);}
 }
 function rotateCamera(dx,dy){player.focus=null;player.yaw-=dx*.0032;player.pitch=clamp(player.pitch-dy*.003,-.86,.85);}
 function onKey(e,on){
   const k=e.code;const movement=["KeyW","KeyA","KeyS","KeyD","ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"];
   if(movement.includes(k))e.preventDefault();
   player.keys[k]=on;
   if(selected===1&&game.playing){
     if(k==="ArrowLeft"||k==="KeyA")game.keys.left=on;
     if(k==="ArrowRight"||k==="KeyD")game.keys.right=on;
     if(k==="Space")game.keys.fire=on;
   }
   if(on&&!e.repeat){if(k==="KeyE"||k==="Enter")interact();if(k==="Escape"){game.playing=false;document.querySelector("#gameLayer").hidden=true;}if(k==="Tab"){e.preventDefault();setSelected(selected+1);}}
 }
 addEventListener("keydown",e=>onKey(e,true));addEventListener("keyup",e=>onKey(e,false));
 const pointer={down:false,startX:0,startY:0,lastX:0,lastY:0,moved:0};
 renderer.domElement.addEventListener("pointerdown",e=>{pointer.down=true;pointer.startX=pointer.lastX=e.clientX;pointer.startY=pointer.lastY=e.clientY;pointer.moved=0;renderer.domElement.setPointerCapture(e.pointerId);});
 renderer.domElement.addEventListener("pointermove",e=>{if(!pointer.down)return;const dx=e.clientX-pointer.lastX,dy=e.clientY-pointer.lastY;pointer.moved+=Math.abs(dx)+Math.abs(dy);pointer.lastX=e.clientX;pointer.lastY=e.clientY;if(pointer.moved>5)rotateCamera(dx,dy);});
 renderer.domElement.addEventListener("pointerup",e=>{pointer.down=false;if(pointer.moved>13)return;const r=renderer.domElement.getBoundingClientRect();const v=new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);const ray=new THREE.Raycaster();ray.setFromCamera(v,camera);
   const hits=ray.intersectObjects(machines.map(m=>m.group),true);if(hits.length){let node=hits[0].object;while(node.parent&&node.parent!==scene){node=node.parent;}const m=machines.find(x=>x.group===node);if(m){setSelected(m.index,true);beep(380,.07);}}});
 function attach(id,key){const b=document.querySelector(id);b.addEventListener("pointerdown",e=>{e.preventDefault();pressed.add(key);b.setPointerCapture(e.pointerId);if(game.playing){if(key==="left")game.keys.left=true;if(key==="right")game.keys.right=true;if(key==="fire")game.keys.fire=true;}});for(const ev of ["pointerup","pointercancel","lostpointercapture"])b.addEventListener(ev,()=>{pressed.delete(key);if(game.playing){if(key==="left")game.keys.left=false;if(key==="right")game.keys.right=false;if(key==="fire")game.keys.fire=false;}});}
 attach("#forward","forward");attach("#back","back");attach("#turnLeft","left");attach("#turnRight","right");attach("#fire","fire");
 document.querySelector("#prev").onclick=()=>setSelected(selected-1);document.querySelector("#next").onclick=()=>setSelected(selected+1);
 document.querySelector("#focus").onclick=()=>setSelected(selected,true);playButton.onclick=interact;
 const imageInput=document.querySelector("#imageInput");const gameInput=document.querySelector("#gameInput");
 mediaButton.onclick=()=>imageInput.click();ownButton.onclick=()=>gameInput.click();
 const htmlFrame=document.querySelector("#gameFrame"),gameLayer=document.querySelector("#gameLayer");
 document.querySelector("#closeGame").onclick=()=>{gameLayer.hidden=true;htmlFrame.src="about:blank";};
 imageInput.onchange=async()=>{const file=imageInput.files?.[0];if(!file)return;const m=machines[selected];const surface=selected===0?(m.overrideSurface||(m.overrideSurface=screenSurface("signal"))):m.screen;if(selected===0){m.monitor.material.map=surface.texture;m.monitor.material.needsUpdate=true;}
   if(mediaObjectUrl)URL.revokeObjectURL(mediaObjectUrl);mediaObjectUrl=URL.createObjectURL(file);surface.mediaUrl=mediaObjectUrl;surface.htmlLabel=null;
   if(file.type.startsWith("video/")){const vid=document.createElement("video");vid.src=mediaObjectUrl;vid.playsInline=true;vid.muted=true;vid.loop=true;vid.autoplay=true;surface.media=vid;try{await vid.play();}catch(e){error("MEDIA_AUTOPLAY",e);}qa.mediaMode="VIDEO_TEXTURE";}
   else{const img=new Image();img.src=mediaObjectUrl;surface.media=img;qa.mediaMode="IMAGE_TEXTURE";}
   clearButton.hidden=false;imageInput.value="";
 };
 gameInput.onchange=()=>{const file=gameInput.files?.[0];if(!file)return;const m=machines[selected];const surface=selected===0?(m.overrideSurface||(m.overrideSurface=screenSurface("signal"))):m.screen;if(selected===0){m.monitor.material.map=surface.texture;m.monitor.material.needsUpdate=true;}surface.media=null;surface.htmlLabel=file.name;htmlFrame.src=URL.createObjectURL(file);gameLayer.hidden=false;qa.mediaMode="HTML_GAME_OVERLAY";clearButton.hidden=false;gameInput.value="";};
 clearButton.onclick=()=>{for(const m of machines){for(const surface of [m.screen,m.overrideSurface]){if(surface?.media?.pause)surface.media.pause();if(surface){surface.media=null;surface.htmlLabel=null;}}if(m.overrideSurface){m.overrideSurface=null;m.monitor.material.map=m.screen.texture;m.monitor.material.needsUpdate=true;}}if(mediaObjectUrl){URL.revokeObjectURL(mediaObjectUrl);mediaObjectUrl=null;}htmlFrame.src="about:blank";gameLayer.hidden=true;clearButton.hidden=true;qa.mediaMode="builtin";};
 const resize=()=>{const w=Math.max(1,root.clientWidth),h=Math.max(1,root.clientHeight);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);};addEventListener("resize",resize);resize();
 setSelected(1,false);qa.status="SCENE_READY";
 function animate(now){
   requestAnimationFrame(animate);const dt=Math.min((now-lastFrame)/1000,.05);lastFrame=now;screenTick+=dt;
   tickGame(dt);
   if(player.focus){player.pos.lerp(player.focus.position,Math.min(1,dt*4));let delta=player.focus.yaw-player.yaw;delta=Math.atan2(Math.sin(delta),Math.cos(delta));player.yaw+=delta*Math.min(1,dt*4);player.pitch*=Math.max(0,1-dt*4);if(player.pos.distanceTo(player.focus.position)<.04)player.focus=null;}
   const f=Number(player.keys.KeyW||player.keys.ArrowUp||pressed.has("forward"))-Number(player.keys.KeyS||player.keys.ArrowDown||pressed.has("back"));
   const strafe=Number(player.keys.KeyD)-Number(player.keys.KeyA);
   const turn=Number(pressed.has("right"))-Number(pressed.has("left"));
   if(!game.playing&&turn){player.yaw+=turn*dt*1.7;player.focus=null;}
   if(!game.playing&&(f||strafe)){
     player.focus=null;const speed=dt*2.9;const next=player.pos.clone();next.x+=(Math.sin(player.yaw)*f+Math.cos(player.yaw)*strafe)*speed;next.z+=(-Math.cos(player.yaw)*f+Math.sin(player.yaw)*strafe)*speed;
     next.x=clamp(next.x,-5.8,5.8);next.z=clamp(next.z,-8,8);
     for(const m of machines){qa.collisionChecks++;const dx=next.x-m.zone.x,dz=next.z-m.zone.z;if(Math.hypot(dx,dz)<.82){next.x=player.pos.x;next.z=player.pos.z;break;}}
     player.pos.copy(next);
   }
   if(!game.playing&&pressed.has("fire")){interact();pressed.delete("fire");}
   const look=new THREE.Vector3(Math.sin(player.yaw)*Math.cos(player.pitch),Math.sin(player.pitch),-Math.cos(player.yaw)*Math.cos(player.pitch));
   camera.position.copy(player.pos);camera.lookAt(player.pos.clone().add(look));
   if(screenTick>.052){screenTick=0;
     machines.forEach((m,i)=>{if(i===0){m.update?.(.052);if(m.overrideSurface){m.overrideSurface.draw(now/1000,game);qa.screenFrames++;}}else{m.screen.draw(now/1000,game);qa.screenFrames++;}});
   }
   renderer.render(scene,camera);qa.frames++;qa.status="RENDERING";
 }
 requestAnimationFrame(animate);
}
