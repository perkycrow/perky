import ActionController from './action_controller'
import {vi} from 'vitest'


describe(ActionController, () => {

    let controller

    beforeEach(() => {
        controller = new ActionController()
    })


    test('addAction and getAction', () => {
        const actionMock = vi.fn()
        
        controller.addAction('testAction', actionMock)
        
        expect(controller.getAction('testAction')).toBe(actionMock)
    })


    test('removeAction', () => {
        const actionMock = vi.fn()
        
        controller.addAction('testAction', actionMock)
        expect(controller.getAction('testAction')).toBe(actionMock)
        
        controller.removeAction('testAction')
        expect(controller.getAction('testAction')).toBeUndefined()
    })


    test('addCallback', () => {
        const spy = vi.spyOn(controller, 'on')
        const callback = vi.fn()
        
        controller.addCallback('test', 'testAction', callback)
        
        expect(spy).toHaveBeenCalledWith('testAction:testAction', callback)
    })


    test('beforeAction', () => {
        const spy = vi.spyOn(controller, 'addCallback')
        const callback = vi.fn()
        
        controller.beforeAction('testAction', callback)
        
        expect(spy).toHaveBeenCalledWith('before', 'testAction', callback)
    })


    test('afterAction', () => {
        const spy = vi.spyOn(controller, 'addCallback')
        const callback = vi.fn()
        
        controller.afterAction('testAction', callback)
        
        expect(spy).toHaveBeenCalledWith('after', 'testAction', callback)
    })


    test('execute with existing action', () => {
        const actionMock = vi.fn().mockReturnValue(true)
        const emitCallbacksSpy = vi.spyOn(controller, 'emitCallbacks').mockReturnValue(true)
        
        controller.addAction('testAction', actionMock)
        const result = controller.execute('testAction', 'arg1', 'arg2')
        
        expect(emitCallbacksSpy).toHaveBeenCalledWith('beforeAction:testAction', 'arg1', 'arg2')
        expect(actionMock).toHaveBeenCalledWith('arg1', 'arg2')
        expect(emitCallbacksSpy).toHaveBeenCalledWith('afterAction:testAction', 'arg1', 'arg2')
        expect(result).toBe(true)
    })


    test('execute with non-existent action', () => {
        const result = controller.execute('nonExistentAction')
        
        expect(result).toBe(false)
    })


    test('execute with before callbacks returning false', () => {
        const actionMock = vi.fn()
        const emitCallbacksSpy = vi.spyOn(controller, 'emitCallbacks').mockReturnValue(false)
        
        controller.addAction('testAction', actionMock)
        const result = controller.execute('testAction')
        
        expect(emitCallbacksSpy).toHaveBeenCalledWith('beforeAction:testAction')
        expect(actionMock).not.toHaveBeenCalled()
        expect(result).toBe(false)
    })

})
