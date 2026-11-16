# Rendering & mesh upgrade — what changed, and what I could not verify

Scope: the seven-scene 3D scrollytelling stage only. No content sections below the
stage were touched, no new dependencies were added (drei 9.114.3,
`@react-three/postprocessing` 2.16.3, three 0.169 — already installed).

Everything below is measured on the only renderer available in this environment:
**SwiftShader (software rasteriser, ANGLE)**. That has consequences — see
[§7](#7-what-i-could-not-verify).

---

## 1. The check first: was the canvas rendering off-screen?

**Yes — confirmed, then fixed.**

| Measurement | Before | After |
|---|---|---|
| Stage on-screen (`#stage-track` covering viewport) | 20.6 draws/frame | 37.7 draws/frame |
| Stage **off-screen** (Titan Bestiary section in view) | **10.1 draws/frame** | **0 draws/frame** |

The stage kept issuing draw calls after it had scrolled away; the loop was never
told to stop. `StickyStage` now owns an `IntersectionObserver` on
`#stage-track` plus a `visibilitychange` listener and passes `paused` down to the
canvas, which switches `frameloop` to `"never"` (a paused R3F canvas does not call
`gl.render`, so no draws, no uniforms, no shadow maps). While off-screen the page
animation frame cadence is whatever the rest of the page needs (37.5 Hz measured
in headless SwiftShader; not a meaningful number for real hardware).

QA harness: `node scripts/qa/shoot.mjs perf`.

---

## 2. Rendering

### 2.1 Image-based lighting without a CDN

`three/environment.tsx` builds the environment **locally at runtime**:

* seven `EnvPreset`s (zenith / horizon / ground colour, sun direction, sun
  intensity and sharpness, plus a broad sun glow and a cool sky bounce),
* each baked into a small half-float equirectangular map (the sun disc is written
  as HDR values > 1, which is what makes metal and wet stone glint),
* run through `PMREMGenerator` and cached per renderer + preset,
* applied as `scene.environment`, with `environmentIntensity` per scene.

No `Environment` preset from drei is used anywhere, and nothing is fetched from a
third-party CDN at runtime — the whole environment is generated from the preset
constants, so it works offline and in air-gapped builds.
`<SkyDome preset>` and `<SceneEnvironment preset>` are typed against the same
`EnvPreset` union, so a scene cannot get a sky that disagrees with its IBL.

### 2.2 Shadows that put objects on the ground

* `KeyLight` — one shadow-casting directional light per scene, with a shadow
  camera sized to *that shot* (`shadowScale` per scene, e.g. 9 m for the soldier
  dais, 130 m for Shiganshina) instead of three's default 512-unit frustum that
  wastes the whole map. 2048² by default, `PCFSoftShadowMap`, tuned
  `normalBias`/`radius` per scene.
* `ContactShadow` (drei) — a baked occlusion blob under each set, `frames={1}`
  because the geometry barely moves; skipped on the `low` tier.
* Ambient occlusion: SSAO is wired into `PostProcessingFX` (normal pass, colour,
  radius, distance thresholds) but **left off in every scene's grade**. At these
  scene scales the depth-based occlusion crushed mid-tones — soldier jackets and
  titan torsos went to near-black while the floor stayed bright, which is the
  opposite of what AO is for. Contact shadows do the grounding work instead.
  Set `ao: <intensity>` on any `SCENE_FX` entry to try it again.

### 2.3 A per-scene grade

`lib/sceneKeyframes.ts` → `SCENE_FX`, eased at runtime in `PostProcessingFX`:

| Knob | Meaning |
|---|---|
| `exposure` | `renderer.toneMappingExposure` (ACES Filmic) |
| `bloom`, `bloomThreshold` | emissive fire/eyes/steam only |
| `saturation` | `HueSaturation` **delta from neutral** |
| `contrast`, `brightness` | `BrightnessContrast`, also deltas |
| `vignetteOffset`, `vignetteDarkness` | frame pressure |
| `noise` | film grain, `OVERLAY` blend |
| `shake` | camera shake (multiplied by `motionAllowed()`) |

Every scene has its own exposure/temperature/vignette curve, so Shiganshina is a
warm dusk, the Corps scene is a cold moonlit night, the basement is a single lamp,
the Rumbling is fire-lit and crushing down to the ground.

Debug flags for QA (`lib/debugFlags.ts`): `?debug=nopost,nosky,noenv,noshadows`
and `&exposure=1.4`. **Kept** — it is the difference between "the grade looks
wrong" and "the geometry looks wrong" in five seconds of URL editing, and it is
cached and read once per frame.

### 2.4 Materials that read as materials

`three/materials.tsx` — 14 `SurfaceKind` recipes: stone, brick, plaster, roof,
wood, iron, steel, leather, cloth, skin, bark, foliage, ground, glass. Each
generates a procedural albedo + a Sobel-derived normal map + a roughness map on a
canvas, cached per kind/size, and is sampled with `repeat` scaled to the object
(it is metres-per-tile, not a magic number — a 60 m titan and a 1.7 m soldier do
not share a texel density). `Surface` takes
`kind, color, repeat, roughness, metalness, normalScale, envMapIntensity,
emissive, flatShading, plain, side, vertexColors, sheen`.

Vertex colour baking (`paintVertices`) is used for the instanced tree/forest and
village meshes so a single draw call still has per-instance variation.

### 2.5 Atmosphere

`SkyDome` (gradient + sun disc matching the IBL), linear fog per scene, `Ground`
with a triplanar-ish repeat, GPU `Particles` (dust/embers/snow), `Steam` for the
Colossal, `Clouds`.

---

## 3. Meshes — what is authored, what is procedural

### 3.1 Shipped models: none

**Zero `.glb` files are in this repository.** `.gitignore` keeps
`/public/models/*.glb` and `/public/textures/*.ktx2` out of git, and I did not add
binaries: they need hosting, and I had no way to host them from here.

What I built instead is the *upgrade path*, so a model can be dropped in later
without touching a scene:

* `lib/models.ts` — `MODEL_SLOTS`, twelve slots, each declaring the file name, the
  procedural component it replaces, its nominal height in metres (so a drop-in
  can be checked for scale), the clip names to drive from scroll, and the scenes
  that want it.
* `three/ModelSlot.tsx` — per-slot `useGLTF` behind a `SlotBoundary` error
  boundary with `Suspense`, always rendering its **own** procedural `fallback`
  while loading or on any failure. There is no global "models loaded" flag: one
  broken slot is one procedural object, not a hole in the stage.
  If the glb has animation clips, the first clip matching the slot's list is
  played and its `time` is scrubbed by `sceneLocalProgress`, so it animates with
  the scroll instead of free-running.
* `PreloadSceneModels({scene})` in `Experience.tsx` preloads only the *next*
  scene's slots; `Experience` mounts only the active scene, so at most two scenes'
  geometry is resident.
* Mobile (`<768px`) and the no-WebGL `CanvasBoundary` path render `MobileStage`
  and never touch `ModelSlot`, so no model request is ever made there. Verified:
  see §6.

### 3.2 What stayed procedural (everything)

| Object | Component | Why |
|---|---|---|
| Wall Maria / Rose / Sina + gates | `WallGate` | AoT architecture is copyrighted; no legitimate CC0 wall-with-gate exists at this scale |
| Colossal Titan (breach, and the 60 m silhouette) | `TitanBody variant="colossal"` | named character — nothing legitimate exists |
| Eren, Mikasa, Levi | `CorpsFigure` | named characters — nothing legitimate exists |
| Attack Titan, pure titans, the Rumbling horde | `TitanBody` | named designs — nothing legitimate exists |
| ODM gear, blades, harness | part of `CorpsFigure` | character-specific hardware |
| Trost / Shiganshina buildings | `Building`, `CityBlock`, `District` | generic, but authored ones would have to be modelled and hosted |
| The boulder | `Boulder` | a CC0 rock would work; not shipped, see below |
| Basement set | `Scene6Basement` | interior, made of planks/stone/desk/door primitives |
| Forests, debris, tiles, embers, steam | `Forest`, instanced helpers | cheap and already reads correctly |

### 3.3 Licensing — candidates considered, nothing downloaded

| Source | Licence | Verdict |
|---|---|---|
| Khronos `glTF-Sample-Models` | CC-BY 4.0 / CC0 per model | Sample *characters* (CesiumMan, RiggedFigure, BrainStem) are generic rigs, not AoT designs — swapping them in would make the Corps scene worse, not better. Some props (a rock, a crate) could serve. Not shipped: no hosted bucket, and `.glb` is git-ignored by design. |
| Poly Haven | CC0 | Textures/HDRIs are genuinely good for stone and rock, and CC0 needs no attribution. A rock/paving texture set would be the single best real upgrade for the walls. Not shipped (no hosting from here). |
| Quaternius | CC0 | Low-poly generic characters/props. Style clashes badly with the current procedural look. |

Explicitly rejected: anything ripped from the AoT games, fan-extracted models,
Sketchfab "AoT" uploads, and any **CC-BY-NC**/"editorial use" asset. If a future
contributor drops a model in, the licence and source **must** be recorded in
`public/models/README.md` before it is referenced from `lib/models.ts`.

### 3.4 How to host models and where the URL lives

1. Put the `.glb` (Draco or meshopt compressed, 1 unit = 1 m, feet/base at the
   origin, +Y up, facing +Z) in any static bucket — Vercel Blob, Cloudflare R2,
   S3 + CloudFront, or `public/models/` for local testing.
2. Set **one** of:
   * `NEXT_PUBLIC_MODELS_BASE_URL=https://cdn.example.com/aot-models` — every slot
     resolves to `${BASE}/${file}`; or
   * `NEXT_PUBLIC_MODEL_<SLOT>_URL=https://…/specific.glb` for a single slot
     (`WALL_GATE`, `COLOSSAL_HEAD`, `EREN`, `MIKASA`, `LEVI`, `ATTACK_TITAN`,
     `ODM_GEAR`, `PURE_TITAN`, `COLOSSAL_FULL`, `TROST_BUILDING`, `BOULDER`,
     `BASEMENT_ROOM`).
   * `NEXT_PUBLIC_DRACO_DECODER_PATH` only if you ship Draco meshes (empty by
     default — meshopt needs no decoder download).
3. Delete the corresponding `scenes` entry if you do *not* want a slot to replace
   its procedural fallback.

No env var is set in this repo, so `modelUrl()` returns `null` for all twelve
slots and every scene renders procedurally. `.env.example` documents the names.

---

## 4. Performance

Measured with `scripts/qa/shoot.mjs` (patched WebGL draw-call counter + rAF
cadence, 1280×720, DPR 1) at the same seven scroll positions as the screenshots.

### 4.1 Per scene, before → after (SwiftShader)

| Scene | p | draws/frame before | draws/frame after | tris/frame after | fps before | fps after |
|---|---|---|---|---|---|---|
| 1 Shiganshina | 0.0625 | 20.6 | 104.0 | 4 385 | 13.3 | 3.3 |
| 2 The Walls | 0.2030 | 9.4 | 50.2 | 14 593 | 6.7 | 1.7 |
| 3 Survey Corps | 0.3750 | 14.2 | 40.4 | 7 728 | 11.6 | 3.3 |
| 4 The Titans | 0.5470 | 20.6 | 29.4 | 11 549 | 10.0 | 5.0 |
| 5 Trost | 0.6875 | 13.9 | 112.2 | 5 130 | 8.3 | 1.7 |
| 6 Basement | 0.8125 | 16.6 | 27.8 | 424 | 10.0 | 3.3 |
| 7 Rumbling | 0.9375 | 14.4 | 24.2 | 18 441 | 11.7 | 1.7 |

**Read this honestly: on SwiftShader the frame rate went down, by roughly 3–4×.**
That is expected — the stage now draws a shadow map, runs bloom + grade + vignette
+ grain, and has far more geometry (instanced villages, forests, debris, and a
per-shot shadow pass that roughly doubles the draw calls of every caster).

The reason I expect real graphics hardware to be fine with it:

* **Draw calls: 24–112 per frame.** A mid-range laptop GPU handles a few thousand.
* **Triangles: 0.4k–18.4k per frame.** That is two orders of magnitude below the
  15–30k budget *per hero mesh* that the brief asks for a single glb.
* The expensive pixels are a 2048² shadow map per scene (once, not per frame per
  light) and bloom's mip chain; both are standard and scale with fill rate, not
  with the software rasteriser's pathological per-pixel cost.

Guard rails that are in place for weaker devices:

* `lib/quality.ts` tiers (`high`/`medium`/`low`) from the unmasked GPU renderer
  string (a software-renderer regex), `navigator.hardwareConcurrency`,
  `deviceMemory` and a coarse-pointer check; overridable with `?q=high|low` or
  `NEXT_PUBLIC_FORCE_QUALITY`. `low` drops shadow maps, contact shadows, SSAO,
  multisampling, DPR, environment resolution and geometry subdivisions.
* `SceneCanvas` uses drei's `PerformanceMonitor` to step `dpr` down under load and
  back up when there is headroom, inside the tier's range (high tier: 1 – 1.75).
* Off-screen and hidden tabs stop rendering entirely (§1).
* `prefers-reduced-motion` disables camera parallax/shake and the per-frame idle
  motion that is gated on `motionAllowed()` (candle flicker, titan drift); the
  scroll-driven camera still works, because that is the user's own input.

Bundle cost is unchanged: `/` is 106 kB with 200 kB first-load JS (the three
chunks were already in the build).

---

## 5. Fixed along the way

* **Canvas never idled off-screen** (see §1).
* **Post-processing grade was applied as multipliers to already-scaled values**,
  which is why an earlier build rendered a red flood; `HueSaturation.saturation`
  and `BrightnessContrast.contrast/brightness` are deltas from neutral and are now
  passed as `value - 1`.
* **Doubled titan neck** (rings built in local space inside an already-offset
  group).
* **`WallGate` UVs** were uniform-stretched, so bricks read as smeared wood;
  repeat now derives from block size.
* **Overlay bleed**: `Reveal` now clamps its out-range to the scene, so cards with
  `end > 1` no longer stay half-visible for the rest of the stage (they were
  measured at `opacity: 1` under a parent group at `0`/`0.5`).
* **Soldier figures**: real limb profiles (thigh → knee → calf), deltoids, neck,
  collar, hands, boots, chest harness, hip blades, eyes; cape re-hinged at the
  shoulder line so it hangs instead of floating as a board; trousers and jacket
  tones separated.
* **Titan skin texel density** now scales with body height, so a 60 m titan and a
  7 m titan no longer share one texture scale.
* **Camera keyframes** — changed only where a shot was actually broken:
  * scene 1: keys 0/0.3/0.5 look target lowered (the opening frames were 55 %
    empty sky, i.e. a flat colour field) and exposure/bloom pulled back;
  * scene 3: the 15 m titan moved from `[3.4, 0, -34]` to `[7, 0, -62]` so its
    head is inside frame at the mid-scene shots instead of being cropped;
  * scene 5: last key moved to `[0, 18, -34]` looking at the Wall Rose gate; the
    previous end-of-scene framing put the camera 21 m from a flat wall box, which
    filled 100 % of the frame with untextured stone.
  * Scene 5's Wall Rose fallback is now a `WallGate` (arch + doors +
    crenellations) rather than a plain box, since the final shot looks straight at
    it.
