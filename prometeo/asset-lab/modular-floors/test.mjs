import {buildFloor,auditFloor,auditSeam,catalog} from './models.mjs';
const rows=[];for(const kind of Object.keys(catalog)){
 const m=buildFloor(kind,{clip:true,transition:true});const audit=auditFloor(m);
 rows.push({kind,audit,seam:auditSeam(kind)});
}
console.log(JSON.stringify(rows,null,2));
if(rows.some(r=>r.audit.geometry!=='PASS'||r.audit.assembly==='FAIL'||!r.seam.pass))throw Error('floor regression');
