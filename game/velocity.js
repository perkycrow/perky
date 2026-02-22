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
        this.delegateTo(host, ['applyVelocity', 'clampVelocity'])
    }


    applyVelocity (deltaTime) {
        this.host.position.add(this.vec2.clone().multiplyScalar(deltaTime))
    }


    clampVelocity (maxSpeed) {
        if (this.vec2.length() > maxSpeed) {
            this.vec2.normalize().multiplyScalar(maxSpeed)
        }

        if (this.vec2.length() < 0.01) {
            this.vec2.set(0, 0)
        }
    }

}
