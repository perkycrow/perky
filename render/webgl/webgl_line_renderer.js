import WebGLPrimitiveRenderer from './webgl_primitive_renderer.js'
import {parseColor} from './color_utils.js'
import Line from '../line.js'


export default class WebGLLineRenderer extends WebGLPrimitiveRenderer {

    static get handles () {
        return [Line]
    }


    renderObject (line, opacity) {
        const gl = this.gl
        const program = this.context.primitiveProgram

        const color = parseColor(line.color)
        const m = line.worldMatrix

        const x1 = m[4]
        const y1 = m[5]

        const x2 = m[0] * line.x2 + m[2] * line.y2 + m[4]
        const y2 = m[1] * line.x2 + m[3] * line.y2 + m[5]

        const dx = x2 - x1
        const dy = y2 - y1
        const len = Math.sqrt(dx * dx + dy * dy)

        if (len === 0) {
            return
        }

        const nx = (-dy / len) * line.lineWidth * 0.5
        const ny = (dx / len) * line.lineWidth * 0.5

        const vertices = new Float32Array([
            x1 + nx, y1 + ny, color.r, color.g, color.b, opacity,
            x1 - nx, y1 - ny, color.r, color.g, color.b, opacity,
            x2 + nx, y2 + ny, color.r, color.g, color.b, opacity,
            x2 - nx, y2 - ny, color.r, color.g, color.b, opacity
        ])

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW)

        const stride = 6 * 4
        gl.enableVertexAttribArray(program.attributes.aPosition)
        gl.vertexAttribPointer(program.attributes.aPosition, 2, gl.FLOAT, false, stride, 0)

        gl.enableVertexAttribArray(program.attributes.aColor)
        gl.vertexAttribPointer(program.attributes.aColor, 4, gl.FLOAT, false, stride, 2 * 4)

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }

}
