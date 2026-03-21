import {doc, section, text, code, action, logger} from '../../doc/runtime.js'
import Brush from './brush.js'


export default doc('Brush', () => {

    text(`
        A CSG brush primitive for constructive solid geometry operations.
        Represents a shape (box, sphere, cylinder, cone) with position, rotation,
        scale, and a CSG operation type (union, subtract, intersect).
    `)


    section('Creation', () => {

        text('Create brushes with shape, operation, and transform.')

        code('Basic box brush', () => {
            const brush = new Brush({
                shape: 'box',
                operation: 'union'
            })
        })

        code('Positioned sphere', () => {
            const brush = new Brush({
                shape: 'sphere',
                operation: 'subtract',
                x: 0.5,
                y: 0,
                z: 0
            })
        })

        code('Scaled cylinder', () => {
            const brush = new Brush({
                shape: 'cylinder',
                operation: 'intersect',
                sx: 1,
                sy: 2,
                sz: 1
            })
        })

    })


    section('Shapes', () => {

        text('Available shapes: box, sphere, cylinder, cone.')

        action('Box', () => {
            const brush = new Brush({shape: 'box'})
            const geo = brush.createGeometry()
            logger.log('shape:', brush.shape)
            logger.log('vertices:', geo.vertexCount)
        })

        action('Sphere', () => {
            const brush = new Brush({
                shape: 'sphere',
                params: {segments: 16, rings: 12}
            })
            const geo = brush.createGeometry()
            logger.log('shape:', brush.shape)
            logger.log('vertices:', geo.vertexCount)
        })

        action('Cylinder', () => {
            const brush = new Brush({
                shape: 'cylinder',
                params: {radialSegments: 16}
            })
            const geo = brush.createGeometry()
            logger.log('shape:', brush.shape)
            logger.log('vertices:', geo.vertexCount)
        })

        action('Cone', () => {
            const brush = new Brush({shape: 'cone'})
            const geo = brush.createGeometry()
            logger.log('shape:', brush.shape)
            logger.log('vertices:', geo.vertexCount)
        })

    })


    section('Operations', () => {

        text(`
            CSG operations determine how brushes combine:
            - union: adds geometry
            - subtract: removes geometry
            - intersect: keeps only overlapping geometry
        `)

        code('Subtract brush', () => {
            const hole = new Brush({
                shape: 'sphere',
                operation: 'subtract',
                x: 0.5
            })
        })

        code('Intersect brush', () => {
            const mask = new Brush({
                shape: 'box',
                operation: 'intersect'
            })
        })

    })


    section('Transform', () => {

        text('Position (x, y, z), rotation (rx, ry, rz), and scale (sx, sy, sz).')

        action('Position and scale', () => {
            const brush = new Brush({
                shape: 'box',
                x: 1,
                y: 0.5,
                z: -1,
                sx: 2,
                sy: 0.5,
                sz: 1
            })
            logger.log('position:', brush.position.x, brush.position.y, brush.position.z)
            logger.log('scale:', brush.scale.x, brush.scale.y, brush.scale.z)
        })

        action('Rotation', () => {
            const brush = new Brush({
                shape: 'box',
                rx: Math.PI / 4,
                ry: 0,
                rz: 0
            })
            logger.log('rotation:', brush.rotation.x, brush.rotation.y, brush.rotation.z)
        })

    })


    section('Color', () => {

        text('Brushes can have a color applied to their vertex colors.')

        action('Set color', () => {
            const brush = new Brush({
                shape: 'box',
                color: [1, 0, 0]
            })
            logger.log('color:', brush.color)

            const geo = brush.createGeometry()
            logger.log('has vertex colors:', geo.colors !== null)
        })

    })


    section('Serialization', () => {

        text('Convert brushes to/from JSON for persistence.')

        action('toJSON', () => {
            const brush = new Brush({
                shape: 'sphere',
                operation: 'subtract',
                x: 1,
                y: 2,
                z: 3
            })
            const json = brush.toJSON()
            logger.log('shape:', json.shape)
            logger.log('operation:', json.operation)
            logger.log('position:', json.x, json.y, json.z)
        })

        action('fromJSON', () => {
            const data = {shape: 'box', operation: 'union', x: 1, y: 0, z: 0}
            const brush = Brush.fromJSON(data)
            logger.log('shape:', brush.shape)
            logger.log('position:', brush.position.x, brush.position.y, brush.position.z)
        })

        action('clone', () => {
            const original = new Brush({shape: 'box', x: 1})
            const copy = original.clone()
            logger.log('same shape:', original.shape === copy.shape)
            logger.log('same x:', original.position.x === copy.position.x)
        })

    })

})
