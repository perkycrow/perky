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
import {loadGlb, buildGltfScene} from '../../render/loaders/gltf_loader.js'
import DungeonWorld from '../worlds/dungeon_world.js'
import PlayerController from '../controllers/player_controller.js'
import wiring from '../wiring.js'


const EYE_HEIGHT = 1.7
const MOUSE_SENSITIVITY = 0.002
const PITCH_LIMIT = Math.PI / 2 - 0.05
const SPAWN = {x: 0, y: 0, z: 5}


export default class DungeonStage extends Stage {

    static $name = 'dungeon'
    static World = DungeonWorld
    static ActionController = PlayerController

    onStart () {
        wiring.registerViews(this)

        const renderer = this.game.getRenderer('game')
        const layer = this.game.getLayer('game')
        const gl = renderer.gl

        this.meshRenderer = new WebGLMeshRenderer()
        renderer.registerRenderer(this.meshRenderer)

        this.camera3d = new Camera3D({
            fov: Math.PI / 3,
            aspect: layer.canvas.width / layer.canvas.height,
            near: 0.1,
            far: 100
        })
        this.meshRenderer.camera3d = this.camera3d

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

        this.player = this.world.spawnPlayer(SPAWN)

        this.#setupMouseLook(layer.canvas)

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
        ground.position.set(0, -0.02, 0)
        ground.castShadow = false
        this.scene.addChild(ground)
    }


    async #loadDungeon (gl) {
        const data = await loadGlb('assets/pieces/room-small.glb')
        const {scene} = await buildGltfScene({...data, gl})
        this.scene.addChild(scene)
        scene.markDirty()
    }


    #setupMouseLook (canvas) {
        this.canvas = canvas
        this.pointerLocked = false

        canvas.addEventListener('click', () => {
            if (!this.pointerLocked) {
                canvas.requestPointerLock()
            }
        })

        document.addEventListener('pointerlockchange', () => {
            this.pointerLocked = document.pointerLockElement === canvas
        })

        document.addEventListener('mousemove', (e) => {
            if (!this.pointerLocked || !this.player) {
                return
            }
            this.player.yaw -= e.movementX * MOUSE_SENSITIVITY
            this.player.pitch -= e.movementY * MOUSE_SENSITIVITY
            if (this.player.pitch > PITCH_LIMIT) {
                this.player.pitch = PITCH_LIMIT
            }
            if (this.player.pitch < -PITCH_LIMIT) {
                this.player.pitch = -PITCH_LIMIT
            }
        })
    }


    update (deltaTime) {
        super.update(deltaTime)

        if (!this.player) {
            return
        }

        const dir = this.game.getDirection('move')
        this.player.setMoveInput(dir.y, dir.x)
        this.player.update(deltaTime)

        this.camera3d.position.set(
            this.player.position.x,
            this.player.position.y + EYE_HEIGHT,
            this.player.position.z
        )
        this.camera3d.rotation.setFromEuler(this.player.pitch, this.player.yaw, 0, 'YXZ')
        this.camera3d.markDirty()
    }

}
