import {createSurfaceState,updateSurface,inputSurface,paintSurface} from "./screen-core.mjs";
// Honest Canvas2D diagnostic for browsers without WebGL. NOT a 3D render.
export function startFallback(root,q,reason){
 const canvas=document.createElement("canvas");canvas.setAttribute("aria-label","Previsualización diagnóstica 2D, WebGL ausente");
 root.appendChild(canvas);const ctx=canvas.getContext("2d",{alpha:false});
 const surface=document.createElement("canvas");surface.width=640;surface.height=480;
 const sx=surface.getContext("2d");const state=createSurfaceState({mode:"signal"});
 q.webgl=false;q.status="FALLBACK_2D";q.noWebGLReason=reason;
 const info=document.getElementById("info");info.textContent="MODO 2D DE RESPALDO · WEBGL NO DISPONIBLE";
 const boot=document.getElementById("boot");if(boot)boot.style.opacity="0";
 let w=1,h=1,last=performance.now();
 const resize=()=>{w=canvas.width=Math.max(1,root.clientWidth);h=canvas.height=Math.max(1,root.clientHeight);};window.addEventListener("resize",resize);resize();
 function quad(points,color){ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(...points[0]);for(let i=1;i<points.length;i++)ctx.lineTo(...points[i]);ctx.closePath();ctx.fill();}
 function stroke(points,color,width=1){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(...points[0]);for(let i=1;i<points.length;i++)ctx.lineTo(...points[i]);ctx.stroke();}
 function draw(){
   const bg=ctx.createLinearGradient(0,0,0,h);bg.addColorStop(0,"#0b0d1b");bg.addColorStop(.57,"#201927");bg.addColorStop(1,"#0c1419");
   ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
   ctx.save();ctx.translate(w*.52,h*.49);ctx.scale(Math.min(w/900,h/780)*1.15,Math.min(w/900,h/780)*1.15);
   // floor and subtle reflected grid
   quad([[-900,200],[900,200],[1300,740],[-1300,740]],"#17222b");
   ctx.strokeStyle="rgba(102,194,183,.10)";ctx.lineWidth=2;
   for(let i=-8;i<=8;i++){stroke([[i*90,200],[i*165,740]],"rgba(148,211,195,.16)",1.5);}
   for(let i=0;i<8;i++){let y=215+i*i*9;stroke([[-1000,y],[1000,y]],"rgba(210,165,182,.10)",1);}
   // distant light bars and arcade bay
   for(let i=-6;i<=6;i++){ctx.fillStyle=i%3?"#262c39":"#3f2c41";ctx.fillRect(i*124,-720,8,945);}
   ctx.fillStyle="#cf6299";ctx.shadowColor="#df5598";ctx.shadowBlur=22;ctx.fillRect(-650,-315,1300,9);ctx.shadowBlur=0;
   // cabinet shadow
   ctx.save();ctx.filter="blur(20px)";ctx.fillStyle="rgba(0,0,0,.86)";ctx.beginPath();ctx.ellipse(40,285,225,46,0,0,Math.PI*2);ctx.fill();ctx.restore();
   // rear depth and custom cut silhouette (perspective drawing of same first-article concept)
   quad([[ -90,-310 ],[ -13,-348 ],[200,-345],[222,-306],[218,230],[185,278],[22,271],[ -90,220]],"#244042");
   quad([[-210,-290],[-90,-310],[-90,220],[-210,238]],"#142a35");
   quad([[-210,-290],[-118,-351],[ -13,-348],[-90,-310]],"#4e6470");
   // left side art painted into hull
   quad([[-210,-290],[-90,-310],[-90,220],[-210,238]],"#36505c");
   stroke([[-201,-285],[-99,-299],[-99,206],[-201,225],[-201,-285]],"#b89a6e",6);
   ctx.save();ctx.translate(-161,-58);ctx.rotate(-.08);ctx.strokeStyle="#d95c8f";ctx.lineWidth=12;ctx.beginPath();ctx.ellipse(0,0,37,125,0,0,7);ctx.stroke();ctx.fillStyle="#f4dda7";ctx.font="900 54px Arial";ctx.textAlign="center";ctx.fillText("86",0,20);ctx.restore();
   // cream anodized face follows complex profile with bevel/hood/console step
   quad([[-90,-310],[173,-326],[185,-226],[128,-185],[125,25],[211,95],[195,145],[166,151],[170,263],[-90,277]],"#9e997f");
   quad([[-81,-301],[161,-315],[169,-230],[116,-188],[113,27],[198,96],[185,136],[156,139],[161,251],[-81,265]],"#20343c");
   // glowing marquee
   quad([[-66,-298],[145,-311],[149,-235],[-66,-227]],"#371c37");
   ctx.save();ctx.translate(33,-251);ctx.rotate(-.035);ctx.textAlign="center";ctx.fillStyle="#f6d4a8";ctx.shadowColor="#f97eaa";ctx.shadowBlur=19;ctx.font="900 37px Arial";ctx.fillText("SIGNAL",0,0);ctx.shadowBlur=0;ctx.fillStyle="#8de9d1";ctx.font="bold 14px monospace";ctx.fillText("LOST FREQUENCY 1986",0,20);ctx.restore();
   // optical recess with dynamic original 2D canvas warped approximately to bezel
   quad([[-65,-205],[133,-218],[124,24],[-60,31]],"#a69b86");
   quad([[-55,-195],[120,-204],[111,15],[-50,20]],"#060a17");
   ctx.save();ctx.beginPath();ctx.moveTo(-47,-189);ctx.lineTo(113,-199);ctx.lineTo(104,7);ctx.lineTo(-44,12);ctx.closePath();ctx.clip();
   ctx.translate(-44,-188);ctx.transform(1,-.052,-.018,1,0,0);
   ctx.drawImage(surface,0,0,158,198);ctx.restore();
   ctx.strokeStyle="rgba(178,241,226,.42)";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-34,-175);ctx.lineTo(-26,6);ctx.stroke();
   // controls: angled deck with mounted joystick/buttons
   quad([[-77,35],[112,29],[197,101],[-66,110]],"#6a314a");
   stroke([[-71,44],[108,38],[180,99],[-60,104]],"#e7b181",5);
   quad([[-27,63],[-12,57],[3,59],[15,75],[-18,87]],"#d7b480");
   ctx.strokeStyle="#d9d6bd";ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(-5,68);ctx.lineTo(-14,31);ctx.stroke();
   ctx.fillStyle="#111c26";ctx.beginPath();ctx.arc(-14,28,17,0,7);ctx.fill();
   ["#f3bc8c","#80e0d1","#ed6992"].forEach((c,i)=>{ctx.fillStyle=c;ctx.shadowColor=c;ctx.shadowBlur=12;ctx.beginPath();ctx.ellipse(70+i*39,75+i%2*7,15,9,.1,0,7);ctx.fill();ctx.shadowBlur=0;});
   // coin plate with carefully scaled face
   quad([[-25,170],[91,166],[92,235],[-24,239]],"#141821");
   ctx.fillStyle="#d6b591";ctx.fillRect(12,189,3,24);ctx.fillRect(53,188,3,24);
   ctx.restore();
   // A visible truthful status, not a screenshot masquerading as a WebGL render.
   ctx.fillStyle="rgba(10,12,20,.67)";ctx.fillRect(10,10,190,24);ctx.fillStyle="#dfc6a7";ctx.font="11px Arial";ctx.fillText("PREVIEW 2D · SIN WEBGL",19,26);
 }
 function animate(now){const dt=Math.min(.05,(now-last)/1000);last=now;updateSurface(state,dt);paintSurface(sx,640,480,state);draw();q.frames++;q.pulseCount=state.pulseCount;requestAnimationFrame(animate);}
 document.querySelectorAll("[data-control]").forEach(b=>b.addEventListener("pointerdown",e=>{e.preventDefault();inputSurface(state,b.dataset.control);q.inputs++;}));
 window.addEventListener("keydown",e=>{const a=e.key==="ArrowLeft"?"left":e.key==="ArrowRight"?"right":e.key===" "||e.key==="Enter"?"fire":null;if(a){inputSurface(state,a);q.inputs++;}});
 requestAnimationFrame(animate);
}