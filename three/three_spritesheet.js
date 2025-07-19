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


    getFrameTexture (frameId) {
        const frame = this.getFrame(frameId)
        if (!frame) {
            return null
        }
        
        const imageKey = frame.baseImage
        const texture = this.getTexture(imageKey)
        
        if (!texture) {
            return null
        }
        
        // Clone texture with frame-specific UV mapping
        const frameTexture = texture.clone()
        frameTexture.repeat.set(
            frame.frame.w / texture.image.width,
            frame.frame.h / texture.image.height
        )
        frameTexture.offset.set(
            frame.frame.x / texture.image.width,
            1 - (frame.frame.y + frame.frame.h) / texture.image.height
        )
        frameTexture.needsUpdate = true
        
        return frameTexture
    }


    getFrameMaterial (frameId, options = {}) {
        const frameTexture = this.getFrameTexture(frameId)
        if (!frameTexture) {
            return null
        }
        
        const materialKey = ThreeSpritesheet.#getMaterialKey(`frame:${frameId}`, options)
        
        if (!this.materials.has(materialKey)) {
            const material = new SpriteMaterial({
                map: frameTexture,
                ...options
            })
            
            this.materials.set(materialKey, material)
            this.emit('material:created', frameId, material, options)
        }
        
        return this.materials.get(materialKey)
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
