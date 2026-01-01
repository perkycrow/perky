import PerkyModule from '../core/perky_module.js'
import SourceLoader from './source_loader.js'


export default class SourceManager extends PerkyModule {

    static $category = 'sourceManager'

    constructor (options = {}) {
        super(options)

        this.loaders = options.loaders
        this.manifest = options.manifest
    }


    onInstall (host) {
        this.delegateTo(host, ['loadAsset', 'loadTag', 'loadAll', 'loaders'])

        this.delegateEventsTo(host, [
            'loader:progress',
            'loader:complete',
            'loader:error'
        ])
    }


    async loadAsset (id) {
        const asset = this.manifest.getAsset(id)

        if (!asset) {
            throw new Error(`Asset not found: ${id}`)
        }

        const sourceLoader = new SourceLoader([asset], this.loaders)
        this.#setupLoaderEvents(sourceLoader)

        await sourceLoader.load()

        return sourceLoader
    }


    async loadTag (tag) {
        const assets = this.manifest.getAssetsByTag(tag)

        const sourceLoader = new SourceLoader(assets, this.loaders)
        this.#setupLoaderEvents(sourceLoader)

        await sourceLoader.load()

        return sourceLoader
    }


    async loadAll () {
        const assets = this.manifest.getAllAssets()

        const sourceLoader = new SourceLoader(assets, this.loaders)
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
