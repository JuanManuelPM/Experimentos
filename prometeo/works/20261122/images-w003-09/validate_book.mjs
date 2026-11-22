// Run from this directory: node validate_book.mjs
// This invokes the single shared validators without duplicating their contracts.
import fs from 'node:fs';
import { inspectDeepSpec } from '../../../launch/deep-spec-v1.mjs';
import { inspectArtDirection } from '../../../launch/art-direction-first-article-v1.mjs';
const spec=JSON.parse(fs.readFileSync(new URL('./PREPRODUCTION.deep-spec-v1.json',import.meta.url),'utf8'));
const deep=inspectDeepSpec(spec);
const art=inspectArtDirection(spec.artDirection);
const pass=deep.gate==='READY_FOR_FIRST_SLICE'&&art.gate==='READY_TO_BUILD_NOT_ARTISTICALLY_APPROVED';
process.stdout.write(JSON.stringify({deep,art,structuralPass:pass,artisticApproval:false},null,2)+'\n');
process.exitCode=pass?0:1;
