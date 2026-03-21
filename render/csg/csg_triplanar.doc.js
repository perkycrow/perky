import {doc, section, text, code, action, logger} from '../../doc/runtime.js'
import applyTriplanarUVs from './csg_triplanar.js'
import CSG from './csg.js'
import Geometry from '../geometry.js'


export default doc('CSG Triplanar', {advanced: true}, () => {

    text(`
        Triplanar UV mapping for CSG polygons. Assigns texture coordinates
        based on polygon orientation when original UVs are collapsed or missing.
    `)


    section('The Problem', () => {

        text(`
            CSG operations create new polygons at intersection surfaces.
            These new polygons often have degenerate or missing UV coordinates,
            causing textures to appear stretched or broken.

            Triplanar mapping projects UVs from world-space position based
            on which axis the polygon faces, ensuring consistent texturing.
        `)

    })


    section('applyTriplanarUVs', () => {

        text(`
            Scans polygons and replaces collapsed UVs with triplanar-projected
            coordinates. Only modifies polygons where all vertices share nearly
            identical UVs.
        `)

        code('Usage', () => {
            const polygons = []
            applyTriplanarUVs(polygons, 1)
        })

        code('With UV scale', () => {
            applyTriplanarUVs(polygons, 2)
        })

        action('Apply to CSG result', () => {
            const box = CSG.fromGeometry(Geometry.createBox())
            const sphere = CSG.fromGeometry(Geometry.createSphere(0.7))
            const result = box.subtract(sphere)

            applyTriplanarUVs(result.polygons, 1)
            const geo = result.toGeometry({skipTriplanar: true})

            logger.log('vertices:', geo.vertexCount)
            logger.log('has UVs:', geo.uvs !== null)
        })

    })


    section('Projection', () => {

        text(`
            UVs are projected based on the dominant axis of the polygon normal:
            - X-facing: UV from (z, y)
            - Y-facing: UV from (x, z)
            - Z-facing: UV from (x, y)

            The uvScale parameter multiplies the projected coordinates,
            controlling texture tiling density.
        `)

    })

})
