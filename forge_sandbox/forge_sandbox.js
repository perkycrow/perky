import Game from '../game/game.js'
import WebGLMeshRenderer from '../render/webgl/webgl_mesh_renderer.js'
import Camera3D from '../render/camera_3d.js'
import Geometry from '../render/geometry.js'
import Mesh from '../render/mesh.js'
import MeshInstance from '../render/mesh_instance.js'
import Material3D from '../render/material_3d.js'
import Object3D from '../render/object_3d.js'
import ShadowMap from '../render/shadow_map.js'
import Brush from '../render/csg/brush.js'
import BrushSet from '../render/csg/brush_set.js'
import BrushHistory from '../render/csg/brush_history.js'
import LineMesh from '../render/line_mesh.js'
import OrbitCamera from '../forge/orbit_camera.js'
import TapGesture from '../forge/tap_gesture.js'
import ForgeUI from './forge_ui.js'
import {pickBrush, pickHandle, screenToRay, rayAxisProject, handlePositions, HANDLE_AXES} from '../forge/forge_pick.js'
import {brushWirePositions} from '../forge/wire_geometry.js'
import {pickGizmoArrow, gizmoArrowPositions, GIZMO_AXES} from '../forge/forge_gizmo.js'
import {pickRotationRing, rotationRingPositions, rayPlaneAngle, ROTATION_AXES, ROTATION_RING_SEGMENTS} from '../forge/forge_rotation_gizmo.js'
import {WIRE_SHADER_DEF} from '../render/shaders/builtin/wire_shader.js'
import {snap} from '../math/utils.js'


const MIN_SCALE = 0.1
const HANDLE_SIZE = 0.12

const DEFAULT_WIREFRAME_COLOR = [0.6, 0.6, 0.6]


export default class ForgeSandbox extends Game {

    static $name = 'forgeSandbox'

    static camera = null
    static layer = {type: 'webgl', backgroundColor: '#1a1a2e'}

    #selectedBrush = -1
    #selectionMesh = null
    #handlesMesh = null
    #dragState = null
    #wireframes = []
    #gizmoLines = []
    #rotationRings = []

    configureGame () {
        const renderer = this.getRenderer('game')
        const layer = this.getLayer('game')
        this.gl = renderer.gl

        layer.autoRender = false

        this.meshRenderer = new WebGLMeshRenderer()
        renderer.registerRenderer(this.meshRenderer)

        this.wireProgram = renderer.registerShader('wire', WIRE_SHADER_DEF)

        this.camera3d = new Camera3D({
            x: 5,
            y: 5,
            z: 5,
            fov: Math.PI / 4,
            aspect: layer.canvas.width / layer.canvas.height,
            near: 0.1,
            far: 100
        })
        this.meshRenderer.camera3d = this.camera3d

        this.canvas = layer.canvas

        this.orbitCamera = new OrbitCamera(this.camera3d, this.canvas)
        this.orbitCamera.interceptor = (e) => this.#handleBrushEvent(e)
        this.orbitCamera.attach()

        this.renderSystem.on('resize', ({width, height}) => {
            this.camera3d.setAspect(width / height)
        })

        this.meshRenderer.lightDirection = [0.3, 0.8, 0.5]
        this.meshRenderer.ambient = 0.5
        this.meshRenderer.shadowMap = new ShadowMap({gl: this.gl, resolution: 512})

        this.scene = new Object3D()

        const gridGeo = Geometry.createPlane(20, 20, 20, 20)
        const gridMesh = new Mesh({gl: this.gl, geometry: gridGeo})
        const gridMat = new Material3D({color: [0.3, 0.3, 0.35], roughness: 1})
        const grid = new MeshInstance({mesh: gridMesh, material: gridMat})
        this.scene.addChild(grid)

        this.brushSet = new BrushSet()
        this.brushMaterial = new Material3D({color: [1, 1, 1], roughness: 0.7})
        this.selectionMaterial = new Material3D({color: [0.3, 0.6, 1.0], roughness: 0.5, opacity: 0.15})
        this.handleMaterial = new Material3D({color: [1.0, 1.0, 1.0], roughness: 0.3})
        this.brushMeshInstance = null

        this.brushSet.on('change', ({geometry}) => {
            if (this.brushMeshInstance) {
                this.scene.removeChild(this.brushMeshInstance)
                this.brushMeshInstance.mesh?.dispose()
            }
            if (geometry) {
                const mesh = new Mesh({gl: this.gl, geometry})
                this.brushMeshInstance = new MeshInstance({mesh, material: this.brushMaterial})
                this.scene.addChild(this.brushMeshInstance)
            } else {
                this.brushMeshInstance = null
            }
            this.#rebuildWireframes()
            this.#rebuildGizmo()
        })

        layer.setContent(this.scene)

        this.snapEnabled = true
        this.gridStep = 0.25

        this.gridMinor = new LineMesh({gl: this.gl, positions: buildGridPositions(20, this.gridStep)})
        this.gridMajor = new LineMesh({gl: this.gl, positions: buildGridPositions(20, 1)})

        this.history = new BrushHistory(this.brushSet, {maxStates: 50})
        this.history.save()

        this.tapGesture = new TapGesture(this.canvas, {
            onTap: (n) => this.#onTap(n)
        })
        this.tapGesture.attach()

        this.keyHandler = (e) => this.#onKeyDown(e)
        document.addEventListener('keydown', this.keyHandler)

        this.ui = new ForgeUI(this.element, this)
    }


