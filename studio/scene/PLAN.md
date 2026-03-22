# World Editor — Studio Tool

## What We Have (v1)

A visual world editor integrated into the per-game Studio. First target: Mist.

**Core:**
- Real view rendering (WebGL game layer + Canvas2D overlay via RenderSystem)
- Entity picking by view bounds (smallest area priority), drag to move, selection highlight
- Properties panel (x, y), scene tree, entity palette (typed entities from wiring + generic sprites from assets)
- Camera: pan (middle/right click), zoom (wheel), game camera frame overlay
- Undo/redo (CommandHistory class in editor/, reusable, buttons + Ctrl+Z/Shift+Z)
- Persistence: auto-save to PerkyStore, load on open, manifest override with `?studio`
- Preview: opens game directly at target stage with `?studio&stage=<name>`
- Hub integration: scene cards alongside animators, selectable in select mode

**Generic entities (v1):**
- Scene config supports `{"texture": "tree_01", "x": 5, "y": 2, "width": 2}` — no class needed
- `World.loadLayout(config, wiring)` creates typed entities (via wiring) and generic entities (base Entity + `$tags: ['decor']`)
- `SpriteEntityView` resolves texture from manifest, creates Sprite with width/height
- Stage registers a matcher `(e) => e.options?.texture` for SpriteEntityView
- Asset palette lists all images from manifest

**Framework additions:**
- `World.loadLayout(config, wiring)` — creates entities from scene config
- `World.findByType(EntityClass)` — finds entity by class
- `SpriteEntityView` — generic view for texture-based entities
- `EntityView.autoDepth` — instance property (default false), opt-in per view
- `CommandHistory` — reusable undo/redo with execute/push/undo/redo/clear
- Shared toolbar styles: `editor/styles/toolbar.styles.js`
- WebGL fix: `#getMatrices` uses `camera.effectiveX/Y`

**Mist integration:**
- ChapterStage calls `world.loadLayout(sceneConfig, wiring)` before `world.init()`
- ChapterWorld.init() uses `findByType()` to wire behavior on pre-loaded entities
- Round-trip: edit in studio → save → preview with `?studio&stage=chapter`

---

## Architecture

### Scene Config Format

```json
{
    "entities": [
        {"type": "Board", "x": -3, "y": -3.5},
        {"texture": "tree_01", "x": 5, "y": 2, "width": 1.5}
    ]
}
```

- `type` entries → resolved via wiring, creates custom Entity + View
- `texture` entries → creates base Entity + SpriteEntityView, tagged `decor`

### The Two Layers

```
LAYOUT (scene config / loadLayout)  →  creates entities (typed + generic)
BEHAVIOR (code / world.init)        →  findByType() wires logic on top
```

### World scope decision

World contains everything — gameplay entities AND visual elements (decor, UI). Generic entities are tagged `$tags: ['decor']` for filtering in headless mode.

---

## Short-Term Plan

### Phase 2 — Menu Scene
> Use generic entities to build the title screen

- [ ] MenuStage loads layout from menuScene config
- [ ] Place title image, buttons, clouds as generic sprite entities
- [ ] Preview button works with `?studio&stage=menu`

### Phase 3 — Polish
> Quality of life improvements

- [ ] Sprite properties editing: width, height, depth in properties panel
- [ ] Grid snap toggle (on/off, configurable step)
- [ ] Copy/paste entities
- [ ] Multi-select (shift+click or drag rect)
- [ ] Better palette: categories, search, thumbnails
- [ ] Spritesheet frames in palette (not just images)

---

## Long-Term Vision

### Prefabs / Fragments
> Reusable groups of entities for procedural level design

- Scene config can reference prefabs: `{"prefab": "dungeon_room_01", "x": 0, "y": 0}`
- Same editor, different save target
- Use case: procedural dungeons with hand-crafted rooms

### View Composer
> Visual editor for entity view hierarchies (character, house, complex object)

- Compose a Group2D from sprites, shapes, sub-groups
- Output: view config JSON
- Like the animator but for spatial composition instead of animation

### Framework Refactor
> Decouple Stage from Game

- Eliminate the gameProxy hack
- `Group2D.getBounds()` should return local-space bounds (currently returns world-space)

---

## Open Questions

- How to define preview defaults? Static property on Entity? In scene config?
- Prefab instancing: deep copy or reference?
- View composer: same tool as world editor or separate?
