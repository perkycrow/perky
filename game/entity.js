import PerkyModule from '../core/perky_module.js'
import Vec2 from '../math/vec2.js'


export default class Entity extends PerkyModule {

    static $category = 'entity'

    constructor (options = {}) {
        super(options)

        const {x = 0, y = 0} = options

        this.position = new Vec2(x, y)
        this.velocity = new Vec2(0, 0)
    }


    get x () {
        return this.position.x
    }


    set x (value) {
        this.position.x = value
    }


    get y () {
        return this.position.y
    }


    set y (value) {
        this.position.y = value
    }


    update () { // eslint-disable-line class-methods-use-this -- clean

    }

}
