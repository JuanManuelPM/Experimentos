#!/usr/bin/env python3
# ÚLTIMA GUARDIA · sonido diegético provisional ORIGINAL.
# No sustituye la escucha de montaje: anclado a la shotlist de 48 s, sin metraje.
import argparse
from pathlib import Path
import wave
import numpy as np
from scipy.signal import butter, sosfilt

def render(dest, sample_rate=32000, seconds=48, seed=214):
    sr=sample_rate; n=sr*seconds
    rng=np.random.default_rng(seed); t=np.arange(n)/sr
    def lowpass(cut):
        return sosfilt(butter(3,cut,fs=sr,output="sos"),rng.standard_normal(n))
    room=.0065*np.sin(2*np.pi*59.8*t)+.005*np.sin(2*np.pi*119.9*t)
    rain=lowpass(1400)*.005*(.65+.25*np.sin(2*np.pi*.07*t))
    air=lowpass(600)*.007
    left=room+rain*.83+air
    right=room+rain*1.15+air*.85
    def signal(start,end,fn,pan=0,gain=1):
        a=int(start*sr);b=min(n,int(end*sr));tt=np.arange(b-a)/sr
        sig=fn(tt)*gain
        left[a:b]+=sig*np.sqrt((1-pan)/2)
        right[a:b]+=sig*np.sqrt((1+pan)/2)
    def thud(tt):
        return .27*(np.sin(2*np.pi*138*tt)*np.exp(-24*tt)+.33*np.sin(2*np.pi*285*tt)*np.exp(-50*tt))+.04*np.exp(-42*tt)*rng.standard_normal(len(tt))
    def paper(tt):
        return .035*(np.sin(np.pi*np.clip(tt,0,1))**2)*rng.standard_normal(len(tt))
    def step(tt):
        return .07*np.exp(-31*tt)*np.sin(2*np.pi*95*tt)
    def lock(tt):
        return .12*np.sin(2*np.pi*520*tt)*np.exp(-45*tt)+.04*rng.standard_normal(len(tt))*np.exp(-50*tt)
    def breath(tt):
        return .024*(np.sin(np.pi*np.clip(tt/3.7,0,1))**2)*rng.standard_normal(len(tt))
    signal(5.4,6.4,paper,pan=-.35)
    signal(13.2,14.1,thud,pan=.83)
    for sec in (17,17.62,18.2,18.77):
        signal(sec,sec+.18,step,pan=.12)
    signal(19.4,19.9,lock,pan=.74)
    signal(36.7,37.25,lock,pan=.9)
    signal(38.3,38.75,lock,pan=.9)
    signal(42.2,43.1,thud,pan=.95,gain=.65)
    signal(44,47.7,breath,pan=-.22)
    stereo=np.stack([left,right],axis=-1)
    peak=np.max(np.abs(stereo))
    stereo=np.clip(stereo*min(1,.75/peak),-1,1)
    Path(dest).parent.mkdir(parents=True,exist_ok=True)
    with wave.open(str(dest),"wb") as file:
        file.setnchannels(2);file.setsampwidth(2);file.setframerate(sr)
        file.writeframes((stereo*32767).astype('<i2').tobytes())
    print(f"WAV original provisional: {dest}, {seconds}s, stereo, {sr}Hz")
if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("--output",default="ultima_guardia_foley_boceto.wav")
    a=p.parse_args()
    render(a.output)
