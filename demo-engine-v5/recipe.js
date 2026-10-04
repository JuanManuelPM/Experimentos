(function(global){
'use strict';
class DemoRecipeCompilerV5{
  static compile(recipe={}){
    const steps=[],profile=String(recipe.preset||'TEACH').toUpperCase();
    for(const s of recipe.steps||[]){
      if(s.say)steps.push({action:'narrateV5',say:s.say,hold:s.hold});
      if(s.show)steps.push({action:'showV5',target:s.show,method:s.method||'auto',hold:s.hold});
      if(s.activate)steps.push({action:'activateV5',target:s.activate});
      if(s.enter){
        const e=typeof s.enter==='string'?{target:s.target,text:s.enter}:s.enter;
        steps.push({action:'enterV5',target:e.target,text:e.text||'',submit:e.submit||null});
      }
      if(s.showResult)steps.push({action:'showV5',target:s.showResult,method:s.method||'focus',hold:s.hold??900});
      if(s.annotate){
        const a=typeof s.annotate==='string'?{target:s.annotate,type:'underline'}:s.annotate;
        steps.push({action:'annotateV5',target:a.target,type:a.type||'underline',hold:a.hold});
      }
      if(s.drag)steps.push({action:'drag',from:s.drag.from,to:s.drag.to,duration:s.drag.duration});
      if(s.resize)steps.push({action:'resize',target:s.resize.target,width:s.resize.width,height:s.resize.height,duration:s.resize.duration});
      if(s.set)steps.push({action:'setControlV5',...s.set});
    }
    return{title:recipe.demo||'DEMO',preset:profile,steps};
  }
}
global.DemoRecipeCompilerV5=DemoRecipeCompilerV5;
})(typeof window!=='undefined'?window:globalThis);