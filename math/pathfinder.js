import {fourDirections, eightDirections} from './grid.js'


export const heuristics = {
    manhattan: (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y),
    euclidean: (a, b) => Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2),
    diagonal: (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y))
}


export default class Pathfinder {

    constructor (options = {}) {
        const {
            heuristic = heuristics.manhattan,
            allowDiagonal = false,
            isWalkable = () => true
        } = options

        this.heuristic = heuristic
        this.allowDiagonal = allowDiagonal
        this.isWalkable = isWalkable
    }


    findPath (grid, start, goal) { // eslint-disable-line complexity
        if (!grid.isInside(start) || !grid.isInside(goal)) {
            return null
        }

        if (!this.isWalkable(grid.getCell(start)) || !this.isWalkable(grid.getCell(goal))) {
            return null
        }

        const openSet = new Set()
        const closedSet = new Set()
        const cameFrom = new Map()
        const gScore = new Map()
        const fScore = new Map()

        const startKey = getCoordsKey(start)
        const goalKey = getCoordsKey(goal)

        openSet.add(startKey)
        gScore.set(startKey, 0)
        fScore.set(startKey, this.heuristic(start, goal))

        while (openSet.size > 0) {
            let current = getLowestFScore(openSet, fScore)
            let currentCoords = parseKey(current)

            if (current === goalKey) {
                return reconstructPath(cameFrom, current)
            }

            openSet.delete(current)
            closedSet.add(current)

            const directions = this.allowDiagonal ? eightDirections : fourDirections
            const neighbors = Object.values(directions).map(direction => {
                return {
                    x: currentCoords.x + direction.x,
                    y: currentCoords.y + direction.y
                }
            })

            for (const neighbor of neighbors) {
                const neighborKey = getCoordsKey(neighbor)

                if (!grid.isInside(neighbor)) {
                    continue
                }

                if (!this.isWalkable(grid.getCell(neighbor))) {
                    continue
                }

                if (closedSet.has(neighborKey)) {
                    continue
                }

                const tentativeGScore = gScore.get(current) + getMoveCost(currentCoords, neighbor)

                if (!openSet.has(neighborKey)) {
                    openSet.add(neighborKey)
                } else if (tentativeGScore >= gScore.get(neighborKey)) {
                    continue
                }

                cameFrom.set(neighborKey, current)
                gScore.set(neighborKey, tentativeGScore)
                fScore.set(neighborKey, tentativeGScore + this.heuristic(neighbor, goal))
            }
        }

        return null
    }


    setHeuristic (heuristic) {
        this.heuristic = heuristic
    }


    setAllowDiagonal (allowDiagonal) {
        this.allowDiagonal = allowDiagonal
    }


    setWalkableFunction (isWalkable) {
        this.isWalkable = isWalkable
    }

}


function getCoordsKey (coords) {
    return `${coords.x},${coords.y}`
}


function parseKey (key) {
    const [x, y] = key.split(',').map(Number)
    return {x, y}
}


function getLowestFScore (openSet, fScore) {
    let lowest = null
    let lowestScore = Infinity

    for (const node of openSet) {
        const score = fScore.get(node)
        if (score < lowestScore) {
            lowestScore = score
            lowest = node
        }
    }

    return lowest
}


function getMoveCost (from, to) {
    const dx = Math.abs(to.x - from.x)
    const dy = Math.abs(to.y - from.y)

    if (dx === 1 && dy === 1) {
        return Math.sqrt(2)
    }
    return 1
}


function reconstructPath (cameFrom, current) {
    const path = [parseKey(current)]

    while (cameFrom.has(current)) {
        current = cameFrom.get(current)
        path.unshift(parseKey(current))
    }

    return path
}
