import * as builder from './constructor.mjs';
import {surfaceGate} from './surface-gate.mjs';
function generateArticle({shell,sweep,path}){
 const parts=[],joints=[],protectedFaces=[];
 const add=p=>(parts.push(p),p);
 const seat=(u,v)=>{const x=2*u-1,z=1-2*v;return{p:[.258*x*(1-.09*z**6),.463+.014*x*x-.012*(1-x*x)*(1-z*z)+.008*Math.max(0,z)**4,.244*z],n:[0,1,0]}};
 const back=(u,v)=>{const x=2*u-1;return{p:[(.195+.042*Math.sin(Math.PI*v))*x,.65+.224*v-.038*x*x*v,-.251-.054*v+.038*x*x],n:[0,0,1]}};
 const host=add(shell("saddle","walnut","seat",48,40,seat,.05));
 const rest=add(shell("lumbar","leather","backrest",48,36,back,.044));
 protectedFaces.push({name:host.name,faceVertices:49*41},{name:rest.name,faceVertices:49*37});
 const anchor=(fn,u,v,thick)=>{const {p,n}=fn(u,v);return p.map((x,i)=>x-n[i]*thick);};
 const link=(a,b,p)=>joints.push({from:a,to:b,point:p,type:"hidden socket"});
 for(const s of [-1,1])for(const z of [-1,1]){
  const id=(s<0?"L":"R")+(z<0?"R":"F"),u=s<0?.18:.82,v=z<0?.81:.19,target=anchor(seat,u,v,.034);
  const root=[s*.267,.023,z*.25],leg=add(sweep("leg-"+id,"bronze","leg",path([[root,[s*.245,.13,z*.22],[target[0]+s*.038,.31,target[2]+z*.036],target]],20),t=>[.016+.011*t,.015+.014*t],28));
  link(host.name,leg.name,target.map((x,i)=>i===1?x-.005:x));
  const cap=add(sweep("foot-"+id,"rubber","foot",[[root[0],.002,root[2]],[root[0],.014,root[2]],[root[0],.036,root[2]]],t=>[.021-.003*t,.021-.003*t],32));
  link(leg.name,cap.name,[root[0],.029,root[2]]);
 }
 for(const s of [-1,1]){
  const id=s<0?"L":"R",x=s*.16;
  const rail=add(sweep("underside-rail-"+id,"walnut","seat underframe",path([[[x,.38,-.159],[x,.373,-.06],[x,.373,.06],[x,.38,.159]]],16),()=>[.026,.025],24));
  for(const z of [-1,1]){const u=s<0?.18:.82,v=z<0?.76:.24,p=anchor(seat,u,v,.037),a=[x,.385,z*.133];const boss=add(sweep("boss-"+id+(z<0?"R":"F"),"bronze","mounting boss",[a,[a[0],.405,a[2]],p],()=>[.022,.022],24));link(rail.name,boss.name,a.map((x,i)=>i===1?x+.004:x));link(host.name,boss.name,p.map((x,i)=>i===1?x-.004:x));}
 }
 const top=anchor(back,.5,.60,.028),bottom=anchor(seat,.5,.83,.033);
 const spine=add(sweep("central-spine","bronze","back cantilever",path([[bottom,[0,.38,-.205],[0,.39,-.34],[0,.53,-.34]],[[0,.53,-.34],[0,.65,-.345],[0,.72,-.335],top]],22),t=>[.045-.019*t,.016-.005*t],32));
 link(host.name,spine.name,[bottom[0],bottom[1]-.004,bottom[2]]);
 link(rest.name,spine.name,[top[0],top[1]-.003,top[2]-.003]);
 return {id:"estribo-05",name:"ESTRIBO 05",parts,joints,feet:parts.filter(p=>p.role==="foot").map(p=>p.name),protectedFaces,dimensions:{width:.558,seatHeight:.463,backHeight:.874},units:"metre"};
}
function inspectSurfaces(model,surfaceGate){
 return model.protectedFaces.flatMap(h=>model.parts.filter(p=>p.name!==h.name).map(p=>surfaceGate(model.parts.find(q=>q.name===h.name),p,{faceVertices:h.faceVertices,normalOffset:.002})));
}
export const generate=()=>generateArticle(builder);
export const testSurfaces=m=>inspectSurfaces(m,surfaceGate);
