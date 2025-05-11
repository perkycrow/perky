import Application from './application'
import Engine from '../core/engine'
import PerkyView from './perky_view'
import InputObserver from './input_observer'
import InputMapper from './input_mapper'
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
        expect(application.inputObserver).toBeInstanceOf(InputObserver)
        expect(application.inputMapper).toBeInstanceOf(InputMapper)
        expect(application.sourceManager).toBeDefined()
    })


    test('constructor with custom manifest', () => {
        const customManifestData = {
            metadata: {name: 'Test App'}
        }
        
        const customApp = new Application(customManifestData)
        
        expect(customApp.manifest).toBeDefined()
        expect(customApp.manifest.data.metadata.name).toBe('Test App')
    })


    test('isInputPressed', () => {
        vi.spyOn(application.inputObserver, 'isPressed').mockReturnValue(true)
        
        const result = application.isInputPressed('KeyA')
        
        expect(application.inputObserver.isPressed).toHaveBeenCalledWith('KeyA')
        expect(result).toBe(true)
    })


    test('areInputsPressed', () => {
        vi.spyOn(application.inputObserver, 'arePressed').mockReturnValue(true)
        const inputs = ['KeyA', 'KeyB']
        
        const result = application.areInputsPressed(inputs)
        
        expect(application.inputObserver.arePressed).toHaveBeenCalledWith(inputs)
        expect(result).toBe(true)
    })


    test('isActionPressed', () => {
        vi.spyOn(application.inputMapper, 'isActionPressed').mockReturnValue(true)
        
        const result = application.isActionPressed('jump')
        
        expect(application.inputMapper.isActionPressed).toHaveBeenCalledWith('jump')
        expect(result).toBe(true)
    })


    test('setInputFor', () => {
        vi.spyOn(application.inputMapper, 'setInputFor').mockReturnValue(null)
        
        application.setInputFor('jump', 'Space', 0)
        
        expect(application.inputMapper.setInputFor).toHaveBeenCalledWith('jump', 'Space', 0)
    })


    test('setInputsFor', () => {
        vi.spyOn(application.inputMapper, 'setInputsFor').mockReturnValue(null)
        const inputs = ['Space', 'ArrowUp']
        
        application.setInputsFor('jump', inputs)
        
        expect(application.inputMapper.setInputsFor).toHaveBeenCalledWith('jump', inputs)
    })


    test('getInputFor', () => {
        vi.spyOn(application.inputMapper, 'getInputFor').mockReturnValue('Space')
        
        const result = application.getInputFor('jump', 0)
        
        expect(application.inputMapper.getInputFor).toHaveBeenCalledWith('jump', 0)
        expect(result).toBe('Space')
    })


    test('getInputsFor', () => {
        const inputs = ['Space', 'ArrowUp']
        vi.spyOn(application.inputMapper, 'getInputsFor').mockReturnValue(inputs)
        
        const result = application.getInputsFor('jump')
        
        expect(application.inputMapper.getInputsFor).toHaveBeenCalledWith('jump')
        expect(result).toBe(inputs)
    })


    test('mousePosition', () => {
        const position = {x: 100, y: 200}
        vi.spyOn(application.inputObserver, 'getMousePosition').mockReturnValue(position)
        
        const result = application.mousePosition
        
        expect(application.inputObserver.getMousePosition).toHaveBeenCalled()
        expect(result).toBe(position)
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
