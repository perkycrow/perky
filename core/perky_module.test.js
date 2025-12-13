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

        child = new PerkyModule({name: 'testChild'})
    })


    afterEach(() => {
        vi.restoreAllMocks()
    })


    test('constructor', () => {
        expect(child).toBeInstanceOf(PerkyModule)
        expect(child.name).toBe('testChild')
        expect(child.options).toEqual({name: 'testChild'})
        expect(child.host).toBeNull()
        expect(child.installed).toBe(false)
    })


    test('constructor with default name', () => {
        class TestChild extends PerkyModule { }
        const ext = new TestChild()
        expect(ext.name).toBe('TestChild')
    })


    test('install', () => {
        const result = child.install(host, {})

        expect(result).toBe(true)
        expect(child.host).toBe(host)
        expect(child.installed).toBe(true)
    })


    test('install when already installed', () => {
        child.install(host, {})
        const result = child.install(host, {})

        expect(result).toBe(false)
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


    test('getChildrenByCategory - single category', () => {
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

        const modules = child.getChildrenByCategory('module')

        expect(modules).toHaveLength(2)
        expect(modules).toContain('ext1')
        expect(modules).toContain('ext2')
    })


    test('getChildrenByCategory - mixed categories', () => {
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

        const modules = child.getChildrenByCategory('module')
        const services = child.getChildrenByCategory('service')

        expect(modules).toHaveLength(2)
        expect(modules).toContain('ext1')
        expect(modules).toContain('ext3')

        expect(services).toHaveLength(1)
        expect(services).toContain('ext2')
    })


    test('getChildrenByCategory - empty category', () => {
        class TestChild extends PerkyModule { }

        child.create(TestChild, {
            $name: 'ext1',
            $category: 'module'
        })

        const services = child.getChildrenByCategory('service')

        expect(services).toHaveLength(0)
        expect(services).toEqual([])
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


    test('use with binding', () => {
        class TestChild extends PerkyModule { }

        child.create(TestChild, {
            $name: 'test',
            $bind: 'testProperty'
        })

        expect(child.testProperty).toBeInstanceOf(TestChild)
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
            $name: 'child',
            $lifecycle: true
        })

        const childStartSpy = vi.spyOn(childChild, 'start')
        const childStopSpy = vi.spyOn(childChild, 'stop')

        child.start()
        expect(childStartSpy).toHaveBeenCalled()

        child.stop()
        expect(childStopSpy).toHaveBeenCalled()
    })


    test('addMethod', () => {
        child.install(host, {})
        const testMethod = vi.fn()

        const result = child.addMethod('testMethod', testMethod)

        expect(result).toBe(true)
        expect(host.testMethod).toBeDefined()
        expect(typeof host.testMethod).toBe('function')
    })


    test('addMethod without host throws', () => {
        expect(() => {
            child.addMethod('test', vi.fn())
        }).toThrow('Cannot add method: child has no host')
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
            $name: 'child'
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
            $name: 'child'
        })

        expect(child.hasChild('child')).toBe(true)

        child.dispose()

        expect(child.hasChild('child')).toBe(false)
        expect(child.childrenRegistry.size).toBe(0)
    })

})



