import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateTimeline,evaluateTimeline,retimeShot,cloneValidated,diffAt,frameAt} from './sequencer.mjs';
const film=cloneValidated(JSON.parse(readFileSync(new URL('./timeline.json',import.meta.url),'utf8')));
assert.deepEqual(validateTimeline(film),[]);
assert.equal(film.shots.length,5);
assert.equal(film.duration,26);
for(const [time,id] of [[0,'s01'],[4.7999,'s01'],[4.8,'s02'],[9.8,'s03'],[15,'s04'],[20.3,'s05'],[26,'s05']]){
 assert.equal(evaluateTimeline(time,film).shotId,id,'shot at '+time);
}
const saved=JSON.parse(JSON.stringify(film));
for(let f=0;f<=film.duration*30;f++)assert.equal(diffAt(film,saved,frameAt(f,30)),0,'frame round-trip '+f);
const changed=retimeShot(film,'s03',6.5);
assert.equal(changed.duration,27.3);
assert.deepEqual(validateTimeline(changed),[]);
assert.equal(changed.shots[3].start,16.3);
assert.equal(changed.shots[4].end,27.3);
assert.equal(diffAt(changed,JSON.parse(JSON.stringify(changed)),17),0);
const damaged=structuredClone(film);damaged.shots[2].start+=.1;
assert(validateTimeline(damaged).some(x=>x.includes('gap/overlap')));
assert.equal(film.duration,26,'retiming did not mutate original');
console.log('PASS: timeline boundaries, 781 frame round-trips, retiming, gap rejection');
