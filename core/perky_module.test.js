import PerkyModule from './perky_module'
import Registry from './registry'
import {vi, describe, test, expect, beforeEach, afterEach} from 'vitest'


describe(PerkyModule, () => {
    let extension
    let host


    beforeEach(() => {
        const extensionsRegistry = new Registry()
        host = {
            started: false,
            on: vi.fn(),
            emit: vi.fn(),
            getExtensionsRegistry: vi.fn(() => extensionsRegistry),
            hasExtension: vi.fn((name) => extensionsRegistry.has(name)),
            getExtension: vi.fn((name) => extensionsRegistry.get(name))
        }

        extension = new PerkyModule({name: 'testExtension'})
    })


    afterEach(() => {
        vi.restoreAllMocks()
    })


    test('constructor', () => {
        expect(extension).toBeInstanceOf(PerkyModule)
        expect(extension.name).toBe('testExtension')
        expect(extension.options).toEqual({name: 'testExtension'})
        expect(extension.host).toBeNull()
        expect(extension.installed).toBe(false)
    })


    test('constructor with default name', () => {
        class TestExtension extends PerkyModule { }
        const ext = new TestExtension()
        expect(ext.name).toBe('TestExtension')
    })


    test('install', () => {
        const result = extension.install(host, {})

        expect(result).toBe(true)
        expect(extension.host).toBe(host)
        expect(extension.installed).toBe(true)
    })


    test('install when already installed', () => {
        extension.install(host, {})
        const result = extension.install(host, {})

        expect(result).toBe(false)
    })


    test('uninstall', () => {
        extension.install(host, {})
        const result = extension.uninstall()

        expect(result).toBe(true)
        expect(extension.host).toBeNull()
        expect(extension.installed).toBe(false)
    })


    test('uninstall when not installed', () => {
        const result = extension.uninstall()
        expect(result).toBe(false)
    })


    test('use with Extension class', () => {
        class TestExtension extends PerkyModule { }

        const result = extension.use(TestExtension, {
            $name: 'test',
            $category: 'test'
        })

        expect(result).toBeInstanceOf(TestExtension)
        expect(result).toBe(extension.getExtension('test'))
        expect(extension.hasExtension('test')).toBe(true)
    })


    test('use with Extension instance', () => {
        class TestExtension extends PerkyModule { }
        const instance = new TestExtension()

        const result = extension.use(TestExtension, {
            instance,
            $name: 'test',
            $category: 'test'
        })

        expect(result).toBe(instance)
        expect(extension.getExtension('test')).toBe(instance)
    })


    test('use with binding', () => {
        class TestExtension extends PerkyModule { }

        extension.use(TestExtension, {
            $name: 'test',
            $bind: 'testProperty'
        })

        expect(extension.testProperty).toBeInstanceOf(TestExtension)
    })


    test('use with lifecycle disabled', () => {
        class TestExtension extends PerkyModule { }
        const startSpy = vi.spyOn(TestExtension.prototype, 'start')

        extension.use(TestExtension, {
            $name: 'test',
            $lifecycle: false
        })

        extension.start()

        expect(startSpy).not.toHaveBeenCalled()
    })


    test('use with lifecycle enabled', () => {
        class TestExtension extends PerkyModule { }
        const instance = new TestExtension()
        const startSpy = vi.spyOn(instance, 'start')

        extension.use(TestExtension, {
            instance,
            $name: 'test',
            $lifecycle: true
        })

        extension.start()

        expect(startSpy).toHaveBeenCalled()
    })


    test('use emits registration events', () => {
        class TestExtension extends PerkyModule { }
        const emitSpy = vi.spyOn(extension, 'emit')
        const testExt = new TestExtension()
        const testExtEmitSpy = vi.spyOn(testExt, 'emit')

        extension.use(TestExtension, {
            instance: testExt,
            $name: 'test',
            $category: 'testCategory'
        })

        expect(emitSpy).toHaveBeenCalledWith('testCategory:set', 'test', testExt)
        expect(testExtEmitSpy).toHaveBeenCalledWith('registered', extension, 'test')
    })


    test('removeExtension', () => {
        class TestExtension extends PerkyModule { }
        const instance = new TestExtension()
        const uninstallSpy = vi.spyOn(instance, 'uninstall')
        const disposeSpy = vi.spyOn(instance, 'dispose')

        extension.use(TestExtension, {
            instance,
            $name: 'test',
            $category: 'test'
        })

        const result = extension.removeExtension('test')

        expect(result).toBe(true)
        expect(uninstallSpy).toHaveBeenCalled()
        expect(disposeSpy).toHaveBeenCalled()
    })


    test('removeExtension non-existent', () => {
        const result = extension.removeExtension('nonexistent')
        expect(result).toBe(false)
    })


    test('lifecycle cascade', () => {
        class ChildExtension extends PerkyModule { }
        const child = new ChildExtension()
        const childStartSpy = vi.spyOn(child, 'start')
        const childStopSpy = vi.spyOn(child, 'stop')

        extension.use(ChildExtension, {
            instance: child,
            $name: 'child',
            $lifecycle: true
        })

        extension.start()
        expect(childStartSpy).toHaveBeenCalled()

        extension.stop()
        expect(childStopSpy).toHaveBeenCalled()
    })


    test('requireExtension', () => {
        class TestExtension extends PerkyModule { }
        const testExt = new TestExtension()
        const extensionsRegistry = new Map()
        extensionsRegistry.set('test', testExt)

        host.hasExtension = vi.fn((name) => extensionsRegistry.has(name))
        host.getExtension = vi.fn((name) => extensionsRegistry.get(name))
        extension.install(host, {})

        const required = extension.requireExtension('test')
        expect(required).toBe(testExt)
        expect(host.hasExtension).toHaveBeenCalledWith('test')
        expect(host.getExtension).toHaveBeenCalledWith('test')
    })


    test('requireExtension throws when not found', () => {
        expect(() => {
            extension.requireExtension('nonexistent')
        }).toThrow("Extension 'testExtension' requires extension 'nonexistent' but it is not installed")
    })


    test('addMethod', () => {
        extension.install(host, {})
        const testMethod = vi.fn()

        const result = extension.addMethod('testMethod', testMethod)

        expect(result).toBe(true)
        expect(host.testMethod).toBeDefined()
        expect(typeof host.testMethod).toBe('function')
    })


    test('addMethod without host throws', () => {
        expect(() => {
            extension.addMethod('test', vi.fn())
        }).toThrow('Cannot add method: extension has no host')
    })


    test('delegate with methods', () => {
        const target = {
            method1: vi.fn(),
            method2: vi.fn()
        }

        extension.delegate(target, ['method1', 'method2'])

        expect(extension.method1).toBeDefined()
        expect(extension.method2).toBeDefined()
        expect(typeof extension.method1).toBe('function')
        expect(typeof extension.method2).toBe('function')
    })


    test('delegate with properties', () => {
        const target = {
            prop1: 'value1',
            prop2: 'value2'
        }

        extension.delegate(target, ['prop1', 'prop2'])

        expect(extension.prop1).toBe('value1')
        expect(extension.prop2).toBe('value2')

        extension.prop1 = 'newValue'
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

        extension.delegate(target, ['count', 'increment', 'decrement'])

        expect(extension.count).toBe(0)
        expect(typeof extension.increment).toBe('function')
        expect(typeof extension.decrement).toBe('function')

        extension.increment()
        expect(target.count).toBe(1)
        expect(extension.count).toBe(1)

        extension.decrement()
        expect(target.count).toBe(0)
        expect(extension.count).toBe(0)
    })

})

