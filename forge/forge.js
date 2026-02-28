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
import OrbitCamera from './orbit_camera.js'
import ForgeUI from './forge_ui.js'
import {pickBrush, screenToRay, rayHorizontalPlane} from './forge_pick.js'


export default class Forge extends Game {

    static $name = 'forge'

    static camera = null
    static layer = {type: 'webgl', backgroundColor: '#1a1a2e'}

    #selectedBrush = -1
    #selectionMesh = null
    #dragState = null


    configureGame () {
        const renderer = this.getRenderer('game')
        const layer = this.getLayer('game')
        this.gl = renderer.gl

        this.meshRenderer = new WebGLMeshRenderer()
        renderer.registerRenderer(this.meshRenderer)

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
        this.brushMaterial = new Material3D({color: [0.8, 0.6, 0.4], roughness: 0.7})
        this.selectionMaterial = new Material3D({color: [0.3, 0.6, 1.0], roughness: 0.5})
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
        })

        layer.setContent(this.scene)

        this.ui = new ForgeUI(this.element, this)
    }


    get selectedBrush () {
        return this.#selectedBrush
    }


    addBrush () {
        const y = 0.5 + this.brushSet.count
        this.brushSet.add(new Brush({shape: 'box', x: 0, y, z: 0}))
        this.brushSet.build()
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
        const index = pickBrush(this.camera3d, e.clientX, e.clientY, this.canvas, this.brushSet)

        if (index < 0) {
            this.#deselect()
            return false
        }

        this.#select(index)

        const brush = this.brushSet.get(index)
        const {origin, direction} = screenToRay(this.camera3d, e.clientX, e.clientY, this.canvas)
        const hitPoint = rayHorizontalPlane(origin, direction, brush.position.y)

        if (hitPoint) {
            this.canvas.setPointerCapture(e.pointerId)
            this.#dragState = {
                brushIndex: index,
                startPoint: hitPoint,
                originalPosition: brush.position.clone()
            }
        }

        return true
    }


    #handleBrushPointerMove (e) {
        if (!this.#dragState) {
            return false
        }

        const brush = this.brushSet.get(this.#dragState.brushIndex)
        const {origin, direction} = screenToRay(this.camera3d, e.clientX, e.clientY, this.canvas)
        const point = rayHorizontalPlane(origin, direction, this.#dragState.originalPosition.y)

        if (!point) {
            return true
        }

        const dx = point.x - this.#dragState.startPoint.x
        const dz = point.z - this.#dragState.startPoint.z

        brush.position.x = this.#dragState.originalPosition.x + dx
        brush.position.z = this.#dragState.originalPosition.z + dz

        this.#updateSelectionMesh()

        return true
    }


    #handleBrushPointerUp () {
        if (!this.#dragState) {
            return false
        }

        this.#dragState = null
        this.brushSet.build()

        return true
    }


    #select (index) {
        this.#selectedBrush = index
        this.#updateSelectionMesh()
    }


    #deselect () {
        if (this.#selectedBrush < 0) {
            return
        }
        this.#selectedBrush = -1
        this.#removeSelectionMesh()
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
    }


    #removeSelectionMesh () {
        if (this.#selectionMesh) {
            this.scene.removeChild(this.#selectionMesh)
            this.#selectionMesh.mesh?.dispose()
            this.#selectionMesh = null
        }
    }

}


function offsetGeometry (geometry, dx, dy, dz) {
    for (let i = 0; i < geometry.positions.length; i += 3) {
        geometry.positions[i] += dx
        geometry.positions[i + 1] += dy
        geometry.positions[i + 2] += dz
    }
}
