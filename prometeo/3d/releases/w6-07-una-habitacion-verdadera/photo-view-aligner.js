/**
 * PhotoViewAligner v1 - geometry-neutral photo/view evidence component.
 * Original code. Stores a manually selected camera, corresponding 2D points,
 * and their NORMALIZED image-plane residual. It does not infer 3D geometry,
 * depth, camera calibration, camera pose, or photogrammetry by itself.
 */
export class PhotoViewAligner {
  constructor({modelId, sourceUrl}) {
    if (!modelId || !sourceUrl) throw new Error('Model identity and source required');
    this.modelId=modelId; this.sourceUrl=sourceUrl; this.photo=null;
    this.camera=null; this.points=[]; this.timestamp=null;
  }
  setPhoto(photo) {
    if (!photo?.id || !photo?.source || !photo?.license) throw new Error('Unattributed photo');
    this.photo={...photo};
    this.camera=null; this.points=[]; this.timestamp=null;
  }
  setCamera(position,target) {
    if (!Array.isArray(position)||!Array.isArray(target)||position.length!==3||target.length!==3||
        ![...position,...target].every(Number.isFinite)) throw new Error('Invalid camera vector');
    this.camera={position:[...position],target:[...target]};
    this.timestamp=new Date().toISOString();
  }
  addPoint(kind, point) {
    if (kind!=='photo' && kind!=='view') throw new Error('Bad correspondence side');
    if (!Number.isFinite(point?.x)||!Number.isFinite(point?.y)||
        point.x<0||point.x>1||point.y<0||point.y>1) throw new Error('Point outside image');
    if (kind==='photo') {
      this.points.push({photo:{x:point.x,y:point.y},view:null});
      return this.points.length;
    }
    const waiting=this.points.findLast(p=>p.view===null);
    if (!waiting) throw new Error('First click the matching point in the photograph');
    waiting.view={x:point.x,y:point.y};
    return this.points.filter(p=>p.view).length;
  }
  removeLast() {
    if (!this.points.length) return;
    const last=this.points[this.points.length-1];
    if (last.view) last.view=null;
    else this.points.pop();
  }
  report() {
    const complete=this.points.filter(p=>p.photo&&p.view);
    const rmse=complete.length?Math.sqrt(complete.reduce((acc,p)=>
      acc+(p.photo.x-p.view.x)**2+(p.photo.y-p.view.y)**2,0)/complete.length):null;
    return {
      pairs:complete.length,
      normalizedImagePlaneRMSE:rmse===null?null:Number(rmse.toFixed(6)),
      status:complete.length>=4?'MANUAL_2D_COMPARISON':'INSUFFICIENT_POINTS',
      warning:'Uncalibrated 2D point residual only; neither 3D geometric error nor registration ground truth.'
    };
  }
  toJSON() {
    return {
      schema:'prometeo.photo-view-alignment/v1',
      modelId:this.modelId,modelSource:this.sourceUrl,photo:this.photo,
      camera:this.camera,recordedAt:this.timestamp,
      manuallySelectedCorrespondences:this.points,metrics:this.report(),
      verification:'MANUAL_NOT_GROUND_TRUTH',
      method:'Viewer camera selected by observer; photo may be from a different capture campaign.'
    };
  }
}
export function normalizedImageClick(event,image) {
  const r=image.getBoundingClientRect(),w=image.naturalWidth,h=image.naturalHeight;
  if (!w||!h||!r.width||!r.height) return null;
  const scale=Math.min(r.width/w,r.height/h);
  const visibleW=w*scale,visibleH=h*scale;
  const x=(event.clientX-r.left-(r.width-visibleW)/2)/visibleW;
  const y=(event.clientY-r.top-(r.height-visibleH)/2)/visibleH;
  return x>=0&&x<=1&&y>=0&&y<=1?{x,y}:null;
}
