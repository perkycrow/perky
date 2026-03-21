import {doc, section, text, code} from '../../doc/runtime.js'
import CSGService from './csg_service.js'


export default doc('CSG Service', {advanced: true}, () => {

    text(`
        A service host for running CSG operations in a worker. Exposes
        boolean geometry operations (union, subtract, intersect) as a
        service method callable from the main thread.
    `)


    section('operate', () => {

        text(`
            Performs a CSG boolean operation on two geometries. Takes an
            operation name and serialized geometry data for both operands.
            Returns the resulting geometry data.
        `)

        code('Service definition', () => {
            class MyService extends CSGService {
                static serviceMethods = ['operate']
            }
        })

        code('Request format', () => {
            const request = {
                params: {
                    operation: 'subtract',
                    a: {positions: [], normals: [], uvs: [], indices: []},
                    b: {positions: [], normals: [], uvs: [], indices: []}
                }
            }
        })

        code('Response format', () => {
            const response = {
                positions: [],
                normals: [],
                uvs: [],
                indices: [],
                tangents: []
            }
        })

    })


    section('Operations', () => {

        text(`
            Three operations are supported:
            - union: combines both geometries
            - subtract: removes geometry B from A
            - intersect: keeps only the overlapping region
        `)

        code('Union request', () => {
            const params = {operation: 'union', a: geoDataA, b: geoDataB}
        })

        code('Subtract request', () => {
            const params = {operation: 'subtract', a: geoDataA, b: geoDataB}
        })

        code('Intersect request', () => {
            const params = {operation: 'intersect', a: geoDataA, b: geoDataB}
        })

    })

})
