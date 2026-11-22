/** W7 · original botanical hierarchy and CPU geometric LOD; engine-independent. */
export const MORPHOLOGY={0:'Quercus robur: broad arms',1:'Betula pendula: narrow hanging twigs',2:'Acer campestre: clustered round crown',3:'Pinus sylvestris: evergreen whorls',4:'Salix alba: pendant riverbank foliage'};
const seeded=seed=>{let x=(seed>>>0)||1;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}};
export function buildBroadleaf(tree,emit,detail=1){
 const {x,y,z,height:h,species:k}=tree;if(k===3)return{branches:0,leaves:0,hanging:0};
 const rand=seeded((tree.seed||17)^((k+1)*19291)),rad=h*(k===4?.052:k===1?.036:.060);
 const bark=k===1?[.77,.77,.73]:k===4?[.36,.32,.27]:k===2?[.34,.27,.23]:[.29,.245,.195];
 emit.branch([x,y,z],[x,y+h*(k===1?.83:k===4?.57:.67),z],rad,rad*.30,bark,7);
 let branches=1,leaves=0,hanging=0;const twig=(a,b,r)=>{emit.branch(a,b,r,.008,bark,4);branches++};
 const leaf=(p,s)=>{emit.leaf(p[0],p[1],p[2],s,rand()*6.283,k,.72+rand()*.48);leaves++};
 const n=Math.max(4,Math.round((k===1?7:k===4?7:9)*detail));
 for(let b=0;b<n;b++){
  const level=(b+.3+rand()*.4)/n,angle=b*2.39996+rand()*.4,t=.29+level*(k===1?.56:k===4?.40:.47);
  const start=[x,y+h*t,z],stretch=h*(k===1?.13:k===4?.36:k===0?.33:.25)*(.65+rand()*.45),lift=k===4?-.23:k===1?.88:.45;
  const mid=[x+Math.cos(angle)*stretch*.52,y+h*t+lift*stretch*.66,z+Math.sin(angle)*stretch*.52];
  const end=[x+Math.cos(angle+.20)*stretch,y+h*t+lift*stretch+(k===1?rand()*.55:0),z+Math.sin(angle+.20)*stretch];
  twig(start,mid,rad*(.20+rand()*.06));twig(mid,end,rad*.095);
  for(let j=0;j<2;j++){
   const off=(j-.5)*.58+(rand()-.5)*.3,extent=stretch*(k===1?.21:.27)*(.65+rand()*.6);
   const pos=[end[0]+Math.cos(angle+off)*extent,end[1]+(k===4?-.52:.34)*extent,end[2]+Math.sin(angle+off)*extent];
   if(detail>=.86)twig(end,pos,rad*.041);
   const groups=k===4?4:Math.max(3,Math.round((k===1?5:8)*detail));
   for(let q=0;q<groups;q++){
    const az=rand()*6.283,r=.21+rand()*.6,c=[pos[0]+Math.cos(az)*r,pos[1]+(rand()-.5)*.6+(k===4?-q*.29:0),pos[2]+Math.sin(az)*r],s=k===1?.46:k===4?.56:k===2?.56:.66;
    for(let m=0;m<(k===4?3:k===1?3:4);m++){
     const spread=s*(k===4?.65:1.12);
     leaf([c[0]+(rand()-.5)*spread*2.8,c[1]+(rand()-.5)*spread*2,c[2]+(rand()-.5)*spread*2.8],s*(.85+rand()*.58));
    }
    if(k===4){hanging++;if(q%2===1){const drop=[c[0]+.09,c[1]-h*(.055+rand()*.05),c[2]+.12];if(detail>=.86)twig(c,drop,rad*.014);leaf(drop,s*.77)}}
   }
  }
 }
 const inner=Math.round((k===1?65:k===4?70:155)*detail);
 for(let i=0;i<inner;i++){const a=rand()*6.283,t=Math.sqrt(rand()),v=rand()*2-1,cx=h*(k===1?.115:k===4?.22:.235)*t,cy=y+h*(k===1?.75:k===4?.58:.72)+v*h*(k===1?.16:.15);
  leaf([x+Math.cos(a)*cx,cy,z+Math.sin(a)*cx],(k===1?.43:.58)*(.75+rand()*.4));
 }
 return{branches,leaves,hanging,rad};
}
export function selectInstances(source,eye,q,species){
 const base=species>=5?q.grasses:q.leaves,max2=q.distance*q.distance,out=[];let near=0,mid=0,far=0;
 for(let i=0;i<source.length;i+=7){
  const dx=source[i]-eye.x,dz=source[i+2]-eye.z,d2=dx*dx+dz*dz;if(d2>max2)continue;
  const d=Math.sqrt(d2),lod=d<26?1:d<60?.73:.36,r=((Math.imul(i/7+1,2654435761)>>>0)%10007)/10007;
  if(r>=base*lod)continue;for(let j=0;j<7;j++)out.push(source[i+j]);
  if(d<26)near++;else if(d<60)mid++;else far++;
 }
 return{data:new Float32Array(out),count:out.length/7,near,mid,far};
}
