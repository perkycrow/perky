import ModuleRegistry from './module_registry'
import PerkyModule from './perky_module'
import {vi} from 'vitest'


describe(ModuleRegistry, () => {

    let registry
    let parentModule
    
    beforeEach(() => {
        parentModule = new PerkyModule()
        registry = new ModuleRegistry({
            registryName: 'testRegistry',
            parentModule,
            parentModuleName: 'parent',
            bind: true,
            autoStart: true
        })
    })


    test('constructor', () => {
        const config = registry.getConfig()
        expect(config.parentModule).toBe(parentModule)
        expect(config.parentModuleName).toBe('parent')
        expect(config.registryName).toBe('testRegistry')
        expect(config.bind).toBe(true)
        expect(config.autoStart).toBe(true)
        
        config.bind = false
        expect(registry.getConfig().bind).toBe(true)
        
        const module = new PerkyModule()
        const emitSpy = vi.spyOn(parentModule, 'emit')
        
        registry.set('testModule', module)
        
        expect(module.parent).toBe(parentModule)
        expect(parentModule.testModule).toBe(module)
        expect(emitSpy).toHaveBeenCalledWith('testRegistry:set', 'testModule', module)
    })


    test('getConfig', () => {
        const config = registry.getConfig()
        
        expect(config).toEqual({
            parentModule,
            parentModuleName: 'parent',
            registryName: 'testRegistry',
            bind: true,
            autoStart: true
        })
        
        config.bind = false

        const configAfter = registry.getConfig()
        expect(configAfter.bind).toBe(true)
    })


    test('registryName getter', () => {
        expect(registry.registryName).toBe('testRegistry')
        
        expect(() => {
            registry.registryName = 'modified'
        }).toThrow()

        expect(registry.registryName).toBe('testRegistry')

        expect(registry.registryName).toBe(registry.getConfig().registryName)
    })


    test('set', () => {
        const module = new PerkyModule()
        const registeredListener = vi.fn()
        
        module.on('registered', registeredListener)
        registry.set('testModule', module)
        
        expect(module.parent).toBe(parentModule)
        expect(parentModule.testModule).toBe(module)
        expect(registeredListener).toHaveBeenCalledWith(parentModule, 'testModule')
    })


    test('set with existing module name', () => {
        const module1 = new PerkyModule()
        const module2 = new PerkyModule()
        
        registry.set('testModule', module1)
        registry.set('testModule', module2)
        
        expect(registry.get('testModule')).toBe(module2)
        expect(parentModule.testModule).toBe(module2)
    })


    test('bind option false', () => {
        registry = new ModuleRegistry({
            registryName: 'testRegistry',
            parentModule,
            parentModuleName: 'parent',
            bind: false
        })
        
        const module = new PerkyModule()
        
        registry.set('testModule', module)
        
        expect(module.parent).toBe(parentModule)
        expect(parentModule.testModule).toBeUndefined()
    })


    test('set with autoStart true and parent started', () => {
        parentModule.started = true
        
        const module = new PerkyModule()

        module.started = false
        
        registry.set('testModule', module)

        expect(module.started).toBe(true)
    })


    test('delete event', () => {
        const module = new PerkyModule()
        const unregisteredListener = vi.fn()
        
        module.on('unregistered', unregisteredListener)
        
        registry.set('testModule', module)
        registry.delete('testModule')
        
        expect(unregisteredListener).toHaveBeenCalledWith(parentModule, 'testModule')
        expect(module.parent).toBeUndefined()
    })


    test('delete removes module from parent', () => {
        const module = new PerkyModule()
        
        registry.set('testModule', module)
        registry.delete('testModule')
        
        expect(parentModule.testModule).toBeUndefined()
    })


    test('clear event', () => {
        const clearListener = vi.fn()
        parentModule.on('testRegistry:clear', clearListener)

        registry.emit('clear')

        expect(clearListener).toHaveBeenCalled()
    })


    test('parent lifecycle events', () => {
        const module1 = new PerkyModule()
        const module2 = new PerkyModule()

        module1.started = false
        module2.started = false
        
        registry.set('module1', module1)
        registry.set('module2', module2)

        parentModule.emit('start')
        expect(module1.started).toBe(true)
        expect(module2.started).toBe(true)

        parentModule.emit('stop')
        expect(module1.started).toBe(false)
        expect(module2.started).toBe(false)
    })


    test('parent dispose triggers registry clear', () => {
        const module1 = new PerkyModule()
        const module2 = new PerkyModule()
        
        registry.set('module1', module1)
        registry.set('module2', module2)

        expect(registry.size).toBe(2)

        parentModule.emit('dispose')

        expect(registry.size).toBe(0)
    })


    test('event listeners on modules', () => {
        const module = new PerkyModule()
        const registeredListener = vi.fn()
        const unregisteredListener = vi.fn()
        
        module.on('registered', registeredListener)
        module.on('unregistered', unregisteredListener)
        
        registry.set('testModule', module)
        registry.delete('testModule')
        
        expect(registeredListener).toHaveBeenCalledWith(parentModule, 'testModule')
        expect(unregisteredListener).toHaveBeenCalledWith(parentModule, 'testModule')
    })

})
