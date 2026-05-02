import Stage from '../../game/stage.js'
import WebGLMeshRenderer from '../../render/webgl/webgl_mesh_renderer.js'
import Camera3D from '../../render/camera_3d.js'
import Geometry from '../../render/geometry.js'
import Mesh from '../../render/mesh.js'
import MeshInstance from '../../render/mesh_instance.js'
import Material3D from '../../render/material_3d.js'
import Light3D from '../../render/light_3d.js'
import Object3D from '../../render/object_3d.js'
import RoomLibrary from '../room_library.js'
import DungeonWorld from '../worlds/dungeon_world.js'
import PlayerController from '../controllers/player_controller.js'
import {loadGlb, buildGltfScene} from '../../render/loaders/gltf_loader.js'
import layout from '../layouts/main.json' with {type: 'json'}
import wiring from '../wiring.js'


const EYE_HEIGHT = 1.7
const MOUSE_SENSITIVITY = 0.002
const PITCH_LIMIT = Math.PI / 2 - 0.05
const SPAWN = {x: 0, y: 0, z: 0}

const TORCHES = [
    {x: 0, y: 2.8, z: 0, color: [1.0, 0.7, 0.3], intensity: 2.0, radius: 16},

    {x: 8, y: 2.8, z: 0, color: [1.0, 0.7, 0.3], intensity: 1.5, radius: 12},
    {x: 12, y: 2.8, z: 0, color: [1.0, 0.7, 0.3], intensity: 1.5, radius: 12},

    {x: 24, y: 2.8, z: 0, color: [1.0, 0.7, 0.3], intensity: 2.0, radius: 16},

    {x: 0, y: 2.8, z: -8, color: [1.0, 0.7, 0.3], intensity: 1.5, radius: 12},
    {x: 0, y: 2.8, z: -12, color: [1.0, 0.7, 0.3], intensity: 1.5, radius: 12},

    {x: 0, y: 2.8, z: -20, color: [1.0, 0.7, 0.3], intensity: 2.0, radius: 16},

    {x: 24, y: 2.8, z: -12, color: [1.0, 0.7, 0.3], intensity: 1.5, radius: 12},

    {x: 24, y: 2.8, z: -32, color: [1.0, 0.75, 0.35], intensity: 2.5, radius: 20}
]


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

        this.meshRenderer.lightDirection = [0.3, 0.85, 0.4]
        this.meshRenderer.ambientSky = [0.45, 0.45, 0.5]
        this.meshRenderer.ambientGround = [0.12, 0.1, 0.08]
        this.meshRenderer.fogNear = 6
        this.meshRenderer.fogFar = 34
        this.meshRenderer.fogColor = [0.02, 0.02, 0.04]

        this.scene = new Object3D()
        layer.setContent(this.scene)

        this.player = this.world.spawnPlayer(SPAWN)

        this.#setupMouseLook(layer.canvas)
        this.#setupTorches(gl)

        super.onStart()

        this.#loadDungeon(gl)
    }


    #setupTorches (gl) {
        const lights = []
        const sphereGeo = Geometry.createSphere(0.15, 8, 6)
        const sphereMesh = new Mesh({gl, geometry: sphereGeo})

        for (const torch of TORCHES) {
            const light = new Light3D(torch)
            lights.push(light)

            const bulbMat = new Material3D({
                color: torch.color,
                emissive: torch.color,
                unlit: true
            })
            const bulb = new MeshInstance({mesh: sphereMesh, material: bulbMat})
            bulb.position.set(torch.x, torch.y, torch.z)
            bulb.castShadow = false
            this.scene.addChild(bulb)
        }

        this.meshRenderer.lights = lights
    }


    async #loadDungeon (gl) {
        this.roomLibrary = new RoomLibrary()
        await this.roomLibrary.load(gl)

        for (const entry of layout) {
            const room = this.roomLibrary.placeRoom(entry)
            this.scene.addChild(room)
        }

        await this.#loadTestProps(gl)

        this.scene.markDirty()
    }


    async #loadTestProps (gl) {
        const items = [
            {file: 'fps_wall', x: -3, y: 0, z: 3, label: 'FPS Kit wall'},
            {file: 'fps_floor', x: 0, y: 0, z: 3, label: 'FPS Kit floor'},
            {file: 'fps_column', x: 3, y: 0, z: 3, label: 'FPS Kit column'},
            {file: 'fps_crate', x: 5, y: 0, z: 3, label: 'FPS Kit crate'},
            {file: 'psx_pillar', x: -3, y: 0, z: 7, label: 'PSX pillar'},
            {file: 'psx_doorway', x: 0, y: 0, z: 7, label: 'PSX doorway'},
            {file: 'psx_lamp', x: 3, y: 2.5, z: 7, label: 'PSX lamp'},
            {file: 'bunker_chair', x: 5, y: 0, z: 7, label: 'Bunker chair'},
        ]

        for (const item of items) {
            const data = await loadGlb('assets/props/' + item.file + '.glb')
            const {scene} = await buildGltfScene({...data, gl})
            scene.position.set(item.x, item.y, item.z)
            scene.markDirty()
            this.scene.addChild(scene)
        }
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
