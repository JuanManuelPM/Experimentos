// Pure, deterministic behavior. No renderer, audio or geometry dependencies.
export const PERSONALITIES={
 iris:{near:.75,far:1.02,brow:.94,head:.24,speed:8,blink:3.7,smile:-.12},
 soter:{near:.64,far:.90,brow:.58,head:.16,speed:5,blink:5.1,smile:0},
 nara:{near:.90,far:1.16,brow:.72,head:.32,speed:10,blink:2.9,smile:.34}
};
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const mix=(a,b,t)=>a+(b-a)*t;
export const ZERO={lookX:0,lookY:0,browL:0,browR:0,blink:0,mouth:0,smile:0};
export function initState(seed=0){return {pose:{...ZERO},near:false,yaw:0,pitch:0,blinkAt:1.4+(seed%7)*.37,blinkStart:-10,seed,clock:0}}
export function updateBehavior(state,input,dt,personality=PERSONALITIES.iris){
 dt=clamp(Number.isFinite(dt)?dt:0,0,.12);state.clock+=dt;
 let [x,y,z]=input.target||[0,0,1],distance=Math.hypot(x,y,z),front=z>0.025;
 state.near=front&&(state.near?distance<personality.far:distance<personality.near);
 let yaw=front?Math.atan2(x,z):0,pitch=front?Math.atan2(y,Math.hypot(x,z)):0;
 let alpha=1-Math.exp(-personality.speed*dt);
 let headYaw=clamp(yaw*personality.head,-.34,.34),headPitch=clamp(-pitch*personality.head,-.20,.20);
 state.yaw=mix(state.yaw,headYaw,alpha);state.pitch=mix(state.pitch,headPitch,alpha);
 let lookX=clamp((yaw-state.yaw)/.52,-1,1),lookY=clamp((pitch+state.pitch)/.38,-1,1);
 if(state.clock>=state.blinkAt){state.blinkStart=state.clock;state.blinkAt=state.clock+personality.blink+((state.seed*17+Math.floor(state.clock*13))%9)*.13}
 let t=state.clock-state.blinkStart,blink=t>=0&&t<.19?Math.sin(Math.PI*t/.19):0;
 let talking=clamp(input.speech||0),reaction=state.near?personality.brow:0;
 let desired={lookX,lookY,browL:reaction*(x<0?1:.20),browR:reaction*(x>=0?1:.20),blink,mouth:talking,smile:state.near?personality.smile:0};
 for(let k of Object.keys(ZERO))state.pose[k]=k==='blink'?desired[k]:mix(state.pose[k],desired[k],alpha);
 return state;
}
export function runBehaviorTests(){let tests=[];const test=(name,pass)=>tests.push({name,pass:!!pass}),step=(s,t,n=30,p=PERSONALITIES.iris)=>{for(let i=0;i<n;i++)updateBehavior(s,t,.04,p);return s};
 let a=step(initState(),{target:[.6,0,1]}),b=step(initState(),{target:[-.6,0,1]});test('gaze follows opposite sides',a.pose.lookX>.3&&b.pose.lookX<-.3);
 test('head assists gaze',a.yaw>0&&b.yaw<0);
 let c=step(initState(),{target:[.1,0,.4]});test('near raises independent brow',c.near&&c.pose.browR>.7&&c.pose.browL<c.pose.browR);
 step(c,{target:[0,0,.85]});test('hysteresis holds',c.near);step(c,{target:[0,0,1.3]});test('hysteresis releases',!c.near&&c.pose.browR<.05);
 test('behind object not tracked',!step(initState(),{target:[.1,0,-.2]}).near);
 let n=step(initState(),{target:[0,0,.8]},30,PERSONALITIES.nara),i=step(initState(),{target:[0,0,.8]},30,PERSONALITIES.iris);test('personalities react differently',n.near&&!i.near);
 let p=step(initState(),{target:[0,0,1],speech:.8});test('speech drives mouth',p.pose.mouth>.7);step(p,{target:[0,0,1]});test('mouth returns neutral',p.pose.mouth<.03);
 let blink=initState(0),peak=0;for(let i=0;i<100;i++){updateBehavior(blink,{target:[0,0,1]},.025);peak=Math.max(peak,blink.pose.blink)}test('autonomous blink',peak>.85);
 let all=Array.from({length:25},(_,i)=>initState(i));for(let j=0;j<80;j++)all.forEach((s,i)=>updateBehavior(s,{target:[Math.sin(j*.13)-i*.04,0,.5]},.025,Object.values(PERSONALITIES)[i%3]));test('25 independent bounded states',all.every(s=>Object.values(s.pose).every(x=>Number.isFinite(x)&&Math.abs(x)<=1)&&Math.abs(s.yaw)<=.34)&&all[0]!==all[1]);
 return {status:tests.every(t=>t.pass)?'PASS':'FAIL',tests}}
