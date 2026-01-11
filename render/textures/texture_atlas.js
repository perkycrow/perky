import TextureRegion from './texture_region.js'
import ShelfPacker from './shelf_packer.js'


const DEFAULT_SIZE = 4096
const MAX_SIZE = 4096
const PADDING = 1


export default class TextureAtlas {

    #canvas = null
    #ctx = null
    #packer = null
    #regions = new Map()
    #dirty = false

    constructor (options = {}) {
        this.width = options.width ?? DEFAULT_SIZE
        this.height = options.height ?? DEFAULT_SIZE
        this.padding = options.padding ?? PADDING

        this.#canvas = createCanvas(this.width, this.height)
        this.#ctx = this.#canvas.getContext('2d')
        this.#packer = new ShelfPacker(this.width, this.height, this.padding)
    }


    get canvas () {
        return this.#canvas
    }


    get dirty () {
        return this.#dirty
    }


    get full () {
        return this.#packer.full
    }


    get regionCount () {
        return this.#regions.size
    }


    markClean () {
        this.#dirty = false
    }


    add (id, image) {
        if (this.#regions.has(id)) {
            return this.#regions.get(id)
        }

        const slot = this.#packer.pack(image.width, image.height)

        if (!slot) {
            return null
        }

        this.#ctx.drawImage(image, slot.x, slot.y)

        const region = new TextureRegion({
            image: this.#canvas,
            x: slot.x,
            y: slot.y,
            width: image.width,
            height: image.height
        })

        this.#regions.set(id, region)
        this.#dirty = true

        return region
    }


    get (id) {
        return this.#regions.get(id) || null
    }


    has (id) {
        return this.#regions.has(id)
    }


    getAllRegions () {
        return this.#regions
    }


    canFit (width, height) {
        return this.#packer.canFit(width, height)
    }


    clear () {
        this.#ctx.clearRect(0, 0, this.width, this.height)
        this.#packer = new ShelfPacker(this.width, this.height, this.padding)
        this.#regions.clear()
        this.#dirty = true
    }


    dispose () {
        this.#canvas = null
        this.#ctx = null
        this.#packer = null
        this.#regions.clear()
    }


    static get DEFAULT_SIZE () {
        return DEFAULT_SIZE
    }


    static get MAX_SIZE () {
        return MAX_SIZE
    }

}


function createCanvas (width, height) {
    if (typeof OffscreenCanvas !== 'undefined') {
        return new OffscreenCanvas(width, height)
    }

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    return canvas
}
