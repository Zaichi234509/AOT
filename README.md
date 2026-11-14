# 🗡️ MASTER PROMPT — Attack on Titan 3D Scrollytelling Website

> **Copy everything below this line and paste it into your AI coding assistant, dev team brief, or project management tool. It is fully self-contained.**

---

```markdown
# MASTER PROMPT: ATTACK ON TITAN — 3D SCROLLYTELLING WEBSITE

## ═══════════════════════════════════════════════
## SECTION 1: PROJECT OVERVIEW
## ═══════════════════════════════════════════════

Build a single-page, scroll-driven 3D "scrollytelling" website themed around
the anime/manga "Attack on Titan" (Shingeki no Kyojin). The site uses a sticky
full-viewport 3D canvas as the background, with HTML overlay content that
animates in sync with the user's scroll position. The 3D camera moves through
7 cinematic scenes as the user scrolls, creating an immersive narrative journey
from the fall of Wall Maria to The Rumbling.

**Core Experience:** The user scrolls down. The 3D world moves. Text, cards,
and UI elements fade/slide in and out at precise scroll positions. The entire
site feels like an interactive movie.

**Target Audience:** AoT fans, anime community, web design enthusiasts.
**Tone:** Cinematic, dramatic, reverent, dark.
**Language:** English with Japanese (kanji) accents for authenticity.

---

## ═══════════════════════════════════════════════
## SECTION 2: TECH STACK
## ═══════════════════════════════════════════════

### Core
- **Framework:** React 18+ (Next.js 14+ App Router preferred for SSR/SEO)
- **3D Engine:** Three.js r160+ via React Three Fiber (@react-three/fiber v8+)
- **3D Helpers:** @react-three/drei (ScrollControls, Html, Text, Environment,
  useGLTF, useTexture, Sparkles, Stars, Trail, Float)
- **Scroll Animation:** GSAP 3.12+ with ScrollTrigger plugin
- **Smooth Scroll:** Lenis (lenis/react) — CRITICAL for scrubbed 3D feel
- **Post-Processing:** @react-three/postprocessing (Bloom, Vignette,
  ChromaticAberration, Noise, DepthOfField)
- **Styling:** Tailwind CSS 3.4+ with custom theme
- **State:** Zustand (lightweight, works well with R3F)
- **TypeScript:** Strict mode throughout

### Asset Pipeline
- **3D Models:** Blender 4.0+ → export as .glb/.gltf (Draco compressed)
- **Textures:** KTX2/Basis Universal for GPU-compressed textures
- **Fonts:** Google Fonts (Noto Serif JP for Japanese, Cinzel for English headers,
  Inter for body)
- **Audio (optional):** Howler.js for ambient SFX triggers on scroll

### Dev Tooling
- **Bundler:** Vite (via Next.js) or standalone Vite
- **Deployment:** Vercel (with Edge caching for static assets)
- **CDN:** Cloudflare R2 or Vercel Blob for 3D assets
- **Performance Monitoring:** Lighthouse CI, Web Vitals

---

## ═══════════════════════════════════════════════
## SECTION 3: ARCHITECTURE
## ═══════════════════════════════════════════════

### Component Tree
```
<App>
  <LenisSmoothScroll>
    <Navbar />                    // z:50, fixed, transparent
    <ScrollProgress />            // z:40, left edge bar
    <SceneDots />                 // z:40, right edge nav
    <SoundToggle />               // z:50, top-right
    <ScrollHint />                // z:40, bottom-center, fades after scroll

    <StickyStage>                 // position: sticky, top: 0, height: 100vh
      <Canvas>                    // R3F Canvas, full bleed
        <SceneLighting />
        <Scene1_Shiganshina />    // conditional render or LOD
        <Scene2_Walls />
        <Scene3_Characters />
        <Scene4_Titans />
        <Scene5_Trost />
        <Scene6_Basement />
        <Scene7_Rumbling />
        <PostProcessingFX />
        <CameraController />      // driven by scroll %
      </Canvas>

      <OverlayLayer>              // absolute, pointer-events-none (except CTAs)
        <Scene1_Overlay />
        <Scene2_Overlay />
        <Scene3_Overlay />
        <Scene4_Overlay />
        <Scene5_Overlay />
        <Scene6_Overlay />
        <Scene7_Overlay />
      </OverlayLayer>
    </StickyStage>

    <ScrollSpacer />              // height: 3200vh (total scroll distance)

    <Non3DSections>
      <InteractiveMap />
      <EpisodeGuide />
      <SoundtrackPlayer />
      <Community />
    </Non3DSections>

    <Footer />
  </LenisSmoothScroll>