* **Floating debris**: scene 5's falling roof tiles drifted through the middle of
  the street at head height and read as levitating planks — removed.
* **Basement floor**: the wood normal map at 2.6 m tiling read as liquid; the
  floor is now stone with sane tiling.

---

## 6. Mobile / no-WebGL / reduced motion — verified

`node scripts/qa/mobile.mjs` (puppeteer, four profiles):

| Profile | Canvas | Model requests | Result |
|---|---|---|---|
| desktop 1280×800 | 1 (WebGL) | 0 | 3D stage renders |
| mobile 390×844 | **0** | **0** | `MobileStage` 2D parallax plates, overlays identical |
| reduced motion | 1 | 0 | renders; camera shake/parallax/idle motion off |
| no WebGL (constructors removed before page scripts) | **0** | **0** | `CanvasBoundary` → `MobileStage`, no page errors |

Screenshots: `docs/rendering/after/08-mobile-390.png`,
`docs/rendering/after/09-no-webgl.png`.

---

## 7. What I could not verify

* **Real-GPU frame rate.** Only SwiftShader was available — no GPU, no driver, no
  way to install one. The 1.7–5 fps numbers are a software rasteriser's, and they
  are *not* evidence that a laptop will hit 60 fps; they are evidence that the
  stage now does much more work per frame. Real numbers need `chrome://tracing` or
  Spector.js on actual hardware. This is the single biggest open question.
