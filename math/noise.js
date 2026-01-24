/* eslint-disable no-bitwise -- clean */

export default class Noise {

    #perm = []
    #gradP = []

    constructor (seed = 0) {
        this.seed(seed)
    }


    seed (seed) {
        const p = buildPermutation(seed)
        this.#perm = new Array(512)
        this.#gradP = new Array(512)

        for (let i = 0; i < 256; i++) {
            this.#perm[i] = p[i]
            this.#perm[i + 256] = p[i]
            this.#gradP[i] = GRAD3[p[i] % 12]
            this.#gradP[i + 256] = GRAD3[p[i] % 12]
        }

        return this
    }


    perlin (x, y = 0, z = 0) {
        const X = Math.floor(x) & 255
        const Y = Math.floor(y) & 255
        const Z = Math.floor(z) & 255

        x -= Math.floor(x)
        y -= Math.floor(y)
        z -= Math.floor(z)

        const u = fade(x)
        const v = fade(y)
        const w = fade(z)

        const A = this.#perm[X] + Y
        const AA = this.#perm[A] + Z
        const AB = this.#perm[A + 1] + Z
        const B = this.#perm[X + 1] + Y
        const BA = this.#perm[B] + Z
        const BB = this.#perm[B + 1] + Z

        return lerp(
            lerp(
                lerp(
                    dot(this.#gradP[AA], x, y, z),
                    dot(this.#gradP[BA], x - 1, y, z),
                    u
                ),
                lerp(
                    dot(this.#gradP[AB], x, y - 1, z),
                    dot(this.#gradP[BB], x - 1, y - 1, z),
                    u
                ),
                v
            ),
            lerp(
                lerp(
                    dot(this.#gradP[AA + 1], x, y, z - 1),
                    dot(this.#gradP[BA + 1], x - 1, y, z - 1),
                    u
                ),
                lerp(
                    dot(this.#gradP[AB + 1], x, y - 1, z - 1),
                    dot(this.#gradP[BB + 1], x - 1, y - 1, z - 1),
                    u
                ),
                v
            ),
            w
        )
    }


    perlin2d (x, y) {
        return this.perlin(x, y, 0)
    }


    fbm (x, y, {octaves = 4, lacunarity = 2, persistence = 0.5} = {}) {
        let value = 0
        let amplitude = 1
        let frequency = 1
        let maxValue = 0

        for (let i = 0; i < octaves; i++) {
            value += this.perlin2d(x * frequency, y * frequency) * amplitude
            maxValue += amplitude
            amplitude *= persistence
            frequency *= lacunarity
        }

        return value / maxValue
    }

}


const GRAD3 = [
    [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
    [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
    [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
]


function fade (t) {
    return t * t * t * (t * (t * 6 - 15) + 10)
}


function lerp (a, b, t) {
    return a + t * (b - a)
}


function dot (grad, x, y, z) {
    return grad[0] * x + grad[1] * y + grad[2] * z
}


function buildPermutation (seed) {
    const p = []
    for (let i = 0; i < 256; i++) {
        p[i] = i
    }

    let n = seed
    for (let i = 255; i > 0; i--) {
        n = (n * 16807) % 2147483647
        const j = n % (i + 1)
        const tmp = p[i]
        p[i] = p[j]
        p[j] = tmp
    }

    return p
}
