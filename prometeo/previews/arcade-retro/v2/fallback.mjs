// Explicit CPU Canvas2D fallback for browsers without WebGL2.
// This is not a fake 3D PASS. It is a functional interactive floorplan preview.
export function startFallback(root,qa){
 const canvas=document.createElement("canvas");canvas.setAttribute("aria-label","Vista alternativa 2D del salón");root.replaceChildren(canvas);
 const ctx=canvas.getContext("2d"),items=[
  ["SIGNAL / 86","#fa7f9e"],["NEBULA RUN","#88e6d7"],["OUTRUN / 1987","#fcb77b"],
  ["PHANTOM MAZE","#ad99ff"],["ABYSS / 02","#7dd5ec"],["BEAT CIRCUIT","#ef89bb"]
 ];
 let selected=1,game=false,score=0,ship=.5,projectiles=[],enemies=[],clock=0,last=performance.now(),media=null,mediaUrl=null,htmlUrl=null;
 let keys={left:false,right:false,fire:false};
 const title=document.querySelector("#machineTitle"),sub=document.querySelector("#machineSub"),counter=document.querySelector("#counter"),btn=document.querySelector("#play");
 const layer=document.querySelector("#gameLayer"),gameFrame=document.querySelector("#gameFrame");
 const hint=document.querySelector("#hint");hint.textContent="MODO 2D · ESTE NAVEGADOR NO TIENE WEBGL2";
 qa.status="FALLBACK_2D_RENDERING";qa.machineCount=6;qa.sceneMode="CANVAS2D_NOT_3D";
 function pick(n){selected=(n+6)%6;title.textContent=items[selected][0];sub.textContent=selected===1?"Juego funcional · Modo 2D":"Pantalla animada · Vista 2D";counter.textContent=String(selected+1).padStart(2,"0")+" / 06";btn.textContent=selected===1?(game?"SALIR DEL JUEGO":"JUGAR"):"INTERACTUAR";}
 const press=()=>{
   if(selected===1){game=!game;if(game){score=0;projectiles=[];enemies=[];ship=.5;}btn.textContent=game?"SALIR DEL JUEGO":"JUGAR";}
   else clock+=.7;
 };
 document.querySelector("#prev").onclick=()=>pick(selected-1);
 document.querySelector("#next").onclick=()=>pick(selected+1);
 document.querySelector("#focus").onclick=()=>{clock+=.2;};
 btn.onclick=press;
 document.querySelector("#closeGame").onclick=()=>{layer.hidden=true;gameFrame.src="about:blank";};
 for(const [id,key] of [["#turnLeft","left"],["#turnRight","right"],["#fire","fire"]]){
  const b=document.querySelector(id);
  b.addEventListener("pointerdown",e=>{e.preventDefault();keys[key]=true;b.setPointerCapture(e.pointerId);});
  for(const ev of ["pointerup","pointercancel","lostpointercapture"])b.addEventListener(ev,()=>keys[key]=false);
 }
 document.querySelector("#forward").onclick=()=>pick(selected+1);
 document.querySelector("#back").onclick=()=>pick(selected-1);
 addEventListener("keydown",e=>{if(["ArrowLeft","ArrowRight","Space"].includes(e.code)){e.preventDefault();keys[e.code==="ArrowLeft"?"left":e.code==="ArrowRight"?"right":"fire"]=true;}if(e.code==="Enter")press();});
 addEventListener("keyup",e=>{keys[e.code==="ArrowLeft"?"left":e.code==="ArrowRight"?"right":"fire"]=false;});
 const mediaInput=document.querySelector("#imageInput"),htmlInput=document.querySelector("#gameInput");
 document.querySelector("#media").onclick=()=>mediaInput.click();
 document.querySelector("#own").onclick=()=>htmlInput.click();
 const clear=document.querySelector("#clearMedia");
 mediaInput.onchange=()=>{const file=mediaInput.files?.[0];if(!file)return;if(mediaUrl)URL.revokeObjectURL(mediaUrl);mediaUrl=URL.createObjectURL(file);
   if(file.type.startsWith("video/")){const v=document.createElement("video");v.src=mediaUrl;v.muted=true;v.playsInline=true;v.loop=true;v.play().catch(()=>{});media=v;qa.mediaMode="VIDEO_FALLBACK";}
   else{const img=new Image();img.src=mediaUrl;media=img;qa.mediaMode="IMAGE_FALLBACK";}
   clear.hidden=false;
 };
 htmlInput.onchange=()=>{const file=htmlInput.files?.[0];if(!file)return;if(htmlUrl)URL.revokeObjectURL(htmlUrl);htmlUrl=URL.createObjectURL(file);gameFrame.src=htmlUrl;layer.hidden=false;qa.mediaMode="HTML_GAME_OVERLAY";clear.hidden=false;};
 clear.onclick=()=>{media?.pause?.();media=null;if(mediaUrl)URL.revokeObjectURL(mediaUrl);if(htmlUrl)URL.revokeObjectURL(htmlUrl);mediaUrl=htmlUrl=null;gameFrame.src="about:blank";layer.hidden=true;clear.hidden=true;qa.mediaMode="builtin";};
 pick(1);
 function resize(){const d=Math.min(devicePixelRatio||1,1.5);canvas.width=root.clientWidth*d;canvas.height=root.clientHeight*d;canvas.style.width=root.clientWidth+"px";canvas.style.height=root.clientHeight+"px";ctx.setTransform(d,0,0,d,0,0);}
 addEventListener("resize",resize);resize();
 function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(x,y,w,h);}
 function text(t,x,y,size,c="#fff",align="center"){ctx.fillStyle=c;ctx.font="900 "+size+"px system-ui";ctx.textAlign=align;ctx.fillText(t,x,y);}
 function cabinet(x,y,w,h,id){
   const accent=items[id][1];ctx.save();ctx.translate(x,y);
   ctx.shadowColor=accent;ctx.shadowBlur=17;
   rect(-w/2+3,-h,w-6,h,"#1b2535");rect(-w/2+3,-h,w-6,h*.12,accent);
   rect(-w*.37,-h*.81,w*.74,h*.44,"#080b15");ctx.shadowBlur=0;
   ctx.strokeStyle=accent;ctx.lineWidth=2;ctx.strokeRect(-w*.36,-h*.80,w*.72,h*.42);
   ctx.save();ctx.beginPath();ctx.rect(-w*.35,-h*.79,w*.7,h*.41);ctx.clip();
   if(media&&id===selected&&(media.readyState>=2||media.complete&&media.naturalWidth)){
      try{ctx.drawImage(media,-w*.35,-h*.79,w*.7,h*.41);}catch(_){}
   }else{
     for(let k=0;k<5;k++){ctx.strokeStyle=accent;ctx.globalAlpha=.2+(k%3)*.17;ctx.beginPath();
       let xx=Math.sin(clock*1.7+k*2+id)*w*.21,yy=-h*.6+Math.cos(clock*.9+k)*h*.1;
       ctx.arc(xx,yy,4+k%2*4,0,7);ctx.stroke();}
     ctx.globalAlpha=1;
     if(id===1){rect(-w*.08+ship*w*.17,-h*.45,w*.14,4,"#e9ffdf");text(String(score).padStart(4,"0"),0,-h*.73,Math.max(7,w*.11));}
   }ctx.restore();
   rect(-w*.35,-h*.25,w*.7,h*.12,"#9a647e");rect(-w*.19,-h*.22,w*.10,h*.06,"#e8c781");rect(w*.08,-h*.22,w*.09,h*.06,"#78f4d6");
   rect(-w*.17,-h*.045,w*.34,3,accent);
   if(id===selected){ctx.strokeStyle="#f7e6ad";ctx.lineWidth=3;ctx.strokeRect(-w/2-5,-h-6,w+10,h+12);}
   ctx.restore();
 }
 function frame(now){
   requestAnimationFrame(frame);const dt=Math.min((now-last)/1000,.05);last=now;clock+=dt;
   const w=root.clientWidth,h=root.clientHeight;
   if(!w||!h)return;const sky=ctx.createLinearGradient(0,0,0,h);sky.addColorStop(0,"#131128");sky.addColorStop(.55,"#181b29");sky.addColorStop(1,"#39202c");ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
   // Perspective enclosure and tile grid converge to a genuine vanishing point.
   const horizon=h*.24,mid=w*.5;
   ctx.fillStyle="#282337";ctx.beginPath();ctx.moveTo(0,h);ctx.lineTo(mid-w*.29,horizon);ctx.lineTo(mid+w*.29,horizon);ctx.lineTo(w,h);ctx.closePath();ctx.fill();
   ctx.strokeStyle="#a96d9c38";ctx.lineWidth=1;
   for(let i=-9;i<=9;i++){ctx.beginPath();ctx.moveTo(mid+i*w*.032,horizon);ctx.lineTo(mid+i*w*.15,h);ctx.stroke();}
   for(let j=0;j<10;j++){const p=(j/10)**1.6;const y=horizon+(h-horizon)*p;ctx.beginPath();ctx.moveTo(mid-w*(.29+.21*p),y);ctx.lineTo(mid+w*(.29+.21*p),y);ctx.stroke();}
   ctx.fillStyle="#22172a";ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(mid-w*.29,horizon);ctx.lineTo(0,h);ctx.closePath();ctx.fill();
   ctx.beginPath();ctx.moveTo(w,0);ctx.lineTo(mid+w*.29,horizon);ctx.lineTo(w,h);ctx.closePath();ctx.fill();
   ctx.strokeStyle="#5ddbdc";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,h*.08);ctx.lineTo(mid-w*.29,horizon);ctx.stroke();ctx.strokeStyle="#df6d9f";ctx.beginPath();ctx.moveTo(w,h*.08);ctx.lineTo(mid+w*.29,horizon);ctx.stroke();
   ctx.fillStyle="#0e1121";ctx.fillRect(mid-w*.29,horizon-h*.18,w*.58,h*.18);
   text("THE LAST ARCADE",mid,horizon-h*.06,Math.min(34,w*.04),"#f8ca8d");
   for(let row=2;row>=0;row--){const scale=.4+(2-row)*.20;const y=horizon+h*(.15+(2-row)*.16);for(let side=0;side<2;side++){
       const id=row*2+side,px=mid+(side?1:-1)*w*(.18+(2-row)*.12);
       cabinet(px,y,Math.min(150,w*.19)*scale,Math.min(225,h*.57)*scale,id);
   }}
   // Central attract-screen inset for chosen cabinet.
   const panelW=Math.min(w*.34,240),panelH=Math.min(h*.30,150);
   ctx.fillStyle="#080c18df";ctx.fillRect(mid-panelW/2,h*.52,panelW,panelH);ctx.strokeStyle=items[selected][1];ctx.lineWidth=2;ctx.strokeRect(mid-panelW/2,h*.52,panelW,panelH);
   if(media&&(media.readyState>=2||media.complete&&media.naturalWidth)){try{ctx.drawImage(media,mid-panelW/2+5,h*.52+5,panelW-10,panelH-10);}catch(_){}}
   else if(game&&selected===1){
     ship=Math.max(.1,Math.min(.9,ship+(Number(keys.right)-Number(keys.left))*dt*.7));
     if(keys.fire&&Math.floor(clock*9)%2===0&&projectiles.length<4)projectiles.push({x:ship,y:1});
     if(Math.random()<dt*.65)enemies.push({x:Math.random(),y:0});
     for(const b of projectiles)b.y-=dt;for(const e of enemies)e.y+=dt*.5;
     for(const b of projectiles)for(const e of enemies)if(Math.abs(e.x-b.x)<.08&&Math.abs(e.y-b.y)<.08){e.y=2;b.y=-1;score+=10;qa.score=score;}
     enemies=enemies.filter(x=>x.y<1.1);projectiles=projectiles.filter(x=>x.y>0);
     for(const b of projectiles)rect(mid-panelW/2+b.x*panelW,h*.52+b.y*panelH,3,8,"#e7ffd0");
     for(const e of enemies)rect(mid-panelW/2+e.x*panelW,h*.52+e.y*panelH,11,8,"#ff79b9");
     rect(mid-panelW/2+ship*panelW-10,h*.52+panelH-24,20,10,"#a2ffe5");
     text(String(score).padStart(5,"0"),mid,h*.52+20,15);
   }else{for(let i=0;i<8;i++){ctx.strokeStyle=items[selected][1];ctx.lineWidth=2;ctx.beginPath();ctx.arc(mid+Math.sin(clock*.8+i)*panelW*.29,h*.52+panelH*.50+Math.cos(clock+i)*panelH*.22,6+i%3,0,7);ctx.stroke();}}
   qa.frames++;qa.screenFrames++;qa.status="FALLBACK_2D_RENDERING";
 }
 requestAnimationFrame(frame);
}
