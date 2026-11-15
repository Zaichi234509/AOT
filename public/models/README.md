# 3D model drop-in

The scrollytelling scenes are built procedurally with Three.js primitives, so the
site ships with **zero** binary assets. If you want to upgrade a scene to
authored geometry, drop Draco-compressed `.glb` files here and swap the
procedural component for `useGLTF('/models/<file>.glb')`.

Expected files (from the master prompt):

- `wall-maria-gate.glb`, `colossal-titan-head.glb`
- `eren-yeager.glb`, `mikasa-ackerman.glb`, `levi-ackerman.glb`, `attack-titan.glb`
- `odm-gear.glb`, `pure-titan.glb`, `colossal-titan-full.glb`
- `trost-building.glb`, `boulder.glb`, `basement-stairs.glb`, `basement-room.glb`

Guidelines: 1 unit = 1 metre, feet at origin for characters, hero meshes
15k–30k tris, Draco + KTX2 compression, total budget under 20 MB.

`.glb` files are git-ignored in this repository on purpose — host them on a CDN
(Vercel Blob / Cloudflare R2) and load them from an absolute URL in production.
