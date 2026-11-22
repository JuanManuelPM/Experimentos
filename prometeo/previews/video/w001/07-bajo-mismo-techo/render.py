"""Deterministic real MP4 render from the same HTML preview via Chromium + ffmpeg.
Usage: python render.py [out.mp4]  Requires chromium, playwright, ffmpeg, numpy.
No third-party media. Audio is original synthesised ambience / foley.
"""
from pathlib import Path
import base64, json, os, subprocess, sys, wave, math, hashlib
import numpy as np
from playwright.sync_api import sync_playwright

HERE = Path(__file__).resolve().parent
OUT = Path(sys.argv[1] if len(sys.argv)>1 else HERE/'bajo_el_mismo_techo.mp4')
OUT.parent.mkdir(parents=True,exist_ok=True)
FPS=24; DUR=12; SR=48000

def audio(out):
    n=SR*DUR
    rng=np.random.default_rng(7)
    t=np.arange(n,dtype=np.float64)/SR
    # Wind/rain: band-limited filtered random, amplitude eases when day arrives.
    a=rng.standard_normal(n)
    kernel=np.ones(43)/43
    hiss=np.convolve(a,kernel,mode='same')
    rain=(.067*(1-.7*np.clip((t-8)/4,0,1)))*hiss
    pad=(.035*np.sin(2*np.pi*110*t)+.023*np.sin(2*np.pi*165*t))*np.minimum(1,t/2)*(1-.3*np.clip((t-8)/4,0,1))
    # Umbrella pop and short foley, an inanimate gesture rather than speech.
    def blip(at,amp,freq,decay):
        dt=t-at
        mask=(dt>=0)&(dt<.8)
        return amp*np.sin(2*np.pi*(freq*dt+140*dt**2))*np.exp(-decay*np.maximum(dt,0))*mask
    soundtrack=rain+pad+blip(5.27,.18,360,19)+blip(9.77,.095,784,8)+blip(10.05,.065,988,8)
    # Fade-in/out to avoid impulse clicks.
    soundtrack*=np.minimum(1,np.maximum(0,t/.15))*np.minimum(1,np.maximum(0,(DUR-t)/.35))
    soundtrack=np.clip(soundtrack,-.9,.9)
    with wave.open(str(out),'wb') as f:
        f.setnchannels(1);f.setsampwidth(2);f.setframerate(SR)
        f.writeframes((soundtrack*32767).astype('<i2').tobytes())

def main():
    wav=OUT.with_suffix('.wav'); video=OUT.with_name('_silent.mp4'); audio(wav)
    with sync_playwright() as p:
        browser=p.chromium.launch(executable_path=os.getenv('CHROMIUM','/usr/bin/chromium'),headless=True,args=['--disable-gpu','--no-sandbox','--disable-dev-shm-usage'])
        page=browser.new_page(viewport={'width':960,'height':540}, device_scale_factor=1)
        page.set_content(HERE.joinpath('index.html').read_text(), wait_until='load');page.wait_for_function('!!window.renderFrame')
        spec=page.evaluate('window.videoSpec')
        assert spec['duration']==12 and spec['cuts']==[4,8]
        cmd=['ffmpeg','-hide_banner','-loglevel','error','-y','-f','image2pipe','-vcodec','png','-framerate',str(FPS),'-i','pipe:0','-vf','format=yuv420p','-c:v','libx264','-preset','veryfast','-crf','21','-movflags','+faststart',str(video)]
        proc=subprocess.Popen(cmd,stdin=subprocess.PIPE)
        for i in range(FPS*DUR):
            data=page.evaluate('sec => {window.renderFrame(sec);return document.querySelector("canvas").toDataURL("image/png").split(",")[1]}',i/FPS)
            proc.stdin.write(base64.b64decode(data))
            if i%48==0:print('FRAME',i,'/',FPS*DUR,flush=True)
        proc.stdin.close();rc=proc.wait();browser.close()
        if rc:raise RuntimeError(f'ffmpeg silent exit {rc}')
    cmd=['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(video),'-i',str(wav),'-c:v','copy','-c:a','aac','-b:a','128k','-shortest','-movflags','+faststart',str(OUT)]
    subprocess.run(cmd,check=True)
    video.unlink();wav.unlink()
    info=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration,size:stream=codec_name,width,height,r_frame_rate,sample_rate','-of','json',str(OUT)],text=True))
    sha=hashlib.sha256(OUT.read_bytes()).hexdigest()
    print(json.dumps({'file':str(OUT),'sha256':sha,'ffprobe':info},indent=2),flush=True)

if __name__=='__main__':main()