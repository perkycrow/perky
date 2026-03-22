# World Editor — Studio Tool

## What We Have (v1)

A visual world editor integrated into the per-game Studio. First target: Mist.

**Done:**
- Real view rendering (WebGL game layer + Canvas2D overlay)
- Entity picking by view bounds (smallest area priority), drag to move, selection highlight
- Properties panel (x, y), scene tree, entity palette (add from wiring), delete
- Camera: pan (middle/right click), zoom (wheel), game camera frame overlay
- Undo/redo (CommandHistory class, reusable across studio tools, buttons + keyboard)
- Persistence: auto-save to PerkyStore, load on open, manifest override with `?studio`
- Preview: opens game directly at the target stage with `?studio&stage=chapter`
- Hub integration: scene cards alongside animators
- `World.loadLayout(config, wiring)` + `World.findByType(EntityClass)` in framework
- Scene config as source of truth: ChapterWorld.init() finds pre-loaded entities instead of creating them

**Framework fixes done:**
- WebGL `#getMatrices`: `camera.x` → `camera.effectiveX/effectiveY`
- Mist views: added `super.sync()` in all custom views
- `EntityView.autoDepth`: instance property (default false), opt-in per view
- `Group2D.getBounds()` returns world-space bounds (uses child.worldMatrix) — `getWorldBounds()` double-transforms, use `getBounds()` instead for world-space picking
- Shared toolbar styles: `editor/styles/toolbar.styles.js`

---

## Architecture

### Scene Config Format

```json
{
    "entities": [
        {"type": "Board", "x": -3, "y": -3.5},
        {"type": "Notebook", "x": -9, "y": -2}
    ]
}
```

Entities with `type` are resolved via wiring. The world editor is the primary way to define what exists in a world. Code (world.init) then finds entities by type and wires behavior on top.

### The Two Layers

```
LAYOUT (world editor / scene config)     →  loadLayout() creates entities
BEHAVIOR (code / world.init)             →  findByType() wires logic, hooks, sounds
```

### gameProxy Pattern

The editor uses a lightweight proxy instead of a full Game to render views:

```js
const gameProxy = {
    getSource: (id) => manifest.getSource(id),
    getSpritesheet: (id) => textureSystem.getSpritesheet(id),
    getRegion: (id) => textureSystem.getRegion(id),
    getLayer: (name) => renderSystem.getLayer(name),
    textureSystem, camera
}
```

Temporary — a framework refactor to decouple Stage from Game would make this unnecessary.

---

## Key Design Insights

### Entity = editable node

An entity **has** a view (via wiring). The editor treats them as visual objects. If no view exists, show a placeholder.

### Generic entities (no custom class needed)

Not everything needs its own Entity subclass. A background sprite, a decoration tree, a simple button — these could be **generic entities** with an asset reference:

```json
{"texture": "tree_01", "x": 5, "y": 2, "width": 1.5, "height": 2}
```

`loadLayout` creates a base `Entity` + `AutoView` with the texture. No files, no wiring entry. If the entity later needs custom logic, "promote" it to a custom class in code.

### The composition model

All editing tools share the same core: compose visual elements in a 2D space. The difference is scope and palette:

| Mode | What it edits | Palette | Output |
|------|--------------|---------|--------|
| **World** | Entities in a World | Entity classes + assets | Scene config |
| **Prefab** | Reusable entity group | Same | Prefab config (fragment) |
| **View** | Group2D (sprite tree) | Sprites, shapes | View config |

### Preview defaults

Entities can have default data so views render representative content in the editor:
- Board: empty grid + 2 placeholder reagents
- LabPanel: sample reagent names
- ArsenalPanel: hidden when no skills
- Notebook: "Chapter I" / score 0

---

## Short-Term Plan

### Phase 1 — Generic Entities (next)
> Drag assets into the world without creating entity/view classes

- [ ] Extend scene config: entries with `texture` (no `type`) create base Entity + AutoView
- [ ] `loadLayout` handles both `type` (wiring) and `texture` (generic) entries
- [ ] Asset palette in editor: list images/spritesheets from manifest, click to add
- [ ] Generic entities are selectable, movable, deletable like regular entities
- [ ] Sprite properties: texture, width, height, depth, opacity

### Phase 2 — Menu Scene
> Use generic entities to build the title screen

- [ ] MenuStage loads layout from menuScene config
- [ ] Place title image, buttons, clouds as generic sprite entities
- [ ] Preview button works with `?studio&stage=menu`

### Phase 3 — Polish
> Quality of life improvements

- [ ] Grid snap toggle (on/off, configurable step)
- [ ] Copy/paste entities (Ctrl+C/V or buttons)
- [ ] Multi-select (shift+click or drag rect)
- [ ] Better entity palette: categories, search, thumbnails

---

## Long-Term Vision

### Prefabs / Fragments
> Reusable groups of entities for procedural level design

- Scene config can reference prefabs: `{"prefab": "dungeon_room_01", "x": 0, "y": 0}`
- Prefab editor = same tool, just saves to a different store
- World builder has a prefab palette alongside entities
- Use case: procedural dungeons with hand-crafted rooms

### View Composer
> Visual editor for entity view hierarchies

- Compose a Group2D from sprites, shapes, sub-groups
- Output: view config JSON loadable by a ConfigView
- Like the animator but for spatial composition instead of animation
- Use case: build a character (body + arms + legs + hat) or a house (walls + roof + windows)

### Framework Refactor
> Decouple Stage from Game for cleaner studio integration

- Stage should work with a render context (textureSystem + renderSystem) instead of a full Game
- Eliminate the gameProxy hack
- `EntityView.sync()` depth handling needs rethinking (autoDepth is a band-aid)
- `Group2D.getBounds()` should return local-space bounds (currently uses worldMatrix = world-space)

---

## Open Questions

- **World scope**: should a World contain purely visual elements (UI, backgrounds, decorations) or only gameplay entities? Two approaches:
  - **World = everything**: simple, one place for all content, the editor manages it all. But the World gains entities that have no gameplay purpose, and headless/server mode would carry visual baggage.
  - **World = gameplay only**: visuals live elsewhere (viewsGroup directly, or a separate "decor" layer). Cleaner separation but two systems to manage. The editor would need to edit both.
  - A middle ground: generic entities live in the World but are tagged/categorized (e.g., `$tags: ['decor']`) so they can be filtered out for headless mode.
- How to define preview defaults? Static property on Entity class? In the scene config?
- Should generic entities be a special Entity subclass (SpriteEntity?) or just base Entity?
- How to handle entity hierarchy in the editor (Board → Workshop → Reagents)?
- Prefab instancing: deep copy or reference? How to override properties per instance?
- View composer: how does it integrate with the animator? Same tool or separate?
