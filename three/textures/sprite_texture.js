import Texture from './texture.js'
import {SRGBColorSpace, LinearMipmapLinearFilter, LinearFilter} from 'three'


export default class SpriteTexture extends Texture {

    constructor (params = {}) { // eslint-disable-line complexity
        let {
            image,
            source,
            generateMipmaps = true,
            anisotropy = false,
            minFilter,
            magFilter,
            colorSpace = SRGBColorSpace,
            ...otherParams
        } = params

        const textureImage = image ?? source

        if (generateMipmaps && minFilter === undefined) {
            minFilter = LinearMipmapLinearFilter
        }

        if (generateMipmaps && magFilter === undefined) {
            magFilter = LinearFilter
        }

        super({
            image: textureImage,
            colorSpace,
            generateMipmaps,
            minFilter,
            magFilter,
            anisotropy: anisotropy || undefined,
            ...otherParams
        })

        this.needsUpdate = true
    }

}
