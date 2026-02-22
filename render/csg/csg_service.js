import ServiceHost from '../../service/service_host.js'
import Geometry from '../geometry.js'
import CSG from './csg.js'
import CSGPool from './csg_pool.js'


export default class CSGService extends ServiceHost {

    static serviceMethods = ['operate']


    operate (req, res) {
        try {
            const {operation, a, b} = req.params

            if (!a || !b) {
                res.error('Missing geometry data (a or b)')
                return
            }

            if (!['union', 'subtract', 'intersect'].includes(operation)) {
                res.error(`Invalid operation: ${operation}`)
                return
            }

            const result = CSGPool.run(() => {
                const geoA = new Geometry(a)
                const geoB = new Geometry(b)
                const csgA = CSG.fromGeometry(geoA)
                const csgB = CSG.fromGeometry(geoB)
                return csgA[operation](csgB).toGeometry()
            })

            res.send({
                positions: result.positions,
                normals: result.normals,
                uvs: result.uvs,
                indices: result.indices,
                tangents: result.tangents
            })

        } catch (error) {
            res.error(`CSG operation failed: ${error.message}`)
        }
    }

}
