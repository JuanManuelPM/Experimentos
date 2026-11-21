// Transport Retro V3: explicit full-story shot list; authored as successor to V1.
export const SHOTS=[
{id:'exterior-night',duration:5,a:[5.7,3.3,12],b:[4.5,2.9,8.6],ta:[0,1.25,0],tb:[0,1.35,2.0],fov:62},
{id:'curb-arrival',duration:6,a:[2.65,1.65,9.7],b:[1.25,1.68,7.6],ta:[0,1.25,8.2],tb:[0,1.25,6.4],fov:55},
{id:'boarding',duration:8,a:[-.42,1.63,5.45],b:[-.45,1.52,3.0],ta:[0,1.42,6.35],tb:[0,1.38,3.0],fov:66},
{id:'aisle-follow',duration:9,a:[0,1.64,2.0],b:[0,1.55,-1.6],ta:[0,1.26,1.0],tb:[0,1.35,-2.3],fov:64},
{id:'greeting',duration:6,a:[-.22,1.48,-1.9],b:[.24,1.36,-1.62],ta:[1.10,1.25,-1.20],tb:[0,1.38,-1.4],fov:50},
{id:'taking-seat',duration:7,a:[.36,1.54,-2.0],b:[0,1.37,-3.15],ta:[-.91,1.0,-2.43],tb:[-1.16,.98,-2.45],fov:57},
{id:'interior-wide',duration:7,a:[0,1.8,-5.4],b:[.16,1.76,-4.75],ta:[0,1.50,1.2],tb:[0,1.42,3.4],fov:69},
{id:'city-through-window',duration:7,a:[-.14,1.51,-2.8],b:[-1.05,1.45,-2.8],ta:[-7,1.52,-3.6],tb:[-8,1.5,-1.5],fov:61},
{id:'last-stop-exterior',duration:7,a:[-5.8,3.5,-7.5],b:[-4.5,3.0,-10.5],ta:[0,1.5,-.9],tb:[0,1.5,0],fov:64}
];
export const TOTAL_SECONDS=SHOTS.reduce((a,s)=>a+s.duration,0);
export function shotStart(i){return SHOTS.slice(0,i).reduce((a,s)=>a+s.duration,0)}
export function cameraAt(t){let a=0;let tt=Math.max(0,Math.min(TOTAL_SECONDS-.0001,t));for(let i=0;i<SHOTS.length;i++){const s=SHOTS[i];if(tt<a+s.duration){const q=(tt-a)/s.duration,u=q*q*(3-2*q);const lerp=(x,y)=>x.map((v,k)=>v+(y[k]-v)*u);return{id:s.id,index:i,eye:lerp(s.a,s.b),target:lerp(s.ta,s.tb),fov:s.fov,progress:u}}a+=s.duration;}throw Error('CAMERA_RANGE')}
