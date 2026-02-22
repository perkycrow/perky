export default class LightDataTexture {

    #gl = null
    #texture = null
    #capacity = 256
    #buffer = null

    constructor (gl, options = {}) {
        this.#gl = gl
        this.#capacity = options.capacity ?? 256
        this.#buffer = new Float32Array(this.#capacity * 8)
        this.#createTexture()
    }


    get texture () {
        return this.#texture
    }


    get capacity () {
        return this.#capacity
    }


    update (lights, cameraPosition) {
        const count = Math.min(lights.length, this.#capacity)

        if (count === 0) {
            return 0
        }

        const sorted = sortByDistance(lights, cameraPosition)
        const buffer = this.#buffer

        for (let i = 0; i < count; i++) {
            const light = sorted[i].light
            const offset = i * 8
            buffer[offset] = light.position.x
            buffer[offset + 1] = light.position.y
            buffer[offset + 2] = light.position.z
            buffer[offset + 3] = light.intensity
            buffer[offset + 4] = light.color[0]
            buffer[offset + 5] = light.color[1]
            buffer[offset + 6] = light.color[2]
            buffer[offset + 7] = light.radius
        }

        const gl = this.#gl
        gl.bindTexture(gl.TEXTURE_2D, this.#texture)
        gl.texSubImage2D(
            gl.TEXTURE_2D, 0, 0, 0,
            2, count,
            gl.RGBA, gl.FLOAT,
            buffer.subarray(0, count * 8)
        )
        gl.bindTexture(gl.TEXTURE_2D, null)

        return count
    }


    dispose () {
        const gl = this.#gl
        if (this.#texture) {
            gl.deleteTexture(this.#texture)
            this.#texture = null
        }
        this.#buffer = null
        this.#gl = null
    }


    #createTexture () {
        const gl = this.#gl

        this.#texture = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D, this.#texture)
        gl.texImage2D(
            gl.TEXTURE_2D, 0, gl.RGBA32F,
            2, this.#capacity, 0,
            gl.RGBA, gl.FLOAT, null
        )
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

        gl.bindTexture(gl.TEXTURE_2D, null)
    }

}


function sortByDistance (lights, cameraPosition) {
    return lights
        .map(light => ({
            light,
            dist: (light.position.x - cameraPosition.x) ** 2
                + (light.position.y - cameraPosition.y) ** 2
                + (light.position.z - cameraPosition.z) ** 2
        }))
        .sort((a, b) => a.dist - b.dist)
}
