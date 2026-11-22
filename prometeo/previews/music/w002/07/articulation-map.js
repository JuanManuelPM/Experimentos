// CUERPO Y CIRCUITO · motor de articulaciones reutilizable (sin dependencias).
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function articulation(note,previous=null,sourceFeatures={}){
 const gap=previous?Math.max(.03,note.beat-previous.beat):4;
 const strength=clamp(Number(note.velocity)||.5,0,1);
 const attack=clamp(sourceFeatures.attackMs??18,2,150);
 const brightness=clamp(sourceFeatures.brightness??.12,0,.5);
 const breath=clamp(gap/2,0,1);
 const picked=note.layer==='p'?1:0;
 return Object.freeze({
  gapBeats:+gap.toFixed(3),strength,attackMs:attack,
  echoGain:clamp(.095+strength*.24+breath*.18,0,.53),
  echoSeconds:clamp(.18+(.1*breath)+.06*picked,.16,.38),
  resonanceHz:clamp(480+1600*strength+600*brightness+180*picked,350,3400),
  responseGain:clamp(.095+.25*strength+.11*picked+.04*breath,0,.52),
  responseSeconds:clamp(.33+.65*breath+.09*picked,.28,1.4),
  pressure:clamp(.2+.65*strength+.18*picked,0,1)
 });
}
export function inspectRecording(buffer){
 if(!buffer||!buffer.length)return {attackMs:18,brightness:.12};
 const data=buffer.getChannelData(0),sr=buffer.sampleRate,steps=Math.min(data.length,Math.floor(sr*.12));
 let max=0,zero=0,prev=data[0]||0;
 for(let i=0;i<steps;i++){const a=data[i];max=Math.max(max,Math.abs(a));if((a>0)!==(prev>0))zero++;prev=a;}
 let first=0;for(let i=0;i<steps;i++){if(Math.abs(data[i])>max*.18){first=i;break;}}
 return {attackMs:Math.max(2,1000*first/sr),brightness:Math.min(.5,zero/(steps||1))};
}
