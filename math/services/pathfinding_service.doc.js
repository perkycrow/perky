import {doc, section, text, code, action, logger} from '../../doc/runtime.js'
import PathfindingService from './pathfinding_service.js'


function createRequest (params) {
    return {params}
}


function createResponse () {
    const res = {
        data: null,
        send: (data) => {
            res.data = data
        },
        error: (msg) => {
            res.data = {error: msg}
        }
    }
    return res
}


export default doc('PathfindingService', {advanced: true}, () => {

    text(`
        Worker-ready pathfinding service wrapping [[Grid@grid]] and [[Pathfinder@pathfinder]].
        Extends [[ServiceHost@service_host]] to expose \`setGrid\`, \`setCell\`, and \`findPath\`
        as service methods. Includes result caching for repeated queries.
    `)


    section('Setup', () => {

        text('Create the service and initialize a grid before finding paths.')

        code('Creation', () => {
            const service = new PathfindingService()

            const withOptions = new PathfindingService({
                heuristic: 'euclidean',
                allowDiagonal: true,
                maxCacheSize: 1000
            })
        })

        action('setGrid', () => {
            const service = new PathfindingService()
            const req = createRequest({
                gridData: {
                    width: 5,
                    height: 5,
                    cells: {'2,0': 'wall', '2,1': 'wall', '2,2': 'wall'}
                }
            })
            const res = createResponse()
            service.setGrid(req, res)
            logger.log('result:', JSON.stringify(res.data))
        })

    })


    section('Finding Paths', () => {

        text('Call `findPath` with start and goal coordinates. Returns the path, length, and timing info.')

        action('Basic pathfinding', () => {
            const service = new PathfindingService()

            const setupReq = createRequest({
                gridData: {width: 5, height: 5, cells: {}}
            })
            const setupRes = createResponse()
            service.setGrid(setupReq, setupRes)

            const req = createRequest({
                start: {x: 0, y: 0},
                goal: {x: 4, y: 4}
            })
            const res = createResponse()
            service.findPath(req, res)

            logger.log('found:', res.data.found)
            logger.log('length:', res.data.length)
            logger.log('cached:', res.data.cached)
        })

        action('With obstacles', () => {
            const service = new PathfindingService()

            const setupReq = createRequest({
                gridData: {
                    width: 5,
                    height: 5,
                    cells: {'2,0': 'wall', '2,1': 'wall', '2,2': 'wall'}
                }
            })
            const setupRes = createResponse()
            service.setGrid(setupReq, setupRes)

            const req = createRequest({
                start: {x: 0, y: 0},
                goal: {x: 4, y: 0}
            })
            const res = createResponse()
            service.findPath(req, res)

            logger.log('found:', res.data.found)
            logger.log('path length:', res.data.length)
            if (res.data.path) {
                for (const step of res.data.path) {
                    logger.log(`(${step.x}, ${step.y})`)
                }
            }
        })

    })


    section('Caching', () => {

        text(`
            Results are cached automatically. Repeated queries with the same start, goal,
            and options return cached results. The cache is cleared when the grid changes
            via \`setGrid\` or \`setCell\`.
        `)

        action('Cached result', () => {
            const service = new PathfindingService()

            const setupReq = createRequest({
                gridData: {width: 5, height: 5, cells: {}}
            })
            const setupRes = createResponse()
            service.setGrid(setupReq, setupRes)

            const req1 = createRequest({
                start: {x: 0, y: 0}, goal: {x: 4, y: 4}
            })
            const res1 = createResponse()
            service.findPath(req1, res1)
            logger.log('first call cached:', res1.data.cached)

            const req2 = createRequest({
                start: {x: 0, y: 0}, goal: {x: 4, y: 4}
            })
            const res2 = createResponse()
            service.findPath(req2, res2)
            logger.log('second call cached:', res2.data.cached)
        })

    })


    section('Modifying the Grid', () => {

        text('Use `setCell` to update individual cells. This clears the path cache.')

        action('setCell', () => {
            const service = new PathfindingService()

            const setupReq = createRequest({
                gridData: {width: 5, height: 5, cells: {}}
            })
            const setupRes = createResponse()
            service.setGrid(setupReq, setupRes)

            const cellReq = createRequest({
                coords: {x: 2, y: 2},
                value: 'wall'
            })
            const cellRes = createResponse()
            service.setCell(cellReq, cellRes)
            logger.log('setCell result:', JSON.stringify(cellRes.data))
        })

    })

})
