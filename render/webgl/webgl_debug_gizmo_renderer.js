import WebGLObjectRenderer from './webgl_object_renderer.js'


export default class WebGLDebugGizmoRenderer extends WebGLObjectRenderer {

    #vertexBuffer = null
    #gizmoObjects = []

    static get handles () {
        return []
    }


    init (context) {
        super.init(context)
        this.#vertexBuffer = context.gl.createBuffer()
    }


    reset () {
        super.reset()
        this.#gizmoObjects = []
    }


    collectGizmo (object, opacity) {
        this.#gizmoObjects.push({object, opacity})
    }


    flush (matrices) {
        if (this.#gizmoObjects.length === 0) {
            return
        }

        const gl = this.gl
        const program = this.context.primitiveProgram

        gl.useProgram(program.program)
        gl.uniformMatrix3fv(program.uniforms.uProjectionMatrix, false, matrices.projectionMatrix)
        gl.uniformMatrix3fv(program.uniforms.uViewMatrix, false, matrices.viewMatrix)

        for (const {object, opacity} of this.#gizmoObjects) {
            this.renderGizmos(object, opacity)
        }
    }


    renderGizmos (object, opacity) {
        const gizmos = object.debugGizmos
        if (!gizmos) {
            return
        }

        const bounds = object.getBounds()
        const hasSize = bounds.width > 0 || bounds.height > 0
        const m = object.worldMatrix

        if (gizmos.bounds && hasSize) {
            this.renderBounds(m, bounds, opacity)
        }

        if (gizmos.anchor) {
            this.renderAnchor(m, object, bounds, opacity)
        }

        if (gizmos.pivot) {
            this.renderPivot(m, object, opacity)
        }

        if (gizmos.origin) {
            this.renderOrigin(m, opacity)
        }
    }


    renderBounds (m, bounds, opacity) {
        const corners = [
            {x: bounds.minX, y: bounds.minY},
            {x: bounds.maxX, y: bounds.minY},
            {x: bounds.maxX, y: bounds.maxY},
            {x: bounds.minX, y: bounds.maxY}
        ]

        const transformed = corners.map(p => ({
            x: m[0] * p.x + m[2] * p.y + m[4],
            y: m[1] * p.x + m[3] * p.y + m[5]
        }))

        const vertices = []
        const color = {r: 0, g: 1, b: 0}

        for (let i = 0; i < 4; i++) {
            const p1 = transformed[i]
            const p2 = transformed[(i + 1) % 4]
            vertices.push(p1.x, p1.y, color.r, color.g, color.b, opacity * 0.8)
            vertices.push(p2.x, p2.y, color.r, color.g, color.b, opacity * 0.8)
        }

        this.drawLines(vertices)
    }


    renderAnchor (m, object, bounds, opacity) {
        const anchorX = bounds.minX + object.anchorX * bounds.width
        const anchorY = bounds.minY + object.anchorY * bounds.height

        const worldX = m[0] * anchorX + m[2] * anchorY + m[4]
        const worldY = m[1] * anchorX + m[3] * anchorY + m[5]

        const size = 0.08
        const color = {r: 1, g: 1, b: 0}

        const vertices = [
            worldX - size, worldY, color.r, color.g, color.b, opacity,
            worldX + size, worldY, color.r, color.g, color.b, opacity,
            worldX, worldY - size, color.r, color.g, color.b, opacity,
            worldX, worldY + size, color.r, color.g, color.b, opacity
        ]

        this.drawLines(vertices)
        this.drawCircle({x: worldX, y: worldY, radius: size * 0.5, color, opacity: opacity * 0.5, segments: 12})
    }


    renderPivot (m, object, opacity) {
        const pivotX = object.pivotX
        const pivotY = object.pivotY

        const worldX = m[0] * pivotX + m[2] * pivotY + m[4]
        const worldY = m[1] * pivotX + m[3] * pivotY + m[5]

        const size = 0.06
        const color = {r: 1, g: 0, b: 1}

        const vertices = [
            worldX - size * 1.5, worldY, color.r, color.g, color.b, opacity,
            worldX + size * 1.5, worldY, color.r, color.g, color.b, opacity,
            worldX, worldY - size * 1.5, color.r, color.g, color.b, opacity,
            worldX, worldY + size * 1.5, color.r, color.g, color.b, opacity
        ]

        this.drawLines(vertices)
        this.drawCircleOutline({x: worldX, y: worldY, radius: size, color, opacity, segments: 16})
    }


