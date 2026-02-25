import RenderSystem from '/render/render_system.js'
import WebGLMeshRenderer from '/render/webgl/webgl_mesh_renderer.js'
import WebGLBillboardRenderer from '/render/webgl/webgl_billboard_renderer.js'
import WebGLSkyboxRenderer from '/render/webgl/webgl_skybox_renderer.js'
import WebGLDecalRenderer from '/render/webgl/webgl_decal_renderer.js'
import Camera3D from '/render/camera_3d.js'
import Geometry from '/render/geometry.js'
import Mesh from '/render/mesh.js'
import MeshInstance from '/render/mesh_instance.js'
import Billboard from '/render/billboard.js'
import Decal from '/render/decal.js'
import Material3D from '/render/material_3d.js'
import Light3D from '/render/light_3d.js'
import Object3D from '/render/object_3d.js'
import Skybox from '/render/skybox.js'
import ShadowMap from '/render/shadow_map.js'
import Brush from '/render/csg/brush.js'
import BrushSet from '/render/csg/brush_set.js'
import generateNormalMap from '/render/textures/generate_normal_map.js'
import {loadImage} from '/application/loaders.js'
import {createElement, createStyleSheet, adoptStyleSheets} from '/application/dom_utils.js'


const CORRIDOR_LENGTH = 40
const CORRIDOR_WIDTH = 4
const CORRIDOR_HEIGHT = 3
const WALL_THICKNESS = 0.2
const DOOR_WIDTH = 1.6
const DOOR_HEIGHT = 2.5
const DOOR_POSITIONS = [-7, -15, -23, -31]
const EYE_HEIGHT = 1.6
const MOVE_SPEED = 4
const MOUSE_SENSITIVITY = 0.001
const MARGIN = 0.3


const container = document.getElementById('render-container')

const renderSystem = new RenderSystem({
    container,
    autoResize: true
})

renderSystem.createLayer('game', 'webgl', {
    backgroundColor: '#0a0a12'
})

const layer = renderSystem.getLayer('game')
const renderer = renderSystem.getRenderer('game')

const meshRenderer = new WebGLMeshRenderer()
renderer.registerRenderer(meshRenderer)

const camera3d = new Camera3D({
    x: 0,
    y: EYE_HEIGHT,
    z: 0,
    fov: Math.PI / 3,
    aspect: container.clientWidth / container.clientHeight,
    near: 0.05,
    far: 50
})

meshRenderer.camera3d = camera3d

renderSystem.on('resize', ({width, height}) => {
    camera3d.setAspect(width / height)
})

meshRenderer.lightDirection = [0.2, 0.9, 0.4]
meshRenderer.ambient = 0.08
meshRenderer.fogNear = 8
meshRenderer.fogFar = 45
meshRenderer.fogColor = [0.04, 0.04, 0.07]
meshRenderer.shadowMap = new ShadowMap({gl: renderer.gl, resolution: 1024})

const skyboxRenderer = new WebGLSkyboxRenderer()
renderer.registerRenderer(skyboxRenderer)
skyboxRenderer.camera3d = camera3d
skyboxRenderer.skybox = new Skybox({
    skyColor: [0.01, 0.02, 0.06],
    horizonColor: [0.04, 0.04, 0.07],
    groundColor: [0.03, 0.03, 0.02]
})

const decalRenderer = new WebGLDecalRenderer()
renderer.registerRenderer(decalRenderer)
decalRenderer.camera3d = camera3d
decalRenderer.fogNear = meshRenderer.fogNear
decalRenderer.fogFar = meshRenderer.fogFar
decalRenderer.fogColor = meshRenderer.fogColor

const billboardRenderer = new WebGLBillboardRenderer()
renderer.registerRenderer(billboardRenderer)
billboardRenderer.camera3d = camera3d
billboardRenderer.fogNear = meshRenderer.fogNear
billboardRenderer.fogFar = meshRenderer.fogFar
billboardRenderer.fogColor = meshRenderer.fogColor


const gl = renderer.gl
const boxMesh = new Mesh({gl, geometry: Geometry.createBox(1, 1, 1)})
const cylinderMesh = new Mesh({gl, geometry: Geometry.createCylinder({radialSegments: 12})})
const coneMesh = new Mesh({gl, geometry: Geometry.createCylinder({radiusTop: 0, radialSegments: 12})})
const sphereMesh = new Mesh({gl, geometry: Geometry.createSphere(0.5, 12, 8)})

