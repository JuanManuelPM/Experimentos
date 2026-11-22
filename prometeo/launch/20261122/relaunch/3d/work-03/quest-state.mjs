// Asteroide Jardín · W7 · pure deterministic quest reducer, independent of renderer/storage.
export const QUEST_VERSION=2;
export function freshQuest(){return {version:QUEST_VERSION,stage:0,drops:[],metBoro:false,completed:false,dir:[0,1,0]};}
export function restoreQuest(raw){
 const q=freshQuest();
 if(!raw||raw.version!==QUEST_VERSION||!Array.isArray(raw.dir)||raw.dir.length!==3||raw.dir.some(n=>!Number.isFinite(n))||!Array.isArray(raw.drops))return q;
 q.dir=raw.dir; q.stage=raw.stage===0?0:1; q.drops=[...new Set(raw.drops.filter(n=>Number.isInteger(n)&&n>=0&&n<3))];
 q.metBoro=raw.metBoro===true; q.completed=raw.completed===true&&q.metBoro&&q.drops.length===3;
 if(q.completed)q.stage=3;
 return q;
}
export function questAction(current,action){
 const q=restoreQuest(current);
 let message='', changed=false, finale=false;
 if(action==='nima'){
  if(q.stage===0){q.stage=1;changed=true;message='Nima: El corazón olvidó brillar. Traé los tres rocíos. Después hablá con Boro.';}
  else message=q.completed?'Nima: Ahora todo el cielo tiene raíces.':'Nima: No hay bordes. Seguí la luz y el sendero circular.';
 }else if(action==='boro'){
  if(q.stage===0) message='Boro: Encontrá a Nima, junto al faro.';
  else if(!q.metBoro){q.metBoro=true;changed=true;message='Boro: La palabra que faltaba era florecer. Llevála al corazón.';}
  else message=q.completed?'Boro: Nos quedamos a cuidar este pequeño mundo.':'Boro: El faro espera. ¿Lo escuchás?';
 }else if(/^drop:[012]$/.test(action)){
  const i=Number(action.slice(-1));
  if(q.stage===0)message='Primero hablá con Nima.';
  else if(q.drops.includes(i))message='Este rocío ya está con vos.';
  else {q.drops.push(i);q.drops.sort();changed=true;message='Rocío '+q.drops.length+'/3. Algo despierta bajo tus pies.';}
 }else if(action==='altar'){
  if(q.completed)message='El jardín sigue creciendo.';
  else if(q.stage===0)message='El faro duerme. Buscá a Nima.';
  else if(q.drops.length===3&&q.metBoro){q.completed=true;q.stage=3;changed=true;finale=true;message='La luz volvió. El jardín se abre a las estrellas.';}
  else message='Faltan '+(3-q.drops.length)+' rocíos'+(!q.metBoro?' y una conversación con Boro.':'.');
 }else throw new Error('Acción desconocida: '+action);
 return {state:q,message,changed,finale};
}