</App>
```

### Scroll Architecture
- Total scroll distance: **3200vh** (set by a spacer div behind the sticky stage)
- The sticky stage is `position: sticky; top: 0; height: 100vh; overflow: hidden`
- GSAP ScrollTrigger reads the spacer's scroll progress (0 → 1)
- Each scene occupies a defined range of that 0–1 progress
- Camera position, rotation, and FOV are interpolated per scene
- Overlay elements have individual ScrollTrigger timelines for enter/exit

### Scene Scroll Ranges (normalized 0–1)
| Scene | Scroll vh | Normalized Range | % of Total |
|-------|-----------|-----------------|------------|
| 1 — Shiganshina | 0–400 | 0.000–0.125 | 12.5% |
| 2 — Walls | 400–900 | 0.125–0.281 | 15.6% |
| 3 — Characters | 900–1500 | 0.281–0.469 | 18.8% |
| 4 — Titans | 1500–2000 | 0.469–0.625 | 15.6% |
| 5 — Trost | 2000–2400 | 0.625–0.750 | 12.5% |
| 6 — Basement | 2400–2800 | 0.750–0.875 | 12.5% |
| 7 — Rumbling | 2800–3200 | 0.875–1.000 | 12.5% |

### State Management (Zustand)
```
store = {
  scrollProgress: 0,        // 0–1 global
  currentScene: 1,          // 1–7
  isMobile: false,          // responsive flag
  soundEnabled: false,      // audio toggle
  activeCharacter: 'eren',  // Scene 3 sub-state
  activeTitan: 'attack',    // Scene 4 sub-state
  isLoading: true,          // asset loading screen
  loadProgress: 0,          // 0–100
}
```

---

## ═══════════════════════════════════════════════
## SECTION 4: 3D ASSET CREATION GUIDE
## ═══════════════════════════════════════════════

### General Rules for All 3D Assets
- **Format:** .glb (binary glTF) with Draco mesh compression
- **Poly Budget:**
  - Hero models (Colossal Titan, main characters): 15k–30k tris
  - Environment (walls, buildings): 5k–15k tris per chunk
  - Props (ODM gear, boulder): 3k–8k tris
  - Background/far LOD: 1k–3k tris
- **Textures:** Max 2048x2048 for hero, 1024x1024 for environment, 512x512 for props
- **Materials:** Use MeshStandardMaterial or MeshPhysicalMaterial. Avoid custom
  shaders for base materials (reserve for FX).
- **Scale:** 1 Three.js unit = 1 meter. Titans should be to scale (3m–60m).
- **Origin:** Center pivot at feet for characters/titans, center for props.
- **Animations:** Bake to keyframes. Export as separate .glb animation clips.
  Use skeletal animation for characters, morph targets for face/titan transforms.

### Asset List by Scene

#### Scene 1 — Shiganshina
| Asset | Description | Source Method |
|-------|-------------|---------------|
| Wall Maria Gate | 50m tall stone wall segment with arched gate, weathered texture | **Blender:** Model from reference photos of medieval walls. Use displacement map for stone detail. |
| Colossal Titan Head | Skinless muscular head, 15m, steam particles from skin | **Blender:** Sculpt from AoT reference. Use subsurface scattering material. Steam = particle system exported separately. |
| Debris Chunks | 10–20 rock/brick fragments, various sizes | **Blender:** Fracture modifier on wall mesh. Export 5 variants, instance in Three.js. |
| Sky Dome | HDR environment map, golden hour → red apocalyptic | **AI Image Gen** (see Section 8) → convert to equirectangular HDR |
| Ground Plane | Cobblestone street + grass fields outside wall | **Blender:** Tiling texture, 512x512, PBR set (albedo, normal, roughness) |

#### Scene 2 — The Walls
| Asset | Description | Source Method |
|-------|-------------|---------------|
| Three Walls (Maria/Rose/Sina) | Concentric circular walls, 50m tall, 3 radii (480km/380km/250km scaled down) | **Blender:** Procedural cylinder rings with wall texture. Scale is artistic, not literal. |
| District Markers | Glowing beacons at gate positions (Shiganshina, Trost, Stohess) | **Three.js procedural:** PointLight + sprite glow, no model needed |
| Terrain | Green rolling hills inside walls, flat outside | **Blender:** Displacement on plane, green/brown texture |
| Cloud Layer | Volumetric clouds at wall-top height | **Three.js:** Use drei `<Clouds>` component or custom shader plane |

#### Scene 3 — Characters
| Asset | Description | Source Method |
|-------|-------------|---------------|
| Eren Yeager | Survey Corps uniform, determined pose, 1.7m | **Blender:** Use Mixamo base mesh → customize hair, uniform. Rig with Mixamo auto-rigger. OR download fan-made model from Sketchfab (check license). |
| Mikasa Ackerman | Survey Corps uniform + red scarf, combat stance | **Blender:** Same pipeline. Scarf = cloth sim baked to shape keys. |
| Levi Ackerman | Survey Corps uniform, dual blades, spinning pose | **Blender:** Same pipeline. |
| Attack Titan (Eren) | 15m muscular titan, pointed ears, long hair | **Blender:** Sculpt from reference. Separate .glb with morph target from human Eren. |
| ODM Gear Rig | Mechanical gear box, gas canisters, wire spools, blades | **Blender:** Hard-surface model. Metallic PBR material. |
| Cape/Cloak | Survey Corps Wings of Freedom cloak | **Blender:** Cloth sim, baked. Texture = green with Wings logo. |

#### Scene 4 — Titans
| Asset | Description | Source Method |
|-------|-------------|---------------|
| Pure Titan (3m, 7m, 15m) | Generic grotesque titans, 3 size variants | **Blender:** Sculpt 1 base, scale + morph for variants. Skin material with SSS. |
| Abnormal Titan | Distorted proportions, crawling pose | **Blender:** Modify pure titan rig, extreme pose |
| The Nine Titans | Attack, Colossal, Armored, Female, Beast, Jaw, Cart, War Hammer, Founding | **Blender/Sketchfab:** Prioritize Attack, Colossal, Armored (hero). Others can be lower-poly silhouettes. |
| Steam/Fog Volume | Volumetric fog for titan emergence | **Three.js:** Custom fog shader or drei `<Fog>` + particle system |

#### Scene 5 — Trost Battle
| Asset | Description | Source Method |
|-------|-------------|---------------|
| Trost City Block | 5–10 European-style buildings, 2–4 stories, tile roofs | **Blender:** Modular kit (wall, roof, window, door). Instance randomly. |
| Rooftop Tiles | Breakable tile fragments | **Blender:** Fracture modifier, 3 variants |
| ODM Wire Trails | Glowing wire lines from gear to anchor points | **Three.js procedural:** `<Trail>` from drei or custom line geometry |
| Boulder | 10m spherical rock, rough texture | **Blender:** Icosphere + displacement, 2k tris |

#### Scene 6 — The Basement
| Asset | Description | Source Method |
|-------|-------------|---------------|
| Stone Staircase | Spiral or straight descent, 20 steps, stone walls | **Blender:** Simple geometry, dark stone PBR |
| Basement Door | Wooden door with ornate keyhole, glowing | **Blender:** Low-poly, emissive keyhole material |
| Bookshelf | Wooden shelves with books | **Blender:** Array modifier on book blocks |
| Desk + Journal | Open book with sketches, quill, candle | **Blender:** Simple props, warm emissive candle |
| Photograph | Framed photo on wall (Grisha's family) | **AI Image Gen** (see Section 8) → apply as texture on plane |

#### Scene 7 — The Rumbling
| Asset | Description | Source Method |
|-------|-------------|---------------|
| Colossal Titan Army | 50–100 Colossal Titan instances marching | **Blender:** 1 detailed model → Three.js InstancedMesh (critical for performance). Only 3–5 in foreground detailed, rest are low-poly LOD. |
| Crumbling Wall | Wall segments breaking apart | **Blender:** Fracture modifier, animated chunks |
| Fire/Ember Particles | Floating embers, ground fire | **Three.js:** drei `<Sparkles>` + custom fire shader on ground plane |
| Apocalyptic Sky | Blood-red sky with dark clouds | **AI Image Gen** → HDR equirectangular or gradient shader |

### Asset Creation Workflow (Step-by-Step)
1. **Gather References:** Collect AoT manga panels, anime screenshots, and
   official art for each asset. Create a Pureboard/Milanote board.
2. **Block Out in Blender:** Start with primitive shapes. Get proportions right
   before detailing.
3. **Sculpt & Retopologize:** Sculpt high-poly, retopo to target poly count.
4. **UV Unwrap & Texture:** Use Substance Painter or Blender texture paint.
   Create PBR sets (albedo, normal, roughness, metallic, AO).
5. **Rig & Animate:** Use Mixamo for quick humanoid rigs. Bake idle + action
   animations per character.
6. **Export:** Export as .glb with Draco compression. Test in
   https://gltf-viewer.donmccurdy.com/ before importing to Three.js.
7. **Optimize:** Use gltf-pipeline or gltf-transform CLI to further compress.
   Target <2MB per hero model, <500KB per environment chunk.

### Quick-Start Alternative: AI-Assisted 3D
If you need assets fast and don't have Blender skills:
- **Meshy.ai** or **Tripo3D** → Text-to-3D for props and simple models
- **CSM.ai** → Image-to-3D (feed it AoT screenshots)
- **Sketchfab** → Search "Attack on Titan" for fan models (check CC licenses)
- **Mixamo** → Auto-rig any humanoid mesh + apply free animations
- **Note:** AI-generated 3D will need cleanup in Blender. Use for prototyping,
  refine for production.

---

## ═══════════════════════════════════════════════
## SECTION 5: 3D EFFECTS & SHADERS
## ═══════════════════════════════════════════════

### Post-Processing Stack (applied globally, intensity varies per scene)
```
<EffectComposer>
  <Bloom
    intensity={scene === 7 ? 1.5 : 0.4}
    luminanceThreshold={0.6}
    mipmapBlur
  />
  <Vignette
    eskil={false}
    offset={scene === 6 ? 0.8 : 0.3}
    darkness={scene === 6 ? 1.2 : 0.5}
  />
  <ChromaticAberration
    offset={screenShake ? [0.005, 0.005] : [0, 0]}
  />
  <Noise
    opacity={scene === 6 ? 0.15 : 0.03}
  />
  <DepthOfField
    focusDistance={cameraFocusTarget}
    focalLength={0.02}
    bokehScale={scene === 3 ? 3 : 1}
  />
  <ToneMapping
    mode={ACESFilmicToneMapping}
  />
