# Scene Composer — Studio Tool

## Vision

A visual editor integrated into the per-game Studio that allows placing, scaling, rotating, and adjusting depth of entities in a stage — without writing code.

**First target**: Mist's ChapterStage (fixed camera, UI-layout style, few entities).

---

## Architecture

### Scene Config Format

A JSON file describing the initial state of a scene:

```json
{
    "entities": [
        {"type": "Board", "x": -3, "y": -3.5},
        {"type": "LabPanel", "x": 7.5, "y": 5},
        {"type": "ArsenalPanel", "x": -3, "y": -3},
        {"type": "Notebook", "x": -9, "y": -2},
        {"type": "EndPanel", "x": 7.5, "y": -3}
    ],
    "decor": []
}
```

- `entities` — resolved via wiring, creates real Entity + auto-binds View
- `decor` — pure Object2D (Sprite, Group2D, etc.) added to the scene graph directly
- Properties: x, y, rotation, scaleX, scaleY, depth, opacity, visible

### Data Flow

```
Scene Config (JSON in PerkyStore)
        │
        ▼
  Scene Loader (framework)
        │
        ├── entities → world.create(EntityClass, props)
        │                 └── stage catches entity:set → creates view (existing pipeline)
        │
        └── decor → createObject2D(config) → viewsGroup.addChild()

  Code can still add/modify entities on top (procedural layer)
```

### Integration Points

- **Hub**: new "Scenes" section alongside "Animators"
- **Studio config**: `tools: ['animator', 'spritesheet', 'scene']`
- **Game declares scenes** in manifest config or perky.config.js
- **Persistence**: PerkyStore (IndexedDB) + .perky export, same pattern as animator
- **Runtime override**: game loads scene config via loadStudioOverrides() if ?studio flag

---

## Implementation Plan

### Phase 1 — Foundation (framework-level)
> Goal: scene config format + loader + basic round-trip

- [x] **1.1** Define SceneConfig format (JSON schema)
- [x] **1.2** Scene loader: reads config, creates entities via wiring, adds decor to scene graph
- [x] **1.3** Scene serializer: reads current world entities, outputs SceneConfig JSON
- [x] **1.4** Tests for loader + serializer (18 tests)

**Files**: `game/scene_config.js`, `game/scene_config.test.js`

### Phase 2 — Scene Composer View (studio tool)
> Goal: visual editor that renders a stage and lets you manipulate entities

- [x] **2.1** `scene_view.js` — main editor web component (like animator_view.js)
- [ ] **2.2** Viewport rendering: instantiate stage, render one static frame (no game loop)
      Currently renders entities as labeled rectangles on a grid canvas.
      Next step: render actual sprites via the entity→view pipeline.
- [x] **2.3** Entity picking: click in viewport → screenToWorld → find entity by bounds
- [x] **2.4** Entity dragging: drag to move, update entity position + re-render (snaps to 0.5)
- [x] **2.5** Selection highlight (outline/gizmo on selected entity)
- [x] **2.6** Properties panel: edit x, y numerically (depth/scale/rotation TODO)
- [x] **2.7** Scene tree panel: list all entities, click to select
- [x] **2.8** Camera pan (drag on empty space) + zoom (mouse wheel)

**Files**: `studio/scene/scene_view.js`, `scene_view.styles.js`, `launcher.js`, `index.html`, `index.js`

### Phase 3 — Persistence & Integration
> Goal: save/load scenes, integrate into studio hub

- [ ] **3.1** Save scene config to PerkyStore (auto-save like animator)
- [ ] **3.2** Load scene config on editor open
- [ ] **3.3** Hub integration: scene cards in hub_view.js
- [x] **3.4** Vite plugin: generate scene.html/scene.js for game's studio
- [ ] **3.5** Runtime loading: game loads scene overrides from PerkyStore

### Phase 4 — Mist Integration (first real use)
> Goal: use the scene composer with Mist's ChapterStage

- [x] **4.1** Add perky.config.js to Mist with studio + scene config
- [x] **4.2** Add vite.mist.config.js + update package.json (`yarn mist` uses vite config)
- [x] **4.3** Declare ChapterStage as editable scene (chapterScene asset in manifest.json)
- [x] **4.4** Extract hardcoded positions from chapter_world.js → scene config JSON
      **File**: `mist/assets/scenes/chapter.json`
- [ ] **4.5** ChapterWorld.init() loads scene config first, then applies game logic on top
- [ ] **4.6** Test full round-trip: edit in studio → save → reload game → see changes

**Also done**: converted `mist/manifest.js` → `mist/manifest.json`, added `scene` loader in `application/loaders.js`

### Phase 5 — Polish & UX (later)
> Goal: make it pleasant to use daily

- [ ] **5.1** Undo/redo
- [ ] **5.2** Play/preview mode (toggle game loop on/off)
- [ ] **5.3** Grid/snap options
- [ ] **5.4** Copy/paste entities
- [ ] **5.5** Keyboard shortcuts
- [ ] **5.6** Prefabs / scene fragments (reusable scene chunks)

---

## Current Entities in Mist ChapterWorld

Reference for Phase 4 — these are the hardcoded positions to extract:

| Entity | x | y | Notes |
|--------|---|---|-------|
| Board | -3 | -3.5 | Main game board |
| LabPanel | 7.5 | 5 | Reagent inventory |
| ArsenalPanel | -3 | -3 | Skills panel (conditional) |
| Notebook | -9 | -2 | Chapter info / skill tooltips |
| EndPanel | 7.5 | -3 | Win/lose screen (starts inactive) |

Dynamic entities (Reagent, ClusterReagent) are NOT part of scene config — they're spawned by game logic.

---

## Design Decisions

1. **Entity vs Decor separation**: entities go through wiring (entity→view), decor is pure Object2D. Both editable in composer.
2. **Code-first, editor-assists**: the scene config is an initialization layer. Code can still override everything.
3. **Per-game, not global**: each game declares its editable scenes. The composer adapts to the game's entities/views.
4. **Same persistence pattern as animator**: PerkyStore + IndexedDB + .perky export + manifest override.
5. **Static rendering first**: the composer renders a frozen frame. Play mode (Phase 5) adds the game loop.

---

## Notes

- The studio is NOT standalone — it's per-game (`yarn mist` → `/studio/`)
- Mist studio is now set up (perky.config.js, vite.mist.config.js, manifest.json)
- The Scene Composer is a new tool type alongside animator and spritesheet
- Camera is fixed for Mist — no pan/zoom needed in Phase 1
- The existing editor/ folder has SceneTreeNode and inspectors — potentially reusable
