import LineMesh from '../render/line_mesh.js'
import {brushWirePositions} from '../forge/wire_geometry.js'
import {gizmoArrowPositions, GIZMO_AXES} from '../forge/forge_gizmo.js'
import {rotationRingPositions, ROTATION_AXES, ROTATION_RING_SEGMENTS} from '../forge/forge_rotation_gizmo.js'


const DEFAULT_WIREFRAME_COLOR = [0.6, 0.6, 0.6]


export default class ForgeOverlays {

    #gl
    #wireProgram
    #wireframes = []
    #gizmoLines = []
    #rotationRings = []
    #gridMinor
    #gridMajor

    constructor ({gl, wireProgram, gridSize, gridStep}) {
        this.#gl = gl
        this.#wireProgram = wireProgram
        this.#gridMinor = new LineMesh({gl, positions: buildGridPositions(gridSize, gridStep)})
        this.#gridMajor = new LineMesh({gl, positions: buildGridPositions(gridSize, 1)})
    }


    rebuildWireframes (brushSet) {
        this.#disposeWireframes()

        for (let i = 0; i < brushSet.count; i++) {
            const brush = brushSet.get(i)
            const positions = brushWirePositions(brush)
            const lineMesh = new LineMesh({gl: this.#gl, positions})
            const isWhite = brush.color[0] === 1 && brush.color[1] === 1 && brush.color[2] === 1
            const color = isWhite ? DEFAULT_WIREFRAME_COLOR : brush.color
            this.#wireframes.push({lineMesh, color})
        }
    }


    rebuildGizmo (brush) {
        this.disposeGizmo()

        if (!brush) {
            return
        }

        const positions = gizmoArrowPositions(brush.position)

        for (let i = 0; i < 3; i++) {
            const arrowPositions = new Float32Array([
                positions[i * 6], positions[i * 6 + 1], positions[i * 6 + 2],
                positions[i * 6 + 3], positions[i * 6 + 4], positions[i * 6 + 5]
            ])
            this.#gizmoLines.push(new LineMesh({gl: this.#gl, positions: arrowPositions}))
        }

        const ringPositions = rotationRingPositions(brush.position)
        const segPerRing = ROTATION_RING_SEGMENTS * 6

        for (let i = 0; i < 3; i++) {
            const ringData = ringPositions.slice(i * segPerRing, (i + 1) * segPerRing)
            this.#rotationRings.push(new LineMesh({gl: this.#gl, positions: ringData}))
        }
    }


    disposeGizmo () {
        for (const lineMesh of this.#gizmoLines) {
            lineMesh.dispose()
        }
        this.#gizmoLines = []

        for (const lineMesh of this.#rotationRings) {
            lineMesh.dispose()
        }
        this.#rotationRings = []
    }


    draw (camera3d) {
        const gl = this.#gl
        const program = this.#wireProgram

        gl.useProgram(program.program)
        gl.uniformMatrix4fv(program.uniforms.uProjection, false, camera3d.projectionMatrix.elements)
        gl.uniformMatrix4fv(program.uniforms.uView, false, camera3d.viewMatrix.elements)

        gl.uniform3fv(program.uniforms.uColor, [1, 1, 1])

        gl.uniform1f(program.uniforms.uOpacity, 0.08)
        this.#gridMinor.draw()

        gl.uniform1f(program.uniforms.uOpacity, 0.2)
        this.#gridMajor.draw()

        for (const {lineMesh, color} of this.#wireframes) {
            gl.uniform3fv(program.uniforms.uColor, color)
            gl.uniform1f(program.uniforms.uOpacity, 0.6)
            lineMesh.draw()
        }

        for (let i = 0; i < this.#rotationRings.length; i++) {
            gl.uniform3fv(program.uniforms.uColor, ROTATION_AXES[i].color)
            gl.uniform1f(program.uniforms.uOpacity, 0.6)
            this.#rotationRings[i].draw()
        }

        for (let i = 0; i < this.#gizmoLines.length; i++) {
            gl.uniform3fv(program.uniforms.uColor, GIZMO_AXES[i].color)
            gl.uniform1f(program.uniforms.uOpacity, 1.0)
            this.#gizmoLines[i].draw()
        }
    }


    #disposeWireframes () {
        for (const {lineMesh} of this.#wireframes) {
            lineMesh.dispose()
        }
        this.#wireframes = []
    }

}


function buildGridPositions (size, step) {
    const half = size / 2
    const count = Math.round(size / step) + 1
    const positions = new Float32Array(count * 2 * 6)
    let offset = 0

    for (let i = 0; i < count; i++) {
        const t = -half + i * step
        positions[offset++] = -half
        positions[offset++] = 0.002
        positions[offset++] = t
        positions[offset++] = half
        positions[offset++] = 0.002
        positions[offset++] = t
    }

    for (let i = 0; i < count; i++) {
        const t = -half + i * step
        positions[offset++] = t
        positions[offset++] = 0.002
        positions[offset++] = -half
        positions[offset++] = t
        positions[offset++] = 0.002
        positions[offset++] = half
    }

    return positions
}
