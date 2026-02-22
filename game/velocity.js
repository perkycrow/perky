import Component from './component.js'
import Vec2 from '../math/vec2.js'


export default class Velocity extends Component {

    constructor (options = {}) {
        super(options)

        const {x = 0, y = 0} = options

        this.vec2 = new Vec2(x, y)
    }


    onInstall (host) {
        this.delegateTo(host, {vec2: 'velocity'})
    }

}
