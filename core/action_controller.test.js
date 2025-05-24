import ActionController from './action_controller'
import {vi} from 'vitest'


describe(ActionController, () => {

    let controller

    beforeEach(() => {
        controller = new ActionController()
    })


    test('constructor', () => {
        expect(controller.getAction('any')).toBeUndefined()
    })


    test('addAction and getAction', () => {
        const action = vi.fn()
        
        controller.addAction('testAction', action)
        
        expect(controller.getAction('testAction')).toBe(action)
    })


    test('removeAction', () => {
        const action = vi.fn()
        
        controller.addAction('testAction', action)
        controller.removeAction('testAction')
        
        expect(controller.getAction('testAction')).toBeUndefined()
    })


    test('beforeAction', () => {
        const callback = vi.fn()
        const spy = vi.spyOn(controller, 'on')
        
        controller.beforeAction('testAction', callback)
        
        expect(spy).toHaveBeenCalledWith('beforeAction:testAction', callback)
    })


    test('afterAction', () => {
        const callback = vi.fn()
        const spy = vi.spyOn(controller, 'on')
        
        controller.afterAction('testAction', callback)
        
        expect(spy).toHaveBeenCalledWith('afterAction:testAction', callback)
    })


    test('execute with existing action', () => {
        const action = vi.fn().mockReturnValue('result')
        const beforeCallback = vi.fn().mockReturnValue(true)
        const afterCallback = vi.fn()
        
        controller.addAction('testAction', action)
        controller.beforeAction('testAction', beforeCallback)
        controller.afterAction('testAction', afterCallback)
        
        const result = controller.execute('testAction', 'arg1', 'arg2')
        
        expect(beforeCallback).toHaveBeenCalledWith('arg1', 'arg2')
        expect(action).toHaveBeenCalledWith('arg1', 'arg2')
        expect(afterCallback).toHaveBeenCalledWith('arg1', 'arg2')
        expect(result).toBe('result')
    })


    test('execute with beforeAction returning false', () => {
        const action = vi.fn()
        const beforeCallback = vi.fn().mockReturnValue(false)
        const afterCallback = vi.fn()
        
        controller.addAction('testAction', action)
        controller.beforeAction('testAction', beforeCallback)
        controller.afterAction('testAction', afterCallback)
        
        const result = controller.execute('testAction', 'arg1', 'arg2')
        
        expect(beforeCallback).toHaveBeenCalledWith('arg1', 'arg2')
        expect(action).not.toHaveBeenCalled()
        expect(afterCallback).not.toHaveBeenCalled()
        expect(result).toBe(false)
    })


    test('execute with non-existent action', () => {
        const result = controller.execute('nonExistentAction', 'arg1', 'arg2')
        
        expect(result).toBe(false)
    })


    test('multiple callbacks', () => {
        const action = vi.fn()
        const beforeCallback1 = vi.fn().mockReturnValue(true)
        const beforeCallback2 = vi.fn().mockReturnValue(true)
        const afterCallback1 = vi.fn()
        const afterCallback2 = vi.fn()
        
        controller.addAction('testAction', action)
        controller.beforeAction('testAction', beforeCallback1)
        controller.beforeAction('testAction', beforeCallback2)
        controller.afterAction('testAction', afterCallback1)
        controller.afterAction('testAction', afterCallback2)
        
        controller.execute('testAction', 'arg')
        
        expect(beforeCallback1).toHaveBeenCalledWith('arg')
        expect(beforeCallback2).toHaveBeenCalledWith('arg')
        expect(action).toHaveBeenCalledWith('arg')
        expect(afterCallback1).toHaveBeenCalledWith('arg')
        expect(afterCallback2).toHaveBeenCalledWith('arg')
    })

})
