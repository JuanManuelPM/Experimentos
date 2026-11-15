#!/usr/bin/env node
// node preflight-cli.mjs path/to/production.audit.json [receipt.json]
import {readFile,writeFile} from 'node:fs/promises';
import {evaluatePreflight} from './preflight-engine.mjs';
const source=process.argv[2]||new URL('./night-drive.audit.json',import.meta.url);
const destination=process.argv[3];
try{
 const text=await readFile(source,'utf8'),manifest=JSON.parse(text);
 const report=evaluatePreflight(manifest);
 console.log(JSON.stringify({projectId:report.projectId,decision:report.decision,counts:report.counts,blockers:report.blockers},null,2));
 if(destination)await writeFile(destination,JSON.stringify(report,null,2)+'\n');
 if(report.decision!=='ELIGIBLE_FOR_RELEASE')process.exitCode=2;
}catch(e){console.error('PREFLIGHT_ERROR',e.message);process.exitCode=3}
