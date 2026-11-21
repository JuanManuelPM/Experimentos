// PROMETEO 2.2 production helpers. Evidence validators/math, NOT a renderer.
export const METHOD_VERSION='2.2.0';
const F=n=>typeof n==='number'&&Number.isFinite(n),V=v=>v&&F(v.x)&&F(v.z),N=v=>Math.hypot(v.x,v.z),clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function calibratedYaw(front,velocity){if(!V(front)||!V(velocity)||N(front)<1e-8||N(velocity)<1e-8)return null;const a=Math.atan2(velocity.x,velocity.z)-Math.atan2(front.x,front.z);return Math.atan2(Math.sin(a),Math.cos(a))}
export function rotateFront(f,a){return{x:f.x*Math.cos(a)+f.z*Math.sin(a),z:-f.x*Math.sin(a)+f.z*Math.cos(a)}}
export function facingDot(f,v){return V(f)&&V(v)&&N(f)*N(v)>1e-8?(f.x*v.x+f.z*v.z)/(N(f)*N(v)):null}
export function shortestYaw(a,b){return Math.atan2(Math.sin(b-a),Math.cos(b-a))}
export function auditCastMotion(roster,reports){
 const fail=[],missing=[],ids=new Set(),by=new Map();if(!Array.isArray(roster)||!Array.isArray(reports))return{status:'NOT_RUN',missing:['ROSTER_OR_REPORTS_MISSING'],fail:[]};
 for(const r of reports){if(by.has(r.actorId))fail.push('DUPLICATE_REPORT:'+r.actorId);by.set(r.actorId,r)}
 let moving=0;
 for(const a of roster){if(!a.actorId||ids.has(a.actorId)){fail.push('BAD_ACTOR_ID');continue}ids.add(a.actorId);if(typeof a.locomotes!=='boolean'){missing.push('ACTOR_MOTION_UNCLASSIFIED:'+a.actorId);continue}if(!a.locomotes)continue;moving++;
  const r=by.get(a.actorId);
  if(!r||!r.axisEvidence||!r.runtimeEvidence||!r.samples?.length||!a.routeIds?.length){missing.push('MISSING_ACTOR_EVIDENCE:'+a.actorId);continue}
  const coverage=new Map(),last=new Map();
  for(const s of r.samples){if(!a.routeIds.includes(s.routeId)){fail.push('UNKNOWN_ROUTE:'+a.actorId);continue}if(!F(s.t)||!V(s.worldFront)||!V(s.velocity)){missing.push('INVALID_SAMPLE:'+a.actorId);continue}
   const prev=last.get(s.routeId);if(prev!==undefined&&(s.t<=prev||s.t-prev>.120001))missing.push('SAMPLE_GAP:'+a.actorId+':'+s.routeId);last.set(s.routeId,s.t);
   if(N(s.velocity)<.05)continue;coverage.set(s.routeId,(coverage.get(s.routeId)||0)+1);const d=facingDot(s.worldFront,s.velocity);
   if(d===null){missing.push('FRONT_MISSING:'+a.actorId);continue}
   const deliberate=['BACKPEDAL','STRAFE'].includes(s.intent)&&s.intentEvidence&&s.clipEvidence;
   if(!deliberate&&d<.8)fail.push('BACKWARD_OR_SIDEWAYS:'+a.actorId+':'+s.routeId+':'+s.t);
   if(deliberate&&s.intent==='BACKPEDAL'&&d>-.8)fail.push('WRONG_BACKPEDAL:'+a.actorId);
   if(deliberate&&s.intent==='STRAFE'&&Math.abs(d)>.35)fail.push('WRONG_STRAFE:'+a.actorId);
  }
  for(const route of a.routeIds)if((coverage.get(route)||0)<3)missing.push('ROUTE_UNMEASURED:'+a.actorId+':'+route);
  if(!r.contactEvidence||!r.transitionEvidence)missing.push('CONTACT_OR_TRANSITIONS_UNMEASURED:'+a.actorId);
 }
 for(const id of by.keys())if(!ids.has(id))fail.push('UNKNOWN_REPORTED_ACTOR:'+id);
 return{status:fail.length?'FAIL':missing.length?'NOT_RUN':moving?'PASS':'N/A',movingActors:moving,actorCount:ids.size,fail:[...new Set(fail)],missing:[...new Set(missing)],artApproval:'NOT_RUN'};
}
// For world forward=(sin(yaw)*cos(pitch),sin(pitch),-cos(yaw)*cos(pitch))
export function freeLookDrag(s,dx,dy,k=.0035){if(![s.yaw,s.pitch,dx,dy,k].every(F)||k<=0)throw Error('BAD_DELTA');return{yaw:s.yaw+dx*k,pitch:clamp(s.pitch-dy*k,-1.45,1.45)}}
// Grab-world orbit: camera position relative to target is (sin(azimuth)*cos(elevation),sin(elevation),cos(azimuth)*cos(elevation))*r.
// Validate the projected landmark in the actual adapter, not only these signs.
export function orbitDrag(s,dx,dy,k=.0035){if(![s.azimuth,s.elevation,dx,dy,k].every(F)||k<=0)throw Error('BAD_DELTA');return{azimuth:s.azimuth-dx*k,elevation:clamp(s.elevation+dy*k,-1.45,1.45)}}
export function pinchScale(a,b){return F(a)&&F(b)&&a>0&&b>0?a/b:1}
export function newGesture(){return{points:{},moved:0,cancelled:false,multi:false}}
export function gesture(state,e){const s={...state,points:{...state.points}},key=String(e.id),pt={x:e.x,y:e.y},noop={kind:'NONE'};
 if(e.type==='down'){if(e.overUI||!F(pt.x)||!F(pt.y))return{state:s,out:noop};if(!Object.keys(s.points).length){s.moved=0;s.cancelled=false;s.multi=false} s.points[key]=pt;if(Object.keys(s.points).length>1)s.multi=true;return{state:s,out:noop}}
 if(['cancel','lostcapture'].includes(e.type)){delete s.points[key];s.cancelled=true;return{state:s,out:noop}}
 const prev=s.points[key];if(!prev)return{state:s,out:noop};
 if(e.type==='move'&&F(pt.x)&&F(pt.y)){const other=Object.entries(s.points).find(([id])=>id!==key)?.[1];s.points[key]=pt;const dx=pt.x-prev.x,dy=pt.y-prev.y;s.moved+=Math.hypot(dx,dy);return{state:s,out:other?{kind:'PINCH_PAN',scale:pinchScale(Math.hypot(prev.x-other.x,prev.y-other.y),Math.hypot(pt.x-other.x,pt.y-other.y)),dx:dx/2,dy:dy/2}:s.moved>=6?{kind:'DRAG',dx,dy}:noop}}
 if(e.type==='up'){delete s.points[key];return{state:s,out:{kind:s.moved<6&&!s.cancelled&&!s.multi?'TAP':'NONE'}}}return{state:s,out:noop};
}
const R=r=>r&&[r.x,r.y,r.w,r.h].every(F)&&r.w>0&&r.h>0;
const ix=(a,b)=>{const x=Math.max(a.x,b.x),y=Math.max(a.y,b.y),r=Math.min(a.x+a.w,b.x+b.w),d=Math.min(a.y+a.h,b.y+b.h);return r>x&&d>y?{x,y,w:r-x,h:d-y}:null};
export function unionArea(rects){const rs=rects.filter(R),xs=[...new Set(rs.flatMap(r=>[r.x,r.x+r.w]))].sort((a,b)=>a-b);let area=0;
 for(let i=1;i<xs.length;i++){const x=xs[i-1],w=xs[i]-x,ys=rs.filter(r=>r.x<x+w&&r.x+r.w>x).map(r=>[r.y,r.y+r.h]).sort((a,b)=>a[0]-b[0]);let start=null,end=null,total=0;for(const [a,b] of ys){if(start===null){start=a;end=b}else if(a>end){total+=end-start;start=a;end=b}else end=Math.max(end,b)}if(start!==null)total+=end-start;area+=w*total}return area}
