import WebGLObjectRenderer from './webgl_object_renderer.js'
import MeshInstance from '../mesh_instance.js'
import Decal from '../decal.js'
import Geometry from '../geometry.js'
import Mesh from '../mesh.js'
import {MESH_SHADER_DEF} from '../shaders/builtin/mesh_shader.js'
import {DEPTH_SHADER_DEF} from '../shaders/builtin/depth_shader.js'
import {CUBE_DEPTH_SHADER_DEF} from '../shaders/builtin/cube_depth_shader.js'
import {GBUFFER_SHADER_DEF} from '../shaders/builtin/gbuffer_shader.js'
import {LIGHTING_SHADER_DEF} from '../shaders/builtin/lighting_shader.js'
import {SMAA_EDGE_SHADER_DEF, SMAA_WEIGHT_SHADER_DEF, SMAA_BLEND_SHADER_DEF} from '../shaders/builtin/smaa_shader.js'
import {VOLUMETRIC_FOG_SHADER_DEF, FOG_BLUR_SHADER_DEF} from '../shaders/builtin/volumetric_fog_shader.js'
import {SSAO_SHADER_DEF, SSAO_BLUR_SHADER_DEF} from '../shaders/builtin/ssao_shader.js'
import {BLOOM_EXTRACT_SHADER_DEF, BLOOM_BLUR_SHADER_DEF, BLOOM_COMPOSITE_SHADER_DEF} from '../shaders/builtin/bloom_shader.js'
import {CINEMATIC_SHADER_DEF} from '../shaders/builtin/cinematic_shader.js'
import {SMAA_AREA_TEXTURE, SMAA_SEARCH_TEXTURE} from '../smaa_lookup_textures.js'
import LightDataTexture from '../light_data_texture.js'
import FullscreenQuad from '../postprocessing/fullscreen_quad.js'
import Matrix4 from '../../math/matrix4.js'


const SHADER_CUBE_SLOTS = 5
const DEFAULT_MAX_CUBE_SHADOWS = 4


export default class WebGLMeshRenderer extends WebGLObjectRenderer {

    #meshProgram = null
    #depthProgram = null
    #cubeDepthProgram = null
    #gbufferProgram = null
    #lightingProgram = null
    #smaaEdgeProgram = null
    #smaaWeightProgram = null
    #smaaBlendProgram = null
    #smaaEnabled = true
    #smaaEdgesFBO = null
    #smaaEdgesTexture = null
    #smaaWeightsFBO = null
    #smaaWeightsTexture = null
    #smaaAreaTexture = null
    #smaaSearchTexture = null
    #smaaOutputFBO = null
    #smaaOutputTexture = null
    #smaaReady = false
    #outputFBO = null
    #outputTexture = null
    #outputWidth = 0
    #outputHeight = 0
    #fullscreenQuad = null
    #decalQuadMesh = null
    #decalModelMatrix = new Matrix4()
    #decalScaleMatrix = new Matrix4()
    #inverseVP = new Matrix4()
    #camera3d = null
    #shadowMap = null
    #cubeShadowMaps = []
    #activeCubeShadows = []
    #maxCubeShadows = DEFAULT_MAX_CUBE_SHADOWS
    #lightDirection = [0.5, 1.0, 0.3]
    #directionalIntensity = 1.0
    #ambientSky = [0.3, 0.3, 0.3]
    #ambientGround = [0.3, 0.3, 0.3]
    #fogNear = 20
    #fogFar = 80
    #fogColor = [0.0, 0.0, 0.0]
    #volumetricFogProgram = null
    #volumetricFogEnabled = false
    #shadowSoftness = 0.7
    #ssaoProgram = null
    #ssaoBlurProgram = null
    #ssaoEnabled = false
    #ssaoFBO = null
    #ssaoTexture = null
    #ssaoBlurFBO = null
    #ssaoBlurTexture = null
    #ssaoRadius = 0.5
    #ssaoBias = 0.025
    #ssaoIntensity = 1.5
    #bloomExtractProgram = null
    #bloomBlurProgram = null
    #bloomCompositeProgram = null
    #bloomEnabled = false
    #bloomExtractFBO = null
    #bloomExtractTexture = null
    #bloomPingFBO = null
    #bloomPingTexture = null
    #bloomPongFBO = null
    #bloomPongTexture = null
    #bloomThreshold = 0.8
    #bloomSoftThreshold = 0.5
    #bloomIntensity = 0.3
    #bloomPasses = 2
    #cinematicProgram = null
    #cinematicEnabled = false
    #vignetteIntensity = 0.4
    #vignetteSmoothness = 0.8
    #saturation = 1.0
    #temperature = 0.0
    #brightness = 1.0
    #contrast = 1.0
    #grainIntensity = 0.0
    #fogBlurProgram = null
    #fogFBO = null
    #fogTexture = null
    #fogBlurFBO = null
    #fogBlurTexture = null
    #fogDensity = 0.05
    #fogHeightFalloff = 0.2
    #fogBaseHeight = 0.0
    #fogNoiseScale = 0.1
    #fogNoiseStrength = 0.5
    #fogWindDirection = [1.0, 0.0]
    #fogWindSpeed = 0.5
    #fogScatterAnisotropy = 0.3
    #fogSteps = 16
    #fogMaxDistance = 80
    #fogStartDistance = 3
    #fogTime = 0
    #dummyBlackTexture = null
    #dummyShadowTexture = null
    #dummyCubeShadowTexture = null
    #lights = []
    #lightDataTexture = null
    #gBuffer = null