const scene = new Object3D()
const halfW = CORRIDOR_WIDTH / 2
const halfL = CORRIDOR_LENGTH / 2
const halfH = CORRIDOR_HEIGHT / 2

let wallMat = null


async function loadTextures () {
    const [wallTex, floorTex, ceilTex, doorTex, trimTex, lightDecalTex, signDecalTex] = await Promise.all([
        loadImage('assets/textures/base_wall/atech1_e.jpg'),
        loadImage('assets/textures/base_floor/clang_floor.jpg'),
        loadImage('assets/textures/base_ceiling/metceil1d.jpg'),
        loadImage('assets/textures/base_door/kcdm18talldoormetal.jpg'),
        loadImage('assets/textures/base_trim/basemetalsupport.jpg'),
        loadImage('assets/textures/gothic_light/gothic_light2.jpg'),
        loadImage('assets/textures/base_support/flat1_1.jpg')
    ])
    return {wallTex, floorTex, ceilTex, doorTex, trimTex, lightDecalTex, signDecalTex}
}


function buildScene (textures) {
    const wallNormal = generateNormalMap(textures.wallTex, {strength: 2.0})
    const floorNormal = generateNormalMap(textures.floorTex, {strength: 1.5})
    const doorNormal = generateNormalMap(textures.doorTex, {strength: 2.0})

    const floorMat = new Material3D({
        texture: textures.floorTex,
        color: [0.9, 0.9, 0.85],
        uvScale: [4, 40],
        roughness: 0.4,
        specular: 0.5,
        normalMap: floorNormal,
        normalStrength: 0.8
    })

    const ceilingMat = new Material3D({
        texture: textures.ceilTex,
        color: [0.85, 0.85, 0.82],
        uvScale: [4, 40],
        roughness: 0.7,
        specular: 0.2
    })

    wallMat = new Material3D({
        texture: textures.wallTex,
        color: [0.95, 0.95, 0.9],
        uvScale: [10, 3],
        roughness: 0.7,
        specular: 0.3,
        normalMap: wallNormal,
        normalStrength: 0.8
    })

    const doorMat = new Material3D({
        texture: textures.doorTex,
        color: [0.9, 0.8, 0.7],
        uvScale: [1, 1],
        roughness: 0.4,
        specular: 0.5,
        normalMap: doorNormal,
        normalStrength: 0.8
    })

    const frameMat = new Material3D({
        texture: textures.trimTex,
        color: [0.8, 0.8, 0.78],
        uvScale: [1, 3],
        roughness: 0.5,
        specular: 0.4
    })

    const trimMat = new Material3D({
        texture: textures.trimTex,
        color: [0.7, 0.7, 0.68],
        uvScale: [4, 40],
        roughness: 0.5,
        specular: 0.3
    })

    const ceilingLightMat = new Material3D({
        color: [1.0, 0.91, 0.63],
        emissive: [0.8, 0.7, 0.4],
        unlit: true
    })

    const woodMat = new Material3D({
        texture: textures.trimTex,
        color: [0.35, 0.22, 0.12],
        uvScale: [2, 2],
        roughness: 0.8,
        specular: 0.15
    })

    const darkMetalMat = new Material3D({
        texture: textures.trimTex,
        color: [0.25, 0.25, 0.28],
        uvScale: [1, 1],
        roughness: 0.3,
        specular: 0.6
    })

    const shadeMat = new Material3D({
        color: [1.0, 0.85, 0.55],
        emissive: [0.6, 0.45, 0.2],
        unlit: true
    })

    const drawerMat = new Material3D({
        texture: textures.trimTex,
        color: [0.4, 0.28, 0.16],
        uvScale: [1, 1],
        roughness: 0.7,
        specular: 0.2
    })

    const knobMat = new Material3D({
        color: [0.6, 0.55, 0.45],
        roughness: 0.3,
        specular: 0.7
    })

    addBox(0, -0.05, -halfL, CORRIDOR_WIDTH, 0.1, CORRIDOR_LENGTH, floorMat).castShadow = false
    addBox(0, CORRIDOR_HEIGHT + 0.05, -halfL, CORRIDOR_WIDTH, 0.1, CORRIDOR_LENGTH, ceilingMat).castShadow = false

    addBox(-halfW, halfH, -halfL, WALL_THICKNESS, CORRIDOR_HEIGHT, CORRIDOR_LENGTH, wallMat).castShadow = false

    buildWallWithDoors(halfW, DOOR_POSITIONS)

    for (const dz of DOOR_POSITIONS) {
        addBox(halfW - WALL_THICKNESS / 2 - 0.02, DOOR_HEIGHT / 2, dz, 0.06, DOOR_HEIGHT - 0.1, DOOR_WIDTH - 0.15, doorMat).castShadow = false
        addBox(halfW, DOOR_HEIGHT + 0.05, dz, WALL_THICKNESS + 0.04, 0.1, DOOR_WIDTH + 0.15, frameMat).castShadow = false
        addBox(halfW, DOOR_HEIGHT / 2, dz - DOOR_WIDTH / 2 - 0.05, WALL_THICKNESS + 0.04, DOOR_HEIGHT, 0.1, frameMat).castShadow = false
        addBox(halfW, DOOR_HEIGHT / 2, dz + DOOR_WIDTH / 2 + 0.05, WALL_THICKNESS + 0.04, DOOR_HEIGHT, 0.1, frameMat).castShadow = false
    }

    addBox(0, 0.05, -halfL, CORRIDOR_WIDTH - 0.4, 0.02, CORRIDOR_LENGTH, trimMat).castShadow = false

    const lights = []

    for (let z = -5; z > -CORRIDOR_LENGTH; z -= 10) {
        addBox(0, CORRIDOR_HEIGHT - 0.02, z, 0.6, 0.04, 0.15, ceilingLightMat).castShadow = false
        lights.push(new Light3D({
            x: 0,
            y: CORRIDOR_HEIGHT - 0.1,
            z,
            color: [1.0, 0.9, 0.7],
            intensity: 1.0,
            radius: 10,
            direction: [0, -1, 0],
            angle: 45,
            penumbra: 0.3
        }))
    }

    const cabinetMats = {wood: woodMat, drawer: drawerMat, knob: knobMat}
    const lampMats = {metal: darkMetalMat, shade: shadeMat}

    buildTable(-halfW + 0.55, -4, woodMat, darkMetalMat)
    buildLamp(-halfW + 0.45, -4, lights, lampMats)

    buildCabinet(-halfW + 0.4, -11, cabinetMats)
    buildLamp(-halfW + 0.45, -12.2, lights, lampMats)

    buildTable(-halfW + 0.55, -19, woodMat, darkMetalMat)
    buildLamp(-halfW + 0.45, -19, lights, lampMats)

    buildCabinet(-halfW + 0.4, -27, cabinetMats)
    buildLamp(-halfW + 0.45, -28.2, lights, lampMats)

    buildTable(-halfW + 0.55, -35, woodMat, darkMetalMat)
    buildLamp(-halfW + 0.45, -35, lights, lampMats)

    meshRenderer.lights = lights

    addBox(0, halfH, 0.05, CORRIDOR_WIDTH, CORRIDOR_HEIGHT, 0.1, wallMat).castShadow = false

    addBox(0, -0.05, -CORRIDOR_LENGTH - 5, 12, 0.1, 10, floorMat).castShadow = false

    addBox(-halfW, halfH, -CORRIDOR_LENGTH - 0.5, WALL_THICKNESS, CORRIDOR_HEIGHT, 1, wallMat).castShadow = false
    addBox(halfW, halfH, -CORRIDOR_LENGTH - 0.5, WALL_THICKNESS, CORRIDOR_HEIGHT, 1, wallMat).castShadow = false
    addBox(0, CORRIDOR_HEIGHT + 0.05, -CORRIDOR_LENGTH - 0.5, CORRIDOR_WIDTH, 0.1, 1, ceilingMat).castShadow = false

    buildCSGDecoration(0, -CORRIDOR_LENGTH - 4, wallMat, lights, ceilingLightMat)

    buildDecals(textures)

    spawnDust(lights)

    layer.setContent(scene)
}


