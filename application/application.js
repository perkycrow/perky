import Engine from '../core/engine'
import Registry from '../core/registry'
import PerkyView from './perky_view'
import SourceManager from './source_manager'
import {loaders} from './loaders'


export default class Application extends Engine {

    constructor (params = {}) {
        super(params)

        this.loaders = new Registry(loaders)

        this.registerModule('perkyView', new PerkyView({className: 'perky-application'}))

        this.registerModule('sourceManager', new SourceManager(this))

        this.#initEvents()
    }


    get element () {
        return this.perkyView.element
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
        const {perkyView} = this

        perkyView.on('resize', this.emitter('resize'))
    }

}
