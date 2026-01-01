import WebGLPrimitiveRenderer from './webgl_primitive_renderer.js'
import {parseColor} from './color_utils.js'
import Rectangle from '../rectangle.js'


export default class WebGLRectangleRenderer extends WebGLPrimitiveRenderer {

    static get handles () {
        return [Rectangle]
    }


    renderObject (rect, opacity) {
        const gl = this.gl
        const program = this.context.primitiveProgram

        const offsetX = -rect.width * rect.anchorX
        const offsetY = -rect.height * rect.anchorY
        const m = rect.worldMatrix

        const corners = [
            {x: offsetX, y: offsetY},
            {x: offsetX + rect.width, y: offsetY},
            {x: offsetX + rect.width, y: offsetY + rect.height},
            {x: offsetX, y: offsetY + rect.height}
        ]

        const worldCorners = corners.map(corner => ({
            x: m[0] * corner.x + m[2] * corner.y + m[4],
            y: m[1] * corner.x + m[3] * corner.y + m[5]
        }))

        if (rect.color && rect.color !== 'transparent') {
            const color = parseColor(rect.color)
            const vertices = []

            for (const wc of worldCorners) {
                vertices.push(wc.x, wc.y, color.r, color.g, color.b, opacity)
            }

            const vertexData = new Float32Array(vertices)

            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
            gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.DYNAMIC_DRAW)

            const stride = 6 * 4
            gl.enableVertexAttribArray(program.attributes.aPosition)
            gl.vertexAttribPointer(program.attributes.aPosition, 2, gl.FLOAT, false, stride, 0)

            gl.enableVertexAttribArray(program.attributes.aColor)
            gl.vertexAttribPointer(program.attributes.aColor, 4, gl.FLOAT, false, stride, 2 * 4)

            gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)
        }

        if (rect.strokeWidth > 0) {
            const strokeColor = parseColor(rect.strokeColor)
            const vertices = []

            for (let i = 0; i < 4; i++) {
                const start = worldCorners[i]
                const end = worldCorners[(i + 1) % 4]
                vertices.push(
                    start.x, start.y, strokeColor.r, strokeColor.g, strokeColor.b, opacity,
                    end.x, end.y, strokeColor.r, strokeColor.g, strokeColor.b, opacity
                )
            }

            const vertexData = new Float32Array(vertices)

            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
            gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.DYNAMIC_DRAW)

            const stride = 6 * 4
            gl.enableVertexAttribArray(program.attributes.aPosition)
            gl.vertexAttribPointer(program.attributes.aPosition, 2, gl.FLOAT, false, stride, 0)

            gl.enableVertexAttribArray(program.attributes.aColor)
            gl.vertexAttribPointer(program.attributes.aColor, 4, gl.FLOAT, false, stride, 2 * 4)

            gl.lineWidth(rect.strokeWidth)
            gl.drawArrays(gl.LINES, 0, 8)
        }
    }

}
