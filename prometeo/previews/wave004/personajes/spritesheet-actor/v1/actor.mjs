/** LUMA · Four animation clips on an original transparent vector atlas.
 * No Three.js import: supply your own THREE instance to integrate in any compatible scene.
 * Coordinate system: +Y up; center foot at y=0. Sprite auto-billboards in the caller update.
 */
export const LUMA_MANIFEST = Object.freeze({
  name:"Luma", version:"1.0.0", atlas:"./atlas.svg", columns:8, rows:4,
  cell:{width:280,height:360}, framesPerClip:8,
  clips:{idle:{row:0,fps:5},walk:{row:1,fps:10},turn:{row:2,fps:8},react:{row:3,fps:7}}
});
export async function createLumaSprite({ THREE, atlasUrl = new URL("./atlas.svg",import.meta.url).href, scale = 1 }={}){
  if(!THREE || !THREE.TextureLoader || !THREE.Mesh) throw new Error("Pass a compatible THREE namespace.");
  const texture=await new THREE.TextureLoader().loadAsync(atlasUrl);
  texture.colorSpace=THREE.SRGBColorSpace;
  texture.wrapS=THREE.RepeatWrapping;texture.wrapT=THREE.RepeatWrapping;
  texture.magFilter=THREE.LinearFilter; texture.minFilter=THREE.LinearFilter;
  texture.repeat.set(1/8,1/4);
  const geometry=new THREE.PlaneGeometry(2.32*scale,2.99*scale);
  const material=new THREE.MeshBasicMaterial({map:texture,transparent:true,alphaTest:0.045,depthWrite:false,side:THREE.DoubleSide});
  const object=new THREE.Mesh(geometry,material);
  object.position.y=1.495*scale;
  object.name="Luma_TransparentSprite";
  let clip="idle",elapsed=0,frame=0,speed=1,paused=false;
  const clips=LUMA_MANIFEST.clips;
  const apply=()=>{texture.offset.set(frame/8,1-(clips[clip].row+1)/4);texture.needsUpdate=true;};
  apply();
  return {
    object,texture,manifest:LUMA_MANIFEST,
    get state(){return clip;},get frame(){return frame;},
    get paused(){return paused;},
    setAnimation(name){if(!clips[name])throw new Error("Unknown clip: "+name);clip=name;elapsed=0;frame=0;apply();},
    setSpeed(value){speed=Math.max(.05,Math.min(4,Number(value)||1));},
    setPaused(value){paused=!!value;},
    update(delta, camera){
      if(!paused){elapsed+=Math.min(Math.max(delta,0),.1)*speed;const next=Math.floor(elapsed*clips[clip].fps)%8;if(next!==frame){frame=next;apply();}}
      if(camera){object.rotation.y=Math.atan2(camera.position.x-object.position.x,camera.position.z-object.position.z);}
    },
    dispose(){geometry.dispose();material.dispose();texture.dispose();}
  };
}