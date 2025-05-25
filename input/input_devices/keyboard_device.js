import InputDevice from '../input_device'
import KeyControl from '../input_controls/key_control'


export default class KeyboardDevice extends InputDevice {

    static methods = [
        'isKeyPressed',
        'isKeyModifierPressed',
        'getPressedKeys',
        'getPressedKeyModifiers'
    ]

    static events = [
        'keydown',
        'keyup'
    ]


    constructor (params = {}) {
        super(params)

        this.pressedKeys = {}
        this.pressedModifiers = {}
    }


    observe () {
        return observe(this)
    }


    unobserve () {
        return unobserve(this)
    }


    isPressed (code) {
        return this.isKeyPressed(code) || this.isKeyModifierPressed(code)
    }


    isKeyPressed (code) {
        return code in this.pressedKeys
    }


    isKeyModifierPressed (code) {
        return code in this.pressedModifiers
    }


    getPressedKeys () {
        return Object.keys(this.pressedKeys)
    }


    getPressedKeyModifiers () {
        return Object.keys(this.pressedModifiers)
    }


    getOrCreateKeyControl (code, key = null) {
        let keyControl = this.getControl(code)
        
        if (!keyControl) {
            keyControl = new KeyControl({
                device: this,
                name: code,
                displayName: getKeyDisplayName(code, key)
            })
            this.addControl(code, keyControl)
        }
        
        return keyControl
    }

}


function observe (device) {

    if (device.keyboardListeners) {
        return false
    }

    const listeners = {
        keydown (event) {
            const modifiers = getModifiers(event)
            const keyState = createKeyState(event, modifiers)

            updateModifiers(device, modifiers)
            device.pressedKeys[event.code] = keyState

            const keyControl = device.getOrCreateKeyControl(event.code, event.key)
            keyControl.press()

            device.emit('keydown', keyState)
        },
        keyup (event) {
            const modifiers = getModifiers(event)
            const keyState = createKeyState(event, modifiers)

            delete device.pressedKeys[event.code]
            updateModifiers(device, modifiers)
            
            const keyControl = device.getOrCreateKeyControl(event.code, event.key)
            keyControl.release()
            
            if ((event.code === 'MetaLeft' || event.code === 'MetaRight') && !modifiers.Meta) {
                clearNonModifierKeys(device)
            }
            
            device.emit('keyup', keyState)
        },
        blur () {
            for (const control of device.getAllControls()) {
                if (control.release) {
                    control.release()
                }
            }
            clearAllKeys(device)
            device.emit('blur')
        }
    }

    const {container} = device

    container.addEventListener('keydown', listeners.keydown)
    container.addEventListener('keyup', listeners.keyup)
    window.addEventListener('blur', listeners.blur)

    device.keyboardListeners = listeners

    return true
}


function unobserve (device) {
    const listeners = device.keyboardListeners

    if (listeners) {
        const {container} = device

        container.removeEventListener('keydown', listeners.keydown)
        container.removeEventListener('keyup', listeners.keyup)
        window.removeEventListener('blur', listeners.blur)

        delete device.keyboardListeners

        return true
    }

    return false
}


function createKeyState (event, modifiers = {}) {
    return {
        code:      event.code,
        key:       event.key,
        repeat:    event.repeat,
        modifiers: modifiers
    }
}


function updateModifiers (device, modifiers) {
    device.pressedModifiers = {}

    for (const key in modifiers) {
        if (modifiers[key]) {
            device.pressedModifiers[key] = true
        }
    }
}


function clearNonModifierKeys (device) {
    const modifierCodes = [
        'AltLeft', 'AltRight',
        'ControlLeft', 'ControlRight', 
        'MetaLeft', 'MetaRight',
        'ShiftLeft', 'ShiftRight',
        'CapsLock', 'NumLock'
    ]
    
    for (const code in device.pressedKeys) {
        if (!modifierCodes.includes(code)) {
            delete device.pressedKeys[code]
            const control = device.getControl(code)
            if (control && control.release) {
                control.release()
            }
        }
    }
}


function clearAllKeys (device) {
    device.pressedKeys = {}
    device.pressedModifiers = {}
}


function getKeyDisplayName (code, key = null) {
    const specialKeys = {
        Space: 'Space',
        Enter: 'Enter',
        Escape: 'Esc',
        Tab: 'Tab',
        Backspace: 'Backspace',
        Delete: 'Delete',
        ArrowUp: '↑',
        ArrowDown: '↓',
        ArrowLeft: '←',
        ArrowRight: '→',
        ShiftLeft: 'Left Shift',
        ShiftRight: 'Right Shift',
        ControlLeft: 'Left Ctrl',
        ControlRight: 'Right Ctrl',
        AltLeft: 'Left Alt',
        AltRight: 'Right Alt',
        MetaLeft: 'Left Cmd',
        MetaRight: 'Right Cmd'
    }

    if (specialKeys[code]) {
        return specialKeys[code]
    }

    if (key && key.length === 1 && key !== ' ') {
        return key.toUpperCase()
    }

    return code.replace('Key', '').replace('Digit', '')
}


const MODIFIERS = [
    'Alt',
    'Control',
    'Meta',
    'Shift',
    'CapsLock',
    'NumLock',
    'AltGraph'
]


function getModifiers (event) {
    const modifiers = {}

    for (const key of MODIFIERS) {
        const modifier = event.getModifierState(key)
        if (modifier) {
            modifiers[key] = true
        }
    }

    return modifiers
}
