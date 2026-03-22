# Studio — Unified Pipeline Plan

## Context

The studio has multiple tool types (animator, scene, spritesheet) that share persistence via PerkyStore and the `.perky` file format. Currently each type has its own import/export/revert logic. The goal is to unify the pipeline so all resource types work seamlessly together.

## Current State

### Hub (hub_view.js)
- Displays animator cards and scene cards
- Select mode: allows selecting cards for batch operations (Export, Revert, Delete)
- Animators have full lifecycle: custom versions tracked, conflict resolution, version badges
- Scenes: basic cards, selectable, but no custom version tracking yet

### PerkyStore (io/perky_store.js)
- IndexedDB-based storage, keyed by `id` with `type` field (animator, scene, etc.)
- `save(id, {type, name, files})` — stores resource with packed files
- `get(id)` — retrieves with unpacked files
- `list(type)` — lists resources by type
- `delete(id)` — removes resource
- `export(id)` — downloads as `.perky` file (single resource)
- `import(file)` — imports `.perky` file, derives id from `meta.name + capitalize(meta.type)`

### CLI Import (scripts/perky_import.js)
- `yarn perky-import <target> <file.perky>` — imports a `.perky` file into a game project
- Reads perky.config.js for asset paths
- Extracts files to appropriate directories (animators/, spritesheets/)
- Updates manifest.json with new asset entries
- Only handles `animator` and `spritesheet` types currently

### .perky file format (io/pack.js)
- Compressed binary blob containing:
  - `meta.json` — `{type, name, version, updatedAt}`
  - Resource files (JSON configs, PNG images, etc.)

### Manifest Override (io/manifest_patcher.js)
- `loadStudioOverrides()` — reads all animator AND scene resources from PerkyStore
- `applyOverrides(manifestData, overrides)` — patches manifest with custom sources
- Game loads overrides when `?studio` URL param is present

---

## Problems to Solve

### 1. Unified Select Mode
Currently the hub's select mode can select both animators and scenes, but operations (Export, Revert, Delete) only fully work for animators. Need:
- **Export**: export multiple selected items (mixed types) into a single `.perky` file, or one `.perky` per item
- **Revert**: revert any selected item (animator or scene) to its native version
- **Delete**: delete any selected item from PerkyStore

### 2. Multi-Resource Export
Currently `PerkyStore.export(id)` exports one resource. Need:
- Export multiple resources into one `.perky` file (bundle)
- Or export each as separate `.perky` files (simpler)
- Dynamic filename: based on selection (e.g., `mist_update_2026-03-22.perky`)

### 3. CLI Update Command
Rename `yarn perky-import` → `yarn perky-update` with smarter behavior:
- `yarn perky-update mist some_update.perky` — imports ALL resources from the .perky file
- The .perky file can contain animators, scenes, spritesheets — mixed types
- Each resource's `meta.type` determines how to extract and where to place files
- Need to add `scene` type handling: extracts scene JSON to `assets/scenes/`

### 4. Scene Type in CLI
`perky_import.js` only handles `animator` and `spritesheet`. Need to add `scene`:
- Extract scene JSON to a configurable path (e.g., `assets/scenes/`)
- Update manifest.json with scene asset entry
- `perky.config.js` needs a `scenes` path: `{assets: {animators, spritesheets, scenes}}`

---

## Implementation Plan

### Phase 1 — Unify Hub Operations
> All card types support the same select mode operations

- [ ] Revert works for scenes (delete PerkyStore entry)
- [ ] Delete works for scenes
- [ ] Export works for scenes (single .perky file)
- [ ] Operations work on mixed selections (1 animator + 1 scene → both exported)

### Phase 2 — Multi-Resource .perky
> Bundle multiple resources in one .perky file for easier sharing

- [ ] New pack format: multiple resources in one file (array of meta entries, or nested structure)
- [ ] OR: simpler approach — zip multiple .perky files together
- [ ] `PerkyStore.exportMultiple(ids)` — exports selected items
- [ ] `PerkyStore.importMultiple(file)` — imports all resources from bundle
- [ ] Dynamic filename based on content

### Phase 3 — CLI Update
> Rename and extend the CLI tool

- [ ] Rename `perky-import` → `perky-update` in package.json
- [ ] Add `scene` type handler: extract JSON to scenes path
- [ ] Update `perky.config.js` format: add `assets.scenes` path
- [ ] Handle multi-resource .perky files
- [ ] Auto-discover type from meta.json, route to correct handler

### Phase 4 — Scene Version Tracking in Hub
> Scenes get the same versioning UX as animators

- [ ] Track custom scene versions vs game versions
- [ ] Show badges (New, Modified) on scene cards
- [ ] Conflict resolution for scenes
- [ ] Reconcile on hub load

---

## Technical Notes

### .perky format for scenes
```
meta.json:  {type: "scene", name: "chapter", version: 1, updatedAt: ...}
chapterScene.json:  {entities: [{type: "Board", x: -3, y: -3.5}, ...]}
```

### perky.config.js extension
```js
export default {
    studio: {
        title: 'Mist Studio',
        tools: ['scene']
    },
    assets: {
        animators: './assets/animators',
        spritesheets: './assets/spritesheets',
        scenes: './assets/scenes'          // NEW
    }
}
```

### Multi-resource .perky (option A — nested)
```
meta.json: {resources: [
    {type: "animator", name: "red"},
    {type: "scene", name: "chapter"}
]}
red/redAnimator.json
red/redSpritesheet.json
red/redSpritesheet_0.png
chapter/chapterScene.json
```

### Multi-resource .perky (option B — simpler)
Just export one .perky per resource. The CLI can accept multiple files:
`yarn perky-update mist red.perky chapter.perky`
