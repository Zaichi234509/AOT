# Image drop-in

Two kinds of artwork ship in this archive:

1. **Procedural plates** — the character cards (`CharacterGlyph`), the titan card
   posters and gallery plates (`ScenePoster`) and the world map are drawn in the
   browser, so the list views stay sharp, weightless and free of licensed assets.
2. **Real stills** — the **character profile modal** and the **titan bestiary modal**
   now show actual Anime stills instead of a link out to an image search.

## Folders

| Folder | Used by | Files |
|---|---|---|
| `characters/` | `CharacterEncyclopedia` modal (`characters.json` → `image`) | 18 × 720×900 JPEG |
| `titans/` | `TitanBestiary` modal (`titans.json` → `image`) | 9 × 1280×720 JPEG |

Both sets are normalised (cover-cropped to 4:5 for people, 16:9 for titans, sRGB,
stripped metadata, progressive JPEG ≈60–190 kB each) so the modal never shifts
layout and nothing needs runtime resizing.

Other folders (`gallery/`, `map/`, `episodes/`) are still empty by design — those
surfaces remain procedural.

## Replacing a still

Drop a new file at the same path in `public/images/characters/` or
`public/images/titans/` (any aspect ratio works — the modal uses `object-cover`),
or point the `image` field in `src/data/characters.json` / `src/data/titans.json`
at a different path. Nothing else has to change.

```bash
# example: normalise a replacement portrait to the standard 4:5 frame
convert my-photo.png -resize 720x900^ -gravity north -extent 720x900 \
  -strip -interlace Plane -quality 82 public/images/characters/eren-yeager.jpg
```

## Licensing

These stills are the property of Hajime Isayama, Kodansha, Wit Studio and MAPPA.
They are bundled for a non-commercial fan archive; replace or remove them before
using this repository commercially.
