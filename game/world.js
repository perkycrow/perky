import PerkyModule from '../core/perky_module.js'


export default class World extends PerkyModule {

    static $category = 'world'

    get entities () {
        return this.childrenByCategory('entity')
    }


    update (deltaTime, context) {
        if (!this.started) {
            return
        }

        this.preUpdate?.(deltaTime, context)

        for (const entity of this.entities) {
            if (entity.started) {
                entity.update(deltaTime)
            }
        }

        this.postUpdate?.(deltaTime, context)
    }


    nearest (entity, range, filter) {
        const rangeSq = range * range
        let best = null
        let bestDistSq = rangeSq

        for (const other of this.entities) {
            if (other === entity) {
                continue
            }

            if (filter && !filter(other)) {
                continue
            }

            const distSq = entity.position.distanceToSquared(other.position)

            if (distSq < bestDistSq) {
                bestDistSq = distSq
                best = other
            }
        }

        return best
    }


    checkHit (entity, filter) {
        for (const other of this.entities) {
            if (other === entity) {
                continue
            }

            if (filter && !filter(other)) {
                continue
            }

            const dist = entity.position.distanceTo(other.position)
            const threshold = (entity.hitRadius || 0) + (other.hitRadius || 0)

            if (dist < threshold) {
                return other
            }
        }

        return null
    }


    entitiesInRange (entity, range, filter) {
        const rangeSq = range * range
        const results = []

        for (const other of this.entities) {
            if (other === entity) {
                continue
            }

            if (filter && !filter(other)) {
                continue
            }

            if (entity.position.distanceToSquared(other.position) < rangeSq) {
                results.push(other)
            }
        }

        return results
    }

}
