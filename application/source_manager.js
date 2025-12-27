import PerkyModule from '../core/perky_module'
import SourceLoader from './source_loader'


export default class SourceManager extends PerkyModule {

    static $category = 'sourceManager'

    constructor (options = {}) {
        super(options)

        this.loaders = options.loaders
        this.manifest = options.manifest
    }


    onInstall (host) {
        this.delegateTo(host, ['loadSource', 'loadTag', 'loadAll', 'loaders'])

        this.delegateEventsTo(host, [
            'loader:progress',
            'loader:complete',
            'loader:error'
        ])
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

        const sourceLoader = new SourceLoader(sourceDescriptors, this.loaders)
        this.#setupLoaderEvents(sourceLoader)

        await sourceLoader.load()

        return sourceLoader
    }


    async loadAll () {
        const sourceDescriptors = this.manifest.getAllSourceDescriptors()

        const sourceLoader = new SourceLoader(sourceDescriptors, this.loaders)
        this.#setupLoaderEvents(sourceLoader)

        await sourceLoader.load()

        return sourceLoader
    }


    #setupLoaderEvents (loader) {
        this.delegateEvents(loader, [
            'progress',
            'complete',
            'error'
        ], 'loader')
    }

}
