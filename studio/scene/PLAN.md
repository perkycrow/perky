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
3. **A Stage (or Stage-like context)** → so entity→view binding works via the existing pipeline
4. The Stage needs to work **without a full Game** — just a canvas + textureSystem

### The Stage coupling problem

Currently Stage needs `this.game` for:
- `game.getLayer()` / `game.createLayer()` — to attach viewsGroup to renderer
- `game.getRenderer()` — for post-passes
- Views use `context.game.getRegion()` / `context.game.getSource()` — to resolve textures

For the editor, we need a **lightweight render context** that provides texture resolution without a full Game. This is the key refactor to unlock real view rendering in the editor.

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
  Editor creates lightweight Stage + World
        │
        ├── for each entity in config:
        │     world.create(EntityClass, {x, y, ...previewDefaults})
        │     → stage creates view → visible in viewport
        │
        └── user edits positions → auto-save to PerkyStore
```

---

## Implementation Progress

### Phase 1 — Foundation ✅
> Scene config format + loader + serializer

- [x] `game/scene_config.js` — loadScene() + serializeScene()
- [x] `game/scene_config.test.js` — 18 tests
- [x] `application/loaders.js` — added `scene` loader type

### Phase 2 — Basic Editor (current state)
> Visual editor with placeholder rendering

- [x] `studio/scene/scene_view.js` — web component with canvas, grid, entity rectangles
- [x] Entity picking, dragging (snap to 0.5), selection highlight
- [x] Properties panel (x, y), scene tree
- [x] Camera pan + zoom
- [x] Auto-save to PerkyStore on changes
- [x] Load from PerkyStore on editor open
- [ ] **2.2** Real view rendering (requires lightweight Stage — see below)

### Phase 3 — Persistence & Integration
> Save/load + runtime override

- [x] Vite plugin generates scene.html/scene.js
- [x] Auto-save to PerkyStore (scene_view.js)
- [x] Load custom from PerkyStore (scene launcher.js)
- [x] manifest_patcher.js loads scene overrides
- [x] mist/index.js loads overrides with ?studio flag
- [ ] Hub integration: scene cards in hub_view.js

### Phase 4 — Mist Integration
> First real use

- [x] mist/perky.config.js, vite.mist.config.js, manifest.json
- [x] mist/assets/scenes/chapter.json (entity positions)
- [x] ChapterWorld reads layout from manifest (resolveLayout)
- [ ] **4.6** Full round-trip validation

### Phase 5 — Real View Rendering (NEW — was part of 2.2)
> Render actual entity views in the editor viewport

- [ ] **5.1** Lightweight render context (textureSystem + canvas, no full Game)
- [ ] **5.2** Instantiate Stage + World in editor, register views via wiring
- [ ] **5.3** Create entities with preview defaults → views auto-created
- [ ] **5.4** Render viewsGroup on editor canvas
- [ ] **5.5** Entity picking based on view bounds (not fixed rectangles)

### Phase 6 — Entity Palette & Drag-to-Add
> Toolbar of available entities from wiring

- [ ] **6.1** Read entity classes from wiring → build palette UI
- [ ] **6.2** Drag entity from palette into viewport
- [ ] **6.3** Create new entity at drop position
- [ ] **6.4** Delete entities

### Phase 7 — Polish & UX
- [ ] Undo/redo
- [ ] Play/preview mode (toggle game loop)
- [ ] Grid/snap options
- [ ] Copy/paste entities
- [ ] Keyboard shortcuts
- [ ] Property editing: depth, scale, rotation

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
- Should the lightweight render context be a new class, or a refactored Stage?
- How to handle conditional entities (ArsenalPanel only exists if skills > 0)?
- Should the entity palette show ALL entities from wiring, or a curated subset?
