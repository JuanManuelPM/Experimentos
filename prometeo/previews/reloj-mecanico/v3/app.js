/* PROMETEO 3D / Horologium V3 · native WebGL2 continuity with V1 · original source MIT
   Involute teaching gear train with animated ribbon springs; not a certified timepiece. Self contained; no CDN, no compressed runtime.
*/
(()=>{'use strict';
const TAU=Math.PI*2, rad=Math.PI/180, Q=(s)=>document.querySelector(s), canvas=Q('#view'), overlay=Q('#overlay');
let gl=null;
const failure=(kind,detail)=>{overlay.classList.add('show');Q('#errorText').textContent=({WEBGL_CONTEXT:'Este dispositivo no pudo iniciar WebGL2.',SHADER_COMPILE:'No fue posible preparar los materiales 3D.',RUNTIME:'Se produjo un error al construir el reloj.',CONTEXT_LOST:'El dispositivo perdió el contexto gráfico.'})[kind]||'No se pudo abrir el reloj.';Q('#errorDetail').textContent=kind+' · '+detail;window.__horologiumError={kind,detail};};
try{gl=canvas.getContext('webgl2',{alpha:false,antialias:true,depth:true,stencil:false,preserveDrawingBuffer:false,powerPreference:'high-performance'});}catch(e){failure('WEBGL_CONTEXT',e.message)}
if(!gl){if(!overlay.classList.contains('show'))failure('WEBGL_CONTEXT','WebGL2 no está disponible en este navegador.');return;}
canvas.addEventListener('webglcontextlost',ev=>{ev.preventDefault();failure('CONTEXT_LOST','Reabrí la página para reiniciar la visualización.');});
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),mix=(a,b,t)=>a+(b-a)*t, ease=t=>t*t*(3-2*t), smooth=(a,b,t)=>ease(clamp((t-a)/(b-a),0,1));
const V=(x=0,y=0,z=0)=>[x,y,z],add=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm=a=>{const s=Math.hypot(...a)||1;return a.map(x=>x/s)};
const C={gold:[.88,.70,.37],goldLight:[.97,.85,.56],brass:[.69,.46,.20],brassDeep:[.39,.28,.15],bronze:[.55,.33,.17],steel:[.70,.74,.73],steelDark:[.32,.36,.39],ink:[.13,.16,.16],enamel:[.88,.84,.70],ivory:[.96,.89,.74],burgundy:[.20,.085,.085],leather:[.16,.075,.052],wood:[.22,.12,.073],woodDark:[.105,.060,.044],shadow:[.045,.052,.047],jade:[.18,.39,.35],ruby:[.61,.085,.11],cream:[.82,.72,.50]};
const parts=[],byName={};let triangles=0;
class Part{
 constructor(id,group='case',pos=[0,0,0],exploded=[0,0,0]){this.id=id;this.group=group;this.pos=pos;this.exploded=exploded;this.v=[];this.n=[];this.c=[];this.vertexCount=0;this.spin=0;this.phase=0;this.angle=0;this.transparent=false;parts.push(this);byName[id]=this;}
 tri(a,b,c,color){const n=norm(cross(sub(b,a),sub(c,a)));for(const x of [a,b,c]){this.v.push(...x);this.n.push(...n);this.c.push(...color)}triangles++;}
 quad(a,b,c,d,color){this.tri(a,b,c,color);this.tri(a,c,d,color)}
}
function part(id,group,pos,explode){return new Part(id,group,pos,explode)}
function cylinder(p,r,z,t,color,n=64){let z0=z-t/2,z1=z+t/2;for(let i=0;i<n;i++){let a=TAU*i/n,b=TAU*(i+1)/n;let A=V(r*Math.cos(a),r*Math.sin(a),z1),B=V(r*Math.cos(b),r*Math.sin(b),z1),D=V(A[0],A[1],z0),E=V(B[0],B[1],z0);p.tri(V(0,0,z1),A,B,color);p.tri(V(0,0,z0),E,D,color);p.quad(A,D,E,B,color);}}
function ring(p,r0,r1,z,t,color,n=100,start=0,end=TAU){let z0=z-t/2,z1=z+t/2;for(let i=0;i<n;i++){let a=mix(start,end,i/n),b=mix(start,end,(i+1)/n);let u=V(r1*Math.cos(a),r1*Math.sin(a),z1),v=V(r1*Math.cos(b),r1*Math.sin(b),z1),w=V(r0*Math.cos(a),r0*Math.sin(a),z1),x=V(r0*Math.cos(b),r0*Math.sin(b),z1);let ub=V(u[0],u[1],z0),vb=V(v[0],v[1],z0),wb=V(w[0],w[1],z0),xb=V(x[0],x[1],z0);p.quad(w,u,v,x,color);p.quad(xb,vb,ub,wb,color);p.quad(u,ub,vb,v,color);p.quad(wb,w,x,xb,color);if(i===0)p.quad(wb,ub,u,w,color);if(i===n-1)p.quad(x,xb,vb,v,color);}}
function box(p,x,y,z,w,h,d,col){const a=V(x-w/2,y-h/2,z-d/2),b=V(x+w/2,y+h/2,z+d/2);let v=[V(a[0],a[1],a[2]),V(b[0],a[1],a[2]),V(b[0],b[1],a[2]),V(a[0],b[1],a[2]),V(a[0],a[1],b[2]),V(b[0],a[1],b[2]),V(b[0],b[1],b[2]),V(a[0],b[1],b[2])];for(const [a,b,c,d] of [[0,3,2,1],[4,5,6,7],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]])p.quad(v[a],v[b],v[c],v[d],col);}
function tube(p,path,r,col,segments=8){for(let i=0;i<path.length-1;i++){let a=path[i],b=path[i+1],t=norm(sub(b,a));const zdir=Math.abs(t[2])>.92?V(0,1,0):V(0,0,1),u=norm(cross(t,zdir)),v=norm(cross(t,u));const coords=(center,q)=>add(center,add(u.map(z=>z*r*Math.cos(q)),v.map(z=>z*r*Math.sin(q))));for(let j=0;j<segments;j++){let q=j*TAU/segments,w=(j+1)*TAU/segments;p.quad(coords(a,q),coords(b,q),coords(b,w),coords(a,w),col)}}}
function curve(p,r,z,col,width=.022,from=0,to=TAU,n=96,center=[0,0]){let path=[];for(let i=0;i<=n;i++){const a=mix(from,to,i/n);path.push([center[0]+r*Math.cos(a),center[1]+r*Math.sin(a),z]);}tube(p,path,width,col,6);}
function line(p,a,b,w,col){tube(p,[a,b],w,col,6)}
function jewel(p,x,y,z,r=.10){const j=part('jewel-'+(parts.length),'movement',[x,y,0],[.28*Math.cos(x*5),.28*Math.sin(y*5),.9]);cylinder(j,r,z,.10,C.ruby,16);ring(j,r*.85,r*1.30,z+.06,.05,C.goldLight,24);}
function gear(p,teeth,module,z,color,spokes=5,phase=0){
 const pitch=teeth*module/2,root=pitch-module*1.12,tip=pitch+module*.82,base=pitch*Math.cos(20*rad),internal=root*.72,step=TAU/teeth,outline=[];
 const inv=t=>Math.tan(t)-t,half=r=>Math.PI/(2*teeth)-.018*step+inv(20*rad)-inv(Math.acos(Math.min(1,base/r)));
 for(let k=0;k<teeth;k++){let center=k*step+phase;const push=(a,r)=>outline.push([r*Math.cos(a),r*Math.sin(a),a]);push(center-step/2,root);push(center-half(Math.max(root,base)),root);
 for(let j=0;j<=5;j++){let r=mix(Math.max(root,base),tip,j/5);push(center-half(r),r)}for(let j=5;j>=0;j--){let r=mix(Math.max(root,base),tip,j/5);push(center+half(r),r)}push(center+half(Math.max(root,base)),root);}
 const top=z+.066,bot=z-.066;for(let i=0;i<outline.length;i++){let j=(i+1)%outline.length,[x1,y1,a]=outline[i],[x2,y2,b]=outline[j];if(j===0)b=outline[0][2]+TAU;let q=V(x1,y1,top),r=V(x2,y2,top),s=V(internal*Math.cos(a),internal*Math.sin(a),top),t=V(internal*Math.cos(b),internal*Math.sin(b),top);p.quad(s,q,r,t,color);p.quad(V(t[0],t[1],bot),V(r[0],r[1],bot),V(q[0],q[1],bot),V(s[0],s[1],bot),color);p.quad(q,V(x1,y1,bot),V(x2,y2,bot),r,color);p.quad(V(t[0],t[1],bot),t,s,V(s[0],s[1],bot),color);}
 ring(p,internal*.89,internal*1.025,z+.005,.145,C.goldLight,80);cylinder(p,.14,z,.19,C.brass,32);ring(p,.12,.20,z+.075,.075,C.goldLight,32);cylinder(p,.085,z+.12,.26,C.steel,24);
 for(let k=0;k<spokes;k++){let a=TAU*k/spokes;for(let j=0;j<8;j++){let r0=mix(.14,internal,j/8),r1=mix(.14,internal,(j+1)/8),w0=mix(.055,.10,j/8),w1=mix(.055,.10,(j+1)/8),point=(r,w,h)=>[r*Math.cos(a+r*.18)-w*Math.sin(a+r*.18),r*Math.sin(a+r*.18)+w*Math.cos(a+r*.18),h],A=point(r0,-w0,top-.014),B=point(r1,-w1,top-.014),D=point(r0,w0,top-.014),E=point(r1,w1,top-.014),lo=q=>[q[0],q[1],bot+.014];p.quad(A,B,E,D,color);p.quad(lo(D),lo(E),lo(B),lo(A),color);p.quad(lo(A),lo(B),B,A,color);p.quad(D,E,lo(E),lo(D),color);}}return{teeth,module,pitch,root,tip};}
