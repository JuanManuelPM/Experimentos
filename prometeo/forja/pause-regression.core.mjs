// Exact integration regression, no rendering/GPU dependency. Import and execute from Node or V8.
export function runCinemaRegression(getInstaller) {
  let passed=0;
  const assert=(condition,message)=>{if(!condition)throw Error(message);passed++;};
  class Target {
    constructor(){this.handlers={};this.attrs={};this.textContent='';this.value='';this.hidden=false;}
    addEventListener(name,fn){(this.handlers[name]??=[]).push(fn);}
    emit(name,e={}){for(const fn of this.handlers[name]||[])fn(e);}
    setAttribute(k,v){this.attrs[k]=v;}
    setPointerCapture(){}
  }
  function setup(){
    const document=new Target(),window=new Target(),canvas=new Target();
    const ids=new Map();
    for(const id of ['camera-cinema-mode','camera-cinema-status','camera-walk-pad','camera-cinema-capture','camera-cinema-pause'])ids.set(id,new Target());
    document.getElementById=id=>ids.get(id)||null;
    const pad=ids.get('camera-walk-pad'),forward=new Target();
    forward.dataset={walk:'forward'};
    pad.querySelectorAll=()=>[forward];
    const camera={
      fov:47, position:{set(...xs){this.v=xs}},up:{set(...xs){this.v=xs}},
      lookAt(){},updateProjectionMatrix(){}
    };
    class Vec3{constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z}}
    const controls={enabled:true};
    const installCinema=getInstaller(document,window);
    const app=installCinema({
      THREE:{Vector3:Vec3},canvas,renderer:null,scene:{},world:{},camera,controls,
      transform:{detach(){}},getObjects:()=>[],getSelected:()=>null,onOrbit(){},notify(){}
    });
    return {document,window,canvas,ids,forward,app,controls};
  }
  const key=()=>({code:'KeyW',target:{closest:()=>false},preventDefault(){},stopImmediatePropagation(){}});
  const a=setup(),pause=a.ids.get('camera-cinema-pause');
  assert(a.app.setMode('FIRST_PERSON')===true,'first-person selection');
  a.document.emit('keydown',key());a.app.tick(0.08);
  const walked=a.app.diagnostic().firstPerson[2];
  assert(walked<14,'W advances before pause');
  pause.emit('click');
  a.app.tick(0.08);a.app.tick(0.08);
  assert(a.app.diagnostic().firstPerson[2]===walked,'paused WASD does not move');
  assert(a.app.diagnostic().paused===true,'pause recorded');
  assert(pause.attrs['aria-pressed']==='true','pressed UI synced');
  const time=a.app.diagnostic().elapsed;
  assert(Math.abs(time-0.08)<1e-8,'paused time frozen');
  a.document.emit('keydown',key());
  a.forward.emit('pointerdown',{pointerId:3,preventDefault(){}});
  a.canvas.emit('pointerdown',{pointerId:4,clientX:1,clientY:1});
  a.canvas.emit('pointermove',{pointerId:4,clientX:140,clientY:20});
  a.app.tick(0.08);
  assert(a.app.diagnostic().firstPerson[2]===walked,'paused keyboard, pad and pointer ignored');
  pause.emit('click');
  assert(a.app.diagnostic().paused===false,'resume recorded');
  a.app.tick(0.08);
  assert(a.app.diagnostic().firstPerson[2]===walked,'resume does not reuse held keys');
  a.document.emit('keydown',key());a.app.tick(0.08);
  assert(a.app.diagnostic().firstPerson[2]<walked,'fresh W movement works');
  assert(Math.abs(a.app.diagnostic().firstPerson[0])<1e-8,'pointer drag while paused did not alter yaw');
  pause.emit('click');
  assert(a.app.diagnostic().paused===true,'paused before mode switch');
  assert(a.app.setMode('SHOT')===true,'shot mode selected');
  assert(a.app.diagnostic().paused===false,'mode switch clears pause');
  assert(pause.attrs['aria-pressed']==='false'&&pause.textContent==='Ⅱ','mode switch resets pause controls');
  a.app.tick(0.08);
  assert(a.app.diagnostic().elapsed>0,'shot animates after transition');
  pause.emit('click');a.app.tick(0.08);
  const frozen=a.app.diagnostic().elapsed;
  a.app.tick(0.08);
  assert(a.app.diagnostic().elapsed===frozen,'shot pause freezes timeline');
  assert(a.app.setMode('ORBIT')===true,'returns to orbit');
  assert(a.controls.enabled===true,'orbit reenabled');
  assert(a.app.diagnostic().paused===false,'orbit clears pause');
  pause.emit('click');
  assert(a.app.setMode('BAD_MODE')===false,'invalid mode rejected');
  assert(a.app.diagnostic().paused===true,'invalid mode leaves pause untouched');
  return {passed,failed:0,medium:'V8 exact module with mocked DOM/Three camera (no GPU)'};
}
