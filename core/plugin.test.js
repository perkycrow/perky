import Plugin from './plugin'
import Engine from './engine'
import Application from '../application/application'
import PerkyModule from './perky_module'
import {vi, beforeEach, describe, test, expect} from 'vitest'


describe(Plugin, () => {

    let plugin
    let engine

    beforeEach(() => {
        plugin = new Plugin()
        engine = new Engine()
    })


    test('constructor', () => {
        expect(plugin.name).toBe('Plugin')
        expect(plugin.engine).toBeNull()
        expect(plugin.installed).toBe(false)
        expect(plugin.options).toEqual({})
    })


    test('constructor with options', () => {
        const options = {name: 'TestPlugin', customOption: 'value'}
        const customPlugin = new Plugin(options)

        expect(customPlugin.name).toBe('TestPlugin')
        expect(customPlugin.options).toEqual(options)
    })


    test('install', () => {
        const installSpy = vi.spyOn(plugin, 'onInstall')
        
        const result = plugin.install(engine)

        expect(result).toBe(true)
        expect(plugin.engine).toBe(engine)
        expect(plugin.installed).toBe(true)
        expect(installSpy).toHaveBeenCalledWith(engine)
    })


    test('install already installed', () => {
        plugin.install(engine)
        
        const result = plugin.install(engine)

        expect(result).toBe(false)
    })


    test('uninstall', () => {
        const uninstallSpy = vi.spyOn(plugin, 'onUninstall')
        
        plugin.install(engine)
        const result = plugin.uninstall()

        expect(result).toBe(true)
        expect(plugin.engine).toBeNull()
        expect(plugin.installed).toBe(false)
        expect(uninstallSpy).toHaveBeenCalledWith(engine)
    })


    test('uninstall not installed', () => {
        const result = plugin.uninstall()

        expect(result).toBe(false)
    })


    test('registerModule', () => {
        const testModule = new PerkyModule()
        const registerSpy = vi.spyOn(engine, 'registerModule')
        
        plugin.install(engine)
        const result = plugin.registerModule('test', testModule)

        expect(registerSpy).toHaveBeenCalledWith('test', testModule)
        expect(result).toBe(registerSpy.mock.results[0].value)
    })


    test('addMethod', () => {
        plugin.install(engine)
        
        function testMethod (param) {
            return `Hello ${param}`
        }
        
        const result = plugin.addMethod('testMethod', testMethod)

        expect(result).toBe(true)
        expect(engine.testMethod).toBeDefined()
        expect(engine.testMethod('World')).toBe('Hello World')
    })


    test('addMethod non-function', () => {
        plugin.install(engine)
        
        expect(() => {
            plugin.addMethod('testMethod', 'not a function')
        }).toThrow('Method must be a function')
    })


    test('addMethod already exists', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        
        plugin.install(engine)
        engine.existingMethod = () => {}
        
        const result = plugin.addMethod('existingMethod', () => {})

        expect(result).toBe(false)
        expect(consoleSpy).toHaveBeenCalledWith('Method existingMethod already exists on engine')
        
        consoleSpy.mockRestore()
    })


    test('overrideMethod', () => {
        plugin.install(engine)
        
        engine.existingMethod = () => 'original'
        
        function newMethod () {
            return 'overridden'
        }
        
        const result = plugin.overrideMethod('existingMethod', newMethod)

        expect(result).toBe(true)
        expect(engine.existingMethod()).toBe('overridden')
    })


    test('overrideMethod non-function', () => {
        plugin.install(engine)
        
        expect(() => {
            plugin.overrideMethod('testMethod', 'not a function')
        }).toThrow('Method must be a function')
    })


    test('wrapMethod', () => {
        plugin.install(engine)
        
        engine.existingMethod = (param) => `original: ${param}`
        
        function wrappedMethod (original, param) {
            const result = original(param)
            return `wrapped (${result})`
        }
        
        const result = plugin.wrapMethod('existingMethod', wrappedMethod)

        expect(result).toBe(true)
        expect(engine.existingMethod('test')).toBe('wrapped (original: test)')
    })


    test('wrapMethod non-existent method', () => {
        plugin.install(engine)
        
        function newMethod (original, param) {
            original(param) // original sera une fonction vide
            return `new: ${param}`
        }
        
        const result = plugin.wrapMethod('nonExistentMethod', newMethod)

        expect(result).toBe(true)
        expect(engine.nonExistentMethod('test')).toBe('new: test')
    })


    test('wrapMethod non-function', () => {
        plugin.install(engine)
        
        expect(() => {
            plugin.wrapMethod('testMethod', 'not a function')
        }).toThrow('Method must be a function')
    })


    test('addProperty', () => {
        plugin.install(engine)
        
        const result = plugin.addProperty('testProperty', {
            get () {
                return 'test value'
            }
        })

        expect(result).toBe(true)
        expect(engine.testProperty).toBe('test value')
    })


    test('addProperty already exists', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        
        plugin.install(engine)
        engine.existingProperty = 'existing'
        
        const result = plugin.addProperty('existingProperty', {
            get () {
                return 'new value'
            }
        })

        expect(result).toBe(false)
        expect(consoleSpy).toHaveBeenCalledWith('Property existingProperty already exists on engine')
        
        consoleSpy.mockRestore()
    })


    test('bindEvents', () => {
        const engineSpy = vi.spyOn(engine, 'on')
        const handler1 = vi.fn()
        const handler2 = vi.fn()
        
        plugin.install(engine)
        
        plugin.bindEvents({
            event1: handler1,
            event2: handler2
        })

        expect(engineSpy).toHaveBeenCalledWith('event1', handler1)
        expect(engineSpy).toHaveBeenCalledWith('event2', handler2)
    })


    test('bindEvents with invalid input', () => {
        plugin.install(engine)
        
        expect(() => {
            plugin.bindEvents(null)
        }).not.toThrow()
        
        expect(() => {
            plugin.bindEvents('invalid')
        }).not.toThrow()
    })


    test('bindEvents with non-function handler', () => {
        const engineSpy = vi.spyOn(engine, 'on')
        
        plugin.install(engine)
        
        plugin.bindEvents({
            event1: 'not a function',
            event2: () => {}
        })

        expect(engineSpy).toHaveBeenCalledTimes(1)
        expect(engineSpy).toHaveBeenCalledWith('event2', expect.any(Function))
    })


    test('delegateTo', () => {
        plugin.install(engine)

        const target = {
            method1: () => 'result1',
            method2: () => 'result2',
            prop: 'value'
        }
        
        plugin.delegateTo(target, ['method1', 'method2', 'prop']) // prop should be ignored

        expect(engine.method1).toBeDefined()
        expect(engine.method2).toBeDefined()
        expect(engine.prop).toBeUndefined()
        
        expect(engine.method1()).toBe('result1')
        expect(engine.method2()).toBe('result2')
    })


    test('delegateProperties', () => {
        plugin.install(engine)

        const target = {
            prop1: 'value1',
            prop2: 'value2'
        }
        
        plugin.delegateProperties(target, ['prop1'])

        expect(engine.prop1).toBe('value1')
        
        // Check setter
        engine.prop1 = 'newValue'
        expect(target.prop1).toBe('newValue')
        expect(engine.prop1).toBe('newValue')
    })


    test('delegateProperties readOnly', () => {
        plugin.install(engine)

        const target = {
            prop1: 'value1'
        }
        
        plugin.delegateProperties(target, ['prop1'], true)

        expect(engine.prop1).toBe('value1')
        
        // Check setter throws or does nothing (depending on strict mode, here usually throws in strict mode)
        expect(() => {
            engine.prop1 = 'newValue'
        }).toThrow()
        
        expect(target.prop1).toBe('value1')
    })


    test('requirePlugin success', () => {
        global.ResizeObserver = vi.fn().mockImplementation(() => ({
            observe: vi.fn(),
            unobserve: vi.fn(),
            disconnect: vi.fn()
        }))

        const app = new Application()
        plugin.install(app)
        
        const requiredPlugin = new Plugin({name: 'required'})
        app.installPlugin('required', requiredPlugin)
        
        const result = plugin.requirePlugin('required')
        
        expect(result).toBe(requiredPlugin)
        
        global.ResizeObserver = undefined
    })


    test('requirePlugin not installed', () => {
        global.ResizeObserver = vi.fn().mockImplementation(() => ({
            observe: vi.fn(),
            unobserve: vi.fn(),
            disconnect: vi.fn()
        }))

        const app = new Application()
        plugin.install(app)
        
        expect(() => {
            plugin.requirePlugin('nonExistentPlugin')
        }).toThrow("Plugin 'Plugin' requires plugin 'nonExistentPlugin' but it is not installed")
        
        global.ResizeObserver = undefined
    })

})


describe('Plugin subclass', () => {

    class TestPlugin extends Plugin {
        constructor (options = {}) {
            super({
                name: 'test',
                ...options
            })
        }

        onInstall () {
            this.addMethod('customMethod', function () {
                return 'custom result'
            })
        }

        onUninstall () {
            this.cleanupPerformed = true
        }
    }


    test('subclass lifecycle', () => {
        const plugin = new TestPlugin()
        const engine = new Engine()

        expect(plugin.name).toBe('test')

        plugin.install(engine)
        expect(engine.customMethod).toBeDefined()
        expect(engine.customMethod()).toBe('custom result')

        plugin.uninstall()
        expect(plugin.cleanupPerformed).toBe(true)
    })

})
