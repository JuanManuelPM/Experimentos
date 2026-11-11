/* PASAJE 05 · original standalone WebGL2 low-poly 3D exploration · MIT author-created code/assets */
(()=>{'use strict';
const el=id=>document.getElementById(id), canvas=el('screen');
// WebGL2 is primary. CPU textured-triangle rasterization is the progressive fallback.
const realGL=new URLSearchParams(location.search).get('renderer')==='webgl2'?canvas.getContext('webgl2',{antialias:false,alpha:false,depth:true,preserveDrawingBuffer:true,powerPreference:'low-power'}):null;
const SOFTWARE=!realGL, cpu=SOFTWARE?canvas.getContext('2d',{alpha:false}):null;
const gl=realGL||new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,getAttribLocation:(_,name)=>({p:0,uv:1,n:2,g:3})[name]||0, getUniformLocation:()=>0,createShader:()=>({}),createProgram:()=>({}),createTexture:()=>({}),createVertexArray:()=>({}),createBuffer:()=>({})},{get:(obj,prop)=>obj[prop]??(()=>{})});
if(SOFTWARE&&!cpu){el('fatal').classList.remove('hidden');return;}
const vs=`#version 300 es
in vec3 p;in vec2 uv;in vec3 n;in float g;
uniform mat4 mvp;uniform mat4 world;uniform vec3 eye;uniform float time;uniform vec2 res;
out vec2 vuv;out float light;out float fog;out float glow;
void main(){vec4 pos=mvp*vec4(p,1.); pos.xy=floor(pos.xy/pos.w*res*.5+.5)*2./res*pos.w;gl_Position=pos;vuv=uv;vec3 nn=mat3(world)*n;light=clamp(.57+dot(normalize(nn),normalize(vec3(-.35,.75,.45)))*.35,.24,1.12);vec3 w=(world*vec4(p,1.)).xyz;fog=smoothstep(15.,38.,distance(w,eye));glow=g;}`;
const fs=`#version 300 es
precision mediump float;in vec2 vuv;in float light;in float fog;in float glow;
uniform sampler2D atlas;uniform float time;out vec4 outColor;
void main(){vec3 t=texture(atlas,vuv).rgb;vec3 c=t*mix(light,1.05,glow);c=floor(c*32.+.5)/32.;c=mix(c,vec3(.052,.095,.113),fog*.79);outColor=vec4(c,1.);}`;
function compile(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}
const program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,vs));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fs));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);
const loc={p:gl.getAttribLocation(program,'p'),uv:gl.getAttribLocation(program,'uv'),n:gl.getAttribLocation(program,'n'),g:gl.getAttribLocation(program,'g'),mvp:gl.getUniformLocation(program,'mvp'),world:gl.getUniformLocation(program,'world'),eye:gl.getUniformLocation(program,'eye'),time:gl.getUniformLocation(program,'time'),res:gl.getUniformLocation(program,'res'),atlas:gl.getUniformLocation(program,'atlas')};
const rng=(()=>{let s=193531;return()=>((s=Math.imul(1664525,s)+1013904223|0)>>>0)/4294967296})();
// 4x4 UV atlas. Every pixel authored at runtime, nothing downloaded or taken from a photo.
const A=document.createElement('canvas');A.width=A.height=512;const ctx=A.getContext('2d');const TILE=128;
function tile(i,base){const x=(i%4)*TILE,y=Math.floor(i/4)*TILE;ctx.fillStyle=base;ctx.fillRect(x,y,TILE,TILE);return[x,y]}
function noisy(i,palette,count=600,sizes=[1,7]){const [x,y]=[(i%4)*TILE,Math.floor(i/4)*TILE];for(let k=0;k<count;k++){ctx.globalAlpha=.10+rng()*.3;ctx.fillStyle=palette[(rng()*palette.length)|0];const a=sizes[0]+(rng()*sizes[1]|0);ctx.fillRect(x+(rng()*128|0),y+(rng()*128|0),a,1+(rng()*a|0))}ctx.globalAlpha=1}
ctx.imageSmoothingEnabled=false;
tile(0,'#373d3b');noisy(0,['#121f22','#969084','#8b725b'],1000);for(let i=0;i<19;i++){ctx.strokeStyle='#151e22';ctx.lineWidth=1;ctx.beginPath();let x=rng()*128,y=rng()*128;ctx.moveTo(x,y);for(let z=0;z<4;z++){x+=rng()*18-9;y+=rng()*18-9;ctx.lineTo(x,y)}ctx.stroke()}
tile(1,'#74594b');for(let y=1;y<128;y+=19){ctx.fillStyle='#353c35';ctx.fillRect(128,y,128,2);for(let x=0;x<2;x++){const off=(Math.floor(y/19)%2)*20;for(let xx=0;xx<128;xx+=40){ctx.fillRect(128+xx+off,y,2,19)}}}noisy(1,['#b08865','#1b3337','#d6ab78'],700);
tile(2,'#617373');noisy(2,['#182c2c','#c4c0a0','#93a8a0','#302f2e'],1400,[1,11]);
tile(3,'#777c72');for(let x=0;x<128;x+=24)for(let y=0;y<128;y+=24){ctx.fillStyle=((x+y)/24)%2<1?'#505c59':'#8e9080';ctx.fillRect(3*TILE+x,y,23,23)}noisy(3,['#182727','#d0ad89'],250);
tile(4,'#4b5d56');for(let x=0;x<128;x+=12){ctx.fillStyle=x%24===0?'#212e2e':'#849084';ctx.fillRect(x,TILE,2,128)}noisy(4,['#b1633e','#193439','#cf8659'],820);
tile(5,'#c2a68c');noisy(5,['#6c5a50','#e5ccb5','#914f52'],320,[1,3]);
tile(6,'#63505a');for(let y=256;y<384;y+=16){ctx.fillStyle='#97717a';ctx.fillRect(256,y,128,1)}noisy(6,['#1c3334','#c29d7b','#bab6a1'],1150);
tile(7,'#454d51');noisy(7,['#9fa29a','#19292d','#78685e'],900);
tile(8,'#383238');noisy(8,['#a47c69','#1d2427','#704e59'],700);
tile(9,'#bc998b');noisy(9,['#e0b7aa','#9c756b'],120,[1,3]);
// Individual face plate: tiny painted facial features mapped to a real front-facing 3D face panel.
ctx.fillStyle='#231c29';ctx.fillRect(128+26,256+49,24,5);ctx.fillRect(128+79,256+49,24,5);ctx.fillStyle='#ebe2bf';ctx.fillRect(128+32,256+54,11,9);ctx.fillRect(128+85,256+54,11,9);ctx.fillStyle='#2a262e';ctx.fillRect(128+36,256+54,5,9);ctx.fillRect(128+89,256+54,5,9);ctx.fillStyle='#875b5c';ctx.fillRect(128+63,256+75,6,4);ctx.fillRect(128+50,256+92,32,2);ctx.fillStyle='#bd7574';ctx.fillRect(128+54,256+95,24,2);
tile(10,'#938477');noisy(10,['#514b4e','#d6b5a3'],480);ctx.fillStyle='#cfd6bc';ctx.fillRect(256+10,256+10,108,108);ctx.fillStyle='#533d45';ctx.font='bold 24px monospace';ctx.fillText('F/88',266,313);ctx.font='11px monospace';ctx.fillText('NO SIGNAL',264,336);ctx.fillText('PASO 05',268,352);ctx.fillStyle='#ad7561';ctx.fillRect(264,368,76,5);
tile(11,'#384a41');ctx.fillStyle='#ad6250';ctx.fillRect(386,265,120,108);ctx.fillStyle='#d1d3ac';ctx.font='bold 25px monospace';ctx.fillText('CAFÉ',391,309);ctx.font='11px monospace';ctx.fillText('SIN LUZ',392,330);ctx.fillText('ABIERTO?',391,345);ctx.fillStyle='#355754';ctx.fillRect(392,351,83,10);
tile(12,'#3a5a4a');for(let i=0;i<55;i++){ctx.fillStyle=['#284c46','#678c60','#a29b64','#283c36'][(rng()*4)|0];ctx.beginPath();const xx=12+rng()*102,yy=384+5+rng()*110;ctx.moveTo(xx,yy);ctx.lineTo(xx-8-rng()*10,yy+14+rng()*17);ctx.lineTo(xx+8+rng()*10,yy+12+rng()*18);ctx.fill()}
tile(13,'#9f9685');noisy(13,['#5a4f4b','#eee0c8'],400);ctx.fillStyle='#283635';for(let i=0;i<14;i++){ctx.fillRect(128+12,384+11+i*7,70+(rng()*34|0),2)}
tile(14,'#57483e');for(let y=384;y<512;y+=9){ctx.fillStyle=y%18===0?'#273538':'#856451';ctx.fillRect(256,y,128,3)}noisy(14,['#bd8052','#303336'],700);
tile(15,'#21373d');for(let y=385;y<511;y+=5){ctx.globalAlpha=.2;ctx.fillStyle='#a5e8b8';ctx.fillRect(384,y,128,2)}ctx.globalAlpha=1;ctx.fillStyle='#80cdab';ctx.font='bold 21px monospace';ctx.fillText('88.5',400,435);ctx.font='11px monospace';ctx.fillText('sintoniza',394,456);ctx.fillText('·······',394,475);
const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,A.width,A.height,0,gl.RGBA,gl.UNSIGNED_BYTE,A);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.uniform1i(loc.atlas,0);gl.enable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);gl.clearColor(.052,.095,.113,1);
// Geometry builder: triangulated surfaces, hard normals and 4x4 UV regions with 1px gutters.
function builder(){const data=[];function emit(a,b,c,uvs,g=0){const u=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],v=[c[0]-a[0],c[1]-a[1],c[2]-a[2]],no=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],ll=Math.hypot(...no)||1;for(const [p,uv] of [[a,uvs[0]],[b,uvs[1]],[c,uvs[2]]])data.push(...p,...uv,...no.map(q=>q/ll),g)}function qu(a,b,c,d,t=0,glow=0,uvScale=[1,1]){const col=t%4,row=Math.floor(t/4),x=(col*128+1.4)/512,y=(row*128+1.4)/512,su=125/512*uvScale[0],sv=125/512*uvScale[1],uv=[[x,y],[x+su,y],[x+su,y+sv],[x,y+sv]];emit(a,b,c,[uv[0],uv[1],uv[2]],glow);emit(a,c,d,[uv[0],uv[2],uv[3]],glow)}function tri(a,b,c,t,g=0){qu(a,b,c,c,t,g)}function box(x,y,z,w,h,d,t=2,g=0){const l=x-w/2,r=x+w/2,bt=y,top=y+h,n=z-d/2,f=z+d/2;qu([l,bt,f],[r,bt,f],[r,top,f],[l,top,f],t,g);qu([r,bt,n],[l,bt,n],[l,top,n],[r,top,n],t,g);qu([l,bt,n],[l,bt,f],[l,top,f],[l,top,n],t,g);qu([r,bt,f],[r,bt,n],[r,top,n],[r,top,f],t,g);qu([l,top,f],[r,top,f],[r,top,n],[l,top,n],t,g);qu([r,bt,f],[l,bt,f],[l,bt,n],[r,bt,n],t,g)}function strip(points,w,t,g=0){for(let i=0;i<points.length-1;i++){const [a,b]=[points[i],points[i+1]],dx=b[0]-a[0],dz=b[2]-a[2],len=Math.hypot(dx,dz)||1,nx=dz/len*w/2,nz=-dx/len*w/2;qu([a[0]+nx,a[1],a[2]+nz],[b[0]+nx,b[1],b[2]+nz],[b[0]-nx,b[1],b[2]-nz],[a[0]-nx,a[1],a[2]-nz],t,g)}}function loft(rings,t){for(let k=0;k<rings.length-1;k++){const a=rings[k],b=rings[k+1];for(let j=0;j<a.length;j++){let n=(j+1)%a.length;qu(a[j],a[n],b[n],b[j],t)}}let first=rings[0],last=rings.at(-1);for(let j=1;j<first.length-1;j++)tri(first[0],first[j],first[j+1],t);for(let j=1;j<last.length-1;j++)tri(last[0],last[j+1],last[j],t)}function mesh(){const array=new Float32Array(data),vao=gl.createVertexArray();gl.bindVertexArray(vao);const vbo=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vbo);gl.bufferData(gl.ARRAY_BUFFER,array,gl.STATIC_DRAW);let stride=9*4;for(const [index,size,offset] of [[loc.p,3,0],[loc.uv,2,3],[loc.n,3,5],[loc.g,1,8]]){gl.enableVertexAttribArray(index);gl.vertexAttribPointer(index,size,gl.FLOAT,false,stride,offset*4)}gl.bindVertexArray(null);return{vao,count:data.length/9,triangles:data.length/27,arr:SOFTWARE?array:null}}return{qu,tri,box,strip,loft,mesh,raw:data}}
const point=(x,y,z)=>[x,y,z], staticGeo=builder(), m=staticGeo;
function wall(x1,z1,x2,z2,h,t){m.qu([x1,0,z1],[x2,0,z2],[x2,h,z2],[x1,h,z1],t)}
// Asphalt, uneven pavement, curb, material variation. World X:-9..9 / Z:-23..18.
for(let z=-23;z<25;z+=3){m.qu([-5.8,.006,z],[-5.8,.006,z+3],[5.8,.006,z+3],[5.8,.006,z],rng()>.19?0:14);for(const s of [-1,1]){const x=s<0?-8.1:5.95;m.qu([x,.14,z],[x+2.05,.14,z],[x+2.05,.14,z+3],[x,.14,z+3],3);m.box(s*5.89,.01,z+1.5,.15,.14,3,4)}}
// Painted road fragments and paper scraps; all diegetic, not overlays.
for(let i=0;i<35;i++){let x=(rng()-.5)*10,z=-22+rng()*40;m.qu([x,.012,z],[x+.15+rng()*.18,.012,z],[x+.11,.012,z+.13],[x-.06,.012,z+.1],13)}
// Angular multi-bay alley walls, with differentiated facades and protruding masonry.
for(let side of [-1,1]){const xx=side*8.22;for(let z=-24;z<25;z+=5){let h=5.8+rng()*4.5,t=(side===-1?1:2);m.box(xx,.12,z+2.5,4.6,h,5,t);m.box(side*6.25,h*.70,z+2.5,.16,.15,4.8,4);for(let j=0;j<2;j++){const zz=z+1.2+j*1.9;const wy=2.65+(j%2)*1.35; // small street-facing lit window recess
m.box(side*5.83,wy,zz,.08,.9,1.12,4);m.box(side*5.76,wy+.08,zz,.085,.58,.74,15,1);m.box(side*5.70,wy+.09,zz,.1,.58,.06,4);m.box(side*5.70,wy+.09,zz,.1,.07,.74,4)}
if(rng()>.52){m.box(side*5.64,1.5,z+1.95,.2,2.5,1.45,4);m.box(side*5.52,1.46,z+1.95,.04,2.0,1.04,(rng()>.5?10:11),1)} }
}
// Service shutters, posters, grates, rooftop skylines.
for(let z=-22;z<16;z+=8){m.box(-5.64,.25,z, .15,2.25,2.8,14);m.box(5.65,.26,z+2.7,.15,2.25,2,4)}
for(let z=-20;z<17;z+=5){m.box(-5.70,4.4,z,.12,.16,2.6,4);m.box(5.70,4.2,z+.7,.12,.16,2.2,4)}
// Boundary bridge and deep vanishing alley, a framing landmark.
m.box(0,5.1,-23,13,1.7,.8,1);m.box(0,7,-22.9,12,.25,.9,14);m.box(0,.1,-24,13,2,.2,4);
// Storefront with door, believable CRT room glow and archive signage.
m.box(-5.55,.17,-9.2,.4,3.2,3.6,4);m.box(-5.30,.25,-9.3,.06,2.45,2.4,15,1);m.box(-5.23,2.85,-9.3,.08,.52,2.6,10,1);
// Pale fluorescent above entry: a slab, not procedural bloom.
m.box(-5.10,3.45,-9.25,.35,.11,3.1,13,1);
// Payphone: body, handset cradle, screen and hanging wire near right.
m.box(4.68,.18,-16.3,1.05,2.65,.7,4);m.box(4.05,1.7,-16.3,.13,.94,.51,15,1);m.box(3.93,1.84,-16.26,.13,.26,.36,7);m.box(3.89,.98,-16.3,.12,.39,.23,6);m.strip([[4.0,1.74,-16.1],[3.66,1.36,-16.15],[3.89,.88,-16.24]],.06,8);
// Signs: wall-mounted, proportional, 3D; tiny reading intentionally at range.
m.box(-5.25,4.12,6.5,.42,1.3,3.0,11,1);m.box(5.25,5.15,-10,.45,.85,2.3,10,1);
// Lamps, suspended cables and overhead light strips.
for(let z of [10,-3,-14]){m.box(-4.83,.13,z,.17,5.35,.18,4);m.box(-3.45,5.2,z,2.9,.17,.18,4);m.box(-2.37,5.0,z,.62,.2,.42,13,1);m.strip([[-4.83,5.3,z],[-3,5.8,z-.9],[1.2,5.7,z-1.2],[5.4,6.3,z-.3]],.065,8)}
// phone pole, graffiti, dilapidated stair framing.
for(let z=-16;z<-4;z+=2.3){m.box(5.68,1.2,z,.23,.15,1.2,4);m.box(5.64,2,z,.12,.12,1.2,4)}
// Planters have designed foliage as jagged polygons rather than spherical tree clumps.
function plant(x,z,h=1){m.box(x,.14,z,.9,.49,.85,14);for(let k=0;k<9;k++){const a=rng()*6.28,rad=.16+rng()*.5,y=.4+rng()*.3,top=y+h*(.55+rng()*.65),wx=x+Math.cos(a)*rad,wz=z+Math.sin(a)*rad;const w=.2+rng()*.17;m.tri([wx-w,y,wz],[x+Math.cos(a)*.1,top,wz+Math.sin(a)*.1],[wx+w,y,wz],12)}}for(const [x,z,h] of [[-4.7,11,1.4],[4.8,7.7,1],[4.7,-5.3,1.6],[-4.8,-19,1.2],[-4.6,-5.9,.75]])plant(x,z,h);
// Trash, booth with antenna, assorted taped notices and scattered street life.
for(const [x,z] of [[4.8,12],[4.9,2.2],[-4.75,-14.4]]){m.box(x,.14,z,.55,.92,.61,4);m.box(x,1.02,z,.66,.08,.69,14)}
m.box(4.6,.17,-7.6,.75,1.5,.72,4);m.box(4.12,1.12,-7.6,.08,.49,.57,15,1);m.box(4.12,.52,-7.6,.08,.20,.29,13);m.box(4.7,1.68,-7.62,.05,1.4,.04,4);
for(let z of [13,3,-11]){m.box(-5.52,.55,z,.02,1.1,.85,13);m.box(5.52,1.1,z-1,.02,1.1,.85,10)}
// Broken drain gratings and a distinctive floor crosswalk.
for(let z=-20;z<-18;z+=.38)m.box(0,.015,z,5.3,.01,.12,4);
const worldMesh=m.mesh();
// Original sculpted mesh characters. Polygonal tapered torso, offset shoulder planes,
// articulated sleeve lozenges, pointed hair locks, faceplate with painted eyes via atlas UV.
function rings(yLevels,radii,segments=6,offset=0){return yLevels.map((y,i)=>Array.from({length:segments},(_,j)=>{const a=(j/segments)*2*Math.PI+offset;return[Math.sin(a)*radii[i][0],y,Math.cos(a)*radii[i][1]]}))}
function characterMesh(kind){const b=builder();let skin=5,coat=kind===0?6:kind===1?7:6,hair=kind===0?8:kind===1?6:7;
// Boots and deliberately asymmetric trouser silhouette.
for(const side of [-1,1]){let x=side*.22;b.loft([[[x-.16,.1,.24],[x+.16,.1,.24],[x+.15,.1,-.3],[x-.15,.1,-.3]],[[x-.13,.79,.11],[x+.12,.79,.11],[x+.12,.79,-.13],[x-.12,.79,-.13]]],7);b.box(x,.06,-.06,.4,.18,.56,8)}
// Jacket sculpture: 7-sided collar and larger shoulders, not a stack of boxes.
let body=rings([.78,1.05,1.55,1.94,2.04],[[.37,.21],[.40,.25],[.40,.29],[.52,.27],[.31,.21]],7,Math.PI/7);b.loft(body,coat);
// Slanted lapel, seam and satchel strap crossing torso.
b.qu([-.28,1.93,-.29],[-.12,1.93,-.30],[.21,1.09,-.24],[.10,1.09,-.27],8);b.qu([.10,1.94,-.31],[.32,1.92,-.29],[-.02,1.33,-.30],[-.16,1.34,-.29],4);
for(const s of [-1,1]){const x=s*.48;b.loft([[[x-.19,1.9,-.12],[x+.15,1.88,-.11],[x+.16,1.84,.2],[x-.16,1.84,.19]],[[x-.13,1.25,-.12],[x+.10,1.25,-.13],[x+.12,1.25,.18],[x-.12,1.25,.17]]],coat);b.loft([[[x-.13,1.3,-.13],[x+.1,1.3,-.12],[x+.12,1.3,.18],[x-.12,1.3,.19]],[[x-.09,1.14,-.12],[x+.07,1.14,-.12],[x+.08,1.14,.15],[x-.07,1.14,.15]]],5)}
// Broad cheekbone and protruding chin, actual taper faceted head with side planes.
const head=rings([2.04,2.17,2.43,2.71,2.83],[[.20,.19],[.32,.29],[.37,.29],[.30,.24],[.21,.17]],7,Math.PI/7);b.loft(head,5);
// Flat-ish front cheek/mask plane with intentional UV artwork (face occupies central tile 9).
const faceZ=-.29;b.qu([-.285,2.18,faceZ], [.285,2.18,faceZ], [.292,2.70,faceZ],[-.292,2.70,faceZ],9);
// asymmetrical hair: sweeping crown volumes + five planar locks down the brow.
b.loft(rings([2.61,2.76,3.02,3.17],[[.36,.29],[.38,.33],[.24,.24],[.04,.05]],7,Math.PI/7),hair);
for(let k=0;k<6;k++){let x=-.36+k*.14; b.tri([x-.085,2.93,-.29],[x+.09,2.91,-.30],[x+.017,2.54-(k%3)*.08,-.32],hair)}
// A stepped, pointed nape silhouette from the rear; hair is no longer a detached cap.
b.qu([-.33,2.79,.26],[.32,2.79,.26],[.35,2.19,.255],[-.37,2.19,.255],hair);
b.tri([-.36,2.46,.26],[-.35,2.06,.24],[-.1,2.34,.30],hair);
b.tri([.35,2.47,.26],[.28,2.09,.25],[.02,2.28,.30],hair);
b.tri([-.31,2.83,.27],[.21,2.96,.25],[.34,2.38,.30],hair);
// Broken jacket hem and two offset folds (readable from behind).
b.tri([-.40,1.11,.16],[-.32,.72,.21],[-.02,.9,.29],coat);
b.tri([.39,1.07,.12],[.46,.68,.23],[.09,.91,.27],coat);
// tiny triangular ear/headphones, surface patch and sideburn.
b.tri([-.37,2.47,0],[-.37,2.63,.02],[-.40,2.50,-.19],skin);b.tri([.37,2.47,0],[.37,2.63,.02],[.40,2.50,-.19],skin);
// backpack built from 5 tapered faces, buckles and subtle fabric wear.
b.loft([[[ -.30,1.1,.31],[.30,1.1,.31],[.29,1.1,.55],[-.28,1.1,.55]],[[ -.30,1.77,.32],[.30,1.77,.32],[.25,1.77,.60],[-.25,1.77,.60]]],8);b.qu([-.25,1.68,.61],[.24,1.68,.61],[.20,1.40,.61],[-.24,1.40,.61],6);
return b.mesh()}
const playerMesh=characterMesh(0),npcMesh=characterMesh(1);
// Cat is a paperfolded low-poly animal, original silhouette with ear wedges, elongated muzzle.
function catMesh(){const b=builder();b.loft([[[ -.30,.21,.29],[.30,.21,.29],[.30,.21,-.31],[-.30,.21,-.31]],[[ -.28,.66,.28],[.26,.66,.27],[.23,.66,-.26],[-.26,.66,-.26]]],7);b.loft(rings([.6,.82,1.02],[[.28,.27],[.34,.28],[.27,.23]],5),5);b.tri([-.30,.94,-.01],[-.23,1.35,-.04],[-.04,1.0,-.14],8);b.tri([.30,.94,-.01],[.23,1.35,-.04],[.04,1.0,-.14],8);b.qu([-.21,.88,-.26],[.22,.88,-.26],[.18,1.08,-.19],[-.18,1.08,-.19],9);b.tri([0,.73,-.30],[-.09,.83,-.30],[.12,.82,-.29],5);
for(const side of [-1,1]){const x=side*.21;b.box(x,.08,-.22,.17,.30,.25,7);b.box(x,.08,.2,.17,.3,.22,7)}
b.strip([[.26,.51,.28],[.42,.69,.62],[.34,1.05,.82]],.15,8);return b.mesh()}
const kittyMesh=catMesh();
// Moving world and interaction locations.
const actors=[{id:'mara',name:'MARA',x:.8,z:7,mesh:npcMesh,scale:.90,angle:-.5,kind:'npc'}, {id:'cat',name:'GATO DE PAPEL',x:3.1,z:-2.7,mesh:kittyMesh,scale:1.25,angle:2,kind:'cat'}, {id:'receiver',name:'CONSOLA',x:-4.5,z:-9.15,kind:'object'}, {id:'nilo',name:'NILO',x:2.5,z:-11.7,mesh:npcMesh,scale:.93,angle:1.3,kind:'npc'}, {id:'phone',name:'TELÉFONO',x:3.88,z:-16.1,kind:'object'}];
const STORAGE='pasaje05.pilot001.save.v1';let save={step:0,cat:false,finished:false};try{const loaded=JSON.parse(localStorage.getItem(STORAGE)||'null');if(loaded&&loaded.version===1)save={step:Math.min(3,Math.max(0,loaded.step|0)),cat:!!loaded.cat,finished:!!loaded.finished}}catch{}
function persist(){try{localStorage.setItem(STORAGE,JSON.stringify({version:1,...save}))}catch{}}
const player={x:0,z:12.5,angle:0}, cam={yaw:0,pitch:.34,dist:8.7}, keys=new Set();let joystick={active:null,x:0,y:0};const drag=new Map();let pinch=null;let current=null,dialog=false,elapsed=0,last=performance.now(),frame=0,draws=0,lastFps=60,fpsSum=0,fpsCount=0,low=0,highQuality=false;
const goals=['Hablá con Mara junto al cartel.','Entrá en frecuencia: buscá la consola iluminada.','Encontrá el teléfono público al fondo del pasaje.','Señal encontrada. El pasaje recuerda tu visita.'];
function hud(){el('objective').textContent=goals[save.step];el('chapter').textContent=['00 · SIN RASTRO','01 · RUIDO DE CINTA','02 · LÍNEA ABIERTA','03 · TRANSMISIÓN'][save.step]}
hud();
function show(who,content){dialog=true;el('dialogTitle').textContent=who;el('dialogText').textContent=content;el('dialog').classList.remove('hidden');el('act').classList.add('hidden')}
function close(){dialog=false;el('dialog').classList.add('hidden')};el('close').onclick=close;
let timeout;function toast(message){clearTimeout(timeout);el('toast').textContent=message;el('toast').classList.remove('hidden');timeout=setTimeout(()=>el('toast').classList.add('hidden'),2300)}
function activate(id){if(id==='mara'){if(save.step===0){save.step=1;persist();hud();show('MARA / CANAL 00','El pasaje no está abandonado. Solo perdió su voz.\nBuscá el monitor verde. La cinta quedó ahí, detrás de la persiana.')}else show('MARA / CANAL 00',save.finished?'Todavía se escucha algo. Parece que la frecuencia te recuerda.':'El monitor verde está en la pared izquierda. No tiene por qué encenderse solo.');return}
if(id==='receiver'){if(save.step===1){save.step=2;persist();hud();show('CONSOLA / 88.5', 'SINTONÍA CAPTURADA\n··· una llamada antigua ···\n«Último intento: cabina 05, al fondo del pasaje».')}else show('CONSOLA / 88.5',save.step<1?'Aparecen números. Falta alguien que te diga qué buscar.':'En la pantalla parpadea: «CABINA 05».');return}
if(id==='cat'){save.cat=true;persist();show('GATO DE PAPEL', 'Te mira como si ya te conociera. Hay una etiqueta doblada en su collar: 88.5 MHz.');return}
if(id==='nilo'){show('NILO / MECÁNICO',save.step>=2?'La cabina todavía tiene línea. No preguntes cómo.':'La luz del local parpadea cuando pasa alguien. ¿Vos también la ves?');return}
if(id==='phone'){if(save.step>=2){save.step=3;save.finished=true;persist();hud();show('CABINA 05 / TRANSMISIÓN FINAL','Una voz sale del auricular.\n«No era una frecuencia. Era una dirección.»\n\nLA FRECUENCIA VACÍA · FIN\nTu recorrido quedó guardado en este navegador.')}else show('TELÉFONO PÚBLICO','No hay tono. Una etiqueta descolorida dice: «sintonizar antes de llamar».') }}
function nearest(){let best=null,dist=2.2;for(const a of actors){const d=Math.hypot(player.x-a.x,player.z-a.z);if(d<dist){dist=d;best=a}}return best}
function action(){if(dialog){close();return}if(current)activate(current.id)}el('act').addEventListener('click',action);
function updateTarget(){current=nearest();let b=el('act');if(!dialog&&current){b.classList.remove('hidden');b.innerHTML='[ E ] '+(current.kind==='object'?'EXAMINAR':current.kind==='cat'?'ACARICIAR':'HABLAR')+'<small>'+current.name+'</small>'}else b.classList.add('hidden')}
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
function setJoystick(e){let r=el('joystick').getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2),len=Math.hypot(dx,dy);let mag=Math.min(1,len/46),v=Math.atan2(dy,dx);joystick.x=Math.cos(v)*mag;joystick.y=Math.sin(v)*mag;el('stick').style.transform=`translate(${joystick.x*40}px,${joystick.y*40}px)`}
el('joystick').addEventListener('pointerdown',e=>{e.preventDefault();joystick.active=e.pointerId;el('joystick').setPointerCapture(e.pointerId);setJoystick(e)});el('joystick').addEventListener('pointermove',e=>{if(joystick.active===e.pointerId)setJoystick(e)});function releaseJoy(e){if(joystick.active!==e.pointerId)return;joystick.active=null;joystick.x=joystick.y=0;el('stick').style.transform='translate(0,0)'}for(const typ of ['pointerup','pointercancel','lostpointercapture'])el('joystick').addEventListener(typ,releaseJoy);
canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;canvas.setPointerCapture(e.pointerId);drag.set(e.pointerId,{x:e.clientX,y:e.clientY});if(drag.size===2){let p=[...drag.values()];pinch=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y)}});
canvas.addEventListener('pointermove',e=>{let old=drag.get(e.pointerId);if(!old)return;drag.set(e.pointerId,{x:e.clientX,y:e.clientY});if(drag.size>=2){let p=[...drag.values()],d=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);if(pinch)cam.dist=clamp(cam.dist*pinch/Math.max(20,d),4.4,11);pinch=d;return}cam.yaw-=(e.clientX-old.x)/innerWidth*4;cam.pitch=clamp(cam.pitch+(e.clientY-old.y)/innerHeight*2.7,.12,.76)});
for(const typ of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(typ,e=>{drag.delete(e.pointerId);pinch=null});canvas.addEventListener('wheel',e=>{e.preventDefault();cam.dist=clamp(cam.dist+e.deltaY*.01,4.4,11)},{passive:false});
window.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','e',' ','escape'].includes(k))e.preventDefault();if(k==='e'&&!e.repeat)action();if(k==='escape')close();keys.add(k)});window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>{keys.clear();joystick.x=joystick.y=0;el('stick').style.transform='translate(0,0)'});
el('contrast').onclick=()=>{highQuality=!highQuality;el('contrast').textContent=highQuality?'PIXEL · 2×':'PIXEL · 1×';resize()};
function validPos(x,z){if(x<-5.1||x>5.1||z< -21.5||z>17.1)return false;for(const o of [[4.6,-7.6,.75],[-4.55,-9.15,.75],[4.65,-16.25,.77]]){if(Math.hypot(x-o[0],z-o[1])<o[2])return false}return true}
function move(dt){if(dialog)return false;let x=joystick.x,z=-joystick.y;if(keys.has('w')||keys.has('arrowup'))z++;if(keys.has('s')||keys.has('arrowdown'))z--;if(keys.has('a')||keys.has('arrowleft'))x--;if(keys.has('d')||keys.has('arrowright'))x++;let len=Math.hypot(x,z);if(len<.05)return false;x/=Math.max(1,len);z/=Math.max(1,len);let wx=Math.cos(cam.yaw)*x-Math.sin(cam.yaw)*z,wz=-Math.sin(cam.yaw)*x-Math.cos(cam.yaw)*z;let speed=keys.has('shift')?5.4:3.6,dx=wx*speed*dt,dz=wz*speed*dt;if(validPos(player.x+dx,player.z))player.x+=dx;if(validPos(player.x,player.z+dz))player.z+=dz;let ang=Math.atan2(-wx,-wz);let d=Math.atan2(Math.sin(ang-player.angle),Math.cos(ang-player.angle));player.angle+=d*Math.min(1,dt*10);return true}
// Minimal 4x4 matrices, separate camera from model transforms for portable no-dependency runtime.
const M=()=>new Float32Array(16);function ident(){let o=M();o[0]=o[5]=o[10]=o[15]=1;return o}function mul(a,b){let o=M();for(let c=0;c<4;c++)for(let r=0;r<4;r++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+r]*b[c*4+k];o[c*4+r]=s}return o}function proj(aspect){let o=M(),f=1/Math.tan(.55);o[0]=f/aspect;o[5]=f;o[10]=-(60+.1)/(60-.1);o[11]=-1;o[14]=-(2*60*.1)/(60-.1);return o}function model(x,y,z,rot=0,scale=1){let o=ident(),c=Math.cos(rot),s=Math.sin(rot);o[0]=c*scale;o[2]=-s*scale;o[5]=scale;o[8]=s*scale;o[10]=c*scale;o[12]=x;o[13]=y;o[14]=z;return o}function look(eye,at){let z=norm(sub(eye,at)),x=norm(cross([0,1,0],z)),y=cross(z,x),o=ident();o[0]=x[0];o[1]=y[0];o[2]=z[0];o[4]=x[1];o[5]=y[1];o[6]=z[1];o[8]=x[2];o[9]=y[2];o[10]=z[2];o[12]=-dot(x,eye);o[13]=-dot(y,eye);o[14]=-dot(z,eye);return o}const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),sub=(a,b)=>a.map((v,i)=>v-b[i]),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm=a=>{let l=Math.hypot(...a)||1;return a.map(v=>v/l)};
let w=1,h=1;function resize(){w=Math.max(200,innerWidth);h=Math.max(200,innerHeight);let maxPx=highQuality?(SOFTWARE?720:920):(SOFTWARE?480:660),ratio=Math.min(1,maxPx/Math.max(w,h));canvas.width=Math.max(200,Math.round(w*ratio));canvas.height=Math.max(200,Math.round(h*ratio));if(!SOFTWARE)gl.viewport(0,0,canvas.width,canvas.height)}window.addEventListener('resize',resize);resize();
const raster=[], atlasPixels=ctx.getImageData(0,0,512,512).data;
const pick=(u,v)=>{const ix=clamp(Math.floor(u*512),0,511),iy=clamp(Math.floor(v*512),0,511),k=(iy*512+ix)*4;return `rgb(${atlasPixels[k]},${atlasPixels[k+1]},${atlasPixels[k+2]})`};
function cpuRender(eye){
  // Perspective-correct 3D positions, affine texture mapping on each projected triangle.
  // This is a true traversable 3D geometry fallback, not a pre-rendered image.
  cpu.setTransform(1,0,0,1,0,0);cpu.fillStyle='#0e1920';cpu.fillRect(0,0,canvas.width,canvas.height);
  raster.sort((a,b)=>b.depth-a.depth);cpu.imageSmoothingEnabled=false;
  for(const f of raster){const p=f.ps,uv=f.uv;
    const ux=uv[0][0]*512,uy=uv[0][1]*512,du1=uv[1][0]*512-ux,dv1=uv[1][1]*512-uy,du2=uv[2][0]*512-ux,dv2=uv[2][1]*512-uy;
    const det=du1*dv2-du2*dv1;
    cpu.save();cpu.beginPath();cpu.moveTo(p[0][0],p[0][1]);cpu.lineTo(p[1][0],p[1][1]);cpu.lineTo(p[2][0],p[2][1]);cpu.closePath();cpu.clip();
    if(Math.abs(det)>1e-3&&f.area>11){const a=((p[1][0]-p[0][0])*dv2-(p[2][0]-p[0][0])*dv1)/det;
      const c=((p[2][0]-p[0][0])*du1-(p[1][0]-p[0][0])*du2)/det;
      const b=((p[1][1]-p[0][1])*dv2-(p[2][1]-p[0][1])*dv1)/det;
      const d=((p[2][1]-p[0][1])*du1-(p[1][1]-p[0][1])*du2)/det;
      cpu.setTransform(a,b,c,d,p[0][0]-a*ux-c*uy,p[0][1]-b*ux-d*uy);cpu.drawImage(A,0,0)
    }else{cpu.fillStyle=pick((uv[0][0]+uv[1][0]+uv[2][0])/3,(uv[0][1]+uv[1][1]+uv[2][1])/3);cpu.fill()}
    cpu.restore();const intensity=clamp(f.shade,.2,1.1),shade=clamp((1-intensity)*.65+f.fog*.57,0,.85);
    if(shade>.035){cpu.fillStyle=`rgba(7,19,24,${shade})`;cpu.beginPath();cpu.moveTo(...p[0]);cpu.lineTo(...p[1]);cpu.lineTo(...p[2]);cpu.closePath();cpu.fill()}
  }raster.length=0;
}
function rasterMesh(mesh,world,pv,eye){const mat=mul(pv,world),a=mesh.arr,sw=canvas.width,sh=canvas.height;
  for(let i=0;i<a.length;i+=27){const ps=[],uv=[],vtx=[];let depth=0,skip=false;
    for(let j=0;j<3;j++){let k=i+j*9,x=a[k],y=a[k+1],z=a[k+2],wx=world[0]*x+world[8]*z+world[12],wy=world[5]*y+world[13],wz=world[2]*x+world[10]*z+world[14];
      let sx=mat[0]*x+mat[4]*y+mat[8]*z+mat[12],sy=mat[1]*x+mat[5]*y+mat[9]*z+mat[13],sz=mat[2]*x+mat[6]*y+mat[10]*z+mat[14],ww=mat[3]*x+mat[7]*y+mat[11]*z+mat[15];
      if(ww<.12){skip=true;break}ps.push([(sx/ww*.5+.5)*sw,(-sy/ww*.5+.5)*sh]);uv.push([a[k+3],a[k+4]]);vtx.push([wx,wy,wz]);depth+=sz/ww;}
    if(skip)continue;if(ps.every(p=>p[0]<0)||ps.every(p=>p[0]>sw)||ps.every(p=>p[1]<0)||ps.every(p=>p[1]>sh))continue;
    const area=Math.abs((ps[1][0]-ps[0][0])*(ps[2][1]-ps[0][1])-(ps[2][0]-ps[0][0])*(ps[1][1]-ps[0][1]))/2;
    if(area<.3)continue;
    let k=i,nx=a[k+5],ny=a[k+6],nz=a[k+7];let shade=.57+(.75*ny-.35*nx+.45*nz)*.28;
    const mid=vtx[0].map((v,j)=>(v+vtx[1][j]+vtx[2][j])/3);let fog=clamp((Math.hypot(mid[0]-eye[0],mid[1]-eye[1],mid[2]-eye[2])-15)/22,0,1);
    raster.push({ps,uv,area,depth:depth/3,shade:a[k+8]>.5?1:shade,fog});
  }
}
function draw(mesh,world,pv,eye,time){if(SOFTWARE)rasterMesh(mesh,world,pv,eye);else{gl.bindVertexArray(mesh.vao);gl.uniformMatrix4fv(loc.world,false,world);gl.uniformMatrix4fv(loc.mvp,false,mul(pv,world));gl.drawArrays(gl.TRIANGLES,0,mesh.count)}draws++}
let lastCpuFrameAt=0;function frameLoop(now){requestAnimationFrame(frameLoop);if(SOFTWARE&&now-lastCpuFrameAt<90)return;lastCpuFrameAt=now;let dt=Math.min(SOFTWARE?.09:.05,Math.max(.001,(now-last)/1000));last=now;elapsed+=dt;frame++;let moving=move(dt);updateTarget();if(!SOFTWARE)gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.uniform1f(loc.time,elapsed);gl.uniform2f(loc.res,canvas.width,canvas.height);let target=[player.x,1.48,player.z],dist=cam.dist,eye=[player.x+Math.sin(cam.yaw)*Math.cos(cam.pitch)*dist,1.48+Math.sin(cam.pitch)*dist,player.z+Math.cos(cam.yaw)*Math.cos(cam.pitch)*dist];if(eye[0]>5.2||eye[0]<-5.2){let max=5.2;eye[0]=clamp(eye[0],-max,max)}if(eye[2]>24||eye[2]<-24){eye[2]=clamp(eye[2],-24,24)}gl.uniform3fv(loc.eye,eye);let pv=mul(proj(canvas.width/canvas.height),look(eye,target));draws=0;draw(worldMesh,ident(),pv,eye,elapsed);draw(playerMesh,model(player.x,moving?.035*Math.sin(elapsed*14):0,player.z,player.angle,1),pv,eye,elapsed);
for(const a of actors){if(!a.mesh)continue;const bob=a.id==='cat'?0:.022*Math.sin(elapsed*1.4+a.x);draw(a.mesh,model(a.x,bob,a.z,a.angle,a.scale),pv,eye,elapsed)}
if(SOFTWARE)cpuRender(eye);if(frame===1){el('boot')?.classList.add('hidden');if(el('renderer-mode'))el('renderer-mode').textContent=SOFTWARE?'CPU · MODO COMPATIBLE':'GPU · EXPERIMENTAL';}if(frame%45===0){lastFps=Math.round(1/dt);fpsSum+=lastFps;fpsCount++;low=Math.min(low||lastFps,lastFps)}
window.__PASAJE_DEBUG__={ready:true,webgl:!SOFTWARE,renderer:SOFTWARE?'CANVAS2D_TEXTURED_3D':'WEBGL2',player:{x:player.x,z:player.z,angle:player.angle},camera:{...cam,eye},nearest:current?.id||null,save:{...save},drawCalls:draws,triangles:worldMesh.triangles+playerMesh.triangles+2*npcMesh.triangles+kittyMesh.triangles,canvas:[canvas.width,canvas.height],fpsApprox:lastFps,frame,dialog,goal:goals[save.step]};}
requestAnimationFrame(frameLoop);
if(new URLSearchParams(location.search).has('qa'))window.__PASAJE_QA__={teleport(id){const a=actors.find(a=>a.id===id);if(!a)return false;close();player.x=clamp(a.x+(a.x>0?-1:1),-5,5);player.z=a.z+1.1;updateTarget();return current?.id||null},use(){action();return {...save,dialog}},state(){return{...save,position:[player.x,player.z],camera:{...cam},target:current?.id||null,dialog}},reset(){save={step:0,cat:false,finished:false};persist();hud();close();player.x=0;player.z=12.5},camera(yaw,pitch,dist){cam.yaw=yaw;cam.pitch=clamp(pitch,.12,.76);cam.dist=clamp(dist,4.4,11);return {...cam}},getTexture(){return A.toDataURL('image/png')}};
})();
