import WebGLPrimitiveRenderer from './webgl_primitive_renderer.js'
import {parseColor} from './color_utils.js'
import Circle from '../circle.js'


export default class WebGLCircleRenderer extends WebGLPrimitiveRenderer {

    static get handles () {
        return [Circle]
    }


    renderObject (circle, opacity) {
        const gl = this.gl
        const program = this.context.primitiveProgram
        const segments = 32
        const radius = circle.radius
        const offsetX = -radius * 2 * circle.anchorX + radius
        const offsetY = -radius * 2 * circle.anchorY + radius

        const color = parseColor(circle.color)
        const m = circle.worldMatrix

        const vertices = []

        const centerX = m[0] * offsetX + m[2] * offsetY + m[4]
        const centerY = m[1] * offsetX + m[3] * offsetY + m[5]
        vertices.push(centerX, centerY, color.r, color.g, color.b, opacity)

        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2
            const x = offsetX + Math.cos(angle) * radius
            const y = offsetY + Math.sin(angle) * radius

            const worldX = m[0] * x + m[2] * y + m[4]
            const worldY = m[1] * x + m[3] * y + m[5]

            vertices.push(worldX, worldY, color.r, color.g, color.b, opacity)
        }

        const vertexData = new Float32Array(vertices)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.DYNAMIC_DRAW)

        const stride = 6 * 4
        gl.enableVertexAttribArray(program.attributes.aPosition)
        gl.vertexAttribPointer(program.attributes.aPosition, 2, gl.FLOAT, false, stride, 0)

        gl.enableVertexAttribArray(program.attributes.aColor)
        gl.vertexAttribPointer(program.attributes.aColor, 4, gl.FLOAT, false, stride, 2 * 4)

        gl.drawArrays(gl.TRIANGLE_FAN, 0, segments + 2)
    }

}
