export default class TextureRegion {

    constructor (options = {}) {
        this.image = options.image || null
        this.x = options.x ?? 0
        this.y = options.y ?? 0
        this.width = options.width ?? getImageWidth(this.image)
        this.height = options.height ?? getImageHeight(this.image)
    }


    get u0 () {
        if (!this.image || !this.image.width) {
            return 0
        }
        return this.x / this.image.width
    }


    get v0 () {
        if (!this.image || !this.image.height) {
            return 0
        }
        return this.y / this.image.height
    }


    get u1 () {
        if (!this.image || !this.image.width) {
            return 1
        }
        return (this.x + this.width) / this.image.width
    }


    get v1 () {
        if (!this.image || !this.image.height) {
            return 1
        }
        return (this.y + this.height) / this.image.height
    }


    get uvs () {
        return {
            u0: this.u0,
            v0: this.v0,
            u1: this.u1,
            v1: this.v1
        }
    }


    get bounds () {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        }
    }


    get valid () {
        return this.image !== null && this.width > 0 && this.height > 0
    }


    static fromImage (image) {
        return new TextureRegion({
            image,
            x: 0,
            y: 0,
            width: image?.width || 0,
            height: image?.height || 0
        })
    }


    static fromFrame (image, frame) {
        return new TextureRegion({
            image,
            x: frame.x,
            y: frame.y,
            width: frame.w ?? frame.width,
            height: frame.h ?? frame.height
        })
    }

}


function getImageWidth (image) {
    return image?.width || 0
}


function getImageHeight (image) {
    return image?.height || 0
}
