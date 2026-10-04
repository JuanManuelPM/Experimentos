import fs from 'node:fs';
const [,, protocolPath, candidatePath] = process.argv;
if (!protocolPath || !candidatePath) { console.error('usage: node semantic-lint.mjs protocol.json candidate.json'); process.exit(2); }
const protocol = JSON.parse(fs.readFileSync(protocolPath,'utf8'));
const c = JSON.parse(fs.readFileSync(candidatePath,'utf8'));
const t = protocol.thresholds_by_scene[c.scene_type];
if (!t) { console.error(`FAIL unknown scene_type ${c.scene_type}`); process.exit(1); }
const checks=[]; const check=(name,pass,value,rule)=>checks.push({name,pass,value,rule});
check('task_bearing_primary_content',c.task_bearing_primary_content===true,c.task_bearing_primary_content,'must be true');
check('meaningful_occupancy_ratio',c.meaningful_occupancy_ratio>=t.min_meaningful_occupancy_ratio,c.meaningful_occupancy_ratio,`>= ${t.min_meaningful_occupancy_ratio}`);
check('primary_object_scale',c.primary_object_scale>=t.min_primary_object_scale,c.primary_object_scale,`>= ${t.min_primary_object_scale}`);
check('asset_family_consistency',c.asset_family_consistency>=t.min_asset_family_consistency,c.asset_family_consistency,`>= ${t.min_asset_family_consistency}`);
check('composition_clustering',c.composition_clustering>=t.min_composition_clustering,c.composition_clustering,`>= ${t.min_composition_clustering}`);
check('semantic_dead_space_ratio',c.semantic_dead_space_ratio<=t.max_semantic_dead_space_ratio,c.semantic_dead_space_ratio,`<= ${t.max_semantic_dead_space_ratio}`);
check('persistent_chrome_ratio',c.persistent_chrome_ratio<=t.max_persistent_chrome_ratio,c.persistent_chrome_ratio,`<= ${t.max_persistent_chrome_ratio}`);
check('visible_controls',c.visible_controls<=t.max_visible_controls,c.visible_controls,`<= ${t.max_visible_controls}`);
for(const x of checks) console.log(`${x.pass?'PASS':'FAIL'} ${x.name}: ${x.value} (${x.rule})`);
const failed=checks.filter(x=>!x.pass);
if(failed.length){console.log(`REJECT → ${protocol.promotion.fail_state} (${failed.length} semantic failures)`);process.exit(1);}
console.log('SEMANTIC_VISUAL_PASS');