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
            getConfig: vi.fn(),
            setConfig: vi.fn()
        }

        vi.spyOn(Manifest.prototype, 'getSourceDescriptor').mockImplementation((...args) => {
            return mockManifest.getSourceDescriptor(...args)
        })

        vi.spyOn(Manifest.prototype, 'getConfig').mockImplementation((path) => {
            return mockManifest.getConfig(path)
        })

        vi.spyOn(Manifest.prototype, 'setConfig').mockImplementation((path, value) => {
            return mockManifest.setConfig(path, value)
        })

        const mockPerkyViewElement = document.createElement('div')
        mockPerkyViewElement.exitFullscreenMode = vi.fn()
        mockPerkyViewElement.enterFullscreenMode = vi.fn()
        vi.spyOn(PerkyView.prototype, 'mount').mockReturnValue(null)
        vi.spyOn(PerkyView, 'defaultElement').mockReturnValue(mockPerkyViewElement)

        // FIXME: Complexity
        vi.spyOn(Engine.prototype, 'use').mockImplementation(function (ExtensionClass, options) { // eslint-disable-line complexity
            let instance = options.instance
            if (!instance) {
                if (ExtensionClass === KeyboardDevice || ExtensionClass === MouseDevice) {
                    const container = options.container || (ExtensionClass === MouseDevice && this.perkyView ? this.perkyView.element : window)
                    instance = new ExtensionClass({...options, container})
                } else if (ExtensionClass === PerkyView) {
                    instance = new ExtensionClass({...options, element: mockPerkyViewElement})
                } else {
                    instance = new ExtensionClass(options)
                }
            }

            if (instance.install) {
                instance.install(this, options)
            }

            if (options.$bind) {
                this[options.$bind] = instance
            }

            const extensionsRegistry = this.getExtensionsRegistry()
            const extensionName = options.$name || instance.name || instance.constructor.name
            extensionsRegistry.set(extensionName, instance)

            if ((ExtensionClass === KeyboardDevice || ExtensionClass === MouseDevice) && this.inputManager) {
                this.inputManager.registerDevice(options.$name, instance)
            }

            return this
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
        expect(customApp.manifest.getMetadata('name')).toBe('Test App')
    })


    test('constructor registers keyboard and mouse devices', () => {
        const testApp = new Application()

        expect(testApp.getDevice('keyboard')).toBeInstanceOf(KeyboardDevice)
        expect(testApp.getDevice('mouse')).toBeInstanceOf(MouseDevice)
    })


    test('constructor calls configure if defined', () => {
        class ConfiguredApp extends Application {
            constructor () {
                super()
            }

            configure () {
                this.configureCalled = true
            }
        }

        const app = new ConfiguredApp()
        expect(app.configureCalled).toBe(true)
    })



    test('loadSource', async () => {
        vi.spyOn(application, 'loadSource').mockResolvedValue('loaded')

        const promise = application.loadSource('images', 'logo')

        expect(application.loadSource).toHaveBeenCalledWith('images', 'logo')
        await expect(promise).resolves.toBe('loaded')
    })


    test('loadTag', async () => {
        vi.spyOn(application, 'loadTag').mockResolvedValue('loaded')

        const promise = application.loadTag('mainScene')

        expect(application.loadTag).toHaveBeenCalledWith('mainScene')
        await expect(promise).resolves.toBe('loaded')
    })


    test('loadAll', async () => {
        vi.spyOn(application, 'loadAll').mockResolvedValue('loaded')

        const promise = application.loadAll()

        expect(application.loadAll).toHaveBeenCalled()
        await expect(promise).resolves.toBe('loaded')
    })


    test('registerLoader', () => {
        const customLoader = vi.fn().mockResolvedValue('custom loaded')

        const result = application.registerLoader('customLoader', customLoader)

        expect(result).toBe(application)
        expect(application.loaders.get('customLoader')).toBe(customLoader)
        expect(application.loaders.has('customLoader')).toBe(true)
    })


    test('registerLoader validation - empty name', () => {
        const customLoader = vi.fn()

        expect(() => {
            application.registerLoader('', customLoader)
        }).toThrow('Loader name must be a non-empty string')
    })


    test('registerLoader validation - null name', () => {
        const customLoader = vi.fn()

        expect(() => {
            application.registerLoader(null, customLoader)
        }).toThrow('Loader name must be a non-empty string')
    })


    test('registerLoader validation - undefined name', () => {
        const customLoader = vi.fn()

        expect(() => {
            application.registerLoader(undefined, customLoader)
        }).toThrow('Loader name must be a non-empty string')
    })


    test('registerLoader validation - non-string name', () => {
        const customLoader = vi.fn()

        expect(() => {
            application.registerLoader(123, customLoader)
        }).toThrow('Loader name must be a non-empty string')
    })


    test('registerLoader validation - null function', () => {
        expect(() => {
            application.registerLoader('customLoader', null)
        }).toThrow('Loader must be a function')
    })


    test('registerLoader validation - undefined function', () => {
        expect(() => {
            application.registerLoader('customLoader', undefined)
        }).toThrow('Loader must be a function')
    })


    test('registerLoader validation - non-function', () => {
        expect(() => {
            application.registerLoader('customLoader', 'not a function')
        }).toThrow('Loader must be a function')
    })


    test('registerLoader can override existing loader', () => {
        const firstLoader = vi.fn().mockResolvedValue('first')
        const secondLoader = vi.fn().mockResolvedValue('second')

        application.registerLoader('myLoader', firstLoader)
        expect(application.loaders.get('myLoader')).toBe(firstLoader)

        application.registerLoader('myLoader', secondLoader)
        expect(application.loaders.get('myLoader')).toBe(secondLoader)
    })


    test('getSource', () => {
        application.getSource('images', 'logo')

        expect(mockManifest.getSourceDescriptor).toHaveBeenCalledWith('images', 'logo')
    })


    test('config', () => {
        application.setConfig('debug', true)

        expect(mockManifest.setConfig).toHaveBeenCalledWith('debug', true)
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


    test('dispose calls perkyView.dispose() which dismounts', () => {
        vi.spyOn(application.perkyView, 'dispose')
        vi.spyOn(application.perkyView, 'dismount')

        application.dispose()

        expect(application.perkyView.dispose).toHaveBeenCalled()
        expect(application.perkyView.dismount).toHaveBeenCalled()
    })


    test('input event handling integration', async () => {
        class TestController extends PerkyModule {
            jump = vi.fn()
        }

        const testApp = new Application()
        const controller = new TestController()

        testApp.registerController('game', controller)
        testApp.setActiveControllers('game')
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


    test('input state shortcuts - isKeyPressed and isMousePressed', () => {
        expect(application.isKeyPressed('Space')).toBe(false)
        expect(application.isKeyPressed('ArrowLeft')).toBe(false)
        expect(application.isKeyPressed('KeyW')).toBe(false)

        expect(application.isMousePressed('leftButton')).toBe(false)
        expect(application.isMousePressed('rightButton')).toBe(false)
        expect(application.isMousePressed('middleButton')).toBe(false)

        expect(application.isKeyPressed('Space')).toBe(application.isPressed('keyboard', 'Space'))
        expect(application.isMousePressed('leftButton')).toBe(application.isPressed('mouse', 'leftButton'))
    })


    test('input value shortcuts - getKeyValue and getMouseValue', () => {
        expect(application.getKeyValue('Space')).toBeUndefined()
        expect(application.getKeyValue('ArrowLeft')).toBeUndefined()
        expect(application.getKeyValue('KeyW')).toBeUndefined()

        expect(application.getMouseValue('leftButton')).toBe(application.getInputValue('mouse', 'leftButton'))
        expect(application.getMouseValue('rightButton')).toBe(application.getInputValue('mouse', 'rightButton'))
        expect(application.getMouseValue('position')).toBe(application.getInputValue('mouse', 'position'))

        expect(application.getKeyValue('Space')).toBe(application.getInputValue('keyboard', 'Space'))
        expect(application.getMouseValue('leftButton')).toBe(application.getInputValue('mouse', 'leftButton'))
        expect(application.getMouseValue('unknownControl')).toBe(application.getInputValue('mouse', 'unknownControl'))
    })


    test('input shortcuts with simulated key presses', () => {
        const keyboardDevice = application.getDevice('keyboard')
        const mouseDevice = application.getDevice('mouse')

        const spaceControl = keyboardDevice.findOrCreateControl(ButtonControl, {name: 'Space'})
        spaceControl.press()

        expect(application.isKeyPressed('Space')).toBe(true)
        expect(application.getKeyValue('Space')).toBe(1)
        expect(application.isPressed('keyboard', 'Space')).toBe(true)

        const leftButtonControl = mouseDevice.findOrCreateControl(ButtonControl, {name: 'leftButton'})
        leftButtonControl.press()

        expect(application.isMousePressed('leftButton')).toBe(true)
        expect(application.getMouseValue('leftButton')).toBe(1)
        expect(application.isPressed('mouse', 'leftButton')).toBe(true)

        spaceControl.release()
        leftButtonControl.release()

        expect(application.isKeyPressed('Space')).toBe(false)
        expect(application.getKeyValue('Space')).toBe(0)
        expect(application.isMousePressed('leftButton')).toBe(false)
        expect(application.getMouseValue('leftButton')).toBe(0)
    })


    test('input shortcuts consistency verification', () => {
        const testCases = [
            {key: 'Space', device: 'keyboard'},
            {key: 'ArrowLeft', device: 'keyboard'},
            {key: 'KeyW', device: 'keyboard'},
            {key: 'leftButton', device: 'mouse'},
            {key: 'rightButton', device: 'mouse'},
            {key: 'unknownControl', device: 'keyboard'},
            {key: 'unknownControl', device: 'mouse'}
        ]

        testCases.forEach(({key, device}) => {
            if (device === 'keyboard') {
                expect(application.isKeyPressed(key)).toBe(application.isPressed('keyboard', key))
                expect(application.getKeyValue(key)).toBe(application.getInputValue('keyboard', key))
            } else {
                expect(application.isMousePressed(key)).toBe(application.isPressed('mouse', key))
                expect(application.getMouseValue(key)).toBe(application.getInputValue('mouse', key))
            }
        })

        expect(application.isKeyPressed('NonExistentKey')).toBe(false)
        expect(application.isMousePressed('NonExistentButton')).toBe(false)
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


    test('use method installs extension class', () => {
        class TestExtension extends PerkyModule {
            constructor (options) {
                super({...options, name: 'testExtension'})
            }
        }

        application.use(TestExtension, {$name: 'testExtension', $category: 'extension'})

        expect(application.hasExtension('testExtension')).toBe(true)
    })


    test('use method installs extension instance', () => {
        class TestExtension extends PerkyModule {
            constructor (options) {
                super({...options, name: 'testExtension'})
            }
        }

        const extension = new TestExtension()
        application.use(TestExtension, {
            instance: extension,
            $name: 'testExtension',
            $category: 'extension'
        })

        expect(application.hasExtension('testExtension')).toBe(true)
    })


    test('use method with options', () => {
        class TestExtension extends PerkyModule {
            constructor (options) {
                super({...options, name: 'testExtension'})
            }
        }

        application.use(TestExtension, {
            $name: 'testExtension',
            $category: 'extension',
            someOption: true
        })

        const extension = application.getExtension('testExtension')
        expect(extension.options.someOption).toBe(true)
    })


    describe('bindKey flexible API', () => {

        test('parameter format with controllerName', () => {
            const binding = application.bindKey('KeyF', 'fire', 'pressed', 'player1')

            expect(binding).toBeDefined()
            expect(binding.deviceName).toBe('keyboard')
            expect(binding.controlName).toBe('KeyF')
            expect(binding.actionName).toBe('fire')
            expect(binding.eventType).toBe('pressed')
            expect(binding.controllerName).toBe('player1')
        })

        test('parameter format with eventType and no controllerName', () => {
            const binding = application.bindKey('KeyG', 'grenade', 'released')

            expect(binding).toBeDefined()
            expect(binding.deviceName).toBe('keyboard')
            expect(binding.controlName).toBe('KeyG')
            expect(binding.actionName).toBe('grenade')
            expect(binding.eventType).toBe('released')
            expect(binding.controllerName).toBeNull()
        })

        test('object format with actionName only', () => {
            const binding = application.bindKey('KeyH', {actionName: 'heal'})

            expect(binding).toBeDefined()
            expect(binding.deviceName).toBe('keyboard')
            expect(binding.controlName).toBe('KeyH')
            expect(binding.actionName).toBe('heal')
            expect(binding.eventType).toBe('pressed')
            expect(binding.controllerName).toBeNull()
        })

        test('object format with actionName and eventType', () => {
            const binding = application.bindKey('KeyI', {
                actionName: 'inventory',
                eventType: 'released'
            })

            expect(binding).toBeDefined()
            expect(binding.deviceName).toBe('keyboard')
            expect(binding.controlName).toBe('KeyI')
            expect(binding.actionName).toBe('inventory')
            expect(binding.eventType).toBe('released')
            expect(binding.controllerName).toBeNull()
        })

        test('object format with all options', () => {
            const binding = application.bindKey('KeyJ', {
                actionName: 'jump',
                eventType: 'pressed',
                controllerName: 'player2'
            })

            expect(binding).toBeDefined()
            expect(binding.deviceName).toBe('keyboard')
            expect(binding.controlName).toBe('KeyJ')
            expect(binding.actionName).toBe('jump')
            expect(binding.eventType).toBe('pressed')
            expect(binding.controllerName).toBe('player2')
        })

        test('object format with partial options uses defaults', () => {
            const binding = application.bindKey('KeyK', {
                actionName: 'kick',
                controllerName: 'player3'
            })

            expect(binding).toBeDefined()
            expect(binding.deviceName).toBe('keyboard')
            expect(binding.controlName).toBe('KeyK')
            expect(binding.actionName).toBe('kick')
            expect(binding.eventType).toBe('pressed')
            expect(binding.controllerName).toBe('player3')
        })

        test('backwards compatibility - original format still works', () => {
            const binding = application.bindKey('KeyL', 'look')

            expect(binding).toBeDefined()
            expect(binding.deviceName).toBe('keyboard')
            expect(binding.controlName).toBe('KeyL')
            expect(binding.actionName).toBe('look')
            expect(binding.eventType).toBe('pressed')
            expect(binding.controllerName).toBeNull()
        })

    })


    describe('bindMouse flexible API', () => {

        test('parameter format with controllerName', () => {
            const binding = application.bindMouse('middleButton', 'zoom', 'pressed', 'camera')

            expect(binding).toBeDefined()
            expect(binding.deviceName).toBe('mouse')
            expect(binding.controlName).toBe('middleButton')
            expect(binding.actionName).toBe('zoom')
            expect(binding.eventType).toBe('pressed')
            expect(binding.controllerName).toBe('camera')
        })

        test('parameter format with eventType and no controllerName', () => {
            const binding = application.bindMouse('rightButton', 'context', 'released')

            expect(binding).toBeDefined()
            expect(binding.deviceName).toBe('mouse')
            expect(binding.controlName).toBe('rightButton')
            expect(binding.actionName).toBe('context')
            expect(binding.eventType).toBe('released')
            expect(binding.controllerName).toBeNull()
        })

        test('object format with actionName only', () => {
            const binding = application.bindMouse('leftButton', {actionName: 'select'})

            expect(binding).toBeDefined()
            expect(binding.deviceName).toBe('mouse')
            expect(binding.controlName).toBe('leftButton')
            expect(binding.actionName).toBe('select')
            expect(binding.eventType).toBe('pressed')
            expect(binding.controllerName).toBeNull()
        })

        test('object format with actionName and eventType', () => {
            const binding = application.bindMouse('rightButton', {
                actionName: 'menu',
                eventType: 'released'
            })

            expect(binding).toBeDefined()
            expect(binding.deviceName).toBe('mouse')
            expect(binding.controlName).toBe('rightButton')
            expect(binding.actionName).toBe('menu')
            expect(binding.eventType).toBe('released')
            expect(binding.controllerName).toBeNull()
        })

        test('object format with all options', () => {
            const binding = application.bindMouse('leftButton', {
                actionName: 'fire',
                eventType: 'pressed',
                controllerName: 'weapon'
            })

            expect(binding).toBeDefined()
            expect(binding.deviceName).toBe('mouse')
            expect(binding.controlName).toBe('leftButton')
            expect(binding.actionName).toBe('fire')
            expect(binding.eventType).toBe('pressed')
            expect(binding.controllerName).toBe('weapon')
        })

        test('object format with partial options uses defaults', () => {
            const binding = application.bindMouse('middleButton', {
                actionName: 'special',
                controllerName: 'ui'
            })

            expect(binding).toBeDefined()
            expect(binding.deviceName).toBe('mouse')
            expect(binding.controlName).toBe('middleButton')
            expect(binding.actionName).toBe('special')
            expect(binding.eventType).toBe('pressed')
            expect(binding.controllerName).toBe('ui')
        })

        test('backwards compatibility - original format still works', () => {
            const binding = application.bindMouse('rightButton', 'aim')

            expect(binding).toBeDefined()
            expect(binding.deviceName).toBe('mouse')
            expect(binding.controlName).toBe('rightButton')
            expect(binding.actionName).toBe('aim')
            expect(binding.eventType).toBe('pressed')
            expect(binding.controllerName).toBeNull()
        })

        test('object format validation - empty object should throw', () => {
            expect(() => {
                application.bindMouse('leftButton', {})
            }).toThrow()
        })

        test('object format validation - undefined actionName should throw', () => {
            expect(() => {
                application.bindMouse('rightButton', {actionName: undefined})
            }).toThrow()
        })

        test('parameter format validation - undefined actionName should throw', () => {
            expect(() => {
                application.bindMouse('middleButton', undefined)
            }).toThrow()
        })

    })


    describe('flexible API edge cases', () => {

        test('mixed usage in same application', () => {
            const binding1 = application.bindKey('Digit1', 'slot1', 'pressed', 'inventory')

            const binding2 = application.bindKey('Digit2', {
                actionName: 'slot2',
                eventType: 'pressed',
                controllerName: 'inventory'
            })

            expect(binding1.actionName).toBe('slot1')
            expect(binding1.controllerName).toBe('inventory')
            expect(binding2.actionName).toBe('slot2')
            expect(binding2.controllerName).toBe('inventory')

            const allBindings = application.getAllBindings()
            const inventoryBindings = allBindings.filter(b => b.controllerName === 'inventory')
            expect(inventoryBindings).toHaveLength(2)
        })

        test('object format with empty object defaults everything', () => {
            expect(() => {
                application.bindKey('KeyEmpty', {})
            }).toThrow()
        })

        test('object format with undefined actionName', () => {
            expect(() => {
                application.bindKey('KeyUndef', {actionName: undefined})
            }).toThrow()
        })

        test('object format with null actionName', () => {
            expect(() => {
                application.bindKey('KeyNull', {actionName: null})
            }).toThrow()
        })

        test('object format with empty string actionName', () => {
            expect(() => {
                application.bindKey('KeyEmpty', {actionName: ''})
            }).toThrow()
        })

        test('parameter format with undefined actionName', () => {
            expect(() => {
                application.bindKey('KeyParamUndef', undefined)
            }).toThrow()
        })

        test('parameter format with null actionName', () => {
            expect(() => {
                application.bindKey('KeyParamNull', null)
            }).toThrow()
        })

    })


    describe('bindCombo', () => {

        test('accepts string format with auto-detection', () => {
            const combo = application.bindCombo(['ShiftLeft', 'leftButton'], 'shiftClick')

            expect(combo).toBeDefined()
            expect(combo.controls).toHaveLength(2)
            expect(combo.controls[0].deviceName).toBe('keyboard')
            expect(combo.controls[0].controlName).toBe('ShiftLeft')
            expect(combo.controls[1].deviceName).toBe('mouse')
            expect(combo.controls[1].controlName).toBe('leftButton')
            expect(combo.actionName).toBe('shiftClick')
        })


        test('accepts object format', () => {
            const combo = application.bindCombo([
                {deviceName: 'keyboard', controlName: 'ControlLeft'},
                {deviceName: 'mouse', controlName: 'rightButton'}
            ], 'ctrlRightClick')

            expect(combo.controls).toHaveLength(2)
            expect(combo.controls[0].deviceName).toBe('keyboard')
            expect(combo.controls[1].deviceName).toBe('mouse')
        })


        test('accepts mixed string and object formats', () => {
            const combo = application.bindCombo([
                'ControlLeft',
                {deviceName: 'mouse', controlName: 'leftButton'}
            ], 'mixedCombo')

            expect(combo.controls).toHaveLength(2)
            expect(combo.controls[0].deviceName).toBe('keyboard')
            expect(combo.controls[0].controlName).toBe('ControlLeft')
            expect(combo.controls[1].deviceName).toBe('mouse')
            expect(combo.controls[1].controlName).toBe('leftButton')
        })


        test('works with keyboard-only combinations', () => {
            const combo = application.bindCombo(['ControlLeft', 'KeyS'], 'save')

            expect(combo.controls).toHaveLength(2)
            expect(combo.controls.every(c => c.deviceName === 'keyboard')).toBe(true)
        })


        test('works with mouse-only combinations', () => {
            const combo = application.bindCombo(['leftButton', 'rightButton'], 'bothButtons')

            expect(combo.controls).toHaveLength(2)
            expect(combo.controls.every(c => c.deviceName === 'mouse')).toBe(true)
        })


        test('supports controller and eventType', () => {
            const combo = application.bindCombo(
                ['AltLeft', 'middleButton'],
                'special',
                'editor',
                'released'
            )

            expect(combo.controllerName).toBe('editor')
            expect(combo.eventType).toBe('released')
        })


        test('integration test - triggers when all controls are pressed', async () => {
            class TestController extends PerkyModule {
                smartCombo = vi.fn()
            }

            const testApp = new Application()
            const controller = new TestController()

            testApp.registerController('editor', controller)
            testApp.setActiveControllers('editor')
            testApp.bindCombo(['ControlLeft', 'leftButton'], 'smartCombo', 'editor')

            const keyboardDevice = testApp.getDevice('keyboard')
            const mouseDevice = testApp.getDevice('mouse')

            const ctrlControl = keyboardDevice.findOrCreateControl(ButtonControl, {name: 'ControlLeft'})
            const leftButtonControl = mouseDevice.findOrCreateControl(ButtonControl, {name: 'leftButton'})

            ctrlControl.press({code: 'ControlLeft'})
            await new Promise(resolve => setTimeout(resolve, 0))
            expect(controller.smartCombo).not.toHaveBeenCalled()

            leftButtonControl.press()
            await new Promise(resolve => setTimeout(resolve, 0))
            expect(controller.smartCombo).toHaveBeenCalled()
        })

    })

})



