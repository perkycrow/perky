import Grid from '../grid.js'
import Pathfinder, {heuristics} from '../pathfinder.js'
import ServiceHost from '../../service/service_host.js'


export default class PathfindingService extends ServiceHost {

    static serviceMethods = ['findPath', 'setGrid', 'setCell']

    constructor (config = {}) {
        super(config)

        this.grid = null
        this.pathfinder = new Pathfinder({
            heuristic: heuristics[config.heuristic] ?? heuristics.manhattan,
            allowDiagonal: config.allowDiagonal ?? true,
            isWalkable: isWalkable
        })

        this.pathCache = new Map()
        this.maxCacheSize = config.maxCacheSize || 500
    }


    setGrid (req, res) {
        try {
            const {gridData} = req.params

            if (!gridData) {
                res.error('Missing gridData parameter')
                return
            }

            this.grid = new Grid({
                width: gridData.width,
                height: gridData.height
            })

            if (gridData.cells) {
                Object.entries(gridData.cells).forEach(([key, value]) => {
                    const coords = parseCellKey(key)
                    this.grid.setCell(coords, value)
                })
            }

            this.pathCache.clear()

            res.send({
                success: true,
                gridSize: `${gridData.width}x${gridData.height}`,
                cellCount: Object.keys(gridData.cells || {}).length
            })

        } catch (error) {
            res.error(`Failed to set grid: ${error.message}`)
        }
    }


    setCell (req, res) {
        try {
            const {coords, value} = req.params

            if (!this.grid) {
                res.error('No grid set. Call setGrid first.')
                return
            }

            if (!coords || (coords.x === undefined || coords.y === undefined)) {
                res.error('Missing or invalid coords parameter')
                return
            }

            this.grid.setCell(coords, value)

            this.pathCache.clear()

            res.send({
                success: true,
                coords,
                value,
                cacheCleared: true
            })

        } catch (error) {
            res.error(`Failed to set cell: ${error.message}`)
        }
    }


    findPath (req, res) { // eslint-disable-line complexity -- clean
        try {
            const {start, goal, options = {}} = req.params

            if (!this.grid) {
                res.error('No grid set. Call setGrid first.')
                return
            }

            if (!start || !goal) {
                res.error('Missing start or goal coordinates')
                return
            }

            if (options.heuristic && heuristics[options.heuristic]) {
                this.pathfinder.setHeuristic(heuristics[options.heuristic])
            }

            if (typeof options.allowDiagonal === 'boolean') {
                this.pathfinder.setAllowDiagonal(options.allowDiagonal)
            }

            const cacheKey = getCacheKey(start, goal, options)
            if (this.pathCache.has(cacheKey)) {
                const cachedResult = this.pathCache.get(cacheKey)
                res.send({
                    ...cachedResult,
                    cached: true
                })
                return
            }

            const startTime = performance.now()
            const path = this.pathfinder.findPath(this.grid, start, goal)
            const calculationTime = performance.now() - startTime

            const result = {
                path: path || [],
                found: Boolean(path),
                length: path ? path.length : 0,
                calculationTime,
                cached: false
            }

            this.cacheResult(cacheKey, result)

            res.send(result)

        } catch (error) {
            res.error(`Pathfinding failed: ${error.message}`)
        }
    }


    cacheResult (key, result) {
        if (this.pathCache.size >= this.maxCacheSize) {
            const firstKey = this.pathCache.keys().next().value
            this.pathCache.delete(firstKey)
        }

        this.pathCache.set(key, {
            path: result.path,
            found: result.found,
            length: result.length,
            calculationTime: result.calculationTime
        })
    }

}


function parseCellKey (key) {
    const [x, y] = key.split(',').map(Number)
    return {x, y}
}


function getCacheKey (start, goal, options) {
    return `${start.x},${start.y}->${goal.x},${goal.y}|${options.heuristic || 'manhattan'}|${Boolean(options.allowDiagonal)}`
}


function isWalkable (cell) {
    if (typeof cell === 'object' && cell !== null) {
        return cell.walkable !== false
    }

    if (typeof cell === 'number') {
        return cell !== 0
    }

    if (typeof cell === 'string') {
        return cell !== 'wall'
    }

    return true
}
