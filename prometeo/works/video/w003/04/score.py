"""Original deterministic 26-second sound score. No third-party recordings, samples or voices."""
from pathlib import Path
import numpy as np
from scipy.io import wavfile
SR=44100;DUR=26;N=SR*DUR
rng=np.random.default_rng(20261122)
L=np.zeros(N);R=np.zeros(N)
def mix(t,sig,pan=0):
 i=int(t*SR);end=min(N,i+len(sig))
 if end<=i:return
 sig=sig[:end-i];L[i:end]+=sig*(.5-.25*pan);R[i:end]+=sig*(.5+.25*pan)
def env(d,attack=.04,release=.25):
 q=np.arange(int(d*SR))/SR
 return (1-np.exp(-q/max(.003,attack)))*np.minimum(1,np.maximum(0,(d-q)/max(.01,release)))
def tone(start,d,f1,f2=None,vol=.1,kind="soft",pan=0):
 ti=np.arange(int(d*SR))/SR;f2=f1 if f2 is None else f2
 ph=2*np.pi*np.cumsum(f1+(f2-f1)*(ti/d))/SR
 if kind=="soft":s=np.sin(ph)+.22*np.sin(2*ph)+.06*np.sin(3*ph)
 elif kind=="glass":s=np.sin(ph)+.22*np.sin(3.8*ph)+.09*np.sin(6.2*ph)
 elif kind=="hollow":s=np.sin(ph)+.32*np.sin(1.013*ph)+.12*np.sin(2.01*ph)
 else:s=np.tanh(2.2*(np.sin(ph)+.45*np.sin(2*ph)))
 mix(start,vol*s*env(d,min(.3,d*.18),min(.8,d*.30)),pan)
def tick(at,vol=.12,tension=1,pan=0):
 d=.25;ti=np.arange(int(d*SR))/SR
 noise=np.convolve(rng.normal(size=len(ti)),np.ones(8)/8,mode="same")
 mix(at,vol*(.3*noise+.7*np.sin(2*np.pi*(970*tension-800*ti)*ti))*np.exp(-28*ti),pan)
def breath(at,d,vol=.07,pan=0):
 ti=np.arange(int(d*SR))/SR
 smooth=np.convolve(rng.normal(size=len(ti)),np.ones(29)/29,mode="same")
 mix(at,smooth*env(d,.6,.5)*vol,pan)
tone(.07,1.8,131,127,.12,pan=-.2);tick(.3,.13,1,-.6);tick(1.38,.11,.85,.5);breath(2,.83,.035,.3)
tone(3,5.5,164.81,160.2,.18,"soft",-.45);tone(3.12,5.1,246.94,242,.14,"glass",.4);tone(4,3.3,329.63,327,.07,"soft",.2);tick(3.02,.1,.95,-.6);tick(5.65,.09,1.2,.7)
tick(9.2,.27,.58,-.8);tone(9.26,.82,592,225,.14,"glass",.8);tone(10.6,3.9,123,118,.14,"hollow",-.6);tone(11.5,2.8,129,133,.09,"hollow",.7);tick(12.8,.12,.87,.7);breath(11,3,.045,-.6)
tone(15.44,1.8,102,62,.28,"rough",-.2);tick(15.45,.42,.44,0);tone(16.4,4.5,71,54,.20,"rough",.2);tone(16.9,3.9,142,101,.05,"hollow",-.3);tick(19.12,.29,1.8,.5);breath(18,2.8,.065,-.4)
tone(21.48,3.7,196,202,.12,"soft",-.25);tone(21.7,3.3,293.66,294.2,.13,"glass",.25);tone(23.5,1.4,392,330,.06,"glass",.5);tick(23.3,.11,1.06,-.6)
delay=int(.049*SR);L[delay:]+=R[:-delay]*.16;R[delay:]+=L[:-delay]*.10
peak=max(np.max(np.abs(L)),np.max(np.abs(R)))
out=np.column_stack((L,R))/max(peak,1e-9)*.78
fade=int(.6*SR);out[-fade:]*=np.linspace(1,0,fade)[:,None]
wavfile.write(str(Path(__file__).parent/"SCORE_ORIGINAL.wav"),SR,np.int16(np.clip(out,-1,1)*32767))
