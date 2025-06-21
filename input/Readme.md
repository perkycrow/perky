# Input System

A flexible and extensible input management system for handling multiple input devices (keyboard, mouse, gamepad) and binding them to actions in games or applications.

## Architecture Overview

The input system follows a modular architecture:
- **InputManager**: Central coordinator that manages multiple input devices
- **InputDevice**: Base class for all input devices (keyboard, mouse, etc.)
- **InputControl**: Base class for individual controls (buttons, axes, vectors)
- **InputBinder**: Maps input controls to actions
- **GamepadInfo**: Handles gamepad identification and metadata

## Core Files

### InputManager (`input_manager.js`)

The main entry point that orchestrates all input devices and provides unified access to controls.

```javascript
import InputManager from './input/input_manager'
import KeyboardDevice from './input/input_devices/keyboard_device'

const inputManager = new InputManager()
inputManager.registerDevice('keyboard', new KeyboardDevice())

// Check if a key is pressed on any device
if (inputManager.isPressedAny('Space')) {
    console.log('Space pressed!')
}

// Get value from specific device
const value = inputManager.getValueFor('keyboard', 'KeyW')
```

### InputDevice (`input_device.js`)

Abstract base class for all input devices. Handles control registration and event forwarding.

```javascript
import InputDevice from './input_device'
import ButtonControl from './input_controls/button_control'

class CustomDevice extends InputDevice {
    constructor () {
        super({ name: 'CustomDevice' })
    }
    
    // Create and register a button control
    addButton (name) {
        return this.findOrCreateControl(ButtonControl, { name })
    }
}
```

### InputControl (`input_control.js`)

Base class for all input controls (buttons, axes, vectors). Manages value changes and events.

```javascript
import InputControl from './input_control'

// Custom analog control example
class AnalogControl extends InputControl {
    getDefaultValue () {
        return 0.0
    }
    
    setValue (value) {
        // Clamp value between -1 and 1
        const clampedValue = Math.max(-1, Math.min(1, value))
        return super.setValue(clampedValue)
    }
}
```

### InputBinder (`input_binder.js`)

Maps input controls to action names, supporting multiple bindings per action.

```javascript
import InputBinder from './input_binder'

const binder = new InputBinder()

// Bind keyboard key to action
binder.bind({
    deviceName: 'keyboard',
    controlName: 'KeyW',
    actionName: 'moveForward',
    eventType: 'pressed'
})

// Check bindings for specific input
const bindings = binder.getBindingsForInput({
    deviceName: 'keyboard',
    controlName: 'KeyW',
    eventType: 'pressed'
})
```

### InputBinding (`input_binding.js`)

Represents a single binding between an input control and an action.

```javascript
import InputBinding from './input_binding'

const binding = new InputBinding({
    deviceName: 'keyboard',
    controlName: 'Space',
    actionName: 'jump',
    controllerName: 'player1',
    eventType: 'pressed'
})

console.log(binding.key) // "pressed:jump:player1"
```

### GamepadInfo (`gamepad_info.js`)

Analyzes gamepad metadata to identify controller types and models.

```javascript
import GamepadInfo from './gamepad_info'

const gamepadInfo = new GamepadInfo(navigator.getGamepads()[0].id)

console.log(gamepadInfo.type)   // 'xbox', 'playstation', 'nintendo', etc.
console.log(gamepadInfo.model)  // 'ds4', 'dualsense', etc.
console.log(gamepadInfo.vendor) // Vendor ID
```

## Input Devices

### KeyboardDevice (`input_devices/keyboard_device.js`)

Handles keyboard input using DOM events.

```javascript
import KeyboardDevice from './input_devices/keyboard_device'

const keyboard = new KeyboardDevice({
    shouldPreventDefault: true
})

keyboard.start()

// Keys are automatically registered as ButtonControls
const spaceKey = keyboard.getControl('Space')
if (spaceKey && spaceKey.isPressed) {
    console.log('Space is held down')
}
```

### MouseDevice (`input_devices/mouse_device.js`)

Handles mouse input including buttons and position tracking.

```javascript
import MouseDevice from './input_devices/mouse_device'

const mouse = new MouseDevice()
mouse.start()

// Pre-registered controls
const leftButton = mouse.getControl('leftButton')
const position = mouse.getControl('position')

console.log('Mouse at:', position.value.x, position.value.y)
console.log('Left button pressed:', leftButton.isPressed)
```

## Input Controls

### ButtonControl (`input_controls/button_control.js`)

Represents binary input (pressed/released) with configurable press threshold.

```javascript
import ButtonControl from './input_controls/button_control'

const button = new ButtonControl({
    device: myDevice,
    name: 'myButton',
    pressThreshold: 0.5 // Custom threshold
})

button.on('pressed', (event) => {
    console.log('Button pressed!')
})

button.press() // Manually trigger press
```

### Vec2Control (`input_controls/vec2_control.js`)

Handles 2D vector input (e.g., mouse position, analog stick).

```javascript
import Vec2Control from './input_controls/vec2_control'
import Vec2 from '../math/vec2'

const stick = new Vec2Control({
    device: gamepad,
    name: 'leftStick'
})

stick.setValue(new Vec2(0.5, -0.3))
console.log('Stick position:', stick.value.x, stick.value.y)
```

### Vec3Control (`input_controls/vec3_control.js`)

Handles 3D vector input (e.g., accelerometer, 3D position).

```javascript
import Vec3Control from './input_controls/vec3_control'
import Vec3 from '../math/vec3'

const accelerometer = new Vec3Control({
    device: motionDevice,
    name: 'acceleration'
})

accelerometer.setValue({ x: 0, y: -9.8, z: 0 })
console.log('Acceleration:', accelerometer.value.toString())
```

## Usage Examples

### Basic Setup

```javascript
import InputManager from './input/input_manager'
import KeyboardDevice from './input/input_devices/keyboard_device'
import MouseDevice from './input/input_devices/mouse_device'

const input = new InputManager()
input.registerDevice('keyboard', new KeyboardDevice())
input.registerDevice('mouse', new MouseDevice())

input.start()

// Listen for any control events
input.on('control:pressed', (control, event, device) => {
    console.log(`${control.name} pressed on ${device.name}`)
})
```

### Input Binder

```javascript
import InputBinder from './input/input_binder'

const binder = new InputBinder([
    { deviceName: 'keyboard', controlName: 'KeyW', actionName: 'moveUp' },
    { deviceName: 'keyboard', controlName: 'KeyS', actionName: 'moveDown' },
    { deviceName: 'mouse', controlName: 'leftButton', actionName: 'shoot' }
])

// Export/import bindings
const config = binder.export()
const newBinder = InputBinder.import(config)
```

This input system provides a flexible foundation for handling diverse input scenarios in games and interactive applications. 