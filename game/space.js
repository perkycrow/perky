import PerkyModule from '../core/perky_module.js'


export default class Space extends PerkyModule {

    static $category = 'space'
    static $bind = 'space'

    #entities = new Set()
    #disposeCallbacks = new Map()

    add (entity) {
        if (this.#entities.has(entity)) {
            return entity
        }

        const callback = () => {
            this.#entities.delete(entity)
            this.#disposeCallbacks.delete(entity)
        }

        this.#entities.add(entity)
        this.#disposeCallbacks.set(entity, callback)
        this.listenTo(entity, 'dispose', callback)

        return entity
    }


    remove (entity) {
        if (!this.#entities.has(entity)) {
            return false
        }

        const callback = this.#disposeCallbacks.get(entity)
        entity.off('dispose', callback)
        this.#disposeCallbacks.delete(entity)
        this.#entities.delete(entity)

        return true
    }


    has (entity) {
        return this.#entities.has(entity)
    }


    clear () {
        for (const entity of Array.from(this.#entities)) {
            this.remove(entity)
        }
    }


    get entities () {
        return Array.from(this.#entities)
    }


    get size () {
        return this.#entities.size
    }


    nearest (from, range, filter) {
        const origin = positionOf(from)
        const exclude = excludeFrom(from)
        const rangeSq = range * range
        let best = null
        let bestDistSq = rangeSq

        for (const other of this.#entities) {
            if (other === exclude) {
                continue
            }

            if (filter && !filter(other)) {
                continue
            }

            const distSq = distanceToSquared(origin, other.position)

            if (distSq < bestDistSq) {
                bestDistSq = distSq
                best = other
            }
        }

        return best
    }


    entitiesInRange (from, range, filter) {
        const origin = positionOf(from)
        const exclude = excludeFrom(from)
        const rangeSq = range * range
        const results = []

        for (const other of this.#entities) {
            if (other === exclude) {
                continue
            }

            if (filter && !filter(other)) {
                continue
            }

            if (distanceToSquared(origin, other.position) < rangeSq) {
                results.push(other)
            }
        }

        return results
    }


    checkHit (entity, filter) {
        const entityRadius = radiusOf(entity)

        if (entityRadius <= 0) {
            return null
        }

        for (const other of this.#entities) {
            if (other === entity) {
                continue
            }

            if (filter && !filter(other)) {
                continue
            }

            const otherRadius = radiusOf(other)

            if (otherRadius <= 0) {
                continue
            }

            const threshold = entityRadius + otherRadius

            if (entity.position.distanceToSquared(other.position) < threshold * threshold) {
                return other
            }
        }

        return null
    }

}


function positionOf (fromOrPoint) {
    return fromOrPoint.position || fromOrPoint
}


function excludeFrom (fromOrPoint) {
    return fromOrPoint.position ? fromOrPoint : null
}


function radiusOf (entity) {
    return entity?.hitbox?.radius ?? 0
}


function distanceToSquared (a, b) {
    const dx = a.x - b.x
    const dy = a.y - b.y
    return dx * dx + dy * dy
}
