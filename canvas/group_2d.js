import Object2D from './object_2d'


export default class Group2D extends Object2D {

    constructor (options = {}) {
        super(options)
    }


    addChild (...objects) {
        return this.add(...objects)
    }

}
