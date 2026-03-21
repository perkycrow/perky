import {doc, section, text, code} from '../doc/runtime.js'


export default doc('LineMesh', () => {

    text(`
        GPU-side mesh for rendering lines in WebGL. Uploads position data
        to GPU buffers (VAO) and provides draw commands using GL_LINES.
    `)


    section('Creating a LineMesh', () => {

        text('Create a line mesh from position data and a WebGL context.')

        code('Basic usage', () => {
            const positions = new Float32Array([
                0, 0, 0,
                1, 0, 0,
                1, 0, 0,
                1, 1, 0
            ])
            const lineMesh = new LineMesh({gl, positions})
        })

        code('Multiple line segments', () => {
            const positions = new Float32Array([
                0, 0, 0, 1, 0, 0,
                0, 1, 0, 1, 1, 0,
                0, 2, 0, 1, 2, 0
            ])
            const lineMesh = new LineMesh({gl, positions})
        })

    })


    section('Drawing', () => {

        text(`
            Call draw() to render the line mesh. Binds the VAO, issues a
            drawArrays call with GL_LINES, then unbinds.
        `)

        code('Simple draw', () => {
            lineMesh.draw()
        })

        code('Manual binding', () => {
            lineMesh.bind()
            gl.drawArrays(gl.LINES, 0, lineMesh.vertexCount)
            lineMesh.unbind()
        })

    })


    section('Properties', () => {

        text('Query mesh state.')

        code('Available properties', () => {
            lineMesh.vertexCount
            lineMesh.disposed
        })

    })


    section('Disposal', () => {

        text(`
            Call dispose() to release GPU resources. After disposal, the mesh
            cannot be used for rendering.
        `)

        code('Cleanup', () => {
            lineMesh.dispose()
        })

    })


    section('API', () => {

        code('Constructor', () => {
            const lineMesh = new LineMesh({
                gl: WebGL2RenderingContext,
                positions: Float32Array
            })
        })

        code('Properties', () => {
            lineMesh.vertexCount
            lineMesh.disposed
        })

        code('Methods', () => {
            lineMesh.bind()
            lineMesh.unbind()
            lineMesh.draw()
            lineMesh.dispose()
        })

    })

})
