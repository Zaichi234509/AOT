# Process notes — what I built, what I changed, and why

A plain-language log for this branch (`arena/253ee8bd-aot`). Use this file to see
**what was done, in what order**, and **what was changed in the repo**.
Technical architecture lives in [`BUILD.md`](./BUILD.md); the original spec lives in
[`README.md`](./README.md).

---

## 1. The starting point

- The repository contained **one file**: `README.md` (52 KB).
- It was not documentation — it was a **master prompt**: "build the entire Attack on
  Titan website from scratch" (design system, 7-scene 3D scrollytelling, 8 content
  sections, 3D asset pipeline, image prompts, responsive rules, performance targets).
- The prompt is **cut off mid-sentence** in Section 11 (`Total 3D Assets: < 20MB (Draco + KTX`).
  Everything readable up to that point was implemented; the missing tail (SEO,
  deployment, final polish) was completed from the document's intent.

**Request:** "read the readme and do the master prompt" → build the whole site.

---

## 2. Process, step by step

| # | Step | Result |
|---|---|---|
| 1 | Read the whole README, mapped it into 11 work areas | Clear build plan |
| 2 | Checked the environment (Node 22, npm, no pnpm, no browser/WebGL available) | Used npm; noted I could not screenshot the 3D |
| 3 | Scaffolded Next.js 14 + TypeScript strict + Tailwind + R3F stack | `package.json`, configs, `.gitignore` |
| 4 | Built the design system from Section 2 (tokens, fonts, glass cards, motion) | `globals.css`, `tailwind.config.ts` |
| 5 | Built the scroll engine: Lenis + one rAF loop + progress bus + Zustand mirrors | `lib/scroll.ts`, `ScrollProvider`, `store/useStore.ts` |
| 6 | Built the UI kit (buttons, badges, cards, modal, tabs, search, stat bars, section header, logo) | `components/ui/*` |
| 7 | Wrote the 3D scene kit (sky dome, particles, steam, ground, titan body, soldier, wall gate, buildings, procedural textures) | `scrollytelling/three/*` |
| 8 | Built all 7 scenes + camera choreography + post-processing + sticky stage + mobile fallback | `scrollytelling/*` |
| 9 | Built all 7 narrative overlay timelines driven by scroll ranges | `scrollytelling/overlays/*` |
| 10 | Built the 8 content sections (map, characters, titans, episodes, timeline, music, gallery, community) | `components/sections/*` |
| 11 | Wrote the data (18 characters, 87 episodes, 9 titans, 15 events, 11 pins, 10 tracks) | `src/data/*` + generator script |
| 12 | Wired page, 404, SEO metadata, JSON-LD, sitemap, robots, OG image, favicon | `app/*`, `public/*` |
| 13 | Verified: `tsc --noEmit`, `next build`, dev server, HTTP checks on all routes | Clean build, 197 kB first load |
| 14 | Fixed the bugs found in review (listed in §4) | Final polish commit |

---

## 3. What was built (by area)

**3D scrollytelling — 7 scenes, 3200vh, sticky 100vh stage**

1. Shiganshina — 50 m wall + gate, 60 m Colossal Titan behind it, steam, debris burst, detonation flash, camera shake.
2. The Three Walls — concentric wall rings (Maria/Rose/Sina), terrain, district beacons, drifting clouds.
3. The Survey Corps — three soldiers with capes and ODM gear, Attack Titan behind, blue rim light, wire trails.
4. The Titans — Pure Titans at 3/7/15 m, an Abnormal reaching, a 60 m silhouette in fog, glowing eyes.
5. The Battle of Trost — modular town, camera flight through the street, boulder, stalking titans, speed lines.
6. The Basement — stairs, door with glowing keyhole, bookshelf, desk + journal, flickering candle, dust motes, photo reveal.
7. The Rumbling — 120-instance Colossal Titan army marching, red sky, embers, wall fragments, 60,000,000 counter, CTAs.

**Everything else (per the prompt):** loading screen, sticky navbar + mobile menu, left progress rail, right scene dots, scroll hint, world map with pan/zoom/pins/route, character encyclopedia with modals and stats, Titan bestiary with size chart, 87-episode guide, timeline, soundtrack player, gallery lightbox, community hub, footer, 404.

**Data totals:** 18 characters · 9 Nine Titans + 6 pure/abnormal classes · 87 episodes across 4 seasons · 15 timeline events · 11 map locations · 10 soundtrack tracks · 20 gallery plates.

---

## 4. Changes, fixes and decisions worth knowing

**Bugs found and fixed during self-review**

- `<color attach="background">` / `<fog attach="fog">` were attached to the scene's
  wrapping group instead of the Three.js scene, so the background and fog silently did
  nothing. Replaced with a `SceneAtmosphere` component that sets them on the real scene
  and restores them on unmount.
- Tailwind's default opacity scale is coarse, so classes like `bg-black/85` and
  `bg-ink-950/97` were **silently dropped** (transparent scrims, washed-out mobile menu).
  Added a full 0–100 opacity scale and verified all 75 opacity utilities now exist in
  the built CSS.
- The audio visualiser used a `bar-dance` keyframe that Tailwind never emitted → added
  the keyframes to `globals.css`.
- The left progress rail tracked the 3D stage instead of the whole page → now tracks
  page progress.
