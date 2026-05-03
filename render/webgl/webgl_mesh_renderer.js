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
import SmaaEffect from './effects/smaa_effect.js'
import VolumetricFogEffect from './effects/volumetric_fog_effect.js'
import SsaoEffect from './effects/ssao_effect.js'
import BloomEffect from './effects/bloom_effect.js'
import CinematicEffect from './effects/cinematic_effect.js'
import OutlineEffect from './effects/outline_effect.js'
import LightDataTexture from '../light_data_texture.js'
import FullscreenQuad from '../postprocessing/fullscreen_quad.js'
import {createScreenTexture} from './effects/texture_helpers.js'
import Matrix4 from '../../math/matrix4.js'


const SHADER_CUBE_SLOTS = 5
const DEFAULT_MAX_CUBE_SHADOWS = 4


export default class WebGLMeshRenderer extends WebGLObjectRenderer {

    #meshProgram = null
    #depthProgram = null
    #cubeDepthProgram = null
    #gbufferProgram = null
    #lightingProgram = null
    #smaa = new SmaaEffect()
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
    #volumetricFog = new VolumetricFogEffect()
    #toonLevels = 0
    #toonBlend = 0.25
    #rimPower = 3.0
    #rimIntensity = 0.0
    #rimColor = [1.0, 1.0, 1.0]
    #outline = new OutlineEffect()
    #lightBlobiness = 0.0
    #shadowSoftness = 0.7
    #ssao = new SsaoEffect()
    #bloom = new BloomEffect()
    #cinematic = new CinematicEffect()
    #sprite3dRenderer = null
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


    get sprite3dRenderer () {
        return this.#sprite3dRenderer
    }

    set sprite3dRenderer (value) {
        this.#sprite3dRenderer = value
    }


    get smaa () {
        return this.#smaa
    }

    get smaaEnabled () {
        return this.#smaa.enabled
    }

    set smaaEnabled (value) {
        this.#smaa.enabled = value
    }


    get rimPower () {
        return this.#rimPower
    }

    set rimPower (v) {
        this.#rimPower = v
    }

    get rimIntensity () {
        return this.#rimIntensity
    }

    set rimIntensity (v) {
        this.#rimIntensity = v
    }

    get rimColor () {
        return this.#rimColor
    }

    set rimColor (v) {
        this.#rimColor = v
    }


    get toonBlend () {
        return this.#toonBlend
    }

    set toonBlend (v) {
        this.#toonBlend = v
    }


    get toonLevels () {
        return this.#toonLevels
    }

    set toonLevels (v) {
        this.#toonLevels = v
    }

    get outline () {
        return this.#outline
    }

    get outlineEnabled () {
        return this.#outline.enabled
    }

    set outlineEnabled (v) {
        this.#outline.enabled = v
    }

    get outlineColor () {
        return this.#outline.color
    }

    set outlineColor (v) {
        this.#outline.color = v
    }

    get depthThreshold () {
        return this.#outline.depthThreshold
    }

    set depthThreshold (v) {
        this.#outline.depthThreshold = v
    }

    get normalThreshold () {
        return this.#outline.normalThreshold
    }

    set normalThreshold (v) {
        this.#outline.normalThreshold = v
    }


    get lightBlobiness () {
        return this.#lightBlobiness
    }

    set lightBlobiness (v) {
        this.#lightBlobiness = v
    }


    get shadowSoftness () {
        return this.#shadowSoftness
    }

    set shadowSoftness (v) {
        this.#shadowSoftness = v
    }


    get ssao () {
        return this.#ssao
    }

    get ssaoEnabled () {
        return this.#ssao.enabled
    }

    set ssaoEnabled (v) {
        this.#ssao.enabled = v
    }

    get ssaoRadius () {
        return this.#ssao.radius
    }

    set ssaoRadius (v) {
        this.#ssao.radius = v
    }

    get ssaoBias () {
        return this.#ssao.bias
    }

    set ssaoBias (v) {
        this.#ssao.bias = v
    }

    get ssaoIntensity () {
        return this.#ssao.intensity
    }

    set ssaoIntensity (v) {
        this.#ssao.intensity = v
    }


    get cinematic () {
        return this.#cinematic
    }


    get cinematicEnabled () {
        return this.#cinematic.enabled
    }

    set cinematicEnabled (v) {
        this.#cinematic.enabled = v
    }

    get vignetteIntensity () {
        return this.#cinematic.vignetteIntensity
    }

    set vignetteIntensity (v) {
        this.#cinematic.vignetteIntensity = v
    }

    get vignetteSmoothness () {
        return this.#cinematic.vignetteSmoothness
    }

    set vignetteSmoothness (v) {
        this.#cinematic.vignetteSmoothness = v
    }

    get saturation () {
        return this.#cinematic.saturation
    }

    set saturation (v) {
        this.#cinematic.saturation = v
    }

    get temperature () {
        return this.#cinematic.temperature
    }

    set temperature (v) {
        this.#cinematic.temperature = v
    }

    get brightness () {
        return this.#cinematic.brightness
    }

    set brightness (v) {
        this.#cinematic.brightness = v
    }

