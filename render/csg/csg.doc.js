import {doc, section, text, code, action, logger} from '../../doc/runtime.js'
import CSG from './csg.js'
import Geometry from '../geometry.js'


export default doc('CSG', () => {

    text(`
        Constructive Solid Geometry operations on polygon sets.
        Combines geometries through boolean operations: union, subtract, intersect.
    `)


    section('Creation', () => {

        text('Create CSG from existing Geometry or directly from polygons.')

        code('From geometry', () => {
            const geometry = Geometry.createBox()
            const csg = CSG.fromGeometry(geometry)
        })

        code('Clone', () => {
            const csg = CSG.fromGeometry(Geometry.createBox())
            const copy = csg.clone()
        })

    })


    section('Boolean Operations', () => {

        text(`
            Three boolean operations combine CSG objects:
            - union: combines both shapes
            - subtract: removes the second shape from the first
            - intersect: keeps only the overlapping region
        `)

        action('Union', () => {
            const box = CSG.fromGeometry(Geometry.createBox())
            const sphere = CSG.fromGeometry(Geometry.createSphere(0.7))
            const result = box.union(sphere)
            const geo = result.toGeometry()
            logger.log('vertices:', geo.vertexCount)
        })

        action('Subtract', () => {
            const box = CSG.fromGeometry(Geometry.createBox())
            const sphere = CSG.fromGeometry(Geometry.createSphere(0.7))
            const result = box.subtract(sphere)
            const geo = result.toGeometry()
            logger.log('vertices:', geo.vertexCount)
        })

        action('Intersect', () => {
            const box = CSG.fromGeometry(Geometry.createBox())
            const sphere = CSG.fromGeometry(Geometry.createSphere(0.7))
            const result = box.intersect(sphere)
            const geo = result.toGeometry()
            logger.log('vertices:', geo.vertexCount)
        })

    })


    section('toGeometry', () => {

        text('Convert CSG back to Geometry for rendering. Applies T-junction suppression and coplanar polygon merging.')

        action('Basic conversion', () => {
            const box = CSG.fromGeometry(Geometry.createBox())
            const geo = box.toGeometry()
            logger.log('vertices:', geo.vertexCount)
            logger.log('indices:', geo.indices.length)
        })

        action('With triplanar UVs', () => {
            const box = CSG.fromGeometry(Geometry.createBox())
            const sphere = CSG.fromGeometry(Geometry.createSphere(0.7))
            const result = box.subtract(sphere)
            const geo = result.toGeometry({triplanar: true, uvScale: 2})
            logger.log('vertices:', geo.vertexCount)
        })

    })


    section('Chaining', () => {

        text('Operations return new CSG objects, so they can be chained.')

        action('Multiple operations', () => {
            const box = CSG.fromGeometry(Geometry.createBox())
            const sphere1 = CSG.fromGeometry(Geometry.createSphere(0.5))
            const sphere2 = CSG.fromGeometry(Geometry.createSphere(0.3))

            const result = box.subtract(sphere1).union(sphere2)
            const geo = result.toGeometry()
            logger.log('vertices:', geo.vertexCount)
        })

    })

})
