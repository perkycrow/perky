import PerkyModule from '../core/perky_module'
import SourceLoader from './source_loader'


export default class SourceManager extends PerkyModule {

    constructor ({loaders, manifest}) {
        super()
        this.loaders = loaders
        this.manifest = manifest
    }


    async loadSource (type, id) {
        const sourceDescriptor = this.manifest.getSourceDescriptor(type, id)

        if (!sourceDescriptor) {
            throw new Error(`Source not found: ${type}:${id}`)
        }

        const sourceLoader = new SourceLoader([sourceDescriptor], this.loaders)
        this.#setupLoaderEvents(sourceLoader)

        await sourceLoader.load()

        return sourceLoader
    }


    async loadTag (tag) {
        const sourceDescriptors = this.manifest.getSourceDescriptorsByTag(tag)

        if (!sourceDescriptors.length) {
            throw new Error(`No sources found for tag: ${tag}`)
        }

        const sourceLoader = new SourceLoader(sourceDescriptors, this.loaders)
        this.#setupLoaderEvents(sourceLoader)

        await sourceLoader.load()

        return sourceLoader
    }
    

    async loadAll () {
        const sourceDescriptors = this.manifest.getAllSourceDescriptors()

        if (!sourceDescriptors.length) {
            throw new Error('No sources found')
        }

        const sourceLoader = new SourceLoader(sourceDescriptors, this.loaders)
        this.#setupLoaderEvents(sourceLoader)

        await sourceLoader.load()

        return sourceLoader
    }

    #setupLoaderEvents (loader) {
        loader.on('progress', (...args) => {
            this.emit('loader:progress', loader, ...args)
        })

        loader.on('complete', (...args) => {
            this.emit('loader:complete', loader, ...args)
        })

        loader.on('error', (...args) => {
            this.emit('loader:error', loader, ...args)
        })
    }

}