    get contrast () {
        return this.#cinematic.contrast
    }

    set contrast (v) {
        this.#cinematic.contrast = v
    }

    get colorLevels () {
        return this.#cinematic.colorLevels
    }

    set colorLevels (v) {
        this.#cinematic.colorLevels = v
    }


    get paperIntensity () {
        return this.#cinematic.paperIntensity
    }

    set paperIntensity (v) {
        this.#cinematic.paperIntensity = v
    }


    get grainIntensity () {
        return this.#cinematic.grainIntensity
    }

    set grainIntensity (v) {
        this.#cinematic.grainIntensity = v
    }


    get bloom () {
        return this.#bloom
    }

    get bloomEnabled () {
        return this.#bloom.enabled
    }

    set bloomEnabled (v) {
        this.#bloom.enabled = v
    }

    get bloomThreshold () {
        return this.#bloom.threshold
    }

    set bloomThreshold (v) {
        this.#bloom.threshold = v
    }

    get bloomIntensity () {
        return this.#bloom.intensity
    }

    set bloomIntensity (v) {
        this.#bloom.intensity = v
    }

    get bloomPasses () {
        return this.#bloom.passes
    }

    set bloomPasses (v) {
        this.#bloom.passes = v
    }


    get volumetricFog () {
        return this.#volumetricFog
    }

    get volumetricFogEnabled () {
        return this.#volumetricFog.enabled
    }

    set volumetricFogEnabled (value) {
        this.#volumetricFog.enabled = value
    }

    get fogDensity () {
        return this.#volumetricFog.density
    }

    set fogDensity (v) {
        this.#volumetricFog.density = v
    }

    get fogHeightFalloff () {
        return this.#volumetricFog.heightFalloff
    }

    set fogHeightFalloff (v) {
        this.#volumetricFog.heightFalloff = v
    }

    get fogBaseHeight () {
        return this.#volumetricFog.baseHeight
    }

    set fogBaseHeight (v) {
        this.#volumetricFog.baseHeight = v
    }

    get fogNoiseScale () {
        return this.#volumetricFog.noiseScale
    }

    set fogNoiseScale (v) {
        this.#volumetricFog.noiseScale = v
    }

    get fogNoiseStrength () {
        return this.#volumetricFog.noiseStrength
    }

    set fogNoiseStrength (v) {
        this.#volumetricFog.noiseStrength = v
    }

    get fogWindDirection () {
        return this.#volumetricFog.windDirection
    }

    set fogWindDirection (v) {
        this.#volumetricFog.windDirection = v
    }

    get fogWindSpeed () {
        return this.#volumetricFog.windSpeed
    }

    set fogWindSpeed (v) {
        this.#volumetricFog.windSpeed = v
    }

    get fogScatterAnisotropy () {
        return this.#volumetricFog.scatterAnisotropy
    }

    set fogScatterAnisotropy (v) {
        this.#volumetricFog.scatterAnisotropy = v
    }

    get fogSteps () {
        return this.#volumetricFog.steps
    }

    set fogSteps (v) {
        this.#volumetricFog.steps = v
    }

    get fogMaxDistance () {
        return this.#volumetricFog.maxDistance
    }

    set fogMaxDistance (v) {
        this.#volumetricFog.maxDistance = v
    }

    get fogStartDistance () {
        return this.#volumetricFog.startDistance
    }

    set fogStartDistance (v) {
        this.#volumetricFog.startDistance = v
    }

    get fogTime () {
        return this.#volumetricFog.time
    }

    set fogTime (v) {
        this.#volumetricFog.time = v
    }


