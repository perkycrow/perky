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
        
        module.paused = true
        expect(module.running).toBe(false)
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


    test('update', () => {
        const spy = vi.spyOn(module, 'emit')

        module.initialized = true
        module.started = true
        expect(module.update('param')).toBe(true)
        expect(spy).toHaveBeenCalledWith('update', 'param')
    })


    test('update false', () => {
        expect(module.update()).toBe(false)
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


    test('pause', () => {
        const spy = vi.spyOn(module, 'emit')

        module.initialized = true
        module.started = true
        expect(module.pause('param')).toBe(true)
        expect(module.paused).toBe(true)
        expect(spy).toHaveBeenCalledWith('pause', 'param')
    })


    test('pause false', () => {
        expect(module.pause()).toBe(false)
    })


    test('resume', () => {
        const spy = vi.spyOn(module, 'emit')

        module.initialized = true
        module.started = true
        module.paused = true
        expect(module.resume('param')).toBe(true)
        expect(module.paused).toBe(false)
        expect(spy).toHaveBeenCalledWith('resume', 'param')
    })


    test('resume false', () => {
        expect(module.resume()).toBe(false)

        module.initialized = true
        expect(module.resume()).toBe(false)
        
        module.started = true
        expect(module.resume()).toBe(false)
    })

})