const dustMat = new Material3D({
    color: [1.0, 0.9, 0.7],
    emissive: [0.15, 0.1, 0.05],
    opacity: 0.3,
    unlit: true
})

const dustParticles = []
const tableLamps = []
let time = 0


function spawnDust (lights) {
    for (const light of lights) {
        const count = 6
        for (let i = 0; i < count; i++) {
            const size = 0.02 + Math.random() * 0.04
            const bb = new Billboard({
                x: light.position.x + (Math.random() - 0.5) * 2,
                y: light.position.y - Math.random() * 1.5,
                z: light.position.z + (Math.random() - 0.5) * 2,
                width: size,
                height: size,
                material: dustMat
            })
            scene.addChild(bb)
            dustParticles.push({
                billboard: bb,
                vx: (Math.random() - 0.5) * 0.02,
                vy: (Math.random() - 0.5) * 0.01,
                vz: (Math.random() - 0.5) * 0.02,
                phase: Math.random() * Math.PI * 2,
                baseY: bb.position.y
            })
        }
    }
}


loadTextures().then(buildScene)


const keys = {}
let yaw = 0
let pitch = 0
let locked = false

const canvas = layer.canvas

canvas.addEventListener('click', () => {
    if (!locked) {
        container.requestFullscreen().then(() => {
            canvas.requestPointerLock()
        })
    }
})

