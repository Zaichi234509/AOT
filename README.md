# 🗡️ MASTER PROMPT — Full Attack on Titan Website Build

> **This is a complete, self-contained prompt to build the entire website from scratch. Copy everything inside the code block below and paste it into your AI coding assistant, dev environment, or hand it to a development team.**
>
> **✅ Implemented in this repository.** Run `npm install && npm run dev`. See **[BUILD.md](./BUILD.md)** for what was built, the architecture, the three documented adaptations (procedural 3D, procedural artwork, synthesised audio) and how to drop in real assets — and **[PROCESS-NOTES.md](./PROCESS-NOTES.md)** for the step-by-step build log and change history.

---

```markdown
# MASTER PROMPT: BUILD THE ENTIRE ATTACK ON TITAN 3D SCROLLYTELLING WEBSITE

## ═══════════════════════════════════════════════════════════
## SECTION 0: THE DIRECTIVE
## ═══════════════════════════════════════════════════════════

You are building a complete, production-ready, single-page + multi-section
website dedicated to the anime/manga "Attack on Titan" (Shingeki no Kyojin).

The website's centerpiece is a cinematic 3D scroll-driven "scrollytelling"
experience where the user scrolls through 7 narrative scenes rendered in
real-time 3D (Three.js). Below the 3D experience, the site continues with
rich content sections: an interactive world map, episode guide, character
encyclopedia, soundtrack player, and community hub.

**You must build the ENTIRE site.** This includes:
- Project scaffolding and configuration
- Design system (colors, typography, spacing, components)
- Global layout (navbar, footer, loading screen, page transitions)
- The full 3D scrollytelling homepage (7 scenes)
- All non-3D content sections
- 3D asset creation pipeline and specifications
- 2D image generation prompts
- Responsive design for desktop, tablet, and mobile
- Performance optimization
- SEO and metadata
- Deployment configuration

**Build everything from scratch. Do not skip any section of this prompt.**

---

## ═══════════════════════════════════════════════════════════
## SECTION 1: SITE MAP & INFORMATION ARCHITECTURE
## ═══════════════════════════════════════════════════════════

The site is a single-page application (SPA) with anchor-linked sections.
No separate routes — everything lives on one scrollable page for maximum
immersion. The 3D scrollytelling is the hero; content sections follow below.

### Full Section Order (top to bottom)

```
1.  LOADING SCREEN          (full-screen overlay, disappears after assets load)
2.  NAVBAR                  (sticky, transparent, always visible)
3.  3D SCROLLYTELLING       (sticky 100vh canvas, 3200vh scroll distance)
    ├── Scene 1: The Fall of Shiganshina
    ├── Scene 2: The Three Walls
    ├── Scene 3: The Survey Corps (Characters)
    ├── Scene 4: The Titans (Bestiary)
    ├── Scene 5: The Battle of Trost
    ├── Scene 6: The Basement (The Reveal)
    └── Scene 7: The Rumbling (Finale + CTA)
4.  WORLD MAP               (interactive SVG/Canvas map of Paradis + Marley)
5.  CHARACTER ENCYCLOPEDIA  (searchable/filterable character database)
6.  TITAN BESTIARY          (detailed Nine Titans + Pure Titans reference)
7.  EPISODE GUIDE           (season-by-season episode browser)
8.  TIMELINE                (visual chronological timeline of AoT events)
9.  SOUNDTRACK PLAYER       (embedded audio player for OST)
10. GALLERY                 (curated image/manga panel gallery with lightbox)
11. COMMUNITY               (Discord embed, social links, fan art showcase)
12. FOOTER                  (credits, links, copyright, "Shinzou wo Sasageyo")
```

### Navigation Anchor Links
| Nav Label | Anchor | Target Section |
|-----------|--------|---------------|
| Home | #hero | Scene 1 (scroll to top) |
| Lore | #lore | Scene 2 / World Map |
| Characters | #characters | Scene 3 / Encyclopedia |
| Titans | #titans | Scene 4 / Bestiary |
| Episodes | #episodes | Episode Guide |
| Timeline | #timeline | Timeline |
| Music | #music | Soundtrack |
| Community | #community | Community |

---

## ═══════════════════════════════════════════════════════════
## SECTION 2: DESIGN SYSTEM
## ═══════════════════════════════════════════════════════════

### Color Palette

**Primary (Brand)**
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-primary` | #2D5A27 | Survey Corps green, CTAs, accents |
| `--color-primary-light` | #4A7C3F | Hover states, highlights |
| `--color-primary-dark` | #1A3A18 | Active states, deep accents |

**Secondary (Drama)**
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-secondary` | #CC2200 | Blood red, warnings, titan eyes, Rumbling |
| `--color-secondary-light` | #FF4422 | Glows, highlights |
| `--color-secondary-dark` | #8B1500 | Deep shadows, gradients |

**Neutral**
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-bg-dark` | #0A0A0A | Main background, footer |
| `--color-bg-card` | #141414 | Card backgrounds |
| `--color-bg-glass` | rgba(20,20,20,0.7) | Glassmorphism overlays |
| `--color-text-primary` | #F5F0E8 | Main text (warm white) |
| `--color-text-secondary` | #A09888 | Subtitles, metadata |
| `--color-text-muted` | #666058 | Captions, disabled |
| `--color-border` | rgba(255,255,255,0.08) | Card borders, dividers |

**Accent (Scene-Specific)**
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-gold` | #D4A574 | Scene 1 golden hour, warmth |
| `--color-sky` | #87CEEB | Scene 2 sky blue |
| `--color-navy` | #1A2744 | Scene 3 night, Survey Corps |
| `--color-murky` | #3A4A2A | Scene 4 titan fog |
| `--color-dust` | #D4874A | Scene 5 Trost battle |
| `--color-amber` | #FF9944 | Scene 6 candlelight |
| `--color-fire` | #FF6600 | Scene 7 Rumbling fire |

### Typography

**Font Stack:**
```css
--font-display: 'Cinzel', serif;        /* Headers, titles, dramatic text */
--font-japanese: 'Noto Serif JP', serif; /* Kanji, Japanese text */
--font-body: 'Inter', sans-serif;        /* Body text, UI, cards */
--font-mono: 'JetBrains Mono', monospace; /* Stats, numbers, data */
```

**Type Scale:**
| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `--text-hero` | clamp(3rem, 8vw, 7rem) | 900 | 1.0 | Scene titles, hero text |
| `--text-h1` | clamp(2rem, 5vw, 4rem) | 700 | 1.1 | Section headers |
| `--text-h2` | clamp(1.5rem, 3vw, 2.5rem) | 700 | 1.2 | Subsection headers |
| `--text-h3` | 1.25rem | 600 | 1.3 | Card titles |
| `--text-body` | 1rem | 400 | 1.6 | Paragraphs |
| `--text-small` | 0.875rem | 400 | 1.5 | Captions, metadata |
| `--text-xs` | 0.75rem | 500 | 1.4 | Labels, tags |

**Japanese Text Rule:** All Japanese text uses `--font-japanese`, letter-spacing
0.1em, and is slightly larger than equivalent English text for readability.

### Spacing System (8px base)
```
--space-1: 0.25rem  (4px)
--space-2: 0.5rem   (8px)
--space-3: 0.75rem  (12px)
--space-4: 1rem     (16px)
--space-6: 1.5rem   (24px)
--space-8: 2rem     (32px)
--space-12: 3rem    (48px)
--space-16: 4rem    (64px)
--space-24: 6rem    (96px)
--space-32: 8rem    (128px)
```

### Border Radius
```
--radius-sm: 4px    (tags, badges)
--radius-md: 8px    (buttons, inputs)
--radius-lg: 12px   (cards)
--radius-xl: 16px   (modals, large cards)
--radius-full: 9999px (pills, avatars)
```

### Shadows
```
--shadow-sm: 0 1px 2px rgba(0,0,0,0.3)
--shadow-md: 0 4px 12px rgba(0,0,0,0.4)
--shadow-lg: 0 8px 32px rgba(0,0,0,0.5)
--shadow-glow-green: 0 0 20px rgba(45,90,39,0.4)
--shadow-glow-red: 0 0 20px rgba(204,34,0,0.4)
```

### Glassmorphism Card Style (used throughout)
```css
.glass-card {
  background: rgba(20, 20, 20, 0.65);
  backdrop-filter: blur(16px) saturate(1.2);
  -webkit-backdrop-filter: blur(16px) saturate(1.2);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}
