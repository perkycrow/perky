import Matrix4 from '../math/matrix4.js'
import Vec3 from '../math/vec3.js'


const FACE_DIRS = [
    {target: [1, 0, 0], up: [0, -1, 0]},
    {target: [-1, 0, 0], up: [0, -1, 0]},
    {target: [0, 1, 0], up: [0, 0, 1]},
    {target: [0, -1, 0], up: [0, 0, -1]},
    {target: [0, 0, 1], up: [0, -1, 0]},
    {target: [0, 0, -1], up: [0, -1, 0]}
]


export default class CubeShadowMap {

    #gl = null
    #resolution = 512
    #framebuffer = null
    #depthRenderbuffer = null
    #cubemap = null
    #projection = new Matrix4()
    #views = []
    #dirty = true

    constructor ({gl, resolution = 512}) {
        this.#gl = gl
        this.#resolution = resolution
        this.#createResources()
    }


    get dirty () {
        return this.#dirty
    }


    markDirty () {
        this.#dirty = true
    }


    markClean () {
        this.#dirty = false
    }


    get texture () {
        return this.#cubemap
    }


    get resolution () {
        return this.#resolution
    }


    update (lightPosition, far) {
        const fov = Math.PI / 2
        this.#projection.makePerspective(fov, 1, 0.1, far)

        this.#views = FACE_DIRS.map(({target, up}) => {
            const view = new Matrix4()
            view.makeLookAt(
                lightPosition,
                new Vec3(
                    lightPosition.x + target[0],
                    lightPosition.y + target[1],
                    lightPosition.z + target[2]
                ),
                new Vec3(up[0], up[1], up[2])
            )
            return view
        })
    }


    get projection () {
        return this.#projection
    }


    getView (faceIndex) {
        return this.#views[faceIndex]
    }


    beginFace (faceIndex) {
        const gl = this.#gl
        const size = this.#resolution

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.#framebuffer)
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_CUBE_MAP_POSITIVE_X + faceIndex,
            this.#cubemap, 0
        )
        gl.viewport(0, 0, size, size)
        gl.drawBuffers([gl.COLOR_ATTACHMENT0])
        gl.clearColor(1.0, 1.0, 1.0, 1.0)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT) // eslint-disable-line no-bitwise -- clean
        gl.clearColor(0.0, 0.0, 0.0, 0.0)
    }


    end () {
        this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, null)
    }


    dispose () {
        const gl = this.#gl
        if (this.#framebuffer) {
            gl.deleteFramebuffer(this.#framebuffer)
        }
        if (this.#cubemap) {
            gl.deleteTexture(this.#cubemap)
        }
        if (this.#depthRenderbuffer) {
            gl.deleteRenderbuffer(this.#depthRenderbuffer)
        }
        this.#gl = null
    }


    #createResources () {
        const gl = this.#gl
        const size = this.#resolution

        this.#cubemap = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.#cubemap)

        for (let i = 0; i < 6; i++) {
            gl.texImage2D(
                gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.R32F,
                size, size, 0, gl.RED, gl.FLOAT, null
            )
        }

        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

        this.#depthRenderbuffer = gl.createRenderbuffer()
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.#depthRenderbuffer)
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT24, size, size)

        this.#framebuffer = gl.createFramebuffer()
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.#framebuffer)
        gl.framebufferRenderbuffer(
            gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
            gl.RENDERBUFFER, this.#depthRenderbuffer
        )
        gl.drawBuffers([gl.COLOR_ATTACHMENT0])

        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null)
        gl.bindRenderbuffer(gl.RENDERBUFFER, null)
    }

}
