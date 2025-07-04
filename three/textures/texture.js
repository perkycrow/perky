import {Texture as OriginalTexture, ClampToEdgeWrapping, LinearFilter, LinearMipmapLinearFilter, RGBAFormat, UnsignedByteType, NoColorSpace, UVMapping} from 'three'


export default class Texture extends OriginalTexture {

    constructor (params) { // eslint-disable-line complexity
        if (typeof params === 'object' && params !== null && arguments.length === 1) {
            let {
                image,
                mapping,
                wrapS,
                wrapT,
                wrap,
                magFilter,
                minFilter,
                filter,
                format,
                type,
                anisotropy,
                colorSpace,
                repeat,
                offset,
                rotation,
                center,
                flipY,
                generateMipmaps,
                premultiplyAlpha
            } = params

            if (wrap !== undefined) {
                wrapS = wrapS ?? wrap
                wrapT = wrapT ?? wrap
            }

            if (filter !== undefined) {
                magFilter = magFilter ?? filter
                minFilter = minFilter ?? filter
            }

            mapping = mapping ?? UVMapping
            wrapS = wrapS ?? ClampToEdgeWrapping
            wrapT = wrapT ?? ClampToEdgeWrapping
            magFilter = magFilter ?? LinearFilter
            minFilter = minFilter ?? LinearMipmapLinearFilter
            format = format ?? RGBAFormat
            type = type ?? UnsignedByteType
            anisotropy = anisotropy ?? 1
            colorSpace = colorSpace ?? NoColorSpace

            super(image, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, colorSpace)

            if (repeat !== undefined) {
                this.repeat.copy(repeat)
            }

            if (offset !== undefined) {
                this.offset.copy(offset)
            }

            if (rotation !== undefined) {
                this.rotation = rotation
            }

            if (center !== undefined) {
                this.center.copy(center)
            }

            if (flipY !== undefined) {
                this.flipY = flipY
            }

            if (generateMipmaps !== undefined) {
                this.generateMipmaps = generateMipmaps
            }

            if (premultiplyAlpha !== undefined) {
                this.premultiplyAlpha = premultiplyAlpha
            }
        } else if (params === null || params === undefined) {
            super()
        } else {
            super(...arguments)
        }
    }

}
