import * as THREE from "three";
import {createSurfaceState,updateSurface,inputSurface,paintSurface} from "./screen-core.mjs";
export function createLiveSurface(config={}){
 const c=document.createElement("canvas");c.width=config.width||640;c.height=config.height||480;
 const ctx=c.getContext("2d",{alpha:false});if(!ctx)throw new Error("Canvas2D unavailable");
 const state=createSurfaceState(config);
 const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
 let clock=0;paintSurface(ctx,c.width,c.height,state);texture.needsUpdate=true;
 return {state,texture,update(dt){updateSurface(state,dt);clock+=dt;if(clock>=1/24){clock=0;paintSurface(ctx,c.width,c.height,state);texture.needsUpdate=true;}},input(action){inputSurface(state,action);paintSurface(ctx,c.width,c.height,state);texture.needsUpdate=true;},canvas:c};
}