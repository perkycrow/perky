import Texture from './texture.js'
import {SRGBColorSpace, LinearMipmapLinearFilter, LinearFilter} from 'three'


export default class SpriteTexture extends Texture {

    constructor (params = {}) { // eslint-disable-line complexity
        let {
            image,
            source,
            frame,
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

        if (frame && textureImage) {
            this.cropFrame(frame)
        }

        this.needsUpdate = true
    }


    cropFrame (frame) {
        if (!this.image || !frame || !frame.frame) {
            return this
        }

        const {x, y, w, h} = frame.frame
        
        this.repeat.set(
            w / this.image.width,
            h / this.image.height
        )
        this.offset.set(
            x / this.image.width,
            1 - (y + h) / this.image.height
        )
        
        this.needsUpdate = true
        return this
    }

}
