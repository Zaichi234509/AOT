# Image drop-in

The archive currently renders all artwork procedurally (character plates,
gallery plates, map) so that it ships with no licensed assets and no layout
shift. Real captures can be added here and wired into:

- `src/components/ui/CharacterGlyph.tsx` — replace with `<Image>`
- `src/components/ui/ScenePoster.tsx` — gallery plates
- `src/data/characters.json` — the `image` field is intentionally absent until assets exist

Suggested folders: `characters/`, `titans/`, `gallery/`, `map/`, `episodes/`.
