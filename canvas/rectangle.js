import Object2D from './object_2d'


export default class Rectangle extends Object2D {
    constructor (options = {}) {
        super(options)
        
        const {
            width = 100,
            height = 100,
            color = '#4444ff',
            strokeColor = '#333333',
            strokeWidth = 2
        } = options
        
        this.userData.width = width
        this.userData.height = height
        this.userData.color = color
        this.userData.strokeColor = strokeColor
        this.userData.strokeWidth = strokeWidth
    }


    setSize (width, height = width) {
        this.userData.width = width
        this.userData.height = height
        return this
    }


    setColor (color) {
        this.userData.color = color
        return this
    }

}
