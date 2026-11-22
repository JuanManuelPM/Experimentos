// Reusable photo-to-view alignment. Does NOT invent a COLMAP calibration or metric accuracy.
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)));
export function normalisePose(raw){
  if(!raw||![raw.pos,raw.forward,raw.up].every(v=>Array.isArray(v)&&v.length===3&&v.every(Number.isFinite)))throw Error("Pose must contain finite pos, forward, up");
  const len=v=>Math.hypot(...v), unit=v=>v.map(c=>c/len(v));
  if(len(raw.forward)<0.00001||len(raw.up)<0.00001)throw Error("Degenerate camera orientation");
  const f=unit(raw.forward),u=unit(raw.up);
  if(Math.abs(f.reduce((n,v,i)=>n+v*u[i],0))>0.99)throw Error("Forward and up are collinear");
  return {name:String(raw.name||"capture frame"),pos:[...raw.pos],forward:f,up:u};
}
export function setCapturedView(camera,controls,raw){
  const pose=normalisePose(raw); const p=pose.pos, f=pose.forward, u=pose.up;
  camera.position.set(...p);camera.up.set(...u);
  const target=[p[0]+f[0],p[1]+f[1],p[2]+f[2]];
  camera.lookAt(...target);camera.updateProjectionMatrix();
  if(controls&&controls.target){controls.target.set(...target);controls.update();}
  return pose;
}
export function createAlignmentSession(){
 const state={imageName:null,viewName:null,offsetX:0,offsetY:0,zoom:1,opacity:0.55,landmarks:[]};
 return {
  state,
  loadImage(name){state.imageName=name||null;state.landmarks=[];},
  selectView(name){state.viewName=name||null;state.landmarks=[];},
  shift(dx,dy){state.offsetX=clamp(state.offsetX+dx,-45,45);state.offsetY=clamp(state.offsetY+dy,-45,45);},
  setZoom(z){state.zoom=clamp(z,0.6,2.2);},
  setOpacity(a){state.opacity=clamp(a,0,1);},
  addPair(photo,render){
   const valid=p=>Array.isArray(p)&&p.length===2&&p.every(v=>Number.isFinite(v)&&v>=0&&v<=1);
   if(!valid(photo)||!valid(render))throw Error("Landmarks must be normalised 0..1");
   state.landmarks.push({photo:[...photo],render:[...render]});
  },
  report(){
   const sq=state.landmarks.map(l=>(l.photo[0]-l.render[0])**2+(l.photo[1]-l.render[1])**2);
   return {schema:"prometeo.photo-view-align/v1",coordinateSystem:"normalised 2D (NOT metric camera reprojection)",...JSON.parse(JSON.stringify(state)),
    rms2D:sq.length?Math.sqrt(sq.reduce((a,b)=>a+b,0)/sq.length):null,
    status:state.imageName&&state.viewName?"MANUAL_OVERLAY_UNCALIBRATED":"PHOTO_OR_VIEW_MISSING"};
  }
 };
}