```

### Animation Tokens
```
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1)
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1)
--duration-fast: 200ms
--duration-normal: 400ms
--duration-slow: 800ms
--duration-cinematic: 1500ms
```

---

## ═══════════════════════════════════════════════════════════
## SECTION 3: TECH STACK
## ═══════════════════════════════════════════════════════════

### Core Framework
- **Next.js 14+** (App Router, TypeScript, strict mode)
- **React 18+**
- **TypeScript 5+** (strict: true)

### 3D & Animation
- **Three.js r160+** via **React Three Fiber** (@react-three/fiber v8+)
- **@react-three/drei** (ScrollControls, Html, Text, Environment, useGLTF,
  useTexture, Sparkles, Stars, Trail, Float, Clouds, Detailed)
- **@react-three/postprocessing** (Bloom, Vignette, ChromaticAberration,
  Noise, DepthOfField, ToneMapping)
- **GSAP 3.12+** with ScrollTrigger, SplitText plugins
- **Lenis** (lenis/react) for smooth scroll

### Styling
- **Tailwind CSS 3.4+** with custom theme extending the design system above
- **tailwindcss-animate** plugin for enter/exit animations
- **CSS Modules** for complex component-specific styles (glassmorphism, etc.)

### State & Data
- **Zustand** for global state (scroll progress, active scene, UI toggles)
- **Static JSON files** in `/data/` for characters, titans, episodes, timeline
- **No backend/database** — fully static, deployable to edge CDN

### Assets
- **3D Models:** Sketchfab CC BY 4.0 assets, gltf-transform (Draco + WebP), loaded via useGLTF
- **Textures:** KTX2/Basis Universal, loaded via useKTX2
- **Images:** Next.js `<Image>` with automatic WebP/AVIF optimization
- **Fonts:** next/font/google (Cinzel, Inter, Noto Serif JP)
- **Icons:** Lucide React (lightweight, tree-shakeable)

### Audio (Optional)
- **Howler.js** for scroll-triggered ambient SFX

### Dev & Deployment
- **Package Manager:** pnpm
- **Linting:** ESLint + Prettier
- **Deployment:** Vercel (automatic from GitHub)
- **CDN:** Vercel Blob or Cloudflare R2 for 3D assets
- **Analytics:** Vercel Analytics (optional)

---

## ═══════════════════════════════════════════════════════════
## SECTION 4: PROJECT STRUCTURE
## ═══════════════════════════════════════════════════════════

```
/aot-archive/
├── public/
│   ├── models/                    # shipped 3D .glb files (Draco + WebP)
│   │   ├── eren-yeager.glb
│   │   ├── mikasa-ackerman.glb
│   │   ├── levi-ackerman.glb
│   │   ├── attack-titan.glb
│   │   ├── colossal-titan-full.glb
│   │   ├── female-titan.glb
│   │   └── trost-district.glb
│   ├── draco/                     # local Draco decoder (no CDN)
│   ├── textures/                  # KTX2 compressed textures
│   │   ├── wall-stone.ktx2
│   │   ├── titan-skin.ktx2
│   │   ├── ground-grass.ktx2
│   │   └── cobblestone.ktx2
│   ├── images/                    # 2D images (optimized)
│   │   ├── hero/
│   │   ├── characters/
│   │   ├── titans/
│   │   ├── map/
│   │   ├── episodes/
│   │   ├── gallery/
│   │   └── og-image.jpg           # Open Graph social image
│   ├── audio/                     # Ambient SFX (optional)
│   │   ├── wind.mp3
│   │   ├── rumble.mp3
│   │   └── odm-whoosh.mp3
│   └── fonts/                     # Fallback font files
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout (fonts, metadata, providers)
│   │   ├── page.tsx               # Main page (all sections composed)
│   │   ├── globals.css            # Tailwind directives + custom CSS
│   │   └── not-found.tsx          # 404 page (themed)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx         # Sticky transparent navbar
│   │   │   ├── Footer.tsx         # Site footer
│   │   │   ├── LoadingScreen.tsx  # Full-screen asset loader
│   │   │   ├── ScrollProgress.tsx # Left-edge progress bar
│   │   │   ├── SceneDots.tsx      # Right-edge scene navigation
│   │   │   └── ScrollHint.tsx     # "Scroll to begin" indicator
│   │   ├── scrollytelling/
│   │   │   ├── StickyStage.tsx    # Sticky 100vh container
│   │   │   ├── ScrollSpacer.tsx   # 3200vh height spacer
│   │   │   ├── CameraController.tsx # Scroll-driven camera
│   │   │   ├── SceneLighting.tsx  # Global + per-scene lights
│   │   │   ├── PostProcessingFX.tsx # EffectComposer stack
│   │   │   ├── scenes/
│   │   │   │   ├── Scene1_Shiganshina.tsx
│   │   │   │   ├── Scene2_Walls.tsx
│   │   │   │   ├── Scene3_Characters.tsx
│   │   │   │   ├── Scene4_Titans.tsx
│   │   │   │   ├── Scene5_Trost.tsx
│   │   │   │   ├── Scene6_Basement.tsx
│   │   │   │   └── Scene7_Rumbling.tsx
│   │   │   └── overlays/
│   │   │       ├── OverlayLayer.tsx
│   │   │       ├── Scene1Overlay.tsx
│   │   │       ├── Scene2Overlay.tsx
│   │   │       ├── Scene3Overlay.tsx
│   │   │       ├── Scene4Overlay.tsx
│   │   │       ├── Scene5Overlay.tsx
│   │   │       ├── Scene6Overlay.tsx
│   │   │       └── Scene7Overlay.tsx
│   │   ├── sections/
│   │   │   ├── WorldMap.tsx        # Interactive map section
│   │   │   ├── CharacterEncyclopedia.tsx
│   │   │   ├── TitanBestiary.tsx
│   │   │   ├── EpisodeGuide.tsx
│   │   │   ├── Timeline.tsx
│   │   │   ├── SoundtrackPlayer.tsx
│   │   │   ├── Gallery.tsx
│   │   │   └── Community.tsx
│   │   └── ui/
│   │       ├── GlassCard.tsx       # Reusable glassmorphism card
│   │       ├── StatBar.tsx         # Animated stat bar (combat 8/10)
│   │       ├── Badge.tsx           # Tag/badge component
│   │       ├── Button.tsx          # CTA button (primary/secondary)
│   │       ├── Modal.tsx           # Lightbox/modal
│   │       ├── Tabs.tsx            # Tab switcher (seasons, etc.)
│   │       ├── SearchInput.tsx     # Search with filter
│   │       ├── AudioPlayer.tsx     # Custom audio player UI
│   │       └── SectionHeader.tsx   # Reusable section title block
│   ├── data/
│   │   ├── characters.json        # Full character database
│   │   ├── titans.json            # Titan data
│   │   ├── episodes.json          # Episode guide data
│   │   ├── timeline.json          # Chronological events
│   │   ├── map-locations.json     # Map pins + info
│   │   └── soundtrack.json        # Track list
│   ├── hooks/
│   │   ├── useScrollProgress.ts   # Global scroll % hook
│   │   ├── useCurrentScene.ts     # Active scene detector
│   │   ├── useIsMobile.ts         # Responsive breakpoint hook
│   │   ├── useAssetLoader.ts      # 3D asset loading manager
│   │   └── useGSAP.ts             # GSAP + ScrollTrigger cleanup hook
│   ├── store/
│   │   └── useStore.ts            # Zustand global store
│   ├── lib/
│   │   ├── constants.ts           # Scroll ranges, breakpoints, etc.
│   │   ├── utils.ts               # Utility functions
│   │   └── three-helpers.ts       # Three.js helper functions
│   └── types/
│       ├── character.ts           # TypeScript interfaces
│       ├── titan.ts
│       ├── episode.ts
│       └── scene.ts
├── .env.local                     # Environment variables
├── next.config.js                 # Next.js config (images, headers)
├── tailwind.config.ts             # Tailwind theme extension
├── tsconfig.json                  # TypeScript config
├── package.json
└── README.md
```

---

## ═══════════════════════════════════════════════════════════
## SECTION 5: GLOBAL LAYOUT & UI COMPONENTS
## ═══════════════════════════════════════════════════════════

### 5A. Loading Screen
- **Trigger:** Shows on initial page load while 3D assets + fonts load
- **Layout:** Full-screen overlay (z-index: 9999), dark background (#0A0A0A)
- **Content:**
  - Centered Wings of Freedom logo (SVG, white, 80px)
  - Text: "Dedicating your hearts..." (Cinzel, 1.25rem, --color-text-secondary)
  - Progress bar: thin green line, width animated 0→100%
  - Percentage text: "Loading assets — {n}%" (Inter, 0.875rem)
- **Exit:** Fades out over 800ms when all critical assets loaded
- **Implementation:** Zustand `isLoading` + `loadProgress` state.
  Use Three.js `useProgress()` from drei to track GLTF loading.

### 5B. Navbar
- **Position:** `fixed`, top: 0, left: 0, right: 0, z-index: 50
- **Height:** 72px desktop, 60px mobile
- **Background:** Transparent by default. On scroll past 3200vh (below 3D),
  transitions to `rgba(10,10,10,0.9)` with backdrop-blur.
- **Layout:**
  ```
  ┌──────────────────────────────────────────────────────────┐
  │ [Wings Logo] AoT ARCHIVE    Lore  Characters  Titans   │
  │                            Episodes  Timeline  Music   │
  │                                          🔊  ☰ (mobile)│
  └──────────────────────────────────────────────────────────┘
  ```
- **Logo:** SVG Wings of Freedom icon (24px) + "AoT ARCHIVE" (Cinzel, 1rem, bold)
- **Links:** Inter, 0.875rem, --color-text-secondary, hover → --color-text-primary
  with green underline slide-in animation
- **Active State:** Link matching current scroll section gets --color-primary
- **Mobile:** Hamburger menu → full-screen slide-in overlay with links
- **Sound Toggle:** Speaker icon (Lucide `Volume2` / `VolumeX`), top-right

### 5C. Scroll Progress Bar
- **Position:** Fixed, left: 0, top: 0, bottom: 0, width: 3px, z-index: 40
- **Appearance:** Thin green line (--color-primary) growing from top to bottom
  based on total page scroll progress (0–100%)
- **Implementation:** `height: ${scrollProgress}%`, transition: height 100ms

### 5D. Scene Navigation Dots
- **Position:** Fixed, right: 24px, top: 50%, transform: translateY(-50%), z-index: 40
- **Visible:** Only during 3D scrollytelling (scroll 0–3200vh)
- **Layout:** 7 vertical dots, 12px diameter, 24px gap
- **States:**
  - Inactive: `background: rgba(255,255,255,0.2)`, 8px diameter
  - Active: `background: --color-primary`, 12px diameter, glow shadow
  - Hover: Scale 1.3, show tooltip with scene name
- **Click:** Smooth-scrolls to corresponding scene start position
- **Labels (tooltips):** Shiganshina | Walls | Corps | Titans | Trost |
  Basement | Rumbling

### 5E. Scroll Hint
- **Position:** Fixed, bottom: 32px, left: 50%, transform: translateX(-50%)
- **Visible:** Only during first 5% of scroll, then fades out
- **Content:** "↓ Scroll to begin" (Inter, 0.875rem, --color-text-secondary)
- **Animation:** Gentle Y-axis bounce (GSAP yoyo, 1.5s loop)

### 5F. Section Header (Reusable Component)
Used for every non-3D section below the scrollytelling.
```
┌──────────────────────────────────────────────┐
│                                              │
│  ── ✦ ──                                     │  ← Decorative divider
│  SECTION TITLE                               │  ← Cinzel, --text-h1
│  日本語サブタイトル                            │  ← Noto Serif JP, smaller
│  Subtitle description text goes here.        │  ← Inter, --text-body
│  ── ✦ ──                                     │
│                                              │
└──────────────────────────────────────────────┘
```
- Centered, max-width: 700px
- Enters with GSAP fade-up on scroll into view
- Decorative divider: thin line with diamond center, --color-border

### 5G. Glass Card (Reusable Component)
- Uses the `.glass-card` style from the design system
- Props: `padding`, `hover` (lift + glow on hover), `borderColor`
- Used for: character cards, titan cards, episode cards, lore cards, etc.

### 5H. Footer
- **Background:** #0A0A0A, top border: 1px solid --color-border
- **Layout:**
  ```
  ┌──────────────────────────────────────────────────────┐
  │                                                      │
  │  [Wings Logo]                                        │
  │  AoT ARCHIVE                                         │
  │  "Shinzou wo Sasageyo"                               │
  │                                                      │
  │  NAVIGATION          LORE            COMMUNITY       │
  │  Home                The Walls       Discord         │
  │  Characters          The Titans      Twitter/X       │
  │  Episodes            Timeline        Reddit          │
  │  Music               Map             MyAnimeList     │
  │                                                      │
  │  ──────────────────────────────────────────────       │
  │  © 2024 AoT Archive — Fan Project                    │
  │  Attack on Titan © Hajime Isayama / Kodansha         │
  │  This is a non-commercial fan-made website.          │
  │                                                      │
  └──────────────────────────────────────────────────────┘
  ```
- **Typography:** Inter, --text-small, --color-text-muted
- **Links:** Hover → --color-primary
- **Padding:** --space-16 top/bottom, --space-8 left/right

---

## ═══════════════════════════════════════════════════════════
## SECTION 6: 3D SCROLLYTELLING — FULL SPECIFICATION
## ═══════════════════════════════════════════════════════════

### 6A. Architecture

**Sticky Stage Container:**
```css
.sticky-stage {
  position: sticky;
  top: 0;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  z-index: 1;
}
```

**Scroll Spacer:**
```css
.scroll-spacer {
  height: 3200vh;
  width: 100%;
  position: relative;
  z-index: 0;
  pointer-events: none;
}
```

**Layer Stack (inside sticky stage):**
```
z:1  → Three.js Canvas (full bleed, position: absolute)
z:2  → Atmospheric FX overlay (CSS gradients, fog divs)
z:3  → HTML Overlay content (absolute, pointer-events: none except CTAs)
z:4  → UI Chrome (progress bar, scene dots — actually fixed, not inside stage)
```

### 6B. Scroll Ranges

| Scene | Scroll vh | Normalized (0–1) | % of Total |
|-------|-----------|-------------------|------------|
| 1 — Shiganshina | 0–400 | 0.000–0.125 | 12.5% |
| 2 — Walls | 400–900 | 0.125–0.281 | 15.6% |
| 3 — Characters | 900–1500 | 0.281–0.469 | 18.8% |
| 4 — Titans | 1500–2000 | 0.469–0.625 | 15.6% |
| 5 — Trost | 2000–2400 | 0.625–0.750 | 12.5% |
| 6 — Basement | 2400–2800 | 0.750–0.875 | 12.5% |
| 7 — Rumbling | 2800–3200 | 0.875–1.000 | 12.5% |

### 6C. Camera Controller
- Reads global scroll progress from Zustand (0–1)
- Maps progress to camera position, rotation, and FOV per scene
- Uses GSAP `gsap.to()` with `scrub: 1` for smooth interpolation
- Each scene defines keyframe arrays: `[{at: 0, pos: [x,y,z], lookAt: [x,y,z], fov: 60}, ...]`

### 6D. Scene-by-Scene 3D + Overlay + FX Specs

---

#### SCENE 1 — "The Fall of Shiganshina"
**Scroll:** 0–400vh | **Mood:** Peace → Dread → Catastrophe
**Colors:** #D4A574 → #666666 → #CC2200

**3D Assets Needed:**
- Wall Maria gate segment (50m tall, stone, weathered)
- Colossal Titan head (15m, skinless, steam)
- Debris chunks (10–20 instanced rock fragments)
- Ground plane (cobblestone + grass)
- Sky environment (golden hour → red, HDR equirectangular)

**Camera Keyframes:**
| At (scene-local 0–1) | Position | LookAt | FOV |
|----------------------|----------|--------|-----|
| 0.0 | (0, 10, 80) | (0, 20, 0) | 60 |
| 0.3 | (0, 15, 40) | (0, 30, 0) | 55 |
| 0.5 | (0, 25, 30) | (0, 55, -10) | 70 |
| 0.7 | (0, 15, 10) | (0, 20, -20) | 65 |
| 1.0 | (0, 10, -5) | (0, 10, -50) | 65 |

**Overlay Timeline:**
| Scroll % | Element | Animation |
|----------|---------|-----------|
| 0–10% | "ATTACK ON TITAN" (h1) + "進撃の巨人" (sub) | Fade in, y:20→0 |
| 0–10% | "The Ultimate Archive" (tagline) | Fade in, delay 0.6s |
| 10–20% | Title group | Fade out |
| 35–50% | White→red flash overlay | opacity 0→0.8→0, 0.5s |
| 50–70% | "THE COLOSSAL TITAN" label | Scale 0→1, shake |
| 70–85% | Quote block (left-aligned, max-w 500px) | Fade in from left |
| 85–100% | Quote block | Fade out |

**Quote:** "That day, mankind received a grim reminder. We lived in fear of
the Titans and were disgraced to live in these cages we called walls." — Ch.1

**FX:**
- Dust particles (drei Sparkles, count=200, color=#D4A574)
- Fog: warm golden → grey → red (animated color + density)
- Screen shake on Colossal reveal (CSS transform, amplitude 5px, 30Hz)
- Debris: 20 instanced rocks with random velocity, triggered at 55%
- Flash: HTML overlay div, white→red

---

#### SCENE 2 — "The Three Walls"
**Scroll:** 400–900vh | **Mood:** Awe, scale, mystery
**Colors:** #87CEEB (sky), #8B8B7A (stone), #4A7C3F (green)

**3D Assets Needed:**
- Three concentric wall rings (Maria, Rose, Sina) — procedural cylinders
- Terrain plane (green hills inside, flat outside)
- District marker beacons (procedural PointLight + sprite)
- Cloud layer (drei Clouds)

**Camera Keyframes:**
| At | Position | LookAt | FOV |
|----|----------|--------|-----|
| 0.0 | (0, 20, 60) | (0, 0, 0) | 60 |
| 0.2 | (0, 200, 200) | (0, 0, 0) | 50 |
| 0.4 | (100, 150, 100) | (0, 0, 0) | 45 |
| 0.6 | (60, 100, 60) | (0, 0, 0) | 45 |
| 0.8 | (30, 60, 30) | (0, 0, 0) | 40 |
| 1.0 | (0, 250, 0) | (0, 0, 0) | 55 |

**Overlay Timeline:**
| Scroll % | Element | Animation |
|----------|---------|-----------|
| 0–10% | "THE THREE WALLS" title | Fade in center |
| 20–40% | Wall Maria info card | Slide in from left |
| 40–45% | Maria card | Slide out |
| 45–65% | Wall Rose info card | Slide in from right |
| 65–70% | Rose card | Slide out |
| 70–85% | Wall Sina info card | Fade in center |
| 85–100% | All labels + summary | Fade in |

**Card Content:**
- *Maria:* Radius 480km, Districts: Shiganshina/Trost, Status: BREACHED (845)
- *Rose:* Radius 380km, Districts: Trost/Krolva/Karanes, Status: COMPROMISED (850)
- *Sina:* Radius 250km, Districts: Stohess/Mitras, Status: INTACT (Royal Seat)

**FX:**
- Clear sky fog: #87CEEB, near=100, far=500
- District glow: PointLight + additive sprite
- Clouds: drei Clouds, y=60, opacity=0.6
- Optional god rays

---

#### SCENE 3 — "The Survey Corps"
**Scroll:** 900–1500vh | **Mood:** Heroic, emotional
**Colors:** #1A2744 (navy), #4A7C3F (green), #C4956A (warm)

**3D Assets Needed:**
- Eren Yeager model (Survey Corps, 1.7m, rigged)
- Mikasa Ackerman model (Survey Corps + red scarf)
- Levi Ackerman model (dual blades, combat pose)
- Attack Titan model (15m, morph from Eren)
- ODM Gear rig (metallic, detailed)
- Cape/cloak (Wings of Freedom)

**Camera Keyframes:**
| At | Position | LookAt | FOV |
|----|----------|--------|-----|
| 0.0 | (0, 2, 5) | (0, 1.5, 0) | 50 |
| 0.15 | (-3, 1.5, 4) | (0, 1, 0) | 45 |
| 0.4 | (3, 1.5, 4) | (0, 1, 0) | 45 |
| 0.6 | (0, 2, 3) | (0, 1.2, 0) | 40 |
| 0.85 | (0, 5, 12) | (0, 1, 0) | 55 |

**Overlay Timeline:**
| Scroll % | Element | Animation |
|----------|---------|-----------|
| 0–8% | "WINGS OF FREEDOM" + corps logo | Fade in |
| 10–25% | Eren card (left, 340px) | Slide in |
| 25–35% | Titan toggle (if clicked) | Card morph |
| 35–50% | Mikasa card (right) | Slide in |
| 50–65% | Levi card (left) | Slide in |
| 65–80% | Roster thumbnails grid | Stagger fade |
| 80–95% | Group quote | Fade in center |

**Character Data:**
- *Eren:* Combat 8, Initiative 10, Intellect 6, Titan 10. "I'll keep moving forward."
- *Mikasa:* Combat 10, Initiative 8, Intellect 7, Titan 0. "If I win, I live."
- *Levi:* Combat 10, Initiative 9, Intellect 8, Titan 0. "No regrets."

**FX:**
- Rim lighting (directional, #4A90D9, intensity=2)
- Scarf wind displacement (vertex shader sin wave)
- ODM wire trails (drei Trail, color=#888)
- Bokeh DOF (focused on active character)
- Dust particles (count=100, warm)

---

#### SCENE 4 — "The Titans"
**Scroll:** 1500–2000vh | **Mood:** Horror, unease
**Colors:** #3A4A2A (murky), #8B7355 (brown), #FF4400 (eye glow)

**3D Assets Needed:**
- Pure Titan (3 sizes: 3m, 7m, 15m)
- Abnormal Titan (distorted, crawling)
- Nine Titans (prioritize Attack, Colossal, Armored; others as silhouettes)
- Volumetric fog/steam

**Camera Keyframes:**
| At | Position | LookAt | FOV |
|----|----------|--------|-----|
| 0.0 | (0, 1.7, 20) | (0, 5, 0) | 60 |
| 0.25 | (0, 1.7, 10) | (0, 4, 0) | 65 |
| 0.4 | (5, 1, 5) | (-3, 2, 0) | 70 |
| 0.6 | (0, 10, 30) | (0, 10, 0) | 50 |
| 0.9 | (0, 5, 15) | (0, 40, 0) | 80 |

**Overlay Timeline:**
| Scroll % | Element | Animation |
|----------|---------|-----------|
| 0–10% | "THE TITANS" (glitch effect) | Fade in |
| 15–30% | "Pure Titans" label | Fade in left |
| 35–45% | "ABNORMAL" warning | Flash red, shake |
| 50–75% | Nine Titans 3x3 grid | Stagger fade |
| 80–90% | Size comparison chart | Bars animate |
| 90–100% | Colossal label | Scale up |

**Nine Titans:** Founding (13m), Attack (15m), Colossal (60m), Armored (15m),
Female (14m), Beast (17m), Jaw (5m), Cart (4m), War Hammer (15m)

**FX:**
- Heavy fog: #3A4A2A, near=10, far=80
- Steam on titan skin (noise-based emissive shader)
- Camera Y shake on titan steps (amplitude=0.2)
- Eye glow (emissive #FF4400, intensity=3, caught by Bloom)
- Silhouette back-lighting

---

#### SCENE 5 — "The Battle of Trost"
**Scroll:** 2000–2400vh | **Mood:** Adrenaline, chaos
**Colors:** #D4874A (dust), #666666 (smoke), #CC2200 (blood)

**3D Assets Needed:**
- Trost city block (5–10 modular buildings, instanced)
- ODM wire trails (procedural)
- Boulder (10m sphere, rough texture)
- Rooftop tile fragments

**Camera Keyframes:**
| At | Position | LookAt | FOV |
|----|----------|--------|-----|
| 0.0 | (5, 15, 5) | (0, 10, -20) | 60 |
| 0.3 | (0, 12, -30) | (0, 8, -60) | 75 |
| 0.5 | (-2, 8, -50) | (3, 10, -55) | 80 |
| 0.7 | (0, 40, -30) | (0, 0, -50) | 50 |
| 1.0 | (0, 5, -70) | (0, 8, -80) | 55 |

**Overlay Timeline:**
| Scroll % | Element | Animation |
|----------|---------|-----------|
| 0–10% | "BATTLE OF TROST" | Slam in, shake |
| 15–25% | Speed "142 km/h" | Pin to 3D |
| 30–40% | "Titan Kill #1" | Flash |
| 50–60% | Battle stats | Count-up |
| 70–80% | "Eren's first transformation" | Dramatic text |
| 85–95% | Boulder quote | Slow fade |

**Stats:** Titans: 62 | Casualties: 208 | Evacuated: ~300,000 | First victory
**Quote:** "I'll close the gate... no matter what it takes."

**FX:**
- Motion blur (directional post-FX)
- Speed lines (SVG overlay, opacity = scroll speed)
- Dust particles (count=500, brown)
- Impact frames (white flash, 1 frame, at 40% and 60%)
- FOV widen 60→80 for speed

---

#### SCENE 6 — "The Basement"
**Scroll:** 2400–2800vh | **Mood:** Tension, revelation
**Colors:** #0A0A0A → #FF9944 → #FFFFFF

**3D Assets Needed:**
- Stone staircase (20 steps, dark)
- Basement door (wooden, glowing keyhole)
- Bookshelf + desk + journal + candle
- Photograph on wall (AI-generated texture)

**Camera Keyframes:**
| At | Position | LookAt | FOV |
|----|----------|--------|-----|
| 0.0 | (0, 3, 5) | (0, 1, 0) | 50 |
| 0.25 | (0, 1, 2) | (0, 0, -3) | 45 |
| 0.45 | (0, 1.5, 0.5) | (0, 1.5, -1) | 40 |
| 0.65 | (0, 1.5, -2) | (0, 1.5, -5) | 50 |
| 1.0 | (0, 1.6, -4) | (0, 1.6, -5) | 35 |

**Overlay Timeline:**
| Scroll % | Element | Animation |
|----------|---------|-----------|
| 0–15% | "The key..." | Flicker, small |
| 20–35% | "GRISHA'S BASEMENT" | Warm fade in |
| 40–55% | "The truth lies beyond..." | Fade |
| 60–75% | Marley + Eldia lore cards | Float from sides |
| 80–90% | Photo reveal | Full-screen |
| 90–100% | "The world beyond the walls..." | Slow fade |

**Lore:**
- *Marley:* Nation across the sea, oppresses Eldians, weaponizes 7 Titans
- *Eldia:* Ancient empire, descendants of Ymir, Titan power
- *Photo:* "This is not a drawing. This is a photograph."

**FX:**
- Heavy vignette (offset=0.8, darkness=1.2)
- Candle flicker (PointLight, intensity 0.8–1.2, 8Hz)
- Dust motes (count=50, #FFCC88, slow)
- Light leak from doorway (cone mesh, additive)
- Film grain (noise post-FX, opacity=0.15)

---

#### SCENE 7 — "The Rumbling"
**Scroll:** 2800–3200vh | **Mood:** Apocalyptic, final
**Colors:** #1A0000 → #FF2200 → #FF6600 → #000000

**3D Assets Needed:**
- Colossal Titan army (1 detailed + InstancedMesh for 100 copies)
- Crumbling wall segments (fractured)
- Fire/ember particles
- Apocalyptic sky (custom shader or HDR)

**Camera Keyframes:**
| At | Position | LookAt | FOV |
|----|----------|--------|-----|
| 0.0 | (0, 20, 50) | (0, 30, 0) | 60 |
| 0.25 | (0, 50, 100) | (0, 20, -100) | 70 |
| 0.5 | (0, 10, 20) | (0, 30, -50) | 80 |
| 0.75 | (0, 100, 0) | (0, 0, -200) | 90 |
| 1.0 | (0, 5, 0) | (0, 5, -10) | 60 |

**Overlay Timeline:**
| Scroll % | Element | Animation |
|----------|---------|-----------|
| 0–15% | "THE RUMBLING" | Slam in, massive |
| 20–40% | "60,000,000 Colossal Titans" | Count-up |
| 40–60% | Eren monologue | Typewriter |
| 65–80% | "心臓を捧げよ — SHINZOU WO SASAGEYO" | Huge, center |
| 85–95% | Fade to black | — |
| 95–100% | CTA buttons + footer transition | Fade from black |

**Monologue:** "I will keep moving forward. Until my enemies are destroyed.
I was born into this world. I am free."

**CTAs:**
- Primary: "Explore the Full Archive" → scrolls to #lore
- Secondary: "Join the Community" → scrolls to #community

**FX:**
- INTENSE screen shake (amplitude=10px, multi-axis)
- Red sky shader (gradient #1A0000 → #FF2200 → #FF6600)
- Ember particles (count=2000, #FF4400, rising)
- Heat distortion (UV displacement post-FX)
- Ground cracks (animated alpha mask)
- Bloom max (intensity=1.5)
- Audio rumble (low-freq, volume = scroll %)

---

### 6E. Post-Processing Stack (Global)
```
<EffectComposer>
  <Bloom intensity={0.4–1.5 per scene} luminanceThreshold={0.6} mipmapBlur />
  <Vignette offset={0.3–0.8} darkness={0.5–1.2} />
  <ChromaticAberration offset={shake ? [0.005,0.005] : [0,0]} />
  <Noise opacity={0.03–0.15} />
  <DepthOfField focusDistance={target} focalLength={0.02} bokehScale={1–3} />
  <ToneMapping mode={ACESFilmicToneMapping} />
