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





    test('execute with existing registered action', () => {
        const action = vi.fn()
        const actionListener = vi.fn()
        const genericListener = vi.fn()

        controller.addAction('testAction', action)
        controller.on('testAction', actionListener)
        controller.on('action', genericListener)

        controller.execute('testAction', 'arg1', 'arg2')

        expect(action).toHaveBeenCalledWith('arg1', 'arg2')
        expect(actionListener).toHaveBeenCalledWith('arg1', 'arg2')
        expect(genericListener).toHaveBeenCalledWith('testAction', 'arg1', 'arg2')
    })


    test('execute with method action', () => {
        const action = vi.fn()
        const actionListener = vi.fn()

        controller.addAction('testMethod', action)
        controller.on('testMethod', actionListener)

        controller.execute('testMethod', 'arg1')

        expect(action).toHaveBeenCalledWith('arg1')
        expect(actionListener).toHaveBeenCalledWith('arg1')
    })


    test('execute with non-existent action still emits events', () => {
        const actionListener = vi.fn()
        const genericListener = vi.fn()

        controller.on('nonExistentAction', actionListener)
        controller.on('action', genericListener)

        controller.execute('nonExistentAction', 'arg1', 'arg2')

        expect(actionListener).toHaveBeenCalledWith('arg1', 'arg2')
        expect(genericListener).toHaveBeenCalledWith('nonExistentAction', 'arg1', 'arg2')
    })


    test('multiple event listeners', () => {
        const action = vi.fn()
        const listener1 = vi.fn()
        const listener2 = vi.fn()
        const genericListener = vi.fn()

        controller.addAction('testAction', action)
        controller.on('testAction', listener1)
        controller.on('testAction', listener2)
        controller.on('action', genericListener)

        controller.execute('testAction', 'arg')

        expect(action).toHaveBeenCalledWith('arg')
        expect(listener1).toHaveBeenCalledWith('arg')
        expect(listener2).toHaveBeenCalledWith('arg')
        expect(genericListener).toHaveBeenCalledWith('testAction', 'arg')
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
