from pathlib import Path
from playwright.sync_api import sync_playwright
html=Path(__file__).resolve().parents[1].joinpath('index.html').read_text()
out=Path(__file__).resolve().parents[1].joinpath('evidence');out.mkdir(exist_ok=True)
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--use-angle=swiftshader','--enable-webgl','--enable-unsafe-swiftshader','--no-proxy-server'])
 for width,height in [(320,740),(390,844),(1180,780)]:
  page=browser.new_page(viewport={'width':width,'height':height},device_scale_factor=1)
  page.set_content(html,wait_until='domcontentloaded')
  page.evaluate("document.getElementById('status').textContent='WEBGL2_UNAVAILABLE · Entorno de prueba sin GPU'" )
  actual=page.evaluate('({width:document.documentElement.scrollWidth,viewport:innerWidth,buttons:[...document.querySelectorAll("button")].filter(b=>b.getBoundingClientRect().width>0).length,canvas2d:!!document.getElementById("uv").getContext("2d"),webgl2:!!document.createElement("canvas").getContext("webgl2")})')
  page.screenshot(path=str(out/f'ui_{width}.png'),full_page=True)
  print(width,actual)
  assert actual['width']<=width+1,'HORIZONTAL_OVERFLOW'
  assert actual['buttons']>=10
  assert actual['canvas2d']
  page.close()
 browser.close()
