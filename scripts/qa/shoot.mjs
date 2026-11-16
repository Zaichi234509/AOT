import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'

const URL_BASE = (process.env.SHOT_URL ?? 'http://localhost:3000/') + (process.env.SHOT_QUERY ?? '?q=high')
const VIEW = { width: 1280, height: 720 }

const SCENES = [
  { id: 'shiganshina', start: 0, end: 0.125 },
  { id: 'walls', start: 0.125, end: 0.281 },
  { id: 'corps', start: 0.281, end: 0.469 },
  { id: 'titans', start: 0.469, end: 0.625 },
  { id: 'trost', start: 0.625, end: 0.75 },
  { id: 'basement', start: 0.75, end: 0.875 },
  { id: 'rumbling', start: 0.875, end: 1 },
]

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function launch() {
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
  const page = await browser.newPage()
  await page.setViewport({ ...VIEW, deviceScaleFactor: 1 })

  // Instrument WebGL draw calls + frame cadence without touching the app.
  await page.evaluateOnNewDocument(() => {
    window.__gls = { draws: 0, tris: 0, frames: 0, t0: performance.now(), gl: null }
    const patch = (proto) => {
      if (!proto) return
      for (const name of ['drawElements', 'drawArrays', 'drawElementsInstanced', 'drawArraysInstanced']) {
        const orig = proto[name]
        if (!orig) continue
        proto[name] = function (...a) {
          window.__gls.draws++
          if (typeof a[1] === 'number') {
            const inst = /Instanced$/.test(name) && typeof a[4] === 'number' ? a[4] : 1
            window.__gls.tris += (a[1] / 3) * inst
          }
          return orig.apply(this, a)
        }
      }
    }
    patch(window.WebGL2RenderingContext && window.WebGL2RenderingContext.prototype)
    patch(window.WebGLRenderingContext && window.WebGLRenderingContext.prototype)
    const raf = window.requestAnimationFrame.bind(window)
    window.requestAnimationFrame = (cb) => raf((t) => { window.__gls.frames++; return cb(t) })
  })

  page.on('console', (m) => {
    const t = m.text()
    if (/warn|error|WebGL|THREE/i.test(t)) console.log('  [page]', t.slice(0, 300))
  })
  page.on('pageerror', (e) => console.log('  [pageerror]', String(e).slice(0, 300)))
  return { browser, page }
}

async function gotoStage(page) {
  await page.goto(URL_BASE, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await page.waitForFunction(() => !document.querySelector('[aria-live="polite"][aria-busy]'), { timeout: 120000 })
  await page.waitForSelector('canvas', { timeout: 120000 })
  await sleep(6000)
}

async function scrollToProgress(page, p) {
  const info = await page.evaluate((p) => {
    const el = document.getElementById('stage-track')
    const top = el.offsetTop
    const dist = el.offsetHeight - window.innerHeight
    const y = Math.round(top + p * dist)
    window.scrollTo(0, y)
    return { y, top, dist }
  }, p)
  await sleep(400)
  const actual = await page.evaluate(() => Math.round(window.scrollY))
  return { ...info, actual }
}

async function settle(page, frames) {
  await page.evaluate(
    (n) =>
      new Promise((res) => {
        let i = 0
        const step = () => {
          i++
          if (i >= n) res()
          else requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
      }),
    frames
  )
}

async function measure(page, ms) {
  await page.evaluate(() => {
    window.__gls.draws = 0
    window.__gls.tris = 0
    window.__gls.frames = 0
    window.__gls.t0 = performance.now()
  })
  await sleep(ms)
  const r = await page.evaluate(() => ({
    draws: window.__gls.draws,
    tris: window.__gls.tris,
    frames: window.__gls.frames,
    dt: performance.now() - window.__gls.t0,
  }))
  return {
    drawsPerFrame: +(r.draws / Math.max(1, r.frames)).toFixed(1),
    trisPerFrame: Math.round(r.tris / Math.max(1, r.frames)),
    fps: +((r.frames / r.dt) * 1000).toFixed(1),
    drawsPerSec: Math.round((r.draws / r.dt) * 1000),
    frames: r.frames,
  }
}

async function main() {
  const mode = process.argv[2] ?? 'shots'
  const outDir = process.argv[3] ?? '/tmp/shots/out'
  fs.mkdirSync(outDir, { recursive: true })
  const { browser, page } = await launch()

  if (mode === 'shots' || mode === 'all') {
    await gotoStage(page)
    for (const [i, s] of SCENES.entries()) {
      const local = Number(process.env.SHOT_LOCAL ?? 0.5)
      const p = s.start + local * (s.end - s.start)
      const info = await scrollToProgress(page, p)
      await settle(page, 8)
      await sleep(Number(process.env.SHOT_SETTLE ?? 2500))
      const file = `${outDir}/${String(i + 1).padStart(2, '0')}-${s.id}.png`
      await page.screenshot({ path: file })
      const perf = await measure(page, 3000)
      console.log(`scene ${i + 1} ${s.id} p=${p.toFixed(4)} y=${info.actual} -> ${file}`)
      console.log('   on-screen:', JSON.stringify(perf))
    }
  }

  if (mode === 'one') {
    await gotoStage(page)
    const index = Number(process.argv[4] ?? 0)
    const local = Number(process.argv[5] ?? 0.5)
    const s = SCENES[index]
    const p = s.start + local * (s.end - s.start)
    const info = await scrollToProgress(page, p)
    await settle(page, 10)
    await sleep(3000)
    const file = `${outDir}/${String(index + 1).padStart(2, '0')}-${s.id}-${local}.png`
    await page.screenshot({ path: file })
    console.log(`scene ${index + 1} ${s.id} p=${p.toFixed(4)} y=${info.actual} -> ${file}`)
    console.log('   perf:', JSON.stringify(await measure(page, 3000)))
  }

  if (mode === 'perf' || mode === 'all') {
    await gotoStage(page)
    const onScreen = await scrollToProgress(page, 0.55)
    await settle(page, 12)
    const a = await measure(page, 4000)
    console.log('ON-SCREEN (stage visible)', JSON.stringify(onScreen), JSON.stringify(a))

    // scroll deep into the content sections — stage is far off screen
    await page.evaluate(() => {
      const el = document.getElementById('titans')
      window.scrollTo(0, el ? el.getBoundingClientRect().top + window.scrollY : 20000)
    })
    await sleep(1500)
    const b = await measure(page, 4000)
    console.log('OFF-SCREEN (titan bestiary section)', JSON.stringify(b))
  }

  await browser.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
