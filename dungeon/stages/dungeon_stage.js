import Stage from '../../game/stage.js'
import WebGLMeshRenderer from '../../render/webgl/webgl_mesh_renderer.js'
import Camera3D from '../../render/camera_3d.js'
import CubeShadowMap from '../../render/cube_shadow_map.js'
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
const SPAWN = {x: -4, y: 0, z: 0}


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

        this.meshRenderer.lightDirection = [0.3, 0.9, 0.2]
        this.meshRenderer.ambientSky = [0.12, 0.12, 0.15]
        this.meshRenderer.ambientGround = [0.05, 0.04, 0.04]
        this.meshRenderer.fogNear = 8
        this.meshRenderer.fogFar = 30
        this.meshRenderer.fogColor = [0.01, 0.01, 0.02]
        const gl = this.meshRenderer.context.gl
        this.meshRenderer.cubeShadowMaps = [
            new CubeShadowMap({gl, resolution: 512}),
            new CubeShadowMap({gl, resolution: 512}),
            new CubeShadowMap({gl, resolution: 512})
        ]

        this.scene = new Object3D()
        layer.setContent(this.scene)

        this.player = this.world.spawnPlayer(SPAWN)
        this.#setupMouseLook(layer.canvas)

        this.colliders = [
            {minX: -8.05, maxX: -7.95, minZ: -2, maxZ: 2},
            {minX: -8, maxX: 4, minZ: 1.95, maxZ: 2.05},
            {minX: -8, maxX: 1.4, minZ: -2.05, maxZ: -1.95},
            {minX: 2.6, maxX: 4, minZ: -2.05, maxZ: -1.95},
            {minX: -0.05, maxX: 0.05, minZ: -2, maxZ: -0.6},
            {minX: -0.05, maxX: 0.05, minZ: 0.6, maxZ: 2},
            {minX: 3.95, maxX: 4.05, minZ: -6, maxZ: 2},
            {minX: -0.05, maxX: 0.05, minZ: -6, maxZ: -2},
            {minX: 0, maxX: 4, minZ: -6.05, maxZ: -5.95}
        ]

        this.#createDebugOverlay()

        super.onStart()

        this.#buildScene()
    }


    async #buildScene () {
        const assets = await this.#loadAssets()
        const lights = []

        this.#buildBigRoom(assets, lights)
        this.#buildSmallRoom(assets, lights)
        this.#buildSideRoom(assets, lights)

        const doorway1 = this.#placeAsset(assets.doorway, 0, 0, 0, 90)
        const door1 = this.#findByName(doorway1, 'door_4')
        if (door1) {
            door1.rotation.setFromEuler(0, Math.PI * 0.45, 0, 'YXZ')
            door1.markDirty()
        }

        const doorway2 = this.#placeAsset(assets.doorway, 2, 0, -2, 0)
        const door2 = this.#findByName(doorway2, 'door_4')
        if (door2) {
            door2.rotation.setFromEuler(0, Math.PI * 0.45, 0, 'YXZ')
            door2.markDirty()
        }

        this.meshRenderer.lights = lights
        this.scene.markDirty()
    }


    #buildBigRoom (assets, lights) {
        this.#placeAsset(assets.floor, -6, 0, 0, 0)
        this.#placeAsset(assets.floor, -2, 0, 0, 0)
        this.#placeCeiling(assets.floor, -6, 3, 0)
        this.#placeCeiling(assets.floor, -2, 3, 0)

        this.#buildWall(assets.wall, -6, -2, 0)
        this.#buildWall(assets.wall, -2, -2, 0)
        this.#buildWall(assets.wall, -6, 2, 180)
        this.#buildWall(assets.wall, -2, 2, 180)
        this.#buildWall(assets.wall, -8, 0, 90)

        const lamp1 = this.#placeAsset(assets.ceilingLamp, -4, 3, 0, 0)
        this.#setCastShadow(lamp1, false)

        lights.push(new Light3D({
            x: -4,
            y: 2.7,
            z: 0,
            color: [1.0, 0.85, 0.6],
            intensity: 3.5,
            radius: 12
        }))

        this.#placeAsset(assets.table, -5, 0, 0, 0)
        this.#placeAsset(assets.chair, -5.8, 0, 0, 90)
        this.#placeAsset(assets.chair, -4.2, 0, 0, -90)
        this.#placeAsset(assets.shelf, -7.6, 0, -1.5, 90)
        this.#placeAsset(assets.barrel, -7.3, 0, 1.5, 0)
        this.#placeAsset(assets.box, -7, 0, 1.2, 15)
    }


    #buildSmallRoom (assets, lights) {
        this.#placeAsset(assets.floor, 2, 0, 0, 0)
        this.#placeCeiling(assets.floor, 2, 3, 0)

        this.#buildWall(assets.wall, 2, 2, 180)
        this.#buildWall(assets.wall, 4, 0, -90)

        const lamp2 = this.#placeAsset(assets.ceilingLamp, 2, 3, 0, 0)
        this.#setCastShadow(lamp2, false)

        lights.push(new Light3D({
            x: 2,
            y: 2.7,
            z: 0,
            color: [1.0, 0.85, 0.6],
            intensity: 3.5,
            radius: 10
        }))

        this.#placeAsset(assets.crate, 3.3, 0, -1.5, 0)
        this.#placeAsset(assets.crate, 3.3, 0.2, -1.5, 25)
        this.#placeAsset(assets.metalShelf, 3.5, 0, 0.5, -90)
    }


    #buildSideRoom (assets, lights) {
        this.#placeAsset(assets.floor, 2, 0, -4, 0)
        this.#placeCeiling(assets.floor, 2, 3, -4)

        this.#buildWall(assets.wall, 0, -4, 90)
        this.#buildWall(assets.wall, 4, -4, -90)
        this.#buildWall(assets.wall, 2, -6, 0)

        const lamp3 = this.#placeAsset(assets.ceilingLamp, 2, 3, -4, 0)
        this.#setCastShadow(lamp3, false)

        lights.push(new Light3D({
            x: 2,
            y: 2.7,
            z: -4,
            color: [0.6, 0.8, 1.0],
            intensity: 3.5,
            radius: 10
        }))

        this.#placeAsset(assets.barrel, 3.3, 0, -5.3, 20)
        this.#placeAsset(assets.crate, 0.7, 0, -5, -10)
    }


    #buildWall (wallScene, x, z, rot) {
        this.#placeAsset(wallScene, x, 0, z, rot)
    }


    #placeCeiling (sceneTemplate, x, y, z) {
        const instance = this.#placeAsset(sceneTemplate, x, y, z, 0)
        this.#setCastShadow(instance, false)
        return instance
    }


    #setCastShadow (node, value) {
        if (node instanceof MeshInstance) {
            node.castShadow = value
        }
        for (const child of node.children) {
            this.#setCastShadow(child, value)
        }
    }




    #placeAsset (sceneTemplate, x, y, z, rot) { // eslint-disable-line max-params -- clean
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
        const names = [
            'wall', 'floor', 'doorway', 'ceiling_lamp',
            'chair', 'table', 'shelf', 'barrel', 'box', 'crate', 'metal_shelf'
        ]

        const glbData = await Promise.all(
            names.map(n => loadGlb('assets/props/' + n + '.glb'))
        )

        const gl = this.meshRenderer.context.gl

        const scenes = await Promise.all(
            glbData.map(data => buildGltfScene({...data, gl}))
        )

        const assets = {}
        names.forEach((name, i) => {
            const key = name.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
            assets[key] = scenes[i].scene
        })

        return assets
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



        const px = this.player.position.x
        const py = this.player.position.y + EYE_HEIGHT
        const pz = this.player.position.z

        this.camera3d.position.set(px, py, pz)
        this.camera3d.rotation.setFromEuler(this.player.pitch, this.player.yaw, 0, 'YXZ')
        this.camera3d.markDirty()

        this.#updateDebugOverlay()
    }


    #createDebugOverlay () {
        this.debugOverlay = document.createElement('div')
        Object.assign(this.debugOverlay.style, {
            position: 'fixed',
            top: '10px',
            left: '10px',
            color: '#0f0',
            fontFamily: 'monospace',
            fontSize: '13px',
            zIndex: '9999',
            pointerEvents: 'none',
            textShadow: '1px 1px 2px #000'
        })
        document.body.appendChild(this.debugOverlay)
    }


    #updateDebugOverlay () {
        if (!this.debugOverlay || !this.player) {
            return
        }

        const lights = this.meshRenderer.lights
        const px = this.player.position.x
        const pz = this.player.position.z
        let activeLights = 0
        let shadowLights = 0

        for (const light of lights) {
            const dx = light.position.x - px
            const dz = light.position.z - pz
            const dist = Math.sqrt(dx * dx + dz * dz)
            if (dist < light.radius) {
                activeLights++
            }
        }

        shadowLights = Math.min(this.meshRenderer.cubeShadowMaps.length, lights.length)

        this.debugOverlay.textContent = [
            `pos: ${px.toFixed(1)}, ${pz.toFixed(1)}`,
            `lights in range: ${activeLights}/${lights.length}`,
            `shadow maps: ${shadowLights}`,
            `objects: ${this.meshRenderer.collected.length}`
        ].join('\n')
        this.debugOverlay.style.whiteSpace = 'pre'
    }



}
