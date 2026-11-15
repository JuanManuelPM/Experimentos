import {installCinema} from './forge-cinema.mjs';
import {runCinemaRegression} from './pause-regression.core.mjs';
const result=runCinemaRegression((document,window)=>{
  globalThis.document=document;
  globalThis.window=window;
  return installCinema;
});
console.log(JSON.stringify(result,null,2));
