import Matrix4 from '../math/matrix4.js'
import Vec3 from '../math/vec3.js'


export default class ShadowMap {

    #gl = null
    #resolution = 1024
    #framebuffer = null
    #depthTexture = null
    #lightProjection = new Matrix4()
    #lightView = new Matrix4()
    #lightMatrix = new Matrix4()

    constructor (options = {}) {
        this.#gl = options.gl
        this.#resolution = options.resolution ?? 1024
        this.#createFramebuffer()
    }


    get texture () {
        return this.#depthTexture
    }


    get resolution () {
        return this.#resolution
    }


    get lightMatrix () {
        return this.#lightMatrix
    }


    get lightProjection () {
        return this.#lightProjection
    }


    get lightView () {
        return this.#lightView
    }


    #createFramebuffer () {
        const gl = this.#gl
        const size = this.#resolution

        this.#depthTexture = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D, this.#depthTexture)
        gl.texImage2D(
            gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT24,
            size, size, 0,
            gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null
        )
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_FUNC, gl.LEQUAL)

        this.#framebuffer = gl.createFramebuffer()
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.#framebuffer)
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
            gl.TEXTURE_2D, this.#depthTexture, 0
        )
        gl.drawBuffers([gl.NONE])
        gl.readBuffer(gl.NONE)

        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        gl.bindTexture(gl.TEXTURE_2D, null)
    }


    update (lightDirection, camera3d, sceneRadius = 20) {
        const dir = new Vec3(lightDirection[0], lightDirection[1], lightDirection[2]).normalize()
        const texelSize = (sceneRadius * 2) / this.#resolution

        const snappedCenter = new Vec3(
            Math.round(camera3d.position.x / texelSize) * texelSize,
            Math.round(camera3d.position.y / texelSize) * texelSize,
            Math.round(camera3d.position.z / texelSize) * texelSize
        )

        const eye = new Vec3(
            snappedCenter.x + dir.x * sceneRadius,
            snappedCenter.y + dir.y * sceneRadius,
            snappedCenter.z + dir.z * sceneRadius
        )

        this.#lightView.makeLookAt(eye, snappedCenter, new Vec3(0, 1, 0))
        this.#lightProjection.makeOrthographic(
            -sceneRadius, sceneRadius,
            -sceneRadius, sceneRadius,
            0.1, sceneRadius * 2
        )

        this.#lightMatrix.copy(this.#lightProjection).multiply(this.#lightView)
    }


    begin () {
        const gl = this.#gl
        const size = this.#resolution
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.#framebuffer)
        gl.viewport(0, 0, size, size)
        gl.clear(gl.DEPTH_BUFFER_BIT)
    }


    end () {
        const gl = this.#gl
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    }


    dispose () {
        const gl = this.#gl
        if (this.#framebuffer) {
            gl.deleteFramebuffer(this.#framebuffer)
            this.#framebuffer = null
        }
        if (this.#depthTexture) {
            gl.deleteTexture(this.#depthTexture)
            this.#depthTexture = null
        }
        this.#gl = null
    }

}
