(function(global){
'use strict';
class DemoEngineV5 extends global.DemoEngineV4{
  constructor(root,script={},options={}){
    super(root,script,options);
    this.ui.annotationPath=this.root.querySelector('[data-demo-annotation-path]')||this.ui.tracePath;
    this.viewport=new global.DemoViewportController(this);
    this.annotation=new global.DemoAnnotationController(this);
    this.cameraV5=new global.DemoCameraController(this);
    this.audio=new global.DemoAudioDirector(this,options.audio||{});
  }
  async movePointerPoint(x,y,opts={},token=this.runToken){
    return super.movePointerPoint(x,y,{...opts,guide:false},token);
  }
  async movePointerTo(target,opts={},token=this.runToken){
    const el=this.target(target);if(!el)return false;
    if(opts.ensureVisible!==false)await this.viewport.ensureVisible(el,opts.viewport||{},token);
    return super.movePointerTo(el,{...opts,guide:false},token);
  }
  async narrateV5(text,opts={},token=this.runToken){
    const caption=this.ui.caption;if(!caption){await this._delay(opts.hold??700,token);return;}
    if(this.ui.kicker)this.ui.kicker.textContent=opts.kicker||this.script.title||'DEMO';
    caption.textContent='';
    await this.audio.textBlips(this.interpolate(text||''),(ch)=>caption.textContent+=ch,{});
    await this._delay(opts.hold??420,token);
  }
  async showV5(target,opts={},token=this.runToken){
    const el=this.target(target);if(!el)return false;
    await this.viewport.ensureVisible(el,{},token);
    const method=opts.method==='auto'||!opts.method?(this.rect(el).width<180||this.rect(el).height<70?'focus':'look'):opts.method;
    if(method==='focus')return this.cameraV5.focus(el,{hold:opts.hold??950},token);
    if(method==='annotate')return this.annotation.draw(opts.annotation||'underline',el,{hold:opts.hold??650},token);
    return this.look(el,{hold:opts.hold??850,guide:false},token);
  }
  async activateV5(target,opts={},token=this.runToken){
    const el=this.target(target);if(!el)return false;await this.viewport.ensureVisible(el,{},token);return this.click(el,{guide:false},token);
  }
  async enterV5(target,text,opts={},token=this.runToken){
    const el=this.target(target);if(!el)return false;await this.viewport.ensureVisible(el,{},token);await this.type(el,text,{human:true},token);if(opts.submit)await this.activateV5(opts.submit,{},token);return true;
  }
  async setControlV5(step,token=this.runToken){
    const el=this.target(step.target);if(!el)return;
    const type=global.DemoPageInspector.inferType(el);
    await this.viewport.ensureVisible(el,{},token);
    if(type==='checkbox')return this.toggle(el,step.value,token);
    if(type==='slider')return this.slider(el,step.value,token);
    if(type==='select')return this.select(el,step.value,token);
  }
  async drag(from,to,opts={},token=this.runToken){return super.drag(from,to,{...opts,guide:false},token);}
  async resize(target,opts={},token=this.runToken){return super.resize(target,{...opts,guide:false},token);}
  async cameraFocus(target,opts={},token=this.runToken){return this.cameraV5.focus(target,opts,token);}
  async execute(step,token=this.runToken){
    const a=step?.action;
    if(a==='narrateV5'){this.observer.emit('step_start',{index:this.index,action:a});await this.narrateV5(step.say,step,token);this.observer.emit('step_end',{index:this.index,action:a});return;}
    if(a==='showV5'){this.observer.emit('step_start',{index:this.index,action:a,target:step.target});await this.showV5(step.target,step,token);this.observer.emit('step_end',{index:this.index,action:a,target:step.target});return;}
    if(a==='activateV5'){this.observer.emit('step_start',{index:this.index,action:a,target:step.target});await this.activateV5(step.target,step,token);this.observer.emit('step_end',{index:this.index,action:a,target:step.target});return;}
    if(a==='enterV5'){this.observer.emit('step_start',{index:this.index,action:a,target:step.target});await this.enterV5(step.target,step.text,step,token);this.observer.emit('step_end',{index:this.index,action:a,target:step.target});return;}
    if(a==='annotateV5'){this.observer.emit('step_start',{index:this.index,action:a,target:step.target});await this.annotation.draw(step.type||'underline',step.target,step,token);this.observer.emit('step_end',{index:this.index,action:a,target:step.target});return;}
    if(a==='setControlV5'){this.observer.emit('step_start',{index:this.index,action:a,target:step.target});await this.setControlV5(step,token);this.observer.emit('step_end',{index:this.index,action:a,target:step.target});return;}
    return super.execute(step,token);
  }
  setRecipe(recipe){
    const compiled=global.DemoRecipeCompilerV5.compile(recipe);this.setPreset(compiled.preset);this.setScript(compiled);return this;
  }
  inspectPage(){return global.DemoPageInspector.inspect(this.root);}
}
global.DemoEngineV5=DemoEngineV5;
})(typeof window!=='undefined'?window:globalThis);