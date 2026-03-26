# Input System — Gesture Recognition Plan

## Problem

The existing InputSystem handles **discrete actions** (key pressed, button clicked) but not **continuous gestures** (drag, pinch, pan). Currently, each tool (SceneView) reimplements ~150 lines of pointer tracking, multi-touch handling, and gesture detection inline.

### What exists

```
input/
├── InputSystem          — orchestrates devices + bindings + action dispatch
├── InputBinder          — maps device inputs → action names
├── CompositeBinding     — AND-logic for multi-key combos (ctrl+z)
├── InputDevice          — base class with controls registry
├── KeyboardDevice       — tracks key presses (event.code + event.key aliases)
├── MouseDevice          — tracks buttons, position (Vec2), navigation (wheel)
├── TouchDevice          — tracks single touch: position, delta, swipe, tap
├── Controls:
│   ├── ButtonControl    — pressed/released state
│   ├── Vec2Control      — 2D position (mouse position, touch position)
│   └── NavigationControl — wheel delta (deltaX, deltaY, deltaZ) + trackpad detection
```

### What's missing

The TouchDevice only tracks **one touch**. It can't:
- Track multiple pointers simultaneously (needed for pinch/pan)
- Calculate distance between two pointers (needed for pinch zoom)
- Distinguish 1-finger drag from 2-finger pan
- Recognize complex gestures (long press, double tap, edge swipe)

The MouseDevice tracks position and buttons separately. There's no concept of "drag" (button pressed + position moved).

SceneView compensates by doing all this manually:
```js
// SceneView currently does:
#pointers = new Map()           // tracks multiple pointer positions
#drag = {panning, pinching, startWorld, startEntity, ...}  // gesture state
#onPointerDown → detect: select? pan? entity drag?
#onPointerMove → handle: entity drag, camera pan, pinch zoom
#onPointerUp → finalize: push undo command, clear state
#onWheel → zoom
```

---

## Architecture Decision: PointerDevice vs GestureRecognizer

### Option A: New PointerDevice

Replace MouseDevice + TouchDevice with a unified **PointerDevice** using Pointer Events API:

```
PointerDevice (new)
├── Tracks all active pointers (Map<pointerId, {x, y, button}>)
├── Controls:
│   ├── ButtonControl per pointer/button
│   ├── Vec2Control 'position' (primary pointer)
│   ├── Vec2Control 'pointer:{id}' (each active pointer)
│   └── NavigationControl (wheel — keep from MouseDevice)
├── Emits: control:pressed, control:released, control:updated
```

**Pros**: Unified mouse + touch, standard API, simpler
**Cons**: Still no gesture recognition — just better tracking

### Option B: GestureRecognizer (layered on top)

Keep existing devices. Add a **GestureRecognizer** that interprets pointer events into high-level gestures:

```
GestureRecognizer (new)
├── Listens to pointer events on a DOM element
├── Tracks all active pointers internally
├── Recognizes gestures based on pointer patterns
├── Emits gesture events: tap, drag, pinch, pan, longPress, swipe
```

**Pros**: Doesn't touch existing code, composable, focused
**Cons**: Parallel system to InputDevice

### Recommendation: Option B (GestureRecognizer)

The existing InputSystem + devices work well for game inputs. A GestureRecognizer is a separate concern — it transforms raw pointer events into semantic gestures. It can work standalone (no InputSystem needed) or be integrated as an InputDevice later.

---

## GestureRecognizer Design

### API

