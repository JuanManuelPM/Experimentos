import {ACTOR_ID,ACTOR_ALT,DURATION,SHOTS,makeScene,sampleActor,sampleCamera,chooseClip,clamp,shouldAdvanceActorMixer,phaseElapsed} from './pilot-core.mjs';
const MODEL_ROOT='https://raw.githubusercontent.com/JuanManuelPM/Experimentos/01e585a57e19c56443c63eaea69bd498236b703b/prometeo/3d-npc-civilian-v1/dist/';
const ASSETS=[
{id:ACTOR_ID,file:'civil_azul.glb',pack:'prometeo-civilian',packName:'PROMETEO · NPC civil',name:'Civil / azul',uri:MODEL_ROOT+'civil_azul.glb',thumb:'https://juanmanuelpm.github.io/Experimentos/prometeo/3d-npc-civilian-v1/evidence/full_azul.jpg',size:1649028,rights:'Quaternius CC0; PROMETEO edits',sha256:'8bec29e84c9f0d082cc8ac08fd8cbe898dfcaa82abc9e1fa1bb13de46bfa5e4b'},
{id:ACTOR_ALT,file:'civil_granate.glb',pack:'prometeo-civilian',packName:'PROMETEO · NPC civil',name:'Civil / granate',uri:MODEL_ROOT+'civil_granate.glb',thumb:'https://juanmanuelpm.github.io/Experimentos/prometeo/3d-npc-civilian-v1/evidence/full_granate.jpg',size:1649036,rights:'Quaternius CC0; PROMETEO edits',sha256:'09c5cb4646059bff4547849c332a87273203d193a31637974be4ff1d8bca0e3b'}];
export function registerPilotAssets(state){
 const known=new Set(state.catalog.map(x=>x.id));for(const a of ASSETS){if(known.has(a.id))throw Error('ASSET_COLLISION_'+a.id);state.catalog.push(a);state.byId.set(a.id,a)}
 const opt=document.createElement('option');opt.value='prometeo-civilian';opt.textContent='PROMETEO · NPC civiles (2)';document.getElementById('pack')?.append(opt);return ASSETS.length;
}
export function attachPilot({state,replaceScene,toast}){
 const mount=document.querySelector('.stage');if(!mount)throw Error('FORJA_STAGE_NOT_FOUND');
 const panel=document.createElement('section');panel.className='pilot-panel';panel.setAttribute('aria-label','Actor y cine');
 panel.innerHTML='<div class="pilot-top"><strong>ACTOR / CINE <span>V2 · CANDIDATO</span></strong><button id="pilot-collapse" type="button" aria-expanded="true" aria-controls="pilot-body">−</button></div><div id="pilot-body"><div class="pilot-actions"><button id="pilot-load" type="button">ENSAYAR ESCENA</button><button id="pilot-swap" type="button">OTRO NPC</button></div><div class="pilot-actions"><button id="pilot-play" type="button">▶ REPRODUCIR</button><button id="pilot-rewind" type="button">↺ REINICIAR</button></div><div class="pilot-timer"><input id="pilot-seek" type="range" min="0" max="20" step=".05" value="0" aria-label="Fotograma / tiempo"><output id="pilot-time">00:00 / 00:20</output></div><div class="pilot-actions"><label>Eje frontal <select id="pilot-axis" aria-label="Eje frontal"><option>+Z</option><option>-Z</option><option>+X</option><option>-X</option></select></label><label>Cámara <select id="pilot-camera" aria-label="Modo de cámara"><option value="film">FILM</option><option value="free">LIBRE</option></select></label></div><p id="pilot-phase">Cargá el ensayo. El frente del NPC no fue calibrado visualmente.</p><p id="pilot-qa">SIN VERIFICACIÓN VISUAL · exportación GLB con rig bloqueada</p></div>';
 mount.append(panel);
 const $=id=>panel.querySelector('#'+id);
 let t=0,playing=false,cinematic=false,axis='+Z',actorId=ACTOR_ID,mode=null,activeAction=null,lastShot='',entry=null,missing=[],lastStatus='NOT_LOADED';
 const currentActor=()=>state.objects.find(e=>e.asset.id===actorId)||null;
 function display(){
  $('pilot-seek').value=String(t);$('pilot-time').textContent='00:'+String(Math.floor(t)).padStart(2,'0')+' / 00:20';
  $('pilot-play').textContent=playing?'Ⅱ PAUSAR':'▶ REPRODUCIR';
  $('pilot-qa').textContent=lastStatus+' · '+(missing.length?missing.join(', '):'sin faltantes del catálogo')+' · FRENTE POR VERIFICAR';
 }
 function changeAnimation(e,newMode,scrub=false){
  if(!e?.mixer)return 'NO_MIXER';
  const clipKind=newMode==='walk'?'walk':newMode==='interact'?'interact':'idle';
  const hit=chooseClip(e.clips,clipKind);
  const fallback=clipKind==='interact'&&hit.index<0?chooseClip(e.clips,'idle'):hit;
  if(fallback.index<0){lastStatus='CLIP_REQUIRED_MISSING:'+clipKind;return lastStatus}
  if(mode===newMode&&entry===e&&!scrub)return hit.index<0?hit.verifiedMode:'OK';
  if(entry!==e||scrub){e.mixer.stopAllAction();activeAction=null;}
  const action=e.mixer.clipAction(e.clips[fallback.index]);
  if(activeAction&&activeAction!==action)activeAction.fadeOut(.18);
  if(scrub){action.reset().play();action.setEffectiveWeight?.(1)}
  else action.reset().fadeIn(.18).play();activeAction=action;mode=newMode;entry=e;
  return hit.index<0?hit.verifiedMode:'OK';
 }
 function applyTime(scrub=false){
  const e=currentActor(),phase=sampleActor(t,axis);
  if(!e){lastStatus='ACTOR_NOT_LOADED';$('pilot-phase').textContent='Falta el GLB real: sin personaje de sustitución';display();return}
  if(phase.mode==='walk'&&chooseClip(e.clips,'walk').index<0){lastStatus='MISSING_WALK_CLIP';$('pilot-phase').textContent='Sin clip WALK real, movimiento detenido';playing=false;display();return}
  e.root.position.set(...phase.position);e.root.rotation.y=phase.yaw;
  const clipStatus=changeAnimation(e,phase.mode,scrub),interact=phase.mode==='interact';
  if(scrub&&e.mixer?.setTime)e.mixer.setTime(phaseElapsed(t,phase.phase));
  lastStatus=interact&&clipStatus!=='OK'?'INTERACTION_NOT_VERIFIED':'KINEMATIC_PREVIEW_ONLY';
  $('pilot-phase').textContent=phase.phase+' · '+phase.mode.toUpperCase()+' · '+(interact&&clipStatus!=='OK'?'SIN CLIP DE INTERACCIÓN':'toma técnica')+' · dot='+(phase.frontDot===null?'—':phase.frontDot.toFixed(3));
  if(cinematic&&state.camera&&state.controls&&$('pilot-camera').value==='film'){
   const pose=sampleCamera(t,phase);
   state.camera.position.set(...pose.position);state.controls.target.set(...pose.target);
   state.camera.fov=pose.fov;state.camera.updateProjectionMatrix();state.controls.update();lastShot=pose.shot;
  }display();
 }
 const seek=(time,scrub=true)=>{t=clamp(Number(time)||0,0,DURATION);applyTime(scrub)};
 async function loadScene(nextActor=ACTOR_ID){
  if(state.busy){toast('FORJA ESTÁ OCUPADA');return false}
  const known=new Set(state.byId.keys()),data=makeScene(known);
  data.items=data.items.map(i=>i.id===ACTOR_ID?{...i,id:nextActor}:i);
  missing=['furniture-kit/table','furniture-kit/kitchencabinet','furniture-kit/kitchenfridge',nextActor].filter(id=>!known.has(id));
  if(missing.length){lastStatus='CATALOG_ASSET_MISSING';display();return false}
  const ok=await replaceScene(data);if(!ok)return false;
  actorId=nextActor;t=0;playing=false;cinematic=true;mode=null;entry=null;activeAction=null;
  lastStatus='WAITING_ACTOR';onSceneChanged();seek(0);return true;
 }
 async function swapActor(){const desired=actorId===ACTOR_ID?ACTOR_ALT:ACTOR_ID;const ok=await loadScene(desired);if(!ok)toast('NO SE PUDO CAMBIAR EL PERSONAJE');return ok}
 function tick(dt){if(!cinematic||!playing||!state.webgl)return;
  if(!currentActor()){playing=false;lastStatus='ACTOR_NOT_LOADED';display();return}
  const next=Math.min(DURATION,t+Math.max(0,Math.min(.075,dt)));seek(next,false);if(next>=DURATION){playing=false;display()}
 }
 function onSceneChanged(){entry=null;mode=null;activeAction=null;const e=currentActor();
  if(e){lastStatus='ACTOR_PRESENT';if(!e.clips.some(c=>/walk/i.test(c.name)))lastStatus='NO_WALK_CLIP'}
  else{cinematic=false;playing=false;lastStatus='NO_ACTOR_IN_SCENE'}
  display();
 }
 const pauseForEdit=()=>{playing=false;cinematic=false;display()};
 function restore(saved){
  if(!saved||saved.schema!=='prometeo.forja.cinema/v2')return false;
  axis=['+Z','-Z','+X','-X'].includes(saved.axis)?saved.axis:'+Z';$('pilot-axis').value=axis;
  actorId=[ACTOR_ID,ACTOR_ALT].includes(saved.actorId)?saved.actorId:ACTOR_ID;
  cinematic=!!saved.cinematic;$('pilot-camera').value=saved.cameraMode==='free'?'free':'film';
  playing=false;seek(saved.time||0);return true;
 }
 function cinemaSnapshot(){return{schema:'prometeo.forja.cinema/v2',time:+t.toFixed(3),duration:DURATION,actorId,axis,cameraMode:$('pilot-camera').value,cinematic,shots:SHOTS.map(x=>x.id),frontAxisVisuallyVerified:false,gripVerified:false}}
 $('pilot-collapse').onclick=()=>{const expanded=$('pilot-collapse').getAttribute('aria-expanded')==='true';$('pilot-collapse').setAttribute('aria-expanded',String(!expanded));$('pilot-body').hidden=expanded;$('pilot-collapse').textContent=expanded?'+':'−'};
 $('pilot-load').onclick=()=>loadScene(ACTOR_ID);$('pilot-swap').onclick=swapActor;
 $('pilot-play').onclick=()=>{if(!cinematic)cinematic=true;playing=!playing;if(playing&&!state.playing)document.getElementById('play-animations')?.click();display()};
 $('pilot-rewind').onclick=()=>{playing=false;seek(0)};
 $('pilot-seek').oninput=e=>{playing=false;seek(e.target.value)};
 $('pilot-axis').onchange=e=>{axis=e.target.value;lastStatus='FRONT_CALIBRATION_REQUIRED';seek(t)};
 $('pilot-camera').onchange=()=>{cinematic=true;seek(t)};
 state.transform?.addEventListener('dragging-changed',e=>{if(e.value)pauseForEdit()});
 display();
 return{tick,loadScene,swapActor,seek,restore,snapshot:cinemaSnapshot,
  shouldAdvanceMixer:e=>shouldAdvanceActorMixer(e?.asset?.id,actorId,cinematic,playing),onSceneChanged,pauseForEdit,diagnostic:()=>({t,playing,cinematic,actorPresent:!!currentActor(),lastStatus,actorId,frontAxis:axis,frontVerified:false,interactionVerified:false,shot:lastShot,missing})};
}
