import {shell,sweep,formByMaterial as form,meshAnchor,anchoredSweep,inspectAssembly} from './constructor.mjs';
import {surfaceGate} from './surface-gate.mjs';
const U=[0,1,0], D=[0,-1,0], X=[1,0,0];
const probe=(seed,axis,reach=.15)=>({seed,axis,reach});
function object(name,roots){return {name,parts:[],relations:[],protectedFaces:[],roots,independent:[]};}
function part(m,p){m.parts.push(p);return p;}
function relation(m,guest,host,type,min,max,probes,reason='',windows=[]){m.relations.push({id:guest.name+'→'+host.name,guest:guest.name,host:host.name,type,min,max,probes,reason,windows});}
function disk(name,mat,x,z,y0,y1,r){return sweep(name,mat,'structure',[[x,y0,z],[x,y1,z]],()=>[r,r],48);}
export function consoleTable(){
 const m=object('LÍNEA · consola de nogal y acero',['top']);
 const top=part(m,form.woodPanel('top','walnut',{width:1.04,depth:.40,y:.78,thickness:.042,round:.025}));
 m.protectedFaces.push({name:top.name,faceVertices:25*21,residual:.004});
 const legs={};for(const x of [-.43,.43])for(const z of [-.145,.145]){
  const id=(x<0?'L':'R')+(z<0?'B':'F');
  const q=anchoredSweep({name:'leg-'+id,material:'graphite',start:[x,.028,z],host:top,seed:[x,.74,z],axis:U,depth:.012,radius:.017});
  const l=part(m,q.part);legs[id]=l;relation(m,l,top,'ENCASTRE',-.014,-.010,[probe(q.anchor.point,U)]);
  const foot=part(m,disk('shoe-'+id,'rubber',x,z,.0,.028,.021));relation(m,foot,l,'CONTACTO',-.0001,.0001,[probe([x,.028,z],U)]);
 }
 for(const z of [-.145,.145]){
  const l=legs['L'+(z<0?'B':'F')],r=legs['R'+(z<0?'B':'F')];
  const a=meshAnchor(l,[-.41,.20,z],[-1,0,0]),b=meshAnchor(r,[.41,.20,z],X);
  if(!a||!b)throw Error('brace anchors');
  const bar=part(m,form.metalTube('brace-'+z,'bronze',[[a.point[0]-.006,.20,z],[b.point[0]+.006,.20,z]],.010));
  relation(m,bar,l,'ENCASTRE',-.008,-.004,[probe(a.point,[-1,0,0])]);
  relation(m,bar,r,'ENCASTRE',-.008,-.004,[probe(b.point,X)]);
 }
 return m;
}
export function taskLamp(){
 const m=object('ÓPTICA · lámpara de brazo articulado',['base']);
 const base=part(m,disk('base','graphite',0,0,0,.032,.135));
 const stem=part(m,anchoredSweep({name:'stem',material:'bronze',start:[0,.42,0],host:base,seed:[0,.03,0],axis:D,depth:.010,radius:.016}).part);
 relation(m,stem,base,'ENCASTRE',-.012,-.008,[probe([0,.032,0],D)]);
 const lower=part(m,disk('pivot-lower','graphite',0,0,.41,.45,.045));
 relation(m,stem,lower,'ENCASTRE',-.012,-.008,[probe([0,.41,0],U)]);
 const upper=part(m,disk('pivot-upper','graphite',0,0,.458,.502,.045));
 relation(m,lower,upper,'ARTICULACION',.007,.009,[probe([.032,.454,0],U),probe([-.032,.454,0],U)],'Holgura axial nominal de 8 mm; no simulación de giro');
 const pin=part(m,disk('pivot-pin','bronze',0,0,.435,.485,.009));
 relation(m,pin,upper,'ENCASTRE',-.029,-.025,[probe([0,.458,0],U)]);
 relation(m,pin,lower,'ENCASTRE',-.017,-.013,[probe([0,.45,0],D)]);
 const a=meshAnchor(upper,[.04,.480,0],[-1,0,0]);
 const arm=part(m,form.metalTube('arm','bronze',[[a.point[0]-.012,.48,0],[.32,.48,0],[.35,.45,0]],.012));
 relation(m,arm,upper,'ENCASTRE',-.014,-.010,[probe(a.point,[-1,0,0])]);
 const collar=part(m,disk('shade-collar','graphite',.35,0,.42,.462,.032));
 // End of inclined tube overlaps collar; local probe along horizontal axis avoids cap ambiguity.
 relation(m,arm,collar,'ENCASTRE',-.045,-.001,[probe([.325,.45,0],X,.08)]);
 const shade=part(m,shell('opal-shade','cream','shade',32,16,(u,v)=>{const a=(u-.5)*Math.PI*1.8,r=.037+.089*v;return {p:[.35+r*Math.sin(a),.43-.12*v,r*Math.cos(a)],n:[Math.sin(a),.742,Math.cos(a)].map(x=>x/Math.hypot(1,.742))};},.004));
 // The open shade uses a separately declared attachment lip; verify at front meridian.
 const lip=part(m,form.metalTube('shade-lip','bronze',[[.35,.425,.024],[.35,.425,.044]],.005));
 relation(m,lip,collar,'ENCASTRE',-.011,-.005,[probe([.35,.425,.032],[0,0,-1])]);
 relation(m,lip,shade,'JUNTA_VISIBLE',-.012,.003,[probe([.35,.425,.039],[0,0,1],.03)],'Borde de sujeción visible');
 // A detached floor-level display accessory, deliberately separate, not a support.
 const remote=part(m,form.fabricPanel('felt-pad','felt',{width:.085,depth:.075,y:.012,sag:.002,thickness:.004}));
 // relocate the accessory without changing primitive geometry.
 for(let i=0;i<remote.positions.length;i+=3)remote.positions[i]+=.225;
 m.independent.push(remote.name);
 relation(m,base,remote,'SEPARACION_INTENCIONAL',.04,.07,[probe([.16,.009,0],X,.12)],'Muestra de fieltro independiente, no parte estructural');
 return m;
}
export const demos=[consoleTable,taskLamp];
export function buildDemo(factory){const model=factory();return {model,diagnostic:inspectAssembly(model,{gate:surfaceGate})};}
