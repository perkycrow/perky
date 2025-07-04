import {SpriteMaterial as OriginalSpriteMaterial, Texture as OriginalTexture} from 'three'
import SpriteTexture from '../textures/sprite_texture'


export default class SpriteMaterial extends OriginalSpriteMaterial {

    constructor (params = {}) { // eslint-disable-line complexity
        let {
            map,
            texture,
            alphaMap,
            color = 0xffffff,
            fog = true,
            rotation = 0,
            sizeAttenuation = true,
            transparent = true,
            ...otherParams
        } = params

        if (!map && texture) {
            if (texture instanceof OriginalTexture) {
                map = texture
            } else if (typeof texture === 'object') {
                map = new SpriteTexture(texture)
            }
        }

        const materialConfig = {
            color,
            fog,
            rotation,
            sizeAttenuation,
            transparent,
            ...otherParams
        }

        if (map !== undefined) {
            materialConfig.map = map
        }

        if (alphaMap !== undefined) {
            materialConfig.alphaMap = alphaMap
        }

        super(materialConfig)
    }

}
