import PerkyModule from '../../core/perky_module.js'
import TextureAtlasManager from './texture_atlas_manager.js'
import TextureRegion from './texture_region.js'


export default class TextureSystem extends PerkyModule {

    static $category = 'textureSystem'

    #atlasManager = null
    #manualRegions = new Map()

    constructor (options = {}) {
        super(options)
        this.#atlasManager = new TextureAtlasManager({
            atlasSize: options.atlasSize
        })
        this.fallback = options.fallback ?? null
    }


    onInstall (host) {
        this.delegateTo(host, [
            'getRegion',
            'hasRegion',
            'addRegion',
            'addRegions',
            'registerManualAtlas'
        ])
    }


    get atlasManager () {
        return this.#atlasManager
    }


    get atlases () {
        return this.#atlasManager.atlases
    }


    get regionCount () {
        return this.#atlasManager.regionCount + this.#manualRegions.size
    }


    getRegion (id) {
        const region = this.#manualRegions.get(id) || this.#atlasManager.get(id)
        if (region) {
            return region
        }

        const source = this.fallback?.(id)
        if (source) {
            return TextureRegion.fromImage(source)
        }

        return null
    }


    hasRegion (id) {
        return this.#manualRegions.has(id) || this.#atlasManager.has(id)
    }


    addRegion (id, image) {
        if (this.hasRegion(id)) {
            return this.getRegion(id)
        }

        return this.#atlasManager.add(id, image)
    }


    addRegions (images) {
        return this.#atlasManager.addBatch(images)
    }


    registerManualAtlas (id, image, frames) {
        for (const [frameName, frameData] of Object.entries(frames)) {
            const regionId = `${id}:${frameName}`
            const region = TextureRegion.fromFrame(image, frameData)
            this.#manualRegions.set(regionId, region)
        }
    }


    buildFromAssets (assets) {
        const images = {}

        for (const asset of assets) {
            if (isImageAsset(asset) && asset.source) {
                images[asset.id] = asset.source
            }
        }

        return this.addRegions(images)
    }


    getDirtyAtlases () {
        return this.#atlasManager.getDirtyAtlases()
    }


    markAllClean () {
        this.#atlasManager.markAllClean()
    }


    clear () {
        this.#atlasManager.clear()
        this.#manualRegions.clear()
    }


    onDispose () {
        this.clear()
    }

}


function isImageAsset (asset) {
    return asset.type === 'image'
}
