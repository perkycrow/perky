import {Sprite as OriginalSprite, Texture as OriginalTexture} from 'three'
import SpriteMaterial from '../materials/sprite_material.js'


export default class Sprite extends OriginalSprite {

    static #defaultManager = null
    #manager = null
    
    static setDefaultSpriteSheetManager (manager) {
        Sprite.#defaultManager = manager
    }
    
    static getDefaultSpriteSheetManager () {
        return Sprite.#defaultManager
    }

    constructor (params = {}) { // eslint-disable-line complexity
        const {spritesheet, frame, spritesheetManager, ...otherParams} = params
        
        if (spritesheet && frame) {
            const manager = spritesheetManager || Sprite.#defaultManager
            const material = createSpritesheetMaterial(spritesheet, frame, otherParams, manager)
            
            super(material)
            
            if (material) {
                this.spritesheetId = spritesheet
                this.currentFrame = frame
                this.#manager = manager
            }
        } else {
            const material = createClassicMaterial(otherParams)
            super(material)
        }
    }


    setFrame (frameId) {
        if (!this.spritesheetId || !this.#manager) {
            console.warn('Cannot set frame: sprite was not created from a spritesheet or manager not available')
            return this
        }
        
        const frameTexture = this.#manager.createFrameTexture(this.spritesheetId, frameId)
        
        if (!frameTexture) {
            console.warn(`Frame ${frameId} not found in spritesheet ${this.spritesheetId}`)
            return this
        }
        
        this.material.map = frameTexture
        this.material.needsUpdate = true
        this.currentFrame = frameId
        
        return this
    }


    getFrame () {
        return this.currentFrame || null
    }


    getSpritesheet () {
        return this.spritesheetId || null
    }


    hasFrame (frameId) {
        if (!this.spritesheetId || !this.#manager) {
            return false
        }
        
        return this.#manager.hasFrame(this.spritesheetId, frameId)
    }


    getFrameNames () {
        if (!this.spritesheetId || !this.#manager) {
            return []
        }

        return this.#manager.getFrameNames(this.spritesheetId)
    }

}


function createSpritesheetMaterial (spritesheet, frame, otherParams, manager) {
    if (!manager) {
        console.warn('SpriteSheetManager not available')
        return null
    }
    
    const frameTexture = manager.createFrameTexture(spritesheet, frame)
    
    if (!frameTexture) {
        console.warn(`Frame ${frame} not found in spritesheet ${spritesheet}`)
        return null
    }
    
    return new SpriteMaterial({
        texture: frameTexture,
        ...otherParams
    })
}


function createTextureConfig (textureParam) {
    if (!textureParam) {
        return null
    }
    
    if (textureParam instanceof OriginalTexture) {
        return textureParam
    }
    
    if (typeof textureParam === 'object' && textureParam.constructor === Object) {
        return textureParam
    }
    
    return {source: textureParam}
}


function createClassicMaterial (params) {
    let {
        material,
        source,
        image,
        texture,
        ...materialParams
    } = params

    if (material) {
        return material
    }

    const textureParam = texture || source || image
    const textureConfig = createTextureConfig(textureParam)

    return new SpriteMaterial({
        ...(textureConfig && {texture: textureConfig}),
        ...materialParams
    })
}
