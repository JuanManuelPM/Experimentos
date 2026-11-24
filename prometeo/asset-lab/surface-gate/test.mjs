import {generate,inspect} from '../chair-03-04/geometry.mjs';
import {surfaceGate} from './surface-gate.mjs';
function fixtures(generate,inspect,surfaceGate){
 const results=[];
 const box=(name,lo,hi)=>{const positions=[lo[0],hi[1],lo[2],hi[0],hi[1],lo[2],lo[0],hi[1],hi[2],hi[0],hi[1],hi[2],lo[0],lo[1],lo[2],hi[0],lo[1],lo[2],lo[0],lo[1],hi[2],hi[0],lo[1],hi[2]];return {name,positions,indices:[0,2,1,1,2,3,4,5,6,5,7,6,0,1,4,1,5,4,2,6,3,3,6,7,0,4,2,2,4,6,1,3,5,3,7,5]};};
 const host=box("host",[-.5,.4,-.5],[.5,.5,.5]),post=y=>box("post",[-.04,.2,-.04],[.04,y,.04]);
 for(const [name,y,windows,expected] of [["contact",.4,[],true],["hidden",.45,[],true],["too thin",.4995,[],false],["unplanned pass",.55,[],false],["deliberate pass",.55,[{min:[-.05,.49,-.05],max:[.05,.51,.05]}],true],["wrong window",.55,[{min:[.1,.49,.1],max:[.2,.51,.2]}],false]]){const q=surfaceGate(host,post(y),{faceVertices:4,windows});results.push({name,expected,actual:q.ok,hits:q.hits});}
 for(const [id,h,f,n] of [["rail","back-band","left-sled",861],["rail","back-band","right-sled",861],["petal","continuous-shell","mount",3185]]){const m=generate(id),q=surfaceGate(m.parts.find(p=>p.name===h),m.parts.find(p=>p.name===f),{faceVertices:n});results.push({name:id+"/"+f,expected:false,actual:q.ok,old:inspect(m).ok,hits:q.hits});}
 if(results.some(r=>r.expected!==r.actual||r.old===false))throw Error(JSON.stringify(results));return results;
}
console.log(JSON.stringify(fixtures(generate,inspect,surfaceGate),null,2));
