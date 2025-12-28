import WebGLObjectRenderer from './webgl_object_renderer'


export default class WebGLPrimitiveRenderer extends WebGLObjectRenderer {

    #collected = []
    #vertexBuffer = null


    get vertexBuffer () {
        return this.#vertexBuffer
    }


    get collected () {
        return this.#collected
    }


    init (context) {
        super.init(context)
        this.#vertexBuffer = context.gl.createBuffer()
    }


    reset () {
        this.#collected = []
    }


    collect (object, opacity) {
        this.#collected.push({object, opacity})
    }


    flush (matrices) {
        if (this.#collected.length === 0) {
            return
        }

        const gl = this.gl
        const program = this.context.primitiveProgram

        gl.useProgram(program.program)
        gl.uniformMatrix3fv(program.uniforms.projectionMatrix, false, matrices.projectionMatrix)
        gl.uniformMatrix3fv(program.uniforms.viewMatrix, false, matrices.viewMatrix)

        for (const {object, opacity} of this.#collected) {
            this.renderObject(object, opacity)
        }
    }


    renderObject (object, opacity) {
        // Override in subclass
    }


    dispose () {
        if (this.#vertexBuffer) {
            this.gl.deleteBuffer(this.#vertexBuffer)
            this.#vertexBuffer = null
        }
        super.dispose()
    }

}
