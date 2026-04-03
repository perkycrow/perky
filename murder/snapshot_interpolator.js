const DEFAULT_DELAY = 100
const DEFAULT_MAX_SNAPSHOTS = 5


export default class SnapshotInterpolator {

    constructor (options = {}) {
        this.delay = options.delay ?? DEFAULT_DELAY
        this.maxSnapshots = options.maxSnapshots ?? DEFAULT_MAX_SNAPSHOTS
        this.snapshots = []
    }


    push (state, timestamp) {
        this.snapshots.push({state, timestamp})

        if (this.snapshots.length > this.maxSnapshots) {
            this.snapshots.shift()
        }
    }


    getInterpolatedState (now) {
        if (this.snapshots.length === 0) {
            return null
        }

        if (this.snapshots.length === 1) {
            return this.snapshots[0].state
        }

        const renderTime = now - this.delay
        const pair = findSurroundingPair(this.snapshots, renderTime)

        if (!pair) {
            return this.snapshots[this.snapshots.length - 1].state
        }

        const [a, b] = pair
        const t = (renderTime - a.timestamp) / (b.timestamp - a.timestamp)

        return interpolateState(a.state, b.state, clamp01(t))
    }


    get ready () {
        return this.snapshots.length >= 2
    }


    reset () {
        this.snapshots = []
    }

}


function findSurroundingPair (snapshots, time) {
    for (let i = 0; i < snapshots.length - 1; i++) {
        if (snapshots[i].timestamp <= time && snapshots[i + 1].timestamp >= time) {
            return [snapshots[i], snapshots[i + 1]]
        }
    }

    return null
}


function clamp01 (value) {
    return Math.max(0, Math.min(1, value))
}


function interpolateState (stateA, stateB, t) {
    const result = {}

    for (const key in stateB) {
        result[key] = interpolateValue(stateA[key], stateB[key], t)
    }

    return result
}


function interpolateValue (a, b, t) {
    if (a === undefined || a === null) {
        return b
    }

    if (typeof a === 'number' && typeof b === 'number') {
        return a + (b - a) * t
    }

    if (typeof a === 'object' && typeof b === 'object' && a !== null && b !== null) {
        return interpolateState(a, b, t)
    }

    return t < 0.5 ? a : b
}
