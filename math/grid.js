export const fourDirections = {
    up:    {x:  0, y:  1},
    right: {x:  1, y:  0},
    down:  {x:  0, y: -1},
    left:  {x: -1, y:  0}
}

export const eightDirections = {
    up:        {x:  0, y:  1},
    upRight:   {x:  1, y:  1},
    right:     {x:  1, y:  0},
    downRight: {x:  1, y: -1},
    down:      {x:  0, y: -1},
    downLeft:  {x: -1, y: -1},
    left:      {x: -1, y:  0},
    upLeft:    {x: -1, y:  1}
}


export default class Grid {

    constructor (options = {}) {
        const {width = null, height = null} = options
        
        this.width = width
        this.height = height
        this.cells = new Map()
    }


    getCell (coords) {
        const key = getCellKey(coords)
        return this.cells.get(key)
    }


    setCell (coords, value) {
        const key = getCellKey(coords)
        
        if (value === undefined) {
            this.cells.delete(key)
        } else {
            this.cells.set(key, value)
        }
    }


    isInside (coords) {
        if (this.width === null || this.height === null) {
            return true
        }
        
        return coords.x >= 0 && coords.x < this.width &&
               coords.y >= 0 && coords.y < this.height
    }


    forEachCell (callback) {
        if (this.width === null || this.height === null) {
            throw new Error('Cannot iterate over infinite grid. Use forEachDefinedCell instead.')
        }

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const coords = {x, y}
                const value = this.getCell(coords)
                callback(coords, value)
            }
        }
    }


    forEachDefinedCell (callback) {
        for (const [key, value] of this.cells) {
            const coords = parseCellKey(key)
            callback(coords, value)
        }
    }

    neighbourOf (coords, step) {
        return {
            x: coords.x + step.x,
            y: coords.y + step.y,
            cell: this.getCell({
                x: coords.x + step.x,
                y: coords.y + step.y
            })
        }
    }


    fourNeighboursOf (coords) {
        return Object.values(fourDirections).map(direction => {
            return this.neighbourOf(coords, direction)
        })
    }


    eightNeighboursOf (coords) {
        return Object.values(eightDirections).map(direction => {
            return this.neighbourOf(coords, direction)
        })
    }


    getCol (x) {
        if (this.height === null) {
            throw new Error('Cannot get column from infinite grid')
        }

        const result = []
        for (let y = 0; y < this.height; y++) {
            result.push(this.getCell({x, y}))
        }
        return result
    }


    getRow (y) {
        if (this.width === null) {
            throw new Error('Cannot get row from infinite grid')
        }

        const result = []
        for (let x = 0; x < this.width; x++) {
            result.push(this.getCell({x, y}))
        }
        return result
    }


    clear () {
        this.cells.clear()
    }


    clone () {
        const newGrid = new Grid({width: this.width, height: this.height})
        newGrid.cells = new Map(this.cells)
        return newGrid
    }


    getBounds () {
        if (this.cells.size === 0) {
            return null
        }

        let minX = Infinity
        let maxX = -Infinity
        let minY = Infinity
        let maxY = -Infinity

        for (const key of this.cells.keys()) {
            const {x, y} = parseCellKey(key)
            minX = Math.min(minX, x)
            maxX = Math.max(maxX, x)
            minY = Math.min(minY, y)
            maxY = Math.max(maxY, y)
        }

        return {
            minX,
            maxX,
            minY,
            maxY,
            width: maxX - minX + 1,
            height: maxY - minY + 1
        }
    }

}


function getCellKey (coords) {
    return `${coords.x},${coords.y}`
}


function parseCellKey (key) {
    const [x, y] = key.split(',').map(Number)
    return {x, y}
}
