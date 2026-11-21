export function runFixtures(g){
 const results=[];function test(name,fn){try{if(!fn())throw Error('assertion false');results.push({name,status:'PASS'})}catch(e){results.push({name,status:'FAIL',error:String(e)})}}
 const dirs=[{x:0,z:1},{x:0,z:-1},{x:1,z:0},{x:-1,z:0}];for(const f of dirs)for(const z of dirs)test('heading '+JSON.stringify(f)+JSON.stringify(z),()=>g.facingDot(g.rotateFront(f,g.calibratedYaw(f,z)),z)>.99999);
 const actor=id=>({actorId:id,locomotes:true,routeIds:['r']});const report=(id,x)=>({actorId:id,axisEvidence:'fixture',runtimeEvidence:'fixture',contactEvidence:'fixture',transitionEvidence:'fixture',samples:[0,.1,.2].map(t=>({t,routeId:'r',velocity:{x:1,z:0},worldFront:{x,z:0}}))});
 test('hero correct, NPC backward fails',()=>g.auditCastMotion([actor('hero'),actor('extra')],[report('hero',1),report('extra',-1)]).status==='FAIL');
 test('missing NPC not run',()=>g.auditCastMotion([actor('hero'),actor('extra')],[report('hero',1)]).status==='NOT_RUN');
 test('all actors correct',()=>g.auditCastMotion([actor('hero'),actor('extra')],[report('hero',1),report('extra',1)]).status==='PASS');
 test('no walkers correctly N/A',()=>g.auditCastMotion([{actorId:'idle',locomotes:false}],[]).status==='N/A');
 test('unknown actor classification not run',()=>g.auditCastMotion([{actorId:'unknown'}],[]).status==='NOT_RUN');
 test('route not covered',()=>g.auditCastMotion([{...actor('a'),routeIds:['r','return']}],[report('a',1)]).status==='NOT_RUN');
 test('invalid contact evidence',()=>g.auditCastMotion([actor('a')],[{...report('a',1),contactEvidence:null}]).status==='NOT_RUN');
 test('sample gap',()=>g.auditCastMotion([actor('a')],[{...report('a',1),samples:report('a',1).samples.map((s,i)=>({...s,t:i*.3}))}]).status==='NOT_RUN');
 test('right/left free look',()=>g.freeLookDrag({yaw:0,pitch:0},20,0).yaw>0&&g.freeLookDrag({yaw:0,pitch:0},-20,0).yaw<0);
 test('up/down free look',()=>g.freeLookDrag({yaw:0,pitch:0},0,-20).pitch>0&&g.freeLookDrag({yaw:0,pitch:0},0,20).pitch<0);
 test('orbit expected horizontal',()=>g.orbitDrag({azimuth:0,elevation:0},20,0).azimuth<0);
 test('pinch out zoom',()=>g.pinchScale(50,100)===.5);
 test('turn wrap shortest',()=>Math.abs(g.shortestYaw(3.13,-3.13))<.03);
 const down=(x=0,y=0,id=1)=>({type:'down',id,x,y});const simulate=events=>events.reduce((s,e)=>g.gesture(s.state,e),{state:g.newGesture()});
 test('tap',()=>simulate([down(),{type:'up',id:1}]).out.kind==='TAP');
 test('drag never picks',()=>simulate([down(),{type:'move',id:1,x:20,y:0},{type:'up',id:1}]).out.kind==='NONE');
 test('cancel never picks',()=>simulate([down(),{type:'cancel',id:1},{type:'up',id:1}]).out.kind==='NONE');
 test('lost capture never picks',()=>simulate([down(),{type:'lostcapture',id:1},{type:'up',id:1}]).out.kind==='NONE');
 test('UI excluded',()=>simulate([{...down(),overUI:true},{type:'up',id:1}]).out.kind==='NONE');
 test('pinch gesture',()=>simulate([down(),down(50,0,2),{type:'move',id:2,x:100,y:0}]).out.scale===.5);
 test('multitouch never picks',()=>simulate([down(),down(50,0,2),{type:'up',id:2},{type:'up',id:1}]).out.kind==='NONE');
 test('HUD union without duplicate areas',()=>g.unionArea([{x:0,y:0,w:10,h:10},{x:5,y:0,w:10,h:10}])===150);
 const vo={viewport:{x:0,y:0,w:360,h:640},focal:{x:80,y:150,w:200,h:300},screenEvidence:'fixture'};
 test('minimal UI',()=>g.auditHUD({...vo,rects:[{x:5,y:5,w:44,h:44,interactive:true}]}).status==='PASS');
 test('UI too large',()=>g.auditHUD({...vo,rects:[{x:0,y:0,w:360,h:140}]}).issues.includes('HUD_AREA_OVER_BUDGET'));
 test('focal occluded',()=>g.auditHUD({...vo,rects:[{x:100,y:200,w:44,h:44}]}).issues.includes('FOCAL_OCCLUDED'));
 test('target too small',()=>g.auditHUD({...vo,rects:[{x:0,y:0,w:30,h:30,interactive:true}]}).issues.some(x=>x.startsWith('SMALL_TOUCH_TARGET')));
 test('default modal not allowed',()=>g.auditHUD({...vo,rects:[],defaultModalOpen:true}).status==='FAIL');
 test('screen evidence missing',()=>g.auditHUD({...vo,screenEvidence:null,rects:[]}).status==='NOT_RUN');
 test('no actor mechanical N/A',()=>g.auditAvatarExperiment({actors:[]}).status==='N/A');
 test('missing avatar workflow fails',()=>g.auditAvatarExperiment({actors:[{actorId:'a',visualIdentity:'x',role:'HERO'}]}).status==='INCOMPLETE');
 test('clones cannot count as distinct',()=>g.auditAvatarExperiment({actors:[{actorId:'a',visualIdentity:'x',role:'HERO'},{actorId:'b',visualIdentity:'x',role:'SUPPORT_NPC'}]}).issues.includes('VISIBLE_IDENTITY_DUPLICATE_OR_MISSING'));
 return results;
}