```js
import GestureRecognizer from '../input/gesture_recognizer.js'

const gestures = new GestureRecognizer(viewportElement, {
    tapThreshold: 10,       // max movement for a tap (px)
    tapMaxDuration: 300,    // max duration for a tap (ms)
    longPressDelay: 500,    // min duration for long press (ms)
    pinchThreshold: 10,     // min distance change to start pinch (px)
    dragThreshold: 5        // min movement to start drag (px)
})

// Gesture events
gestures.on('tap', ({x, y, pointerCount}) => {})
gestures.on('doubletap', ({x, y}) => {})
gestures.on('longpress', ({x, y}) => {})

gestures.on('drag:start', ({x, y, pointerId}) => {})
gestures.on('drag:move', ({x, y, dx, dy, startX, startY}) => {})
gestures.on('drag:end', ({x, y, startX, startY}) => {})

gestures.on('pinch:start', ({centerX, centerY, distance}) => {})
gestures.on('pinch:move', ({centerX, centerY, distance, scale, dx, dy}) => {})
gestures.on('pinch:end', () => {})

gestures.on('pan:start', ({x, y}) => {})           // 2-finger or middle-click
gestures.on('pan:move', ({dx, dy}) => {})
gestures.on('pan:end', () => {})

gestures.on('wheel', ({deltaY, x, y}) => {})

// Lifecycle
gestures.start()
gestures.stop()
gestures.dispose()
```

### Gesture Recognition Logic

```
Pointer events flow:

pointerdown
├── 1 pointer:
│   ├── left button → start drag candidate
│   ├── middle button → start pan immediately
│   └── right button → start pan immediately
│
├── 2 pointers:
│   ├── cancel any active 1-pointer gesture (drag)
│   └── start pinch+pan candidate (track both pointers)
│
└── 3+ pointers:
    └── ignore (or use for multi-finger undo?)

pointermove
├── 1 pointer dragging:
│   ├── if moved > dragThreshold → emit drag:start, then drag:move
│   └── if not started → still in tap/longpress territory
│
├── 2 pointers:
│   ├── distance changed > pinchThreshold → emit pinch:move
│   └── center moved → emit pan:move (combined with pinch)
│
└── middle/right button:
    └── emit pan:move

pointerup
├── 1 pointer:
│   ├── if was dragging → emit drag:end
│   ├── if duration < tapMaxDuration and movement < tapThreshold → emit tap
│   └── if duration > longPressDelay and movement < tapThreshold → emit longpress
│
├── 2→1 pointer:
│   └── emit pinch:end
│
└── middle/right button:
    └── emit pan:end

wheel
└── emit wheel with {deltaY, x, y}
```

### Pointer Tracking State

```js
class GestureRecognizer {
    #pointers = new Map()       // pointerId → {x, y, startX, startY, startTime, button}
    #gestureState = 'idle'      // idle | tap-candidate | dragging | panning | pinching
    #pinchStartDist = 0
    #pinchStartCenter = {x: 0, y: 0}
    #longPressTimer = null
}
```

### Multi-finger Tap (Procreate Undo/Redo)

```
2-finger tap → undo
3-finger tap → redo

Detection:
- 2 (or 3) pointers arrive within 100ms of each other
- All pointers release within tapMaxDuration
- No pointer moves more than tapThreshold
- Emit tap with pointerCount: 2 (or 3)
```

The consumer decides what to do:
```js
gestures.on('tap', ({pointerCount}) => {
    if (pointerCount === 2) undo()
    if (pointerCount === 3) redo()
})
```

---

## Integration with SceneView

### Before (current ~150 lines in SceneView)

```js
class SceneView {
    #pointers = new Map()
    #drag = null

    #setupInputEvents(viewport) {
        viewport.addEventListener('pointerdown', ...)
        viewport.addEventListener('pointermove', ...)
        viewport.addEventListener('pointerup', ...)
        viewport.addEventListener('wheel', ...)
    }

    #onPointerDown(e) { /* 30 lines: detect select/pan/drag, track pointers */ }
    #onPointerMove(e) { /* 40 lines: handle drag/pan/pinch */ }
    #onPointerUp(e) { /* 20 lines: finalize, push undo */ }
    #startPan(e) { /* 10 lines */ }
    #startPinch() { /* 10 lines */ }
    #handleEntityDrag(e) { /* 15 lines */ }
    #handlePinchMove() { /* 15 lines */ }
    #pushMoveCommand() { /* 15 lines */ }
    #onWheel(e) { /* 5 lines */ }
}
```

