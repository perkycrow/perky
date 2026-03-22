# World Editor — Studio Tool

## Vision

A visual **world editor** integrated into the per-game Studio. It edits the content of a World: which entities exist and where they are positioned.

An entity **has** a view (via wiring). The editor shows the real views when available, or placeholders when not. The editor doesn't need to know the entity/view distinction — it sees visual nodes that can be selected and moved.

**Philosophy**: the editor handles **layout** (what, where). Code handles **behavior** (gameplay logic, hooks, sounds, dynamic spawning). These are two layers that compose.

**First target**: Mist's ChapterWorld.

---

## Core Concepts

### What the editor does
- Place entities in a World (type + position)
- Show their views (resolved via wiring + textureSystem)
- Allow repositioning, reordering, adjusting properties
- Serialize the layout as a JSON scene config
- Provide an entity palette (from wiring) to drag new entities in

### What the editor does NOT do
- Run gameplay logic (hooks, action sets, sounds)
- Spawn dynamic entities (reagents, projectiles)
- Configure game state (skills, chapters, save data)

### The two layers

```
┌─────────────────────────────────────────┐
│  LAYOUT (world editor / scene config)   │
│  "Board at (-3, -3.5)"                  │
│  "Notebook at (-9, -2)"                 │
│  "Workshop visible as zone placeholder" │
└────────────────┬────────────────────────┘
                 │  loaded first
                 ▼
┌─────────────────────────────────────────┐
│  BEHAVIOR (code / world.init)           │
│  board.initGame(gameState, factories)   │
│  labPanel.reagentNames = lab.reagents   │
│  initAnimationHooks()                   │
│  initSoundHooks()                       │
└─────────────────────────────────────────┘
```

### Preview defaults

Entities can have **preview data** so the editor shows representative visuals without needing runtime game state:

| Entity | Preview defaults | Runtime (replaced by code) |
|--------|-----------------|---------------------------|
| Board | empty grid + 2 placeholder reagents | grid filled dynamically |
| LabPanel | sample reagent names | reagents from chapter |
| ArsenalPanel | placeholder skills | skills from game state |
| Notebook | "Chapter I" / score 0 | real title and score |
| EndPanel | inactive | activated at game end |

### Entity hierarchy in the editor

Entities can be nested (Board → Workshop → Reagents). The editor shows this hierarchy:

```
World
├── Board (view: boardFrame + grid)
│   └── Workshop (view: zone placeholder)
│       └── Reagent ×2 (preview placeholders)
├── LabPanel (view: parchemin)
├── Notebook (view: book)
├── ArsenalPanel (view: skills frame)
└── EndPanel (view: flask, inactive)
```

Child entities (Workshop, Reagents) have positions relative to their parent. Moving Board moves everything underneath.

---

## Architecture

### Scene Config Format

```json
{
    "entities": [
        {"type": "Board", "x": -3, "y": -3.5},
        {"type": "LabPanel", "x": 7.5, "y": 5},
        {"type": "ArsenalPanel", "x": -3, "y": -3},
        {"type": "Notebook", "x": -9, "y": -2},
        {"type": "EndPanel", "x": 7.5, "y": -3}
    ]
}
```

Properties per entity: type, x, y (and later: rotation, scaleX, scaleY, depth, $id).

### What the editor needs

1. **Wiring** → knows all entity classes and their view classes (the "palette")
2. **TextureSystem** → resolves textures for views to render
3. **RenderSystem** → manages camera, layers (WebGL game + Canvas overlay), auto-resize
4. **A Stage + gameProxy** → so entity→view binding works via the existing pipeline

### The Stage coupling problem (resolved temporarily)

Stage needs `this.game` for texture resolution and layer access. Views use `context.game.getSource()`, `context.game.getSpritesheet()`.

**Current solution**: a `gameProxy` object that delegates to manifest + textureSystem + renderSystem. Works but is a temporary hack — a proper refactor would decouple Stage from Game at the framework level.

### Data Flow (runtime)

```
Scene Config (JSON)
        │
        ▼
  world.init() loads layout
        │
        ├── for each entity in config:
        │     world.create(EntityClass, {x, y})
        │     → stage catches entity:set → creates view (existing pipeline)
        │
        └── then code runs behavior on top:
              board.initGame(gameState, factories)
              initAnimationHooks()
              etc.
```

### Data Flow (editor)

