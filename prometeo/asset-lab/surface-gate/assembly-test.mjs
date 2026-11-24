import * as builder from './constructor.mjs';
import {surfaceGate} from './surface-gate.mjs';
import {demos,buildDemo} from './assembly-demos.mjs';
import {build as historicCollection} from '../chair-collection-10/models.mjs';
import {generate as historicPair} from '../chair-03-04/geometry.mjs';
export function runAssemblyTests(){
 const results=[],record=(name,pass,details)=>results.push({name,pass:!!pass,details});
 const {inspectAssembly,formByMaterial,sweep}=builder;
 const model=(name,parts,roots,relations=[],independent=[],protectedFaces=[])=>({name,parts,roots,relations,independent,protectedFaces});
 const r=(id,guest,host,type,min,max,seed,axis,reason='',windows=[],reach=.25)=>({id,guest,host,type,min,max,probes:[{seed,axis,reach}],reason,windows});
 const audit=m=>inspectAssembly(m,{gate:surfaceGate});
 const geometry=m=>{let bad=0,triangles=0;for(const p of m.parts){const edges=new Map();if(p.uvs.length!==2*p.positions.length/3||!p.positions.every(Number.isFinite))bad++;for(let i=0;i<p.indices.length;i+=3){triangles++;const ids=p.indices.slice(i,i+3);if(ids.some(x=>!Number.isInteger(x)||x<0||x>=p.positions.length/3)){bad++;continue;}const [a,b,c]=ids.map(x=>p.positions.slice(3*x,3*x+3)),u=b.map((x,k)=>x-a[k]),v=c.map((x,k)=>x-a[k]);if(Math.hypot(u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0])<1e-10)bad++;for(let k=0;k<3;k++){const x=ids[k],y=ids[(k+1)%3],key=Math.min(x,y)+':'+Math.max(x,y);edges.set(key,(edges.get(key)||0)+1);}}if([...edges.values()].some(x=>x!==2))bad++;}return {bad,triangles};};
 // Production precedes each object's audit; one failure does not skip another.
 for(const factory of demos){try{const {model:m,diagnostic:d}=buildDemo(factory),g=geometry(m);record(m.name,d.status==='PASS_LOCAL'&&!g.bad,{parts:m.parts.length,...g,relations:d.relations.map(x=>({id:x.id,ok:x.ok,gaps:x.probes.map(p=>p.gap)})),surfaces:d.surfaces.map(x=>({host:x.host,guest:x.guest,status:x.status})),issues:d.issues});}catch(e){record(factory.name,false,{error:e.message});}}
 // Historic, unmodified VELA meshes: evaluate both ends of both crossbars.
 const vela=historicCollection('14');
 for(const z of [-.32,.23])for(const s of [-1,1]){
  const guest=vela.parts.find(p=>p.name==='cross-'+z),host=vela.parts.find(p=>p.name==='floor-tie-'+(s<0?'L':'R'));
  const d=audit(model('VELA 14',[guest,host],[host.name],[r('required',guest.name,host.name,'ENCASTRE',-.02,-.002,[s*.24,.024,z],[s,0,0])]));
  const q=d.relations[0];record('VELA '+guest.name+' / '+host.name,!q.ok&&q.probes[0]?.gap>.04&&d.issues.some(x=>x.code==='DISCONNECTED_OR_UNDECLARED'),{gap:q.probes[0]?.gap,issues:d.issues});
 }
 // Historic RIEL/PÉTALO: same prior surface gate, integrated into relationship audit, no source changes.
 for(const [id,hn,gn,n] of [['rail','back-band','left-sled',861],['rail','back-band','right-sled',861],['petal','continuous-shell','mount',3185]]){
  const m=historicPair(id),h=m.parts.find(p=>p.name===hn),g=m.parts.find(p=>p.name===gn);
  const d=audit(model(id,[h,g],[hn],[],[gn],[{name:hn,faceVertices:n,residual:.001}]));
  record(id+'/'+gn,d.issues.some(x=>x.code==='PROTECTED_SURFACE_INTRUSION'),{surfaces:d.surfaces.map(x=>({status:x.status,hits:x.hits?.slice(0,2)}))});
 }
 const host=formByMaterial.woodPanel('host','walnut',{width:.4,depth:.4,y:.5,thickness:.1,round:.01});
 const rod=(name,y)=>sweep(name,'bronze','post',[[0,.25,0],[0,y,0]],()=>[.015,.015],24);
 const face=[{name:'host',faceVertices:25*21,residual:.004}];
 const w=[{min:[-.025,.49,-.025],max:[.025,.51,.025]}];
 for(const [name,y,type,min,max,windows,expected] of [
  ['contact',.4,'CONTACTO',-.001,.001,[],true],
  ['embed',.45,'ENCASTRE',-.055,-.045,[],true],
  ['unplanned intrusion',.55,'ENCASTRE',-.16,-.14,[],false],
  ['intentional through',.55,'PASANTE',-.16,-.14,w,true],
  ['misplaced through window',.55,'PASANTE',-.16,-.14,[{min:[.1,.49,.1],max:[.2,.51,.2]}],false]
 ]){
  const p=rod('post',y),d=audit(model(name,[host,p],['host'],[r(name,'post','host',type,min,max,[0,.4,0],[0,1,0],type==='PASANTE'?'Deliberate through': '',windows)],[],face));
  record(name,(d.status==='PASS_LOCAL')===expected,{status:d.status,issues:d.issues,gap:d.relations[0]?.probes[0]?.gap});
 }
 const orphan=rod('orphan',.35);
 const d=audit(model('unrelated piece',[host,orphan],['host']));
 record('undeclared orphan',d.issues.some(x=>x.code==='DISCONNECTED_OR_UNDECLARED'),d.issues);
 const noIntent=audit(model('undeclared clearance',[host,orphan],['host'],[r('gap','orphan','host','SEPARACION_INTENCIONAL',.04,.06,[0,.4,0],[0,1,0])],['orphan']));
 record('explicit intent required',noIntent.issues.some(x=>x.code==='MISSING_INTENT'),noIntent.issues);
 return results;
}
if(typeof process!=='undefined'&&process.argv[1]?.endsWith('assembly-test.mjs')){const results=runAssemblyTests();console.log(JSON.stringify(results,null,2));if(results.some(r=>!r.pass))process.exitCode=1;}
