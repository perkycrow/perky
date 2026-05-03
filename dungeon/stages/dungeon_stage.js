import Stage from '../../game/stage.js'
import WebGLMeshRenderer from '../../render/webgl/webgl_mesh_renderer.js'
import Camera3D from '../../render/camera_3d.js'
import CubeShadowMap from '../../render/cube_shadow_map.js'
import GBuffer from '../../render/g_buffer.js'
import MeshInstance from '../../render/mesh_instance.js'
import Material3D from '../../render/material_3d.js'
import Decal from '../../render/decal.js'
import Light3D from '../../render/light_3d.js'
import Object3D from '../../render/object_3d.js'
import {loadGlb, buildGltfScene} from '../../render/loaders/gltf_loader.js'
import {loadImage} from '../../application/loaders.js'
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
        this.meshRenderer.directionalIntensity = 0.0
        this.meshRenderer.ambientSky = [0.02, 0.02, 0.025]
        this.meshRenderer.ambientGround = [0.02, 0.02, 0.025]
        this.meshRenderer.fogNear = 8
        this.meshRenderer.fogFar = 30
        this.meshRenderer.fogColor = [0.01, 0.01, 0.02]
        const gl = this.meshRenderer.context.gl
        this.meshRenderer.gBuffer = new GBuffer({gl, width: gl.canvas.width, height: gl.canvas.height})
        this.meshRenderer.cubeShadowMaps = Array.from(
            {length: 8},
            () => new CubeShadowMap({gl, resolution: 512})
        )
        this.meshRenderer.volumetricFogEnabled = true
        this.meshRenderer.fogDensity = 0.04
        this.meshRenderer.fogHeightFalloff = 0.05
        this.meshRenderer.fogBaseHeight = 0.0
        this.meshRenderer.fogMaxDistance = 30
        this.meshRenderer.fogStartDistance = 3
        this.meshRenderer.fogColor = [0.06, 0.06, 0.08]
        this.meshRenderer.fogScatterAnisotropy = 0.4
        this.meshRenderer.ssaoEnabled = true
        this.meshRenderer.bloomEnabled = true
        this.meshRenderer.cinematicEnabled = true
        this.meshRenderer.temperature = -0.3
        this.meshRenderer.saturation = 0.9
        this.meshRenderer.toonLevels = 3
        this.meshRenderer.outlineEnabled = true

        this.scene = new Object3D()
        layer.setContent(this.scene)

        this.player = this.world.spawnPlayer(SPAWN)
        this.#setupMouseLook(layer.canvas)

        this.colliders = [
            {minX: -8, maxX: -7.4, minZ: 1.95, maxZ: 2.05},
            {minX: -4.6, maxX: 4, minZ: 1.95, maxZ: 2.05},
            {minX: -8, maxX: 1.4, minZ: -2.05, maxZ: -1.95},
            {minX: 2.6, maxX: 4, minZ: -2.05, maxZ: -1.95},
            {minX: -0.05, maxX: 0.05, minZ: -2, maxZ: -0.6},
            {minX: -0.05, maxX: 0.05, minZ: 0.6, maxZ: 2},
            {minX: 3.95, maxX: 4.05, minZ: -6, maxZ: 2},
            {minX: -0.05, maxX: 0.05, minZ: -6, maxZ: -2},
            {minX: 0, maxX: 4, minZ: -6.05, maxZ: -5.95},
            {minX: -8.05, maxX: -7.95, minZ: 2, maxZ: 14},
            {minX: -4.05, maxX: -3.95, minZ: 2, maxZ: 14},
            {minX: -10.05, maxX: -9.95, minZ: 14, maxZ: 26},
            {minX: 1.95, maxX: 2.05, minZ: 14, maxZ: 18},
            {minX: 1.95, maxX: 2.05, minZ: 22, maxZ: 26},
            {minX: -10, maxX: 2, minZ: 25.95, maxZ: 26.05},
            {minX: 2, maxX: 20, minZ: 17.95, maxZ: 18.05},
            {minX: 2, maxX: 20, minZ: 21.95, maxZ: 22.05},
            {minX: 19.95, maxX: 20.05, minZ: 18, maxZ: 22},
            {minX: -10, maxX: -8, minZ: 13.95, maxZ: 14.05},
            {minX: -4, maxX: 2, minZ: 13.95, maxZ: 14.05}
        ]

        this.#createDebugOverlay()

        super.onStart()

        this.#buildScene()
    }


    async #buildScene () {
        const assets = await this.#loadAssets()
        const lights = []

        const shroomTex = await loadImage('assets/props/shroom.png')
        const shroomDecal = new Decal({
            x: -3,
            y: 0.01,
            z: 0.5,
            width: 1,
            height: 1,
            material: new Material3D({
                texture: shroomTex,
                opacity: 0.9,
                unlit: true
            })
        })
        shroomDecal.rotation.setFromEuler(-Math.PI / 2, 0, 0, 'YXZ')
        this.scene.addChild(shroomDecal)

        this.shroomTex = shroomTex

        this.#buildBigRoom(assets, lights)
        this.#buildSmallRoom(assets, lights)
        this.#buildSideRoom(assets, lights)
        this.#buildCorridor(assets, lights)
        this.#buildHall(assets, lights)
        this.#buildWing(assets, lights)

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

        const doorway3 = this.#placeAsset(assets.doorway, -6, 0, 2, 0)
        this.animatedDoor = this.#findByName(doorway3, 'door_4')
        this.animatedDoorLights = [0, 3]

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
        this.#buildWall(assets.wall, -2, 2, 180)
        this.#buildWall(assets.wall, -8, 0, 90)

        const lamp1 = this.#placeAsset(assets.ceilingLamp, -4, 3, 0, 0)
        this.#setCastShadow(lamp1, false)

        lights.push(new Light3D({
            x: -4,
            y: 2.7,
            z: 0,
            color: [1.0, 0.85, 0.6],
            intensity: 3.0,
            radius: 12
        }))

        this.wallLampOn = this.#placeAsset(assets.wallLampOn, -7.95, 1.5, -0.5, 90)
        this.wallLampOff = this.#placeAsset(assets.wallLampOff, -7.95, 1.5, -0.5, 90)
        this.wallLampOff.visible = false
        this.#setCastShadow(this.wallLampOn, false)
        this.#setCastShadow(this.wallLampOff, false)

        this.wallLight = new Light3D({
            x: -7.5,
            y: 1.5,
            z: -0.5,
            color: [1.0, 0.8, 0.4],
            intensity: 3.0,
            radius: 6
        })
        this.wallLightIndex = lights.length
        lights.push(this.wallLight)

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
            intensity: 3.0,
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
            intensity: 3.0,
            radius: 10
        }))

        this.#placeAsset(assets.barrel, 3.3, 0, -5.3, 20)
        this.#placeAsset(assets.crate, 0.7, 0, -5, -10)
    }


    #buildCorridor (assets, lights) {
        for (let i = 0; i < 3; i++) {
            const z = 4 + i * 4
            this.#placeAsset(assets.floor, -6, 0, z, 0)
            this.#placeCeiling(assets.floor, -6, 3, z)
            this.#buildWall(assets.wall, -8, z, 90)
            this.#buildWall(assets.wall, -4, z, -90)
        }

        const lamp = this.#placeAsset(assets.ceilingLamp, -6, 3, 8, 0)
        this.#setCastShadow(lamp, false)

        lights.push(new Light3D({
            x: -6,
            y: 2.7,
            z: 8,
            color: [1.0, 0.6, 0.3],
            intensity: 2.5,
            radius: 8
        }))
    }


    #buildHall (assets, lights) {
        for (let x = 0; x < 3; x++) {
            for (let z = 0; z < 3; z++) {
                const px = -8 + x * 4
                const pz = 16 + z * 4
                this.#placeAsset(assets.floor, px, 0, pz, 0)
                this.#placeCeiling(assets.floor, px, 3, pz)
            }
        }

        this.#buildWall(assets.wall, -10, 16, 90)
        this.#buildWall(assets.wall, -10, 20, 90)
        this.#buildWall(assets.wall, -10, 24, 90)
        this.#buildWall(assets.wall, 2, 16, -90)
        this.#buildWall(assets.wall, 2, 24, -90)
        this.#buildWall(assets.wall, -8, 26, 180)
        this.#buildWall(assets.wall, -4, 26, 180)

        const lamp = this.#placeAsset(assets.ceilingLamp, -4, 3, 20, 0)
        this.#setCastShadow(lamp, false)

        lights.push(new Light3D({
            x: -4,
            y: 2.7,
            z: 20,
            color: [0.8, 0.9, 1.0],
            intensity: 2.5,
            radius: 14
        }))

        this.#placeAsset(assets.barrel, -8, 0, 24, 15)
        this.#placeAsset(assets.barrel, -7, 0, 24.5, -20)
        this.#placeAsset(assets.table, -2, 0, 18, 45)
        this.#placeAsset(assets.chair, -3, 0, 18, 30)
        this.#placeAsset(assets.crate, 0.5, 0, 24, 5)
        this.#placeAsset(assets.crate, 0.5, 0.2, 24, 70)
        this.#placeAsset(assets.box, 1, 0, 23, -15)
    }


    #buildWing (assets, lights) {
        for (let i = 0; i < 4; i++) {
            const x = 4 + i * 4
            this.#placeAsset(assets.floor, x, 0, 20, 0)
            this.#placeCeiling(assets.floor, x, 3, 20)
            this.#buildWall(assets.wall, x, 18, 0)
            this.#buildWall(assets.wall, x, 22, 180)
        }

        const lamp1 = this.#placeAsset(assets.ceilingLamp, 8, 3, 20, 0)
        this.#setCastShadow(lamp1, false)
        lights.push(new Light3D({
            x: 8,
            y: 2.7,
            z: 20,
            color: [1.0, 0.5, 0.2],
            intensity: 2.5,
            radius: 10
        }))

        const lamp2 = this.#placeAsset(assets.ceilingLamp, 16, 3, 20, 0)
        this.#setCastShadow(lamp2, false)
        lights.push(new Light3D({
            x: 16,
            y: 2.7,
            z: 20,
            color: [0.4, 1.0, 0.5],
            intensity: 2.5,
            radius: 10
        }))

        this.#buildWall(assets.wall, 20, 20, -90)

        this.#placeAsset(assets.table, 6, 0, 20, 0)
        this.#placeAsset(assets.chair, 7, 0, 20, -90)
        this.#placeAsset(assets.barrel, 18, 0, 21, 10)
        this.#placeAsset(assets.shelf, 19, 0, 19, -90)
        this.#placeAsset(assets.crate, 12, 0, 21.3, 0)
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
            'chair', 'table', 'shelf', 'barrel', 'box', 'crate', 'metal_shelf',
            'wall_lamp_on', 'wall_lamp_off'
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
            } else {
                this.#placeDecalAtCenter()
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


    #placeDecalAtCenter () {
        if (!this.shroomTex) {
            return
        }

        const sin = Math.sin(this.player.yaw)
        const cos = Math.cos(this.player.yaw)
        const sp = Math.sin(this.player.pitch)
        const cp = Math.cos(this.player.pitch)

        const rayX = -sin * cp
        const rayY = sp
        const rayZ = -cos * cp

        const ox = this.camera3d.position.x
        const oy = this.camera3d.position.y
        const oz = this.camera3d.position.z

        let bestT = 50
        let hitNormal = null

        if (Math.abs(rayY) > 0.01) {
            const tFloor = -oy / rayY
            if (tFloor > 0 && tFloor < bestT) {
                bestT = tFloor
                hitNormal = {x: 0, y: 1, z: 0}
            }
            const tCeiling = (3 - oy) / rayY
            if (tCeiling > 0 && tCeiling < bestT) {
                bestT = tCeiling
                hitNormal = {x: 0, y: -1, z: 0}
            }
        }

        for (const box of this.colliders) {
            const walls = [
                {t: (box.minX - ox) / rayX, nx: -1, nz: 0, check: 'z', min: box.minZ, max: box.maxZ},
                {t: (box.maxX - ox) / rayX, nx: 1, nz: 0, check: 'z', min: box.minZ, max: box.maxZ},
                {t: (box.minZ - oz) / rayZ, nx: 0, nz: -1, check: 'x', min: box.minX, max: box.maxX},
                {t: (box.maxZ - oz) / rayZ, nx: 0, nz: 1, check: 'x', min: box.minX, max: box.maxX}
            ]

            for (const w of walls) {
                if (!isFinite(w.t) || w.t <= 0 || w.t >= bestT) {
                    continue
                }
                const hitCoord = w.check === 'z'
                    ? oz + rayZ * w.t
                    : ox + rayX * w.t
                const hitY = oy + rayY * w.t
                if (hitCoord >= w.min && hitCoord <= w.max && hitY >= 0 && hitY <= 3) {
                    bestT = w.t
                    hitNormal = {x: w.nx, y: 0, z: w.nz}
                }
            }
        }

        if (!hitNormal || bestT >= 50) {
            return
        }

        const hx = ox + rayX * bestT + hitNormal.x * 0.01
        const hy = oy + rayY * bestT + hitNormal.y * 0.01
        const hz = oz + rayZ * bestT + hitNormal.z * 0.01

        const decal = new Decal({
            x: hx,
            y: hy,
            z: hz,
            width: 0.5,
            height: 0.5,
            material: new Material3D({
                texture: this.shroomTex,
                color: [0.3, 0.3, 0.3],
                opacity: 0.9
            })
        })

        if (hitNormal.y !== 0) {
            decal.rotation.setFromEuler(Math.PI / 2 * hitNormal.y, Math.PI, 0, 'YXZ')
        } else {
            const yaw = Math.atan2(-hitNormal.x, -hitNormal.z)
            decal.rotation.setFromEuler(Math.PI, yaw, 0, 'YXZ')
        }

        this.scene.addChild(decal)
        decal.markDirty()
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



        this.#animateObjects()

        const px = this.player.position.x
        const py = this.player.position.y + EYE_HEIGHT
        const pz = this.player.position.z

        this.camera3d.position.set(px, py, pz)
        this.camera3d.rotation.setFromEuler(this.player.pitch, this.player.yaw, 0, 'YXZ')
        this.camera3d.markDirty()
        this.meshRenderer.fogTime = performance.now() * 0.001

        this.#updateDebugOverlay()
    }


    #animateObjects () {
        const t = performance.now() * 0.001

        if (this.animatedDoor) {
            const cycle = t % 6
            const angle = cycle < 3
                ? Math.PI * 0.45 * Math.min(cycle, 1)
                : Math.PI * 0.45 * Math.max(0, 1 - (cycle - 3))

            this.animatedDoor.rotation.setFromEuler(0, angle, 0, 'YXZ')
            this.animatedDoor.markDirty()

            for (const idx of this.animatedDoorLights) {
                if (this.meshRenderer.cubeShadowMaps[idx]) {
                    this.meshRenderer.cubeShadowMaps[idx].markDirty()
                }
            }
        }

        if (this.wallLight) {
            const on = Math.floor(t / 4) % 2 === 0
            this.wallLampOn.visible = on
            this.wallLampOff.visible = !on
            this.wallLight.intensity = on ? 2.0 : 0.0

            if (this.meshRenderer.cubeShadowMaps[this.wallLightIndex]) {
                this.meshRenderer.cubeShadowMaps[this.wallLightIndex].markDirty()
            }
            if (this.meshRenderer.cubeShadowMaps[0]) {
                this.meshRenderer.cubeShadowMaps[0].markDirty()
            }
        }
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

        this.fpsFrames = 0
        this.fpsTime = performance.now()
        this.fpsDisplay = 0

        const smaaBtn = document.createElement('button')
        smaaBtn.textContent = 'SMAA: ON'
        Object.assign(smaaBtn.style, {
            position: 'fixed',
            top: '10px',
            right: '10px',
            zIndex: '9999',
            fontFamily: 'monospace',
            fontSize: '13px',
            padding: '4px 8px',
            cursor: 'pointer'
        })
        smaaBtn.addEventListener('click', () => {
            this.meshRenderer.smaaEnabled = !this.meshRenderer.smaaEnabled
            smaaBtn.textContent = 'SMAA: ' + (this.meshRenderer.smaaEnabled ? 'ON' : 'OFF')
        })
        document.body.appendChild(smaaBtn)

        const fogBtn = document.createElement('button')
        fogBtn.textContent = 'FOG: ON'
        Object.assign(fogBtn.style, {
            position: 'fixed',
            top: '40px',
            right: '10px',
            zIndex: '9999',
            fontFamily: 'monospace',
            fontSize: '13px',
            padding: '4px 8px',
            cursor: 'pointer'
        })
        fogBtn.addEventListener('click', () => {
            this.meshRenderer.volumetricFogEnabled = !this.meshRenderer.volumetricFogEnabled
            fogBtn.textContent = 'FOG: ' + (this.meshRenderer.volumetricFogEnabled ? 'ON' : 'OFF')
        })
        document.body.appendChild(fogBtn)

        const ssaoBtn = document.createElement('button')
        ssaoBtn.textContent = 'SSAO: ON'
        Object.assign(ssaoBtn.style, {
            position: 'fixed',
            top: '70px',
            right: '10px',
            zIndex: '9999',
            fontFamily: 'monospace',
            fontSize: '13px',
            padding: '4px 8px',
            cursor: 'pointer'
        })
        ssaoBtn.addEventListener('click', () => {
            this.meshRenderer.ssaoEnabled = !this.meshRenderer.ssaoEnabled
            ssaoBtn.textContent = 'SSAO: ' + (this.meshRenderer.ssaoEnabled ? 'ON' : 'OFF')
        })
        document.body.appendChild(ssaoBtn)

        const bloomBtn = document.createElement('button')
        bloomBtn.textContent = 'BLOOM: ON'
        Object.assign(bloomBtn.style, {
            position: 'fixed',
            top: '100px',
            right: '10px',
            zIndex: '9999',
            fontFamily: 'monospace',
            fontSize: '13px',
            padding: '4px 8px',
            cursor: 'pointer'
        })
        bloomBtn.addEventListener('click', () => {
            this.meshRenderer.bloomEnabled = !this.meshRenderer.bloomEnabled
            bloomBtn.textContent = 'BLOOM: ' + (this.meshRenderer.bloomEnabled ? 'ON' : 'OFF')
        })
        document.body.appendChild(bloomBtn)

        const cineBtn = document.createElement('button')
        cineBtn.textContent = 'CINE: ON'
        Object.assign(cineBtn.style, {
            position: 'fixed',
            top: '130px',
            right: '10px',
            zIndex: '9999',
            fontFamily: 'monospace',
            fontSize: '13px',
            padding: '4px 8px',
            cursor: 'pointer'
        })
        cineBtn.addEventListener('click', () => {
            this.meshRenderer.cinematicEnabled = !this.meshRenderer.cinematicEnabled
            cineBtn.textContent = 'CINE: ' + (this.meshRenderer.cinematicEnabled ? 'ON' : 'OFF')
        })
        document.body.appendChild(cineBtn)

        const toonBtn = document.createElement('button')
        toonBtn.textContent = 'TOON: ON'
        Object.assign(toonBtn.style, {
            position: 'fixed',
            top: '160px',
            right: '10px',
            zIndex: '9999',
            fontFamily: 'monospace',
            fontSize: '13px',
            padding: '4px 8px',
            cursor: 'pointer'
        })
        toonBtn.addEventListener('click', () => {
            const on = this.meshRenderer.toonLevels > 0
            this.meshRenderer.toonLevels = on ? 0 : 3
            this.meshRenderer.outlineEnabled = !on
            toonBtn.textContent = 'TOON: ' + (on ? 'OFF' : 'ON')
        })
        document.body.appendChild(toonBtn)

        this.#createFogPanel()
    }


    #createFogPanel () {
        const panel = document.createElement('div')
        Object.assign(panel.style, {
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            zIndex: '9999',
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#fff',
            background: 'rgba(0,0,0,0.7)',
            padding: '8px',
            borderRadius: '4px'
        })

        const r = this.meshRenderer
        const sliders = [
            ['density', 'fogDensity', 0, 0.5, 0.01],
            ['height', 'fogHeightFalloff', 0, 1, 0.01],
            ['start', 'fogStartDistance', 0, 20, 0.5],
            ['scatter', 'fogScatterAnisotropy', 0, 0.95, 0.05],
            ['maxDist', 'fogMaxDistance', 5, 80, 1]
        ]

        for (const [label, prop, min, max, step] of sliders) {
            const row = document.createElement('div')
            row.style.marginBottom = '2px'
            const val = document.createElement('span')
            val.style.display = 'inline-block'
            val.style.width = '40px'
            val.textContent = r[prop]
            const input = document.createElement('input')
            Object.assign(input, {type: 'range', min, max, step, value: r[prop]})
            input.style.width = '100px'
            input.style.verticalAlign = 'middle'
            input.addEventListener('input', () => {
                r[prop] = parseFloat(input.value)
                val.textContent = r[prop]
            })
            row.textContent = label + ' '
            row.appendChild(input)
            row.appendChild(val)
            panel.appendChild(row)
        }

        const colorRow = document.createElement('div')
        colorRow.style.marginTop = '4px'
        const colorInput = document.createElement('input')
        colorInput.type = 'color'
        const fc = r.fogColor
        const toHex = (v) => Math.round(v * 255).toString(16).padStart(2, '0')
        colorInput.value = '#' + toHex(fc[0]) + toHex(fc[1]) + toHex(fc[2])
        colorInput.addEventListener('input', () => {
            const hex = colorInput.value
            r.fogColor = [
                parseInt(hex.slice(1, 3), 16) / 255,
                parseInt(hex.slice(3, 5), 16) / 255,
                parseInt(hex.slice(5, 7), 16) / 255
            ]
        })
        colorRow.textContent = 'color '
        colorRow.appendChild(colorInput)
        panel.appendChild(colorRow)

        document.body.appendChild(panel)
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

        shadowLights = this.meshRenderer.activeCubeShadows?.length ?? 0

        const cached = this.meshRenderer.cubeShadowMaps
            .filter(m => !m.dirty).length
        const total = this.meshRenderer.cubeShadowMaps.length

        this.fpsFrames++
        const now = performance.now()
        if (now - this.fpsTime >= 1000) {
            this.fpsDisplay = this.fpsFrames
            this.fpsFrames = 0
            this.fpsTime = now
        }

        this.debugOverlay.textContent = [
            `fps: ${this.fpsDisplay}`,
            `pos: ${px.toFixed(1)}, ${pz.toFixed(1)}`,
            `lights in range: ${activeLights}/${lights.length}`,
            `active shadows: ${shadowLights}`,
            `cubemaps cached: ${cached}/${total}`,
            `objects: ${this.meshRenderer.collected.length}`,
            `smaa: ${this.meshRenderer.smaaEnabled ? 'on' : 'off'}`,
            `fog: ${this.meshRenderer.volumetricFogEnabled ? 'on' : 'off'}`
        ].join('\n')
        this.debugOverlay.style.whiteSpace = 'pre'
    }

}
