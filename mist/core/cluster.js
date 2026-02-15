const positionsMap = [
    [{x: 0, y: 0}, {x: 1, y: 0}],
    [{x: 0, y: 1}, {x: 0, y: 0}],
    [{x: 1, y: 0}, {x: 0, y: 0}],
    [{x: 0, y: 0}, {x: 0, y: 1}]
]


export default class Cluster {

    constructor (params) {
        this.restore(params)
    }


    rotate () {
        if (this.reagents.length > 1) {
            this.positionIndex += 1
            this.positionIndex %= positionsMap.length
            syncReagents(this)

            updatePosition(this, this.x)
        }
    }


    move (step) {
        updatePosition(this, this.x + step.x)
    }


    moveLeft () {
        this.move({x: -1, y: 0})
    }


    moveRight () {
        this.move({x: 1, y: 0})
    }


    get horizontal () {
        const {reagents} = this
        const [first] = reagents

        return reagents.every(reagent => reagent.y === first.y)
    }


    forBoard (board) {
        const {reagents} = this

        const height = board.height - this.height

        return reagents.sort(sortY).map(reagent => {
            return {
                name: reagent.name,
                x: reagent.x,
                y: height + reagent.y
            }
        })
    }


    clear () {
        this.reagents.length = 0
    }


    export () {
        return {
            reagents: this.reagents.map(reagent => Object.assign({}, reagent)),
            width: this.width,
            height: this.height,
            positionIndex: this.positionIndex,
            x: this.x,
            y: this.y
        }
    }


    restore (params) {
        reset(this, params)
    }

}


function reset (cluster, {
    reagents = [],
    width = 6,
    height = 2,
    positionIndex = 0,
    x,
    y = 0
} = {}) {
    cluster.reagents = reagents.slice(0, 2)
    cluster.width = width
    cluster.height = height
    cluster.positionIndex = positionIndex
    cluster.x = typeof x === 'undefined' ? Math.floor(width * 0.5 - cluster.reagents.length * 0.5) : x
    cluster.y = y || 0
    syncReagents(cluster)
}


function updatePosition (cluster, x) {
    const {width, horizontal, reagents} = cluster
    const maxX = (horizontal ? width : width + 1) - reagents.length

    cluster.x = Math.min(Math.max(x, 0), maxX)

    syncReagents(cluster)
}


function syncReagents (cluster) {
    const {reagents, positionIndex} = cluster
    const positions = positionsMap[positionIndex]

    reagents.forEach((reagent, index) => {
        const position = positions[index]

        reagent.x = cluster.x + position.x
        reagent.y = cluster.y + position.y
    })
}


function sortY (a, b) {
    return a.y - b.y
}
