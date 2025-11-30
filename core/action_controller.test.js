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


    test('constructor with actions object', () => {
        const actions = {
            action1: vi.fn(),
            action2: vi.fn(),
            notAFunction: 'not a function'
        }

        const controllerWithActions = new ActionController(actions)

        expect(controllerWithActions.getAction('action1')).toBe(actions.action1)
        expect(controllerWithActions.getAction('action2')).toBe(actions.action2)
        expect(controllerWithActions.getAction('notAFunction')).toBeUndefined()
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


    test('hasAction - registered action', () => {
        const action = vi.fn()
        controller.addAction('testAction', action)

        expect(controller.hasAction('testAction')).toBe(true)
    })


    test('hasAction - method action', () => {
        class TestController extends ActionController {
            testMethod () { } // eslint-disable-line class-methods-use-this
        }

        const testController = new TestController()
        expect(testController.hasAction('testMethod')).toBe(true)
    })


    test('hasAction - non-existent action', () => {
        expect(controller.hasAction('nonExistent')).toBe(false)
    })


    test('shouldPropagate - default (no propagable)', () => {
        expect(controller.shouldPropagate('anyAction')).toBe(false)
    })


    test('shouldPropagate - with propagable whitelist', () => {
        class TestController extends ActionController {
            static propagable = ['move', 'look']
        }

        const testController = new TestController()

        expect(testController.shouldPropagate('move')).toBe(true)
        expect(testController.shouldPropagate('look')).toBe(true)
        expect(testController.shouldPropagate('shoot')).toBe(false)
    })


    test('listActions - registered actions', () => {
        controller.addAction('action1', vi.fn())
        controller.addAction('action2', vi.fn())

        const actions = controller.listActions()

        expect(actions).toContain('action1')
        expect(actions).toContain('action2')
    })


    test('listActions - method actions', () => {
        class TestController extends ActionController {
            jump () { } // eslint-disable-line class-methods-use-this
            move () { } // eslint-disable-line class-methods-use-this
        }

        const testController = new TestController()
        const actions = testController.listActions()

        expect(actions).toContain('jump')
        expect(actions).toContain('move')
    })


    test('listActions - excludes internal methods', () => {
        const actions = controller.listActions()

        expect(actions).not.toContain('start')
        expect(actions).not.toContain('stop')
        expect(actions).not.toContain('addAction')
        expect(actions).not.toContain('execute')
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


    test('execute with existing registered action', () => {
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


    test('execute with method action', () => {
        class TestController extends ActionController {
            testMethod = vi.fn().mockReturnValue('method result')
        }

        const testController = new TestController()
        const result = testController.execute('testMethod', 'arg1')

        expect(testController.testMethod).toHaveBeenCalledWith('arg1')
        expect(result).toBe('method result')
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


    test('setContext with string key', () => {
        const result = controller.setContext('playerName', 'Alice')

        expect(controller.context.playerName).toBe('Alice')
        expect(result).toBe(controller.context)
    })


    test('setContext with object', () => {
        const result = controller.setContext({
            playerName: 'Bob',
            score: 100
        })

        expect(controller.context.playerName).toBe('Bob')
        expect(controller.context.score).toBe(100)
        expect(result).toBe(controller.context)
    })


    test('setContext merges object with existing context', () => {
        controller.context.existingKey = 'existingValue'

        controller.setContext({
            newKey: 'newValue'
        })

        expect(controller.context.existingKey).toBe('existingValue')
        expect(controller.context.newKey).toBe('newValue')
    })


    test('clearContext with specific key', () => {
        controller.context.key1 = 'value1'
        controller.context.key2 = 'value2'

        const result = controller.clearContext('key1')

        expect(controller.context.key1).toBeUndefined()
        expect(controller.context.key2).toBe('value2')
        expect(result).toBe(controller.context)
    })


    test('clearContext without key clears all', () => {
        controller.context.key1 = 'value1'
        controller.context.key2 = 'value2'
        controller.context.key3 = 'value3'

        const result = controller.clearContext()

        expect(controller.context.key1).toBeUndefined()
        expect(controller.context.key2).toBeUndefined()
        expect(controller.context.key3).toBeUndefined()
        expect(Object.keys(controller.context).length).toBe(0)
        expect(result).toBe(controller.context)
    })

})
