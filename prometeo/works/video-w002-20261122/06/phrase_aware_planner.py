#!/usr/bin/env python3
"""PhraseAwareEditPlanner v1 · music-section-aware reusable cut planner."""
import json,sys
from pathlib import Path
def plan(score,min_shot_seconds=2.5):
    sections=sorted(score['sections'],key=lambda x:x['start'])
    duration=float(score['durationSeconds'])
    assert sections and abs(float(sections[0]['start']))<1e-9
    assert abs(float(sections[-1]['end'])-duration)<1e-9
    for a,b in zip(sections,sections[1:]):
        assert abs(float(a['end'])-float(b['start']))<1e-7,'time gap/overlap'
        assert b['end']-b['start']>=min_shot_seconds,'shot too short'
    shots=score.get('shots',[])
    assert len(shots)==len(sections),'one directional study for each phrase'
    out=[]
    for i,s in enumerate(sections):
        start=float(s['start'])
        prev=sections[i-1] if i else None
        reason=(f"change {prev['name']} → {s['name']} / {prev['intention']} → {s['intention']}") if prev else 'entry in low-energy phrase'
        contrast=abs(s['visualEnergy']-prev['visualEnergy']) if prev else s['visualEnergy']
        if i>0:
            out.append({'timeSeconds':start,'kind':'phrase_cut','priority':round(contrast,3),
                        'reason':reason,'notBeatAutomatic':True,
                        'visualContinuity':shots[i]['material'],'audioContinuity':'single 48kHz mix'})
    beat=60/score['bpm']
    beats=[round(i*beat,6) for i in range(int(duration/beat))]
    return {'schema':'PhraseAwareEditPlanner/v1','durationSeconds':duration,
            'bpm':score['bpm'],'beatsAnalysisOnly':beats,'edits':out,
            'shots':shots,'sourceSections':sections,
            'editRule':'A phrase boundary must change drama, visual scale or material state; beat alone never creates a cut.'}
if __name__=='__main__':
    score=json.loads(Path(sys.argv[1]).read_text())
    output=plan(score)
    path=Path(sys.argv[2]) if len(sys.argv)>2 else Path(sys.argv[1]).with_name('EDIT_PLAN.json')
    path.write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n')
    print(path)
