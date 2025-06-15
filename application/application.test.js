import Application from './application'
import Engine from '../core/engine'
import PerkyView from './perky_view'
import Registry from '../core/registry'
import Manifest from '../core/manifest'
import {vi} from 'vitest'


describe(Application, () => {
    let application
    let mockManifest


    beforeEach(() => {
        global.ResizeObserver = vi.fn().mockImplementation(() => ({
            observe: vi.fn(),
            unobserve: vi.fn(),
            disconnect: vi.fn()
        }))

        mockManifest = {
            getSourceDescriptor: vi.fn(),
            config: vi.fn()
        }
        
        vi.spyOn(Manifest.prototype, 'getSourceDescriptor').mockImplementation((...args) => {
            return mockManifest.getSourceDescriptor(...args)
        })
        
        vi.spyOn(Manifest.prototype, 'config').mockImplementation((...args) => {
            return mockManifest.config(...args)
        })

        vi.spyOn(PerkyView.prototype, 'mountTo').mockReturnValue(null)
        vi.spyOn(Engine.prototype, 'registerModule').mockImplementation(function (name, module) {
            this[name] = module
        })

        application = new Application()
    })


    afterEach(() => {
        vi.restoreAllMocks()
    })


    test('constructor', () => {
        expect(application).toBeInstanceOf(Engine)
        expect(application.loaders).toBeInstanceOf(Registry)
        expect(application.perkyView).toBeInstanceOf(PerkyView)
        expect(application.sourceManager).toBeDefined()
    })


    test('constructor with custom manifest', () => {
        const customManifestData = {
            metadata: {name: 'Test App'}
        }
        
        const customApp = new Application({manifest: customManifestData})

        expect(customApp.manifest).toBeDefined()
        expect(customApp.manifest.metadata('name')).toBe('Test App')
    })

    
    test('mountTo', () => {
        const element = document.createElement('div')
        
        application.mountTo(element)
        
        expect(application.perkyView.mountTo).toHaveBeenCalledWith(element)
    })


    test('loadSource', async () => {
        vi.spyOn(application.sourceManager, 'loadSource').mockResolvedValue('loaded')
        
        const promise = application.loadSource('images', 'logo')
        
        expect(application.sourceManager.loadSource).toHaveBeenCalledWith('images', 'logo')
        await expect(promise).resolves.toBe('loaded')
    })


    test('loadTag', async () => {
        vi.spyOn(application.sourceManager, 'loadTag').mockResolvedValue('loaded')
        
        const promise = application.loadTag('mainScene')
        
        expect(application.sourceManager.loadTag).toHaveBeenCalledWith('mainScene')
        await expect(promise).resolves.toBe('loaded')
    })


    test('loadAll', async () => {
        vi.spyOn(application.sourceManager, 'loadAll').mockResolvedValue('loaded')
        
        const promise = application.loadAll()
        
        expect(application.sourceManager.loadAll).toHaveBeenCalled()
        await expect(promise).resolves.toBe('loaded')
    })


    test('getSource', () => {
        application.getSource('images', 'logo')
        
        expect(mockManifest.getSourceDescriptor).toHaveBeenCalledWith('images', 'logo')
    })


    test('config', () => {
        application.config('debug', true)

        expect(mockManifest.config).toHaveBeenCalledWith('debug', true)
    })

})