function lathe(p,profile,col,n=160){for(let i=0;i<profile.length-1;i++)for(let j=0;j<n;j++){let a=TAU*j/n,b=TAU*(j+1)/n,[r,z]=profile[i],[s,t]=profile[i+1];p.quad([r*Math.cos(a),r*Math.sin(a),z],[r*Math.cos(b),r*Math.sin(b),z],[s*Math.cos(b),s*Math.sin(b),t],[s*Math.cos(a),s*Math.sin(a),t],col);}}
function ribbon(p,spec,wind=0){const {z,n,r0,r1,width,height,col}=spec;for(let i=0;i<180;i++){let f=i/180,g=(i+1)/180,point=(t,d,h)=>{let a=TAU*(n*t+wind*(1-t)*(1-t)),r=mix(r0,r1,t)+d;return [r*Math.cos(a),r*Math.sin(a),z+h]};let a=point(f,-width/2,-height/2),b=point(f,width/2,-height/2),c=point(g,width/2,-height/2),d=point(g,-width/2,-height/2),e=point(f,-width/2,height/2),f1=point(f,width/2,height/2),g1=point(g,width/2,height/2),h=point(g,-width/2,height/2);p.quad(e,f1,g1,h,col);p.quad(d,c,b,a,col);p.quad(a,e,h,d,col);p.quad(b,c,g1,f1,col);if(i===0)p.quad(a,b,f1,e,col);if(i===179)p.quad(d,h,g1,c,col);}}
function springPart(p,spec){p.springSpec=spec;ribbon(p,spec,0)}

