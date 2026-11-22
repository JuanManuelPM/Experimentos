// Visor portable para <img> de alta resolución. Sin dependencias ni frameworks.
export class RasterZoomViewer {
 constructor(stage,image,change=()=>{}) {
  this.stage=stage;this.image=image;this.change=change;this.scale=1;this.x=0;this.y=0;this.points=new Map();this.start=null;
  stage.tabIndex=0;stage.setAttribute("role","region");stage.setAttribute("aria-label","Imagen ampliable. Flechas para mover; + y − para ampliar; 0 para encuadrar.");
  stage.addEventListener("pointerdown",e=>{if(e.button&&e.pointerType==="mouse")return;this.points.set(e.pointerId,[e.clientX,e.clientY]);stage.setPointerCapture(e.pointerId);this.start={x:e.clientX,y:e.clientY,panX:this.x,panY:this.y,scale:this.scale,dist:this.distance()};});
  stage.addEventListener("pointermove",e=>{if(!this.points.has(e.pointerId))return;this.points.set(e.pointerId,[e.clientX,e.clientY]);if(this.points.size>=2){let next=this.distance();if(this.start?.dist)this.setScale(this.start.scale*next/this.start.dist);return}if(this.start&&this.scale>1){this.x=this.start.panX+e.clientX-this.start.x;this.y=this.start.panY+e.clientY-this.start.y;this.apply()}});
  const end=e=>{this.points.delete(e.pointerId);this.start=null};stage.addEventListener("pointerup",end);stage.addEventListener("pointercancel",end);
  stage.addEventListener("dblclick",()=>this.setScale(this.scale>1?1:2.4));
  stage.addEventListener("wheel",e=>{if(!this.image.src)return;e.preventDefault();this.setScale(this.scale*(e.deltaY<0?1.16:1/1.16))},{passive:false});
  stage.addEventListener("keydown",e=>{if(["+","=","-","_","0","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)){e.preventDefault();if(e.key==="+"||e.key==="=")this.setScale(this.scale*1.3);else if(e.key==="-"||e.key==="_")this.setScale(this.scale/1.3);else if(e.key==="0")this.reset();else{const amt=e.shiftKey?140:42;this.x+=(e.key==="ArrowLeft"?amt:e.key==="ArrowRight"?-amt:0);this.y+=(e.key==="ArrowUp"?amt:e.key==="ArrowDown"?-amt:0);this.apply()}}});
 }
 distance(){const p=[...this.points.values()];return p.length>=2?Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1]):0}
 setScale(v){this.scale=Math.max(1,Math.min(5,Number(v)||1));if(this.scale===1){this.x=0;this.y=0}this.apply()}
 apply(){const boundX=(this.stage.clientWidth*(this.scale-1))/2,boundY=(this.stage.clientHeight*(this.scale-1))/2;this.x=Math.max(-boundX,Math.min(boundX,this.x));this.y=Math.max(-boundY,Math.min(boundY,this.y));this.image.style.transform="translate("+this.x+"px,"+this.y+"px) scale("+this.scale+")";this.change(this.scale);this.stage.dataset.zoom=this.scale.toFixed(2)}
 reset(){this.scale=1;this.x=0;this.y=0;this.apply()}
}