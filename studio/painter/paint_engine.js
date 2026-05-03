import ShaderProgram from '../../render/shaders/shader_program.js'


const STAMP_VERTEX = `#version 300 es
in vec2 a_position;
uniform vec2 u_center;
uniform float u_size;
uniform vec2 u_resolution;
out vec2 v_uv;

void main() {
    v_uv = a_position;
    vec2 pixel = u_center + (a_position - 0.5) * u_size;
    vec2 clip = (pixel / u_resolution) * 2.0 - 1.0;
    clip.y = -clip.y;
    gl_Position = vec4(clip, 0.0, 1.0);
}`


const STAMP_FRAGMENT = `#version 300 es
precision mediump float;
in vec2 v_uv;
uniform vec4 u_color;
uniform float u_hardness;
uniform float u_flow;
uniform float u_pressure;
out vec4 fragColor;

void main() {
    float dist = length(v_uv - 0.5) * 2.0;
    if (dist > 1.0) discard;
    float alpha = 1.0 - smoothstep(u_hardness, 1.0, dist);
    alpha *= u_flow * u_pressure;
    fragColor = vec4(u_color.rgb * alpha, alpha);
}`


const COMPOSITE_VERTEX = `#version 300 es
in vec2 a_position;
out vec2 v_uv;

void main() {
    v_uv = a_position;
    vec2 clip = a_position * 2.0 - 1.0;
    gl_Position = vec4(clip, 0.0, 1.0);
}`


const COMPOSITE_FRAGMENT = `#version 300 es
precision mediump float;
in vec2 v_uv;
uniform sampler2D u_texture;
uniform float u_opacity;
out vec4 fragColor;

void main() {
    vec4 color = texture(u_texture, v_uv);
    fragColor = color * u_opacity;
}`


const DEFAULT_BRUSH = {
    size: 20,
    hardness: 0.8,
    opacity: 1.0,
    flow: 0.8,
    spacing: 0.05,
    smoothing: 0.9,
    color: [0, 0, 0, 1]
}


export default class PaintEngine {

    #gl
    #stampShader
    #compositeShader
    #vao
    #canvas
    #lastPoint
    #smoothedPoint
    #remainder
    #brush
    #layers
    #activeLayerIndex