function screw(p,x,y,z,r=.075){const q=part('screw-'+(parts.length),'support',[x,y,0],[0,0,.55]);cylinder(q,r,z,.09,C.steel,16);line(q,V(-r*.6,-r*.14,z+.051),V(r*.6,r*.14,z+.051),.014,C.ink);}
function romanNumerals(p,r,z){const font={I:[[[0,-.5],[0,.5]],[[-.15,-.5],[.15,-.5]],[[-.15,.5],[.15,.5]]],V:[[[-.28,.5],[0,-.5]],[[0,-.5],[.28,.5]]],X:[[[-.27,-.5],[.27,.5]],[[-.27,.5],[.27,-.5]]]};const chars=['XII','I','II','III','IIII','V','VI','VII','VIII','IX','X','XI'];for(let k=0;k<12;k++){let a=Math.PI/2-k*TAU/12,n=chars[k],scale=.29,step=.55*scale,ox=-(n.length-1)*step/2;for(let j=0;j<n.length;j++)for(const s of font[n[j]])tube(p,s.map(([x,y])=>[r*Math.cos(a)+ox+j*step+x*scale,r*Math.sin(a)+y*scale,z]),.012,C.ink,6);}}

function tickMarks(p,r,z){for(let i=0;i<60;i++){let a=Math.PI/2-i*TAU/60,outer=r,inner=r-(i%5===0?.24:.10),w=i%5===0?.020:.009;line(p,V(inner*Math.cos(a),inner*Math.sin(a),z),V(outer*Math.cos(a),outer*Math.sin(a),z),w,i%5===0?C.ink:C.brassDeep)}}
function spiral(p,cx,cy,z,n=4,r0=.10,r1=.80,width=.028,col=C.steel){let ar=[];for(let k=0;k<=280;k++){let f=k/280,a=f*TAU*n,r=mix(r0,r1,f);ar.push(V(cx+r*Math.cos(a),cy+r*Math.sin(a),z))}tube(p,ar,width,col,6)}
// ── Environment: real depth and scale, rather than a painted 2D void ──
let world=part('wooden-table','environment');box(world,-1.7,.3,-1.56,21,15,.55,C.wood);box(world,-1.7,.3,-1.89,21.1,15.1,.17,C.woodDark);
for(let i=0;i<12;i++){line(world,[-11+i*1.6,-7.1,-1.26],[-11+i*1.6,7.6,-1.26],.020,C.woodDark);}
for(let k=0;k<36;k++){let yy=-6+(k%12)*.95,xx=-10+Math.floor(k/12)*7;line(world,[xx,yy,-1.269],[xx+4.5,yy+.08,-1.269],.014,C.brassDeep)}
let velvet=part('velvet-cloth','environment');box(velvet,-1.1,.2,-1.18,13,10,.12,C.burgundy);ring(velvet,4.50,4.59,-1.09,.016,C.brassDeep,104);ring(velvet,4.62,4.65,-1.09,.016,C.gold,104);box(velvet,-1.1,.2,-1.24,12.8,9.8,.10,C.leather);
// ── Case and concentric turned-metal layers ──
let back=part('case-back','case',[0,0,0],[0,0,-1.45]);cylinder(back,3.03,-.60,.32,C.bronze,128);ring(back,2.80,3.18,-.46,.35,C.brassDeep,128);ring(back,3.08,3.19,-.31,.33,C.gold,128);ring(back,3.19,3.24,-.40,.21,C.goldLight,128);ring(back,3.10,3.18,-.22,.055,C.cream,128);
lathe(back,[[3.05,-.66],[3.18,-.61],[3.24,-.50],[3.27,-.37],[3.24,-.24],[3.18,-.16],[3.08,-.13]],C.gold,180);for(let k=0;k<180;k++){let a=k*TAU/180;line(back,[3.245*Math.cos(a),3.245*Math.sin(a),-.48],[3.245*Math.cos(a+.012),3.245*Math.sin(a+.012),-.25],.009,C.brassDeep)}
let enginePlate=part('engine-plate','plate',[0,0,0],[0,0,-.8]);cylinder(enginePlate,2.76,-.265,.09,C.steelDark,112);ring(enginePlate,2.48,2.69,-.19,.12,C.gold,112);ring(enginePlate,2.44,2.50,-.15,.065,C.bronze,112);
for(let k=0;k<12;k++){const a=k*TAU/12;let x=2.72*Math.cos(a),y=2.72*Math.sin(a);screw(enginePlate,x,y,-.08,.065)}
// ── Grounded barrel + mainspring ──
const bx=-1.45,by=-.65+Math.sqrt((44*.074/2)**2-.60**2);
const gearSpecs=[{id:'barrel-wheel-20',n:20,x:bx,y:by},{id:'great-wheel-24',n:24,x:-.85,y:-.65},{id:'center-wheel-18',n:18,x:.704,y:-.65},{id:'third-wheel-12',n:12,x:.704,y:.46},{id:'fourth-wheel-10',n:10,x:1.518,y:.46},{id:'escapement-wheel',n:15,x:1.518,y:1.385}];
const gearColors=[C.brass,C.gold,C.brass,C.goldLight,C.brass,C.steel];
for(let i=0;i<gearSpecs.length;i++){let g=gearSpecs[i],p=part(g.id,i===5?'escapement':'gear',[g.x,g.y,.13],[(g.x-.15)*.72,g.y*.72,1.0+i*.48]);gear(p,g.n,.074,0,gearColors[i],i===0?6:5);}
let barrel=part('mainspring-barrel','movement',[bx,by,0],[-2.65,1.05,1.25]);cylinder(barrel,.635,-.015,.12,C.brassDeep,100);ring(barrel,.59,.65,.18,.33,C.gold,96);ring(barrel,.58,.66,.35,.06,C.goldLight,100);cylinder(barrel,.09,.19,.38,C.steel,32);
let spring=part('mainspring-coil','movement',[bx,by,0],[-2.85,1.20,2.55]);springPart(spring,{z:.29,n:5,r0:.10,r1:.57,width:.022,height:.10,col:C.steel});
for(const g of gearSpecs){let shaft=part('shaft-'+g.id,'support',[g.x,g.y,0],[0,0,.45]);cylinder(shaft,.064,.04,.71,C.steel,24);ring(shaft,.08,.13,.34,.08,C.brassDeep,28);jewel(shaft,g.x,g.y,.34,.061);}
let lever=part('pallet-fork','pallet',[.94,1.54,.29],[1.80,1.25,3.1]);line(lever,[.31,-.19,0],[.49,-.10,0],.049,C.steel);line(lever,[.31,.19,0],[.49,.10,0],.049,C.steel);line(lever,[.31,-.19,0],[-.30,0,0],.042,C.steel);line(lever,[.31,.19,0],[-.30,0,0],.042,C.steel);cylinder(lever,.09,0,.17,C.ruby,24);for(let y of [-.11,.11])box(lever,.48,y,.03,.10,.09,.11,C.ruby);
let balance=part('balance-wheel','balance',[.05,1.78,.32],[-.65,2.0,3.3]);lathe(balance,[[.58,-.053],[.68,-.053],[.71,-.025],[.71,.035],[.68,.063],[.58,.063],[.58,-.053]],C.goldLight,100);cylinder(balance,.10,0,.28,C.steel,32);for(let k=0;k<3;k++){let a=k*TAU/3;line(balance,[.09*Math.cos(a),.09*Math.sin(a),0],[.61*Math.cos(a),.61*Math.sin(a),0],.045,C.brass)}
for(let k=0;k<12;k++){let a=k*TAU/12;let x=.65*Math.cos(a),y=.65*Math.sin(a);box(balance,x,y,.055,.083,.083,.07,C.bronze)}
let hair=part('balance-hairspring','hairspring',[.05,1.78,.32],[-.82,2.18,4.02]);springPart(hair,{z:.14,n:4,r0:.085,r1:.40,width:.012,height:.058,col:C.steel});