    static get handles () {
        return [MeshInstance, Decal]
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


    get directionalIntensity () {
        return this.#directionalIntensity
    }

    set directionalIntensity (v) {
        this.#directionalIntensity = v
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


    get maxCubeShadows () {
        return this.#maxCubeShadows
    }


    set maxCubeShadows (value) {
        this.#maxCubeShadows = Math.max(2, Math.min(value, SHADER_CUBE_SLOTS))
    }


    get gBuffer () {
        return this.#gBuffer
    }


    set gBuffer (value) {
        this.#gBuffer = value
    }


    get smaaEnabled () {
        return this.#smaaEnabled
    }


    set smaaEnabled (value) {
        this.#smaaEnabled = value
    }


    get shadowSoftness () {
        return this.#shadowSoftness
    }

    set shadowSoftness (v) {
        this.#shadowSoftness = v
    }


    get ssaoEnabled () {
        return this.#ssaoEnabled
    }

    set ssaoEnabled (v) {
        this.#ssaoEnabled = v
    }

    get ssaoRadius () {
        return this.#ssaoRadius
    }

    set ssaoRadius (v) {
        this.#ssaoRadius = v
    }

    get ssaoBias () {
        return this.#ssaoBias
    }

    set ssaoBias (v) {
        this.#ssaoBias = v
    }

    get ssaoIntensity () {
        return this.#ssaoIntensity
    }

    set ssaoIntensity (v) {
        this.#ssaoIntensity = v
    }


    get cinematicEnabled () {
        return this.#cinematicEnabled
    }

    set cinematicEnabled (v) {
        this.#cinematicEnabled = v
    }

    get vignetteIntensity () {
        return this.#vignetteIntensity
    }

    set vignetteIntensity (v) {
        this.#vignetteIntensity = v
    }

    get vignetteSmoothness () {
        return this.#vignetteSmoothness
    }

    set vignetteSmoothness (v) {
        this.#vignetteSmoothness = v
    }

    get saturation () {
        return this.#saturation
    }

    set saturation (v) {
        this.#saturation = v
    }

    get temperature () {
        return this.#temperature
    }

    set temperature (v) {
        this.#temperature = v
    }

    get brightness () {
        return this.#brightness
    }

    set brightness (v) {
        this.#brightness = v
    }

    get contrast () {
        return this.#contrast
    }

    set contrast (v) {
        this.#contrast = v
    }

    get grainIntensity () {
        return this.#grainIntensity
    }

    set grainIntensity (v) {
        this.#grainIntensity = v
    }


    get bloomEnabled () {
        return this.#bloomEnabled
    }

    set bloomEnabled (v) {
        this.#bloomEnabled = v
    }

    get bloomThreshold () {
        return this.#bloomThreshold
    }

    set bloomThreshold (v) {
        this.#bloomThreshold = v
    }

    get bloomIntensity () {
        return this.#bloomIntensity
    }

    set bloomIntensity (v) {
        this.#bloomIntensity = v
    }

    get bloomPasses () {
        return this.#bloomPasses
    }

    set bloomPasses (v) {
        this.#bloomPasses = v
    }


    get volumetricFogEnabled () {
        return this.#volumetricFogEnabled
    }


    set volumetricFogEnabled (value) {
        this.#volumetricFogEnabled = value
    }


    get fogDensity () {
        return this.#fogDensity
    }

    set fogDensity (v) {
        this.#fogDensity = v
    }

    get fogHeightFalloff () {
        return this.#fogHeightFalloff
    }

    set fogHeightFalloff (v) {
        this.#fogHeightFalloff = v
    }

    get fogBaseHeight () {
        return this.#fogBaseHeight
    }

    set fogBaseHeight (v) {
        this.#fogBaseHeight = v
    }

    get fogNoiseScale () {
        return this.#fogNoiseScale
    }

    set fogNoiseScale (v) {
        this.#fogNoiseScale = v
    }

    get fogNoiseStrength () {
        return this.#fogNoiseStrength
    }

    set fogNoiseStrength (v) {
        this.#fogNoiseStrength = v
    }

    get fogWindDirection () {
        return this.#fogWindDirection
    }

    set fogWindDirection (v) {
        this.#fogWindDirection = v
    }

    get fogWindSpeed () {
        return this.#fogWindSpeed
    }

    set fogWindSpeed (v) {
        this.#fogWindSpeed = v
    }

    get fogScatterAnisotropy () {
        return this.#fogScatterAnisotropy
    }

    set fogScatterAnisotropy (v) {
        this.#fogScatterAnisotropy = v
    }

    get fogSteps () {
        return this.#fogSteps
    }

    set fogSteps (v) {
        this.#fogSteps = v
    }

    get fogMaxDistance () {
        return this.#fogMaxDistance
    }

    set fogMaxDistance (v) {
        this.#fogMaxDistance = v
    }

    get fogStartDistance () {
        return this.#fogStartDistance
    }

    set fogStartDistance (v) {
        this.#fogStartDistance = v
    }

    get fogTime () {
        return this.#fogTime
    }

    set fogTime (v) {
        this.#fogTime = v
    }


    init (context) {
        super.init(context)
        this.#meshProgram = context.shaderRegistry.register('mesh', MESH_SHADER_DEF)
        this.#depthProgram = context.shaderRegistry.register('depth', DEPTH_SHADER_DEF)
        this.#cubeDepthProgram = context.shaderRegistry.register('cubeDepth', CUBE_DEPTH_SHADER_DEF)
        this.#gbufferProgram = context.shaderRegistry.register('gbuffer', GBUFFER_SHADER_DEF)
        this.#lightingProgram = context.shaderRegistry.register('lighting', LIGHTING_SHADER_DEF)
        this.#volumetricFogProgram = context.shaderRegistry.register('volumetricFog', VOLUMETRIC_FOG_SHADER_DEF)
        this.#fogBlurProgram = context.shaderRegistry.register('fogBlur', FOG_BLUR_SHADER_DEF)
        this.#ssaoProgram = context.shaderRegistry.register('ssao', SSAO_SHADER_DEF)
        this.#ssaoBlurProgram = context.shaderRegistry.register('ssaoBlur', SSAO_BLUR_SHADER_DEF)
        this.#bloomExtractProgram = context.shaderRegistry.register('bloomExtract', BLOOM_EXTRACT_SHADER_DEF)
        this.#bloomBlurProgram = context.shaderRegistry.register('bloomBlur', BLOOM_BLUR_SHADER_DEF)
        this.#bloomCompositeProgram = context.shaderRegistry.register('bloomComposite', BLOOM_COMPOSITE_SHADER_DEF)
        this.#cinematicProgram = context.shaderRegistry.register('cinematic', CINEMATIC_SHADER_DEF)
        this.#smaaEdgeProgram = context.shaderRegistry.register('smaaEdge', SMAA_EDGE_SHADER_DEF)
        this.#smaaWeightProgram = context.shaderRegistry.register('smaaWeight', SMAA_WEIGHT_SHADER_DEF)
        this.#smaaBlendProgram = context.shaderRegistry.register('smaaBlend', SMAA_BLEND_SHADER_DEF)
        this.#lightDataTexture = new LightDataTexture(context.gl)
        this.#loadSmaaTextures(context.gl)
        this.#fullscreenQuad = new FullscreenQuad(context.gl)
        this.#decalQuadMesh = createDecalQuad(context.gl)
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

            let rendered = 0
            for (let i = 0; i < sorted.length && this.#activeCubeShadows.length < SHADER_CUBE_SLOTS; i++) {
                const {light, idx} = sorted[i]
                if (idx >= this.#cubeShadowMaps.length) {
                    continue
                }
                const csm = this.#cubeShadowMaps[idx]
                if (csm.dirty && rendered < this.#maxCubeShadows) {
                    this.#renderCubeShadowPass(gl, csm, light)
                    rendered++
                }
                this.#activeCubeShadows.push({map: csm, light})
            }
        }

        if (this.#gBuffer) {
            this.#flushDeferred(gl)
        } else {
            this.#flushForward(gl)
        }

        gl.disable(gl.DEPTH_TEST)
    }


    #flushForward (gl) {
        gl.clear(gl.DEPTH_BUFFER_BIT)

        const numLights = this.#lightDataTexture.update(this.#lights, this.#camera3d.position, this.#fogFar)
        this.#setupForwardUniforms(gl, numLights)

        for (const {object, hints} of this.collected) {
            this.#drawForwardItem(gl, object, hints)
        }
    }


