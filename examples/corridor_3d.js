import RenderSystem from '/render/render_system.js'
import WebGLMeshRenderer from '/render/webgl/webgl_mesh_renderer.js'
import Camera3D from '/render/camera_3d.js'
import Geometry from '/render/geometry.js'
import Mesh from '/render/mesh.js'
import MeshInstance from '/render/mesh_instance.js'
import Material3D from '/render/material_3d.js'
import Light3D from '/render/light_3d.js'
import Object3D from '/render/object_3d.js'
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
meshRenderer.fogFar = 28
meshRenderer.fogColor = [0.04, 0.04, 0.07]


const boxGeo = Geometry.createBox(1, 1, 1)
const boxMesh = new Mesh(renderer.gl, boxGeo)
const cylinderGeo = Geometry.createCylinder({radialSegments: 12})
const cylinderMesh = new Mesh(renderer.gl, cylinderGeo)
const coneGeo = Geometry.createCylinder({radiusTop: 0, radialSegments: 12})
const coneMesh = new Mesh(renderer.gl, coneGeo)
const sphereGeo = Geometry.createSphere(0.5, 12, 8)
const sphereMesh = new Mesh(renderer.gl, sphereGeo)

const scene = new Object3D()
const halfW = CORRIDOR_WIDTH / 2
const halfL = CORRIDOR_LENGTH / 2
const halfH = CORRIDOR_HEIGHT / 2

let wallMat = null


async function loadTextures () {
    const [wallTex, floorTex, ceilTex, doorTex, trimTex] = await Promise.all([
        loadImage('assets/textures/base_wall/atech1_e.jpg'),
        loadImage('assets/textures/base_floor/clang_floor.jpg'),
        loadImage('assets/textures/base_ceiling/metceil1d.jpg'),
        loadImage('assets/textures/base_door/kcdm18talldoormetal.jpg'),
        loadImage('assets/textures/base_trim/basemetalsupport.jpg')
    ])
    return {wallTex, floorTex, ceilTex, doorTex, trimTex}
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

    addBox(0, -0.05, -halfL, CORRIDOR_WIDTH, 0.1, CORRIDOR_LENGTH, floorMat)
    addBox(0, CORRIDOR_HEIGHT + 0.05, -halfL, CORRIDOR_WIDTH, 0.1, CORRIDOR_LENGTH, ceilingMat)

    addBox(-halfW, halfH, -halfL, WALL_THICKNESS, CORRIDOR_HEIGHT, CORRIDOR_LENGTH, wallMat)

    buildWallWithDoors(halfW, DOOR_POSITIONS)

    for (const dz of DOOR_POSITIONS) {
        addBox(halfW - WALL_THICKNESS / 2 - 0.02, DOOR_HEIGHT / 2, dz, 0.06, DOOR_HEIGHT - 0.1, DOOR_WIDTH - 0.15, doorMat)
        addBox(halfW, DOOR_HEIGHT + 0.05, dz, WALL_THICKNESS + 0.04, 0.1, DOOR_WIDTH + 0.15, frameMat)
        addBox(halfW, DOOR_HEIGHT / 2, dz - DOOR_WIDTH / 2 - 0.05, WALL_THICKNESS + 0.04, DOOR_HEIGHT, 0.1, frameMat)
        addBox(halfW, DOOR_HEIGHT / 2, dz + DOOR_WIDTH / 2 + 0.05, WALL_THICKNESS + 0.04, DOOR_HEIGHT, 0.1, frameMat)
    }

    addBox(0, 0.05, -halfL, CORRIDOR_WIDTH - 0.4, 0.02, CORRIDOR_LENGTH, trimMat)

    const lights = []

    for (let z = -5; z > -CORRIDOR_LENGTH; z -= 10) {
        addBox(0, CORRIDOR_HEIGHT - 0.02, z, 0.6, 0.04, 0.15, ceilingLightMat)
        lights.push(new Light3D({
            x: 0,
            y: CORRIDOR_HEIGHT - 0.1,
            z,
            color: [1.0, 0.9, 0.7],
            intensity: 0.8,
            radius: 8
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

    addBox(0, halfH, -CORRIDOR_LENGTH - 0.05, CORRIDOR_WIDTH, CORRIDOR_HEIGHT, 0.1, wallMat)
    addBox(0, halfH, 0.05, CORRIDOR_WIDTH, CORRIDOR_HEIGHT, 0.1, wallMat)

    layer.setContent(scene)
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

    const nx = clamp(camera3d.position.x + dx, -halfW + MARGIN, halfW - MARGIN)
    const nz = clamp(camera3d.position.z + dz, -CORRIDOR_LENGTH + MARGIN, -MARGIN)

    camera3d.position.set(nx, EYE_HEIGHT, nz)
    camera3d.rotation.setFromEuler(pitch, yaw, 0, 'YXZ')
    camera3d.markDirty()

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
    lights.push(new Light3D({
        x,
        y: lightY,
        z,
        color: [1.0, 0.85, 0.55],
        intensity: 0.7,
        radius: 4
    }))
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
            addBox(wallX, halfH, segCenter, WALL_THICKNESS, CORRIDOR_HEIGHT, segLen, wallMat)
        }

        addBox(wallX, DOOR_HEIGHT + (CORRIDOR_HEIGHT - DOOR_HEIGHT) / 2, dz,
            WALL_THICKNESS, CORRIDOR_HEIGHT - DOOR_HEIGHT, DOOR_WIDTH, wallMat)

        segStart = gapEnd
    }

    if (segStart > -CORRIDOR_LENGTH + 0.01) {
        const segLen = segStart - (-CORRIDOR_LENGTH)
        const segCenter = -CORRIDOR_LENGTH + segLen / 2
        addBox(wallX, halfH, segCenter, WALL_THICKNESS, CORRIDOR_HEIGHT, segLen, wallMat)
    }
}


function clamp (value, min, max) {
    return Math.max(min, Math.min(max, value))
}
