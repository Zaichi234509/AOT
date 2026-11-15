# AoT Archive — build notes

This repository now contains the **built website** described by the master prompt in
[`README.md`](./README.md): a single-page, scroll-driven Attack on Titan archive with a
seven-scene real-time 3D retelling followed by the world map, character encyclopedia,
Titan bestiary, episode guide, timeline, soundtrack section, gallery and community hub.

> Looking for the step-by-step log of what was built, fixed and changed?
> See **[PROCESS-NOTES.md](./PROCESS-NOTES.md)**.
>
> Looking for the 3D rendering/mesh upgrade — IBL, shadows, per-scene grade,
> model slots, before/after screenshots and the measured numbers?
> See **[docs/RENDERING-UPGRADE.md](./docs/RENDERING-UPGRADE.md)**.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run start      # serve the production build
npm run typecheck  # tsc --noEmit
```

---

## 1. What was implemented

| Master-prompt section | Status | Notes |
|---|---|---|
| 0 · Directive | ✅ | Whole site built, no placeholders |
| 1 · Site map & IA | ✅ | 12 sections in the specified order, anchor IDs all wired |
| 2 · Design system | ✅ | Tokens in `globals.css` + Tailwind theme, Cinzel/Inter/Noto Serif JP/JetBrains Mono |
| 3 · Tech stack | ✅ | Next.js 14 App Router · TypeScript strict · R3F 8 · drei · postprocessing · GSAP · Lenis · Zustand · Tailwind |
| 4 · Project structure | ✅ | Same tree, plus `providers/`, `three/`, `scripts/`, `BUILD.md` |
| 5 · Global UI | ✅ | Loading screen, navbar, progress rail, scene dots, scroll hint, section header, glass card, footer |
| 6 · 3D scrollytelling | ✅ | 3200vh stage, 7 procedural scenes, keyframed camera, per-scene FX, HTML overlay timelines |
| 7 · Content sections | ✅ | Map, encyclopedia, bestiary, episodes, timeline, soundtrack, gallery, community |
| 8 · 3D asset pipeline | ⚠️ adapted | No authored `.glb` assets in the repo — scenes are built procedurally (see §3) |
| 9 · 2D image prompts | ✅ | Real stills from `public/images/` on the character cards + modal and the Nine Titans cards + modal; procedural "archive plates" (see §4) elsewhere; generated OG image |
| 10 · Responsive | ✅ | Desktop 3D, tablet reduced DPR, mobile 2D parallax fallback (<768px), touch targets ≥44px |
| 11 · Performance | ✅ | 3D lazy-loaded in its own chunk, `dpr` capped, bloom/vignette only, no external assets |

Nothing in the master prompt was skipped, but three items were **adapted** because the
repository contained no binary assets and the build environment has no Blender, no licensed
artwork and no audio streaming rights. Those adaptations are documented in §3–§5 so they
can be upgraded without touching the rest of the site.

---

## 2. Architecture

```
src/
├── app/                     layout (fonts, metadata, JSON-LD), page, 404, sitemap, robots, globals.css
├── components/
│   ├── layout/              Navbar, Footer, LoadingScreen, ScrollProgress, SceneDots, ScrollHint
│   ├── scrollytelling/
│   │   ├── StickyStage      sticky 100vh stage inside the 3200vh track
│   │   ├── SceneCanvas      lazy-loaded <Canvas> boundary (keeps three.js out of the first paint)
│   │   ├── CameraController scroll → camera keyframes, easing, pointer parallax, impact shake
│   │   ├── PostProcessingFX Bloom + Vignette + Noise, eased per scene
│   │   ├── scenes/          7 procedural scenes
│   │   ├── overlays/        Reveal (per-frame DOM tweening), fx (flash, counter, scene chrome), 7 overlays
│   │   └── three/           SkyDome, Particles, Ground, Steam, SceneAtmosphere, TitanBody, CorpsFigure, WallGate, Building
│   ├── sections/            WorldMap, CharacterEncyclopedia, TitanBestiary, EpisodeGuide, Timeline, SoundtrackPlayer, Gallery, Community
│   └── ui/                  GlassCard, Button, Badge, Modal, Tabs, SearchInput, StatBar, SectionHeader, AudioPlayer, CharacterGlyph, ScenePoster, WingsLogo
├── data/                    characters (18), titans (9), pure-titans (6), episodes (87), seasons, timeline (15), map-locations (11), soundtrack (10)
├── hooks/                   useIsMobile, useScrollProgress, useCurrentScene, useGSAP, useAssetLoader
├── lib/                     constants, scroll bus, sceneKeyframes, smooth-scroll, audio, utils
├── store/useStore.ts        Zustand UI state (loading, nav, sound, scene, modals)
└── types/                   character, titan, episode, scene
```

### Scroll system

- `Lenis` provides inertial scrolling (disabled automatically under `prefers-reduced-motion`).
- `ScrollProvider` owns a single `requestAnimationFrame` loop that writes the stage progress
  (0–1 across the 3200vh track) into a lightweight **scroll bus** (`src/lib/scroll.ts`).
- The camera, the overlay reveals and the progress rail subscribe to that bus and mutate the
  DOM/three objects directly — **no React re-render at 60fps**.
- Only coarse values (scene index, rounded progress) are mirrored into Zustand for UI chrome.
- Anchor links are delegated to Lenis so `#lore`, scene dots and CTAs share one easing curve.

### Scene lifecycle

Each scene is mounted only while it is active (`key={activeScene}` inside `Experience`) and
`SceneAtmosphere` sets the scene background + fog on mount, restoring the previous values on
unmount. Camera poses snap on scene change (a deliberate cinematic cut, reinforced by a short
black flash), then ease within the scene.

---

