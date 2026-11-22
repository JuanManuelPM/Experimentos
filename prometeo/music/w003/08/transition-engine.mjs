// Reusable score-independent quantized transition engine.
const nextBoundary=(start,now,bar)=>start+Math.max(1,Math.ceil((now-start+1e-5)/bar))*bar;
function newTransport(bar,start,initial){return {bar,start,active:initial,desired:initial,nextAt:start+bar,history:[],lastRequest:-1};}
function request(t,state,now){if(!['calma','deriva','tormenta'].includes(state))throw Error('Invalid state');t.desired=state;t.lastRequest=now;return t.nextAt;}
function advance(t,now,fn){while(now>=t.nextAt-.12){const at=t.nextAt,from=t.active,to=t.desired;t.nextAt+=t.bar;if(from!==to){t.active=to;const evt={from,to,at,until:at+t.bar};t.history.push(evt);fn(evt);}if(t.nextAt>now+.12)break;}return t;}
const equalPower=(phase)=>[Math.cos(Math.PI/2*phase),Math.sin(Math.PI/2*phase)];
export {nextBoundary,newTransport,request,advance,equalPower};