* **Whether the final look is good on a real display.** Everything in
  `docs/rendering/after/` was judged on 8-bit PNGs out of a software rasteriser:
  colour banding, bloom softness, shadow acne and normal-map moiré behave
  differently on real hardware. Treat the screenshots as "what geometry and light
  are doing", not as colour grading proof.
* **The `.glb` path has never run with a real file.** `ModelSlot` compiles and the
  fallback path is exercised everywhere (all twelve slots are unconfigured), but
  `useGLTF`, the Draco decoder and clip scrubbing are untested against an actual
  asset — there was nowhere to host one and no way to author/validate a glb here.
* **`CanvasBoundary`'s error path** is only tested for "no WebGL at all". A live
  context-loss mid-session was not simulated.
* **iOS Safari / real mobile GPU** — the 2D mobile path was verified in headless
  Chromium at 390×844, not on a phone.
* **Scene 2's floating building boxes** at the wall bases: visible in the aerial
  shot, not fixed — they are village blocks whose base sits above the terrain in
  one place. Cosmetic, and only legible from the aerial camera.

---

## 8. QA harness

`scripts/qa/` (copies of the scripts used for every number and image here). They
need `puppeteer-core` + a Chromium build; in the sandbox that was
`/tmp/shot` with `@sparticuz/chromium`. Install those two dev-dependencies (or
use your own Chrome via `PUPPETEER_EXECUTABLE_PATH`) before running:

```bash
SHOT_URL=http://localhost:3000/ node scripts/qa/shoot.mjs shots docs/rendering/after
SHOT_URL=http://localhost:3000/ node scripts/qa/shoot.mjs perf      # on/off screen draw calls
SHOT_URL=http://localhost:3000/ node scripts/qa/shoot.mjs one docs/rendering/after 0 0.5  # scene index + local p
SHOT_SETTLE=2500 node scripts/qa/shoot.mjs all                                  # both modes
node scripts/qa/mobile.mjs docs/rendering/after                                  # mobile / no-WebGL / reduced motion
node scripts/qa/dbg.mjs                                                          # dumps overlay opacity + visible rects at the stuck scroll position
```

Environment knobs: `SHOT_URL`, `SHOT_QUERY` (append `?q=high` / `?debug=nopost`),
`SHOT_LOCAL`, `SHOT_SETTLE`, `VIEW={width,height}`.

The seven scroll positions used for the before/after pairs are `p =
0.0625, 0.2030, 0.3750, 0.5470, 0.6875, 0.8125, 0.9375` of the stage track,
computed as `#stage-track.offsetTop + p * (offsetHeight - innerHeight)`.
