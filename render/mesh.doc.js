import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import Mesh from './mesh.js'
import Geometry from './geometry.js'


export default doc('Mesh', () => {

    text(`
        GPU-side mesh for WebGL rendering. Uploads [[Geometry@render]] data
        to GPU buffers (VAO) and provides draw commands. Handles positions,
        normals, UVs, indices, and optionally tangents and vertex colors.
    `)


    section('Creating a Mesh', () => {

        text('Create a mesh from geometry and a WebGL context.')

        code('Basic usage', () => {
            const geometry = Geometry.createBox(1, 1, 1)
            const mesh = new Mesh({gl, geometry})
        })

        code('From any geometry', () => {
            const boxMesh = new Mesh({gl, geometry: Geometry.createBox()})
            const sphereMesh = new Mesh({gl, geometry: Geometry.createSphere()})
            const planeMesh = new Mesh({gl, geometry: Geometry.createPlane()})
        })

    })


    section('Drawing', () => {

        text(`
            Call draw() to render the mesh. Binds the VAO, issues a drawElements
            call, then unbinds. For manual control, use bind() and unbind().
        `)

        code('Simple draw', () => {
            mesh.draw()
        })

        code('Manual binding', () => {
            mesh.bind()
            gl.drawElements(gl.TRIANGLES, mesh.indexCount, gl.UNSIGNED_SHORT, 0)
            mesh.unbind()
        })

    })


    section('Properties', () => {

        text('Query mesh state and buffer information.')

        code('Available properties', () => {
            mesh.indexCount
            mesh.hasColors
            mesh.disposed
        })

    })


    section('Disposal', () => {

        text(`
            Call dispose() to release GPU resources. After disposal, the mesh
            cannot be used for rendering.
        `)

        code('Cleanup', () => {
            mesh.dispose()
        })

    })


    section('API', () => {

        code('Constructor', () => {
            const mesh = new Mesh({
                gl: WebGL2RenderingContext,
                geometry: Geometry
            })
        })

        code('Properties', () => {
            mesh.indexCount
            mesh.hasColors
            mesh.disposed
        })

        code('Methods', () => {
            mesh.bind()
            mesh.unbind()
            mesh.draw()
            mesh.dispose()
        })

    })

})
