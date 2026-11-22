// FORJA W7 · original authored glTF 2.0 binary, reusable fixture, no third-party media.
// The ribbons are triangulated parametric surfaces with their own normals.
// Scene -> Pivot -> each independent mesh. The pivot has a source glTF animation.
export function createFixtureGLB(){
  const binary=[], views=[], accessors=[];
  const append=(bytes,target)=>{
    let offset=binary.length;
    while(offset%4){binary.push(0);offset++}
    for(const b of bytes)binary.push(b);
    const id=views.length;views.push({buffer:0,byteOffset:offset,byteLength:bytes.length,...(target?{target}:{})});
    return id;
  };
  const floats=(arr,target)=>append(new Uint8Array(new Float32Array(arr).buffer),target);
  function attr(arr,type,components){
    const view=floats(arr,34962);
    const count=arr.length/components;
    const a={bufferView:view,componentType:5126,count,type};
    if(type==='VEC3'){
      a.min=[Infinity,Infinity,Infinity];a.max=[-Infinity,-Infinity,-Infinity];
      for(let i=0;i<arr.length;i+=3)for(let j=0;j<3;j++){
        a.min[j]=Math.min(a.min[j],arr[i+j]);a.max[j]=Math.max(a.max[j],arr[i+j]);
      }
    }
    accessors.push(a);return accessors.length-1;
  }
  function ribbon(phase,radius,lower,upper,width,waves){
    const positions=[],normals=[],N=60;
    const point=(t,side)=>{
      const angle=t*Math.PI*2*waves+phase;
      const r=radius+(side-.5)*width + .045*Math.sin(t*Math.PI*6+phase);
      return [r*Math.cos(angle),lower+(upper-lower)*t,r*Math.sin(angle)];
    };
    const tri=(a,b,c)=>{
      const u=a.map((x,i)=>b[i]-x),v=a.map((x,i)=>c[i]-x);
      let n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
      const m=Math.hypot(...n)||1;n=n.map(x=>x/m);
      for(const p of [a,b,c]){positions.push(...p);normals.push(...n)}
    };
    for(let i=0;i<N;i++){
      const t=i/N,tt=(i+1)/N;
      const a=point(t,0),b=point(t,1),c=point(tt,0),d=point(tt,1);
      tri(a,c,b);tri(b,c,d);
    }
    return {attributes:{POSITION:attr(positions,'VEC3',3),NORMAL:attr(normals,'VEC3',3)},mode:4};
  }
  const gold=ribbon(.2,.72,-.74,.74,.21,1.15);
  const pearl=ribbon(Math.PI,.58,-.66,.66,.16,-1.1);
  // Embedded glTF animation: animated nested pivot with explicit timestamps.
  const times=floats([0,4,8]);
  accessors.push({bufferView:times,componentType:5126,count:3,type:'SCALAR',min:[0],max:[8]});
  const timeAccessor=accessors.length-1;
  const rotations=floats([0,0,0,1,0,1,0,0,0,0,0,1]);
  accessors.push({bufferView:rotations,componentType:5126,count:3,type:'VEC4'});
  const quatAccessor=accessors.length-1;
  const gltf={
    asset:{version:'2.0',generator:'PROMETEO FORJA W7 · original kinetic study'},
    scene:0,scenes:[{nodes:[0]}],
    nodes:[
      {name:'01 | Raíz / GLB original',children:[1]},
      {name:'02 | Pivote de órbita',translation:[0,0,0],children:[2,3]},
      {name:'03 | Lámina / bronce',mesh:0},
      {name:'04 | Lámina / perla',mesh:1}
    ],
    meshes:[{name:'Lámina paramétrica de bronce',primitives:[{...gold,material:0}]},{name:'Lámina paramétrica de perla',primitives:[{...pearl,material:1}]}],
    materials:[
      {name:'Bronce satinado',doubleSided:true,pbrMetallicRoughness:{baseColorFactor:[.85,.57,.27,1],metallicFactor:.82,roughnessFactor:.28}},
      {name:'Marfil esmaltado',doubleSided:true,pbrMetallicRoughness:{baseColorFactor:[.72,.81,.78,1],metallicFactor:.5,roughnessFactor:.2}}
    ],
    animations:[{name:'Pulso GLB / pivote',samplers:[{input:timeAccessor,output:quatAccessor,interpolation:'LINEAR'}],channels:[{sampler:0,target:{node:1,path:'rotation'}}]}],
    accessors,bufferViews:views,buffers:[{byteLength:binary.length}]
  };
  const enc=new TextEncoder(),j=enc.encode(JSON.stringify(gltf));
  const jsonLen=Math.ceil(j.length/4)*4,binLen=Math.ceil(binary.length/4)*4;
  const total=12+8+jsonLen+8+binLen;
  const output=new Uint8Array(total);const dv=new DataView(output.buffer);
  dv.setUint32(0,0x46546c67,true);dv.setUint32(4,2,true);dv.setUint32(8,total,true);
  dv.setUint32(12,jsonLen,true);dv.setUint32(16,0x4e4f534a,true);
  output.fill(32,20,20+jsonLen);output.set(j,20);
  const at=20+jsonLen;dv.setUint32(at,binLen,true);dv.setUint32(at+4,0x004e4942,true);
  output.set(binary,at+8);
  return output.buffer;
}
export function describeFixtureGLB(buffer){
  const view=new DataView(buffer);
  if(view.getUint32(0,true)!==0x46546c67||view.getUint32(4,true)!==2||view.getUint32(8,true)!==buffer.byteLength)throw Error('Invalid GLB header');
  const jsonLength=view.getUint32(12,true);
  if(view.getUint32(16,true)!==0x4e4f534a)throw Error('Invalid JSON chunk');
  const meta=JSON.parse(new TextDecoder().decode(new Uint8Array(buffer,20,jsonLength)));
  if(meta.nodes?.length!==4||meta.animations?.[0]?.channels?.[0]?.target?.node!==1||meta.meshes?.length!==2)throw Error('Fixture source hierarchy changed');
  return {bytes:buffer.byteLength,nodes:meta.nodes.length,meshes:meta.meshes.length,animations:meta.animations.length,source:meta.asset.generator,sourceTimeAccessors:meta.animations[0].samplers[0].input};
}
