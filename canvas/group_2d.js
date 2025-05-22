import Object2D from './object_2d'


export default class Group2D extends Object2D {
    constructor (options = {}) {
        super(options)
        this.userData.renderType = null
    }

    addChild (...objects) {
        objects.forEach(obj => this.add(obj))
        return this
    }

}