    init (context) {
        super.init(context)
        this.#meshProgram = context.shaderRegistry.register('mesh', MESH_SHADER_DEF)
        this.#depthProgram = context.shaderRegistry.register('depth', DEPTH_SHADER_DEF)
        this.#cubeDepthProgram = context.shaderRegistry.register('cubeDepth', CUBE_DEPTH_SHADER_DEF)
        this.#gbufferProgram = context.shaderRegistry.register('gbuffer', GBUFFER_SHADER_DEF)
        this.#lightingProgram = context.shaderRegistry.register('lighting', LIGHTING_SHADER_DEF)
        this.#volumetricFog.init(context.shaderRegistry)
        this.#ssao.init(context.shaderRegistry)
        this.#bloom.init(context.shaderRegistry)
        this.#cinematic.init(context.shaderRegistry, context.gl)
        this.#outline.init(context.shaderRegistry)
        this.#smaa.init(context.shaderRegistry, context.gl)
        this.#lightDataTexture = new LightDataTexture(context.gl)
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

        if (this.#sprite3dRenderer) {
            this.#sprite3dRenderer.flushToGBuffer(gl)
        }

        if (this.#ssao.enabled) {
            this.#ssao.render(gl, {canvasWidth: gl.canvas.width, canvasHeight: gl.canvas.height, gBuffer: this.#gBuffer, camera3d: this.#camera3d, inverseVP: this.#inverseVP, fullscreenQuad: this.#fullscreenQuad})
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
        const needsOutputFBO = (this.#smaa.enabled && this.#smaa.ready) || this.#volumetricFog.enabled
        if (needsOutputFBO) {
            this.#ensureOutputFBO(gl, gl.canvas.width, gl.canvas.height)
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
        gl.uniform1f(program.uniforms.uToonLevels, this.#toonLevels)
        gl.uniform1f(program.uniforms.uToonBlend, this.#toonBlend)
        gl.uniform1f(program.uniforms.uRimPower, this.#rimPower)
        gl.uniform1f(program.uniforms.uRimIntensity, this.#rimIntensity)
        gl.uniform3fv(program.uniforms.uRimColor, this.#rimColor)
        gl.uniform3fv(program.uniforms.uAmbientSky, this.#ambientSky)
        gl.uniform3fv(program.uniforms.uAmbientGround, this.#ambientGround)
        gl.uniform1f(program.uniforms.uFogNear, this.#fogNear)
        gl.uniform1f(program.uniforms.uFogFar, this.#fogFar)
        gl.uniform3fv(program.uniforms.uFogColor, this.#fogColor)
        gl.uniform1f(program.uniforms.uLightBlobiness, this.#lightBlobiness)
        gl.uniform1f(program.uniforms.uShadowSoftness, this.#shadowSoftness)
        gl.uniform1f(program.uniforms.uVolumetricFogEnabled, this.#volumetricFog.enabled ? 1 : 0)

        gl.activeTexture(gl.TEXTURE11)
        if (this.#ssao.enabled && this.#ssao.outputTexture) {
            gl.bindTexture(gl.TEXTURE_2D, this.#ssao.outputTexture)
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

        if (this.#smaa.enabled && this.#smaa.ready) {
            sceneTexture = this.#smaa.render(gl, {canvasWidth: gl.canvas.width, canvasHeight: gl.canvas.height, fullscreenQuad: this.#fullscreenQuad}, sceneTexture)
        }

        if (this.#outline.enabled) {
            sceneTexture = this.#outline.render(gl, {canvasWidth: gl.canvas.width, canvasHeight: gl.canvas.height, gBuffer: this.#gBuffer, fullscreenQuad: this.#fullscreenQuad}, sceneTexture)
        }

        if (this.#volumetricFog.enabled) {
            sceneTexture = this.#volumetricFog.render(gl, {canvasWidth: gl.canvas.width, canvasHeight: gl.canvas.height, gBuffer: this.#gBuffer, camera3d: this.#camera3d, inverseVP: this.#inverseVP, lightDataTexture: this.#lightDataTexture, numLights, fogColor: this.#fogColor, fullscreenQuad: this.#fullscreenQuad}, sceneTexture)
        }

        const bloomCtx = {canvasWidth: gl.canvas.width, canvasHeight: gl.canvas.height, fullscreenQuad: this.#fullscreenQuad}

        if (this.#bloom.enabled) {
            this.#bloom.render(gl, bloomCtx, sceneTexture)
        }

        if (this.#cinematic.enabled) {
            this.#cinematic.render(gl, bloomCtx, sceneTexture, this.#volumetricFog.time)
        } else if (sceneTexture !== this.#outputTexture || needsOutputFBO) {
            this.#blitToScreen(gl, sceneTexture)
        }

        if (this.#bloom.enabled) {
            this.#bloom.composite(gl, bloomCtx)
        }
    }












    #blitToScreen (gl, texture) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
        gl.disable(gl.DEPTH_TEST)

        const program = this.#smaa.blendProgram
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


    #ensureOutputFBO (gl, width, height) {
        if (this.#outputFBO && this.#outputWidth === width && this.#outputHeight === height) {
            return
        }

        this.#deleteOutputFBO(gl)

        this.#outputTexture = createScreenTexture(gl, width, height)
        const depthRB = gl.createRenderbuffer()
        gl.bindRenderbuffer(gl.RENDERBUFFER, depthRB)
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT24, width, height)
        this.#outputFBO = gl.createFramebuffer()
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.#outputFBO)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.#outputTexture, 0)
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthRB)

        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        gl.bindRenderbuffer(gl.RENDERBUFFER, null)

        this.#outputWidth = width
        this.#outputHeight = height
    }


    #deleteOutputFBO (gl) {
        if (this.#outputFBO) {
            gl.deleteFramebuffer(this.#outputFBO)
            gl.deleteTexture(this.#outputTexture)
            this.#outputFBO = null
            this.#outputTexture = null
        }
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
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.R32F, 1, 1, 0, gl.RED, gl.FLOAT, new Float32Array([1.0]))
            }
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
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
            this.#deleteOutputFBO(this.context.gl)
            this.#smaa.dispose(this.context.gl)
        }
        this.#meshProgram = null
        this.#depthProgram = null
        this.#cubeDepthProgram = null
        this.#gbufferProgram = null
        this.#lightingProgram = null
        if (this.context?.gl) {
            this.#cinematic.dispose(this.context.gl)
            this.#outline.dispose(this.context.gl)
            this.#ssao.dispose(this.context.gl)
            this.#bloom.dispose(this.context.gl)
            this.#volumetricFog.dispose(this.context.gl)
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