### After (with GestureRecognizer)

```js
class SceneView {
    #gestures = null

    #setupInputEvents(viewport) {
        this.#gestures = new GestureRecognizer(viewport)

        this.#gestures.on('tap', ({x, y}) => {
            const world = this.camera.screenToWorld(x, y)
            const hit = this.#pickEntity(world.x, world.y)
            this.#selectEntity(hit)
        })

        this.#gestures.on('tap', ({pointerCount}) => {
            if (pointerCount === 2) this.undoAction()
            if (pointerCount === 3) this.redoAction()
        })

        this.#gestures.on('drag:start', ({x, y}) => {
            const world = this.camera.screenToWorld(x, y)
            const hit = this.#pickEntity(world.x, world.y)
            if (hit >= 0) this.#startEntityDrag(hit, world)
        })

        this.#gestures.on('drag:move', ({x, y}) => {
            this.#updateEntityDrag(x, y)
        })

        this.#gestures.on('drag:end', () => {
            this.#pushMoveCommand()
        })

        this.#gestures.on('pinch:move', ({scale, dx, dy}) => {
            this.camera.zoom = clamp(this.#startZoom * scale, 0.1, 10)
        })

        this.#gestures.on('pan:move', ({dx, dy}) => {
            const ppu = this.camera.pixelsPerUnit
            this.camera.x -= dx / ppu
            this.camera.y += dy / ppu
        })

        this.#gestures.on('wheel', ({deltaY, x, y}) => {
            const factor = deltaY > 0 ? 0.9 : 1.1
            this.camera.zoom = clamp(this.camera.zoom * factor, 0.1, 10)
        })

        this.#gestures.start()
    }
}
```

SceneView drops from ~150 lines of input handling to ~40 lines of gesture callbacks.

---

## Integration with Games

The GestureRecognizer is useful for games too:

```js
// Mobile game controller
const gestures = new GestureRecognizer(game.element)

gestures.on('tap', ({x, y}) => {
    const world = camera.screenToWorld(x, y)
    game.execute('interact', world)
})

gestures.on('drag:move', ({dx, dy}) => {
    player.aim(dx, dy)
})

gestures.on('pinch:move', ({scale}) => {
    camera.zoom = scale
})
```

Could also be wrapped as an InputDevice for full InputSystem integration:

```js
class GestureDevice extends InputDevice {
    // Wraps GestureRecognizer, exposes gestures as controls
    // tap → ButtonControl (press+release)
    // drag → Vec2Control (position) + ButtonControl (active)
    // pinch → ValueControl (scale)
}
```

This is optional — GestureRecognizer works standalone.

---

## Implementation Plan

### Phase 1 — Core GestureRecognizer
> Pointer tracking + basic gesture detection

- [ ] `input/gesture_recognizer.js` — extends Notifier
- [ ] Pointer tracking: Map of active pointers with positions + start data
- [ ] Gesture state machine: idle → tap-candidate → dragging | panning | pinching
- [ ] Single-pointer: tap, drag (start/move/end)
- [ ] Middle/right click: pan (start/move/end)
- [ ] Wheel: emit with delta + position
- [ ] Tests for all single-pointer gestures
- [ ] Tests for wheel

### Phase 2 — Multi-touch
> Pinch zoom + 2-finger pan

- [ ] 2-pointer tracking: distance + center calculation
- [ ] Pinch detection: distance change > threshold
- [ ] Pan detection: center movement (combined with pinch)
- [ ] Cancel active drag when 2nd pointer arrives
- [ ] pinch:start / pinch:move / pinch:end events
- [ ] Tests for pinch + pan

### Phase 3 — Advanced Gestures
> Long press, multi-finger tap, double tap

- [ ] Long press: timer-based, cancel on move
- [ ] Multi-finger tap: 2-finger tap (undo), 3-finger tap (redo)
- [ ] Double tap: timing-based detection
- [ ] Edge swipe: detect swipe starting from screen edge (drawer open)
- [ ] Tests for all

