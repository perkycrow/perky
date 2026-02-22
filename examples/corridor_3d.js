import RenderSystem from '/render/render_system.js'
import WebGLMeshRenderer from '/render/webgl/webgl_mesh_renderer.js'
import Camera3D from '/render/camera_3d.js'
import Geometry from '/render/geometry.js'
import Mesh from '/render/mesh.js'
import MeshInstance from '/render/mesh_instance.js'
import Object3D from '/render/object_3d.js'
import Vec3 from '/math/vec3.js'
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
const MOUSE_SENSITIVITY = 0.002
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
    x: 0, y: EYE_HEIGHT, z: 0,
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
meshRenderer.ambient = 0.15
meshRenderer.fogNear = 6
meshRenderer.fogFar = 25
meshRenderer.fogColor = [0.04, 0.04, 0.07]


const boxGeo = Geometry.createBox(1, 1, 1)
const boxMesh = new Mesh(renderer.gl, boxGeo)

const floorTex = createColorTexture('#4a4a42')
const ceilingTex = createColorTexture('#3a3a38')
const wallTex = createColorTexture('#5a5a50')
const doorTex = createColorTexture('#6b4226')
const frameTex = createColorTexture('#3a3a35')
const lightTex = createColorTexture('#ffe8a0')
const trimTex = createColorTexture('#4a4a40')


const scene = new Object3D()

const halfW = CORRIDOR_WIDTH / 2
const halfL = CORRIDOR_LENGTH / 2
const halfH = CORRIDOR_HEIGHT / 2

addBox(0, -0.05, -halfL, CORRIDOR_WIDTH, 0.1, CORRIDOR_LENGTH, floorTex)
addBox(0, CORRIDOR_HEIGHT + 0.05, -halfL, CORRIDOR_WIDTH, 0.1, CORRIDOR_LENGTH, ceilingTex)

addBox(-halfW, halfH, -halfL, WALL_THICKNESS, CORRIDOR_HEIGHT, CORRIDOR_LENGTH, wallTex)

buildWallWithDoors(halfW, DOOR_POSITIONS)

for (const dz of DOOR_POSITIONS) {
    addBox(halfW - WALL_THICKNESS / 2 - 0.02, DOOR_HEIGHT / 2, dz, 0.06, DOOR_HEIGHT - 0.1, DOOR_WIDTH - 0.15, doorTex)
    addBox(halfW, DOOR_HEIGHT + 0.05, dz, WALL_THICKNESS + 0.04, 0.1, DOOR_WIDTH + 0.15, frameTex)
    addBox(halfW, DOOR_HEIGHT / 2, dz - DOOR_WIDTH / 2 - 0.05, WALL_THICKNESS + 0.04, DOOR_HEIGHT, 0.1, frameTex)
    addBox(halfW, DOOR_HEIGHT / 2, dz + DOOR_WIDTH / 2 + 0.05, WALL_THICKNESS + 0.04, DOOR_HEIGHT, 0.1, frameTex)
}

addBox(0, 0.05, -halfL, CORRIDOR_WIDTH - 0.4, 0.02, CORRIDOR_LENGTH, trimTex)

for (let z = -3; z > -CORRIDOR_LENGTH; z -= 4) {
    addBox(0, CORRIDOR_HEIGHT - 0.02, z, 0.6, 0.04, 0.15, lightTex)
}

addBox(0, halfH, -CORRIDOR_LENGTH - 0.05, CORRIDOR_WIDTH, CORRIDOR_HEIGHT, 0.1, wallTex)
addBox(0, halfH, 0.05, CORRIDOR_WIDTH, CORRIDOR_HEIGHT, 0.1, wallTex)


layer.setContent(scene)


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


function addBox (x, y, z, sx, sy, sz, texture) {
    const inst = new MeshInstance({mesh: boxMesh, texture})
    inst.position.set(x, y, z)
    inst.scale.set(sx, sy, sz)
    scene.addChild(inst)
    return inst
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
            addBox(wallX, halfH, segCenter, WALL_THICKNESS, CORRIDOR_HEIGHT, segLen, wallTex)
        }

        addBox(wallX, DOOR_HEIGHT + (CORRIDOR_HEIGHT - DOOR_HEIGHT) / 2, dz,
            WALL_THICKNESS, CORRIDOR_HEIGHT - DOOR_HEIGHT, DOOR_WIDTH, wallTex)

        segStart = gapEnd
    }

    if (segStart > -CORRIDOR_LENGTH + 0.01) {
        const segLen = segStart - (-CORRIDOR_LENGTH)
        const segCenter = -CORRIDOR_LENGTH + segLen / 2
        addBox(wallX, halfH, segCenter, WALL_THICKNESS, CORRIDOR_HEIGHT, segLen, wallTex)
    }
}


function createColorTexture (color) {
    const canvas = document.createElement('canvas')
    canvas.width = 2
    canvas.height = 2
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = color
    ctx.fillRect(0, 0, 2, 2)
    return canvas
}


function clamp (value, min, max) {
    return Math.max(min, Math.min(max, value))
}