    get selectedBrush () {
        return this.#selectedBrush
    }


    addBrush (shape = 'box') {
        const y = this.#snap(0.5 + this.brushSet.count)
        this.brushSet.add(new Brush({shape, x: 0, y, z: 0}))
        this.brushSet.build()
        this.history.save()
    }


    toggleSnap () {
        this.snapEnabled = !this.snapEnabled
        this.ui.updateSnapButton(this.snapEnabled)
        this.ui.showToast(this.snapEnabled ? 'Snap On' : 'Snap Off')
    }


    duplicateBrush () {
        const brush = this.brushSet.get(this.#selectedBrush)
        if (!brush) {
            return
        }
        const clone = brush.clone()
        clone.position.y += 0.5
        const newIndex = this.#selectedBrush + 1
        this.brushSet.add(clone, newIndex)
        this.brushSet.build()
        this.history.save()
        this.#select(newIndex)
        this.ui.showToast('Duplicated')
    }


    deleteBrush () {
        if (this.#selectedBrush < 0) {
            return
        }
        const index = this.#selectedBrush
        this.#deselect()
        this.brushSet.remove(index)
        this.brushSet.build()
        this.history.save()
        this.ui.showToast('Deleted')
    }


    setOperation (operation) {
        const brush = this.brushSet.get(this.#selectedBrush)
        if (!brush) {
            return
        }
        brush.operation = operation
        this.brushSet.build()
        this.history.save()
        this.ui.updateOperationToolbar(brush.operation)
    }


    setBrushColor (color) {
        const brush = this.brushSet.get(this.#selectedBrush)
        if (!brush) {
            return
        }
        brush.color = [...color]
        this.brushSet.build()
        this.history.save()
    }


    render () {
        this.getLayer('game').render()
        this.#drawOverlays()
    }


    #handleBrushEvent (e) {
        if (e.type === 'pointerdown') {
            return this.#handleBrushPointerDown(e)
        }
        if (e.type === 'pointermove') {
            return this.#handleBrushPointerMove(e)
        }
        if (e.type === 'pointerup' || e.type === 'pointercancel') {
            return this.#handleBrushPointerUp(e)
        }
        return false
    }


    #handleBrushPointerDown (e) {
        if (this.#selectedBrush >= 0) {
            const brush = this.brushSet.get(this.#selectedBrush)
            if (brush) {
                const arrowIndex = pickGizmoArrow({camera3d: this.camera3d, clientX: e.clientX, clientY: e.clientY, canvas: this.canvas, center: brush.position})
                if (arrowIndex >= 0) {
                    this.#startGizmoDrag(e, arrowIndex)
                    return true
                }

                const ringIndex = pickRotationRing({camera3d: this.camera3d, clientX: e.clientX, clientY: e.clientY, canvas: this.canvas, center: brush.position})
                if (ringIndex >= 0) {
                    this.#startRotationDrag(e, ringIndex)
                    return true
                }

                const handleIndex = pickHandle({camera3d: this.camera3d, clientX: e.clientX, clientY: e.clientY, canvas: this.canvas, brush})
                if (handleIndex >= 0) {
                    this.#startResizeDrag(e, handleIndex)
                    return true
                }
            }
        }

        const index = pickBrush({camera3d: this.camera3d, clientX: e.clientX, clientY: e.clientY, canvas: this.canvas, brushSet: this.brushSet})

        if (index < 0) {
            this.#deselect()
            return false
        }

        this.#select(index)

        return true
    }


    #startGizmoDrag (e, arrowIndex) {
        const brush = this.brushSet.get(this.#selectedBrush)
        const {axis} = GIZMO_AXES[arrowIndex]

        const {origin, direction} = screenToRay(this.camera3d, e.clientX, e.clientY, this.canvas)
        const startOffset = rayAxisProject({origin, direction, axisOrigin: brush.position, axisDir: axis, cameraPos: this.camera3d.position})

        if (startOffset !== null) {
            this.canvas.setPointerCapture(e.pointerId)
            this.#dragState = {
                mode: 'gizmo',
                brushIndex: this.#selectedBrush,
                arrowIndex,
                axis,
                startOffset,
                originalPosition: brush.position.clone()
            }
        }
    }


    #startResizeDrag (e, handleIndex) {
        const brush = this.brushSet.get(this.#selectedBrush)
        const axis = HANDLE_AXES[handleIndex]
        const positions = handlePositions(brush)
        const handlePos = positions[handleIndex]

        const {origin, direction} = screenToRay(this.camera3d, e.clientX, e.clientY, this.canvas)
        const startOffset = rayAxisProject({origin, direction, axisOrigin: handlePos, axisDir: axis, cameraPos: this.camera3d.position})

        if (startOffset !== null) {
            this.canvas.setPointerCapture(e.pointerId)
            this.#dragState = {
                mode: 'resize',
                brushIndex: this.#selectedBrush,
                handleIndex,
                axis,
                handleOrigin: handlePos,
                startOffset,
                originalPosition: brush.position.clone(),
                originalScale: brush.scale.clone()
            }
        }
    }


