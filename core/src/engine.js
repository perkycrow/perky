import Manifest from './manifest'
import PerkyModule from './perky_module'
import Registry from './registry'


export default class Engine extends PerkyModule {

    constructor (manifest = {}) {
        super()

        if (!(manifest instanceof Manifest)) {
            manifest = new Manifest(manifest)
        }

        this.manifest = manifest
        this.modules  = new Registry()

        initEvents(this)
    }


    registerModule (name, module) {
        if (!(module instanceof PerkyModule)) {
            console.warn(`Attempted to register non-module object as module: ${name}`)
            return this
        }

        this.modules.set(name, module)

        return this
    }


    getModule (name) {
        return this.modules.get(name) || null
    }


    getMetadata (key) {
        return this.manifest.metadata(key)
    }


    setMetadata (key, value) {
        this.manifest.metadata(key, value)
        return this
    }


    getConfig (path) {
        return this.manifest.config(path)
    }


    setConfig (path, value) {
        this.manifest.config(path, value)

        return this
    }


    addSource (type, source) {
        return this.manifest.addSource(type, source)
    }


    getSource (type, id) {
        const sources = this.manifest.data.sources[type]
        return sources && sources[id] ? sources[id] : null
    }


    getSources (type) {
        return this.manifest.getSources(type) 
            ? Object.values(this.manifest.getSources(type))
            : []
    }


    addAlias (key, value) {
        this.manifest.alias(key, value)
        return this
    }


    getAlias (key) {
        return this.manifest.alias(key)
    }


    exportManifest (pretty = true) {
        return this.manifest.export(pretty)
    }


    importManifest (data) {
        this.manifest.import(data)
        return this
    }

}


function initEvents (engine) {
    const {modules} = engine

    modules.on('set',    (key, module) => onSetModule(engine, key, module))
    modules.on('delete', (key, module) => onDeleteModule(engine, key, module))
    modules.on('clear',  () => engine.emit('module:clear'))

    engine.on('init',   modules.invoker('init'))
    engine.on('start',  modules.invoker('start'))
    engine.on('stop',   modules.invoker('stop'))
    engine.on('update', modules.invoker('update'))
    engine.on('pause',  modules.invoker('pause'))
    engine.on('resume', modules.invoker('resume'))
}


function onSetModule (engine, name, module) {
    if (module.engine) {
        console.warn(`Module ${name} is already registered in another engine`)
        return
    }

    module.engine = engine

    engine.emit('module:set', name, module)
    module.emit('registered', engine, name)
}


function onDeleteModule (engine, name, module) {
    if (module.engine !== engine) {
        console.warn(`Module ${name} is not registered in this engine`)
        return
    }

    engine.emit('module:delete', name, module)
    module.emit('unregistered', engine, name)

    delete module.engine
}
