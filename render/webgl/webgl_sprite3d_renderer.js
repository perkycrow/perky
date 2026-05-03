import WebGLObjectRenderer from './webgl_object_renderer.js'
import Sprite3D from '../sprite_3d.js'
import Geometry from '../geometry.js'
import Mesh from '../mesh.js'
import {SPRITE3D_GBUFFER_SHADER_DEF} from '../shaders/builtin/sprite3d_gbuffer_shader.js'


export default class WebGLSprite3DRenderer extends WebGLObjectRenderer {

    #gbufferProgram = null
    #quadMesh = null
    #camera3d = null
    #gBuffer = null

    static get handles () {
        return [Sprite3D]
    }


    get camera3d () {
        return this.#camera3d
    }

    set camera3d (camera) {
        this.#camera3d = camera
    }

    get gBuffer () {
        return this.#gBuffer
    }

    set gBuffer (value) {
        this.#gBuffer = value
    }


    init (context) {
        super.init(context)
        this.#gbufferProgram = context.shaderRegistry.register('sprite3dGBuffer', SPRITE3D_GBUFFER_SHADER_DEF)
        this.#quadMesh = createQuadMesh(context.gl)
    }


    flush () {

    }


    flushToGBuffer (gl) {
        if (this.collected.length === 0 || !this.#camera3d || !this.#gBuffer) {
            return
        }

        this.#gBuffer.resume()

        gl.enable(gl.DEPTH_TEST)
        gl.depthFunc(gl.LEQUAL)

        const program = this.#gbufferProgram
        gl.useProgram(program.program)

        gl.uniformMatrix4fv(program.uniforms.uProjection, false, this.#camera3d.projectionMatrix.elements)
        gl.uniformMatrix4fv(program.uniforms.uView, false, this.#camera3d.viewMatrix.elements)

        gl.uniform3f(program.uniforms.uMaterialColor, 1, 1, 1)
        gl.uniform3f(program.uniforms.uMaterialEmissive, 0, 0, 0)
        gl.uniform1f(program.uniforms.uRoughness, 0.8)
        gl.uniform1f(program.uniforms.uSpecular, 0.04)
        gl.uniform1f(program.uniforms.uUnlit, 0)
        gl.uniform1f(program.uniforms.uHasTexture, 0)
        gl.uniform1f(program.uniforms.uAlphaThreshold, 0.5)

        gl.activeTexture(gl.TEXTURE0)
        gl.uniform1i(program.uniforms.uTexture, 0)

        for (const {object, hints} of this.collected) {
            this.#drawSprite3D(gl, program, object, hints)
        }

        this.#gBuffer.end()
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    }


    dispose () {
        if (this.#quadMesh) {
            this.#quadMesh.dispose()
            this.#quadMesh = null
        }
        this.#gbufferProgram = null
        this.#camera3d = null
        this.#gBuffer = null
        super.dispose()
    }


    #drawSprite3D (gl, program, sprite, hints) {
        if (!sprite.visible) {
            return
        }

        const pos = sprite.worldMatrix.elements
        gl.uniform3f(program.uniforms.uCenter, pos[12], pos[13], pos[14])
        gl.uniform2f(program.uniforms.uSize, sprite.width, sprite.height)
        gl.uniform2f(program.uniforms.uAnchor, sprite.anchorX, sprite.anchorY)

        if (hints?.material) {
            const m = hints.material
            gl.uniform3fv(program.uniforms.uMaterialColor, m.color)
            gl.uniform3fv(program.uniforms.uMaterialEmissive, m.emissive)
            gl.uniform1f(program.uniforms.uRoughness, m.roughness)
            gl.uniform1f(program.uniforms.uSpecular, m.specular)
            gl.uniform1f(program.uniforms.uUnlit, m.unlit ? 1 : 0)
        }

        const texture = sprite.activeTexture
        if (texture) {
            gl.bindTexture(gl.TEXTURE_2D, this.context.textureManager.acquire(texture))
            gl.uniform1f(program.uniforms.uHasTexture, 1)
        }

        this.#quadMesh.draw()

        if (texture) {
            this.context.textureManager.release(texture)
            gl.uniform1f(program.uniforms.uHasTexture, 0)
        }

        if (hints?.material) {
            gl.uniform3f(program.uniforms.uMaterialColor, 1, 1, 1)
            gl.uniform3f(program.uniforms.uMaterialEmissive, 0, 0, 0)
            gl.uniform1f(program.uniforms.uRoughness, 0.8)
            gl.uniform1f(program.uniforms.uSpecular, 0.04)
            gl.uniform1f(program.uniforms.uUnlit, 0)
        }
    }

}


function createQuadMesh (gl) {
    const geo = new Geometry({
        positions: [
            0, 0, 0,
            1, 0, 0,
            1, 1, 0,
            0, 1, 0
        ],
        normals: [
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1
        ],
        uvs: [
            0, 1,
            1, 1,
            1, 0,
            0, 0
        ],
        indices: [0, 1, 2, 0, 2, 3]
    })
    return new Mesh({gl, geometry: geo})
}