</EffectComposer>
```

---

## ═══════════════════════════════════════════════════════════
## SECTION 7: NON-3D CONTENT SECTIONS — FULL SPECS
## ═══════════════════════════════════════════════════════════

These sections appear AFTER the 3200vh scrollytelling, in normal document flow.
Each section uses a dark background (#0A0A0A or #0F0F0F alternating), the
SectionHeader component, and GSAP scroll-triggered entrance animations.

### 7A. World Map (#lore)
**Layout:** Full-width, min-height 100vh, padding --space-16
**Background:** Dark with subtle parchment texture overlay (opacity 0.05)

**Features:**
- Large SVG/Canvas map of Paradis Island (center) + Marley continent (right)
- Clickable location pins (Shiganshina, Trost, Stohess, Karanes, Utopia,
  Krolva, Ehrmich, Yarckel, Mitras, Liberio, Fort Salta)
- Hover → tooltip with location name + brief description
- Click → expand GlassCard with full lore (district info, key events, image)
- Toggle button: "Paradis" / "Marley" / "Full World"
- Animated event path: dotted line showing key story progression
  (Shiganshina → Trost → Stohess → Liberio → Fort Salta)
- Zoom/pan controls (mouse wheel + drag)

**Data Structure (map-locations.json):**
```json
{
  "id": "shiganshina",
  "name": "Shiganshina District",
  "wall": "Maria",
  "position": { "x": 50, "y": 85 },
  "description": "Southernmost district of Wall Maria...",
  "keyEvents": ["Fall of Wall Maria (845)", "Battle of Shiganshina (850)"],
  "image": "/images/map/shiganshina.jpg"
}
```

### 7B. Character Encyclopedia (#characters)
**Layout:** Full-width, min-height 100vh, padding --space-16
**Background:** #0F0F0F

**Features:**
- Search bar at top (filter by name)
- Filter tabs: All | Survey Corps | Military Police | Garrison | Titans | Marley
- Grid of character cards (3 columns desktop, 2 tablet, 1 mobile)
- Each card: character image, name, affiliation badge, key stat
- Click card → Modal with full profile:
  - Large image
  - Name (EN + JP)
  - Affiliation, rank, height, weight
  - Stat bars (Combat, Initiative, Intellect, Teamwork, Titan)
  - Biography (2–3 paragraphs)
  - Key quotes (2–3)
  - Relationships
  - First/last appearance

**Data Structure (characters.json):**
```json
{
  "id": "eren-yeager",
  "name": "Eren Yeager",
  "nameJP": "エレン・イェーガー",
  "affiliation": "Survey Corps",
  "rank": "Private",
  "height": "170cm",
  "weight": "63kg",
  "stats": { "combat": 8, "initiative": 10, "intellect": 6, "teamwork": 5, "titan": 10 },
  "bio": "Eren Yeager is the main protagonist...",
  "quotes": ["I'll keep moving forward...", "Because I was born into this world."],
  "image": "/images/characters/eren.jpg",
  "titanForm": "Attack Titan"
}
```

**Characters to include (minimum 15):**
Eren, Mikasa, Levi, Armin, Erwin, Hange, Annie, Jean, Connie, Sasha,
Reiner, Bertholdt, Zeke, Historia, Falco, Gabi, Pieck, Grisha

### 7C. Titan Bestiary (#titans)
**Layout:** Full-width, min-height 80vh, padding --space-16
**Background:** #0A0A0A with subtle green fog gradient at bottom

**Features:**
- Two tabs: "The Nine Titans" | "Pure Titans & Abnormals"
- Nine Titans: horizontal scrollable cards (large, detailed)
  - Each card: titan illustration, name, height, current holder,
    ability description, weakness, history
- Pure Titans: grid of info cards with size categories (3–5m, 5–10m, 10–15m)
- Size comparison visual: horizontal bar chart (Human → 3m → 7m → 15m → 60m)
  with silhouettes

**Data Structure (titans.json):**
```json
{
  "id": "attack-titan",
  "name": "Attack Titan",
  "nameJP": "進撃の巨人",
  "height": "15m",
  "holder": "Eren Yeager",
  "previousHolders": ["Grisha Yeager", "Eren Kruger"],
  "ability": "Future memory inheritance, exceptional combat ability",
  "weakness": "No unique hardening or elemental ability",
  "history": "The Attack Titan has always fought for freedom...",
  "image": "/images/titans/attack.jpg"
}
```

### 7D. Episode Guide (#episodes)
**Layout:** Full-width, min-height 100vh, padding --space-16
**Background:** #0F0F0F

**Features:**
- Season tabs: Season 1 (25 eps) | Season 2 (12 eps) | Season 3 (22 eps) |
  Season 4 (28 eps)
- Episode list: vertical accordion or grid
- Each episode card:
  - Thumbnail image
  - Episode number + title (EN + JP)
  - Air date
  - Rating (star or number)
  - Synopsis (expandable)
  - Tags: "Key Moment", "Titan Reveal", "Battle", "Lore", "Emotional"
- "Jump to Key Episodes" quick filter

**Data Structure (episodes.json):**
```json
{
  "season": 1,
  "episode": 1,
  "title": "To You, in 2000 Years",
  "titleJP": "二千年後の君へ",
  "airDate": "2013-04-07",
  "rating": 9.2,
  "synopsis": "After 100 years of peace, humanity's worst nightmare...",
  "tags": ["Key Moment", "Lore"],
  "thumbnail": "/images/episodes/s1e1.jpg"
}
```

### 7E. Timeline (#timeline)
**Layout:** Full-width, min-height 80vh, padding --space-16
**Background:** #0A0A0A

**Features:**
- Vertical timeline with central line
- Events alternate left/right of the line
- Each event node: year, title, brief description, optional image
- Scroll-triggered: events fade in as they enter viewport
- Eras: "Ancient History" → "The Great Titan War" → "100 Years of Peace" →
  "Year 845: The Fall" → "Year 850: The Return" → "Year 854: The Rumbling"
- Color-coded by era (gold → green → red → black)

**Data Structure (timeline.json):**
```json
{
  "year": "845",
  "era": "The Fall",
  "title": "Fall of Wall Maria",
  "description": "The Colossal and Armored Titans breach Wall Maria...",
  "image": "/images/timeline/fall-of-maria.jpg",
  "color": "#CC2200"
}
```

### 7F. Soundtrack Player (#music)
**Layout:** Full-width, min-height 60vh, padding --space-16
**Background:** #0F0F0F with subtle gradient

**Features:**
- Header: "THE SOUND OF WAR" + "Music by Hiroyuki Sawano"
- Featured tracks as horizontal scrollable cards
- Each track card: album art, title, duration, scene association
- Click → plays embedded audio (YouTube iframe or SoundCloud embed)
- Custom player bar at bottom (sticky within section):
  - Track name, play/pause, progress bar, volume
- Visualizer: CSS animated bars when playing (decorative, not real FFT)

**Track List:**
1. "Guren no Yumiya" — OP1 (Linked Horizon)
2. "Jiyuu no Tsubasa" — OP2 (Linked Horizon)
3. "Sasageyo!" — OP3 (Linked Horizon)
4. "Vogel im Käfig" — Emotional/Reveal scenes
5. "YouSeeBIGGIRL/T:T" — Female Titan reveal
6. "The Rumbling" — Final Season OP (SiM)
7. "Akuma no Ko" — Final Season ED (Higuchi Ai)
8. "Call Your Name" — Emotional scenes
9. "Attack on Titan" — Main theme
10. "Barricades" — Battle of Trost

**Data Structure (soundtrack.json):**
```json
{
  "id": "guren-no-yumiya",
  "title": "Guren no Yumiya",
  "artist": "Linked Horizon",
  "composer": "Hiroyuki Sawano",
  "type": "Opening 1",
  "season": 1,
  "duration": "5:16",
  "embedUrl": "https://www.youtube.com/embed/...",
  "albumArt": "/images/music/guren.jpg"
}
```

### 7G. Gallery
**Layout:** Full-width, min-height 80vh, padding --space-16
**Background:** #0A0A0A

**Features:**
- Masonry grid of images (3–4 columns desktop, 2 tablet, 1 mobile)
- Categories: Anime Screenshots | Manga Panels | Official Art | Fan Art
- Click → Lightbox modal with full-size image, caption, source
- Lazy loading with blur-up placeholder
- "Load More" pagination (20 images per batch)

### 7H. Community (#community)
**Layout:** Full-width, min-height 60vh, padding --space-16
**Background:** #0F0F0F

**Features:**
- 3-column card grid:
  - **Discord:** Embedded widget or "Join Server" CTA with member count
  - **Social:** Twitter/X feed embed or link, Reddit link, MyAnimeList link
  - **Fan Art:** "Submit Your Art" CTA + showcase of 3–4 featured pieces
- Large CTA: "DEDICATE YOUR HEART — JOIN THE SURVEY CORPS"
  (green button, --color-primary, glow shadow)

---

## ═══════════════════════════════════════════════════════════
## SECTION 8: 3D ASSET CREATION GUIDE
## ═══════════════════════════════════════════════════════════

### General Rules
- **Format:** .glb (binary glTF) with Draco mesh compression
- **Poly Budget:** Hero models 15k–30k tris, environment 5k–15k, props 3k–8k,
  background LOD 1k–3k
- **Textures:** Max 2048 hero, 1024 environment, 512 props. KTX2 compressed.
- **Scale:** 1 unit = 1 meter. Titans to scale (3m–60m).
- **Origin:** Center pivot at feet for characters, center for props.
- **Animations:** Bake to keyframes, export as .glb clips. Skeletal for
  characters, morph targets for transforms.
- **Pipeline:** Blender → gltf-transform CLI (Draco + KTX2) → /public/models/

### Full Asset List

| Scene | Asset | Polys | Method |
|-------|-------|-------|--------|
| 1 | Wall Maria Gate | 15k | Blender: medieval wall + arch, displacement map |
| 1 | Colossal Titan Head | 25k | Blender: sculpt from reference, SSS material |
| 1 | Debris Chunks (x5) | 2k each | Blender: fracture modifier on wall mesh |
| 1 | Ground Plane | 5k | Tiling PBR texture (cobblestone + grass) |
| 2 | Three Wall Rings | 10k each | Blender: procedural cylinders + wall texture |
| 2 | Terrain | 8k | Blender: displacement plane, green/brown |
| 3 | Eren Yeager | 20k | Blender/Mixamo: rig + Survey Corps uniform |
| 3 | Mikasa Ackerman | 20k | Same + red scarf (cloth sim baked) |
| 3 | Levi Ackerman | 20k | Same + dual blades |
| 3 | Attack Titan | 25k | Blender: sculpt, morph from Eren |
| 3 | ODM Gear | 8k | Blender: hard-surface, metallic PBR |
| 4 | Pure Titan (x3 sizes) | 15k each | Blender: 1 base + scale/morph variants |
| 4 | Abnormal Titan | 15k | Modified pure titan, extreme pose |
| 4 | Nine Titans (hero 3) | 20k each | Attack, Colossal, Armored detailed |
| 4 | Nine Titans (silhouette 6) | 5k each | Low-poly outlines only |
| 5 | Trost Buildings (x5 modular) | 8k each | Blender: modular kit, instanced |
| 5 | Boulder | 3k | Icosphere + displacement |
| 6 | Staircase | 5k | Simple geometry, dark stone PBR |
| 6 | Basement Room | 8k | Door, shelves, desk, candle |
| 7 | Colossal Titan (detailed) | 25k | Full body, for foreground |
| 7 | Colossal Titan (LOD) | 5k | For InstancedMesh army |
| 7 | Wall Fragments | 3k each | Fracture modifier, animated |

### Quick-Start Alternatives (if no Blender skills)
- **Meshy.ai / Tripo3D:** Text-to-3D for props
- **CSM.ai:** Image-to-3D from AoT screenshots
- **Sketchfab:** Search "Attack on Titan" (check CC licenses)
- **Mixamo:** Auto-rig humanoids + free animation library
- **Note:** AI 3D needs cleanup. Use for prototyping, refine for production.

---

## ═══════════════════════════════════════════════════════════
## SECTION 9: 2D IMAGE GENERATION PROMPTS
## ═══════════════════════════════════════════════════════════

Use these in Midjourney, DALL-E 3, or Stable Diffusion.

### Environment / HDR
1. **Golden Sky:** "Equirectangular HDR panorama, golden hour sunset over
   medieval walled city, warm orange pink clouds, peaceful, photorealistic, 8K"
2. **Red Apocalyptic Sky:** "Equirectangular HDR, blood red apocalyptic sky,
   dark storm clouds, fire glow horizon, volcanic ash, cinematic, 8K"
3. **Dark Basement:** "Equirectangular, pitch black stone cellar, single warm
   candle light, dust in beam, moody, photorealistic"

### Textures
4. **Wall Stone:** "Seamless tileable, ancient stone wall, weathered grey-brown,
   medieval fortress, PBR, 4K, top-down"
5. **Titan Skin:** "Seamless tileable, muscular skin without epidermis, red
   muscle fibers, anatomical, grotesque, 2K"
6. **Parchment:** "Aged parchment, hand-drawn titan sketches in margins,
   handwritten German script, coffee stains, worn edges, top-down, 4K"

### UI / Assets
7. **Wings Logo:** "Survey Corps Wings of Freedom logo, clean vector, white and
   blue overlapping wings, transparent bg, high res, minimalist"
8. **Vintage Photo:** "Sepia photograph, early 1900s, family of three before
   building, damaged edges, faded, mysterious, realistic"
9. **Impact Frame:** "Manga impact frame, black white speed lines from center,
   dramatic, high contrast, transparent center, vector, 4K"
10. **Ember Sprite:** "Glowing ember particle, orange-red gradient, soft glow,
    transparent bg, circular, 64x64"

### Section Backgrounds
11. **Map Background:** "Fantasy cartographic map, circular island with three
    concentric walls, medieval parchment, compass rose, sea monsters, hand-drawn,
    warm tones, top-down"
12. **Episode Header:** "Cinematic wide shot, Survey Corps on wall at sunset,
    capes flowing, dramatic clouds, anime art style, 16:9, high detail"
13. **Community Banner:** "Survey Corps soldiers charging forward, Wings of
    Freedom capes, dramatic low angle, anime cinematic, widescreen, epic"

---

## ═══════════════════════════════════════════════════════════
## SECTION 10: RESPONSIVE DESIGN STRATEGY
## ═══════════════════════════════════════════════════════════

### Breakpoints
| Tier | Width | 3D Experience | Overlay | Content Sections |
|------|-------|---------------|---------|-----------------|
| Desktop | >1024px | Full 3D, all FX | Cards at edges, 320–360px | 3–4 column grids |
| Tablet | 768–1024px | Reduced 3D (fewer particles, no DOF, lower LOD) | Cards centered, 280px | 2 column grids |
| Mobile | <768px | **2D parallax fallback** (no WebGL) | Cards 90vw, stacked | 1 column |

### Mobile Fallback (CRITICAL)
When `window.innerWidth < 768` OR GPU tier is low:
- Replace `<Canvas>` with CSS parallax layers using background images
- Each scene = full-screen background image with `transform: translateY()` parallax
- Overlay text animates identically via GSAP ScrollTrigger (still works)
- Use AI-generated images from Section 9 as parallax layers
- Saves battery, prevents crashes on low-end devices
- User still gets the narrative experience, just without real-time 3D

### Touch Adjustments
- Disable orbit/pointer controls on mobile
- Min touch target: 44px
- Swipe hint instead of scroll hint
- Larger text on mobile (+10% base size)

### Responsive Overlay Rules
- All overlay cards: `max-width: min(90vw, 360px)` on mobile
- Stats bars: stack vertically on mobile
- Nine Titans grid: 3x3 → 2x2 → 1 column
- Episode list: grid → accordion

---

## ═══════════════════════════════════════════════════════════
## SECTION 11: PERFORMANCE OPTIMIZATION
## ═══════════════════════════════════════════════════════════

### Targets
- **LCP:** < 2.5s (loading screen covers 3D init)
- **FPS:** 60fps desktop (GTX 1060+), 30fps minimum mid-range
- **Initial JS:** < 500KB (lazy-load 3D)
- **Total 3D Assets:** < 20MB (Draco + KTX
