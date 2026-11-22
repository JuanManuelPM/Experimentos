import assert from 'node:assert/strict';
import {DEFAULTS,TAU,motion,profile,state,diagnose,camPoint,buildDXF,normalize} from './mechanics.mjs';
const near=(a,b,tol=1e-6)=>assert.ok(Math.abs(a-b)<tol,`Expected ${a} ~ ${b} tolerance ${tol}`);
let n=0;
function check(label,cb){cb(); n++;console.log('PASS',label);}
check('Validacion del dominio y combinaciones prohibidas',()=>{assert.throws(()=>normalize({lift:31})); assert.throws(()=>normalize({rise:155,topDwell:95,lowDwell:65}));});
check('Origen y cierre exacto de una vuelta',()=>{near(motion(0).s,0);near(motion(TAU).s,0);near(motion(TAU*2).s,0);});
check('Meseta superior y retorno',()=>{near(motion(155*Math.PI/180).s,DEFAULTS.lift);near(motion((DEFAULTS.rise+DEFAULTS.topDwell)*Math.PI/180).s,DEFAULTS.lift);near(motion((360-DEFAULTS.lowDwell)*Math.PI/180).s,0)});
check('C2 y continuidad de velocidad en límites',()=>{for(const deg of [0,DEFAULTS.rise,DEFAULTS.rise+DEFAULTS.topDwell,360-DEFAULTS.lowDwell,360]){const a=motion(deg*Math.PI/180);near(a.ds,0,1e-9);near(a.d2s,0,1e-8);}});
check('Normal dirigida hacia afuera y distancia de rodillo',()=>{for(let i=0;i<720;i++){const t=TAU*i/720,point=camPoint(t),q=state(t),c=Math.cos(t),s=Math.sin(t);const x=point.x*c-point.y*s,y=point.x*s+point.y*c;near(Math.hypot(x,y-q.rollerY),DEFAULTS.roller,1e-5)}});
check('Muestreo cerrado de leva y sin no-finitos',()=>{const pts=profile({},720);assert.equal(pts.length,720);assert.ok(pts.every(p=>Object.values(p).every(v=>Number.isFinite(v))));});
check('Barrido segmento contra rodillo, presión y contacto',()=>{const d=diagnose({},120,720);assert.ok(d.continuousContact,JSON.stringify(d));assert.ok(d.pressureOK,JSON.stringify(d));assert.ok(d.minRadius>0);assert.ok(d.minAxial>0);});
check('Cambiar carrera modifica geometría y fuerza',()=>{assert.notEqual(state(1,{lift:6}).s,state(1,{lift:25}).s);assert.notEqual(camPoint(1,{lift:6}).x,camPoint(1,{lift:25}).x);});
check('Export DXF con nuevas líneas reales y contornos',()=>{const s=buildDXF();assert.ok(s.startsWith('0\nSECTION\n2\nENTITIES'));assert.ok(s.includes('LWPOLYLINE'));assert.ok(s.includes('AXLE_BORE'));assert.ok(s.endsWith('0\nEOF\n'));});
console.log(`TOTAL: ${n} pruebas mecánicas ejecutadas`);
