import WebGLObjectRenderer from './webgl_object_renderer.js'
import MeshInstance from '../mesh_instance.js'
import {MESH_SHADER_DEF} from '../shaders/builtin/mesh_shader.js'
import {MAX_LIGHTS} from '../light_3d.js'


export default class WebGLMeshRenderer extends WebGLObjectRenderer {

    #meshProgram = null
    #camera3d = null
    #lightDirection = [0.5, 1.0, 0.3]
    #ambient = 0.3
    #fogNear = 20
    #fogFar = 80
    #fogColor = [0.0, 0.0, 0.0]
    #lights = []
    #lightPositions = new Float32Array(MAX_LIGHTS * 3)
    #lightColors = new Float32Array(MAX_LIGHTS * 3)
    #lightIntensities = new Float32Array(MAX_LIGHTS)
    #lightRadii = new Float32Array(MAX_LIGHTS)

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


    init (context) {
        super.init(context)
        this.#meshProgram = context.shaderRegistry.register('mesh', MESH_SHADER_DEF)
    }


    flush () {
        if (this.collected.length === 0 || !this.#camera3d) {
            return
        }

        const gl = this.gl

        gl.enable(gl.DEPTH_TEST)
        gl.depthFunc(gl.LEQUAL)
        gl.clear(gl.DEPTH_BUFFER_BIT)

        this.#packLightUniforms()
        this.#setupUniforms(gl)

        for (const {object, hints} of this.collected) {
            this.#drawItem(gl, object, hints)
        }

        gl.disable(gl.DEPTH_TEST)
    }


    dispose () {
        this.#meshProgram = null
        this.#camera3d = null
        this.#lights = []
        super.dispose()
    }


    #packLightUniforms () {
        const count = Math.min(this.#lights.length, MAX_LIGHTS)

        for (let i = 0; i < count; i++) {
            const light = this.#lights[i]
            const offset = i * 3
            this.#lightPositions[offset] = light.position.x
            this.#lightPositions[offset + 1] = light.position.y
            this.#lightPositions[offset + 2] = light.position.z
            this.#lightColors[offset] = light.color[0]
            this.#lightColors[offset + 1] = light.color[1]
            this.#lightColors[offset + 2] = light.color[2]
            this.#lightIntensities[i] = light.intensity
            this.#lightRadii[i] = light.radius
        }
    }


    #setupUniforms (gl) {
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

        const numLights = Math.min(this.#lights.length, MAX_LIGHTS)
        gl.uniform1i(program.uniforms.uNumLights, numLights)

        if (numLights > 0) {
            gl.uniform3fv(program.uniforms.uLightPositions, this.#lightPositions)
            gl.uniform3fv(program.uniforms.uLightColors, this.#lightColors)
            gl.uniform1fv(program.uniforms.uLightIntensities, this.#lightIntensities)
            gl.uniform1fv(program.uniforms.uLightRadii, this.#lightRadii)
        }

        gl.activeTexture(gl.TEXTURE0)
        gl.uniform1i(program.uniforms.uTexture, 0)
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
            gl.bindTexture(gl.TEXTURE_2D, this.context.textureManager.acquire(texture))
        }

        object.mesh.draw()

        if (texture) {
            this.context.textureManager.release(texture)
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
    }


    #resetMaterial (gl) {
        const u = this.#meshProgram.uniforms
        gl.uniform3f(u.uMaterialColor, 1, 1, 1)
        gl.uniform3f(u.uMaterialEmissive, 0, 0, 0)
        gl.uniform1f(u.uMaterialOpacity, 1)
        gl.uniform1f(u.uUnlit, 0)
    }

}
