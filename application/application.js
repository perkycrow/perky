import PerkyModule from '../core/perky_module.js'
import Manifest from './manifest.js'
import ActionDispatcher from '../core/action_dispatcher.js'
import ActionController from '../core/action_controller.js'
import Registry from '../core/registry.js'
import PerkyView from './perky_view.js'
import SourceManager from './source_manager.js'
import {loaders} from './loaders.js'
import InputSystem from '../input/input_system.js'


export default class Application extends PerkyModule {

    static $category = 'application'

    static $eagerStart = false

    static ActionController = ActionController

    #controllerBindings = new Map()

    constructor (options = {}) {
        super(options)

        const manifestData = options.manifest || this.constructor.manifest || {}

        this.create(Manifest, {
            $bind: 'manifest',
            data: manifestData.export ? manifestData.export() : manifestData
        })

        this.create(ActionDispatcher, {
            $bind: 'actionDispatcher'
        })

        this.create(PerkyView, {
            $bind: 'perkyView',
            className: 'perky-application'
        })

        this.create(SourceManager, {
            $bind: 'sourceManager',
            loaders: new Registry(loaders),
            manifest: this.manifest
        })

        this.create(InputSystem, {
            $bind: 'inputSystem',
            bindings: options.bindings
        })

        this.actionDispatcher.on('controller:set', this.#autoRegisterBindings.bind(this))
        this.actionDispatcher.on('controller:unregistered', this.#cleanupControllerBindings.bind(this))

        this.#createMainController()

        this.configureApplication?.(options)
    }


    #createMainController () {
        const ControllerClass = this.constructor.ActionController
        if (ControllerClass) {
            const controller = this.registerController(ControllerClass)
            this.setActiveControllers(controller.$id)
        }
    }


    async preload () {
        return this.loadTag('preload')
    }


    #autoRegisterBindings (controllerName, controller) {
        const Controller = controller.constructor
        const bindings = Controller.normalizeBindings?.(controllerName) || []
        const bindingKeys = []

        for (const binding of bindings) {
            const inputBinding = this.bindInput({
                controlName: binding.key,
                actionName: binding.action,
                controllerName: binding.controllerName,
                eventType: binding.eventType
            })

            if (inputBinding) {
                bindingKeys.push(inputBinding.key)
            }
        }

        if (bindingKeys.length > 0) {
            this.#controllerBindings.set(controllerName, bindingKeys)
        }
    }


    #cleanupControllerBindings (controllerName) {
        const bindingKeys = this.#controllerBindings.get(controllerName)

        if (!bindingKeys) {
            return
        }

        for (const key of bindingKeys) {
            const allBindings = this.getAllBindings()
            const binding = allBindings.find(b => b.key === key)

            if (binding) {
                this.unbind({
                    deviceName: binding.deviceName,
                    controlName: binding.controlName,
                    actionName: binding.actionName,
                    controllerName: binding.controllerName,
                    eventType: binding.eventType
                })
            }
        }

        this.#controllerBindings.delete(controllerName)
    }

}
