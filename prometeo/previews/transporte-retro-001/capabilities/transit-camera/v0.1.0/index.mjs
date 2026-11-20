export const SHOTS=[
{id:"threshold",duration:5,a:[0,1.69,7.2],b:[0,1.66,5.5],ta:[0,1.45,0],tb:[0,1.4,-1],fov:66},
{id:"boarding",duration:6,a:[0,1.66,5.5],b:[0,1.61,2.8],ta:[0,1.4,-1],tb:[0,1.45,-2.8],fov:70},
{id:"aisle",duration:7,a:[0,1.61,2.8],b:[0,1.54,-1.5],ta:[0,1.45,-2.8],tb:[0,1.32,-4.0],fov:69},
{id:"passengers",duration:7,a:[0,1.54,-1.5],b:[.15,1.50,-1.9],ta:[1.12,1.45,-1.2],tb:[-1.12,1.4,-1.2],fov:56},
{id:"seat-search",duration:5,a:[.15,1.50,-1.9],b:[-.18,1.47,-2.25],ta:[-1.14,.72,-2.45],tb:[-1.17,.65,-2.45],fov:65},
{id:"sit",duration:5,a:[-.18,1.47,-2.25],b:[-1.08,1.18,-2.45],ta:[-1.17,.65,-2.45],tb:[.35,1.34,-2.9],fov:67},
{id:"passenger-pov",duration:9,a:[-1.08,1.18,-2.45],b:[-1.08,1.18,-2.45],ta:[.35,1.34,-2.9],tb:[.80,1.44,-.8],fov:64}
];
export function createCameraKit(shots){
 if(!Array.isArray(shots)||!shots.length||shots.some(s=>!(s.duration>0)||![s.a,s.b,s.ta,s.tb].every(v=>Array.isArray(v)&&v.length===3&&v.every(Number.isFinite))))throw Error("invalid camera shotlist");
 const total=shots.reduce((n,s)=>n+s.duration,0);
 const start=index=>shots.slice(0,index).reduce((n,s)=>n+s.duration,0);
 const at=t=>{let k=Math.max(0,Math.min(total-0.0001,t)),elapsed=0;for(let i=0;i<shots.length;i++){const s=shots[i];if(k<elapsed+s.duration){let u=(k-elapsed)/s.duration;u=u*u*(3-2*u);const lerp=(a,b)=>a.map((v,j)=>v+(b[j]-v)*u);return {id:s.id,index:i,eye:lerp(s.a,s.b),target:lerp(s.ta,s.tb),fov:s.fov||65,progress:u}}elapsed+=s.duration}throw Error("camera timeline invariant")};
 return {shots,total,start,at};
}
const kit=createCameraKit(SHOTS);
export const TOTAL_SECONDS=kit.total;
export function shotStart(index){return kit.start(index)}
export function cameraAt(t){return kit.at(t)}
