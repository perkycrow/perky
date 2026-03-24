import {doc, section, text, code} from '../../doc/runtime.js'


export default doc('WebGLPrimitiveRenderer', {advanced: true}, () => {

    text(`
        Base class for WebGL renderers that draw geometric primitives (circles,
        rectangles). Extends [[WebGLObjectRenderer@render/webgl]] with a shared vertex
        buffer and automatic primitive shader setup.

        Subclasses override \`renderObject(object, opacity)\` to emit vertices
        for their specific shape. The base \`flush()\` handles program binding
        and projection/view uniforms.
    `)


    section('How It Works', () => {

        text(`
            On \`init()\`, a GPU vertex buffer is created. When \`flush()\` is called,
            the primitive shader is bound with projection and view matrices, then
            each collected object is passed to \`renderObject()\`.

            Subclasses write vertices into the shared buffer and issue draw calls
            per object. See [[WebGLCircleRenderer@render/webgl]] and
            [[WebGLRectangleRenderer@render/webgl]] for concrete implementations.
        `)

        code('Subclass pattern', () => {
            class MyShapeRenderer extends WebGLPrimitiveRenderer {

                static get handles () {
                    return [MyShape]
                }

                renderObject (shape, opacity) {
                    const gl = this.gl
                    const program = this.context.primitiveProgram
                    const vertices = buildVertices(shape, opacity)

                    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW)
                    gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length / 6)
                }

            }
        })

    })


    section('Disposal', () => {

        text(`
            \`dispose()\` deletes the vertex buffer and calls through to
            the base class cleanup.
        `)

    })

})