    #flushDeferred (gl) {
        const opaque = []
        const decals = []
        const transparent = []

        for (const item of this.collected) {
            if (item.object instanceof Decal) {
                decals.push(item)
            } else if (item.hints?.material?.opacity < 1) {
                transparent.push(item)
            } else {
                opaque.push(item)
            }
        }

        this.#gBuffer.resize(gl.canvas.width, gl.canvas.height)

        this.#renderGBufferPass(gl, opaque, decals)

        if (this.#ssaoEnabled) {
            this.#renderSsaoPass(gl)
        }

        const numLights = this.#lightDataTexture.update(this.#lights, this.#camera3d.position, this.#fogFar)
        this.#renderLightingPass(gl, numLights)

        if (transparent.length > 0) {
            this.#setupForwardUniforms(gl, numLights)
            for (const {object, hints} of transparent) {
                this.#drawForwardItem(gl, object, hints)
            }
        }
    }


    #renderGBufferPass (gl, items, decals) {
        for (let i = 0; i < 4; i++) {
            gl.activeTexture(gl.TEXTURE0 + i)
            gl.bindTexture(gl.TEXTURE_2D, null)
        }

        this.#gBuffer.begin()

        gl.enable(gl.DEPTH_TEST)
        gl.depthFunc(gl.LEQUAL)

        const program = this.#gbufferProgram
        gl.useProgram(program.program)

        gl.uniformMatrix4fv(program.uniforms.uProjection, false, this.#camera3d.projectionMatrix.elements)
        gl.uniformMatrix4fv(program.uniforms.uView, false, this.#camera3d.viewMatrix.elements)

        gl.uniform3f(program.uniforms.uMaterialColor, 1, 1, 1)
        gl.uniform3f(program.uniforms.uMaterialEmissive, 0, 0, 0)
        gl.uniform1f(program.uniforms.uMaterialOpacity, 1)
        gl.uniform1f(program.uniforms.uUnlit, 0)
        gl.uniform1f(program.uniforms.uHasTexture, 1)
        gl.uniform2f(program.uniforms.uUVScale, 1, 1)
        gl.uniform1f(program.uniforms.uRoughness, 0.5)
        gl.uniform1f(program.uniforms.uSpecular, 0.5)
        gl.uniform1f(program.uniforms.uHasNormalMap, 0)
        gl.uniform1f(program.uniforms.uNormalStrength, 1)
        gl.uniform1f(program.uniforms.uHasVertexColors, 0)

        gl.activeTexture(gl.TEXTURE0)
        gl.uniform1i(program.uniforms.uTexture, 0)
        gl.activeTexture(gl.TEXTURE1)
        gl.uniform1i(program.uniforms.uNormalMap, 1)

        for (const {object, hints} of items) {
            this.#drawGBufferItem(gl, program, object, hints)
        }

        if (decals.length > 0) {
            this.#renderGBufferDecals(gl, program, decals)
        }

        this.#gBuffer.end()
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    }


    #renderGBufferDecals (gl, program, decals) {
        gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.NONE, gl.NONE])
        gl.enable(gl.BLEND)
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
        gl.depthMask(false)
        gl.enable(gl.POLYGON_OFFSET_FILL)
        gl.polygonOffset(-1, -1)

        gl.uniform1f(program.uniforms.uHasVertexColors, 0)
        gl.uniform1f(program.uniforms.uHasNormalMap, 0)

        for (const {object} of decals) {
            if (!object.visible) {
                continue
            }

            this.#decalScaleMatrix.makeScale(object.width, object.height, 1)
            this.#decalModelMatrix.multiplyMatrices(object.worldMatrix, this.#decalScaleMatrix)
            gl.uniformMatrix4fv(program.uniforms.uModel, false, this.#decalModelMatrix.elements)

            const material = object.material
            if (material) {
                gl.uniform3fv(program.uniforms.uMaterialColor, material.color)
                gl.uniform1f(program.uniforms.uMaterialOpacity, material.opacity)
                gl.uniform1f(program.uniforms.uUnlit, material.unlit ? 1 : 0)
            }

            const texture = material?.texture ?? null
            if (texture) {
                gl.activeTexture(gl.TEXTURE0)
                gl.bindTexture(gl.TEXTURE_2D, this.context.textureManager.acquire(texture))
                gl.uniform1f(program.uniforms.uHasTexture, 1)
            } else {
                gl.uniform1f(program.uniforms.uHasTexture, 0)
            }

            this.#decalQuadMesh.draw()

            if (texture) {
                this.context.textureManager.release(texture)
            }

            if (material) {
                gl.uniform3f(program.uniforms.uMaterialColor, 1, 1, 1)
                gl.uniform1f(program.uniforms.uMaterialOpacity, 1)
                gl.uniform1f(program.uniforms.uUnlit, 0)
            }
        }

        gl.disable(gl.POLYGON_OFFSET_FILL)
        gl.depthMask(true)
        gl.disable(gl.BLEND)
        gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1, gl.COLOR_ATTACHMENT2])
    }


    #drawGBufferItem (gl, program, object, hints) {
        if (!object.mesh || !object.visible) {
            return
        }

        gl.uniformMatrix4fv(program.uniforms.uModel, false, object.worldMatrix.elements)

        if (hints?.material) {
            const m = hints.material
            gl.uniform3fv(program.uniforms.uMaterialColor, m.color)
            gl.uniform3fv(program.uniforms.uMaterialEmissive, m.emissive)
            gl.uniform1f(program.uniforms.uMaterialOpacity, m.opacity)
            gl.uniform1f(program.uniforms.uUnlit, m.unlit ? 1 : 0)
            gl.uniform2f(program.uniforms.uUVScale, m.uvScale[0], m.uvScale[1])
            gl.uniform1f(program.uniforms.uRoughness, m.roughness)
            gl.uniform1f(program.uniforms.uSpecular, m.specular)
            gl.uniform1f(program.uniforms.uNormalStrength, m.normalStrength)
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
            gl.uniform1f(program.uniforms.uHasTexture, 0)
        }

        const normalMap = hints?.material?.normalMap ?? null
        if (normalMap) {
            gl.activeTexture(gl.TEXTURE1)
            gl.bindTexture(gl.TEXTURE_2D, this.context.textureManager.acquire(normalMap))
            gl.uniform1f(program.uniforms.uHasNormalMap, 1)
        }

        gl.uniform1f(program.uniforms.uHasVertexColors, object.mesh.hasColors ? 1 : 0)

        object.mesh.draw()

        if (normalMap) {
            this.context.textureManager.release(normalMap)
            gl.uniform1f(program.uniforms.uHasNormalMap, 0)
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
            gl.uniform1f(program.uniforms.uHasTexture, 1)
        }

        if (hints?.material) {
            gl.uniform3f(program.uniforms.uMaterialColor, 1, 1, 1)
            gl.uniform3f(program.uniforms.uMaterialEmissive, 0, 0, 0)
            gl.uniform1f(program.uniforms.uMaterialOpacity, 1)
            gl.uniform1f(program.uniforms.uUnlit, 0)
            gl.uniform2f(program.uniforms.uUVScale, 1, 1)
            gl.uniform1f(program.uniforms.uRoughness, 0.5)
            gl.uniform1f(program.uniforms.uSpecular, 0.5)
            gl.uniform1f(program.uniforms.uNormalStrength, 1)
        }
    }


    #renderLightingPass (gl, numLights) { // eslint-disable-line complexity -- clean
        const needsOutputFBO = (this.#smaaEnabled && this.#smaaReady) || this.#volumetricFogEnabled
        if (needsOutputFBO) {
            this.#ensureSmaaFBOs(gl, gl.canvas.width, gl.canvas.height)
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.#outputFBO)
        } else {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        }
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
        gl.enable(gl.DEPTH_TEST)
        gl.depthFunc(gl.ALWAYS)

        const program = this.#lightingProgram
        gl.useProgram(program.program)

        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, this.#gBuffer.albedoTexture)
        gl.uniform1i(program.uniforms.uAlbedo, 0)

        gl.activeTexture(gl.TEXTURE1)
        gl.bindTexture(gl.TEXTURE_2D, this.#gBuffer.normalTexture)
        gl.uniform1i(program.uniforms.uGNormal, 1)

        gl.activeTexture(gl.TEXTURE2)
        gl.bindTexture(gl.TEXTURE_2D, this.#gBuffer.materialTexture)
        gl.uniform1i(program.uniforms.uMaterial, 2)

        gl.activeTexture(gl.TEXTURE3)
        gl.bindTexture(gl.TEXTURE_2D, this.#gBuffer.depthTexture)
        gl.uniform1i(program.uniforms.uDepth, 3)

        this.#inverseVP
            .copy(this.#camera3d.projectionMatrix)
            .multiply(this.#camera3d.viewMatrix)
            .invert()
        gl.uniformMatrix4fv(program.uniforms.uInverseViewProjection, false, this.#inverseVP.elements)

        gl.uniform3f(
            program.uniforms.uCameraPosition,
            this.#camera3d.position.x,
            this.#camera3d.position.y,
            this.#camera3d.position.z
        )

        gl.uniform3fv(program.uniforms.uLightDirection, this.#lightDirection)
        gl.uniform1f(program.uniforms.uDirectionalIntensity, this.#directionalIntensity)
        gl.uniform3fv(program.uniforms.uAmbientSky, this.#ambientSky)
        gl.uniform3fv(program.uniforms.uAmbientGround, this.#ambientGround)
        gl.uniform1f(program.uniforms.uFogNear, this.#fogNear)
        gl.uniform1f(program.uniforms.uFogFar, this.#fogFar)
        gl.uniform3fv(program.uniforms.uFogColor, this.#fogColor)
        gl.uniform1f(program.uniforms.uShadowSoftness, this.#shadowSoftness)
        gl.uniform1f(program.uniforms.uVolumetricFogEnabled, this.#volumetricFogEnabled ? 1 : 0)

        gl.activeTexture(gl.TEXTURE11)
        if (this.#ssaoEnabled && this.#ssaoBlurTexture) {
            gl.bindTexture(gl.TEXTURE_2D, this.#ssaoBlurTexture)
            gl.uniform1i(program.uniforms.uSSAO, 11)
            gl.uniform1f(program.uniforms.uHasSSAO, 1)
        } else {
            gl.uniform1f(program.uniforms.uHasSSAO, 0)
        }

        gl.uniform1i(program.uniforms.uNumLights, numLights)

        gl.activeTexture(gl.TEXTURE4)
        if (this.#shadowMap) {
            gl.bindTexture(gl.TEXTURE_2D, this.#shadowMap.texture)
            gl.uniform1i(program.uniforms.uShadowMap, 4)
            gl.uniformMatrix4fv(program.uniforms.uLightMatrix, false, this.#shadowMap.lightMatrix.elements)
            gl.uniform1f(program.uniforms.uHasShadowMap, 1)
        } else {
            gl.bindTexture(gl.TEXTURE_2D, this.#getDummyShadowTexture(gl))
            gl.uniform1i(program.uniforms.uShadowMap, 4)
            gl.uniform1f(program.uniforms.uHasShadowMap, 0)
        }

        gl.activeTexture(gl.TEXTURE5)
        gl.bindTexture(gl.TEXTURE_2D, this.#lightDataTexture.texture)
        gl.uniform1i(program.uniforms.uLightData, 5)

        const active = this.#activeCubeShadows
        gl.uniform1i(program.uniforms.uNumCubeShadows, active.length)

        for (let i = 0; i < SHADER_CUBE_SLOTS; i++) {
            const unit = gl.TEXTURE6 + i
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

        this.#fullscreenQuad.draw(gl, program)

        gl.depthFunc(gl.LEQUAL)

        let sceneTexture = this.#outputTexture

        if (this.#smaaEnabled && this.#smaaReady) {
            this.#renderSmaaPass(gl, sceneTexture)
            sceneTexture = this.#smaaOutputTexture
        }

        if (this.#volumetricFogEnabled) {
            this.#renderVolumetricFogPass(gl, sceneTexture, numLights)
            sceneTexture = this.#fogBlurTexture
        }

        if (this.#bloomEnabled) {
            this.#renderBloomPass(gl, sceneTexture)
        }

        if (this.#cinematicEnabled) {
            this.#renderCinematicPass(gl, sceneTexture)
        } else if (sceneTexture !== this.#outputTexture || needsOutputFBO) {
            this.#blitToScreen(gl, sceneTexture)
        }

        if (this.#bloomEnabled) {
            this.#compositeBloom(gl)
        }
    }


    #renderSsaoPass (gl) {
        const hw = Math.ceil(gl.canvas.width / 2)
        const hh = Math.ceil(gl.canvas.height / 2)

        this.#ensureSsaoFBOs(gl, hw, hh)

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.#ssaoFBO)
        gl.viewport(0, 0, hw, hh)
        gl.disable(gl.DEPTH_TEST)

        const program = this.#ssaoProgram
        gl.useProgram(program.program)

        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, this.#gBuffer.depthTexture)
        gl.uniform1i(program.uniforms.uDepth, 0)

        gl.activeTexture(gl.TEXTURE1)
        gl.bindTexture(gl.TEXTURE_2D, this.#gBuffer.normalTexture)
        gl.uniform1i(program.uniforms.uGNormal, 1)

        gl.uniformMatrix4fv(program.uniforms.uProjection, false, this.#camera3d.projectionMatrix.elements)
        gl.uniformMatrix4fv(program.uniforms.uInverseViewProjection, false, this.#inverseVP.elements)
        gl.uniformMatrix4fv(program.uniforms.uView, false, this.#camera3d.viewMatrix.elements)
        gl.uniform2f(program.uniforms.uTexelSize, 1 / hw, 1 / hh)
        gl.uniform1f(program.uniforms.uRadius, this.#ssaoRadius)
        gl.uniform1f(program.uniforms.uBias, this.#ssaoBias)
        gl.uniform1f(program.uniforms.uIntensity, this.#ssaoIntensity)

        this.#fullscreenQuad.draw(gl, program)

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.#ssaoBlurFBO)
        gl.viewport(0, 0, hw, hh)

        const blur = this.#ssaoBlurProgram
        gl.useProgram(blur.program)
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, this.#ssaoTexture)
        gl.uniform1i(blur.uniforms.uSSAOTexture, 0)
        gl.activeTexture(gl.TEXTURE1)
        gl.bindTexture(gl.TEXTURE_2D, this.#gBuffer.depthTexture)
        gl.uniform1i(blur.uniforms.uDepth, 1)
        gl.uniform2f(blur.uniforms.uTexelSize, 1 / hw, 1 / hh)
        this.#fullscreenQuad.draw(gl, blur)

        gl.enable(gl.DEPTH_TEST)
    }


    #ensureSsaoFBOs (gl, width, height) {
        if (this.#ssaoFBO && this.#ssaoTexture) {
            return
        }

        this.#ssaoTexture = createScreenTexture(gl, width, height)
        this.#ssaoFBO = gl.createFramebuffer()
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.#ssaoFBO)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.#ssaoTexture, 0)

        this.#ssaoBlurTexture = createScreenTexture(gl, width, height)
        this.#ssaoBlurFBO = gl.createFramebuffer()
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.#ssaoBlurFBO)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.#ssaoBlurTexture, 0)

        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    }


    #renderCinematicPass (gl, sceneTexture) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
        gl.disable(gl.DEPTH_TEST)

        const program = this.#cinematicProgram
        gl.useProgram(program.program)

        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, sceneTexture)
        gl.uniform1i(program.uniforms.uSceneColor, 0)
        gl.uniform1f(program.uniforms.uTime, this.#fogTime)
        gl.uniform1f(program.uniforms.uVignetteIntensity, this.#vignetteIntensity)
        gl.uniform1f(program.uniforms.uVignetteSmoothness, this.#vignetteSmoothness)
        gl.uniform1f(program.uniforms.uSaturation, this.#saturation)
        gl.uniform1f(program.uniforms.uTemperature, this.#temperature)
        gl.uniform1f(program.uniforms.uBrightness, this.#brightness)
        gl.uniform1f(program.uniforms.uContrast, this.#contrast)
        gl.uniform1f(program.uniforms.uGrainIntensity, this.#grainIntensity)

        this.#fullscreenQuad.draw(gl, program)

        gl.enable(gl.DEPTH_TEST)
    }


    #compositeBloom (gl) {
        gl.disable(gl.DEPTH_TEST)
        gl.enable(gl.BLEND)
        const bi = this.#bloomIntensity
        gl.blendColor(bi, bi, bi, 1.0)
        gl.blendFunc(gl.CONSTANT_COLOR, gl.ONE)

        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

        const program = this.#bloomExtractProgram
        gl.useProgram(program.program)
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, this.#bloomPongTexture)
        gl.uniform1i(program.uniforms.uSceneColor, 0)
        gl.uniform1f(program.uniforms.uThreshold, 0.0)
        gl.uniform1f(program.uniforms.uSoftThreshold, 0.0)
        this.#fullscreenQuad.draw(gl, program)

        gl.disable(gl.BLEND)
        gl.enable(gl.DEPTH_TEST)
    }


    #renderBloomPass (gl, sceneTexture) {
        const bw = Math.ceil(gl.canvas.width / 2)
        const bh = Math.ceil(gl.canvas.height / 2)

        this.#ensureBloomFBOs(gl, bw, bh)

        gl.disable(gl.DEPTH_TEST)

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.#bloomExtractFBO)
        gl.viewport(0, 0, bw, bh)
        const extract = this.#bloomExtractProgram
        gl.useProgram(extract.program)
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, sceneTexture)
        gl.uniform1i(extract.uniforms.uSceneColor, 0)
        gl.uniform1f(extract.uniforms.uThreshold, this.#bloomThreshold)
        gl.uniform1f(extract.uniforms.uSoftThreshold, this.#bloomSoftThreshold)
        this.#fullscreenQuad.draw(gl, extract)

        const blur = this.#bloomBlurProgram
        gl.useProgram(blur.program)
        gl.uniform2f(blur.uniforms.uTexelSize, 1 / bw, 1 / bh)

        let readTex = this.#bloomExtractTexture
        for (let i = 0; i < this.#bloomPasses; i++) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.#bloomPingFBO)
            gl.activeTexture(gl.TEXTURE0)
            gl.bindTexture(gl.TEXTURE_2D, readTex)
            gl.uniform1i(blur.uniforms.uTexture, 0)
            gl.uniform2f(blur.uniforms.uDirection, 1.0, 0.0)
            this.#fullscreenQuad.draw(gl, blur)

            gl.bindFramebuffer(gl.FRAMEBUFFER, this.#bloomPongFBO)
            gl.activeTexture(gl.TEXTURE0)
            gl.bindTexture(gl.TEXTURE_2D, this.#bloomPingTexture)
            gl.uniform1i(blur.uniforms.uTexture, 0)
            gl.uniform2f(blur.uniforms.uDirection, 0.0, 1.0)
            this.#fullscreenQuad.draw(gl, blur)

            readTex = this.#bloomPongTexture
        }

        gl.enable(gl.DEPTH_TEST)
    }


    #bloomFBOWidth = 0

    #ensureBloomFBOs (gl, width, height) {
        if (this.#bloomExtractFBO && this.#bloomFBOWidth === width) {
            return
        }
        if (this.#bloomExtractFBO) {
            gl.deleteFramebuffer(this.#bloomExtractFBO)
            gl.deleteTexture(this.#bloomExtractTexture)
            gl.deleteFramebuffer(this.#bloomPingFBO)
            gl.deleteTexture(this.#bloomPingTexture)
            gl.deleteFramebuffer(this.#bloomPongFBO)
            gl.deleteTexture(this.#bloomPongTexture)
        }

        this.#bloomExtractTexture = createScreenTexture(gl, width, height)
        this.#bloomExtractFBO = gl.createFramebuffer()
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.#bloomExtractFBO)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.#bloomExtractTexture, 0)

        this.#bloomPingTexture = createScreenTexture(gl, width, height)
        this.#bloomPingFBO = gl.createFramebuffer()
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.#bloomPingFBO)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.#bloomPingTexture, 0)

        this.#bloomPongTexture = createScreenTexture(gl, width, height)
        this.#bloomPongFBO = gl.createFramebuffer()
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.#bloomPongFBO)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.#bloomPongTexture, 0)

        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        this.#bloomFBOWidth = width
    }


    #renderVolumetricFogPass (gl, sceneTexture, numLights) {
        const fw = Math.ceil(gl.canvas.width / 2)
        const fh = Math.ceil(gl.canvas.height / 2)

        this.#ensureFogFBO(gl, fw, fh)

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.#fogFBO)
        gl.viewport(0, 0, fw, fh)
        gl.disable(gl.DEPTH_TEST)

        const program = this.#volumetricFogProgram
        gl.useProgram(program.program)

        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, this.#gBuffer.depthTexture)
        gl.uniform1i(program.uniforms.uDepth, 0)

        gl.activeTexture(gl.TEXTURE1)
        gl.bindTexture(gl.TEXTURE_2D, this.#lightDataTexture.texture)
        gl.uniform1i(program.uniforms.uLightData, 1)

        gl.uniformMatrix4fv(program.uniforms.uInverseViewProjection, false, this.#inverseVP.elements)
        gl.uniform3f(program.uniforms.uCameraPosition, this.#camera3d.position.x, this.#camera3d.position.y, this.#camera3d.position.z)
        gl.uniform1i(program.uniforms.uNumLights, numLights)
        gl.uniform1f(program.uniforms.uTime, this.#fogTime)

        gl.uniform1f(program.uniforms.uFogDensity, this.#fogDensity)
        gl.uniform1f(program.uniforms.uFogHeightFalloff, this.#fogHeightFalloff)
        gl.uniform1f(program.uniforms.uFogBaseHeight, this.#fogBaseHeight)
        gl.uniform1f(program.uniforms.uFogNoiseScale, this.#fogNoiseScale)
        gl.uniform1f(program.uniforms.uFogNoiseStrength, this.#fogNoiseStrength)
        gl.uniform2fv(program.uniforms.uFogWindDirection, this.#fogWindDirection)
        gl.uniform1f(program.uniforms.uFogWindSpeed, this.#fogWindSpeed)
        gl.uniform1f(program.uniforms.uFogScatterAnisotropy, this.#fogScatterAnisotropy)
        gl.uniform3fv(program.uniforms.uFogColor, this.#fogColor)
        gl.uniform1i(program.uniforms.uFogSteps, this.#fogSteps)
        gl.uniform1f(program.uniforms.uFogMaxDistance, this.#fogMaxDistance)
        gl.uniform1f(program.uniforms.uFogStartDistance, this.#fogStartDistance)

        this.#fullscreenQuad.draw(gl, program)

        const fullW = gl.canvas.width
        const fullH = gl.canvas.height
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.#fogBlurFBO)
        gl.viewport(0, 0, fullW, fullH)

        const blur = this.#fogBlurProgram
        gl.useProgram(blur.program)
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, this.#fogTexture)
        gl.uniform1i(blur.uniforms.uFogTexture, 0)
        gl.activeTexture(gl.TEXTURE1)
        gl.bindTexture(gl.TEXTURE_2D, sceneTexture)
        gl.uniform1i(blur.uniforms.uSceneColor, 1)
        gl.activeTexture(gl.TEXTURE2)
        gl.bindTexture(gl.TEXTURE_2D, this.#gBuffer.depthTexture)
        gl.uniform1i(blur.uniforms.uDepth, 2)
        gl.uniform2f(blur.uniforms.uTexelSize, 1 / fullW, 1 / fullH)
        this.#fullscreenQuad.draw(gl, blur)

        gl.enable(gl.DEPTH_TEST)
    }


    #ensureFogFBO (gl, width, height) {
        if (this.#fogFBO && this.#outputWidth === width && this.#outputHeight === height) {
            return
        }

        if (this.#fogFBO) {
            gl.deleteFramebuffer(this.#fogFBO)
            gl.deleteTexture(this.#fogTexture)
            gl.deleteFramebuffer(this.#fogBlurFBO)
            gl.deleteTexture(this.#fogBlurTexture)
        }

        this.#fogTexture = createScreenTexture(gl, width, height)
        this.#fogFBO = gl.createFramebuffer()
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.#fogFBO)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.#fogTexture, 0)

        this.#fogBlurTexture = createScreenTexture(gl, gl.canvas.width, gl.canvas.height)
        this.#fogBlurFBO = gl.createFramebuffer()
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.#fogBlurFBO)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.#fogBlurTexture, 0)

        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    }


    #blitToScreen (gl, texture) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
        gl.disable(gl.DEPTH_TEST)

        const program = this.#smaaBlendProgram
        gl.useProgram(program.program)
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.uniform1i(program.uniforms.uColorTexture, 0)
        gl.activeTexture(gl.TEXTURE1)
        gl.bindTexture(gl.TEXTURE_2D, this.#getDummyBlackTexture(gl))
        gl.uniform1i(program.uniforms.uBlendTexture, 1)
        gl.uniform2f(program.uniforms.uTexelSize, 1 / gl.canvas.width, 1 / gl.canvas.height)
        this.#fullscreenQuad.draw(gl, program)

        gl.enable(gl.DEPTH_TEST)
    }


    #renderSmaaPass (gl, inputTexture) {
        const w = gl.canvas.width
        const h = gl.canvas.height
        const tx = 1 / w
        const ty = 1 / h

        gl.disable(gl.DEPTH_TEST)

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.#smaaEdgesFBO)
        gl.viewport(0, 0, w, h)
        gl.clearColor(0.0, 0.0, 0.0, 0.0)
        gl.clear(gl.COLOR_BUFFER_BIT)
        const edgeProg = this.#smaaEdgeProgram
        gl.useProgram(edgeProg.program)
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, inputTexture)
        gl.uniform1i(edgeProg.uniforms.uColorTexture, 0)
        gl.uniform2f(edgeProg.uniforms.uTexelSize, tx, ty)
        this.#fullscreenQuad.draw(gl, edgeProg)

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.#smaaWeightsFBO)
        gl.viewport(0, 0, w, h)
        gl.clear(gl.COLOR_BUFFER_BIT)
        const weightProg = this.#smaaWeightProgram
        gl.useProgram(weightProg.program)
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, this.#smaaEdgesTexture)
        gl.uniform1i(weightProg.uniforms.uEdgesTexture, 0)
        gl.activeTexture(gl.TEXTURE1)
        gl.bindTexture(gl.TEXTURE_2D, this.#smaaAreaTexture)
        gl.uniform1i(weightProg.uniforms.uAreaTexture, 1)
        gl.activeTexture(gl.TEXTURE2)
        gl.bindTexture(gl.TEXTURE_2D, this.#smaaSearchTexture)
        gl.uniform1i(weightProg.uniforms.uSearchTexture, 2)
        gl.uniform2f(weightProg.uniforms.uTexelSize, tx, ty)
        gl.uniform2f(weightProg.uniforms.uViewportSize, w, h)
        this.#fullscreenQuad.draw(gl, weightProg)

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.#smaaOutputFBO)
        gl.viewport(0, 0, w, h)
        const blendProg = this.#smaaBlendProgram
        gl.useProgram(blendProg.program)
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, inputTexture)
        gl.uniform1i(blendProg.uniforms.uColorTexture, 0)
        gl.activeTexture(gl.TEXTURE1)
        gl.bindTexture(gl.TEXTURE_2D, this.#smaaWeightsTexture)
        gl.uniform1i(blendProg.uniforms.uBlendTexture, 1)
        gl.uniform2f(blendProg.uniforms.uTexelSize, tx, ty)
        this.#fullscreenQuad.draw(gl, blendProg)

        gl.enable(gl.DEPTH_TEST)
    }


    #ensureSmaaFBOs (gl, width, height) {
        if (this.#outputFBO && this.#outputWidth === width && this.#outputHeight === height) {
            return
        }

        this.#deleteSmaaFBOs(gl)

        this.#outputTexture = createScreenTexture(gl, width, height)
        const depthRB = gl.createRenderbuffer()
        gl.bindRenderbuffer(gl.RENDERBUFFER, depthRB)
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT24, width, height)
        this.#outputFBO = gl.createFramebuffer()
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.#outputFBO)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.#outputTexture, 0)
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthRB)

        this.#smaaEdgesTexture = createScreenTexture(gl, width, height)
        this.#smaaEdgesFBO = gl.createFramebuffer()
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.#smaaEdgesFBO)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.#smaaEdgesTexture, 0)

        this.#smaaWeightsTexture = createScreenTexture(gl, width, height)
        this.#smaaWeightsFBO = gl.createFramebuffer()
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.#smaaWeightsFBO)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.#smaaWeightsTexture, 0)

        this.#smaaOutputTexture = createScreenTexture(gl, width, height)
        this.#smaaOutputFBO = gl.createFramebuffer()
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.#smaaOutputFBO)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.#smaaOutputTexture, 0)

        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        gl.bindRenderbuffer(gl.RENDERBUFFER, null)

        this.#outputWidth = width
        this.#outputHeight = height
    }


    #deleteSmaaFBOs (gl) {
        if (this.#outputFBO) {
            gl.deleteFramebuffer(this.#outputFBO)
            gl.deleteTexture(this.#outputTexture)
            this.#outputFBO = null
            this.#outputTexture = null
        }
        if (this.#smaaEdgesFBO) {
            gl.deleteFramebuffer(this.#smaaEdgesFBO)
            gl.deleteTexture(this.#smaaEdgesTexture)
            this.#smaaEdgesFBO = null
            this.#smaaEdgesTexture = null
        }
        if (this.#smaaWeightsFBO) {
            gl.deleteFramebuffer(this.#smaaWeightsFBO)
            gl.deleteTexture(this.#smaaWeightsTexture)
            this.#smaaWeightsFBO = null
            this.#smaaWeightsTexture = null
        }
        if (this.#smaaOutputFBO) {
            gl.deleteFramebuffer(this.#smaaOutputFBO)
            gl.deleteTexture(this.#smaaOutputTexture)
            this.#smaaOutputFBO = null
            this.#smaaOutputTexture = null
        }
    }


    #loadSmaaTextures (gl) {
        const loadImage = (src) => {
            const img = new Image()
            img.src = src
            return new Promise(resolve => {
                img.onload = () => resolve(img)
            })
        }

        Promise.all([loadImage(SMAA_AREA_TEXTURE), loadImage(SMAA_SEARCH_TEXTURE)]).then(([areaImg, searchImg]) => {
            this.#smaaAreaTexture = gl.createTexture()
            gl.bindTexture(gl.TEXTURE_2D, this.#smaaAreaTexture)
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, areaImg)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

            this.#smaaSearchTexture = gl.createTexture()
            gl.bindTexture(gl.TEXTURE_2D, this.#smaaSearchTexture)
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, searchImg)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

            gl.bindTexture(gl.TEXTURE_2D, null)
            this.#smaaReady = true
        })
    }


    #getDummyBlackTexture (gl) {
        if (!this.#dummyBlackTexture) {
            this.#dummyBlackTexture = gl.createTexture()
            gl.bindTexture(gl.TEXTURE_2D, this.#dummyBlackTexture)
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]))
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
            gl.bindTexture(gl.TEXTURE_2D, null)
        }
        return this.#dummyBlackTexture
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
        if (this.#fullscreenQuad) {
            this.#fullscreenQuad.dispose(this.context?.gl)
            this.#fullscreenQuad = null
        }
        if (this.#decalQuadMesh) {
            this.#decalQuadMesh.dispose()
            this.#decalQuadMesh = null
        }
        if (this.context?.gl) {
            this.#deleteSmaaFBOs(this.context.gl)
        }
        if (this.#smaaAreaTexture) {
            this.context?.gl?.deleteTexture(this.#smaaAreaTexture)
            this.#smaaAreaTexture = null
        }
        if (this.#smaaSearchTexture) {
            this.context?.gl?.deleteTexture(this.#smaaSearchTexture)
            this.#smaaSearchTexture = null
        }
        this.#meshProgram = null
        this.#depthProgram = null
        this.#cubeDepthProgram = null
        this.#gbufferProgram = null
        this.#lightingProgram = null
        this.#smaaEdgeProgram = null
        this.#smaaWeightProgram = null
        this.#smaaBlendProgram = null
        this.#volumetricFogProgram = null
        this.#fogBlurProgram = null
        this.#ssaoProgram = null
        this.#ssaoBlurProgram = null
        this.#bloomExtractProgram = null
        this.#bloomBlurProgram = null
        this.#bloomCompositeProgram = null
        if (this.#bloomExtractFBO) {
            this.context?.gl?.deleteFramebuffer(this.#bloomExtractFBO)
            this.context?.gl?.deleteTexture(this.#bloomExtractTexture)
            this.context?.gl?.deleteFramebuffer(this.#bloomPingFBO)
            this.context?.gl?.deleteTexture(this.#bloomPingTexture)
            this.context?.gl?.deleteFramebuffer(this.#bloomPongFBO)
            this.context?.gl?.deleteTexture(this.#bloomPongTexture)
            this.#bloomExtractFBO = null
            this.#bloomPingFBO = null
            this.#bloomPongFBO = null
        }
        if (this.#ssaoFBO) {
            this.context?.gl?.deleteFramebuffer(this.#ssaoFBO)
            this.context?.gl?.deleteTexture(this.#ssaoTexture)
            this.context?.gl?.deleteFramebuffer(this.#ssaoBlurFBO)
            this.context?.gl?.deleteTexture(this.#ssaoBlurTexture)
            this.#ssaoFBO = null
            this.#ssaoTexture = null
            this.#ssaoBlurFBO = null
            this.#ssaoBlurTexture = null
        }
        if (this.#fogFBO) {
            this.context?.gl?.deleteFramebuffer(this.#fogFBO)
            this.context?.gl?.deleteTexture(this.#fogTexture)
            this.context?.gl?.deleteFramebuffer(this.#fogBlurFBO)
            this.context?.gl?.deleteTexture(this.#fogBlurTexture)
            this.#fogFBO = null
            this.#fogTexture = null
            this.#fogBlurFBO = null
            this.#fogBlurTexture = null
        }
        this.#camera3d = null
        this.#shadowMap = null
        this.#cubeShadowMaps = []
        this.#activeCubeShadows = []
        this.#lights = []
        this.#gBuffer = null
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

        if (!csm.dirty) {
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
        csm.markClean()
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    }


    #setupForwardUniforms (gl, numLights) {
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


    #drawForwardItem (gl, object, hints) { // eslint-disable-line complexity -- clean
        if (!object.mesh || !object.visible) {
            return
        }

        gl.uniformMatrix4fv(this.#meshProgram.uniforms.uModel, false, object.worldMatrix.elements)

        if (hints?.tint) {
            const t = hints.tint
            gl.uniform4f(this.#meshProgram.uniforms.uTintColor, t.r ?? 0, t.g ?? 0, t.b ?? 0, t.a ?? 0)
        }

        if (hints?.material) {
            this.#applyForwardMaterial(gl, hints.material)
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
            this.#resetForwardMaterial(gl)
        }

        if (hints?.tint) {
            gl.uniform4f(this.#meshProgram.uniforms.uTintColor, 0, 0, 0, 0)
        }
    }


    #applyForwardMaterial (gl, material) {
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


    #resetForwardMaterial (gl) {
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


function createDecalQuad (gl) {
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
    return new Mesh({gl, geometry: geo})
}


function createHdrTexture (gl, width, height) {
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.HALF_FLOAT, null)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.bindTexture(gl.TEXTURE_2D, null)
    return texture
}


function createScreenTexture (gl, width, height) {
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.bindTexture(gl.TEXTURE_2D, null)
    return texture
}
