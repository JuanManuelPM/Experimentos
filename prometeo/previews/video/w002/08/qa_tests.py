"""Independent numerical, visual frame and exported media tests for VIDEO W002-08."""
import json,math,subprocess
from pathlib import Path
from data_to_motion import read_data,X,Y,YMIN,YMAX,YEAR0,YEAR1,frame,SECONDS,FPS,W,H
p=Path(__file__).parent
D=read_data(p/'annual_nasa_gistemp_1880_2025.csv');m=dict(D)
assert len(D)==146 and [x[0] for x in D]==list(range(1880,2026))
assert m[1880]==-.17 and m[2025]==1.18 and m[2024]==1.28
assert X(1880)<X(1900)<X(2025), 'years must not reverse in X'
assert Y(-.50)>Y(0)>Y(1.19), 'Y should be linear, not magnitude-distorting'
assert math.isclose((Y(1.0)-Y(0)),Y(0)-Y(-1.0),abs_tol=1e-9)
assert Y(YMIN)>Y(YMAX)
for second in (1,7,13,19):
    assert frame(second,D).size==(W,H)
file=p/'LA_CIFRA_INVISIBLE.mp4'
meta=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(file)]))
video=next(s for s in meta['streams'] if s['codec_type']=='video')
audio=next(s for s in meta['streams'] if s['codec_type']=='audio')
assert (video['codec_name'],video['width'],video['height'])==('h264',W,H)
assert video['r_frame_rate']==f'{FPS}/1' and audio['codec_name']=='aac'
assert abs(float(meta['format']['duration'])-SECONDS)<.04
subprocess.run(['ffmpeg','-v','error','-i',str(file),'-f','null','-'],check=True)
print('PASS NUMERIC 146 annual NASA snapshots; fixed linear axes; source anchors')
print('PASS FRAMES 4 sampled timecodes; no render exceptions')
print('PASS MEDIA H.264/AAC 960x540, 24fps, 22sec, full stream decode')
