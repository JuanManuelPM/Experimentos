import {generateChair as arc,validateChair} from '../chair-01/geometry.mjs';
import {generateChair as helix,inspectChair} from '../chair-02/geometry.mjs';
import {generate,inspect} from '../chair-03-04/geometry.mjs';
import {inspectSurfaces,guardedGenerate} from './surface-guard.mjs';
const assert=(x,msg)=>{if(!x)throw Error(msg);};
const faces=(nu,nv)=>Array.from({length:nu*nv*2},(_,k)=>Math.floor(k/2)*4+k%2);
const legacy=(id)=>model=>{
 const rail=id==='rail',host=rail?'back-band':'continuous-shell',nu=rail?40:48,nv=rail?20:64;
 return {surfaces:[{id:'visible',host,triangles:faces(nu,nv),oppositeVertexOffset:(nu+1)*(nv+1),residual:.001}],
 exempt:Object.fromEntries(model.parts.filter(p=>p.name!==host).map(p=>[p.name,'historical negative fixture: only reported host evaluated'])),
 connections:[]};
};
function box(name,lo,hi){
 const [x,y,z]=lo,[X,Y,Z]=hi;
 return {name,positions:[x,y,z,X,y,z,X,y,Z,x,y,Z,x,Y,z,X,Y,z,X,Y,Z,x,Y,Z],
 indices:[0,1,2,0,2,3,4,6,5,4,7,6,0,4,5,0,5,1,1,5,6,1,6,2,2,6,7,2,7,3,3,7,4,3,4,0]};
}
const synthetic=(top,bottom=-.03,x=.5,w=.04)=>({unit:'metre',parts:[box('host',[0,0,0],[1,.1,1]),box('guest',[x-w,bottom,.5-w],[x+w,top,.5+w])]});
const declaration=(mode,anchor,center=[.5,.05,.5],radius=.2)=>({surfaces:[{id:'top',host:'host',triangles:[2,3],outward:[0,1,0],residual:.005}],exempt:{guest:'structural insert'},connections:[{host:'host',guest:'guest',mode,anchor,zone:{center,radius},surface:'top'}]});
export function run(){
 const rows=[];function check(name,fn){try{const detail=fn();rows.push({name,pass:true,detail});}catch(e){rows.push({name,pass:false,error:String(e.message||e)});}}
 check('ARC original structural baseline',()=>{const r=validateChair(arc());assert(r.pass,JSON.stringify(r.errors));return r.stats.partCount;});
 check('HÉLICE original structural baseline',()=>{const r=inspectChair(helix());assert(r.ok,JSON.stringify(r.errors));return r.stats.parts;});
 for(const id of ['rail','petal'])check(id+' original negative, actual producer rejected',()=>{
  const model=generate(id),old=inspect(model);assert(old.ok,'old baseline must pass');const before=JSON.stringify(model);const report=inspectSurfaces(model,legacy(id)(model));
  const target=id==='rail'?['left-sled','right-sled']:['mount'];assert(target.every(n=>report.hits.some(h=>h.guest===n&&h.kind==='surface')),JSON.stringify(report));
  assert(JSON.stringify(model)===before,'model mutated');
  let e;try{guardedGenerate(generate,legacy(id),id);}catch(err){e=err;}assert(e?.message==='SURFACE_CONTRACT_REJECTED'&&e.report.hits.length,'producer did not block');return report.hits;
 });
 check('contact no penetration',()=>guardedGenerate(()=>synthetic(0),()=>declaration('CONTACTO',[.5,0,.5])).report);
 check('hidden joint with residual',()=>guardedGenerate(()=>synthetic(.07),()=>declaration('ENCASTRE_OCULTO',[.5,.04,.5])).report);
 check('intentional through joint bounded',()=>guardedGenerate(()=>synthetic(.13),()=>declaration('PASANTE_INTENCIONAL',[.5,.04,.5])).report);
 check('out-of-zone pass rejected',()=>{const r=inspectSurfaces(synthetic(.13),declaration('PASANTE_INTENCIONAL',[.5,.04,.5],[.5,.05,.5],.025));assert(!r.ok&&r.hits.length,JSON.stringify(r));return r.errors.map(e=>e.code);});
 check('residual-only intrusion',()=>{const r=inspectSurfaces(synthetic(.098),declaration('ENCASTRE_OCULTO',[.5,.04,.5]));assert(!r.ok&&r.hits.some(h=>h.kind==='residual')&&!r.hits.some(h=>h.kind==='surface'),JSON.stringify(r));return r.hits;});
 check('narrow crossing between host vertices',()=>{const r=inspectSurfaces(synthetic(.12,-.03,.371,.0001),declaration('ENCASTRE_OCULTO',[.371,.04,.5],[.371,.05,.5]));assert(!r.ok&&r.hits.length,JSON.stringify(r));return r.hits;});
 check('oblique local surface',()=>{const rot=p=>[p[0],(p[1]-p[2])*Math.SQRT1_2,(p[1]+p[2])*Math.SQRT1_2],m=synthetic(.13),c=declaration('ENCASTRE_OCULTO',[.5,.04,.5]);for(const p of m.parts){const a=[];for(let i=0;i<p.positions.length;i+=3)a.push(...rot(p.positions.slice(i,i+3)));p.positions=a;}c.surfaces[0].outward=rot([0,1,0]);c.connections[0].anchor=rot(c.connections[0].anchor);c.connections[0].zone.center=rot(c.connections[0].zone.center);const r=inspectSurfaces(m,c);assert(!r.ok&&r.hits.length,JSON.stringify(r));return r.hits;});
 check('missing contract blocks producer',()=>{let e;try{guardedGenerate(()=>synthetic(0),()=>null);}catch(err){e=err;}assert(e?.report?.errors[0]?.code==='INVALID_CONTRACT_OR_MESH','missing contract accepted');return e.report;});
 check('contact with penetration rejected',()=>{const r=inspectSurfaces(synthetic(.04),declaration('CONTACTO',[.5,0,.5]));assert(r.errors.some(e=>e.code==='CONTACT_PENETRATION'),JSON.stringify(r));return r.errors.map(e=>e.code);});
 check('unclassified guest blocked',()=>{const c=declaration('CONTACTO',[.5,0,.5]);c.exempt={};const r=inspectSurfaces(synthetic(0),c);assert(!r.ok&&r.errors.some(e=>e.message==='UNCLASSIFIED_PART:guest'),JSON.stringify(r));return r.errors;});
 return rows;
}
