import WebGLObjectRenderer from './webgl_object_renderer'


export default class WebGLPrimitiveRenderer extends WebGLObjectRenderer {

    #vertexBuffer = null


    get vertexBuffer () {
        return this.#vertexBuffer
    }


    init (context) {
        super.init(context)
        this.#vertexBuffer = context.gl.createBuffer()
    }


    flush (matrices) {
        if (this.collected.length === 0) {
            return
        }

        const gl = this.gl
        const program = this.context.primitiveProgram

        gl.useProgram(program.program)
        gl.uniformMatrix3fv(program.uniforms.uProjectionMatrix, false, matrices.projectionMatrix)
        gl.uniformMatrix3fv(program.uniforms.uViewMatrix, false, matrices.viewMatrix)

        for (const {object, opacity} of this.collected) {
            this.renderObject(object, opacity)
        }
    }


    renderObject () { // eslint-disable-line class-methods-use-this
    }


    dispose () {
        if (this.#vertexBuffer) {
            this.gl.deleteBuffer(this.#vertexBuffer)
            this.#vertexBuffer = null
        }
        super.dispose()
    }

}
