import PluginRegistry from './plugin_registry.js'
import Plugin from './plugin.js'
import Engine from './engine.js'
import Application from '../application/application.js'
import {vi, beforeEach, describe, test, expect} from 'vitest'


describe(PluginRegistry, () => {

    let registry
    let engine
    let plugin

    beforeEach(() => {
        engine = new Engine()
        registry = new PluginRegistry(engine)
        plugin = new Plugin({name: 'testPlugin'})
    })


    test('constructor', () => {
        expect(registry.engine).toBe(engine)
        expect(registry).toBeInstanceOf(PluginRegistry)
    })


    test('install plugin success', () => {
        const engineSpy = vi.spyOn(engine, 'emit')
        const result = registry.install('test', plugin)

        expect(result).toBe(true)
        expect(registry.has('test')).toBe(true)
        expect(registry.get('test')).toBe(plugin)
        expect(plugin.installed).toBe(true)
        expect(plugin.engine).toBe(engine)
        expect(engineSpy).toHaveBeenCalledWith('plugin:installed', 'test', plugin)
    })


    test('install non-plugin object', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const nonPlugin = {name: 'not a plugin'}
        
        const result = registry.install('test', nonPlugin)

        expect(result).toBe(false)
        expect(registry.has('test')).toBe(false)
        expect(consoleSpy).toHaveBeenCalledWith('Attempted to install non-plugin object: test')
        
        consoleSpy.mockRestore()
    })


    test('install already installed plugin', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        
        registry.install('test', plugin)
        const result = registry.install('test', plugin)

        expect(result).toBe(false)
        expect(consoleSpy).toHaveBeenCalledWith('Plugin test already installed')
        
        consoleSpy.mockRestore()
    })


    test('install plugin install failure', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const installSpy = vi.spyOn(plugin, 'install').mockReturnValue(false)
        
        const result = registry.install('test', plugin)

        expect(result).toBe(false)
        expect(registry.has('test')).toBe(false)
        expect(consoleSpy).toHaveBeenCalledWith('Failed to install plugin: test')
        
        installSpy.mockRestore()
        consoleSpy.mockRestore()
    })


    test('uninstall plugin success', () => {
        const engineSpy = vi.spyOn(engine, 'emit')
        
        registry.install('test', plugin)
        const result = registry.uninstall('test')

        expect(result).toBe(true)
        expect(registry.has('test')).toBe(false)
        expect(plugin.installed).toBe(false)
        expect(plugin.engine).toBeNull()
        expect(engineSpy).toHaveBeenCalledWith('plugin:uninstalled', 'test', plugin)
    })


    test('uninstall non-existent plugin', () => {
        const result = registry.uninstall('nonExistent')

        expect(result).toBe(false)
    })


    test('uninstall plugin uninstall failure', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const uninstallSpy = vi.spyOn(plugin, 'uninstall').mockReturnValue(false)
        
        registry.install('test', plugin)
        const result = registry.uninstall('test')

        expect(result).toBe(false)
        expect(registry.has('test')).toBe(true)
        expect(consoleSpy).toHaveBeenCalledWith('Failed to uninstall plugin: test')
        
        uninstallSpy.mockRestore()
        consoleSpy.mockRestore()
    })


    test('isInstalled', () => {
        expect(registry.isInstalled('test')).toBe(false)
        
        registry.install('test', plugin)
        expect(registry.isInstalled('test')).toBe(true)
        
        registry.uninstall('test')
        expect(registry.isInstalled('test')).toBe(false)
    })


    test('getPlugin', () => {
        expect(registry.getPlugin('test')).toBeUndefined()
        
        registry.install('test', plugin)
        expect(registry.getPlugin('test')).toBe(plugin)
    })


    test('getAllPlugins', () => {
        const plugin2 = new Plugin({name: 'plugin2'})
        
        expect(registry.getAllPlugins()).toEqual([])
        
        registry.install('test1', plugin)
        registry.install('test2', plugin2)
        
        const allPlugins = registry.getAllPlugins()
        expect(allPlugins).toHaveLength(2)
        expect(allPlugins).toContain(plugin)
        expect(allPlugins).toContain(plugin2)
    })


    test('getPluginNames', () => {
        const plugin2 = new Plugin({name: 'plugin2'})
        
        expect(registry.getPluginNames()).toEqual([])
        
        registry.install('test1', plugin)
        registry.install('test2', plugin2)
        
        const names = registry.getPluginNames()
        expect(names).toHaveLength(2)
        expect(names).toContain('test1')
        expect(names).toContain('test2')
    })


    test('clear event uninstalls all plugins', () => {
        const plugin2 = new Plugin({name: 'plugin2'})
        const uninstallSpy1 = vi.spyOn(plugin, 'uninstall')
        const uninstallSpy2 = vi.spyOn(plugin2, 'uninstall')
        
        registry.install('test1', plugin)
        registry.install('test2', plugin2)
        
        registry.emit('clear')
        
        expect(uninstallSpy1).toHaveBeenCalled()
        expect(uninstallSpy2).toHaveBeenCalled()
    })


    test('multiple plugins installation order', () => {
        const plugin2 = new Plugin({name: 'plugin2'})
        const plugin3 = new Plugin({name: 'plugin3'})
        
        registry.install('first', plugin)
        registry.install('second', plugin2)
        registry.install('third', plugin3)
        
        expect(registry.size).toBe(3)
        expect(registry.getPluginNames()).toEqual(['first', 'second', 'third'])
    })


    test('plugin events during installation', () => {
        const engineInstallSpy = vi.spyOn(engine, 'emit')
        const pluginInstallSpy = vi.spyOn(plugin, 'install')
        
        registry.install('test', plugin)
        
        expect(pluginInstallSpy).toHaveBeenCalledWith(engine)
        expect(engineInstallSpy).toHaveBeenCalledWith('plugin:installed', 'test', plugin)
    })


    test('plugin events during uninstallation', () => {
        const engineUninstallSpy = vi.spyOn(engine, 'emit')
        const pluginUninstallSpy = vi.spyOn(plugin, 'uninstall')
        
        registry.install('test', plugin)
        registry.uninstall('test')
        
        expect(pluginUninstallSpy).toHaveBeenCalled()
        expect(engineUninstallSpy).toHaveBeenCalledWith('plugin:uninstalled', 'test', plugin)
    })

})


