// Shared pure contract for the three stages. metres, +Y up, +Z forward.
export const VERSION="character-world/0.1.0-candidate";
export const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
export const ease=x=>{x=clamp(x);return x*x*(3-2*x)};
export const mix=(a,b,t)=>a+(b-a)*t;
export const vMix=(a,b,t)=>a.map((x,i)=>mix(x,b[i],t));
export const distance=(a,b)=>Math.hypot(...a.map((x,i)=>x-b[i]));
export const NOSES=[{id:"straight",w:1,l:1,d:1},{id:"short",w:1.22,l:.79,d:.78},{id:"aquiline",w:.85,l:1.19,d:1.26},{id:"wide",w:1.38,l:.91,d:1.03},{id:"narrow",w:.69,l:1.10,d:1.13}];
export const IDENTITIES=[
 {id:"iris",name:"Iris",body:0,width:1.12,jaw:1.25,chin:1.1,forehead:.88,eyeWidth:1.05,eyeHeight:.68,eyeTilt:-.16,mouthWidth:1.23,lipMass:.76,nose:2,skin:"#b77e58",brow:"#45342a",iris:"#27383a",hair:1},
 {id:"soter",name:"Soter",body:2,width:1.2,jaw:1.29,chin:1.19,forehead:1.11,eyeWidth:.83,eyeHeight:.73,eyeTilt:.10,mouthWidth:.92,lipMass:1.02,nose:3,skin:"#8f644a",brow:"#332b23",iris:"#494137",hair:0},
 {id:"nara",name:"Nara",body:1,width:.82,jaw:.68,chin:.82,forehead:1.14,eyeWidth:1.33,eyeHeight:1.28,eyeTilt:.27,mouthWidth:.8,lipMass:1.36,nose:1,skin:"#cc9d7b",brow:"#362a22",iris:"#526345",hair:2},
 {id:"luz",name:"Luz",body:3,width:1.17,jaw:.84,chin:.87,forehead:.87,eyeWidth:1.18,eyeHeight:1.02,eyeTilt:-.28,mouthWidth:1.18,lipMass:1.25,nose:4,skin:"#a77456",brow:"#47352d",iris:"#3e2f27",hair:3},
 {id:"mauro",name:"Mauro",body:4,width:.86,jaw:1.09,chin:1.17,forehead:1.13,eyeWidth:.82,eyeHeight:.63,eyeTilt:.12,mouthWidth:.79,lipMass:.68,nose:0,skin:"#d5ae89",brow:"#78634c",iris:"#607879",hair:1},
 {id:"ines",name:"Inés",body:5,width:1.04,jaw:.72,chin:1.03,forehead:.91,eyeWidth:1.07,eyeHeight:1.2,eyeTilt:-.1,mouthWidth:1.25,lipMass:1.4,nose:3,skin:"#83563e",brow:"#29231d",iris:"#34271f",hair:2}
];
export function actorRecipe(input={}){
 let r={schema:"prometeo.character-world.actor/v1",...IDENTITIES[0],outfit:0,noseAmount:0,browL:0,browR:0,lookX:0,lookY:0,blink:0,mouth:0,smile:0,...input};
 for(let k of ["body","outfit","nose","hair"])r[k]=Math.round(clamp(Number(r[k])||0,0,k==="body"?5:k==="hair"?3:4));
 for(let k of ["noseAmount","lookX","lookY","smile"])r[k]=clamp(Number(r[k])||0,-1,1);
 for(let k of ["browL","browR","blink","mouth"])r[k]=clamp(Number(r[k])||0);
 r.id=String(r.id).slice(0,40);r.name=String(r.name).slice(0,40);
 return r;
}
export function faceRecipe(r){r=actorRecipe(r);let n=NOSES[r.nose];return {...r,noseWidth:n.w,noseLength:clamp(n.l+.24*r.noseAmount,.75,1.25),noseDepth:n.d};}
export function canonicalUV(p){return [Math.abs(Math.atan2(p[0],p[2]-.035)/Math.PI),clamp(p[1])]}
export function baryAnchor(data,x,y){
 let best=null;
 for(let k=0;k<data.indices.length;k+=3){
  let ids=data.indices.slice(k,k+3),[a,b,c]=ids.map(i=>data.positions[i]),d=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);
  if(Math.abs(d)<1e-10)continue;
  let u=((b[1]-c[1])*(x-c[0])+(c[0]-b[0])*(y-c[1]))/d,v=((c[1]-a[1])*(x-c[0])+(a[0]-c[0])*(y-c[1]))/d,w=1-u-v;
  if(Math.min(u,v,w)<-1e-7)continue;
  let z=u*a[2]+v*b[2]+w*c[2];
  if(!best||z>best.z)best={ids,weights:[u,v,w],z};
 }
 if(!best)throw Error("No anatomical anchor for "+x+","+y);
 best.uv=[0,1].map(j=>best.ids.reduce((s,i,k)=>s+canonicalUV(data.positions[i])[j]*best.weights[k],0));
 return best;
}
export function anchorPosition(anchor,positions){return [0,1,2].map(j=>anchor.ids.reduce((s,i,k)=>s+positions[i][j]*anchor.weights[k],0))}
export const PIGMENTS=[
 ["socket",.139,.613,.085,.044,"#8d6655",.34],["lid",.139,.567,.065,.035,"#b18b78",.24],["cheek",.177,.468,.10,.070,"#b98d75",.27],
 ["nasal-wing",.066,.481,.038,.029,"#98735e",.22],["nostril",.026,.477,.021,.010,"#654939",.55],
 ["chin",0,.326,.08,.023,"#8c6651",.29],["philtrum",0,.395,.045,.023,"#a68a77",.16],
 ["nasal-floor",.035,.465,.017,.008,"#694335",.52],["lip-corner",.087,.365,.012,.012,"#805346",.28],["ear",.30,.53,.035,.037,"#946452",.35]
];
export function pigments(data){return PIGMENTS.map(([id,x,y,rx,ry,color,alpha])=>({id,rx,ry,color,alpha,...baryAnchor(data,x,y)}))}
export function validRecipe(r){return r&&r.schema==="prometeo.character-world.actor/v1"&&Number.isInteger(r.body)&&r.body>=0&&r.body<6&&Number.isInteger(r.nose)&&r.nose>=0&&r.nose<5}
export const DEFAULT_ACTION={schema:"prometeo.character-world.action/v1",actor:"iris",chair:[0,0,0],yaw:0,cup:[-.25,.84,.39],duration:19};
export function sampleAction(raw={},time=0,height=1.75){
 let r={...DEFAULT_ACTION,...raw},t=clamp(time,0,19),c=r.chair,yaw=r.yaw,forward=[Math.sin(yaw),0,Math.cos(yaw)],right=[Math.cos(yaw),0,-Math.sin(yaw)],local=(x,y,z)=>[c[0]+x*right[0]+z*forward[0],y,c[2]+x*right[2]+z*forward[2]];
 let start=local(0,0,-1.7),root=local(0,0,0),walk=ease(t/3.5);root=vMix(start,root,walk);
 let sit=ease((t-3.5)/1.5),shoulder=local(-.2,height*.69-.30*sit,0),mouth=local(-.035,height*.91-.30*sit,.15),origin=r.cup.slice(),reach=distance(shoulder,origin)<height*.36;
 let phase=t<3.5?"walk":t<5?"sit":t<6?"look":t<8?"reach":t<10?"lift":t<13?"drink":t<15?"return":t<16?"release":"idle";
 let lift=ease((t-8)/2),back=ease((t-13)/2),cup=reach?vMix(vMix(origin,mouth,lift),origin,back):origin;
 let held=reach&&t>=8&&t<15,aim=reach&&t>=6&&t<16,grip=held?1:reach&&t>=7.4&&t<8?ease((t-7.4)/.6):reach&&t>=15&&t<16?1-ease(t-15):0;
 return {time:t,root,yaw,sit,phase:reach?phase:t>=6?"out_of_reach":phase,cup,held,support:held?"hand":"table",owner:held?r.actor:null,aim,grip,look:origin,reach,walk: t<3.5?1:0,result:t>=16?(reach?"COMPLETED":"OUT_OF_REACH"):"RUNNING"};
}
export const CAFE={schema:"prometeo.character-world.scene/v1",id:"cafe-buenos-aires-pilot",duration:19,actors:[{identity:0,action:{...DEFAULT_ACTION,actor:"iris",chair:[.64,0,0],yaw:-Math.PI/2,cup:[.19,.84,-.25]}},{identity:2,action:{...DEFAULT_ACTION,actor:"nara",chair:[-.64,0,0],yaw:Math.PI/2,cup:[-.19,.84,.25]}}],dialogue:[{start:5,end:7,actor:0,text:"¿Tomamos un café?"},{start:10,end:12,actor:1,text:"Mi mamá toma mate, pero yo prefiero un cortado."},{start:16,end:19,actor:0,text:"Entonces brindemos por eso."}]};
export function sampleScene(recipe,t){return {time:clamp(t,0,recipe.duration),actors:recipe.actors.map(a=>sampleAction(a.action,t,IDENTITIES[a.identity]?.body===1?1.62:1.75)),dialogue:recipe.dialogue.find(d=>d.start<=t&&t<d.end)||null}}
export function gate(required,records,version){return required.every(id=>{const r=records.find(q=>q.id===id);return r&&r.version===version&&r.status==="PASS"&&typeof r.evidence==="string"&&r.evidence.trim().length>0})?"READY":"CANDIDATE"}
