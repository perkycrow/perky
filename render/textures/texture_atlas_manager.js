import TextureAtlas from './texture_atlas.js'
import TextureRegion from './texture_region.js'


export default class TextureAtlasManager {

    static DEFAULT_ATLAS = Symbol('default')

    #atlases = []
    #atlasGroups = new Map()
    #regionIndex = new Map()
    #atlasSize = TextureAtlas.DEFAULT_SIZE

    constructor (options = {}) {
        this.#atlasSize = options.atlasSize ?? TextureAtlas.DEFAULT_SIZE
    }


    get atlases () {
        return this.#atlases
    }


    get atlasCount () {
        return this.#atlases.length
    }


    get regionCount () {
        return this.#regionIndex.size
    }


    add (id, image) {
        if (this.#regionIndex.has(id)) {
            return this.#regionIndex.get(id)
        }

        if (!isValidImage(image)) {
            return null
        }

        if (isOversized(image, this.#atlasSize)) {
            return this.#addOversizedImage(id, image)
        }

        const region = this.#addToAtlas(id, image)

        if (region) {
            this.#regionIndex.set(id, region)
        }

        return region
    }


    addBatch (images) {
        const results = new Map()

        for (const [id, image] of Object.entries(images)) {
            const region = this.add(id, image)
            results.set(id, region)
        }

        return results
    }


    addToNamedAtlas (atlasName, id, image) {
        if (this.#regionIndex.has(id)) {
            return this.#regionIndex.get(id)
        }

        if (!isValidImage(image)) {
            return null
        }

        if (isOversized(image, this.#atlasSize)) {
            return this.#addOversizedImage(id, image)
        }

        const region = this.#addToNamedAtlas(atlasName, id, image)

        if (region) {
            this.#regionIndex.set(id, region)
        }

        return region
    }


    addBatchToNamedAtlas (atlasName, images) {
        const results = new Map()

        for (const [id, image] of Object.entries(images)) {
            const region = this.addToNamedAtlas(atlasName, id, image)
            results.set(id, region)
        }

        return results
    }


    get (id) {
        return this.#regionIndex.get(id) || null
    }


    has (id) {
        return this.#regionIndex.has(id)
    }


    getDirtyAtlases () {
        return this.#atlases.filter(atlas => atlas.dirty)
    }


    markAllClean () {
        for (const atlas of this.#atlases) {
            atlas.markClean()
        }
    }


    clear () {
        for (const atlas of this.#atlases) {
            atlas.dispose()
        }
        this.#atlases = []
        this.#atlasGroups.clear()
        this.#regionIndex.clear()
    }


    dispose () {
        this.clear()
    }


    #addToAtlas (id, image) {
        return this.#addToNamedAtlas(TextureAtlasManager.DEFAULT_ATLAS, id, image)
    }


    #addToNamedAtlas (atlasName, id, image) {
        let atlasGroup = this.#atlasGroups.get(atlasName)

        if (!atlasGroup) {
            atlasGroup = []
            this.#atlasGroups.set(atlasName, atlasGroup)
        }

        for (const atlas of atlasGroup) {
            if (atlas.canFit(image.width, image.height)) {
                return atlas.add(id, image)
            }
        }

        const newAtlas = new TextureAtlas({
            width: this.#atlasSize,
            height: this.#atlasSize
        })

        atlasGroup.push(newAtlas)
        this.#atlases.push(newAtlas)

        return newAtlas.add(id, image)
    }


    #addOversizedImage (id, image) {
        const region = TextureRegion.fromImage(image)
        this.#regionIndex.set(id, region)
        return region
    }

}


function isValidImage (image) {
    return image && image.width > 0 && image.height > 0
}


function isOversized (image, atlasSize) {
    return image.width > atlasSize || image.height > atlasSize
}
