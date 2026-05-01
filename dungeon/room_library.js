import Object3D from '../render/object_3d.js'
import MeshInstance from '../render/mesh_instance.js'
import Material3D from '../render/material_3d.js'
import {loadGlb, buildGltfScene} from '../render/loaders/gltf_loader.js'
import {loadImage} from '../application/loaders.js'


const ROOM_NAMES = [
    'corridor', 'corridor-corner', 'corridor-end', 'corridor-intersection',
    'corridor-junction', 'corridor-transition', 'corridor-wide', 'corridor-wide-corner',
    'corridor-wide-end', 'corridor-wide-intersection', 'corridor-wide-junction',
    'gate', 'gate-door', 'gate-door-window', 'gate-metal-bars',
    'room-corner', 'room-large', 'room-large-variation',
    'room-small', 'room-small-variation', 'room-wide', 'room-wide-variation',
    'stairs', 'stairs-wide',
    'template-corner', 'template-detail', 'template-floor', 'template-floor-big',
    'template-floor-detail', 'template-floor-detail-a', 'template-floor-layer',
    'template-floor-layer-hole', 'template-floor-layer-raised',
    'template-wall', 'template-wall-corner', 'template-wall-detail-a',
    'template-wall-half', 'template-wall-stairs', 'template-wall-top'
]


export default class RoomLibrary {

    #templates = new Map()

    async load (gl, basePath = 'assets/pieces/') {
        const sharedColormap = await loadImage(basePath + 'Textures/colormap.png')
        const defaultMaterial = new Material3D({color: [1, 1, 1], roughness: 0.7})

        const promises = ROOM_NAMES.map(async (name) => {
            const data = await loadGlb(basePath + name + '.glb')
            const {meshes, materials} = await buildGltfScene({...data, gl})

            for (const mat of materials) {
                if (mat.texture) {
                    mat.texture = sharedColormap
                }
            }

            this.#templates.set(name, extractPrimitives(meshes, materials, defaultMaterial))
        })

        await Promise.all(promises)
    }


    has (name) {
        return this.#templates.has(name)
    }


    get names () {
        return Array.from(this.#templates.keys())
    }


    createInstance (name) {
        const template = this.#templates.get(name)

        if (!template) {
            throw new Error(`Unknown room: "${name}"`)
        }

        if (template.length === 1) {
            const {mesh, material} = template[0]
            return new MeshInstance({mesh, material})
        }

        const group = new Object3D()
        for (const {mesh, material} of template) {
            group.addChild(new MeshInstance({mesh, material}))
        }
        return group
    }


    placeRoom (entry) {
        const instance = this.createInstance(entry.room)

        instance.position.set(entry.x ?? 0, entry.y ?? 0, entry.z ?? 0)

        if (entry.rot) {
            const radians = entry.rot * Math.PI / 180
            instance.rotation.setFromEuler(0, radians, 0, 'YXZ')
        }

        instance.markDirty()
        return instance
    }

}


function extractPrimitives (meshes, materials, defaultMaterial) {
    const primitives = []
    for (const meshData of meshes) {
        for (const prim of meshData.primitives) {
            const material = prim.materialIndex === undefined
                ? defaultMaterial
                : materials[prim.materialIndex]
            primitives.push({mesh: prim.mesh, material})
        }
    }
    return primitives
}
