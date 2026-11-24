import {profiles,outfits,build as legacy,inspect} from '../character-system-v1/wardrobe/models.mjs';
import {build,ASSEMBLY,deform,MOTION,newProfile,newOutfit} from './models.mjs';
import {crossings,inspectCrossings} from './surface-check.mjs';
const tri={indices:[0,1,2]},a=[[0,0,0],[1,0,0],[0,1,0]],positive=crossings(tri,a,tri,[[.2,.2,-1],[.2,.2,1],[.8,.2,1]]),negative=crossings(tri,a,tri,[[.2,.2,1],[.2,.2,2],[.8,.2,1]]);
if(positive!==1||negative!==0)throw Error('crossing fixtures failed');
let failed=false;
for(const [p,o] of [...outfits.map(o=>[profiles[0],o]),[newProfile,newOutfit]]){try{const m=build(p,o),old=legacy(p,o),structure=inspect(m),seam=ASSEMBLY(m),poses=[];for(const [mode,t] of [['idle',0],['walk',.25],['flex',.5]]){const q=MOTION(t,mode);poses.push({mode,t,before:inspectCrossings(old,deform(old,q)),after:inspectCrossings(m,deform(m,q))})}console.log(JSON.stringify({id:o.name,structure,seam,poses}));if(structure.structural!=='PASS'||seam.seam!=='PASS'||seam.deformation!=='PASS')failed=true}catch(e){console.error(o.name,e);failed=true}}
if(failed)process.exitCode=1;
