#!/usr/bin/env node
import fs from 'node:fs';
const path = process.argv[2];
if (!path) { console.error('Usage: node visual-lint.mjs candidate.json'); process.exit(2); }
const c = JSON.parse(fs.readFileSync(path, 'utf8'));
const scene = c.scene_type || 'WORLD';
const thresholds = {
  WORLD:{minPrimary:.72,maxControls:5,maxPanels:1},
  READ:{minPrimary:.82,maxControls:4,maxPanels:1},
  CHAT:{minPrimary:.68,maxControls:7,maxPanels:1},
  MASTER_DETAIL:{minPrimary:.58,maxControls:12,maxPanels:2},
  TOOL:{minPrimary:.45,maxControls:24,maxPanels:4}
}[scene] || {minPrimary:.60,maxControls:8,maxPanels:1};
const m=c.metrics||{}, k=c.contracts||{};
const checks=[];
const add=(name,ok,detail)=>checks.push({name,ok:!!ok,detail});
add('FUNCTIONAL.interaction', k.interaction_pass===true, 'interaction_pass must be true');
add('FUNCTIONAL.back', k.back_restores_state===true, 'back_restores_state must be true');
add('FUNCTIONAL.demo', k.demo_path_pass===true, 'demo_path_pass must be true');
add('DEVICE.portrait-layout', k.portrait_layout_defined===true, 'portrait must be authored, not scaled landscape');
add('DEVICE.landscape-layout', k.landscape_layout_defined===true, 'landscape layout must be defined');
add('DEVICE.screenshots', k.multi_device_screenshots_present===true, 'six required viewport renders must exist');
add('DEVICE.touch', Number(m.min_touch_target_css_px)>=44, `min touch target ${m.min_touch_target_css_px} >= 44`);
add('DEVICE.text', Number(m.min_text_css_px)>=12, `min text ${m.min_text_css_px} >= 12`);
add('DEVICE.dead-space', Number(m.dead_space_ratio)<=.35, `dead space ${m.dead_space_ratio} <= .35`);
add('DEVICE.chrome', Number(m.persistent_chrome_ratio)<=.18, `chrome ${m.persistent_chrome_ratio} <= .18`);
add('SCENE.primary-content', Number(m.primary_content_ratio)>=thresholds.minPrimary, `primary content ${m.primary_content_ratio} >= ${thresholds.minPrimary}`);
add('SCENE.visible-controls', Number(m.visible_controls)<=thresholds.maxControls, `controls ${m.visible_controls} <= ${thresholds.maxControls}`);
add('SCENE.open-panels', Number(m.open_large_panels)<=thresholds.maxPanels, `large panels ${m.open_large_panels} <= ${thresholds.maxPanels}`);
add('SCENE.decoration', k.decoration_is_primary_content===false, 'decoration cannot be primary content');
add('REFERENCE.bom', k.reference_bom_present===true, 'reference BOM required');
add('REFERENCE.count', Number(k.reference_count)>=3, `reference count ${k.reference_count} >= 3`);
add('REFERENCE.compare', k.candidate_vs_reference_compare_present===true, 'candidate/reference comparison required');
add('HUMAN.pass', k.explicit_human_pass===true, 'human promotion is mandatory');
const fail=checks.filter(x=>!x.ok);
for(const x of checks) console.log(`${x.ok?'PASS':'FAIL'}  ${x.name}  ${x.detail}`);
console.log(`\n${fail.length?'REJECT → LAB_ONLY':'PASS → CHAMPION_CANDIDATE'}`);
process.exit(fail.length?1:0);