// Rebuild using Node 22: node generate.mjs (network required for pinned CC0 source).
import fs from 'node:fs/promises';
const sourceRef="e56c521f6e2d27908ec33b7175ea04215fe3a03c";
const sourceDir="assets/characters/quaternius/universal-base/";
const profiles=[
  {
    "id": "01-explorador",
    "base": "Male",
    "height": 1.84,
    "width": 0.98,
    "depth": 0.94,
    "torso": 0.03,
    "belly": -0.035,
    "face": 0.02,
    "jaw": 0.035,
    "nose": 0.035,
    "hair": 0.021,
    "cut": 0.04,
    "fringe": 0.12,
    "skin": [
      0.62,
      0.36,
      0.23
    ],
    "hairColor": [
      0.075,
      0.047,
      0.026
    ],
    "shirt": [
      0.16,
      0.24,
      0.19
    ],
    "pants": [
      0.2,
      0.22,
      0.19
    ],
    "shoe": [
      0.055,
      0.049,
      0.043
    ],
    "sleeve": 0.47,
    "neck": 0.815,
    "stride": 0.43,
    "tempo": 1.12
  },
  {
    "id": "02-detective",
    "base": "Male",
    "height": 1.79,
    "width": 0.83,
    "depth": 0.84,
    "torso": -0.025,
    "belly": -0.04,
    "face": -0.075,
    "jaw": -0.06,
    "nose": 0.09,
    "hair": 0.012,
    "cut": 0.1,
    "fringe": -0.13,
    "skin": [
      0.7,
      0.48,
      0.36
    ],
    "hairColor": [
      0.2,
      0.19,
      0.18
    ],
    "shirt": [
      0.26,
      0.29,
      0.33
    ],
    "pants": [
      0.105,
      0.12,
      0.15
    ],
    "shoe": [
      0.038,
      0.035,
      0.032
    ],
    "sleeve": 0.8,
    "neck": 0.823,
    "stride": 0.3,
    "tempo": 0.91
  },
  {
    "id": "03-mecanico",
    "base": "Male",
    "height": 1.73,
    "width": 1.12,
    "depth": 1.15,
    "torso": 0.05,
    "belly": 0.1,
    "face": 0.075,
    "jaw": 0.09,
    "nose": -0.04,
    "hair": 0.008,
    "cut": 0.12,
    "fringe": 0.03,
    "skin": [
      0.54,
      0.31,
      0.19
    ],
    "hairColor": [
      0.045,
      0.034,
      0.025
    ],
    "shirt": [
      0.16,
      0.23,
      0.31
    ],
    "pants": [
      0.12,
      0.17,
      0.22
    ],
    "shoe": [
      0.065,
      0.052,
      0.035
    ],
    "sleeve": 0.57,
    "neck": 0.814,
    "stride": 0.33,
    "tempo": 0.96
  },
  {
    "id": "04-artista",
    "base": "Female",
    "height": 1.56,
    "width": 0.96,
    "depth": 0.91,
    "torso": -0.02,
    "belly": -0.005,
    "face": 0.09,
    "jaw": -0.09,
    "nose": -0.09,
    "hair": 0.036,
    "cut": -0.035,
    "fringe": 0.34,
    "skin": [
      0.65,
      0.39,
      0.3
    ],
    "hairColor": [
      0.19,
      0.077,
      0.036
    ],
    "shirt": [
      0.4,
      0.23,
      0.2
    ],
    "pants": [
      0.24,
      0.25,
      0.32
    ],
    "shoe": [
      0.12,
      0.09,
      0.075
    ],
    "sleeve": 0.43,
    "neck": 0.82,
    "stride": 0.39,
    "tempo": 1.15
  },
  {
    "id": "05-cientifica",
    "base": "Female",
    "height": 1.7,
    "width": 0.93,
    "depth": 0.97,
    "torso": 0.015,
    "belly": 0.015,
    "face": -0.025,
    "jaw": 0.018,
    "nose": 0.025,
    "hair": 0.019,
    "cut": 0.055,
    "fringe": -0.28,
    "skin": [
      0.49,
      0.31,
      0.23
    ],
    "hairColor": [
      0.055,
      0.036,
      0.024
    ],
    "shirt": [
      0.5,
      0.54,
      0.53
    ],
    "pants": [
      0.18,
      0.25,
      0.28
    ],
    "shoe": [
      0.05,
      0.065,
      0.065
    ],
    "sleeve": 0.85,
    "neck": 0.82,
    "stride": 0.35,
    "tempo": 1
  }
];
function build(source,sourceBytes,eyePNG,p){
 const g=JSON.parse(JSON.stringify(source)),data=new DataView(sourceBytes.buffer,sourceBytes.byteOffset,sourceBytes.byteLength),chunks=[],views=[],acc=[];
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),smooth=(a,b,x)=>{let t=clamp((x-a)/(b-a));return t*t*(3-2*t)},gauss=(x,m,w)=>Math.exp(-Math.pow((x-m)/w,2)),add=(a,b)=>a.map((x,i)=>x+b[i]),sub=(a,b)=>a.map((x,i)=>x-b[i]),mul=(a,s)=>a.map(x=>x*s),norm=a=>mul(a,1/(Math.hypot(...a)||1));
 const qm=(a,b)=>[a[3]*b[0]+a[0]*b[3]+a[1]*b[2]-a[2]*b[1],a[3]*b[1]-a[0]*b[2]+a[1]*b[3]+a[2]*b[0],a[3]*b[2]+a[0]*b[1]-a[1]*b[0]+a[2]*b[3],a[3]*b[3]-a[0]*b[0]-a[1]*b[1]-a[2]*b[2]],qi=q=>[-q[0],-q[1],-q[2],q[3]],qr=(q,v)=>qm(qm(q,[...v,0]),qi(q)).slice(0,3),axisq=(a,t)=>[...mul(norm(a),Math.sin(t/2)),Math.cos(t/2)];
 const ct={5121:[1,"getUint8",Uint8Array],5123:[2,"getUint16",Uint16Array],5125:[4,"getUint32",Uint32Array],5126:[4,"getFloat32",Float32Array]},dim={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16};
 function read(i){const a=source.accessors[i],v=source.bufferViews[a.bufferView],[n,get,T]=ct[a.componentType],d=dim[a.type],out=new T(a.count*d);for(let k=0;k<a.count;k++)for(let c=0;c<d;c++)out[k*d+c]=data[get]((v.byteOffset||0)+(a.byteOffset||0)+k*(v.byteStride||n*d)+c*n,true);return out}
 let bytes=0;function raw(a,target){const u=a instanceof Uint8Array?a:new Uint8Array(a.buffer,a.byteOffset,a.byteLength),pad=(4-bytes%4)%4;if(pad){chunks.push(new Uint8Array(pad));bytes+=pad}const v={buffer:0,byteOffset:bytes,byteLength:u.length};if(target)v.target=target;views.push(v);chunks.push(u);bytes+=u.length;return views.length-1}
 function bounds(a,d){let lo=Array(d).fill(Infinity),hi=Array(d).fill(-Infinity);for(let i=0;i<a.length;i++){let k=i%d;lo[k]=Math.min(lo[k],a[i]);hi[k]=Math.max(hi[k],a[i])}return {min:lo,max:hi}}
 function put(a,type,componentType=5126,target,withBounds=false,normalized=false){const T=ct[componentType][2];if(!(a instanceof T))a=new T(a);const x={bufferView:raw(a,target),componentType,count:a.length/dim[type],type};if(withBounds)Object.assign(x,bounds(a,dim[type]));if(normalized)x.normalized=true;acc.push(x);return acc.length-1}
 const sourceBody=source.meshes[2].primitives[0],src=read(sourceBody.attributes.POSITION),bb=bounds(src,3),H=bb.max[1]-bb.min[1], y0=bb.min[1], headY=bb.max[1]-.095, sy=p.height/H;
 const scale=[sy*p.width,sy,sy*p.depth],translation=[0,-y0*sy,0];
 const eyeCenter=(p.base==="Male"?1.698:1.657);
 function morph(x,y,z){const h=(y-y0)/H,face=smooth(.855,.91,h),front=smooth(.015,.10,z),jaw=gauss(h,.894,.027),nose=gauss(h,.93,.019)*gauss(x,0,.024)*front;const torso=gauss(h,.72,.08)*(1-smooth(.19,.32,Math.abs(x))),belly=gauss(h,.59,.075)*(1-smooth(.12,.24,Math.abs(x)));
 return [x*(1+p.face*face+p.jaw*jaw+p.torso*torso+p.belly*.55*belly),y+(p.face*.012)*gauss(h,.93,.05),z*(1+p.torso*torso+p.belly*belly)+p.nose*.09*nose]}
 function hairMask(x,y,z){const h=(y-y0)/H,front=smooth(-.03,.08,z),lateral=smooth(.015,.075,Math.abs(x));const line=.905+front*(.050+p.cut*.035)-lateral*.011+p.fringe*.011*Math.sin(x*40+0.6);return smooth(line-.006,line+.012,h)}
 function colorAt(x,y,z){const h=(y-y0)/H,ax=Math.abs(x),skin=p.skin;let c;
 const arm=smooth(.19,.34,ax)*smooth(.53,.63,h)*(1-smooth(.84,.88,h)),sleeveLimit=.30+.43*p.sleeve;
 const collar=p.neck+.035*smooth(0,.10,ax)-.028*smooth(.02,.09,z)*(1-smooth(.02,.12,ax));
 if(h>collar||arm>.25&&ax>sleeveLimit)c=skin;
 else if(h<.061)c=p.shoe;
 else if(h<.535)c=p.pants;
 else c=p.shirt;
 if(h>.51&&h<.535&&ax<.23)c=mul(p.pants,.72);
 if(c===p.shirt){const seam=gauss(ax,.012,.004)*(p.id.includes("detective")||p.id.includes("cientifica")?1:0.25);const edge=gauss(h,.55,.003);c=mul(c,1-.15*seam-.08*edge)}
 if(c===skin&&h>.86){const cheek=gauss(h,.918,.025)*gauss(ax,.046,.025)*smooth(.03,.08,z);c=[skin[0]*(1+.04*cheek),skin[1]*(1-.07*cheek),skin[2]*(1-.05*cheek)]}
 const grain=.985+.015*Math.sin(x*155+y*111+z*83);let hm=hairMask(x,y,z);if(h>.9&&hm>0.4)c=c.map((v,k)=>v*(1-hm)+p.hairColor[k]*hm);
 return c.map(v=>clamp(v*grain))
 }
 const parent=Array(g.nodes.length).fill(-1);g.nodes.forEach((n,i)=>(n.children||[]).forEach(j=>parent[j]=i));const wq=[],wp=[];
 function world(i){if(wq[i])return;const n=g.nodes[i],a=parent[i],q=norm(n.rotation||[0,0,0,1]),t=n.translation||[0,0,0];if(a<0){wq[i]=q;wp[i]=t}else{world(a);wq[i]=norm(qm(wq[a],q));wp[i]=add(wp[a],qr(wq[a],t))}}
 g.nodes.forEach((_,i)=>world(i));
 const map={Head:"head",neck_01:"neck",spine_01:"spine",spine_02:"spine_mid",spine_03:"chest",clavicle_l:"clavicle_L",clavicle_r:"clavicle_R",upperarm_l:"upperArm_L",upperarm_r:"upperArm_R",lowerarm_l:"lowerArm_L",lowerarm_r:"lowerArm_R",hand_l:"hand_L",hand_r:"hand_R",thigh_l:"upperLeg_L",thigh_r:"upperLeg_R",calf_l:"lowerLeg_L",calf_r:"lowerLeg_R",foot_l:"foot_L",foot_r:"foot_R",ball_l:"toes_L",ball_r:"toes_R"};
 const oldNames=g.nodes.map(n=>n.name);g.nodes.forEach(n=>{n.name=map[n.name]||n.name?.replace(/_([lr])$/,(_,s)=>"_"+s.toUpperCase())});
 const ids=Object.fromEntries(g.nodes.map((n,i)=>[n.name,i]));
 const metrics={triangles:0,vertices:0,joints:g.skins[0].joints.length,maxWeightError:0,invalidJoints:0,degenerateTriangles:0,nonFinitePositions:0};
 function skinData(prim){let j=read(prim.attributes.JOINTS_0),w=read(prim.attributes.WEIGHTS_0);for(let i=0;i<w.length;i+=4){let s=w[i]+w[i+1]+w[i+2]+w[i+3];if(s<=0){w[i]=1;j[i]=0;s=1}for(let k=0;k<4;k++){w[i+k]/=s;if(j[i+k]>=g.skins[0].joints.length)metrics.invalidJoints++}metrics.maxWeightError=Math.max(metrics.maxWeightError,Math.abs(1-w[i]-w[i+1]-w[i+2]-w[i+3]))}return [j,w]}
 function recompute(pos,ix,original){const ns=new Float32Array(pos.length);for(let i=0;i<ix.length;i+=3){let a=ix[i]*3,b=ix[i+1]*3,c=ix[i+2]*3;let u=[pos[b]-pos[a],pos[b+1]-pos[a+1],pos[b+2]-pos[a+2]],v=[pos[c]-pos[a],pos[c+1]-pos[a+1],pos[c+2]-pos[a+2]],n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];if(Math.hypot(...n)<1e-10)metrics.degenerateTriangles++;for(let k of [a,b,c])for(let d=0;d<3;d++)ns[k+d]+=n[d]}
 for(let i=0;i<ns.length;i+=3){let n=norm([...ns.subarray(i,i+3)]);let o=[...original.subarray(i,i+3)];if(Math.hypot(...n)<.1)n=o; // Blend authored normals to retain smooth UV seam continuity.
 n=norm(n.map((v,k)=>.28*v+.72*o[k]));ns.set(n,i)}return ns}
 let body,bodyJ,bodyW,bodyIx,bodyN;
 for(let mi=0;mi<3;mi++){
 const prim=source.meshes[mi].primitives[0],orig=read(prim.attributes.POSITION),origN=read(prim.attributes.NORMAL),pos=new Float32Array(orig.length),ix=read(prim.indices),[j,w]=skinData(prim),cols=new Float32Array(orig.length);
 const blink=new Float32Array(orig.length);
 for(let i=0;i<orig.length;i+=3){const [x,y,z]=orig.subarray(i,i+3),v=morph(x,y,z);pos.set(v,i);if(v.some(x=>!Number.isFinite(x)))metrics.nonFinitePositions++;cols.set(mi===0?p.hairColor:colorAt(x,y,z),i);
 if(mi===1)blink[i+1]=(eyeCenter-y)*.92;else if(mi===2){const region=gauss(Math.abs(x),.033,.027)*gauss(y,eyeCenter,.021)*smooth(.025,.07,z);blink[i+1]=(eyeCenter-y)*region*.80}}
 const ns=recompute(pos,ix,origN), attrs={POSITION:put(pos,"VEC3",5126,34962,true),NORMAL:put(ns,"VEC3",5126,34962),JOINTS_0:put(j,"VEC4",5121,34962),WEIGHTS_0:put(w,"VEC4",5126,34962)};
 if(mi===1)attrs.TEXCOORD_0=put(read(prim.attributes.TEXCOORD_0),"VEC2",5126,34962);else attrs.COLOR_0=put(cols,"VEC3",5126,34962);
 const q={attributes:attrs,indices:put(ix,"SCALAR",5123,34963),material:mi};
 if(mi>0){q.targets=[{POSITION:put(blink,"VEC3",5126,34962,true)}];g.meshes[mi].weights=[0];g.meshes[mi].extras={targetNames:["blink_candidate"]}}
 g.meshes[mi].primitives=[q];metrics.triangles+=ix.length/3;metrics.vertices+=pos.length/3;
 if(mi===2){body=pos;bodyJ=j;bodyW=w;bodyIx=ix;bodyN=ns}
 }
 // Scalp-derived hair: no anatomical primitives. Same skin weights, actual body topology, independent silhouette.
 const hairP=[],hairN=[],hairJ=[],hairW=[],hairC=[],hairI=[],lookup=new Map();
 function hairVertex(i){if(lookup.has(i))return lookup.get(i);const q=i*3,[x,y,z]=src.subarray(q,q+3),hm=hairMask(x,y,z),n=norm([x,(y-headY)*1.05,z+.018]),ridge=.74+.26*Math.sin(x*42+z*27+p.fringe*6),offset=.003+p.hair*ridge*smooth(.2,.96,hm),v=add([...body.subarray(q,q+3)],mul(n,offset));v[0]+=p.fringe*.025*hm*gauss((y-y0)/H,.976,.03);let k=hairP.length/3;lookup.set(i,k);hairP.push(...v);hairN.push(...bodyN.subarray(q,q+3));hairJ.push(...bodyJ.subarray(i*4,i*4+4));hairW.push(...bodyW.subarray(i*4,i*4+4));hairC.push(...mul(p.hairColor,1.04+.12*ridge));return k}
 for(let k=0;k<bodyIx.length;k+=3){let a=[bodyIx[k],bodyIx[k+1],bodyIx[k+2]],h=a.map(i=>hairMask(...src.subarray(i*3,i*3+3)));if(Math.min(...h)>.12&&h.reduce((s,x)=>s+x,0)/3>.53)hairI.push(...a.map(hairVertex))}
 if(hairI.length){const a={POSITION:put(hairP,"VEC3",5126,34962,true),NORMAL:put(hairN,"VEC3",5126,34962),COLOR_0:put(hairC,"VEC3",5126,34962),JOINTS_0:put(hairJ,"VEC4",5121,34962),WEIGHTS_0:put(hairW,"VEC4",5126,34962)};g.meshes.push({name:"ScalpHair",primitives:[{attributes:a,indices:put(hairI,"SCALAR",5123,34963),material:3}]});let i=g.nodes.length;g.nodes.push({name:"ScalpHair",mesh:3,skin:0});g.nodes[68].children.push(i);metrics.triangles+=hairI.length/3;metrics.vertices+=hairP.length/3}
 g.skins[0].inverseBindMatrices=put(read(source.skins[0].inverseBindMatrices),"MAT4");g.skins[0].name="CHARACTER_V1_candidate";
 // Material atlas substitute: body painted in vertex colors; single embedded author eye texture.
 g.materials=[{name:"Brows",pbrMetallicRoughness:{baseColorFactor:[1,1,1,1],metallicFactor:0,roughnessFactor:.82},doubleSided:true},{name:"Eyes",pbrMetallicRoughness:{baseColorTexture:{index:0},metallicFactor:0,roughnessFactor:.37},doubleSided:true},{name:"Body_NeutralWardrobe",pbrMetallicRoughness:{baseColorFactor:[1,1,1,1],metallicFactor:0,roughnessFactor:.82},doubleSided:true},{name:"Hair",pbrMetallicRoughness:{baseColorFactor:[1,1,1,1],metallicFactor:0,roughnessFactor:.75},doubleSided:true}];
 g.images=[{name:"QuaterniusEyeBrown",mimeType:"image/png",bufferView:raw(eyePNG)}];g.textures=[{source:0,sampler:0}];g.samplers=[{magFilter:9729,minFilter:9987,wrapS:33071,wrapT:33071}];
 const originalRoot=68;g.nodes[originalRoot].scale=scale;g.nodes[originalRoot].translation=translation;g.nodes[originalRoot].name="character_profile";g.scenes=[{nodes:[originalRoot],name:p.id}];g.scene=0;
 const anchors={};const surface=(y,side)=>{let values=[];for(let i=0;i<body.length;i+=3){let x=body[i],yy=body[i+1],z=body[i+2];if(Math.abs(yy-y)<.026&&Math.abs(x)<.105)values.push(z)}return values.length?(side>0?Math.max(...values):Math.min(...values)):0};
 function socket(name,bone,point,dimensions,clearance,type){const b=ids[bone],pos=point||wp[b],local=qr(qi(wq[b]),sub(pos,wp[b])),rot=qi(wq[b]),idx=g.nodes.length;g.nodes.push({name,translation:local,rotation:rot,extras:{kind:type,clearanceM:clearance,dimensionsM:dimensions}});(g.nodes[b].children||=[]).push(idx);anchors[name]={bone,localTranslation:local,localRotation:rot,bodyPositionM:pos.map((v,k)=>v*scale[k]+translation[k]),dimensionsM:dimensions,clearanceM:clearance,kind:type}}
 const chestY=y0+H*.73,waistY=y0+H*.55,neckY=y0+H*.84, headW=(p.base==="Male"?.17:.16)*scale[0],shoulderW=(p.base==="Male"?.44:.37)*scale[0];
 socket("head_top","head",[0,bb.max[1]+p.hair*.8,-.02],[headW,.03,.15*scale[2]],.012,"rigid");
 socket("face","head",[0,eyeCenter,surface(eyeCenter,1)],[headW,.11*sy,.02],.008,"rigid");
 socket("neck_socket","neck",[0,neckY,surface(neckY,1)],[.13*scale[0],.055*sy,.12*scale[2]],.012,"rigid_or_layered");
 socket("chest_socket","chest",[0,chestY,surface(chestY,1)],[shoulderW,.24*sy,.15*scale[2]],.018,"deformable");
 socket("back","chest",[0,chestY,surface(chestY,-1)],[shoulderW,.26*sy,.14*scale[2]],.025,"rigid");
 socket("waist","pelvis",[0,waistY,surface(waistY,1)],[.30*scale[0],.075*sy,.22*scale[2]],.015,"layered");
 for(const s of ["L","R"]){socket("hand_socket_"+s,"hand_"+s,null,[.085*scale[0],.15*sy,.04*scale[2]],.008,"rigid");socket("wrist_"+s,"hand_"+s,null,[.065*scale[0],.04*sy,.065*scale[2]],.007,"rigid");socket("foot_socket_"+s,"foot_"+s,null,[.095*scale[0],.1*sy,.25*scale[2]],.012,"rigid_or_layered")}
 // Canonical anchor aliases disambiguate socket from same-named bone; no name-only compatibility claims.
 const semanticAnchors={head_top:"head_top",face:"face",neck:"neck_socket",chest:"chest_socket",back:"back",waist:"waist",hand_L:"hand_socket_L",hand_R:"hand_socket_R",wrist_L:"wrist_L",wrist_R:"wrist_R",foot_L:"foot_socket_L",foot_R:"foot_socket_R"};
 // Author separate clips. Local axes derived from source world rest orientation, not guessed bone Euler axes.
 const anims=[],rest=g.nodes.map(n=>n.rotation||[0,0,0,1]);
 function delta(i,axis,angle){return axisq(qr(qi(wq[i]),axis),angle)}
 function clip(name,duration,pose,blinkOn=true){const count=Math.round(duration*24)+1,times=Float32Array.from({length:count},(_,i)=>duration*i/(count-1)),input=put(times,"SCALAR",5126,undefined,true),samplers=[],channels=[];
 function track(node,path,values,type){let out=put(values,type);let i=samplers.length;samplers.push({input,output:out,interpolation:"LINEAR"});channels.push({sampler:i,target:{node,path}})}
 const names=["head","neck","spine","chest","upperArm_L","upperArm_R","lowerArm_L","lowerArm_R","hand_L","hand_R","upperLeg_L","upperLeg_R","lowerLeg_L","lowerLeg_R","foot_L","foot_R","toes_L","toes_R",...Object.keys(ids).filter(n=>/^(index|middle|ring|pinky|thumb)_0[123]_[LR]$/.test(n))];
 const poses=Array.from(times,t=>pose(t,duration));
 for(const n of names){const i=ids[n];if(i===undefined)continue;let values=[];for(const f of poses){let q=rest[i];for(const [axis,a] of f[n]||[])q=qm(q,delta(i,axis,a));q=norm(q);if(values.length&&q.reduce((s,v,k)=>s+v*values[values.length-4+k],0)<0)q=q.map(x=>-x);values.push(...q)}track(i,"rotation",values,"VEC4")}
 track(originalRoot,"translation",poses.flatMap(f=>[0,translation[1]+(f.bob||0),0]),"VEC3");
 track(originalRoot,"rotation",poses.flatMap(f=>axisq([0,1,0],f.turn||0)),"VEC4");
 if(blinkOn){const blink=Array.from(times,t=>Math.max(0,1-Math.abs(t-duration*.57)/.12));for(let node of [66,67])track(node,"weights",blink,"SCALAR")}
 anims.push({name,channels,samplers})
 }
 const X=[1,0,0],Y=[0,1,0],Z=[0,0,1];
 function neutral(t,d){let f={},phase=2*Math.PI*t/d,breath=Math.sin(phase);for(const [s,sign] of [["L",1],["R",-1]]){const i=ids["upperArm_"+s],v=qr(wq[i],[0,1,0]),current=Math.atan2(v[1],Math.abs(v[0])),lower=-1.35-current;f["upperArm_"+s]=[[Z,sign*lower],[X,.025*breath]];f["lowerArm_"+s]=[[Z,sign*.10]];f["hand_"+s]=[[Z,sign*.025*breath]];for(let digit of ["index","middle","ring","pinky"])for(let j=1;j<=3;j++){let n=`${digit}_0${j}_${s}`;if(ids[n]!==undefined)f[n]=[[Z,sign*.025*j]]}}f.chest=[[X,.012*breath]];f.head=[[Y,.035*Math.sin(phase)]];return f}
 clip("idle",4,(t,d)=>neutral(t,d));
 clip("walk",1.2/p.tempo,(t,d)=>{let f=neutral(t,d),a=2*Math.PI*t/d;for(const [s,phase] of [["L",a],["R",a+Math.PI]]){let k=Math.sin(phase);f["upperLeg_"+s]=[[X,p.stride*k]];f["lowerLeg_"+s]=[[X,.55*Math.max(0,Math.sin(phase-.35))]];f["foot_"+s]=[[X,-.18*Math.max(0,k)]];f["toes_"+s]=[[X,.10*Math.max(0,-k)]];f["upperArm_"+s].push([X,-p.stride*.60*k])}f.bob=.014*(1-Math.cos(a*2));f.chest.push([Y,.035*Math.sin(a)]);return f},false);
 clip("turn",3,(t,d)=>{let f=neutral(t,d),u=t/d,s=smooth(0,1,u);f.turn=2*Math.PI*s;let k=Math.sin(6*Math.PI*u)*Math.sin(Math.PI*u);f.upperLeg_L=[[X,.12*k]];f.upperLeg_R=[[X,-.12*k]];f.bob=.011*Math.abs(k);return f},false);
 clip("wave",4,(t,d)=>{let f=neutral(t,d),a=smooth(.0,.25,t/d)*(1-smooth(.75,1,t/d));const i=ids.upperArm_L,v=qr(wq[i],[0,1,0]),current=Math.atan2(v[1],Math.abs(v[0]));f.upperArm_L=[[Z,(-1.35-current)*(1-a)+(.33-current)*a],[X,-.17*a]];f.lowerArm_L=[[Z,.10+.72*a]];f.hand_L=[[Z,.22*Math.sin(t*9)*a]];f.head=[[Y,.12*a],[Z,-.045*a]];return f});
 g.animations=anims;
 g.asset={version:"2.0",generator:"PROMETEO Character V1 / Quaternius CC0 derivative",extras:{source:"Quaternius Universal Base Characters",profile:p.id}};
 g.accessors=acc;g.bufferViews=views;g.buffers=[{byteLength:bytes}];delete g.extensionsUsed;delete g.extensionsRequired;
 const bpad=(4-bytes%4)%4;let bin=new Uint8Array(bytes+bpad),off=0;for(const c of chunks){bin.set(c,off);off+=c.length}
 const js=JSON.stringify(g),jbytes=Uint8Array.from(js,c=>c.charCodeAt(0)),jp=(4-jbytes.length%4)%4,glb=new Uint8Array(12+8+jbytes.length+jp+8+bin.length),dv=new DataView(glb.buffer);dv.setUint32(0,0x46546c67,true);dv.setUint32(4,2,true);dv.setUint32(8,glb.length,true);dv.setUint32(12,jbytes.length+jp,true);dv.setUint32(16,0x4e4f534a,true);glb.fill(32,20,20+jbytes.length+jp);glb.set(jbytes,20);let bo=20+jbytes.length+jp;dv.setUint32(bo,bin.length,true);dv.setUint32(bo+4,0x004e4942,true);glb.set(bin,bo+8);
 const restPose=Object.fromEntries(g.skins[0].joints.map(i=>[g.nodes[i].name,{sourceName:oldNames[i],parent:parent[i]>=0?g.nodes[parent[i]].name:null,translation:g.nodes[i].translation||[0,0,0],rotation:g.nodes[i].rotation||[0,0,0,1],scale:g.nodes[i].scale||[1,1,1],restWorldPositionM:wp[i].map((v,k)=>v*scale[k]+translation[k])}]));
 const measure=(h)=>{let ar=[];for(let i=0;i<body.length;i+=3){if(Math.abs((body[i+1]-y0)/H-h)<.025&&Math.abs(body[i])<.29)ar.push([body[i]*scale[0],body[i+2]*scale[2]])}return ar.length?{widthM:Math.max(...ar.map(v=>v[0]))-Math.min(...ar.map(v=>v[0])),depthM:Math.max(...ar.map(v=>v[1]))-Math.min(...ar.map(v=>v[1]))}:null};
 const skinMat=acc[g.skins[0].inverseBindMatrices];const badAccessors=acc.filter(a=>a.bufferView<0||a.bufferView>=views.length||views[a.bufferView].byteOffset+views[a.bufferView].byteLength>bytes).length;
 const receipt={id:p.id,sourceBase:p.base,bytes:glb.length,metrics:{...metrics,hairTriangles:hairI.length/3,drawCallsExpected:g.meshes.length,bodyHeightM:p.height,actualBodyBoundsM:bounds(body.map((v,i)=>v*scale[i%3]+translation[i%3]),3),badAccessors,bindMatrices:skinMat.count,clipCount:anims.length},tests:{glbHeader:dv.getUint32(0,true)===0x46546c67&&dv.getUint32(8,true)===glb.length,weights:metrics.maxWeightError<1e-5&&metrics.invalidJoints===0,finite:metrics.nonFinitePositions===0,accessorBounds:badAccessors===0,semanticBones:["root","pelvis","spine","chest","neck","head","clavicle_L","clavicle_R","upperArm_L","upperArm_R","lowerArm_L","lowerArm_R","hand_L","hand_R","upperLeg_L","upperLeg_R","lowerLeg_L","lowerLeg_R","foot_L","foot_R","toes_L","toes_R"].every(n=>ids[n]!==undefined),visual:"NOT_RUN",Android:"NOT_RUN",retarget:"NOT_RUN",clothingCollision:"NOT_RUN"}};
 return {glb,receipt,manifest:{id:p.id,profile:p,coordinateSystem:{units:"m",up:"+Y",front:"+Z",origin:"source body floor corrected; centered between feet",restPose:"source authored pose retained; A-pose equivalence NOT_TESTED"},rootScale:scale,rootTranslation:translation,restPose,anchors,semanticAnchors,measurements:{heightM:p.height,chest:measure(.73),waist:measure(.55),hips:measure(.49)},layers:{body:"continuous source mesh, neutral wardrobe painted into vertex colors, no separate garment",hair:"scalp-derived skinned shell",eyes:"embedded CC0 texture; provisional blink morph",rigid:"attach at named socket; verify fit per body",exclusions:["head_top hair vs hats","waist belt vs long outer garment","hand occupied vs held prop"],hiddenZones:["torso","upperLeg_L","upperLeg_R","foot_L","foot_R"],fitStatus:"CANDIDATE_ONLY"},clips:anims.map(a=>a.name),license:"CC0 source; derivative source recorded"}}
}
const root='https://raw.githubusercontent.com/olccamy/CanvasPro/'+sourceRef+'/'+sourceDir;
async function get(path){const r=await fetch(root+path);if(!r.ok)throw Error(path+' '+r.status);return r;}
const eye=new Uint8Array(await (await get('T_Eye_Brown.png')).arrayBuffer());
for(const sex of ['Male','Female']){const j=await (await get('Superhero_'+sex+'_FullBody.gltf')).json(), b=new Uint8Array(await (await get('Superhero_'+sex+'_FullBody.bin')).arrayBuffer());for(const p of profiles.filter(x=>x.base===sex)){const r=build(j,b,eye,p);await fs.mkdir(p.id,{recursive:true});await fs.writeFile(p.id+'/character.glb',r.glb);await fs.writeFile(p.id+'/PROFILE.json',JSON.stringify(r.manifest,null,2));console.log(r.receipt);}}
