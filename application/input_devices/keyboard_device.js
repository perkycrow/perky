import InputDevice from '../input_device'


export default class KeyboardDevice extends InputDevice {

    static controls = [
        'key'
    ]

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

            device.emit('keydown', keyState)
        },
        keyup (event) {
            const modifiers = getModifiers(event)
            const keyState = createKeyState(event, modifiers)

            delete device.pressedKeys[event.code]
            updateModifiers(device, modifiers)
            
            // MacOS fix
            if ((event.code === 'MetaLeft' || event.code === 'MetaRight') && !modifiers.Meta) {
                clearNonModifierKeys(device)
            }
            
            device.emit('keyup', keyState)
        },
        blur () {
            // Tab out fix
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
        }
    }
}


function clearAllKeys (device) {
    device.pressedKeys = {}
    device.pressedModifiers = {}
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
