/* PROMETEO 3D / Horologium V2 · native WebGL2 continuity with V1 · original source MIT
   Symbolic horology, not a physically certified timepiece. Self contained; no CDN, no compressed runtime.
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
function gear(p,teeth,module,z,color,spokes=5,phase=0){let pitch=teeth*module/2,root=pitch-module*.95,tip=pitch+module*.76,internal=root*.69,step=TAU/teeth,outline=[];for(let k=0;k<teeth;k++)for(let [f,r] of [[-.50,root],[-.32,root+module*.2],[-.18,tip], [.18,tip],[.32,root+module*.2],[.50,root]]){let a=(k+f)*step+phase;outline.push([r*Math.cos(a),r*Math.sin(a),a]);}
const top=z+.060,bot=z-.060;for(let i=0;i<outline.length;i++){let j=(i+1)%outline.length,[x1,y1,a]=outline[i],[x2,y2,b]=outline[j];if(j===0)b=outline[0][2]+TAU;let q=V(x1,y1,top),r=V(x2,y2,top),s=V(internal*Math.cos(a),internal*Math.sin(a),top),t=V(internal*Math.cos(b),internal*Math.sin(b),top);p.quad(s,q,r,t,color);p.quad(V(t[0],t[1],bot),V(r[0],r[1],bot),V(q[0],q[1],bot),V(s[0],s[1],bot),color);p.quad(q,V(x1,y1,bot),V(x2,y2,bot),r,color);p.quad(V(t[0],t[1],bot),t,s,V(s[0],s[1],bot),color);}
ring(p,internal*.87,internal*1.02,z,.105,C.goldLight,72);
ring(p,.15,.22,z+.02,.19,C.goldLight,32);
cylinder(p,.12,z+.13,.27,C.steel,24);
for(let k=0;k<spokes;k++){let a=(k+.2)*TAU/spokes;let u=V(Math.cos(a)*.18,Math.sin(a)*.18,z+.012),v=V(Math.cos(a)*internal*.94,Math.sin(a)*internal*.94,z+.012);tube(p,[u,v],.065,C.brassDeep,7);}
return{teeth,module,pitch,root,tip};}
function screw(p,x,y,z,r=.075){const q=part('screw-'+(parts.length),'support',[x,y,0],[0,0,.55]);cylinder(q,r,z,.09,C.steel,16);line(q,V(-r*.6,-r*.14,z+.051),V(r*.6,r*.14,z+.051),.014,C.ink);}
function romanNumerals(p,r,z){const font={I:[[[0,-.37],[0,.37]]],V:[[[-.28,.37],[0,-.37]],[[0,-.37],[.28,.37]]],X:[[[-.26,-.37],[.26,.37]],[[-.26,.37],[.26,-.37]]],L:[[[-.22,.37],[-.22,-.37]],[[-.22,-.37],[.24,-.37]]]};const chars=['XII','I','II','III','IV','V','VI','VII','VIII','IX','X','XI'];for(let k=0;k<12;k++){let a=Math.PI/2-k*TAU/12,n=chars[k],scale=n.length>3?.38:n.length>2?.43:.50,step=.39*scale,ox=-(n.length-1)*step/2,cy=Math.cos(a),sy=Math.sin(a);for(let j=0;j<n.length;j++){let strokes=font[n[j]]||font.I;for(let s of strokes){let path=s.map(([x,y])=>{let xx=(ox+j*step+x*scale)*.51, yy=y*scale*.50;let rx=r*cy+xx*cy-yy*sy,ry=r*sy+xx*sy+yy*cy;return [rx,ry,z]});tube(p,path,.022,C.ink,5)}}}}
function tickMarks(p,r,z){for(let i=0;i<60;i++){let a=Math.PI/2-i*TAU/60,outer=r,inner=r-(i%5===0?.24:.10),w=i%5===0?.020:.009;line(p,V(inner*Math.cos(a),inner*Math.sin(a),z),V(outer*Math.cos(a),outer*Math.sin(a),z),w,i%5===0?C.ink:C.brassDeep)}}
function spiral(p,cx,cy,z,n=4,r0=.10,r1=.80,width=.028,col=C.steel){let ar=[];for(let k=0;k<=280;k++){let f=k/280,a=f*TAU*n,r=mix(r0,r1,f);ar.push(V(cx+r*Math.cos(a),cy+r*Math.sin(a),z))}tube(p,ar,width,col,6)}
// ── Environment: real depth and scale, rather than a painted 2D void ──
let world=part('wooden-table','environment');box(world,-1.7,.3,-1.56,21,15,.55,C.wood);box(world,-1.7,.3,-1.89,21.1,15.1,.17,C.woodDark);
for(let i=0;i<12;i++){line(world,[-11+i*1.6,-7.1,-1.26],[-11+i*1.6,7.6,-1.26],.020,C.woodDark);}
for(let k=0;k<36;k++){let yy=-6+(k%12)*.95,xx=-10+Math.floor(k/12)*7;line(world,[xx,yy,-1.269],[xx+4.5,yy+.08,-1.269],.014,C.brassDeep)}
let velvet=part('velvet-cloth','environment');box(velvet,-1.1,.2,-1.18,13,10,.12,C.burgundy);ring(velvet,4.50,4.59,-1.09,.016,C.brassDeep,104);ring(velvet,4.62,4.65,-1.09,.016,C.gold,104);box(velvet,-1.1,.2,-1.24,12.8,9.8,.10,C.leather);
// ── Case and concentric turned-metal layers ──
let back=part('case-back','case',[0,0,0],[0,0,-1.45]);cylinder(back,3.03,-.60,.32,C.bronze,128);ring(back,2.80,3.18,-.46,.35,C.brassDeep,128);ring(back,3.08,3.19,-.31,.33,C.gold,128);ring(back,3.19,3.24,-.40,.21,C.goldLight,128);ring(back,3.10,3.18,-.22,.055,C.cream,128);
let enginePlate=part('engine-plate','plate',[0,0,0],[0,0,-.8]);cylinder(enginePlate,2.76,-.265,.09,C.steelDark,112);ring(enginePlate,2.48,2.69,-.19,.12,C.gold,112);ring(enginePlate,2.44,2.50,-.15,.065,C.bronze,112);
for(let k=0;k<12;k++){const a=k*TAU/12;let x=2.72*Math.cos(a),y=2.72*Math.sin(a);screw(enginePlate,x,y,-.08,.065)}
// ── Grounded barrel + mainspring ──
const bx=-1.10,by=.97;let barrel=part('mainspring-barrel','movement',[bx,by,0],[-1.1,.8,1.0]);cylinder(barrel,.75,-.08,.19,C.brassDeep,70);ring(barrel,.66,.76,.04,.10,C.gold,72);ring(barrel,.15,.23,.13,.12,C.goldLight,32);
let spring=part('mainspring-coil','movement',[bx,by,0],[-1.25,1.0,1.7]);spiral(spring,0,0,.13,5,.095,.64,.028,C.steel);
// ── Gear train with physically set pitch-distance pairs ──
let first=part('great-wheel-24','gear',[-.79,-.68,.13],[-1.25,-1.1,1.2]);let G1=gear(first,24,.074,0,C.gold,6);
let second=part('center-wheel-18','gear',[.764,-.68,.13],[.9,-1.0,2.0]);let G2=gear(second,18,.074,0,C.brass,5,Math.PI/18);
let third=part('third-wheel-12','gear',[.72,.42,.19],[1.3,.2,2.6]);let G3=gear(third,12,.083,0,C.goldLight,4);
let fourth=part('fourth-wheel-10','gear',[1.56,.69,.23],[1.65,1.1,3.2]);let G4=gear(fourth,10,.068,0,C.brass,4);
// Real physical-looking bearing columns and jewels along the z axes.
for(const [x,y] of [[-.79,-.68],[.764,-.68],[.72,.42],[1.56,.69],[-1.10,.97]]){
 let shaft=part('shaft-'+parts.length,'support',[x,y,0],[0,0,.5]);cylinder(shaft,.072,.03,.76,C.steel,20);ring(shaft,.09,.16,.35,.10,C.brassDeep,22);jewel(shaft,x,y,.33,.07);
}
// Escape wheel has teeth distinct from the gear train, anchor and balance oscillator.
let escape=part('escapement-wheel','escapement',[1.25,1.48,.22],[1.45,1.1,2.6]);gear(escape,15,.054,0,C.steel,5);
let lever=part('pallet-fork','pallet',[.91,1.25,.34],[1.9,1.1,3.2]);line(lever,[-.36,.20,0],[.36,.20,0],.053,C.steel);line(lever,[-.36,.20,0],[-.12,-.43,0],.048,C.steel);line(lever,[.36,.20,0],[.12,-.43,0],.048,C.steel);cylinder(lever,.11,.02,.19,C.ruby,24);
let balance=part('balance-wheel','balance',[.16,1.64,.37],[-.7,2.0,3.2]);ring(balance,.63,.71,0,.09,C.goldLight,82);ring(balance,.37,.40,0,.06,C.gold,80);cylinder(balance,.12,.04,.25,C.steel,24);for(let k=0;k<4;k++){let a=k*TAU/4;line(balance,[.10*Math.cos(a),.10*Math.sin(a),.02],[.62*Math.cos(a),.62*Math.sin(a),.02],.041,C.brass)}spiral(balance,0,0,.11,3,.10,.35,.018,C.steel);
// Bridges deliberately shaped as components, not a solitary flat disc.
let br=part('curved-upper-bridge','bridge',[-.08,.43,.40],[.2,0,3.45]);ring(br,.9,1.05,0,.12,C.gold,85,Math.PI*.15,Math.PI*.85);ring(br,1.60,1.67,0,.05,C.brass,70,Math.PI*.15,Math.PI*.83);line(br,[-1.08,.27,0],[1.05,.26,0],.095,C.brassDeep);ring(br,.08,.16,.08,.09,C.goldLight,25);
for(const [x,y] of [[-1.2,.55],[.95,.5]])screw(br,x,y,.45,.095);
let lowerBridge=part('lower-bridge','bridge',[-.05,-1.53,.41],[-.05,-1.0,3.1]);ring(lowerBridge,1.40,1.55,0,.09,C.bronze,82,3.55,5.85);line(lowerBridge,[-1.24,-.26,0],[1.2,-.26,0],.088,C.gold);for(let x of [-.85,.85])screw(lowerBridge,x,-.20,.48,.07);
// Fine radial engine turning on backplate (concentric toolmarks, not random identical noise).
let engraving=part('turning','plate',[0,0,0],[0,0,-1]);for(let k=0;k<9;k++)ring(engraving,1.8+.055*k,1.81+.055*k,-.18,.009,k%2?C.brassDeep:C.steelDark,96);
// ── Dial: a real open center, with metal ring and ivory roman numeral annulus ──
let dial=part('enamel-dial','dial',[0,0,0],[0,0,4.2]);ring(dial,1.75,2.85,.70,.075,C.enamel,128);ring(dial,2.79,2.96,.76,.11,C.goldLight,128);ring(dial,1.68,1.77,.76,.08,C.brass,128);ring(dial,2.97,3.05,.73,.05,C.bronze,128);tickMarks(dial,2.73,.753);romanNumerals(dial,2.22,.755);
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
let crown=part('winding-crown','case',[0,3.23,0],[0,1.20,1.40]);ring(crown,.25,.36,-.18,.15,C.gold,48,0,TAU);ring(crown,.40,.44,-.13,.075,C.bronze,56);cylinder(crown,.21,-.17,.32,C.goldLight,48);for(let i=0;i<20;i++){const a=i*TAU/20;line(crown,[.33*Math.cos(a),.33*Math.sin(a),-.13],[.39*Math.cos(a),.39*Math.sin(a),-.13],.021,C.brassDeep)}
let bow=part('bow','case',[0,3.60,0],[0,1.45,1.6]);ring(bow,.32,.38,-.17,.09,C.goldLight,56,0,TAU);
// ── Hinged inner cover: separate open metalwork and radial engraved pattern ──
let lid=part('hinged-lid','lid',[-5.56,.15,-.52],[-1.80,.35,-1.20]);cylinder(lid,2.96,-.22,.15,C.brassDeep,96);ring(lid,2.68,3.01,-.10,.15,C.gold,110);ring(lid,2.50,2.61,-.01,.08,C.goldLight,100);ring(lid,.37,.50,-.01,.11,C.gold,56);for(let k=0;k<12;k++){let a=k*TAU/12;line(lid,[.50*Math.cos(a),.50*Math.sin(a),0],[2.4*Math.cos(a),2.4*Math.sin(a),0],.025,C.goldLight)}for(let k=0;k<5;k++)ring(lid,1.00+k*.30,1.008+k*.30,.02,.017,C.cream,90);
let hinge=part('hinge-barrels','lid',[-3.15,.04,-.55],[-.80,.4,-.5]);for(let k=-1;k<=1;k++){let b=part('hinge-pin-'+k,'lid',[-3.15,k*.21,-.55],[-.8,.4,-.5]);cylinder(b,.09,0,.27,C.gold,22)}
// Contact shadows physically positioned on tabletop (opaque dark layers instead of claimed ray-traced shadows).
let shadow=part('contact-shadow','environment',[-.7,.0,-.99],[0,0,0]);cylinder(shadow,3.35,-.01,.018,C.shadow,72);
// Additional loose watchmaker tools and lacquered case around the hero, using 3D meshes.
let tool=part('screwdriver','environment',[4.75,-2.75,-.92],[0,0,0]);box(tool,0,0,0,.25,2.05,.25,C.woodDark);box(tool,0,1.16,.02,.10,.48,.11,C.steel);ring(tool,.10,.17,-.06,.05,C.gold,24);
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
in vec3 vNormal;in vec3 vColor;in vec3 vPosition;uniform vec3 uEye;out vec4 pixel;
void main(){vec3 n=normalize(vNormal);vec3 key=normalize(vec3(-.65,-.40,1.0));vec3 fill=normalize(vec3(.65,.4,.45));float k=max(dot(n,key),0.);float f=max(dot(n,fill),0.);vec3 eye=normalize(uEye-vPosition);vec3 h=normalize(key+eye);float spec=pow(max(dot(n,h),0.),40.);float edge=pow(1.-abs(dot(n,eye)),3.);
vec3 value=vColor*(.24 + .68*k + .18*f)+vec3(1.,.83,.52)*spec*.43 + vec3(.23,.42,.44)*edge*.12;
value=value/(value+vec3(.55));pixel=vec4(pow(value,vec3(.82)),1.);
}`));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('SHADER_COMPILE:'+gl.getProgramInfoLog(program));
}catch(e){failure('SHADER_COMPILE',e.message);return;}
const attrs={position:gl.getAttribLocation(program,'aPosition'),normal:gl.getAttribLocation(program,'aNormal'),color:gl.getAttribLocation(program,'aColor')};const uniforms={mvp:gl.getUniformLocation(program,'uMVP'),model:gl.getUniformLocation(program,'uModel'),eye:gl.getUniformLocation(program,'uEye')};
for(const p of parts){p.vertexCount=p.v.length/3;if(!p.vertexCount)continue;const vao=gl.createVertexArray();gl.bindVertexArray(vao);for(const [name,data] of [['position',p.v],['normal',p.n],['color',p.c]]){const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);gl.enableVertexAttribArray(attrs[name]);gl.vertexAttribPointer(attrs[name],3,gl.FLOAT,false,0,0);}p.vao=vao;delete p.v;delete p.n;delete p.c;}
gl.bindVertexArray(null);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);gl.clearColor(.037,.040,.034,1);gl.useProgram(program);
function mm(a,b){let out=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++){let x=0;for(let k=0;k<4;k++)x+=a[k*4+r]*b[c*4+k];out[c*4+r]=x;}return out;}
function model(pos,theta){const c=Math.cos(theta),s=Math.sin(theta);return new Float32Array([c,s,0,0,-s,c,0,0,0,0,1,0,pos[0],pos[1],pos[2],1]);}
function view(eye,target){let f=norm(sub(target,eye)),r=norm(cross(f,V(0,0,1))),u=norm(cross(r,f));return new Float32Array([r[0],u[0],-f[0],0,r[1],u[1],-f[1],0,r[2],u[2],-f[2],0,-dot(r,eye),-dot(u,eye),dot(f,eye),1]);}
function projection(fov,aspect,n=.20,f=100){let x=1/Math.tan(fov/2);return new Float32Array([x/aspect,0,0,0,0,x,0,0,0,0,(f+n)/(n-f),-1,0,0,2*f*n/(n-f),0]);}
let mode='whole',paused=false,amount=0,targetAmount=0,yaw=-1.15,elevation=.98,dist=16.0,tx=-1.85,ty=.12,tz=-.18,manualCam=false,last=performance.now(),elapsed=0,animationTime=0,hover=false;
const modes={whole:{target:0,dist:15.6,targetX:-1.8,targetY:.1,label:'MECANISMO'},inner:{target:.34,dist:10.4,targetX:.10,targetY:.10,label:'INTERIOR'},explode:{target:1,dist:17.9,targetX:-.45,targetY:.1,label:'DESPIECE'},assemble:{target:0,dist:16.5,targetX:-1.0,targetY:.2,label:'MONTAJE'},tour:{target:0,dist:14.7,targetX:-1.25,targetY:0,label:'RECORRIDO'}};
function setMode(name){if(!modes[name])return;mode=name;manualCam=false;animationTime=0;targetAmount=modes[name].target;if(name==='assemble'){amount=1;targetAmount=0;}Q('#beat').textContent=modes[name].label;Q('[data-mode="'+name+'"]').classList.add('selected');for(const b of document.querySelectorAll('[data-mode]'))b.classList.toggle('selected',b.dataset.mode===name);}
for(const b of document.querySelectorAll('[data-mode]'))b.addEventListener('click',()=>setMode(b.dataset.mode));
Q('#play').onclick=()=>{paused=!paused;Q('#play').textContent=paused?'▶':'Ⅱ';Q('#play').classList.toggle('selected',!paused)};
let viewIndex=0;const presets=[[-1.15,.98,16,-1.85,.12,-.18],[-1.53,1.42,10.3,.15,.1,.0],[-.4,.48,13.8,0,0,.05],[-2.34,.77,16.4,-3.0,.2,-.1]];
function cameraPreset(n){let p=presets[n%presets.length];[yaw,elevation,dist,tx,ty,tz]=p;manualCam=true;}
Q('#camera').onclick=()=>cameraPreset(++viewIndex);
Q('#home').onclick=()=>{cameraPreset(0);setMode('whole');};
let pointer=null,pinch=null;
canvas.addEventListener('pointerdown',ev=>{pointer={x:ev.clientX,y:ev.clientY,id:ev.pointerId};canvas.setPointerCapture(ev.pointerId);});
canvas.addEventListener('pointermove',ev=>{if(!pointer||pointer.id!==ev.pointerId||pinch)return;let dx=ev.clientX-pointer.x,dy=ev.clientY-pointer.y;yaw+=dx*.0058;elevation=clamp(elevation+dy*.0048,.18,1.53);pointer.x=ev.clientX;pointer.y=ev.clientY;manualCam=true;});
canvas.addEventListener('pointerup',()=>pointer=null);canvas.addEventListener('pointercancel',()=>pointer=null);
canvas.addEventListener('wheel',ev=>{ev.preventDefault();dist=clamp(dist*Math.exp(ev.deltaY*.0011),5.5,36);manualCam=true},{passive:false});
canvas.addEventListener('touchstart',ev=>{if(ev.touches.length===2){pinch=Math.hypot(ev.touches[0].clientX-ev.touches[1].clientX,ev.touches[0].clientY-ev.touches[1].clientY)}},{passive:true});
canvas.addEventListener('touchmove',ev=>{if(ev.touches.length===2&&pinch){let d=Math.hypot(ev.touches[0].clientX-ev.touches[1].clientX,ev.touches[0].clientY-ev.touches[1].clientY);dist=clamp(dist*pinch/d,5.5,36);pinch=d;manualCam=true;}},{passive:true});
canvas.addEventListener('touchend',ev=>{if(ev.touches.length<2)pinch=null});
Q('#explode').addEventListener('input',ev=>{amount=+ev.target.value/100;targetAmount=amount;mode='explode';manualCam=true;for(const b of document.querySelectorAll('[data-mode]'))b.classList.toggle('selected',b.dataset.mode==='explode');Q('#beat').textContent='DESPIECE';Q('#ratio').textContent=Math.round(amount*100)+'%';});
const dynamic=()=>{const spin=elapsed*.47;
byName['great-wheel-24'].angle=spin;
byName['center-wheel-18'].angle=-spin*24/18+Math.PI/18;
byName['third-wheel-12'].angle=spin*24/12*.5;
byName['fourth-wheel-10'].angle=-spin*24/10*.33;
byName['escapement-wheel'].angle=Math.floor(elapsed*4)/15*TAU;
byName['pallet-fork'].angle=Math.sin(elapsed*TAU*2)*.16;
byName['balance-wheel'].angle=Math.sin(elapsed*TAU*2)*.40;
byName['hour-hand'].angle=-elapsed*.0013 + .58;
byName['minute-hand'].angle=-elapsed*.013 +1.20;
byName['second-hand'].angle=-elapsed*.21;
};
function resize(){let dpr=Math.min(window.devicePixelRatio||1,1.65);let w=Math.max(1,Math.floor(canvas.clientWidth*dpr)),h=Math.max(1,Math.floor(canvas.clientHeight*dpr));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}return[w,h]}
function render(now){let dt=Math.min((now-last)/1000,.055);last=now;try{
 if(!paused){elapsed+=dt;animationTime+=dt;}dynamic();
 if(mode==='tour'&&!manualCam){let phase=(animationTime%25)/25;if(phase<.20)targetAmount=0;else if(phase<.43)targetAmount=.33;else if(phase<.68)targetAmount=1;else targetAmount=0;yaw+=dt*.048;}
 if(mode==='assemble')targetAmount=0;
 let speed=mode==='assemble'?.70:.95;amount=mix(amount,targetAmount,1-Math.exp(-dt*speed*3.1));if(Math.abs(amount-targetAmount)<.002)amount=targetAmount;
 if(!manualCam){const cfg=modes[mode];dist=mix(dist,cfg.dist,1-Math.exp(-dt*2.1));tx=mix(tx,cfg.targetX,1-Math.exp(-dt*2.1));ty=mix(ty,cfg.targetY,1-Math.exp(-dt*2.1));}
 Q('#explode').value=Math.round(amount*100);Q('#ratio').textContent=Math.round(amount*100)+'%';
 const [w,h]=resize(),aspect=w/h,scale=aspect<.8?Math.min(.8/aspect,1.8):1,eye=V(tx+Math.cos(yaw)*Math.cos(elevation)*dist*scale,ty+Math.sin(yaw)*Math.cos(elevation)*dist*scale,tz+Math.sin(elevation)*dist*scale);
 const vp=mm(projection(42*rad,aspect),view(eye,V(tx,ty,tz)));gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.uniform3fv(uniforms.eye,new Float32Array(eye));
 for(let p of parts){if(!p.vao||p.vertexCount<=0)continue;let explode=amount;if(mode==='inner'&&p.group==='dial')explode=Math.max(amount,.45);if(mode==='inner'&&p.group==='crystal')explode=.62;
 let xyz=add(p.pos,p.exploded.map(x=>x*explode));if(mode==='inner'&&p.group==='lid')xyz[0]-=1.15;
 // Macro movement runs on real 3D shafts and independently tagged layers.
 const M=model(xyz,p.angle||0);gl.uniformMatrix4fv(uniforms.model,false,M);gl.uniformMatrix4fv(uniforms.mvp,false,mm(vp,M));gl.bindVertexArray(p.vao);gl.drawArrays(gl.TRIANGLES,0,p.vertexCount);
 }
 window.__horologiumDiagnostics={ready:true,renderer:'WebGL2',version:'V2',method:'prometeo-3d-production@2.0.0',parts:parts.length,triangles,gearTeeth:[24,18,12,10,15],pitchDistance_24_18:1.554,gearRatio_24_18:-24/18,mode,explosion:amount,canvas:[w,h],frameTime:now};
 }catch(e){failure('RUNTIME',String(e.stack||e));return;}requestAnimationFrame(render);}
try{requestAnimationFrame(render);}catch(e){failure('RUNTIME',String(e))}
})();
