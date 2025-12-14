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

        child = new PerkyModule({$name: 'testChild'})
    })


    afterEach(() => {
        vi.restoreAllMocks()
    })


    test('constructor', () => {
        expect(child).toBeInstanceOf(PerkyModule)
        expect(child.$name).toBe('testChild')
        expect(child.options).toEqual({$name: 'testChild'})
        expect(child.host).toBeNull()
        expect(child.installed).toBe(false)
    })


    test('constructor with default name', () => {
        class TestChild extends PerkyModule { }
        const ext = new TestChild()
        expect(ext.$name).toBe('TestChild')
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
            $name: 'test',
            $category: 'test'
        })

        expect(result).toBeInstanceOf(TestChild)
        expect(result).toBe(child.getChild('test'))
        expect(child.hasChild('test')).toBe(true)
    })


    test('auto-generates unique IDs when $name not provided', () => {
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


    test('explicit $name creates single instance (replacement)', () => {
        class Player extends PerkyModule { }

        const player1 = child.create(Player, {
            $name: 'player',
            $category: 'player'
        })

        const player2 = child.create(Player, {
            $name: 'player',
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
            $name: 'ext1',
            $category: 'module'
        })

        child.create(TestChild2, {
            $name: 'ext2',
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
            $name: 'ext1',
            $category: 'module'
        })

        child.create(TestChild2, {
            $name: 'ext2',
            $category: 'service'
        })

        child.create(TestChild3, {
            $name: 'ext3',
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

        const childA = parent.create(PerkyModule, {$name: 'childA', $category: 'module'})
        parent.create(PerkyModule, {$name: 'childB', $category: 'service'})

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
            $name: 'ext1',
            $category: 'module'
        })

        child.create(TestChild, {
            $name: 'ext2',
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
            $name: 'ext1',
            $category: 'module'
        })

        child.create(TestChild, {
            $name: 'ext2',
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
            $name: 'oldName',
            $category: 'module'
        })

        expect(parent.hasChild('oldName')).toBe(true)
        expect(parent.getChild('oldName')).toBe(childModule)

        childModule.$name = 'newName'

        expect(parent.hasChild('oldName')).toBe(false)
        expect(parent.hasChild('newName')).toBe(true)
        expect(parent.getChild('newName')).toBe(childModule)
    })


    test('use with binding', () => {
        class TestChild extends PerkyModule { }

        child.create(TestChild, {
            $name: 'test',
            $bind: 'testProperty'
        })

        expect(child.testProperty).toBeInstanceOf(TestChild)
    })


    test('binding updates automatically when $bind changes', () => {
        class TestChild extends PerkyModule { }

        const testChild = child.create(TestChild, {
            $name: 'test',
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
            $name: 'test',
            $lifecycle: false
        })

        child.start()

        expect(startSpy).not.toHaveBeenCalled()
    })


    test('use emits registration events', () => {
        class TestChild extends PerkyModule { }
        const emitSpy = vi.spyOn(child, 'emit')

        const granchild = child.create(TestChild, {
            $name: 'test',
            $category: 'testCategory'
        })

        expect(emitSpy).toHaveBeenCalledWith('testCategory:set', 'test', granchild)
    })


    test('removeChild', () => {
        class TestChild extends PerkyModule { }

        const instance = child.create(TestChild, {
            $name: 'test',
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
            $name: 'default',
            $lifecycle: true
        })

        const childStartSpy = vi.spyOn(childChild, 'start')
        const childStopSpy = vi.spyOn(childChild, 'stop')

        child.start()
        expect(childStartSpy).toHaveBeenCalled()

        child.stop()
        expect(childStopSpy).toHaveBeenCalled()
    })


    test('delegate with methods', () => {
        const target = {
            method1: vi.fn(),
            method2: vi.fn()
        }

        child.delegate(target, ['method1', 'method2'])

        expect(child.method1).toBeDefined()
        expect(child.method2).toBeDefined()
        expect(typeof child.method1).toBe('function')
        expect(typeof child.method2).toBe('function')
    })


    test('delegate with properties', () => {
        const target = {
            prop1: 'value1',
            prop2: 'value2'
        }

        child.delegate(target, ['prop1', 'prop2'])

        expect(child.prop1).toBe('value1')
        expect(child.prop2).toBe('value2')

        child.prop1 = 'newValue'
        expect(target.prop1).toBe('newValue')
    })


    test('delegate with mixed methods and properties', () => {
        const target = {
            count: 0,
            increment () {
                this.count++
            },
            decrement () {
                this.count--
            }
        }

        child.delegate(target, ['count', 'increment', 'decrement'])

        expect(child.count).toBe(0)
        expect(typeof child.increment).toBe('function')
        expect(typeof child.decrement).toBe('function')

        child.increment()
        expect(target.count).toBe(1)
        expect(child.count).toBe(1)

        child.decrement()
        expect(target.count).toBe(0)
        expect(child.count).toBe(0)
    })


    test('delegate with getters and setters', () => {
        const target = {
            _value: 10,
            get value () {
                return this._value
            },
            set value (newValue) {
                this._value = newValue
            }
        }

        child.delegate(target, ['value'])

        expect(child.value).toBe(10)

        child.value = 20
        expect(target.value).toBe(20)
        expect(child.value).toBe(20)
    })


    test('delegate with object-based aliasing', () => {
        const target = {
            originalMethod: vi.fn(() => 'result'),
            originalProp: 'value'
        }

        child.delegate(target, {
            originalMethod: 'aliasedMethod',
            originalProp: 'aliasedProp'
        })

        expect(child.aliasedMethod).toBeDefined()
        expect(typeof child.aliasedMethod).toBe('function')
        expect(child.aliasedMethod()).toBe('result')
        expect(target.originalMethod).toHaveBeenCalled()

        expect(child.aliasedProp).toBe('value')

        child.aliasedProp = 'new value'
        expect(target.originalProp).toBe('new value')
    })


    test('dispose calls dispose on all children in cascade', () => {
        class ChildChild1 extends PerkyModule { }
        class ChildChild2 extends PerkyModule { }

        const child1 = child.create(ChildChild1, {
            $name: 'child1'
        })

        const child2 = child.create(ChildChild2, {
            $name: 'child2'
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
            $name: 'level1'
        })

        const level2 = child.create(Level2Child, {
            $name: 'level2'
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
            $name: 'default'
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
            $name: 'default'
        })

        expect(child.hasChild('default')).toBe(true)

        child.dispose()

        expect(child.hasChild('default')).toBe(false)
        expect(child.childrenRegistry.size).toBe(0)
    })


    describe('static category', () => {
        test('uses PerkyModule default category "child" when not specified', () => {
            const module = child.create(PerkyModule, {$name: 'test'})
            expect(module.$category).toBe('default')
        })


        test('uses static category from subclass', () => {
            class GameController extends PerkyModule {
                static category = 'controller'
            }

            const controller = child.create(GameController, {$name: 'game'})
            expect(controller.$category).toBe('controller')
        })


        test('explicit $category overrides static category', () => {
            class GameController extends PerkyModule {
                static category = 'controller'
            }

            const controller = child.create(GameController, {
                $name: 'game',
                $category: 'custom'
            })

            expect(controller.$category).toBe('custom')
        })


        test('works with multiple levels of inheritance', () => {
            class BaseController extends PerkyModule {
                static get category () {
                    return 'controller'
                }
            }

            class GameController extends BaseController {
                static get category () {
                    return 'game-controller'
                }
            }

            const controller = child.create(GameController, {$name: 'game'})
            expect(controller.$category).toBe('game-controller')
        })


        test('subclass without static category falls back to parent', () => {
            class BaseController extends PerkyModule {
                static get category () {
                    return 'controller'
                }
            }

            class GameController extends BaseController {
                // No static category override
            }

            const controller = child.create(GameController, {$name: 'game'})
            expect(controller.$category).toBe('controller')
        })


        test('auto-generates unique IDs using static category', () => {
            class Monster extends PerkyModule {
                static get category () {
                    return 'monster'
                }
            }

            // Use a fresh parent to ensure predictable ID generation
            const parent = new PerkyModule()
            const monster1 = parent.create(Monster)
            const monster2 = parent.create(Monster)
            const monster3 = parent.create(Monster)

            expect(monster1.$category).toBe('monster')
            expect(monster2.$category).toBe('monster')
            expect(monster3.$category).toBe('monster')

            expect(monster1.$name).toBe('monster')
            expect(monster2.$name).toBe('monster_1')
            expect(monster3.$name).toBe('monster_2')
        })


        test('emits correct event based on static category', () => {
            class GameController extends PerkyModule {
                static get category () {
                    return 'controller'
                }
            }

            const emitSpy = vi.spyOn(child, 'emit')
            const controller = child.create(GameController, {$name: 'game'})

            expect(emitSpy).toHaveBeenCalledWith('controller:set', 'game', controller)
        })


        test('listNamesFor works with static category', () => {
            class GameController extends PerkyModule {
                static get category () {
                    return 'controller'
                }
            }

            class InputController extends PerkyModule {
                static get category () {
                    return 'controller'
                }
            }

            child.create(GameController, {$name: 'game'})
            child.create(InputController, {$name: 'input'})

            const controllers = child.listNamesFor('controller')
            expect(controllers).toHaveLength(2)
            expect(controllers).toContain('game')
            expect(controllers).toContain('input')
        })
    })


    describe('eagerStart', () => {
        test('default eagerStart is true for PerkyModule', () => {
            const module = child.create(PerkyModule, {$name: 'test'})
            expect(module.$eagerStart).toBe(true)
        })


        test('child starts eagerly when parent is already started', () => {
            child.start()

            const module = child.create(PerkyModule, {$name: 'test'})

            expect(module.started).toBe(true)
        })


        test('child does not start when parent is not started', () => {
            const module = child.create(PerkyModule, {$name: 'test'})

            expect(module.started).toBe(false)
        })


        test('eagerStart: false prevents automatic start', () => {
            child.start()

            const module = child.create(PerkyModule, {
                $name: 'test',
                $eagerStart: false
            })

            expect(module.started).toBe(false)
        })


        test('eagerStart: true forces eager start', () => {
            child.start()

            const module = child.create(PerkyModule, {
                $name: 'test',
                $eagerStart: true
            })

            expect(module.started).toBe(true)
        })


        test('static eagerStart is inherited from class', () => {
            class LazyModule extends PerkyModule {
                static eagerStart = false
            }

            child.start()

            const module = child.create(LazyModule, {$name: 'test'})

            expect(module.$eagerStart).toBe(false)
            expect(module.started).toBe(false)
        })


        test('explicit $eagerStart overrides static eagerStart', () => {
            class LazyModule extends PerkyModule {
                static eagerStart = false
            }

            child.start()

            const module = child.create(LazyModule, {
                $name: 'test',
                $eagerStart: true
            })

            expect(module.$eagerStart).toBe(true)
            expect(module.started).toBe(true)
        })


        test('eagerStart cascading: option > static > default', () => {
            class CustomModule extends PerkyModule {
                static eagerStart = false
            }

            const module1 = child.create(CustomModule, {$name: 'test1'})
            expect(module1.$eagerStart).toBe(false)

            const module2 = child.create(CustomModule, {
                $name: 'test2',
                $eagerStart: true
            })
            expect(module2.$eagerStart).toBe(true)

            const module3 = child.create(PerkyModule, {$name: 'test3'})
            expect(module3.$eagerStart).toBe(true)
        })


        test('eagerStart works with $lifecycle: false', () => {
            child.start()

            const module = child.create(PerkyModule, {
                $name: 'test',
                $eagerStart: true,
                $lifecycle: false
            })

            expect(module.started).toBe(false)
        })


        test('lazy module can be started manually later', () => {
            child.start()

            const module = child.create(PerkyModule, {
                $name: 'test',
                $eagerStart: false
            })

            expect(module.started).toBe(false)

            module.start()

            expect(module.started).toBe(true)
        })


        test('multiple children with mixed eagerStart', () => {
            child.start()

            const eager1 = child.create(PerkyModule, {
                $name: 'eager1',
                $eagerStart: true
            })

            const lazy1 = child.create(PerkyModule, {
                $name: 'lazy1',
                $eagerStart: false
            })

            const eager2 = child.create(PerkyModule, {
                $name: 'eager2'
            })

            expect(eager1.started).toBe(true)
            expect(lazy1.started).toBe(false)
            expect(eager2.started).toBe(true)
        })


        test('eagerStart getter returns correct value', () => {
            const eager = child.create(PerkyModule, {
                $name: 'eager',
                $eagerStart: true
            })

            const lazy = child.create(PerkyModule, {
                $name: 'lazy',
                $eagerStart: false
            })
            expect(eager.$eagerStart).toBe(true)
            expect(lazy.$eagerStart).toBe(false)
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

    })


    describe('composite tag indexing', () => {

        test('childrenByTags returns children matching all tags (without index)', () => {
            const child1 = child.create(PerkyModule, {$name: 'c1', $tags: ['enemy', 'collidable', 'flying']})
            const child2 = child.create(PerkyModule, {$name: 'c2', $tags: ['enemy', 'collidable']})
            child.create(PerkyModule, {$name: 'c3', $tags: ['friendly', 'collidable']})

            const enemyColliders = child.childrenByTags('enemy', 'collidable')

            expect(enemyColliders).toHaveLength(2)
            expect(enemyColliders).toContain(child1)
            expect(enemyColliders).toContain(child2)
        })


        test('childrenByTags returns empty array for no matches', () => {
            child.create(PerkyModule, {$name: 'c1', $tags: ['enemy']})

            const result = child.childrenByTags('enemy', 'collidable')

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
            const child1 = child.create(PerkyModule, {$name: 'c1', $tags: ['enemy', 'collidable']})
            child.create(PerkyModule, {$name: 'c2', $tags: ['enemy']})

            child.addTagsIndex(['enemy', 'collidable'])

            const result = child.childrenByTags('enemy', 'collidable')

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
            const testChild = child.create(PerkyModule, {$name: 'test', $tags: ['enemy']})
            child.addTagsIndex(['enemy', 'collidable'])
            expect(child.childrenByTags('enemy', 'collidable')).toHaveLength(0)

            testChild.tags.add('collidable')

            expect(child.childrenByTags('enemy', 'collidable')).toHaveLength(1)
            expect(child.childrenByTags('enemy', 'collidable')).toContain(testChild)
        })


        test('index automatically updates when child tags change (delete)', () => {
            const testChild = child.create(PerkyModule, {$name: 'test', $tags: ['enemy', 'collidable']})
            child.addTagsIndex(['enemy', 'collidable'])

            expect(child.childrenByTags('enemy', 'collidable')).toHaveLength(1)

            testChild.tags.delete('collidable')

            expect(child.childrenByTags('enemy', 'collidable')).toHaveLength(0)
        })


        test('index automatically updates when child tags change (clear)', () => {
            const testChild = child.create(PerkyModule, {$name: 'test', $tags: ['enemy', 'collidable']})
            child.addTagsIndex(['enemy', 'collidable'])

            expect(child.childrenByTags('enemy', 'collidable')).toHaveLength(1)

            testChild.tags.clear()

            expect(child.childrenByTags('enemy', 'collidable')).toHaveLength(0)
        })


        test('index updates when $tags is reassigned', () => {
            const testChild = child.create(PerkyModule, {$name: 'test', $tags: ['enemy']})
            child.addTagsIndex(['enemy', 'collidable'])

            expect(child.childrenByTags('enemy', 'collidable')).toHaveLength(0)

            testChild.$tags = ['enemy', 'collidable']

            expect(child.childrenByTags('enemy', 'collidable')).toHaveLength(1)
        })


        test('multiple composite indexes work independently', () => {
            const enemy = child.create(PerkyModule, {$name: 'enemy', $tags: ['enemy', 'collidable']})
            const friendly = child.create(PerkyModule, {$name: 'friendly', $tags: ['friendly', 'collidable']})

            child.addTagsIndex(['enemy', 'collidable'])
            child.addTagsIndex(['friendly', 'collidable'])

            expect(child.childrenByTags('enemy', 'collidable')).toEqual([enemy])
            expect(child.childrenByTags('friendly', 'collidable')).toEqual([friendly])
        })


        test('events are cleaned up when child is removed', () => {
            const testChild = child.create(PerkyModule, {$name: 'test', $tags: ['enemy', 'collidable']})
            child.addTagsIndex(['enemy', 'collidable'])

            expect(child.childrenByTags('enemy', 'collidable')).toHaveLength(1)

            child.removeChild('test')

            expect(child.childrenByTags('enemy', 'collidable')).toHaveLength(0)

            testChild.tags.add('flying')
            expect(child.childrenByTags('enemy', 'collidable')).toHaveLength(0)
        })


        test('index hooks are added to existing children', () => {
            const testChild = child.create(PerkyModule, {$name: 'test', $tags: ['enemy']})

            child.addTagsIndex(['enemy', 'collidable'])

            testChild.tags.add('collidable')

            expect(child.childrenByTags('enemy', 'collidable')).toHaveLength(1)
        })


        test('single tag query works', () => {
            const child1 = child.create(PerkyModule, {$name: 'c1', $tags: ['enemy']})
            const child2 = child.create(PerkyModule, {$name: 'c2', $tags: ['enemy', 'flying']})
            child.create(PerkyModule, {$name: 'c3', $tags: ['friendly']})

            const enemies = child.childrenByTags('enemy')

            expect(enemies).toHaveLength(2)
            expect(enemies).toContain(child1)
            expect(enemies).toContain(child2)
        })


        test('works with children without tags', () => {
            child.create(PerkyModule, {$name: 'c1'})
            const child2 = child.create(PerkyModule, {$name: 'c2', $tags: ['enemy']})

            const result = child.childrenByTags('enemy')

            expect(result).toEqual([child2])
        })

    })

})

