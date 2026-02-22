import RenderSystem from '/render/render_system.js'
import WebGLMeshRenderer from '/render/webgl/webgl_mesh_renderer.js'
import Camera3D from '/render/camera_3d.js'
import Geometry from '/render/geometry.js'
import Mesh from '/render/mesh.js'
import MeshInstance from '/render/mesh_instance.js'
import Object3D from '/render/object_3d.js'
import Vec3 from '/math/vec3.js'
import Quaternion from '/math/quaternion.js'


const container = document.getElementById('render-container')

const renderSystem = new RenderSystem({
    container,
    autoResize: true
})

renderSystem.createLayer('game', 'webgl', {
    backgroundColor: '#111122'
})

const layer = renderSystem.getLayer('game')
const renderer = renderSystem.getRenderer('game')


const meshRenderer = new WebGLMeshRenderer()
renderer.registerRenderer(meshRenderer)


const camera3d = new Camera3D({
    z: 4,
    fov: Math.PI / 4,
    aspect: container.clientWidth / container.clientHeight,
    near: 0.1,
    far: 100
})
camera3d.lookAt(new Vec3(0, 0, 0))
meshRenderer.camera3d = camera3d

renderSystem.on('resize', ({width, height}) => {
    camera3d.setAspect(width / height)
})


meshRenderer.lightDirection = [0.5, 1.0, 0.8]
meshRenderer.ambient = 0.25
meshRenderer.fogNear = 8
meshRenderer.fogFar = 30
meshRenderer.fogColor = [0.067, 0.067, 0.133]


const geometry = Geometry.createBox(1, 1, 1)
const mesh = new Mesh(renderer.gl, geometry)


const whiteTex = createWhiteTexture()


const scene = new Object3D()

const cube = new MeshInstance({mesh, texture: whiteTex})
scene.addChild(cube)


layer.setContent(scene)


const rotY = new Quaternion()
const rotX = new Quaternion()
let time = 0

function animate () {
    time += 0.016

    rotY.setFromAxisAngle(new Vec3(0, 1, 0), 0.012)
    rotX.setFromAxisAngle(new Vec3(1, 0, 0), 0.005)

    cube.rotation.multiply(rotY).multiply(rotX)
    cube.markDirty()

    layer.render()

    requestAnimationFrame(animate)
}

animate()


function createWhiteTexture () {
    const canvas = document.createElement('canvas')
    canvas.width = 2
    canvas.height = 2
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 2, 2)
    return canvas
}
