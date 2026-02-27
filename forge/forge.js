import Game from '../game/game.js'
import WebGLMeshRenderer from '../render/webgl/webgl_mesh_renderer.js'
import Camera3D from '../render/camera_3d.js'
import Geometry from '../render/geometry.js'
import Mesh from '../render/mesh.js'
import MeshInstance from '../render/mesh_instance.js'
import Material3D from '../render/material_3d.js'
import Object3D from '../render/object_3d.js'
import Vec3 from '../math/vec3.js'
import ShadowMap from '../render/shadow_map.js'


export default class Forge extends Game {

    static $name = 'forge'

    // No camera: 'main' — pure 3D, like corridor_3d
    static camera = null

    static layers = [
        {name: 'game', type: 'webgl', backgroundColor: '#1a1a2e'}
    ]


    configureGame () {
        const renderer = this.getRenderer('game')
        const layer = this.getLayer('game')
        const gl = renderer.gl

        const meshRenderer = new WebGLMeshRenderer()
        renderer.registerRenderer(meshRenderer)

        const camera3d = new Camera3D({
            x: 5,
            y: 5,
            z: 5,
            fov: Math.PI / 4,
            aspect: layer.canvas.width / layer.canvas.height,
            near: 0.1,
            far: 100
        })
        camera3d.lookAt(new Vec3(0, 0, 0))
        meshRenderer.camera3d = camera3d

        this.renderSystem.on('resize', ({width, height}) => {
            camera3d.setAspect(width / height)
        })

        meshRenderer.lightDirection = [0.3, 0.8, 0.5]
        meshRenderer.ambient = 0.5
        meshRenderer.shadowMap = new ShadowMap({gl, resolution: 512})

        const scene = new Object3D()

        const boxGeo = Geometry.createBox(1, 1, 1)
        const boxMesh = new Mesh({gl, geometry: boxGeo})
        const cubeMat = new Material3D({
            color: [1.0, 0.4, 0.1],
            roughness: 0.8,
            specular: 0.2
        })
        const cube = new MeshInstance({mesh: boxMesh, material: cubeMat})
        cube.position.set(0, 0.5, 0)
        scene.addChild(cube)

        const floorGeo = Geometry.createPlane(10, 10)
        const floorMesh = new Mesh({gl, geometry: floorGeo})
        const floorMat = new Material3D({color: [0.3, 0.3, 0.35], roughness: 1})
        const floor = new MeshInstance({mesh: floorMesh, material: floorMat})
        scene.addChild(floor)

        layer.setContent(scene)
    }

}
