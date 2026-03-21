import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import Geometry from './geometry.js'


export default doc('Geometry', () => {

    text(`
        3D geometry data for meshes. Stores positions, normals, UVs, indices,
        and optionally tangents and colors. Provides static factory methods
        for common primitives.
    `)


    section('Creating Geometry', () => {

        text('Create geometry from raw buffer data or use factory methods.')

        code('From buffers', () => {
            const geometry = new Geometry({
                positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                uvs: [0, 0, 1, 0, 0.5, 1],
                indices: [0, 1, 2]
            })
        })

        action('Vertex and index count', () => {
            const geometry = new Geometry({
                positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                uvs: [0, 0, 1, 0, 0.5, 1],
                indices: [0, 1, 2]
            })

            logger.log('vertices:', geometry.vertexCount)
            logger.log('indices:', geometry.indexCount)
        })

    })


    section('Box', () => {

        text('Create a box with specified dimensions.')

        action('Create box', () => {
            const box = Geometry.createBox(2, 1, 3)

            logger.log('vertices:', box.vertexCount)
            logger.log('indices:', box.indexCount)
            logger.log('has tangents:', box.tangents !== null)
        })

        code('Custom dimensions', () => {
            const cube = Geometry.createBox(1, 1, 1)
            const tall = Geometry.createBox(1, 3, 1)
            const wide = Geometry.createBox(4, 1, 2)
        })

    })


    section('Plane', () => {

        text('Create a flat plane with optional subdivisions.')

        action('Create plane', () => {
            const plane = Geometry.createPlane(4, 4)

            logger.log('vertices:', plane.vertexCount)
            logger.log('indices:', plane.indexCount)
        })

        action('Subdivided plane', () => {
            const plane = Geometry.createPlane(4, 4, 4, 4)

            logger.log('vertices:', plane.vertexCount)
            logger.log('indices:', plane.indexCount)
        })

        code('Usage', () => {
            const ground = Geometry.createPlane(10, 10)
            const detailed = Geometry.createPlane(10, 10, 16, 16)
        })

    })


    section('Sphere', () => {

        text('Create a UV sphere with configurable segments.')

        action('Create sphere', () => {
            const sphere = Geometry.createSphere(1, 16, 12)

            logger.log('vertices:', sphere.vertexCount)
            logger.log('indices:', sphere.indexCount)
        })

        code('Different detail levels', () => {
            const lowPoly = Geometry.createSphere(1, 8, 6)
            const standard = Geometry.createSphere(1, 16, 12)
            const highPoly = Geometry.createSphere(1, 32, 24)
        })

    })


    section('Cylinder', () => {

        text('Create a cylinder with customizable top and bottom radii.')

        action('Create cylinder', () => {
            const cylinder = Geometry.createCylinder({
                radiusTop: 0.5,
                radiusBottom: 0.5,
                height: 2
            })

            logger.log('vertices:', cylinder.vertexCount)
            logger.log('indices:', cylinder.indexCount)
        })

        action('Create cone', () => {
            const cone = Geometry.createCylinder({
                radiusTop: 0,
                radiusBottom: 1,
                height: 2
            })

            logger.log('vertices:', cone.vertexCount)
        })

        code('Variants', () => {
            const cylinder = Geometry.createCylinder({height: 2})
            const cone = Geometry.createCylinder({radiusTop: 0, height: 2})
            const tube = Geometry.createCylinder({openEnded: true})
        })

    })


    section('Tangents', () => {

        text(`
            Tangents are needed for normal mapping.
            Factory methods compute them automatically.
        `)

        action('Compute tangents', () => {
            const geometry = new Geometry({
                positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                uvs: [0, 0, 1, 0, 0.5, 1],
                indices: [0, 1, 2]
            })

            logger.log('before:', geometry.tangents)

            geometry.computeTangents()

            logger.log('after:', geometry.tangents !== null)
            logger.log('tangent length:', geometry.tangents.length)
        })

    })


    section('API', () => {

        code('Constructor', () => {
            const geometry = new Geometry({
                positions: Float32Array,
                normals: Float32Array,
                uvs: Float32Array,
                indices: Uint16Array,
                tangents: Float32Array,
                colors: Float32Array
            })
        })

        code('Properties', () => {
            // geometry.positions - Float32Array of xyz coordinates
            // geometry.normals - Float32Array of xyz normals
            // geometry.uvs - Float32Array of uv coordinates
            // geometry.indices - Uint16Array of triangle indices
            // geometry.tangents - Float32Array of xyz tangents (optional)
            // geometry.colors - Float32Array of rgba colors (optional)
            // geometry.vertexCount - Number of vertices
            // geometry.indexCount - Number of indices
        })

        code('Static methods', () => {
            Geometry.createBox(width, height, depth)
            Geometry.createPlane(width, height, segmentsW, segmentsH)
            Geometry.createSphere(radius, widthSegments, heightSegments)
            Geometry.createCylinder({radiusTop, radiusBottom, height, radialSegments, openEnded})
        })

    })

})
