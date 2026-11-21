/** PROMETEO 3D / respawn-desk V3 adapted from V2 / original editable low-poly portrait, MIT.
 * Hand-authored loft contours + facial topology + garments. No box/sphere/cylinder characters.
 * This is an anonymous fictional person, NEVER a likeness of the user.
 * UV atlas is generated from original deterministic pixels, with no external assets.
 */
export const ACTOR_VERSION='0.3.0';
const skin=[.77,.57,.41],shadow=[.57,.38,.30],ink=[.115,.11,.145],hair=[.085,.102,.132],
  shirt=[.24,.29,.32],jacket=[.16,.24,.28],seam=[.36,.29,.23],steel=[.37,.42,.45];
const sub=(a,b)=>a.map((v,i)=>v-b[i]);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const normal=(a,b,c)=>{let v=cross(sub(b,a),sub(c,a)),l=Math.hypot(...v)||1;return v.map(x=>x/l)};
class Mesh {
 constructor(){this.p=[];this.n=[];this.c=[];this.e=[];this.uv=[];this.faces=0}
 v(p,n,col,uv,em=0){this.p.push(...p);this.n.push(...n);this.c.push(...col);this.e.push(em);this.uv.push(...uv)}
 tri(a,b,c,col,uvA=[0,0],uvB=[0,0],uvC=[0,0],em=0){const n=normal(a,b,c);this.v(a,n,col,uvA,em);this.v(b,n,col,uvB,em);this.v(c,n,col,uvC,em);this.faces++}
 quad(a,b,c,d,col,u0=[0,0],u1=[0,0],u2=[0,0],u3=[0,0]){this.tri(a,b,c,col,u0,u1,u2);this.tri(a,c,d,col,u0,u2,u3)}
 loft(rings,col,rect=[0,.5,0,.5],N=24){
  const [u0,uw,v0,vh]=rect;
  const circ=(r,j)=>{const t=2*Math.PI*j/N;const x=r.x+Math.cos(t)*r.rx;const z=r.z+Math.sin(t)*r.rz;return [x,r.y,z]};
  for(let i=0;i<rings.length-1;i++)for(let j=0;j<N;j++){
   const a=circ(rings[i],j),b=circ(rings[i],j+1),c=circ(rings[i+1],j+1),d=circ(rings[i+1],j);
   this.quad(a,d,c,b,col,[u0+uw*j/N,v0+vh*i/(rings.length-1)],[u0+uw*j/N,v0+vh*(i+1)/(rings.length-1)],
   [u0+uw*(j+1)/N,v0+vh*(i+1)/(rings.length-1)],[u0+uw*(j+1)/N,v0+vh*i/(rings.length-1)]);
  }
 }
 strip(points,width,col,uv=[.75,.75]){for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i];this.quad([a[0]-width,a[1],a[2]],[a[0]+width,a[1],a[2]],[b[0]+width,b[1],b[2]],[b[0]-width,b[1],b[2]],col,uv,uv,uv,uv)}}
 serialize(){return{positions:new Float32Array(this.p),normals:new Float32Array(this.n),colors:new Float32Array(this.c),
 emissives:new Float32Array(this.e),uvs:new Float32Array(this.uv),count:this.e.length,faces:this.faces}}
}
function eye(mesh,s){const x=s*.11,y=1.984,z=.171;
 // angular eyelid, iris, pupil and catchlight in real 3D planes facing the portrait camera (-Z)
 mesh.tri([x-.058,y,z],[x,y+.031,z-.010],[x+.059,y,z],shadow,[.2,.75],[.22,.78],[.24,.75]);
 mesh.tri([x-.046,y-.006,z-.009],[x,y-.030,z-.015],[x+.045,y-.006,z-.009],skin,[.2,.70],[.22,.68],[.24,.70]);
 const steps=10,r=.022;for(let i=0;i<steps;i++){const a=i*2*Math.PI/steps,b=(i+1)*2*Math.PI/steps;
 mesh.tri([x,y-.003,z-.018],[x+Math.cos(a)*r,y-.003+Math.sin(a)*r,z-.018],[x+Math.cos(b)*r,y-.003+Math.sin(b)*r,z-.018],ink,[.75,.72],[.77,.7],[.78,.71]);}
 mesh.tri([x-.008,y+.004,z-.020],[x-.003,y+.010,z-.021],[x+.001,y+.003,z-.020],[.75,.76,.70]);
 mesh.strip([[x-.058,y+.056,z-.014],[x-.025,y+.065,z-.021],[x+.032,y+.053,z-.02]],.008,hair,[.72,.77]);
 // thin vintage glasses frame, drawn from mesh ribbons rather than toruses
 const pts=[];for(let j=0;j<=12;j++){const t=2*Math.PI*j/12;pts.push([x+Math.cos(t)*.082,y+Math.sin(t)*.068,z-.025])}
 mesh.strip(pts,.007,steel,[.7,.62]);
}
function jacketBody(mesh,standing=false){
 mesh.loft([
 {x:0,y:.89,z:.54,rx:.30,rz:.26},{x:0,y:1.03,z:.54,rx:.36,rz:.28},
 {x:0,y:1.25,z:.54,rx:.36,rz:.26},{x:0,y:1.50,z:.54,rx:.42,rz:.27},
 {x:0,y:1.59,z:.53,rx:.34,rz:.23},{x:0,y:1.67,z:.50,rx:.15,rz:.14}
 ],jacket,[0,.5,0,.5],22);
 // Lapels are folded quadrilateral panels, legible even in 3/4.
 for(const s of [-1,1]){
 mesh.quad([0,1.61,.251],[s*.155,1.57,.23],[s*.255,1.21,.285],[s*.08,1.30,.257],seam);
 mesh.tri([0,1.64,.28],[s*.12,1.58,.215],[s*.04,1.36,.21],shirt);
 // asymmetric collar and shoulder seam
 mesh.strip([[s*.11,1.65,.34],[s*.24,1.57,.28],[s*.35,1.47,.31]],.012,seam);
 }
 // Tunic zipper/lining and small badge (fictional, no real branding).
 mesh.strip([[0,1.56,.239],[0,1.28,.244],[0,1.03,.265]],.012,steel);
 mesh.quad([-.28,1.31,.24],[-.18,1.31,.236],[-.18,1.25,.233],[-.28,1.25,.235],[.22,.39,.43]);
 // Pants sitting on chair; loft custom noncircular silhouette with trouser seams.
 if(!standing)for(const s of [-1,1])mesh.loft([
 {x:s*.21,y:.60,z:.28,rx:.17,rz:.18},{x:s*.20,y:.82,z:.38,rx:.21,rz:.23},
 {x:s*.17,y:1.00,z:.54,rx:.22,rz:.24}
 ],shirt,[.52,.47,0,.5],12);
 // Left forearm, with elbow bend and cuff as shaped garment.
 mesh.loft([
 {x:-.32,y:1.53,z:.53,rx:.16,rz:.16},{x:-.47,y:1.34,z:.25,rx:.145,rz:.14},
 {x:-.40,y:1.19,z:-.21,rx:.119,rz:.115},{x:-.29,y:1.15,z:-.67,rx:.088,rz:.087}
 ],jacket,[0,.5,0,.5],12);
 mesh.loft([{x:-.29,y:1.15,z:-.70,rx:.093,rz:.086},{x:-.29,y:1.13,z:-.78,rx:.088,rz:.079}],skin,[0,.48,.53,.4],12);
 for(let k=0;k<4;k++){const x=-.39+k*.057;mesh.strip([[x,1.13,-.77],[x,1.116,-.93]],.013,skin,[.15,.74]);}
}
function movingArm(mesh){
 // Origin in same world as scene. Rotates about the right shoulder for hand-to-face gesture.
 mesh.loft([
 {x:.32,y:1.53,z:.53,rx:.16,rz:.16},{x:.47,y:1.34,z:.25,rx:.146,rz:.14},
 {x:.40,y:1.19,z:-.21,rx:.117,rz:.113},{x:.29,y:1.15,z:-.67,rx:.088,rz:.086}
 ],jacket,[0,.5,0,.5],14);
 mesh.loft([{x:.29,y:1.15,z:-.69,rx:.088,rz:.085},{x:.29,y:1.13,z:-.81,rx:.082,rz:.076}],skin,[0,.48,.53,.4],12);
 for(let k=0;k<4;k++){const x=.19+k*.058;mesh.strip([[x,1.135,-.78],[x,1.112,-.92]],.013,skin,[.15,.74]);}
}
function greetingArm(mesh){
 // Pose specific to the reverse portrait shot, after a deliberate cinematic cut.
 // Wrist is beside cheek, NOT close to the lens where perspective would turn it gigantic.
 mesh.loft([
 {x:.33,y:1.53,z:.50,rx:.15,rz:.15},
 {x:.48,y:1.37,z:.42,rx:.135,rz:.127},
 {x:.54,y:1.31,z:.38,rx:.118,rz:.110},
 {x:.57,y:1.54,z:.315,rx:.100,rz:.094},
 {x:.56,y:1.76,z:.29,rx:.084,rz:.080}
 ],jacket,[0,.5,0,.5],12);
 // Cut cuff and 3D palm silhouette, fingers spread with readable negative space.
 mesh.loft([
 {x:.56,y:1.76,z:.285,rx:.088,rz:.077},
 {x:.56,y:1.83,z:.28,rx:.093,rz:.063},
 {x:.56,y:1.94,z:.274,rx:.104,rz:.042}
 ],skin,[0,.48,.53,.4],12);
 for(let k=0;k<4;k++){
  let x=.475+k*.056, length=[.12,.17,.15,.10][k];
  mesh.quad([x,1.91,.228],[x,1.94+length,.220],[x+.038,1.92+length,.226],[x+.041,1.91,.229],skin);
  mesh.tri([x,1.94+length,.220],[x+.019,1.966+length,.224],[x+.038,1.92+length,.226],skin);
 }
 mesh.quad([.47,1.82,.225],[.401,1.86,.20],[.392,1.95,.202],[.48,1.92,.227],skin);
}
function head(mesh){
 // Profile-modelled face: jaw, cheekbones, brow, cranial dome. Not SphereGeometry.
 mesh.loft([
 {x:0,y:1.695,z:.462,rx:.048,rz:.09},{x:0,y:1.73,z:.458,rx:.155,rz:.17},
 {x:0,y:1.81,z:.457,rx:.221,rz:.235},{x:0,y:1.90,z:.452,rx:.268,rz:.263},
 {x:0,y:1.98,z:.451,rx:.290,rz:.277},{x:0,y:2.07,z:.455,rx:.292,rz:.275},
 {x:0,y:2.14,z:.467,rx:.271,rz:.264},{x:0,y:2.22,z:.47,rx:.203,rz:.207},
 {x:0,y:2.28,z:.47,rx:.04,rz:.07}
 ],skin,[0,.49,.50,.47],32);
 // Nose ridge/bridge with bespoke wedge topology and secondary highlights.
 mesh.tri([-.037,1.972,.188],[0,1.902,.094],[.037,1.972,.188],skin,[.2,.7],[.22,.64],[.24,.7]);
 mesh.tri([-.037,1.972,.188],[-.043,1.884,.154],[0,1.902,.094],shadow);
 mesh.tri([.037,1.972,.188],[0,1.902,.094],[.043,1.884,.154],shadow);
 mesh.tri([-.046,1.887,.158],[0,1.872,.135],[.046,1.887,.158],shadow);
 // Mouth as cut planes, lower lip, chin highlight
 mesh.strip([[-.069,1.799,.23],[0,1.792,.210],[.066,1.801,.228]],.007,[.39,.23,.21],[.16,.69]);
 mesh.tri([-.054,1.781,.223],[0,1.768,.213],[.051,1.781,.222],[.72,.44,.39]);
 // Ears: deliberate folded polygons, not sphere appendages.
 for(const s of [-1,1]){
 mesh.tri([s*.266,2.014,.47],[s*.329,1.964,.449],[s*.304,1.88,.456],skin);
 mesh.tri([s*.266,2.014,.47],[s*.304,1.88,.456],[s*.263,1.915,.435],shadow);
 eye(mesh,s);
 }
 // Hair cap uses independent loft and shaped frontal fringe.
 mesh.loft([{x:0,y:2.102,z:.471,rx:.292,rz:.282},{x:0,y:2.183,z:.478,rx:.278,rz:.264},
 {x:0,y:2.268,z:.47,rx:.223,rz:.219},{x:0,y:2.325,z:.47,rx:.065,rz:.08}],hair,[.51,.48,.52,.47],28);
 const bangs=[[-.282,2.13,.27],[-.19,2.10,.17],[-.06,2.11,.19],[.045,2.095,.167],[.175,2.13,.20],[.278,2.14,.30]];
 for(let i=1;i<bangs.length;i++)mesh.tri(bangs[i-1],bangs[i],[bangs[i][0]-.035,2.048,bangs[i][2]+.01],i%2?hair:ink,[.55,.80],[.72,.75],[.58,.70]);
 for(const s of [-1,1])mesh.tri([s*.27,2.10,.44],[s*.308,1.94,.44],[s*.26,1.91,.44],hair);
 // Neck shaped taper, under chin
 mesh.loft([{x:0,y:1.55,z:.51,rx:.137,rz:.12},{x:0,y:1.68,z:.49,rx:.129,rz:.12},{x:0,y:1.731,z:.49,rx:.151,rz:.13}],shadow,[0,.48,.53,.40],16);
}
// Standing pose adds independent sculpted trouser legs and footwear to the pre-existing UV actor.
function standingLeg(mesh,s){
 mesh.loft([
 {x:s*.19,y:.10,z:.50,rx:.153,rz:.156},{x:s*.19,y:.32,z:.50,rx:.154,rz:.162},
 {x:s*.18,y:.62,z:.49,rx:.169,rz:.168},{x:s*.18,y:.95,z:.50,rx:.194,rz:.183}
 ],shirt,[.52,.47,0,.5],14);
 mesh.loft([
 {x:s*.19,y:.065,z:.42,rx:.153,rz:.278},{x:s*.19,y:.16,z:.48,rx:.158,rz:.264},
 {x:s*.19,y:.24,z:.51,rx:.159,rz:.171}
 ],ink,[.52,.47,0,.5],14);
 mesh.strip([[s*.19,.27,.345],[s*.19,.51,.324],[s*.18,.88,.327]],.010,seam,[.76,.72]);
}
export function createActorMeshes(style={}){const body=new Mesh(),portrait=new Mesh(),gesture=new Mesh(),greeting=new Mesh(),standingTorso=new Mesh(),legL=new Mesh(),legR=new Mesh();
 jacketBody(body);jacketBody(standingTorso,true);standingLeg(legL,-1);standingLeg(legR,1);head(portrait);movingArm(gesture);greetingArm(greeting);
 const meshes={body:body.serialize(),portrait:portrait.serialize(),gesture:gesture.serialize(),greeting:greeting.serialize(),standingTorso:standingTorso.serialize(),legL:legL.serialize(),legR:legR.serialize()};
 const swaps=[[skin,style.skin],[hair,style.hair],[jacket,style.coat],[shirt,style.shirt]];
 for(const mesh of Object.values(meshes))for(let i=0;i<mesh.colors.length;i+=3){
   for(const [from,to] of swaps)if(Array.isArray(to)&&to.length===3&&to.every(v=>Number.isFinite(v)&&v>=0&&v<=1)&&
   Math.abs(mesh.colors[i]-from[0])<1e-5&&Math.abs(mesh.colors[i+1]-from[1])<1e-5&&Math.abs(mesh.colors[i+2]-from[2])<1e-5){
    for(let k=0;k<3;k++)mesh.colors[i+k]=to[k];break;
   }
 }
 return meshes;
}
export function createActorAtlas(size=128){
 const out=new Uint8Array(size*size*4);for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const u=x/size,v=y/size,grain=((x*43+y*97+(x*y*13))%29)/29;
  let c;
  if(v>.5&&u<.5)c=[230,207,181]; // skin freckles + tonal gradation
  else if(v>.5)c=[153,170,185]; // strands on hair (multiplied by base color)
  else if(u<.5)c=[153,179,176]; // jacket weave
  else c=[170,174,183]; // pants/collar
  const k=(grain-.5)*14+(u>.5&&v>.5&&(x%5===0)?10:0)+(u<.5&&v<.5&&(x+y)%7===0?10:0);
  const idx=4*(y*size+x);for(let j=0;j<3;j++)out[idx+j]=Math.max(0,Math.min(255,Math.round(c[j]+k)));out[idx+3]=255;
 }
 return{width:size,height:size,bytes:out};
}
