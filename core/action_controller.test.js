import ActionController from './action_controller.js'
import PerkyModule from './perky_module.js'
import {vi} from 'vitest'


describe(ActionController, () => {

    let controller

    beforeEach(() => {
        controller = new ActionController()
    })


    test('constructor', () => {
        expect(controller.getAction('any')).toBeUndefined()
    })


    test('static resources is empty by default', () => {
        expect(ActionController.resources).toEqual([])
    })


    describe('engine', () => {

        test('engine is null by default when no host', () => {
            expect(controller.engine).toBeNull()
        })


        test('engine can be set explicitly', () => {
            const mockEngine = {name: 'test'}
            controller.engine = mockEngine

            expect(controller.engine).toBe(mockEngine)
        })


        test('engine falls back to host.engine', () => {
            const mockEngine = {name: 'test'}
            const dispatcher = new PerkyModule()
            dispatcher.engine = mockEngine

            dispatcher.addChild(controller)

            expect(controller.engine).toBe(mockEngine)
        })


        test('engine falls back to host.host', () => {
            const dispatcher = new PerkyModule()
            const app = new PerkyModule()

            app.addChild(dispatcher)
            dispatcher.addChild(controller)

            expect(controller.engine).toBe(app)
        })


        test('engine falls back to host', () => {
            const host = new PerkyModule()
            host.addChild(controller)

            expect(controller.engine).toBe(host)
        })


        test('explicit engine takes priority', () => {
            const explicitEngine = {name: 'explicit'}
            const host = new PerkyModule()
            host.engine = {name: 'host-engine'}

            host.addChild(controller)
            controller.engine = explicitEngine

            expect(controller.engine).toBe(explicitEngine)
        })

    })


    describe('resource getters', () => {

        test('creates getters for static resources', () => {
            class TestController extends ActionController {
                static resources = ['world', 'renderer']
            }

            const mockWorld = {name: 'world'}
            const mockRenderer = {name: 'renderer'}
            const mockEngine = {world: mockWorld, renderer: mockRenderer}

            const testController = new TestController()
            testController.engine = mockEngine

            expect(testController.world).toBe(mockWorld)
            expect(testController.renderer).toBe(mockRenderer)
        })


        test('getters are lazy - engine can be set after construction', () => {
            class TestController extends ActionController {
                static resources = ['world']
            }

            const testController = new TestController()
            expect(testController.world).toBeUndefined()

            const mockWorld = {name: 'world'}
            testController.engine = {world: mockWorld}

            expect(testController.world).toBe(mockWorld)
        })


        test('getters reflect engine changes', () => {
            class TestController extends ActionController {
                static resources = ['world']
            }

            const world1 = {name: 'world1'}
            const world2 = {name: 'world2'}

            const testController = new TestController()
            testController.engine = {world: world1}
            expect(testController.world).toBe(world1)

            testController.engine = {world: world2}
            expect(testController.world).toBe(world2)
        })


        test('can override getter with direct assignment', () => {
            class TestController extends ActionController {
                static resources = ['world']
            }

            const engineWorld = {name: 'engine'}
            const directWorld = {name: 'direct'}

            const testController = new TestController()
            testController.engine = {world: engineWorld}
            testController.world = directWorld

            expect(testController.world).toBe(directWorld)
        })


        test('skips resources already defined on instance', () => {
            class TestController extends ActionController {
                static resources = ['world']
                world = {name: 'predefined'}
            }

            const testController = new TestController()
            testController.engine = {world: {name: 'engine'}}

            expect(testController.world.name).toBe('predefined')
        })

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
            testMethod () { }
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
            jump () { }
            move () { }
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


    test('listActionsWithParams - returns actions with parameters', () => {
        const testController = new ActionController()
        testController.addAction('jump', (height, force = 10) => [height, force])
        testController.addAction('move', (x, y) => [x, y])

        const actionsWithParams = testController.listActionsWithParams()

        const jumpAction = actionsWithParams.find(a => a.name === 'jump')
        expect(jumpAction).toBeDefined()
        expect(jumpAction.params).toEqual([
            {name: 'height', defaultValue: null},
            {name: 'force', defaultValue: '10'}
        ])

        const moveAction = actionsWithParams.find(a => a.name === 'move')
        expect(moveAction).toBeDefined()
        expect(moveAction.params).toEqual([
            {name: 'x', defaultValue: null},
            {name: 'y', defaultValue: null}
        ])
    })


    test('listActionsWithParams - includes registered actions', () => {
        controller.addAction('customAction', (value) => value * 2)

        const actionsWithParams = controller.listActionsWithParams()

        const customAction = actionsWithParams.find(a => a.name === 'customAction')
        expect(customAction).toBeDefined()
        expect(customAction.params).toEqual([{name: 'value', defaultValue: null}])
    })


    test('listActionsWithParams - handles functions with no params', () => {
        controller.addAction('noParams', () => {})

        const actionsWithParams = controller.listActionsWithParams()

        const noParamsAction = actionsWithParams.find(a => a.name === 'noParams')
        expect(noParamsAction).toBeDefined()
        expect(noParamsAction.params).toEqual([])
    })


    test('listActionsWithParams - handles rest parameters', () => {
        controller.addAction('withRest', (first, ...rest) => [first, rest])

        const actionsWithParams = controller.listActionsWithParams()

        const action = actionsWithParams.find(a => a.name === 'withRest')
        expect(action).toBeDefined()
        expect(action.params).toEqual([{name: 'first', defaultValue: null}])
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


    describe('normalizeBindings', () => {

        test('empty bindings', () => {
            class TestController extends ActionController {
                static bindings = {}
            }

            const normalized = TestController.normalizeBindings('test')
            expect(normalized).toEqual([])
        })


        test('simple string binding', () => {
            class TestController extends ActionController {
                static bindings = {
                    shoot: 'Space'
                }
            }

            const normalized = TestController.normalizeBindings('test')
            expect(normalized).toEqual([
                {
                    action: 'shoot',
                    key: 'Space',
                    scoped: false,
                    eventType: 'pressed',
                    controllerName: null
                }
            ])
        })


        test('array of keys binding', () => {
            class TestController extends ActionController {
                static bindings = {
                    moveUp: ['KeyW', 'ArrowUp']
                }
            }

            const normalized = TestController.normalizeBindings('test')
            expect(normalized).toEqual([
                {
                    action: 'moveUp',
                    key: 'KeyW',
                    scoped: false,
                    eventType: 'pressed',
                    controllerName: null
                },
                {
                    action: 'moveUp',
                    key: 'ArrowUp',
                    scoped: false,
                    eventType: 'pressed',
                    controllerName: null
                }
            ])
        })


        test('scoped binding', () => {
            class TestController extends ActionController {
                static bindings = {
                    shoot: {keys: 'Space', scoped: true}
                }
            }

            const normalized = TestController.normalizeBindings('game')
            expect(normalized).toEqual([
                {
                    action: 'shoot',
                    key: 'Space',
                    scoped: true,
                    eventType: 'pressed',
                    controllerName: 'game'
                }
            ])
        })


        test('scoped binding with multiple keys', () => {
            class TestController extends ActionController {
                static bindings = {
                    move: {keys: ['KeyW', 'KeyS'], scoped: true}
                }
            }

            const normalized = TestController.normalizeBindings('game')
            expect(normalized).toEqual([
                {
                    action: 'move',
                    key: 'KeyW',
                    scoped: true,
                    eventType: 'pressed',
                    controllerName: 'game'
                },
                {
                    action: 'move',
                    key: 'KeyS',
                    scoped: true,
                    eventType: 'pressed',
                    controllerName: 'game'
                }
            ])
        })


        test('custom eventType', () => {
            class TestController extends ActionController {
                static bindings = {
                    shoot: {keys: 'Space', eventType: 'released'}
                }
            }

            const normalized = TestController.normalizeBindings('test')
            expect(normalized).toEqual([
                {
                    action: 'shoot',
                    key: 'Space',
                    scoped: false,
                    eventType: 'released',
                    controllerName: null
                }
            ])
        })


        test('mixed binding formats', () => {
            class TestController extends ActionController {
                static bindings = {
                    shoot: 'Space',
                    moveUp: ['KeyW', 'ArrowUp'],
                    jump: {keys: 'KeyJ', scoped: true},
                    dash: {keys: ['KeyD', 'ShiftLeft'], scoped: false, eventType: 'released'}
                }
            }

            const normalized = TestController.normalizeBindings('player')
            expect(normalized).toHaveLength(6)

            expect(normalized).toContainEqual({
                action: 'shoot',
                key: 'Space',
                scoped: false,
                eventType: 'pressed',
                controllerName: null
            })

            expect(normalized).toContainEqual({
                action: 'jump',
                key: 'KeyJ',
                scoped: true,
                eventType: 'pressed',
                controllerName: 'player'
            })
        })

    })

})