// Bridges deliberately shaped as components, not a solitary flat disc.
let br=part('curved-upper-bridge','bridge',[-.08,.43,.40],[.2,0,3.45]);ring(br,.9,1.05,0,.12,C.gold,85,Math.PI*.15,Math.PI*.85);ring(br,1.60,1.67,0,.05,C.brass,70,Math.PI*.15,Math.PI*.83);line(br,[-1.08,.27,0],[1.05,.26,0],.095,C.brassDeep);ring(br,.08,.16,.08,.09,C.goldLight,25);
for(const [x,y] of [[-1.2,.55],[.95,.5]])screw(br,x,y,.45,.095);
let lowerBridge=part('lower-bridge','bridge',[-.05,-1.53,.41],[-.05,-1.0,3.1]);ring(lowerBridge,1.40,1.55,0,.09,C.bronze,82,3.55,5.85);line(lowerBridge,[-1.24,-.26,0],[1.2,-.26,0],.088,C.gold);for(let x of [-.85,.85])screw(lowerBridge,x,-.20,.48,.07);
// Fine radial engine turning on backplate (concentric toolmarks, not random identical noise).
let engraving=part('turning','plate',[0,0,0],[0,0,-1]);for(let k=0;k<9;k++)ring(engraving,1.8+.055*k,1.81+.055*k,-.18,.009,k%2?C.brassDeep:C.steelDark,96);
// ── Dial: a real open center, with metal ring and ivory roman numeral annulus ──
let dial=part('enamel-dial','dial',[0,0,0],[0,0,4.2]);ring(dial,1.75,2.85,.70,.075,C.enamel,128);ring(dial,2.79,2.96,.76,.11,C.goldLight,128);ring(dial,1.68,1.77,.76,.08,C.brass,128);ring(dial,2.97,3.05,.73,.05,C.bronze,128);tickMarks(dial,2.73,.753);romanNumerals(dial,2.28,.755);ring(dial,2.54,2.56,.751,.014,C.brass,144);ring(dial,1.85,1.87,.751,.014,C.brass,144);for(let k=0;k<12;k++){let a=k*TAU/12,x=2.60*Math.cos(a),y=2.60*Math.sin(a);line(dial,[x-.015,y,.763],[x+.015,y,.763],.012,C.gold);}
let inset=part('dial-inset','dial',[0,0,0],[0,0,3.8]);ring(inset,.15,.31,.75,.08,C.ivory,40);ring(inset,1.63,1.68,.74,.07,C.goldLight,100);
// Hands: tapered diamond-ribbon solids rather than plain rectangles.
function hand(p,length,width,z,col,tail=.26){const points=[V(-width*.6,-tail,z),V(width*.6,-tail,z),V(width*.58,length*.66,z),V(0,length,z),V(-width*.58,length*.66,z)];for(let i=1;i<points.length-1;i++)p.tri(points[0],points[i],points[i+1],col);for(let j=0;j<points.length;j++){const a=points[j],b=points[(j+1)%points.length];p.quad(a,b,V(b[0],b[1],z-.040),V(a[0],a[1],z-.040),col)}ring(p,.065,.11,z+.015,.07,C.goldLight,18);}
let hour=part('hour-hand','hand',[0,0,0],[0,0,5]);hand(hour,1.36,.19,.93,C.steelDark,.24);
let minute=part('minute-hand','hand',[0,0,0],[0,0,5.45]);hand(minute,2.02,.13,1.00,C.steel,.26);
let seconds=part('second-hand','hand',[0,0,0],[0,0,5.83]);hand(seconds,2.29,.043,1.08,C.gold,.37);
let central=part('hand-hub','hand',[0,0,0],[0,0,5.90]);cylinder(central,.14,1.14,.08,C.goldLight,26);cylinder(central,.058,1.21,.10,C.brassDeep,20);
// Delicate crystal with a real open aperture: transparent center omitted intentionally for visibility of mechanism.
let crystal=part('crystal-bezel','crystal',[0,0,0],[0,0,6.65]);ring(crystal,3.05,3.13,.98,.065,C.goldLight,128);ring(crystal,2.94,2.97,1.02,.035,C.steel,128);curve(crystal,2.84,1.05,C.steel,.012,-.55,1.18,64);
// Crown / bow at 12 and knurling.
let crown=part('winding-crown','case',[0,3.30,-.31],[0,1.65,1.50]);lathe(crown,[[0,-.22],[.16,-.22],[.25,-.16],[.30,-.08],[.30,.18],[.25,.24],[.10,.29],[0,.29]],C.goldLight,96);
for(let j=0;j<32;j++){let a=j*TAU/32;line(crown,[.295*Math.cos(a),.295*Math.sin(a),-.07],[.295*Math.cos(a),.295*Math.sin(a),.17],.013,C.brassDeep);}
for(let i=0;i<crown.v.length;i+=3){let y=crown.v[i+1],z=crown.v[i+2];crown.v[i+1]=z;crown.v[i+2]=-y;let ny=crown.n[i+1],nz=crown.n[i+2];crown.n[i+1]=nz;crown.n[i+2]=-ny;}
let bow=part('bow','case',[0,3.92,-.26],[0,1.75,1.65]);ring(bow,.31,.395,0,.105,C.goldLight,80);

