import asyncio,threading,functools,http.server,os,json
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).parent
handler=functools.partial(http.server.SimpleHTTPRequestHandler,directory=str(ROOT))
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),handler)
threading.Thread(target=server.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{server.server_port}/index.html'
async def main():
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  results=[]
  for width,height in [(390,844),(1440,900),(320,720),(768,1024)]:
   context=await browser.new_context(viewport={'width':width,'height':height},device_scale_factor=1)
   page=await context.new_page();errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   try:
    await page.goto(url,wait_until='networkidle',timeout=10000)
    await page.screenshot(path=str(ROOT/f'first-frame-{width}.png'),full_page=False)
    overflow=await page.evaluate('document.documentElement.scrollWidth > innerWidth')
    hero=await page.locator('h1').text_content()
    stage=await page.locator('svg[data-radio]').first.get_attribute('aria-label')
    if width==390:
     await page.locator('[data-finish="arcilla"]').click()
     newPrice=await page.locator('#price').inner_text()
     newClass=await page.locator('#config-scene').get_attribute('class')
     await page.locator('#add-to-bag').click()
     await page.locator('[data-finish="noche"]').click(force=True) if not await page.locator('#bag').evaluate('(d)=>d.open') else None
     bagOpen=await page.locator('#bag').evaluate('(d)=>d.open')
     firstCount=await page.locator('#bag-count').inner_text()
     await page.reload(wait_until='networkidle')
     persisted=await page.locator('#bag-count').inner_text()
     await page.locator('#cart-open').click()
     items=await page.locator('.bag-line').count()
     await page.locator('[data-action="more"]').first.click()
     qty=await page.locator('.bag-line .qty span').first.inner_text()
     await page.locator('#demo-finish').click()
     empty=await page.locator('#bag-count').inner_text()
     results.append({'function':{'newPrice':newPrice,'newClass':newClass,'bagOpen':bagOpen,'firstCount':firstCount,'persisted':persisted,'items':items,'qtyAfterPlus':qty,'emptyAfterFinish':empty}})
    results.append({'width':width,'overflow':overflow,'errors':errors,'heading':hero.strip() if hero else '', 'firstSceneLabel':stage})
   except Exception as exc:results.append({'width':width,'error':str(exc),'errors':errors})
   await context.close()
  await browser.close()
  print(json.dumps({'url':url,'results':results},ensure_ascii=False,indent=2))
asyncio.run(main())
server.shutdown()
