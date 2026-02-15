import Grid from '../../math/grid.js'


const directions = {
    up:    {x:  0, y:  1},
    right: {x:  1, y:  0},
    down:  {x:  0, y: -1},
    left:  {x: -1, y:  0}
}


export default class Board {

    constructor (params = {}) {
        this.restore(params)
    }


    get width () {
        return this.grid.width
    }


    get height () {
        return this.grid.height
    }


    isInside ({x, y}) {
        return this.grid.isInside({x, y})
    }


    getReagent ({x, y}) {
        return this.grid.getCell({x, y})
    }


    getReagents ({sortBy, sort, filter, reverse, count = Infinity, random = false} = {}) {
        let reagents = filter ? this.filter(filter) : this.toArray()

        if (random) {
            shuffleArray(reagents, random)
        }

        if (sortBy) {
            reagents = reagents.sort((a, b) => {
                return a[sortBy] - b[sortBy]
            })
        }

        if (sort) {
            reagents = reagents.sort(sort)
        }

        if (reverse) {
            reagents.reverse()
        }

        reagents = reagents.slice(0, count)

        return reagents
    }


    neighbourOf ({x, y}, step) {
        return this.getReagent({
            x: x + step.x,
            y: y + step.y
        })
    }


    fourNeighboursOf ({x, y}) {
        const neighbours = []
        for (const name in directions) {
            const step = directions[name]
            const neighbour = this.neighbourOf({x, y}, step)
            if (neighbour) {
                neighbours.push(neighbour)
            }
        }
        return neighbours
    }


    setReagent (reagent, order = this.order++) {
        if (this.getReagent(reagent)) {
            return false
        }

        this.grid.setCell({x: reagent.x, y: reagent.y}, reagent)
        reagent.order = order

        return true
    }


    removeReagent (reagent) {
        if (this.getReagent(reagent) === reagent) {
            this.clearCell(reagent)

            return true
        }

        return false
    }


    evolveReagent (reagent, evolutionName) {
        if (evolutionName) {
            reagent.name = evolutionName
            reagent.order = this.order++

            return true
        }

        return false
    }


    moveReagent ({x, y}, destination) {
        const reagent = this.getReagent({x, y})

        if (reagent && this.isInside(destination) && !this.getReagent(destination)) {
            this.removeReagent(reagent)

            reagent.x = destination.x
            reagent.y = destination.y

            return this.setReagent(reagent)
        }

        return false
    }


    swapReagents (reagentA, reagentB) {
        const positionA = {x: reagentA.x, y: reagentA.y}
        const positionB = {x: reagentB.x, y: reagentB.y}

        this.removeReagent(reagentA)
        this.removeReagent(reagentB)

        reagentA.x = positionB.x
        reagentA.y = positionB.y
        reagentB.x = positionA.x
        reagentB.y = positionA.y

        this.setReagent(reagentA)
        this.setReagent(reagentB)
    }


    moveEverythingRight () {
        const reagents = this.getReagents()
        this.clear()

        reagents.forEach(reagent => {
            reagent.x += 1
            if (reagent.x >= this.width) {
                reagent.x = 0
            }
            this.setReagent(reagent)
        })
    }


    clearCell ({x, y}) {
        this.grid.setCell({x, y}, undefined)
    }


    syncReagents () {
        this.grid.forEachDefinedCell(({x, y}, reagent) => {
            reagent.x = x
            reagent.y = y
        })
    }


    toArray () {
        const reagents = []
        this.grid.forEachDefinedCell((coords, reagent) => reagents.push(reagent))

        return reagents.sort(sortOrder)
    }


    get reagents () {
        return this.toArray()
    }


    * [Symbol.iterator] () {
        yield * this.reagents
    }


    applyGravity (direction = directions.down, steps = Infinity) {
        if (typeof direction === 'string') {
            direction = directions[direction]
        }

        const moves = []

        this.forEach(reagent => {
            const {x, y} = reagent
            const origin = {x, y}
            const destination = {x: x + direction.x, y: y + direction.y}

            if (this.isInside(destination)) {
                const neighbour = this.neighbourOf(origin, direction)

                if (!neighbour) {
                    moves.push({origin, destination})
                }
            }
        })

        if (steps > 0 && moves.length > 0) {
            moves.forEach(({origin, destination}) => this.moveReagent(origin, destination))
            this.applyGravity(direction, steps - 1)
        }

        return moves.length ? moves : null
    }


