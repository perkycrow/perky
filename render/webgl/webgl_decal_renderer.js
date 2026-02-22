import WebGLObjectRenderer from './webgl_object_renderer.js'
import Decal from '../decal.js'
import Geometry from '../geometry.js'
import Mesh from '../mesh.js'
import Matrix4 from '../../math/matrix4.js'
import {DECAL_SHADER_DEF} from '../shaders/builtin/decal_shader.js'


export default class WebGLDecalRenderer extends WebGLObjectRenderer {

    #program = null
    #quadMesh = null
    #camera3d = null
    #fogNear = 20
    #fogFar = 80
    #fogColor = [0.0, 0.0, 0.0]
    #modelMatrix = new Matrix4()
    #scaleMatrix = new Matrix4()

    static get handles () {
        return [Decal]
    }


    get camera3d () {
        return this.#camera3d
    }


    set camera3d (camera) {
        this.#camera3d = camera
    }


    get fogNear () {
        return this.#fogNear
    }


    set fogNear (value) {
        this.#fogNear = value
    }


    get fogFar () {
        return this.#fogFar
    }


    set fogFar (value) {
        this.#fogFar = value
    }


    get fogColor () {
        return this.#fogColor
    }


    set fogColor (value) {
        this.#fogColor = value
    }


    init (context) {
        super.init(context)
        this.#program = context.shaderRegistry.register('decal', DECAL_SHADER_DEF)
        this.#quadMesh = createQuadMesh(context.gl)
    }


    flush () {
        if (this.collected.length === 0 || !this.#camera3d) {
            return
        }

        const gl = this.gl
        const sorted = this.#sortBackToFront()

        gl.enable(gl.DEPTH_TEST)
        gl.depthFunc(gl.LEQUAL)
        gl.depthMask(false)
        gl.enable(gl.POLYGON_OFFSET_FILL)
        gl.polygonOffset(-1, -1)
        gl.enable(gl.BLEND)
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

        this.#setupUniforms(gl)

        for (const {object} of sorted) {
            this.#drawDecal(gl, object)
        }

        gl.disable(gl.BLEND)
        gl.disable(gl.POLYGON_OFFSET_FILL)
        gl.depthMask(true)
        gl.disable(gl.DEPTH_TEST)
    }


    dispose () {
        if (this.#quadMesh) {
            this.#quadMesh.dispose()
            this.#quadMesh = null
        }
        this.#program = null
        this.#camera3d = null
        super.dispose()
    }


    #sortBackToFront () {
        const cam = this.#camera3d.position
        return [...this.collected].sort((a, b) => {
            const ax = a.object.position.x - cam.x
            const ay = a.object.position.y - cam.y
            const az = a.object.position.z - cam.z
            const bx = b.object.position.x - cam.x
            const by = b.object.position.y - cam.y
            const bz = b.object.position.z - cam.z
            return (bx * bx + by * by + bz * bz) - (ax * ax + ay * ay + az * az)
        })
    }


    #setupUniforms (gl) {
        const u = this.#program.uniforms

        gl.useProgram(this.#program.program)

        gl.uniformMatrix4fv(u.uProjection, false, this.#camera3d.projectionMatrix.elements)
        gl.uniformMatrix4fv(u.uView, false, this.#camera3d.viewMatrix.elements)

        gl.uniform1f(u.uFogNear, this.#fogNear)
        gl.uniform1f(u.uFogFar, this.#fogFar)
        gl.uniform3fv(u.uFogColor, this.#fogColor)

        gl.uniform1f(u.uHasTexture, 0)
        gl.uniform3f(u.uColor, 1, 1, 1)
        gl.uniform3f(u.uEmissive, 0, 0, 0)
        gl.uniform1f(u.uOpacity, 1)

        gl.activeTexture(gl.TEXTURE0)
        gl.uniform1i(u.uTexture, 0)
    }


    #drawDecal (gl, decal) {
        const u = this.#program.uniforms

        this.#uploadModelMatrix(gl, decal)

        if (decal.material) {
            this.#applyMaterial(gl, decal.material)
        }

        const texture = decal.material?.texture ?? null
        if (texture) {
            gl.bindTexture(gl.TEXTURE_2D, this.context.textureManager.acquire(texture))
            gl.uniform1f(u.uHasTexture, 1)
        }

        this.#quadMesh.draw()

        if (texture) {
            this.context.textureManager.release(texture)
            gl.uniform1f(u.uHasTexture, 0)
        }

        if (decal.material) {
            this.#resetMaterial(gl)
        }
    }


    #uploadModelMatrix (gl, decal) {
        this.#scaleMatrix.makeScale(decal.width, decal.height, 1)
        this.#modelMatrix.multiplyMatrices(decal.worldMatrix, this.#scaleMatrix)
        gl.uniformMatrix4fv(this.#program.uniforms.uModel, false, this.#modelMatrix.elements)
    }


    #applyMaterial (gl, material) {
        const u = this.#program.uniforms
        gl.uniform3fv(u.uColor, material.color)
        gl.uniform3fv(u.uEmissive, material.emissive)
        gl.uniform1f(u.uOpacity, material.opacity)
    }


    #resetMaterial (gl) {
        const u = this.#program.uniforms
        gl.uniform3f(u.uColor, 1, 1, 1)
        gl.uniform3f(u.uEmissive, 0, 0, 0)
        gl.uniform1f(u.uOpacity, 1)
    }

}


function createQuadMesh (gl) {
    const geo = new Geometry({
        positions: [
            -0.5, -0.5, 0,
            0.5, -0.5, 0,
            0.5, 0.5, 0,
            -0.5, 0.5, 0
        ],
        normals: [
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1
        ],
        uvs: [
            0, 0,
            1, 0,
            1, 1,
            0, 1
        ],
        indices: [0, 1, 2, 0, 2, 3]
    })
    return new Mesh(gl, geo)
}
