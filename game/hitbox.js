import Component from './component.js'


export default class Hitbox extends Component {

    static $bind = 'hitbox'
    static $exports = ['radius', 'shape']

    constructor (options = {}) {
        super(options)

        const {radius = 0, shape = 'circle'} = options

        this.radius = radius
        this.shape = shape
    }

}
