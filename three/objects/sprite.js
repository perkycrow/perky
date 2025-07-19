import {Sprite as OriginalSprite, Texture as OriginalTexture} from 'three'
import SpriteMaterial from '../materials/sprite_material.js'


export default class Sprite extends OriginalSprite {

    constructor (params = {}) { // eslint-disable-line complexity
        const {spritesheet, frame, ...otherParams} = params
        
        if (spritesheet && frame) {
            const material = createSpritesheetMaterial(spritesheet, frame, otherParams)
            
            super(material)
            
            if (material) {
                this.threeSpritesheet = spritesheet
                this.currentFrame = frame
            }
        } else {
            const material = createClassicMaterial(otherParams)
            super(material)
        }
    }


    setFrame (frameId) {
        if (!this.threeSpritesheet) {
            console.warn('Cannot set frame: sprite was not created from a spritesheet')
            return this
        }
        
        if (!this.threeSpritesheet.hasFrame(frameId)) {
            console.warn(`Frame ${frameId} not found in spritesheet`)
            return this
        }
        
        const frameTexture = this.threeSpritesheet.getFrameTexture(frameId)
        this.material.map = frameTexture
        this.material.needsUpdate = true
        this.currentFrame = frameId
        
        return this
    }


    getFrame () {
        return this.currentFrame || null
    }


    getSpritesheet () {
        return this.threeSpritesheet || null
    }


    hasFrame (frameId) {
        if (!this.threeSpritesheet) {
            return false
        }
        
        return this.threeSpritesheet.hasFrame(frameId)
    }


    getFrameNames () {
        if (!this.threeSpritesheet) {
            return []
        }

        return this.threeSpritesheet.getFrameNames()
    }

}


function createSpritesheetMaterial (threeSpritesheet, frame, otherParams) {
    if (!threeSpritesheet || typeof threeSpritesheet.getFrameMaterial !== 'function') {
        console.warn('Invalid ThreeSpritesheet provided')
        return null
    }
    
    const material = threeSpritesheet.getFrameMaterial(frame, otherParams)
    
    if (!material) {
        console.warn(`Frame ${frame} not found in spritesheet`)
        return null
    }
    
    return material
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
