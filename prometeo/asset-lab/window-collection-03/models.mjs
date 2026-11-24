import * as builder from '../surface-gate/constructor.mjs';
function windowLibrary(B){
 const {shell,sweep}=B;
 const designs=[["01","UMBRAL","Roble aceitado · dos hojas, una abatible"],["02","LÚCIDA","Aluminio anodizado · tres paños y corredera"],["03","FUNDICIÓN","Acero pintado · cuadrícula y dos montantes basculantes"]];
 const specs={ "01":{w:1.46,h:1.36,d:.16,t:.066,mat:"oak",wall:"plaster",base:.82},"02":{w:3.3,h:2.50,d:.24,t:.072,mat:"aluminium",wall:"concrete",base:.05},"03":{w:2.48,h:2.05,d:.135,t:.052,mat:"steel",wall:"brick",base:.65}};
 const bounds=p=>{let lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];for(let i=0;i<p.positions.length;i++){let k=i%3;lo[k]=Math.min(lo[k],p.positions[i]);hi[k]=Math.max(hi[k],p.positions[i]);}return {lo,hi};};
 function build(id){
  const s=specs[id];if(!s)throw Error("unknown window "+id);
  const [_,name,description]=designs.find(d=>d[0]===id),{w,h,d,t,mat,base}=s;
  const m={id:"window-"+id,name,description,unit:"metre",units:"metre",parts:[],roots:["frame-left"],relations:[],protectedFaces:[],independent:[],motions:[],opening:{width:w,height:h,depth:d,sillHeight:base,axis:"Y up, +Z interior",wallRoughOpening:[w+.016,h+.016]}};
  const all=new Map(), hints=[];
  const add=(p,motion=null,context=false)=>{p.motion=motion;p.context=context;m.parts.push(p);all.set(p.name,p);return p.name;};
  function box(n,material,role,x0,x1,y0,y1,z0,z1,motion=null,context=false){
   if(!(x1>x0&&y1>y0&&z1>z0))throw Error("bad box "+n);
   return add(shell(n,material,role,1,1,(u,v)=>({p:[x0+(x1-x0)*u,y0+(y1-y0)*v,z1],n:[0,0,1]}),z1-z0),motion,context);
  }
  function rod(n,material,role,a,b,r,motion=null,sides=24){return add(sweep(n,material,role,[a,b],()=>[r,r],sides),motion);}
  function tie(a,b,reason="Borde de montaje"){hints.push([a,b,reason]);}
  function ring(n,material,role,x0,x1,y0,y1,z0,z1,b,motion=null){
   let l=box(n+"-left",material,role,x0,x0+b,y0,y1,z0,z1,motion),
   r=box(n+"-right",material,role,x1-b,x1,y0,y1,z0,z1,motion),
   bot=box(n+"-bottom",material,role,x0+b,x1-b,y0,y0+b,z0,z1,motion),
   top=box(n+"-top",material,role,x0+b,x1-b,y1-b,y1,z0,z1,motion);
   tie(bot,l);tie(top,l);tie(r,bot);tie(r,top);
   return {l,r,bot,top,x0:x0+b,x1:x1-b,y0:y0+b,y1:y1-b};
  }
  function pane(n,x0,x1,y0,y1,z,thick,motion,hosts,bead=.012,dual=false){
   const gz=dual?.018:0, layers=dual?[-gz/2,gz/2]:[0], seals=ring(n+"-seal","rubber","gasket",x0,x1,y0,y1,z-thick/2-gz/2,z+thick/2+gz/2,bead,motion);
   for(const [a,b] of [[seals.l,hosts.l],[seals.r,hosts.r],[seals.bot,hosts.bot],[seals.top,hosts.top]])tie(a,b,"EPDM / apoyo de borde");
   for(let k=0;k<layers.length;k++){const q=z+layers[k],p=box(n+"-glass-"+k,"glass","glazing",seals.x0,seals.x1,seals.y0,seals.y1,q-thick/2,q+thick/2,motion);tie(p,seals.l,"Vidrio sobre burlete perimetral");tie(p,seals.bot,"Apoyo inferior");m.protectedFaces.push({name:p,faceVertices:4,residual:.001});}
   if(dual){let spacer=ring(n+"-spacer","spacer","sealed cavity spacer",seals.x0,seals.x1,seals.y0,seals.y1,z-gz/2+thick/2,z+gz/2-thick/2,.007,motion);tie(spacer.l,seals.l);}
   // Retaining beads on both sides, kept outside the visible glass rectangle.
   for(const sign of [-1,1]){let a=z+sign*(thick/2+gz/2),b=a+sign*.010;let q=ring(n+"-bead-"+sign,mat,"glazing bead",x0,x1,y0,y1,Math.min(a,b),Math.max(a,b),bead,motion);tie(q.l,seals.l);tie(q.r,seals.r);tie(q.bot,seals.bot);tie(q.top,seals.top);}
  }
  const f=ring("frame",mat,"fixed jamb",-w/2,w/2,0,h,-d/2,d/2,t);
  // Profile rebates, outer perimeter weather strip and wall installation collar.
  for(const sign of [-1,1]){const z=sign*d/2;let q=ring("trim-"+sign,mat,"casing",-w/2-.026,w/2+.026,-.026,h+.026,Math.min(z,z+sign*.016),Math.max(z,z+sign*.016),t*.72);tie(q.l,f.l);tie(q.r,f.r);tie(q.top,f.top);tie(q.bot,f.bot);}
  let outer=ring("installation-seal","rubber","wall seal",-w/2-.008,w/2+.008,-.008,h+.008,-d/2,d/2,.008);for(const k of ["l","r","bot","top"])tie(outer[k],f[k]);
  // Context wall is detachable, leaving a real opening through the full depth.
  const ext=.28,lo=-w/2-.008,hi=w/2+.008,wallD=d+.055;
  const wall=(n,x0,x1,y0,y1)=>{const p=box(n,s.wall,"wall sample",x0,x1,y0,y1,-wallD/2,wallD/2,null,true);m.independent.push(p);return p;};
  const wl=wall("wall-left",lo-ext,lo,-ext,h+ext),wr=wall("wall-right",hi,hi+ext,-ext,h+ext),wb=wall("wall-bottom",lo,hi,-ext,-.008),wt=wall("wall-top",lo,hi,h+.008,h+ext);
  const sill=box("drip-sill",id==="01"?"stone":mat,"sloped-sill approximation",-w/2-.052,w/2+.052,-.047,-.026,-d/2-.075,d/2+.040);tie(sill,"trim--1-bottom","Exterior drip and sill"); 
  const fastener=(n,x,y,z,sign,host,motion=null)=>{let a=rod(n,"fastener","countersunk screw",[x,y,z-sign*.001],[x,y,z+sign*.0025],.0036,motion,16);tie(a,host,"Visible screw head in mounting plate");let slot=box(n+"-slot","slot","screw slot",x-.0024,x+.0024,y-.00055,y+.00055,Math.min(z+sign*.0025,z+sign*.003),Math.max(z+sign*.0025,z+sign*.003),motion);tie(slot,a,"Screw drive detail");};
  // Side anchor plates on real jambs, with visible fastener heads.
  for(const side of [-1,1])for(const yy of [.19,h-.19]){let x=side*(w/2-t/2),p=box("anchor-"+side+"-"+yy,"fastener","mounting plate",x-.017,x+.017,yy-.035,yy+.035,d/2,d/2+.004);tie(p,side<0?f.l:f.r);for(const dy of [-.021,.021])fastener(p+"-screw-"+dy,x,yy+dy,d/2+.004,1,p);}
  const y0=t,y1=h-t,x0=-w/2+t,x1=w/2-t;
  function sash(n,a,b,c,e,z,depth,border,motion=null,dual=false){let q=ring(n,mat,"sash",a,b,c,e,z-depth/2,z+depth/2,border,motion);pane(n+"-pane",q.x0,q.x1,q.y0,q.y1,z,dual?.005:.006,motion,q,id==="03"?.008:.012,dual);return q;}
  function handle(n,x,y,z,host,motion,vertical=true){
   let p=box(n+"-plate","hardware","handle backplate",x-.013,x+.013,y-.047,y+.047,z,z+.004,motion);tie(p,host);
   for(const dy of [-.033,.033])fastener(n+"-screw-"+dy,x,y+dy,z+.004,1,p,motion);
   let neck=rod(n+"-neck","hardware","spindle",[x,y,z+.004],[x,y,z+.035],.008,motion);tie(neck,p);
   let grip=rod(n+"-grip","hardware","lever",[x,y,z+.035],[x+(vertical?0:.085),y+(vertical?-.083:0),z+.035],.009,motion);tie(grip,neck);
  }
  if(id==="01"){
   let center=box("meeting-mullion",mat,"fixed mullion",-.035,.035,y0,y1,-d/2,d/2);tie(center,f.bot);tie(center,f.top);
   const a=sash("fixed",x0,-.035,y0,y1,0,.064,.055,null,true);tie(a.l,f.l);tie(a.r,center);tie(a.bot,f.bot);tie(a.top,f.top);
   // 3 mm operating clearance; hinge pin and leaves bridge it.
   const mx=x1-.003, a0=.038,sy0=y0+.003,sy1=y1-.003,z=.015;
   const q=sash("casement",a0,mx,sy0,sy1,z,.066,.055,"casement",true);
   m.motions.push({id:"casement",kind:"rotate",axis:"y",pivot:[x1,0,.086],max:Math.PI*.55,label:"Abrir hoja"});
   for(const yy of [sy0+.17,sy1-.17]){let k="hinge-"+yy,plate=box(k+"-fixed","hardware","hinge leaf",x1,x1+.026,yy-.043,yy+.043,.080,.084);tie(plate,f.r);
    let moving=box(k+"-moving","hardware","hinge leaf",mx-.028,mx,yy-.043,yy+.043,.080,.084,"casement");let offset=box(k+"-offset","hardware","offset hinge bracket",mx-.028,mx,yy-.035,yy+.035,.048,.080,"casement");tie(offset,q.r);tie(moving,offset);
    let pin=rod(k+"-pin","hardware","hinge pin",[x1,yy-.052,.086],[x1,yy+.052,.086],.0055);tie(pin,plate);tie(moving,pin,"Hinge knuckle attachment");
    for(const dy of [-.027,.027]){fastener(k+"-f-"+dy,x1+.013,yy+dy,.084,1,plate);fastener(k+"-m-"+dy,mx-.014,yy+dy,.084,1,moving,"casement");}
   }
   handle("casement-handle",a0+.028,(sy0+sy1)/2,z+.033,q.l,"casement",false);
   let strike=box("strike","hardware","latch strike",.029,.035,h/2-.035,h/2+.035,.035,.056);tie(strike,center);
  }else if(id==="02"){
   const zF=.047,zM=-.047,dep=.050,lip=.016;
   const rail=(n,z,y)=>{let bed=box(n,"aluminium","track",x0,x1,y,y+lip,z-.033,z+.033);tie(bed,y===y0?f.bot:f.top);for(const sign of [-1,1]){let r=box(n+"-lip-"+sign,"steel","guide lip",x0,x1,y+lip,y+lip+.009,z+sign*.029-.002,z+sign*.029+.002);tie(r,bed);}return bed;};
   let lower1=rail("front-track",zF,y0),lower2=rail("rear-track",zM,y0);
   for(const z of [zF,zM]){let a=box("upper-channel-"+z,"aluminium","header guide",x0,x1,y1-.020,y1,z-.033,z+.033);tie(a,f.top);}
   let panelW=(x1-x0)/3,py0=y0+lip+.009,py1=y1-.020;
   let left=sash("left-fixed",x0,x0+panelW,py0,py1,zF,dep,.054,null,true);
   let right=sash("right-fixed",x1-panelW,x1,py0,py1,zF,dep,.054,null,true);
   let mid=sash("slider",x0+panelW+.004,x1-panelW-.004,py0,py1,zM,dep,.062,"slider",true);
   tie(left.l,f.l);tie(right.r,f.r);tie(left.bot,lower1,"Fixed setting block");tie(right.bot,lower1,"Fixed setting block");
   for(const x of [x0+panelW+.12,x1-panelW-.12]){let p=box("roller-carriage-"+x,"hardware","roller carrier",x-.027,x+.027,py0-.009,py0,zM-.014,zM+.014,"slider");tie(p,mid.bot);tie(p,lower2,"Running support on track");}
   m.motions.push({id:"slider",kind:"translate",axis:"x",pivot:[0,0,0],max:panelW-.012,label:"Deslizar paño"});
   handle("slider-handle",x1-panelW-.036,(py0+py1)/2,zM+dep/2,mid.r,"slider");
   // Real brush seals on the two planes, not painted-on marks.
   for(const [n,x,host] of [["left-brush",x0+panelW-.010,left.r],["right-brush",x1-panelW+.010,right.l]]){let p=box(n,"rubber","brush weatherstrip",x-.005,x+.005,py0,py1,zF-dep/2-.009,zF-dep/2);tie(p,host);}
  }else{
   const mid=(x0+x1)/2,bar=.045,split=y0+(y1-y0)*.64;
   let v=box("central-mullion",mat,"steel mullion",mid-bar/2,mid+bar/2,y0,y1,-.043,.043);tie(v,f.bot);tie(v,f.top);
   const banks=[[x0,mid-bar/2],[mid+bar/2,x1]];
   for(let i=0;i<2;i++){
    let [a,b]=banks[i],j="bank-"+i,side=i?f.r:f.l;
    let tr=box(j+"-transom",mat,"steel transom",a,b,split-bar/2,split+bar/2,-.043,.043);tie(tr,v);tie(tr,side);
    // lower fixed grid: true independent glass cells with glazing beads.
    let lo=ring(j+"-lower",mat,"fixed steel sash",a,b,y0,split-bar/2,-.032,.032,.038);tie(lo.bot,f.bot);tie(lo.top,tr);tie(lo.l,i?v:f.l);tie(lo.r,i?f.r:v);
    let cx=(lo.x0+lo.x1)/2,cy=(lo.y0+lo.y1)/2,gr=.027;
    let mv=box(j+"-lower-vertical",mat,"muntin",cx-gr/2,cx+gr/2,lo.y0,lo.y1,-.027,.027);tie(mv,lo.bot);tie(mv,lo.top);
    for(let c=0;c<2;c++){let xa=c?cx+gr/2:lo.x0,xb=c?lo.x1:cx-gr/2;let mh=box(j+"-lower-horizontal-"+c,mat,"muntin",xa,xb,cy-gr/2,cy+gr/2,-.027,.027);tie(mh,mv);tie(mh,c?lo.r:lo.l);
     for(let r=0;r<2;r++)pane(j+"-lower-"+c+"-"+r,xa,xb,r?cy+gr/2:lo.y0,r?lo.y1:cy-gr/2,0,.005,null,{l:c?mv:lo.l,r:c?lo.r:mv,bot:r?mh:lo.bot,top:r?lo.top:mh},.008);}
    let motion=j+"-awning",u0=split+bar/2+.003,u1=y1-.003;
    let up=ring(j+"-upper",mat,"awning sash",a+.003,b-.003,u0,u1,-.029,.029,.039,motion);
    let ux=(up.x0+up.x1)/2,um=box(j+"-upper-muntin",mat,"muntin",ux-.0135,ux+.0135,up.y0,up.y1,-.025,.025,motion);tie(um,up.bot);tie(um,up.top);
    pane(j+"-upper-left",up.x0,ux-.0135,up.y0,up.y1,0,.005,motion,{l:up.l,r:um,bot:up.bot,top:up.top},.008);pane(j+"-upper-right",ux+.0135,up.x1,up.y0,up.y1,0,.005,motion,{l:um,r:up.r,bot:up.bot,top:up.top},.008);
    m.motions.push({id:motion,kind:"rotate",axis:"x",pivot:[0,y1,-.034],max:.57,label:"Abrir basculantes"});
    for(const x of [a+.14,b-.14]){let n=j+"-hinge-"+x,fp=box(n+"-fixed","hardware","hinge plate",x-.038,x+.038,y1,y1+.024,-.039,-.029);tie(fp,f.top);let mp=box(n+"-moving","hardware","hinge plate",x-.038,x+.038,u1-.025,u1,-.039,-.029,motion);tie(mp,up.top);let pin=rod(n+"-pin","hardware","hinge barrel",[x-.040,y1,-.034],[x+.040,y1,-.034],.006);tie(pin,fp);tie(mp,pin);}
    handle(j+"-latch",(a+b)/2,u0+.020,.029,up.bot,motion,false);
   }
  }
  // Derive contact probes from physical mesh bounds. The existing relational inspector
  // subsequently resolves each probe against actual triangles. No fabricated anchors.
  const bb=new Map(m.parts.map(p=>[p.name,bounds(p)]));
  function rel(a,b,reason){
   if(!bb.has(a)||!bb.has(b)||a===b)return;const A=bb.get(a),C=bb.get(b);
   const candidates=[];
   for(let k=0;k<3;k++)for(const sign of [-1,1]){
    const edgeA=sign===1?A.hi[k]:A.lo[k],edgeB=sign===1?C.lo[k]:C.hi[k],gap=sign*(edgeB-edgeA);
    const others=[0,1,2].filter(j=>j!==k);if(others.some(j=>Math.min(A.hi[j],C.hi[j])-Math.max(A.lo[j],C.lo[j])<.00015))continue;
    if(gap<-.025||gap>.002)continue;
    let seed=[0,0,0];seed[k]=(edgeA+edgeB)/2;for(const j of others)seed[j]=(Math.max(A.lo[j],C.lo[j])+Math.min(A.hi[j],C.hi[j]))/2;
    let axis=[0,0,0];axis[k]=sign;candidates.push({seed,axis,gap});
   }
   candidates.sort((a,b)=>Math.abs(a.gap)-Math.abs(b.gap));const q=candidates[0];if(!q)return;
   let type=q.gap>=-.002?"CONTACTO":"JUNTA_VISIBLE", min=type==="CONTACTO"?-.002:-.025,max=type==="CONTACTO"?.002:.002;
   m.relations.push({id:a+"→"+b,guest:a,host:b,type,min,max,reason,probes:[{seed:q.seed,axis:q.axis,reach:.045}]});
  }
  const used=new Set();for(const [a,b,r] of hints){let key=[a,b].sort().join("|");if(!used.has(key)){used.add(key);rel(a,b,r);}}
  // Secondary contact edges join real adjoining pieces only (not distant AABB pairs).
  for(const a of m.parts)for(const b of m.parts){if(a.name>=b.name||a.context||b.context)continue;const k=[a.name,b.name].sort().join("|");if(used.has(k))continue;const A=bb.get(a.name),C=bb.get(b.name);let gaps=[0,1,2].map(i=>Math.max(A.lo[i]-C.hi[i],C.lo[i]-A.hi[i]));if(gaps.some(g=>g>.0001)||!gaps.some(g=>Math.abs(g)<.0001))continue;used.add(k);rel(a.name,b.name,"Contacto geométrico de perfiles");}
  return m;
 }
 return {designs,build,bounds};
}
const api=windowLibrary(builder);export const {designs,build,bounds}=api;
