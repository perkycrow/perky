# Input

Unified input handling for keyboard, mouse, touch, and gamepads. Maps raw device events to game actions through a binding system.

---

## How it fits together

```
InputSystem
    ├── InputBinder (bindings)
    │
    └── InputDevice ──┬── KeyboardDevice
                      ├── MouseDevice
                      └── TouchDevice
                              │
                        InputControl ──┬── ButtonControl
                                       ├── Vec2Control
                                       └── NavigationControl
```

InputSystem registers devices, each device creates controls, and the binder maps controls to actions. Query by device/control or by action name.

---

## The files that matter

### [input_system.js](input_system.js)

The main entry point. Installs into an Application and provides a unified API for all input.

```js
const bindings = [
    {controlName: 'KeyW', actionName: 'moveUp'},
    {controlName: 'KeyS', actionName: 'moveDown'},
    {controlName: 'leftButton', actionName: 'shoot'}
]

class MyGame extends Application {
    static manifest = {
        systems: {
            inputSystem: {bindings}
        }
    }
}

// Direct queries
app.isKeyPressed('Space')
app.isMousePressed('leftButton')
app.isTouchPressed('swipeUp')

// Action queries (uses bindings)
app.isActionPressed('shoot')
app.getDirection('move')  // Vec2 from moveUp/Down/Left/Right

// Events
app.on('input:triggered', (binding, event) => {
    app.execute(binding.actionName)
})
```

Most methods are delegated to the host Application, so you call them directly on `app`.

---

### [input_device.js](input_device.js)

Base class for all input devices. Manages a registry of controls and emits events when they change.

```js
class CustomDevice extends InputDevice {
    onStart () {
        // attach listeners
    }

    onStop () {
        // remove listeners
    }
}

device.registerControl(new ButtonControl({device, name: 'fire'}))
device.isPressed('fire')
device.getValueFor('fire')
device.getPressedControls()
```

Built-in devices: `KeyboardDevice`, `MouseDevice`, `TouchDevice`.

---

### [input_control.js](input_control.js)

Base class for controls. A control has a name, a value, and emits `updated` events.

```js
control.setValue(1, event)
control.value      // current value
control.oldValue   // previous value
control.reset()
```

---

### [input_controls/](input_controls/)

Specialized control types:

**ButtonControl** - Binary input with press threshold. Emits `pressed`/`released`.

```js
button.press(event)
button.release(event)
button.isPressed  // true if value >= threshold
```

**Vec2Control** - 2D position (mouse position, touch position, stick).

```js
vec2.setValue({x: 100, y: 200}, event)
vec2.value  // Vec2 instance
```

**NavigationControl** - Mouse wheel scrolling.

---

### [input_devices/](input_devices/)

**KeyboardDevice** - Creates ButtonControls on-the-fly for each key pressed. Uses `event.code` as names (`KeyW`, `Space`, `ArrowUp`).

**MouseDevice** - Pre-registers controls:
- `leftButton`, `rightButton`, `middleButton`, `backButton`, `forwardButton`
- `position` (Vec2Control)
- `navigation` (wheel)

**TouchDevice** - Swipe and tap detection:
- `swipeUp`, `swipeDown`, `swipeLeft`, `swipeRight`
- `tap`
- `position`, `delta` (Vec2Controls)

---

### [input_binder.js](input_binder.js)

Maps device+control pairs to action names. Supports multiple bindings per action.

```js
app.bindInput({
    controlName: 'KeyW',
    actionName: 'moveUp'
})

app.bindInput({
    deviceName: 'mouse',
    controlName: 'leftButton',
    actionName: 'shoot',
    eventType: 'released'  // default is 'pressed'
})

app.getBindingsForAction('shoot')
app.getBindingsForInput({deviceName: 'keyboard', controlName: 'KeyW', eventType: 'pressed'})
app.unbind({controlName: 'KeyW', actionName: 'moveUp'})
```

Device names are auto-detected from control names when not specified.

---

### [input_binding.js](input_binding.js) + [composite_binding.js](composite_binding.js)

Data classes for bindings. `CompositeBinding` handles key combos.

```js
// Single binding
app.bindInput({controlName: 'KeyS', actionName: 'save'})

// Combo binding - triggers only when all keys are pressed
app.bindCombo(['ControlLeft', 'KeyS'], 'save')
```

---

### [gamepad_info.js](gamepad_info.js)

Parses gamepad IDs to detect controller type (Xbox, PlayStation, Switch, etc.). Handles browser differences between Chrome and Firefox formats.

```js
const info = new GamepadInfo(navigator.getGamepads()[0].id)
info.type   // 'xbox', 'ps4', 'ps5', 'switch', 'generic'
info.vendor // '045e'
info.model  // 'dualsense'
```

---

## Going further

Each file has its `.doc.js` with examples. Check [InputSystem doc](https://perkycrow.com/doc/input_input_system.html) for the full API.
