import * as T from "three";
import {VERSION,IDENTITIES,NOSES,actorRecipe,faceRecipe,pigments,CAFE,DEFAULT_ACTION,sampleAction,sampleScene} from "./contract.mjs";
import {Actor,loadHead,loadGLB,makeRenderer,floor,chair,table,cup,cafe,cameraAt} from "./runtime.mjs";
const $=s=>document.querySelector(s),mode=document.body.dataset.mode,host=$("#viewport"),controls=$("#controls"),hud=$("#hud"),err=$("#error"),stageTitle=$("#stage-title");
function control(label,type,props={}){let row=document.createElement("label");row.textContent=label;let e=document.createElement(type);Object.assign(e,props);row.append(e);controls.append(row);return e}
function button(label,fn){let b=document.createElement("button");b.textContent=label;b.onclick=async()=>{try{await fn()}catch(e){err.textContent=e.message}};controls.append(b);return b}
function select(label,options,initial=0){let e=control(label,"select");for(let [i,o] of options.entries()){let a=document.createElement("option");a.value=i;a.textContent=o;e.add(a)}e.selectedIndex=initial;return e}
function slider(label,min,max,step,value,fn){let e=control(label,"input",{type:"range",min,max,step,value});e.oninput=()=>fn(+e.value);return e}
function download(data,name,type){let a=document.createElement("a"),url=URL.createObjectURL(new Blob([data],{type}));a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000)}
const file=(accept,fn)=>{let i=control("Importar archivo","input",{type:"file",accept});i.onchange=async()=>{try{if(i.files[0])await fn(i.files[0])}catch(e){err.textContent=e.message}};return i};
try{
 const head=await loadHead(),r=makeRenderer(host),{scene,camera,renderer,key}=r;
 let update=()=>{},actors=[],dt=0,frames=[],last=performance.now(),lastHud=0,detail="";
 const identity=select("Identidad",IDENTITIES.map(x=>x.name));let visual=select("Acabado",["Clean","PS2","PS1"],mode==="v17"?1:0);visual.onchange=()=>r.view(["clean","ps2","ps1"][+visual.value]);visual.onchange();
 function actor(i,recipe){let a=new Actor(head,recipe||IDENTITIES[i]);scene.add(a.root);actors.push(a);return a}
 function clearActors(){for(let a of actors)a.dispose();actors=[]}
 let imported=null;
 if(mode==="v15"){
  stageTitle.textContent="V15 / Character Factory";
  floor(scene);let rec=actorRecipe(IDENTITIES[0]),a=actor(0,rec),angle=.3,zoom=false,clay=false,animated=false;
  const nose=select("Familia nasal",NOSES.map(x=>x.id),rec.nose);
  const length=slider("Largo de nariz",-1,1,.01,rec.noseAmount,v=>edit({noseAmount:v}));
  const browL=slider("Ceja izquierda",0,1,.01,0,v=>edit({browL:v}));
  const browR=slider("Ceja derecha",0,1,.01,0,v=>edit({browR:v}));
  slider("Mirada horizontal",-1,1,.02,0,v=>edit({lookX:v}));slider("Mirada vertical",-1,1,.02,0,v=>edit({lookY:v}));
  slider("Parpadeo",0,1,.01,0,v=>edit({blink:v}));slider("Boca",0,1,.01,0,v=>edit({mouth:v}));
  const hair=select("Cabello",["Calvo","Corto","Lateral","Largo"],rec.hair);
  const body=select("Cuerpo",["P01","P02","P03","P04","P05","P06"],rec.body);
  const outfit=select("Vestuario",["Urbano / provisional","Brasa","Guardia","Senda","Lluvia"],rec.outfit);
  function edit(p){rec=actorRecipe({...rec,...p});a.edit(rec);a.setClay(clay)}
  function rebuild(p){rec=actorRecipe(p);clearActors();a=actor(0,rec);a.setClay(clay);nose.value=rec.nose;length.value=rec.noseAmount;browL.value=rec.browL;browR.value=rec.browR;hair.value=rec.hair;body.value=rec.body;outfit.value=rec.outfit}
  identity.onchange=()=>rebuild(IDENTITIES[+identity.value]);nose.onchange=()=>edit({nose:+nose.value});hair.onchange=()=>edit({hair:+hair.value});body.onchange=()=>rebuild({...rec,body:+body.value});outfit.onchange=()=>rebuild({...rec,outfit:+outfit.value});
  const focus=select("Vista",["Tres cuartos","Frente","Perfil","Cuerpo","Seis / arcilla"]);focus.onchange=()=>{let i=+focus.value;if(i===4){clearActors();IDENTITIES.forEach((p,j)=>{let b=actor(j,{...p,hair:0,outfit:0});b.root.position.x=(j-2.5)*.8;b.setClay(true)});return}if(actors.length!==1)rebuild(rec);angle=[.55,0,Math.PI/2,.32][i];zoom=i<3};
  focus.value=3;focus.onchange();
  button("Arcilla / color",()=>{clay=!clay;for(let b of actors)b.setClay(clay)});
  button("Pose / marcha",()=>{animated=!animated});
  button("Cambiar luz",()=>{key.position.x*=-1;key.position.z=key.position.z>0?-4:4});
  button("Exportar receta JSON",()=>download(JSON.stringify(rec,null,2),rec.id+".json","application/json"));
  button("Exportar atlas PNG",()=>{let e=document.createElement("a");e.href=a.face.exportAtlas();e.download=rec.id+"-atlas.png";e.click()});
  button("Exportar GLB",async()=>download(await a.exportGLB(),rec.id+".glb","model/gltf-binary"));
  file(".json,.glb",async f=>{if(f.name.endsWith(".json")){if(imported){scene.remove(imported);imported=null}rebuild(JSON.parse(await f.text()))}else{let model=await loadGLB(await f.arrayBuffer());clearActors();if(imported)scene.remove(imported);imported=model.scene;scene.add(imported);detail="GLB reimportado: "+model.scene.children.length+" nodos";zoom=false}});
  button("Matriz nasal / 45",()=>{if(actors.length!==1)rebuild(rec);let keep={...rec},records=[];for(let body of [0,2,4])for(let n=0;n<5;n++)for(let amount of [-1,0,1]){a.edit({...IDENTITIES[body],nose:n,noseAmount:amount});records.push({base:body,nose:n,value:amount,nostril:a.face.landmark("nostril"),floor:a.face.landmark("nasal-floor")})}a.edit(keep);a.setClay(clay);download(JSON.stringify(records,null,2),"nasal-matrix-positions.json","application/json");detail="45 posiciones exportadas; revisión visual pendiente."});
  update=t=>{if(imported){camera.position.set(2,1.5,3);camera.lookAt(0,.9,0);return}if(actors.length===6){camera.position.set(0,1.2,Math.max(5,4.5/camera.aspect));camera.lookAt(0,.9,0);return}if(animated)a.apply("walk",t*.8);const y=zoom?a.profile.h*.91:a.profile.h*.5,d=zoom?.65:Math.max(3.0,2.9/camera.aspect);camera.position.set(Math.sin(angle)*d,y+(zoom?.015:.18),Math.cos(angle)*d);camera.lookAt(0,y,0)};
  window.PROMETEO_ARTICLE={version:VERSION,mode,get actors(){return actors},get recipe(){return rec},get actor(){return a},renderer};
 }else{
  const isCafe=mode==="v17";stageTitle.textContent=isCafe?"V17 / Café Buenos Aires":"V16 / Character in Action";
  let recipe=isCafe?JSON.parse(JSON.stringify(CAFE)):{schema:"prometeo.character-world.scene/v1",id:"cup-lab",duration:19,actors:[{identity:0,action:{...DEFAULT_ACTION}}],dialogue:[]};
  if(isCafe){cafe(scene);identity.parentElement.hidden=true}else{floor(scene,"#8d8c80");table(scene,-.08,.65,.68,.70)}
  let objects=[],seats=[],playing=false,time=0,cameraMode="general",lastSubtitle="";
  function rebuild(){clearActors();for(let x of objects)scene.remove(x);for(let s of seats){s.root.removeFromParent();s.dispose()}objects=[];seats=[];for(let a of recipe.actors){actor(a.identity);seats.push(chair(scene,a.action.chair,a.action.yaw));objects.push(cup(scene))}}
  rebuild();identity.onchange=()=>{recipe.actors[0].identity=+identity.value;rebuild()};
  let play=button("Reproducir",()=>{if(time>=recipe.duration)time=0;playing=!playing;play.textContent=playing?"Pausa":"Reproducir"});
  button("Reiniciar",()=>{time=0;playing=false;play.textContent="Reproducir"});
  let timeline=slider("Timeline / segundos",0,recipe.duration,.01,0,v=>{time=v;playing=false;play.textContent="Reproducir"});
  let cameraSelect=select("Cámara",["General","Medio","Primer plano","Detalle","Seguimiento"]);cameraSelect.onchange=()=>cameraMode=["general","medium","close","detail","follow"][+cameraSelect.value];
  let targetActor=select("Actor a editar",recipe.actors.map(a=>IDENTITIES[a.identity].name));
  const choice=()=>recipe.actors[+targetActor.value]||recipe.actors[0];
  const x=slider("Taza X (m)",-1.5,1.5,.01,recipe.actors[0].action.cup[0],v=>{choice().action.cup[0]=v});
  const z=slider("Taza Z (m)",-1.5,1.5,.01,recipe.actors[0].action.cup[2],v=>{choice().action.cup[2]=v});
  const yaw=slider("Rotación silla",-Math.PI,Math.PI,.01,recipe.actors[0].action.yaw,v=>{choice().action.yaw=v;seats[+targetActor.value].root.rotation.y=v});
  const sx=slider("Silla X (m)",-1.6,1.6,.01,recipe.actors[0].action.chair[0],v=>{choice().action.chair[0]=v;seats[+targetActor.value].root.position.x=v});
  targetActor.onchange=()=>{let a=choice().action;x.value=a.cup[0];z.value=a.cup[2];yaw.value=a.yaw;sx.value=a.chair[0]};
  button("Fuera de alcance",()=>{choice().action.cup[0]=1.4;choice().action.cup[2]=1.4;x.value=z.value=1.4;time=0});
  button("Exportar escena JSON",()=>download(JSON.stringify(recipe,null,2),recipe.id+".json","application/json"));
  file(".json",async f=>{let j=JSON.parse(await f.text());if(j.schema!=="prometeo.character-world.scene/v1"||!Array.isArray(j.actors)||j.actors.length!==recipe.actors.length)throw Error("Receta incompatible con este laboratorio");recipe=j;time=0;rebuild();timeline.max=recipe.duration;targetActor.onchange()});
  if(isCafe)button("Luz / interior cálido",()=>{key.color.set(key.color.getHex()===0xffe0ba?"#d8e3ee":"#ffe0ba");key.position.set(3,5,-2)});
  update=()=>{if(playing){time=Math.min(time+dt,recipe.duration);if(time>=recipe.duration){playing=false;play.textContent="Reproducir"}}timeline.value=time;let errors=[],states=sampleScene(recipe,time,actors.map(a=>a.profile.h)).actors;
   for(let [i,a] of states.entries()){errors.push(actors[i].action(a,a.time,objects[i]));let line=recipe.dialogue.find(d=>d.actor===i&&d.start<=time&&time<d.end);if(line){const val=.15+.45*Math.abs(Math.sin(time*15));if(Math.abs((actors[i].face.pose.mouth||0)-val)>.13)actors[i].face.setExpression({mouth:val})}else if(actors[i].face.pose.mouth!==0)actors[i].face.setExpression({mouth:0})}
   let d=recipe.dialogue.find(d=>d.start<=time&&time<d.end);$("#subtitle").textContent=d?IDENTITIES[recipe.actors[d.actor].identity].name+": "+d.text:"";detail=states.map((a,i)=>a.phase+" · "+(errors[i]===null?"":(errors[i]*100).toFixed(1)+" cm de error de palma · ")+a.support).join(" / ");cameraAt(camera,cameraMode);};
  window.PROMETEO_ARTICLE={version:VERSION,mode,get actors(){return actors},get recipe(){return recipe},renderer,setTime:t=>{time=t;playing=false;update();r.render()},get time(){return time}};
 }
 function tick(now){requestAnimationFrame(tick);dt=Math.min(.05,(now-last)/1000);last=now;if(document.hidden)return;let before=performance.now();update(now/1000);r.render();frames.push(performance.now()-before);if(frames.length>240)frames.shift();if(now-lastHud>750){let a=[...frames].sort((x,y)=>x-y);hud.textContent=VERSION+" | "+actors.length+" actor(es) | "+renderer.info.render.calls+" draw | "+renderer.info.render.triangles+" tri | CPU render/update p95 "+(a[Math.floor(a.length*.95)]||0).toFixed(1)+" ms | "+detail;lastHud=now}}
 requestAnimationFrame(tick);document.documentElement.dataset.ready="candidate";
}catch(e){err.textContent="No se pudo iniciar: "+e.message;console.error(e)}
