import Engine from '../src/engine'
import Manifest from '../src/manifest'
import ActiveModule from '../src/active_module'
import {vi} from 'vitest'
import ActiveRegistry from '../src/active_registry'


describe(Engine, () => {

    let engine

    beforeEach(() => {
        engine = new Engine()
    })


    test('constructor', () => {
        expect(engine.manifest).toBeInstanceOf(Manifest)
        expect(engine.modules).toBeDefined()
    })


    test('constructor with manifest object', () => {
        const customEngine = new Engine({
            metadata: {name: 'Test Engine'}
        })

        expect(customEngine.manifest).toBeInstanceOf(Manifest)
        expect(customEngine.manifest.metadata('name')).toBe('Test Engine')
    })


    test('constructor with manifest instance', () => {
        const manifest = new Manifest({
            metadata: {name: 'Test Engine'}
        })
        const customEngine = new Engine(manifest)

        expect(customEngine.manifest).toBe(manifest)
    })


    test('registerModule', () => {
        const spy = vi.spyOn(engine.modules, 'set')
        const module = new ActiveModule()
        
        engine.registerModule('test', module)
        
        expect(spy).toHaveBeenCalledWith('test', module)
        expect(engine.getModule('test')).toBe(module)
    })


    test('registerModule non-module object', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const nonModule = {}
        
        engine.registerModule('test', nonModule)
        
        expect(consoleSpy).toHaveBeenCalled()
        expect(engine.getModule('test')).toBeNull()
        
        consoleSpy.mockRestore()
    })


    test('getModule', () => {
        const module = new ActiveModule()
        engine.modules.set('test', module)
        
        expect(engine.getModule('test')).toBe(module)
    })


    test('getModule non-existent', () => {
        expect(engine.getModule('nonexistent')).toBeNull()
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


    test('addSource', () => {
        const spy = vi.spyOn(engine.manifest, 'addSource')
        const source = {id: 'logo', path: '/assets/logo.png'}
        
        engine.addSource('images', source)
        
        expect(spy).toHaveBeenCalledWith('images', source)
    })


    test('getSource', () => {
        engine.manifest.data.sources = {
            images: {
                logo: {id: 'logo', path: '/assets/logo.png'}
            }
        }
        
        const source = engine.getSource('images', 'logo')
        expect(source).toEqual({id: 'logo', path: '/assets/logo.png'})
    })


    test('getSource non-existent type', () => {
        expect(engine.getSource('nonexistent', 'logo')).toBeNull()
    })


    test('getSource non-existent id', () => {
        engine.manifest.data.sources = {
            images: {}
        }
        
        expect(engine.getSource('images', 'nonexistent')).toBeNull()
    })


    test('getSources', () => {
        engine.manifest.data.sources = {
            images: {
                logo: {id: 'logo', path: '/assets/logo.png'},
                icon: {id: 'icon', path: '/assets/icon.png'}
            }
        }
        
        const sources = engine.getSources('images')
        expect(sources).toHaveLength(2)
        expect(sources).toContainEqual({id: 'logo', path: '/assets/logo.png'})
        expect(sources).toContainEqual({id: 'icon', path: '/assets/icon.png'})
    })


    test('getSources non-existent type', () => {
        expect(engine.getSources('nonexistent')).toEqual([])
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
        const module = new ActiveModule()
        const moduleSpy = vi.spyOn(module, 'emit')
        
        engine.registerModule('test', module)
        
        expect(engineSpy).toHaveBeenCalledWith('module:set', 'test', module)
        expect(moduleSpy).toHaveBeenCalledWith('registered', engine, 'test')
        expect(module.engine).toBe(engine)
    })


    test('module unregistration events', () => {
        const module = new ActiveModule()
        engine.registerModule('test', module)
        
        const engineSpy = vi.spyOn(engine, 'emit')
        const moduleSpy = vi.spyOn(module, 'emit')
        
        engine.modules.delete('test')
        
        expect(engineSpy).toHaveBeenCalledWith('module:delete', 'test', module)
        expect(moduleSpy).toHaveBeenCalledWith('unregistered', engine, 'test')
        expect(module.engine).toBeUndefined()
    })


    test('module lifecycle events propagation', () => {
        const module = new ActiveModule()

        const initSpy = vi.spyOn(module, 'init')
        const startSpy = vi.spyOn(module, 'start')
        const updateSpy = vi.spyOn(module, 'update')
        const pauseSpy = vi.spyOn(module, 'pause')
        const resumeSpy = vi.spyOn(module, 'resume')
        const stopSpy = vi.spyOn(module, 'stop')
        
        engine.registerModule('test', module)

        engine.emit('init', 'param')
        expect(initSpy).toHaveBeenCalledWith('param')

        module.initialized = true
        module.started = true
        
        engine.emit('update', 'param')
        expect(updateSpy).toHaveBeenCalledWith('param')

        engine.emit('pause', 'param')
        expect(pauseSpy).toHaveBeenCalledWith('param')
        
        module.paused = true
        
        engine.emit('resume', 'param')
        expect(resumeSpy).toHaveBeenCalledWith('param')
        
        engine.emit('stop', 'param')
        expect(stopSpy).toHaveBeenCalledWith('param')

        module.initialized = true
        module.started = false
        
        engine.emit('start', 'param')
        expect(startSpy).toHaveBeenCalledWith('param')
    })


    test('module clear event', () => {
        const registrySpy = vi.spyOn(ActiveRegistry.prototype, 'on')

        const testEngine = new Engine()

        expect(registrySpy).toHaveBeenCalledWith('clear', expect.any(Function))

        const clearCallback = registrySpy.mock.calls.find(call => call[0] === 'clear')[1]

        const emitSpy = vi.spyOn(testEngine, 'emit')

        clearCallback()

        expect(emitSpy).toHaveBeenCalledWith('module:clear')

        registrySpy.mockRestore()
    })


    test('double registration warning', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const engine2 = new Engine()
        const module = new ActiveModule()
        
        engine.registerModule('test', module)
        engine2.registerModule('test', module)
        
        expect(consoleSpy).toHaveBeenCalled()
        
        consoleSpy.mockRestore()
    })


    test('unregistration from wrong engine warning', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const engine2 = new Engine()
        const module = new ActiveModule()
        
        engine.registerModule('test', module)

        module.engine = engine2
        engine.modules.delete('test')
        
        expect(consoleSpy).toHaveBeenCalled()
        
        consoleSpy.mockRestore()
    })

})