    renderOrigin (m, opacity) {
        const originX = m[4]
        const originY = m[5]

        const size = 0.1
        const scaleX = Math.sqrt(m[0] * m[0] + m[1] * m[1])
        const scaleY = Math.sqrt(m[2] * m[2] + m[3] * m[3])

        const xAxisX = originX + (m[0] / scaleX) * size * 2
        const xAxisY = originY + (m[1] / scaleX) * size * 2
        const yAxisX = originX + (m[2] / scaleY) * size * 2
        const yAxisY = originY + (m[3] / scaleY) * size * 2

        const vertices = [
            originX, originY, 1, 0, 0, opacity,
            xAxisX, xAxisY, 1, 0, 0, opacity,
            originX, originY, 0, 1, 0, opacity,
            yAxisX, yAxisY, 0, 1, 0, opacity
        ]

        this.drawLines(vertices)
        this.drawCircle({x: originX, y: originY, radius: 0.03, color: {r: 1, g: 1, b: 1}, opacity, segments: 8})
    }


    drawLines (vertices) {
        const gl = this.gl
        const program = this.context.primitiveProgram

        const vertexData = new Float32Array(vertices)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.#vertexBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.DYNAMIC_DRAW)

        const stride = 6 * 4
        gl.enableVertexAttribArray(program.attributes.aPosition)
        gl.vertexAttribPointer(program.attributes.aPosition, 2, gl.FLOAT, false, stride, 0)

        gl.enableVertexAttribArray(program.attributes.aColor)
        gl.vertexAttribPointer(program.attributes.aColor, 4, gl.FLOAT, false, stride, 2 * 4)

        gl.drawArrays(gl.LINES, 0, vertices.length / 6)
    }


    drawCircle (options) {
        const {x: cx, y: cy, radius, color, opacity, segments} = options
        const gl = this.gl
        const program = this.context.primitiveProgram

        const vertices = [cx, cy, color.r, color.g, color.b, opacity]

        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2
            const x = cx + Math.cos(angle) * radius
            const y = cy + Math.sin(angle) * radius
            vertices.push(x, y, color.r, color.g, color.b, opacity)
        }

        const vertexData = new Float32Array(vertices)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.#vertexBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.DYNAMIC_DRAW)

        const stride = 6 * 4
        gl.enableVertexAttribArray(program.attributes.aPosition)
        gl.vertexAttribPointer(program.attributes.aPosition, 2, gl.FLOAT, false, stride, 0)

        gl.enableVertexAttribArray(program.attributes.aColor)
        gl.vertexAttribPointer(program.attributes.aColor, 4, gl.FLOAT, false, stride, 2 * 4)

        gl.drawArrays(gl.TRIANGLE_FAN, 0, segments + 2)
    }


    drawCircleOutline (options) {
        const {x: cx, y: cy, radius, color, opacity, segments} = options
        const vertices = []

        for (let i = 0; i < segments; i++) {
            const angle1 = (i / segments) * Math.PI * 2
            const angle2 = ((i + 1) / segments) * Math.PI * 2

            const x1 = cx + Math.cos(angle1) * radius
            const y1 = cy + Math.sin(angle1) * radius
            const x2 = cx + Math.cos(angle2) * radius
            const y2 = cy + Math.sin(angle2) * radius

            vertices.push(x1, y1, color.r, color.g, color.b, opacity)
            vertices.push(x2, y2, color.r, color.g, color.b, opacity)
        }

        this.drawLines(vertices)
    }


    dispose () {
        if (this.#vertexBuffer) {
            this.gl.deleteBuffer(this.#vertexBuffer)
            this.#vertexBuffer = null
        }
        this.#gizmoObjects = []
        super.dispose()
    }

}
