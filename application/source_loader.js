import PerkyModule from '../core/perky_module.js'
import Registry from '../core/registry.js'


export default class SourceLoader extends PerkyModule {

    #loadingPromises = {}

    constructor (assets, loaders) {
        super()
        this.loaders = loaders instanceof Registry ? loaders : new Registry(loaders)
        this.assets = assets
    }


    get assetCount () {
        return this.assets.length
    }


    get loadedCount () {
        return this.assets.filter(asset => asset.loaded).length
    }


    get progress () {
        if (this.assetCount === 0) {
            return 1
        }
        return this.loadedCount / this.assetCount
    }


    async load () {
        if (this.loading) {
            return false
        }

        this.loading = true

        const promises = this.assets.map(asset => {
            return this.loadAsset(asset)
        })

        await Promise.all(promises)

        this.loading = false

        this.emit('complete', this.assets)

        return this.assets
    }


    async loadAsset (asset) {
        const assetKey = `${asset.type}:${asset.id}`

        if (asset.loaded) {
            return asset
        }

        if (this.#loadingPromises[assetKey]) {
            return this.#loadingPromises[assetKey]
        }

        const loader = this.loaders.get(asset.type)

        if (!loader) {
            throw new Error(`No loader found for asset type: ${asset.type}`)
        }

        const params = asset.url ? {
            url: asset.url,
            config: asset.config || {}
        } : asset

        this.#loadingPromises[assetKey] = Promise.resolve()
            .then(() => loader(params))
            .then(source => {
                asset.source = source
                delete this.#loadingPromises[assetKey]

                this.emit('progress', this.progress, {asset, source})
                return asset
            })
            .catch(error => {
                delete this.#loadingPromises[assetKey]

                this.emit('error', asset, error)
                throw error
            })

        return this.#loadingPromises[assetKey]
    }

}
