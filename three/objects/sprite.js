import {Sprite as OriginalSprite, Texture as OriginalTexture} from 'three'
import SpriteMaterial from '../materials/sprite_material.js'
import SpriteSheetManager from '../spritesheet_manager.js'


export default class Sprite extends OriginalSprite {

    constructor (params = {}) { // eslint-disable-line complexity
        const {spritesheet, frame, ...otherParams} = params
        
        if (spritesheet && frame) {
            const material = createSpritesheetMaterial(spritesheet, frame, otherParams)
            
            super(material)
            
            if (material) {
                this.spritesheetId = spritesheet
                this.currentFrame = frame
            }
        } else {
            const material = createClassicMaterial(otherParams)
            super(material)
        }
    }


    setFrame (frameId) {
        if (!this.spritesheetId) {
            console.warn('Cannot set frame: sprite was not created from a spritesheet')
            return this
        }
        
        const manager = SpriteSheetManager.getInstance()
        const frameTexture = manager.createFrameTexture(this.spritesheetId, frameId)
        
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
        if (!this.spritesheetId) {
            return false
        }
        
        const manager = SpriteSheetManager.getInstance()
        return manager.hasFrame(this.spritesheetId, frameId)
    }


    getFrameNames () {
        if (!this.spritesheetId) {
            return []
        }

        const manager = SpriteSheetManager.getInstance()
        return manager.getFrameNames(this.spritesheetId)
    }

}


function createSpritesheetMaterial (spritesheet, frame, otherParams) {
    const manager = SpriteSheetManager.getInstance()
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
