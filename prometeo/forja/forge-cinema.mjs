/* FORJA WORK C102: cinematic controls wired into the original Three.js editor.
   Uses C107's tested math, but never changes saved scene schema or authored object positions.
   WebGL-only: the honest C112 2D preview remains a separate read-only fallback. */
import {CameraRig} from './camera-rig.mjs';

export function installCinema({THREE,canvas,renderer,scene,world,camera,controls,transform,getObjects,getSelected,onOrbit,notify}) {
  const rig=new CameraRig({bounds:85});
  const modeSelect=document.getElementById('camera-cinema-mode');
  const status=document.getElementById('camera-cinema-status');
  const pad=document.getElementById('camera-walk-pad');
  const capture=document.getElementById('camera-cinema-capture');
  const pauseButton=document.getElementById('camera-cinema-pause');
  const keys=new Set();
  let mode='ORBIT',elapsed=0,looking=null,paused=false;
  const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
  function setPaused(next) {
    paused=Boolean(next);
    keys.clear();
    looking=null;
    if(pauseButton){
      pauseButton.textContent=paused?'▶':'Ⅱ';
      pauseButton.setAttribute('aria-pressed',String(paused));
      pauseButton.setAttribute('aria-label',paused?'Reanudar recorrido':'Pausar recorrido');
    }
    return paused;
  }
  const isEditable=e=>!!e.target.closest?.('input,textarea,select,[contenteditable="true"]');
  const buildings=()=>getObjects().filter(o=>/building|house|tower|furniture-kit/i.test(o.asset?.id||'')).map(o=>{
    const b=new THREE.Box3().setFromObject(o.root);
    return {minX:b.min.x,maxX:b.max.x,minZ:b.min.z,maxZ:b.max.z};
  }).filter(b=>[b.minX,b.maxX,b.minZ,b.maxZ].every(Number.isFinite));
  const worldBounds=()=>{
    if(!getObjects().length)return {center:new THREE.Vector3(),span:24,bounds:null};
    const box=new THREE.Box3().setFromObject(world);
    const center=box.getCenter(new THREE.Vector3());
    const size=box.getSize(new THREE.Vector3());
    return {center,span:clamp(Math.max(size.x,size.y,size.z),9,120),bounds:box};
  };
  function setupShots(){
    const {center,span}=worldBounds();
    const d=clamp(span*2.05,20,135),x=center.x,y=center.y,z=center.z,high=clamp(span*.65,7,50);
    const shots=[
      {at:0,eye:[x+d,y+high,z+d*.65],target:[x,y,z],fov:47},
      {at:5,eye:[x-d*.75,y+high*.65,z+d*.8],target:[x,y,z],fov:51},
      {at:10,eye:[x-d*.85,y+high*.45,z-d*.75],target:[x,y,z],fov:49},
      {at:15,eye:[x+d*.6,y+high,z-d*.85],target:[x,y,z],fov:47},
      {at:20,eye:[x+d,y+high,z+d*.65],target:[x,y,z],fov:47}
    ];
    rig.shots=shots;
  }
  function setMode(next){
    if(!['ORBIT','FOLLOW','FIRST_PERSON','SHOT'].includes(next))return false;
    mode=next;rig.setMode(next);elapsed=0;setPaused(false);
    if(next==='FIRST_PERSON'){
      const {center,span,bounds}=worldBounds();
      rig.bounds=Math.max(45,Math.min(220,Math.max(Math.abs(center.x),Math.abs(center.z))+span*1.7));
      const originZ=bounds?clamp(bounds.max.z+3,-rig.bounds,rig.bounds):14;
      rig.fp=[clamp(center.x,-rig.bounds,rig.bounds),1.8,originZ];
      rig.obstacles=buildings();
      rig.yaw=0;rig.pitch=0;
    } else if(next==='SHOT'){setupShots();}
    if(next==='ORBIT'){
      camera.fov=47;camera.updateProjectionMatrix();
      controls.enabled=true;
      onOrbit();
    }else{
      controls.enabled=false;
      transform?.detach();
      tick(0);
    }
    if(modeSelect)modeSelect.value=next;
    if(status)status.textContent=next==='ORBIT'?'EDITOR · ÓRBITA':next==='FOLLOW'?'SIGUIENDO MODELO':next==='FIRST_PERSON'?'CAMINAR · WASD':'RECORRIDO · 20 S';
    if(pad)pad.hidden=next!=='FIRST_PERSON';
    return true;
  }
  function getFollow(){
    const items=getObjects();
    const chosen=items.find(o=>o.uid===getSelected())||
      items.find(o=>/car-kit|vehicle|truck|hatchback/i.test(o.asset?.id||''))||items[0];
    if(!chosen)return {x:0,z:0,heading:0};
    const pos=chosen.root.getWorldPosition(new THREE.Vector3());
    return {x:pos.x,z:pos.z,heading:chosen.root.rotation.y};
  }
  function tick(dt){
    if(mode==='ORBIT')return;
    const step=clamp(Number.isFinite(dt)?dt:0,0,.08);
    if(!paused)elapsed+=step;
    if(!paused&&mode==='FIRST_PERSON'){
      const f=+(keys.has('KeyW')||keys.has('ArrowUp')||keys.has('forward'))-
              +(keys.has('KeyS')||keys.has('ArrowDown')||keys.has('back'));
      const s=+(keys.has('KeyD')||keys.has('ArrowRight')||keys.has('right'))-
              +(keys.has('KeyA')||keys.has('ArrowLeft')||keys.has('left'));
      if(f||s)rig.move(f*step*5,s*step*5);
    }
    const p=rig.pose(elapsed,paused?0:step,{follow:getFollow()});
    camera.position.set(...p.eye);
    camera.up.set(...p.up);
    camera.lookAt(new THREE.Vector3(...p.target));
    if(camera.fov!==p.fov){camera.fov=p.fov;camera.updateProjectionMatrix();}
  }
  function keyDown(e){
    if(paused||mode!=='FIRST_PERSON'||isEditable(e))return;
    if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)){
      e.preventDefault();e.stopImmediatePropagation();keys.add(e.code);
    }
  }
  document.addEventListener('keydown',keyDown,true);
  document.addEventListener('keyup',e=>keys.delete(e.code));
  window.addEventListener('blur',()=>{keys.clear();looking=null;});
  canvas.addEventListener('pointerdown',e=>{
    if(paused||mode!=='FIRST_PERSON')return;
    looking={x:e.clientX,y:e.clientY,id:e.pointerId};
    try{canvas.setPointerCapture(e.pointerId);}catch{}
  },true);
  canvas.addEventListener('pointermove',e=>{
    if(paused||mode!=='FIRST_PERSON'||!looking||e.pointerId!==looking.id)return;
    rig.drag(e.clientX-looking.x,e.clientY-looking.y);
    looking.x=e.clientX;looking.y=e.clientY;
  },true);
  for(const name of ['pointerup','pointercancel'])canvas.addEventListener(name,()=>looking=null,true);
  modeSelect?.addEventListener('change',e=>setMode(e.target.value));
  for(const button of pad?.querySelectorAll('[data-walk]')||[]){
    const action=button.dataset.walk;
    button.addEventListener('pointerdown',e=>{
      if(paused||mode!=='FIRST_PERSON')return;
      e.preventDefault();keys.add(action);
      try{button.setPointerCapture(e.pointerId);}catch{}
    });
    button.addEventListener('pointerup',()=>keys.delete(action));
    button.addEventListener('pointercancel',()=>keys.delete(action));
    button.addEventListener('lostpointercapture',()=>keys.delete(action));
  }
  pauseButton?.addEventListener('click',()=>setPaused(!paused));
  capture?.addEventListener('click',()=>{
    if(!renderer){notify('SIN GPU · NO HAY CAPTURA 3D');return;}
    try{
      renderer.render(scene,camera);
      canvas.toBlob(blob=>{
        if(!blob){notify('NO SE PUDO CAPTURAR EL CANVAS');return;}
        const url=URL.createObjectURL(blob);
        const a=document.createElement('a');
        a.href=url;a.download='forja-escena-'+Date.now()+'.png';
        document.body.append(a);a.click();a.remove();
        setTimeout(()=>URL.revokeObjectURL(url),10000);
      },'image/png');
    }catch(e){notify('ERROR CAPTURA: '+e.message);}
  });
  setPaused(false);
  if(modeSelect)modeSelect.disabled=false;
  if(capture)capture.disabled=false;
  if(status)status.textContent='EDITOR · ÓRBITA';
  return {setMode,tick,get mode(){return mode;},diagnostic:()=>({mode,paused,elapsed,firstPerson:rig.fp.slice(),blockers:rig.obstacles.length,controlsEnabled:controls.enabled})};
}
