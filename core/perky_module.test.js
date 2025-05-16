import PerkyModule from './perky_module'
import {vi} from 'vitest'


describe(PerkyModule, () => {

    let module

    beforeEach(() => {
        module = new PerkyModule()
    })


    test('running', () => {
        expect(module.running).toBe(false)
        
        module.initialized = true
        expect(module.running).toBe(false)
        
        module.started = true
        expect(module.running).toBe(true)
    })


    test('init', () => {
        expect(module.initialized).toBe(true)
    })


    test('init false', () => {
        module.initialized = true
        expect(module.init()).toBe(false)
    })


    test('start', () => {
        const spy = vi.spyOn(module, 'emit')

        module.initialized = true
        expect(module.start()).toBe(true)
        expect(module.started).toBe(true)
        expect(spy).toHaveBeenCalled()
    })


    test('start false', () => {
        module.initialized = true
        module.started = true
        expect(module.start()).toBe(false)
    })


    test('stop', () => {
        const spy = vi.spyOn(module, 'emit')

        module.initialized = true
        module.started = true
        expect(module.stop()).toBe(true)
        expect(module.started).toBe(false)
        expect(spy).toHaveBeenCalled()
    })


    test('stop false', () => {
        expect(module.stop()).toBe(false)
    })


    test('dispose', () => {
        const spy = vi.spyOn(module, 'emit')
        const stopSpy = vi.spyOn(module, 'stop')
        const removeListenersSpy = vi.spyOn(module, 'removeListeners')

        module.initialized = true
        expect(module.dispose()).toBe(true)
        expect(stopSpy).toHaveBeenCalled()
        expect(spy).toHaveBeenCalled()
        expect(removeListenersSpy).toHaveBeenCalled()
        expect(module.initialized).toBe(false)
        expect(module.started).toBe(false)
    })

})
