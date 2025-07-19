import PerkyModule from '../core/perky_module.js'
import Registry from '../core/registry.js'
import SpriteTexture from './textures/sprite_texture.js'
import SpriteMaterial from './materials/sprite_material.js'


export default class ThreeSpritesheet extends PerkyModule {

    constructor (spritesheet) {
        super()
        
        this.spritesheet = spritesheet
        this.textures = new Registry()
        this.materials = new Registry()
        
        this.#createTextures()
    }


    getFrame (frameId) {
        return this.spritesheet.getFrame(frameId)
    }


    hasFrame (frameId) {
        return this.spritesheet.hasFrame(frameId)
    }


    getFrameNames () {
        return this.spritesheet.getFrameNames()
    }


    getFrameCount () {
        return this.spritesheet.getFrameCount()
    }


    getImageKeys () {
        return this.spritesheet.getImageKeys()
    }


    getImage (imageKey) {
        return this.spritesheet.getImage(imageKey)
    }


    getTexture (imageKey) {
        return this.textures.get(imageKey)
    }


    getMaterial (imageKey, options = {}) {
        const materialKey = ThreeSpritesheet.#getMaterialKey(imageKey, options)
        
        if (!this.materials.has(materialKey)) {
            const texture = this.getTexture(imageKey)
            if (!texture) {
                return null
            }
            
            const material = new SpriteMaterial({
                map: texture,
                ...options
            })
            
            this.materials.set(materialKey, material)
            this.emit('material:created', imageKey, material, options)
        }
        
        return this.materials.get(materialKey)
    }


    getFrameMaterial (frameId, options = {}) {
        const frame = this.getFrame(frameId)
        if (!frame) {
            return null
        }
        
        const imageKey = frame.baseImage
        const baseTexture = this.getTexture(imageKey)
        if (!baseTexture) {
            return null
        }
        
        const materialKey = ThreeSpritesheet.#getMaterialKey(`frame:${frameId}`, options)
        
        if (!this.materials.has(materialKey)) {
            // Create a material with the shared texture
            const material = new SpriteMaterial({
                map: baseTexture,
                ...options
            })
            
            // Configure UV mapping for this specific frame
            ThreeSpritesheet.#applyFrameUVMapping(material.map, frame)
            
            this.materials.set(materialKey, material)
            this.emit('material:created', frameId, material, options)
        }
        
        return this.materials.get(materialKey)
    }
    
    
    updateSpriteFrame (sprite, frameId) {
        if (!sprite.material || !sprite.material.map) {
            return false
        }
        
        const frame = this.getFrame(frameId)
        if (!frame) {
            return false
        }
        
        // Update UV mapping on the existing texture (shared efficiently)
        ThreeSpritesheet.#applyFrameUVMapping(sprite.material.map, frame)
        
        return true
    }
    
    
    static #applyFrameUVMapping (texture, frame) {
        texture.repeat.set(
            frame.frame.w / texture.image.width,
            frame.frame.h / texture.image.height
        )
        texture.offset.set(
            frame.frame.x / texture.image.width,
            1 - (frame.frame.y + frame.frame.h) / texture.image.height
        )
        texture.needsUpdate = true
    }


    dispose () {
        // Dispose of all textures
        this.textures.forEach(texture => {
            texture.dispose()
        })
        this.textures.clear()
        
        // Dispose of all materials
        this.materials.forEach(material => {
            material.dispose()
        })
        this.materials.clear()
        
        this.emit('disposed')
    }


    #createTextures () {
        const imageKeys = this.getImageKeys()
        
        imageKeys.forEach(imageKey => {
            const image = this.getImage(imageKey)
            if (image) {
                const texture = new SpriteTexture({image})
                this.textures.set(imageKey, texture)
                this.emit('texture:created', imageKey, texture)
            }
        })
    }


    static #getMaterialKey (imageKey, options) {
        const optionsHash = JSON.stringify(options)
        return `${imageKey}:${optionsHash}`
    }

}
