import PerkyModule from './perky_module'
import Registry from './registry'
import {vi, describe, test, expect, beforeEach, afterEach} from 'vitest'


describe(PerkyModule, () => {
    let child
    let host


    beforeEach(() => {
        const childrenRegistry = new Registry()
        host = {
            started: false,
            on: vi.fn(),
            emit: vi.fn(),
            childrenRegistry: childrenRegistry,
            hasChild: vi.fn((name) => childrenRegistry.has(name)),
            getChild: vi.fn((name) => childrenRegistry.get(name))
        }

        child = new PerkyModule({$id: 'testChild'})
    })


    afterEach(() => {
        vi.restoreAllMocks()
    })


    test('constructor', () => {
        expect(child).toBeInstanceOf(PerkyModule)
        expect(child.$id).toBe('testChild')
        expect(child.options).toEqual({$id: 'testChild'})
        expect(child.host).toBeNull()
        expect(child.installed).toBe(false)
    })


    test('constructor with default name', () => {
        class TestChild extends PerkyModule { }
        const ext = new TestChild()
        expect(ext.$id).toBe('TestChild')
    })


    test('install', () => {
        const result = child.install(host, {})

        expect(result).toBe(true)
        expect(child.host).toBe(host)
        expect(child.installed).toBe(true)
    })


    test('uninstall', () => {
        child.install(host, {})
        const result = child.uninstall()

        expect(result).toBe(true)
        expect(child.host).toBeNull()
        expect(child.installed).toBe(false)
    })


    test('uninstall when not installed', () => {
        const result = child.uninstall()
        expect(result).toBe(false)
    })


    test('use with Child class', () => {
        class TestChild extends PerkyModule { }

        const result = child.create(TestChild, {
            $id: 'test',
            $category: 'test'
        })

        expect(result).toBeInstanceOf(TestChild)
        expect(result).toBe(child.getChild('test'))
        expect(child.hasChild('test')).toBe(true)
    })


    test('auto-generates unique IDs when $id not provided', () => {
        class Enemy extends PerkyModule { }

        const enemy1 = child.create(Enemy, {$category: 'enemy'})
        const enemy2 = child.create(Enemy, {$category: 'enemy'})
        const enemy3 = child.create(Enemy, {$category: 'enemy'})

        expect(child.hasChild('enemy')).toBe(true)
        expect(child.getChild('enemy')).toBe(enemy1)

        expect(child.hasChild('enemy_1')).toBe(true)
        expect(child.getChild('enemy_1')).toBe(enemy2)

        expect(child.hasChild('enemy_2')).toBe(true)
        expect(child.getChild('enemy_2')).toBe(enemy3)
    })


    test('explicit $id creates single instance (replacement)', () => {
        class Player extends PerkyModule { }

        const player1 = child.create(Player, {
            $id: 'player',
            $category: 'player'
        })

        const player2 = child.create(Player, {
            $id: 'player',
            $category: 'player'
        })

        expect(child.hasChild('player')).toBe(true)
        expect(child.getChild('player')).toBe(player2)
        expect(child.getChild('player')).not.toBe(player1)

        expect(child.hasChild('player_1')).toBe(false)
    })


    test('unique IDs work with different categories', () => {
        class Enemy extends PerkyModule { }
        class Projectile extends PerkyModule { }

        const enemy1 = child.create(Enemy, {$category: 'enemy'})
        const enemy1Name = child.childrenRegistry.keyFor(enemy1)

        const projectile1 = child.create(Projectile, {$category: 'projectile'})
        const projectile1Name = child.childrenRegistry.keyFor(projectile1)

        const enemy2 = child.create(Enemy, {$category: 'enemy'})
        const enemy2Name = child.childrenRegistry.keyFor(enemy2)

        const projectile2 = child.create(Projectile, {$category: 'projectile'})
        const projectile2Name = child.childrenRegistry.keyFor(projectile2)

        expect(child.hasChild(enemy1Name)).toBe(true)
        expect(child.hasChild(enemy2Name)).toBe(true)
        expect(child.hasChild(projectile1Name)).toBe(true)
        expect(child.hasChild(projectile2Name)).toBe(true)

        expect(enemy1).not.toBe(enemy2)
        expect(projectile1).not.toBe(projectile2)
    })


    test('listNamesFor - single category', () => {
        class TestChild1 extends PerkyModule { }
        class TestChild2 extends PerkyModule { }

        child.create(TestChild1, {
            $id: 'ext1',
            $category: 'module'
        })

        child.create(TestChild2, {
            $id: 'ext2',
            $category: 'module'
        })

        const modules = child.listNamesFor('module')

        expect(modules).toHaveLength(2)
        expect(modules).toContain('ext1')
        expect(modules).toContain('ext2')
    })


    test('listNamesFor - mixed categories', () => {
        class TestChild1 extends PerkyModule { }
        class TestChild2 extends PerkyModule { }
        class TestChild3 extends PerkyModule { }

        child.create(TestChild1, {
            $id: 'ext1',
            $category: 'module'
        })

        child.create(TestChild2, {
            $id: 'ext2',
            $category: 'service'
        })

        child.create(TestChild3, {
            $id: 'ext3',
            $category: 'module'
        })

        const modules = child.listNamesFor('module')
        const services = child.listNamesFor('service')

        expect(modules).toHaveLength(2)
        expect(modules).toContain('ext1')
        expect(modules).toContain('ext3')

        expect(services).toHaveLength(1)
        expect(services).toContain('ext2')
    })


    test('listNamesFor - empty category', () => {
        const parent = new PerkyModule()

        parent.create(PerkyModule, {$category: 'module'})
        parent.create(PerkyModule, {$category: 'module'})

        const services = parent.listNamesFor('service')
        expect(services).toEqual([])
    })


    test('listNamesFor - dynamic category update', () => {
        const parent = new PerkyModule()

        const childA = parent.create(PerkyModule, {$id: 'childA', $category: 'module'})
        parent.create(PerkyModule, {$id: 'childB', $category: 'service'})

        expect(parent.listNamesFor('module')).toEqual(['childA'])
        expect(parent.listNamesFor('service')).toEqual(['childB'])

        childA.$category = 'service'

        expect(parent.listNamesFor('module')).toEqual([])
        const serviceChildren = parent.listNamesFor('service')
        expect(serviceChildren).toHaveLength(2)
        expect(serviceChildren).toContain('childA')
        expect(serviceChildren).toContain('childB')
    })


    test('category index is automatically created', () => {
        const registry = child.childrenRegistry

        expect(registry.hasIndex('$category')).toBe(true)
    })


    test('category index is updated when children are added', () => {
        class TestChild extends PerkyModule { }
        const registry = child.childrenRegistry

        child.create(TestChild, {
            $id: 'ext1',
            $category: 'module'
        })

        child.create(TestChild, {
            $id: 'ext2',
            $category: 'service'
        })

        const moduleChildren = registry.lookup('$category', 'module')
        const serviceChildren = registry.lookup('$category', 'service')

        expect(moduleChildren).toHaveLength(1)
        expect(serviceChildren).toHaveLength(1)
        expect(moduleChildren[0]).toBe(child.getChild('ext1'))
        expect(serviceChildren[0]).toBe(child.getChild('ext2'))
    })


    test('category index is updated when children are removed', () => {
        class TestChild extends PerkyModule { }
        const registry = child.childrenRegistry

        child.create(TestChild, {
            $id: 'ext1',
            $category: 'module'
        })

        child.create(TestChild, {
            $id: 'ext2',
            $category: 'module'
        })

        let moduleChildren = registry.lookup('$category', 'module')
        expect(moduleChildren).toHaveLength(2)

        child.removeChild('ext1')

        moduleChildren = registry.lookup('$category', 'module')
        expect(moduleChildren).toHaveLength(1)
        expect(moduleChildren[0]).toBe(child.getChild('ext2'))
    })


    test('registry key is updated when child name changes', () => {
        const parent = new PerkyModule()

        const childModule = parent.create(PerkyModule, {
            $id: 'oldName',
            $category: 'module'
        })

        expect(parent.hasChild('oldName')).toBe(true)
        expect(parent.getChild('oldName')).toBe(childModule)

        childModule.$id = 'newName'

        expect(parent.hasChild('oldName')).toBe(false)
        expect(parent.hasChild('newName')).toBe(true)
        expect(parent.getChild('newName')).toBe(childModule)
    })


    test('use with binding', () => {
        class TestChild extends PerkyModule { }

        child.create(TestChild, {
            $id: 'test',
            $bind: 'testProperty'
        })

        expect(child.testProperty).toBeInstanceOf(TestChild)
    })


    test('binding updates automatically when $bind changes', () => {
        class TestChild extends PerkyModule { }

        const testChild = child.create(TestChild, {
            $id: 'test',
            $bind: 'oldProperty'
        })

        expect(child.oldProperty).toBe(testChild)
        expect(child.newProperty).toBeUndefined()

        testChild.$bind = 'newProperty'

        expect(child.oldProperty).toBeUndefined()
        expect(child.newProperty).toBe(testChild)
    })


    test('use with lifecycle disabled', () => {
        class TestChild extends PerkyModule { }
        const startSpy = vi.spyOn(TestChild.prototype, 'start')

        child.create(TestChild, {
            $id: 'test',
            $lifecycle: false
        })

        child.start()

        expect(startSpy).not.toHaveBeenCalled()
    })


    test('use emits registration events', () => {
        class TestChild extends PerkyModule { }
        const emitSpy = vi.spyOn(child, 'emit')

        const granchild = child.create(TestChild, {
            $id: 'test',
            $category: 'testCategory'
        })

        expect(emitSpy).toHaveBeenCalledWith('testCategory:set', 'test', granchild)
    })


    test('removeChild', () => {
        class TestChild extends PerkyModule { }

        const instance = child.create(TestChild, {
            $id: 'test',
            $category: 'test'
        })

        const uninstallSpy = vi.spyOn(instance, 'uninstall')
        const disposeSpy = vi.spyOn(instance, 'dispose')


        const result = child.removeChild('test')

        expect(result).toBe(true)
        expect(uninstallSpy).toHaveBeenCalled()
        expect(disposeSpy).toHaveBeenCalled()
    })


    test('removeChild non-existent', () => {
        const result = child.removeChild('nonexistent')
        expect(result).toBe(false)
    })


    test('lifecycle cascade', () => {
        class ChildChild extends PerkyModule { }
        new ChildChild()

        const childChild = child.create(ChildChild, {
            $id: 'default',
            $lifecycle: true
        })

        const childStartSpy = vi.spyOn(childChild, 'start')
        const childStopSpy = vi.spyOn(childChild, 'stop')

        child.start()
        expect(childStartSpy).toHaveBeenCalled()

        child.stop()
        expect(childStopSpy).toHaveBeenCalled()
    })


    test('delegateTo with methods', () => {
        const hostModule = new PerkyModule({$id: 'host'})
        const childModule = new PerkyModule({$id: 'child'})

        childModule.method1 = vi.fn()
        childModule.method2 = vi.fn()

        childModule.delegateTo(hostModule, ['method1', 'method2'])

        expect(hostModule.method1).toBeDefined()
        expect(hostModule.method2).toBeDefined()
        expect(typeof hostModule.method1).toBe('function')
        expect(typeof hostModule.method2).toBe('function')
    })


    test('delegateTo with properties', () => {
        const hostModule = new PerkyModule({$id: 'host'})
        const childModule = new PerkyModule({$id: 'child'})

        childModule.prop1 = 'value1'
        childModule.prop2 = 'value2'

        childModule.delegateTo(hostModule, ['prop1', 'prop2'])

        expect(hostModule.prop1).toBe('value1')
        expect(hostModule.prop2).toBe('value2')

        hostModule.prop1 = 'newValue'
        expect(childModule.prop1).toBe('newValue')
    })


    test('delegateTo with mixed methods and properties', () => {
        const hostModule = new PerkyModule({$id: 'host'})
        const childModule = new PerkyModule({$id: 'child'})

        childModule.count = 0
        childModule.increment = function () {
            this.count++
        }
        childModule.decrement = function () {
            this.count--
        }

        childModule.delegateTo(hostModule, ['count', 'increment', 'decrement'])

        expect(hostModule.count).toBe(0)
        expect(typeof hostModule.increment).toBe('function')
        expect(typeof hostModule.decrement).toBe('function')

        hostModule.increment()
        expect(childModule.count).toBe(1)
        expect(hostModule.count).toBe(1)

        hostModule.decrement()
        expect(childModule.count).toBe(0)
        expect(hostModule.count).toBe(0)
    })


    test('delegateTo with getters and setters', () => {
        const hostModule = new PerkyModule({$id: 'host'})
        const childModule = new PerkyModule({$id: 'child'})

        childModule.internalValue = 10
        Object.defineProperty(childModule, 'value', {
            get () {
                return this.internalValue
            },
            set (newValue) {
                this.internalValue = newValue
            },
            enumerable: true,
            configurable: true
        })

        childModule.delegateTo(hostModule, ['value'])

        expect(hostModule.value).toBe(10)

        hostModule.value = 20
        expect(childModule.value).toBe(20)
        expect(hostModule.value).toBe(20)
    })


    test('delegateTo with object-based aliasing', () => {
        const hostModule = new PerkyModule({$id: 'host'})
        const childModule = new PerkyModule({$id: 'child'})

        childModule.originalMethod = vi.fn(() => 'result')
        childModule.originalProp = 'value'

        childModule.delegateTo(hostModule, {
            originalMethod: 'aliasedMethod',
            originalProp: 'aliasedProp'
        })

        expect(hostModule.aliasedMethod).toBeDefined()
        expect(typeof hostModule.aliasedMethod).toBe('function')
        expect(hostModule.aliasedMethod()).toBe('result')
        expect(childModule.originalMethod).toHaveBeenCalled()

        expect(hostModule.aliasedProp).toBe('value')

        hostModule.aliasedProp = 'new value'
        expect(childModule.originalProp).toBe('new value')
    })


    test('delegateTo cleans up delegations on uninstall', () => {
        const hostModule = new PerkyModule({$id: 'host'})
        const childModule = hostModule.create(PerkyModule, {$id: 'child'})

        childModule.getValue = vi.fn(() => 42)
        childModule.someData = 'test'

        childModule.delegateTo(hostModule, ['getValue', 'someData'])

        expect(hostModule.getValue).toBeDefined()
        expect(hostModule.getValue()).toBe(42)
        expect(hostModule.someData).toBe('test')

        childModule.uninstall()

        expect(hostModule.getValue).toBeUndefined()
        expect(hostModule.someData).toBeUndefined()
    })


    test('delegateTo cleans up delegations on dispose', () => {
        const hostModule = new PerkyModule({$id: 'host'})
        const childModule = hostModule.create(PerkyModule, {$id: 'child'})

        childModule.doSomething = vi.fn()

        childModule.delegateTo(hostModule, ['doSomething'])

        expect(hostModule.doSomething).toBeDefined()

        childModule.dispose()

        expect(hostModule.doSomething).toBeUndefined()
    })


    test('delegateTo with object-based aliasing cleans up on uninstall', () => {
        const hostModule = new PerkyModule({$id: 'host'})
        const childModule = hostModule.create(PerkyModule, {$id: 'child'})

        childModule.originalMethod = vi.fn(() => 'result')

        childModule.delegateTo(hostModule, {originalMethod: 'aliasedMethod'})

        expect(hostModule.aliasedMethod).toBeDefined()
        expect(hostModule.aliasedMethod()).toBe('result')

        childModule.uninstall()

        expect(hostModule.aliasedMethod).toBeUndefined()
    })


    test('cleanDelegations removes all delegated properties', () => {
        const hostModule = new PerkyModule({$id: 'host'})
        const childModule = new PerkyModule({$id: 'child'})

        childModule.method1 = vi.fn()
        childModule.method2 = vi.fn()
        childModule.prop1 = 'value1'

        childModule.delegateTo(hostModule, ['method1', 'prop1'])
        childModule.delegateTo(hostModule, ['method2'])

        expect(hostModule.method1).toBeDefined()
        expect(hostModule.method2).toBeDefined()
        expect(hostModule.prop1).toBe('value1')

        childModule.cleanDelegations()

        expect(hostModule.method1).toBeUndefined()
        expect(hostModule.method2).toBeUndefined()
        expect(hostModule.prop1).toBeUndefined()
    })


    test('delegateEventsTo forwards events to host', () => {
        const hostModule = new PerkyModule({$id: 'host'})
        const childModule = hostModule.create(PerkyModule, {$id: 'child'})

        const updateSpy = vi.fn()
        const renderSpy = vi.fn()

        hostModule.on('update', updateSpy)
        hostModule.on('render', renderSpy)

        childModule.delegateEventsTo(hostModule, ['update', 'render'])

        childModule.emit('update', 0.16)
        childModule.emit('render', 1.0)

        expect(updateSpy).toHaveBeenCalledWith(0.16)
        expect(renderSpy).toHaveBeenCalledWith(1.0)
    })


    test('delegateEventsTo with namespace prefixes events', () => {
        const hostModule = new PerkyModule({$id: 'host'})
        const childModule = hostModule.create(PerkyModule, {$id: 'child'})

        const spy = vi.fn()
        hostModule.on('child:update', spy)

        childModule.delegateEventsTo(hostModule, ['update'], 'child')

        childModule.emit('update', 0.16)

        expect(spy).toHaveBeenCalledWith(0.16)
    })


    test('delegateEventsTo cleans up on uninstall', () => {
        const hostModule = new PerkyModule({$id: 'host'})
        const childModule = hostModule.create(PerkyModule, {$id: 'child'})

        const spy = vi.fn()
        hostModule.on('update', spy)

        childModule.delegateEventsTo(hostModule, ['update'])

        childModule.emit('update', 0.16)
        expect(spy).toHaveBeenCalledTimes(1)

        childModule.uninstall()

        childModule.emit('update', 0.16)
        expect(spy).toHaveBeenCalledTimes(1)
    })


    test('delegateEventsTo cleans up on dispose', () => {
        const hostModule = new PerkyModule({$id: 'host'})
        const childModule = hostModule.create(PerkyModule, {$id: 'child'})

        const spy = vi.fn()
        hostModule.on('update', spy)

        childModule.delegateEventsTo(hostModule, ['update'])

        childModule.emit('update', 0.16)
        expect(spy).toHaveBeenCalledTimes(1)

        childModule.dispose()

        childModule.emit('update', 0.16)
        expect(spy).toHaveBeenCalledTimes(1)
    })


    test('dispose calls dispose on all children in cascade', () => {
        class ChildChild1 extends PerkyModule { }
        class ChildChild2 extends PerkyModule { }

        const child1 = child.create(ChildChild1, {
            $id: 'child1'
        })

        const child2 = child.create(ChildChild2, {
            $id: 'child2'
        })

        const child1DisposeSpy = vi.spyOn(child1, 'dispose')
        const child2DisposeSpy = vi.spyOn(child2, 'dispose')

        child.dispose()

        expect(child1DisposeSpy).toHaveBeenCalled()
        expect(child2DisposeSpy).toHaveBeenCalled()
        expect(child1.disposed).toBe(true)
        expect(child2.disposed).toBe(true)
        expect(child.disposed).toBe(true)
    })


    test('dispose with multiple nested children', () => {
        class Level1Child extends PerkyModule { }
        class Level2Child extends PerkyModule { }

        const level1 = child.create(Level1Child, {
            $id: 'level1'
        })

        const level2 = child.create(Level2Child, {
            $id: 'level2'
        })

        const level1DisposeSpy = vi.spyOn(level1, 'dispose')
        const level2DisposeSpy = vi.spyOn(level2, 'dispose')

        child.dispose()

        expect(level1DisposeSpy).toHaveBeenCalled()
        expect(level2DisposeSpy).toHaveBeenCalled()
        expect(level2.disposed).toBe(true)
        expect(level1.disposed).toBe(true)
        expect(child.disposed).toBe(true)
    })


    test('dispose skips already disposed children', () => {
        class ChildChild extends PerkyModule { }

        const childChild = new ChildChild()
        const childDisposeSpy = vi.spyOn(child, 'dispose')

        child.create(ChildChild, {
            instance: childChild,
            $id: 'default'
        })

        child.dispose()
        expect(childDisposeSpy).toHaveBeenCalledTimes(1)
        expect(child.disposed).toBe(true)

        childDisposeSpy.mockClear()

        childChild.dispose()

        expect(childDisposeSpy).not.toHaveBeenCalled()
        expect(childChild.disposed).toBe(true)
    })


    test('dispose clears children registry after disposing all children', () => {
        class ChildChild extends PerkyModule { }

        const childChild = new ChildChild()

        child.create(ChildChild, {
            instance: childChild,
            $id: 'default'
        })

        expect(child.hasChild('default')).toBe(true)

        child.dispose()

        expect(child.hasChild('default')).toBe(false)
        expect(child.childrenRegistry.size).toBe(0)
    })


    describe('static $category', () => {
        test('uses PerkyModule default category "perkyModule" when not specified', () => {
            const module = child.create(PerkyModule, {$id: 'test'})
            expect(module.$category).toBe('perkyModule')
        })


        test('uses static $category from subclass', () => {
            class GameController extends PerkyModule {
                static $category = 'controller'
            }

            const controller = child.create(GameController, {$id: 'game'})
            expect(controller.$category).toBe('controller')
        })


        test('explicit $category overrides static $category', () => {
            class GameController extends PerkyModule {
                static $category = 'controller'
            }

            const controller = child.create(GameController, {
                $id: 'game',
                $category: 'custom'
            })

            expect(controller.$category).toBe('custom')
        })


        test('works with multiple levels of inheritance', () => {
            class BaseController extends PerkyModule {
                static $category = 'controller'
            }

            class GameController extends BaseController {
                static $category = 'gameController'
            }

            const controller = child.create(GameController, {$id: 'game'})
            expect(controller.$category).toBe('gameController')
        })


        test('subclass without static $category falls back to parent', () => {
            class BaseController extends PerkyModule {
                static $category = 'controller'
            }

            class GameController extends BaseController {
                // No static $category override
            }

            const controller = child.create(GameController, {$id: 'game'})
            expect(controller.$category).toBe('controller')
        })


        test('auto-generates unique IDs using static $category', () => {
            class Monster extends PerkyModule {
                static $category = 'monster'
            }

            // Use a fresh parent to ensure predictable ID generation
            const parent = new PerkyModule()
            const monster1 = parent.create(Monster)
            const monster2 = parent.create(Monster)
            const monster3 = parent.create(Monster)

            expect(monster1.$category).toBe('monster')
            expect(monster2.$category).toBe('monster')
            expect(monster3.$category).toBe('monster')

            expect(monster1.$id).toBe('monster')
            expect(monster2.$id).toBe('monster_1')
            expect(monster3.$id).toBe('monster_2')
        })


        test('emits correct event based on static $category', () => {
            class GameController extends PerkyModule {
                static $category = 'controller'
            }

            const emitSpy = vi.spyOn(child, 'emit')
            const controller = child.create(GameController, {$id: 'game'})

            expect(emitSpy).toHaveBeenCalledWith('controller:set', 'game', controller)
        })


        test('listNamesFor works with static $category', () => {
            class GameController extends PerkyModule {
                static $category = 'controller'
            }

            class InputController extends PerkyModule {
                static $category = 'controller'
            }

            child.create(GameController, {$id: 'game'})
            child.create(InputController, {$id: 'input'})

            const controllers = child.listNamesFor('controller')
            expect(controllers).toHaveLength(2)
            expect(controllers).toContain('game')
            expect(controllers).toContain('input')
        })
    })


    describe('$eagerStart', () => {
        test('default $eagerStart is true for PerkyModule', () => {
            const module = child.create(PerkyModule, {$id: 'test'})
            expect(module.$eagerStart).toBe(true)
        })


        test('child starts eagerly when parent is already started', () => {
            child.start()

            const module = child.create(PerkyModule, {$id: 'test'})

            expect(module.started).toBe(true)
        })


        test('child does not start when parent is not started', () => {
            const module = child.create(PerkyModule, {$id: 'test'})

            expect(module.started).toBe(false)
        })


        test('$eagerStart: false prevents automatic start', () => {
            child.start()

            const module = child.create(PerkyModule, {
                $id: 'test',
                $eagerStart: false
            })

            expect(module.started).toBe(false)
        })


        test('$eagerStart: true forces eager start', () => {
            child.start()

            const module = child.create(PerkyModule, {
                $id: 'test',
                $eagerStart: true
            })

            expect(module.started).toBe(true)
        })


        test('static $eagerStart is inherited from class', () => {
            class LazyModule extends PerkyModule {
                static $eagerStart = false
            }

            child.start()

            const module = child.create(LazyModule, {$id: 'test'})

            expect(module.$eagerStart).toBe(false)
            expect(module.started).toBe(false)
        })


        test('explicit $eagerStart overrides static $eagerStart', () => {
            class LazyModule extends PerkyModule {
                static $eagerStart = false
            }

            child.start()

            const module = child.create(LazyModule, {
                $id: 'test',
                $eagerStart: true
            })

            expect(module.$eagerStart).toBe(true)
            expect(module.started).toBe(true)
        })


        test('$eagerStart cascading: option > static > default', () => {
            class CustomModule extends PerkyModule {
                static $eagerStart = false
            }

            const module1 = child.create(CustomModule, {$id: 'test1'})
            expect(module1.$eagerStart).toBe(false)

            const module2 = child.create(CustomModule, {
                $id: 'test2',
                $eagerStart: true
            })
            expect(module2.$eagerStart).toBe(true)

            const module3 = child.create(PerkyModule, {$id: 'test3'})
            expect(module3.$eagerStart).toBe(true)
        })


        test('$eagerStart works with $lifecycle: false', () => {
            child.start()

            const module = child.create(PerkyModule, {
                $id: 'test',
                $eagerStart: true,
                $lifecycle: false
            })

            expect(module.started).toBe(false)
        })


        test('lazy module can be started manually later', () => {
            child.start()

            const module = child.create(PerkyModule, {
                $id: 'test',
                $eagerStart: false
            })

            expect(module.started).toBe(false)

            module.start()

            expect(module.started).toBe(true)
        })


        test('multiple children with mixed $eagerStart', () => {
            child.start()

            const eager1 = child.create(PerkyModule, {
                $id: 'eager1',
                $eagerStart: true
            })

            const lazy1 = child.create(PerkyModule, {
                $id: 'lazy1',
                $eagerStart: false
            })

            const eager2 = child.create(PerkyModule, {
                $id: 'eager2'
            })

            expect(eager1.started).toBe(true)
            expect(lazy1.started).toBe(false)
            expect(eager2.started).toBe(true)
        })


        test('eagerStart getter returns correct value', () => {
            const eager = child.create(PerkyModule, {
                $id: 'eager',
                $eagerStart: true
            })

            const lazy = child.create(PerkyModule, {
                $id: 'lazy',
                $eagerStart: false
            })
            expect(eager.$eagerStart).toBe(true)
            expect(lazy.$eagerStart).toBe(false)
        })
    })


    describe('$lifecycle', () => {

        test('$lifecycle is true by default', () => {
            const module = new PerkyModule()
            expect(module.$lifecycle).toBe(true)
        })


        test('$lifecycle can be set to false via options', () => {
            const module = new PerkyModule({$lifecycle: false})
            expect(module.$lifecycle).toBe(false)
        })


        test('$lifecycle is true when option is explicitly true', () => {
            const module = new PerkyModule({$lifecycle: true})
            expect(module.$lifecycle).toBe(true)
        })

    })


    describe('$status', () => {

        test('returns "stopped" for new module', () => {
            const module = new PerkyModule()
            expect(module.$status).toBe('stopped')
        })


        test('returns "started" when module is running', () => {
            const module = new PerkyModule()
            module.start()
            expect(module.$status).toBe('started')
        })


        test('returns "stopped" after stopping a started module', () => {
            const module = new PerkyModule()
            module.start()
            module.stop()
            expect(module.$status).toBe('stopped')
        })


        test('returns "disposed" when module is disposed', () => {
            const module = new PerkyModule()
            module.dispose()
            expect(module.$status).toBe('disposed')
        })


        test('returns "static" when $lifecycle is false', () => {
            const module = new PerkyModule({$lifecycle: false})
            expect(module.$status).toBe('static')
        })


        test('returns "static" even if started when $lifecycle is false', () => {
            const module = new PerkyModule({$lifecycle: false})
            module.start()
            expect(module.$status).toBe('static')
        })


        test('disposed takes precedence over started', () => {
            const module = new PerkyModule()
            module.start()
            module.dispose()
            expect(module.$status).toBe('disposed')
        })

    })


    describe('$tags', () => {

        test('initializes with empty tags by default', () => {
            const module = new PerkyModule()
            expect(module.$tags).toEqual([])
        })


        test('initializes with tags from options', () => {
            const module = new PerkyModule({$tags: ['enemy', 'collidable']})
            expect(module.$tags).toEqual(['enemy', 'collidable'])
        })


        test('$tags returns array copy', () => {
            const module = new PerkyModule({$tags: ['test']})
            const tags1 = module.$tags
            const tags2 = module.$tags
            expect(tags1).not.toBe(tags2)
            expect(tags1).toEqual(tags2)
        })


        test('tags property returns ObservableSet', () => {
            const module = new PerkyModule()
            expect(module.tags).toBeDefined()
            expect(module.tags.size).toBe(0)
        })


        test('can add tags via tags.add()', () => {
            const module = new PerkyModule()
            module.tags.add('enemy')
            module.tags.add('collidable')

            expect(module.$tags).toEqual(['enemy', 'collidable'])
            expect(module.tags.size).toBe(2)
        })


        test('can delete tags via tags.delete()', () => {
            const module = new PerkyModule({$tags: ['enemy', 'collidable', 'flying']})

            module.tags.delete('flying')

            expect(module.$tags).toEqual(['enemy', 'collidable'])
            expect(module.tags.size).toBe(2)
        })


        test('can clear tags via tags.clear()', () => {
            const module = new PerkyModule({$tags: ['enemy', 'collidable']})

            module.tags.clear()

            expect(module.$tags).toEqual([])
            expect(module.tags.size).toBe(0)
        })


        test('tags.add() emits add event', () => {
            const module = new PerkyModule()
            let addedTag

            module.tags.on('add', (tag) => {
                addedTag = tag
            })

            module.tags.add('enemy')

            expect(addedTag).toBe('enemy')
        })


        test('tags.delete() emits delete event', () => {
            const module = new PerkyModule({$tags: ['enemy']})
            let deletedTag

            module.tags.on('delete', (tag) => {
                deletedTag = tag
            })

            module.tags.delete('enemy')

            expect(deletedTag).toBe('enemy')
        })


        test('tags.clear() emits clear event', () => {
            const module = new PerkyModule({$tags: ['enemy', 'collidable']})
            let clearedTags

            module.tags.on('clear', (tags) => {
                clearedTags = tags
            })

            module.tags.clear()

            expect(clearedTags).toEqual(['enemy', 'collidable'])
        })


        test('tags support chaining', () => {
            const module = new PerkyModule()

            module.tags.add('enemy').add('collidable').add('flying')

            expect(module.$tags).toEqual(['enemy', 'collidable', 'flying'])
        })


        test('tags support iteration', () => {
            const module = new PerkyModule({$tags: ['a', 'b', 'c']})

            const collected = []
            for (const tag of module.tags) {
                collected.push(tag)
            }

            expect(collected).toEqual(['a', 'b', 'c'])
        })


        test('can set $tags with array', () => {
            const module = new PerkyModule({$tags: ['enemy', 'collidable']})

            module.$tags = ['friendly', 'flying']

            expect(module.$tags).toEqual(['friendly', 'flying'])
            expect(module.tags.size).toBe(2)
        })


        test('setting $tags clears old tags', () => {
            const module = new PerkyModule({$tags: ['a', 'b', 'c']})

            module.$tags = ['x', 'y']

            expect(module.$tags).toEqual(['x', 'y'])
            expect(module.tags.has('a')).toBe(false)
            expect(module.tags.has('b')).toBe(false)
        })


        test('setting $tags emits clear and add events', () => {
            const module = new PerkyModule({$tags: ['old']})
            let clearedTags
            let addedTags = []

            module.tags.on('clear', (tags) => {
                clearedTags = tags
            })
            module.tags.on('add', (tag) => {
                addedTags.push(tag)
            })

            module.$tags = ['new1', 'new2']

            expect(clearedTags).toEqual(['old'])
            expect(addedTags).toEqual(['new1', 'new2'])
        })


        test('setting $tags to empty array clears all', () => {
            const module = new PerkyModule({$tags: ['a', 'b']})

            module.$tags = []

            expect(module.$tags).toEqual([])
            expect(module.tags.size).toBe(0)
        })


        describe('hasTag()', () => {
            test('returns true when tag exists', () => {
                const module = new PerkyModule({$tags: ['enemy', 'collidable']})
                expect(module.hasTag('enemy')).toBe(true)
                expect(module.hasTag('collidable')).toBe(true)
            })


            test('returns false when tag does not exist', () => {
                const module = new PerkyModule({$tags: ['enemy']})
                expect(module.hasTag('friendly')).toBe(false)
                expect(module.hasTag('collidable')).toBe(false)
            })


            test('returns false when no tags set', () => {
                const module = new PerkyModule()
                expect(module.hasTag('enemy')).toBe(false)
            })
        })


        describe('addTag()', () => {
            test('adds a tag', () => {
                const module = new PerkyModule()
                module.addTag('enemy')
                expect(module.hasTag('enemy')).toBe(true)
            })


            test('returns true when tag is new', () => {
                const module = new PerkyModule()
                expect(module.addTag('enemy')).toBe(true)
            })


            test('returns false when tag already exists', () => {
                const module = new PerkyModule({$tags: ['enemy']})
                expect(module.addTag('enemy')).toBe(false)
            })
        })


        describe('removeTag()', () => {
            test('removes a tag', () => {
                const module = new PerkyModule({$tags: ['enemy', 'collidable']})
                module.removeTag('enemy')
                expect(module.hasTag('enemy')).toBe(false)
                expect(module.hasTag('collidable')).toBe(true)
            })


            test('returns true when tag existed', () => {
                const module = new PerkyModule({$tags: ['enemy']})
                expect(module.removeTag('enemy')).toBe(true)
            })


            test('returns false when tag did not exist', () => {
                const module = new PerkyModule()
                expect(module.removeTag('enemy')).toBe(false)
            })
        })


        describe('hasTags()', () => {
            test('returns true when all tags exist (array)', () => {
                const module = new PerkyModule({$tags: ['enemy', 'collidable', 'flying']})
                expect(module.hasTags(['enemy', 'collidable'])).toBe(true)
                expect(module.hasTags(['enemy'])).toBe(true)
            })


            test('returns false when some tags missing (array)', () => {
                const module = new PerkyModule({$tags: ['enemy', 'collidable']})
                expect(module.hasTags(['enemy', 'flying'])).toBe(false)
                expect(module.hasTags(['friendly', 'enemy'])).toBe(false)
            })


            test('returns false when no tags match (array)', () => {
                const module = new PerkyModule({$tags: ['enemy']})
                expect(module.hasTags(['friendly', 'collidable'])).toBe(false)
            })


            test('fallback: accepts string and checks single tag', () => {
                const module = new PerkyModule({$tags: ['enemy', 'collidable']})
                expect(module.hasTags('enemy')).toBe(true)
                expect(module.hasTags('collidable')).toBe(true)
                expect(module.hasTags('friendly')).toBe(false)
            })


            test('returns true for empty array', () => {
                const module = new PerkyModule({$tags: ['enemy']})
                expect(module.hasTags([])).toBe(true)
            })


            test('returns false when no tags set', () => {
                const module = new PerkyModule()
                expect(module.hasTags(['enemy'])).toBe(false)
                expect(module.hasTags('enemy')).toBe(false)
            })
        })

    })


    describe('composite tag indexing', () => {

        test('childrenByTags returns children matching all tags (without index)', () => {
            const child1 = child.create(PerkyModule, {$id: 'c1', $tags: ['enemy', 'collidable', 'flying']})
            const child2 = child.create(PerkyModule, {$id: 'c2', $tags: ['enemy', 'collidable']})
            child.create(PerkyModule, {$id: 'c3', $tags: ['friendly', 'collidable']})

            const enemyColliders = child.childrenByTags(['enemy', 'collidable'])

            expect(enemyColliders).toHaveLength(2)
            expect(enemyColliders).toContain(child1)
            expect(enemyColliders).toContain(child2)
        })


        test('childrenByTags returns empty array for no matches', () => {
            child.create(PerkyModule, {$id: 'c1', $tags: ['enemy']})

            const result = child.childrenByTags(['enemy', 'collidable'])

            expect(result).toEqual([])
        })


        test('childrenByTags returns empty array for empty tags', () => {
            const result = child.childrenByTags()

            expect(result).toEqual([])
        })


        test('addTagsIndex creates composite index', () => {
            const result = child.addTagsIndex(['enemy', 'collidable'])

            expect(result).toBe(true)
            expect(child.childrenRegistry.hasIndex('collidable_enemy')).toBe(true)
        })


        test('addTagsIndex normalizes tag order', () => {
            child.addTagsIndex(['collidable', 'enemy'])

            expect(child.childrenRegistry.hasIndex('collidable_enemy')).toBe(true)
        })


        test('addTagsIndex returns false if already indexed', () => {
            const result1 = child.addTagsIndex(['enemy', 'collidable'])
            const result2 = child.addTagsIndex(['enemy', 'collidable'])

            expect(result1).toBe(true)
            expect(result2).toBe(false)
        })


        test('addTagsIndex returns false for empty array', () => {
            const result = child.addTagsIndex([])

            expect(result).toBe(false)
        })


        test('addTagsIndex returns false for non-array', () => {
            const result = child.addTagsIndex('invalid')

            expect(result).toBe(false)
        })


        test('childrenByTags uses index when available', () => {
            const child1 = child.create(PerkyModule, {$id: 'c1', $tags: ['enemy', 'collidable']})
            child.create(PerkyModule, {$id: 'c2', $tags: ['enemy']})

            child.addTagsIndex(['enemy', 'collidable'])

            const result = child.childrenByTags(['enemy', 'collidable'])

            expect(result).toHaveLength(1)
            expect(result).toContain(child1)
        })


        test('removeTagsIndex removes composite index', () => {
            child.addTagsIndex(['enemy', 'collidable'])
            const result = child.removeTagsIndex(['enemy', 'collidable'])

            expect(result).toBe(true)
            expect(child.childrenRegistry.hasIndex('collidable_enemy')).toBe(false)
        })


        test('removeTagsIndex returns false if not indexed', () => {
            const result = child.removeTagsIndex(['enemy', 'collidable'])

            expect(result).toBe(false)
        })


        test('index automatically updates when child tags change (add)', () => {
            const testChild = child.create(PerkyModule, {$id: 'test', $tags: ['enemy']})
            child.addTagsIndex(['enemy', 'collidable'])
            expect(child.childrenByTags(['enemy', 'collidable'])).toHaveLength(0)

            testChild.tags.add('collidable')

            expect(child.childrenByTags(['enemy', 'collidable'])).toHaveLength(1)
            expect(child.childrenByTags(['enemy', 'collidable'])).toContain(testChild)
        })


        test('index automatically updates when child tags change (delete)', () => {
            const testChild = child.create(PerkyModule, {$id: 'test', $tags: ['enemy', 'collidable']})
            child.addTagsIndex(['enemy', 'collidable'])

            expect(child.childrenByTags(['enemy', 'collidable'])).toHaveLength(1)

            testChild.tags.delete('collidable')

            expect(child.childrenByTags(['enemy', 'collidable'])).toHaveLength(0)
        })


        test('index automatically updates when child tags change (clear)', () => {
            const testChild = child.create(PerkyModule, {$id: 'test', $tags: ['enemy', 'collidable']})
            child.addTagsIndex(['enemy', 'collidable'])

            expect(child.childrenByTags(['enemy', 'collidable'])).toHaveLength(1)

            testChild.tags.clear()

            expect(child.childrenByTags(['enemy', 'collidable'])).toHaveLength(0)
        })


        test('index updates when $tags is reassigned', () => {
            const testChild = child.create(PerkyModule, {$id: 'test', $tags: ['enemy']})
            child.addTagsIndex(['enemy', 'collidable'])

            expect(child.childrenByTags(['enemy', 'collidable'])).toHaveLength(0)

            testChild.$tags = ['enemy', 'collidable']

            expect(child.childrenByTags(['enemy', 'collidable'])).toHaveLength(1)
        })


        test('multiple composite indexes work independently', () => {
            const enemy = child.create(PerkyModule, {$id: 'enemy', $tags: ['enemy', 'collidable']})
            const friendly = child.create(PerkyModule, {$id: 'friendly', $tags: ['friendly', 'collidable']})

            child.addTagsIndex(['enemy', 'collidable'])
            child.addTagsIndex(['friendly', 'collidable'])

            expect(child.childrenByTags(['enemy', 'collidable'])).toEqual([enemy])
            expect(child.childrenByTags(['friendly', 'collidable'])).toEqual([friendly])
        })


        test('events are cleaned up when child is removed', () => {
            const testChild = child.create(PerkyModule, {$id: 'test', $tags: ['enemy', 'collidable']})
            child.addTagsIndex(['enemy', 'collidable'])

            expect(child.childrenByTags(['enemy', 'collidable'])).toHaveLength(1)

            child.removeChild('test')

            expect(child.childrenByTags(['enemy', 'collidable'])).toHaveLength(0)

            testChild.tags.add('flying')
            expect(child.childrenByTags(['enemy', 'collidable'])).toHaveLength(0)
        })


        test('index hooks are added to existing children', () => {
            const testChild = child.create(PerkyModule, {$id: 'test', $tags: ['enemy']})

            child.addTagsIndex(['enemy', 'collidable'])

            testChild.tags.add('collidable')

            expect(child.childrenByTags(['enemy', 'collidable'])).toHaveLength(1)
        })


        test('single tag query works', () => {
            const child1 = child.create(PerkyModule, {$id: 'c1', $tags: ['enemy']})
            const child2 = child.create(PerkyModule, {$id: 'c2', $tags: ['enemy', 'flying']})
            child.create(PerkyModule, {$id: 'c3', $tags: ['friendly']})

            const enemies = child.childrenByTags('enemy')

            expect(enemies).toHaveLength(2)
            expect(enemies).toContain(child1)
            expect(enemies).toContain(child2)
        })


        test('works with children without tags', () => {
            child.create(PerkyModule, {$id: 'c1'})
            const child2 = child.create(PerkyModule, {$id: 'c2', $tags: ['enemy']})

            const result = child.childrenByTags('enemy')

            expect(result).toEqual([child2])
        })

    })


    describe('#setupTagIndexListeners', () => {

        test('listeners are set up when creating a child with tags and indexes exist', () => {
            child.addTagsIndex(['enemy', 'collidable'])

            const testChild = child.create(PerkyModule, {$id: 'test', $tags: ['enemy']})

            testChild.tags.add('collidable')

            const result = child.childrenByTags(['enemy', 'collidable'])
            expect(result).toHaveLength(1)
            expect(result).toContain(testChild)
        })


        test('listeners ARE set up when addTagsIndex is called for existing children', () => {
            const testChild = child.create(PerkyModule, {$id: 'test', $tags: ['enemy']})

            child.addTagsIndex(['enemy', 'collidable'])

            testChild.tags.add('collidable')

            const result = child.childrenByTags(['enemy', 'collidable'])
            expect(result).toHaveLength(1)
            expect(result).toContain(testChild)
        })


        test('listeners ARE set up for children even without initial tags', () => {
            child.addTagsIndex(['enemy', 'collidable'])

            const testChild = child.create(PerkyModule, {$id: 'test'})

            testChild.tags.add('enemy')
            testChild.tags.add('collidable')

            const result = child.childrenByTags(['enemy', 'collidable'])
            expect(result).toHaveLength(1)
            expect(result).toContain(testChild)
        })


        test('adding a tag triggers index update for all registered indexes', () => {
            child.addTagsIndex(['enemy', 'collidable'])
            child.addTagsIndex(['enemy', 'flying'])

            const testChild = child.create(PerkyModule, {$id: 'test', $tags: ['enemy']})

            expect(child.childrenByTags(['enemy', 'collidable'])).toHaveLength(0)
            expect(child.childrenByTags(['enemy', 'flying'])).toHaveLength(0)

            testChild.tags.add('collidable')

            expect(child.childrenByTags(['enemy', 'collidable'])).toHaveLength(1)
            expect(child.childrenByTags(['enemy', 'flying'])).toHaveLength(0)

            testChild.tags.add('flying')

            expect(child.childrenByTags(['enemy', 'collidable'])).toHaveLength(1)
            expect(child.childrenByTags(['enemy', 'flying'])).toHaveLength(1)
        })


        test('deleting a tag triggers index update for all registered indexes', () => {
            child.addTagsIndex(['enemy', 'collidable'])
            child.addTagsIndex(['enemy', 'flying'])

            const testChild = child.create(PerkyModule, {$id: 'test', $tags: ['enemy', 'collidable', 'flying']})

            expect(child.childrenByTags(['enemy', 'collidable'])).toHaveLength(1)
            expect(child.childrenByTags(['enemy', 'flying'])).toHaveLength(1)

            testChild.tags.delete('collidable')

            expect(child.childrenByTags(['enemy', 'collidable'])).toHaveLength(0)
            expect(child.childrenByTags(['enemy', 'flying'])).toHaveLength(1)

            testChild.tags.delete('flying')

            expect(child.childrenByTags(['enemy', 'collidable'])).toHaveLength(0)
            expect(child.childrenByTags(['enemy', 'flying'])).toHaveLength(0)
        })


        test('clearing tags triggers index update for all registered indexes', () => {
            child.addTagsIndex(['enemy', 'collidable'])
            child.addTagsIndex(['enemy', 'flying'])

            const testChild = child.create(PerkyModule, {$id: 'test', $tags: ['enemy', 'collidable', 'flying']})

            expect(child.childrenByTags(['enemy', 'collidable'])).toHaveLength(1)
            expect(child.childrenByTags(['enemy', 'flying'])).toHaveLength(1)

            testChild.tags.clear()

            expect(child.childrenByTags(['enemy', 'collidable'])).toHaveLength(0)
            expect(child.childrenByTags(['enemy', 'flying'])).toHaveLength(0)
        })


        test('multiple children with different tag combinations', () => {
            child.addTagsIndex(['enemy', 'collidable'])
            child.addTagsIndex(['friendly', 'collidable'])

            const enemy = child.create(PerkyModule, {$id: 'enemy', $tags: ['enemy']})
            const friendly = child.create(PerkyModule, {$id: 'friendly', $tags: ['friendly']})

            expect(child.childrenByTags(['enemy', 'collidable'])).toHaveLength(0)
            expect(child.childrenByTags(['friendly', 'collidable'])).toHaveLength(0)

            enemy.tags.add('collidable')
            friendly.tags.add('collidable')

            expect(child.childrenByTags(['enemy', 'collidable'])).toHaveLength(1)
            expect(child.childrenByTags(['enemy', 'collidable'])).toContain(enemy)

            expect(child.childrenByTags(['friendly', 'collidable'])).toHaveLength(1)
            expect(child.childrenByTags(['friendly', 'collidable'])).toContain(friendly)
        })


        test('tag changes work correctly when adding index before creating children', () => {
            child.addTagsIndex(['enemy', 'collidable'])

            const enemy1 = child.create(PerkyModule, {$id: 'enemy1', $tags: ['enemy']})
            const enemy2 = child.create(PerkyModule, {$id: 'enemy2', $tags: ['enemy', 'collidable']})

            expect(child.childrenByTags(['enemy', 'collidable'])).toEqual([enemy2])

            enemy1.tags.add('collidable')

            const result = child.childrenByTags(['enemy', 'collidable'])
            expect(result).toHaveLength(2)
            expect(result).toContain(enemy1)
            expect(result).toContain(enemy2)

            enemy2.tags.delete('enemy')

            const result2 = child.childrenByTags(['enemy', 'collidable'])
            expect(result2).toHaveLength(1)
            expect(result2).toContain(enemy1)
        })


        test('listeners are set up for existing children when adding a new index', () => {
            const testChild = child.create(PerkyModule, {$id: 'test', $tags: ['enemy']})

            child.addTagsIndex(['enemy', 'collidable'])

            testChild.tags.add('collidable')

            const result = child.childrenByTags(['enemy', 'collidable'])
            expect(result).toHaveLength(1)
            expect(result).toContain(testChild)
        })

    })

})

