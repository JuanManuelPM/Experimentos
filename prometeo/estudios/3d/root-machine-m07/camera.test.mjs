import {initialView,drag,zoom,toggleMacro,pose,corners,fits,CAMERA} from "./camera.mjs";
import {build,bounds,FRONT} from "./geometry.mjs";
export function runCamera(){
 const box=bounds(build(.32).parts),checks=[];
 const chk=(name,ok)=>checks.push({name,pass:!!ok});
 for(const [w,h] of [[320,640],[390,844],[844,390],[1280,800]]){
  const aspect=w/h,v=initialView(),P=pose(v,aspect,box,FRONT);
  chk("overview fits "+w+"x"+h,P.safe&&fits(corners(box),P,aspect));
  const M=pose(toggleMacro(v),aspect,box,FRONT),region={min:[FRONT-.38,-.48,-.48],max:[FRONT+.70,.48,.48]};
  chk("macro fits "+w+"x"+h,M.safe&&fits(corners(region),M,aspect));
  const V=pose(drag(v,0,h/5,h),aspect,box,FRONT);
  chk("vertical translates without pitching "+w+"x"+h,Math.abs(V.target[1]-P.target[1]-.52)<1e-8&&V.basis.dir.every((x,i)=>Math.abs(x-P.basis.dir[i])<1e-12));
  chk("pinch moves closer "+w+"x"+h,pose(zoom(v,1.3),aspect,box,FRONT).distance<P.distance);
  for(let k=0;k<24;k++){const yaw=k*Math.PI/12;chk("safe macro "+w+" "+k,pose({...toggleMacro(v),yaw,zoom:2.15},aspect,box,FRONT).safe);}
 }
 return {checks,failed:checks.filter(x=>!x.pass),scope:"pure camera CPU projection, not browser touch or renderer"};
}
if(typeof process!=="undefined"&&process.argv[1]?.endsWith("camera.test.mjs")){const r=runCamera();console.log(JSON.stringify(r,null,2));if(r.failed.length)process.exitCode=1;}
