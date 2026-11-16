# QA harness — stage screenshots, perf, mobile fallbacks

The scripts here are the ones that produced `docs/rendering/**` and the numbers in
[`docs/RENDERING-UPGRADE.md`](../../docs/RENDERING-UPGRADE.md). They drive the
production build in headless Chromium and instrument WebGL from the outside, so
nothing in `src/` knows they exist.

## Dependencies (not in `package.json` on purpose)

```bash
npm i -D puppeteer-core @sparticuz/chromium
# or use a local Chrome/Chromium and skip @sparticuz:
#   PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium node scripts/qa/shoot.mjs shots out/
```

`@sparticuz/chromium` ships a headless build that works without a system GTK/NSS
stack. On a normal desktop, `puppeteer-core` + your installed Chrome is simpler.

## Usage

```bash
npm run build && npm run start            # :3000

node scripts/qa/shoot.mjs shots out/      # 7 screenshots + per-scene draw/fps numbers
node scripts/qa/shoot.mjs perf            # stage on-screen vs off-screen draw calls
node scripts/qa/shoot.mjs one out/ 2 0.5  # scene index 2, scene-local progress 0.5
node scripts/qa/shoot.mjs all             # both modes
node scripts/qa/mobile.mjs out/           # 390px, no-WebGL and reduced-motion profiles
node scripts/qa/dbg.mjs                   # dumps overlay opacity/visibility at a fixed scroll
```

| Env var | Meaning |
|---|---|
| `SHOT_URL` | page URL, default `http://localhost:3000/` |
| `SHOT_QUERY` | query string appended to the URL, e.g. `?q=high&debug=nopost` |
| `SHOT_LOCAL` | scene-local progress for `shots` mode (default: the seven fixed positions) |
| `SHOT_SETTLE` | ms to wait after scrolling before measuring (default 1200) |

The seven survey positions are `p = 0.0625, 0.2030, 0.3750, 0.5470, 0.6875,
0.8125, 0.9375` of the stage track, i.e.
`scrollTo(#stage-track.offsetTop + p * (offsetHeight - innerHeight))`. Keep them
identical when you re-shoot, or the before/after pairs stop being comparable.