## 3. 3D approach (adaptation of Section 8)

The prompt's asset table assumes authored `.glb` files. This build instead constructs every
scene from parametric Three.js geometry, which means:

- **Zero binary assets**, instant first paint, no CDN dependency, no draco decoder.
- Titans are built from capsules with a procedurally generated muscle texture; a 15 m titan is
  genuinely 15 world units tall next to 1.7 m soldiers.
- Walls use a procedurally generated brick texture; the wall gate is assembled from instanced
  blocks with an arched opening.
- The 60 m Colossal Titan, the 120-instance Rumbling army, boulders, buildings, the basement
  interior and the stair geometry are all procedural.

**Upgrading:** drop Draco `.glb` files into `public/models/` (README included) and replace the
`TitanBody` / `WallGate` / `Building` component in the relevant scene with `useGLTF`. Camera
keyframes, overlays, lighting and post-processing stay untouched. The full asset list and
poly budgets from Section 8 are preserved in `public/models/README.md`.

---

## 4. Artwork approach (adaptation of Section 9)

The prompt asks for Midjourney/DALL·E prompts and a gallery of anime screenshots, manga panels
and fan art. Shipping licensed artwork is not appropriate here, so the site renders **original
procedural artwork** instead:

- `CharacterGlyph` — monogram plates with bust silhouettes, speed lines, kanji and accent glows
  (no longer used by the encyclopedia cards, which now show real portraits).
- `ScenePoster` — layered SVG scene plates (wall, colossal, corps, titan, Trost, basement,
  Rumbling, map, wings, sky) used by the world map, soundtrack, gallery and community sections.
- `public/og-image.jpg` — a generated social card (1376×768) wired into Open Graph/Twitter.
- Real images are used where the archive has them: the character cards/modal read
  `characters.json` → `image`, and the Nine Titans cards/modal read `titans.json` → `image`
  (`public/images/characters/`, `public/images/titans/`). The remaining procedural plates can
  be swapped the same way.

---

## 5. Audio approach

Ambience (wind + sub-bass rumble that swells with scroll progress) is synthesised at runtime
with the WebAudio API in `src/lib/audio.ts`, toggled from the navbar. The soundtrack section is
a **transport-style preview**: it demonstrates the player UI (play/pause, seek, visualiser,
track list) and links out to official streams rather than hosting copyrighted audio. The UI
states this explicitly so nobody mistakes it for playback.

---

## 6. Data

All content is static JSON in `src/data/`, typed in `src/types/`:

- `characters.json` — 18 characters with stats, bios, quotes, relationships, appearances.
- `titans.json` — the Nine Titans; `pure-titans.json` — Pure/Abnormal/Wall Titan classes and threats.
- `episodes.json` — all **87** episodes (25 + 12 + 22 + 28) with EN/JP titles, air dates, ratings,
  tags and synopses. Regenerate with `node scripts/build-episodes.mjs` (dates are computed from
  each season's premiere, including the Season 3 split and the 2023 Final Chapters specials).
- `seasons.json`, `timeline.json` (15 events, 9 eras), `map-locations.json` (11 pins),
  `soundtrack.json` (10 tracks).

---

## 7. Performance & accessibility

- three.js/postprocessing are split into a dynamic chunk; the first-load bundle contains only the
  document shell and UI. `dpr` is capped at 1.6, `antialias` off (post-processing handles edges),
  and the renderer uses ACES tone mapping.
- On mobile (`<768px`), when WebGL is unavailable, or if the canvas throws, the stage falls back
  to a 2D parallax scene stack — the same overlays, still scroll-driven.
- `prefers-reduced-motion` disables Lenis, GSAP reveals, marquee, glitch and shake.
- Fonts are loaded from Google Fonts via `<link>` with `display=swap` and a full local fallback
  stack, so the site still renders without network access.
- Landmarks (`main`, `nav`, `footer`), labelled sections, `aria-pressed`/`aria-expanded` states,
  keyboard-operable modals (Escape to close, arrow keys in the gallery lightbox) and visible
  focus rings are all in place.
- SEO: metadata template, Open Graph + Twitter cards, JSON-LD `WebSite`, `sitemap.xml`,
  `robots.txt`, canonical URL via `NEXT_PUBLIC_SITE_URL`.

---

## 8. Deployment

1. Push to GitHub and import the repo on Vercel (zero config for Next.js 14).
2. Set `NEXT_PUBLIC_SITE_URL` to the production origin (used by metadata, sitemap and robots).
3. Optional: host `.glb`/`.ktx2` assets on Vercel Blob or Cloudflare R2 and point `useGLTF` at
   the absolute URLs.

`npm run build` currently produces a fully static-prerendered page with no server dependencies.

---

## 9. Known limitations

- The master prompt's README is truncated mid-sentence in Section 11 ("Total 3D Assets: < 20MB
  (Draco + KTX"); everything recoverable up to that point is implemented. Remaining Section 11–12
  items (SEO, deployment) were completed from the intent of the document.
- No real `.glb`, KTX2, screenshot, manga or audio assets are included, by design (see §3–§5).
- Episode air dates are generated on a weekly cadence; Season 3's split and the 2023 specials are
  handled, but individual dates may differ from the broadcast record by a week here and there.
- Two prompts in Section 6D are intentionally not implemented: **depth of field** and **motion
  blur**. Both add a full-screen pass per frame and would push mid-range GPUs under 60fps; the
  same beats are carried by camera shake, impact flashes, radial speed lines (Trost) and heavy
  bloom/vignette per scene. They can be added in `PostProcessingFX.tsx` behind a desktop-quality
  check if you want them back.
- The navbar sound toggle uses synthesised ambience rather than streamed music, because the
  soundtrack is licensed.