document.addEventListener('pointerlockchange', () => {
    locked = document.pointerLockElement === canvas
    hint.style.display = locked ? 'none' : 'flex'
    crosshair.style.display = locked ? 'block' : 'none'
})

document.addEventListener('mousemove', (e) => {
    if (!locked) {
        return
    }
    yaw -= e.movementX * MOUSE_SENSITIVITY
    pitch -= e.movementY * MOUSE_SENSITIVITY
    pitch = clamp(pitch, -1.4, 1.4)
})

document.addEventListener('keydown', (e) => {
    keys[e.code] = true
})

document.addEventListener('keyup', (e) => {
    keys[e.code] = false
})


function animate () {
    const dt = 0.016

    const forwardX = -Math.sin(yaw)
    const forwardZ = -Math.cos(yaw)
    const rightX = Math.cos(yaw)
    const rightZ = -Math.sin(yaw)

    let dx = 0
    let dz = 0

    if (keys.KeyW) {
        dx += forwardX
        dz += forwardZ
    }
    if (keys.KeyS) {
        dx -= forwardX
        dz -= forwardZ
    }
    if (keys.KeyA) {
        dx -= rightX
        dz -= rightZ
    }
    if (keys.KeyD) {
        dx += rightX
        dz += rightZ
    }

    const len = Math.sqrt(dx * dx + dz * dz)
    if (len > 0) {
        const speed = MOVE_SPEED * dt / len
        dx *= speed
        dz *= speed
    }

    let nx = camera3d.position.x + dx
    let nz = clamp(camera3d.position.z + dz, -CORRIDOR_LENGTH - 9.7, -MARGIN)

    if (nz > -CORRIDOR_LENGTH) {
        nx = clamp(nx, -halfW + MARGIN, halfW - MARGIN)
    } else {
        nx = clamp(nx, -5.7, 5.7)
    }

    camera3d.position.set(nx, EYE_HEIGHT, nz)
    camera3d.rotation.setFromEuler(pitch, yaw, 0, 'YXZ')
    camera3d.markDirty()

    time += dt
    for (const lamp of tableLamps) {
        const phase = lamp.position.z * 3.7
        const flicker = Math.sin(time * 6 + phase)
            + Math.sin(time * 14.3 + phase * 1.3) * 0.5
            + Math.sin(time * 31 + phase * 0.7) * 0.3
        lamp.intensity = 0.7 + flicker * 0.12
    }
    updateDust(dt)

    layer.render()
    requestAnimationFrame(animate)
}

animate()


const hint = createElement('div', {
    class: 'fps-hint',
    html: 'Click to play<br><small>WASD to move — Mouse to look</small>'
})
container.appendChild(hint)

const crosshair = createElement('div', {class: 'fps-crosshair'})
crosshair.style.display = 'none'
container.appendChild(crosshair)

