import WebGLObjectRenderer from './webgl_object_renderer.js'
import MeshInstance from '../mesh_instance.js'
import {MESH_SHADER_DEF} from '../shaders/builtin/mesh_shader.js'
import {DEPTH_SHADER_DEF} from '../shaders/builtin/depth_shader.js'
import LightDataTexture from '../light_data_texture.js'


export default class WebGLMeshRenderer extends WebGLObjectRenderer {

    #meshProgram = null
    #depthProgram = null
    #camera3d = null
    #shadowMap = null
    #lightDirection = [0.5, 1.0, 0.3]
    #ambient = 0.3
    #fogNear = 20
    #fogFar = 80
    #fogColor = [0.0, 0.0, 0.0]
    #lights = []
    #lightDataTexture = null

    static get handles () {
        return [MeshInstance]
    }


    get camera3d () {
        return this.#camera3d
    }


    set camera3d (camera) {
        this.#camera3d = camera
    }


    get lightDirection () {
        return this.#lightDirection
    }


    set lightDirection (dir) {
        this.#lightDirection = dir
    }


    get ambient () {
        return this.#ambient
    }


    set ambient (value) {
        this.#ambient = value
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


    get lights () {
        return this.#lights
    }


    set lights (value) {
        this.#lights = value
    }


    get shadowMap () {
        return this.#shadowMap
    }


    set shadowMap (value) {
        this.#shadowMap = value
    }


    init (context) {
        super.init(context)
        this.#meshProgram = context.shaderRegistry.register('mesh', MESH_SHADER_DEF)
        this.#depthProgram = context.shaderRegistry.register('depth', DEPTH_SHADER_DEF)
        this.#lightDataTexture = new LightDataTexture(context.gl)
    }


    flush () {
        if (this.collected.length === 0 || !this.#camera3d) {
            return
        }

        const gl = this.gl

        gl.enable(gl.DEPTH_TEST)
        gl.depthFunc(gl.LEQUAL)

        if (this.#shadowMap) {
            this.#renderShadowPass(gl)
        }

        gl.clear(gl.DEPTH_BUFFER_BIT)

        const numLights = this.#lightDataTexture.update(this.#lights, this.#camera3d.position, this.#fogFar)
        this.#setupUniforms(gl, numLights)

        for (const {object, hints} of this.collected) {
            this.#drawItem(gl, object, hints)
        }

        gl.disable(gl.DEPTH_TEST)
    }


    dispose () {
        this.#meshProgram = null
        this.#depthProgram = null
        this.#camera3d = null
        this.#shadowMap = null
        this.#lights = []
        if (this.#lightDataTexture) {
            this.#lightDataTexture.dispose()
            this.#lightDataTexture = null
        }
        super.dispose()
    }


    #renderShadowPass (gl) {
        const sm = this.#shadowMap
        sm.update(this.#lightDirection, this.#camera3d)
        sm.begin()

        gl.enable(gl.CULL_FACE)
        gl.cullFace(gl.FRONT)

        const program = this.#depthProgram
        gl.useProgram(program.program)
        gl.uniformMatrix4fv(program.uniforms.uProjection, false, sm.lightProjection.elements)
        gl.uniformMatrix4fv(program.uniforms.uView, false, sm.lightView.elements)

        for (const {object} of this.collected) {
            if (!object.mesh || !object.visible || !object.castShadow) {
                continue
            }
            gl.uniformMatrix4fv(program.uniforms.uModel, false, object.worldMatrix.elements)
            object.mesh.draw()
        }

        gl.disable(gl.CULL_FACE)
        sm.end()
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    }


    #setupUniforms (gl, numLights) {
        const program = this.#meshProgram

        gl.useProgram(program.program)

        gl.uniformMatrix4fv(program.uniforms.uProjection, false, this.#camera3d.projectionMatrix.elements)
        gl.uniformMatrix4fv(program.uniforms.uView, false, this.#camera3d.viewMatrix.elements)
        gl.uniform3fv(program.uniforms.uLightDirection, this.#lightDirection)
        gl.uniform1f(program.uniforms.uAmbient, this.#ambient)
        gl.uniform4f(program.uniforms.uTintColor, 0, 0, 0, 0)
        gl.uniform1f(program.uniforms.uFogNear, this.#fogNear)
        gl.uniform1f(program.uniforms.uFogFar, this.#fogFar)
        gl.uniform3fv(program.uniforms.uFogColor, this.#fogColor)

        gl.uniform3f(program.uniforms.uMaterialColor, 1, 1, 1)
        gl.uniform3f(program.uniforms.uMaterialEmissive, 0, 0, 0)
        gl.uniform1f(program.uniforms.uMaterialOpacity, 1)
        gl.uniform1f(program.uniforms.uUnlit, 0)
        gl.uniform1f(program.uniforms.uHasTexture, 1)
        gl.uniform2f(program.uniforms.uUVScale, 1, 1)
        gl.uniform1f(program.uniforms.uRoughness, 0.5)
        gl.uniform1f(program.uniforms.uSpecular, 0.5)
        gl.uniform3f(
            program.uniforms.uCameraPosition,
            this.#camera3d.position.x,
            this.#camera3d.position.y,
            this.#camera3d.position.z
        )

        gl.uniform1i(program.uniforms.uNumLights, numLights)

        gl.activeTexture(gl.TEXTURE0)
        gl.uniform1i(program.uniforms.uTexture, 0)

        gl.activeTexture(gl.TEXTURE1)
        gl.uniform1i(program.uniforms.uNormalMap, 1)
        gl.uniform1f(program.uniforms.uHasNormalMap, 0)
        gl.uniform1f(program.uniforms.uNormalStrength, 1)

        if (this.#shadowMap) {
            gl.activeTexture(gl.TEXTURE2)
            gl.bindTexture(gl.TEXTURE_2D, this.#shadowMap.texture)
            gl.uniform1i(program.uniforms.uShadowMap, 2)
            gl.uniformMatrix4fv(program.uniforms.uLightMatrix, false, this.#shadowMap.lightMatrix.elements)
            gl.uniform1f(program.uniforms.uHasShadowMap, 1)
        } else {
            gl.uniform1f(program.uniforms.uHasShadowMap, 0)
        }

        gl.activeTexture(gl.TEXTURE3)
        gl.bindTexture(gl.TEXTURE_2D, this.#lightDataTexture.texture)
        gl.uniform1i(program.uniforms.uLightData, 3)
    }


    #drawItem (gl, object, hints) { // eslint-disable-line complexity -- clean
        if (!object.mesh || !object.visible) {
            return
        }

        gl.uniformMatrix4fv(this.#meshProgram.uniforms.uModel, false, object.worldMatrix.elements)

        if (hints?.tint) {
            const t = hints.tint
            gl.uniform4f(this.#meshProgram.uniforms.uTintColor, t.r ?? 0, t.g ?? 0, t.b ?? 0, t.a ?? 0)
        }

        if (hints?.material) {
            this.#applyMaterial(gl, hints.material)
        }

        const texture = object.activeTexture
        if (texture) {
            gl.activeTexture(gl.TEXTURE0)
            gl.bindTexture(gl.TEXTURE_2D, this.context.textureManager.acquire(texture))
        } else {
            gl.uniform1f(this.#meshProgram.uniforms.uHasTexture, 0)
        }

        const normalMap = hints?.material?.normalMap ?? null
        if (normalMap) {
            gl.activeTexture(gl.TEXTURE1)
            gl.bindTexture(gl.TEXTURE_2D, this.context.textureManager.acquire(normalMap))
            gl.uniform1f(this.#meshProgram.uniforms.uHasNormalMap, 1)
        }

        gl.uniform1f(this.#meshProgram.uniforms.uHasVertexColors, object.mesh.hasColors ? 1 : 0)

        object.mesh.draw()

        if (normalMap) {
            this.context.textureManager.release(normalMap)
            gl.uniform1f(this.#meshProgram.uniforms.uHasNormalMap, 0)
        }

        if (texture) {
            this.context.textureManager.release(texture)
        } else {
            gl.uniform1f(this.#meshProgram.uniforms.uHasTexture, 1)
        }

        if (hints?.material) {
            this.#resetMaterial(gl)
        }

        if (hints?.tint) {
            gl.uniform4f(this.#meshProgram.uniforms.uTintColor, 0, 0, 0, 0)
        }
    }


    #applyMaterial (gl, material) {
        const u = this.#meshProgram.uniforms
        gl.uniform3fv(u.uMaterialColor, material.color)
        gl.uniform3fv(u.uMaterialEmissive, material.emissive)
        gl.uniform1f(u.uMaterialOpacity, material.opacity)
        gl.uniform1f(u.uUnlit, material.unlit ? 1 : 0)
        gl.uniform2f(u.uUVScale, material.uvScale[0], material.uvScale[1])
        gl.uniform1f(u.uRoughness, material.roughness)
        gl.uniform1f(u.uSpecular, material.specular)
        gl.uniform1f(u.uNormalStrength, material.normalStrength)
    }


    #resetMaterial (gl) {
        const u = this.#meshProgram.uniforms
        gl.uniform3f(u.uMaterialColor, 1, 1, 1)
        gl.uniform3f(u.uMaterialEmissive, 0, 0, 0)
        gl.uniform1f(u.uMaterialOpacity, 1)
        gl.uniform1f(u.uUnlit, 0)
        gl.uniform2f(u.uUVScale, 1, 1)
        gl.uniform1f(u.uRoughness, 0.5)
        gl.uniform1f(u.uSpecular, 0.5)
        gl.uniform1f(u.uNormalStrength, 1)
    }

}