export function auditHUD({viewport,rects,focal,defaultModalOpen=false,screenEvidence}={}){if(!R(viewport)||!Array.isArray(rects)||!R(focal)||!ix(viewport,focal)||!screenEvidence)return{status:'NOT_RUN',issues:['SCREEN_OR_FOCAL_MISSING']};
 const active=rects.filter(r=>r.visible!==false&&r.persistent!==false);if(active.some(r=>!R(r)))return{status:'NOT_RUN',issues:['BAD_RECT']};
 const chrome=active.map(r=>ix(r,viewport)).filter(Boolean),fraction=unionArea(chrome)/(viewport.w*viewport.h),overlap=unionArea(chrome.map(r=>ix(r,focal)).filter(Boolean)),issues=[];
 if(defaultModalOpen)issues.push('DEFAULT_MODAL_OPEN');if(fraction>.12000001)issues.push('HUD_AREA_OVER_BUDGET');if(overlap>0)issues.push('FOCAL_OCCLUDED');
 for(const r of rects.filter(r=>r.visible!==false&&r.interactive===true))if(!R(r)||r.w<44||r.h<44)issues.push('SMALL_TOUCH_TARGET:'+String(r.id||'unknown'));
 return{status:issues.length?'FAIL':'PASS',issues,fraction,overlapPx:overlap};
}
export function auditAvatarExperiment({actors,alternatives=[],steps=[]}={}){
 if(!Array.isArray(actors))return{status:'NOT_RUN',issues:['ROSTER_MISSING'],artApproved:false};
 if(!actors.length)return{status:'N/A',issues:[],artApproved:false};
 const issues=[],ids=new Set(),identities=new Set(),required=['DESIGN','BODY','FACE','HANDS','HAIR','WARDROBE','MATERIAL','TOPOLOGY','RIG','EXPRESSION','LOOKDEV','COMPARE'];
 if(new Set(alternatives.filter(a=>a?.fingerprint&&a?.availabilityEvidence).map(a=>a.fingerprint)).size<2)issues.push('DISTINCT_VIABLE_ALTERNATIVES_MISSING');
 for(const a of actors){if(!a.actorId||ids.has(a.actorId))issues.push('ACTOR_ID_MISSING_OR_DUPLICATE');ids.add(a.actorId);if(!a.visualIdentity||identities.has(a.visualIdentity)&&a.role!=='BACKGROUND')issues.push('VISIBLE_IDENTITY_DUPLICATE_OR_MISSING');identities.add(a.visualIdentity);
  for(const k of required){const s=steps.find(x=>x.actorId===a.actorId&&x.step===k);if(!s||s.status==='PASS'&&!s.evidenceRef||s.status==='N/A'&&(!s.reason||!['HANDS','HAIR','RIG','EXPRESSION'].includes(k))||!['PASS','FAIL','NOT_RUN','N/A'].includes(s.status))issues.push('STEP_UNPROVEN:'+a.actorId+':'+k);else if(s.status==='FAIL'||s.status==='NOT_RUN')issues.push('STEP_UNPROVEN:'+a.actorId+':'+k)}
 }return{status:issues.length?'INCOMPLETE':'DOCUMENTED_CANDIDATE',issues,artApproved:false,continueFullScene:true}
}