    #startRotationDrag (e, axisIndex) {
        const brush = this.brushSet.get(this.#selectedBrush)

        const {origin, direction} = screenToRay(this.camera3d, e.clientX, e.clientY, this.canvas)
        const startAngle = rayPlaneAngle({origin, direction, center: brush.position, axisIndex})

        if (startAngle !== null) {
            this.canvas.setPointerCapture(e.pointerId)
            this.#dragState = {
                mode: 'rotation',
                brushIndex: this.#selectedBrush,
                axisIndex,
                startAngle,
                originalRotation: brush.rotation.clone()
            }
        }
    }


    #handleBrushPointerMove (e) {
        if (!this.#dragState) {
            return false
        }

        if (this.#dragState.mode === 'gizmo') {
            return this.#handleGizmoMove(e)
        }

        if (this.#dragState.mode === 'rotation') {
            return this.#handleRotationMove(e)
        }

        if (this.#dragState.mode === 'resize') {
            return this.#handleResizeMove(e)
        }

        return false
    }


    #handleGizmoMove (e) {
        const {axis, startOffset, originalPosition, brushIndex} = this.#dragState
        const brush = this.brushSet.get(brushIndex)

        const {origin, direction} = screenToRay(this.camera3d, e.clientX, e.clientY, this.canvas)
        const currentOffset = rayAxisProject({origin, direction, axisOrigin: originalPosition, axisDir: axis, cameraPos: this.camera3d.position})

        if (currentOffset === null) {
            return true
        }

        const delta = currentOffset - startOffset

        brush.position.x = this.#snap(originalPosition.x + axis.x * delta)
        brush.position.y = this.#snap(originalPosition.y + axis.y * delta)
        brush.position.z = this.#snap(originalPosition.z + axis.z * delta)

        this.#updateSelectionMesh()

        return true
    }


    #handleRotationMove (e) {
        const {axisIndex, startAngle, originalRotation, brushIndex} = this.#dragState
        const brush = this.brushSet.get(brushIndex)

        const {origin, direction} = screenToRay(this.camera3d, e.clientX, e.clientY, this.canvas)
        const currentAngle = rayPlaneAngle({origin, direction, center: brush.position, axisIndex})

        if (currentAngle === null) {
            return true
        }

        const delta = currentAngle - startAngle
        const component = getRotationComponent(axisIndex)
        brush.rotation[component] = this.#snapAngle(originalRotation[component] + delta)

        this.#updateSelectionMesh()

        return true
    }


    #handleResizeMove (e) {
        const {axis, handleOrigin, startOffset, originalPosition, originalScale, brushIndex} = this.#dragState
        const brush = this.brushSet.get(brushIndex)

        const {origin, direction} = screenToRay(this.camera3d, e.clientX, e.clientY, this.canvas)
        const currentOffset = rayAxisProject({origin, direction, axisOrigin: handleOrigin, axisDir: axis, cameraPos: this.camera3d.position})

        if (currentOffset === null) {
            return true
        }

        const delta = currentOffset - startOffset
        const sign = axis.x + axis.y + axis.z

        const axisIndex = getAxisIndex(axis)
        const originalAxisScale = originalScale.getComponent(axisIndex)

        const newScale = Math.max(MIN_SCALE, this.#snap(originalAxisScale + delta * sign))
        const scaleDiff = newScale - originalAxisScale

        brush.scale.setComponent(axisIndex, newScale)
        brush.position.setComponent(
            axisIndex,
            originalPosition.getComponent(axisIndex) + scaleDiff * sign / 2
        )

        this.#updateSelectionMesh()

        return true
    }


    #handleBrushPointerUp () {
        if (!this.#dragState) {
            return false
        }

        this.#dragState = null
        this.brushSet.build()
        this.history.save()

        return true
    }


    #select (index) {
        this.#selectedBrush = index
        this.#updateSelectionMesh()
        const brush = this.brushSet.get(index)
        this.ui.showOperationToolbar(brush.operation)
    }


    #deselect () {
        if (this.#selectedBrush < 0) {
            return
        }
        this.#selectedBrush = -1
        this.#removeSelectionMesh()
        this.#disposeGizmo()
        this.ui.hideOperationToolbar()
    }


    #updateSelectionMesh () {
        this.#removeSelectionMesh()

        const brush = this.brushSet.get(this.#selectedBrush)
        if (!brush) {
            return
        }

        const geo = Geometry.createBox(
            brush.scale.x * 1.02,
            brush.scale.y * 1.02,
            brush.scale.z * 1.02
        )
        offsetGeometry(geo, brush.position.x, brush.position.y, brush.position.z)

        const mesh = new Mesh({gl: this.gl, geometry: geo})
        this.#selectionMesh = new MeshInstance({mesh, material: this.selectionMaterial})
        this.scene.addChild(this.#selectionMesh)

        const handlesGeo = buildHandlesGeometry(brush)
        const handlesMesh = new Mesh({gl: this.gl, geometry: handlesGeo})
        this.#handlesMesh = new MeshInstance({mesh: handlesMesh, material: this.handleMaterial})
        this.scene.addChild(this.#handlesMesh)

        this.#rebuildWireframes()
        this.#rebuildGizmo()
    }


    #removeSelectionMesh () {
        if (this.#selectionMesh) {
            this.scene.removeChild(this.#selectionMesh)
            this.#selectionMesh.mesh?.dispose()
            this.#selectionMesh = null
        }
        if (this.#handlesMesh) {
            this.scene.removeChild(this.#handlesMesh)
            this.#handlesMesh.mesh?.dispose()
            this.#handlesMesh = null
        }
    }


    #rebuildWireframes () {
        this.#disposeWireframes()

        for (let i = 0; i < this.brushSet.count; i++) {
            const brush = this.brushSet.get(i)
            const positions = brushWirePositions(brush)
            const lineMesh = new LineMesh({gl: this.gl, positions})
            const isWhite = brush.color[0] === 1 && brush.color[1] === 1 && brush.color[2] === 1
            const color = isWhite ? DEFAULT_WIREFRAME_COLOR : brush.color
            this.#wireframes.push({lineMesh, color})
        }
    }


    #disposeWireframes () {
        for (const {lineMesh} of this.#wireframes) {
            lineMesh.dispose()
        }
        this.#wireframes = []
    }


    #rebuildGizmo () {
        this.#disposeGizmo()

        if (this.#selectedBrush < 0) {
            return
        }

        const brush = this.brushSet.get(this.#selectedBrush)
        if (!brush) {
            return
        }

        const positions = gizmoArrowPositions(brush.position)

        for (let i = 0; i < 3; i++) {
            const arrowPositions = new Float32Array([
                positions[i * 6], positions[i * 6 + 1], positions[i * 6 + 2],
                positions[i * 6 + 3], positions[i * 6 + 4], positions[i * 6 + 5]
            ])
            this.#gizmoLines.push(new LineMesh({gl: this.gl, positions: arrowPositions}))
        }

        const ringPositions = rotationRingPositions(brush.position)
        const segPerRing = ROTATION_RING_SEGMENTS * 6

        for (let i = 0; i < 3; i++) {
            const ringData = ringPositions.slice(i * segPerRing, (i + 1) * segPerRing)
            this.#rotationRings.push(new LineMesh({gl: this.gl, positions: ringData}))
        }
    }


    #disposeGizmo () {
        for (const lineMesh of this.#gizmoLines) {
            lineMesh.dispose()
        }
        this.#gizmoLines = []

        for (const lineMesh of this.#rotationRings) {
            lineMesh.dispose()
        }
        this.#rotationRings = []
    }


    #snap (value) {
        return this.snapEnabled ? snap(value, this.gridStep) : value
    }


    #snapAngle (value) {
        return this.snapEnabled ? snap(value, Math.PI / 12) : value
    }


    #onTap (fingerCount) {
        if (fingerCount === 2) {
            this.#undo()
        } else if (fingerCount === 3) {
            this.#redo()
        }
    }


    #onKeyDown (e) {
        if (this.#handleShortcutKey(e)) {
            return
        }
        this.#handleUndoRedo(e)
    }


    #handleShortcutKey (e) {
        if (e.ctrlKey || e.metaKey) {
            return false
        }
        if (e.key === 'g') {
            this.toggleSnap()
            return true
        }
        if (e.key === 'r') {
            this.#resetRotation()
            return true
        }
        if (e.key === 'd') {
            this.duplicateBrush()
            return true
        }
        if (e.key === 'Backspace' || e.key === 'Delete') {
            this.deleteBrush()
            return true
        }
        return false
    }


    #handleUndoRedo (e) {
        if (!e.ctrlKey && !e.metaKey) {
            return
        }
        if (e.key !== 'z') {
            return
        }
        e.preventDefault()
        if (e.shiftKey) {
            this.#redo()
        } else {
            this.#undo()
        }
    }


    #undo () {
        this.#deselect()
        if (!this.history.undo()) {
            return
        }
        this.brushSet.build()
        this.ui.showToast('Undo')
    }


    #redo () {
        this.#deselect()
        if (!this.history.redo()) {
            return
        }
        this.brushSet.build()
        this.ui.showToast('Redo')
    }


    #resetRotation () {
        const brush = this.brushSet.get(this.#selectedBrush)
        if (!brush) {
            return
        }
        brush.rotation.set(0, 0, 0)
        this.brushSet.build()
        this.history.save()
        this.ui.showToast('Rotation Reset')
    }


    #drawOverlays () {
        const gl = this.gl
        const program = this.wireProgram

        gl.useProgram(program.program)
        gl.uniformMatrix4fv(program.uniforms.uProjection, false, this.camera3d.projectionMatrix.elements)
        gl.uniformMatrix4fv(program.uniforms.uView, false, this.camera3d.viewMatrix.elements)

        gl.uniform3fv(program.uniforms.uColor, [1, 1, 1])

        gl.uniform1f(program.uniforms.uOpacity, 0.08)
        this.gridMinor.draw()

        gl.uniform1f(program.uniforms.uOpacity, 0.2)
        this.gridMajor.draw()

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

}


