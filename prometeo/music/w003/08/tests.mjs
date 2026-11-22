import assert from 'node:assert/strict';import{BAR,BARS,SR,DURATION,STEMS,renderStem,mix,wav16}from './score.mjs';import{newTransport,request,advance,equalPower,nextBoundary}from './transition-engine.mjs';
assert.equal(BARS,48);assert.equal(DURATION,120);assert.equal(STEMS.length,4);assert.equal(nextBoundary(0,1.4,BAR),2.5);
let t=newTransport(BAR,0,'calma');request(t,'tormenta',1);request(t,'deriva',1.4);request(t,'calma',1.7);request(t,'tormenta',2);let e=[];advance(t,2.4,x=>e.push(x));assert.equal(e.length,1);assert.equal(e[0].to,'tormenta');assert.equal(e[0].at,2.5);
request(t,'calma',2.7);request(t,'tormenta',2.9);advance(t,4.9,x=>e.push(x));assert.equal(e.length,1);request(t,'deriva',5.1);advance(t,7.4,x=>e.push(x));assert.equal(e.length,2);assert.equal(e[1].at,7.5);assert.equal(e[1].from,'tormenta');assert.equal(e[1].to,'deriva');
assert(Math.abs(equalPower(.5)[0]**2+equalPower(.5)[1]**2-1)<1e-8);
const b={};for(const k of STEMS){b[k]=renderStem(k);assert.equal(b[k].length,SR*DURATION);assert(b[k].every(Number.isFinite));assert(Math.max(...b[k].slice(0,1000).map(Math.abs))<=1);}
for(const s of STEMS.slice(1)){const w=wav16(mix(b,s));assert.equal(w.byteLength,44+2*SR*DURATION);assert.equal(String.fromCharCode(...w.slice(0,4)),'RIFF');}
console.log('PASS: tempo, length, rapid/repeated/mid-bar requests, last intent, boundaries, equal-power, PCM, master, WAV');
