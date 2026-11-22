/** ArchiveViewer: reusable viewer for SVG/JPEG/PNG/WebP. */
export class ArchiveViewer {
 constructor(root,img,onChange=()=>{}){
  this.root=root;this.img=img;this.onChange=onChange;this.scale=1;this.x=0;this.y=0;this.pointers=new Map();this.lastPinch=0;
  root.style.touchAction='none';root.tabIndex=0;
  root.addEventListener('wheel',e=>{e.preventDefault();this.setScale(this.scale*(e.deltaY<0?1.17:1/1.17));},{passive:false});
  root.addEventListener('pointerdown',e=>{if(e.button!==0&&e.pointerType==='mouse')return;root.setPointerCapture(e.pointerId);this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});this.lastPinch=0;root.classList.add('dragging');});
  root.addEventListener('pointermove',e=>{const prev=this.pointers.get(e.pointerId);if(!prev)return;this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(this.pointers.size===1){this.x+=e.clientX-prev.x;this.y+=e.clientY-prev.y;this.paint();}else if(this.pointers.size===2){const pts=[...this.pointers.values()];const d=Math.hypot(pts[0].x-pts[1].x,pts[0].y-pts[1].y);if(this.lastPinch)this.setScale(this.scale*d/this.lastPinch);this.lastPinch=d;}});
  const up=e=>{this.pointers.delete(e.pointerId);this.lastPinch=0;if(!this.pointers.size)root.classList.remove('dragging');};root.addEventListener('pointerup',up);root.addEventListener('pointercancel',up);
  root.addEventListener('keydown',e=>{if(['+','=','-','_','0','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();if(['+','='].includes(e.key))this.zoomIn();else if(['-','_'].includes(e.key))this.zoomOut();else if(e.key==='0')this.reset();else {const step=75;if(e.key==='ArrowUp')this.y+=step;if(e.key==='ArrowDown')this.y-=step;if(e.key==='ArrowLeft')this.x+=step;if(e.key==='ArrowRight')this.x-=step;this.paint();}}});
  if(typeof ResizeObserver!=='undefined'){this.observer=new ResizeObserver(()=>this.paint());this.observer.observe(root);}
 }
 open(src,alt){this.img.src=src;this.img.alt=alt;this.reset();}
 setScale(s){this.scale=Math.max(1,Math.min(6,s));this.paint();}
 zoomIn(){this.setScale(this.scale<1.5?1.5:this.scale<2.5?2.5:this.scale<4?4:6);}
 zoomOut(){this.setScale(this.scale>4?4:this.scale>2.5?2.5:this.scale>1.5?1.5:1);}
 reset(){this.scale=1;this.x=0;this.y=0;this.paint();}
 paint(){const box=this.root.getBoundingClientRect();if(!box.width||!box.height)return;const ratio=(this.img.naturalWidth||3000)/(this.img.naturalHeight||3800);const iw=Math.min(box.width,box.height*ratio),ih=iw/ratio;const mx=Math.max(0,(iw*this.scale-box.width)/2),my=Math.max(0,(ih*this.scale-box.height)/2);this.x=Math.max(-mx,Math.min(mx,this.x));this.y=Math.max(-my,Math.min(my,this.y));this.img.style.transform='translate('+this.x+'px, '+this.y+'px) scale('+this.scale+')';this.onChange(this.scale);}
 destroy(){this.observer?.disconnect();}
}
