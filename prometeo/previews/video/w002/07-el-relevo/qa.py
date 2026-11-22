"""Raccord formal tests; cannot establish artistic quality or spectator understanding."""
import json,os,subprocess,sys
root=os.path.dirname(__file__)
g=json.load(open(os.path.join(root,'SilentContinuityGraph.json')))
shots=g['shots'];assert len(shots)>=5
assert all(abs(shots[i]['out']-shots[i+1]['in'])<1e-9 for i in range(len(shots)-1))
assert shots[0]['in']==0 and shots[-1]['out']==28
assert len(set(s['id'] for s in shots))==len(shots)
owner=shots[0]['mittenOwner']
for event in g['handoffs']:
 assert event['from']==owner
 assert len([s for s in shots if s['id']==event['actionVisibleIn'] and s['in']<=event['time']<s['out']])==1
 owner=event['to']
assert shots[-1]['mittenOwner']==owner
assert len({x['objectId'] for x in g['handoffs']})==1
m=os.path.join(root,'EL_RELEVO_07.mp4')
info=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration:stream=codec_name,codec_type,width,height,avg_frame_rate,sample_rate','-of','json',m]))
assert abs(float(info['format']['duration'])-28)<.1
assert {'video','audio'}=={s['codec_type'] for s in info['streams']}
assert any(s['codec_name']=='h264' and s['width']==960 for s in info['streams'])
assert any(s['codec_name']=='aac' for s in info['streams'])
subprocess.run(['ffmpeg','-v','error','-i',m,'-f','null','-'],check=True)
print('PASS: 8 temporal shots, 2 visible ownership handoffs, one prop ID; H.264/AAC 28s, complete decode.')
print('NOT_RUN: independent spectator understanding and professional acting/sound evaluation.')