    constructor (canvas) {
        this.#canvas = canvas
        this.#gl = canvas.getContext('webgl2', {
            premultipliedAlpha: true
        })
        this.#lastPoint = null
        this.#smoothedPoint = null
        this.#remainder = 0
        this.#brush = {...DEFAULT_BRUSH}
        this.#layers = []
        this.#activeLayerIndex = 0
        this.#initShaders()
        this.#initGeometry()
        this.#setupBlending()
        this.addLayer()
    }


    get gl () {
        return this.#gl
    }


    get brush () {
        return {...this.#brush}
    }


    get layerCount () {
        return this.#layers.length
    }


    get activeLayerIndex () {
        return this.#activeLayerIndex
    }


    set activeLayerIndex (index) {
        if (index >= 0 && index < this.#layers.length) {
            this.#activeLayerIndex = index
        }
    }


    setBrush (params = {}) {
        Object.assign(this.#brush, params)
    }


    getLayerInfo (index) {
        const layer = this.#layers[index]
        if (!layer) {
            return null
        }
        return {name: layer.name, opacity: layer.opacity, visible: layer.visible}
    }


    addLayer () {
        const gl = this.#gl
        const layer = createLayerFBO(gl, this.#canvas.width, this.#canvas.height)
        layer.name = `Layer ${this.#layers.length + 1}`
        layer.opacity = 1.0
        layer.visible = true
        this.#layers.push(layer)
        this.composite()
        return this.#layers.length - 1
    }


    removeLayer (index) {
        if (this.#layers.length <= 1) {
            return
        }
        const layer = this.#layers[index]
        if (!layer) {
            return
        }
        destroyLayerFBO(this.#gl, layer)
        this.#layers.splice(index, 1)
        if (this.#activeLayerIndex >= this.#layers.length) {
            this.#activeLayerIndex = this.#layers.length - 1
        }
        this.composite()
    }


    moveLayer (fromIndex, toIndex) {
        if (fromIndex < 0 || fromIndex >= this.#layers.length) {
            return
        }
        if (toIndex < 0 || toIndex >= this.#layers.length) {
            return
        }
        const layer = this.#layers.splice(fromIndex, 1)[0]
        this.#layers.splice(toIndex, 0, layer)
        if (this.#activeLayerIndex === fromIndex) {
            this.#activeLayerIndex = toIndex
        }
        this.composite()
    }


    setLayerOpacity (index, opacity) {
        const layer = this.#layers[index]
        if (!layer) {
            return
        }
        layer.opacity = opacity
        this.composite()
    }


    setLayerVisible (index, visible) {
        const layer = this.#layers[index]
        if (!layer) {
            return
        }
        layer.visible = visible
        this.composite()
    }


    setLayerName (index, name) {
        const layer = this.#layers[index]
        if (layer) {
            layer.name = name
        }
    }


    beginStroke (x, y, pressure = 1) {
        this.#lastPoint = {x, y, pressure}
        this.#smoothedPoint = {x, y, pressure}
        this.#remainder = 0
        this.#stamp(x, y, pressure)
        this.composite()
    }


    continueStroke (x, y, pressure = 1) {
        if (!this.#lastPoint) {
            return
        }

        const smoothed = smoothPoint(this.#smoothedPoint, {x, y, pressure}, this.#brush.smoothing)
        this.#smoothedPoint = smoothed

        const step = Math.max(this.#brush.size * this.#brush.spacing, 2)
        const result = interpolateStroke(this.#lastPoint, smoothed, step, this.#remainder)

        for (const s of result.stamps) {
            this.#stamp(s.x, s.y, s.pressure)
        }

        this.#remainder = result.remainder
        this.#lastPoint = smoothed

        if (result.stamps.length > 0) {
            this.composite()
        }
    }


    endStroke () {
        this.#lastPoint = null
        this.#smoothedPoint = null
        this.#remainder = 0
    }


    clear () {
        const gl = this.#gl
        const layer = this.#layers[this.#activeLayerIndex]
        if (!layer) {
            return
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, layer.fbo)
        gl.clearColor(0, 0, 0, 0)
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        this.composite()
    }


    composite () {
        const gl = this.#gl

        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        gl.clearColor(1, 1, 1, 1)
        gl.clear(gl.COLOR_BUFFER_BIT)

        this.#compositeShader.use()
        gl.bindVertexArray(this.#vao)

        for (const layer of this.#layers) {
            if (!layer.visible) {
                continue
            }
            gl.activeTexture(gl.TEXTURE0)
            gl.bindTexture(gl.TEXTURE_2D, layer.texture)
            this.#compositeShader
                .setUniform1i('u_texture', 0)
                .setUniform1f('u_opacity', layer.opacity)
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
        }

        gl.bindVertexArray(null)
    }


    resize (width, height) {
        const gl = this.#gl
        const dpr = globalThis.devicePixelRatio || 1
        this.#canvas.width = Math.round(width * dpr)
        this.#canvas.height = Math.round(height * dpr)
        this.#canvas.style.width = width + 'px'
        this.#canvas.style.height = height + 'px'
        gl.viewport(0, 0, this.#canvas.width, this.#canvas.height)

        for (const layer of this.#layers) {
            resizeLayerFBO(gl, layer, this.#canvas.width, this.#canvas.height)
        }

        this.composite()
    }


    dispose () {
        const gl = this.#gl
        for (const layer of this.#layers) {
            destroyLayerFBO(gl, layer)
        }
        this.#layers = []
        this.#stampShader.dispose()
        this.#compositeShader.dispose()
        gl.deleteVertexArray(this.#vao)
        this.#gl = null
    }


    #stamp (x, y, pressure) {
        const gl = this.#gl
        const layer = this.#layers[this.#activeLayerIndex]
        if (!layer) {
            return
        }

        const dpr = globalThis.devicePixelRatio || 1

        gl.bindFramebuffer(gl.FRAMEBUFFER, layer.fbo)

        this.#stampShader.use()
            .setUniform2f('u_center', x * dpr, y * dpr)
            .setUniform1f('u_size', this.#brush.size * dpr)
            .setUniform2f('u_resolution', this.#canvas.width, this.#canvas.height)
            .setUniform4f('u_color', this.#brush.color)
            .setUniform1f('u_hardness', this.#brush.hardness)
            .setUniform1f('u_flow', this.#brush.flow * this.#brush.opacity)
            .setUniform1f('u_pressure', pressure)

        gl.bindVertexArray(this.#vao)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
        gl.bindVertexArray(null)
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    }


    #initShaders () {
        this.#stampShader = new ShaderProgram(this.#gl, STAMP_VERTEX, STAMP_FRAGMENT)
        this.#stampShader
            .registerAttribute('a_position')
            .registerUniform('u_center')
            .registerUniform('u_size')
            .registerUniform('u_resolution')
            .registerUniform('u_color')
            .registerUniform('u_hardness')
            .registerUniform('u_flow')
            .registerUniform('u_pressure')

        this.#compositeShader = new ShaderProgram(this.#gl, COMPOSITE_VERTEX, COMPOSITE_FRAGMENT)
        this.#compositeShader
            .registerAttribute('a_position')
            .registerUniform('u_texture')
            .registerUniform('u_opacity')
    }


    #initGeometry () {
        const gl = this.#gl
        const vertices = new Float32Array([0, 0, 1, 0, 0, 1, 1, 1])

        this.#vao = gl.createVertexArray()
        gl.bindVertexArray(this.#vao)

        const buffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

        const posLoc = this.#stampShader.attributes.a_position
        gl.enableVertexAttribArray(posLoc)
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

        gl.bindVertexArray(null)
    }


    #setupBlending () {
        const gl = this.#gl
        gl.enable(gl.BLEND)
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    }

}


function createLayerFBO (gl, width, height) {
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

    const fbo = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)

    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    return {fbo, texture}
}


function resizeLayerFBO (gl, layer, width, height) {
    gl.bindTexture(gl.TEXTURE_2D, layer.texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)

    gl.bindFramebuffer(gl.FRAMEBUFFER, layer.fbo)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
}


function destroyLayerFBO (gl, layer) {
    gl.deleteFramebuffer(layer.fbo)
    gl.deleteTexture(layer.texture)
}


export function smoothPoint (previous, current, smoothing) {
    const factor = 1 - smoothing
    return {
        x: previous.x + (current.x - previous.x) * factor,
        y: previous.y + (current.y - previous.y) * factor,
        pressure: previous.pressure + (current.pressure - previous.pressure) * factor
    }
}


export function interpolateStroke (from, to, step, remainder = 0) {
    if (step <= 0) {
        return {stamps: [], remainder: 0}
    }

    const dx = to.x - from.x
    const dy = to.y - from.y
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist === 0) {
        return {stamps: [], remainder}
    }

    const stamps = []
    let traveled = step - remainder

    while (traveled <= dist) {
        const t = traveled / dist
        stamps.push({
            x: from.x + dx * t,
            y: from.y + dy * t,
            pressure: from.pressure + (to.pressure - from.pressure) * t
        })
        traveled += step
    }

    const newRemainder = stamps.length > 0
        ? dist - (traveled - step)
        : remainder + dist

    return {stamps, remainder: newRemainder}
}
