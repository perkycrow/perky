import {Sprite as OriginalSprite, Texture as OriginalTexture} from 'three'
import SpriteMaterial from '../materials/sprite_material.js'


export default class Sprite extends OriginalSprite {

    constructor (params = {}) {
        const material = createMaterial(params)
        super(material)
    }

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


function createMaterial (params) {
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
