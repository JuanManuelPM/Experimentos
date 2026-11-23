import {generateChair,validateChair,serializeOBJ} from "./geometry.mjs";
export const VARIANTS=[
 {id:"walnut",title:"Nogal y cuero",wood:0x735036,seat:0xa46f51,metal:0xb19b75,rough:.42},
 {id:"oak",title:"Roble y lino",wood:0xc09a6c,seat:0xb6aca0,metal:0x878178,rough:.55},
 {id:"ebony",title:"Ébano y grafito",wood:0x31302e,seat:0x605d56,metal:0xc2a17b,rough:.36}
];
function createGrain(){
 const canvas=document.createElement("canvas");canvas.width=256;canvas.height=512;
 const ctx=canvas.getContext("2d");ctx.fillStyle="#dad3cc";ctx.fillRect(0,0,256,512);
 let seed=817331;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<330;i++){const x=rnd()*256,y=rnd()*512;
  ctx.strokeStyle="rgba(60,35,22,"+(.015+rnd()*.19)+")";ctx.lineWidth=.2+rnd()*.9;
  ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x+8+rnd()*8,y+80,x-8+rnd()*8,y+200,x+(rnd()-.5)*22,y+250);ctx.stroke();
 }
 return canvas;
}
export function createChair(THREE,params={}){
 const asset=generateChair(params),qa=validateChair(asset);
 if(!qa.pass)throw Error("Chair geometry failed validation: "+qa.errors.join(","));
 const root=new THREE.Group();root.name=asset.assetId;
 const tex=new THREE.CanvasTexture(createGrain());tex.colorSpace=THREE.SRGBColorSpace;
 tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(.7,1.7);
 const wood=new THREE.MeshPhysicalMaterial({color:VARIANTS[0].wood,roughness:.42,metalness:0,clearcoat:.16,clearcoatRoughness:.42,map:tex,side:THREE.DoubleSide});
 const leather=new THREE.MeshPhysicalMaterial({color:VARIANTS[0].seat,roughness:.78,metalness:0,side:THREE.DoubleSide});
 const brass=new THREE.MeshStandardMaterial({color:VARIANTS[0].metal,metalness:.78,roughness:.30,side:THREE.DoubleSide});
 const materials={wood,leather,brass};
 for(const part of asset.parts){
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute("position",new THREE.Float32BufferAttribute(part.positions,3));
  geometry.setAttribute("uv",new THREE.Float32BufferAttribute(part.uvs,2));
  geometry.setIndex(part.indices);geometry.computeVertexNormals();
  const obj=new THREE.Mesh(geometry,materials[part.material]);
  obj.name=part.name;obj.castShadow=true;obj.receiveShadow=true;root.add(obj);
 }
 function variant(i){const v=VARIANTS[((i%VARIANTS.length)+VARIANTS.length)%VARIANTS.length];
  wood.color.setHex(v.wood);wood.roughness=v.rough;
  leather.color.setHex(v.seat);brass.color.setHex(v.metal);
  return v.title;
 }
 function downloadOBJ(){
  const blob=new Blob([serializeOBJ(asset)],{type:"text/plain;charset=utf-8"});
  const url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download="arc-chair-01.obj";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 function dispose(){for(const mesh of root.children)mesh.geometry.dispose();
  for(const value of Object.values(materials))value.dispose();tex.dispose();
 }
 return{root,asset,qa,variant,downloadOBJ,dispose};
}