import {Vector2} from 'three'


/**
 * Enhanced 2D vector class extending Three.js Vector2 with flexible constructor options.
 * Supports individual values, object notation, and array notation initialization.
 * Inherits all methods from Three.js Vector2 (add, subtract, multiply, normalize, etc.).
 *
 * @extends {Vector2}
 * @see {@link https://threejs.org/docs/?q=Vec#api/en/math/Vector2}
 * @example
 * // Individual values
 * const vec1 = new Vec2(10, 20)
 * 
 * // Object notation
 * const vec2 = new Vec2({x: 10, y: 20})
 * 
 * // Array notation
 * const vec3 = new Vec2([10, 20])
 * 
 * // All Three.js Vector2 methods are available
 * vec1.add(vec2)
 * vec1.multiplyScalar(2)
 * vec1.normalize()
 * 
 * // Common operations
 * const distance = vec1.distanceTo(vec2)
 * const angle = vec1.angle()
 * const length = vec1.length()
 */
export default class Vec2 extends Vector2 {

    /**
     * Creates a new Vec2 instance with flexible input options.
     * 
     * @param {number|{x: number, y: number}|number[]} params - The initialization parameter:
     *   - number: x coordinate (requires second parameter for y)
     *   - object: {x: number, y: number} coordinate object
     *   - array: [x, y] coordinate array
     * @param {...number} args - Additional arguments when params is a number (y coordinate)
     * 
     * @example
     * new Vec2(10, 20)           // Individual values
     * new Vec2({x: 10, y: 20})   // Object notation
     * new Vec2([10, 20])         // Array notation
     */
    constructor (params, ...args) {
        if (typeof params === 'object') {
            if (Array.isArray(params)) {
                super(...params)
            } else {
                super(params.x, params.y)
            }
        } else {
            super(params, ...args)
        }
    }
}