function getAxisIndex (axis) {
    if (Math.abs(axis.x) === 1) {
        return 0
    }
    if (Math.abs(axis.y) === 1) {
        return 1
    }
    return 2
}


function getRotationComponent (axisIndex) {
    if (ROTATION_AXES[axisIndex].axis.x) {
        return 'x'
    }
    if (ROTATION_AXES[axisIndex].axis.y) {
        return 'y'
    }
    return 'z'
}


function offsetGeometry (geometry, dx, dy, dz) {
    for (let i = 0; i < geometry.positions.length; i += 3) {
        geometry.positions[i] += dx
        geometry.positions[i + 1] += dy
        geometry.positions[i + 2] += dz
    }
}


function buildHandlesGeometry (brush) {
    const positions = handlePositions(brush)
    const allPositions = []
    const allNormals = []
    const allUvs = []
    const allIndices = []

    for (let i = 0; i < 6; i++) {
        const cube = Geometry.createBox(HANDLE_SIZE, HANDLE_SIZE, HANDLE_SIZE)
        const offset = positions[i]
        const baseVertex = allPositions.length / 3

        for (let j = 0; j < cube.positions.length; j += 3) {
            allPositions.push(
                cube.positions[j] + offset.x,
                cube.positions[j + 1] + offset.y,
                cube.positions[j + 2] + offset.z
            )
            allNormals.push(cube.normals[j], cube.normals[j + 1], cube.normals[j + 2])
        }

        for (let j = 0; j < cube.uvs.length; j++) {
            allUvs.push(cube.uvs[j])
        }

        for (let j = 0; j < cube.indices.length; j++) {
            allIndices.push(cube.indices[j] + baseVertex)
        }
    }

    return new Geometry({
        positions: new Float32Array(allPositions),
        normals: new Float32Array(allNormals),
        uvs: new Float32Array(allUvs),
        indices: new Uint16Array(allIndices)
    })
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
