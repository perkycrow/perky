import WebGLObjectRenderer from './webgl_object_renderer.js'
import MeshInstance from '../mesh_instance.js'
import {MESH_SHADER_DEF} from '../shaders/builtin/mesh_shader.js'
import {DEPTH_SHADER_DEF} from '../shaders/builtin/depth_shader.js'
import {CUBE_DEPTH_SHADER_DEF} from '../shaders/builtin/cube_depth_shader.js'
import LightDataTexture from '../light_data_texture.js'


const MAX_CUBE_SHADOWS = 2


export default class WebGLMeshRenderer extends WebGLObjectRenderer {

    #meshProgram = null
    #depthProgram = null
    #cubeDepthProgram = null
    #camera3d = null
    #shadowMap = null
    #cubeShadowMaps = []
    #activeCubeShadows = []
    #lightDirection = [0.5, 1.0, 0.3]
    #ambientSky = [0.3, 0.3, 0.3]
    #ambientGround = [0.3, 0.3, 0.3]
    #fogNear = 20
    #fogFar = 80
    #fogColor = [0.0, 0.0, 0.0]
    #dummyShadowTexture = null
    #dummyCubeShadowTexture = null
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
        return this.#ambientSky
    }


    set ambient (value) {
        if (typeof value === 'number') {
            this.#ambientSky = [value, value, value]
            this.#ambientGround = [value, value, value]
        } else {
            this.#ambientSky = value
        }
    }


    get ambientSky () {
        return this.#ambientSky
    }


    set ambientSky (value) {
        this.#ambientSky = value
    }


    get ambientGround () {
        return this.#ambientGround
    }


    set ambientGround (value) {
        this.#ambientGround = value
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


    get cubeShadowMaps () {
        return this.#cubeShadowMaps
    }


    set cubeShadowMaps (value) {
        this.#cubeShadowMaps = value
    }


    get activeCubeShadows () {
        return this.#activeCubeShadows
    }


    init (context) {
        super.init(context)
        this.#meshProgram = context.shaderRegistry.register('mesh', MESH_SHADER_DEF)
        this.#depthProgram = context.shaderRegistry.register('depth', DEPTH_SHADER_DEF)
        this.#cubeDepthProgram = context.shaderRegistry.register('cubeDepth', CUBE_DEPTH_SHADER_DEF)
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

        this.#activeCubeShadows = []
        if (this.#cubeShadowMaps.length > 0 && this.#camera3d) {
            const sorted = this.#lights
                .map((light, idx) => ({light, idx, dist: this.#distToCamera(light)}))
                .sort((a, b) => a.dist - b.dist)

            for (let i = 0; i < sorted.length && this.#activeCubeShadows.length < MAX_CUBE_SHADOWS; i++) {
                const {light, idx} = sorted[i]
                if (idx >= this.#cubeShadowMaps.length) {
                    continue
                }
                this.#renderCubeShadowPass(gl, this.#cubeShadowMaps[idx], light)
                this.#activeCubeShadows.push({map: this.#cubeShadowMaps[idx], light})
            }
        }

        gl.clear(gl.DEPTH_BUFFER_BIT)

        const numLights = this.#lightDataTexture.update(this.#lights, this.#camera3d.position, this.#fogFar)
        this.#setupUniforms(gl, numLights)

        for (const {object, hints} of this.collected) {
            this.#drawItem(gl, object, hints)
        }

        gl.disable(gl.DEPTH_TEST)
    }


    #getDummyCubeShadowTexture (gl) {
        if (!this.#dummyCubeShadowTexture) {
            this.#dummyCubeShadowTexture = gl.createTexture()
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.#dummyCubeShadowTexture)
            for (let i = 0; i < 6; i++) {
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]))
            }
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, null)
        }
        return this.#dummyCubeShadowTexture
    }


    #getDummyShadowTexture (gl) {
        if (!this.#dummyShadowTexture) {
            this.#dummyShadowTexture = gl.createTexture()
            gl.bindTexture(gl.TEXTURE_2D, this.#dummyShadowTexture)
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT24, 1, 1, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_FUNC, gl.LEQUAL)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
            gl.bindTexture(gl.TEXTURE_2D, null)
        }
        return this.#dummyShadowTexture
    }


    dispose () {
        if (this.#dummyShadowTexture) {
            this.context?.gl?.deleteTexture(this.#dummyShadowTexture)
            this.#dummyShadowTexture = null
        }
        if (this.#dummyCubeShadowTexture) {
            this.context?.gl?.deleteTexture(this.#dummyCubeShadowTexture)
            this.#dummyCubeShadowTexture = null
        }
        this.#meshProgram = null
        this.#depthProgram = null
        this.#cubeDepthProgram = null
        this.#camera3d = null
        this.#shadowMap = null
        this.#cubeShadowMaps = []
        this.#activeCubeShadows = []
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


    #renderCubeShadowPass (gl, csm, light) {
        if (!csm || !light) {
            return
        }

        const far = light.radius
        csm.update(light.position, far)

        const program = this.#cubeDepthProgram
        gl.useProgram(program.program)
        gl.enable(gl.DEPTH_TEST)
        gl.depthFunc(gl.LEQUAL)
        gl.uniformMatrix4fv(program.uniforms.uProjection, false, csm.projection.elements)
        gl.uniform3f(program.uniforms.uLightPosition, light.position.x, light.position.y, light.position.z)
        gl.uniform1f(program.uniforms.uFar, far)

        for (let face = 0; face < 6; face++) {
            csm.beginFace(face)
            gl.uniformMatrix4fv(program.uniforms.uView, false, csm.getView(face).elements)

            for (const {object} of this.collected) {
                if (!object.mesh || !object.visible || !object.castShadow) {
                    continue
                }
                const pos = object.worldMatrix.elements
                const dx = pos[12] - light.position.x
                const dy = pos[13] - light.position.y
                const dz = pos[14] - light.position.z
                if (dx * dx + dy * dy + dz * dz > far * far) {
                    continue
                }
                gl.uniformMatrix4fv(program.uniforms.uModel, false, pos)
                object.mesh.draw()
            }
        }
        csm.end()
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    }


    #setupUniforms (gl, numLights) {
        const program = this.#meshProgram

        gl.useProgram(program.program)

        gl.uniformMatrix4fv(program.uniforms.uProjection, false, this.#camera3d.projectionMatrix.elements)
        gl.uniformMatrix4fv(program.uniforms.uView, false, this.#camera3d.viewMatrix.elements)
        gl.uniform3fv(program.uniforms.uLightDirection, this.#lightDirection)
        gl.uniform3fv(program.uniforms.uAmbientSky, this.#ambientSky)
        gl.uniform3fv(program.uniforms.uAmbientGround, this.#ambientGround)
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

        gl.activeTexture(gl.TEXTURE2)
        if (this.#shadowMap) {
            gl.bindTexture(gl.TEXTURE_2D, this.#shadowMap.texture)
            gl.uniform1i(program.uniforms.uShadowMap, 2)
            gl.uniformMatrix4fv(program.uniforms.uLightMatrix, false, this.#shadowMap.lightMatrix.elements)
            gl.uniform1f(program.uniforms.uHasShadowMap, 1)
        } else {
            gl.bindTexture(gl.TEXTURE_2D, this.#getDummyShadowTexture(gl))
            gl.uniform1i(program.uniforms.uShadowMap, 2)
            gl.uniform1f(program.uniforms.uHasShadowMap, 0)
        }

        gl.activeTexture(gl.TEXTURE3)
        gl.bindTexture(gl.TEXTURE_2D, this.#lightDataTexture.texture)
        gl.uniform1i(program.uniforms.uLightData, 3)

        const active = this.#activeCubeShadows
        gl.uniform1i(program.uniforms.uNumCubeShadows, active.length)

        const SHADER_CUBE_SLOTS = 5
        for (let i = 0; i < SHADER_CUBE_SLOTS; i++) {
            const unit = gl.TEXTURE4 + i
            gl.activeTexture(unit)

            if (i < active.length) {
                const {map, light} = active[i]
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, map.texture)
                gl.uniform1i(program.uniforms['uCubeShadow' + i], unit - gl.TEXTURE0)
                gl.uniform3f(program.uniforms['uCubeShadowPos' + i], light.position.x, light.position.y, light.position.z)
                gl.uniform1f(program.uniforms['uCubeShadowFar' + i], light.radius)
            } else {
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.#getDummyCubeShadowTexture(gl))
                gl.uniform1i(program.uniforms['uCubeShadow' + i], unit - gl.TEXTURE0)
            }
        }
    }


    #distToCamera (light) {
        const dx = light.position.x - this.#camera3d.position.x
        const dy = light.position.y - this.#camera3d.position.y
        const dz = light.position.z - this.#camera3d.position.z
        return dx * dx + dy * dy + dz * dz
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
            const gpuTexture = this.context.textureManager.acquire(texture)
            gl.bindTexture(gl.TEXTURE_2D, gpuTexture)
            const filtering = hints?.material?.filtering
            if (filtering === 'nearest') {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
            }
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

        const transparent = hints?.material?.opacity < 1
        if (transparent) {
            gl.enable(gl.BLEND)
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
            gl.depthMask(false)
        }

        object.mesh.draw()

        if (transparent) {
            gl.disable(gl.BLEND)
            gl.depthMask(true)
        }

        if (normalMap) {
            this.context.textureManager.release(normalMap)
            gl.uniform1f(this.#meshProgram.uniforms.uHasNormalMap, 0)
        }

        if (texture) {
            if (hints?.material?.filtering === 'nearest') {
                gl.activeTexture(gl.TEXTURE0)
                gl.bindTexture(gl.TEXTURE_2D, this.context.textureManager.acquire(texture))
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
                this.context.textureManager.release(texture)
            }
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
