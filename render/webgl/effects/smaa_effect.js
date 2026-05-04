import {SMAA_EDGE_SHADER_DEF, SMAA_WEIGHT_SHADER_DEF, SMAA_BLEND_SHADER_DEF} from '../../shaders/builtin/smaa_shader.js'
import {SMAA_AREA_TEXTURE, SMAA_SEARCH_TEXTURE} from '../../smaa_lookup_textures.js'
import {createScreenTexture, createFBO} from './texture_helpers.js'


export default class SmaaEffect {

    #edgeProgram = null
    #weightProgram = null
    #blendProgram = null
    #enabled = true
    #ready = false
    #edgesFBO = null
    #edgesTexture = null
    #weightsFBO = null
    #weightsTexture = null
    #outputFBO = null
    #outputTexture = null
    #areaTexture = null
    #searchTexture = null
    #fboWidth = 0
    #fboHeight = 0

    get enabled () {
        return this.#enabled
    }


    set enabled (v) {
        this.#enabled = v
    }


    get ready () {
        return this.#ready
    }


    get blendProgram () {
        return this.#blendProgram
    }


    init (shaderRegistry, gl) {
        this.#edgeProgram = shaderRegistry.register('smaaEdge', SMAA_EDGE_SHADER_DEF)
        this.#weightProgram = shaderRegistry.register('smaaWeight', SMAA_WEIGHT_SHADER_DEF)
        this.#blendProgram = shaderRegistry.register('smaaBlend', SMAA_BLEND_SHADER_DEF)
        this.#loadTextures(gl)
    }


    render (gl, ctx, inputTexture) {
        const w = ctx.canvasWidth
        const h = ctx.canvasHeight
        const tx = 1 / w
        const ty = 1 / h

        this.#ensureFBOs(gl, w, h)

        gl.disable(gl.DEPTH_TEST)

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.#edgesFBO)
        gl.viewport(0, 0, w, h)
        gl.clearColor(0.0, 0.0, 0.0, 0.0)
        gl.clear(gl.COLOR_BUFFER_BIT)
        const edgeProg = this.#edgeProgram
        gl.useProgram(edgeProg.program)
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, inputTexture)
        gl.uniform1i(edgeProg.uniforms.uColorTexture, 0)
        gl.uniform2f(edgeProg.uniforms.uTexelSize, tx, ty)
        ctx.fullscreenQuad.draw(gl, edgeProg)

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.#weightsFBO)
        gl.viewport(0, 0, w, h)
        gl.clear(gl.COLOR_BUFFER_BIT)
        const weightProg = this.#weightProgram
        gl.useProgram(weightProg.program)
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, this.#edgesTexture)
        gl.uniform1i(weightProg.uniforms.uEdgesTexture, 0)
        gl.activeTexture(gl.TEXTURE1)
        gl.bindTexture(gl.TEXTURE_2D, this.#areaTexture)
        gl.uniform1i(weightProg.uniforms.uAreaTexture, 1)
        gl.activeTexture(gl.TEXTURE2)
        gl.bindTexture(gl.TEXTURE_2D, this.#searchTexture)
        gl.uniform1i(weightProg.uniforms.uSearchTexture, 2)
        gl.uniform2f(weightProg.uniforms.uTexelSize, tx, ty)
        gl.uniform2f(weightProg.uniforms.uViewportSize, w, h)
        ctx.fullscreenQuad.draw(gl, weightProg)

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.#outputFBO)
        gl.viewport(0, 0, w, h)
        const blendProg = this.#blendProgram
        gl.useProgram(blendProg.program)
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, inputTexture)
        gl.uniform1i(blendProg.uniforms.uColorTexture, 0)
        gl.activeTexture(gl.TEXTURE1)
        gl.bindTexture(gl.TEXTURE_2D, this.#weightsTexture)
        gl.uniform1i(blendProg.uniforms.uBlendTexture, 1)
        gl.uniform2f(blendProg.uniforms.uTexelSize, tx, ty)
        ctx.fullscreenQuad.draw(gl, blendProg)

        gl.enable(gl.DEPTH_TEST)

        return this.#outputTexture
    }


    #ensureFBOs (gl, width, height) {
        if (this.#edgesFBO && this.#fboWidth === width && this.#fboHeight === height) {
            return
        }

        this.#deleteFBOs(gl)

        this.#edgesTexture = createScreenTexture(gl, width, height)
        this.#edgesFBO = createFBO(gl, this.#edgesTexture)

        this.#weightsTexture = createScreenTexture(gl, width, height)
        this.#weightsFBO = createFBO(gl, this.#weightsTexture)

        this.#outputTexture = createScreenTexture(gl, width, height)
        this.#outputFBO = createFBO(gl, this.#outputTexture)

        this.#fboWidth = width
        this.#fboHeight = height
    }


    #deleteFBOs (gl) {
        if (this.#edgesFBO) {
            gl.deleteFramebuffer(this.#edgesFBO)
            gl.deleteTexture(this.#edgesTexture)
            this.#edgesFBO = null
            this.#edgesTexture = null
        }
        if (this.#weightsFBO) {
            gl.deleteFramebuffer(this.#weightsFBO)
            gl.deleteTexture(this.#weightsTexture)
            this.#weightsFBO = null
            this.#weightsTexture = null
        }
        if (this.#outputFBO) {
            gl.deleteFramebuffer(this.#outputFBO)
            gl.deleteTexture(this.#outputTexture)
            this.#outputFBO = null
            this.#outputTexture = null
        }
    }


    #loadTextures (gl) {
        Promise.all([
            loadImage(SMAA_AREA_TEXTURE),
            loadImage(SMAA_SEARCH_TEXTURE)
        ]).then(([areaImg, searchImg]) => {
            this.#areaTexture = createLookupTexture(gl, areaImg, gl.LINEAR)
            this.#searchTexture = createLookupTexture(gl, searchImg, gl.NEAREST)
            this.#ready = true
        })
    }


    dispose (gl) {
        this.#deleteFBOs(gl)

        if (this.#areaTexture) {
            gl.deleteTexture(this.#areaTexture)
            this.#areaTexture = null
        }
        if (this.#searchTexture) {
            gl.deleteTexture(this.#searchTexture)
            this.#searchTexture = null
        }

        this.#edgeProgram = null
        this.#weightProgram = null
        this.#blendProgram = null
        this.#ready = false
    }

}


function loadImage (src) {
    const img = new Image()
    img.src = src
    return new Promise(resolve => {
        img.onload = () => resolve(img)
    })
}


function createLookupTexture (gl, image, filter) {
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.bindTexture(gl.TEXTURE_2D, null)
    return texture
}
