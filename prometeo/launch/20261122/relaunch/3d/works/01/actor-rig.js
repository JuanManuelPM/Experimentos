// Interlocutora W7 01 — dirección de actuación sobre rig glTF CC0.
import * as THREE from "three";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";

export const MODEL_URL="https://cdn.jsdelivr.net/gh/mrdoob/three.js@r164/examples/models/gltf/RobotExpressive/RobotExpressive.glb";

export async function loadActor(scene){
  const gltf=await new GLTFLoader().loadAsync(MODEL_URL);
  const root=gltf.scene;
  // Ajuste métrico, sin reconstruir anatomía ni agregar piezas a la cara.
  root.updateMatrixWorld(true);
  const box=new THREE.Box3().setFromObject(root);
  const sourceHeight=box.max.y-box.min.y;
  if(!Number.isFinite(sourceHeight)||sourceHeight<=0)throw Error("Asset glTF sin escala verificable");
  const scale=2.85/sourceHeight;
  root.scale.setScalar(scale);
  root.position.set(-((box.min.x+box.max.x)/2)*scale,-box.min.y*scale,-((box.min.z+box.max.z)/2)*scale);
  scene.add(root);
  const mixer=new THREE.AnimationMixer(root);
  const clips=Object.fromEntries(gltf.animations.map(c=>[c.name,c]));
  const idleClip=clips.Idle || gltf.animations[0];
  if(!idleClip)throw Error("El GLB carece de clips de actuación");
  const idle=mixer.clipAction(idleClip);
  idle.play();
  let action=idle,emotion="neutral",mouth=0,lastSpeech=false;
  const faces=[],skinned=[];
  root.traverse(o=>{
    if(o.isSkinnedMesh)skinned.push(o);
    if(o.morphTargetDictionary&&o.morphTargetInfluences){
      faces.push({mesh:o,targets:Object.entries(o.morphTargetDictionary)});
    }
  });
  if(skinned.length===0||faces.length===0)throw Error("GLB sin skin o morphs faciales: no sustituir por primitivas");
  const nameOf=(name)=>{
    const match=Object.keys(clips).find(x=>x.toLowerCase()===name.toLowerCase());
    return match||null;
  };
  const choose=(name)=>{
    const key=nameOf(name);
    if(!key||clips[key]===idleClip)return false;
    const next=mixer.clipAction(clips[key]);
    next.reset();
    next.setLoop(THREE.LoopOnce,1);
    next.clampWhenFinished=true;
    next.play();
    next.crossFadeFrom(action,0.30,true);
    action=next;
    return true;
  };
  mixer.addEventListener("finished",e=>{
    if(e.action===action&&action!==idle){
      idle.enabled=true;idle.reset().play();idle.crossFadeFrom(action,0.55,true);action=idle;
    }
  });
  let time=0;
  function update(dt,{speaking=false,timbre=0}={}){
    time+=Math.min(dt,0.05);
    mixer.update(Math.min(dt,0.05));
    // Visema de apertura aproximada: controlada por el reloj del audio,
    // no se pretende alineación fonética de precisión.
    const targetMouth=speaking?(0.10+0.66*Math.pow(Math.abs(Math.sin(timbre*12.5)),1.5)):0;
    mouth=THREE.MathUtils.damp(mouth,targetMouth,14,dt);
    const targets=emotion==="vulnerable"?{sad:0.83,angry:0.06,surprised:0}:emotion==="warm"?{sad:0,angry:0,surprised:0.21}:{sad:0,angry:0,surprised:0.02};
    for(const {mesh,targets:channels} of faces){
      for(const [name,index] of channels){
        const n=name.toLowerCase();
        const base=n.includes("sad")?targets.sad:n.includes("angry")?targets.angry:n.includes("surpris")?targets.surprised:0;
        // El morph Surprise está en el propio modelo y abre la boca.
        const speech=n.includes("surpris")?mouth:0;
        const desired=Math.max(base,speech);
        mesh.morphTargetInfluences[index]=THREE.MathUtils.damp(mesh.morphTargetInfluences[index]||0,desired,11,dt);
      }
    }
    lastSpeech=speaking;
  }
  function setEmotion(value){emotion=value;return emotion;}
  function inspect(){
    return {source:MODEL_URL,skinnedMeshes:skinned.length,facialMeshes:faces.length,
      morphTargets:faces.flatMap(x=>x.targets.map(t=>t[0])),clips:Object.keys(clips),
      speech:lastSpeech,emotion,modelHeightMeters:2.85};
  }
  function pose(){return {emotion,morphs:faces.map(x=>({mesh:x.mesh.name,values:Object.fromEntries(x.targets.map(([n,i])=>[n,Number(x.mesh.morphTargetInfluences[i].toFixed(3))]))})),activeClip:action.getClip().name};}
  return {root,update,choose,setEmotion,inspect,pose};
}
