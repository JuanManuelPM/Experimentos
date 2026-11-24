import {generate,inspect} from './geometry.mjs';
for(const id of ['rail','petal']){const m=generate(id),r=inspect(m);console.log(id,JSON.stringify(r,null,2));if(!r.ok||JSON.stringify(m)!==JSON.stringify(generate(id)))process.exitCode=1;}
