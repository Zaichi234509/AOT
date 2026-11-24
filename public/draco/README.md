# Draco decoder

These files are copied from three.js r169
(`three/examples/jsm/libs/draco/gltf/`) so the Draco-compressed models in
`public/models/` can decode locally without a CDN.

- `draco_decoder.js` / `draco_decoder.wasm` — WASM decoder
- `draco_wasm_wrapper.js` — browser wrapper

Draco is Apache-2.0. `src/lib/models.ts` points `DRACO_DECODER_PATH` at
`/draco/` by default; override `NEXT_PUBLIC_DRACO_DECODER_PATH` to host it
elsewhere.
