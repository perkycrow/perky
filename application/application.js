import Engine from '../core/engine'
import Registry from '../core/registry'
import PerkyView from './perky_view'
import InputObserver from '../input/input_observer'
import InputMapper from '../input/input_mapper'
import SourceManager from './source_manager'
import {loaders} from './loaders'


export default class Application extends Engine {

    constructor (params = {}) {
        super(params)

        this.loaders = new Registry(loaders)

        this.registerModule('perkyView', new PerkyView({className: 'perky-application'}))

        this.registerModule('inputObserver', new InputObserver({container: this.element}))

        this.registerModule('inputMapper', new InputMapper(this))

        this.registerModule('sourceManager', new SourceManager(this))

        this.#initEvents()
    }


    get element () {
        return this.perkyView.element
    }


    isInputPressed (...args) {
        return this.inputObserver.isPressed(...args)
    }


    isActionPressed (action) {
        return this.inputMapper.isActionPressed(action)
    }


    setInputFor (action, input, slot = 0) {
        return this.inputMapper.setInputFor(action, input, slot)
    }


    setInputsFor (action, inputs) {
        return this.inputMapper.setInputsFor(action, inputs)
    }


    getInputFor (action, slot = 0) {
        return this.inputMapper.getInputFor(action, slot)
    }


    getInputsFor (action) {
        return this.inputMapper.getInputsFor(action)
    }
    

    mountTo (element) {
        return this.perkyView.mountTo(element)
    }


    async loadSource (type, id) {
        return this.sourceManager.loadSource(type, id)
    }


    async loadTag (tag) {
        return this.sourceManager.loadTag(tag)
    }


    async loadAll () {
        return this.sourceManager.loadAll()
    }


    getSource (type, id) {
        const sourceDescriptor = this.manifest.getSourceDescriptor(type, id)
        return sourceDescriptor ? sourceDescriptor.source : null
    }


    config (path, value) {
        return this.manifest.config(path, value)
    }


    setHtml (html) {
        this.perkyView.html = html
    }

    #initEvents () {
        const {inputObserver, inputMapper, actionDispatcher, perkyView} = this

        inputMapper.on('action', (action, ...args) => actionDispatcher.dispatch(action, ...args))

        inputObserver.on('keydown', this.emitter('keydown'))

        inputObserver.on('keyup', this.emitter('keyup'))

        inputObserver.on('mousemove', this.emitter('mousemove'))

        inputObserver.on('mousedown', this.emitter('mousedown'))

        inputObserver.on('mouseup', this.emitter('mouseup'))

        perkyView.on('resize', this.emitter('resize'))
    }

}
