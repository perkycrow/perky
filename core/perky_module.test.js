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
        const spy = vi.spyOn(module, 'emit')
        
        expect(module.initialized).toBe(false)
        expect(module.init('param')).toBe(true)
        expect(module.initialized).toBe(true)
        expect(spy).toHaveBeenCalledWith('init', 'param')
    })


    test('init false', () => {
        module.initialized = true
        expect(module.init()).toBe(false)
    })


    test('start', () => {
        const spy = vi.spyOn(module, 'emit')

        module.initialized = true
        expect(module.start('param')).toBe(true)
        expect(module.started).toBe(true)
        expect(spy).toHaveBeenCalledWith('start', 'param')
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
        expect(module.stop('param')).toBe(true)
        expect(module.started).toBe(false)
        expect(spy).toHaveBeenCalledWith('stop', 'param')
    })


    test('stop false', () => {
        expect(module.stop()).toBe(false)
    })


    test('dispose', () => {
        const spy = vi.spyOn(module, 'emit')
        const stopSpy = vi.spyOn(module, 'stop')
        const removeListenersSpy = vi.spyOn(module, 'removeListeners')

        module.initialized = true
        expect(module.dispose('param')).toBe(true)
        expect(stopSpy).toHaveBeenCalled()
        expect(spy).toHaveBeenCalledWith('dispose', 'param')
        expect(removeListenersSpy).toHaveBeenCalled()
        expect(module.initialized).toBe(false)
        expect(module.started).toBe(false)
    })


    test('dispose false', () => {
        expect(module.dispose()).toBe(false)
    })

})
