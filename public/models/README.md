# 3D model drop-in

The scrollytelling scenes are built from procedural Three.js primitives, with
authored `.glb` upgrades for the hero characters and titans. The seven shipped
models live in this folder and are tracked by Git, so a clean checkout renders
the full cast with **no `.env` setup**.

`src/lib/models.ts` resolves a slot to `${NEXT_PUBLIC_MODELS_BASE_URL ?? '/models'}/<file>`.
Set `NEXT_PUBLIC_MODELS_BASE_URL` to a CDN to serve the same files remotely;
per-slot `NEXT_PUBLIC_MODEL_*_URL` overrides are still available.

## Shipped models

| Slot | File | Replaces | Height | Clips driven by scroll | Scenes |
|---|---|---|---|---|---|
| `colossal-titan-head` | `colossal-titan-full.glb` | Colossal Titan breach close-up | 60 m | — | 1 |
| `eren-yeager` | `eren-yeager.glb` | `CorpsFigure` | 1.7 m | — | 3 |
| `mikasa-ackerman` | `mikasa-ackerman.glb` | `CorpsFigure` | 1.7 m | — | 3 |
| `levi-ackerman` | `levi-ackerman.glb` | `CorpsFigure` | 1.6 m | — | 3 |
| `attack-titan` | `attack-titan.glb` | `TitanBody variant="attack"` | 15 m | — | 3, 4, 5 |
| `colossal-titan-full` | `colossal-titan-full.glb` | `TitanBody variant="colossal"` | 60 m | — | 1, 4, 7 |
| `female-titan` | `female-titan.glb` | `TitanBody` female silhouette | 14 m | — | 4 |
| `trost-district` | `trost-district.glb` | distant Trost wall ring | 60 m | — | 5 |

The Female Titan ships one authored clip, but it only animates fingers and a
toe, so the registry leaves `clips` empty and the model stands in its rest pose.

`colossal-titan-head` and `colossal-titan-full` deliberately share one file:
the close-up and the horizon shot use the same Colossal Titan asset, while the
loader/cache sees one URL.

Slots without a shipped file (`wall-maria-gate`, `odm-gear`, `pure-titan`,
`trost-building`, `boulder`, `basement-room`) remain procedural. Adding a model
to one of those slots only needs the file and `shipped: true` in the registry.

## Slot behaviour

See `src/components/scrollytelling/three/ModelSlot.tsx`.

* each slot renders **its own** procedural component while the glb loads and if
  the glb fails — a broken asset degrades one object, not the Stage;
* the glTF scene is cloned with `SkeletonUtils.clone`, so one rigged/skinned
  asset can appear in several slots without bones being stolen by the first
  instance;
* the *posed* `THREE.Box3` is measured after cloning, the model is scaled
  uniformly to `MODEL_SLOTS[slot].height` (or a `targetHeight` prop override),
  centred on X/Z, and its lowest vertex is placed exactly on `y = 0`;
* a slot can carry local-space bone corrections in `MODEL_SLOTS[slot].pose`
  (Levi's T-pose rig is relaxed into a combat stance this way);
* materials get sane shadow/env-map defaults, and an optional per-slot material
  override handles untextured assets such as the Trost wall;
* only the active scene and the next one are mounted/preloaded; phones
  (<768 px) and browsers without WebGL render `MobileStage` and never request a
  model.

## Optimisation pipeline

The source files are Sketchfab exports with arbitrary units and 4K-ish PNG
textures. They are re-encoded with [glTF Transform](https://gltf-transform.dev)
to keep the page fast:

```bash
npx gltf-transform optimize <source.glb> public/models/<slot>.glb \
  --compress draco \
  --texture-compress webp \
  --texture-size 1024 \
  --simplify-ratio 0.5 \
  --simplify-error 0.001 \
  --flatten false --join false --palette false --instance false
```

`--flatten false` and `--join false` matter for this cast: flattening the
Sketchfab scene graph can bake rotations into mesh nodes and leave a character
lying on its back, while joining can disturb skin bindings. The result is
Draco geometry + WebP textures, roughly 3.5 MB for all seven models (the
unoptimised originals were ~40 MB).

Draco decoder files are bundled in [`public/draco/`](../draco/) from three.js
r169, so local loading has no CDN dependency. `DRACO_DECODER_PATH` defaults to
`/draco/`; override it only if the decoder is hosted elsewhere.

## Licence register

All seven models are licensed **CC BY 4.0**. Attribution is reproduced here and
in the site footer. If you replace a model, record its source and licence here
first.

| File | Title | Author | Source | Licence |
|---|---|---|---|---|
| `eren-yeager.glb` | Aotwa Eren Yeager | Prime Slayer3D ([@ianadrielbravo](https://sketchfab.com/ianadrielbravo)) | [Sketchfab](https://sketchfab.com/3d-models/aotwa-eren-yeager-8c37798e8cfc4527a1b820b53d0b03b4) | CC BY 4.0 |
| `mikasa-ackerman.glb` | Fanny (Mikasa Skin) - MLBB | Kenny3D89 ([@Kenny3D89](https://sketchfab.com/Kenny3D89)) | [Sketchfab](https://sketchfab.com/3d-models/fanny-mikasa-skin-mlbb-50fc367d7faf40ebaf40d7114839c4eb) | CC BY 4.0 |
| `levi-ackerman.glb` | Levi Ackerman rig | Prime Slayer3D ([@ianadrielbravo](https://sketchfab.com/ianadrielbravo)) | [Sketchfab](https://sketchfab.com/3d-models/levi-ackerman-rig-01ffa989559941ef807cc07b3fed40b8) | CC BY 4.0 |
| `attack-titan.glb` | Eren Jaeger (Attack Titan form) | fectur.SEROD ([@Fecturisio](https://sketchfab.com/Fecturisio)) | [Sketchfab](https://sketchfab.com/3d-models/eren-jaeger-attack-titan-form-d1724e3f9d68424caeb23a1fd47b6468) | CC BY 4.0 |
| `colossal-titan-full.glb` | Colossal Titan | Sidaivan ([@Sidaivan](https://sketchfab.com/Sidaivan)) | [Sketchfab](https://sketchfab.com/3d-models/colossal-titan-e031a57fd4bf411f8e893361676b4544) | CC BY 4.0 |
| `female-titan.glb` | Female Titan (my version) | stevendwisetya ([@stevendwisetya28](https://sketchfab.com/stevendwisetya28)) | [Sketchfab](https://sketchfab.com/3d-models/female-titan-my-version-412c2f5e386f432da5eacb910e03629e) | CC BY 4.0 |
| `trost-district.glb` | Trost District - Shingeki No Kyojin | Khaled.Guesmi ([@Khaled.Guesmi](https://sketchfab.com/Khaled.Guesmi)) | [Sketchfab](https://sketchfab.com/3d-models/trost-district-shingeki-no-kyojin-64a5f1eed2d442f58a3a08254f56db8d) | CC BY 4.0 |

Attack on Titan, its characters and designs are © Hajime Isayama / Kodansha.
This is a non-commercial fan project; the model licences above cover the 3D
assets, not the underlying franchise.
