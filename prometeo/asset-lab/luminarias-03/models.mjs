import {shell,sweep,path,meshAnchor,anchoredSweep,inspectAssembly} from '../surface-gate/constructor.mjs';
import {surfaceGate} from '../surface-gate/surface-gate.mjs';
const U=[0,1,0],D=[0,-1,0],X=[1,0,0],Z=[0,0,1],N=[0,0,-1],T=2*Math.PI;
const obj=(id,name,root,light)=>({id,name,units:'m',up:'Y',parts:[],roots:[root],relations:[],protectedFaces:[],independent:[],light});
const add=(m,p)=>(m.parts.push(p),p);
const rod=(m,n,mat,a,b,r,s=32)=>add(m,sweep(n,mat,'hardware',[a,b],()=>[r,r],s));
const disk=(m,n,mat,x,z,y0,y1,r0,r1=r0,rz0=r0,rz1=r1,s=64)=>add(m,sweep(n,mat,'body',[[x,y0,z],[x,y1,z]],t=>[r0+(r1-r0)*t,rz0+(rz1-rz0)*t],s));
const prof=(m,n,mat,x,z,rows,s=72)=>add(m,sweep(n,mat,'body',rows.map(a=>[x,a[0],z]),(_,i)=>[rows[i][1],rows[i][2]??rows[i][1]],s));
const tube=(m,n,mat,pts,r,s=24)=>add(m,sweep(n,mat,'structure',pts,()=>[r,r],s));
const rel=(m,g,h,seed,axis,min=-.008,max=-.0002,reason='',type='ENCASTRE',reach=.12)=>m.relations.push({id:g.name+'→'+h.name,guest:g.name,host:h.name,type,min,max,reason,probes:[{seed,axis,reach}]});
const join=(m,g,h,seed,axis,reach=.12)=>rel(m,g,h,seed,axis,-.035,.001,'', 'ENCASTRE',reach); // replaced below by measured intended range
function bind(m,g,h,seed,axis,{min=-.025,max=-.00005,type='ENCASTRE',reason='',reach=.10}={}){rel(m,g,h,seed,axis,min,max,reason,type,reach);}
function contact(m,g,h,seed,axis,reach=.10){bind(m,g,h,seed,axis,{min:-.001,max:.001,type:'CONTACTO',reach});}
function shade(m,n,mat,x,z,y0,y1,r0,r1,th=.004,shape=0){
 const slope=(r1-r0)/(y1-y0),norm=Math.hypot(1,slope);
 return add(m,shell(n,mat,'shade',96,24,(u,v)=>{let a=T*u,r=r0+(r1-r0)*v+shape*Math.sin(Math.PI*v);let dr=slope+shape*Math.PI*Math.cos(Math.PI*v)/(y1-y0),l=Math.hypot(1,dr);return {p:[x+r*Math.cos(a),y0+(y1-y0)*v,z+r*Math.sin(a)],n:[Math.cos(a)/l,-dr/l,Math.sin(a)/l]};},th));
}
function bolt(m,n,x,z,y,host,r=.009){const b=disk(m,n,'steel',x,z,y-.003,y+.006,r,r,r,r,6);bind(m,b,host,[x,y,z],D,{min:-.008,max:-.0001,reach:.035});const slot=rod(m,n+'-slot','dark',[x-r*.62,y+.005,z],[x+r*.62,y+.005,z],r*.13,12);bind(m,slot,b,[x,y+.006,z],D,{min:-.004,max:-.0001,reach:.025});return b;}
function anchorTube(m,n,mat,start,host,seed,axis,depth,r){const q=anchoredSweep({name:n,material:mat,start,host,seed,axis,depth,radius:r,sides:48});add(m,q.part);bind(m,q.part,host,q.anchor.point,axis,{min:-depth-.002,max:-depth+.002,reach:.10});return q.part;}
function floorLamp(){
 const m=obj('01','UMBRAL · lámpara de pie','base',{position:[.29,1.28,0],target:[.29,.2,0],lumens:900,kelvin:2700,angle:.85,distance:4});
 const base=prof(m,'base','basalt',0,0,[[0,.175],[.009,.19],[.045,.19],[.058,.178]]);
 const pad=disk(m,'rubber-foot','rubber',0,0,-.004,.002,.166);bind(m,pad,base,[0,0,0],U,{min:-.004,max:-.0001});
 const foot=disk(m,'brass-socket','brass',0,0,.052,.106,.047);bind(m,foot,base,[0,.058,0],D);
 const stem=anchorTube(m,'stem','bronze',[0,1.34,0],foot,[0,.106,0],D,.012,.019);
 const crown=disk(m,'stem-cap','brass',0,0,1.325,1.37,.032);bind(m,stem,crown,[0,1.325,0],U);
 const arm=tube(m,'swept-arm','bronze',path([[[.012,1.347,0],[.14,1.347,0],[.28,1.39,0],[.29,1.44,0]]],24),.017,48);bind(m,arm,crown,[.032,1.347,0],[-1,0,0]);
 const head=disk(m,'head-socket','brass',.29,0,1.414,1.465,.043);bind(m,arm,head,[.29,1.414,0],U,{min:-.040,max:-.0001});
 const sh=shade(m,'spun-shade','copper',.29,0,1.19,1.44,.20,.041,.005,.028);
 bind(m,sh,head,[.328,1.435,0],[-1,0,0],{min:-.022,max:-.0001,reach:.045});
 const led=disk(m,'led-board','emitter',.29,0,1.405,1.418,.029);bind(m,led,head,[.29,1.414,0],U,{min:-.007,max:-.0001});
 const diffuser=disk(m,'opal-diffuser','opal',.29,0,1.195,1.203,.195);bind(m,diffuser,sh,[.483,1.199,0],X,{min:-.018,max:-.0001,reach:.035});
 for(let i=0;i<3;i++){let a=i*T/3;bolt(m,'socket-screw-'+i,.034*Math.cos(a),.034*Math.sin(a),.106,foot,.005);}
 const cable=tube(m,'power-cable','rubber',path([[[0,.026,-.178],[0,.018,-.24],[.04,.012,-.35],[.16,.012,-.43]],[[.16,.012,-.43],[.26,.012,-.50],[.42,.012,-.46],[.46,.012,-.58]]],18),.0035,16);bind(m,cable,base,[0,.026,-.19],Z,{min:-.022,max:-.0001,reach:.045});
 const plug=tube(m,'plug','rubber',[[.46,.012,-.574],[.46,.012,-.62]],.012,32);bind(m,cable,plug,[.46,.012,-.574],N,{min:-.015,max:-.0001,reach:.04});
 for(let x of [.454,.466]){const pin=rod(m,'plug-pin-'+x,'steel',[x,.012,-.617],[x,.012,-.638],.0017,16);bind(m,pin,plug,[x,.012,-.62],Z,{min:-.008,max:-.0001,reach:.025});}
 return m;
}
function pendant(){
 const m=obj('02','NÁCAR · colgante','canopy',{position:[0,1.81,0],target:[0,0,0],lumens:1200,kelvin:3000,angle:1.04,distance:5});
 const canopy=prof(m,'canopy','dark',0,0,[[2.63,.043],[2.64,.087],[2.69,.09],[2.70,.086]]);
 const relief=disk(m,'strain-relief','brass',0,0,2.60,2.65,.014);bind(m,relief,canopy,[0,2.63,0],U);
 const cable=anchorTube(m,'textile-cable','cloth',[0,2.045,0],relief,[0,2.60,0],U,.014,.005);
 const cap=prof(m,'upper-cap','brass',0,0,[[1.99,.066],[2.016,.068],[2.04,.031],[2.06,.021]]);bind(m,cable,cap,[0,2.06,0],D,{min:-.022,max:-.0001});
 const neck=disk(m,'ceramic-neck','ceramic',0,0,1.946,2.00,.050);bind(m,neck,cap,[0,1.99,0],U);
 const sh=shade(m,'ribbed-opal-bell','opal',0,0,1.72,1.98,.26,.049,.007,.052);bind(m,sh,neck,[.049,1.97,0],[-1,0,0],{min:-.025,max:-.0001,reach:.05});
 const led=disk(m,'led-module','emitter',0,0,1.935,1.95,.043);bind(m,led,neck,[0,1.946,0],U);
 const lens=disk(m,'lower-diffuser','opal',0,0,1.724,1.733,.255);bind(m,lens,sh,[.255,1.73,0],X,{min:-.025,max:-.0001,reach:.05});
 for(let i=0;i<18;i++){let a=i*T/18;let pts=Array.from({length:25},(_,j)=>{let v=j/24,r=.26+(.049-.26)*v+.052*Math.sin(Math.PI*v);return [(r-.0015)*Math.cos(a),1.72+.26*v,(r-.0015)*Math.sin(a)]});const rib=tube(m,'glass-flute-'+i,'opal',pts,.003,12);bind(m,rib,sh,[.213*Math.cos(a),1.85,.213*Math.sin(a)],[-Math.cos(a),0,-Math.sin(a)],{min:-.015,max:-.0001,reach:.07});}
 for(let i=0;i<3;i++){let a=i*T/3;bolt(m,'canopy-screw-'+i,.07*Math.cos(a),.07*Math.sin(a),2.70,canopy,.005);}
 return m;
}
function urban(){
 const m=obj('03','VÉRTICE · luminaria urbana','flange',{position:[.74,3.52,0],target:[.98,0,0],lumens:5800,kelvin:4000,angle:1.05,distance:12});
 const flange=prof(m,'flange','galvanized',0,0,[[0,.19],[.012,.215],[.035,.215],[.044,.20]]);
 const pole=prof(m,'tapered-pole','galvanized',0,0,[[.025,.097],[.18,.09],[2.5,.055],[3.43,.039],[3.52,.038]]);bind(m,pole,flange,[0,.044,0],D);
 for(let i=0;i<4;i++){let a=T*(i+.5)/4;bolt(m,'anchor-bolt-'+i,.158*Math.cos(a),.158*Math.sin(a),.044,flange,.018);}
 const top=disk(m,'pole-top','dark',0,0,3.50,3.57,.044);bind(m,top,pole,[0,3.52,0],D);
 const arm=tube(m,'curved-arm','galvanized',path([[[.022,3.51,0],[.15,3.58,0],[.39,3.69,0],[.55,3.66,0]]],24),.033,48);bind(m,arm,top,[.038,3.52,0],[-1,0,0],{min:-.04,max:-.0001});
 const mount=rod(m,'horizontal-spigot','dark',[.51,3.66,0],[.72,3.66,0],.044,48);bind(m,arm,mount,[.51,3.66,0],X);
 const body=prof(m,'die-cast-housing','dark',.82,0,[[3.55,.27,.122],[3.57,.29,.138],[3.63,.28,.13],[3.70,.19,.085],[3.715,.15,.065]],80);bind(m,mount,body,[.61,3.66,0],X,{min:-.14,max:-.0001,reach:.2});
 const bezel=prof(m,'lens-bezel','galvanized',.82,0,[[3.53,.266,.119],[3.551,.275,.125],[3.56,.275,.125]],80);bind(m,bezel,body,[.82,3.55,0],U);
 const lens=disk(m,'sealed-optical-lens','opal',.82,0,3.519,3.535,.246,.246,.103,.103,80);bind(m,lens,bezel,[.82,3.53,0],U);
 for(let i=0;i<7;i++){let x=.67+i*.05;const fin=rod(m,'cooling-fin-'+i,'dark',[x,3.69,-.068],[x,3.69,.068],.014,24);bind(m,fin,body,[x,3.70,0],D,{min:-.04,max:-.0001,reach:.07});}
 for(let i=0;i<4;i++){let a=T*(i+.5)/4;let x=.82+.22*Math.cos(a),z=.095*Math.sin(a);const b=disk(m,'bezel-screw-'+i,'steel',x,z,3.523,3.537,.007,.007,.007,.007,6);bind(m,b,bezel,[x,3.53,z],U);}
 const seal=rod(m,'access-cover','dark',[0,.45,.078],[0,.78,.070],.038,40);bind(m,seal,pole,[0,.6,.079],N,{min:-.06,max:-.0001});
 for(let y of [.48,.75]){const screw=rod(m,'access-screw-'+y,'steel',[0,y,.105],[0,y,.119],.007,6);bind(m,screw,seal,[0,y,.105],N,{min:-.015,max:-.0001});}
 const wire=tube(m,'internal-feed','rubber',[[0,.08,0],[0,3.49,0],[.52,3.66,0],[.76,3.66,0]],.006,16);bind(m,wire,body,[.6,3.66,0],X,{min:-.19,max:-.0001,reach:.24});
 return m;
}
export const designs=[['01','UMBRAL','Basalto, bronce patinado y cobre'],['02','NÁCAR','Vidrio opal estriado y latón'],['03','VÉRTICE','Acero galvanizado y aluminio fundido']];
export const models={'01':floorLamp,'02':pendant,'03':urban};
export function inspect(model){return inspectAssembly(model,{gate:surfaceGate});}
