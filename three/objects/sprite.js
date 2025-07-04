import {Sprite as OriginalSprite, Texture as OriginalTexture} from 'three'
import SpriteMaterial from '../materials/sprite_material.js'


export default class Sprite extends OriginalSprite {

    constructor (params = {}) { // eslint-disable-line complexity
        let {
            material,
            source,
            image,
            texture,
            ...materialParams
        } = params

        if (material) {
            super(material)
        } else {
            const textureParam = texture || source || image

            let textureConfig = null
            if (textureParam) {
                if (textureParam instanceof OriginalTexture) {
                    textureConfig = textureParam
                } else if (typeof textureParam === 'object' && textureParam.constructor === Object) {
                    textureConfig = textureParam
                } else {
                    textureConfig = {source: textureParam}
                }
            }

            const spriteMaterial = new SpriteMaterial({
                ...(textureConfig && {texture: textureConfig}),
                ...materialParams
            })

            super(spriteMaterial)
        }
    }

}
