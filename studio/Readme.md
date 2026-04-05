# Studio

A companion app that ships with your game. Open `./studio/index.html` from the game's root and edit assets live. Designed for iPad, works on desktop.

> **Work in progress.** Currently focused on sprite animation. More tools coming.

---

## How it connects to the game

```
Game (den/)                          Studio (studio/)
    │                                     │
    ├── manifest.json ──────────────────► loads manifest
    │                                     ├── builds TextureSystem
    │                                     ├── collects animators + scenes
    │                                     └── renders hub
    │
    │   ?studio URL param
    ├──────────────────► loadStudioOverrides()
    │                    patches manifest with custom assets
    │                    from IndexedDB (PerkyStore)
    │
    └── devtools ──► ToolManager
                     └── SpriteAnimatorTool (in-game preview)
```

Studio reads the game's manifest, lets you edit assets, and saves changes to IndexedDB. Next time the game loads with `?studio`, it patches those changes into the manifest. The game sees your custom assets as if they were built-in.

---

## The flow

**Hub** (`index.html`) — gallery of all animators and scenes. Shows game animators and custom ones. Import PSDs, export `.perky` files, detect conflicts when both versions changed.

**Animator** (`animator/index.html`) — full editor for a single animator. Timeline, frame editing, anchor points, motion preview, auto-save.

**Scene** (`scene/index.html`) — visual scene editor. Place and arrange entities, edit transforms, preview with camera framing.

**Spritesheet exporter** (`spritesheet/index.html`) — standalone PSD to spritesheet converter. No storage, just download PNG + JSON.

---

## How it fits together

```
EditorComponent (from editor/)
    ↓
┌────────────────────────────────────────┐
│  HubView           animator + scene gallery │
│  AnimatorView      animation editor      │
│  SceneView         scene editor          │
│  AssetBrowserView  asset browser         │
│  PsdImporter       PSD import wizard     │
│  ConflictResolver  version conflicts     │
│  StorageInfo       storage usage widget  │
└────────────────────────────────────────┘

animator/
    ├── animator_view.js      main editor layout
    ├── animator_preview.js   WebGL preview with motion
    ├── animator_helpers.js   serialization utilities
    └── components/
        ├── frame_editor.js         duration + events per frame
        ├── anchor_editor.js        visual anchor drag
        └── animation_settings.js   name, motion, direction

components/
    ├── psd_importer.js       drop → preview → convert
    ├── conflict_resolver.js  custom vs game version picker
    └── storage_info.js       IndexedDB usage popover

assets/
    └── asset_browser_view.js searchable asset grid
```

---

## Storage and versions

Everything goes through **PerkyStore** (IndexedDB wrapper from `io/`).

Each custom animator is stored as a resource with files:

```
{id: "playerAnimator", type: "animator", name: "player", updatedAt, files: [...]}
    ├── playerAnimator.json       animation config
    ├── playerSpritesheet.json    atlas data
    └── playerSpritesheet_0.png   atlas image(s)
```

Version states:
- **Synced** — custom matches game version, auto-cleaned
- **Modified** — custom is newer, badge shown in hub
- **Conflict** — both changed independently, resolver dialog
- **Custom only** — no game version, "New" badge

---

## Plugging studio into a game

```js
import {applyOverrides, loadStudioOverrides} from '../io/manifest_patcher.js'

const params = new URLSearchParams(window.location.search)
if (params.has('studio')) {
    const overrides = await loadStudioOverrides()
    if (overrides.length > 0) {
        spawnOptions.manifest = applyOverrides(manifestData, overrides)
    }
}
```

That's the only game-side wiring needed. Studio handles the rest.

---

## The .perky file format

A zip archive containing animator config + spritesheet data + atlas PNGs. Used for import/export between projects or sharing with others.

---

## Key files

- [index.js](index.js) — hub entry point
- [launcher.js](launcher.js) — shared utilities: load manifest, build textures, collect animators + scenes
- [hub_view.js](hub_view.js) — gallery grid with import/export/conflict management
- [studio_tool.js](studio_tool.js) — base class for tool views with auto-save, keyboard bindings, and layout
- [animator/animator_view.js](animator/animator_view.js) — the full animation editor
- [animator/animator_preview.js](animator/animator_preview.js) — WebGL preview with motion simulation
- [animator/components/](animator/components/) — frame editor, anchor editor, animation settings
- [components/psd_importer.js](components/psd_importer.js) — PSD import wizard
- [scene/scene_view.js](scene/scene_view.js) — visual scene editor
- [spritesheet/](spritesheet/) — standalone PSD to spritesheet tool
- [assets/asset_browser_view.js](assets/asset_browser_view.js) — searchable asset grid
