# Studio — Architecture & Tools Plan

## Context

The studio hosts multiple editing tools (animator, scene/world editor, future tools). Each tool is currently a standalone web component page with duplicated patterns. The goal is to create a shared foundation (`StudioTool`) that unifies common behavior while keeping each tool's specifics clean.

**Design constraints:**
- **iPad first**, desktop compatible (inspired by Procreate's UX philosophy)
- Solo dev + artist workflow — tools must be intuitive for non-developers
- New tools must be easy to create from the foundation
- Leverage the framework's existing systems (RenderSystem, InputSystem, ActionController, bindings)
- Eventually the studio could become a single-page app via ApplicationManager

---

## Current State Analysis

### Two tools with duplicated patterns

```
AnimatorView (studio/animator/animator_view.js)
├── EditorComponent base
├── app-layout + header slots (back, settings, animation select, fps, loop, mode)
├── PerkyStore auto-save (dirty, markDirty, flushSave, autoSave, beforeunload)
├── setContext() + deferred init
├── Custom canvas preview (animation-preview component)
├── Side drawers (spritesheet viewer, frame editor, animation settings)
├── Timeline component at bottom
├── No undo/redo
└── No keyboard shortcuts

SceneView (studio/scene/scene_view.js)
├── EditorComponent base
├── app-layout + header slots (back, undo, redo, snap, preview)
├── PerkyStore auto-save (identical pattern to animator)
├── setContext() + deferred init
├── RenderSystem (WebGL game layer + Canvas2D overlay)
├── CommandHistory (undo/redo)
├── Custom key handler (KEY_ACTIONS map + executeAction dispatch)
├── Fixed properties panel (right side, 220px)
├── Scene tree + entity palette in properties panel
└── No side drawers
```

### Exact duplications (~40 lines per tool)

```js
#store = new PerkyStore()
#dirty = false
#autoSaveTimer = null
#boundBeforeUnload = null

markDirty ()   // identical in both
flushSave ()   // identical in both
// beforeunload setup/teardown in onConnected/onDisconnected — identical
// app-layout creation with no-menu/no-close/no-footer — identical
// Back button to index.html — identical
// setContext + deferred init pattern — identical structure
```

### Shared editor infrastructure already in place

```
editor/
├── editor_component.js — base web component with theme + reset styles
├── command_history.js — reusable undo/redo stack
├── flash.js — toast notifications
├── layout/
│   ├── app_layout.js — header (start/center/end slots) + content + footer
│   ├── side_drawer.js — 280px panel, swipe to open/close (iPad gesture support!)
│   ├── panel.js — generic panel container
│   ├── overlay.js — modal overlay
│   └── toolbar.js — toolbar component
├── styles/
│   ├── theme.styles.js — CSS variables (touch-target: 44px, spacing, colors)
│   ├── reset.styles.js — CSS reset
│   └── toolbar.styles.js — shared toolbar button styles
├── Inputs: number_input, slider_input, select_input, toggle_input, vec2_input, dropdown_menu
└── Interactive: zoom_controls, color_picker
```

### Framework systems available but unused by studio

```
core/action_controller.js
├── Declares actions as class methods
├── static bindings = {actionName: ['Key']}
├── execute(actionName, ...args) → calls method + emits event
├── listActions() / listActionsWithParams() — discoverable
└── Already used by game controllers (DenController, ChapterController, GhastController)

core/action_dispatcher.js
├── Manages a stack of active controllers
├── Dispatches actions top-down through the stack
├── register/unregister controllers
└── Integration with InputSystem events

input/input_system.js
├── Keyboard, mouse, touch, gamepad devices
├── Captures events, resolves bindings, emits input:triggered
├── getDirection(), isActionPressed() — game-oriented helpers
└── Installs on Application (delegateTo host)

render/render_system.js
├── Creates/manages layers (Canvas, WebGL, HTML) and cameras
├── Auto-resize with ResizeObserver
├── render() iterates all layers
└── Already used by SceneView directly
```

---

## Proposed Architecture

### StudioTool base class

```
studio/studio_tool.js

class StudioTool extends EditorComponent

  ─── Properties ────────────────────────────
  store           PerkyStore instance
  history         CommandHistory instance
  appLayout       The app-layout element
  renderSystem    RenderSystem (null by default, tools opt-in)

  ─── Auto-save lifecycle ───────────────────
  markDirty ()        Starts 2s debounced auto-save timer
  flushSave ()        Immediate save if dirty
  autoSave ()         Abstract — each tool implements its persistence logic

  ─── Layout ────────────────────────────────
  buildLayout ()      Creates app-layout + back button, calls buildHeaderStart/End
  buildHeaderStart ()  Abstract — tool adds left header controls (undo, settings, etc.)
  buildHeaderEnd ()    Abstract — tool adds right header controls (preview, mode, etc.)

  ─── Actions / Input ───────────────────────
  static actions = {}     Action name → method name mapping
  static bindings = {}    Action name → key bindings (ActionController format)
  executeAction (name)    Dispatches to the correct method
  onKeyDown (e)           Resolves key → action → executeAction

  ─── Lifecycle ─────────────────────────────
  onConnected ()       buildLayout, beforeunload, key listener, deferred init
  onDisconnected ()    cleanup
  setContext (ctx)     Stores context, calls init() if DOM ready
  init ()              Abstract — tool-specific initialization
```

### Refactored AnimatorView

```
AnimatorView extends StudioTool

  static actions = {
      undo: 'undoAction',
      redo: 'redoAction',
      play: 'togglePlay',
      nextFrame: 'nextFrame',
      prevFrame: 'prevFrame',
      addFrame: 'openFramesPalette',
      deleteFrame: 'deleteSelectedFrame',
  }

  static bindings = {
      undo: ['keyboard/z+ctrl'],
      redo: ['keyboard/Z+ctrl'],
      play: ['keyboard/ '],           // spacebar
      nextFrame: ['keyboard/ArrowRight'],
      prevFrame: ['keyboard/ArrowLeft'],
  }

  buildHeaderStart ()  → settings menu, animation select
  buildHeaderEnd ()    → fps input, loop toggle, playback mode
  init ()              → creates SpriteAnimator, renders preview + timeline + drawers
  autoSave ()          → saves animator config to PerkyStore

  Gains for free: undo/redo, keyboard shortcuts, standardized layout
```

### Refactored SceneView

```
SceneView extends StudioTool

  static actions = {
      undo: 'undoAction',
      redo: 'redoAction',
      copy: 'copySelectedEntity',
      paste: 'pasteEntity',
      duplicate: 'duplicateSelectedEntity',
      delete: 'deleteSelectedEntity',
  }

  static bindings = {
      undo: ['keyboard/z+ctrl'],
      redo: ['keyboard/Z+ctrl'],
      copy: ['keyboard/c+ctrl'],
      paste: ['keyboard/v+ctrl'],
      duplicate: ['keyboard/d+ctrl'],
      delete: ['keyboard/Delete', 'keyboard/Backspace'],
  }

  buildHeaderStart ()  → undo/redo buttons, snap toggle
  buildHeaderEnd ()    → preview button
  init ()              → creates RenderSystem, Stage, loads scene config
  autoSave ()          → saves scene config to PerkyStore

  Refactored: properties panel → side-drawer (right), entity palette → side-drawer (left)
```

---

## UX Design — iPad First (Procreate-inspired)

### Universal layout for viewport tools

```
┌──────────────────────────────────────────────┐
│ [←] [tool-specific...]      [global actions] │  ← Header bar (44px touch target)
├──────────────────────────────────────────────┤
│                                              │
│                                              │
│              MAIN VIEWPORT                   │  ← Full-bleed canvas
│          (canvas / preview)                  │     Gestures handled here
│                                              │
│                                              │
│◄─ swipe left edge    swipe right edge ─►│    │  ← Side drawers (280px overlay)
│   Asset palette /    Properties /        │    │     Dismiss: swipe back or tap outside
│   Spritesheet        Settings            │    │
└──────────────────────────────────────────────┘

Animator also has: bottom timeline strip (flex-shrink: 0)
```

### Touch gesture mapping

| Gesture | Action | Notes |
|---------|--------|-------|
| 1-finger tap | Select | Tap entity/frame |
| 1-finger drag | Move selected | Drag entity in scene, drag frame in timeline |
| 2-finger pinch | Zoom viewport | Viewport tools only |
| 2-finger drag | Pan viewport | Viewport tools only |
| Swipe from left edge | Open left drawer | Palette / spritesheet |
| Swipe from right edge | Open right drawer | Properties / settings |
| Long press | Context menu | Entity options, frame options |
| 2-finger tap | Undo | Procreate convention |
| 3-finger tap | Redo | Procreate convention |

### Desktop equivalents

| Touch | Desktop |
|-------|---------|
| 1-finger tap | Left click |
| 1-finger drag | Left click + drag |
| 2-finger pinch | Scroll wheel (zoom) |
| 2-finger drag | Middle click drag |
| Left edge swipe | Toggle button or hotkey |
| Right edge swipe | Toggle button or hotkey |
| Long press | Right click |
| 2-finger tap | Ctrl+Z |
| 3-finger tap | Ctrl+Shift+Z |

---

## Shared UI Components to Extract

### PropertiesPanel

Currently hardcoded in scene_view.js (prop-row, prop-label, prop-input). Extract as reusable:

```
<properties-panel>
├── addInput(label, value, onChange, options)   // number, text, select
├── addVec2(label, {x, y}, onChange)
├── addSection(title)
├── addSeparator()
├── addButton(label, onClick, variant)          // default, danger
├── clear()
└── Styles: shared panel styles from editor/styles/
```

Use in: scene editor (entity props), animator (frame editor, animation settings), future tools.

### AssetPalette

Currently inline in scene_view.js. Extract:

```
<asset-palette>
├── setCategories([{name, items: [{id, label, thumbnail}]}])
├── setFilter(query)                            // search/filter
├── Events: 'item-select' → {id, category}
└── Thumbnail rendering for sprite assets
```

Use in: scene editor (entities + sprites), animator (spritesheet frames), future tools.

### Viewport (possible future extraction)

If multiple tools need a canvas viewport with camera controls, extract:

```
<studio-viewport>
├── RenderSystem integration
├── Camera pan (2-finger / middle click)
├── Camera zoom (pinch / scroll wheel)
├── Object picking (screenToWorld + bounds check)
├── Drag-to-move with snap
├── Grid overlay
└── Camera frame overlay
```

This is more speculative — only extract if a second viewport tool appears (e.g., view composer).

---

## Integration with Framework

### ActionController (Phase 4)

StudioTool creates an ActionController from `static actions` + `static bindings`:

```js
// In StudioTool.onConnected():
// Parse static bindings → create keydown listener → dispatch via executeAction
// No full InputSystem needed — just DOM keydown + binding resolution
```

Benefits:
- Standard binding format (reusable across game + studio)
- Actions discoverable (listActions)
- Future: integrate with devtools command palette
- Future: rebindable shortcuts

### RenderSystem (already used)

SceneView already uses RenderSystem. StudioTool provides opt-in support:

```js
// In tool's init():
this.renderSystem = this.createRenderSystem(viewportElement, {
    cameras: {main: {...}},
    layers: [...]
})
// StudioTool handles resize + cleanup automatically
```

### Future: single-page via ApplicationManager

```js
const studio = new StudioApplication({container})
studio.register('hub', HubTool)
studio.register('animator', AnimatorTool)
studio.register('scene', SceneTool)
studio.setTool('hub')
// Navigation: studio.setTool('animator', {id: 'pigAnimator'})
```

Each StudioTool becomes a "stage" of the StudioApplication. The StudioTool base class works identically in both modes (standalone page or managed by ApplicationManager).

---

## Implementation Plan

### Phase 1 — StudioTool base class
> Extract shared patterns, unify both tools

- [ ] Create `studio/studio_tool.js` extending EditorComponent
- [ ] Auto-save lifecycle (store, dirty, markDirty, flushSave, beforeunload)
- [ ] Layout building (app-layout, back button, header slots)
- [ ] Action dispatch (static actions + bindings → keydown handler)
- [ ] CommandHistory integration
- [ ] Refactor SceneView to extend StudioTool
- [ ] Refactor AnimatorView to extend StudioTool
- [ ] Add keyboard shortcuts to AnimatorView (undo/redo, play/stop, frame navigation)
- [ ] Verify everything still works

### Phase 2 — Shared UI components
> Make UI pieces reusable across tools

- [ ] Extract PropertiesPanel component
- [ ] Extract AssetPalette component
- [ ] Scene editor: replace fixed panel with side-drawer (right)
- [ ] Scene editor: move palette to side-drawer (left)
- [ ] Unify styles: extract common panel/input styles

### Phase 3 — iPad touch gestures
> Procreate-inspired interaction

- [ ] 2-finger pinch zoom (viewport tools)
- [ ] 2-finger drag pan (viewport tools)
- [ ] Edge swipe to open/close drawers (already in side-drawer.js, wire up)
- [ ] 2-finger tap = undo, 3-finger tap = redo
- [ ] Long press = context menu
- [ ] Test on actual iPad

### Phase 4 — Framework ActionController integration
> Replace custom key handlers with proper ActionController

- [ ] StudioTool creates ActionController from static bindings
- [ ] Key events → ActionController.execute()
- [ ] Animator gains full keyboard shortcuts
- [ ] Future: command palette integration for studio tools

### Phase 5 — New tool validation
> Build a third tool to validate the architecture

- [ ] Candidate: View Composer (compose entity views from sprites)
- [ ] Or: Data Table editor (edit JSON collections like reagent lists)
- [ ] Should be <200 lines thanks to StudioTool + shared components

---

## Unified Pipeline (persistence)

### Current state
- Hub displays animator + scene cards with select mode
- PerkyStore handles save/load/export/import for all types
- exportBundle() exports multiple selected items as single .perky
- import() handles both single and bundle .perky files
- manifest_patcher.js loads animator AND scene overrides
- `yarn perky-update <target> <file.perky>` imports .perky to game project

### Still needed
- [ ] Scene version tracking in hub (badges: New, Modified)
- [ ] Conflict resolution for scenes (same as animators)
- [ ] CLI `perky-update` handles `scene` type (extract JSON to assets/scenes/)
- [ ] perky.config.js `assets.scenes` path support

---

## Open Questions

- Side drawers: left=palette / right=properties universally, or configurable per tool?
- How to make the header system flexible without making the base class too rigid? (slots? builder methods? config object?)
- PropertiesPanel: should it support schemas (auto-generate UI from property definitions)?
- 2-finger tap undo vs 2-finger pan: how to distinguish? (time threshold? distance threshold?)
- Should the hub become a StudioTool or stay standalone HubView?
- When extracting Viewport component, should it include picking/drag logic or just camera controls?
