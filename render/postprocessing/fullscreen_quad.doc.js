import {doc, section, text, code} from '../../doc/runtime.js'
import FullscreenQuad from './fullscreen_quad.js'


export default doc('FullscreenQuad', {advanced: true}, () => {

    text(`
        A screen-filling quad used to apply post-processing shaders. Creates two vertex
        buffers (position and texture coordinates) and draws them as a triangle strip.
    `)


    section('Usage', () => {

        text(`
            Create once, reuse across all passes. The \`draw()\` method binds the buffers,
            sets up vertex attributes (\`aPosition\` and \`aTexCoord\`), and issues a draw call.
        `)

        code('Draw a fullscreen pass', () => {
            const quad = new FullscreenQuad(gl)

            program.use()
            gl.activeTexture(gl.TEXTURE0)
            gl.bindTexture(gl.TEXTURE_2D, inputTexture)
            program.setUniform1i('uTexture', 0)

            quad.draw(gl, program)
        })

    })


    section('Disposal', () => {

        text('Delete the GPU buffers when no longer needed.')

        code('Clean up', () => {
            quad.dispose(gl)
        })

    })

})
