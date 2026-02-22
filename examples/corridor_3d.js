import RenderSystem from '/render/render_system.js'
import WebGLMeshRenderer from '/render/webgl/webgl_mesh_renderer.js'
import Camera3D from '/render/camera_3d.js'
import Geometry from '/render/geometry.js'
import Mesh from '/render/mesh.js'
import MeshInstance from '/render/mesh_instance.js'
import Object3D from '/render/object_3d.js'
import Vec3 from '/math/vec3.js'


const CORRIDOR_LENGTH = 40
const CORRIDOR_WIDTH = 4
const CORRIDOR_HEIGHT = 3
const WALL_THICKNESS = 0.2
const DOOR_WIDTH = 1.6
const DOOR_HEIGHT = 2.5
const DOOR_POSITIONS = [-7, -15, -23, -31]


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
    x: 0, y: 1.6, z: 1,
    fov: Math.PI / 3,
    aspect: container.clientWidth / container.clientHeight,
    near: 0.05,
    far: 50
})
camera3d.lookAt(new Vec3(0, 1.6, -10))
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


layer.setContent(scene)


let time = 0

function animate () {
    time += 0.016

    const walkZ = -((time * 1.8) % (CORRIDOR_LENGTH - 4))
    const bob = Math.sin(time * 6) * 0.025
    const sway = Math.sin(time * 3) * 0.015

    camera3d.setPosition(sway, 1.6 + bob, walkZ)
    camera3d.lookAt(new Vec3(sway * 0.5, 1.55 + bob * 0.5, walkZ - 5))

    layer.render()
    requestAnimationFrame(animate)
}

animate()


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
