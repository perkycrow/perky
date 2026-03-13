import {createElement} from '../application/dom_utils.js'
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
import OrbitCamera from '../forge/orbit_camera.js'
import TapGesture from '../forge/tap_gesture.js'
import ForgeUI from './forge_ui.js'
import ForgeDrag from './forge_drag.js'
import ForgeOverlays from './forge_overlays.js'
import {pickBrush, handlePositions} from '../forge/forge_pick.js'
import {WIRE_SHADER_DEF} from '../render/shaders/builtin/wire_shader.js'
import {snap} from '../math/utils.js'


const HANDLE_SIZE = 0.12
const STORAGE_KEY = 'forge-project'


export default class ForgeSandbox extends Game {

    static $name = 'forgeSandbox'

    static camera = null
    static layer = {type: 'webgl', backgroundColor: '#1a1a2e'}

    #selectedBrush = -1
    #selectionMesh = null
    #handlesMesh = null

    configureGame () {
        const renderer = this.getRenderer('game')
        const layer = this.getLayer('game')
        this.gl = renderer.gl

        layer.autoRender = false

        this.meshRenderer = new WebGLMeshRenderer()
        renderer.registerRenderer(this.meshRenderer)

        const wireProgram = renderer.registerShader('wire', WIRE_SHADER_DEF)

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
            this.overlays.rebuildWireframes(this.brushSet)
            this.overlays.rebuildGizmo(this.brushSet.get(this.#selectedBrush))
        })

        layer.setContent(this.scene)

        this.snapEnabled = true
        this.gridStep = 0.25

        this.overlays = new ForgeOverlays({
            gl: this.gl,
            wireProgram,
            gridSize: 20,
            gridStep: this.gridStep
        })

        this.drag = new ForgeDrag({
            camera3d: this.camera3d,
            canvas: this.canvas,
            brushSet: this.brushSet,
            snap: (v) => this.#snap(v),
            snapAngle: (v) => this.#snapAngle(v)
        })

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


    onStart () {
        super.onStart()
        this.loadFromStorage()
    }


    get selectedBrush () {
        return this.#selectedBrush
    }


    addBrush (shape = 'box') {
        const y = this.#snap(0.5 + this.brushSet.count)
        this.brushSet.add(new Brush({shape, x: 0, y, z: 0}))
        this.brushSet.build()
        this.history.save()
        this.saveToStorage()
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
        this.saveToStorage()
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
        this.saveToStorage()
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
        this.saveToStorage()
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
        this.saveToStorage()
    }


    toJSON () {
        return {
            version: 1,
            brushes: this.brushSet.toJSON(),
            snapEnabled: this.snapEnabled,
            gridStep: this.gridStep,
            camera: {
                theta: this.orbitCamera.theta,
                phi: this.orbitCamera.phi,
                radius: this.orbitCamera.radius,
                targetX: this.orbitCamera.target.x,
                targetY: this.orbitCamera.target.y,
                targetZ: this.orbitCamera.target.z
            }
        }
    }


    fromJSON (data) {
        this.#deselect()

        while (this.brushSet.count > 0) {
            this.brushSet.remove(0)
        }
        for (const entry of data.brushes) {
            this.brushSet.add(Brush.fromJSON(entry))
        }
        this.brushSet.build()

        this.snapEnabled = data.snapEnabled ?? true
        this.gridStep = data.gridStep ?? 0.25
        this.ui.updateSnapButton(this.snapEnabled)

        if (data.camera) {
            this.orbitCamera.theta = data.camera.theta
            this.orbitCamera.phi = data.camera.phi
            this.orbitCamera.radius = data.camera.radius
            this.orbitCamera.target.set(
                data.camera.targetX ?? 0,
                data.camera.targetY ?? 0,
                data.camera.targetZ ?? 0
            )
            this.orbitCamera.update()
        }

        this.history.clear()
        this.history.save()
    }


    saveToStorage () {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.toJSON()))
    }


    loadFromStorage () {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) {
            return false
        }
        this.fromJSON(JSON.parse(raw))
        return true
    }


    newProject () {
        this.#deselect()
        while (this.brushSet.count > 0) {
            this.brushSet.remove(0)
        }
        this.brushSet.build()
        this.snapEnabled = true
        this.gridStep = 0.25
        this.ui.updateSnapButton(this.snapEnabled)
        this.history.clear()
        this.history.save()
        localStorage.removeItem(STORAGE_KEY)
        this.ui.showToast('New Project')
    }


    exportProject () {
        const json = JSON.stringify(this.toJSON(), null, 2)
        const blob = new Blob([json], {type: 'application/json'})
        const url = URL.createObjectURL(blob)
        const a = createElement('a', {href: url, attrs: {download: 'forge-project.json'}})
        a.click()
        URL.revokeObjectURL(url)
        this.ui.showToast('Exported')
    }


    importProject (file) {
        const reader = new FileReader()
        reader.onload = () => {
            this.fromJSON(JSON.parse(reader.result))
            this.saveToStorage()
            this.ui.showToast('Imported')
        }
        reader.readAsText(file)
    }


    render () {
        this.getLayer('game').render()
        this.overlays.draw(this.camera3d)
    }


    #handleBrushEvent (e) {
        if (e.type === 'pointerdown') {
            return this.#handleBrushPointerDown(e)
        }
        if (e.type === 'pointermove') {
            return this.#handleBrushPointerMove(e)
        }
        if (e.type === 'pointerup' || e.type === 'pointercancel') {
            return this.#handleBrushPointerUp()
        }
        return false
    }


    #handleBrushPointerDown (e) {
        if (this.#selectedBrush >= 0 && this.drag.tryStart(e, this.#selectedBrush)) {
            return true
        }

        const index = pickBrush({camera3d: this.camera3d, clientX: e.clientX, clientY: e.clientY, canvas: this.canvas, brushSet: this.brushSet})

        if (index < 0) {
            this.#deselect()
            return false
        }

        this.#select(index)
        return true
    }


    #handleBrushPointerMove (e) {
        if (!this.drag.move(e)) {
            return false
        }
        this.#updateSelectionMesh()
        return true
    }


    #handleBrushPointerUp () {
        if (!this.drag.end()) {
            return false
        }
        this.brushSet.build()
        this.history.save()
        this.saveToStorage()
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
        this.overlays.disposeGizmo()
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

        this.overlays.rebuildWireframes(this.brushSet)
        this.overlays.rebuildGizmo(brush)
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
        if (e.key === 'n') {
            this.newProject()
            return true
        }
        if (e.key === 'e') {
            this.exportProject()
            return true
        }
        return false
    }


    #handleUndoRedo (e) {
        if (!e.ctrlKey && !e.metaKey) {
            return
        }
        if (e.key === 's') {
            e.preventDefault()
            this.exportProject()
            return
        }
        if (e.key === 'y') {
            e.preventDefault()
            this.#redo()
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
        this.saveToStorage()
        this.ui.showToast('Rotation Reset')
    }

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
