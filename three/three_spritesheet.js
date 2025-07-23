import PerkyModule from '../core/perky_module.js'
import Registry from '../core/registry.js'
import SpriteTexture from './textures/sprite_texture.js'
import SpriteMaterial from './materials/sprite_material.js'


export default class ThreeSpritesheet extends PerkyModule {

    constructor (spritesheet) {
        super()
        
        this.spritesheet = spritesheet
        this.textures = new Registry()
        
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


    createSpriteMaterial (frameId, options = {}) {
        const frame = this.getFrame(frameId)
        if (!frame) {
            return null
        }
        
        const imageKey = frame.baseImage
        const baseTexture = this.getTexture(imageKey)
        if (!baseTexture) {
            return null
        }
        
        // Clone the texture for this specific sprite to have independent UV mapping
        const frameTexture = baseTexture.clone()
        frameTexture.needsUpdate = true
        
        // Create a new material for this sprite with its own texture
        const material = new SpriteMaterial({
            map: frameTexture,
            ...options
        })
        
        // Configure UV mapping for this specific frame
        ThreeSpritesheet.#applyFrameUVMapping(frameTexture, frame)
        
        this.emit('material:created', frameId, material, options)
        
        return material
    }
    
    
    updateSpriteFrame (sprite, frameId) {
        if (!sprite.material || !sprite.material.map) {
            return false
        }
        
        const frame = this.getFrame(frameId)
        if (!frame) {
            return false
        }
        
        const newImageKey = frame.baseImage
        const baseTexture = this.getTexture(newImageKey)
        if (!baseTexture) {
            return false
        }
        
        // Always clone texture to maintain independent UV mapping per sprite
        const newFrameTexture = baseTexture.clone()
        newFrameTexture.needsUpdate = true
        
        // Dispose old texture to avoid memory leaks
        if (sprite.material.map) {
            sprite.material.map.dispose()
        }
        
        // Update material with new cloned texture
        sprite.material.map = newFrameTexture
        sprite.material.needsUpdate = true
        
        // Update UV mapping for the frame
        ThreeSpritesheet.#applyFrameUVMapping(newFrameTexture, frame)
        
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




}
