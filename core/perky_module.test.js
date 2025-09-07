import PerkyModule from './perky_module'
import {vi} from 'vitest'


describe(PerkyModule, () => {

    let module

    beforeEach(() => {
        module = new PerkyModule()
    })


    test('running', () => {
        expect(module.running).toBe(false)


        module.started = true
        expect(module.running).toBe(true)
    })


    test('start', () => {
        const spy = vi.spyOn(module, 'emit')

        expect(module.start()).toBe(true)
        expect(module.started).toBe(true)
        expect(spy).toHaveBeenCalled()
    })


    test('start false', () => {
        module.started = true
        expect(module.start()).toBe(false)
    })


    test('stop', () => {
        const spy = vi.spyOn(module, 'emit')

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

        expect(module.dispose()).toBe(true)
        expect(stopSpy).toHaveBeenCalled()
        expect(spy).toHaveBeenCalled()
        expect(removeListenersSpy).toHaveBeenCalled()
        expect(module.started).toBe(false)
    })


    test('dispose multiple calls', () => {
        const emitSpy = vi.spyOn(module, 'emit')
        const stopSpy = vi.spyOn(module, 'stop')
        const removeListenersSpy = vi.spyOn(module, 'removeListeners')

        expect(module.dispose()).toBe(true)
        expect(emitSpy).toHaveBeenCalledWith('dispose')
        expect(stopSpy).toHaveBeenCalledTimes(1)
        expect(removeListenersSpy).toHaveBeenCalledTimes(1)

        emitSpy.mockClear()
        stopSpy.mockClear()
        removeListenersSpy.mockClear()

        expect(module.dispose()).toBe(false)
        expect(emitSpy).not.toHaveBeenCalledWith('dispose')
        expect(stopSpy).not.toHaveBeenCalled()
        expect(removeListenersSpy).not.toHaveBeenCalled()
    })

})
