import {test} from 'node:test';
import assert from 'node:assert/strict';
import {installCinema} from './forge-cinema.mjs';

// DOM and Three.js stand-ins drive real installCinema/tick/event code without a GPU.
class NodeStub extends EventTarget {
  constructor(){super();this.attributes=new Map();this.dataset={};this.hidden=false;this.textContent='';this.value='';}
  setAttribute(k,v){this.attributes.set(k,String(v))}
  getAttribute(k){return this.attributes.get(k)??null}
  closest(){return null}
  querySelectorAll(){return []}
  setPointerCapture(){}
}
class Vector3Stub {
  constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z;}
}
const coords=()=>({set(){}});
function boot(){
  const originalDocument=globalThis.document,originalWindow=globalThis.window;
  const document=new NodeStub(),window=new NodeStub();
  const nodes=new Map([
    ['camera-cinema-mode',new NodeStub()],
    ['camera-cinema-status',new NodeStub()],
    ['camera-walk-pad',new NodeStub()],
    ['camera-cinema-capture',new NodeStub()],
    ['camera-cinema-pause',new NodeStub()]
  ]);
  document.getElementById=id=>nodes.get(id)||null;
  globalThis.document=document;
  globalThis.window=window;
  const controls={enabled:true};
  const cinema=installCinema({
    THREE:{Vector3:Vector3Stub},canvas:new NodeStub(),renderer:null,scene:{},world:{},
    camera:{position:coords(),up:coords(),fov:47,lookAt(){},updateProjectionMatrix(){}},
    controls,transform:{detach(){}},getObjects:()=>[],getSelected:()=>null,
    onOrbit(){},notify(){}
  });
  const pause=nodes.get('camera-cinema-pause');
  return {
    cinema,pause,document,controls,
    pressKey(code){const e=new Event('keydown',{cancelable:true});Object.defineProperty(e,'code',{value:code});document.dispatchEvent(e);},
    restore(){globalThis.document=originalDocument;globalThis.window=originalWindow;}
  };
}
test('C114 regression: paused walking freezes camera even across frames',()=>{
  const s=boot();
  try{
    assert.equal(s.pause.getAttribute('aria-pressed'),'false');
    s.cinema.setMode('FIRST_PERSON');
    s.pressKey('KeyW');
    s.cinema.tick(.08);
    const moving=s.cinema.diagnostic();
    assert.ok(moving.firstPerson[2]<14,'keyboard walking actually moved before pause');
    s.pause.dispatchEvent(new Event('click'));
    const paused=s.cinema.diagnostic();
    assert.equal(paused.paused,true);
    for(let i=0;i<10;i++)s.cinema.tick(.08);
    const after=s.cinema.diagnostic();
    assert.deepEqual(after.firstPerson,paused.firstPerson,'no movement while paused');
    assert.equal(after.elapsed,paused.elapsed,'clock remains frozen');
    assert.equal(s.pause.getAttribute('aria-pressed'),'true');
    assert.equal(s.pause.textContent,'▶');
  }finally{s.restore()}
});
test('C114 regression: switching paused FIRST_PERSON to SHOT resumes clock and UI',()=>{
  const s=boot();
  try{
    s.cinema.setMode('FIRST_PERSON');
    s.pause.dispatchEvent(new Event('click'));
    assert.equal(s.cinema.diagnostic().paused,true);
    s.cinema.setMode('SHOT');
    assert.equal(s.cinema.diagnostic().paused,false,'new mode must not inherit paused state');
    assert.equal(s.pause.getAttribute('aria-pressed'),'false');
    assert.equal(s.pause.textContent,'Ⅱ');
    s.cinema.tick(.08);
    assert.ok(s.cinema.diagnostic().elapsed>0,'SHOT actually progresses');
    s.pause.dispatchEvent(new Event('click'));
    s.cinema.setMode('FIRST_PERSON');
    assert.equal(s.cinema.diagnostic().paused,false);
    s.pressKey('KeyW');
    const before=s.cinema.diagnostic().firstPerson;
    s.cinema.tick(.08);
    assert.ok(s.cinema.diagnostic().firstPerson[2]<before[2],'walk resumes in new mode');
  }finally{s.restore()}
});