    getDirectMatchesFor (origin, direction, filter = sameName, matches = []) {
        const reagent = this.getReagent(origin)

        if (reagent) {

            if (!matches.includes(reagent)) {
                matches.push(reagent)
            }

            const neighbour = this.neighbourOf(reagent, direction)

            if (neighbour && filter(reagent, neighbour)) {
                this.getDirectMatchesFor(neighbour, direction, filter, matches)
            }
        }

        return matches
    }


    getAllDirectMatchesFor (origin, filter = sameName) {
        const matches = []

        for (const key in directions) {
            const direction = directions[key]
            const matchesInDirection = this.getDirectMatchesFor(origin, direction, filter)
            matchesInDirection.forEach(reagent => {
                if (!matches.includes(reagent)) {
                    matches.push(reagent)
                }
            })
        }

        return matches
    }


    getMatchesFor (origin, filter = sameName, matches = []) {
        const directMatches = this.getAllDirectMatchesFor(origin, filter)

        directMatches.forEach(reagent => {
            if (!matches.includes(reagent)) {
                matches.push(reagent)
                this.getMatchesFor(reagent, filter, matches)
            }
        })

        return matches
    }


    getMergeFor (reagent, min = 3) {
        const matches = this.getMatchesFor(reagent)

        if (matches.length < min) {
            return null
        }

        return matches
    }


    getNextMerge (min, lab) {
        const {reagents: names} = lab

        const reagents = this.getReagents({
            sort (a, b) {
                const nameOrder = names.indexOf(a.name) - names.indexOf(b.name)

                if (nameOrder === 0) {
                    return b.order - a.order
                }

                return nameOrder
            }
        })

        for (const reagent of reagents) {
            const merge = this.getMergeFor(reagent, min)
            if (merge) {
                return merge
            }
        }

        return null
    }


    get overflowed () {
        const {height} = this
        const rows = [height - 2, height - 1]
        return !rows.every(y => this.getRow(y).length === 0)
    }


    getRow (y) {
        return this.filter(reagent => reagent.y === y)
    }


    getCol (x) {
        return this.filter(reagent => reagent.x === x)
    }


    has (reagentOrName) {
        if (typeof reagentOrName === 'string') {
            const distribution = this.getDistribution()
            return reagentOrName in distribution && distribution[reagentOrName] > 0
        }

        return this.toArray().includes(reagentOrName)
    }


    getDistribution () {
        const distribution = {}

        this.forEach(({name}) => {
            distribution[name] = distribution[name] || 0
            distribution[name] += 1
        })

        return distribution
    }


    clear () {
        this.grid.clear()
    }


    export () {
        return {
            width: this.width,
            height: this.height,
            reagents: this.toArray().map(reagent => Object.assign({}, reagent)),
            order: 0
        }
    }


    restore (params) {
        reset(this, params)
    }

}


function reset (board, {
    width = 6,
    height = 9,
    reagents = [],
    order = 0
} = {}) {
    board.grid = new Grid({width, height})
    board.order = order

    for (const reagent of reagents) {
        if (!board.setReagent(reagent, reagent.order)) {
            return false
        }

        if (reagent.order >= board.order) {
            board.order = reagent.order + 1
        }
    }

    return true
}


function sameName (a, b) {
    return a && b && a.name && b.name && a.name === b.name
}


function sortOrder (a, b) {
    return (a.order || 0) - (b.order || 0)
}


function shuffleArray (array, random) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = random.intBetween(0, i)
        const temp = array[i]
        array[i] = array[j]
        array[j] = temp
    }
    return array
}


const arrayMethods = ['map', 'forEach', 'filter', 'find', 'sort', 'reverse', 'includes']

arrayMethods.forEach(method => {
    Board.prototype[method] = function (...args) {
        return this.toArray()[method](...args)
    }
})
