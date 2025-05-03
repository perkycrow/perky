import ActionDispatcher from './action_dispatcher'
import {vi} from 'vitest'


describe(ActionDispatcher, () => {

    let dispatcher

    beforeEach(() => {
        dispatcher = new ActionDispatcher()
    })


    test('register', () => {
        const controller = {execute: vi.fn()}
        const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})

        dispatcher.register('test', controller)
        expect(dispatcher.getController('test')).toBe(controller)

        dispatcher.register('test', controller)
        expect(spy).toHaveBeenCalledWith('Controller "test" already registered. Overwriting...')

        spy.mockRestore()
    })


    test('unregister', () => {
        const controller = {execute: vi.fn()}
        
        dispatcher.register('test', controller)
        expect(dispatcher.unregister('test')).toBe(true)
        expect(dispatcher.getController('test')).toBeUndefined()
        
        expect(dispatcher.unregister('nonexistent')).toBe(false)
    })


    test('unregister active controller', () => {
        const controller = {execute: vi.fn()}
        
        dispatcher.register('test', controller)
        dispatcher.setActive('test')
        
        expect(dispatcher.activeControllerName).toBe('test')
        expect(dispatcher.unregister('test')).toBe(true)
        expect(dispatcher.activeControllerName).toBeNull()
    })


    test('getController', () => {
        const controller = {execute: vi.fn()}
        
        dispatcher.register('test', controller)
        expect(dispatcher.getController('test')).toBe(controller)
        expect(dispatcher.getController('nonexistent')).toBeUndefined()
    })


    test('getNameFor', () => {
        const controller1 = {execute: vi.fn()}
        const controller2 = {execute: vi.fn()}
        
        dispatcher.register('test1', controller1)
        dispatcher.register('test2', controller2)
        
        expect(dispatcher.getNameFor(controller1)).toBe('test1')
        expect(dispatcher.getNameFor(controller2)).toBe('test2')
        expect(dispatcher.getNameFor({})).toBeUndefined()
    })


    test('setActive', () => {
        const controller = {execute: vi.fn()}
        const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        
        dispatcher.register('test', controller)
        expect(dispatcher.setActive('test')).toBe(true)
        expect(dispatcher.activeControllerName).toBe('test')
        
        expect(dispatcher.setActive('nonexistent')).toBe(false)
        expect(spy).toHaveBeenCalledWith('Controller "nonexistent" not found. Cannot set as active controller.')
        
        spy.mockRestore()
    })


    test('getActive', () => {
        const controller = {execute: vi.fn()}
        
        dispatcher.register('test', controller)
        dispatcher.setActive('test')
        
        expect(dispatcher.getActive()).toBe(controller)
    })


    test('dispatch with no active controller', () => {
        const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        
        expect(dispatcher.dispatch('action')).toBe(false)
        expect(spy).toHaveBeenCalledWith('No active controller set for action dispatch')
        
        spy.mockRestore()
    })


    test('dispatch to active controller with execute method', () => {
        const controller = {execute: vi.fn()}
        
        dispatcher.register('test', controller)
        dispatcher.setActive('test')
        
        expect(dispatcher.dispatch('action', 'arg1', 'arg2')).toBe(true)
        expect(controller.execute).toHaveBeenCalledWith('action', 'arg1', 'arg2')
    })


    test('dispatch to active controller with action method', () => {
        const actionFn = vi.fn()
        const controller = {action: actionFn}
        
        dispatcher.register('test', controller)
        dispatcher.setActive('test')
        
        expect(dispatcher.dispatch('action', 'arg1', 'arg2')).toBe(true)
        expect(actionFn).toHaveBeenCalledWith('arg1', 'arg2')
    })


    test('dispatch to active controller with no matching method', () => {
        const controller = {}
        
        dispatcher.register('test', controller)
        dispatcher.setActive('test')
        
        expect(dispatcher.dispatch('action')).toBe(false)
    })


    test('dispatchTo with execute method', () => {
        const controller = {execute: vi.fn()}
        
        dispatcher.register('test', controller)
        
        expect(dispatcher.dispatchTo('test', 'action', 'arg1', 'arg2')).toBe(true)
        expect(controller.execute).toHaveBeenCalledWith('action', 'arg1', 'arg2')
    })


    test('dispatchTo with action method', () => {
        const actionFn = vi.fn()
        const controller = {action: actionFn}
        
        dispatcher.register('test', controller)
        
        expect(dispatcher.dispatchTo('test', 'action', 'arg1', 'arg2')).toBe(true)
        expect(actionFn).toHaveBeenCalledWith('arg1', 'arg2')
    })


    test('dispatchTo with no matching method', () => {
        const controller = {}
        
        dispatcher.register('test', controller)
        
        expect(dispatcher.dispatchTo('test', 'action')).toBe(false)
    })


    test('dispatchTo nonexistent controller', () => {
        expect(dispatcher.dispatchTo('nonexistent', 'action')).toBe(false)
    })


    test('delete event', () => {
        const controller = {dispose: vi.fn()}

        dispatcher.register('test', controller)
        dispatcher.unregister('test')
        
        expect(controller.dispose).toHaveBeenCalled()
    })

})
