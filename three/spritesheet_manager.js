import PerkyModule from '../core/perky_module.js'
import Registry from '../core/registry.js'
import SpriteTexture from './textures/sprite_texture.js'
import SpriteMaterial from './materials/sprite_material.js'


export default class SpriteSheetManager extends PerkyModule {
    
    #spritesheets = new Registry()
    #textures = new Registry()
    #materials = new Registry()


    constructor () {
        super()
        this.#initEvents()
    }


    registerSpritesheet (id, spritesheet) {
        if (this.#spritesheets.has(id)) {
            console.warn(`Spritesheet ${id} already registered`)
            return false
        }
        
        this.#spritesheets.set(id, spritesheet)
        this.#createTexturesForSpritesheet(id, spritesheet)
        
        this.emit('spritesheet:registered', id, spritesheet)
        return true
    }


    unregisterSpritesheet (id) {
        if (!this.#spritesheets.has(id)) {
            return false
        }

        const spritesheet = this.#spritesheets.get(id)
        this.#spritesheets.delete(id)

        // Clean up associated textures and materials
        spritesheet.getImageKeys().forEach(imageKey => {
            this.#textures.delete(imageKey)
            this.#materials.delete(imageKey)
        })
        
        this.emit('spritesheet:unregistered', id, spritesheet)
        return true
    }


    getSpritesheet (id) {
        return this.#spritesheets.get(id)
    }

    
    getFrame (spritesheetId, frameId) {
        const spritesheet = this.getSpritesheet(spritesheetId)
        return spritesheet ? spritesheet.getFrame(frameId) : null
    }


    getTextureForFrame (spritesheetId, frameId) {
        const frame = this.getFrame(spritesheetId, frameId)
        if (!frame || !frame.baseImage) {
            return null
        }
        
        return this.#textures.get(frame.baseImage)
    }

    
    getMaterialForFrame (spritesheetId, frameId, options = {}) {
        const frame = this.getFrame(spritesheetId, frameId)
        if (!frame || !frame.baseImage) {
            return null
        }
        
        const materialKey = SpriteSheetManager.#getMaterialKey(frame.baseImage, options)
        
        if (!this.#materials.has(materialKey)) {
            const texture = this.#textures.get(frame.baseImage)
            if (!texture) {
                return null
            }
            
            const material = new SpriteMaterial({
                texture,
                ...options
            })
            
            this.#materials.set(materialKey, material)
        }
        
        return this.#materials.get(materialKey)
    }

    
    createFrameTexture (spritesheetId, frameId) {
        const frame = this.getFrame(spritesheetId, frameId)
        const baseTexture = this.getTextureForFrame(spritesheetId, frameId)
        
        if (!frame || !baseTexture || !frame.image) {
            return null
        }
        
        const texture = baseTexture.clone()
        const {x, y, w, h} = frame.frame
        const {width, height} = frame.image
        
        texture.offset.set(x / width, y / height)
        texture.repeat.set(w / width, h / height)
        texture.needsUpdate = true
        
        return texture
    }

    
    hasFrame (spritesheetId, frameId) {
        const spritesheet = this.getSpritesheet(spritesheetId)
        return spritesheet ? spritesheet.hasFrame(frameId) : false
    }

    
    getFrameNames (spritesheetId) {
        const spritesheet = this.getSpritesheet(spritesheetId)
        return spritesheet ? spritesheet.getFrameNames() : []
    }


    getAllSpritesheets () {
        return Array.from(this.#spritesheets.values)
    }


    getSpritesheetIds () {
        return Array.from(this.#spritesheets.keys)
    }


    #createTexturesForSpritesheet (id, spritesheet) {
        spritesheet.getImageKeys().forEach(imageKey => {
            if (!this.#textures.has(imageKey)) {
                const image = spritesheet.getImage(imageKey)
                if (image) {
                    const texture = new SpriteTexture({source: image})
                    this.#textures.set(imageKey, texture)
                    this.emit('texture:created', imageKey, texture)
                }
            }
        })
    }


    static #getMaterialKey (imageKey, options) {
        const optionsHash = JSON.stringify(options)
        return `${imageKey}:${optionsHash}`
    }


    #initEvents () {
        this.#spritesheets.on('clear', () => {
            this.#textures.clear()
            this.#materials.clear()
        })
    }

}
