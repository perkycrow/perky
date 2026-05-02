import Stage from '../../game/stage.js'
import WebGLMeshRenderer from '../../render/webgl/webgl_mesh_renderer.js'
import Camera3D from '../../render/camera_3d.js'
import MeshInstance from '../../render/mesh_instance.js'
import Light3D from '../../render/light_3d.js'
import Object3D from '../../render/object_3d.js'
import {loadGlb, buildGltfScene} from '../../render/loaders/gltf_loader.js'
import {resolveCollisions} from '../collision.js'
import DungeonWorld from '../worlds/dungeon_world.js'
import PlayerController from '../controllers/player_controller.js'
import wiring from '../wiring.js'


const EYE_HEIGHT = 1.7
const MOUSE_SENSITIVITY = 0.002
const PITCH_LIMIT = Math.PI / 2 - 0.05
const SPAWN = {x: -2, y: 0, z: 0}


export default class DungeonStage extends Stage {

    static $name = 'dungeon'
    static World = DungeonWorld
    static ActionController = PlayerController

    onStart () {
        wiring.registerViews(this)

        const renderer = this.game.getRenderer('game')
        const layer = this.game.getLayer('game')

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

        this.meshRenderer.lightDirection = [0.0, 1.0, 0.0]
        this.meshRenderer.ambientSky = [0.12, 0.12, 0.15]
        this.meshRenderer.ambientGround = [0.05, 0.04, 0.04]
        this.meshRenderer.fogNear = 8
        this.meshRenderer.fogFar = 30
        this.meshRenderer.fogColor = [0.01, 0.01, 0.02]

        this.scene = new Object3D()
        layer.setContent(this.scene)

        this.player = this.world.spawnPlayer(SPAWN)
        this.#setupMouseLook(layer.canvas)

        this.colliders = [
            {minX: -4.05, maxX: -3.95, minZ: -2, maxZ: 2},
            {minX: 3.95, maxX: 4.05, minZ: -2, maxZ: 2},
            {minX: -4, maxX: 4, minZ: -2.05, maxZ: -1.95},
            {minX: -4, maxX: 4, minZ: 1.95, maxZ: 2.05},
            {minX: -0.05, maxX: 0.05, minZ: -2, maxZ: -0.6},
            {minX: -0.05, maxX: 0.05, minZ: 0.6, maxZ: 2}
        ]

        super.onStart()

        this.#buildScene()
    }


    async #buildScene () {
        const assets = await this.#loadAssets()
        const lights = []

        this.#buildRoom(assets, -2, 0, lights)
        this.#buildRoom(assets, 2, 0, lights)

        const doorway = this.#placeAsset(assets.doorway, 0, 0, 0, 90)
        const door = this.#findByName(doorway, 'door_4')
        if (door) {
            door.rotation.setFromEuler(0, Math.PI * 0.45, 0, 'YXZ')
            door.markDirty()
        }

        this.#buildWall(assets.wall, -4, 0, 90)
        this.#buildWall(assets.wall, 4, 0, -90)

        this.meshRenderer.lights = lights
        this.scene.markDirty()
    }


    #buildRoom (assets, cx, cz, lights) {
        this.#placeAsset(assets.floor, cx, 0, cz, 0)
        this.#placeAsset(assets.floor, cx, 3, cz, 0)

        this.#buildWall(assets.wall, cx, cz - 2, 0)
        this.#buildWall(assets.wall, cx, cz + 2, 180)

        this.#placeAsset(assets.lamp, cx, 3, cz, 0)

        lights.push(new Light3D({
            x: cx,
            y: 2.7,
            z: cz,
            color: [1.0, 0.85, 0.6],
            intensity: 3.5,
            radius: 10
        }))
    }


    #buildWall (wallScene, x, z, rot) {
        this.#placeAsset(wallScene, x, 0, z, rot)
    }


    #placeAsset (sceneTemplate, x, y, z, rot) {
        const instance = this.#cloneScene(sceneTemplate)
        instance.position.set(x, y, z)
        if (rot) {
            instance.rotation.setFromEuler(0, rot * Math.PI / 180, 0, 'YXZ')
        }
        instance.markDirty()
        this.scene.addChild(instance)
        return instance
    }


    #cloneScene (sceneTemplate) {
        const root = new Object3D()
        this.#cloneChildren(sceneTemplate, root)
        return root
    }


    #findByName (root, name) {
        for (const child of root.children) {
            if (child.name === name) {
                return child
            }
            const found = this.#findByName(child, name)
            if (found) {
                return found
            }
        }
        return null
    }


    #cloneChildren (source, target) {
        for (const child of source.children) {
            if (child instanceof MeshInstance) {
                const clone = new MeshInstance({
                    mesh: child.mesh,
                    material: child.material,
                    texture: child.texture
                })
                clone.name = child.name
                clone.position.copy(child.position)
                clone.rotation.copy(child.rotation)
                clone.scale.copy(child.scale)
                clone.castShadow = child.castShadow
                target.addChild(clone)
                this.#cloneChildren(child, clone)
            } else if (child instanceof Object3D) {
                const clone = new Object3D()
                clone.name = child.name
                clone.position.copy(child.position)
                clone.rotation.copy(child.rotation)
                clone.scale.copy(child.scale)
                target.addChild(clone)
                this.#cloneChildren(child, clone)
            }
        }
    }


    async #loadAssets () {
        const [wallData, floorData, doorwayData, lampData] = await Promise.all([
            loadGlb('assets/props/wall.glb'),
            loadGlb('assets/props/floor.glb'),
            loadGlb('assets/props/doorway.glb'),
            loadGlb('assets/props/ceiling_lamp.glb')
        ])

        const gl = this.meshRenderer.context.gl

        const [wall, floor, doorway, lamp] = await Promise.all([
            buildGltfScene({...wallData, gl}),
            buildGltfScene({...floorData, gl}),
            buildGltfScene({...doorwayData, gl}),
            buildGltfScene({...lampData, gl})
        ])

        return {
            wall: wall.scene,
            floor: floor.scene,
            doorway: doorway.scene,
            lamp: lamp.scene
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
        resolveCollisions(this.player, this.colliders)

        this.camera3d.position.set(
            this.player.position.x,
            this.player.position.y + EYE_HEIGHT,
            this.player.position.z
        )
        this.camera3d.rotation.setFromEuler(this.player.pitch, this.player.yaw, 0, 'YXZ')
        this.camera3d.markDirty()
    }

}
