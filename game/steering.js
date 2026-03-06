import Component from './component.js'
import Vec2 from '../math/vec2.js'


export default class Steering extends Component {

    constructor (options = {}) {
        super(options)

        this.force = new Vec2()
        this.wanderAngle = Math.random() * Math.PI * 2
    }


    onInstall (host) {
        this.delegateTo(host, ['seek', 'flee', 'arrive', 'wander', 'separate', 'addForce', 'resolveForce'])
    }


    seek (target, weight = 1) {
        const pos = this.host.position
        const dx = target.x - pos.x
        const dy = target.y - pos.y
        const len = Math.sqrt(dx * dx + dy * dy)

        if (len > 0) {
            this.force.x += (dx / len) * weight
            this.force.y += (dy / len) * weight
        }
    }


    flee (target, weight = 1) {
        const pos = this.host.position
        const dx = pos.x - target.x
        const dy = pos.y - target.y
        const len = Math.sqrt(dx * dx + dy * dy)

        if (len > 0) {
            this.force.x += (dx / len) * weight
            this.force.y += (dy / len) * weight
        }
    }


    arrive (target, weight = 1, slowRadius = 1) {
        const pos = this.host.position
        const dx = target.x - pos.x
        const dy = target.y - pos.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist > 0) {
            const factor = dist < slowRadius ? dist / slowRadius : 1
            this.force.x += (dx / dist) * weight * factor
            this.force.y += (dy / dist) * weight * factor
        }
    }


    wander (weight = 1, jitter = 0.5) {
        this.wanderAngle += (Math.random() - 0.5) * jitter
        this.force.x += Math.cos(this.wanderAngle) * weight
        this.force.y += Math.sin(this.wanderAngle) * weight
    }


    separate (neighbors, weight = 1, radius = 1) {
        const pos = this.host.position
        let sx = 0
        let sy = 0
        let count = 0

        for (const other of neighbors) {
            if (other === this.host) {
                continue
            }

            const dx = pos.x - other.x
            const dy = pos.y - other.y
            const distSq = dx * dx + dy * dy

            if (distSq > 0 && distSq < radius * radius) {
                const dist = Math.sqrt(distSq)
                sx += (dx / dist) / dist
                sy += (dy / dist) / dist
                count++
            }
        }

        if (count > 0) {
            this.force.x += (sx / count) * weight
            this.force.y += (sy / count) * weight
        }
    }


    addForce (direction, weight = 1) {
        this.force.x += direction.x * weight
        this.force.y += direction.y * weight
    }


    resolveForce () {
        const result = this.force.clone()
        const len = result.length()

        if (len > 1) {
            result.divideScalar(len)
        }

        this.force.set(0, 0)
        return result
    }

}
