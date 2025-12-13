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
        expect(engine.getChild('ActionDispatcher')).toBeDefined()
    })


    test('constructor with manifest object', () => {
        const manifest = {
            metadata: {name: 'Test Engine'}
        }
        const customEngine = new Engine({manifest})

        expect(customEngine.manifest).toBeInstanceOf(Manifest)
        expect(customEngine.manifest.getMetadata('name')).toBe('Test Engine')
    })


    test('constructor with manifest instance', () => {
        const manifest = new Manifest({
            data: {
                metadata: {name: 'Test Engine'}
            }
        })
        const customEngine = new Engine({manifest})

        // When passing a Manifest instance, Engine creates a new instance from the exported data
        expect(customEngine.manifest).toBeInstanceOf(Manifest)
        expect(customEngine.manifest.getMetadata('name')).toBe('Test Engine')
    })


    test('constructor with static manifest', () => {
        class CustomEngine extends Engine {
            static manifest = {
                metadata: {name: 'Static Manifest Engine'}
            }
        }

        const customEngine = new CustomEngine()

        expect(customEngine.manifest).toBeInstanceOf(Manifest)
        expect(customEngine.manifest.getMetadata('name')).toBe('Static Manifest Engine')
    })




    test('use registers child', () => {
        class TestChild extends PerkyModule { }

        engine.create(TestChild, {
            $name: 'test',
            $category: 'module',
            $bind: 'test'
        })

        expect(engine.getChild('test')).toBeInstanceOf(TestChild)
        expect(engine.test).toBeInstanceOf(TestChild)
    })


    test('getChild', () => {
        class TestChild extends PerkyModule { }
        engine.create(TestChild, {
            $name: 'test',
            $category: 'module'
        })

        expect(engine.getChild('test')).toBeInstanceOf(TestChild)
    })


    test('getChild non-existent', () => {
        expect(engine.getChild('nonexistent')).toBeNull()
    })


    test('getMetadata and setMetadata', () => {
        engine.setMetadata('version', '1.0.0')

        expect(engine.getMetadata('version')).toBe('1.0.0')
        expect(engine.manifest.getMetadata('version')).toBe('1.0.0')
    })


    test('getConfig and setConfig', () => {
        engine.setConfig('logging.level', 'debug')

        expect(engine.getConfig('logging.level')).toBe('debug')
        expect(engine.manifest.getConfig('logging.level')).toBe('debug')
    })


    test('addSourceDescriptor', () => {
        const sourceDescriptor = {id: 'logo', url: '/assets/logo.png'}

        engine.addSourceDescriptor('images', sourceDescriptor)

        expect(engine.getSourceDescriptor('images', 'logo')).toBeDefined()
        expect(engine.getSourceDescriptor('images', 'logo').url).toBe('/assets/logo.png')
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


    test('setAlias and getAlias', () => {
        engine.setAlias('mainLogo', 'logo')

        expect(engine.getAlias('mainLogo')).toBe('logo')
        expect(engine.manifest.getAlias('mainLogo')).toBe('logo')
    })


    test('exportManifest', () => {
        engine.setMetadata('version', '1.0.0')

        const exported = engine.exportManifest()

        expect(exported.metadata.version).toBe('1.0.0')

    })


    test('child registration events', () => {
        class TestChild extends PerkyModule { }
        const engineSpy = vi.spyOn(engine, 'emit')

        const child = engine.create(TestChild, {
            $name: 'test',
            $category: 'module'
        })

        expect(engineSpy).toHaveBeenCalledWith('module:set', 'test', child)
        expect(child.host).toBe(engine)
    })


    test('child unregistration events', () => {
        class TestChild extends PerkyModule { }
        const child = engine.create(TestChild, {
            $name: 'test',
            $category: 'module'
        })

        const engineSpy = vi.spyOn(engine, 'emit')
        const childSpy = vi.spyOn(child, 'emit')

        engine.removeChild('test')

        expect(engineSpy).toHaveBeenCalledWith('module:delete', 'test', child)
        expect(childSpy).toHaveBeenCalledWith('unregistered', engine, 'test')
    })


    test('child lifecycle events propagation', () => {
        class TestChild extends PerkyModule { }

        const child = engine.create(TestChild, {
            $name: 'test',
            $category: 'module',
            $lifecycle: true
        })

        const startSpy = vi.spyOn(child, 'start')
        const stopSpy = vi.spyOn(child, 'stop')


        engine.lifecycle.start()
        expect(startSpy).toHaveBeenCalled()

        engine.lifecycle.stop()
        expect(stopSpy).toHaveBeenCalled()
    })


    test('registerController', () => {
        const controller = new ActionController()

        engine.registerController('test', controller)

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


    test('getActiveControllers', () => {
        const controller = new ActionController()
        engine.registerController('test', controller)

        engine.setActiveControllers('test')

        const active = engine.getActiveControllers()
        expect(active).toEqual(['test'])
    })


    test('execute', () => {
        const controllerSpy = vi.fn()
        engine.mainController.testAction = controllerSpy

        engine.execute('testAction', 'param1', 'param2')

        expect(controllerSpy).toHaveBeenCalledWith('param1', 'param2')
    })


    test('controller lifecycle events propagation', () => {
        const controller = new ActionController()

        const startSpy = vi.spyOn(controller, 'start')
        const stopSpy = vi.spyOn(controller, 'stop')

        engine.registerController('test', controller)

        engine.lifecycle.start()

        engine.lifecycle.stop()
        expect(stopSpy).toHaveBeenCalled()

        engine.lifecycle.start()
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
        expect(engine.getController('main')).toBeInstanceOf(ActionController)
        expect(engine.actionDispatcher.getActive()).toEqual(['main'])
    })


    test('use after start calls start on the child', () => {
        engine.lifecycle.start()

        class TestChild extends PerkyModule { }

        const createdChild = engine.create(TestChild, {
            $name: 'newChild',
            $category: 'module',
            $lifecycle: true
        })

        expect(createdChild.lifecycle.started).toBe(true)
    })

})
