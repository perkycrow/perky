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


export default class Forge extends Game {

    static $name = 'forge'

    static camera = null
    static layer = {type: 'webgl', backgroundColor: '#1a1a2e'}


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

        this.orbitCamera = new OrbitCamera(this.camera3d, layer.canvas)
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


    addBrush () {
        const y = 0.5 + this.brushSet.count
        this.brushSet.add(new Brush({shape: 'box', x: 0, y, z: 0}))
        this.brushSet.build()
    }

}
