// All geometry, furniture and materials are original and parameterized in metres.
import {mat,vec} from './engine.js';
const colors={limestone:[.77,.725,.635],plaster:[.83,.796,.704],sand:[.64,.57,.47],floor:[.69,.63,.55],timber:[.31,.19,.11],lightWood:[.56,.36,.21],darkWood:[.18,.13,.11],rust:[.35,.19,.12],textile:[.65,.58,.48],linen:[.84,.80,.71],leather:[.39,.28,.20],ink:[.075,.082,.076],brass:[.43,.32,.16],glass:[.48,.64,.62],foliage:[.22,.33,.19],foliage2:[.36,.43,.22],foliage3:[.12,.26,.15],water:[.22,.36,.37],gravel:[.49,.46,.38],white:[.89,.84,.75],night:[.78,.52,.25]};
const objects=[];let idx=0;
function add(name,geo,pos,scale,color,opts={}){let o={id:opts.id||`piece-${++idx}`,name,geometry:geo,pos,scale,color:colors[color]||color,roughness:opts.roughness??.73,metalness:opts.metalness??0,finish:opts.finish??0,opacity:opts.opacity??1,occluder:!!opts.occluder,solid:!!opts.solid,roof:!!opts.roof,visible:true};o.model=mat.compose(pos,scale,opts.rotation||[0,0,0]);if(geo==='box'&&opts.solid||opts.occluder){o.bounds={min:pos.map((v,i)=>v-scale[i]/2),max:pos.map((v,i)=>v+scale[i]/2)}}objects.push(o);return o}
function box(name,p,s,c,opts){return add(name,'box',p,s,c,opts)}
function smooth(name,p,s,c,opts){return add(name,'round',p,s,c,opts)}
function sphere(name,p,s,c,opts){return add(name,'sphere',p,s,c,opts)}
function cyl(name,p,s,c,opts){return add(name,'cylinder',p,s,c,opts)}
function pillar(name,p,s=[.1,3,.1],c='ink'){return box(name,p,s,c,{finish:5,roughness:.3,metalness:.48})}
function wall(name,p,s,color='plaster'){return box(name,p,s,color,{finish:1,roughness:.91,solid:true,occluder:true})}
function roof(name,p,s){return box(name,p,s,'timber',{finish:2,roughness:.83,roof:true,occluder:true})}
function slab(name,p,s,color='floor'){return box(name,p,s,color,{finish:3,roughness:.9})}
function shadow(name,p,s){return sphere(name,p,s,'ink',{opacity:.20,roughness:1})}
function beam(name,p,s){return box(name,p,s,'darkWood',{finish:2,roughness:.58})}
function rail(name,p,s){return box(name,p,s,'ink',{roughness:.32,metalness:.6})}
function glassPane(name,p,s){return box(name,p,s,'glass',{opacity:.17,roughness:.16,metalness:.05})}
function doorFrame(x,z,width){for(let a of [-width/2,width/2])pillar('marco de acero',[x+a,1.42,z],[.045,2.86,.054]);rail('dintel del vano',[x,2.85,z],[width,.05,.055]);rail('guía inferior',[x,.045,z],[width,.03,.06]);}
// House: exterior 16.7 × 15.2m. Living west, dining east, studio south, two courts.
slab('losa continua',[-.0,-.13,-.05],[17.05,.23,15.45]);
// Coherent room footprints: salon 6.1 × 6.25; dining 6.1 × 6.25; studio 6.0 × 4.7.
slab('estar pavimento',[-5.40,-.035,1.55],[6.0,.10,6.2]);
slab('comedor pavimento',[5.45,-.035,1.55],[5.95,.10,6.2]);
slab('estudio pavimento',[0,-.035,-5.45],[5.9,.10,4.25]);
slab('patio A piedra',[0,-.025,-.25],[4.15,.07,5.5],'gravel');
slab('patio B piedra',[0,-.025,4.52],[4.15,.07,3.0],'gravel');
// Shell on west and east wings. Sections intentionally separated for real walk-through.
wall('muro oeste',[-8.38,1.55,1.54],[.30,3.10,6.25]);
wall('muro norte estar',[-5.35,1.55,-1.62],[6.1,3.10,.30]);
wall('muro sur estar',[-5.35,1.55,4.71],[6.1,3.10,.30]);
wall('muro este',[8.38,1.55,1.55],[.30,3.10,6.28]);
wall('muro norte comedor',[5.35,1.55,-1.62],[6.1,3.10,.30]);
wall('muro sur comedor',[5.35,1.55,4.71],[6.1,3.10,.30]);
// Sliding glazing to court: structural piers flank a wide open gap.
wall('machón oeste norte',[-2.23,1.55,-1.16],[.30,3.1,.95]);
wall('machón oeste sur',[-2.23,1.55,3.44],[.30,3.1,2.52]);
wall('machón este norte',[2.27,1.55,-1.16],[.30,3.1,.95]);
wall('machón este sur',[2.27,1.55,3.44],[.30,3.1,2.52]);
// Glazed doors sit in rear pocket; 2m clear central openings
for(let x of [-2.38,2.42]){
 const openZ=.40;for(let z of [-.3,1.8]){glassPane('vidrio corredizo',[x,1.41,z],[.022,2.70,1.30]);rail('perfil vertical',[x,1.42,z-.65],[.05,2.80,.055]);rail('perfil vertical',[x,1.42,z+.65],[.05,2.80,.055]);}
 rail('cabezal corredera',[x,2.82,.7],[.07,.07,4.2]);}
