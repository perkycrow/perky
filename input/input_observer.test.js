import InputObserver from './input_observer'
import InputDevice from './input_device'
import KeyboardDevice from './input_devices/keyboard_device'
import {vi} from 'vitest'


class GamepadDevice extends InputDevice {
    static methods = ['getAxisValue', 'isButtonPressed']
    static events = ['buttondown', 'buttonup']

    constructor () {
        super()
        this.getAxisValue = vi.fn()
        this.isButtonPressed = vi.fn()
    }
    
    observe () { // eslint-disable-line class-methods-use-this
        return true
    }
    
    unobserve () { // eslint-disable-line class-methods-use-this
        return true
    }
}


class TouchTestDevice extends InputDevice {
    static methods = ['getTouches', 'isKeyPressed']
    static events = ['touchstart', 'touchend']

    constructor () {
        super()
        this.getTouches = vi.fn()
        this.isKeyPressed = vi.fn(() => true)
    }
    
    observe () { // eslint-disable-line class-methods-use-this
        return true
    }
    
    unobserve () { // eslint-disable-line class-methods-use-this
        return true
    }
}


describe(InputObserver, () => {

    let observer
    let keyboard

    beforeEach(() => {
        observer = new InputObserver({mouse: false, keyboard: false})
        keyboard = new KeyboardDevice()
    })


    test('constructor', () => {
        expect(observer.devices).toBeDefined()
        expect(observer.eventsMap).toEqual({})
        expect(observer.methodsMap).toEqual({})
    })


    test('registerDevice', () => {
        observer.registerDevice('keyboard', keyboard)
        
        expect(observer.devices.get('keyboard')).toBe(keyboard)

        expect(observer.keyboard).toBe(keyboard)
    })


    test('unregisterDevice', () => {
        observer.registerDevice('keyboard', keyboard)
        const result = observer.unregisterDevice('keyboard')
        
        expect(result).toBe(true)
        expect(observer.devices.get('keyboard')).toBeUndefined()
        expect(observer.keyboard).toBeUndefined()
    })


    test('unregisterDevice non-existent', () => {
        const result = observer.unregisterDevice('nonexistent')
        expect(result).toBe(false)
    })


    test('methods getter', () => {
        expect(observer.methods).toEqual([])
        
        observer.registerDevice('keyboard', keyboard)
        
        expect(observer.methods).toContain('isKeyPressed')
        expect(observer.methods).toContain('isKeyModifierPressed')
        expect(observer.methods).toContain('getPressedKeys')
        expect(observer.methods).toContain('getPressedKeyModifiers')
    })


    test('events getter', () => {
        expect(observer.events).toEqual([])
        
        observer.registerDevice('keyboard', keyboard)
        
        expect(observer.events).toContain('keydown')
        expect(observer.events).toContain('keyup')
    })


    test('method proxying', () => {
        observer.registerDevice('keyboard', keyboard)

        expect(typeof observer.isKeyPressed).toBe('function')
        expect(typeof observer.isKeyModifierPressed).toBe('function')
        expect(typeof observer.getPressedKeys).toBe('function')
        expect(typeof observer.getPressedKeyModifiers).toBe('function')

        const spy = vi.spyOn(keyboard, 'isKeyPressed')
        observer.isKeyPressed('KeyA')
        expect(spy).toHaveBeenCalledWith('KeyA')
    })


    test('event proxying', () => {
        const observerListener = vi.fn()
        observer.on('keydown', observerListener)
        
        observer.registerDevice('keyboard', keyboard)
        keyboard.start()

        window.dispatchEvent(new KeyboardEvent('keydown', {
            code: 'KeyA',
            key: 'a'
        }))
        
        expect(observerListener).toHaveBeenCalled()
        expect(observerListener.mock.calls[0][1]).toBe('keyboard')
        expect(observerListener.mock.calls[0][2]).toBe(keyboard)
        
        keyboard.stop()
    })


    test('adding multiple devices', () => {
        const gamepad = new GamepadDevice()
        
        observer.registerDevice('keyboard', keyboard)
        observer.registerDevice('gamepad', gamepad)

        expect(observer.methods).toContain('isKeyPressed')
        expect(observer.methods).toContain('getAxisValue')
        expect(observer.methods).toContain('isButtonPressed')
        
        expect(observer.events).toContain('keydown')
        expect(observer.events).toContain('buttondown')
    })


    test('removing devices cleans up maps', () => {
        observer.registerDevice('keyboard', keyboard)
        
        expect(observer.methodsMap.isKeyPressed).toContain('keyboard')
        expect(observer.eventsMap.keydown).toContain('keyboard')
        
        observer.unregisterDevice('keyboard')
        
        expect(observer.methodsMap.isKeyPressed || []).not.toContain('keyboard')
        expect(observer.eventsMap.keydown || []).not.toContain('keyboard')
    })


    test('removing one device but keeping another', () => {
        const touchDevice = new TouchTestDevice()
        
        observer.registerDevice('keyboard', keyboard)
        observer.registerDevice('touch', touchDevice)

        expect(observer.methodsMap.isKeyPressed).toContain('keyboard')
        expect(observer.methodsMap.isKeyPressed).toContain('touch')

        observer.unregisterDevice('keyboard')

        expect(typeof observer.isKeyPressed).toBe('function')
        expect(observer.methodsMap.isKeyPressed).toEqual(['touch'])

        expect(observer.isKeyModifierPressed).toBeUndefined()
    })

})