// ── Hinged inner cover: separate open metalwork and radial engraved pattern ──
let lid=part('hinged-lid','lid',[-5.56,.15,-.52],[-1.80,.35,-1.20]);cylinder(lid,2.96,-.22,.15,C.brassDeep,96);ring(lid,2.68,3.01,-.10,.15,C.gold,110);ring(lid,2.50,2.61,-.01,.08,C.goldLight,100);ring(lid,.37,.50,-.01,.11,C.gold,56);for(let k=0;k<12;k++){let a=k*TAU/12;line(lid,[.50*Math.cos(a),.50*Math.sin(a),0],[2.4*Math.cos(a),2.4*Math.sin(a),0],.025,C.goldLight)}for(let k=0;k<5;k++)ring(lid,1.00+k*.30,1.008+k*.30,.02,.017,C.cream,90);for(let k=0;k<36;k++){let a=k*TAU/36,path=[];for(let j=0;j<=25;j++){let r=.54+j/25*1.89,t=a+.12*Math.sin(j/25*Math.PI*3);path.push([r*Math.cos(t),r*Math.sin(t),.021])}tube(lid,path,.007,C.brass,5);}
let hinge=part('hinge-barrels','lid',[-3.15,.04,-.55],[-.80,.4,-.5]);box(hinge,0,0,.0,.48,.82,.18,C.brass);for(let k=-1;k<=1;k++){let b=part('hinge-pin-'+k,'lid',[-3.15,k*.21,-.55],[-.8,.4,-.5]);cylinder(b,.09,0,.27,C.gold,22)}
// Contact shadows physically positioned on tabletop (opaque dark layers instead of claimed ray-traced shadows).
let shadow=part('contact-shadow','environment',[-.7,.0,-.99],[0,0,0]);for(let j=0;j<14;j++){let r=2.84+j*.046,col=C.burgundy.map((v,i)=>mix(C.shadow[i],v,j/13));ring(shadow,r,r+.051,-.006-j*.0001,.009,col,96);}cylinder(shadow,2.84,-.01,.018,C.shadow,96);
// Additional loose watchmaker tools and lacquered case around the hero, using 3D meshes.
let tool=part('screwdriver','environment',[4.75,-2.75,-.92],[0,0,0]);box(tool,0,0,0,.25,2.05,.25,C.woodDark);for(let k=0;k<9;k++)box(tool,0,-.89+k*.19,.13,.26,.026,.025,C.brassDeep);box(tool,0,1.16,.02,.10,.48,.11,C.steel);ring(tool,.10,.17,-.06,.05,C.gold,24);
let tweezer=part('tweezers','environment',[5.2,1.9,-.97],[0,0,0]);line(tweezer,[-.22,-1.12,0],[-.07,1.00,0],.033,C.steel);line(tweezer,[.20,-1.12,0],[-.07,1.00,0],.033,C.steel);
// ── Minimal existing native-WebGL continuity, extended for lit mesh batches ──
function shader(type,code){const s=gl.createShader(type);gl.shaderSource(s,code);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error('SHADER_COMPILE:'+gl.getShaderInfoLog(s));return s;}
let program;try{
program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,`#version 300 es
precision highp float;
in vec3 aPosition;in vec3 aNormal;in vec3 aColor;
uniform mat4 uMVP;uniform mat4 uModel;
out vec3 vNormal;out vec3 vColor;out vec3 vPosition;
void main(){vec4 p=uModel*vec4(aPosition,1.0);vPosition=p.xyz;vNormal=normalize(mat3(uModel)*aNormal);vColor=aColor;gl_Position=uMVP*vec4(aPosition,1.0);}
`));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,`#version 300 es
precision highp float;
in vec3 vNormal;in vec3 vColor;in vec3 vPosition;uniform vec3 uEye;uniform vec3 uSurface;out vec4 pixel;
void main(){vec3 n=normalize(vNormal);if(!gl_FrontFacing)n=-n;vec3 v=normalize(uEye-vPosition);vec3 key=normalize(vec3(-.65,-.40,1.0)),fill=normalize(vec3(.65,.4,.45));float k=max(dot(n,key),0.),f=max(dot(n,fill),0.);vec3 h=normalize(key+v),hf=normalize(fill+v);float metal=uSurface.x,rough=uSurface.y;
vec3 base=vColor;float grain=sin(vPosition.x*61.+sin(vPosition.y*4.)*1.8)*sin(vPosition.x*17.8+vPosition.y*.3);if(uSurface.z>0.5)base*=.86+.14*grain;else if(metal>.5)base*=.97+.03*sin(length(vPosition.xy)*145.);
vec3 refl=reflect(-v,n);float stripe=pow(max(0.,dot(refl,normalize(vec3(-.6,-.45,.7)))),8.)+.65*pow(max(0.,dot(refl,normalize(vec3(.7,.2,.9)))),17.);float spec=pow(max(dot(n,h),0.),mix(90.,12.,rough))+.38*pow(max(dot(n,hf),0.),25.);float edge=pow(1.-abs(dot(n,v)),4.);
vec3 val=base*(.29+.73*k+.23*f)*(1.-.22*metal)+mix(vec3(.93),base,metal)*(.50*spec+.37*stripe*metal)+vec3(.23,.32,.37)*edge*.22;val=val/(val+vec3(.43));pixel=vec4(pow(val,vec3(.86)),1.);

}`));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('SHADER_COMPILE:'+gl.getProgramInfoLog(program));
}catch(e){failure('SHADER_COMPILE',e.message);return;}
const attrs={position:gl.getAttribLocation(program,'aPosition'),normal:gl.getAttribLocation(program,'aNormal'),color:gl.getAttribLocation(program,'aColor')};const uniforms={mvp:gl.getUniformLocation(program,'uMVP'),model:gl.getUniformLocation(program,'uModel'),eye:gl.getUniformLocation(program,'uEye'),surface:gl.getUniformLocation(program,'uSurface')};
for(const p of parts){p.vertexCount=p.v.length/3;p.buffers={};if(!p.vertexCount)continue;const vao=gl.createVertexArray();gl.bindVertexArray(vao);for(const [name,data] of [['position',p.v],['normal',p.n],['color',p.c]]){const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);p.buffers[name]=b;gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),p.springSpec?gl.DYNAMIC_DRAW:gl.STATIC_DRAW);gl.enableVertexAttribArray(attrs[name]);gl.vertexAttribPointer(attrs[name],3,gl.FLOAT,false,0,0);}p.vao=vao;delete p.v;delete p.n;delete p.c;}
function updateRibbon(p,wind){if(Math.abs((p.lastWind??99)-wind)<.006)return;p.lastWind=wind;let temp={v:[],n:[],c:[],tri:Part.prototype.tri,quad:Part.prototype.quad};let saved=triangles;ribbon(temp,p.springSpec,wind);triangles=saved;for(const [k,a] of [['position',temp.v],['normal',temp.n]]){gl.bindBuffer(gl.ARRAY_BUFFER,p.buffers[k]);gl.bufferSubData(gl.ARRAY_BUFFER,0,new Float32Array(a));}}
gl.bindVertexArray(null);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);gl.clearColor(.037,.040,.034,1);gl.useProgram(program);
function mm(a,b){let out=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++){let x=0;for(let k=0;k<4;k++)x+=a[k*4+r]*b[c*4+k];out[c*4+r]=x;}return out;}
function model(pos,theta){const c=Math.cos(theta),s=Math.sin(theta);return new Float32Array([c,s,0,0,-s,c,0,0,0,0,1,0,pos[0],pos[1],pos[2],1]);}
function view(eye,target){let f=norm(sub(target,eye)),r=norm(cross(f,V(0,0,1))),u=norm(cross(r,f));return new Float32Array([r[0],u[0],-f[0],0,r[1],u[1],-f[1],0,r[2],u[2],-f[2],0,-dot(r,eye),-dot(u,eye),dot(f,eye),1]);}
function projection(fov,aspect,n=.20,f=100){let x=1/Math.tan(fov/2);return new Float32Array([x/aspect,0,0,0,0,x,0,0,0,0,(f+n)/(n-f),-1,0,0,2*f*n/(n-f),0]);}
let mode='whole',paused=false,amount=0,targetAmount=0,yaw=-1.38,elevation=1.06,dist=17.6,tx=-1.65,ty=.15,tz=.10,manualCam=false,last=performance.now(),elapsed=0,animationTime=0,viewIndex=0,inside=0,insideTarget=0;
const modes={whole:{target:0,inside:0,dist:17.6,x:-1.65,y:.15,z:.1,yaw:-1.38,e:1.06,label:'RELOJ'},inner:{target:0,inside:1,dist:10.0,x:.07,y:.36,z:.1,yaw:-1.55,e:1.35,label:'MECANISMO'},explode:{target:1,inside:0,dist:17.8,x:-.7,y:.1,z:2.4,yaw:-1.04,e:.69,label:'DESPIECE'},assemble:{target:0,inside:0,dist:17.6,x:-1.65,y:.15,z:.1,yaw:-1.38,e:1.06,label:'MONTAJE'},tour:{target:0,inside:0,dist:17.6,x:-1.65,y:.15,z:.1,yaw:-1.38,e:1.06,label:'RECORRIDO'}};
let camGoal=modes.whole;
function setMode(name){if(!modes[name])return;mode=name;manualCam=false;animationTime=0;camGoal=modes[name];targetAmount=camGoal.target;insideTarget=camGoal.inside;Q('#beat').textContent=camGoal.label;Q('.seek').classList.toggle('visible',name!=='whole');Q('.seek').classList.toggle('caption-only',name==='tour'||name==='inner');for(const b of document.querySelectorAll('[data-mode]'))b.classList.toggle('selected',b.dataset.mode===name);}
for(const b of document.querySelectorAll('[data-mode]'))b.addEventListener('click',()=>setMode(b.dataset.mode));
Q('#play').onclick=()=>{paused=!paused;Q('#play').textContent=paused?'▶':'Ⅱ';Q('#play').setAttribute('aria-label',paused?'Reproducir':'Pausar');Q('#play').classList.toggle('selected',!paused)};
const presets=[modes.whole,modes.inner,{...modes.inner,dist:6.3,x:-1.40,y:.90,e:1.30,label:'RESORTE REAL'},{...modes.inner,dist:6.0,x:1.02,y:1.30,e:1.15,label:'ESCAPE Y VOLANTE'}];
Q('#camera').onclick=()=>{let preset=presets[++viewIndex%presets.length];setMode(preset.inside?'inner':'whole');camGoal=preset;insideTarget=preset.inside;Q('#beat').textContent=preset.label;};
Q('#home').onclick=()=>{viewIndex=0;setMode('whole')};
const pointers=new Map();let dragDistance=0;
canvas.addEventListener('pointerdown',ev=>{if(!pointers.size)dragDistance=0;pointers.set(ev.pointerId,[ev.clientX,ev.clientY]);canvas.setPointerCapture(ev.pointerId);});
canvas.addEventListener('pointermove',ev=>{let old=pointers.get(ev.pointerId);if(!old)return;let next=[ev.clientX,ev.clientY],dx=next[0]-old[0],dy=next[1]-old[1];let other=[...pointers.entries()].find(([id])=>id!==ev.pointerId);pointers.set(ev.pointerId,next);dragDistance+=Math.hypot(dx,dy);if(dragDistance<4)return;manualCam=true;
if(other){let a=Math.hypot(old[0]-other[1][0],old[1]-other[1][1]),b=Math.hypot(next[0]-other[1][0],next[1]-other[1][1]);if(a>3&&b>3)dist=clamp(dist*a/b,3.5,36);let r=[-Math.sin(yaw),Math.cos(yaw),0],u=[-Math.sin(elevation)*Math.cos(yaw),-Math.sin(elevation)*Math.sin(yaw),Math.cos(elevation)],k=dist/(canvas.clientHeight||1)*.39;tx+=(-r[0]*dx+u[0]*dy)*k;ty+=(-r[1]*dx+u[1]*dy)*k;tz=clamp(tz+u[2]*dy*k,-.1,7);}
else{yaw-=dx*.0058;elevation=clamp(elevation+dy*.0048,.18,1.53);}});
for(const e of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(e,ev=>pointers.delete(ev.pointerId));
canvas.addEventListener('wheel',ev=>{ev.preventDefault();dist=clamp(dist*Math.exp(ev.deltaY*.0011),3.5,36);manualCam=true},{passive:false});
Q('#explode').addEventListener('input',ev=>{amount=+ev.target.value/100;targetAmount=amount;insideTarget=0;mode='explode';manualCam=true;for(const b of document.querySelectorAll('[data-mode]'))b.classList.toggle('selected',b.dataset.mode==='explode');Q('#beat').textContent='DESPIECE';Q('#ratio').textContent=Math.round(amount*100)+'%';});
const phases=[0];for(let i=1;i<gearSpecs.length;i++){let a=gearSpecs[i-1],b=gearSpecs[i],theta=Math.atan2(b.y-a.y,b.x-a.x);phases.push(((a.n+b.n)*theta+b.n*Math.PI-Math.PI-a.n*phases[i-1])/b.n);}
const groupStart={crystal:0,hand:.06,dial:.16,bridge:.29,pallet:.36,balance:.36,hairspring:.38,escapement:.40,gear:.43,movement:.48,support:.54,plate:.61,case:.66,lid:.30};
function offset(p){if(p.group==='environment')return [0,0,0];let s=smooth(groupStart[p.group]??.45,1,amount),xyz=p.exploded.map(x=>x*s);if(p.group==='dial'||p.group==='hand'||p.group==='crystal'){let lift=smooth(0,.32,inside),shift=smooth(.25,1,inside);xyz[0]+=shift*(p.group==='crystal'?4.7:5.2);xyz[1]+=shift*(p.group==='crystal'?-.9:.25);xyz[2]+=lift*.85-shift*.57;}if(p.group==='lid')xyz[0]-=inside*.7;return xyz;}
const tourShots=[{t:0,c:modes.whole},{t:4,c:{...modes.inner,dist:6.7,x:-1.45,y:.85,e:1.35,label:'1 · RESORTE REAL'}},{t:9,c:{...modes.inner,dist:8.1,x:.25,y:-.25,e:1.37,label:'2 · TREN DE RUEDAS'}},{t:14,c:{...modes.inner,dist:6.0,x:.93,y:1.45,e:1.28,label:'3 · ESCAPE Y VOLANTE'}},{t:20,c:modes.explode},{t:28,c:modes.assemble},{t:34,c:modes.whole}];

const dynamic=()=>{let step=Math.floor(elapsed*5),drive=-step*TAU/20;
for(let i=0;i<gearSpecs.length;i++){let g=gearSpecs[i];byName[g.id].angle=phases[i]+drive*((i%2)?-1:1)*20/g.n;}
let osc=Math.sin(elapsed*TAU*2.5);byName['pallet-fork'].angle=osc*.13;byName['balance-wheel'].angle=osc*.70;
updateRibbon(spring,.16*Math.sin(elapsed*.28));updateRibbon(hair,osc*.10);
let sec=-elapsed*TAU/12;byName['hour-hand'].angle=sec/720+.58;byName['minute-hand'].angle=sec/60+1.20;byName['second-hand'].angle=sec;
};
function resize(){let dpr=Math.min(window.devicePixelRatio||1,1.65);let w=Math.max(1,Math.floor(canvas.clientWidth*dpr)),h=Math.max(1,Math.floor(canvas.clientHeight*dpr));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}return[w,h]}
function render(now){let dt=Math.min((now-last)/1000,.055);last=now;try{
 if(!paused){elapsed+=dt;animationTime+=dt;}dynamic();
 if(mode==='tour'&&!manualCam){let t=animationTime%38,shot=tourShots[0];for(const s of tourShots)if(t>=s.t)shot=s;camGoal=shot.c;targetAmount=camGoal.target;insideTarget=camGoal.inside;Q('#beat').textContent=camGoal.label;}
 let speed=mode==='assemble'?.68:.86;amount=mix(amount,targetAmount,1-Math.exp(-dt*speed*2.1));if(Math.abs(amount-targetAmount)<.001)amount=targetAmount;
 inside=mix(inside,insideTarget,1-Math.exp(-dt*2.8));if(Math.abs(inside-insideTarget)<.001)inside=insideTarget;
 if(!manualCam){let k=1-Math.exp(-dt*2.2);dist=mix(dist,camGoal.dist,k);tx=mix(tx,camGoal.x,k);ty=mix(ty,camGoal.y,k);tz=mix(tz,camGoal.z,k);yaw+=Math.atan2(Math.sin(camGoal.yaw-yaw),Math.cos(camGoal.yaw-yaw))*k;elevation=mix(elevation,camGoal.e,k);}
 Q('#explode').value=Math.round(amount*100);Q('#ratio').textContent=Math.round(amount*100)+'%';
 const [w,h]=resize(),aspect=w/h,scale=aspect<.9?Math.min(.9/aspect,2.3):1,eye=V(tx+Math.cos(yaw)*Math.cos(elevation)*dist*scale,ty+Math.sin(yaw)*Math.cos(elevation)*dist*scale,tz+Math.sin(elevation)*dist*scale);
 const vp=mm(projection(42*rad,aspect),view(eye,V(tx,ty,tz)));gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.uniform3fv(uniforms.eye,new Float32Array(eye));
 for(let p of parts){if(!p.vao||!p.vertexCount)continue;let xyz=add(p.pos,offset(p)),M=model(xyz,p.angle||0),surface=p.group==='environment'?[.07,.85,p.id==='wooden-table'?1:0]:p.group==='dial'?[.22,.56,0]:[.83,.29,0];
 gl.uniform3fv(uniforms.surface,new Float32Array(surface));gl.uniformMatrix4fv(uniforms.model,false,M);gl.uniformMatrix4fv(uniforms.mvp,false,mm(vp,M));gl.bindVertexArray(p.vao);gl.drawArrays(gl.TRIANGLES,0,p.vertexCount);}
 window.__horologiumDiagnostics={ready:true,renderer:'WebGL2',version:'V3',method:'prometeo-3d-production@2.2.1',parts:parts.length,triangles,gearTeeth:gearSpecs.map(g=>g.n),gearCenters:gearSpecs.map(g=>[g.x,g.y]),gearAngles:gearSpecs.map(g=>byName[g.id].angle),springWind:spring.lastWind,hairWind:hair.lastWind,mode,explosion:amount,inside,cam:[yaw,elevation,dist,tx,ty,tz],canvas:[w,h],frameTime:now};

 }catch(e){failure('RUNTIME',String(e.stack||e));return;}requestAnimationFrame(render);}
try{requestAnimationFrame(render);}catch(e){failure('RUNTIME',String(e))}
})();
