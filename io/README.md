# IO

File parsing, binary packing, canvas helpers, and persistent storage. The plumbing that moves data in and out of Perky — from PSD files on disk to spritesheets in memory to resources in IndexedDB.

---

## How it fits together

```
PSD file (binary)
    │
    ├── BinaryReader ──► psd.js (parse layers + tree)
    │                        │
    │                   PsdConverter (orchestrator)
    │                        │
    │                   spritesheet.js (frames → atlas)
    │                        │
    │                   canvas.js (pixel ops, resize)
    │
    ▼
pack.js (compress into .perky blob)
    │
    ▼
PerkyStore (IndexedDB)
    │
    ▼
manifest_patcher.js ──► Game manifest (live overrides)
```

The typical flow: a PSD is parsed, converted into spritesheets, packed into a compressed blob, saved to IndexedDB via PerkyStore, and later patched into the game manifest at runtime.

---

## The files that matter

### [psd.js](psd.js)

Photoshop file parser. Reads the binary format, extracts layers with pixel data, and builds a tree of groups and layers. Also detects ICC color profiles.

```js
import {parsePsd, layerToRGBA} from './psd.js'

const psd = parsePsd(new Uint8Array(buffer))
psd.width         // 512
psd.colorProfile  // {name: 'sRGB', isP3: false}
psd.tree          // [{type: 'group', name: 'anim - idle', children: [...]}]

const rgba = layerToRGBA(layer, psd.width, psd.height)
rgba.pixels  // Uint8Array of RGBA data
```

---

### [psd_converter.js](psd_converter.js)

Orchestrates the full PSD-to-spritesheet pipeline. Parses, extracts frames, resizes, packs into atlases, builds JSON metadata. Emits progress events.

```js
const converter = new PsdConverter()

converter.on('progress', ({stage, percent}) => {
    // 'extracting' → 'resizing' → 'packing' → 'compositing' → 'complete'
})

const result = await converter.convert(psd, {
    targetWidth: 256,
    name: 'hero'
})

result.atlases          // [{canvas, frames, finalHeight}]
result.spritesheetJson  // atlas JSON data
result.animatorConfig   // animation config for the game
```

---

### [spritesheet.js](spritesheet.js)

The frame extraction and atlas packing logic used by PsdConverter. Finds animation groups in a PSD tree, extracts frames, resizes them, packs into atlases using shelf packing, and composites the final images.

```js
import {findAnimationGroups, extractFramesFromGroup, packFramesIntoAtlases} from './spritesheet.js'

const groups = findAnimationGroups(psd.tree)
const frames = extractFramesFromGroup(groups[0], psd.width, psd.height)
const atlases = packFramesIntoAtlases(frames)
```

Animation groups are PSD groups named `anim - idle`, `anim - run`, etc. Frame layers are numbered (`1`, `2`, `3`...).

---

### [perky_store.js](perky_store.js)

IndexedDB wrapper for persistent resource storage. Each resource is a packed blob with metadata. Used by Studio to save custom assets.

```js
const store = new PerkyStore()

await store.save('playerAnimator', {
    type: 'animator',
    name: 'player',
    files: [{name: 'playerAnimator.json', blob}, ...]
})

const resource = await store.get('playerAnimator')
resource.files  // [{name, blob}, ...]

await store.export('playerAnimator')  // downloads .perky file
await store.import(file)              // imports from .perky file

const animators = await store.list('animator')
```

---

### [pack.js](pack.js)

Binary file packing with gzip compression. This is what powers the `.perky` file format — a header with file metadata followed by concatenated blobs.

```js
import {pack, unpack} from './pack.js'

const blob = await pack([
    {name: 'data.json', blob: jsonBlob},
    {name: 'atlas.png', blob: pngBlob}
])

const files = await unpack(blob)
// [{name: 'data.json', blob}, {name: 'atlas.png', blob}]
```

---

### [manifest_patcher.js](manifest_patcher.js)

Bridges Studio and the game. Loads custom assets from IndexedDB and patches them into the game manifest so they override the built-in versions.

```js
import {loadStudioOverrides, applyOverrides} from './manifest_patcher.js'

const overrides = await loadStudioOverrides()
const patchedManifest = applyOverrides(originalManifest, overrides)
```

Used by games that support the `?studio` URL parameter.

---

### [canvas.js](canvas.js)

Canvas utilities that work in both browser and Node.js. Handles canvas creation, pixel writing, resizing, and blob conversion.

```js
import {createCanvas, putPixels, resizeCanvas, canvasToBlob} from './canvas.js'

const canvas = await createCanvas(256, 256)
const ctx = canvas.getContext('2d')
putPixels(ctx, {pixels: rgbaData, width: 256, height: 256})

const resized = await resizeCanvas(canvas, 128, 128, true)  // nearest-neighbor
const blob = await canvasToBlob(resized)
```

---

### [binary_reader.js](binary_reader.js)

Sequential binary data reader. Wraps an ArrayBuffer and provides typed reads (uint8, int16, float32, strings, etc.). Used internally by the PSD parser.

---

## Going further

Each file has its `.test.js` with tests. The PSD pipeline is the most complex part — start with `psd_converter.js` if you want to understand the full flow.