adoptStyleSheets(document, createStyleSheet(`
    .fps-hint {
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-family: "Source Code Pro", monospace;
        font-size: 18px;
        color: #ccc;
        background: rgba(0, 0, 0, 0.4);
        cursor: pointer;
        text-align: center;
        line-height: 1.6;
        pointer-events: none;
    }

    .fps-hint small {
        font-size: 12px;
        color: #888;
    }

    .fps-crosshair {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 2px;
        height: 2px;
        background: rgba(255, 255, 255, 0.6);
        transform: translate(-50%, -50%);
        pointer-events: none;
        box-shadow: 0 0 4px rgba(255, 255, 255, 0.3);
    }
`))


function addBox (x, y, z, sx, sy, sz, material) { // eslint-disable-line max-params -- clean
    const inst = new MeshInstance({mesh: boxMesh, material})
    inst.position.set(x, y, z)
    inst.scale.set(sx, sy, sz)
    scene.addChild(inst)
    return inst
}


function addCylinder (x, y, z, sx, sy, sz, material) { // eslint-disable-line max-params -- clean
    const inst = new MeshInstance({mesh: cylinderMesh, material})
    inst.position.set(x, y, z)
    inst.scale.set(sx, sy, sz)
    scene.addChild(inst)
    return inst
}


function addCone (x, y, z, sx, sy, sz, material) { // eslint-disable-line max-params -- clean
    const inst = new MeshInstance({mesh: coneMesh, material})
    inst.position.set(x, y, z)
    inst.scale.set(sx, sy, sz)
    scene.addChild(inst)
    return inst
}


function addSphere (x, y, z, r, material) { // eslint-disable-line max-params -- clean
    const inst = new MeshInstance({mesh: sphereMesh, material})
    inst.position.set(x, y, z)
    inst.scale.set(r * 2, r * 2, r * 2)
    scene.addChild(inst)
    return inst
}


function buildTable (x, z, woodMat, metalMat) {
    const tableH = 0.75
    const topW = 0.8
    const topD = 0.5
    const topThick = 0.04
    const legR = 0.02
    const legH = tableH - topThick

    addBox(x, tableH - topThick / 2, z, topW, topThick, topD, woodMat)

    const legInsetX = topW / 2 - 0.06
    const legInsetZ = topD / 2 - 0.06
    for (const ox of [-legInsetX, legInsetX]) {
        for (const oz of [-legInsetZ, legInsetZ]) {
            addCylinder(x + ox, legH / 2, z + oz, legR * 2, legH, legR * 2, metalMat)
        }
    }
}


function buildCabinet (x, z, materials) {
    const cabinetH = 0.9
    const cabinetW = 0.6
    const cabinetD = 0.4

    addBox(x, cabinetH / 2, z, cabinetW, cabinetH, cabinetD, materials.wood)

    const drawerH = 0.18
    const drawerGap = 0.04
    const drawerW = cabinetW - 0.06
    const drawerD = 0.02
    const frontZ = z + cabinetD / 2 + 0.005

    for (let i = 0; i < 3; i++) {
        const dy = 0.12 + i * (drawerH + drawerGap)
        addBox(x, dy + drawerH / 2, frontZ, drawerW, drawerH, drawerD, materials.drawer)
        addSphere(x, dy + drawerH / 2, frontZ + 0.02, 0.015, materials.knob)
    }
}


function buildLamp (x, z, lights, materials) {
    const baseH = 0.02
    const stemH = 0.35
    const shadeH = 0.18
    const tableTop = 0.75

    const baseY = tableTop + baseH / 2
    addCylinder(x, baseY, z, 0.08, baseH, 0.08, materials.metal)

    const stemY = tableTop + baseH + stemH / 2
    addCylinder(x, stemY, z, 0.02, stemH, 0.02, materials.metal)

    const shadeY = tableTop + baseH + stemH + shadeH / 2
    addCone(x, shadeY, z, 0.22, shadeH, 0.22, materials.shade)

    const lightY = tableTop + baseH + stemH + shadeH * 0.3
    const lamp = new Light3D({
        x,
        y: lightY,
        z,
        color: [1.0, 0.85, 0.55],
        intensity: 0.7,
        radius: 4
    })
    lights.push(lamp)
    tableLamps.push(lamp)
}