// Studio around lower court: no roof across courtyard.
wall('estudio oeste',[-3.14,1.55,-5.45],[.27,3.1,4.95]);
wall('estudio este',[3.14,1.55,-5.45],[.27,3.1,4.95]);
wall('estudio fondo',[0,1.55,-7.84],[6.2,3.1,.27]);
wall('estudio fachada izquierda',[-2.64,1.55,-3.0],[.97,3.1,.24]);
wall('estudio fachada derecha',[2.64,1.55,-3.0],[.97,3.1,.24]);
doorFrame(0,-3.02,4.0);glassPane('vidrio estudio izquierda',[-1.35,1.4,-3.02],[1.15,2.68,.024]);glassPane('vidrio estudio derecha',[1.35,1.4,-3.02],[1.15,2.68,.024]);
// Roof sections incl. timber soffits and clerestory strips.
roof('cubierta estar',[-5.4,3.27,1.56],[6.25,.30,6.48]);
roof('cubierta comedor',[5.4,3.27,1.56],[6.25,.30,6.48]);
roof('cubierta estudio',[0,3.27,-5.48],[6.49,.30,5.05]);
for(let x of [-8.0,-7.4,-6.8,-6.2,-5.6,-5,-4.4,-3.8,-3.2,3.2,3.8,4.4,5,5.6,6.2,6.8,7.4,8])beam('tablilla cielorraso',[x,3.08,1.5],[.036,.065,6.10]);
// Thin pergola at second, rear patio; casts moving visually legible shadow.
for(let x=-1.85;x<=1.86;x+=.32)beam('lamas de sombra',[x,2.97,4.92],[.058,.14,2.48]);
// Large facing exterior lime wall forms second court backdrop.
wall('muro patio trasero',[0,1.45,6.30],[4.3,2.9,.20]);
// Fine boardform relief seams, material details, etc.
for(let yy=.4;yy<3.0;yy+=.47){box('línea enlucido',[-8.23,yy,1.6],[.014,.008,5.6],'sand',{opacity:.16});box('junta del patio',[0,yy,6.18],[3.84,.009,.01],'sand',{opacity:.20})}
// Living: modular sofa in taupe bouclé, solid walnut coffee table.
shadow('huella sofá',[-6.25,.012,2.0],[3.7,.016,1.45]);
box('bastidor sofá',[-6.14,.30,2.00],[3.34,.29,1.28],'darkWood',{finish:2});
for(let x of [-7.13,-6.15,-5.17]){smooth('cojín asiento',[x,.54,1.95],[.98,.30,1.15],'linen',{finish:4,roughness:1});smooth('respaldo',[x,.88,2.62],[.97,.69,.32],'textile',{finish:4,roughness:1});}
smooth('apoyabrazos izquierdo',[-7.8,.73,2.0],[.27,.62,1.35],'textile',{finish:4});smooth('apoyabrazos derecho',[-4.52,.73,2.0],[.27,.62,1.35],'textile',{finish:4});
// armchair near courtyard
shadow('contacto butaca',[-3.78,.02,-.42],[1.45,.018,1.12]);smooth('sillón nogal',[-3.82,.46,-.40],[1.06,.44,.87],'leather',{finish:4});smooth('respaldo butaca',[-3.82,.87,-.93],[1.06,.9,.27],'leather',{finish:4});for(let x of [-4.22,-3.42])for(let z of [-.67,-.13])cyl('patas butaca',[x,.22,z],[.068,.42,.068],'darkWood',{finish:2});
// low circular table, stone top and walnut tapered base
cyl('mesa redonda',[-5.4,.39,.37],[1.48,.10,1.48],'sand',{finish:3,roughness:.52});cyl('pie mesa',[-5.4,.19,.37],[.50,.36,.50],'timber',{finish:2});shadow('huella mesa',[-5.4,.013,.37],[1.55,.017,1.2]);
// ceramic vase and branch arrangement
cyl('vasija piedra',[-5.23,.51,.48],[.27,.24,.27],'plaster',{finish:1});cyl('flores tallo',[-5.23,.82,.48],[.019,.54,.019],'darkWood');sphere('ramas',[-5.21,1.04,.48],[.25,.16,.18],'foliage',{roughness:1});
// wall built-in: restrained details, shelving+sculpture
for(let y of [.65,1.2,1.75,2.30])beam('estante nogal',[-8.0,y,-.2],[.29,.07,2.0]);for(let z of [-.88,-.12,.7])cyl('cuenco artesanal',[-7.98,1.27,z],[.16,.09,.16],'gravel',{finish:3});
// Dining: original oval table and eight cantilever-ish wood chairs
shadow('sombra mesa comedor',[5.08,.012,1.52],[3.68,.017,1.83]);sphere('tablero mesa',[5.14,.79,1.47],[3.42,.14,1.57],'lightWood',{finish:2,roughness:.46});for(let x of [3.98,6.27]){box('pata mesa',[x,.40,1.48],[.18,.71,.70],'timber',{finish:2});}
function chair(x,z,angle=0){const group=[];let c=Math.cos(angle),s=Math.sin(angle);const tr=(dx,dz)=>[x+dx*c-dz*s,z+dx*s+dz*c];function cb(n,dx,y,dz,sc,col,op={}){let v=tr(dx,dz);return add(n,'round',[v[0],y,v[1]],sc,col,{...op,rotation:[0,angle,0]})}cb('asiento silla',0,.49,0,[.53,.115,.49],'lightWood',{finish:2});cb('respaldo moldeado',0,.87,-.23,[.57,.74,.08],'lightWood',{finish:2,rotation:[-.16,angle,0]});for(let dx of [-.21,.21])for(let dz of [-.19,.20]){let a=tr(dx,dz);cyl('pata silla',[a[0],.23,a[1]],[.04,.46,.04],'darkWood',{finish:2})}let v=tr(0,0);shadow('sombra silla',[v[0],.019,v[1]],[.65,.011,.60])}
for(let x of [4.13,5.12,6.10]){chair(x,.12,Math.PI);chair(x,2.85,0)}chair(3.29,1.5,Math.PI/2);chair(6.98,1.5,-Math.PI/2);
// Kitchen on east end: monolithic counters, bronze fittings, cabinetry.
for(let z of [-1.02,-.41,.20])box('puerta módulo cocina',[7.58,.63,z],[1.05,1.22,.56],'timber',{finish:2});
box('encimera piedra',[7.49,1.31,-.42],[1.43,.11,2.04],'plaster',{finish:3,roughness:.40});
for(let z of [-.86,-.52])cyl('grifería',[7.08,1.62,z],[.035,.55,.035],'brass',{metalness:.8,roughness:.26});
// Studio: long work table, task lamp, book spines, artwork frame
shadow('sombra escritorio',[0,.015,-6.45],[2.55,.016,.88]);smooth('sobre de nogal',[0,.78,-6.43],[2.40,.11,.83],'timber',{finish:2});for(let x of [-1.03,1.03])for(let z of [-6.73,-6.12])box('pata escritorio',[x,.39,z],[.078,.76,.08],'ink',{metalness:.65,roughness:.35});
smooth('banco estudio',[0,.43,-5.24],[1.09,.12,.42],'leather',{finish:4});for(let x of [-.45,.45])box('pata banco',[x,.21,-5.25],[.06,.42,.07],'darkWood',{finish:2});
for(let x=-2.45;x<-.5;x+=.18){let h=.38+(Math.sin(x*11)+1)*.16;box('libro de arquitectura',[x,1.15+h/2,-7.67],[.12,h,.35],x%2<1?'leather':'plaster',{finish:4})}
beam('biblioteca empotrada',[-1.42,1.01,-7.68],[2.5,.065,.42]);
for(let y of [1.48,2.0,2.52])beam('estante superior',[1.35,y,-7.67],[2.3,.055,.45]);
// Recessed LED-like practical lights in ceiling. Real illumination from shader point lights.
for(let p of [[-5.2,2.93,1.8],[5.1,2.95,1.4],[0,2.93,-5.5],[0,2.85,4.6]]){cyl('luminaria cobre',p,[.32,.075,.32],'brass',{metalness:.63,roughness:.22});cyl('difusor cálido',[p[0],p[1]-.055,p[2]],[.20,.026,.20],'night',{roughness:.20})}
// Courtyard A: shallow water, fine concrete perimeter, dry tree.
shadow('borde estanque',[.0,.015,-.6],[3.18,.028,3.55]);
box('borde norte estanque',[0,.125,-2.23],[3.25,.23,.21],'sand',{finish:3});box('borde sur estanque',[0,.125,1.01],[3.25,.23,.21],'sand',{finish:3});
box('borde este estanque',[1.52,.125,-.6],[.18,.23,3.0],'sand',{finish:3});box('borde oeste estanque',[-1.52,.125,-.6],[.18,.23,3.0],'sand',{finish:3});
box('agua quieta',[0,.043,-.60],[2.92,.025,2.96],'water',{opacity:.82,roughness:.10,metalness:.25});
// Stone island supports botanical centerpiece: nothing floating.
box('isla raíz',[-.42,.20,-.55],[.78,.27,.78],'gravel',{finish:3});
// Cylinders between two points, directional geometry aligns local Y axis.
function branch(name,a,b,r,c='darkWood'){const p=vec.mul(vec.add(a,b),.5),d=vec.sub(b,a),len=vec.length(d),dir=vec.norm(d);let yaw=Math.atan2(dir[0],dir[2]),pitch=Math.acos(Math.min(1,Math.max(-1,dir[1])));let o=add(name,'cylinder',p,[r*2,len,r*2],c,{roughness:1,finish:2});let theta=Math.asin(Math.max(-1,Math.min(1,dir[2]))),phi=Math.atan2(-dir[0],dir[1]);o.model=mat.multiply(mat.translation(...p),mat.multiply(mat.rotationZ(phi),mat.multiply(mat.rotationX(theta),mat.scaling(r*2,len,r*2))));return o}
branch('olivo tronco',[-.42,.29,-.55],[-.34,2.12,-.55],.097);
for(let [ex,ey,ez] of [[-1.13,2.43,-.32],[.32,2.37,-.49],[-.74,2.83,-1.1],[.02,2.87,.17]])branch('olivo rama',[-.34,1.8,-.55],[ex,ey,ez],.045);
for(let i=0;i<58;i++){const a=i*2.3999,rad=.4+.64*((i*13%61)/61),yy=2.22+.50*Math.cos(i*.68);sphere('hojas olivo',[-.42+Math.cos(a)*rad,yy,-.50+Math.sin(a)*rad*.65],[.23+.08*(i%3),.13+.03*(i%5),.13],i%3===0?'foliage2':i%3===1?'foliage':'foliage3',{roughness:1})}
// secondary patio: gravel and columnar planting, screened view.
box('jardin de grava',[0,.04,4.86],[3.66,.09,1.92],'gravel',{finish:3});
for(let j=0;j<5;j++){let x=-1.44+j*.74,z=4.58+.26*(j%2);cyl('tronco lapacho',[x,.59,z],[.09,1.11,.09],'darkWood',{finish:2});for(let k=0;k<8;k++){let a=k*2.38+j; sphere('follaje juvenil',[x+Math.cos(a)*.26,1.35+.24*Math.sin(k*1.7),z+Math.sin(a)*.21],[.31,.38,.22],(j+k)%3===0?'foliage2':'foliage',{roughness:1})}}
// Court stepping stones (no collision, stable composition), pots and pond lip.
for(let z of [3.65,4.45,5.23])smooth('paso de travertino',[0,.13,z],[.66,.09,.39],'plaster',{finish:3});
// Wall art is authored abstract relief, not a borrowed photograph.
box('panel relieve',[-7.95,1.70,4.52],[1.88,1.13,.055],'sand',{finish:3});for(let j=0;j<7;j++)box('incisión relieve',[-8.72+j*.25,1.72+Math.sin(j)*.10,4.56],[.055,.62+.09*(j%3),.015],j%2?'timber':'plaster',{finish:3});
export const architecturalScene={objects,dimensions:{unit:'metres',envelope:[16.76,15.2],ceiling:3.12,rooms:{sala:[6.1,6.25],comedor:[6.1,6.25],estudio:[6.0,4.7]},courtyards:2},materials:colors};
