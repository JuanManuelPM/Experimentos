// PROMETEO / live-surface@0.1.0 - original, zero-cost, no borrowed game assets.
export function createSurfaceState(config = {}) {
 const mode = config.mode === "radar" ? "radar" : "signal";
 return {mode, time:0, phase:0, cursor:0, pulse:0, pulseCount:0, score:0, lastInput:"none", speed:Number(config.speed)||1};
}
export function updateSurface(s, dt) {
 if(!(dt >= 0) || !Number.isFinite(dt)) throw new Error("invalid dt");
 s.time += Math.min(dt,0.1) * s.speed;
 s.phase = (s.phase + Math.min(dt,0.1) * (s.mode==="radar" ? 0.54 : 0.9)) % (Math.PI*2);
 s.pulse = Math.max(0,s.pulse - dt * 1.1);
 return s;
}
export function inputSurface(s,action) {
 if(action==="left") s.cursor = Math.max(-1,s.cursor-.15);
 else if(action==="right") s.cursor = Math.min(1,s.cursor+.15);
 else if(action==="fire") {s.pulse=1; s.pulseCount++; s.score=(s.score+1)%999;}
 else throw new Error("invalid action");
 s.lastInput=action;
 return s;
}
export function paintSurface(ctx,w,h,s) {
 const g=ctx.createLinearGradient(0,0,w,h);
 if(s.mode==="radar"){g.addColorStop(0,"#041c23");g.addColorStop(1,"#091325");}
 else {g.addColorStop(0,"#080d22");g.addColorStop(1,"#1a0c27");}
 ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
 ctx.save();ctx.translate(w/2,h/2);
 const scale=Math.min(w/640,h/480);ctx.scale(scale,scale);
 if(s.mode==="radar"){
   ctx.strokeStyle="rgba(75,239,206,.19)";ctx.lineWidth=2;
   for(let r=38;r<245;r+=46){ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke();}
   for(let n=0;n<12;n++){let a=n*Math.PI/6;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*242,Math.sin(a)*242);ctx.stroke();}
   const a=s.phase*1.7;let rg=ctx.createRadialGradient(0,0,20,0,0,245);
   rg.addColorStop(0,"rgba(31,237,195,.20)");rg.addColorStop(1,"rgba(0,0,0,0)");
   ctx.fillStyle=rg;ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,239,a-.52,a);ctx.closePath();ctx.fill();
   ctx.strokeStyle="#63f4cd";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*238,Math.sin(a)*238);ctx.stroke();
   [[-112,53],[160,-30],[38,176]].forEach(([x,y],i)=>{const p=0.35+0.65*Math.sin(s.time*2.2+i)**2;ctx.fillStyle="rgba(148,255,210,"+p+")";ctx.beginPath();ctx.arc(x,y,5,0,7);ctx.fill();});
   ctx.fillStyle="#a3dcd2";ctx.font="bold 22px monospace";ctx.fillText("D E E P / 0 6",-285,-190);ctx.font="15px monospace";ctx.fillText("SONAR ACTIVE    "+String(s.pulseCount).padStart(3,"0"),-285,205);
 } else {
   ctx.strokeStyle="rgba(119,97,204,.3)";ctx.lineWidth=1;
   for(let i=-300;i<=300;i+=50){ctx.beginPath();ctx.moveTo(i,-186);ctx.lineTo(i,189);ctx.stroke();}
   for(let i=-180;i<200;i+=46){ctx.beginPath();ctx.moveTo(-290,i);ctx.lineTo(290,i);ctx.stroke();}
   const colors=["#58efcf","#fd5da8","#fbe0a0"];
   for(let i=0;i<7;i++){
     let x=Math.sin(s.phase*.81+i*1.67)*218,y=Math.cos(s.phase*.58+i*2.15)*122;
     ctx.save();ctx.translate(x,y);ctx.rotate(s.time*.17+i);ctx.strokeStyle=colors[i%3];ctx.lineWidth=i===0?5:2.3;ctx.strokeRect(-19-i*2,-19-i*2,38+i*4,38+i*4);ctx.restore();
   }
   const x=s.cursor*188;ctx.shadowColor="#7dffdb";ctx.shadowBlur=18;ctx.fillStyle="#86ffdf";ctx.beginPath();ctx.moveTo(x,148);ctx.lineTo(x-19,181);ctx.lineTo(x+19,181);ctx.closePath();ctx.fill();ctx.shadowBlur=0;
   ctx.fillStyle="#f0e3c7";ctx.font="bold 30px monospace";ctx.fillText("S I G N A L / 0", -277,-191);
   ctx.font="16px monospace";ctx.fillStyle="#8ad6c1";ctx.fillText("RECOVER THE LOST FREQUENCY", -273,215);
   ctx.fillStyle="#ffcd9d";ctx.font="20px monospace";ctx.fillText(String(s.score).padStart(3,"0"),232,-191);
 }
 if(s.pulse>0){
    ctx.strokeStyle="rgba(245,235,179,"+(s.pulse*.9)+")";ctx.lineWidth=8*s.pulse;
    ctx.beginPath();ctx.arc(s.cursor*155,0,(1-s.pulse)*240,0,Math.PI*2);ctx.stroke();
 }
 ctx.restore();
 // screen imperfections are original programmatic overlays, not a video.
 ctx.fillStyle="rgba(0,0,0,.12)";for(let y=0;y<h;y+=4)ctx.fillRect(0,y,w,1);
 let vignette=ctx.createRadialGradient(w/2,h/2,h*.11,w/2,h/2,w*.73);
 vignette.addColorStop(0,"rgba(0,0,0,0)");vignette.addColorStop(1,"rgba(0,0,0,.55)");
 ctx.fillStyle=vignette;ctx.fillRect(0,0,w,h);
}