</EffectComposer>
```

### Per-Scene FX Specifications

#### Scene 1 — Shiganshina FX
- **Particles:** Dust motes (drei `<Sparkles>` count=200, size=0.05, color=#d4a574)
- **Fog:** `<fog attach="fog" args={['#c4956a', 50, 200]} />` (warm, distant)
- **Screen Shake:** On Colossal reveal (scroll 50–70%), apply CSS `transform: translate()`
  to canvas container using GSAP random wiggle (amplitude: 5px, frequency: 30Hz)
- **Flash Overlay:** White → red HTML overlay div, opacity 0→0.8→0 over 0.5s
  triggered at scroll 50%
- **Debris Physics:** 20 instanced rock meshes with random velocity vectors,
  triggered at scroll 55%, animated via useFrame

#### Scene 2 — Walls FX
- **Atmosphere:** Clear sky, minimal fog `<fog args={['#87CEEB', 100, 500]} />`
- **Glow:** District markers use `<PointLight>` + sprite with additive blending
- **Clouds:** drei `<Clouds>` at y=60, opacity=0.6, speed=0.2
- **God Rays:** Optional — use `<GodRays>` from postprocessing if performance allows

#### Scene 3 — Characters FX
- **Rim Lighting:** Strong directional light from behind (color=#4a90d9,
  intensity=2) for dramatic silhouette
- **Scarf Physics:** Mikasa's scarf = soft body or vertex shader wind displacement
  (sin wave on vertex positions, amplitude=0.1, frequency=2)
- **ODM Wire Trails:** drei `<Trail>` component, color=#888, width=0.02,
  length=10, attenuation=2
- **Bokeh DOF:** Shallow depth of field focused on active character,
  background blurred
- **Particle Dust:** Subtle floating particles, count=100, warm color

#### Scene 4 — Titans FX
- **Volumetric Fog:** Heavy green-brown fog `<fog args={['#3a4a2a', 10, 80]} />`
- **Steam Emission:** Custom shader on titan skin — noise-based emissive patches
  that pulse (use `onBeforeCompile` to inject noise into emissive channel)
- **Ground Shake:** Camera Y oscillation (amplitude=0.2, frequency=3) when
  large titans step
- **Eye Glow:** Emissive material on titan eyes (color=#ff4400, intensity=3)
  with Bloom catching it
- **Silhouette Lighting:** Back-lit with strong rim, front dark — horror mood

#### Scene 5 — Trost FX
- **Motion Blur:** Simulated via `<Trail>` on camera or post-processing
  `<SMAA>` + directional blur shader
- **Speed Lines:** HTML overlay SVG lines radiating from center, opacity tied
  to scroll speed (faster scroll = more lines)
- **Dust Clouds:** Particle system at building level, brown/tan, count=500
- **Impact Frames:** At key moments (scroll 40%, 60%), flash white for 1 frame
  (manga-style impact)
- **Camera FOV Shift:** Widen FOV from 60→80 during fast flight for speed feel

#### Scene 6 — Basement FX
- **Darkness:** Very heavy vignette, fog color=#0a0a0a, near=2, far=15
- **Candle Flicker:** PointLight with random intensity oscillation
  (0.8–1.2, frequency=8Hz) + warm color=#ff9944
- **Dust Motes:** Sparse, slow particles, count=50, size=0.02, color=#ffcc88
- **Light Leak:** When door opens (scroll 45%), volumetric light cone from
  doorway (use a cone mesh with additive transparent material)
- **Film Grain:** Increased noise post-processing (opacity=0.15) for
  vintage photo feel

#### Scene 7 — Rumbling FX
- **Screen Shake:** INTENSE, continuous, amplitude=10px, multi-axis
- **Red Sky Gradient:** Custom sky shader — gradient from #1a0000 (zenith)
  to #ff2200 (horizon) to #ff6600 (ground glow)
- **Ember Particles:** Massive count=2000, color=#ff4400, rising upward,
  size=0.1–0.5
- **Heat Distortion:** Custom post-processing shader — UV displacement based
  on noise texture, subtle wave effect
- **Ground Cracks:** Animated texture on ground plane (crack alpha mask
  expanding over time)
- **Bloom:** Max intensity (1.5) for apocalyptic glow
- **Audio Rumble:** Low-frequency rumble SFX, volume tied to scroll progress

### Custom Shader Snippets Needed
1. **Titan Steam Shader:** Vertex displacement + emissive noise for skin steam
2. **Heat Distortion Post-FX:** UV warp using simplex noise
3. **Apocalyptic Sky Shader:** Gradient + noise clouds + red tint
4. **ODM Wire Shader:** Glowing line with distance fade
5. **Crack Propagation Shader:** Alpha mask expansion on ground plane

---

## ═══════════════════════════════════════════════
## SECTION 6: SCENE-BY-SCENE FULL SPECIFICATION
## ═══════════════════════════════════════════════

### SCENE 1 — "The Fall of Shiganshina"
**Scroll:** 0–400vh | **Mood:** Peace → Dread → Catastrophe
**Colors:** #d4a574 (golden) → #666666 (grey) → #cc2200 (blood red)

**Camera Path:**
- Start: pos(0, 10, 80), lookAt(0, 20, 0), fov=60
- Mid: pos(0, 15, 40), lookAt(0, 30, 0), fov=55 (pushing toward gate)
- Colossal: pos(0, 25, 30), lookAt(0, 55, -10), fov=70 (tilt up to face)
- End: pos(0, 10, -5), lookAt(0, 10, -50), fov=65 (through gate)

**Overlay Timeline:**
| Scroll % | Element | Animation |
|----------|---------|-----------|
| 0–10% | Title "ATTACK ON TITAN" | Fade in, y: 20→0, duration 1s |
| 0–10% | Subtitle "進撃の巨人" | Fade in, delay 0.3s |
| 0–10% | Tagline "The Ultimate Archive" | Fade in, delay 0.6s |
| 10–20% | Title group | Fade out |
| 35–50% | Warning flash | White→red overlay, 0.5s |
| 50–70% | Colossal label "THE COLOSSAL TITAN" | Scale 0→1, shake |
| 70–85% | Quote block | Fade in from left, max-w 500px |
| 85–100% | Quote block | Fade out |

**Quote Text:**
> "That day, mankind received a grim reminder. We lived in fear of the Titans
> and were disgraced to live in these cages we called walls."
> — Chapter 1

---

### SCENE 2 — "The Walls"
**Scroll:** 400–900vh | **Mood:** Awe, scale, mystery
**Colors:** #87CEEB (sky blue), #8B8B7A (stone), #4a7c3f (green fields)

**Camera Path:**
- Start: pos(0, 20, 60), lookAt(0, 0, 0), fov=60 (ground level)
- Rise: pos(0, 200, 200), lookAt(0, 0, 0), fov=50 (bird's eye)
- Maria: pos(100, 150, 100), lookAt(0, 0, 0), fov=45 (orbit to Maria)
- Rose: pos(60, 100, 60), lookAt(0, 0, 0), fov=45 (zoom to Rose)
- Sina: pos(30, 60, 30), lookAt(0, 0, 0), fov=40 (zoom to Sina)
- End: pos(0, 250, 0), lookAt(0, 0, 0), fov=55 (top-down overview)

**Overlay Timeline:**
| Scroll % | Element | Animation |
|----------|---------|-----------|
| 0–10% | Section title "THE THREE WALLS" | Fade in, center |
| 20–40% | Wall Maria info card | Slide in from left |
| 40–45% | Maria card | Slide out left |
| 45–65% | Wall Rose info card | Slide in from right |
| 65–70% | Rose card | Slide out right |
| 70–85% | Wall Sina info card | Fade in, center |
| 85–100% | All labels + summary text | Fade in |

**Card Content:**

*Wall Maria Card:*
- Title: WALL MARIA
- Radius: 480km
- Key Districts: Shiganshina (South), Trost (South-East)
- Status: BREACHED — Year 845
- Description: "The outermost wall. Its fall marked the beginning of humanity's darkest era."

*Wall Rose Card:*
- Title: WALL ROSE
- Radius: 380km
- Key Districts: Trost, Krolva, Karanes, Utopia
- Status: COMPROMISED — Year 850
- Description: "The middle wall. Refuge for those who survived the fall of Maria."

*Wall Sina Card:*
- Title: WALL SINA
- Radius: 250km
- Key Districts: Stohess (Capital), Mitras, Ehrmich, Yarckel
- Status: INTACT (Royal Seat)
- Description: "The innermost wall. Home to the royal government and the Military Police."

---

### SCENE 3 — "The Survey Corps"
**Scroll:** 900–1500vh | **Mood:** Heroic, emotional
**Colors:** #1a2744 (navy), #4a7c3f (corps green), #c4956a (warm skin)

**Camera Path:**
- Start: pos(0, 2, 5), lookAt(0, 1.5, 0), fov=50 (ODM gear close-up)
- Eren: pos(-3, 1.5, 4), lookAt(0, 1, 0), fov=45
- Mikasa: pos(3, 1.5, 4), lookAt(0, 1, 0), fov=45
- Levi: pos(0, 2, 3), lookAt(0, 1.2, 0), fov=40 (low angle, heroic)
- Group: pos(0, 5, 12), lookAt(0, 1, 0), fov=55 (wide formation)

**Overlay Timeline:**
| Scroll % | Element | Animation |
|----------|---------|-----------|
| 0–8% | "WINGS OF FREEDOM" title + corps logo | Fade in |
| 10–25% | Eren card | Slide in from left |
| 25–35% | Eren titan toggle | Card morphs (if user clicks) |
| 35–50% | Mikasa card | Slide in from right |
| 50–65% | Levi card | Slide in from left |
| 65–80% | Additional roster thumbnails | Fade in grid |
| 80–95% | Group quote | Fade in center |
| 95–100% | "View Full Roster" CTA | Pulse animation |

**Character Data:**

*Eren Yeager:*
- Affiliation: Survey Corps
- Height: 170cm | Weight: 63kg
- Stats: Combat 8/10, Initiative 10/10, Intellect 6/10, Titan 10/10
- Quote: "I'll keep moving forward until my enemies are destroyed."
- Titan Form: Attack Titan (15m)

*Mikasa Ackerman:*
- Affiliation: Survey Corps
- Height: 176cm | Weight: 68kg
- Stats: Combat 10/10, Initiative 8/10, Intellect 7/10, Titan 0/10
- Quote: "If I can't, then I'll just die. But if I win, I live."

*Levi Ackerman:*
- Affiliation: Survey Corps (Captain)
- Height: 160cm | Weight: 65kg
- Stats: Combat 10/10, Initiative 9/10, Intellect 8/10, Titan 0/10
- Quote: "The only thing we're allowed to do is believe that we won't regret the choice we made."

---

### SCENE 4 — "The Titans"
**Scroll:** 1500–2000vh | **Mood:** Horror, scale, unease
**Colors:** #3a4a2a (murky green), #8B7355 (sickly brown), #ff4400 (eye glow)

**Camera Path:**
- Start: pos(0, 1.7, 20), lookAt(0, 5, 0), fov=60 (human eye level, fog)
- Pure: pos(0, 1.7, 10), lookAt(0, 4, 0), fov=65 (titans approach)
- Abnormal: pos(5, 1, 5), lookAt(-3, 2, 0), fov=70 (low, tilted)
- Nine: pos(0, 10, 30), lookAt(0, 10, 0), fov=50 (wide, all nine)
- Colossal: pos(0, 5, 15), lookAt(0, 40, 0), fov=80 (extreme tilt up)

**Overlay Timeline:**
| Scroll % | Element | Animation |
|----------|---------|-----------|
| 0–10% | "THE TITANS" title | Fade in, glitch effect |
| 15–30% | "Pure Titans" label + desc | Fade in left |
| 35–45% | "ABNORMAL" warning | Flash red, shake |
| 50–75% | Nine Titans grid | Stagger fade in (3x3 grid) |
| 80–90% | Size comparison chart | Animate bars growing |
| 90–100% | Colossal label | Scale up dramatically |

**Nine Titans Data:**
| Titan | Height | Current Holder | Ability |
|-------|--------|---------------|---------|
| Founding | 13m | Eren Yeager | Coordinate, memory manipulation |
| Attack | 15m | Eren Yeager | Future memory inheritance |
| Colossal | 60m | Armin Arlert | Explosive transformation, steam |
| Armored | 15m | Reiner Braun | Hardened armor plating |
| Female | 14m | Annie Leonhart | Crystallization, adaptive |
| Beast | 17m | Zeke Yeager | Throwing, spinal fluid control |
| Jaw | 5m | Falco Grice | Crushing jaw, speed |
| Cart | 4m | Pieck Finger | Endurance, quadrupedal |
| War Hammer | 15m | Eren Yeager | Structural hardening |

---

### SCENE 5 — "The Battle of Trost"
**Scroll:** 2000–2400vh | **Mood:** Adrenaline, chaos
**Colors:** #d4874a (dusty orange), #666666 (smoke), #cc2200 (blood)

**Camera Path:**
- Start: pos(5, 15, 5), lookAt(0, 10, -20), fov=60 (rooftop launch)
- Flight: pos(0, 12, -30), lookAt(0, 8, -60), fov=75 (weaving)
- Near-miss: pos(-2, 8, -50), lookAt(3, 10, -55), fov=80 (titan grab)
- Wide: pos(0, 40, -30), lookAt(0, 0, -50), fov=50 (battle overview)
- Boulder: pos(0, 5, -70), lookAt(0, 8, -80), fov=55 (Eren + boulder)

**Overlay Timeline:**
| Scroll % | Element | Animation |
|----------|---------|-----------|
| 0–10% | "BATTLE OF TROST" title | Slam in, shake |
| 15–25% | Speed indicator "142 km/h" | Pin to 3D position |
| 30–40% | "Titan Kill #1" callout | Pin to titan, flash |
| 50–60% | Battle stats overlay | Count-up animation |
| 70–80% | "Eren's first transformation" | Dramatic text |
| 85–95% | Boulder quote | Slow fade, serif |

**Battle Stats:**
- Titans Engaged: 62
- Survey Corps Casualties: 208
- Civilians Evacuated: ~300,000
- Outcome: First human victory

**Boulder Quote:**
> "I'll close the gate... no matter what it takes."
> The first human victory against the Titans.

---

### SCENE 6 — "The Basement"
**Scroll:** 2400–2800vh | **Mood:** Tension, mystery, revelation
**Colors:** #0a0a0a (black) → #ff9944 (candle amber) → #ffffff (white reveal)

**Camera Path:**
- Start: pos(0, 3, 5), lookAt(0, 1, 0), fov=50 (top of stairs)
- Descent: pos(0, 1, 2), lookAt(0, 0, -3), fov=45 (mid-stairs)
- Door: pos(0, 1.5, 0.5), lookAt(0, 1.5, -1), fov=40 (close on door)
- Enter: pos(0, 1.5, -2), lookAt(0, 1.5, -5), fov=50 (inside room)
- Photo: pos(0, 1.6, -4), lookAt(0, 1.6, -5), fov=35 (close on photo)

**Overlay Timeline:**
| Scroll % | Element | Animation |
|----------|---------|-----------|
| 0–15% | "The key..." | Flicker in, small, center |
| 20–35% | "GRISHA'S BASEMENT" | Fade in, warm color |
| 40–55% | Door opening text | "The truth lies beyond..." |
| 60–75% | Lore cards (Marley + Eldia) | Float in from sides |
| 80–90% | Photo reveal | Full-screen fade |
| 90–100% | "The world beyond the walls..." | Slow fade |

**Lore Content:**

*Marley Card:*
- Title: MARLEY
- Description: "A nation across the sea that rose to power by subjugating Eldians and weaponizing seven of the Nine Titans. For centuries, they oppressed the Eldian people both within their borders and on Paradis Island."

*Eldia Card:*
- Title: ELDIA
- Description: "An ancient empire that once ruled the world through the Power of the Titans. The Eldian people, descendants of Ymir Fritz, carry the ability to transform into Titans. Feared and hated by the world."

*Photo Reveal Text:*
> "This is not a drawing. This is a photograph. The world beyond the walls is not empty. Humanity lives on... and they want us dead."

---

### SCENE 7 — "The Rumbling"
**Scroll:** 2800–3200vh | **Mood:** Apocalyptic, overwhelming, final
**Colors:** #1a0000 (dark red) → #ff2200 (fire) → #ff6600 (orange) → #000000 (black)

**Camera Path:**
- Start: pos(0, 20, 50), lookAt(0, 30, 0), fov=60 (walls crumbling)
- Reveal: pos(0, 50, 100), lookAt(0, 20, -100), fov=70 (thousands marching)
- Head-on: pos(0, 10, 20), lookAt(0, 30, -50), fov=80 (facing the march)
- Horizon: pos(0, 100, 0), lookAt(0, 0, -200), fov=90 (endless line)
- End: pos(0, 5, 0), lookAt(0, 5, -10), fov=60 (fade to black)

**Overlay Timeline:**
| Scroll % | Element | Animation |
|----------|---------|-----------|
| 0–15% | "THE RUMBLING" title | Slam in, massive, shake |
| 20–40% | Scale text "60,000,000 Colossal Titans" | Count-up |
| 40–60% | Eren monologue | Typewriter effect |
| 65–80% | "Shinzou wo Sasageyo" | Fade in, huge, center |
| 85–95% | Fade to black | — |
| 95–100% | CTA + footer | Fade in from black |

**Eren Monologue:**
> "I will keep moving forward. Until my enemies are destroyed. I was born into this world. I am free."

**CTA Section:**
- Primary: "Explore the Full Archive" → links to lore section
- Secondary: "Join the Community" → links to Discord/forum
- Footer: About | Credits | Privacy | © 2024 AoT Archive — Fan Project

---

## ═══════════════════════════════════════════════
## SECTION 7: CONTENT & COPY (ALL SECTIONS)
## ═══════════════════════════════════════════════

### Navbar
- Logo: "AoT ARCHIVE" (or Wings of Freedom icon)
- Links: Lore | Characters | Titans | Map | Episodes | Community
- Sound toggle icon (speaker)

### Loading Screen
- Text: "Dedicating your hearts..." (progress bar below)
- Subtext: "Loading 3D assets — {progress}%"

### Scroll Hint (bottom, first 5% of scroll)
- Text: "↓ Scroll to begin"
- Animation: Gentle bounce

### Scene Transition Texts (between scenes, brief flashes)
- Scene 1→2: "Behind the walls..."
- Scene 2→3: "Those who fight..."
- Scene 3→4: "The enemy..."
- Scene 4→5: "The first battle..."
- Scene 5→6: "The truth..."
- Scene 6→7: "The end of the world..."

### Non-3D Section Copy

*Interactive Map:*
- Title: "THE WORLD OF ATTACK ON TITAN"
- Subtitle: "Explore Paradis Island and the continent of Marley"
- Instructions: "Click on any location to learn more"

*Episode Guide:*
- Title: "EPISODE ARCHIVE"
- Subtitle: "All 87 episodes across 4 seasons"
- Seasons: Season 1 (25 eps) | Season 2 (12 eps) | Season 3 (22 eps) | Season 4 (28 eps)

*Soundtrack Player:*
- Title: "THE SOUND OF WAR"
- Subtitle: "Music by Hiroyuki Sawano"
- Featured Tracks: "Guren no Yumiya", "Jiyuu no Tsubasa", "Sasageyo!", "Vogel im Käfig", "YouSeeBIGGIRL", "The Rumbling"

*Community:*
- Title: "JOIN THE SURVEY CORPS"
- Subtitle: "Connect with fellow fans"
- CTA: "Join our Discord" | "Follow on Twitter" | "Reddit Community"

---

## ═══════════════════════════════════════════════
## SECTION 8: IMAGE & 2D ASSET GENERATION PROMPTS
## ═══════════════════════════════════════════════

Use these prompts in Midjourney, DALL-E 3, or Stable Diffusion to generate
2D assets needed for the site.

### HDR Sky Environments
1. **Golden Hour Sky (Scene 1 start):**
   "Equirectangular HDR panorama, golden hour sunset sky over medieval walled
   city, warm orange and pink clouds, peaceful atmosphere, photorealistic,
   8K resolution, 360 degree"

2. **Apocalyptic Red Sky (Scene 7):**
   "Equirectangular HDR panorama, apocalyptic blood red sky, dark storm clouds,
   fire glow on horizon, volcanic ash particles, dramatic, cinematic,
   photorealistic, 8K, 360 degree"

3. **Dark Basement (Scene 6):**
   "Equirectangular panorama, pitch black underground stone cellar, single
   warm candle light source, dust particles in light beam, moody, dark,
   photorealistic"

### UI / Overlay Assets
4. **Wings of Freedom Logo:**
   "Attack on Titan Survey Corps Wings of Freedom logo, clean vector style,
   white and blue overlapping wings, transparent background, high resolution,
   minimalist"

5. **Wall Texture (Seamless):**
   "Seamless tileable texture, ancient stone wall, weathered grey-brown,
   medieval fortress, PBR material, 4K resolution, top-down view"

6. **Titan Skin Texture:**
   "Seamless tileable texture, muscular human skin without epidermis,
   red muscle fibers, anatomical, dark, grotesque, 2K resolution,
   for 3D material"

7. **Old Photograph (Basement):**
   "Vintage sepia photograph, early 1900s style, family portrait of three
   people standing in front of a building, slightly damaged edges, faded,
   realistic, mysterious"

8. **Parchment/Journal Page:**
   "Aged parchment paper texture, hand-drawn sketches of titans in margins,
   handwritten text in German-style script, coffee stains, worn edges,
   top-down view, high resolution"

9. **Impact Frame (Manga Style):**
   "Manga-style impact frame, black and white speed lines radiating from
   center, dramatic action lines, high contrast, transparent center,
   vector style, 4K"

10. **Fire/Ember Particle Sprite:**
    "Single glowing ember particle sprite, orange-red gradient, soft glow,
    transparent background, circular, 64x64px, for game engine"

### Background Illustrations (for non-3D sections)
11. **Map Background:**
    "Fantasy cartographic map of a circular island with three concentric
    walls, medieval style, parchment texture, compass rose, sea monsters
    in the ocean, hand-drawn aesthetic, warm tones, top-down view"

12. **Episode Guide Header:**
    "Cinematic wide shot of Survey Corps soldiers standing on a wall at
    sunset, capes flowing, dramatic clouds, anime art style, widescreen
    16:9, high detail"

---

## ═══════════════════════════════════════════════
## SECTION 9: NON-3D SECTIONS SPECIFICATION
## ═══════════════════════════════════════════════

These sections appear AFTER the 3200vh scrollytelling stage, in normal
document flow (not sticky).

### Interactive Map
- **Layout:** Full-width, min-height 80vh
- **Tech:** SVG-based or Leaflet.js with custom tile layer
- **Features:**
  - Clickable districts (Shiganshina, Trost, Stohess, etc.)
  - Hover tooltips with district info
  - Toggle between Paradis Island and Marley views
  - Animated path of key events (Fall of Maria → Trost → Expedition → etc.)
- **Style:** Parchment texture background, hand-drawn aesthetic

### Episode Guide
- **Layout:** Grid of season cards → expandable episode lists
- **Features:**
  - Season tabs (1–4)
  - Episode cards with thumbnail, title, air date, rating
  - Expandable synopsis
  - "Key Moments" tags for important episodes
- **Data Source:** Static JSON file with episode metadata

### Soundtrack Player
- **Layout:** Horizontal scrolling card carousel
- **Features:**
  - Album art for each track
  - Play/pause (embed YouTube/SoundCloud iframe or use Howler.js)
  - Track info: title, composer, episode/scene association
  - Visualizer animation (CSS bars) when playing

### Community
- **Layout:** 3-column card grid
- **Cards:** Discord embed, Twitter feed, Reddit link
- **CTA:** "Dedicate Your Heart — Join Us"

---

## ═══════════════════════════════════════════════
## SECTION 10: PERFORMANCE & OPTIMIZATION
## ═══════════════════════════════════════════════

### Hard Targets
- **LCP:** < 2.5s (loading screen covers 3D init)
- **FPS:** 60fps on desktop (GTX 1060+), 30fps minimum on mid-range
- **Bundle Size:** < 500KB initial JS (lazy-load 3D scenes)
- **Asset Size:** < 20MB total 3D assets (Draco + KTX2)

### Strategies
1. **Progressive Loading:**
   - Load Scene 1 assets first, show loading screen
   - Lazy-load Scenes 2–7 as user scrolls (prefetch next scene at 80% of current)
   - Use React.lazy() + Suspense for scene components

2. **LOD (Level of Detail):**
   - 3 LOD levels per model: high (< 20m from camera), mid (20–50m), low (50m+)
   - Use drei `<Detailed>` component or Three.js LOD class

3. **Instancing:**
   - Rumbling scene: InstancedMesh for 100 Colossal Titans (1 draw call)
   - Buildings: InstancedMesh for city blocks
   - Debris: InstancedMesh for rock fragments

4. **Texture Optimization:**
   - KTX2/Basis Universal compression (70–90% size reduction)
   - Use drei `<useKTX2>` loader
   - Mipmapping enabled on all textures

5. **Render Optimization:**
   - `frameloop="demand"` on Canvas when not scrolling (saves GPU)
   - Reduce pixel ratio on mobile: `dpr={[1, 1.5]}`
   - Disable shadows on mobile
   - Use `<BakeShadows>` for static scenes

6. **Memory Management:**
   - Dispose geometries, materials, textures when scene unmounts
   - Use `useEffect` cleanup functions
   - Monitor with Three.js `renderer.info`

7. **Scroll Performance:**
   - Lenis smooth scroll (prevents jank)
   - GSAP `scrub: 1` (smoothed interpolation, not 1:1)
   - Throttle scroll events to rAF
   - Use `will-change: transform` on overlay elements

---

## ═══════════════════════════════════════════════
## SECTION 11: RESPONSIVE STRATEGY
## ═══════════════════════════════════════════════

### Breakpoints
- **Desktop:** > 1024px → Full 3D experience
- **Tablet:** 768–1024px → Reduced 3D (fewer particles, lower LOD, no DOF)
- **Mobile:** < 768px → **2D parallax fallback** (see below)

### Mobile Fallback (CRITICAL)
On mobile devices (detect via `window.innerWidth < 768` or GPU tier check):
- Replace 3D Canvas with **CSS parallax layers** using background images
- Each scene = a full-screen background image with parallax depth
- Overlay text animates the same way (GSAP ScrollTrigger still works)
- Use the AI-generated images from Section 8 as parallax layers
- This ensures the site works on ALL devices without killing battery/FPS

### Responsive Overlay Adjustments
- Desktop: Cards at 320–360px width, positioned at edges
- Tablet: Cards at 280px, centered bottom
- Mobile: Cards at 90vw, stacked vertically, larger text

### Touch Considerations
- Disable orbit controls on mobile (scroll only)
- Increase touch target sizes for interactive elements (min 44px)
- Add swipe hint instead of scroll hint on mobile

---

## ═══════════════════════════════════════════════
## SECTION 12: BUILD ORDER & PRIORITIES
## ═══════════════════════════════════════════════

### Phase 1: Foundation (Week 1)
- [ ] Set up Next.js + R3F + GSAP + Lenis + Tailwind
- [ ] Build sticky scroll stage shell (Canvas + Overlay + Spacer)
- [ ] Implement global scroll progress tracking (Zustand)
- [ ] Create CameraController driven by scroll %
- [ ] Build loading screen with progress bar
- [ ] Verify smooth scroll + 3D sync at 60fps

### Phase 2: Scene 1 Prototype (Week 2)
- [ ] Model/import Wall Maria gate + Colossal Titan head
- [ ] Set up Scene 1 camera path
- [ ] Add overlay text animations (title, quote)
- [ ] Add FX: dust particles, fog, screen shake, flash
- [ ] Test scroll scrub feel — iterate on timing

### Phase 3: Scenes 2–4 (Weeks 3–4)
- [ ] Build Scene 2 (Walls) — concentric rings, info cards
- [ ] Build Scene 3 (Characters) — 3 character models, cards, stats
- [ ] Build Scene 4 (Titans) — titan models, grid, size chart
- [ ] Add scene transition effects between each

### Phase 4: Scenes 5–7 (Weeks 5–6)
- [ ] Build Scene 5 (Trost) — city, flight path, action FX
- [ ] Build Scene 6 (Basement) — staircase, room, reveal
- [ ] Build Scene 7 (Rumbling) — instanced titans, apocalyptic FX
- [ ] Add finale CTA + footer

### Phase 5: Non-3D Sections (Week 7)
- [ ] Build Interactive Map
- [ ] Build Episode Guide
- [ ] Build Soundtrack Player
- [ ] Build Community section

### Phase 6: Polish & Optimize (Week 8)
- [ ] Add mobile parallax fallback
- [ ] Optimize all 3D assets (Draco, KTX2, LOD)
- [ ] Performance audit (Lighthouse, FPS profiling)
- [ ] Add ambient audio (optional)
- [ ] Cross-browser testing
- [ ] SEO meta tags, Open Graph images
- [ ] Deploy to Vercel

---

## ═══════════════════════════════════════════════
## FINAL INSTRUCTIONS FOR THE AI / DEVELOPER
## ═══════════════════════════════════════════════

1. **Start with Phase 1.** Do not attempt to build all scenes at once.
   Get the scroll-to-3D pipeline working with a single cube first.

2. **Use the scroll ranges from Section 3** as the source of truth for
   all GSAP ScrollTrigger configurations.

3. **Follow the camera paths from Section 6** exactly for each scene.
   Interpolate between keyframes using GSAP's `gsap.to()` with `scrub: true`.

4. **Apply the FX specs from Section 5** per scene. Start with fog and
   particles (cheap), add post-processing last (expensive).

5. **Use the content/copy from Section 7** verbatim for all overlay text.

6. **Generate 2D assets using the prompts in Section 8** via Midjourney
   or DALL-E 3. Convert sky images to equirectangular HDR for Three.js
   Environment maps.

7. **Follow the 3D asset guidelines in Section 4** for all models.
   Prioritize Draco compression and LOD.

8. **Implement the mobile fallback from Section 11** before launch.
   The 3D experience is desktop-first.

9. **Reference the wireframe layouts** from the earlier conversation
   (Scenes 1–7 ASCII wireframes) for overlay positioning.

10. **This prompt is the single source of truth.** If there's a conflict
    between this prompt and other instructions, this prompt wins.

---

*Shinzou wo Sasageyo. Build something legendary.* 🗡️
```

