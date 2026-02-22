import Vec3 from '../../math/vec3.js'


let active = null


export function getActivePool () {
    return active
}


export default class CSGPool {

    #vectors = []
    #index = 0

    static run (fn) {
        const pool = active || new CSGPool()
        const prev = active
        active = pool
        try {
            return fn()
        } finally {
            active = prev
            if (!prev) {
                pool.reset()
            }
        }
    }


    vec3 (x = 0, y = 0, z = 0) {
        if (this.#index < this.#vectors.length) {
            return this.#vectors[this.#index++].set(x, y, z)
        }

        const v = new Vec3(x, y, z)
        this.#vectors.push(v)
        this.#index++
        return v
    }


    reset () {
        this.#index = 0
    }


    get size () {
        return this.#vectors.length
    }


    get used () {
        return this.#index
    }

}
