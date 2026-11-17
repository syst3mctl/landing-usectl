# Renders public/cta/glow-side.webp (the CTA card's side lights). Run: python3 scripts/make-cta-glow-side.py
# needs numpy, scipy, Pillow; writes cta-glow.png and public/cta/glow-side.webp (lossless).
import numpy as np
from scipy.ndimage import gaussian_filter
from PIL import Image
K=1.5
SP=200                   # spread around the blob (≈ 2σ)
BW,BH=213,236            # blob
W,H=int((BW+2*SP)*K),int((BH+2*SP)*K)
y,x=np.mgrid[0:H,0:W].astype(float)
cx,cy=(SP+BW/2)*K,(SP+BH/2)*K
mask=(((x-cx)/(BW*K/2))**2+((y-cy)/(BH*K/2))**2<=1).astype(float)
# 140deg linear gradient #B6F1C0 -> #11A32A across the blob box
c0=np.array([0xB6,0xF1,0xC0],float); c1=np.array([0x11,0xA3,0x2A],float)
ang=np.deg2rad(140); dx,dy=np.sin(ang),-np.cos(ang)
proj=((x-cx)*dx+(y-cy)*dy); half=abs(BW*K/2*dx)+abs(BH*K/2*dy)
t=np.clip((proj+half)/(2*half),0,1)
sig=100*K                # Figma layer blur 200 ≈ gaussian σ 100
a=gaussian_filter(mask,sig,mode='constant')
col=np.stack([gaussian_filter(mask*(c0[i]*(1-t)+c1[i]*t),sig,mode='constant') for i in range(3)],-1)
col=col/np.maximum(a,1e-9)[...,None]
a=a/a.max()
# fade to exactly 0 at the image edge (no hard border)
edge=np.minimum.reduce([x,y,W-1-x,H-1-y])/(40*K); a*=np.clip(edge,0,1)
PEAK=0.062
rng=np.random.default_rng(7)
alpha=a*PEAK*255 + (rng.random(a.shape)-rng.random(a.shape))*3.0
alpha=np.clip(np.round(alpha),0,255)
mean=(col*a[...,None]).sum((0,1))/a.sum(); print('mean colour',mean.round())
rgb=np.broadcast_to(np.round(mean),col.shape)
img=np.dstack([rgb,alpha]).astype(np.uint8)
Image.fromarray(img,'RGBA').save('cta-glow.png',optimize=True)
print(img.shape, alpha.max())
Image.open('cta-glow.png').save('public/cta/glow-side.webp', lossless=True, method=6)