function buildWallWithDoors (wallX, doorPositions) {
    const sorted = [...doorPositions].sort((a, b) => b - a)
    let segStart = 0

    for (const dz of sorted) {
        const gapStart = dz + DOOR_WIDTH / 2
        const gapEnd = dz - DOOR_WIDTH / 2

        if (segStart > gapStart + 0.01) {
            const segLen = segStart - gapStart
            const segCenter = gapStart + segLen / 2
            addBox(wallX, halfH, segCenter, WALL_THICKNESS, CORRIDOR_HEIGHT, segLen, wallMat).castShadow = false
        }

        addBox(wallX, DOOR_HEIGHT + (CORRIDOR_HEIGHT - DOOR_HEIGHT) / 2, dz,
            WALL_THICKNESS, CORRIDOR_HEIGHT - DOOR_HEIGHT, DOOR_WIDTH, wallMat).castShadow = false

        segStart = gapEnd
    }

    if (segStart > -CORRIDOR_LENGTH + 0.01) {
        const segLen = segStart - (-CORRIDOR_LENGTH)
        const segCenter = -CORRIDOR_LENGTH + segLen / 2
        addBox(wallX, halfH, segCenter, WALL_THICKNESS, CORRIDOR_HEIGHT, segLen, wallMat).castShadow = false
    }
}


function buildCSGDecoration (x, z, material, lights, lightMat) { // eslint-disable-line max-params -- clean
    const brushes = new BrushSet()
    brushes.add(new Brush({shape: 'box'}))
    brushes.add(new Brush({shape: 'sphere', operation: 'subtract', sx: 1.3, sy: 1.3, sz: 1.3, params: {segments: 16, rings: 12}}))
    const geo = brushes.build()
    const mesh = new Mesh({gl, geometry: geo})

    const pedestal = addBox(x, 0.5, z, 0.6, 1, 0.6, material)
    pedestal.castShadow = true

    const piece = new MeshInstance({mesh, material})
    piece.position.set(x, 1.5, z)
    piece.scale.set(0.8, 0.8, 0.8)
    piece.rotation.setFromEuler(Math.PI / 6, Math.PI / 4, 0, 'YXZ')
    scene.addChild(piece)

    addBox(x, CORRIDOR_HEIGHT - 0.02, z, 0.6, 0.04, 0.15, lightMat).castShadow = false

    lights.push(new Light3D({
        x,
        y: CORRIDOR_HEIGHT - 0.1,
        z,
        color: [1.0, 0.9, 0.7],
        intensity: 1.2,
        radius: 6,
        direction: [0, -1, 0],
        angle: 35,
        penumbra: 0.4
    }))
}


function buildDecals (textures) {
    const lightMat = new Material3D({
        texture: textures.lightDecalTex,
        emissive: [0.3, 0.2, 0.05],
        opacity: 0.9
    })

    const signMat = new Material3D({
        texture: textures.signDecalTex,
        color: [0.6, 0.6, 0.55],
        opacity: 0.8
    })

    const wallX = -halfW + WALL_THICKNESS / 2 + 0.01

    for (const z of [-8, -16, -24, -33]) {
        const d = new Decal({
            x: wallX,
            y: 1.6,
            z,
            width: 0.5,
            height: 0.5,
            material: signMat
        })
        d.rotation.setFromEuler(0, Math.PI / 2, 0, 'YXZ')
        scene.addChild(d)
    }

    for (const z of [-5, -15, -25, -35]) {
        const d = new Decal({
            x: 0,
            y: CORRIDOR_HEIGHT - 0.01,
            z,
            width: 1.2,
            height: 1.2,
            material: lightMat
        })
        d.rotation.setFromEuler(-Math.PI / 2, 0, 0, 'YXZ')
        scene.addChild(d)
    }
}


function updateDust (dt) {
    for (const p of dustParticles) {
        const pos = p.billboard.position
        pos.x += p.vx * dt
        pos.y = p.baseY + Math.sin(time * 0.5 + p.phase) * 0.15
        pos.z += p.vz * dt

        if (pos.x < -halfW + 0.1) {
            pos.x = halfW - 0.1
        }
        if (pos.x > halfW - 0.1) {
            pos.x = -halfW + 0.1
        }
        if (pos.z < -CORRIDOR_LENGTH + 0.1) {
            pos.z = -0.1
        }
        if (pos.z > -0.1) {
            pos.z = -CORRIDOR_LENGTH + 0.1
        }

        p.billboard.markDirty()
    }
}


function clamp (value, min, max) {
    return Math.max(min, Math.min(max, value))
}
