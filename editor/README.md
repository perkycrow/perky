# Editor

The UI toolkit for building game development tools. Inspectors, loggers, explorers, floating windows — all built as Web Components with the same system you use to build your own.

---

## How it fits together

```
PerkyElement (application/)
    ↓
EditorComponent ──── theme + reset styles baked in
    ↓
┌───────────────────────────────────────────┐
│  Inputs       SliderInput, NumberInput,   │
│               ToggleInput, SelectInput,   │
│               Vec2Input, DropdownMenu     │
│                                           │
│  Layout       AppLayout, Panel, Toolbar,  │
│               Overlay, SideDrawer         │
│                                           │
│  Interactive  EditorButton, TabBar        │
│                                           │
│  Inspectors   BaseInspector → 15+ built-in│
│                                           │
│  Tools        BaseFloatingTool + manager  │
│                                           │
│  DevTools     Dock, Sidebar, Palette      │
└───────────────────────────────────────────┘
```

Everything extends `EditorComponent`. EditorComponent extends `PerkyElement`. You get the theme, the reset, and the CSS variables for free.

---

## Building your own component

```js
import EditorComponent from './editor_component.js'
import {createElement} from '../application/dom_utils.js'

const myCSS = `
    .panel { padding: var(--spacing-md); color: var(--fg-primary); }
    .value { color: var(--accent); }
`

class MyTool extends EditorComponent {
    static styles = myCSS

    onConnected () {
        const el = createElement('div', {class: 'panel'})
        this.shadowRoot.appendChild(el)
    }
}

customElements.define('my-tool', MyTool)
```

That's it. Shadow DOM, theme support, and cleanup come from the base classes.

---

## The style system

### Theme variables (always available)

Backgrounds: `--bg-primary`, `--bg-secondary`, `--bg-hover`, `--bg-selected`
Foreground: `--fg-primary`, `--fg-secondary`, `--fg-muted`
Accent: `--accent`
Status: `--success`, `--error`, `--warning`
Spacing: `--spacing-xs` (4px) through `--spacing-xl` (24px)
Radius: `--radius-sm` (4px), `--radius-md` (8px), `--radius-lg` (12px)
Transitions: `--transition-fast` (0.1s), `--transition-normal` (0.15s), `--transition-slow` (0.25s)

Dark/light mode is automatic via `prefers-color-scheme`, or forced with `theme="dark|light"` attribute.

### Extra style sheets

```js
import {controlsSheet} from './styles/index.js'

class MyTool extends EditorComponent {
    static styles = [controlsSheet, myCSS]
}
```

`controlsSheet` gives you styled `<input>`, `<select>`, `<button>` (with variants: primary, danger, ghost, success, icon-only).

### Context attribute

Add `context="studio"` for touch-friendly sizing (larger targets, bigger fonts). Components cascade this to their children.

---

## Ready-made inputs

Don't rebuild what's already there.

| Element | Tag | Key features |
|---|---|---|
| SliderInput | `<slider-input>` | Range with label and value display |
| NumberInput | `<number-input>` | Drag-label, steppers, keyboard arrows, Shift/Ctrl modifiers |
| ToggleInput | `<toggle-input>` | Switch with checked state |
| SelectInput | `<select-input>` | Custom dropdown, keyboard nav, separators, action items |
| Vec2Input | `<vec2-input>` | Two NumberInputs side by side |
| DropdownMenu | `<dropdown-menu>` | Trigger + menu with items |

All emit `change` events. All support `context="studio"` for larger sizing.

```js
const slider = document.createElement('slider-input')
slider.setLabel('Opacity')
slider.setMin(0)
slider.setMax(1)
slider.setStep(0.01)
slider.setValue(0.5)
slider.addEventListener('change', (e) => doSomething(e.detail.value))
```

---

## Layout components

| Element | Tag | Purpose |
|---|---|---|
| AppLayout | `<app-layout>` | Header/content/footer shell with slots |
| Panel | `<editor-panel>` | Collapsible, draggable when floating |
| Toolbar | `<editor-toolbar>` | Three-section bar (start, center, end) |
| Overlay | `<editor-overlay>` | Backdrop + centered content, Escape to close |
| SideDrawer | `<side-drawer>` | Slide-in panel with swipe-to-close |

---

## Writing an inspector

Inspectors plug into the Perky Explorer. When a module is selected, the explorer picks the matching inspector and renders it in the details panel.

```js
import BaseInspector from './base_inspector.js'

class MyEntityInspector extends BaseInspector {
    static match (instance) {
        return instance instanceof MyEntity
    }

    onModuleSet (module) {
        this.clearContent()
        this.addRow('Health', module.health)
        this.addRow('Speed', module.speed, true)  // accent color
        this.addSeparator()

        const btn = this.createButton('⟳', 'Reset', () => module.reset())
        this.addAction(btn)
    }
}

customElements.define('my-entity-inspector', MyEntityInspector)
```

Register it so the explorer finds it:

```js
import PerkyExplorerDetails from './perky_explorer_details.js'

PerkyExplorerDetails.registerInspector(MyEntityInspector)
```

`BaseInspector` gives you `addRow()`, `addSeparator()`, `createButton()`, `clearContent()`. Use the helpers from `inspector_helpers.js` for toggles, sliders, color pickers, transform displays, and WebGL uniform editors.

---

## Floating tool windows

Tools are draggable, resizable windows managed by `ToolManager`.

```js
import BaseFloatingTool from './tools/base_floating_tool.js'

class MyDebugTool extends BaseFloatingTool {
    static toolId = 'myDebug'
    static toolName = 'My Debug Tool'
    static defaultWidth = 400
    static defaultHeight = 300

    onOpen () {
        // build your UI in this.shadowRoot
    }

    onParamsSet (params) {
        // react to new params
    }

    onClose () {
        // cleanup
    }
}

customElements.define('my-debug-tool', MyDebugTool)
```

Then register and open it:

```js
toolManager.register(MyDebugTool)
toolManager.open('myDebug', {someParam: 42})
```

---

## Extension points

| System | How to extend |
|---|---|
| Inspectors | `PerkyExplorerDetails.registerInspector(MyInspector)` |
| Context menus | `PerkyExplorer.registerActionProvider(fn)` |
| Log renderers | `registerLogRenderer({match(item), render(item)})` from `log_renderers/` |
| Tools | `toolManager.register(MyTool)` |

---

## Key files

- [editor_component.js](editor_component.js) — base class, start here
- [styles/](styles/) — theme variables, reset, controls
- [base_input.js](base_input.js) — shared attribute handling for inputs
- [inspectors/base_inspector.js](inspectors/base_inspector.js) — inspector base class
- [inspectors/inspector_helpers.js](inspectors/inspector_helpers.js) — toggle, slider, color, transform, uniform helpers
- [tools/base_floating_tool.js](tools/base_floating_tool.js) — floating tool base class
- [tools/tool_manager.js](tools/tool_manager.js) — tool window lifecycle
- [perky_explorer.js](perky_explorer.js) — the explorer itself
- [perky_explorer_details.js](perky_explorer_details.js) — inspector host + registration
- [log_renderers/log_renderer_registry.js](log_renderers/log_renderer_registry.js) — custom log rendering
- [context_menu_actions.js](context_menu_actions.js) — pluggable context menus
