import Object2D from './object_2d'


export default class Image2D extends Object2D {
    constructor (options = {}) {
        super(options)
        
        const {
            image = null,
            width = 100,
            height = 100
        } = options
        
        this.userData.image = image
        this.userData.width = width
        this.userData.height = height
        this.userData.renderType = 'image'
    }


    setImage (image) {
        this.userData.image = image
        return this
    }


    setSize (width, height = width) {
        this.userData.width = width
        this.userData.height = height
        return this
    }

}
