/** PROMETEO acting laboratory: deterministic 24 fps choreography, no GLB mutations. */
export const FPS=24, END=480;
export const SHOTS=Object.freeze([
 {id:'S01_ESTUDIO',start:0,end:168},
 {id:'S02_GIRO',start:168,end:240},
 {id:'S03_RECUMBRA',start:240,end:310},
 {id:'S04_ROSTRO',start:310,end:350},
 {id:'S05_MANOS',start:350,end:430},
 {id:'S06_REGRESO',start:430,end:480}
]);
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
export const smooth=x=>{const u=clamp(x,0,1);return u*u*(3-2*u);};
export function frameFromSeconds(seconds){if(!Number.isFinite(seconds))throw Error('TIME_NOT_FINITE');return clamp(Math.floor(seconds*FPS),0,END-1)}
export function shotAt(frame){return SHOTS.find(s=>frame>=s.start&&frame<s.end)||SHOTS.at(-1)}
export function normalizeFront(front){if(!Array.isArray(front)||front.length!==3||!front.every(Number.isFinite))throw Error('FRONT_MISSING');const l=Math.hypot(front[0],front[2]);if(l<.7)throw Error('FRONT_INVALID');return [front[0]/l,front[2]/l]}
export function calibratedYaw(front,travel){let [x,z]=normalizeFront(front);if(!Array.isArray(travel)||travel.length!==2||!travel.every(Number.isFinite))throw Error('VELOCITY_INVALID');const len=Math.hypot(...travel);if(len<1e-8)throw Error('VELOCITY_ZERO');return Math.atan2(travel[0],travel[1])-Math.atan2(x,z)}
export function facingDot(front,yaw,velocity){if(!Number.isFinite(yaw))throw Error('YAW_INVALID');let [x,z]=normalizeFront(front),[vx,vz]=velocity;const len=Math.hypot(vx,vz);if(len<1e-9)return null;return ((Math.cos(yaw)*x+Math.sin(yaw)*z)*vx+(-Math.sin(yaw)*x+Math.cos(yaw)*z)*vz)/len}
// Acceleration and deceleration occupy 12% of each walk. Exact endpoints eliminate float drift.
export function travelAt(f,a,b){if(f<=a)return {ratio:0,derivative:0};if(f>=b)return {ratio:1,derivative:0};const u=(f-a)/(b-a),r=.12,c=1/(1-r);if(u<r)return {ratio:c*u*u/(2*r),derivative:c*u/r};if(u>1-r){const q=1-u;return {ratio:1-c*q*q/(2*r),derivative:c*q/r};}return {ratio:c*(u-r/2),derivative:c};}
const clampF=f=>clamp(f,0,END-1);
export function poseAt(frame,front=[0,0,1]){
 const f=clampF(frame);normalizeFront(front);
 const pose={frame:f,position:[0,0,-3.6],yaw:0,velocity:[0,0],clip:'Idle',phase:'IDLE',reach:0,interact:false};
 const setMove=(a,b,origin,delta,name)=>{const t=travelAt(f,a,b);pose.position=[origin[0]+delta[0]*t.ratio,0,origin[1]+delta[1]*t.ratio];pose.velocity=[delta[0]*t.derivative*FPS/(b-a),delta[1]*t.derivative*FPS/(b-a)];pose.clip='Walk';pose.phase=name};
 if(f<48)return pose;
 if(f<168){setMove(48,168,[0,-3.6],[0,2.05],'APPROACH');return pose;}
 pose.position=[0,0,-1.55];if(f<192){pose.phase='PAUSE';return pose;}
 if(f<228){const u=travelAt(f,192,228),angle=u.ratio*Math.PI/2,r=.36,speed=u.derivative*Math.PI/2*FPS/36;pose.position=[r*(1-Math.cos(angle)),0,-1.55+r*Math.sin(angle)];pose.yaw=angle;pose.velocity=[r*speed*Math.sin(angle),r*speed*Math.cos(angle)];pose.clip='Walk';pose.phase='ARC_TURN_90';return pose;}
 pose.position=[.36,0,-1.19];pose.yaw=Math.PI/2;
 if(f<290){setMove(228,290,[.36,-1.19],[.62,0],'APPROACH_OBJECT');pose.yaw=Math.PI/2;return pose;}
 pose.position=[.98,0,-1.19];
 if(f<330){pose.phase='FACE_PAUSE';return pose;}
 if(f<430){pose.phase='REACH';pose.reach=f<365?smooth((f-330)/35):f<395?1:1-smooth((f-395)/35);pose.interact=pose.reach>.95;return pose;}
 pose.phase='END';return pose;
}
export function validateShotRanges(shots=SHOTS){let end=0;for(const s of shots){if(!Number.isInteger(s.start)||!Number.isInteger(s.end)||s.start!==end||s.end<=s.start)throw Error('CAMERA_SHOT_GAP:'+s.id);end=s.end;}if(end!==END)throw Error('CAMERA_SHOT_LAST_FRAME');return true}
