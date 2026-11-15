# 3D model drop-in

The scrollytelling scenes are built procedurally from Three.js primitives, so the
site ships with **zero** binary assets and works with no CDN at all. Authored
geometry is an optional upgrade, per slot, never all-or-nothing.

`.glb` files are git-ignored here on purpose (`/public/models/*.glb`,
`/public/textures/*.ktx2`). Keep them out of git and host them:

* Vercel Blob / Cloudflare R2 / S3 + CloudFront — any static bucket with CORS on
  `GET`, and a long `Cache-Control`.
* Or `public/models/` for local testing only.

## Wiring a model up

1. Export the mesh with: **1 unit = 1 metre**, base/feet at the origin, +Y up,
   facing +Z, hero meshes 15k–30k triangles, Draco or meshopt compressed, total
   budget < 20 MB.
2. Point the registry in [`src/lib/models.ts`](../../src/lib/models.ts) at it,
   either globally:

   ```bash
   NEXT_PUBLIC_MODELS_BASE_URL=https://cdn.example.com/aot-models
   ```

   …in which case a slot resolves to `${BASE}/<slot file>`, or per slot:

   ```bash
   NEXT_PUBLIC_MODEL_ATTACK_TITAN_URL=https://cdn.example.com/aot-models/attack-titan.glb
   ```

   Draco meshes additionally need `NEXT_PUBLIC_DRACO_DECODER_PATH`; meshopt needs
   nothing.
3. Record **source URL and licence** for the asset below. Do not reference a model
   whose licence is not recorded here.

Nothing is configured by default, so `modelUrl()` returns `null` for every slot
and each scene renders its procedural fallback.

## Slots

| Slot | File | Replaces | Height | Clips driven by scroll | Scenes |
|---|---|---|---|---|---|
| `wall-maria-gate` | `wall-maria-gate.glb` | `WallGate` | 50 m | — | 1, 5 |
| `colossal-titan-head` | `colossal-titan-head.glb` | `TitanBody variant="colossal"` | 60 m | `idle`, `steam` | 1 |
| `eren-yeager` | `eren-yeager.glb` | `CorpsFigure` | 1.7 m | `idle`, `stand` | 3 |
| `mikasa-ackerman` | `mikasa-ackerman.glb` | `CorpsFigure` | 1.7 m | `idle`, `stand` | 3 |
| `levi-ackerman` | `levi-ackerman.glb` | `CorpsFigure` | 1.6 m | `idle`, `stand` | 3 |
| `attack-titan` | `attack-titan.glb` | `TitanBody variant="attack"` | 15 m | `idle`, `walk` | 3, 4, 5 |
| `odm-gear` | `odm-gear.glb` | `CorpsFigure` ODM hardware | 0.4 m | — | 3 |
| `pure-titan` | `pure-titan.glb` | `TitanBody variant="pure"` | 7 m | `walk`, `idle` | 4, 5 |
| `colossal-titan-full` | `colossal-titan-full.glb` | `TitanBody variant="colossal"` | 60 m | `walk`, `march` | 7 |
| `trost-building` | `trost-building.glb` | `Building` | 12 m | — | 5 |
| `boulder` | `boulder.glb` | `Boulder` | 18 m | — | 5 |
| `basement-room` | `basement-room.glb` | basement set | 3.6 m | — | 6 |

Slot behaviour (see `src/components/scrollytelling/three/ModelSlot.tsx`):

* each slot renders **its own** procedural component while the glb loads and if
  the glb fails — a broken asset degrades one object, not the Stage;
* if the model has an animation clip matching the slot's clip list, it plays and
  its `time` is scrubbed by that scene's scroll progress;
* only the active scene and the next one are mounted/preloaded;
* phones (<768px) and browsers without WebGL render `MobileStage` and never request
  a model.

## Licence register

Record every model before it is referenced from `src/lib/models.ts`.

| File | Source URL | Author | Licence | Notes |
|---|---|---|---|---|
| _(none shipped)_ | | | | |

Acceptable: CC0, CC-BY (attribution shown in the site footer/credits), or a
written commercial licence. **Not acceptable:** ripped or fan-extracted Attack on
Titan assets, Sketchfab re-uploads of game rips, CC-BY-NC or "editorial use only"
assets. Attack on Titan characters, titans, uniforms and the Walls are
copyrighted designs — as of writing there is no legitimate permissively licensed
model of them, which is why those slots are procedural.
