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
        expect(engine.getExtension('ActionDispatcher')).toBeDefined()
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


    test('use registers extension', () => {
        class TestExtension extends PerkyModule {}
        
        engine.use(TestExtension, {
            $name: 'test',
            $category: 'module',
            $bind: 'test'
        })
        
        expect(engine.getExtension('test')).toBeInstanceOf(TestExtension)
        expect(engine.test).toBeInstanceOf(TestExtension)
    })


    test('use with non-extension object', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const nonExtension = {}
        
        engine.use(nonExtension.constructor, {
            instance: nonExtension,
            $name: 'test'
        })
        
        expect(consoleSpy).toHaveBeenCalled()
        expect(engine.getExtension('test')).toBeUndefined()
        
        consoleSpy.mockRestore()
    })


    test('getExtension', () => {
        class TestExtension extends PerkyModule {}
        engine.use(TestExtension, {
            $name: 'test',
            $category: 'module'
        })
        
        expect(engine.getExtension('test')).toBeInstanceOf(TestExtension)
    })


    test('getExtension non-existent', () => {
        expect(engine.getExtension('nonexistent')).toBeUndefined()
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
        engine.manifest.addSourceDescriptor('images', {id: 'logo', url: '/assets/logo.png'})
        
        const sourceDescriptor = engine.getSourceDescriptor('images', 'logo')
        expect(sourceDescriptor.id).toBe('logo')
        expect(sourceDescriptor.url).toBe('/assets/logo.png')
    })


    test('getSourceDescriptor non-existent type', () => {
        expect(engine.getSourceDescriptor('nonexistent', 'logo')).toBeNull()
    })


    test('getSourceDescriptor non-existent id', () => {
        engine.manifest.addSourceDescriptorType('images')
        
        expect(engine.getSourceDescriptor('images', 'nonexistent')).toBeNull()
    })


    test('getSourceDescriptors', () => {
        engine.manifest.addSourceDescriptor('images', {id: 'logo', url: '/assets/logo.png'})
        engine.manifest.addSourceDescriptor('images', {id: 'icon', url: '/assets/icon.png'})
        
        const sourceDescriptors = engine.getSourceDescriptors('images')
        expect(sourceDescriptors).toHaveLength(2)
        expect(sourceDescriptors[0].id).toBe('logo')
        expect(sourceDescriptors[1].id).toBe('icon')
    })


    test('getSourceDescriptors non-existent type', () => {
        expect(engine.getSourceDescriptors('nonexistent')).toEqual([])
    })


    test('getSource', () => {
        engine.manifest.addSourceDescriptor('images', {id: 'logo', url: '/assets/logo.png', source: 'fakeImage'})
        
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


    test('extension registration events', () => {
        class TestExtension extends PerkyModule {}
        const engineSpy = vi.spyOn(engine, 'emit')
        const extension = new TestExtension()
        const extensionSpy = vi.spyOn(extension, 'emit')
        
        engine.use(TestExtension, {
            instance: extension,
            $name: 'test',
            $category: 'module'
        })

        expect(engineSpy).toHaveBeenCalledWith('module:set', 'test', extension)
        expect(extensionSpy).toHaveBeenCalledWith('registered', engine, 'test')
        expect(extension.host).toBe(engine)
    })


    test('extension unregistration events', () => {
        class TestExtension extends PerkyModule {}
        const extension = new TestExtension()
        engine.use(TestExtension, {
            instance: extension,
            $name: 'test',
            $category: 'module'
        })
        
        const engineSpy = vi.spyOn(engine, 'emit')
        const extensionSpy = vi.spyOn(extension, 'emit')
        
        engine.removeExtension('test')
        
        expect(engineSpy).toHaveBeenCalledWith('module:delete', 'test', extension)
        expect(extensionSpy).toHaveBeenCalledWith('unregistered', engine, 'test')
    })


    test('extension lifecycle events propagation', () => {
        class TestExtension extends PerkyModule {}
        const extension = new TestExtension()
        const startSpy = vi.spyOn(extension, 'start')
        const stopSpy = vi.spyOn(extension, 'stop')
        
        engine.use(TestExtension, {
            instance: extension,
            $name: 'test',
            $category: 'module',
            $lifecycle: true
        })

        engine.start()
        expect(startSpy).toHaveBeenCalled()
        
        engine.stop()
        expect(stopSpy).toHaveBeenCalled()
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


    test('actionCaller', () => {
        const dispatchActionSpy = vi.spyOn(engine, 'dispatchAction')
        
        const actionFunction = engine.actionCaller('testAction', 'param1', 'param2')
        expect(typeof actionFunction).toBe('function')
        
        actionFunction()
        
        expect(dispatchActionSpy).toHaveBeenCalledWith('testAction', 'param1', 'param2')
    })


    test('eventToAction', () => {
        const dispatchActionSpy = vi.spyOn(engine, 'dispatchAction')
        
        engine.eventToAction('testEvent', 'testAction', 'param1', 'param2')
        engine.emit('testEvent')
        
        expect(dispatchActionSpy).toHaveBeenCalledWith('testAction', 'param1', 'param2')
    })


    test('onceToAction', () => {
        const dispatchActionSpy = vi.spyOn(engine, 'dispatchAction')
        
        engine.onceToAction('testEvent', 'testAction', 'param1', 'param2')
        
        engine.emit('testEvent')
        expect(dispatchActionSpy).toHaveBeenCalledWith('testAction', 'param1', 'param2')
        
        dispatchActionSpy.mockClear()
        
        engine.emit('testEvent')
        expect(dispatchActionSpy).not.toHaveBeenCalled()
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

        expect(controller.host).toBe(engine.actionDispatcher)
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

    
    test('use after start calls start on the extension', () => {
        engine.start()
        
        class TestExtension extends PerkyModule {}
        const extension = new TestExtension()
        const startSpy = vi.spyOn(extension, 'start')
        
        engine.use(TestExtension, {
            instance: extension,
            $name: 'newExtension',
            $category: 'module',
            $lifecycle: true
        })
        
        expect(startSpy).toHaveBeenCalled()
    })

})
