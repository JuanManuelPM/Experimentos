"""Offline renderer for the same browser-based typography composition. Requires playwright + ffmpeg."""
import asyncio,base64,subprocess,pathlib
from playwright.async_api import async_playwright
BASE=pathlib.Path(__file__).parent
async def main():
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(headless=True,args=["--no-sandbox","--disable-dev-shm-usage"])
  page=await browser.new_page(viewport={"width":1440,"height":1100})
  await page.set_content((BASE/"index.html").read_text(),wait_until="load")
  await page.evaluate("document.fonts.ready")
  for name,portrait in [("16x9",False),("9x16",True)]:
   await page.evaluate("(v)=>window.TYPE_FILM.setPortrait(v)",portrait)
   output=BASE/("UNA_PALABRA_CAMBIA_TODO_"+name+"_SILENT.mp4")
   f=subprocess.Popen(["ffmpeg","-v","error","-y","-f","image2pipe","-framerate","24","-vcodec","mjpeg","-i","pipe:0","-an","-c:v","libx264","-preset","veryfast","-crf","19","-pix_fmt","yuv420p",str(output)],stdin=subprocess.PIPE)
   for i in range(624):
    encoded=await page.evaluate("(t)=>{window.TYPE_FILM.renderAt(t);return document.querySelector('canvas').toDataURL('image/jpeg',.94).split(',')[1]}",i/24)
    f.stdin.write(base64.b64decode(encoded))
    if i in [24,119,282,401,542]:
     png=await page.evaluate("()=>document.querySelector('canvas').toDataURL('image/png').split(',')[1]")
     (BASE/("frame_"+name+"_"+str(i).zfill(3)+".png")).write_bytes(base64.b64decode(png))
   f.stdin.close()
   if f.wait()!=0:raise RuntimeError("ffmpeg render failed: "+name)
  await browser.close()
asyncio.run(main())
