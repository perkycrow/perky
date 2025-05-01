import ActiveModule from '../src/active_module'
import {vi} from 'vitest'


describe(ActiveModule, () => {

    let module

    beforeEach(() => {
        module = new ActiveModule()
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

    it('start', () => {
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

})
