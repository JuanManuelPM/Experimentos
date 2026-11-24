import {generate,testSurfaces} from './first-article.mjs';
import {inspect} from '../chair-03-04/geometry.mjs';
const m=generate(),g=inspect(m),s=testSurfaces(m);if(!g.ok||s.some(x=>!x.ok))throw Error(JSON.stringify({g,s}));console.log(JSON.stringify({geometry:g,surfaces:s},null,2));
