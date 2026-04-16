import Stage from '../../game/stage.js'
import WebGLMeshRenderer from '../../render/webgl/webgl_mesh_renderer.js'
import Camera3D from '../../render/camera_3d.js'
import Geometry from '../../render/geometry.js'
import Mesh from '../../render/mesh.js'
import MeshInstance from '../../render/mesh_instance.js'
import Material3D from '../../render/material_3d.js'
import Light3D from '../../render/light_3d.js'
import Object3D from '../../render/object_3d.js'
import ShadowMap from '../../render/shadow_map.js'
import OrbitCamera from '../../forge/orbit_camera.js'
import {loadGlb, buildGltfScene} from '../../render/loaders/gltf_loader.js'
import wiring from '../wiring.js'


export default class DungeonStage extends Stage {

    static $name = 'dungeon'

    onStart () {
        wiring.registerViews(this)

        const renderer = this.game.getRenderer('game')
        const layer = this.game.getLayer('game')
        const gl = renderer.gl

        this.meshRenderer = new WebGLMeshRenderer()
        renderer.registerRenderer(this.meshRenderer)

        this.camera3d = new Camera3D({
            x: 8,
            y: 6,
            z: 8,
            fov: Math.PI / 4,
            aspect: layer.canvas.width / layer.canvas.height,
            near: 0.1,
            far: 200
        })
        this.meshRenderer.camera3d = this.camera3d

        this.orbitCamera = new OrbitCamera(this.camera3d, layer.canvas, {
            radius: 14,
            minRadius: 2,
            maxRadius: 80
        })
        this.orbitCamera.attach()

        this.game.renderSystem.on('resize', ({width, height}) => {
            this.camera3d.setAspect(width / height)
        })

        this.meshRenderer.lightDirection = [0.3, 0.9, 0.4]
        this.meshRenderer.ambient = 0.35
        this.meshRenderer.shadowMap = new ShadowMap({gl, resolution: 1024})

        this.meshRenderer.lights = [
            new Light3D({
                x: 5,
                y: 8,
                z: 5,
                color: [1.0, 0.9, 0.7],
                intensity: 1.2,
                radius: 30
            })
        ]

        this.scene = new Object3D()

        this.#buildGround(gl)

        layer.setContent(this.scene)

        super.onStart()

        this.#loadDungeon(gl)
    }


    #buildGround (gl) {
        const groundGeo = Geometry.createPlane(60, 60)
        const groundMesh = new Mesh({gl, geometry: groundGeo})
        const groundMat = new Material3D({
            color: [0.28, 0.26, 0.24],
            roughness: 0.9,
            specular: 0.1
        })
        const ground = new MeshInstance({mesh: groundMesh, material: groundMat})
        ground.castShadow = false
        this.scene.addChild(ground)
    }


    async #loadDungeon (gl) {
        const data = await loadGlb('assets/dungeon.glb')
        const {scene} = await buildGltfScene({...data, gl})
        this.dungeonScene = scene
        this.scene.addChild(scene)
        scene.markDirty()
    }

}