describe('PluginRegistry integration', () => {

    test('plugins can access each other through registry', () => {
        global.ResizeObserver = vi.fn().mockImplementation(() => ({
            observe: vi.fn(),
            unobserve: vi.fn(),
            disconnect: vi.fn()
        }))

        const app = new Application()
        
        class FirstPlugin extends Plugin {
            constructor () {
                super({name: 'first'})
            }
            
            onInstall () {
                this.addMethod('firstMethod', function () {
                    return 'first result'
                })
            }
        }
        
        class SecondPlugin extends Plugin {
            constructor () {
                super({name: 'second'})
            }
            
            onInstall () {
                this.requirePlugin('first')
                
                this.addMethod('secondMethod', function () {
                    return `second calling ${this.firstMethod()}`
                })
            }
        }
        
        const firstPlugin = new FirstPlugin()
        const secondPlugin = new SecondPlugin()
        
        app.installPlugin('first', firstPlugin)
        app.installPlugin('second', secondPlugin)
        
        expect(app.firstMethod()).toBe('first result')
        expect(app.secondMethod()).toBe('second calling first result')
        
        global.ResizeObserver = undefined
    })


    test('plugin dependency requirement failure', () => {
        global.ResizeObserver = vi.fn().mockImplementation(() => ({
            observe: vi.fn(),
            unobserve: vi.fn(),
            disconnect: vi.fn()
        }))

        const app = new Application()
        
        class DependentPlugin extends Plugin {
            constructor () {
                super({name: 'dependent'})
            }
            
            onInstall () {
                this.requirePlugin('nonExistent')
            }
        }
        
        const dependentPlugin = new DependentPlugin()
        
        expect(() => {
            app.installPlugin('dependent', dependentPlugin)
        }).toThrow("Plugin 'dependent' requires plugin 'nonExistent' but it is not installed")
        
        global.ResizeObserver = undefined
    })


    test('plugin installation with method conflicts', () => {
        // Mock ResizeObserver for Application
        global.ResizeObserver = vi.fn().mockImplementation(() => ({
            observe: vi.fn(),
            unobserve: vi.fn(),
            disconnect: vi.fn()
        }))

        const app = new Application()
        
        class FirstPlugin extends Plugin {
            onInstall () {
                this.addMethod('conflictMethod', function () {
                    return 'first'
                })
            }
        }
        
        class SecondPlugin extends Plugin {
            onInstall () {
                this.overrideMethod('conflictMethod', function () {
                    return 'second'
                })
            }
        }
        
        const firstPlugin = new FirstPlugin()
        const secondPlugin = new SecondPlugin()
        
        app.installPlugin('first', firstPlugin)
        app.installPlugin('second', secondPlugin)
        
        expect(app.conflictMethod()).toBe('second')
        
        global.ResizeObserver = undefined
    })

}) 