### Phase 4 — SceneView Integration
> Replace inline input handling with GestureRecognizer

- [ ] Create GestureRecognizer in SceneView.buildContent()
- [ ] Wire gesture events to existing entity/camera methods
- [ ] Remove #pointers, #drag, #onPointer*, #startPan, #startPinch, #handleEntityDrag, #handlePinchMove
- [ ] Verify all interactions still work (tap, drag, pan, pinch, wheel)
- [ ] Verify undo push on drag:end

### Phase 5 — Optional: GestureDevice
> Wrap as InputDevice for InputSystem integration

- [ ] `input/input_devices/gesture_device.js` extends InputDevice
- [ ] Exposes gestures as controls (tap=ButtonControl, drag=Vec2Control, etc.)
- [ ] Registers with InputSystem like keyboard/mouse/touch
- [ ] Gesture actions bindable via InputBinder
- [ ] Tests

---

## Files to Create

```
input/
├── gesture_recognizer.js       — core class (Notifier-based)
├── gesture_recognizer.test.js
├── gesture_recognizer.doc.js   — optional
└── input_devices/
    ├── gesture_device.js       — optional InputDevice wrapper (Phase 5)
    └── gesture_device.test.js
```

---

## Existing Code Reference

### What SceneView currently does (to be replaced)

Key methods in `studio/scene/scene_view.js`:
- `#setupInputEvents(viewport)` — wires pointer + wheel listeners (line ~578)
- `#onPointerDown(e)` — detects select/pan/drag, tracks pointers (line ~588)
- `#onPointerMove(e)` — handles drag/pan/pinch move (line ~642)
- `#onPointerUp(e)` — finalizes gestures, pushes undo (line ~713)
- `#startPan(e, cam)` — initiates camera pan (line ~630)
- `#startPinch()` — initiates pinch zoom (line ~639)
- `#handleEntityDrag(e)` — updates entity position during drag (line ~673)
- `#handlePinchMove()` — updates camera zoom during pinch (line ~688)
- `#pushMoveCommand()` — creates undo entry after drag (line ~725)
- `#onWheel(e)` — zoom on scroll (line ~743)

### Existing InputSystem patterns to follow

- Extend **Notifier** for event emission (like InputControl)
- Use **constructor params** for thresholds (like TouchDevice)
- Support **start/stop lifecycle** (like all InputDevices)
- Track state with **#private fields** (like TouchDevice.#activeTouch)
- **No comments** — code must be self-documenting
- **Test everything** — sibling .test.js file

### TouchDevice patterns to reuse/improve

TouchDevice already has:
- Tap detection with threshold + duration (lines 207–218)
- Swipe detection with threshold (lines 146–189)
- Single touch tracking with start/current positions

But it lacks:
- Multi-touch (only tracks first touch)
- Pinch/zoom
- Drag concept (just position + delta)

GestureRecognizer supersedes TouchDevice for multi-touch but they can coexist.

---

## Open Questions

- Should GestureRecognizer use Pointer Events (recommended) or Touch Events?
  - **Pointer Events**: unified mouse+touch+pen, simpler API, better browser support
  - **Touch Events**: lower level, more control, but separate from mouse
  - **Recommendation**: Pointer Events (same approach as SceneView currently uses)

- Should pinch and pan be separate events or combined?
  - iOS/Procreate: pinch and pan happen simultaneously
  - Current SceneView: handles both in #handlePinchMove
  - **Recommendation**: emit both simultaneously, let consumer decide

- Should GestureRecognizer manage preventDefault or let the consumer decide?
  - **Recommendation**: GestureRecognizer calls preventDefault by default (configurable). Set `touch-action: none` on the element.

- How to handle drag threshold vs immediate drag?
  - Some tools want immediate drag (entity placement)
  - Some want threshold (to distinguish tap from drag)
  - **Recommendation**: configurable per instance, default threshold of 5px
