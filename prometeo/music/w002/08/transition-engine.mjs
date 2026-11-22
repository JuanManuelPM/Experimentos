import {BAR,STATES} from './score.mjs';
// Portable, transport-independent scheduler policy. Source phase never resets.
export const FADE_SECONDS=BAR;
export const SCHEDULE_GUARD=.04;
export function nextBar(startAt,time,barSeconds=BAR,guard=SCHEDULE_GUARD){
 if(!Number.isFinite(time)||!Number.isFinite(startAt)||barSeconds<=0)throw Error('clock');
 return startAt+Math.max(1,Math.floor((time+guard-startAt)/barSeconds)+1)*barSeconds;
}
export function transitionSequence(events,{startAt=0,initial='calma',barSeconds=BAR}={}){
 if(!STATES.includes(initial))throw Error('initial state');
 let transitions=[],current=initial;
 for(const event of events){
  if(!STATES.includes(event.state)||!Number.isFinite(event.at))throw Error('invalid event');
  const at=nextBar(startAt,event.at,barSeconds);
  if(transitions.length&&transitions[transitions.length-1].at>=event.at){
   // This request supersedes an uncommitted event at the same boundary.
   const old=transitions[transitions.length-1];
   if(old.at===at){old.to=event.state;continue}
  }
  const prior=transitions.filter(e=>e.at<at).at(-1);
  const from=prior?.to||initial;
  if(from!==event.state)transitions.push({at,from,to:event.state,fade:barSeconds});
 }
 return transitions.filter(e=>e.from!==e.to);
}
export function weights(transition,time){
 if(time<=transition.at)return [1,0];
 if(time>=transition.at+transition.fade)return [0,1];
 const x=(time-transition.at)/transition.fade;
 return [Math.cos(x*Math.PI/2),Math.sin(x*Math.PI/2)];
}