# Audio drop-in

Ambience is synthesised with WebAudio (wind + sub-bass rumble) in
`src/lib/audio.ts`, so no audio files are required. Optional ambience loops
(`wind.mp3`, `rumble.mp3`, `odm-whoosh.mp3`) can be added here and referenced
from the ambience engine.
