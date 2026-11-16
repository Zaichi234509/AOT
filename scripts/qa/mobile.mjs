import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'
import fs from 'node:fs'

const URL = process.env.SHOT_URL || 'http://localhost:3000/'
const OUT = process.argv[2] || '/tmp/shots/mobile'

fs.mkdirSync(OUT, { recursive: true })

const browser = await puppeteer.launch({
  args: [
    ...chromium.args,
    '--enable-unsafe-swiftshader',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
  ],
  executablePath: await chromium.executablePath(),
  headless: 'shell',
  env: { ...process.env, LD_LIBRARY_PATH: '/tmp/al2023/lib' },
})

const results = {}

async function probe(name, { width, height, reducedMotion, query, killGL }) {
  const page = await browser.newPage()
  await page.setViewport({ width, height, deviceScaleFactor: 1 })
  if (reducedMotion) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  const requests = []
  page.on('request', (r) => {
    const u = r.url()
    if (/\.(glb|gltf|hdr|ktx2)(\?|$)/i.test(u)) requests.push(u)
  })
  if (killGL) {
    await page.evaluateOnNewDocument(() => {
      // simulate a browser with no WebGL at all
      for (const key of ['WebGLRenderingContext', 'WebGL2RenderingContext']) {
        try {
          delete window[key]
        } catch {
          /* ignore */
        }
        window[key] = undefined
      }
      HTMLCanvasElement.prototype.getContext = function () {
        return null
      }
    })
  }
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e.message).slice(0, 160)))
  await page.goto(URL + (query || ''), { waitUntil: 'networkidle2', timeout: 60000 })
  await new Promise((r) => setTimeout(r, 4200))

  // scroll into the middle of the stage
  await page.evaluate(() => {
    const track = document.querySelector('#stage-track')
    if (!track) return
    const y = track.offsetTop + 0.45 * (track.offsetHeight - innerHeight)
    window.scrollTo(0, y)
  })
  await new Promise((r) => setTimeout(r, 1500))

  const info = await page.evaluate(() => {
    const canvases = Array.from(document.querySelectorAll('canvas'))
    const gl = canvases.length
      ? canvases[0].getContext('webgl2') || canvases[0].getContext('webgl')
      : null
    return {
      canvases: canvases.length,
      glRenderer: gl ? String(gl.getParameter(gl.RENDERER)) : null,
      mobileStage: !!document.querySelector('[data-mobile-stage], .mobile-stage'),
      stageVisibleHeight: (() => {
        const el = document.querySelector('#stage-track')
        if (!el) return 0
        const r = el.getBoundingClientRect()
        return Math.round(Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0)))
      })(),
      bodyScrollable: document.documentElement.scrollHeight - innerHeight > 1000,
      navText: document.querySelector('header')?.innerText?.slice(0, 60) || '',
    }
  })

  results[name] = { ...info, modelRequests: requests, errors }
  await page.screenshot({ path: `${OUT}/${name}.png` })
  await page.close()
}

await probe('desktop-1280', { width: 1280, height: 800 })
await probe('mobile-390', { width: 390, height: 844 })
await probe('reduced-motion', { width: 1280, height: 800, reducedMotion: true })
await probe('nogl', { width: 1280, height: 800, killGL: true })

console.log(JSON.stringify(results, null, 2))
await browser.close()
