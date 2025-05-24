import Engine from './engine'
import Manifest from './manifest'
import PerkyModule from './perky_module'
import {vi} from 'vitest'
import ActionController from './action_controller'
import ActionDispatcher from './action_dispatcher'


describe(Engine, () => {

    let engine

    beforeEach(() => {
        engine = new Engine()
    })


    test('constructor', () => {
        expect(engine.manifest).toBeInstanceOf(Manifest)
        expect(engine.getModule('actionDispatcher')).toBeDefined()
    })


    test('constructor with manifest object', () => {
        const manifest = {
            metadata: {name: 'Test Engine'}
        }
        const customEngine = new Engine({manifest})

        expect(customEngine.manifest).toBeInstanceOf(Manifest)
        expect(customEngine.manifest.metadata('name')).toBe('Test Engine')
    })


    test('constructor with manifest instance', () => {
        const manifest = new Manifest({
            metadata: {name: 'Test Engine'}
        })
        const customEngine = new Engine({manifest})

        expect(customEngine.manifest).toBe(manifest)
    })


    test('registerModule', () => {
        const module = new PerkyModule()
        
        engine.registerModule('test', module)
        
        expect(engine.getModule('test')).toBe(module)
    })


    test('registerModule non-module object', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const nonModule = {}
        
        engine.registerModule('test', nonModule)
        
        expect(consoleSpy).toHaveBeenCalled()
        expect(engine.getModule('test')).toBeUndefined()
        
        consoleSpy.mockRestore()
    })


    test('getModule', () => {
        const module = new PerkyModule()
        engine.registerModule('test', module)
        
        expect(engine.getModule('test')).toBe(module)
    })


    test('getModule non-existent', () => {
        expect(engine.getModule('nonexistent')).toBeUndefined()
    })


    test('getMetadata and setMetadata', () => {
        const spy = vi.spyOn(engine.manifest, 'metadata')
        
        engine.setMetadata('version', '1.0.0')
        engine.getMetadata('version')
        
        expect(spy).toHaveBeenCalledWith('version', '1.0.0')
        expect(spy).toHaveBeenCalledWith('version')
    })


    test('getConfig and setConfig', () => {
        const spy = vi.spyOn(engine.manifest, 'config')
        
        engine.setConfig('logging.level', 'debug')
        engine.getConfig('logging.level')
        
        expect(spy).toHaveBeenCalledWith('logging.level', 'debug')
        expect(spy).toHaveBeenCalledWith('logging.level')
    })


    test('addSourceDescriptor', () => {
        const spy = vi.spyOn(engine.manifest, 'addSourceDescriptor')
        const sourceDescriptor = {id: 'logo', url: '/assets/logo.png'}

        engine.addSourceDescriptor('images', sourceDescriptor)
        
        expect(spy).toHaveBeenCalledWith('images', sourceDescriptor)
    })


    test('getSourceDescriptor', () => {
        engine.manifest.data.sourceDescriptors = {
            images: {
                logo: {id: 'logo', url: '/assets/logo.png'}
            }
        }
        
        const sourceDescriptor = engine.getSourceDescriptor('images', 'logo')
        expect(sourceDescriptor).toEqual({id: 'logo', url: '/assets/logo.png'})
    })


    test('getSourceDescriptor non-existent type', () => {
        expect(engine.getSourceDescriptor('nonexistent', 'logo')).toBeNull()
    })


    test('getSourceDescriptor non-existent id', () => {
        engine.manifest.data.sourceDescriptors = {
            images: {}
        }
        
        expect(engine.getSourceDescriptor('images', 'nonexistent')).toBeNull()
    })


    test('getSourceDescriptors', () => {
        engine.manifest.data.sourceDescriptors = {
            images: {
                logo: {id: 'logo', url: '/assets/logo.png'},
                icon: {id: 'icon', url: '/assets/icon.png'}
            }
        }
        
        const sourceDescriptors = engine.getSourceDescriptors('images')
        expect(sourceDescriptors).toHaveLength(2)
        expect(sourceDescriptors).toContainEqual({id: 'logo', url: '/assets/logo.png'})
        expect(sourceDescriptors).toContainEqual({id: 'icon', url: '/assets/icon.png'})
    })


    test('getSourceDescriptors non-existent type', () => {
        expect(engine.getSourceDescriptors('nonexistent')).toEqual([])
    })


    test('getSource', () => {
        engine.manifest.data.sourceDescriptors = {
            images: {
                logo: {id: 'logo', url: '/assets/logo.png', source: 'fakeImage'}
            }
        }
        
        const source = engine.getSource('images', 'logo')
        expect(source).toBe('fakeImage')
    })


    test('addAlias and getAlias', () => {
        const spy = vi.spyOn(engine.manifest, 'alias')
        
        engine.addAlias('mainLogo', 'logo')
        engine.getAlias('mainLogo')
        
        expect(spy).toHaveBeenCalledWith('mainLogo', 'logo')
        expect(spy).toHaveBeenCalledWith('mainLogo')
    })


    test('exportManifest', () => {
        const spy = vi.spyOn(engine.manifest, 'export')
        
        engine.exportManifest(true)
        
        expect(spy).toHaveBeenCalledWith(true)
    })


    test('importManifest', () => {
        const spy = vi.spyOn(engine.manifest, 'import')
        const data = {metadata: {name: 'Test'}}
        
        engine.importManifest(data)
        
        expect(spy).toHaveBeenCalledWith(data)
    })


    test('module registration events', () => {
        const engineSpy = vi.spyOn(engine, 'emit')
        const module = new PerkyModule()
        const moduleSpy = vi.spyOn(module, 'emit')
        
        engine.registerModule('test', module)
        
        expect(engineSpy).toHaveBeenCalledWith('module:set', 'test', module)
        expect(moduleSpy).toHaveBeenCalledWith('registered', engine, 'test')
        expect(module.engine).toBe(engine)
    })


    test('module unregistration events', () => {
        const module = new PerkyModule()
        engine.registerModule('test', module)
        
        const engineSpy = vi.spyOn(engine, 'emit')
        const moduleSpy = vi.spyOn(module, 'emit')
        
        engine.removeModule('test')
        
        expect(engineSpy).toHaveBeenCalledWith('module:delete', 'test', module)
        expect(moduleSpy).toHaveBeenCalledWith('unregistered', engine, 'test')
        expect(module.engine).toBeUndefined()
    })


    test('module lifecycle events propagation', () => {
        const module = new PerkyModule()

        const initSpy = vi.spyOn(module, 'init')
        const startSpy = vi.spyOn(module, 'start')
        const stopSpy = vi.spyOn(module, 'stop')
        
        engine.registerModule('test', module)

        engine.emit('init')
        expect(initSpy).toHaveBeenCalled()

        module.initialized = true
        module.started = true
        
        engine.emit('stop')
        expect(stopSpy).toHaveBeenCalled()

        module.initialized = true
        module.started = false
        
        engine.emit('start')
        expect(startSpy).toHaveBeenCalled()
    })


    test('module clear event', () => {
        const emitSpy = vi.spyOn(engine, 'emit')
        
        engine.registerModule('test1', new PerkyModule())
        engine.registerModule('test2', new PerkyModule())
        
        engine.removeModule('test1')
        engine.removeModule('test2')

        expect(emitSpy).toHaveBeenCalledWith('module:delete', 'test1', expect.any(PerkyModule))
        expect(emitSpy).toHaveBeenCalledWith('module:delete', 'test2', expect.any(PerkyModule))
    })


    test('double registration warning', () => {
        const engine2 = new Engine()
        const module = new PerkyModule()
        
        engine.registerModule('test', module)
        engine2.registerModule('test', module)
    })


    test('unregistration from wrong engine warning', () => {
        const engine2 = new Engine()
        const module = new PerkyModule()
        
        engine.registerModule('test', module)

        module.engine = engine2
        engine.removeModule('test')
    })


    test('registerController', () => {
        const spy = vi.spyOn(engine.actionDispatcher, 'register')
        const controller = new ActionController()
        
        engine.registerController('test', controller)
        
        expect(spy).toHaveBeenCalledWith('test', controller)
        expect(engine.getController('test')).toBe(controller)
    })


    test('getController', () => {
        const controller = new ActionController()
        engine.registerController('test', controller)
        
        expect(engine.getController('test')).toBe(controller)
    })


    test('getController non-existent', () => {
        expect(engine.getController('nonexistent')).toBeNull()
    })


    test('unregisterController', () => {
        const controller = new ActionController()
        engine.registerController('test', controller)
        
        engine.unregisterController('test')
        
        expect(engine.getController('test')).toBeNull()
    })


    test('setActiveController', () => {
        const spy = vi.spyOn(engine.actionDispatcher, 'setActive')
        const controller = new ActionController()
        
        engine.registerController('test', controller)
        engine.setActiveController('test')
        
        expect(spy).toHaveBeenCalledWith('test')
    })


    test('getActiveController', () => {
        const controller = new ActionController()
        engine.registerController('test', controller)
        
        engine.setActiveController('test')

        expect(engine.getActiveController()).toBe(controller)
    })


    test('dispatchAction', () => {
        const actionDispatcherSpy = vi.spyOn(engine.actionDispatcher, 'dispatch')
        const controller = new ActionController()
        
        engine.registerController('test', controller)
        
        engine.dispatchAction('testAction', 'param1', 'param2')
        
        expect(actionDispatcherSpy).toHaveBeenCalledWith('testAction', 'param1', 'param2')
    })


    test('controller lifecycle events propagation', () => {
        const controller = new ActionController()

        const startSpy = vi.spyOn(controller, 'start')
        const stopSpy = vi.spyOn(controller, 'stop')
        
        engine.registerController('test', controller)

        engine.start()

        engine.stop()
        expect(stopSpy).toHaveBeenCalled()

        engine.start()
        expect(startSpy).toHaveBeenCalled()
    })


    test('controller registration events', () => {
        const actionDispatcherSpy = vi.spyOn(engine.actionDispatcher, 'emit')
        const controller = new ActionController()
        const controllerSpy = vi.spyOn(controller, 'emit')

        engine.registerController('test', controller)

        expect(actionDispatcherSpy).toHaveBeenCalledWith('controller:set', 'test', controller)
        expect(controllerSpy).toHaveBeenCalledWith('registered', engine.actionDispatcher, 'test')

        expect(controller.engine).toBe(engine)
    })


    test('controller unregistration events', () => {
        const controller = new ActionController()
        engine.registerController('test', controller)
        
        const actionDispatcherSpy = vi.spyOn(engine.actionDispatcher, 'emit')
        const controllerSpy = vi.spyOn(controller, 'emit')

        engine.unregisterController('test')
        
        expect(actionDispatcherSpy).toHaveBeenCalledWith('controller:delete', 'test', controller)
        expect(controllerSpy).toHaveBeenCalledWith('unregistered', engine.actionDispatcher, 'test')
    })


    test('controller clear event', () => {
        const actionDispatcherSpy = vi.spyOn(engine.actionDispatcher, 'emit')
        
        engine.registerController('test1', new ActionController())
        engine.registerController('test2', new ActionController())
        
        engine.unregisterController('test1')
        engine.unregisterController('test2')

        expect(actionDispatcherSpy).toHaveBeenCalledWith('controller:delete', 'test1', expect.any(ActionController))
        expect(actionDispatcherSpy).toHaveBeenCalledWith('controller:delete', 'test2', expect.any(ActionController))
    })


    test('action dispatcher initialization', () => {
        expect(engine.actionDispatcher).toBeInstanceOf(ActionDispatcher)
        expect(engine.getController('application')).toBeInstanceOf(ActionController)
        expect(engine.actionDispatcher.getActiveName()).toBe('application')
    })

    test('registerModule after initialization calls init on the module', () => {
        engine.initialized = true
        
        const module = new PerkyModule()
        const initSpy = vi.spyOn(module, 'init')
        
        engine.registerModule('newModule', module)
        
        expect(initSpy).toHaveBeenCalled()
    })
    
    test('registerModule after start calls both init and start on the module', () => {
        engine.initialized = true
        engine.started = true
        
        const module = new PerkyModule()
        const initSpy = vi.spyOn(module, 'init')
        const startSpy = vi.spyOn(module, 'start')
        
        engine.registerModule('newModule', module)
        
        expect(initSpy).toHaveBeenCalled()
        expect(startSpy).toHaveBeenCalled()
    })

})
