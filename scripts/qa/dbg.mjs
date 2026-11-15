import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  args: [...chromium.args, '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader'],
  executablePath: await chromium.executablePath(),
  headless: 'shell',
  env: { ...process.env, LD_LIBRARY_PATH: '/tmp/al2023/lib' },
})
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 720 })
await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' })
await page.waitForFunction(() => !document.querySelector('[aria-live="polite"][aria-busy]'), { timeout: 120000 })
await new Promise(r => setTimeout(r, 5000))
await page.evaluate(() => {
  const el = document.getElementById('stage-track')
  window.scrollTo(0, el.offsetHeight * 0.9375)
})
await new Promise(r => setTimeout(r, 5000))
const out = await page.evaluate(() => {
  const res = []
  const walk = (el) => {
    for (const c of el.children) {
      const cs = getComputedStyle(c)
      const txt = (c.textContent || '').trim().slice(0, 40)
      if ((cs.opacity !== '0' && cs.visibility !== 'hidden' && cs.display !== 'none') && /Walls built|Size comparison|boulder that sealed/i.test(txt)) {
        res.push({ tag: c.tagName, cls: c.className.toString().slice(0, 60), op: cs.opacity, vis: cs.visibility, txt: txt.slice(0,30), parentOp: getComputedStyle(c.parentElement).opacity, parentVis: getComputedStyle(c.parentElement).visibility, parentCls: c.parentElement.className.toString().slice(0,70) })
      }
      walk(c)
    }
  }
  walk(document.body)
  return { progress: window.scrollY, found: res.slice(0, 12) }
})
console.log(JSON.stringify(out, null, 1))
await browser.close()