```
Scene Config (JSON from PerkyStore or manifest)
        │
        ▼
  Editor creates Stage + World with gameProxy
        │
        ├── for each entity in config:
        │     world.create(EntityClass, {x, y})
        │     → stage creates view → visible in viewport
        │
        ├── user edits positions → entity.x/y updated → syncViews() → re-render
        │
        └── auto-save to PerkyStore every 2s on change
```

---

## Implementation Progress

### Phase 1 — Foundation ✅
> Scene config format + loader + serializer

- [x] `game/scene_config.js` — loadScene() + serializeScene()
- [x] `game/scene_config.test.js` — 18 tests
- [x] `application/loaders.js` — added `scene` loader type

### Phase 2 — Editor ✅
> Visual editor with real view rendering

- [x] `studio/scene/scene_view.js` — web component with RenderSystem
- [x] Real view rendering via gameProxy + Stage + wiring (WebGL game layer)
- [x] Canvas overlay layer: grid, axis, camera frame, labels, selection
- [x] Overlay draws in world space via `camera.applyToContext()` — synced with WebGL
- [x] Entity picking, dragging (snap to 0.5), selection highlight
- [x] Properties panel (x, y), scene tree
- [x] Camera pan (screen-space delta) + zoom (wheel)
- [x] Game camera frame overlay (dashed rect from manifest `config.studio.scene.camera`)
- [x] Auto-save to PerkyStore on changes
- [x] Load from PerkyStore on editor open

### Phase 3 — Persistence & Integration ✅
> Save/load + runtime override + vite plugin

- [x] Vite plugin generates scene.html/scene.js (with wiring import)
- [x] Auto-save to PerkyStore (scene_view.js)
- [x] Load custom from PerkyStore (scene launcher.js)
- [x] manifest_patcher.js loads scene overrides (animators + scenes)
- [x] mist/index.js loads overrides with `?studio` flag
- [x] Hub integration: scene cards in hub_view.js

### Phase 4 — Mist Integration ✅
> First real use with The Mistbrewer

- [x] mist/perky.config.js, vite.mist.config.js, manifest.json
- [x] mist/assets/scenes/chapter.json (entity positions)
- [x] ChapterWorld reads layout from manifest (resolveLayout)
- [x] Mist views fixed: added `super.sync()` in all custom views
- [x] Round-trip: edit positions in studio → save → reload game with `?studio` → positions applied

### Phase 5 — View Picking & Bounds
> Use actual view bounds for selection instead of fixed-size rectangles

- [ ] Entity picking based on view bounds (getWorldBounds)
- [ ] Selection highlight matches view shape
- [ ] Preview defaults for entities (so views render representative content)

### Phase 6 — Entity Palette & Drag-to-Add
> Toolbar of available entities from wiring

- [ ] Read entity classes from wiring → build palette UI
- [ ] Drag entity from palette into viewport
- [ ] Create new entity at drop position
- [ ] Delete entities

### Phase 7 — Polish & UX
- [ ] Undo/redo
- [ ] Play/preview mode (toggle game loop)
- [ ] Grid/snap options
- [ ] Copy/paste entities
- [ ] Keyboard shortcuts
- [ ] Property editing: depth, scale, rotation

---

## Framework Fixes Done During Development

- **WebGL `#getMatrices` bug**: was using `camera.x/y` instead of `camera.effectiveX/effectiveY`, causing desync with Canvas2D `applyToContext()`. Fixed in `render/webgl_renderer.js`.
- **Mist views missing `super.sync()`**: all custom views (NotebookView, LabPanelView, etc.) overrode `sync()` without calling `super.sync()`, preventing entity position updates from propagating to views. Fixed in all Mist views.

---

## Design Decisions

1. **World editor, not scene editor**: we edit World content (entities), not visual trees directly.
2. **Entity = editable node**: an entity has a position and (usually) a view. The editor treats them as visual objects.
3. **Layout vs behavior**: the editor handles placement. Code handles logic. Clean separation.
4. **Preview defaults**: entities can declare default options for editor preview, replaced at runtime.
5. **Per-game**: each game declares its editable worlds. The editor adapts via wiring.
6. **Same persistence as animator**: PerkyStore + IndexedDB + .perky export + manifest override.
7. **Placeholder for viewless entities**: entities without views get a gizmo/icon in the editor.
8. **Nested entities visible**: child entities (Workshop inside Board) shown in hierarchy, positioned relative to parent.

---

## Open Questions

- How to define preview defaults? Static property on Entity class? Separate config?
- Should the gameProxy be replaced by a proper framework-level refactor (decouple Stage from Game)?
- How to handle conditional entities (ArsenalPanel only exists if skills > 0)?
- Should the entity palette show ALL entities from wiring, or a curated subset?
