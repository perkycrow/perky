import PerkyModule from '../core/perky_module.js'
import Manifest from './manifest.js'
import ActionDispatcher from '../core/action_dispatcher.js'
import Registry from '../core/registry.js'
import PerkyView from './perky_view.js'
import SourceManager from './source_manager.js'
import {loaders} from './loaders.js'
import InputSystem from '../input/input_system.js'


export default class Application extends PerkyModule {

    static $category = 'application'

    static $eagerStart = false

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

        this.configureApplication?.(options)
    }


    async preload () {
        return this.loadTag('preload')
    }


    #autoRegisterBindings (controllerName, controller) {
        const Controller = controller.constructor
        const bindings = Controller.normalizeBindings?.(controllerName) || []

        for (const binding of bindings) {
            this.bindInput({
                controlName: binding.key,
                actionName: binding.action,
                controllerName: binding.controllerName,
                eventType: binding.eventType
            })
        }
    }

}
