import ShaderProgram from '../../render/shaders/shader_program.js'


const VERTEX_SOURCE = `#version 300 es
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


const FRAGMENT_SOURCE = `#version 300 es
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


const DEFAULT_BRUSH = {
    size: 20,
    hardness: 0.8,
    opacity: 1.0,
    flow: 0.8,
    spacing: 0.15,
    smoothing: 0.9,
    color: [0, 0, 0, 1]
}


export default class PaintEngine {

    #gl
    #shader
    #vao
    #canvas
    #lastPoint
    #smoothedPoint
    #remainder
    #brush

    constructor (canvas) {
        this.#canvas = canvas
        this.#gl = canvas.getContext('webgl2', {
            preserveDrawingBuffer: true,
            premultipliedAlpha: true
        })
        this.#lastPoint = null
        this.#smoothedPoint = null
        this.#remainder = 0
        this.#brush = {...DEFAULT_BRUSH}
        this.#initShader()
        this.#initGeometry()
        this.#setupBlending()
    }


    get gl () {
        return this.#gl
    }


    get brush () {
        return {...this.#brush}
    }


    setBrush (params = {}) {
        Object.assign(this.#brush, params)
    }


    beginStroke (x, y, pressure = 1) {
        this.#lastPoint = {x, y, pressure}
        this.#smoothedPoint = {x, y, pressure}
        this.#remainder = 0
        this.#stamp(x, y, pressure)
    }


    continueStroke (x, y, pressure = 1) {
        if (!this.#lastPoint) {
            return
        }

        const smoothed = smoothPoint(this.#smoothedPoint, {x, y, pressure}, this.#brush.smoothing)
        this.#smoothedPoint = smoothed

        const step = this.#brush.size * this.#brush.spacing
        const result = interpolateStroke(this.#lastPoint, smoothed, step, this.#remainder)

        for (const s of result.stamps) {
            this.#stamp(s.x, s.y, s.pressure)
        }

        this.#remainder = result.remainder
        this.#lastPoint = smoothed
    }


    endStroke () {
        this.#lastPoint = null
        this.#smoothedPoint = null
        this.#remainder = 0
    }


    clear (r = 1, g = 1, b = 1) {
        const gl = this.#gl
        gl.clearColor(r, g, b, 1)
        gl.clear(gl.COLOR_BUFFER_BIT)
    }


    resize (width, height) {
        const dpr = globalThis.devicePixelRatio || 1
        this.#canvas.width = Math.round(width * dpr)
        this.#canvas.height = Math.round(height * dpr)
        this.#canvas.style.width = width + 'px'
        this.#canvas.style.height = height + 'px'
        this.#gl.viewport(0, 0, this.#canvas.width, this.#canvas.height)
    }


    dispose () {
        this.#shader.dispose()
        this.#gl.deleteVertexArray(this.#vao)
        this.#gl = null
    }


    #stamp (x, y, pressure) {
        const gl = this.#gl
        const dpr = globalThis.devicePixelRatio || 1

        this.#shader.use()
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
    }


    #initShader () {
        this.#shader = new ShaderProgram(this.#gl, VERTEX_SOURCE, FRAGMENT_SOURCE)
        this.#shader
            .registerAttribute('a_position')
            .registerUniform('u_center')
            .registerUniform('u_size')
            .registerUniform('u_resolution')
            .registerUniform('u_color')
            .registerUniform('u_hardness')
            .registerUniform('u_flow')
            .registerUniform('u_pressure')
    }


    #initGeometry () {
        const gl = this.#gl
        const vertices = new Float32Array([0, 0, 1, 0, 0, 1, 1, 1])

        this.#vao = gl.createVertexArray()
        gl.bindVertexArray(this.#vao)

        const buffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

        const posLoc = this.#shader.attributes.a_position
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
