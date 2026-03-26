# Studio — Architecture & Tools Plan

## What We Have

StudioTool extends **Application** — each tool is a proper framework application with InputSystem, ActionController, ActionDispatcher, Manifest, and shadow DOM for style isolation.

**Done:**
- `studio/studio_tool.js` — base class extending Application
- Shadow DOM with adopted stylesheets (theme + toolbar + tool-specific)
- Auto-save lifecycle (PerkyStore, markDirty, flushSave, beforeunload)
- CommandHistory for undo/redo
- Layout: app-layout with header slots (back button, tool controls)
- ActionController per tool (e.g., SceneController with undo/redo/copy/paste/delete)
- Combo bindings (`ctrl+z`, `ctrl+shift+z`) parsed by normalizeBindingDefinition
- Launchers create Application instances: `new SceneView()` → `mount()` → `start()`

**Framework improvements made:**
- `ActionController.normalizeBindingDefinition` parses `ctrl+z` → combo binding with controls
- `Application.#autoRegisterBindings` uses `bindCombo` for combo bindings
- `KeyboardDevice` creates controls for both `event.code` (physical: `KeyZ`) AND `event.key` (semantic: `z`) — AZERTY/QWERTY compatible
- `ActionDispatcher.dispatchAction` auto-calls `preventDefault` on matched bindings
- `WebGL #getMatrices` uses `camera.effectiveX/Y`
- `EntityView.autoDepth` opt-in (default false)

**Tools migrated:**
- SceneView extends StudioTool (with SceneController)
- AnimatorView extends StudioTool
- AssetBrowserView extends StudioTool (validation tool, ~180 lines)

---

## Architecture

### StudioTool (extends Application)

```
StudioTool
├── Application features (free):
│   ├── InputSystem (keyboard, mouse, touch)
│   ├── ActionDispatcher + ActionController
│   ├── Manifest + SourceManager
│   └── PerkyView (DOM element)
│
├── Studio additions:
│   ├── shadow DOM (style isolation via attachShadow)
│   ├── PerkyStore (auto-save with markDirty/flushSave)
│   ├── CommandHistory (undo/redo)
│   └── app-layout with header (back button + tool controls)
│
└── Overridable:
    ├── init()              — tool setup
    ├── buildHeaderStart()  — left header controls
    ├── buildHeaderEnd()    — right header controls
    ├── buildContent()      — main content
    ├── toolStyles()        — CSS stylesheets
    └── autoSave()          — persistence logic
```

### Tool creation pattern

```js
class MyToolController extends ActionController {
    static bindings = {undo: 'ctrl+z', save: 'ctrl+s'}
    undo () { this.engine.handleUndo() }
    save () { this.engine.handleSave() }
}

class MyTool extends StudioTool {
    static ActionController = MyToolController

    buildContent () { return createElement('div', {class: 'my-tool'}) }
    init () { /* setup */ }
    autoSave () { /* persist */ }
}

// Launcher:
const app = new MyTool()
app.setContext({...})
app.mount(container)
app.start()
```

### Keyboard bindings — unified system

Two formats, same system, detected automatically:
- `'ctrl+z'` → semantic key (`event.key`), works on all keyboard layouts (AZERTY, QWERTY, etc.)
- `'ctrl+KeyZ'` → physical position (`event.code`), layout-independent (good for WASD gaming)

KeyboardDevice creates controls for both `event.code` and `event.key` on each keypress.

---

## UX — iPad First (Procreate-inspired)

### Layout (scene editor)

```
┌──────────────────────────────────────────────┐
│ [←] [↩ ↪] [☰ ⚙ Snap] [▶ Preview]          │  Header (44px touch targets)
├──────────────────────────────────────────────┤
│                                              │
│              FULL VIEWPORT                   │  Canvas (WebGL + Canvas2D overlay)
│                                              │  1-finger: select + drag entities
│◄─ swipe left      swipe right ─►            │  2-finger: pinch zoom, drag pan
│   Palette          Properties                │  Middle click: pan (desktop)
│                                              │
└──────────────────────────────────────────────┘
```

### Touch gestures (implemented)

| Gesture | Action |
|---------|--------|
| 1-finger tap | Select entity |
| 1-finger drag | Move selected entity |
| 2-finger pinch | Zoom viewport |
| 2-finger drag | Pan viewport |
| Middle/right click drag | Pan viewport (desktop) |
| Scroll wheel | Zoom (desktop) |

### Still to implement

| Gesture | Action |
|---------|--------|
| Edge swipe left/right | Open/close drawers |
| 2-finger tap | Undo |
| 3-finger tap | Redo |
| Long press | Context menu |

---

## Remaining Work

### Short-term

- [ ] **PropertiesPanel component** — extract from scene_view, reusable
- [ ] **AssetPalette component** — extract from scene_view, with search + thumbnails
- [ ] **Animator keyboard shortcuts** — AnimatorController with play/stop, frame nav
- [ ] **Edge swipe** for drawer open/close (wire to existing side-drawer.js)
- [ ] **2-finger tap undo / 3-finger tap redo** (Procreate convention)

### Medium-term

- [ ] **Scene: Menu Stage** — use generic entities for title screen
- [ ] **Scene: Spritesheet frames in palette** — not just image assets
- [ ] **Scene: Multi-select** (shift+click or drag rect)
- [ ] **Hub: Scene version tracking** (badges, conflict resolution)
- [ ] **CLI: perky-update handles scene type**

### Long-term

- [ ] **Single-page studio** via ApplicationManager (one HTML page, tools as stages)
- [ ] **View Composer** — compose Group2D hierarchies (like animator but spatial)
- [ ] **Prefabs/Fragments** — reusable entity groups for procedural level design
- [ ] **Framework: decouple Stage from Game** (eliminate gameProxy hack)

---

## Open Questions

- PropertiesPanel: should it support schemas (auto-generate UI from property definitions)?
- 2-finger tap undo vs 2-finger pan: how to distinguish? (time threshold?)
- Should the hub become a StudioTool too?
- When extracting Viewport component, include picking/drag or just camera?