- World map: painted out of alignment between SVG and pins (two different transform
  origins) → both layers now share one transform; wheel-zoom moved to a non-passive
  listener so it can `preventDefault`.
- `ScrollCounter` had an invalid `toLocaleString` expression; SVG gradient IDs collided
  between posters with different accents (now `useId`-scoped).
- Lazy `<Canvas>` was positioned by class only, but R3F sets an inline
  `position: relative` → explicit inline style so it truly fills the stage.
- Touch targets (map pins, scene dots) enlarged; native search clear button hidden;
  anchor offset added for direct `#hash` loads.

**Decisions / adaptations (full detail in BUILD.md)**

1. **Procedural 3D instead of `.glb` files** — the repo had no Blender assets or binaries.
   Every model is parametric Three.js geometry with canvas-generated textures. Drop-in
   slots and the spec's poly budgets are documented in `public/models/README.md`.
2. **Procedural artwork instead of licensed anime images** — character monogram plates and
   SVG scene posters, plus one generated social image (`public/og-image.jpg`). Swap in
   real images via `public/images/`.
   **Update (later request):** the *character profile modal* and the *titan bestiary modal*
   no longer send people to an image search — they show a real still. 18 character
   portraits (720×900) and 9 titan stills (1280×720) now live in
   `public/images/characters/` and `public/images/titans/`, referenced by a new `image`
   field in `characters.json` / `titans.json`. Details and licensing note:
   `public/images/README.md`.
   **Update (this request):** the **card grids** now use those same stills, so the two
   sections that still looked procedural are gone. `CharacterEncyclopedia` cards render
   `<img object-cover object-top>` in the 4:5 tile (dark bottom gradient, name + rank
   overlay and affiliation badge kept); `TitanBestiary`'s Nine Titans cards render
   `<img object-cover object-[center_32%]>` in the `h-44` header (height pill, monogram
   line, name and JP title kept). The per-card **"Search images" chips are removed** —
   the top-right chip on both card types, and the inline link plus its `border-t`
   wrapper on the Pure Titans cards (those classes have no images, so nothing replaces
   it). Modals, gallery, map and og-image untouched; `CharacterGlyph` is no longer
   used by any card but the component is kept.
3. **Synthesised audio instead of streamed music** — wind + rumble via WebAudio; the
   soundtrack section is an honest simulated transport linking to official streams.
4. **Depth of field + motion blur omitted** — both are full-screen per-frame passes that
   would push mid-range GPUs below 60 fps. Same beats are carried by shake, flashes,
   speed lines, bloom and vignette (noted in BUILD.md §9).
5. **Lazy 3D chunk** — three.js + postprocessing load after hydration, which cut
   first-load JS from 433 kB to **197 kB** (spec target: < 500 kB).

---

## 5. What I verified — and what I could not

**Verified**

- `npx tsc --noEmit` → no errors (strict mode).
- `npx next build` → success, page statically prerendered; first load 197 kB.
- Card stills: all **27** image URLs (`18` characters + `9` titans) return `200 image/jpeg`
  from `next start`, and the prerendered HTML contains 18 + 9 `<img>` tags with
  `object-cover object-top` / `object-[center_32%]`, and **zero** "Search images" chips.
  Titan header crops were rendered offline at 340×176 with the same `object-position`
  to confirm no head is cut off.
- Dev server on `0.0.0.0:3000`; `/`, `/robots.txt`, `/sitemap.xml`, `/icon.svg`,
  `/og-image.jpg` all 200, unknown route → 404.
- Rendered HTML contains all 8 section anchors, 18 character cards, 25 season-1 episode
  rows, 11 map pins, the 7 overlay timelines and the 3200vh stage.
- Open Graph / Twitter / JSON-LD / theme-color / icon tags present in `<head>`.
- Every Tailwind arbitrary-value and opacity utility used in `src/` exists in the built CSS.

**Not verified**

- This sandbox has **no browser with WebGL**, so I could not screenshot or eyeball the
  actual 3D render, framerate or camera framing. Those are verified by types, build and
  code review only — please scroll the preview and report anything that looks wrong
  (brightness, camera distance, overlay overlap) and it can be tuned quickly.

---

## 6. Commits on this branch

| Commit | Message | Content |
|---|---|---|
| `4a40e5f` | Build AoT Archive: 3D scrollytelling site with all content sections | The whole site (102 files): configs, app, components, hooks, lib, data, public assets, BUILD.md |
| `cddf827` | Polish: lazy canvas positioning, anchor offsets, search input, real CTA links | The fixes listed in §4 |

Branch pushed to `origin/arena/253ee8bd-aot`.

---

## 7. How to run / next steps

```bash
npm install
npm run dev       # http://localhost:3000
npm run build && npm run start
npm run typecheck
```

Good next steps, in priority order:

1. Scroll the site on a desktop and a phone; tune camera framing/brightness in
   `src/lib/sceneKeyframes.ts` and `scrollytelling/scenes/*`.
2. Replace remaining procedural plates (gallery, soundtrack, map, community) with real
   captures in `public/images/` if you have licensed art.
3. Optional: add authored `.glb` models per `public/models/README.md`.
4. Optional: add depth of field / motion blur behind a desktop quality check.
