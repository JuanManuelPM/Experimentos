/** PROMETEO 3D · Acting Lab V1. Experimental, frozen owner assets, no source geometry edits. */
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {sampleFrame,validateShotlist} from './vendor/director.mjs';
import {FPS,END,poseAt,shotAt,calibratedYaw,facingDot} from './logic.mjs';
const $=id=>document.getElementById(id);
const state={frame:0,playhead:0,playing:false,view:'director',variant:'azul',clipOverride:'auto',loaded:false,actor:null,prop:null,rig:null,mixer:null,clips:[],action:null,front:[0,0,1],bias:0,arm:null,foot:null,ikDistance:null,contact:false,lastTime:0,prevFoot:null,footSamples:[],warnings:[],cameraList:null,stage:null,lock:null};
const scene=new THREE.Scene();scene.background=new THREE.Color('#20292d');scene.fog=new THREE.Fog('#20292d',10,24);
const camera=new THREE.PerspectiveCamera(43,1,.06,80);camera.position.set(-3,2.7,5.3);
let renderer,orbit;
const worldTravelArrow=new THREE.ArrowHelper(new THREE.Vector3(0,0,1),new THREE.Vector3(),.42,0xf2c184,.14,.085);worldTravelArrow.visible=false;scene.add(worldTravelArrow);
const loader=new GLTFLoader();
const setStatus=(message,problem=false)=>{$('health').textContent=message;$('health').dataset.error=problem?'true':'false';};
function stageFixture(){
 scene.add(new THREE.HemisphereLight(0xe9f2f8,0x304040,2.6));
 const key=new THREE.DirectionalLight(0xffd5a9,3.2);key.position.set(-3,7,5);scene.add(key);
 const rim=new THREE.DirectionalLight(0x7dbbc8,2);rim.position.set(3,5,-4);scene.add(rim);
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(16,16),new THREE.MeshStandardMaterial({color:'#39474a',roughness:.93}));floor.rotation.x=-Math.PI/2;floor.position.y=-.012;scene.add(floor);
 const grid=new THREE.GridHelper(14,28,0x92a5a6,0x566367);grid.position.y=.005;grid.material.opacity=.32;grid.material.transparent=true;scene.add(grid);
 const line=(a,b,color)=>{const points=[new THREE.Vector3(...a),new THREE.Vector3(...b)];const obj=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color}));obj.position.y=.018;scene.add(obj);};
 line([0,0,-3.6],[0,0,-1.55],0xf0c187);line([.36,0,-1.19],[.98,0,-1.19],0xf0c187);
 for(const [x,z,c] of [[0,-3.6,0x91d9ca],[.98,-1.19,0xf0be7e]]){const marker=new THREE.Mesh(new THREE.RingGeometry(.17,.2,40),new THREE.MeshBasicMaterial({color:c,side:THREE.DoubleSide}));marker.rotation.x=-Math.PI/2;marker.position.set(x,.02,z);scene.add(marker);}
 const legMat=new THREE.MeshStandardMaterial({color:0x2d3536,roughness:.85});const top=new THREE.Mesh(new THREE.BoxGeometry(1.13,.085,.75),new THREE.MeshStandardMaterial({color:0x85817b,roughness:.75}));top.position.set(1.69,.72,-1.19);scene.add(top);
 for(const xx of [1.22,2.15])for(const zz of [-1.45,-.93]){const leg=new THREE.Mesh(new THREE.BoxGeometry(.08,.69,.075),legMat);leg.position.set(xx,.345,zz);scene.add(leg);}
 const anchor=new THREE.AxesHelper(.38);anchor.position.set(-2.4,.03,-2.65);scene.add(anchor);
}
function fit(){if(!renderer)return;const rect=$('viewport').getBoundingClientRect(),w=Math.max(1,Math.round(rect.width)),h=Math.max(1,Math.round(rect.height));renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
async function verifiedGLB(url,hash){const res=await fetch(url,{cache:'no-store'});if(!res.ok)throw Error('HTTP_'+res.status+' '+url);const bytes=new Uint8Array(await res.arrayBuffer());const view=new DataView(bytes.buffer);if(bytes.length<20||view.getUint32(0,true)!==0x46546c67||view.getUint32(4,true)!==2||view.getUint32(8,true)!==bytes.length)throw Error('BAD_GLB');const digest=await crypto.subtle.digest('SHA-256',bytes);const sha=[...new Uint8Array(digest)].map(n=>n.toString(16).padStart(2,'0')).join('');if(sha!==hash)throw Error('SHA_MISMATCH '+sha);return loader.parseAsync(bytes.buffer,'');}
function role(root,options){for(const n of options){const found=root.getObjectByName(n);if(found?.isBone)return found;}return null}
function configureRig(gltf,adapter){const names=[];gltf.scene.traverse(o=>{if(o.isBone)names.push(o.name)});const b=adapter.bones;
 const arm={upper:role(gltf.scene,b.rightUpperArm),lower:role(gltf.scene,b.rightLowerArm),wrist:role(gltf.scene,b.rightWrist),hand:gltf.scene.getObjectByName(adapter.sockets.rightHand)};
 const foot={left:role(gltf.scene,b.leftFoot),right:role(gltf.scene,b.rightFoot)};
 state.arm=arm;state.foot=foot;state.front=adapter.localFront;state.bias=calibratedYaw(state.front,[0,1]);state.warnings=[];
 for(const [k,v] of Object.entries({...arm,...foot}))if(!v)state.warnings.push('RIG_MISSING_'+k);
 if(arm.upper&&arm.lower&&arm.wrist&&(!arm.lower.parent||!arm.wrist.parent))state.warnings.push('ARM_CHAIN_INVALID');
 $('rig').textContent=names.length+' huesos · '+gltf.animations.length+' clips · '+adapter.family;
 const clipList=gltf.animations.map(c=>c.name);$('clips').textContent=clipList.join(' · ')||'Sin clips';
 const travelling=gltf.animations.flatMap(c=>c.tracks.filter(t=>/\.(position)$/i.test(t.name)&&/(Root|Hips|Armature)/i.test(t.name)&&t.values?.length>=6).map(t=>{const v=t.values,drift=Math.hypot(v[v.length-3]-v[0],v[v.length-1]-v[2]);return {clip:c.name,track:t.name,drift};})).filter(x=>x.drift>.12);if(travelling.length)state.warnings.push('ROOT_MOTION_TRACKS:'+travelling.map(x=>x.clip+':'+x.track+' '+x.drift.toFixed(2)+'m').join(','));
 if(!clipList.some(x=>/walk/i.test(x)))state.warnings.push('WALK_CLIP_MISSING'); if(!clipList.some(x=>/idle|stand/i.test(x)))state.warnings.push('IDLE_CLIP_MISSING');
 $('clip').innerHTML='<option value="auto">Automático · Idle / Walk</option>';
 for(const [i,name]of clipList.entries()){const option=document.createElement('option');option.value=String(i);option.textContent=name;$('clip').append(option)}
}
function getAction(name){const found=state.clips.find(c=>c.name===name)||state.clips.find(c=>c.name.toLowerCase().includes(name.toLowerCase()));return found||null;}
function setClip(clip){if(!state.mixer)return;if(!clip){state.action?.stop();state.action=null;return;}if(state.action?.getClip()===clip)return;state.mixer.stopAllAction();state.action=state.mixer.clipAction(clip);state.action.reset().setLoop(THREE.LoopRepeat,Infinity).play();}
function animAt(pose){if(state.clipOverride!=='auto'){const manual=state.clips[Number(state.clipOverride)];setClip(manual);return state.frame/FPS;}const move=pose.clip==='Walk';const clip=move?getAction('Walk'):getAction('Idle');setClip(clip);return state.frame/FPS;}
function positionOf(object){return object.getWorldPosition(new THREE.Vector3());}
function solveCCD(bones,target,strength){const {upper,lower,wrist,hand}=bones;if(!upper||!lower||!wrist||!hand||strength<=0)return null;
 const orig=positionOf(hand).distanceTo(target),joints=[lower,upper];const parentQ=new THREE.Quaternion(),delta=new THREE.Quaternion(),localQ=new THREE.Quaternion();
 for(let round=0;round<10;round++)for(const joint of joints){joint.updateWorldMatrix(true,true);hand.updateWorldMatrix(true,false);const pivot=positionOf(joint),end=positionOf(hand);const a=end.sub(pivot).normalize(),b=target.clone().sub(pivot).normalize();if(a.lengthSq()<.5||b.lengthSq()<.5)continue;const angle=Math.acos(THREE.MathUtils.clamp(a.dot(b),-1,1));if(angle<.005)continue;delta.setFromUnitVectors(a,b);delta.identity().setFromAxisAngle(new THREE.Vector3().crossVectors(a,b).normalize(),Math.min(angle,.20*strength));if(!Number.isFinite(delta.x))continue;joint.parent.getWorldQuaternion(parentQ);localQ.copy(parentQ).invert().multiply(delta).multiply(parentQ);joint.quaternion.premultiply(localQ);joint.updateWorldMatrix(true,true);}
 return {initial:orig,final:positionOf(hand).distanceTo(target)};
}
function positionAnchors(){const face=state.actor?.getObjectByName('socket_face'),hand=state.actor?.getObjectByName('socket_hand_right'),grip=state.prop?.getObjectByName('SOCKET_grip');if(!face||!hand||!grip)throw Error('SOCKET_MISSING:face/hand/grip');state.actor.updateMatrixWorld(true);state.prop.updateMatrixWorld(true);return {root:state.actor.position.toArray(),face:positionOf(face).toArray(),hands:positionOf(hand).toArray(),object:positionOf(grip).toArray(),interaction:positionOf(grip).toArray(),paws:positionOf(hand).toArray()};}
function updateFeet(p){if(!state.foot?.left||!state.foot?.right)return;const current={frame:state.frame,left:positionOf(state.foot.left),right:positionOf(state.foot.right),phase:p.phase};if(state.prevFoot&&p.clip==='Walk'&&state.prevFoot.phase===p.phase&&state.frame-state.prevFoot.frame===1){const ds=[];for(const s of ['left','right']){const a=current[s],b=state.prevFoot[s];if(a.y<=b.y+.03){ds.push(Math.hypot(a.x-b.x,a.z-b.z));}}if(ds.length){state.footSamples.push(Math.min(...ds));if(state.footSamples.length>72)state.footSamples.shift();}}
 state.prevFoot=current;
}
function runFrame(f){if(!state.loaded)return;state.frame=THREE.MathUtils.clamp(Math.floor(f),0,END-1);state.playhead=state.frame;const p=poseAt(state.frame,state.front);state.actor.position.set(...p.position);state.actor.rotation.y=p.yaw+state.bias;
 const velocityLength=Math.hypot(...p.velocity);worldTravelArrow.visible=velocityLength>.0001;worldTravelArrow.position.set(p.position[0],.09,p.position[2]);if(velocityLength>.0001)worldTravelArrow.setDirection(new THREE.Vector3(p.velocity[0]/velocityLength,0,p.velocity[1]/velocityLength));
 state.mixer?.setTime(animAt(p));state.actor.updateMatrixWorld(true);state.prop.updateMatrixWorld(true);
 // Genuine skinned CCD, not a camera trick. Lid only actuates after socket proximity.
 const grip=state.prop.getObjectByName('SOCKET_grip');const hand=state.arm?.hand;const target=grip?positionOf(grip):null;
 const ik=p.reach>.025&&target?solveCCD(state.arm,target,p.reach):null;state.ikDistance=ik?.final??null;state.contact=!!(ik&&ik.final<.035&&p.interact);
 const lid=state.prop.getObjectByName('LID_PIVOT');if(lid)lid.rotation.x=state.contact?-THREE.MathUtils.degToRad(100)*THREE.MathUtils.clamp((state.frame-365)/33,0,1):0;
 state.actor.updateMatrixWorld(true);state.prop.updateMatrixWorld(true);updateFeet(p);
 if(state.view==='director'){const sample=sampleFrame(state.cameraList,state.frame,positionAnchors(),'civil');camera.position.fromArray(sample.position);camera.lookAt(...sample.target);camera.fov=sample.fov;camera.updateProjectionMatrix();orbit.target.fromArray(sample.target);$('subtitle').textContent=sample.subtitle;$('take').textContent=sample.label||sample.shotId;}
 else{$('subtitle').textContent='';$('take').textContent='VISTA '+state.view.toUpperCase();orbit.update();}
 const dot=facingDot(state.front,p.yaw+state.bias,p.velocity);$('facing').textContent=dot===null?'Quieto':dot>.85?'Alineado '+dot.toFixed(2):'ALERTA '+dot.toFixed(2);
 $('travel').textContent=`X ${p.position[0].toFixed(2)} · Z ${p.position[2].toFixed(2)} · ${p.phase}`;
 $('grip').textContent=state.contact?'CONTACTO IK + TAPA ACTUADA':ik?'IK '+(100*ik.final).toFixed(1)+' cm (sin agarre)':state.arm?.wrist?'IK listo · sin contacto':'Rig sin brazo IK';
 $('feet').textContent=state.footSamples.length?'Deriva pie PROXY '+(100*Math.max(...state.footSamples)).toFixed(1)+' cm/frame':'Sin medición de pies';
 $('clock').textContent=(state.frame/FPS).toFixed(2)+' / 20.00 s';$('seek').value=String(state.frame);
 renderer.render(scene,camera);
}
function setView(mode){state.view=mode;$('viewMode').value=mode;if(mode==='director')return;const p=poseAt(state.frame);const tgt=new THREE.Vector3(p.position[0],1.1,p.position[2]);orbit.target.copy(tgt);if(mode==='front')camera.position.set(tgt.x,tgt.y+0.8,tgt.z+4.2);if(mode==='side')camera.position.set(tgt.x+4.2,tgt.y+.8,tgt.z);if(mode==='free')camera.position.set(tgt.x+3,tgt.y+2.1,tgt.z+4.2);orbit.update();runFrame(state.frame);}
async function switchActor(v){state.playing=false;$('play').textContent='Reproducir';setStatus('Verificando GLB y licencia…');state.loaded=false;
 if(state.actor)scene.remove(state.actor);if(state.prop)scene.remove(state.prop);
 const selected=state.lock.variants[v];const [actor,prop]=await Promise.all([verifiedGLB(selected.actor.url,selected.actor.sha256),verifiedGLB(selected.prop.url,selected.prop.sha256)]);
 state.actor=actor.scene;state.prop=prop.scene;state.clips=actor.animations;state.mixer=new THREE.AnimationMixer(state.actor);state.action=null;state.variant=v;
 scene.add(state.actor);state.prop.position.set(1.69,.765,-1.19);scene.add(state.prop);
 configureRig(actor,state.rig.familyProfiles[selected.actor.family]);
 const arrow=new THREE.ArrowHelper(new THREE.Vector3(...state.front).normalize(),new THREE.Vector3(0,1.4,0),.42,0x77edc2,.14,.08);arrow.name='LAB_LOCAL_FRONT_INDICATOR';state.actor.add(arrow);
 if(!state.actor.getObjectByName('socket_face')||!state.actor.getObjectByName('socket_hand_right')||!state.prop.getObjectByName('SOCKET_grip')||!state.prop.getObjectByName('LID_PIVOT'))throw Error('REQUIRED_SOCKETS_MISSING');
 state.prevFoot=null;state.footSamples=[];state.loaded=true;state.frame=0;state.clipOverride='auto';$('clip').value='auto';setStatus('GLB y SHA256 válidos · '+state.clips.length+' clips · '+(state.warnings.length?state.warnings.join(' / '):'sin alerta de rig')+' · QA visual pendiente',!!state.warnings.length);runFrame(0);
}
function download(filename,content,type='application/json'){const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function exportConfig(){return {schema:'prometeo.3d.acting-lab-config/v1',fps:FPS,frame:state.frame,variant:state.variant,view:state.view,clip:state.clipOverride,rigFamily:state.rig?.familyProfiles?.[state.lock?.variants?.[state.variant]?.actor?.family]?.family,sourceLock:'SCENE_LOCK.json'};}
function reportError(err){state.playing=false;setStatus('ERROR: '+(err.message||String(err)),true);$('fallback').hidden=false;$('fallback').textContent='No se comprobó el render 3D. '+(err.message||String(err));console.error('ACTING_LAB',err);}
async function main(){const [lock,rig,stage,timeline]=await Promise.all(['SCENE_LOCK.json','RIG_ADAPTER.json','LAB_STAGE.json','ACTION_TIMELINE.json'].map(x=>fetch('./'+x,{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('CONFIG_HTTP_'+x);return r.json()})));
 state.lock=lock;state.rig=rig;state.stage=stage;state.cameraList=timeline;
 const check=validateShotlist(timeline);if(!check.ok||timeline.totalFrames!==END)throw Error('SHOTLIST_INVALID:'+check.errors.join(','));
 renderer=new THREE.WebGLRenderer({canvas:$('viewport'),antialias:true,preserveDrawingBuffer:true,powerPreference:'low-power'});renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
 orbit=new OrbitControls(camera,renderer.domElement);orbit.enableDamping=false;orbit.minDistance=.45;orbit.maxDistance=18;orbit.maxPolarAngle=Math.PI*.92;orbit.target.set(0,1,-1);stageFixture();fit();
 $('skin').addEventListener('change',e=>switchActor(e.target.value).catch(reportError));$('clip').addEventListener('change',e=>{state.clipOverride=e.target.value;state.playing=false;runFrame(state.frame)});
 $('viewMode').addEventListener('change',e=>setView(e.target.value));$('play').addEventListener('click',()=>{if(!state.loaded)return;state.playing=!state.playing;$('play').textContent=state.playing?'Pausar':'Reproducir';if(state.frame>=END-1)state.frame=0;});
 $('prev').addEventListener('click',()=>{state.playing=false;runFrame(state.frame-1)});$('next').addEventListener('click',()=>{state.playing=false;runFrame(state.frame+1)});
 $('seek').addEventListener('input',e=>{state.playing=false;$('play').textContent='Reproducir';runFrame(Number(e.target.value))});
 $('shots').addEventListener('click',e=>{const id=e.target?.dataset?.shot;if(!id)return;const shot=timeline.shots.find(s=>s.id===id);if(shot){state.playing=false;setView('director');runFrame(shot.startFrame)}});
 $('capture').addEventListener('click',()=>{if(!state.loaded)return;runFrame(state.frame);const a=document.createElement('a');a.href=renderer.domElement.toDataURL('image/png');a.download='acting-lab-f'+String(state.frame).padStart(3,'0')+'.png';a.click()});
 $('export').addEventListener('click',()=>download('ACTING_CONFIG.json',JSON.stringify(exportConfig(),null,2)));
 $('reset').addEventListener('click',()=>{state.playing=false;state.clipOverride='auto';$('clip').value='auto';setView('director');runFrame(0)});
 window.PROMETEO_LAB={seek(f){state.playing=false;runFrame(Number(f));return this.diagnostics()},setVariant(v){return switchActor(v)},setView,config:exportConfig,diagnostics:()=>({frame:state.frame,variant:state.variant,clips:state.clips.map(c=>({name:c.name,duration:c.duration})),facing:$('facing').textContent,contact:state.contact,ikDistance:state.ikDistance,feetProxy:state.footSamples.length?Math.max(...state.footSamples):null,rigWarnings:state.warnings}),async loadConfig(c){if(!c||c.schema!=='prometeo.3d.acting-lab-config/v1')throw Error('CONFIG_SCHEMA');if(c.variant&&c.variant!==state.variant)await switchActor(c.variant);if(c.view)setView(c.view);if(Number.isInteger(c.frame))runFrame(c.frame);return this.diagnostics()}};
 await switchActor('azul');let prior=0;function loop(now){if(state.playing&&state.loaded){const dt=prior?Math.min(.1,(now-prior)/1000):0;state.playhead+=dt*FPS;const f=state.playhead;if(f>=END-1){state.playing=false;$('play').textContent='Reproducir';}runFrame(Math.min(END-1,Math.floor(f)));state.playhead=f}prior=now;requestAnimationFrame(loop)}requestAnimationFrame(loop);window.addEventListener('resize',()=>{fit();runFrame(state.frame)});
}
main().catch(reportError);
