import Plugin from './plugin'
import Engine from './engine'
import PerkyModule from './perky_module'
import {vi} from 'vitest'


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


    test('requirePlugin success', () => {
        plugin.install(engine)
        
        const requiredPlugin = new Plugin({name: 'required'})
        engine.installPlugin('required', requiredPlugin)
        
        const result = plugin.requirePlugin('required')
        
        expect(result).toBe(requiredPlugin)
    })


    test('requirePlugin not installed', () => {
        plugin.install(engine)
        
        expect(() => {
            plugin.requirePlugin('nonExistentPlugin')
        }).toThrow("Plugin 'Plugin' requires plugin 'nonExistentPlugin' but it is not installed")
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
