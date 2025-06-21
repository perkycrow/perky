import Application from './application'
import Engine from '../core/engine'
import PerkyView from './perky_view'
import Registry from '../core/registry'
import Manifest from '../core/manifest'
import KeyboardDevice from '../input/input_devices/keyboard_device'
import MouseDevice from '../input/input_devices/mouse_device'
import ButtonControl from '../input/input_controls/button_control'
import PerkyModule from '../core/perky_module'
import InputManager from '../input/input_manager'
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


    test('constructor registers keyboard and mouse devices', () => {
        const testApp = new Application()
        
        expect(testApp.getDevice('keyboard')).toBeInstanceOf(KeyboardDevice)
        expect(testApp.getDevice('mouse')).toBeInstanceOf(MouseDevice)
    })

    
    test('mountTo', () => {
        const element = document.createElement('div')
        
        application.mountTo(element)
        
        expect(application.perkyView.mountTo).toHaveBeenCalledWith(element)
    })


    test('element getter', () => {
        expect(application.element).toBe(application.perkyView.element)
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


    test('setHtml', () => {
        const htmlSetter = vi.fn()
        Object.defineProperty(application.perkyView, 'html', {
            set: htmlSetter,
            configurable: true
        })
        
        application.setHtml('<div>test</div>')
        
        expect(htmlSetter).toHaveBeenCalledWith('<div>test</div>')
    })


    test('constructor with custom inputManager and inputBinder', () => {
        const customInputManager = new InputManager()
        const customBindings = [{deviceName: 'keyboard', controlName: 'Space', actionName: 'jump'}]
        
        const customApp = new Application({
            inputManager: customInputManager,
            inputBinder: customBindings
        })

        expect(customApp.inputManager).toBe(customInputManager)
        expect(customApp.getAllBindings()).toHaveLength(1)
        expect(customApp.getAllBindings()[0].actionName).toBe('jump')
    })


    test('input event handling integration', async () => {
        class TestController extends PerkyModule {
            jump = vi.fn()
        }
        
        const testApp = new Application()
        const controller = new TestController()
        
        testApp.registerController('game', controller)
        testApp.bind({
            deviceName: 'keyboard',
            controlName: 'Space',
            actionName: 'jump',
            controllerName: 'game'
        })

        const keyboardDevice = testApp.getDevice('keyboard')
        expect(keyboardDevice).toBeDefined()

        const spaceControl = keyboardDevice.getControl('Space') || keyboardDevice.findOrCreateControl(ButtonControl, {name: 'Space'})
        
        spaceControl.press({code: 'Space'})
        
        await new Promise(resolve => setTimeout(resolve, 0))
        
        expect(controller.jump).toHaveBeenCalled()
    })


    test('inputManager and inputBinder getters', () => {
        expect(application.inputManager).toBeDefined()
        expect(application.inputBinder).toBeDefined()
    })


    test('bind and unbind', () => {
        const binding = application.bind({
            deviceName: 'keyboard',
            controlName: 'Enter',
            actionName: 'select'
        })
        
        expect(binding).toBeDefined()
        expect(binding.actionName).toBe('select')
        expect(application.getAllBindings()).toHaveLength(1)
        
        const result = application.unbind({actionName: 'select'})
        expect(result).toBe(true)
        expect(application.getAllBindings()).toHaveLength(0)
    })


    test('getBinding and hasBinding', () => {
        application.bind({
            deviceName: 'keyboard',
            controlName: 'Tab',
            actionName: 'nextTab'
        })
        
        expect(application.hasBinding({actionName: 'nextTab'})).toBe(true)
        
        const binding = application.getBinding({actionName: 'nextTab'})
        expect(binding).toBeDefined()
        expect(binding.actionName).toBe('nextTab')
        
        expect(application.hasBinding({actionName: 'nonExistent'})).toBe(false)
        expect(application.getBinding({actionName: 'nonExistent'})).toBeNull()
    })


    test('getBindingsForInput', () => {
        application.bind({
            deviceName: 'keyboard',
            controlName: 'F1',
            actionName: 'help'
        })
        
        const bindings = application.getBindingsForInput({
            deviceName: 'keyboard',
            controlName: 'F1',
            eventType: 'pressed'
        })
        
        expect(bindings).toHaveLength(1)
        expect(bindings[0].actionName).toBe('help')
    })


    test('clearBindings', () => {
        application.bind({deviceName: 'keyboard', controlName: 'A', actionName: 'action1'})
        application.bind({deviceName: 'keyboard', controlName: 'B', actionName: 'action2'})
        
        expect(application.getAllBindings()).toHaveLength(2)
        
        application.clearBindings()
        
        expect(application.getAllBindings()).toHaveLength(0)
    })


    test('device management', () => {
        const keyboardDevice = application.getDevice('keyboard')
        const mouseDevice = application.getDevice('mouse')
        
        expect(keyboardDevice).toBeInstanceOf(KeyboardDevice)
        expect(mouseDevice).toBeInstanceOf(MouseDevice)
        expect(application.getDevice('nonExistent')).toBeUndefined()
    })


    test('input state queries', () => {
        expect(application.isPressed('keyboard', 'Space')).toBe(false)
        expect(application.isPressedAny('Jump')).toBe(false)
        expect(application.getInputValue('mouse', 'leftButton')).toBe(0)
        expect(application.getInputValueAny('Fire')).toBeUndefined()
        expect(application.getControl('keyboard', 'Space')).toBeUndefined()
        expect(application.getControlAny('Jump')).toBeNull()
    })


    test('bindKey convenience method', () => {
        const binding = application.bindKey('Escape', 'pause')
        
        expect(binding).toBeDefined()
        expect(binding.deviceName).toBe('keyboard')
        expect(binding.controlName).toBe('Escape')
        expect(binding.actionName).toBe('pause')
        expect(binding.eventType).toBe('pressed')
        
        const releasedBinding = application.bindKey('Escape', 'resume', 'released')
        expect(releasedBinding.eventType).toBe('released')
    })


    test('bindMouse convenience method', () => {
        const binding = application.bindMouse('leftButton', 'shoot')
        
        expect(binding).toBeDefined()
        expect(binding.deviceName).toBe('mouse')
        expect(binding.controlName).toBe('leftButton')
        expect(binding.actionName).toBe('shoot')
        expect(binding.eventType).toBe('pressed')
        
        const releasedBinding = application.bindMouse('rightButton', 'aim', 'released')
        expect(releasedBinding.eventType).toBe('released')
    })


    test('addControl', () => {
        const control = application.addControl('keyboard', ButtonControl, {name: 'CustomKey'})
        
        expect(control).toBeInstanceOf(ButtonControl)
        expect(control.name).toBe('CustomKey')
        
        const keyboardDevice = application.getDevice('keyboard')
        expect(keyboardDevice.getControl('CustomKey')).toBe(control)
    })

})
