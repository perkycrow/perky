import Object2D from './object_2d'


export default class Circle extends Object2D {
    constructor (options = {}) {
        super(options)
        
        const {
            radius = 50,
            color = '#ff4444',
            strokeColor = '#333333',
            strokeWidth = 2
        } = options
        
        this.userData.radius = radius
        this.userData.color = color
        this.userData.strokeColor = strokeColor
        this.userData.strokeWidth = strokeWidth
    }


    setRadius (radius) {
        this.userData.radius = radius
        return this
    }


    setColor (color) {
        this.userData.color = color
        return this
    }

}
