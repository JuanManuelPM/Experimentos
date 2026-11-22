#!/usr/bin/env python3
"""VolumetricAtmosphere v3. Optical-volume storm alternate, after rejected 2.5D article.
Original 3D-depth cloud/fog integration, temporal lighting and rain curtains. No paid assets.
"""
import math
import numpy as np
import cv2
from PIL import Image,ImageDraw
import render as base

class VolumeComposer(base.CoupledAtmosphereV2):
    """Volume-first 3D depth slabs and Beer-Lambert transmission instead of screen rain."""
    def integrate(self,scene,t,s):
        w,h=self.w,self.h
        X,Y=self.X,self.Y
        rgb=np.asarray(scene.convert("RGB"),dtype=np.float32)
        tau=np.zeros((h,w),np.float32)
        scattered=np.zeros((h,w,3),np.float32)
        for j in range(12):
            depth=(j+.5)/12.
            xx=X + .07*(1-depth)*float(base.smooth(0,14,t)) - .025*t*s["wind"]*(.2+depth)
            yy=Y + .013*depth*math.sin(.35*t)
            noise=(.5+.24*np.sin(13*xx+3*depth+1.3*np.sin(7*yy-t))+
                   .15*np.sin(27*xx-8*yy+5*depth-.22*t)+.09*np.cos(61*xx+23*yy+4*depth+.13*t))
            lower=np.exp(-((yy-(.60+.04*depth))/(.058+.065*s["fog"]))**2)
            upper=np.exp(-((yy-(.22+.3*depth))/(.12+.10*depth))**2)
            rho=(.10+.8*s["fog"])*lower*base.clamp(noise)+(.03+.17*s["storm"])*upper*base.clamp(noise)
            d=rho*(.12+.13*depth)
            tau+=d
            scattered+=d[...,None]*np.array([70,87,95],np.float32)[None,None,:]
        transmittance=np.exp(-.91*tau)
        source=scattered/(tau[...,None]+.0001)
        source=source*(1-.13*s["storm"])+s["flash"]*np.array([50,73,87])[None,None,:]
        rgb=rgb*transmittance[...,None]+source*(1-transmittance[...,None])
        # Deep sheets are volume-dependent, not thousands of streaks on a still frame.
        curtain=np.zeros((h,w),np.float32)
        for z in (.17,.45,.78):
            phase=(X+z*.03*t*s["wind"])*78+Y*(22+9*s["wind"])+t*(5+z*4)
            filament=(np.sin(phase)**16)*(.5+.5*np.sin(phase*.24+z*12))
            curtain+=filament*(z*.033+.014)*s["rain"]
        rgb=rgb*(1-curtain[...,None])+np.array([143,165,172])[None,None,:]*curtain[...,None]
        # Only sparse near-lens rain remains, as an optical depth cue.
        img=Image.fromarray(np.uint8(np.clip(rgb,0,255)),"RGB").convert("RGBA")
        draw=ImageDraw.Draw(img,"RGBA")
        rng=np.random.default_rng(776)
        for i in range(int(s["rain"]*90)):
            x,y,z=rng.random(3)
            px=int(((x+t*(.12+.15*z)*s["wind"])%1)*w)
            py=int(((y+t*(.55+.36*z))%1)*h)
            draw.line((px,py,px+int(2+7*z*s["wind"]),py+int(3+7*z)),fill=(188,205,211,int(20+22*z+45*s["flash"])),width=1)
        rgb=np.asarray(img.convert("RGB"),dtype=np.float32)
        noise=np.random.default_rng(741+int((t-self.start_time)*self.fps)).standard_normal((h,w)).astype(np.float32)
        rgb=rgb*self.vignette[...,None]*(.96-.06*s["storm"])+noise[...,None]*1.7
        return np.uint8(np.clip(rgb,0,255))
    def render_frame(self,i):
        t=self.start_time+i/self.fps
        s=base.climate(t)
        sky=self.layer(t,s)
        structures=self.architecture(sky,t,s)
        near=self.near_field(structures,t,s)
        frame=self.integrate(near,t,s)
        return self.camera(frame,t,s)

if __name__=="__main__":
    base.CoupledAtmosphereV2=VolumeComposer
    base.render_w003()
