// FORJA Escena 09 · serializer/timeline kernel, independent from Three.js
export const SCHEMA = 'prometeo.forja.escena/v2';
export const MAX_NODES = 1200;
export const MAX_ASSET_BYTES = 24 * 1024 * 1024;
const vec = (v,n) => Array.isArray(v) && v.length === n && v.every(x => Number.isFinite(x));
export const round = (n) => Number(Number(n).toFixed(6));
export const clamp = (n,a,b) => Math.max(a,Math.min(b,n));

export function validateDocument(doc) {
  if (!doc || doc.schema !== SCHEMA || !Array.isArray(doc.nodes) || !Array.isArray(doc.tracks) || !doc.assets || typeof doc.assets !== 'object') throw Error('Esquema de proyecto desconocido');
  if (doc.nodes.length > MAX_NODES || !Number.isFinite(doc.duration) || doc.duration <= 0 || doc.duration > 3600) throw Error('Límites de nodos o duración');
  let count=0;
  const ids=new Set();
  const walk=(node,depth=0)=>{
    if (!node || depth>40 || ++count>MAX_NODES) throw Error('Árbol demasiado profundo o grande');
    if (typeof node.uid!=='string'|| !/^[a-zA-Z0-9_-]{1,100}$/.test(node.uid)||ids.has(node.uid)) throw Error('ID de nodo inválido o duplicado');
    ids.add(node.uid);
    if (!['group','primitive','glb','glb-child','camera','light'].includes(node.kind)) throw Error('Tipo de nodo desconocido');
    if (!vec(node.p,3)||!vec(node.q,4)||!vec(node.s,3)||node.s.some(x=>Math.abs(x)<0.00001)) throw Error('Transformación inválida');
    if (node.kind==='glb' && (!node.asset || !doc.assets[node.asset])) throw Error('GLB externo faltante');
    if (!Array.isArray(node.children)) throw Error('Jerarquía inválida');
    if ((node.kind==='primitive'||node.kind==='light'||node.kind==='camera')&&node.children.length) throw Error('El tipo no admite hijos');
    node.children.forEach(child=>walk(child,depth+1));
  };
  doc.nodes.forEach(n=>walk(n));
  for (const track of doc.tracks) {
    if (!ids.has(track.uid)||!Array.isArray(track.keys)||track.keys.length>500) throw Error('Track sin nodo o demasiado largo');
    let last=-1;
    for(const k of track.keys){
      if(!Number.isFinite(k.t)||k.t<0||k.t>doc.duration||k.t<=last||!vec(k.p,3)||!vec(k.q,4)||!vec(k.s,3))throw Error('Keyframe inválido');
      last=k.t;
    }
  }
  let bytes=0;
  for(const asset of Object.values(doc.assets)){
    if(typeof asset!=='string'||!/^[A-Za-z0-9+/]*={0,2}$/.test(asset))throw Error('Datos GLB inválidos');
    bytes+=Math.floor(asset.length*.75);
  }
  if(bytes>MAX_ASSET_BYTES)throw Error('GLB demasiado grande para el proyecto (24 MB)');
  return {ok:true,nodes:count,assets:Object.keys(doc.assets).length,tracks:doc.tracks.length};
}

function qslerp(a,b,u){
  let dot=a.reduce((v,x,i)=>v+x*b[i],0), target=b;
  if(dot<0){target=b.map(x=>-x);dot=-dot}
  if(dot>.9995){
    const r=a.map((x,i)=>x+(target[i]-x)*u);
    const length=Math.hypot(...r)||1;return r.map(x=>x/length);
  }
  const angle=Math.acos(clamp(dot,-1,1)),sin=Math.sin(angle);
  return a.map((x,i)=>(x*Math.sin((1-u)*angle)+target[i]*Math.sin(u*angle))/sin);
}
export function sampleTrack(keys,time){
  if(!keys?.length)return null;
  if(time<=keys[0].t)return {p:keys[0].p.slice(),q:keys[0].q.slice(),s:keys[0].s.slice()};
  if(time>=keys[keys.length-1].t){const k=keys[keys.length-1];return {p:k.p.slice(),q:k.q.slice(),s:k.s.slice()}}
  const b=keys.findIndex(k=>k.t>=time),a=b-1,k0=keys[a],k1=keys[b],u=(time-k0.t)/(k1.t-k0.t);
  return {p:k0.p.map((x,i)=>x+(k1.p[i]-x)*u),q:qslerp(k0.q,k1.q,u),s:k0.s.map((x,i)=>x+(k1.s[i]-x)*u)};
}
export function putKey(keys,key){
  const clone=keys.filter(k=>Math.abs(k.t-key.t)>.0001);
  clone.push(JSON.parse(JSON.stringify(key)));clone.sort((a,b)=>a.t-b.t);
  return clone;
}
export function compareDocuments(a,b){
  const canonical=(value)=>{
    if(Array.isArray(value))return value.map(canonical);
    if(value&&typeof value==='object')return Object.keys(value).sort().reduce((v,k)=>{v[k]=canonical(value[k]);return v},{});
    if(typeof value==='number')return round(value);
    return value;
  };
  return JSON.stringify(canonical(a))===JSON.stringify(canonical(b));
}
