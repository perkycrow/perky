import Engine from '../core/engine'
import Registry from '../core/registry'
import PerkyView from './perky_view'
import SourceManager from './source_manager'
import {loaders} from './loaders'
import InputSystem from '../input/input_system'


export default class Application extends Engine {

    static eagerStart = false

    constructor (params = {}) {
        const {inputBinder, keyboard = {}, mouse = {}} = params

        super(params)

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
            inputBinder,
            keyboard,
            mouse,
            perkyView: this.perkyView
        })

        this.actionDispatcher.on('controller:set', this.#autoRegisterBindings.bind(this))

        if (typeof this.configure === 'function') {
            this.configure(params)
        }
    }


    async preload () {
        return this.loadTag('preload')
    }


    registerLoader (name, loaderFunction) {
        if (!name || typeof name !== 'string') {
            throw new Error('Loader name must be a non-empty string')
        }

        if (!loaderFunction || typeof loaderFunction !== 'function') {
            throw new Error('Loader must be a function')
        }

        this.loaders.set(name, loaderFunction)
        return this
    }


    getImage (id) {
        return this.getSource('images', id)
    }


    #autoRegisterBindings (controllerName, controller) {
        const ControllerClass = controller.constructor

        if (typeof ControllerClass.normalizeBindings === 'function') {
            const bindings = ControllerClass.normalizeBindings(controllerName)

            for (const binding of bindings) {
                this.bindKey(binding.key, {
                    actionName: binding.action,
                    controllerName: binding.controllerName,
                    eventType: binding.eventType
                })
            }
        }
    }

}
