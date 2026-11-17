export const MODEL_SHA256='8bec29e84c9f0d082cc8ac08fd8cbe898dfcaa82abc9e1fa1bb13de46bfa5e4b';
export const MODEL_URL='https://raw.githubusercontent.com/JuanManuelPM/Experimentos/candidate/prometeo-3d-npc-civilian-build-20261116/prometeo/3d-npc-civilian-v1/dist/civil_azul.glb';
export const ATLAS_SIZE=1024;
export function trianglesFromGeometry(geometry){
 const uv=geometry?.getAttribute?.('uv');if(!uv||uv.itemSize!==2||uv.count<3)throw new Error('UV_MISSING: la malla no tiene TEXCOORD_0 válido');
 const idx=geometry.getIndex?.();const count=idx?idx.count:uv.count;if(count%3!==0)throw new Error('TRIANGLES_INVALID: índices UV no triangulados');
 const tri=[];for(let i=0;i<count;i+=3){let points=[];for(let k=0;k<3;k++){const id=idx?idx.getX(i+k):i+k;if(id>=uv.count)throw new Error('UV_INDEX_OUT_OF_RANGE');const u=uv.getX(id),v=uv.getY(id);if(!Number.isFinite(u)||!Number.isFinite(v))throw new Error('UV_NOT_FINITE');points.push([u,v]);}tri.push(points);}return tri;
}
export function rasterUV(canvas,triangles){const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);c.lineWidth=1;c.strokeStyle='rgba(174,238,173,.64)';c.beginPath();for(const points of triangles){c.moveTo(points[0][0]*canvas.width,points[0][1]*canvas.height);for(let j=1;j<3;j++)c.lineTo(points[j][0]*canvas.width,points[j][1]*canvas.height);c.closePath();}c.stroke();}
export function materialSignature(scene){const rows=[];scene.traverse(o=>{if(o.isMesh){let g=o.geometry;rows.push({id:o.name||o.uuid,positions:g.getAttribute('position')?.count??0,uvs:g.getAttribute('uv')?.count??0,indices:g.getIndex()?.count??null,skin:o.isSkinnedMesh,bones:o.isSkinnedMesh?o.skeleton.bones.map(b=>b.name):[],weight:g.getAttribute('skinWeight')?.count??0,joint:g.getAttribute('skinIndex')?.count??0,morph:Object.keys(g.morphAttributes??{}).map(k=>[k,g.morphAttributes[k].length])});}});return rows.sort((a,b)=>a.id.localeCompare(b.id));}
export function compatible(before,after,originalClips=[],roundClips=[]){const problems=[];if(JSON.stringify(before)!==JSON.stringify(after))problems.push('Topology/UV/skin/morph/bone mismatch');const clips=a=>a.map(c=>[c.name,c.duration,c.tracks.length]).sort((x,y)=>x[0].localeCompare(y[0]));if(JSON.stringify(clips(originalClips))!==JSON.stringify(clips(roundClips)))problems.push('Animation clip mismatch');return problems;}
export function uvBounds(triangles){let minU=Infinity,minV=Infinity,maxU=-Infinity,maxV=-Infinity;for(const t of triangles)for(const [u,v] of t){minU=Math.min(minU,u);minV=Math.min(minV,v);maxU=Math.max(maxU,u);maxV=Math.max(maxV,v);}return {minU,minV,maxU,maxV};}
export function validateRecipe(r){if(r?.schema!=='prometeo.texture-recipe/v2'||r.atlasSize!==ATLAS_SIZE||!r.meshId||!r.source?.sha256||!Array.isArray(r.layers))throw new Error('TEXTURE_RECIPE_INVALID');for(const l of r.layers){if(l.kind!=='image'||![l.cx,l.cy,l.widthUV,l.opacity].every(Number.isFinite)||l.opacity<0||l.opacity>1||l.widthUV<=0||!l.filename)throw new Error('TEXTURE_RECIPE_LAYER_INVALID');}return true;}
export async function sha256(buf){const array=buf instanceof ArrayBuffer?buf:buf.buffer.slice(buf.byteOffset,buf.byteOffset+buf.byteLength);return [...new Uint8Array(await crypto.subtle.digest('SHA-256',array))].map(x=>x.toString(16).padStart(2,'0')).join('');}
// UX gate: a TEXCOORD attribute is not evidence of a usable atlas.
export function uvDiagnostics(triangles){
 let area=0,nonZero=0;for(const [a,b,c] of triangles){const signed=(b[0]-a[0])*(c[1]-a[1])-(c[0]-a[0])*(b[1]-a[1]);area+=Math.abs(signed)/2;if(Math.abs(signed)>1e-8)nonZero++;}
 const b=uvBounds(triangles);return {usable:nonZero>0&&b.maxU-b.minU>1e-5&&b.maxV-b.minV>1e-5,nonZeroTriangles:nonZero,totalTriangles:triangles.length,areaSum:area,bounds:b};
}
// The generated UV is a DERIVATION, never misrepresented as original UV.
// Front half U=.02..48 and back half U=.52..98. Preserves vertex order.
export function projectUVValues(positions,normals){
 if(!positions.length||positions.length!==normals.length)throw new Error('UV_PROJECTION_INPUT_INVALID');
 const xs=positions.map(p=>p[0]),ys=positions.map(p=>p[1]),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
 if(![minX,maxX,minY,maxY].every(Number.isFinite))throw new Error('UV_PROJECTION_POSITION_NOT_FINITE');
 const dx=Math.max(1e-8,maxX-minX),dy=Math.max(1e-8,maxY-minY);
 return positions.map((p,i)=>{const n=normals[i];if(![...p,...n].every(Number.isFinite))throw new Error('UV_PROJECTION_VERTEX_NOT_FINITE');return [(n[2]>=0?.02:.52)+.46*(p[0]-minX)/dx,.02+.96*(maxY-p[1])/dy];});
}
export function readGLBStructure(buffer){
 const a=buffer instanceof Uint8Array?buffer:new Uint8Array(buffer);if(a.byteLength<20)throw new Error('GLB_HEADER_SHORT');
 const view=new DataView(a.buffer,a.byteOffset,a.byteLength);
 if(view.getUint32(0,true)!==0x46546c67||view.getUint32(4,true)!==2||view.getUint32(8,true)!==a.byteLength||view.getUint32(16,true)!==0x4e4f534a)throw new Error('GLB_HEADER_INVALID');
 const len=view.getUint32(12,true);if(len>1e8||20+len>a.byteLength)throw new Error('GLB_JSON_INVALID');
 const data=JSON.parse(new TextDecoder().decode(a.subarray(20,20+len)));
 return {skins:data.skins?.length??0,animations:data.animations?.length??0,meshes:data.meshes?.length??0,meshRefs:(data.meshes??[]).flatMap((m,mi)=>(m.primitives??[]).map((p,pi)=>({meshIndex:mi,primitiveIndex:pi,meshName:m.name||`mesh_${mi}`,materialName:data.materials?.[p.material]?.name||`mat_${p.material}`,hasUV:'TEXCOORD_0' in (p.attributes||{})})))};
}
